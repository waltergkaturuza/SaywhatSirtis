import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validatePerformanceAppraisal, formatValidationErrors } from '@/lib/validations/performance-validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user and check permissions
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: {
        employees: {
          select: {
            id: true,
            is_supervisor: true,
            is_reviewer: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can view all appraisals (HR staff)
    const canViewAll = ['ADMIN', 'HR_MANAGER', 'HR'].includes(user.role || '');

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    // Build where clause - filter by supervisor/reviewer if not HR
    // Note: supervisorId and reviewerId in appraisals are user IDs, not employee IDs
    const whereClause: any = {};
    
    if (!canViewAll) {
      // Get the current user's employee record to check if they supervise/review anyone
      const userEmployee = user.employees;
      
      // Build OR clause for supervisor/reviewer filtering
      // supervisorId and reviewerId in performance_appraisals are user IDs
      const permissionFilter: any[] = [
        { supervisorId: user.id },
        { reviewerId: user.id }
      ]
      
      // Also check if user is a supervisor/reviewer via employee relationships
      // This handles cases where appraisals might have been created with employee IDs
      if (userEmployee) {
        // Get employees supervised by this user's employee record
        const supervisedEmployeeIds = await prisma.employees.findMany({
          where: { supervisor_id: userEmployee.id },
          select: { id: true }
        }).then(emps => emps.map(e => e.id));
        
        // Get employees reviewed by this user's employee record
        const reviewedEmployeeIds = await prisma.employees.findMany({
          where: { reviewer_id: userEmployee.id },
          select: { id: true }
        }).then(emps => emps.map(e => e.id));
        
        // If user supervises/reviews employees, also filter by those employee IDs
        if (supervisedEmployeeIds.length > 0 || reviewedEmployeeIds.length > 0) {
          const employeeIdFilter: any[] = [];
          if (supervisedEmployeeIds.length > 0) {
            employeeIdFilter.push({ employeeId: { in: supervisedEmployeeIds } });
          }
          if (reviewedEmployeeIds.length > 0) {
            employeeIdFilter.push({ employeeId: { in: reviewedEmployeeIds } });
          }
          if (employeeIdFilter.length > 0) {
            permissionFilter.push(...employeeIdFilter);
          }
        }
      }
      
      // If employeeId is provided, add it to the filter
      if (employeeId) {
        // Filter by employeeId AND ensure user is supervisor/reviewer
        whereClause.AND = [
          { employeeId: employeeId },
          { OR: permissionFilter }
        ]
      } else {
        whereClause.OR = permissionFilter
      }
    } else if (employeeId) {
      // HR can filter by employeeId directly
      whereClause.employeeId = employeeId
    }

    console.log('🔍 GET /api/hr/performance/appraisals');
    console.log('   User:', session.user.email);
    console.log('   User ID:', session.user.id);
    console.log('   User Role:', user.role);
    console.log('   Can View All:', canViewAll);
    console.log('   Where Clause:', JSON.stringify(whereClause, null, 2));
    console.log('   EmployeeId filter:', employeeId);

    // Get all performance appraisals with employee and plan details
    const appraisals = await prisma.performance_appraisals.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : {},
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('   Found appraisals:', appraisals.length);
    if (appraisals.length > 0) {
      console.log('   First appraisal:', {
        id: appraisals[0].id,
        employeeId: appraisals[0].employeeId,
        status: appraisals[0].status,
        supervisorId: appraisals[0].supervisorId,
        reviewerId: appraisals[0].reviewerId
      });
    }

    // Helper function to determine next action based on status
    const getNextAction = (status: string, supervisorApprovedAt: Date | null, reviewerApprovedAt: Date | null) => {
      switch (status) {
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
      reviewer: appraisal.employees?.reviewer 
        ? `${appraisal.employees.reviewer.firstName} ${appraisal.employees.reviewer.lastName}`.trim()
        : 'Not assigned',
      period: appraisal.performance_plans?.planPeriod || `${appraisal.performance_plans?.planYear || new Date().getFullYear()}`,
      status: appraisal.status,
      overallRating: appraisal.overallRating || 0,
      planProgress: 0, // TODO: Calculate from performance plan
      nextAction: getNextAction(appraisal.status, appraisal.supervisorApprovedAt, appraisal.reviewerApprovedAt),
      canUserAct: false, // To be determined by frontend based on user role
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
    const { id, employee, achievements, development, ratings, comments, recommendations, status, workflowStatus } = body;

    // If ID is provided, update existing appraisal
    if (id) {
      try {
        const existingAppraisal = await prisma.performance_appraisals.findUnique({
          where: { id: id },
          include: {
            employees: true
          }
        });

        if (!existingAppraisal) {
          return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
        }

        // Get employee database ID
        const employeeRecord = await prisma.employees.findUnique({
          where: { email: employee?.email || existingAppraisal.employees?.email },
          include: {
            employees: true,
            reviewer: true
          }
        });

        if (!employeeRecord) {
          return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Combine comments, ratings, and recommendations first (needed for validation)
        const combinedComments = comments || {};
        if (ratings) {
          combinedComments.ratings = ratings;
        }
        if (recommendations) {
          combinedComments.recommendations = recommendations;
        }

        // Validate appraisal data if submitting (not draft)
        if (status === 'submitted' && existingAppraisal.status !== 'submitted') {
          // Parse existing data for validation
          let existingAchievements: any = {};
          if (existingAppraisal.selfAssessments) {
            if (typeof existingAppraisal.selfAssessments === 'string') {
              try {
                existingAchievements = JSON.parse(existingAppraisal.selfAssessments);
              } catch {
                existingAchievements = {};
              }
            } else {
              existingAchievements = existingAppraisal.selfAssessments;
            }
          }

          let existingDevelopment: any = {};
          if (existingAppraisal.valueGoalsAssessments) {
            if (typeof existingAppraisal.valueGoalsAssessments === 'string') {
              try {
                existingDevelopment = JSON.parse(existingAppraisal.valueGoalsAssessments);
              } catch {
                existingDevelopment = {};
              }
            } else {
              existingDevelopment = existingAppraisal.valueGoalsAssessments;
            }
          }

          // Get plan data for review period
          const plan = await prisma.performance_plans.findUnique({
            where: { id: existingAppraisal.planId },
            select: { startDate: true, endDate: true, reviewStartDate: true, reviewEndDate: true }
          });

          // Build full appraisal data object for validation
          const fullAppraisalData = {
            id: existingAppraisal.id,
            employee: {
              id: employeeRecord.employeeId || employeeRecord.id,
              email: employeeRecord.email || employee?.email || '',
              reviewPeriod: {
                startDate: plan?.reviewStartDate?.toISOString().split('T')[0] || plan?.startDate?.toISOString().split('T')[0] || '',
                endDate: plan?.reviewEndDate?.toISOString().split('T')[0] || plan?.endDate?.toISOString().split('T')[0] || ''
              }
            },
            achievements: achievements || existingAchievements,
            performance: {
              categories: ratings?.categories || [],
              overallRating: ratings?.overall !== undefined ? ratings.overall : (existingAppraisal.overallRating || 0)
            },
            development: development || existingDevelopment,
            comments: combinedComments,
            ratings: ratings || {}
          };
          
          const validation = validatePerformanceAppraisal(fullAppraisalData);
          if (!validation.isValid) {
            return NextResponse.json({
              success: false,
              error: 'Validation failed',
              errors: validation.errors,
              message: formatValidationErrors(validation.errors)
            }, { status: 400 });
          }
        }

        // Prepare update data - ensure all fields are properly saved
        const updateData: any = {
          status: status || existingAppraisal.status,
          updatedAt: new Date()
        };

        // Update overall rating if provided
        if (ratings?.overall !== undefined) {
          updateData.overallRating = ratings.overall;
        }

        // Update assessments if provided
        if (achievements !== undefined) {
          updateData.selfAssessments = typeof achievements === 'string' 
            ? achievements 
            : (achievements !== null ? JSON.stringify(achievements) : existingAppraisal.selfAssessments || {});
        }

        // Preserve supervisor assessments if they exist
        if (existingAppraisal.supervisorAssessments) {
          updateData.supervisorAssessments = existingAppraisal.supervisorAssessments;
        }

        if (development !== undefined) {
          updateData.valueGoalsAssessments = typeof development === 'string'
            ? development
            : (development !== null ? JSON.stringify(development) : existingAppraisal.valueGoalsAssessments || {});
        }

        updateData.comments = typeof combinedComments === 'string'
          ? combinedComments
          : (Object.keys(combinedComments).length > 0 ? JSON.stringify(combinedComments) : (existingAppraisal.comments || {}));

        // Set submittedAt if status is submitted
        if (status === 'submitted' && !existingAppraisal.submittedAt) {
          updateData.submittedAt = new Date();
        }

        console.log('Updating existing appraisal with ID:', id);
        console.log('Update data keys:', Object.keys(updateData));

        const updatedAppraisal = await prisma.performance_appraisals.update({
          where: { id: id },
          data: updateData
        });

        return NextResponse.json({
          success: true,
          appraisal: {
            id: updatedAppraisal.id,
            employeeId: employeeRecord.employeeId || employeeRecord.id,
            status: updatedAppraisal.status
          }
        });
      } catch (error) {
        console.error('Error updating appraisal:', error);
        return NextResponse.json(
          { 
            error: 'Failed to update appraisal', 
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

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
    // supervisor_id is an employee ID, so we need to get the employee first, then their userId
    let supervisorUser = null;
    if (employeeRecord.supervisor_id) {
      const supervisorEmployee = await prisma.employees.findUnique({
        where: { id: employeeRecord.supervisor_id },
        select: { userId: true }
      });
      if (supervisorEmployee?.userId) {
        supervisorUser = await prisma.users.findUnique({
          where: { id: supervisorEmployee.userId }
        });
      }
    }

    if (!supervisorUser) {
      return NextResponse.json(
        { error: 'Employee must have a supervisor with a user account to create an appraisal' },
        { status: 400 }
      );
    }

    // Get reviewer user account if assigned
    // reviewer_id is an employee ID, so we need to get the employee first, then their userId
    let reviewerUser = null;
    if (employeeRecord.reviewer_id) {
      const reviewerEmployee = await prisma.employees.findUnique({
        where: { id: employeeRecord.reviewer_id },
        select: { userId: true }
      });
      if (reviewerEmployee?.userId) {
        reviewerUser = await prisma.users.findUnique({
          where: { id: reviewerEmployee.userId }
        });
      }
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

    // Check for existing draft appraisal for this employee, plan, and type
    const appraisalType = body.appraisalType || 'annual';
    const existingDraft = await prisma.performance_appraisals.findFirst({
      where: {
        employeeId: employeeRecord.id,
        planId: performancePlan.id,
        appraisalType: appraisalType,
        status: 'draft'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // If draft exists, update it instead of creating a new one
    let appraisal;
    const crypto = require('crypto');
    
    if (existingDraft) {
      console.log('Found existing draft appraisal, updating:', existingDraft.id);
      console.log('Update data:', { status, hasAchievements: !!achievements, hasDevelopment: !!development, hasComments: !!comments, hasRatings: !!ratings });
      
      // Prepare update data - ensure all fields are properly saved
      const updateData: any = {
        status: status || 'draft',
        updatedAt: new Date()
      };
      
      // Always update these fields if provided, otherwise keep existing
      if (ratings?.overall !== undefined) {
        updateData.overallRating = ratings.overall;
      } else if (existingDraft.overallRating !== null) {
        updateData.overallRating = existingDraft.overallRating;
      }
      
      // Save assessments - handle both object and already-stringified JSON
      if (achievements !== undefined) {
        updateData.selfAssessments = typeof achievements === 'string' 
          ? achievements 
          : (achievements !== null ? JSON.stringify(achievements) : {});
      } else {
        updateData.selfAssessments = existingDraft.selfAssessments || {};
      }
      
      // Preserve supervisor assessments if they exist
      if (existingDraft.supervisorAssessments) {
        updateData.supervisorAssessments = existingDraft.supervisorAssessments;
      }
      
      if (development !== undefined) {
        updateData.valueGoalsAssessments = typeof development === 'string'
          ? development
          : (development !== null ? JSON.stringify(development) : {});
      } else {
        updateData.valueGoalsAssessments = existingDraft.valueGoalsAssessments || {};
      }
      
      // Combine comments, ratings, and recommendations
      const combinedComments = comments || {};
      if (ratings) {
        combinedComments.ratings = ratings;
      }
      if (recommendations) {
        combinedComments.recommendations = recommendations;
      }
      updateData.comments = typeof combinedComments === 'string'
        ? combinedComments
        : (Object.keys(combinedComments).length > 0 ? JSON.stringify(combinedComments) : (existingDraft.comments || {}));
      
      // Set submittedAt if status is submitted
      if (status === 'submitted') {
        updateData.submittedAt = new Date();
      } else {
        updateData.submittedAt = existingDraft.submittedAt;
      }
      
      console.log('Updating appraisal with data:', { ...updateData, selfAssessments: '[data]', valueGoalsAssessments: '[data]', comments: '[data]' });
      
      appraisal = await prisma.performance_appraisals.update({
        where: { id: existingDraft.id },
        data: updateData
      });
    } else {
      // Validate appraisal data if submitting (not draft)
      if (status === 'submitted') {
        const fullAppraisalData = {
          employee: {
            id: employeeRecord.employeeId || employeeRecord.id,
            email: employeeRecord.email || employee?.email || '',
            reviewPeriod: employee?.reviewPeriod || {
              startDate: performancePlan.startDate?.toISOString().split('T')[0] || '',
              endDate: performancePlan.endDate?.toISOString().split('T')[0] || ''
            }
          },
          achievements: achievements || {},
          performance: {
            categories: ratings?.categories || [],
            overallRating: ratings?.overall || 0
          },
          development: development || {},
          comments: comments || {},
          ratings: ratings || {}
        };
        
        const validation = validatePerformanceAppraisal(fullAppraisalData);
        if (!validation.isValid) {
          return NextResponse.json({
            success: false,
            error: 'Validation failed',
            errors: validation.errors,
            message: formatValidationErrors(validation.errors)
          }, { status: 400 });
        }
      }

      // Check if there's a submitted appraisal for the same period
      const existingSubmitted = await prisma.performance_appraisals.findFirst({
        where: {
          employeeId: employeeRecord.id,
          planId: performancePlan.id,
          appraisalType: appraisalType,
          status: { in: ['submitted', 'approved', 'supervisor_approved', 'reviewer_approved'] }
        }
      });

      if (existingSubmitted) {
        return NextResponse.json({
          success: false,
          error: 'An appraisal for this period already exists and has been submitted. Please edit the existing appraisal instead.',
          existingAppraisalId: existingSubmitted.id
        }, { status: 400 });
      }

      console.log('Creating new appraisal with data:', {
        employeeId: employeeRecord.id,
        supervisorId: supervisorUser.id,
        reviewerId: reviewerUser?.id,
        planId: performancePlan.id
      });

      // Prepare JSON fields - ensure they are properly stringified
      const selfAssessmentsData = achievements 
        ? (typeof achievements === 'string' ? achievements : JSON.stringify(achievements))
        : '{}';
      const valueGoalsAssessmentsData = development
        ? (typeof development === 'string' ? development : JSON.stringify(development))
        : '{}';
      const commentsData = comments || ratings || recommendations
        ? JSON.stringify({ 
            ...(typeof comments === 'object' ? comments : {}), 
            ratings: ratings || {}, 
            recommendations: recommendations || {} 
          })
        : '{}';

      appraisal = await prisma.performance_appraisals.create({
        data: {
          id: crypto.randomUUID(),
          planId: performancePlan.id,
          employeeId: employeeRecord.id,
          supervisorId: supervisorUser.id,
          reviewerId: reviewerUser?.id || null,
          appraisalType: appraisalType,
          status: status || 'draft',
          overallRating: ratings?.overall || 0,
          selfAssessments: selfAssessmentsData,
          supervisorAssessments: '{}',
          valueGoalsAssessments: valueGoalsAssessmentsData,
          comments: commentsData,
          submittedAt: status === 'submitted' ? new Date() : null,
          updatedAt: new Date()
        }
      });
    }

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

