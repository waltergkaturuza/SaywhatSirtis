import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canViewAllPerformance } from '@/lib/hr/performance-access';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user and check permissions
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        roles: true,
        department: true,
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const canViewAllAppraisals = canViewAllPerformance(user, {
      user: {
        roles: (session.user as { roles?: string[] }).roles,
        permissions: (session.user as { permissions?: string[] }).permissions
      }
    });
    const now = new Date();

    // Calculate date ranges
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of this week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);

    let notifications;

    if (canViewAllAppraisals) {
      // Admin/HR can see all notifications
      const [dueThisWeek, progressUpdates, completedThisWeek] = await Promise.all([
        // Appraisals submitted this week (pending review)
        prisma.performance_appraisals.count({
          where: {
            submittedAt: {
              gte: startOfWeek,
              lte: endOfWeek
            },
            status: 'submitted'
          }
        }),
        
        // Progress updates (appraisals in draft state updated this week)
        prisma.performance_appraisals.count({
          where: {
            updatedAt: {
              gte: startOfWeek,
              lte: endOfWeek
            },
            status: 'draft'
          }
        }),
        
        // Appraisals completed this week
        prisma.performance_appraisals.count({
          where: {
            approvedAt: {
              gte: startOfWeek,
              lte: endOfWeek
            },
            status: 'approved'
          }
        })
      ]);

      notifications = {
        dueThisWeek,
        progressUpdates,
        completedThisWeek
      };
    } else {
      // Regular employees can only see their own notifications
      // Find employee record by user email
      const employee = await prisma.employees.findFirst({
        where: { email: user.email },
        select: { id: true }
      });
      
      if (!employee) {
        notifications = {
          dueThisWeek: 0,
          progressUpdates: 0,
          completedThisWeek: 0
        };
      } else {
        const visibleAppraisal = {
          OR: [
            { employeeId: employee.id },
            { supervisorId: user.id },
            { reviewerId: user.id },
            { supervisorId: employee.id },
            { reviewerId: employee.id }
          ]
        }
        const [dueThisWeek, progressUpdates, completedThisWeek] = await Promise.all([
          prisma.performance_appraisals.count({
            where: {
              ...visibleAppraisal,
              submittedAt: {
                gte: startOfWeek,
                lte: endOfWeek
              },
              status: 'submitted'
            }
          }),
          
          prisma.performance_appraisals.count({
            where: {
              ...visibleAppraisal,
              updatedAt: {
                gte: startOfWeek,
                lte: endOfWeek
              },
              status: 'draft'
            }
          }),
          
          prisma.performance_appraisals.count({
            where: {
              ...visibleAppraisal,
              approvedAt: {
                gte: startOfWeek,
                lte: endOfWeek
              },
              status: 'approved'
            }
          })
        ]);

        notifications = {
          dueThisWeek,
          progressUpdates,
          completedThisWeek
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: notifications,
      message: 'Notifications data retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}