import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the appraisal with all related data
    const appraisal = await prisma.performance_appraisals.findUnique({
      where: { id },
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
        performance_plans: {
          select: {
            planYear: true,
            planPeriod: true
          }
        }
      }
    });

    if (!appraisal) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
    }

    // Check if user has permission to view this appraisal
    const userEmail = session.user.email;
    const isEmployee = appraisal.employees?.email === userEmail;
    const userRoles = session.user.roles || [];
    const isHR = userRoles.some(role => 
      ['HR', 'SUPERUSER', 'SYSTEM_ADMINISTRATOR'].includes(role)
    );

    if (!isEmployee && !isHR) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Transform the data for the frontend
    const transformedAppraisal = {
      id: appraisal.id,
      employee: {
        id: appraisal.employees?.employeeId || '',
        name: `${appraisal.employees?.firstName || ''} ${appraisal.employees?.lastName || ''}`.trim(),
        email: appraisal.employees?.email || '',
        position: appraisal.employees?.position || '',
        department: appraisal.employees?.departments?.name || '',
        manager: appraisal.employees?.employees 
          ? `${appraisal.employees.employees.firstName} ${appraisal.employees.employees.lastName}`.trim()
          : '',
        reviewer: appraisal.employees?.reviewer
          ? `${appraisal.employees.reviewer.firstName} ${appraisal.employees.reviewer.lastName}`.trim()
          : '',
        reviewPeriod: {
          startDate: '',
          endDate: ''
        }
      },
      performance: {
        overallRating: appraisal.overallRating || 0,
        categories: [],
        strengths: [],
        areasForImprovement: []
      },
      achievements: typeof appraisal.selfAssessments === 'object' && appraisal.selfAssessments !== null
        ? (appraisal.selfAssessments as any)
        : { keyResponsibilities: [] },
      development: typeof appraisal.valueGoalsAssessments === 'object' && appraisal.valueGoalsAssessments !== null
        ? (appraisal.valueGoalsAssessments as any)
        : { trainingNeeds: [], careerAspirations: '', skillsToImprove: [], developmentPlan: [] },
      comments: typeof appraisal.comments === 'object' && appraisal.comments !== null
        ? (appraisal.comments as any)
        : { employeeComments: '', managerComments: '', hrComments: '' },
      ratings: {
        finalRating: appraisal.overallRating || 0,
        actualPoints: 0,
        maxPoints: 0,
        percentage: 0,
        ratingCode: '',
        recommendation: 'maintain-current',
        salaryRecommendation: ''
      },
      status: appraisal.status,
      submittedAt: appraisal.submittedAt?.toISOString(),
      approvedAt: appraisal.approvedAt?.toISOString(),
      createdAt: appraisal.createdAt?.toISOString()
    };

    return NextResponse.json({
      success: true,
      appraisal: transformedAppraisal
    });

  } catch (error) {
    console.error('Error fetching appraisal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appraisal' },
      { status: 500 }
    );
  }
}
