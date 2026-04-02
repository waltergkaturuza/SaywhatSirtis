import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/prisma"
import { z } from "zod"
import { createErrorResponse } from '@/lib/error-handler'
import type { Prisma, PrismaClient } from "@prisma/client"
import {
  assetRowToClientApi,
  isLikelyUuid,
  mapConditionToDb,
  mapStatusToDb,
} from "@/lib/inventory/asset-mapper"

/** Cold DB connections on Vercel can exceed default ~10s */
export const maxDuration = 60

async function emailForEmployeeId(
  prisma: PrismaClient,
  employeeId: string
): Promise<string | undefined> {
  if (!isLikelyUuid(employeeId)) return undefined
  const emp = await prisma.employees.findUnique({
    where: { id: employeeId },
    select: { email: true },
  })
  return emp?.email ?? undefined
}

/** Coerce JSON body issues: empty email, numeric strings from forms */
function normalizeAssetPayload(raw: unknown, mode: "create" | "update"): Record<string, unknown> {
  const b =
    raw && typeof raw === "object" ? { ...(raw as Record<string, unknown>) } : {}

  if (b.assignedEmail === "" || b.assignedEmail === null) {
    delete b.assignedEmail
  }

  const toFiniteNumber = (v: unknown): number | undefined => {
    if (v === "" || v === null || v === undefined) return undefined
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  }

  const toInt = (v: unknown): number | undefined => {
    const n = toFiniteNumber(v)
    if (n === undefined) return undefined
    const i = Math.trunc(n)
    return Number.isFinite(i) ? i : undefined
  }

  const pv = toFiniteNumber(b.procurementValue)
  if (pv !== undefined) b.procurementValue = pv
  const cv = toFiniteNumber(b.currentValue)
  if (cv !== undefined) b.currentValue = cv
  const dr = toFiniteNumber(b.depreciationRate)
  if (dr !== undefined) b.depreciationRate = dr
  const iv = toFiniteNumber(b.insuranceValue)
  if (iv !== undefined) b.insuranceValue = iv
  const el = toInt(b.expectedLifespan)
  if (el !== undefined) b.expectedLifespan = el

  const numericKeys = [
    "procurementValue",
    "currentValue",
    "depreciationRate",
    "insuranceValue",
    "expectedLifespan",
  ] as const
  if (mode === "update") {
    for (const k of [
      "warrantyExpiry",
      "lastAuditDate",
      "nextMaintenanceDate",
      "procurementDate",
    ]) {
      if (b[k] === "") delete b[k]
    }
    for (const k of numericKeys) {
      if (b[k] === "" || b[k] === null) delete b[k]
    }
  }

  // Forms send `assetTag` for on-asset label; DB column is physicalAssetTag
  if (b.physicalAssetTag === undefined && b.assetTag !== undefined) {
    b.physicalAssetTag = b.assetTag
  }

  return b
}

const optionalDate = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.union([z.string(), z.date()]).optional()
).transform((v) => {
  if (v === undefined) return undefined
  if (v instanceof Date) return v
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? undefined : d
})

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  assetNumber: z.string().min(1, "Asset number is required"),
  type: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  serialNumber: z.string().optional(),

  procurementValue: z.number().min(0, "Procurement value must be non-negative"),
  currentValue: z.number().min(0).optional(),
  depreciationRate: z.number().min(0).max(100).default(0),
  depreciationMethod: z.string().default("straight-line"),
  procurementDate: z.union([z.string(), z.date()]).transform((v) =>
    v instanceof Date ? v : new Date(String(v))
  ),
  fundingSource: z.string().optional(),
  procurementType: z.string().optional(),
  expectedLifespan: z.number().int().min(1).optional(),
  usageType: z.string().optional(),

  location: z.string().min(1, "Location is required"),
  department: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedEmail: z.string().email().optional(),
  custodian: z.string().optional(),

  status: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return "active"
    const s = String(v).toLowerCase().replace(/_/g, "-")
    if (s === "maintenance" || s === "under-maintenance") return "under-maintenance"
    if (s === "disposed" || s === "retired") return "retired"
    return s
  }, z.enum(["active", "inactive", "under-maintenance", "retired"])),
  condition: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return "good"
    return String(v).toLowerCase().replace(/_/g, "-")
  }, z.enum(["excellent", "good", "fair", "poor", "needs-repair", "damaged"])),
  warrantyExpiry: optionalDate,

  rfidTag: z.string().optional(),
  qrCode: z.string().optional(),
  barcodeId: z.string().optional(),
  physicalAssetTag: z.string().optional(),

  lastAuditDate: optionalDate,
  nextMaintenanceDate: optionalDate,

  insuranceValue: z.number().min(0).optional(),
  insurancePolicy: z.string().optional(),

  images: z.array(z.any()).optional().default([]),
  documents: z.array(z.any()).optional().default([]),

  assignedProgram: z.string().optional(),
  assignedProject: z.string().optional(),
})

