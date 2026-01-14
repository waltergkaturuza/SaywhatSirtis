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

    // Find user first to get userId
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get employee record by userId
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id },
      select: { 
        id: true,
        startDate: true,
        hireDate: true
      }
    });

    // If no employee record, return default stats
    if (!employee) {
      return NextResponse.json({
        qualifications: 0,
        trainings: 0,
        certificates: 0,
        notifications: 0,
        yearsOfService: 0,
        performanceScore: null,
        completedTrainings: 0
      });
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

    // Helper function to calculate overall rating from categories
    const calculateOverallRatingFromCategories = (comments: any): number | null => {
      if (!comments) return null;
      
      try {
        let parsedComments = comments;
        if (typeof comments === 'string') {
          parsedComments = JSON.parse(comments);
        }
        
        // Check if categories are in ratings.categories or performance.categories
        const categories = parsedComments?.ratings?.categories || parsedComments?.performance?.categories;
        
        if (!Array.isArray(categories) || categories.length === 0) {
          return null;
        }
        
        // Calculate weighted average: sum((rating * weight)) / sum(weights)
        const totalWeight = categories.reduce((sum: number, cat: any) => sum + (cat.weight || 0), 0);
        const weightedScore = categories.reduce((sum: number, cat: any) => sum + ((cat.rating || 0) * (cat.weight || 0)), 0);
        
        if (totalWeight > 0) {
          return parseFloat((weightedScore / totalWeight).toFixed(2));
        }
      } catch (error) {
        console.error('Error calculating overall rating from categories:', error);
      }
      
      return null;
    };

    // Get last appraisal score (from performance_appraisals or performance_reviews)
    let performanceScore = null;
    let overallRating = null;
    try {
      // Try performance_appraisals first (newer system)
      const lastAppraisal = await prisma.performance_appraisals.findFirst({
        where: {
          employeeId: employee.id,
          status: { in: ['completed', 'approved', 'supervisor_approved', 'reviewer_approved', 'submitted'] }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          overallRating: true,
          comments: true
        }
      });

      if (lastAppraisal) {
        // Use stored overallRating if available, otherwise calculate from categories
        overallRating = lastAppraisal.overallRating;
        if (!overallRating || overallRating === 0) {
          const categoryRating = calculateOverallRatingFromCategories(lastAppraisal.comments);
          if (categoryRating !== null) {
            overallRating = categoryRating;
          }
        }
        
        if (overallRating) {
          // Convert to percentage (assuming 5-point scale)
          performanceScore = Math.round((overallRating / 5) * 100);
        }
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

