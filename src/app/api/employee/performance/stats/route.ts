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

    // Get latest completed appraisal rating
    // Use stored overallRating directly - it should already be calculated and saved
    const latestAppraisal = await prisma.performance_appraisals.findFirst({
      where: {
        employeeId: employee.id,
        overallRating: { not: null, gt: 0 }, // Only get appraisals with a valid stored rating
        status: { in: ['approved', 'completed', 'supervisor_approved', 'reviewer_approved', 'submitted'] }
      },
      orderBy: { createdAt: 'desc' },
      select: { overallRating: true, approvedAt: true }
    });
    
    // Use stored overallRating - it's already calculated when ratings are saved
    const calculatedOverallRating = latestAppraisal?.overallRating || 0;

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

