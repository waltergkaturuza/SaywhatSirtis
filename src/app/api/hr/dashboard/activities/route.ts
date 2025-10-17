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

    // Check permissions - Allow HR role and users with HR permissions
    const userRoles = session.user?.roles || []
    const hasPermission = 
      userRoles.includes('HR') ||
      userRoles.includes('SUPERUSER') ||
      userRoles.includes('SYSTEM_ADMINISTRATOR') ||
      userRoles.includes('admin') ||
      userRoles.includes('hr_manager') ||
      userRoles.includes('hr_staff') ||
      session.user?.permissions?.includes('hr.view') ||
      session.user?.permissions?.includes('hr.full_access')

    if (!hasPermission) {
      console.log('❌ Dashboard Activities - Permission denied for user:', session.user?.email)
      console.log('   Roles:', userRoles)
      console.log('   Permissions:', session.user?.permissions)
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

    try {
      // Get recent user registrations/onboarding
      const recentUsers = await prisma.users.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_registration',
          title: 'New User Registered',
          description: `${user.firstName || user.email} joined the ${user.department || 'organization'}`,
          timestamp: user.createdAt.toISOString(),
          user: `${user.firstName} ${user.lastName}` || user.email,
          status: 'completed'
        })
      })
    } catch (error) {
      console.error('Error fetching recent users:', error)
    }

    try {
      // Get recent training completions
      const recentTraining = await prisma.training_enrollments.findMany({
        where: {
          status: 'completed',
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          employees: true,
          training_programs: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      })

      recentTraining.forEach(training => {
        activities.push({
          id: `training-${training.id}`,
          type: 'training_completion',
          title: 'Training Completed',
          description: `${training.employees.firstName} ${training.employees.lastName} completed "${training.training_programs.title}"`,
          timestamp: training.updatedAt.toISOString(),
          user: `${training.employees.firstName} ${training.employees.lastName}`,
          status: 'completed'
        })
      })
    } catch (error) {
      console.error('Error fetching recent training:', error)
    }

    try {
      // Get recent performance reviews
      const recentReviews = await prisma.performance_reviews.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          employees: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      recentReviews.forEach(review => {
        activities.push({
          id: `review-${review.id}`,
          type: 'performance_review',
          title: 'Performance Review Scheduled',
          description: `Performance review scheduled for ${review.employees.firstName} ${review.employees.lastName}`,
          timestamp: review.createdAt.toISOString(),
          user: `${review.employees.firstName} ${review.employees.lastName}`,
          status: 'pending'
        })
      })
    } catch (error) {
      console.error('Error fetching recent reviews:', error)
    }

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(activities.slice(0, 10))
  } catch (error) {
    console.error('Error fetching HR activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
