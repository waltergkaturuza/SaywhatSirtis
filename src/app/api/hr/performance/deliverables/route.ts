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
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to recent deliverables
    });

    // Transform deliverables for frontend
    const deliverables = responsibilities.map(resp => ({
      id: resp.id,
      title: resp.title,
      description: resp.description,
      weight: resp.weight,
      planId: resp.planId,
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
    }));

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

