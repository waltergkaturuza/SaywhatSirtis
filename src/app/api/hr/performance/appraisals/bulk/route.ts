import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { executeQuery } from '@/lib/prisma';
import { canViewAllPerformance } from '@/lib/hr/performance-access';

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
        roles: true,
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

    const canViewAllAppraisals = canViewAllPerformance(user, {
      user: {
        roles: (session.user as { roles?: string[] }).roles,
        permissions: (session.user as { permissions?: string[] }).permissions
      }
    });

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    const filters: any[] = []
    if (department && department !== 'all') {
      filters.push({ employees: { departments: { name: department } } })
    }
    if (!canViewAllAppraisals) {
      const employee = await executeQuery(async (prisma) => {
        return prisma.employees.findUnique({ where: { userId: user.id }, select: { id: true } })
      })
      filters.push({
        OR: [
          { supervisorId: user.id },
          { reviewerId: user.id },
          ...(employee ? [{ employeeId: employee.id }, { supervisorId: employee.id }, { reviewerId: employee.id }] : [])
        ]
      })
    }
    const whereClause = filters.length > 0 ? { AND: filters } : {}

    try {
      const appraisals = await executeQuery(async (prisma) => {
        return prisma.performance_appraisals.findMany({
          where: whereClause,
          include: {
            employees: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                departments: { select: { name: true } }
              }
            },
            performance_plans: { select: { planYear: true, planPeriod: true, endDate: true } },
            users_performance_appraisals_supervisorIdTousers: {
              select: { firstName: true, lastName: true }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });
      });

      const transformedAppraisals = appraisals.map(appraisal => {
        const overdue = appraisal.submittedAt
          && !appraisal.approvedAt
          && appraisal.submittedAt.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
        let listStatus = 'draft'
        if (overdue && !['approved', 'completed'].includes(appraisal.status)) listStatus = 'overdue'
        else if (appraisal.status === 'draft') listStatus = 'draft'
        else if (['submitted', 'supervisor_review'].includes(appraisal.status)) listStatus = 'pending-review'
        else if (['supervisor_approved', 'reviewer_assessment', 'revision_requested'].includes(appraisal.status)) listStatus = 'in-progress'
        else if (['approved', 'completed'].includes(appraisal.status)) listStatus = 'completed'

        return {
          id: appraisal.id,
          employeeName: `${appraisal.employees?.firstName || ''} ${appraisal.employees?.lastName || ''}`.trim() || 'Unknown Employee',
          employeeId: appraisal.employees?.id || appraisal.employeeId,
          department: appraisal.employees?.departments?.name || 'Unknown',
          position: appraisal.employees?.position || 'Unknown',
          period: appraisal.performance_plans?.planPeriod || String(appraisal.performance_plans?.planYear || ''),
          overallRating: appraisal.overallRating,
          status: listStatus,
          supervisor: appraisal.users_performance_appraisals_supervisorIdTousers
            ? `${appraisal.users_performance_appraisals_supervisorIdTousers.firstName || ''} ${appraisal.users_performance_appraisals_supervisorIdTousers.lastName || ''}`.trim()
            : 'Unknown Supervisor',
          dueDate: appraisal.performance_plans?.endDate?.toISOString().split('T')[0] || null,
          lastUpdated: appraisal.updatedAt?.toISOString().split('T')[0] || appraisal.createdAt?.toISOString().split('T')[0] || null,
          completionPercentage: calculateCompletionPercentage(appraisal)
        }
      }).filter((appraisal) => !status || status === 'all' || appraisal.status === status);

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

  if (review.comments) completedFields++;
  if (review.supervisorApprovedAt) completedFields++;
  if (review.reviewerApprovedAt) completedFields++;
  if (review.overallRating) completedFields++;
  if (review.status && review.status !== 'draft') completedFields++;

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
        role: true,
        roles: true
      }
      });
    });

    if (!user || !canViewAllPerformance(user, {
      user: {
        roles: (session.user as { roles?: string[] }).roles,
        permissions: (session.user as { permissions?: string[] }).permissions
      }
    })) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { action, appraisalIds, data } = await request.json();

    switch (action) {
      case 'bulk_approve':
        // Update multiple appraisals to approved status
        await executeQuery(async (prisma) => {
          await prisma.performance_appraisals.updateMany({
          where: {
            id: {
              in: appraisalIds
            }
          },
          data: {
            status: 'approved',
            approvedAt: new Date(),
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
          await prisma.performance_appraisals.updateMany({
          where: {
            id: {
              in: appraisalIds
            }
          },
          data: {
            status: String(data.status || 'draft').toLowerCase().replace(/-/g, '_'),
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