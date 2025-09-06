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
    const limit = parseInt(searchParams.get('limit') || '50')

    // For now, return sample location data since we don't have location tracking in the database yet
    // In the future, this would query a locations table
    const sampleLocations = [
      {
        id: '1',
        assetId: '1',
        latitude: -17.8216,
        longitude: 31.0492,
        accuracy: 5,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        source: 'gps',
        address: 'Head Office, 123 Main Street, Harare'
      },
      {
        id: '2',
        assetId: '2',
        latitude: -17.8350,
        longitude: 31.0650,
        accuracy: 8,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        source: 'manual',
        address: 'Warehouse District, Harare'
      }
    ]

    let updates = sampleLocations
    if (assetId) {
      updates = updates.filter(update => update.assetId === assetId)
    }

    updates = updates.slice(0, limit)

    return NextResponse.json(updates)
  } catch (error) {
    console.error('Location tracking API error:', error)
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
    const update = {
      ...body,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }

    // In the future, this would save to database:
    // await prisma.locationUpdate.create({ data: update })
    
    // For now, just return the update
    console.log('Location update received:', update)

    return NextResponse.json(update, { status: 201 })
  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json({ error: 'Failed to create location update' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
