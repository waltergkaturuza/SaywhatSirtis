import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const acknowledged = searchParams.get('acknowledged')

    // Sample location alerts data
    const sampleAlerts = [
      {
        id: '1',
        assetId: '1',
        type: 'unauthorized_movement',
        geofenceName: 'Head Office Safe Zone',
        latitude: -17.8200,
        longitude: 31.0480,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        acknowledged: false
      },
      {
        id: '2',
        assetId: '2',
        type: 'device_offline',
        geofenceName: 'Warehouse Perimeter',
        latitude: -17.8350,
        longitude: 31.0650,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: false
      }
    ]

    let alerts = sampleAlerts
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
  } finally {
    await prisma.$disconnect()
  }
}
