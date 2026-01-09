import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, HttpStatus, ErrorCodes } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const period = searchParams.get('period')

    // Check if prisma is available and try to connect
    // (Removed explicit prisma availability check; executeQuery will handle errors)

    // Get user and check permissions
    let user
    try {
      user = await executeQuery(async (prisma) => {
        return prisma.users.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          department: true,
          isActive: true
        }
        })
      })
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      
      // Return empty analytics instead of error for better dashboard UX
      const emptyAnalytics = {
        totalAppraisals: 0,
        completedAppraisals: 0,
        pendingAppraisals: 0,
        overdueAppraisals: 0,
        averageRating: 0,
        onTimeCompletion: 0,
        departmentStats: [],
        ratingDistribution: [],
        monthlyTrends: [],
        topPerformers: [],
        improvementAreas: []
      }
      
      const response = createSuccessResponse(emptyAnalytics, {
        message: 'Performance analytics temporarily unavailable'
      })
      return NextResponse.json(response)
    }

    if (!user) {
      // Return empty analytics instead of 404 for better dashboard UX
      const emptyAnalytics = {
        totalAppraisals: 0,
        completedAppraisals: 0,
        pendingAppraisals: 0,
        overdueAppraisals: 0,
        averageRating: 0,
        onTimeCompletion: 0,
        departmentStats: [],
        ratingDistribution: [],
        monthlyTrends: [],
        topPerformers: [],
        improvementAreas: []
      }
      
      const response = createSuccessResponse(emptyAnalytics, {
        message: 'No performance appraisal data available'
      })
      return NextResponse.json(response)
    }

    const canViewAllAppraisals = ['ADMIN', 'HR_MANAGER', 'HR'].includes(user.role)
    const now = new Date()

    // Get employee record to check supervisor/reviewer status
    const employee = await executeQuery(async (prisma) => {
      return prisma.employees.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          is_supervisor: true,
          is_reviewer: true
        }
      });
    });

    // Build where clause for filtering
    let whereClause: any = {}
    
    if (!canViewAllAppraisals) {
      // Filter to show only appraisals where user is supervisor or reviewer
      whereClause.OR = [
        { supervisorId: user.id },
        { reviewerId: user.id }
      ];
    }

    // Add department filter
    if (department && department !== 'all') {
      // employees has a simple department string, not nested name per schema
      whereClause.employees = { department }
    }

    // Add period filter
    if (period && period !== 'all') {
      const periodDate = parsePeriod(period)
      if (periodDate) {
        whereClause.reviewDate = {
          gte: periodDate.start,
          lte: periodDate.end
        }
      }
    }

    // Get comprehensive analytics data
    let analyticsData;
    try {
      const [
        totalAppraisals,
        completedAppraisals,
        avgRating,
        onTimeAppraisals,
        departmentStats,
        ratingDistribution,
        monthlyTrends,
        topPerformers,
        improvementAreas
      ] = await Promise.all([
        // Total appraisals - use performance_appraisals table
        executeQuery(async (prisma) => prisma.performance_appraisals.count({ where: whereClause })),
        
        // Completed appraisals - status 'approved' or 'reviewer_approved'
        executeQuery(async (prisma) => prisma.performance_appraisals.count({ 
          where: { 
            ...whereClause, 
            status: { in: ['approved', 'reviewer_approved'] } 
          } 
        })),
        
        // Average rating
        executeQuery(async (prisma) => prisma.performance_appraisals.aggregate({ 
          where: { ...whereClause, overallRating: { not: null } }, 
          _avg: { overallRating: true } 
        })),
        
        // On-time completions (completed before due date)
        getOnTimeCompletions(whereClause),
        
        // Department statistics
        getDepartmentStats(whereClause, canViewAllAppraisals),
        
        // Rating distribution
        getRatingDistribution(whereClause),
        
        // Monthly trends
        getMonthlyTrends(whereClause),
        
        // Top performers
        getTopPerformers(whereClause),
        
        // Improvement areas
        getImprovementAreas(whereClause)
      ]);

      const onTimeCompletion = completedAppraisals > 0 
        ? Math.round((onTimeAppraisals / completedAppraisals) * 100) 
        : 0

      // Calculate pending and overdue appraisals
      const pendingAppraisals = await executeQuery(async (prisma) => 
        prisma.performance_appraisals.count({ 
          where: { 
            ...whereClause, 
            status: { in: ['draft', 'submitted', 'supervisor_review', 'reviewer_assessment'] } 
          } 
        })
      );

      // Overdue: submitted but not approved after 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const overdueAppraisals = await executeQuery(async (prisma) => 
        prisma.performance_appraisals.count({ 
          where: { 
            ...whereClause, 
            status: { in: ['submitted', 'supervisor_review', 'reviewer_assessment'] },
            submittedAt: { 
              not: null,
              lt: thirtyDaysAgo
            }
          } 
        })
      );

      analyticsData = {
        totalAppraisals,
        completedAppraisals,
        pendingAppraisals,
        overdueAppraisals,
        averageRating: Math.round((avgRating._avg.overallRating || 0) * 10) / 10,
        onTimeCompletion,
        departmentStats,
        ratingDistribution,
        monthlyTrends,
        topPerformers,
        improvementAreas
      };
    } catch (dbError: any) {
      console.error('Database connection failed for analytics:', dbError?.message || 'Unknown error');
      
      // Return empty analytics data when database is unavailable
      analyticsData = {
        totalAppraisals: 0,
        completedAppraisals: 0,
        pendingAppraisals: 0,
        overdueAppraisals: 0,
        averageRating: 0,
        onTimeCompletion: 0,
        departmentStats: [],
        ratingDistribution: [],
        monthlyTrends: [],
        topPerformers: [],
        improvementAreas: []
      };
    }

    const response = createSuccessResponse(analyticsData, {
      message: 'Performance appraisal analytics retrieved successfully'
    })
    return NextResponse.json(response)
  } catch (error) {
    console.error('Performance appraisal analytics error:', error)
    const { response, status } = createErrorResponse(
      'Failed to retrieve analytics',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { code: ErrorCodes.INTERNAL_SERVER_ERROR }
    )
    return NextResponse.json(response, { status })
  }
}