/** PATCH: all optional; condition/status as loose strings then mapped in handler */
const assetPatchSchema = z.object({
  name: z.string().min(1).optional(),
  assetNumber: z.string().min(1).optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  procurementValue: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  depreciationRate: z.number().min(0).max(100).optional(),
  depreciationMethod: z.string().optional(),
  procurementDate: optionalDate,
  fundingSource: z.string().optional(),
  procurementType: z.string().optional(),
  expectedLifespan: z.number().int().min(1).optional(),
  usageType: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedEmail: z.union([z.string().email(), z.literal("")]).optional(),
  custodian: z.string().optional(),
  status: z.string().optional(),
  condition: z.string().optional(),
  warrantyExpiry: optionalDate,
  rfidTag: z.string().optional(),
  qrCode: z.string().optional(),
  barcodeId: z.string().optional(),
  physicalAssetTag: z.string().optional(),
  lastAuditDate: optionalDate,
  nextMaintenanceDate: optionalDate,
  insuranceValue: z.number().min(0).optional(),
  insurancePolicy: z.string().optional(),
  images: z.array(z.any()).optional(),
  documents: z.array(z.any()).optional(),

  assignedProgram: z.string().optional(),
  assignedProject: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const location = searchParams.get("location")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = (page - 1) * limit

    const where: Prisma.assetsWhereInput = {}

    if (search?.trim()) {
      const q = search.trim()
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { assetTag: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
        { serialNumber: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.status = { equals: mapStatusToDb(status), mode: "insensitive" }
    }

    if (location && location !== "all") {
      where.location = { contains: location, mode: "insensitive" }
    }

    const [rows, totalCount] = await Promise.all([
      executeQuery((prisma) =>
        prisma.assets.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        })
      ),
      executeQuery((prisma) => prisma.assets.count({ where })),
    ])

    const transformedAssets = rows.map((row) => assetRowToClientApi(row))

    return NextResponse.json({
      assets: transformedAssets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalAssets: totalCount,
        hasNextPage: offset + rows.length < totalCount,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching assets:", error)
    return createErrorResponse(error, request.url)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const normalized = normalizeAssetPayload(body, "create")
    const validationResult = assetSchema.safeParse(normalized)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const v = validationResult.data

    const existingAsset = await executeQuery((prisma) =>
      prisma.assets.findUnique({ where: { assetTag: v.assetNumber } })
    )

    if (existingAsset) {
      return NextResponse.json(
        { error: "Asset number already exists" },
        { status: 409 }
      )
    }

    const newAsset = await executeQuery(async (prisma) => {
      const assignedEmail =
        v.assignedEmail && v.assignedEmail !== ""
          ? v.assignedEmail
          : v.assignedTo
            ? await emailForEmployeeId(prisma, v.assignedTo)
            : undefined

      const currentVal =
        v.currentValue !== undefined ? v.currentValue : v.procurementValue

      return prisma.assets.create({
        data: {
          id: crypto.randomUUID(),
          name: v.name,
          assetTag: v.assetNumber,
          assetType: v.type,
          category: v.category,
          brand: v.brand,
          model: v.model,
          description: v.description,
          serialNumber: v.serialNumber,
          purchasePrice: v.procurementValue,
          currentValue: currentVal,
          depreciationRate: v.depreciationRate,
          depreciationMethod: v.depreciationMethod,
          purchaseDate: v.procurementDate,
          fundingSource: v.fundingSource,
          procurementType: v.procurementType,
          expectedLifespan: v.expectedLifespan,
          usageType: v.usageType,
          location: v.location,
          department: v.department && v.department !== "" ? v.department : undefined,
          assignedTo: v.assignedTo && v.assignedTo !== "" ? v.assignedTo : undefined,
          assignedEmail: assignedEmail || undefined,
          custodian: v.custodian && v.custodian !== "" ? v.custodian : undefined,
          assignedProgram: v.assignedProgram,
          assignedProject: v.assignedProject,
          status: mapStatusToDb(v.status),
          condition: mapConditionToDb(v.condition),
          warrantyExpiry: v.warrantyExpiry ?? undefined,
          lastAuditDate: v.lastAuditDate ?? undefined,
          nextMaintenanceDate: v.nextMaintenanceDate ?? undefined,
          rfidTag: v.rfidTag,
          qrCode: v.qrCode,
          barcodeId: v.barcodeId,
          physicalAssetTag: v.physicalAssetTag,
          insuranceValue: v.insuranceValue,
          insurancePolicy: v.insurancePolicy,
          images: Array.isArray(v.images)
            ? v.images.map((x: unknown) => String(x))
            : [],
          documents: Array.isArray(v.documents)
            ? v.documents.map((x: unknown) => String(x))
            : [],
          updatedAt: new Date(),
        },
      })
    })

    return NextResponse.json(
      {
        message: "Asset created successfully",
        asset: assetRowToClientApi(newAsset),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating asset:", error)
    return createErrorResponse(error, request.url)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const normalized = normalizeAssetPayload(body, "update")
    const validationResult = assetPatchSchema.safeParse(normalized)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const v = validationResult.data

    const existingAsset = await executeQuery((prisma) =>
      prisma.assets.findUnique({ where: { id } })
    )

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    if (v.assetNumber && v.assetNumber !== existingAsset.assetTag) {
      const duplicate = await executeQuery((prisma) =>
        prisma.assets.findUnique({ where: { assetTag: v.assetNumber } })
      )
      if (duplicate) {
        return NextResponse.json(
          { error: "Asset tag already exists" },
          { status: 409 }
        )
      }
    }

    const updatedAsset = await executeQuery(async (prisma) => {
      const data: Prisma.assetsUncheckedUpdateInput = {
        updatedAt: new Date(),
      }

      if (v.name !== undefined) data.name = v.name
      if (v.assetNumber !== undefined) data.assetTag = v.assetNumber
      if (v.type !== undefined) data.assetType = v.type
      if (v.category !== undefined) data.category = v.category
      if (v.brand !== undefined) data.brand = v.brand
      if (v.model !== undefined) data.model = v.model
      if (v.description !== undefined) data.description = v.description
      if (v.serialNumber !== undefined) data.serialNumber = v.serialNumber
      if (v.procurementValue !== undefined) data.purchasePrice = v.procurementValue
      if (v.currentValue !== undefined) data.currentValue = v.currentValue
      if (v.depreciationRate !== undefined) data.depreciationRate = v.depreciationRate
      if (v.depreciationMethod !== undefined)
        data.depreciationMethod = v.depreciationMethod
      if (v.procurementDate !== undefined) data.purchaseDate = v.procurementDate
      if (v.fundingSource !== undefined) data.fundingSource = v.fundingSource
      if (v.procurementType !== undefined) data.procurementType = v.procurementType
      if (v.expectedLifespan !== undefined) data.expectedLifespan = v.expectedLifespan
      if (v.usageType !== undefined) data.usageType = v.usageType
      if (v.location !== undefined) data.location = v.location

      if (v.department !== undefined) {
        data.department = v.department === "" ? null : v.department
      }

      if (v.assignedTo !== undefined) {
        data.assignedTo = v.assignedTo === "" ? null : v.assignedTo
        if (
          v.assignedEmail === undefined &&
          v.assignedTo &&
          isLikelyUuid(v.assignedTo)
        ) {
          const em = await emailForEmployeeId(prisma, v.assignedTo)
          if (em) data.assignedEmail = em
        }
      }

      if (v.assignedEmail !== undefined) {
        data.assignedEmail = v.assignedEmail === "" ? null : v.assignedEmail
      }

      if (v.custodian !== undefined) {
        data.custodian = v.custodian === "" ? null : v.custodian
      }

      if (v.assignedProgram !== undefined) {
        data.assignedProgram = v.assignedProgram === "" ? null : v.assignedProgram
      }
      if (v.assignedProject !== undefined) {
        data.assignedProject = v.assignedProject === "" ? null : v.assignedProject
      }

      if (v.status !== undefined) data.status = mapStatusToDb(v.status)
      if (v.condition !== undefined) data.condition = mapConditionToDb(v.condition)
      if (v.warrantyExpiry !== undefined) data.warrantyExpiry = v.warrantyExpiry
      if (v.lastAuditDate !== undefined) data.lastAuditDate = v.lastAuditDate
      if (v.nextMaintenanceDate !== undefined)
        data.nextMaintenanceDate = v.nextMaintenanceDate
      if (v.rfidTag !== undefined) data.rfidTag = v.rfidTag
      if (v.qrCode !== undefined) data.qrCode = v.qrCode
      if (v.barcodeId !== undefined) data.barcodeId = v.barcodeId
      if (v.physicalAssetTag !== undefined) data.physicalAssetTag = v.physicalAssetTag
      if (v.insuranceValue !== undefined) data.insuranceValue = v.insuranceValue
      if (v.insurancePolicy !== undefined) data.insurancePolicy = v.insurancePolicy
      if (v.images !== undefined) {
        data.images = v.images.map((x: unknown) => String(x))
      }
      if (v.documents !== undefined) {
        data.documents = v.documents.map((x: unknown) => String(x))
      }

      return prisma.assets.update({
        where: { id },
        data,
      })
    })

    return NextResponse.json({
      message: "Asset updated successfully",
      asset: assetRowToClientApi(updatedAsset),
    })
  } catch (error) {
    console.error("Error updating asset:", error)
    return createErrorResponse(error, request.url)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 })
    }

    const existingAsset = await executeQuery((prisma) =>
      prisma.assets.findUnique({ where: { id } })
    )

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    await executeQuery((prisma) => prisma.assets.delete({ where: { id } }))

    return NextResponse.json({ message: "Asset deleted successfully" })
  } catch (error) {
    console.error("Error deleting asset:", error)
    return createErrorResponse(error, request.url)
  }
}
