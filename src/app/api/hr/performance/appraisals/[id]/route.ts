import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const appraisalId = params.id;

    // Get user and check permissions
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        department: true,
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const canViewAllAppraisals = ['SUPERUSER', 'HR_MANAGER', 'HR_SPECIALIST'].includes(user.role);

    // Fetch the performance review with all related data
    const performanceReview = await prisma.performance_reviews.findUnique({
      where: { id: appraisalId },
      include: {
        employees: {
          include: {
            departments: true,
            user: true
          }
        },
        supervisor: true,
        reviewer: true
      }
    });

    if (!performanceReview) {
      return NextResponse.json({ error: 'Performance review not found' }, { status: 404 });
    }

    // Check access permissions
    if (!canViewAllAppraisals && 
        performanceReview.employeeId !== user.id && 
        performanceReview.supervisorId !== user.id &&
        performanceReview.reviewerId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get performance areas/criteria for this review
    const performanceAreas = await prisma.performance_criteria.findMany({
      orderBy: { weight: 'desc' }
    });

    // Get achievements for this employee
    const achievements = await prisma.performance_achievements.findMany({
      where: { 
        employeeId: performanceReview.employeeId 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get development plans (general ones since no employee association in schema)
    const developmentPlans = await prisma.development_plans.findMany({
      where: { 
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get feedback/comments for this review
    const feedback = await prisma.performance_feedback.findMany({
      where: { 
        reviewId: performanceReview.id 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate overall rating from performance areas
    const calculateOverallRating = () => {
      // Return the stored rating since individual area ratings aren't available in the current schema
      return performanceReview.overallRating || null;
    };

    // Calculate development plan progress
    const calculatePlanProgress = (plans: any[]) => {
      if (plans.length === 0) return 0;
      const totalProgress = plans.reduce((sum, plan) => sum + (plan.progress || 0), 0);
      return Math.round(totalProgress / plans.length);
    };

    // Format the response data
    const appraisalData = {
      id: performanceReview.id,
      employeeName: performanceReview.employees.user?.firstName && performanceReview.employees.user?.lastName
                   ? `${performanceReview.employees.user.firstName} ${performanceReview.employees.user.lastName}`
                   : `${performanceReview.employees.firstName} ${performanceReview.employees.lastName}`,
      employeeId: performanceReview.employees.employeeId,
      department: performanceReview.employees.departments?.name || 'Unknown',
      position: performanceReview.employees.position || 'Unknown',
      period: formatReviewPeriod(performanceReview.reviewType, performanceReview.reviewDate),
      overallRating: performanceReview.overallRating || calculateOverallRating(),
      status: performanceReview.reviewStatus,
      submittedAt: performanceReview.submittedAt,
      reviewedAt: performanceReview.reviewedAt,
      supervisor: performanceReview.supervisor?.firstName && performanceReview.supervisor?.lastName
                  ? `${performanceReview.supervisor.firstName} ${performanceReview.supervisor.lastName}`
                  : performanceReview.supervisor?.email || 'Unknown',
      reviewer: performanceReview.reviewer?.firstName && performanceReview.reviewer?.lastName
               ? `${performanceReview.reviewer.firstName} ${performanceReview.reviewer.lastName}`
               : performanceReview.reviewer?.email || 'Unknown',
      planProgress: calculatePlanProgress(developmentPlans),
      strengths: performanceReview.strengths || '',
      areasImprovement: performanceReview.areasForImprovement || '',
      goals: performanceReview.goals || '',
      lastUpdated: performanceReview.updatedAt,
      
      performanceAreas: performanceAreas.map(area => ({
        area: area.name,
        rating: 0, // No individual ratings in current schema
        weight: area.weight || 0,
        comments: area.description || '',
        evidence: '' // No evidence field in current schema
      })),
      
      achievements: achievements.map(achievement => ({
        achievement: achievement.title,
        impact: achievement.impact || '',
        evidence: '' // No evidence field in current schema
      })),
      
      developmentPlans: developmentPlans.map(plan => ({
        area: plan.goal, // Use goal as the area
        currentLevel: plan.description || '',
        targetLevel: plan.goal,
        timeline: plan.targetDate?.toISOString() || '',
        resources: '' // No resources field in current schema
      })),
      
      supervisorComments: feedback.find(f => f.feedbackType === 'supervisor')?.content || '',
      employeeComments: feedback.find(f => f.feedbackType === 'self')?.content || '',
      nextSteps: performanceReview.nextSteps || '',
      improvementPlan: performanceReview.improvementPlan || ''
    };

    return NextResponse.json({
      success: true,
      data: appraisalData,
      message: 'Individual appraisal data retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to fetch individual appraisal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appraisal data' },
      { status: 500 }
    );
  }
}

// Helper functions
function formatReviewPeriod(reviewType: string, reviewDate: Date): string {
  const date = new Date(reviewDate);
  const year = date.getFullYear();
  
  if (reviewType === 'annual') {
    return `Annual ${year}`;
  } else if (reviewType === 'quarterly') {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    return `Q${quarter} ${year}`;
  } else {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${year}`;
  }
}

function calculatePlanProgress(developmentPlans: any[]): number {
  if (developmentPlans.length === 0) return 0;
  
  const totalProgress = developmentPlans.reduce((sum, plan) => {
    return sum + (plan.progress || 0);
  }, 0);
  
  return Math.round(totalProgress / developmentPlans.length);
}