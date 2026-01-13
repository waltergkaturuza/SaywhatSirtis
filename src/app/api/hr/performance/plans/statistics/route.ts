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

    // Build where clause based on user permissions
    let whereClause: any = {
      planYear: parseInt(year)
    }

    // If user can't view all, count plans where they are employee, supervisor, or reviewer
    if (!canViewAll) {
      const employee = await executeQuery(async (prisma) => {
        return prisma.employees.findFirst({ where: { userId: session.user.id }, select: { id: true } })
      })
      
      // Build OR conditions for plans where user is employee, supervisor, or reviewer
      const orConditions: any[] = []
      
      if (employee) {
        orConditions.push({ employeeId: employee.id })
      }
      
      // Always include supervisor and reviewer conditions
      orConditions.push({ supervisorId: session.user.id })
      orConditions.push({ reviewerId: session.user.id })
      
      // Use AND to combine planYear with OR conditions
      whereClause = {
        AND: [
          { planYear: parseInt(year) },
          { OR: orConditions }
        ]
      }
    }

    // Get basic counts - use workflowStatus instead of status
    const buildWhereClause = (additionalCondition: any) => {
      if (whereClause.AND) {
        // If we already have AND with OR, add the additional condition to the AND array
        return {
          AND: [
            ...whereClause.AND,
            additionalCondition
          ]
        }
      }
      return {
        ...whereClause,
        ...additionalCondition
      }
    }

    const [totalPlans, supervisorApproved, reviewerApproved, draft, pendingReview] = await Promise.all([
      executeQuery(async (prisma) => prisma.performance_plans.count({ where: whereClause })),
      executeQuery(async (prisma) => prisma.performance_plans.count({ where: buildWhereClause({ workflowStatus: 'supervisor_approved' }) })),
      executeQuery(async (prisma) => prisma.performance_plans.count({ where: buildWhereClause({ workflowStatus: 'approved' }) })),
      executeQuery(async (prisma) => prisma.performance_plans.count({ where: buildWhereClause({ status: 'draft' }) })),
      executeQuery(async (prisma) => prisma.performance_plans.count({ 
        where: buildWhereClause({ 
          workflowStatus: { in: ['submitted', 'supervisor_review', 'reviewer_assessment'] }
        }) 
      }))
    ])

    // Calculate approval rate - use reviewerApproved as final approved count
    const totalApproved = reviewerApproved
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
      approved: reviewerApproved,
      draft,
      pendingReview,
      approvalRate,
      avgProgress
    })

  } catch (error) {
    console.error('Performance plans statistics error:', error)
    return NextResponse.json({ error: 'Failed to retrieve performance plans statistics' }, { status: 500 })
  }
}