// Helper function to get on-time completions
async function getOnTimeCompletions(baseWhereClause: any): Promise<number> {
  try {
    return await executeQuery(async (prisma) => prisma.performance_appraisals.count({
      where: { 
        ...baseWhereClause, 
        status: { in: ['approved', 'reviewer_approved'] },
        approvedAt: { not: null },
        submittedAt: { not: null }
      }
    }))
  } catch (error) {
    console.error('Error getting on-time completions:', error)
    return 0
  }
}

// Helper function to get department statistics
async function getDepartmentStats(baseWhereClause: any, canViewAllAppraisals: boolean) {
  try {
    if (!canViewAllAppraisals) {
      return []
    }
    const departments = await executeQuery(async (prisma) => prisma.departments.findMany({
      where: { isActive: true },
      include: { employees: { include: { performance_appraisals: { where: baseWhereClause } } } }
    }))

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const deptWhereClause = {
          ...baseWhereClause,
          employees: { departmentId: dept.id }
        }

        const [total, completed, avgRating, onTime] = await Promise.all([
          executeQuery(async (prisma) => prisma.performance_appraisals.count({ where: deptWhereClause })),
          executeQuery(async (prisma) => prisma.performance_appraisals.count({ where: { ...deptWhereClause, status: { in: ['approved', 'reviewer_approved'] } } })),
          executeQuery(async (prisma) => prisma.performance_appraisals.aggregate({ where: { ...deptWhereClause, overallRating: { not: null } }, _avg: { overallRating: true } })),
          getOnTimeCompletions(deptWhereClause)
        ])

        return {
          department: dept.name,
          total,
          completed,
          averageRating: Math.round((avgRating._avg.overallRating || 0) * 10) / 10,
          onTime: completed > 0 ? Math.round((onTime / completed) * 100) : 0
        }
      })
    )

    return departmentStats.filter(stat => stat.total > 0)
  } catch (error) {
    console.error('Error getting department stats:', error)
    return []
  }
}

