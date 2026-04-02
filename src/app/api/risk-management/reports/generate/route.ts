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

function canGenerate(session: { user?: unknown } | null): boolean {
  if (!session?.user) return false
  const u = session.user as { permissions?: string[]; roles?: string[] }
  const p = u.permissions || []
  const r = (u.roles || []).map((x) => String(x).toLowerCase())
  return (
    userCanSeeAllRisks(session) ||
    p.includes("documents.create") ||
    p.includes("documents.full_access") ||
    r.some((role) =>
      ["admin", "manager", "hr", "advance_user_1", "advance_user_2"].includes(role)
    )
  )
}

function csvEscape(s: string) {
  const x = String(s ?? "").replace(/"/g, '""')
  return `"${x}"`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!canGenerate(session)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const reportType = String(body.type || "summary")
    if (!["summary", "detailed", "analytics", "compliance"].includes(reportType)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    const risks = await prisma.risks.findMany({
      where: withVis(session, {}),
      orderBy: [{ riskScore: "desc" }, { dateIdentified: "desc" }],
      include: {
        users_risks_ownerIdTousers: { select: { firstName: true, lastName: true, email: true } },
      },
    })

    const headers = [
      "riskId",
      "title",
      "category",
      "department",
      "probability",
      "impact",
      "riskScore",
      "status",
      "dateIdentified",
      "ownerEmail",
    ]
    const lines = [headers.join(",")]
    for (const r of risks) {
      const owner = r.users_risks_ownerIdTousers
      const ownerEmail = owner?.email || ""
      lines.push(
        [
          csvEscape(r.riskId),
          csvEscape(r.title),
          csvEscape(r.category),
          csvEscape(r.department || ""),
          csvEscape(r.probability),
          csvEscape(r.impact),
          String(r.riskScore),
          csvEscape(r.status),
          csvEscape(new Date(r.dateIdentified).toISOString()),
          csvEscape(ownerEmail),
        ].join(",")
      )
    }
    const csv = lines.join("\n")
    const buf = Buffer.from(csv, "utf-8")
    const documentId = randomUUID()
    const fname = `risk-${reportType}-export-${documentId.slice(0, 8)}.csv`
    const storageKey = `risk-management-reports/${documentId}_${fname}`

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
          file: buf,
          contentType: "text/csv",
        })
        if (up.success) {
          storageUrl = up.url || up.signedUrl || up.publicUrl || null
          storageProvider = "supabase"
        }
      } catch (e) {
        console.warn("Supabase generate upload failed, filesystem:", e)
        storageProvider = "filesystem"
      }
    }

    if (storageProvider === "filesystem") {
      const dir = path.join(process.cwd(), "public", "uploads", "risk-management-reports")
      await fs.mkdir(dir, { recursive: true })
      const full = path.join(dir, `${documentId}_${fname}`)
      await fs.writeFile(full, buf)
      storagePath = path.join("uploads", "risk-management-reports", `${documentId}_${fname}`)
    }

    const title = `Risk ${reportType} export — ${new Date().toLocaleDateString()}`

    const doc = await prisma.documents.create({
      data: {
        id: documentId,
        filename: `${documentId}_${fname}`,
        originalName: title,
        mimeType: "text/csv",
        size: buf.length,
        path: storagePath,
        url: storageUrl,
        category: "OTHER",
        description: title,
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

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        documentId: doc.id,
        title: doc.originalName,
        type: reportType,
        generatedDate: doc.createdAt.toISOString(),
        status: "ready",
      },
    })
  } catch (e) {
    console.error("risk reports generate", e)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
