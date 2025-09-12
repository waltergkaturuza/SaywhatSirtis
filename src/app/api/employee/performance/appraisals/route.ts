import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Performance Appraisal Creation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Find employee by email
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email },
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    const body = await request.json();
    const { 
      planId, 
      reviewerId, 
      appraisalType, 
      selfAssessments, 
      valueGoalsAssessments,
      electronicSignature 
    } = body;

    // Get performance plan with key responsibilities
    const performancePlan = await prisma.performancePlan.findFirst({
      where: { 
        id: planId,
        employeeId: employee.id 
      },
      include: {
        keyResponsibilities: {
          include: {
            activities: true
          }
        }
      }
    });

    if (!performancePlan) {
      return NextResponse.json(
        { error: 'Performance plan not found' }, 
        { status: 404 }
      );
    }

    // Standard Values for all employees
    const standardValues = [
      'Teamwork',
      'Responsiveness and effectiveness',
      'Accountability',
      'Professionalism and Integrity',
      'Innovation'
    ];

    // Create performance appraisal
    const appraisal = await prisma.performanceAppraisal.create({
      data: {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        planId: planId,
        reviewerId: reviewerId,
        supervisorId: employee.supervisor?.id,
        type: appraisalType, // annual, quarterly, probation
        status: 'self_assessment',
        
        // Key Responsibilities Assessment
        responsibilityAssessments: {
          create: performancePlan.keyResponsibilities.map((resp, index) => ({
            responsibilityId: resp.id,
            title: resp.title,
            weight: resp.weight,
            successIndicators: resp.activities.map(a => a.successIndicators).join(', '),
            selfComment: selfAssessments?.[index]?.comment || '',
            selfRating: selfAssessments?.[index]?.rating || 'B2',
            selfPoints: getSelfRatingPoints(selfAssessments?.[index]?.rating || 'B2'),
            supervisorComment: '',
            supervisorRating: null,
            supervisorPoints: 0
          }))
        },

        // Value Goals Assessment
        valueAssessments: {
          create: standardValues.map((value, index) => ({
            valueName: value,
            selfComment: valueGoalsAssessments?.[index]?.comment || '',
            selfRating: valueGoalsAssessments?.[index]?.rating || 'B2',
            selfPoints: getSelfRatingPoints(valueGoalsAssessments?.[index]?.rating || 'B2'),
            supervisorComment: '',
            supervisorRating: null,
            supervisorPoints: 0,
            reviewerComment: '',
            reviewerRating: null,
            reviewerPoints: 0
          }))
        },

        // Electronic Signature
        employeeSignature: electronicSignature,
        employeeSignatureDate: new Date()
      },
      include: {
        responsibilityAssessments: true,
        valueAssessments: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true
          }
        },
        supervisor: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Calculate totals
    const totalResponsibilityPoints = appraisal.responsibilityAssessments
      .reduce((sum, assessment) => sum + assessment.selfPoints, 0);
    
    const totalValuePoints = appraisal.valueAssessments
      .reduce((sum, assessment) => sum + assessment.selfPoints, 0);

    const maxPossiblePoints = (appraisal.responsibilityAssessments.length + appraisal.valueAssessments.length) * 50;
    const overallPercentage = ((totalResponsibilityPoints + totalValuePoints) / maxPossiblePoints) * 100;

    // Update appraisal with calculations
    await prisma.performanceAppraisal.update({
      where: { id: appraisal.id },
      data: {
        selfTotalResponsibilityPoints: totalResponsibilityPoints,
        selfTotalValuePoints: totalValuePoints,
        selfOverallPercentage: overallPercentage
      }
    });

    // Create audit trail
    await prisma.auditLog.create({
      data: {
        userId: employee.id,
        action: 'CREATE',
        resource: 'PerformanceAppraisal',
        resourceId: appraisal.id,
        details: {
          module: 'Performance Appraisal',
          appraisalType: appraisalType,
          stage: 'self_assessment',
          changes: appraisal
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json(appraisal);

  } catch (error) {
    console.error('Error creating performance appraisal:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Helper function to get points based on rating
function getSelfRatingPoints(rating: string): number {
  const ratingPoints: { [key: string]: number } = {
    'A1': 50, // Outstanding performance. High levels of expertise
    'A2': 40, // Consistently exceeds requirements
    'B1': 30, // Meets requirements. Occasionally exceeds them
    'B2': 25, // Meets requirements
    'C1': 15, // Partially meets requirements. Improvement required
    'C2': 10  // Unacceptable. Well below standard required
  };
  return ratingPoints[rating] || 25;
}

// GET: Fetch performance appraisals
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Find employee by email
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Fetch appraisals where employee is the subject, supervisor, or reviewer
    const appraisals = await prisma.performanceAppraisal.findMany({
      where: {
        OR: [
          { employeeId: employee.id },
          { supervisorId: employee.id },
          { reviewerId: employee.id }
        ]
      },
      include: {
        responsibilityAssessments: true,
        valueAssessments: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true
          }
        },
        supervisor: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        plan: {
          select: {
            planYear: true,
            keyResponsibilities: {
              include: {
                activities: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(appraisals);

  } catch (error) {
    console.error('Error fetching performance appraisals:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
