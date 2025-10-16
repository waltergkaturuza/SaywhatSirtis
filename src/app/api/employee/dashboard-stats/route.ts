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

    // Get qualifications count
    const qualifications = await prisma.qualifications.count({
      where: { employeeId: employee.id }
    });

    // Get training count (from training_attendance)
    const trainings = await prisma.training_attendance.count({
      where: { employeeId: employee.id }
    });

    // Get certificates count (from qualifications with certificates)
    const certificates = await prisma.qualifications.count({
      where: {
        employeeId: employee.id,
        certificateUrl: { not: null }
      }
    });

    // Get notifications count (from notifications table if it exists, otherwise set to 0)
    let notifications = 0;
    try {
      // Check if notifications table exists
      const notificationsTable = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      `;
      
      if (Array.isArray(notificationsTable) && notificationsTable.length > 0) {
        const result = await prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM notifications 
          WHERE "userId" = ${employee.id} 
          AND read = false
        ` as any[];
        notifications = Number(result[0]?.count || 0);
      }
    } catch (error) {
      console.log('Notifications table not found or error:', error);
      // Keep notifications at 0
    }

    return NextResponse.json({
      qualifications,
      trainings,
      certificates,
      notifications
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

