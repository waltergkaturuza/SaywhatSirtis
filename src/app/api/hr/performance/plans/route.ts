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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    // Build where clause
    const whereClause: any = {}
    
    if (year && year !== 'all') {
      whereClause.planYear = parseInt(year)
    }
    
    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Get all performance plans with employee and department details
    const plans = await prisma.performance_plans.findMany({
      where: whereClause,
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
            weight: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    const statistics = {
      total: plans.length,
      draft: plans.filter(p => p.status === 'draft').length,
      supervisorReview: plans.filter(p => p.workflowStatus === 'supervisor_review').length,
      supervisorApproved: plans.filter(p => p.workflowStatus === 'supervisor_approved').length,
      reviewerReview: plans.filter(p => p.workflowStatus === 'reviewer_assessment').length,
      reviewerApproved: plans.filter(p => p.workflowStatus === 'approved').length,
      completed: plans.filter(p => p.status === 'completed').length,
      pendingReview: plans.filter(p => ['submitted', 'supervisor_review', 'reviewer_assessment'].includes(p.workflowStatus || '')).length,
      approved: plans.filter(p => p.workflowStatus === 'approved').length
    };

    // Helper function to determine next action based on workflow status
    const getNextAction = (workflowStatus: string | null) => {
      switch (workflowStatus) {
        case 'draft':
          return 'Submit for Review';
        case 'submitted':
        case 'supervisor_review':
          return 'Supervisor Review Pending';
        case 'supervisor_approved':
        case 'reviewer_assessment':
          return 'Final Review Pending';
        case 'approved':
          return 'Approved';
        case 'revision_requested':
          return 'Revisions Required';
        default:
          return 'Pending';
      }
    };

    // Transform plans for frontend
    const transformedPlans = plans.map(plan => ({
      id: plan.id,
      employeeId: plan.employees?.id || '',
      employeeName: `${plan.employees?.firstName || ''} ${plan.employees?.lastName || ''}`.trim(),
      email: plan.employees?.email || '',
      position: plan.employees?.position || '',
      department: plan.employees?.departments?.name || '',
      supervisor: plan.employees?.employees ? `${plan.employees.employees.firstName} ${plan.employees.employees.lastName}`.trim() : 'Not assigned',
      reviewer: plan.employees?.reviewer ? `${plan.employees.reviewer.firstName} ${plan.employees.reviewer.lastName}`.trim() : 'Not assigned',
      planYear: plan.planYear,
      planTitle: plan.planTitle,
      planPeriod: plan.planPeriod,
      status: plan.status,
      workflowStatus: plan.workflowStatus,
      nextAction: getNextAction(plan.workflowStatus),
      canUserAct: false, // To be determined by frontend based on user role
      startDate: plan.startDate?.toISOString(),
      endDate: plan.endDate?.toISOString(),
      createdAt: plan.createdAt?.toISOString(),
      updatedAt: plan.updatedAt?.toISOString(),
      lastUpdated: plan.updatedAt?.toISOString(),
      responsibilities: plan.performance_responsibilities || []
    }));

    return NextResponse.json({
      success: true,
      plans: transformedPlans,
      statistics
    });

  } catch (error) {
    console.error('Error in performance plans API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
