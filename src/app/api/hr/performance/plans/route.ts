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

    // Get all performance plans with employee and department details
    const plans = await prisma.performance_plans.findMany({
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

    // Transform plans for frontend
    const transformedPlans = plans.map(plan => ({
      id: plan.id,
      employee: {
        id: plan.employees?.employeeId || '',
        name: `${plan.employees?.firstName || ''} ${plan.employees?.lastName || ''}`.trim(),
        email: plan.employees?.email || '',
        position: plan.employees?.position || '',
        department: plan.employees?.departments?.name || ''
      },
      supervisor: plan.employees?.employees ? {
        name: `${plan.employees.employees.firstName} ${plan.employees.employees.lastName}`.trim()
      } : null,
      planYear: plan.planYear,
      planTitle: plan.planTitle,
      status: plan.status,
      workflowStatus: plan.workflowStatus,
      startDate: plan.startDate?.toISOString(),
      endDate: plan.endDate?.toISOString(),
      createdAt: plan.createdAt?.toISOString(),
      updatedAt: plan.updatedAt?.toISOString(),
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
