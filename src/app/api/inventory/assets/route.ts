import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/prisma"
import { z } from "zod"
import { createErrorResponse } from '@/lib/error-handler'
import type { Prisma, assets as AssetRow } from "@prisma/client"

// Map category to valid enum value
const mapCategory = (category: string): 'COMPUTER' | 'FURNITURE' | 'VEHICLE' | 'EQUIPMENT' | 'OTHER' => {
  switch (category.toUpperCase()) {
    case 'COMPUTER':
    case 'SOFTWARE':
      return 'COMPUTER'
    case 'FURNITURE':
      return 'FURNITURE'
    case 'VEHICLE':
      return 'VEHICLE'
    case 'EQUIPMENT':
      return 'EQUIPMENT'
    default:
      return 'OTHER'
  }
}

// Map condition to valid enum value
const mapCondition = (condition: string): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED' => {
  switch (condition.toLowerCase()) {
    case 'excellent':
      return 'EXCELLENT'
    case 'good':
      return 'GOOD'
    case 'fair':
      return 'FAIR'
    case 'poor':
    case 'needs-repair':
    case 'needs_repair':
      return 'POOR'
    case 'damaged':
      return 'DAMAGED'
    default:
      return 'GOOD'
  }
}

// Validation schema for asset creation/update
const assetSchema = z.object({
  // Basic Information
  name: z.string().min(1, "Asset name is required"),
  assetNumber: z.string().min(1, "Asset number is required"),
  type: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  
  // Financial Information  
  procurementValue: z.number().min(0, "Procurement value must be non-negative"),
  currentValue: z.number().min(0).optional(),
  depreciationRate: z.number().min(0).max(100, "Depreciation rate must be between 0-100").default(0),
  depreciationMethod: z.string().default("straight-line"),
  procurementDate: z.string().transform((str) => new Date(str)),
  fundingSource: z.string().optional(),
  
  // Location & Allocation
  location: z.string().min(1, "Location is required"),
  department: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedEmail: z.string().email().optional().or(z.literal("")),
  custodian: z.string().optional(),
  assignedProgram: z.string().optional(),
  assignedProject: z.string().optional(),
  assignedProjectIds: z.array(z.string()).optional().default([]),
  
  // Status & Condition
  status: z
    .enum(["active", "inactive", "maintenance", "disposed", "under-maintenance", "retired"])
    .default("active"),
  condition: z.enum(["excellent", "good", "fair", "poor", "needs-repair"]).default("good"),
  warrantyExpiry: z.string().optional().transform((str) => str ? new Date(str) : null),
  
  // Tracking
  rfidTag: z.string().optional(),
  qrCode: z.string().optional(),
  barcodeId: z.string().optional(),
  
  // Insurance
  insuranceValue: z.number().min(0).optional(),
  insurancePolicy: z.string().optional(),
  
  // Files — filenames only (same as registration)
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([])
})

function conditionToFrontend(c: string | null | undefined): string {
  if (!c) return "good"
  const s = String(c).toLowerCase()
  if (s === "damaged") return "poor"
  return s
}

function statusToFrontend(s: string | null | undefined): string {
  if (!s) return "active"
  return String(s).toLowerCase().replace(/_/g, "-")
}

