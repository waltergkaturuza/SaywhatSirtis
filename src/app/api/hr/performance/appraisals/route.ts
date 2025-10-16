import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get all performance appraisals with employee and plan details
    const appraisals = await prisma.performance_appraisals.findMany({
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
        performance_plans: {
          select: {
            planYear: true,
            planPeriod: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform appraisals for frontend
    const transformedAppraisals = appraisals.map(appraisal => ({
      id: appraisal.id,
      employee: {
        id: appraisal.employees?.employeeId || '',
        name: `${appraisal.employees?.firstName || ''} ${appraisal.employees?.lastName || ''}`.trim(),
        email: appraisal.employees?.email || '',
        position: appraisal.employees?.position || '',
        department: appraisal.employees?.departments?.name || ''
      },
      supervisor: appraisal.employees?.employees ? {
        name: `${appraisal.employees.employees.firstName} ${appraisal.employees.employees.lastName}`.trim()
      } : null,
      planYear: appraisal.performance_plans?.planYear,
      planPeriod: appraisal.performance_plans?.planPeriod,
      appraisalType: appraisal.appraisalType,
      status: appraisal.status,
      overallRating: appraisal.overallRating,
      submittedAt: appraisal.submittedAt?.toISOString(),
      approvedAt: appraisal.approvedAt?.toISOString(),
      supervisorApprovedAt: appraisal.supervisorApprovedAt?.toISOString(),
      reviewerApprovedAt: appraisal.reviewerApprovedAt?.toISOString(),
      createdAt: appraisal.createdAt?.toISOString(),
      updatedAt: appraisal.updatedAt?.toISOString()
    }));

    // Calculate statistics
    const statistics = {
      total: appraisals.length,
      draft: appraisals.filter(a => a.status === 'draft').length,
      submitted: appraisals.filter(a => a.status === 'submitted').length,
      supervisorReview: appraisals.filter(a => a.status === 'supervisor_review').length,
      reviewerAssessment: appraisals.filter(a => a.status === 'reviewer_assessment').length,
      approved: appraisals.filter(a => a.status === 'approved').length,
      rejected: appraisals.filter(a => a.status === 'rejected').length,
      pending: appraisals.filter(a => ['submitted', 'supervisor_review', 'reviewer_assessment'].includes(a.status)).length
    };

    return NextResponse.json({
      success: true,
      appraisals: transformedAppraisals,
      statistics
    });

  } catch (error) {
    console.error('Error fetching performance appraisals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance appraisals' },
      { status: 500 }
    );
  }
}

