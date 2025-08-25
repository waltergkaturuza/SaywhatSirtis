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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        department: true,
        position: true,
        appraisals: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          department: user.department,
          position: user.position
        },
        appraisals: user.appraisals,
        summary: {
          totalAppraisals: user.appraisals.length,
          latestAppraisal: user.appraisals[0] || null
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
    const { employeeId, reviewPeriod, overallRating, goals, achievements } = body

    // Create new performance appraisal
    const appraisal = await prisma.appraisal.create({
      data: {
        employeeId,
        userId: session.user.id || '',
        reviewPeriod: reviewPeriod || new Date().getFullYear().toString(),
        overallRating: overallRating || 0,
        goals: goals || '',
        achievements: achievements || '',
        status: 'DRAFT',
        reviewedBy: session.user.email
      }
    })

    return NextResponse.json({
      success: true,
      data: appraisal,
      message: 'Performance appraisal created successfully'
    })
  } catch (error) {
    console.error('Create Performance Appraisal Error:', error)
    return NextResponse.json(
      { error: 'Failed to create performance appraisal' },
      { status: 500 }
    )
  }
}
