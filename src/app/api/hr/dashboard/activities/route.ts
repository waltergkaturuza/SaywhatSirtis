import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has HR permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user || !['HR', 'ADMIN'].includes(user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get recent HR activities from the database
    const activities: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      user: string;
      status: string;
    }> = []

    // Get recent employee onboarding
    const recentEmployees = await prisma.employee.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    recentEmployees.forEach(employee => {
      activities.push({
        id: `emp-${employee.id}`,
        type: 'employee_onboarding',
        title: 'New Employee Onboarded',
        description: `${employee.firstName} ${employee.lastName} joined the ${employee.department} department`,
        timestamp: employee.createdAt.toISOString(),
        user: `${employee.firstName} ${employee.lastName}`,
        status: 'completed'
      })
    })

    // Get recent training completions
    const recentTraining = await prisma.trainingEnrollment.findMany({
      where: {
        status: 'completed',
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        employee: true,
        program: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    })

    recentTraining.forEach(training => {
      activities.push({
        id: `training-${training.id}`,
        type: 'training_completion',
        title: 'Training Completed',
        description: `${training.employee.firstName} ${training.employee.lastName} completed "${training.program.title}"`,
        timestamp: training.updatedAt.toISOString(),
        user: `${training.employee.firstName} ${training.employee.lastName}`,
        status: 'completed'
      })
    })

    // Get recent performance reviews
    const recentReviews = await prisma.performanceReview.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        employee: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    recentReviews.forEach(review => {
      activities.push({
        id: `review-${review.id}`,
        type: 'performance_review',
        title: 'Performance Review Scheduled',
        description: `Performance review scheduled for ${review.employee.firstName} ${review.employee.lastName}`,
        timestamp: review.createdAt.toISOString(),
        user: `${review.employee.firstName} ${review.employee.lastName}`,
        status: 'pending'
      })
    })

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(activities.slice(0, 10))
  } catch (error) {
    console.error('Error fetching HR activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}