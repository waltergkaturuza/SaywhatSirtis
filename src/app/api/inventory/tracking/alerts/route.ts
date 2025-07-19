import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock database for geofence alerts (shared with locations)
const geofenceAlerts = new Map()

// Initialize sample data
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const acknowledged = searchParams.get('acknowledged')

    let alerts = Array.from(geofenceAlerts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (assetId) {
      alerts = alerts.filter(alert => alert.assetId === assetId)
    }

    if (acknowledged !== null) {
      alerts = alerts.filter(alert => alert.acknowledged === (acknowledged === 'true'))
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Geofence alerts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
