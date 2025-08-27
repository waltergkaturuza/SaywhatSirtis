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

    const where = employeeId ? { employeeId } : {}

    const [performanceReviews, total] = await Promise.all([
      prisma.performanceReview.findMany({
        where,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              position: true,
              department: true
            }
          }
        },
        orderBy: { reviewDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.performanceReview.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: performanceReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Performance reviews fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employeeId,
      reviewerId,
      reviewDate,
      reviewPeriodStart,
      reviewPeriodEnd,
      overallRating,
      goals,
      achievements,
      areasForImprovement,
      comments,
      status = 'DRAFT'
    } = body

    const performanceReview = await prisma.performanceReview.create({
      data: {
        employeeId,
        reviewerId,
        reviewDate: new Date(reviewDate),
        reviewPeriodStart: new Date(reviewPeriodStart),
        reviewPeriodEnd: new Date(reviewPeriodEnd),
        overallRating,
        goals,
        achievements,
        areasForImprovement,
        comments,
        status
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            position: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: performanceReview
    }, { status: 201 })
  } catch (error) {
    console.error('Performance review creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create performance review' },
      { status: 500 }
    )
  }
}
