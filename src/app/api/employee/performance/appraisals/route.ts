import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

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
    const employee = await prisma.users.findUnique({
      where: { email: session.user.email }
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
    const performancePlan = await prisma.performance_plans.findFirst({
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
    const appraisal = await prisma.performance_appraisals.create({
      data: {
        id: randomUUID(),
        employeeId: employee.id,
        planId: planId,
        supervisorId: reviewerId || employee.supervisorId,
        appraisalType: appraisalType, // annual, quarterly, probation
        status: 'draft',
        selfAssessments: selfAssessments || {},
        valueGoalsAssessments: valueGoalsAssessments || {},
        electronicSignature: electronicSignature,
        updatedAt: new Date()
      }
    });

    // Return the created appraisal
    return NextResponse.json({
      success: true,
      appraisal: {
        id: appraisal.id,
        employeeId: appraisal.employeeId,
        planId: appraisal.planId,
        supervisorId: appraisal.supervisorId,
        appraisalType: appraisal.appraisalType,
        status: appraisal.status,
        createdAt: appraisal.createdAt
      }
    });

    // TODO: Add calculation logic for performance metrics
    // This would be implemented when the detailed assessment structure is added

    // Create audit trail
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        userId: employee!.id,
        action: 'CREATE',
        details: `Created performance appraisal for ${appraisalType}`,
        resource: 'PerformanceAppraisal',
        resourceId: appraisal.id,
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
    const employee = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Fetch appraisals where employee is the subject, supervisor, or reviewer
    const appraisals = await prisma.performance_appraisals.findMany({
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
        performancePlan: {
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