// Helper function to get rating distribution
async function getRatingDistribution(baseWhereClause: any) {
  try {
    const ratings = await executeQuery(async (prisma) => prisma.performance_appraisals.groupBy({
      by: ['overallRating'],
      where: { ...baseWhereClause, overallRating: { not: null } },
      _count: true
    }))

    const totalRatings = ratings.reduce((sum, rating) => sum + rating._count, 0)
    
    // Create distribution for ratings 1-5
    const distribution = [5, 4, 3, 2, 1].map(rating => {
      const ratingData = ratings.find(r => Math.floor(r.overallRating!) === rating)
      const count = ratingData?._count || 0
      const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0
      
      return {
        rating,
        count,
        percentage
      }
    })

    return distribution
  } catch (error) {
    console.error('Error getting rating distribution:', error)
    return []
  }
}

// Helper function to get monthly trends
async function getMonthlyTrends(baseWhereClause: any) {
  try {
    const currentDate = new Date()
    const months = []
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      
      const monthlyData = await Promise.all([
        executeQuery(async (prisma) => prisma.performance_appraisals.count({ where: { ...baseWhereClause, status: { in: ['approved', 'reviewer_approved'] }, approvedAt: { gte: date, lt: nextMonth } } })),
        executeQuery(async (prisma) => prisma.performance_appraisals.aggregate({ where: { ...baseWhereClause, status: { in: ['approved', 'reviewer_approved'] }, approvedAt: { gte: date, lt: nextMonth }, overallRating: { not: null } }, _avg: { overallRating: true } }))
      ])

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        completed: monthlyData[0],
        averageRating: Math.round((monthlyData[1]._avg.overallRating || 0) * 10) / 10
      })
    }

    return months
  } catch (error) {
    console.error('Error getting monthly trends:', error)
    return []
  }
}

// Helper function to get top performers
async function getTopPerformers(baseWhereClause: any) {
  try {
    const topPerformers = await executeQuery(async (prisma) => prisma.performance_appraisals.findMany({
      where: { ...baseWhereClause, status: { in: ['approved', 'reviewer_approved'] }, overallRating: { not: null } },
      include: { 
        employees: { 
          include: { 
            users: true, 
            departments: true 
          } 
        },
        performance_plans: {
          select: {
            planYear: true,
            planPeriod: true
          }
        }
      },
      orderBy: { overallRating: 'desc' },
      take: 5
    }))

    return topPerformers.map(appraisal => ({
      name: `${appraisal.employees?.firstName || ''} ${appraisal.employees?.lastName || ''}`.trim(),
      department: appraisal.employees?.departments?.name || 'Unknown',
      rating: Math.round((appraisal.overallRating || 0) * 10) / 10,
      period: appraisal.performance_plans?.planPeriod || `${appraisal.performance_plans?.planYear || new Date().getFullYear()}`
    }))
  } catch (error) {
    console.error('Error getting top performers:', error)
    return []
  }
}

// Helper function to get improvement areas
async function getImprovementAreas(baseWhereClause: any) {
  try {
    // TODO: Implement actual query when performance_criteria table structure is available
    // For now, return empty array since the criteria schema is not yet implemented
    return []
  } catch (error) {
    console.error('Error getting improvement areas:', error)
    return []
  }
}

// Helper function to parse period string
function parsePeriod(period: string): { start: Date; end: Date } | null {
  const currentYear = new Date().getFullYear()
  
  if (period.startsWith('Q')) {
    const [quarter, year] = period.split(' ').map((p, i) => 
      i === 0 ? parseInt(p.replace('Q', '')) : parseInt(p)
    )
    const actualYear = year || currentYear
    
    const quarterStart = new Date(actualYear, (quarter - 1) * 3, 1)
    const quarterEnd = new Date(actualYear, quarter * 3, 0, 23, 59, 59, 999)
    
    return { start: quarterStart, end: quarterEnd }
  }
  
  if (period.startsWith('Annual')) {
    const year = parseInt(period.split(' ')[1]) || currentYear
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999)
    
    return { start: yearStart, end: yearEnd }
  }
  
  return null
}

// Helper function to format review period
function formatReviewPeriod(reviewType: string, reviewDate: Date): string {
  const date = new Date(reviewDate)
  const year = date.getFullYear()
  
  if (reviewType === 'annual') {
    return `Annual ${year}`
  } else if (reviewType === 'quarterly') {
    const quarter = Math.ceil((date.getMonth() + 1) / 3)
    return `Q${quarter} ${year}`
  } else {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[date.getMonth()]} ${year}`
  }
}


