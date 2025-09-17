import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        department: true,
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const canViewAllAppraisals = ['ADMIN', 'HR_MANAGER', 'HR'].includes(user.role);
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
        // Appraisals due this week (not yet completed)
        prisma.performance_reviews.count({
          where: {
            reviewDate: {
              gte: startOfWeek,
              lte: endOfWeek
            },
            reviewStatus: { not: 'completed' }
          }
        }),
        
        // Progress updates submitted this week (assuming we have a progress_updates table)
        // For now, we'll use a placeholder calculation based on updated performance reviews
        prisma.performance_reviews.count({
          where: {
            updatedAt: {
              gte: startOfWeek,
              lte: endOfWeek
            },
            reviewStatus: 'in_progress'
          }
        }),
        
        // Appraisals completed this week
        prisma.performance_reviews.count({
          where: {
            updatedAt: {
              gte: startOfWeek,
              lte: endOfWeek
            },
            reviewStatus: 'completed'
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
      const employeeId = user.employeeId;
      
      if (!employeeId) {
        notifications = {
          dueThisWeek: 0,
          progressUpdates: 0,
          completedThisWeek: 0
        };
      } else {
        const [dueThisWeek, progressUpdates, completedThisWeek] = await Promise.all([
          // Employee's appraisals due this week
          prisma.performance_reviews.count({
            where: {
              employeeId,
              reviewDate: {
                gte: startOfWeek,
                lte: endOfWeek
              },
              reviewStatus: { not: 'completed' }
            }
          }),
          
          // Employee's progress updates this week
          prisma.performance_reviews.count({
            where: {
              employeeId,
              updatedAt: {
                gte: startOfWeek,
                lte: endOfWeek
              },
              reviewStatus: 'in_progress'
            }
          }),
          
          // Employee's completed appraisals this week
          prisma.performance_reviews.count({
            where: {
              employeeId,
              updatedAt: {
                gte: startOfWeek,
                lte: endOfWeek
              },
              reviewStatus: 'completed'
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