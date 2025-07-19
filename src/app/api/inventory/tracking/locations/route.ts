import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock database for location updates
const locationUpdates = new Map()
const geofenceAlerts = new Map()
const trackingDevices = new Map()

// Initialize sample data
locationUpdates.set('1', {
  id: '1',
  assetId: '1',
  latitude: -17.8216,
  longitude: 31.0492,
  accuracy: 5,
  timestamp: '2024-07-19T10:30:00Z',
  source: 'manual',
  address: 'Head Office, 123 Main Street, Harare'
})

geofenceAlerts.set('1', {
  id: '1',
  assetId: '3',
  type: 'unauthorized_movement',
  geofenceName: 'Head Office Parking',
  latitude: -17.8200,
  longitude: 31.0480,
  timestamp: '2024-07-19T07:30:00Z',
  acknowledged: false
})

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const limit = parseInt(searchParams.get('limit') || '50')

    let updates = Array.from(locationUpdates.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (assetId) {
      updates = updates.filter(update => update.assetId === assetId)
    }

    updates = updates.slice(0, limit)

    return NextResponse.json(updates)
  } catch (error) {
    console.error('Location tracking API error:', error)
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
    const update = {
      ...body,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }

    locationUpdates.set(update.id, update)

    // Check for geofence violations (simplified)
    const asset = body.assetId
    if (Math.random() < 0.1) { // 10% chance of alert for demo
      const alert = {
        id: Date.now().toString(),
        assetId: asset,
        type: 'unauthorized_movement',
        geofenceName: 'Sample Geofence',
        latitude: body.latitude,
        longitude: body.longitude,
        timestamp: new Date().toISOString(),
        acknowledged: false
      }
      geofenceAlerts.set(alert.id, alert)
    }

    return NextResponse.json(update, { status: 201 })
  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json({ error: 'Failed to create location update' }, { status: 500 })
  }
}
