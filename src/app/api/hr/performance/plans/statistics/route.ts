import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || new Date().getFullYear().toString()

    // Check user permissions
    const userPermissions = session.user.permissions || []
    const canViewAll = userPermissions.includes('hr.full_access') || 
                      userPermissions.includes('hr.view_all_performance')

    let whereClause: any = {
      planYear: parseInt(year)
    }

    // If user can't view all, only count their own plans
    if (!canViewAll) {
      const employee = await executeQuery(async (prisma) => {
        return prisma.employees.findFirst({ where: { userId: session.user.id }, select: { id: true } })
      })
      if (employee) {
        whereClause.employeeId = employee.id
      } else {
        return NextResponse.json({
          totalPlans: 0,
          approved: 0,
          pendingReview: 0,
          draft: 0,
          approvalRate: 0,
          avgProgress: 0
        })
      }
    }

    // Get basic counts
    const [totalPlans, supervisorApproved, reviewerApproved, draft] = await Promise.all([
      executeQuery(async (prisma) => prisma.performance_plans.count({ where: whereClause })),
      executeQuery(async (prisma) => prisma.performance_plans.count({ where: { ...whereClause, status: 'supervisor-approved' } })),
      executeQuery(async (prisma) => prisma.performance_plans.count({ where: { ...whereClause, status: 'reviewer-approved' } })),
      executeQuery(async (prisma) => prisma.performance_plans.count({ where: { ...whereClause, status: 'draft' } }))
    ])

    // Calculate approval rate
  const totalApproved = supervisorApproved + reviewerApproved
  const approvalRate = totalPlans > 0 ? Math.round((totalApproved / totalPlans) * 100) : 0

    // Calculate average progress across all plans
    const plansWithProgress = await executeQuery(async (prisma) => {
      return prisma.performance_plans.findMany({
        where: whereClause,
        include: {
          performance_responsibilities: {
            include: { performance_activities: true }
          }
        }
      })
    })

    let totalProgress = 0
    let plansCount = 0

    plansWithProgress.forEach(plan => {
      const totalActivities = plan.performance_responsibilities.reduce((sum, resp) => 
        sum + resp.performance_activities.length, 0
      )
      const completedActivities = plan.performance_responsibilities.reduce((sum, resp) => 
        sum + resp.performance_activities.filter(act => act.status === 'completed').length, 0
      )
      
      if (totalActivities > 0) {
        totalProgress += (completedActivities / totalActivities) * 100
        plansCount++
      }
    })

    const avgProgress = plansCount > 0 ? Math.round(totalProgress / plansCount) : 0

    return NextResponse.json({
      totalPlans,
  supervisorApproved,
  reviewerApproved,
      draft,
      approvalRate,
      avgProgress
    })

  } catch (error) {
    console.error('Performance plans statistics error:', error)
    return NextResponse.json({ error: 'Failed to retrieve performance plans statistics' }, { status: 500 })
  }
}
