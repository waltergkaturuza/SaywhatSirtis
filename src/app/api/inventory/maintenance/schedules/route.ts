import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Empty maintenance schedules - database integration needed
const maintenanceSchedules = new Map()

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
