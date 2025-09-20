import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch subunits (have parentId) - optionally filter by main department
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    // Build query for subunits
    let whereClause: any = {
      parentId: { not: null },
      isActive: true
    };

    // If parentId is specified, filter by that main department
    if (parentId) {
      whereClause.parentId = parentId;
    }

    // Fetch subunits
    const subunits = await prisma.departments.findMany({
      where: whereClause,
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            employees: true,
            other_departments: true
          }
        }
      },
      orderBy: [
        { departments: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    // Format the response
    const formattedSubunits = subunits.map(dept => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      description: dept.description,
      isActive: dept.isActive,
      type: 'subunit',
      parentDepartment: dept.departments,
      employeeCount: dept._count.employees,
      subunitCount: dept._count.other_departments,
      displayName: `${dept.departments?.name} → ${dept.name}`,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedSubunits,
      message: parentId 
        ? `Retrieved ${formattedSubunits.length} subunits for specified department`
        : `Retrieved ${formattedSubunits.length} subunits`,
      meta: {
        totalCount: formattedSubunits.length,
        type: 'subunits',
        filteredByParent: !!parentId
      }
    });

  } catch (error) {
    console.error('Error fetching subunits:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}