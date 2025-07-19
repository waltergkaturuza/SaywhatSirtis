import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock database for maintenance schedules
const maintenanceSchedules = new Map()

// Initialize sample data
maintenanceSchedules.set('1', {
  id: '1',
  assetId: '1',
  name: 'Quarterly Maintenance',
  type: 'preventive',
  frequency: 90,
  lastPerformed: '2024-07-15',
  nextDue: '2024-10-15',
  estimatedCost: 50,
  instructions: 'Clean vents, update software, check hardware',
  isActive: true
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const isActive = searchParams.get('isActive')

    let schedules = Array.from(maintenanceSchedules.values())

    if (assetId) {
      schedules = schedules.filter(schedule => schedule.assetId === assetId)
    }

    if (isActive !== null) {
      schedules = schedules.filter(schedule => schedule.isActive === (isActive === 'true'))
    }

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Maintenance schedules API error:', error)
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
    const schedule = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: session.user?.name || 'System'
    }

    maintenanceSchedules.set(schedule.id, schedule)

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Maintenance schedule creation error:', error)
    return NextResponse.json({ error: 'Failed to create maintenance schedule' }, { status: 500 })
  }
}
