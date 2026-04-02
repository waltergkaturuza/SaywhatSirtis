import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import { resolveCategoryInfo, buildFolderPath } from "@/lib/documents/category-utils"
import { uploadToSupabaseStorage, ensureBucketExists } from "@/lib/storage/supabase-storage"
import { riskVisibilityOrFilter, userCanSeeAllRisks } from "@/lib/risk-management/session-risk-access"

const REPORT_TAG = "risk-management-report"

function withVis(session: Parameters<typeof riskVisibilityOrFilter>[0], filter: Record<string, unknown>) {
  const v = riskVisibilityOrFilter(session)
  if (!v) return filter
  if (Object.keys(filter).length === 0) return v
  return { AND: [filter, v] }
}

function canUploadRiskReport(session: { user?: unknown } | null): boolean {
  if (!session?.user) return false
  const u = session.user as { permissions?: string[]; roles?: string[] }
  const p = u.permissions || []
  const r = (u.roles || []).map((x) => String(x).toLowerCase())
  return (
    userCanSeeAllRisks(session) ||
    p.includes("documents.create") ||
    p.includes("documents.full_access") ||
    r.some((role) => ["admin", "manager", "hr", "advance_user_1", "advance_user_2"].includes(role))
  )
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportTypeFilter = searchParams.get("reportType")

    const vis = riskVisibilityOrFilter(session)

    const [
      totalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      openRisks,
      mitigatedRisks,
      overdueMitigations,
      categoryGroups,
    ] = await Promise.all([
      prisma.risks.count({ where: withVis(session, {}) }),
      prisma.risks.count({ where: withVis(session, { riskScore: { gte: 6 } }) }),
      prisma.risks.count({ where: withVis(session, { riskScore: { gte: 3, lte: 5 } }) }),
      prisma.risks.count({ where: withVis(session, { riskScore: { lte: 2 } }) }),
      prisma.risks.count({ where: withVis(session, { status: "OPEN" }) }),
      prisma.risks.count({ where: withVis(session, { status: "MITIGATED" }) }),
      prisma.risk_mitigations.count({
        where: {
          deadline: { lt: new Date() },
          status: { not: "COMPLETED" },
          ...(vis ? { risks: { is: vis as object } } : {}),
        },
      }),
      prisma.risks.groupBy({
        by: ["category"],
        where: withVis(session, {}),
        _count: { _all: true },
      }),
    ])

    const risksByCategory: Record<string, number> = {}
    for (const row of categoryGroups) {
      risksByCategory[row.category] = row._count._all
    }

    let docWhere: object = { isDeleted: false, tags: { has: REPORT_TAG } }
    if (reportTypeFilter && reportTypeFilter !== "all") {
      docWhere = {
        isDeleted: false,
        AND: [
          { tags: { has: REPORT_TAG } },
          { customMetadata: { path: ["reportType"], equals: reportTypeFilter } },
        ],
      }
    }

    const reportDocs = await prisma.documents.findMany({
      where: docWhere,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        originalName: true,
        size: true,
        createdAt: true,
        mimeType: true,
        customMetadata: true,
      },
    })

    const reports = reportDocs.map((d) => {
      const meta = (d.customMetadata || {}) as { reportType?: string }
      const rt = meta.reportType || "uploaded"
      const sizeNum = typeof d.size === "bigint" ? Number(d.size) : Number(d.size)
      const mb = sizeNum / (1024 * 1024)
      const fileSize = mb >= 1 ? `${mb.toFixed(1)} MB` : `${(sizeNum / 1024).toFixed(1)} KB`
      return {
        id: d.id,
        documentId: d.id,
        title: d.originalName,
        type: rt,
        generatedDate: d.createdAt.toISOString(),
        status: "ready" as const,
        fileSize,
        mimeType: d.mimeType,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalRisks,
          highRisks,
          mediumRisks,
          lowRisks,
          openRisks,
          mitigatedRisks,
          overdueMitigations,
          risksByCategory,
        },
        reports,
      },
    })
  } catch (e) {
    console.error("risk reports GET", e)
    return NextResponse.json({ error: "Failed to load risk reports" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!canUploadRiskReport(session)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const reportType = (formData.get("reportType") as string) || "uploaded"
    const titleOverride = (formData.get("title") as string) || ""

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const documentId = randomUUID()
    const safeBase = (file.name || "report").replace(/[^\w.\-()\s]+/g, "_")
    const storageKey = `risk-management-reports/${documentId}_${safeBase}`

    const cat = resolveCategoryInfo("Risk Management")
    const department = "Risk Management"
    const documentFolderPath = buildFolderPath({ department, categoryDisplay: cat.display })

    let storagePath = storageKey
    let storageUrl: string | null = null
    let storageProvider: "supabase" | "filesystem" = "filesystem"

    const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (useSupabase) {
      try {
        await ensureBucketExists("documents")
        const up = await uploadToSupabaseStorage({
          bucket: "documents",
          path: storageKey,
          file: fileBuffer,
          contentType: file.type || "application/octet-stream",
        })
        if (up.success) {
          storageUrl = up.url || up.signedUrl || up.publicUrl || null
          storageProvider = "supabase"
        } else {
          throw new Error(up.error || "Upload failed")
        }
      } catch (err) {
        console.warn("Supabase upload failed, using filesystem:", err)
        storageProvider = "filesystem"
      }
    }

    if (storageProvider === "filesystem") {
      const dir = path.join(process.cwd(), "public", "uploads", "risk-management-reports")
      await fs.mkdir(dir, { recursive: true })
      const diskName = `${documentId}_${safeBase}`
      const full = path.join(dir, diskName)
      await fs.writeFile(full, fileBuffer)
      storagePath = path.join("uploads", "risk-management-reports", diskName)
      storageUrl = null
    }

    const displayTitle = titleOverride.trim() || file.name || `Risk report (${reportType})`

    const doc = await prisma.documents.create({
      data: {
        id: documentId,
        filename: `${documentId}_${safeBase}`,
        originalName: displayTitle,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        path: storagePath,
        url: storageUrl,
        category: "OTHER",
        description: displayTitle,
        tags: [REPORT_TAG, reportType],
        classification: "INTERNAL",
        accessLevel: "organization",
        isPublic: false,
        uploadedBy: session.user.id,
        department,
        folderPath: documentFolderPath,
        isPersonalRepo: false,
        approvalStatus: "PENDING_REVIEW",
        reviewStatus: "PENDING",
        customMetadata: {
          source: "risk_management_reports",
          reportType,
          categoryDisplay: cat.display,
          categoryLabel: "Risk Management",
          storageProvider,
          storageBucket: storageProvider === "supabase" ? "documents" : null,
        },
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: doc.id,
          documentId: doc.id,
          title: doc.originalName,
          type: reportType,
          generatedDate: doc.createdAt.toISOString(),
          status: "ready",
        },
      },
      { status: 201 }
    )
  } catch (e) {
    console.error("risk reports POST", e)
    return NextResponse.json({ error: "Failed to upload report" }, { status: 500 })
  }
}
