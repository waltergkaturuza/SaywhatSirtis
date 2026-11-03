import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { activityProgress, canViewAllPerformance, planMatchesListStatus, resolvedPlanWorkflow } from '@/lib/hr/performance-access'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user and check permissions
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: {
        employees: {
          select: {
            id: true,
            is_supervisor: true,
            is_reviewer: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // HR, system administrators, and users with HR performance access see every plan.
    const canViewAll = canViewAllPerformance(user, session);

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employeeId')
    const scope = searchParams.get('scope')

    const filters: any[] = []

    if (year && year !== 'all') {
      const planYear = parseInt(year, 10)
      if (!Number.isNaN(planYear)) filters.push({ planYear })
    }

    if (employeeId) filters.push({ employeeId })

    // Personal links stay on the signed-in employee, even for HR.
    // Review lists stay on the people this user supervises or reviews.
    const userEmployee = user.employees
    if (scope === 'mine') {
      filters.push({ employeeId: userEmployee?.id || '00000000-0000-0000-0000-000000000000' })
    } else if (!canViewAll || scope === 'team') {
      const permissionFilter: any[] = [
        { supervisorId: user.id },
        { reviewerId: user.id }
      ]

      if (userEmployee) {
        permissionFilter.push(
          { employeeId: userEmployee.id },
          { supervisorId: userEmployee.id },
          { reviewerId: userEmployee.id }
        )

        const [supervised, reviewed] = await Promise.all([
          prisma.employees.findMany({
            where: { supervisor_id: userEmployee.id },
            select: { id: true }
          }),
          prisma.employees.findMany({
            where: { reviewer_id: userEmployee.id },
            select: { id: true }
          })
        ])

        const supervisedIds = supervised.map((emp) => emp.id)
        const reviewedIds = reviewed.map((emp) => emp.id)
        if (supervisedIds.length > 0) permissionFilter.push({ employeeId: { in: supervisedIds } })
        if (reviewedIds.length > 0) permissionFilter.push({ employeeId: { in: reviewedIds } })
      }

      filters.push({ OR: permissionFilter })
    }

    const whereClause = filters.length > 0 ? { AND: filters } : {}

    console.log('🔍 GET /api/hr/performance/plans');
    console.log('   User:', session.user.email);
    console.log('   User ID:', session.user.id);
    console.log('   User Role:', user.role);
    console.log('   Can View All:', canViewAll);
    console.log('   Where Clause:', JSON.stringify(whereClause, null, 2));
    console.log('   EmployeeId filter:', employeeId);

    // Get all performance plans with employee and department details
    const plans = await prisma.performance_plans.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : {},
      include: {
        employees: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            departments: {
              select: {
                name: true
              }
            },
            employees: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            reviewer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        performance_responsibilities: {
          select: {
            id: true,
            title: true,
            description: true,
            weight: true,
            performance_activities: {
              select: { status: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('   Found plans:', plans.length);
    if (plans.length > 0) {
      console.log('   First plan:', {
        id: plans[0].id,
        employeeId: plans[0].employeeId,
        status: plans[0].status,
        supervisorId: plans[0].supervisorId,
        reviewerId: plans[0].reviewerId
      });
    }

    const listedPlans = plans.filter((plan) => {
      if (!planMatchesListStatus(plan, status)) return false
      if (scope === 'mine') return Boolean(user.employees?.id) && plan.employeeId === user.employees?.id
      return true
    })

    const stalePlans = plans.filter((plan) => resolvedPlanWorkflow(plan) !== (plan.workflowStatus || 'draft'))
    if (stalePlans.length > 0) {
      await Promise.all(stalePlans.map((plan) => prisma.performance_plans.update({
        where: { id: plan.id },
        data: { workflowStatus: resolvedPlanWorkflow(plan) }
      })))
    }

    const progressValues = plans.map((plan) => activityProgress(plan.performance_responsibilities))
    const workflowOf = (plan: { status?: string | null; workflowStatus?: string | null }) => resolvedPlanWorkflow(plan)
    const approvedCount = plans.filter((plan) => workflowOf(plan) === 'approved' || plan.status === 'completed').length
    const pendingReview = plans.filter((plan) => ['submitted', 'supervisor_review', 'reviewer_assessment'].includes(workflowOf(plan))).length

    // Summary cards stay on the full year the user can see. Tabs filter the table only.
    const statistics = {
      total: plans.length,
      totalPlans: plans.length,
      draft: plans.filter(p => workflowOf(p) === 'draft').length,
      supervisorReview: plans.filter(p => workflowOf(p) === 'supervisor_review' || workflowOf(p) === 'submitted').length,
      supervisorApproved: plans.filter(p => workflowOf(p) === 'supervisor_approved').length,
      reviewerReview: plans.filter(p => workflowOf(p) === 'reviewer_assessment').length,
      reviewerApproved: plans.filter(p => workflowOf(p) === 'approved').length,
      completed: plans.filter(p => workflowOf(p) === 'completed' || workflowOf(p) === 'approved').length,
      pendingReview,
      pendingApproval: pendingReview,
      approved: approvedCount,
      approvalRate: plans.length > 0 ? Math.round((approvedCount / plans.length) * 100) : 0,
      avgProgress: progressValues.length > 0
        ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
        : 0
    };

    // Helper function to determine next action based on workflow status
    const getNextAction = (workflowStatus: string | null, reviewerId?: string | null) => {
      switch (workflowStatus) {
        case 'draft':
        case 'revision_requested':
          return 'Submit for Supervisor Review';
        case 'submitted':
        case 'supervisor_review':
          return 'Supervisor Approval Required';
        case 'supervisor_approved':
          return reviewerId ? 'Reviewer Approval Required' : 'Assign Reviewer';
        case 'reviewer_assessment':
          return 'Reviewer Approval Required';
        case 'approved':
          return 'Ready for Final Completion';
        default:
          return 'Pending';
      }
    };

    const transformedPlans = listedPlans.map(plan => {
      const isOwner = Boolean(user.employees?.id) && plan.employeeId === user.employees?.id
      const isSupervisor = plan.supervisorId === user.id || plan.supervisorId === user.employees?.id
      const isReviewer = plan.reviewerId === user.id || plan.reviewerId === user.employees?.id
      const workflow = resolvedPlanWorkflow(plan)
      const canUserAct = (
        ((workflow === 'draft' || workflow === 'revision_requested') && (isOwner || canViewAll)) ||
        ((workflow === 'submitted' || workflow === 'supervisor_review') && (isSupervisor || (canViewAll && !isOwner))) ||
        ((workflow === 'supervisor_approved' || workflow === 'reviewer_assessment') && (isReviewer || (canViewAll && !isOwner))) ||
        (workflow === 'approved' && (isReviewer || isOwner || canViewAll))
      )

      return {
      id: plan.id,
      employeeId: plan.employees?.id || '',
      isOwn: isOwner,
      employeeName: `${plan.employees?.firstName || ''} ${plan.employees?.lastName || ''}`.trim(),
      email: plan.employees?.email || '',
      position: plan.employees?.position || '',
      department: plan.employees?.departments?.name || '',
      supervisor: plan.employees?.employees ? `${plan.employees.employees.firstName} ${plan.employees.employees.lastName}`.trim() : 'Not assigned',
      reviewer: plan.employees?.reviewer ? `${plan.employees.reviewer.firstName} ${plan.employees.reviewer.lastName}`.trim() : 'Not assigned',
      planYear: plan.planYear,
      planTitle: plan.planTitle || 'Annual Plan',
      planPeriod: plan.planPeriod,
      status: plan.status,
      workflowStatus: workflow,
      nextAction: getNextAction(workflow, plan.reviewerId),
      canUserAct,
      startDate: plan.startDate?.toISOString(),
      endDate: plan.endDate?.toISOString(),
      createdAt: plan.createdAt?.toISOString(),
      updatedAt: plan.updatedAt?.toISOString(),
      lastUpdated: plan.updatedAt?.toISOString(),
      progress: activityProgress(plan.performance_responsibilities),
      responsibilities: (plan.performance_responsibilities || []).map(({ performance_activities, ...responsibility }) => responsibility)
    }
    });

    return NextResponse.json({
      success: true,
      plans: transformedPlans,
      statistics,
      viewerEmployeeId: user.employees?.id || null,
      userRole: {
        isHR: canViewAll,
        isSupervisor: Boolean(user.employees?.is_supervisor) || canViewAll,
        isReviewer: Boolean(user.employees?.is_reviewer) || canViewAll,
        canCreatePlans: true,
        canApprovePlans: canViewAll || Boolean(user.employees?.is_supervisor),
        canReviewPlans: canViewAll || Boolean(user.employees?.is_reviewer),
        canSeeAllPlans: canViewAll,
        canAssignReviewers: canViewAll || Boolean(user.employees?.is_supervisor)
      }
    });

  } catch (error) {
    console.error('Error in performance plans API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
