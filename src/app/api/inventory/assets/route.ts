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
  assignedEmail: z.string().email().optional().or(z.literal("")),
  custodian: z.string().optional(),

  status: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return "active"
    if (v === "maintenance") return "under-maintenance"
    return v
  }, z.enum(["active", "inactive", "under-maintenance", "retired"])),
  condition: z
    .enum(["excellent", "good", "fair", "poor", "needs-repair", "damaged"])
    .default("good"),
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
})

async function resolveDepartmentName(
  prisma: PrismaClient,
  raw?: string | null
): Promise<string | undefined> {
  if (raw == null || raw === "") return undefined
  if (!isLikelyUuid(raw)) return raw
  const d = await prisma.departments.findUnique({
    where: { id: raw },
    select: { name: true },
  })
  return d?.name ?? raw
}

async function resolveEmployeeDisplay(
  prisma: PrismaClient,
  raw?: string | null
): Promise<{ label: string; email?: string } | null> {
  if (raw == null || raw === "") return null
  if (!isLikelyUuid(raw)) return { label: raw }
  const emp = await prisma.employees.findUnique({
    where: { id: raw },
    select: { firstName: true, lastName: true, email: true },
  })
  if (!emp) return { label: raw }
  const label = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim()
  return { label: label || raw, email: emp.email ?? undefined }
}

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
    const validationResult = assetSchema.safeParse(body)
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
      const department = await resolveDepartmentName(prisma, v.department)
      const assignee = await resolveEmployeeDisplay(prisma, v.assignedTo)
      const custodian = await resolveEmployeeDisplay(prisma, v.custodian)

      const assignedToLabel = assignee?.label
      const assignedEmail =
        v.assignedEmail && v.assignedEmail !== ""
          ? v.assignedEmail
          : assignee?.email ?? undefined

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
          department,
          assignedTo: assignedToLabel,
          assignedEmail: assignedEmail || undefined,
          custodian: custodian?.label,
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
    const updateSchema = assetSchema.partial()
    const validationResult = updateSchema.safeParse(body)

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
        data.department = await resolveDepartmentName(prisma, v.department)
      }

      if (v.assignedTo !== undefined) {
        if (v.assignedTo === "") {
          data.assignedTo = ""
        } else {
          const assignee = await resolveEmployeeDisplay(prisma, v.assignedTo)
          data.assignedTo = assignee?.label ?? ""
        }
      }

      if (v.assignedEmail !== undefined) {
        data.assignedEmail = v.assignedEmail === "" ? null : v.assignedEmail
      }

      if (v.custodian !== undefined) {
        if (v.custodian === "") {
          data.custodian = null
        } else {
          const c = await resolveEmployeeDisplay(prisma, v.custodian)
          data.custodian = c?.label ?? null
        }
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
