import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch a single deliverable (performance responsibility)
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

    // Find the performance responsibility (deliverable)
    const responsibility = await prisma.performance_responsibilities.findUnique({
      where: { id },
      include: {
        performance_plans: {
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
                }
              }
            }
          }
        },
        performance_activities: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!responsibility) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    }

    const plan = responsibility.performance_plans;
    
    // Calculate progress from activities status or use default
    const activities = responsibility.performance_activities || [];
    // Calculate progress based on completed activities
    const completedCount = activities.filter(act => act.status === 'completed').length;
    const totalCount = activities.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Get latest update comment from description
    const latestActivity = activities[0] || null;
    const currentUpdate = latestActivity?.description || '';

    const deliverable = {
      id: responsibility.id,
      planId: responsibility.planId,
      title: responsibility.title,
      description: responsibility.description || '',
      progress: progress,
      status: 'in-progress', // Default status
      lastUpdate: responsibility.updatedAt?.toISOString(),
      currentUpdate: currentUpdate,
      weight: responsibility.weight || 0
    };

    const planData = {
      id: plan.id,
      planTitle: plan.planTitle || `Annual Plan ${plan.planYear}`,
      planYear: plan.planYear,
      planPeriod: plan.planPeriod,
      employeeName: `${plan.employees?.firstName || ''} ${plan.employees?.lastName || ''}`.trim(),
      employeeId: plan.employees?.employeeId || '',
      department: plan.employees?.departments?.name || ''
    };

    return NextResponse.json({
      success: true,
      deliverable,
      plan: planData
    });

  } catch (error) {
    console.error('Error fetching deliverable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deliverable' },
      { status: 500 }
    );
  }
}

// PUT: Update deliverable progress
export async function PUT(
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
    const { progress, comment, lastUpdate } = body;

    // Find the performance responsibility
    const responsibility = await prisma.performance_responsibilities.findUnique({
      where: { id },
      include: {
        performance_plans: {
          include: {
            employees: true
          }
        }
      }
    });

    if (!responsibility) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    }

    // Check permissions - user must be the employee, supervisor, reviewer, or HR
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: {
        employees: {
          select: {
            id: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = responsibility.performance_plans;
    const isEmployee = plan.employees?.userId === user.id;
    const isSupervisor = plan.supervisorId === user.id;
    const isReviewer = plan.reviewerId === user.id;
    const isHR = ['ADMIN', 'HR_MANAGER', 'HR'].includes(user.role || '');

    if (!isEmployee && !isSupervisor && !isReviewer && !isHR) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create a new activity to track the progress update
    const activityStatus = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending';
    const activityTitle = `Progress Update - ${progress}%`;
    
    const activity = await prisma.performance_activities.create({
      data: {
        id: crypto.randomUUID(),
        responsibilityId: id,
        title: activityTitle,
        description: comment || `Progress updated to ${progress}%`,
        status: activityStatus,
        completedAt: progress === 100 ? new Date() : null,
        updatedAt: new Date()
      }
    });

    // Update the responsibility's updatedAt timestamp
    await prisma.performance_responsibilities.update({
      where: { id },
      data: {
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully',
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        status: activity.status,
        updatedAt: activity.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating deliverable progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
