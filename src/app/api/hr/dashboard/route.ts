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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get current date for time-based queries
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Employee metrics
    const [
      totalEmployees,
      activeEmployees,
      employeesOnLeave,
      newHiresThisMonth,
      newHiresLastMonth
    ] = await Promise.all([
      // Total employees
      prisma.employee.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Active employees (not on leave)
      prisma.employee.count({
        where: { 
          status: 'ACTIVE'
        }
      }),
      
      // Employees on leave
      prisma.employee.count({
        where: { status: 'ON_LEAVE' }
      }),
      
      // New hires this month
      prisma.employee.count({
        where: {
          hireDate: {
            gte: startOfMonth
          }
        }
      }),
      
      // New hires last month
      prisma.employee.count({
        where: {
          hireDate: {
            gte: lastMonth,
            lte: endOfLastMonth
          }
        }
      })
    ])

    // Performance metrics
    const performanceReviews = await prisma.performanceReview.aggregate({
      _avg: {
        overallRating: true
      },
      _count: {
        id: true
      },
      where: {
        reviewDate: {
          gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) // Last 12 months
        }
      }
    })

    // Leave requests requiring approval
    const pendingLeaveRequests = await prisma.leaveRecord.count({
      where: {
        status: 'pending'
      }
    })

    // Performance reviews due
    const reviewsDue = await prisma.employee.count({
      where: {
        performanceReviews: {
          none: {
            reviewDate: {
              gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) // No review in last 6 months
            }
          }
        }
      }
    })

    // Recent activity - last few activities
    const recentEmployees = await prisma.employee.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        firstName: true,
        lastName: true,
        department: true,
        createdAt: true,
        hireDate: true
      }
    })

    const recentPerformanceReviews = await prisma.performanceReview.findMany({
      take: 2,
      orderBy: {
        reviewDate: 'desc'
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Calculate changes
    const newHireChange = newHiresLastMonth > 0 
      ? ((newHiresThisMonth - newHiresLastMonth) / newHiresLastMonth * 100).toFixed(1)
      : '0'

    const dashboardData = {
      metrics: {
        totalEmployees,
        activeEmployees,
        employeesOnLeave,
        newHiresThisMonth,
        newHireChange: `${newHireChange > '0' ? '+' : ''}${newHireChange}%`,
        averagePerformance: performanceReviews._avg.overallRating?.toFixed(1) || '0.0',
        attendanceRate: '96.2%', // Mock data - would need attendance tracking
        attendanceChange: '+0.8%' // Mock data
      },
      pendingActions: {
        reviewsDue,
        pendingLeaveRequests,
        onboardingCount: 5 // Mock data - would need onboarding tracking
      },
      recentActivity: [
        ...recentEmployees.map(emp => ({
          type: 'employee_added',
          title: 'New employee onboarded',
          description: `${emp.firstName} ${emp.lastName} joined the ${emp.department} team`,
          timestamp: emp.createdAt,
          icon: 'UserPlusIcon'
        })),
        ...recentPerformanceReviews.map(review => ({
          type: 'performance_review',
          title: 'Performance review completed',
          description: `${review.employee.firstName} ${review.employee.lastName}'s review scored ${review.overallRating}/5`,
          timestamp: review.reviewDate,
          icon: 'StarIcon'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 4)
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('HR Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch HR dashboard data' },
      { status: 500 }
    )
  }
}
