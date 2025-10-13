import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { safeQuery } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user and check permissions
    const currentUser = await safeQuery(async (prisma) => {
      return await prisma.users.findUnique({
        where: { email: session.user.email },
        select: { 
          id: true, 
          role: true, 
          email: true,
          firstName: true,
          lastName: true
        }
      })
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user can view analytics data
    const canViewAll = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'HR_MANAGER'

    if (!canViewAll) {
      return NextResponse.json({
        success: true,
        data: {
          stats: {
            averageRating: 0,
            reviewsThisQuarter: 0,
            improvementRate: 0,
            goalCompletionRate: 0,
            reviewCompletionRate: 0
          },
          departmentComparison: [],
          message: 'Analytics access restricted to HR management'
        }
      })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'quarterly'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        break
      case 'quarterly':
      default:
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        previousStartDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        break
    }

    // Get comprehensive analytics data
    const [
      totalReviews,
      currentPeriodReviews,
      previousPeriodReviews,
      averageRating,
      previousAverageRating,
      completedGoals,
      totalGoals,
      departmentStats,
      topPerformers
    ] = await Promise.all([
      // Total reviews count
      safeQuery(async (prisma) => {
        return await prisma.performance_reviews.count()
      }).catch(() => 0),

      // Current period reviews
      safeQuery(async (prisma) => {
        return await prisma.performance_reviews.findMany({
          where: {
            createdAt: { gte: startDate }
          },
          include: {
            employees: {
              select: {
                department: true,
                firstName: true,
                lastName: true
              }
            }
          }
        })
      }).catch(() => []),

      // Previous period reviews for comparison
      safeQuery(async (prisma) => {
        return await prisma.performance_reviews.findMany({
          where: {
            createdAt: {
              gte: previousStartDate,
              lt: startDate
            }
          }
        })
      }).catch(() => []),

      // Current average rating
      safeQuery(async (prisma) => {
        const result = await prisma.performance_reviews.aggregate({
          where: {
            overallRating: { not: null },
            createdAt: { gte: startDate }
          },
          _avg: { overallRating: true }
        })
        return result._avg.overallRating || 0
      }).catch(() => 0),

      // Previous period average rating
      safeQuery(async (prisma) => {
        const result = await prisma.performance_reviews.aggregate({
          where: {
            overallRating: { not: null },
            createdAt: {
              gte: previousStartDate,
              lt: startDate
            }
          },
          _avg: { overallRating: true }
        })
        return result._avg.overallRating || 0
      }).catch(() => 0),

      // Completed goals (performance plans with approved status)
      safeQuery(async (prisma) => {
        return await prisma.performance_plans.count({
          where: {
            status: 'approved',
            createdAt: { gte: startDate }
          }
        })
      }).catch(() => 0),

      // Total goals (all performance plans)
      safeQuery(async (prisma) => {
        return await prisma.performance_plans.count({
          where: {
            createdAt: { gte: startDate }
          }
        })
      }).catch(() => 0),

      // Department statistics
      safeQuery(async (prisma) => {
        const departments = await prisma.employees.groupBy({
          by: ['department'],
          _count: { id: true },
          where: {
            department: { not: null }
          }
        })

        return await Promise.all(
          departments.map(async (dept) => {
            const deptReviews = await prisma.performance_reviews.findMany({
              where: {
                employees: { department: dept.department },
                createdAt: { gte: startDate },
                overallRating: { not: null }
              }
            })
            
            const avgRating = deptReviews.length > 0
              ? deptReviews.reduce((sum, review) => sum + (review.overallRating || 0), 0) / deptReviews.length
              : 0

            const completedReviews = deptReviews.filter(r => r.reviewStatus === 'completed').length
            const completionRate = dept._count.id > 0 ? Math.round((completedReviews / dept._count.id) * 100) : 0

            return {
              name: dept.department || 'Unknown',
              avgRating: Math.round(avgRating * 10) / 10,
              employees: dept._count.id,
              completedReviews,
              completionRate,
              reviewCount: deptReviews.length
            }
          })
        )
      }).catch(() => []),

      // Top performers
      safeQuery(async (prisma) => {
        return await prisma.performance_reviews.findMany({
          where: {
            createdAt: { gte: startDate },
            overallRating: { gte: 4.0 }
          },
          include: {
            employees: {
              select: {
                firstName: true,
                lastName: true,
                department: true,
                position: true
              }
            }
          },
          orderBy: {
            overallRating: 'desc'
          },
          take: 5
        })
      }).catch(() => [])
    ])

    // Calculate improvement rate
    const improvementRate = previousAverageRating > 0 
      ? Math.round(((averageRating - previousAverageRating) / previousAverageRating) * 100)
      : 0

    // Calculate goal completion rate
    const goalCompletionRate = totalGoals > 0 
      ? Math.round((completedGoals / totalGoals) * 100) 
      : 0

    // Calculate review completion rate
    const reviewCompletionRate = currentPeriodReviews.length > 0
      ? Math.round((currentPeriodReviews.filter((r: any) => r.reviewStatus === 'completed').length / currentPeriodReviews.length) * 100)
      : 0

    // Format department comparison data for charts
    const departmentComparison = departmentStats.map((dept: any) => ({
      department: dept.name,
      rating: dept.avgRating,
      employees: dept.employees,
      completionRate: dept.completionRate
    }))

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          averageRating: Math.round(averageRating * 10) / 10,
          reviewsThisQuarter: currentPeriodReviews.length,
          improvementRate,
          goalCompletionRate,
          reviewCompletionRate
        },
        departmentComparison,
        topPerformers: topPerformers.map((review: any) => ({
          name: `${review.employees?.firstName || ''} ${review.employees?.lastName || ''}`.trim(),
          department: review.employees?.department || 'Unknown',
          rating: review.overallRating || 0,
          position: review.employees?.position || 'Employee'
        })),
        period,
        periodLabel: period === 'quarterly' ? 'This Quarter' : 
                    period === 'monthly' ? 'This Month' : 'This Year'
      }
    })
  } catch (error) {
    console.error('Error fetching performance analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        break
      default: // quarterly
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    }

    // Get department filter
    const departmentFilter = department === 'all' ? {} : { department: department.toUpperCase() }

    // Fetch overall metrics
    const totalEmployees = await prisma.users.count({
      where: departmentFilter
    })

    const performanceReviews = await prisma.performance_reviews.findMany({
      where: {
        createdAt: { gte: startDate },
        employees: departmentFilter
      },
      include: {
        employees: true
      }
    })

    const totalReviews = performanceReviews.length
    const averageRating = totalReviews > 0 
      ? performanceReviews.reduce((sum, review) => sum + (review.overallRating || 0), 0) / totalReviews
      : 0
    
    const completedReviews = performanceReviews.filter(review => review.reviewType === 'annual').length
    const completionRate = totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0

    // Calculate improvement rate (simplified)
    const improvementRate = Math.floor(Math.random() * 20) + 5 // Placeholder calculation

    // Get department statistics
    const departments = await prisma.users.groupBy({
      by: ['department'],
      _count: {
        id: true
      }
    })

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const deptReviews = await prisma.performance_reviews.findMany({
          where: {
            employees: { department: dept.department },
            createdAt: { gte: startDate }
          }
        })
        
        const avgRating = deptReviews.length > 0
          ? deptReviews.reduce((sum, review) => sum + (review.overallRating || 0), 0) / deptReviews.length
          : 0

        const trend = avgRating > 4 ? 'up' : avgRating < 3.5 ? 'down' : 'stable'

        return {
          name: dept.department,
          avgRating: Math.round(avgRating * 10) / 10,
          employees: dept._count.id,
          trend
        }
      })
    )

    // Get top performers
    const topPerformers = await prisma.performance_reviews.findMany({
      where: {
        createdAt: { gte: startDate },
        overallRating: { gte: 4.5 }
      },
      include: {
        employees: true
      },
      orderBy: {
        overallRating: 'desc'
      },
      take: 5
    })

    const topPerformersData = topPerformers.map(review => ({
      name: `${review.employees.firstName} ${review.employees.lastName}`,
      department: review.employees.department,
      rating: review.overallRating || 0,
      position: review.employees.position || 'Employee'
    }))

    // Get employees needing attention
    const needsAttention = await prisma.performance_reviews.findMany({
      where: {
        createdAt: { gte: startDate },
        overallRating: { lte: 3.2 }
      },
      include: {
        employees: true
      },
      orderBy: {
        overallRating: 'asc'
      },
      take: 5
    })

    const needsAttentionData = needsAttention.map(review => ({
      name: `${review.employees.firstName} ${review.employees.lastName}`,
      department: review.employees.department,
      rating: review.overallRating || 0,
      position: review.employees.position || 'Employee',
      issue: 'Performance concerns'
    }))

    // Get skill gaps (simplified)
    const skillGaps = [
      { skill: "Communication", gap: Math.floor(Math.random() * 30) + 10, priority: "high" },
      { skill: "Technical Skills", gap: Math.floor(Math.random() * 25) + 15, priority: "medium" },
      { skill: "Leadership", gap: Math.floor(Math.random() * 20) + 10, priority: "medium" },
      { skill: "Project Management", gap: Math.floor(Math.random() * 25) + 12, priority: "high" },
      { skill: "Data Analysis", gap: Math.floor(Math.random() * 15) + 8, priority: "low" }
    ]

    const performanceMetrics = {
      overall: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        completionRate: Math.round(completionRate),
        improvementRate
      },
      departments: departmentStats,
      topPerformers: topPerformersData,
      needsAttention: needsAttentionData,
      skillGaps
    }

    return NextResponse.json(performanceMetrics)
  } catch (error) {
    console.error('Error fetching performance analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
