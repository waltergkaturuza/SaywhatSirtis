import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

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

// Validation schema for asset creation/update
const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  assetNumber: z.string().min(1, "Asset number is required"),
  category: z.enum(["COMPUTER", "FURNITURE", "VEHICLE", "EQUIPMENT", "SOFTWARE", "OTHER"]).default("OTHER"),
  model: z.string().optional(),
  procurementValue: z.number().positive("Procurement value must be positive"),
  depreciationRate: z.number().min(0).max(100).default(0),
  currentValue: z.number().positive("Current value must be positive"),
  allocation: z.string().min(1, "Allocation is required"),
  location: z.string().min(1, "Location is required"),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]).default("GOOD"),
  status: z.enum(["ACTIVE", "INACTIVE", "DISPOSED", "MAINTENANCE"]).default("ACTIVE"),
  procurementDate: z.string().transform((str) => new Date(str))
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Basic authentication check
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (location && location !== 'all') {
      where.location = { contains: location, mode: 'insensitive' }
    }

    // Fetch assets from database
    const [assets, totalCount] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          maintenanceRecords: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.asset.count({ where })
    ])

    // Transform data to match frontend expectations
    const transformedAssets = assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      assetNumber: asset.assetTag, // Use assetTag from schema
      category: asset.category, // Use category directly from schema
      type: asset.category,
      brand: asset.manufacturer,
      model: asset.model,
      serialNumber: asset.serialNumber,
      status: asset.status.toLowerCase(),
      condition: asset.status.toLowerCase(), // Use status as condition
      location: asset.location,
      department: asset.location, // Use location as department
      assignedTo: asset.assignedTo,
      procurementValue: asset.purchasePrice ? parseFloat(asset.purchasePrice.toString()) : 0,
      currentValue: asset.currentValue ? parseFloat(asset.currentValue.toString()) : 0,
      depreciationRate: 0, // Not in schema, default to 0
      procurementDate: asset.purchaseDate?.toISOString().split('T')[0] || null,
      warrantyExpiry: asset.warrantyExpiry?.toISOString().split('T')[0] || null,
      lastAuditDate: null, // Not in current schema
      nextMaintenanceDate: asset.maintenanceRecords[0]?.nextDueDate?.toISOString().split('T')[0] || null,
      rfidTag: null, // Not in current schema
      qrCode: null, // Not in current schema
      description: asset.description,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString()
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
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
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
    const existingAsset = await prisma.asset.findUnique({
      where: { assetTag: validatedData.assetNumber }
    })

    if (existingAsset) {
      return NextResponse.json(
        { error: "Asset number already exists" },
        { status: 409 }
      )
    }

    // Create new asset in database
    const newAsset = await prisma.asset.create({
      data: {
        name: validatedData.name,
        assetTag: validatedData.assetNumber,
        category: mapCategory(validatedData.category),
        model: validatedData.model,
        purchasePrice: validatedData.procurementValue,
        currentValue: validatedData.currentValue,
        location: validatedData.location,
        status: mapStatus(validatedData.status),
        purchaseDate: validatedData.procurementDate
      }
    })

    // Transform response to match frontend expectations
    const transformedAsset = {
      id: newAsset.id,
      name: newAsset.name,
      assetNumber: newAsset.assetTag,
      category: newAsset.category,
      type: newAsset.category,
      brand: newAsset.manufacturer,
      model: newAsset.model,
      serialNumber: newAsset.serialNumber,
      status: newAsset.status.toLowerCase(),
      condition: newAsset.status.toLowerCase(),
      location: newAsset.location,
      department: newAsset.location,
      assignedTo: newAsset.assignedTo,
      procurementValue: newAsset.purchasePrice ? parseFloat(newAsset.purchasePrice.toString()) : 0,
      currentValue: newAsset.currentValue ? parseFloat(newAsset.currentValue.toString()) : 0,
      depreciationRate: 0, // Not in schema
      procurementDate: newAsset.purchaseDate?.toISOString().split('T')[0] || null,
      warrantyExpiry: newAsset.warrantyExpiry?.toISOString().split('T')[0] || null,
      lastAuditDate: null,
      nextMaintenanceDate: null,
      rfidTag: null,
      qrCode: null,
      description: null,
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
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
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
    const existingAsset = await prisma.asset.findUnique({
      where: { id }
    })

    if (!existingAsset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    // Check if asset number is being changed and already exists (validatedData uses assetNumber)
    if (validatedData.assetNumber && validatedData.assetNumber !== existingAsset.assetTag) {
      const duplicateAsset = await prisma.asset.findUnique({
        where: { assetTag: validatedData.assetNumber }
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
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: updateData
    })

    // Transform response to match frontend expectations
    const transformedAsset = {
      id: updatedAsset.id,
      name: updatedAsset.name,
      assetNumber: updatedAsset.assetTag,
      category: updatedAsset.category,
      type: updatedAsset.category,
      brand: updatedAsset.manufacturer,
      model: updatedAsset.model,
      serialNumber: updatedAsset.serialNumber,
      status: updatedAsset.status.toLowerCase(),
      condition: updatedAsset.status.toLowerCase(),
      location: updatedAsset.location,
      department: updatedAsset.location,
      assignedTo: updatedAsset.assignedTo,
      procurementValue: updatedAsset.purchasePrice ? parseFloat(updatedAsset.purchasePrice.toString()) : 0,
      currentValue: updatedAsset.currentValue ? parseFloat(updatedAsset.currentValue.toString()) : 0,
      depreciationRate: 0, // Not in schema
      procurementDate: updatedAsset.purchaseDate?.toISOString().split('T')[0] || null,
      warrantyExpiry: updatedAsset.warrantyExpiry?.toISOString().split('T')[0] || null,
      lastAuditDate: null,
      nextMaintenanceDate: null,
      rfidTag: null,
      qrCode: null,
      description: null,
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
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
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
    const existingAsset = await prisma.asset.findUnique({
      where: { id }
    })

    if (!existingAsset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    // Delete asset from database (this will cascade delete maintenance records)
    await prisma.asset.delete({
      where: { id }
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
  } finally {
    await prisma.$disconnect()
  }
}
