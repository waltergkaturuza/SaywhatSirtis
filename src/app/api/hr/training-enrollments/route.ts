import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const employeeId = searchParams.get('employeeId')
    const skip = (page - 1) * limit

    // For now, return training enrollments from events table with type 'training'
    const where: any = { type: 'training' }
    if (employeeId) where.attendees = { contains: employeeId }

    const [trainingEvents, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.event.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: trainingEvents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Training enrollments fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training enrollments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      instructor,
      attendees = []
    } = body

    const trainingEvent = await prisma.event.create({
      data: {
        title,
        description,
        type: 'training',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        instructor,
        attendees: JSON.stringify(attendees),
        status: 'SCHEDULED'
      }
    })

    return NextResponse.json({
      success: true,
      data: trainingEvent
    }, { status: 201 })
  } catch (error) {
    console.error('Training enrollment creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create training enrollment' },
      { status: 500 }
    )
  }
}
