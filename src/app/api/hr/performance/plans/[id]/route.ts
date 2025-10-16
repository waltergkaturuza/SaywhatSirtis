import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const plan = await prisma.performance_plans.findUnique({
      where: {
        id: id
      },
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
      }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Performance plan not found' }, { status: 404 });
    }

    // Transform the plan data to match the frontend structure
    const transformedPlan = {
      id: plan.id,
      employee: {
        id: plan.employees?.employeeId || '',
        name: `${plan.employees?.firstName || ''} ${plan.employees?.lastName || ''}`.trim(),
        email: plan.employees?.email || '',
        position: plan.employees?.position || '',
        department: plan.employees?.departments?.name || '',
        manager: plan.employees?.employees ? `${plan.employees.employees.firstName} ${plan.employees.employees.lastName}`.trim() : 'Not Assigned',
        planPeriod: {
          startDate: plan.startDate?.toISOString().split('T')[0] || '',
          endDate: plan.endDate?.toISOString().split('T')[0] || ''
        }
      },
      supervisor: plan.supervisorId || '',
      reviewerId: plan.reviewerId || '',
      planYear: plan.planYear,
      planTitle: plan.planTitle || 'Annual Plan',
      workflowStatus: plan.workflowStatus || 'draft',
      status: plan.status || 'draft',
      keyResponsibilities: plan.performance_responsibilities?.map(resp => ({
        id: resp.id,
        description: resp.description || '',
        tasks: '', // Not stored in performance_responsibilities
        weight: resp.weight || 0,
        targetDate: '',
        status: 'not-started' as const,
        progress: 0,
        successIndicators: [
          {
            id: '1',
            indicator: '',
            target: '',
            measurement: ''
          }
        ],
        comments: ''
      })) || [],
      coreValuesAcknowledgment: {},
      allCoreValuesAcknowledged: false,
      careerAspirationsShortTerm: '',
      careerApirationsLongTerm: '',
      trainingNeeds: '',
      trainingPriority: '',
      developmentActionPlan: '',
      developmentActionPlanTargetDate: '',
      developmentSupportNeeded: '',
      developmentObjectives: [{
        objective: '',
        description: '',
        competencyArea: '',
        developmentActivities: '',
        resources: '',
        timeline: '',
        successCriteria: '',
        targetDate: '',
        priority: 'medium',
        status: 'not-started'
      }],
      managerSupport: '',
      additionalComments: '',
      createdAt: plan.createdAt?.toISOString(),
      updatedAt: plan.updatedAt?.toISOString()
    };

    return NextResponse.json(transformedPlan);

  } catch (error) {
    console.error('Error fetching performance plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updatedPlan = await prisma.performance_plans.update({
      where: {
        id: id
      },
      data: {
        planTitle: body.planTitle,
        status: body.status,
        workflowStatus: body.workflowStatus,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan
    });

  } catch (error) {
    console.error('Error updating performance plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

