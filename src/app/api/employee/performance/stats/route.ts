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
      select: { id: true }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get performance plans stats
    const totalPlans = await prisma.performance_plans.count({
      where: { employeeId: employee.id }
    });

    const activePlans = await prisma.performance_plans.count({
      where: {
        employeeId: employee.id,
        status: { in: ['draft', 'active', 'submitted', 'supervisor_review', 'reviewer_assessment'] }
      }
    });

    // Get appraisals stats
    const totalAppraisals = await prisma.performance_appraisals.count({
      where: { employeeId: employee.id }
    });

    const completedAppraisals = await prisma.performance_appraisals.count({
      where: {
        employeeId: employee.id,
        status: 'approved'
      }
    });

    const pendingAppraisals = await prisma.performance_appraisals.count({
      where: {
        employeeId: employee.id,
        status: { in: ['draft', 'submitted', 'supervisor_review', 'reviewer_assessment'] }
      }
    });

    // Helper function to calculate overall rating from categories
    const calculateOverallRatingFromCategories = (comments: any): number | null => {
      if (!comments) return null;
      
      try {
        let parsedComments = comments;
        if (typeof comments === 'string') {
          parsedComments = JSON.parse(comments);
        }
        
        // Check if categories are in ratings.categories or performance.categories
        const categories = parsedComments?.ratings?.categories || parsedComments?.performance?.categories;
        
        if (!Array.isArray(categories) || categories.length === 0) {
          return null;
        }
        
        // Calculate weighted average: sum((rating * weight)) / sum(weights)
        const totalWeight = categories.reduce((sum: number, cat: any) => sum + (cat.weight || 0), 0);
        const weightedScore = categories.reduce((sum: number, cat: any) => sum + ((cat.rating || 0) * (cat.weight || 0)), 0);
        
        if (totalWeight > 0) {
          return parseFloat((weightedScore / totalWeight).toFixed(2));
        }
      } catch (error) {
        console.error('Error calculating overall rating from categories:', error);
      }
      
      return null;
    };

    // Get latest completed appraisal rating
    const latestAppraisal = await prisma.performance_appraisals.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: ['approved', 'completed', 'supervisor_approved', 'reviewer_approved', 'submitted'] }
      },
      orderBy: { createdAt: 'desc' },
      select: { overallRating: true, approvedAt: true, comments: true }
    });
    
    // Calculate overall rating from categories if overallRating is 0 or null
    let calculatedOverallRating = latestAppraisal?.overallRating || 0;
    if (!calculatedOverallRating || calculatedOverallRating === 0) {
      const categoryRating = calculateOverallRatingFromCategories(latestAppraisal?.comments);
      if (categoryRating !== null) {
        calculatedOverallRating = categoryRating;
      }
    }

    // Get performance responsibilities stats
    const totalGoals = await prisma.performance_responsibilities.count({
      where: {
        performance_plans: {
          employeeId: employee.id
        }
      }
    });

    const completedGoals = await prisma.performance_responsibilities.count({
      where: {
        performance_plans: {
          employeeId: employee.id
        }
      }
    });

    // Calculate next review date (assuming annual reviews)
    const lastReviewDate = latestAppraisal?.approvedAt;
    let nextReviewDate = null;
    if (lastReviewDate) {
      const next = new Date(lastReviewDate);
      next.setFullYear(next.getFullYear() + 1);
      nextReviewDate = next.toISOString();
    }

    return NextResponse.json({
      currentAppraisals: pendingAppraisals,
      pendingPlans: activePlans,
      completedGoals,
      totalGoals,
      lastReviewDate: lastReviewDate?.toISOString() || null,
      nextReviewDate,
      overallRating: calculatedOverallRating,
      totalReviews: totalAppraisals,
      completedReviews: completedAppraisals,
      activeGoals: totalGoals - completedGoals,
      pendingActions: pendingAppraisals + activePlans
    });

  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance statistics' },
      { status: 500 }
    );
  }
}

