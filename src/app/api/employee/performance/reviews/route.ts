import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get employee record
    const employee = await prisma.employees.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        employees: {
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

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get performance appraisals (which serve as reviews)
    const appraisals = await prisma.performance_appraisals.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        appraisalType: true,
        status: true,
        overallRating: true,
        createdAt: true,
        updatedAt: true,
        submittedAt: true,
        approvedAt: true,
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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

    // Transform appraisals to match the expected review format
    const reviews = appraisals.map((appraisal) => {
      // Map our status to the frontend's expected status
      let mappedStatus: 'draft' | 'self_assessment' | 'manager_review' | 'hr_review' | 'completed' = 'draft';
      
      switch (appraisal.status) {
        case 'draft':
          mappedStatus = 'draft';
          break;
        case 'submitted':
          mappedStatus = 'self_assessment';
          break;
        case 'supervisor_review':
          mappedStatus = 'manager_review';
          break;
        case 'reviewer_assessment':
          mappedStatus = 'hr_review';
          break;
        case 'approved':
          mappedStatus = 'completed';
          break;
        default:
          mappedStatus = 'draft';
      }

      // Determine review type based on appraisal type or default to annual
      const appraisalType = appraisal.appraisalType?.toLowerCase() || '';
      let type: 'annual' | 'mid_year' | 'probation' | 'quarterly' = 'annual';
      
      if (appraisalType.includes('mid') || appraisalType.includes('6')) {
        type = 'mid_year';
      } else if (appraisalType.includes('probation')) {
        type = 'probation';
      } else if (appraisalType.includes('quarter') || appraisalType.includes('q1') || appraisalType.includes('q2') || appraisalType.includes('q3') || appraisalType.includes('q4')) {
        type = 'quarterly';
      }

      return {
        id: appraisal.id,
        reviewPeriod: appraisal.performance_plans?.planPeriod || `Year ${appraisal.performance_plans?.planYear || new Date().getFullYear()}`,
        startDate: appraisal.createdAt?.toISOString() || new Date().toISOString(),
        endDate: appraisal.approvedAt?.toISOString() || new Date().toISOString(),
        status: mappedStatus,
        type,
        overallRating: appraisal.overallRating || undefined,
        supervisor: employee.employees ? {
          name: `${employee.employees.firstName} ${employee.employees.lastName}`,
          email: employee.employees.email
        } : undefined,
        hrReviewer: employee.reviewer ? {
          name: `${employee.reviewer.firstName} ${employee.reviewer.lastName}`,
          email: employee.reviewer.email
        } : undefined,
        goals: [], // Goals will be loaded separately when viewing the review detail
        feedback: [] // Feedback will be loaded separately when viewing the review detail
      };
    });

    return NextResponse.json(reviews);

  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance reviews' },
      { status: 500 }
    );
  }
}

