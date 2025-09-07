import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/hr/department/[id] - Get specific department
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch specific department
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        employees: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            position: true,
            email: true,
            phoneNumber: true,
            hireDate: true
          },
          orderBy: {
            firstName: 'asc'
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

    if (!department) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department not found' 
        },
        { status: 404 }
      );
    }

    // Transform data
    const transformedDepartment = {
      id: department.id,
      name: department.name,
      description: department.description,
      code: department.code,
      manager: department.manager,
      budget: department.budget,
      location: department.location,
      status: department.status,
      employeeCount: department._count.employees,
      employees: department.employees,
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: transformedDepartment
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch department',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/hr/department/[id] - Update specific department
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { name, description, code, manager, budget, location, status } = await request.json();

    // Check if department exists
    const existingDept = await prisma.department.findUnique({
      where: { id }
    });

    if (!existingDept) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department not found' 
        },
        { status: 404 }
      );
    }

    // Check if new name conflicts (if name is being changed)
    if (name && name.trim() !== existingDept.name) {
      const nameConflict = await prisma.department.findFirst({
        where: { 
          name: name.trim(),
          id: { not: id }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Department with this name already exists' 
          },
          { status: 409 }
        );
      }
    }

    // Check if new code conflicts (if code is being changed)
    if (code && code.trim() !== existingDept.code) {
      const codeConflict = await prisma.department.findFirst({
        where: { 
          code: code.trim().toUpperCase(),
          id: { not: id }
        }
      });

      if (codeConflict) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Department with this code already exists' 
          },
          { status: 409 }
        );
      }
    }

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name: name?.trim() || existingDept.name,
        description: description?.trim() || existingDept.description,
        code: code?.trim().toUpperCase() || existingDept.code,
        manager: manager?.trim() || existingDept.manager,
        budget: budget !== undefined ? (budget ? parseFloat(budget) : null) : existingDept.budget,
        location: location?.trim() || existingDept.location,
        status: status || existingDept.status
      },
      include: {
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
      message: 'Department updated successfully',
      data: {
        id: updatedDepartment.id,
        name: updatedDepartment.name,
        description: updatedDepartment.description,
        code: updatedDepartment.code,
        manager: updatedDepartment.manager,
        budget: updatedDepartment.budget,
        location: updatedDepartment.location,
        status: updatedDepartment.status,
        employeeCount: updatedDepartment._count.employees,
        createdAt: updatedDepartment.createdAt.toISOString(),
        updatedAt: updatedDepartment.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update department',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/department/[id] - Delete specific department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.delete') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if department exists
    const existingDept = await prisma.department.findUnique({
      where: { id },
      include: {
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

    if (!existingDept) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department not found' 
        },
        { status: 404 }
      );
    }

    // Check if department has active employees
    if (existingDept._count.employees > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete department with ${existingDept._count.employees} active employees. Please reassign employees first.` 
        },
        { status: 400 }
      );
    }

    // Delete department
    await prisma.department.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete department',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
