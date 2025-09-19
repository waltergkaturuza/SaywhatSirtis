import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { executeQuery } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user and check permissions
    const user = await executeQuery(async (prisma) => {
      return prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        department: true,
        isActive: true
      }
      });
    });

    if (!user) {
      // Return empty list instead of error for better UX
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'No appraisals available'
      });
    }

  const canViewAllAppraisals = ['ADMIN', 'HR_MANAGER', 'HR'].includes(user.role);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const period = searchParams.get('period');

    // Build where clause
    const whereClause: any = {};
    
    if (status && status !== 'all') {
  // Schema uses reviewStatus
  whereClause.reviewStatus = status.toUpperCase();
    }
    
    if (department && department !== 'all') {
      whereClause.employees = { department };
    }

    if (period && period !== 'all') {
  whereClause.reviewPeriod = period;
    }

    // If user can't view all appraisals, limit to their department or direct reports
    if (!canViewAllAppraisals) {
      if (user.department) {
        whereClause.employees = { ...(whereClause.employees || {}), department: user.department };
      } else {
        // If no department, return empty list
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
          message: 'No appraisals available for your access level'
        });
      }
    }

    try {
      // Fetch performance reviews from database
      const performanceReviews = await executeQuery(async (prisma) => {
        return prisma.performance_reviews.findMany({
        where: whereClause,
        include: {
          employees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              position: true
            }
          },
          users_performance_reviews_supervisorIdTousers: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: {
          reviewDate: 'asc'
        }
        });
      });

      // Transform data to match frontend interface
      const transformedAppraisals = performanceReviews.map(review => ({
        id: review.id,
        employeeName: review.employees 
          ? `${review.employees.firstName || ''} ${review.employees.lastName || ''}`.trim()
          : 'Unknown Employee',
        employeeId: review.employees?.id || review.employeeId,
        department: review.employees?.department || 'Unknown',
        position: review.employees?.position || 'Unknown',
        period: review.reviewPeriod || 'Unknown',
        overallRating: review.overallRating,
        status: review.reviewStatus?.toLowerCase() || 'draft',
        supervisor: review.users_performance_reviews_supervisorIdTousers 
          ? `${review.users_performance_reviews_supervisorIdTousers.firstName || ''} ${review.users_performance_reviews_supervisorIdTousers.lastName || ''}`.trim()
          : 'Unknown Supervisor',
        dueDate: review.reviewDate?.toISOString().split('T')[0] || null,
        lastUpdated: review.updatedAt?.toISOString().split('T')[0] || review.createdAt?.toISOString().split('T')[0] || null,
        completionPercentage: calculateCompletionPercentage(review)
      }));

      return NextResponse.json({
        success: true,
        data: transformedAppraisals,
        total: transformedAppraisals.length
      });

    } catch (dbError) {
      console.error('Database error fetching bulk appraisals:', dbError);
      
      // Return empty list instead of error for better UX
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'Unable to fetch appraisals at this time'
      });
    }

  } catch (error) {
    console.error('Bulk appraisals API error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      message: 'Unable to fetch appraisals at this time'
    });
  }
}

// Helper function to calculate completion percentage based on review data
function calculateCompletionPercentage(review: any): number {
  let completedFields = 0;
  let totalFields = 5; // Adjust based on your review structure

  if (review.selfAssessment) completedFields++;
  if (review.supervisorFeedback) completedFields++;
  if (review.goals && review.goals.length > 0) completedFields++;
  if (review.overallRating) completedFields++;
  if (review.status && review.status !== 'DRAFT') completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await executeQuery(async (prisma) => {
      return prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true
      }
      });
    });

    if (!user || !['ADMIN', 'HR_MANAGER', 'HR'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { action, appraisalIds, data } = await request.json();

    switch (action) {
      case 'bulk_approve':
        // Update multiple appraisals to approved status
        await executeQuery(async (prisma) => {
          await prisma.performance_reviews.updateMany({
          where: {
            id: {
              in: appraisalIds
            }
          },
          data: {
            reviewStatus: 'COMPLETED',
            updatedAt: new Date()
          }
          });
        });

        return NextResponse.json({
          success: true,
          message: `${appraisalIds.length} appraisals approved successfully`
        });

      case 'bulk_status_update':
        await executeQuery(async (prisma) => {
          await prisma.performance_reviews.updateMany({
          where: {
            id: {
              in: appraisalIds
            }
          },
          data: {
            reviewStatus: data.status.toUpperCase(),
            updatedAt: new Date()
          }
          });
        });

        return NextResponse.json({
          success: true,
          message: `${appraisalIds.length} appraisals updated successfully`
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Bulk appraisals POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}