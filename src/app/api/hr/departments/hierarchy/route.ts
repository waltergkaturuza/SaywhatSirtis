import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch hierarchical department structure
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Get all departments with their relationships
    const allDepartments = await prisma.departments.findMany({
      where: { isActive: true },
      include: {
        other_departments: {
          where: { isActive: true },
          include: {
            _count: {
              select: { employees: true }
            }
          }
        },
        _count: {
          select: { 
            employees: true,
            other_departments: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Separate main departments from subunits
    const mainDepartments = allDepartments.filter(dept => !dept.parentId);
    
    // Build hierarchical structure
    const hierarchicalDepartments = mainDepartments.map(mainDept => {
      const subunits = mainDept.other_departments.map(subunit => ({
        id: subunit.id,
        name: subunit.name,
        code: subunit.code,
        description: subunit.description,
        type: 'subunit',
        parentId: mainDept.id,
        parentName: mainDept.name,
        parentCode: mainDept.code,
        displayName: `${mainDept.name} → ${subunit.name}`,
        shortDisplayName: `${subunit.name} (${subunit.code})`,
        employeeCount: subunit._count.employees,
        isActive: subunit.isActive,
        createdAt: subunit.createdAt,
        updatedAt: subunit.updatedAt
      }));

      return {
        id: mainDept.id,
        name: mainDept.name,
        code: mainDept.code,
        description: mainDept.description,
        type: 'main_department',
        displayName: mainDept.name,
        shortDisplayName: `${mainDept.name} (${mainDept.code})`,
        employeeCount: mainDept._count.employees,
        subunitCount: mainDept._count.other_departments,
        subunits: subunits,
        isActive: mainDept.isActive,
        createdAt: mainDept.createdAt,
        updatedAt: mainDept.updatedAt
      };
    });

    // Also provide a flat list for easy iteration
    const flatDepartmentList: any[] = [];
    hierarchicalDepartments.forEach(mainDept => {
      flatDepartmentList.push({
        ...mainDept,
        subunits: undefined // Remove subunits from flat list
      });
      flatDepartmentList.push(...mainDept.subunits);
    });

    return NextResponse.json({
      success: true,
      data: {
        hierarchical: hierarchicalDepartments,
        flat: flatDepartmentList
      },
      message: `Retrieved ${hierarchicalDepartments.length} main departments with ${flatDepartmentList.length - hierarchicalDepartments.length} subunits`,
      meta: {
        mainDepartmentCount: hierarchicalDepartments.length,
        subunitCount: flatDepartmentList.length - hierarchicalDepartments.length,
        totalDepartmentCount: flatDepartmentList.length
      }
    });

  } catch (error) {
    console.error('Error fetching hierarchical departments:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}