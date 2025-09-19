import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { executeQuery } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

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

    const activities = await executeQuery(async (prisma) => {
      return prisma.performance_activities.findMany({
        where: whereClause,
        include: {
          performance_responsibilities: {
            include: {
              performance_plans: {
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
      })
    });

    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      keyDeliverable: 'N/A',
      activity: 'N/A', 
      timeline: 'N/A',
      supportDepartment: 'N/A',
      successIndicator: 'N/A',
      progress: 0,
      status: 'not-started',
      lastUpdate: activity.updatedAt,
      performancePlan: {
        id: activity.performance_responsibilities.performance_plans.id,
        employee: `${activity.performance_responsibilities.performance_plans.employees.firstName} ${activity.performance_responsibilities.performance_plans.employees.lastName}`,
        department: activity.performance_responsibilities.performance_plans.employees.department || 'N/A'
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
    const employee = await prisma.employees.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if user can manage this performance plan
    const performancePlan = await prisma.performance_plans.findUnique({
      where: { id: performancePlanId },
      select: { employeeId: true, supervisorId: true }
    });

    if (!performancePlan) {
      return NextResponse.json({ error: 'Performance plan not found' }, { status: 404 });
    }

    const canManagePlan = employee?.position?.includes('Manager') ||
                         performancePlan.employeeId === employee?.id ||
                         performancePlan.supervisorId === employee?.id;

    if (!canManagePlan) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newActivity = await prisma.performance_activities.create({
      data: {
        id: `activity-${Date.now()}`,
        responsibilityId: performancePlanId, // Using this as a placeholder
        title: activity || 'New Activity',
        description: keyDeliverable,
        targetDate: timeline ? new Date(timeline) : null,
        status: status || 'pending',
        updatedAt: new Date()
      },
      include: {
        responsibility: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      activity: {
        id: newActivity.id,
        keyDeliverable: newActivity.description || 'N/A',
        activity: newActivity.title || 'N/A',
        timeline: newActivity.targetDate ? newActivity.targetDate.toISOString() : 'N/A',
        supportDepartment: 'N/A',
        successIndicator: 'N/A',
        progress: 0,
        status: newActivity.status,
        lastUpdate: newActivity.updatedAt,
        performancePlan: {
          id: newActivity.responsibility.id,
          employee: 'N/A',
          department: 'N/A'
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
