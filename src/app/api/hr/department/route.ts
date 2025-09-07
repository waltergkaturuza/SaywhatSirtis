import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/hr/department - Fetch all departments
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch departments with employee count
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            email: true
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
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform data for frontend
    const transformedDepartments = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      code: dept.code,
      manager: dept.manager,
      budget: dept.budget,
      location: dept.location,
      status: dept.status,
      employeeCount: dept._count.employees,
      employees: dept.employees,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      data: transformedDepartments,
      total: transformedDepartments.length
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch departments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/hr/department - Create new department
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

    const { name, description, code, manager, budget, location, status } = await request.json();

    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department name is required' 
        },
        { status: 400 }
      );
    }

    // Check if department name already exists
    const existingDept = await prisma.department.findUnique({
      where: { name: name.trim() }
    });

    if (existingDept) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department with this name already exists' 
        },
        { status: 409 }
      );
    }

    // Check if code already exists (if provided)
    if (code && code.trim() !== '') {
      const existingCode = await prisma.department.findUnique({
        where: { code: code.trim().toUpperCase() }
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

    // Create department
    const newDepartment = await prisma.department.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        code: code?.trim().toUpperCase() || null,
        manager: manager?.trim() || null,
        budget: budget ? parseFloat(budget) : null,
        location: location?.trim() || null,
        status: status || 'ACTIVE'
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
      message: 'Department created successfully',
      data: {
        id: newDepartment.id,
        name: newDepartment.name,
        description: newDepartment.description,
        code: newDepartment.code,
        manager: newDepartment.manager,
        budget: newDepartment.budget,
        location: newDepartment.location,
        status: newDepartment.status,
        employeeCount: newDepartment._count.employees,
        createdAt: newDepartment.createdAt.toISOString(),
        updatedAt: newDepartment.updatedAt.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create department',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/hr/department - Update department
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id, name, description, code, manager, budget, location, status } = await request.json();

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department ID is required' 
        },
        { status: 400 }
      );
    }

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
      const nameConflict = await prisma.department.findUnique({
        where: { name: name.trim() }
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
      const codeConflict = await prisma.department.findUnique({
        where: { code: code.trim().toUpperCase() }
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

// DELETE /api/hr/department - Delete department (reassign employees)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.delete') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const departmentName = searchParams.get('name');
    const reassignTo = searchParams.get('reassignTo');

    if (!departmentName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department name is required' 
        },
        { status: 400 }
      );
    }

    // Count employees in this department
    const employeeCount = await prisma.employee.count({
      where: {
        department: departmentName
      }
    });

    if (employeeCount > 0 && !reassignTo) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete department with ${employeeCount} employees. Please specify reassignTo parameter.` 
        },
        { status: 400 }
      );
    }

    if (employeeCount > 0 && reassignTo) {
      // Reassign employees to new department
      await prisma.employee.updateMany({
        where: {
          department: departmentName
        },
        data: {
          department: reassignTo
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: employeeCount > 0 
        ? `Reassigned ${employeeCount} employees to ${reassignTo}` 
        : 'Department deleted (no employees to reassign)'
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
