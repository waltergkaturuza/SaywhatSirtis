import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const performancePlanId = searchParams.get('performancePlanId');

    // Get user's role and employee record
    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const employee = await prisma.employees.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
    }

    const canViewAllPlans = ['ADMIN', 'HR_MANAGER'].includes(user.role) || user.roles?.includes('hr');

    let whereClause: any = {};

    if (performancePlanId) {
      // Find activities for a specific performance plan via responsibilities
      whereClause.responsibility = {
        planId: performancePlanId
      };
      
      // If not admin, ensure they can only see their own or their subordinates' activities
      if (!canViewAllPlans) {
        const performancePlan = await prisma.performance_plans.findUnique({
          where: { id: performancePlanId },
          select: { employeeId: true, supervisorId: true }
        });

        if (!performancePlan || 
            (performancePlan.employeeId !== employee.id && 
             performancePlan.supervisorId !== employee.id)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    } else {
      // If no specific plan, show activities for plans they have access to
      if (!canViewAllPlans) {
        whereClause.responsibility = {
          performancePlan: {
            OR: [
              { employeeId: employee.id },
              { supervisorId: employee.id }
            ]
          }
        };
      }
    }

    const activities = await prisma.performance_activities.findMany({
      where: whereClause,
      include: {
        responsibility: {
          include: {
            performancePlan: {
              include: {
                employees: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    department: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      keyDeliverable: activity.keyDeliverable,
      activity: activity.activity,
      timeline: activity.timeline,
      supportDepartment: activity.supportDepartment,
      successIndicator: activity.successIndicator,
      progress: activity.progress || 0,
      status: activity.status || 'not-started',
      lastUpdate: activity.updatedAt,
      performancePlan: {
        id: activity.performancePlan.id,
        employee: `${activity.performancePlan.employee.firstName} ${activity.performancePlan.employee.lastName}`,
        department: activity.performancePlan.employee.department?.name || 'N/A'
      }
    }));

    return NextResponse.json({
      success: true,
      activities: formattedActivities
    });

  } catch (error) {
    console.error('Error fetching performance plan activities:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch activities', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      performancePlanId,
      keyDeliverable,
      activity,
      timeline,
      supportDepartment,
      successIndicator,
      progress = 0,
      status = 'not-started'
    } = body;

    // Get user's role and employee record
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if user can manage this performance plan
    const performancePlan = await prisma.performancePlan.findUnique({
      where: { id: performancePlanId },
      select: { employeeId: true, supervisorId: true }
    });

    if (!performancePlan) {
      return NextResponse.json({ error: 'Performance plan not found' }, { status: 404 });
    }

    const canManagePlan = ['HR Manager', 'CEO', 'Operations Manager'].includes(employee.role.name) ||
                         performancePlan.employeeId === employee.id ||
                         performancePlan.supervisorId === employee.id;

    if (!canManagePlan) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newActivity = await prisma.performancePlanActivity.create({
      data: {
        performancePlanId,
        keyDeliverable,
        activity,
        timeline,
        supportDepartment,
        successIndicator,
        progress: parseInt(progress),
        status,
        createdBy: employee.id
      },
      include: {
        performancePlan: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                department: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      activity: {
        id: newActivity.id,
        keyDeliverable: newActivity.keyDeliverable,
        activity: newActivity.activity,
        timeline: newActivity.timeline,
        supportDepartment: newActivity.supportDepartment,
        successIndicator: newActivity.successIndicator,
        progress: newActivity.progress,
        status: newActivity.status,
        lastUpdate: newActivity.updatedAt,
        performancePlan: {
          id: newActivity.performancePlan.id,
          employee: `${newActivity.performancePlan.employee.firstName} ${newActivity.performancePlan.employee.lastName}`,
          department: newActivity.performancePlan.employee.department?.name || 'N/A'
        }
      }
    });

  } catch (error) {
    console.error('Error creating performance plan activity:', error);
    return NextResponse.json({ 
      error: 'Failed to create activity', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
