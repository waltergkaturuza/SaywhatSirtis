import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  assetTag: z.string().min(1, "Asset tag is required"),
  category: z.string().min(1, "Asset category is required"), 
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchasePrice: z.number().positive("Purchase price must be positive").optional(),
  currentValue: z.number().positive("Current value must be positive").optional(),
  location: z.string().optional(),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]).default("GOOD"),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "DISPOSED", "LOST"]).default("ACTIVE"),
  purchaseDate: z.string().transform((str) => new Date(str)).optional(),
  warrantyExpiry: z.string().transform((str) => new Date(str)).optional(),
  description: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const location = searchParams.get('location') || 'all'

    const skip = (page - 1) * limit
    
    // Build where clause for filtering
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
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
      assetNumber: asset.assetTag, // Use assetTag as assetNumber
      category: asset.category,
      type: asset.category,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      status: asset.status.toLowerCase(),
      condition: asset.condition.toLowerCase(),
      location: asset.location,
      department: asset.location, // Map location to department
      assignedTo: null, // Would need to query assignments separately
      procurementValue: asset.purchasePrice || 0,
      currentValue: asset.currentValue || 0,
      depreciationRate: 0, // Not in current schema
      procurementDate: asset.purchaseDate?.toISOString().split('T')[0] || null,
      warrantyExpiry: asset.warrantyExpiry?.toISOString().split('T')[0] || null,
      lastAuditDate: null, // Not in current schema
      nextMaintenanceDate: asset.maintenanceRecords[0]?.scheduledDate?.toISOString().split('T')[0] || null,
      rfidTag: null, // Not in current schema
      qrCode: null, // Not in current schema
      description: asset.description,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: transformedAssets,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Assets GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = assetSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Check if asset tag already exists
    const existingAsset = await prisma.asset.findUnique({
      where: { assetTag: validatedData.assetTag }
    })

    if (existingAsset) {
      return NextResponse.json(
        { error: "Asset tag already exists" },
        { status: 409 }
      )
    }

    // Create new asset in database
    const newAsset = await prisma.asset.create({
      data: {
        name: validatedData.name,
        assetTag: validatedData.assetTag,
        category: validatedData.category as any, // Cast to AssetCategory enum
        brand: validatedData.brand,
        model: validatedData.model,
        serialNumber: validatedData.serialNumber,
        purchasePrice: validatedData.purchasePrice,
        currentValue: validatedData.currentValue,
        location: validatedData.location,
        condition: validatedData.condition as any, // Cast to AssetCondition enum
        status: validatedData.status as any, // Cast to AssetStatus enum
        purchaseDate: validatedData.purchaseDate,
        warrantyExpiry: validatedData.warrantyExpiry,
        description: validatedData.description
      }
    })

    // Transform response to match frontend expectations
    const transformedAsset = {
      id: newAsset.id,
      name: newAsset.name,
      assetNumber: newAsset.assetTag, // Map assetTag to assetNumber for frontend
      category: newAsset.category,
      type: newAsset.category,
      brand: newAsset.brand,
      model: newAsset.model,
      serialNumber: newAsset.serialNumber,
      status: newAsset.status.toLowerCase(),
      condition: newAsset.condition.toLowerCase(),
      location: newAsset.location,
      department: newAsset.location, // Map location to department
      assignedTo: null, // Would need assignment lookup
      procurementValue: newAsset.purchasePrice || 0,
      currentValue: newAsset.currentValue || 0,
      depreciationRate: 0, // Not in schema
      procurementDate: newAsset.purchaseDate?.toISOString().split('T')[0] || null,
      warrantyExpiry: newAsset.warrantyExpiry?.toISOString().split('T')[0] || null,
      lastAuditDate: null,
      nextMaintenanceDate: null,
      rfidTag: null,
      qrCode: null,
      description: newAsset.description,
      createdAt: newAsset.createdAt.toISOString(),
      updatedAt: newAsset.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      message: "Asset created successfully",
      data: transformedAsset
    }, { status: 201 })

  } catch (error) {
    console.error('Assets POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
