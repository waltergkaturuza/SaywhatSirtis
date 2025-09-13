import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get performance data for current user
    const employee = await prisma.employees.findFirst({
      where: { email: session.user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        performance_reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department,
          position: employee.position
        },
        performanceReviews: employee.performance_reviews,
        summary: {
          totalReviews: employee.performance_reviews.length,
          latestReview: employee.performance_reviews[0] || null
        }
      }
    })
  } catch (error) {
    console.error('HR Performance API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { employeeId, reviewPeriod, reviewType, overallRating, goals, feedback } = body

    // Create new performance review
    const performanceReview = await prisma.performance_reviews.create({
      data: {
        id: crypto.randomUUID(),
        employeeId,
        reviewPeriod: reviewPeriod || `Annual ${new Date().getFullYear()}`,
        reviewType: reviewType || 'annual',
        overallRating: overallRating || 0,
        goals: goals || {},
        feedback: feedback || '',
        reviewDate: new Date(),
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: performanceReview,
      message: 'Performance review created successfully'
    })
  } catch (error) {
    console.error('Create Performance Appraisal Error:', error)
    return NextResponse.json(
      { error: 'Failed to create performance appraisal' },
      { status: 500 }
    )
  }
}
