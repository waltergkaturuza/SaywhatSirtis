import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const canViewAllAppraisals = ['ADMIN', 'HR_MANAGER', 'HR_SPECIALIST'].includes(user.role);

    // Fetch the performance review with all related data
    const performanceReview = await prisma.performance_reviews.findUnique({
      where: { id: parseInt(appraisalId) },
      include: {
        employee: {
          include: {
            department: true,
            user: true
          }
        },
        supervisor: {
          include: {
            user: true
          }
        },
        reviewer: {
          include: {
            user: true
          }
        }
      }
    });

    if (!performanceReview) {
      return NextResponse.json({ error: 'Performance review not found' }, { status: 404 });
    }

    // Check access permissions
    if (!canViewAllAppraisals && 
        performanceReview.employeeId !== user.employeeId && 
        performanceReview.supervisorId !== user.employeeId &&
        performanceReview.reviewerId !== user.employeeId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get performance areas/criteria for this review
    const performanceAreas = await prisma.performance_criteria.findMany({
      where: { 
        reviewId: performanceReview.id 
      },
      orderBy: { weight: 'desc' }
    });

    // Get achievements for this review
    const achievements = await prisma.performance_achievements.findMany({
      where: { 
        reviewId: performanceReview.id 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get development plans for this employee
    const developmentPlans = await prisma.development_plans.findMany({
      where: { 
        employeeId: performanceReview.employeeId,
        // Get plans from this review period or active ones
        OR: [
          { reviewId: performanceReview.id },
          { status: 'ACTIVE' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get feedback/comments for this review
    const feedback = await prisma.performance_feedback.findMany({
      where: { 
        reviewId: performanceReview.id 
      },
      include: {
        author: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate overall rating from performance areas
    const calculateOverallRating = () => {
      if (performanceAreas.length === 0) return null;
      
      const totalWeight = performanceAreas.reduce((sum, area) => sum + (area.weight || 0), 0);
      const weightedScore = performanceAreas.reduce((sum, area) => 
        sum + ((area.rating || 0) * (area.weight || 0)), 0
      );
      
      return totalWeight > 0 ? +(weightedScore / totalWeight).toFixed(2) : null;
    };

    // Format the response data
    const appraisalData = {
      id: performanceReview.id,
      employeeName: performanceReview.employee.user?.name || 
                   `${performanceReview.employee.firstName} ${performanceReview.employee.lastName}`,
      employeeId: performanceReview.employee.employeeId,
      department: performanceReview.employee.department?.name || 'Unknown',
      position: performanceReview.employee.position || 'Unknown',
      period: formatReviewPeriod(performanceReview.reviewType, performanceReview.reviewDate),
      overallRating: performanceReview.overallRating || calculateOverallRating(),
      status: performanceReview.reviewStatus,
      submittedAt: performanceReview.submittedAt,
      reviewedAt: performanceReview.reviewedAt,
      supervisor: performanceReview.supervisor?.user?.name || 
                  `${performanceReview.supervisor?.firstName} ${performanceReview.supervisor?.lastName}`,
      reviewer: performanceReview.reviewer?.user?.name || 
               `${performanceReview.reviewer?.firstName} ${performanceReview.reviewer?.lastName}`,
      planProgress: calculatePlanProgress(developmentPlans),
      strengths: performanceReview.strengths || '',
      areasImprovement: performanceReview.areasForImprovement || '',
      goals: performanceReview.goals || '',
      lastUpdated: performanceReview.updatedAt,
      
      performanceAreas: performanceAreas.map(area => ({
        area: area.criteriaName,
        rating: area.rating || 0,
        weight: area.weight || 0,
        comments: area.comments || '',
        evidence: area.evidence || ''
      })),
      
      achievements: achievements.map(achievement => ({
        achievement: achievement.title,
        impact: achievement.impact || '',
        evidence: achievement.evidence || ''
      })),
      
      developmentPlans: developmentPlans.map(plan => ({
        area: plan.skillArea,
        currentLevel: plan.currentLevel || '',
        targetLevel: plan.targetLevel || '',
        timeline: plan.timeline || '',
        resources: plan.resources || ''
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