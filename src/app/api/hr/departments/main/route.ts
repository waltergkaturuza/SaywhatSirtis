import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch main departments (no parent)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Fetch main departments only (no parentId)
    const mainDepartments = await prisma.departments.findMany({
      where: {
        parentId: null,
        isActive: true
      },
      include: {
        _count: {
          select: {
            other_departments: true,
            employees: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Format the response
    const formattedDepartments = mainDepartments.map(dept => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      description: dept.description,
      isActive: dept.isActive,
      type: 'main_department',
      subunitCount: dept._count.other_departments,
      employeeCount: dept._count.employees,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedDepartments,
      message: `Retrieved ${formattedDepartments.length} main departments`,
      meta: {
        totalCount: formattedDepartments.length,
        type: 'main_departments'
      }
    });

  } catch (error) {
    console.error('Error fetching main departments:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}