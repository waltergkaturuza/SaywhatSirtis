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

    // Get unique departments from employee records
    const departmentData = await prisma.employee.findMany({
      select: {
        department: true
      },
      distinct: ['department']
    });

    // Transform to match expected format
    const departments = departmentData
      .filter(item => item.department && item.department.trim()) // Filter out null/undefined/empty departments
      .map(item => {
        const deptName = item.department as string; // Type assertion after filter
        return {
          id: deptName.toLowerCase().replace(/\s+/g, '_'),
          name: deptName,
          description: `${deptName} Department`,
          employeeCount: 0 // Will be calculated separately
        };
      });

    // Get employee count for each department
    for (const dept of departments) {
      const count = await prisma.employee.count({
        where: {
          department: dept.name,
          status: 'ACTIVE'
        }
      });
      dept.employeeCount = count;
    }
    
    return NextResponse.json({
      success: true,
      data: departments
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

// POST /api/hr/department - Create new department (by adding employee)
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

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department name is required' 
        },
        { status: 400 }
      );
    }

    // Check if department already exists
    const existingDept = await prisma.employee.findFirst({
      where: {
        department: name
      }
    });

    if (existingDept) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department already exists' 
        },
        { status: 409 }
      );
    }

    // Since we don't have a separate Department model,
    // we'll return success but note that departments are created
    // when employees are assigned to them
    return NextResponse.json({
      success: true,
      message: 'Department will be created when first employee is assigned',
      data: {
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name: name,
        description: description || `${name} Department`,
        employeeCount: 0
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

// PUT /api/hr/department - Update department (rename all employees' department)
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

    const { oldName, newName, description } = await request.json();

    if (!oldName || !newName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Both old and new department names are required' 
        },
        { status: 400 }
      );
    }

    // Update all employees with the old department name
    const updateResult = await prisma.employee.updateMany({
      where: {
        department: oldName
      },
      data: {
        department: newName
      }
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResult.count} employees to new department name`,
      data: {
        id: newName.toLowerCase().replace(/\s+/g, '_'),
        name: newName,
        description: description || `${newName} Department`,
        employeeCount: updateResult.count
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
