import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      const employee = await prisma.employees.findFirst({
        where: { userId: session.user.id }
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
    const [totalPlans, approved, pendingReview, draft] = await Promise.all([
      prisma.performance_plans.count({ where: whereClause }),
      prisma.performance_plans.count({ where: { ...whereClause, status: 'approved' } }),
      prisma.performance_plans.count({ where: { ...whereClause, status: 'pending-review' } }),
      prisma.performance_plans.count({ where: { ...whereClause, status: 'draft' } })
    ])

    // Calculate approval rate
    const approvalRate = totalPlans > 0 ? Math.round((approved / totalPlans) * 100) : 0

    // Calculate average progress across all plans
    const plansWithProgress = await prisma.performance_plans.findMany({
      where: whereClause,
      include: {
        keyResponsibilities: {
          include: {
            activities: true
          }
        }
      }
    })

    let totalProgress = 0
    let plansCount = 0

    plansWithProgress.forEach(plan => {
      const totalActivities = plan.keyResponsibilities.reduce((sum, resp) => 
        sum + resp.activities.length, 0
      )
      const completedActivities = plan.keyResponsibilities.reduce((sum, resp) => 
        sum + resp.activities.filter(act => act.status === 'completed').length, 0
      )
      
      if (totalActivities > 0) {
        totalProgress += (completedActivities / totalActivities) * 100
        plansCount++
      }
    })

    const avgProgress = plansCount > 0 ? Math.round(totalProgress / plansCount) : 0

    return NextResponse.json({
      totalPlans,
      approved,
      pendingReview,
      draft,
      approvalRate,
      avgProgress
    })

  } catch (error) {
    console.error('Performance plans statistics error:', error)
    return NextResponse.json({ error: 'Failed to retrieve performance plans statistics' }, { status: 500 })
  }
}
