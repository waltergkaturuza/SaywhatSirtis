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
    console.log('🔍 GET /api/hr/performance/appraisals/[id]');
    console.log('   Appraisal ID:', id);
    console.log('   User:', session.user.email);
    console.log('   Roles:', session.user.roles);

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
            planPeriod: true,
            reviewStartDate: true,
            reviewEndDate: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!appraisal) {
      console.log('❌ Appraisal not found in database');
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
    }

    console.log('✅ Appraisal found');
    console.log('   Employee:', appraisal.employees?.firstName, appraisal.employees?.lastName);
    console.log('   Employee Email:', appraisal.employees?.email);

    // Check if user has permission to view this appraisal
    const userEmail = session.user.email;
    const userId = session.user.id;
    
    // Get user record to check supervisor/reviewer status
    const user = await prisma.users.findUnique({
      where: { id: userId },
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

    // Check if user is the employee themselves
    const userEmployee = user?.employees;
    const isEmployee = appraisal.employees?.email === userEmail || 
                      (userEmployee && appraisal.employeeId === userEmployee.id);
    
    const userRoles = session.user.roles || [];
    const isHR = userRoles.some(role => 
      ['HR', 'SUPERUSER', 'SYSTEM_ADMINISTRATOR', 'ADMIN', 'HR_MANAGER'].includes(role)
    );
    
    // Check if user is the supervisor or reviewer of this appraisal
    const isSupervisor = appraisal.supervisorId === userId;
    const isReviewer = appraisal.reviewerId === userId;

    console.log('   Is Employee?', isEmployee);
    console.log('   Is HR?', isHR);
    console.log('   Is Supervisor?', isSupervisor);
    console.log('   Is Reviewer?', isReviewer);
    console.log('   Appraisal employeeId:', appraisal.employeeId);
    console.log('   User employee id:', userEmployee?.id);

    if (!isEmployee && !isHR && !isSupervisor && !isReviewer) {
      console.log('❌ Permission denied');
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    console.log('✅ Permission granted, returning appraisal data');

    // Transform the data for the frontend
    const transformedAppraisal = {
      id: appraisal.id,
      supervisorId: appraisal.supervisorId || null,
      reviewerId: appraisal.reviewerId || null,
      employeeId: appraisal.employeeId || '',
      employee: {
        id: appraisal.employees?.employeeId || appraisal.employeeId || '',
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
          startDate: (appraisal.performance_plans?.reviewStartDate || appraisal.performance_plans?.startDate || undefined)?.toISOString().split('T')[0] || '',
          endDate: (appraisal.performance_plans?.reviewEndDate || appraisal.performance_plans?.endDate || undefined)?.toISOString().split('T')[0] || ''
        }
      },
      performance: {
        overallRating: appraisal.overallRating || 0,
        categories: [],
        strengths: [],
        areasForImprovement: []
      },
      achievements: (() => {
        if (!appraisal.selfAssessments) return { keyResponsibilities: [] };
        if (typeof appraisal.selfAssessments === 'object' && appraisal.selfAssessments !== null) {
          return appraisal.selfAssessments as any;
        }
        if (typeof appraisal.selfAssessments === 'string') {
          try {
            return JSON.parse(appraisal.selfAssessments);
          } catch {
            return { keyResponsibilities: [] };
          }
        }
        return { keyResponsibilities: [] };
      })(),
      development: (() => {
        if (!appraisal.valueGoalsAssessments) return { trainingNeeds: [], careerAspirations: '', skillsToImprove: [], developmentPlan: [] };
        if (typeof appraisal.valueGoalsAssessments === 'object' && appraisal.valueGoalsAssessments !== null) {
          return appraisal.valueGoalsAssessments as any;
        }
        if (typeof appraisal.valueGoalsAssessments === 'string') {
          try {
            return JSON.parse(appraisal.valueGoalsAssessments);
          } catch {
            return { trainingNeeds: [], careerAspirations: '', skillsToImprove: [], developmentPlan: [] };
          }
        }
        return { trainingNeeds: [], careerAspirations: '', skillsToImprove: [], developmentPlan: [] };
      })(),
      comments: (() => {
        if (!appraisal.comments) return { employeeComments: '', managerComments: '', hrComments: '', supervisor: [], reviewer: [] };
        
        let parsed: any;
        if (typeof appraisal.comments === 'object' && appraisal.comments !== null) {
          parsed = appraisal.comments;
        } else if (typeof appraisal.comments === 'string') {
          try {
            parsed = JSON.parse(appraisal.comments);
          } catch {
            return { employeeComments: '', managerComments: '', hrComments: '', supervisor: [], reviewer: [] };
          }
        } else {
          return { employeeComments: '', managerComments: '', hrComments: '', supervisor: [], reviewer: [] };
        }
        
        // Handle both structures: workflow comments (arrays) and form comments (strings)
        const comments: any = {
          employeeComments: parsed.employeeComments || '',
          managerComments: parsed.managerComments || parsed.supervisorComments || '',
          hrComments: parsed.hrComments || parsed.reviewerComments || '',
          supervisorComments: parsed.supervisorComments || parsed.managerComments || '',
          reviewerComments: parsed.reviewerComments || parsed.hrComments || '',
          supervisor: Array.isArray(parsed.supervisor) ? parsed.supervisor : [],
          reviewer: Array.isArray(parsed.reviewer) ? parsed.reviewer : []
        };
        
        // If we have workflow comments (arrays), extract the latest comment text for display
        if (comments.supervisor.length > 0) {
          const latestSupervisorComment = comments.supervisor[comments.supervisor.length - 1];
          if (latestSupervisorComment?.comment && !comments.supervisorComments) {
            comments.supervisorComments = latestSupervisorComment.comment;
          }
          if (latestSupervisorComment?.comment && !comments.managerComments) {
            comments.managerComments = latestSupervisorComment.comment;
          }
        }
        if (comments.reviewer.length > 0) {
          const latestReviewerComment = comments.reviewer[comments.reviewer.length - 1];
          if (latestReviewerComment?.comment && !comments.reviewerComments) {
            comments.reviewerComments = latestReviewerComment.comment;
          }
          if (latestReviewerComment?.comment && !comments.hrComments) {
            comments.hrComments = latestReviewerComment.comment;
          }
        }
        
        return comments;
      })(),
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
      data: transformedAppraisal,
      appraisal: transformedAppraisal // Keep for backward compatibility
    });

  } catch (error) {
    console.error('Error fetching appraisal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appraisal' },
      { status: 500 }
    );
  }
}
