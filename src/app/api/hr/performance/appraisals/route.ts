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
      employeeId: appraisal.employeeId,
      employeeName: `${appraisal.employees?.firstName || ''} ${appraisal.employees?.lastName || ''}`.trim(),
      position: appraisal.employees?.position || '',
      department: appraisal.employees?.departments?.name || '',
      supervisor: appraisal.employees?.employees 
        ? `${appraisal.employees.employees.firstName} ${appraisal.employees.employees.lastName}`.trim()
        : 'Not assigned',
      period: appraisal.performance_plans?.planPeriod || `${appraisal.performance_plans?.planYear || new Date().getFullYear()}`,
      status: appraisal.status,
      overallRating: appraisal.overallRating || 0,
      planProgress: 0, // TODO: Calculate from performance plan
      lastUpdated: appraisal.updatedAt?.toISOString() || appraisal.createdAt?.toISOString(),
      planYear: appraisal.performance_plans?.planYear,
      planPeriod: appraisal.performance_plans?.planPeriod,
      appraisalType: appraisal.appraisalType,
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

    // Get employee database ID from email with supervisor and reviewer relations
    const employeeRecord = await prisma.employees.findUnique({
      where: { email: employee.email },
      include: {
        employees: true, // supervisor relation
        reviewer: true   // reviewer relation
      }
    });

    if (!employeeRecord) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get supervisor user account - required for appraisals
    const supervisorUser = employeeRecord.supervisor_id 
      ? await prisma.users.findFirst({ where: { employeeId: employeeRecord.supervisor_id } })
      : null;

    if (!supervisorUser) {
      return NextResponse.json(
        { error: 'Employee must have a supervisor with a user account to create an appraisal' },
        { status: 400 }
      );
    }

    // Get reviewer user account if assigned
    const reviewerUser = employeeRecord.reviewer_id
      ? await prisma.users.findFirst({ where: { employeeId: employeeRecord.reviewer_id } })
      : null;

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
      
      // For performance plan, supervisor is required as String (not nullable)
      if (!supervisorUser) {
        return NextResponse.json(
          { error: 'Cannot create performance plan without a supervisor' },
          { status: 400 }
        );
      }

      performancePlan = await prisma.performance_plans.create({
        data: {
          id: crypto.randomUUID(),
          employeeId: employeeRecord.id,
          supervisorId: supervisorUser.id,
          reviewerId: reviewerUser?.id || null,
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

    // Create the appraisal
    const crypto = require('crypto');
    
    console.log('Creating appraisal with data:', {
      employeeId: employeeRecord.id,
      supervisorId: supervisorUser.id,
      reviewerId: reviewerUser?.id,
      planId: performancePlan.id
    });

    const appraisal = await prisma.performance_appraisals.create({
      data: {
        id: crypto.randomUUID(),
        planId: performancePlan.id,
        employeeId: employeeRecord.id,
        supervisorId: supervisorUser.id,
        reviewerId: reviewerUser?.id || null,
        appraisalType: body.appraisalType || 'annual',
        status: status || 'draft',
        overallRating: ratings?.overall || 0,
        selfAssessments: achievements || {},
        supervisorAssessments: {},
        valueGoalsAssessments: development || {},
        comments: { ...comments, ratings: ratings || {}, recommendations: recommendations || {} },
        submittedAt: status === 'submitted' ? new Date() : null,
        updatedAt: new Date()
      }
    });

    console.log('Appraisal created successfully:', appraisal.id);

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
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to create performance appraisal', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

