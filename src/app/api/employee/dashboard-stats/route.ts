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

    // Get employee record with startDate
    const employee = await prisma.employees.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        startDate: true,
        hireDate: true
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Calculate years of service
    const employmentStartDate = employee.startDate || employee.hireDate;
    let yearsOfService = 0;
    if (employmentStartDate) {
      const startDate = new Date(employmentStartDate);
      const currentDate = new Date();
      const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
      const monthsDiff = currentDate.getMonth() - startDate.getMonth();
      // Calculate fractional years for more accuracy
      yearsOfService = yearsDiff + (monthsDiff / 12);
      // Round to 1 decimal place, but show as integer if whole number
      yearsOfService = Math.round(yearsOfService * 10) / 10;
    }

    // Get last appraisal score (from performance_appraisals or performance_reviews)
    let performanceScore = null;
    try {
      // Try performance_appraisals first (newer system)
      const lastAppraisal = await prisma.performance_appraisals.findFirst({
        where: {
          employeeId: employee.id,
          overallRating: { not: null },
          status: { in: ['completed', 'approved', 'supervisor_approved', 'reviewer_approved'] }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          overallRating: true
        }
      });

      if (lastAppraisal?.overallRating) {
        // Convert to percentage (assuming 5-point scale)
        performanceScore = Math.round((lastAppraisal.overallRating / 5) * 100);
      } else {
        // Fallback to performance_reviews (older system)
        const lastReview = await prisma.performance_reviews.findFirst({
          where: {
            employeeId: employee.id,
            overallRating: { not: null }
          },
          orderBy: {
            reviewDate: 'desc'
          },
          select: {
            overallRating: true
          }
        });

        if (lastReview?.overallRating) {
          // Convert to percentage (assuming 5-point scale)
          performanceScore = Math.round((lastReview.overallRating / 5) * 100);
        }
      }
    } catch (error) {
      console.log('Error fetching performance score:', error);
      // Keep performanceScore as null
    }

    // Get completed trainings count (from training_enrollments)
    const completedTrainings = await prisma.training_enrollments.count({
      where: {
        employeeId: employee.id,
        status: 'COMPLETED'
      }
    });

    // Get qualifications count
    const qualifications = await prisma.qualifications.count({
      where: { employeeId: employee.id }
    });

    // Get training count (from training_attendance) - keeping for backward compatibility
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
          WHERE "employeeId" = ${employee.id} 
          AND "isRead" = false
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
      notifications,
      yearsOfService,
      performanceScore,
      completedTrainings
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

