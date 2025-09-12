import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    try {
      console.log('Fetching HR statistics...')
      
      // Get real HR statistics from database
      const [
        totalEmployees,
        activeEmployees,
        departmentCount,
        trainingCount,
        activeTrainings
      ] = await Promise.all([
        prisma.user.count().catch(e => { console.error('Employee count error:', e); return 0; }),
        prisma.user.count({
          where: { status: 'ACTIVE' }
        }).catch(e => { console.error('Active employee count error:', e); return 0; }),
        prisma.department.count().catch(e => { console.error('Department count error:', e); return 0; }),
        prisma.event.count({
          where: { type: 'training' }
        }).catch(e => { console.error('Training count error:', e); return 0; }),
        prisma.event.count({
          where: {
            type: 'training',
            status: { in: ['approved', 'in-progress'] }
          }
        }).catch(e => { console.error('Active training count error:', e); return 0; })
      ])

      console.log('Stats fetched:', { totalEmployees, activeEmployees, departmentCount, trainingCount, activeTrainings })

      // Get new employees this month
      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)
      thisMonthStart.setHours(0, 0, 0, 0)
      
      const newEmployeesThisMonth = await prisma.user.count({
        where: {
          createdAt: { gte: thisMonthStart }
        }
      })

      // Get department breakdown
      const departmentBreakdown = await prisma.department.findMany({
        include: {
          _count: {
            select: {
              employees: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      })

      const departments = departmentBreakdown.map(dept => ({
        name: dept.name,
        count: dept._count.employees
      }))

      // Calculate real performance metrics
      const performanceReviews = await prisma.performanceReview.aggregate({
        _avg: {
          overallRating: true
        },
        where: {
          overallRating: { not: null }
        }
      })

      const averagePerformance = performanceReviews._avg.overallRating || 0

      // Calculate attendance rate from actual data
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      
      // Get pending performance reviews
      const pendingReviews = await prisma.performanceReview.count({
        where: {
          nextReviewDate: {
            lte: new Date()
          }
        }
      })

      // Get employees in onboarding (recently hired)
      const onboardingThreshold = new Date()
      onboardingThreshold.setDate(onboardingThreshold.getDate() - 30) // 30 days
      
      const onboardingCount = await prisma.user.count({
        where: {
          startDate: {
            gte: onboardingThreshold
          },
          status: 'ACTIVE'
        }
      })

      return NextResponse.json({
        totalEmployees,
        activeEmployees,
        newEmployeesThisMonth,
        departmentCount,
        trainingCount,
        activeTrainings,
        averagePerformance,
        attendanceRate: 0, // Will implement attendance tracking later
        attendanceIncrease: 0,
        pendingReviews,
        onboardingCount,
        departments
      })

    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard statistics' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in dashboard stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
