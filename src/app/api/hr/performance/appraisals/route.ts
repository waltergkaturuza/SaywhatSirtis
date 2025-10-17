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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { employee, achievements, development, ratings, comments, recommendations, status, workflowStatus } = body;

    // Get employee database ID from email
    const employeeRecord = await prisma.employees.findUnique({
      where: { email: employee.email }
    });

    if (!employeeRecord) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Find or create performance plan for this employee
    let performancePlan = await prisma.performance_plans.findFirst({
      where: {
        employeeId: employeeRecord.id,
        planYear: new Date().getFullYear()
      }
    });

    if (!performancePlan) {
      // Create a default performance plan if none exists
      const crypto = require('crypto');
      performancePlan = await prisma.performance_plans.create({
        data: {
          id: crypto.randomUUID(),
          employeeId: employeeRecord.id,
          supervisorId: employeeRecord.supervisor_id || '',
          reviewerId: employeeRecord.reviewer_id,
          planYear: new Date().getFullYear(),
          planPeriod: `${new Date().getFullYear()} Annual`,
          planTitle: `Annual Plan ${new Date().getFullYear()}`,
          status: 'active',
          workflowStatus: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Get supervisor and reviewer IDs
    const supervisorUser = employeeRecord.supervisor_id 
      ? await prisma.users.findFirst({ where: { employeeId: employeeRecord.supervisor_id } })
      : null;
    
    const reviewerUser = employeeRecord.reviewer_id
      ? await prisma.users.findFirst({ where: { employeeId: employeeRecord.reviewer_id } })
      : null;

    // Create the appraisal
    const crypto = require('crypto');
    const appraisal = await prisma.performance_appraisals.create({
      data: {
        id: crypto.randomUUID(),
        planId: performancePlan.id,
        employeeId: employeeRecord.id,
        supervisorId: supervisorUser?.id || '',
        reviewerId: reviewerUser?.id,
        appraisalType: body.appraisalType || 'annual',
        status: status || 'draft',
        overallRating: ratings?.overall || 0,
        selfAssessments: achievements || {},
        supervisorAssessments: {},
        valueGoalsAssessments: development || {},
        comments: { ...comments, ratings: ratings || {}, recommendations: recommendations || {} },
        submittedAt: status === 'submitted' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      appraisal: {
        id: appraisal.id,
        employeeId: employeeRecord.employeeId,
        status: appraisal.status
      }
    });

  } catch (error) {
    console.error('Error creating performance appraisal:', error);
    return NextResponse.json(
      { error: 'Failed to create performance appraisal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

