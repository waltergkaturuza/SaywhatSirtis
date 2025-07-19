import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock database for maintenance records
const maintenanceRecords = new Map()
const maintenanceSchedules = new Map()

// Initialize sample data
maintenanceRecords.set('1', {
  id: '1',
  assetId: '1',
  type: 'preventive',
  status: 'completed',
  title: 'Quarterly System Maintenance',
  description: 'Regular cleaning and software updates',
  scheduledDate: '2024-07-15',
  completedDate: '2024-07-15',
  estimatedCost: 50,
  actualCost: 45,
  technician: 'John Tech',
  notes: 'All systems running optimally',
  createdAt: '2024-07-10T10:00:00Z',
  updatedAt: '2024-07-15T15:30:00Z'
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const status = searchParams.get('status')

    let records = Array.from(maintenanceRecords.values())

    if (assetId) {
      records = records.filter(record => record.assetId === assetId)
    }

    if (status) {
      records = records.filter(record => record.status === status)
    }

    return NextResponse.json(records)
  } catch (error) {
    console.error('Maintenance records API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const record = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user?.name || 'System'
    }

    maintenanceRecords.set(record.id, record)

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Maintenance record creation error:', error)
    return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    const existingRecord = maintenanceRecords.get(id)
    if (!existingRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    const updatedRecord = {
      ...existingRecord,
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user?.name || 'System'
    }

    maintenanceRecords.set(id, updatedRecord)

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error('Maintenance record update error:', error)
    return NextResponse.json({ error: 'Failed to update maintenance record' }, { status: 500 })
  }
}
