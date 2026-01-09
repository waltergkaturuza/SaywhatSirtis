import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get performance plan deliverables (responsibilities) with plan and employee details
    const responsibilities = await prisma.performance_responsibilities.findMany({
      include: {
        performance_plans: {
          include: {
            employees: {
              select: {
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to recent deliverables
    });

    // Transform deliverables for frontend
    const deliverables = responsibilities.map(resp => {
      // Calculate progress from activities for this responsibility
      const activities = resp.performance_activities || [];
      const completedCount = activities.filter((act: any) => act.status === 'completed').length;
      const totalCount = activities.length;
      const planProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      // Get latest activity for current update
      const latestActivity = activities[0] || null;
      const currentUpdate = latestActivity?.description || 'No updates yet';
      
      // Determine status based on progress
      let status = 'not-started';
      if (planProgress === 100) status = 'completed';
      else if (planProgress > 0) status = 'in-progress';
      
      return {
        id: resp.id,
        keyDeliverable: resp.title,
        activity: resp.description || '',
        description: resp.description || '',
        title: resp.title,
        weight: resp.weight || 0,
        planId: resp.planId,
        planProgress: planProgress,
        status: status,
        currentUpdate: currentUpdate,
        lastUpdate: resp.updatedAt?.toISOString() || resp.createdAt?.toISOString() || new Date().toISOString(),
        timeline: resp.performance_plans?.planPeriod || '',
        successIndicator: 'To be defined',
        actualProgress: `${planProgress}%`,
        plan: {
          planYear: resp.performance_plans?.planYear,
          employee: {
            id: resp.performance_plans?.employees?.employeeId,
            name: `${resp.performance_plans?.employees?.firstName || ''} ${resp.performance_plans?.employees?.lastName || ''}`.trim(),
            email: resp.performance_plans?.employees?.email,
            position: resp.performance_plans?.employees?.position,
            department: resp.performance_plans?.employees?.departments?.name
          }
        },
        createdAt: resp.createdAt?.toISOString(),
        updatedAt: resp.updatedAt?.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      deliverables
    });

  } catch (error) {
    console.error('Error fetching performance deliverables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance deliverables' },
      { status: 500 }
    );
  }
}

