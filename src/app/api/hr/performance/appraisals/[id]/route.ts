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
      performance: (() => {
        // Parse performance data from comments field
        let categories: any[] = [];
        let strengths: any[] = [];
        let areasForImprovement: any[] = [];
        
        if (appraisal.comments) {
          let parsedComments: any = {};
          try {
            if (typeof appraisal.comments === 'string') {
              parsedComments = JSON.parse(appraisal.comments);
            } else if (typeof appraisal.comments === 'object') {
              parsedComments = appraisal.comments;
            }
          } catch {
            parsedComments = {};
          }
          
          // Extract categories from ratings or performance (check both locations)
          if (parsedComments.performance?.categories) {
            categories = Array.isArray(parsedComments.performance.categories) 
              ? parsedComments.performance.categories 
              : [];
          } else if (parsedComments.ratings?.categories) {
            categories = Array.isArray(parsedComments.ratings.categories) 
              ? parsedComments.ratings.categories 
              : [];
          }
          
          // Extract strengths and areas for improvement (check both locations)
          if (parsedComments.performance?.strengths) {
            strengths = Array.isArray(parsedComments.performance.strengths) 
              ? parsedComments.performance.strengths 
              : (typeof parsedComments.performance.strengths === 'string' ? parsedComments.performance.strengths.split(',').map((s: string) => s.trim()) : []);
          } else if (parsedComments.strengths) {
            strengths = Array.isArray(parsedComments.strengths) 
              ? parsedComments.strengths 
              : (typeof parsedComments.strengths === 'string' ? parsedComments.strengths.split(',').map((s: string) => s.trim()) : []);
          }
          
          if (parsedComments.performance?.areasForImprovement) {
            areasForImprovement = Array.isArray(parsedComments.performance.areasForImprovement) 
              ? parsedComments.performance.areasForImprovement 
              : (typeof parsedComments.performance.areasForImprovement === 'string' ? parsedComments.performance.areasForImprovement.split(',').map((s: string) => s.trim()) : []);
          } else if (parsedComments.areasForImprovement) {
            areasForImprovement = Array.isArray(parsedComments.areasForImprovement) 
              ? parsedComments.areasForImprovement 
              : (typeof parsedComments.areasForImprovement === 'string' ? parsedComments.areasForImprovement.split(',').map((s: string) => s.trim()) : []);
          }
        }
        
        // If no categories found, use default categories
        if (categories.length === 0) {
          categories = [
            { id: '1', name: 'Teamwork', rating: 0, comment: '', weight: 20, description: 'Working collaboratively with others to achieve common goals and support team success.' },
            { id: '2', name: 'Responsiveness and Effectiveness', rating: 0, comment: '', weight: 20, description: 'Acting promptly and efficiently to meet stakeholder needs and deliver quality results.' },
            { id: '3', name: 'Accountability', rating: 0, comment: '', weight: 20, description: 'Taking ownership of responsibilities and being answerable for actions and outcomes.' },
            { id: '4', name: 'Professionalism and Integrity', rating: 0, comment: '', weight: 20, description: 'Maintaining high ethical standards, honesty, and professional conduct in all interactions.' },
            { id: '5', name: 'Innovation', rating: 0, comment: '', weight: 20, description: 'Embracing creativity and new ideas to improve processes, services, and outcomes.' }
          ];
        }
        
        return {
          overallRating: appraisal.overallRating || 0,
          categories: categories,
          strengths: strengths,
          areasForImprovement: areasForImprovement
        };
      })(),
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
      supervisorApprovedAt: appraisal.supervisorApprovedAt?.toISOString(),
      reviewerApprovedAt: appraisal.reviewerApprovedAt?.toISOString(),
      supervisorApproval: appraisal.supervisorApprovedAt ? 'approved' : 'pending',
      reviewerApproval: appraisal.reviewerApprovedAt ? 'approved' : 'pending',
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { ratings, performance } = body;

    console.log('🔧 PATCH /api/hr/performance/appraisals/[id]');
    console.log('   Appraisal ID:', id);
    console.log('   User:', session.user.email);

    // Fetch the appraisal
    const appraisal = await prisma.performance_appraisals.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!appraisal) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
    }

    // Check permissions - only supervisors/reviewers/HR can update ratings on submitted appraisals
    const userId = session.user.id;
    const isSupervisor = appraisal.supervisorId === userId;
    const isReviewer = appraisal.reviewerId === userId;
    const userRoles = session.user.roles || [];
    const isHR = userRoles.some(role => 
      ['HR', 'SUPERUSER', 'SYSTEM_ADMINISTRATOR', 'ADMIN', 'HR_MANAGER'].includes(role)
    );

    // Check if user is supervisor via employee relationship
    let isEmployeeSupervisor = false;
    if (!isSupervisor && appraisal.employeeId) {
      const employee = await prisma.employees.findUnique({
        where: { id: appraisal.employeeId },
        select: { supervisor_id: true }
      });
      if (employee?.supervisor_id) {
        const supervisorEmployee = await prisma.employees.findUnique({
          where: { id: employee.supervisor_id },
          select: { userId: true }
        });
        if (supervisorEmployee?.userId === userId) {
          isEmployeeSupervisor = true;
        }
      }
    }

    const canUpdate = isSupervisor || isEmployeeSupervisor || isReviewer || isHR;

    if (!canUpdate) {
      return NextResponse.json({ error: 'Permission denied. Only supervisors, reviewers, or HR can update ratings.' }, { status: 403 });
    }

    // Employees cannot edit submitted appraisals
    const userEmployee = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        employees: {
          select: { id: true }
        }
      }
    });
    const isEmployee = userEmployee?.employees && appraisal.employeeId === userEmployee.employees.id;
    
    if (isEmployee && appraisal.status !== 'draft') {
      return NextResponse.json({ error: 'Employees cannot edit submitted appraisals' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Update overall rating
    if (ratings?.overall !== undefined || performance?.overallRating !== undefined) {
      updateData.overallRating = ratings?.overall || performance?.overallRating;
    }

    // Update performance categories/ratings
    // Store ratings in comments field as JSON (for now, until we have a dedicated ratings field)
    if (ratings?.categories || performance?.categories) {
      const categories = ratings?.categories || performance?.categories;
      
      // Get existing comments
      let existingComments: any = {};
      if (appraisal.comments) {
        try {
          if (typeof appraisal.comments === 'string') {
            existingComments = JSON.parse(appraisal.comments);
          } else if (typeof appraisal.comments === 'object') {
            existingComments = appraisal.comments;
          }
        } catch {
          existingComments = {};
        }
      }

      // Update comments with new ratings
      existingComments.ratings = {
        categories: categories,
        overall: updateData.overallRating || appraisal.overallRating || 0
      };

      updateData.comments = JSON.stringify(existingComments);
    }

    // Update strengths and areas for improvement if provided
    if (performance?.strengths || performance?.areasForImprovement) {
      // These would typically be stored in a separate field, but for now we'll store in comments
      let existingComments: any = {};
      if (appraisal.comments) {
        try {
          if (typeof appraisal.comments === 'string') {
            existingComments = JSON.parse(appraisal.comments);
          } else if (typeof appraisal.comments === 'object') {
            existingComments = appraisal.comments;
          }
        } catch {
          existingComments = {};
        }
      }

      if (performance.strengths) {
        existingComments.strengths = performance.strengths;
      }
      if (performance.areasForImprovement) {
        existingComments.areasForImprovement = performance.areasForImprovement;
      }

      updateData.comments = JSON.stringify(existingComments);
    }

    // Update the appraisal
    const updatedAppraisal = await prisma.performance_appraisals.update({
      where: { id },
      data: updateData
    });

    console.log('✅ Appraisal ratings updated successfully');

    return NextResponse.json({
      success: true,
      appraisal: {
        id: updatedAppraisal.id,
        overallRating: updatedAppraisal.overallRating,
        status: updatedAppraisal.status
      }
    });

  } catch (error) {
    console.error('Error updating appraisal ratings:', error);
    return NextResponse.json(
      { error: 'Failed to update appraisal ratings' },
      { status: 500 }
    );
  }
}
