import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const status = searchParams.get('status')

    // Sample tracking devices data
    const sampleDevices = [
      {
        id: '1',
        assetId: '1',
        deviceType: 'gps_tracker',
        deviceId: 'GPS-001-TC2024',
        status: 'active',
        batteryLevel: 85,
        lastUpdate: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        signalStrength: 92
      },
      {
        id: '2',
        assetId: '2',
        deviceType: 'rfid_tag',
        deviceId: 'RFID-RF001234',
        status: 'active',
        lastUpdate: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        signalStrength: 78
      },
      {
        id: '3',
        assetId: '3',
        deviceType: 'gps_tracker',
        deviceId: 'GPS-002-TC2024',
        status: 'offline',
        batteryLevel: 15,
        lastUpdate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        signalStrength: 0
      }
    ]

    let devices = sampleDevices

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
  } finally {
    await prisma.$disconnect()
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

    // In the future, this would save to database:
    // await prisma.trackingDevice.create({ data: device })
    
    console.log('Tracking device created:', device)

    return NextResponse.json(device, { status: 201 })
  } catch (error) {
    console.error('Device creation error:', error)
    return NextResponse.json({ error: 'Failed to create device' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
