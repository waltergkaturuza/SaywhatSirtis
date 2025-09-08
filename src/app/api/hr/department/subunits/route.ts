import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/hr/department/subunits - Get all main departments for subunit creation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.read') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get main departments (level 0) that can have subunits
    const mainDepartments = await prisma.department.findMany({
      where: {
        level: 0,
        status: 'ACTIVE'
      },
      include: {
        _count: {
          select: {
            subunits: true,
            employees: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: mainDepartments.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        manager: dept.manager,
        subunitCount: dept._count.subunits,
        employeeCount: dept._count.employees
      })),
      message: `Found ${mainDepartments.length} main departments`
    });

  } catch (error) {
    console.error('Error fetching main departments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch main departments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/hr/department/subunits - Create a new subunit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.create') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { parentId, name, description, code, manager, budget, location } = await request.json();

    if (!parentId || !name?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parent department ID and subunit name are required' 
        },
        { status: 400 }
      );
    }

    // Validate parent department exists
    const parentDept = await prisma.department.findUnique({
      where: { id: parentId }
    });

    if (!parentDept) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parent department not found' 
        },
        { status: 404 }
      );
    }

    // Create subunit name with parent context
    const subunitName = `${parentDept.name} - ${name.trim()}`;

    // Check if subunit name already exists
    const existingSubunit = await prisma.department.findUnique({
      where: { name: subunitName }
    });

    if (existingSubunit) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A subunit with this name already exists in the parent department' 
        },
        { status: 409 }
      );
    }

    // Generate subunit code
    const subunitCode = code?.trim().toUpperCase() || 
                       `${parentDept.code || parentDept.name.substring(0, 3).toUpperCase()}-${name.trim().substring(0, 3).toUpperCase()}`;

    // Check if code already exists
    if (subunitCode) {
      const existingCode = await prisma.department.findUnique({
        where: { code: subunitCode }
      });

      if (existingCode) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Department with this code already exists' 
          },
          { status: 409 }
        );
      }
    }

    // Create the subunit
    const newSubunit = await prisma.department.create({
      data: {
        name: subunitName,
        description: description?.trim() || `${name.trim()} subunit of ${parentDept.name}`,
        code: subunitCode,
        manager: manager?.trim() || null,
        budget: budget ? parseFloat(budget) : null,
        location: location?.trim() || parentDept.location,
        status: 'ACTIVE',
        parentId: parentId,
        level: parentDept.level + 1
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
            manager: true
          }
        },
        _count: {
          select: {
            employees: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subunit created successfully',
      data: {
        id: newSubunit.id,
        name: newSubunit.name,
        description: newSubunit.description,
        code: newSubunit.code,
        manager: newSubunit.manager,
        budget: newSubunit.budget,
        location: newSubunit.location,
        status: newSubunit.status,
        level: newSubunit.level,
        parentId: newSubunit.parentId,
        parent: newSubunit.parent,
        employeeCount: newSubunit._count.employees,
        createdAt: newSubunit.createdAt.toISOString(),
        updatedAt: newSubunit.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating subunit:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create subunit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
