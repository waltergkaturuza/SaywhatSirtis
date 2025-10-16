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
    const latestAppraisal = await prisma.performance_appraisals.findFirst({
      where: {
        employeeId: employee.id,
        status: 'approved'
      },
      orderBy: { createdAt: 'desc' },
      select: { overallRating: true, completedAt: true }
    });

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
        },
        status: 'completed'
      }
    });

    // Calculate next review date (assuming annual reviews)
    const lastReviewDate = latestAppraisal?.completedAt;
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
      overallRating: latestAppraisal?.overallRating || 0,
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

