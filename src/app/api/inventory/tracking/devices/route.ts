import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock database for tracking devices (shared with locations)
const trackingDevices = new Map()

// Initialize sample data
trackingDevices.set('1', {
  id: '1',
  assetId: '3',
  deviceType: 'gps_tracker',
  deviceId: 'GPS-001-TC2024',
  status: 'active',
  batteryLevel: 85,
  lastUpdate: '2024-07-19T08:45:00Z',
  signalStrength: 92
})

trackingDevices.set('2', {
  id: '2',
  assetId: '1',
  deviceType: 'rfid_tag',
  deviceId: 'RFID-RF001234',
  status: 'active',
  lastUpdate: '2024-07-19T10:30:00Z'
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

    let devices = Array.from(trackingDevices.values())

    if (assetId) {
      devices = devices.filter(device => device.assetId === assetId)
    }

    if (status) {
      devices = devices.filter(device => device.status === status)
    }

    return NextResponse.json(devices)
  } catch (error) {
    console.error('Tracking devices API error:', error)
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
    const device = {
      ...body,
      id: Date.now().toString(),
      lastUpdate: new Date().toISOString()
    }

    trackingDevices.set(device.id, device)

    return NextResponse.json(device, { status: 201 })
  } catch (error) {
    console.error('Tracking device creation error:', error)
    return NextResponse.json({ error: 'Failed to create tracking device' }, { status: 500 })
  }
}
