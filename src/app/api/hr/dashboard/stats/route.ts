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
        prisma.users.count().catch(e => { console.error('User count error:', e); return 0; }),
        prisma.users.count({
          where: { isActive: true }
        }).catch(e => { console.error('Active user count error:', e); return 0; }),
        prisma.departments.count().catch(e => { console.error('Department count error:', e); return 0; }),
        prisma.events.count({
          where: { type: 'training' }
        }).catch(e => { console.error('Training count error:', e); return 0; }),
        prisma.events.count({
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
      
      const newEmployeesThisMonth = await prisma.users.count({
        where: {
          createdAt: { gte: thisMonthStart }
        }
      })

      // Get department breakdown
      const departmentBreakdown = await prisma.departments.findMany({
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
      }).catch(e => { console.error('Department breakdown error:', e); return []; })

      const departments = departmentBreakdown.map(dept => ({
        name: dept.name,
        count: dept._count.employees
      }))

      // Calculate real performance metrics
      const performanceReviews = await prisma.performance_reviews.aggregate({
        _avg: {
          overallRating: true
        },
        where: {
          overallRating: { not: null }
        }
      }).catch(e => { console.error('Performance reviews error:', e); return { _avg: { overallRating: null } }; })

      const averagePerformance = performanceReviews._avg.overallRating || 0

      // Calculate attendance rate from actual data
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      
      // Get pending performance reviews
      const pendingReviews = await prisma.performance_reviews.count({
        where: {
          nextReviewDate: {
            lte: new Date()
          }
        }
      })

      // Get employees in onboarding (recently hired)
      const onboardingThreshold = new Date()
      onboardingThreshold.setDate(onboardingThreshold.getDate() - 30) // 30 days
      
      const onboardingCount = await prisma.employees.count({
        where: {
          startDate: {
            gte: onboardingThreshold
          },
          status: 'ACTIVE'
        }
      }).catch(e => { console.error('Onboarding count error:', e); return 0; })

      return NextResponse.json({
        totalEmployees,
        activeEmployees,
        newEmployeesThisMonth,
        departmentCount,
        trainingCount,
        activeTrainings,
        averagePerformance,
        newHires: newEmployeesThisMonth,
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
