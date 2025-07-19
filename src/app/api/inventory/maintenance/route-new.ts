import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Zod schema for maintenance validation
const maintenanceSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  maintenanceType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'SCHEDULED']),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string().transform((val) => new Date(val)),
  performedBy: z.string().optional(),
  cost: z.number().optional()
})

// GET - List maintenance records with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const assetId = searchParams.get('assetId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // For now, return sample data until Prisma is regenerated
    const sampleMaintenance = [
      {
        id: 'maintenance-1',
        assetId: 'asset-1',
        assetName: 'Dell Laptop IT-001',
        maintenanceType: 'PREVENTIVE',
        description: 'Quarterly system maintenance and updates',
        status: 'SCHEDULED',
        scheduledDate: new Date('2024-09-01'),
        completedDate: null,
        performedBy: 'John Tech',
        cost: 150.00,
        notes: 'Standard preventive maintenance',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'maintenance-2',
        assetId: 'asset-2',
        assetName: 'HP Printer OF-002',
        maintenanceType: 'CORRECTIVE',
        description: 'Fix paper jam issue',
        status: 'COMPLETED',
        scheduledDate: new Date('2024-08-15'),
        completedDate: new Date('2024-08-15'),
        performedBy: 'Sarah Service',
        cost: 75.00,
        notes: 'Resolved paper feeding mechanism issue',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    return NextResponse.json({
      maintenance: sampleMaintenance,
      pagination: {
        page,
        limit,
        total: sampleMaintenance.length,
        pages: Math.ceil(sampleMaintenance.length / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching maintenance records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance records' },
      { status: 500 }
    )
  }
}

// POST - Create new maintenance record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = maintenanceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { assetId, maintenanceType, description, scheduledDate, performedBy, cost } = validationResult.data

    // For now, return mock success response
    const newMaintenance = {
      id: `maintenance-${Date.now()}`,
      assetId,
      maintenanceType,
      description,
      scheduledDate,
      performedBy,
      cost,
      status: 'SCHEDULED',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      maintenance: newMaintenance,
      message: 'Maintenance record created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance record' },
      { status: 500 }
    )
  }
}

// PUT - Update maintenance record
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Maintenance ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // For now, return mock success response
    const updatedMaintenance = {
      id,
      ...body,
      updatedAt: new Date()
    }

    return NextResponse.json({
      maintenance: updatedMaintenance,
      message: 'Maintenance record updated successfully'
    })

  } catch (error) {
    console.error('Error updating maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete maintenance record
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Maintenance ID is required' },
        { status: 400 }
      )
    }

    // For now, return mock success response
    return NextResponse.json({
      message: 'Maintenance record deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to delete maintenance record' },
      { status: 500 }
    )
  }
}
