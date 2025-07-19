import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schema for asset creation/update
const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  assetNumber: z.string().min(1, "Asset number is required"),
  assetType: z.string().min(1, "Asset type is required"),
  model: z.string().optional(),
  procurementValue: z.number().positive("Procurement value must be positive"),
  depreciationRate: z.number().min(0).max(100).default(0),
  currentValue: z.number().positive("Current value must be positive"),
  allocation: z.string().min(1, "Allocation is required"),
  location: z.string().min(1, "Location is required"),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]).default("GOOD"),
  status: z.enum(["ACTIVE", "INACTIVE", "DISPOSED", "UNDER_MAINTENANCE"]).default("ACTIVE"),
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
        { assetNumber: { contains: search, mode: 'insensitive' } },
        { assetType: { contains: search, mode: 'insensitive' } },
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
          maintenances: {
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
      assetNumber: asset.assetNumber,
      category: asset.assetType, // Map assetType to category for frontend compatibility
      type: asset.assetType,
      brand: null, // Not in current schema
      model: asset.model,
      serialNumber: null, // Not in current schema
      status: asset.status.toLowerCase(),
      condition: asset.condition.toLowerCase(),
      location: asset.location,
      department: asset.allocation, // Map allocation to department
      assignedTo: asset.allocation,
      procurementValue: parseFloat(asset.procurementValue.toString()),
      currentValue: parseFloat(asset.currentValue.toString()),
      depreciationRate: parseFloat(asset.depreciationRate.toString()),
      procurementDate: asset.procurementDate.toISOString().split('T')[0],
      warrantyExpiry: null, // Not in current schema
      lastAuditDate: null, // Not in current schema
      nextMaintenanceDate: asset.maintenances[0]?.scheduledDate?.toISOString().split('T')[0] || null,
      rfidTag: null, // Not in current schema
      qrCode: null, // Not in current schema
      description: null, // Not in current schema
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
      where: { assetNumber: validatedData.assetNumber }
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
        assetNumber: validatedData.assetNumber,
        assetType: validatedData.assetType,
        model: validatedData.model,
        procurementValue: validatedData.procurementValue,
        depreciationRate: validatedData.depreciationRate,
        currentValue: validatedData.currentValue,
        allocation: validatedData.allocation,
        location: validatedData.location,
        condition: validatedData.condition,
        status: validatedData.status,
        procurementDate: validatedData.procurementDate
      }
    })

    // Transform response to match frontend expectations
    const transformedAsset = {
      id: newAsset.id,
      name: newAsset.name,
      assetNumber: newAsset.assetNumber,
      category: newAsset.assetType,
      type: newAsset.assetType,
      brand: null,
      model: newAsset.model,
      serialNumber: null,
      status: newAsset.status.toLowerCase(),
      condition: newAsset.condition.toLowerCase(),
      location: newAsset.location,
      department: newAsset.allocation,
      assignedTo: newAsset.allocation,
      procurementValue: parseFloat(newAsset.procurementValue.toString()),
      currentValue: parseFloat(newAsset.currentValue.toString()),
      depreciationRate: parseFloat(newAsset.depreciationRate.toString()),
      procurementDate: newAsset.procurementDate.toISOString().split('T')[0],
      warrantyExpiry: null,
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

    // Check if asset number is being changed and already exists
    if (validatedData.assetNumber && validatedData.assetNumber !== existingAsset.assetNumber) {
      const duplicateAsset = await prisma.asset.findUnique({
        where: { assetNumber: validatedData.assetNumber }
      })

      if (duplicateAsset) {
        return NextResponse.json(
          { error: "Asset number already exists" },
          { status: 409 }
        )
      }
    }

    // Update asset in database
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: validatedData
    })

    // Transform response to match frontend expectations
    const transformedAsset = {
      id: updatedAsset.id,
      name: updatedAsset.name,
      assetNumber: updatedAsset.assetNumber,
      category: updatedAsset.assetType,
      type: updatedAsset.assetType,
      brand: null,
      model: updatedAsset.model,
      serialNumber: null,
      status: updatedAsset.status.toLowerCase(),
      condition: updatedAsset.condition.toLowerCase(),
      location: updatedAsset.location,
      department: updatedAsset.allocation,
      assignedTo: updatedAsset.allocation,
      procurementValue: parseFloat(updatedAsset.procurementValue.toString()),
      currentValue: parseFloat(updatedAsset.currentValue.toString()),
      depreciationRate: parseFloat(updatedAsset.depreciationRate.toString()),
      procurementDate: updatedAsset.procurementDate.toISOString().split('T')[0],
      warrantyExpiry: null,
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
