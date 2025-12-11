import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/prisma"
import { z } from "zod"
import { createErrorResponse } from '@/lib/error-handler'

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

// Map status to valid enum value
const mapStatus = (status: string): 'ACTIVE' | 'MAINTENANCE' | 'DISPOSED' => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'GOOD':
      return 'ACTIVE'
    case 'MAINTENANCE':
    case 'NEEDS_REPAIR':
      return 'MAINTENANCE'
    case 'DISPOSED':
    case 'RETIRED':
      return 'DISPOSED'
    default:
      return 'ACTIVE'
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
  depreciationRate: z.number().min(0).max(100, "Depreciation rate must be between 0-100").default(0),
  depreciationMethod: z.string().default("straight-line"),
  procurementDate: z.string().transform((str) => new Date(str)),
  fundingSource: z.string().optional(),
  
  // Location & Allocation
  location: z.string().min(1, "Location is required"),
  department: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedEmail: z.string().email().optional().or(z.literal("")),
  
  // Status & Condition
  status: z.enum(["active", "inactive", "under-maintenance", "retired"]).default("active"),
  condition: z.enum(["excellent", "good", "fair", "poor", "needs-repair"]).default("good"),
  warrantyExpiry: z.string().optional().transform((str) => str ? new Date(str) : null),
  
  // Tracking
  rfidTag: z.string().optional(),
  qrCode: z.string().optional(),
  barcodeId: z.string().optional(),
  
  // Insurance
  insuranceValue: z.number().min(0).optional(),
  insurancePolicy: z.string().optional(),
  
  // Files - these will be handled separately for now
  images: z.array(z.any()).optional().default([]),
  documents: z.array(z.any()).optional().default([])
})

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

    // Build SQL query with proper filtering
    let whereClause = "WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR "assetTag" ILIKE $${paramIndex} OR category ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (status && status !== 'all') {
      whereClause += ` AND status = $${paramIndex}`
      params.push(status.toUpperCase())
      paramIndex++
    }

    if (location && location !== 'all') {
      whereClause += ` AND location ILIKE $${paramIndex}`
      params.push(`%${location}%`)
      paramIndex++
    }

    // Get assets with safe field access
    const [assets, countResult] = await Promise.all([
      executeQuery(async (prisma) => {
        return await prisma.$queryRawUnsafe(`
          SELECT 
            id, 
            "assetTag", 
            name, 
            description, 
            category, 
            COALESCE(brand, '') as brand,
            COALESCE(model, '') as model,
            COALESCE("serialNumber", '') as "serialNumber",
            "purchaseDate",
            COALESCE("purchasePrice", 0) as "purchasePrice",
            COALESCE("currentValue", 0) as "currentValue",
            COALESCE(location, '') as location,
            condition,
            status,
            "warrantyExpiry",
            "createdAt",
            "updatedAt"
          FROM assets 
          ${whereClause}
          ORDER BY "createdAt" DESC
          LIMIT ${limit} OFFSET ${offset}
        `)
      }),
      executeQuery(async (prisma) => {
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM assets ${whereClause}`)
        return result
      })
    ])

    const totalCount = parseInt((countResult as any)[0]?.count || '0')

    // Transform data to match frontend expectations
    const transformedAssets = (assets as any[]).map((asset: any) => ({
      id: asset.id,
      name: asset.name,
      assetNumber: asset.assetTag,
      category: asset.category,
      type: asset.category,
      brand: asset.brand || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      status: asset.status ? asset.status.toLowerCase() : 'active',
      condition: asset.condition ? (typeof asset.condition === 'string' ? asset.condition.toLowerCase() : asset.condition) : 'good',
      location: asset.location || '',
      department: asset.location || '',
      assignedTo: '', // Not available in current schema
      procurementValue: asset.purchasePrice ? parseFloat(asset.purchasePrice.toString()) : 0,
      currentValue: asset.currentValue ? parseFloat(asset.currentValue.toString()) : 0,
      depreciationRate: 0,
      procurementDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : null,
      warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : null,
      lastAuditDate: null,
      nextMaintenanceDate: null,
      rfidTag: null,
      qrCode: null,
      description: asset.description || '',
      createdAt: new Date(asset.createdAt).toISOString(),
      updatedAt: new Date(asset.updatedAt).toISOString()
    }))

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
    const { response, status } = createErrorResponse(error, request.url)
    return NextResponse.json(response, { status })
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

    // Transform response to match frontend expectations
    const assetWithNewFields = newAsset as any
    const transformedAsset = {
      id: newAsset.id,
      name: newAsset.name,
      assetNumber: newAsset.assetTag,
      type: assetWithNewFields.assetType || '',
      category: newAsset.category,
      brand: newAsset.brand || '',
      model: newAsset.model || '',
      description: newAsset.description || '',
      serialNumber: newAsset.serialNumber || '',
      procurementValue: newAsset.purchasePrice ? parseFloat(newAsset.purchasePrice.toString()) : 0,
      currentValue: newAsset.currentValue ? parseFloat(newAsset.currentValue.toString()) : 0,
      depreciationRate: assetWithNewFields.depreciationRate || 0,
      depreciationMethod: assetWithNewFields.depreciationMethod || 'straight-line',
      procurementDate: newAsset.purchaseDate?.toISOString().split('T')[0] || null,
      fundingSource: assetWithNewFields.fundingSource || '',
      location: newAsset.location || '',
      department: assetWithNewFields.department || '',
      assignedTo: assetWithNewFields.assignedTo || '',
      assignedEmail: assetWithNewFields.assignedEmail || '',
      status: newAsset.status.toLowerCase(),
      condition: newAsset.condition?.toString().toLowerCase() || 'good',
      warrantyExpiry: newAsset.warrantyExpiry?.toISOString().split('T')[0] || null,
      rfidTag: assetWithNewFields.rfidTag || '',
      qrCode: assetWithNewFields.qrCode || '',
      barcodeId: assetWithNewFields.barcodeId || '',
      insuranceValue: assetWithNewFields.insuranceValue || 0,
      insurancePolicy: assetWithNewFields.insurancePolicy || '',
      images: assetWithNewFields.images || [],
      documents: assetWithNewFields.documents || [],
      createdAt: newAsset.createdAt.toISOString(),
      updatedAt: newAsset.updatedAt.toISOString()
    }

    return NextResponse.json(
      { 
        message: "Asset created successfully", 
        asset: transformedAsset 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    )
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

    // Transform frontend data to database schema
    const updateData: any = {}
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.assetNumber) updateData.assetTag = validatedData.assetNumber
    if (validatedData.category) updateData.category = mapCategory(validatedData.category)
    if (validatedData.model) updateData.model = validatedData.model
    if (validatedData.location) updateData.location = validatedData.location
    if (validatedData.status) updateData.status = mapStatus(validatedData.status)
    if (validatedData.procurementValue) updateData.purchasePrice = validatedData.procurementValue
    if (validatedData.procurementDate) updateData.purchaseDate = validatedData.procurementDate

    // Update asset in database
    const updatedAsset = await executeQuery(async (prisma) => {
      return await prisma.assets.update({
        where: { id },
        data: updateData
      })
    })

    // Transform response to match frontend expectations
    const transformedAsset = {
      id: updatedAsset.id,
      name: updatedAsset.name,
      assetNumber: updatedAsset.assetTag,
      category: updatedAsset.category,
      type: updatedAsset.category,
      brand: (updatedAsset as any).brand || '',
      model: updatedAsset.model || '',
      serialNumber: updatedAsset.serialNumber || '',
      status: updatedAsset.status.toLowerCase(),
      condition: updatedAsset.status.toLowerCase(),
      location: updatedAsset.location || '',
      department: updatedAsset.location || '',
      assignedTo: '', // Not available in current schema
      procurementValue: updatedAsset.purchasePrice ? parseFloat(updatedAsset.purchasePrice.toString()) : 0,
      currentValue: updatedAsset.currentValue ? parseFloat(updatedAsset.currentValue.toString()) : 0,
      depreciationRate: 0, // Not in schema
      procurementDate: updatedAsset.purchaseDate?.toISOString().split('T')[0] || null,
      warrantyExpiry: updatedAsset.warrantyExpiry?.toISOString().split('T')[0] || null,
      lastAuditDate: null,
      nextMaintenanceDate: null,
      rfidTag: null,
      qrCode: null,
      description: updatedAsset.description || null,
      createdAt: updatedAsset.createdAt.toISOString(),
      updatedAt: updatedAsset.updatedAt.toISOString()
    }

    return NextResponse.json({
      message: "Asset updated successfully",
      asset: transformedAsset
    })

  } catch (error) {
    console.error("Error updating asset:", error)
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    )
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
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    )
  }
}
