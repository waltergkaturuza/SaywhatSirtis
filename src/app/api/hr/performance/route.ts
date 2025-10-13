import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { safeQuery } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user can view performance data
    const canViewAll = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'HR_MANAGER'

    // Get performance statistics
    const [
      totalReviews,
      completedReviews,
      pendingReviews,
      overdueReviews,
      averageRating,
      recentReviews,
      performanceGoals
    ] = await Promise.all([
      // Total reviews count
      safeQuery(async (prisma) => {
        return await prisma.performance_reviews.count(
          canViewAll ? {} : {
            where: {
              employees: { email: session.user.email }
            }
          }
        )
      }).catch(() => 0),

      // Completed reviews
      safeQuery(async (prisma) => {
        return await prisma.performance_reviews.count({
          where: {
            reviewStatus: 'completed',
            ...(canViewAll ? {} : {
              employees: { email: session.user.email }
            })
          }
        })
      }).catch(() => 0),

      // Pending reviews  
      safeQuery(async (prisma) => {
        return await prisma.performance_reviews.count({
          where: {
            reviewStatus: { in: ['draft', 'submitted'] },
            ...(canViewAll ? {} : {
              employees: { email: session.user.email }
            })
          }
        })
      }).catch(() => 0),

      // Overdue reviews
      safeQuery(async (prisma) => {
        return await prisma.performance_reviews.count({
          where: {
            reviewStatus: { in: ['draft', 'submitted'] },
            nextReviewDate: { lt: new Date() },
            ...(canViewAll ? {} : {
              employees: { email: session.user.email }
            })
          }
        })
      }).catch(() => 0),

      // Average rating
      safeQuery(async (prisma) => {
        const result = await prisma.performance_reviews.aggregate({
          where: {
            overallRating: { not: null },
            ...(canViewAll ? {} : {
              employees: { email: session.user.email }
            })
          },
          _avg: { overallRating: true }
        })
        return result._avg.overallRating || 0
      }).catch(() => 0),

      // Recent reviews with employee details
      safeQuery(async (prisma) => {
        return await prisma.performance_reviews.findMany({
          where: canViewAll ? {} : {
            employees: { email: session.user.email }
          },
          include: {
            employees: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                department: true,
                position: true
              }
            },
            users_performance_reviews_supervisorIdTousers: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      }).catch(() => []),

      // Performance goals/plans
      safeQuery(async (prisma) => {
        return await prisma.performance_plans.findMany({
          where: canViewAll ? {} : {
            employees: { email: session.user.email }
          },
          include: {
            employees: {
              select: {
                firstName: true,
                lastName: true,
                department: true,
                position: true
              }
            },
            performance_responsibilities: {
              include: {
                performance_activities: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      }).catch(() => [])
    ])

    // Calculate growth percentage
    const currentYear = new Date().getFullYear()
    const lastYearReviews = await safeQuery(async (prisma) => {
      return await prisma.performance_reviews.count({
        where: {
          createdAt: {
            gte: new Date(`${currentYear - 1}-01-01`),
            lt: new Date(`${currentYear}-01-01`)
          },
          ...(canViewAll ? {} : {
            employees: { email: session.user.email }
          })
        }
      })
    }).catch(() => 0)

    const growthPercentage = lastYearReviews > 0 
      ? Math.round(((completedReviews - lastYearReviews) / lastYearReviews) * 100)
      : 0

    // Format reviews for frontend
    const formattedReviews = recentReviews.map((review: any) => ({
      id: review.id,
      employeeName: `${review.employees?.firstName || ''} ${review.employees?.lastName || ''}`.trim(),
      position: review.employees?.position || 'N/A',
      department: review.employees?.department || 'N/A',
      reviewType: review.reviewType || 'Annual',
      status: review.reviewStatus || 'draft',
      rating: review.overallRating || null,
      reviewer: review.users_performance_reviews_supervisorIdTousers 
        ? `${review.users_performance_reviews_supervisorIdTousers.firstName} ${review.users_performance_reviews_supervisorIdTousers.lastName}` 
        : 'Not Assigned',
      dueDate: review.nextReviewDate || review.reviewDate,
      goals: 0, // Will calculate from responsibilities
      goalsCompleted: 0,
      reviewPeriod: review.reviewPeriod,
      feedback: review.feedback,
      createdAt: review.createdAt
    }))

    // Format goals/plans
    const formattedGoals = performanceGoals.map((plan: any) => ({
      id: plan.id,
      title: `Performance Plan ${plan.planYear} - ${plan.planPeriod}`,
      description: `Performance plan for ${plan.employees?.firstName} ${plan.employees?.lastName}`,
      status: plan.status === 'approved' ? 'on-track' : plan.status === 'draft' ? 'pending' : 'at-risk',
      priority: 'medium',
      progress: plan.status === 'approved' ? 75 : plan.status === 'draft' ? 0 : 45,
      dueDate: new Date(plan.planYear, 11, 31), // End of plan year
      assignee: `${plan.employees?.firstName || ''} ${plan.employees?.lastName || ''}`.trim(),
      department: plan.employees?.department || 'N/A',
      responsibilitiesCount: plan.performance_responsibilities?.length || 0,
      activitiesCount: plan.performance_responsibilities?.reduce((total: number, resp: any) => 
        total + (resp.performance_activities?.length || 0), 0) || 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          averageRating: Math.round(averageRating * 10) / 10,
          reviewsDue: pendingReviews + overdueReviews,
          completedReviews,
          inProgress: pendingReviews,
          totalReviews,
          overdueReviews,
          growthPercentage
        },
        reviews: formattedReviews,
        goals: formattedGoals,
        user: {
          id: currentUser.id,
          name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
          email: currentUser.email,
          role: currentUser.role,
          canViewAll
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