/** Map DB row → frontend Asset shape (GET list + PUT response). */
function transformDbAssetToFrontend(asset: AssetRow) {
  const row = asset as AssetRow & {
    physicalAssetTag?: string | null
  }
  return {
    id: row.id,
    name: row.name,
    assetNumber: row.assetTag,
    assetTag: row.physicalAssetTag ?? undefined,
    type: row.assetType || row.category,
    category: row.category,
    brand: row.brand || "",
    model: row.model || "",
    description: row.description || "",
    serialNumber: row.serialNumber || "",
    status: statusToFrontend(row.status),
    condition: conditionToFrontend(row.condition as string),
    location: row.location || "",
    department: row.department || "",
    assignedTo: row.assignedTo || "",
    assignedEmail: row.assignedEmail || "",
    custodian: row.custodian || "",
    assignedProgram: row.assignedProgram || "",
    assignedProject: row.assignedProject || "",
    assignedProjectIds: Array.isArray(row.assignedProjectIds) ? row.assignedProjectIds : [],
    procurementValue: row.purchasePrice != null ? Number(row.purchasePrice) : 0,
    currentValue: row.currentValue != null ? Number(row.currentValue) : 0,
    depreciationRate: row.depreciationRate ?? 0,
    depreciationMethod: (row.depreciationMethod || "straight-line") as
      | "straight-line"
      | "declining-balance"
      | "units-of-production",
    procurementDate: row.purchaseDate
      ? new Date(row.purchaseDate).toISOString().split("T")[0]
      : "",
    fundingSource: row.fundingSource || "",
    warrantyExpiry: row.warrantyExpiry
      ? new Date(row.warrantyExpiry).toISOString().split("T")[0]
      : "",
    lastAuditDate: row.lastAuditDate
      ? new Date(row.lastAuditDate).toISOString().split("T")[0]
      : "",
    nextMaintenanceDate: row.nextMaintenanceDate
      ? new Date(row.nextMaintenanceDate).toISOString().split("T")[0]
      : "",
    rfidTag: row.rfidTag || "",
    qrCode: row.qrCode || "",
    barcodeId: row.barcodeId || "",
    insuranceValue: row.insuranceValue != null ? Number(row.insuranceValue) : 0,
    insurancePolicy: row.insurancePolicy || "",
    images: Array.isArray(row.images) ? row.images : [],
    documents: Array.isArray(row.documents) ? row.documents : [],
    procurementType: row.procurementType || "",
    expectedLifespan: row.expectedLifespan ?? undefined,
    usageType: row.usageType || "",
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Basic authentication check
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const where: Prisma.assetsWhereInput = {}

    if (search?.trim()) {
      const q = search.trim()
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { assetTag: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { serialNumber: { contains: q, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.status = { equals: status, mode: "insensitive" }
    }

    if (location && location !== "all") {
      where.location = { contains: location, mode: "insensitive" }
    }

    const [assets, totalCount] = await Promise.all([
      executeQuery(async (prisma) =>
        prisma.assets.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        })
      ),
      executeQuery(async (prisma) => prisma.assets.count({ where })),
    ])

    const transformedAssets = assets.map((row) => transformDbAssetToFrontend(row))

    return NextResponse.json({
      assets: transformedAssets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalAssets: totalCount,
        hasNextPage: (page * limit) < totalCount,
        hasPreviousPage: page > 1
      }
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
    
    // Validate input data
    const validationResult = assetSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Check if asset number already exists
    const existingAsset = await executeQuery(async (prisma) => {
      return await prisma.assets.findUnique({
        where: { assetTag: validatedData.assetNumber }
      })
    })

    if (existingAsset) {
      return NextResponse.json(
        { error: "Asset number already exists" },
        { status: 409 }
      )
    }

    // Create new asset in database
    const newAsset = await executeQuery(async (prisma) => {
      return await prisma.assets.create({
        data: {
          id: crypto.randomUUID(),
          name: validatedData.name,
          assetTag: validatedData.assetNumber,
          assetType: validatedData.type,
          category: validatedData.category,
          brand: validatedData.brand,
          model: validatedData.model,
          description: validatedData.description,
          serialNumber: validatedData.serialNumber,
          purchasePrice: validatedData.procurementValue,
          currentValue: validatedData.procurementValue, // Use procurement value as initial current value
          depreciationRate: validatedData.depreciationRate,
          depreciationMethod: validatedData.depreciationMethod,
          purchaseDate: validatedData.procurementDate,
          fundingSource: validatedData.fundingSource,
          location: validatedData.location,
          department: validatedData.department,
          assignedTo: validatedData.assignedTo,
          assignedEmail: validatedData.assignedEmail,
          custodian: validatedData.custodian,
          assignedProgram: validatedData.assignedProgram,
          assignedProject: validatedData.assignedProject,
          assignedProjectIds: validatedData.assignedProjectIds ?? [],
          status: validatedData.status.toUpperCase(),
          condition: mapCondition(validatedData.condition),
          warrantyExpiry: validatedData.warrantyExpiry,
          rfidTag: validatedData.rfidTag,
          qrCode: validatedData.qrCode,
          barcodeId: validatedData.barcodeId,
          insuranceValue: validatedData.insuranceValue,
          insurancePolicy: validatedData.insurancePolicy,
          images: validatedData.images || [],
          documents: validatedData.documents || [],
          updatedAt: new Date()
        } as any // Bypass TypeScript type checking for now
      })
    })

    const transformedAsset = transformDbAssetToFrontend(newAsset as AssetRow)

    return NextResponse.json(
      { 
        message: "Asset created successfully", 
        asset: transformedAsset 
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
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input data (make fields optional for updates)
    const updateSchema = assetSchema.partial()
    const validationResult = updateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Check if asset exists
    const existingAsset = await executeQuery(async (prisma) => {
      return await prisma.assets.findUnique({
        where: { id }
      })
    })

    if (!existingAsset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    // Check if asset number is being changed and already exists (validatedData uses assetNumber)
    if (validatedData.assetNumber && validatedData.assetNumber !== existingAsset.assetTag) {
      const duplicateAsset = await executeQuery(async (prisma) => {
        return await prisma.assets.findUnique({
          where: { assetTag: validatedData.assetNumber }
        })
      })

      if (duplicateAsset) {
        return NextResponse.json(
          { error: "Asset tag already exists" },
          { status: 409 }
        )
      }
    }

    const updateData: Prisma.assetsUpdateInput = {}

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.assetNumber !== undefined) updateData.assetTag = validatedData.assetNumber
    if (validatedData.category !== undefined) updateData.category = mapCategory(validatedData.category)
    if (validatedData.brand !== undefined) updateData.brand = validatedData.brand || null
    if (validatedData.model !== undefined) updateData.model = validatedData.model || null
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null
    if (validatedData.serialNumber !== undefined) updateData.serialNumber = validatedData.serialNumber || null
    if (validatedData.location !== undefined) updateData.location = validatedData.location || null
    if (validatedData.department !== undefined) updateData.department = validatedData.department || null
    if (validatedData.assignedTo !== undefined) updateData.assignedTo = validatedData.assignedTo || null
    if (validatedData.assignedEmail !== undefined) {
      updateData.assignedEmail =
        validatedData.assignedEmail && validatedData.assignedEmail.length > 0
          ? validatedData.assignedEmail
          : null
    }
    if (validatedData.custodian !== undefined) updateData.custodian = validatedData.custodian || null
    if (validatedData.assignedProgram !== undefined)
      updateData.assignedProgram = validatedData.assignedProgram || null
    if (validatedData.assignedProject !== undefined)
      updateData.assignedProject = validatedData.assignedProject || null
    if (validatedData.assignedProjectIds !== undefined)
      updateData.assignedProjectIds = validatedData.assignedProjectIds
    if (validatedData.status !== undefined) updateData.status = validatedData.status.toUpperCase()
    if (validatedData.condition !== undefined) updateData.condition = mapCondition(validatedData.condition)
    if (validatedData.procurementValue !== undefined)
      updateData.purchasePrice = validatedData.procurementValue
    if (validatedData.currentValue !== undefined) updateData.currentValue = validatedData.currentValue
    if (validatedData.depreciationRate !== undefined) updateData.depreciationRate = validatedData.depreciationRate
    if (validatedData.depreciationMethod !== undefined)
      updateData.depreciationMethod = validatedData.depreciationMethod
    if (validatedData.procurementDate !== undefined) updateData.purchaseDate = validatedData.procurementDate
    if (validatedData.fundingSource !== undefined) updateData.fundingSource = validatedData.fundingSource || null
    if (validatedData.warrantyExpiry !== undefined) updateData.warrantyExpiry = validatedData.warrantyExpiry
    if (validatedData.rfidTag !== undefined) updateData.rfidTag = validatedData.rfidTag || null
    if (validatedData.qrCode !== undefined) updateData.qrCode = validatedData.qrCode || null
    if (validatedData.barcodeId !== undefined) updateData.barcodeId = validatedData.barcodeId || null
    if (validatedData.insuranceValue !== undefined) updateData.insuranceValue = validatedData.insuranceValue
    if (validatedData.insurancePolicy !== undefined)
      updateData.insurancePolicy = validatedData.insurancePolicy || null
    if (validatedData.images !== undefined) updateData.images = validatedData.images
    if (validatedData.documents !== undefined) updateData.documents = validatedData.documents
    if (validatedData.type !== undefined) updateData.assetType = validatedData.type || null

    updateData.updatedAt = new Date()

    const updatedAsset = await executeQuery(async (prisma) => {
      return await prisma.assets.update({
        where: { id },
        data: updateData,
      })
    })

    const transformedAsset = transformDbAssetToFrontend(updatedAsset as AssetRow)

    return NextResponse.json({
      message: "Asset updated successfully",
      asset: transformedAsset
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
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      )
    }

    // Check if asset exists
    const existingAsset = await executeQuery(async (prisma) => {
      return await prisma.assets.findUnique({
        where: { id }
      })
    })

    if (!existingAsset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    // Delete asset from database (this will cascade delete maintenance records)
    await executeQuery(async (prisma) => {
      return await prisma.assets.delete({
        where: { id }
      })
    })

    return NextResponse.json({
      message: "Asset deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting asset:", error)
    return createErrorResponse(error, request.url)
  }
}
