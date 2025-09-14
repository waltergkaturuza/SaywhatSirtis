import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all archived employees (archived employees)
    const archivedEmployees = await prisma.employees.findMany({
      where: { 
        status: 'ARCHIVED'
      },
      include: {
        departments: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Calculate stats
    const stats = {
      totalArchived: archivedEmployees.length,
      thisYear: archivedEmployees.filter(emp => 
        emp.updatedAt && new Date(emp.updatedAt).getFullYear() === new Date().getFullYear()
      ).length,
      accessRevoked: archivedEmployees.length, // All archived employees have revoked access
      dataRetained: archivedEmployees.length
    }

    // Transform data for frontend
    const transformedEmployees = archivedEmployees.map(emp => ({
      id: emp.id,
      employeeId: emp.employeeId,
      email: emp.email,
      username: `${emp.firstName} ${emp.lastName}`, // Using username field for display name
      department: emp.departments?.name || emp.department || 'N/A',
      position: emp.position || 'N/A',
      phone: emp.phoneNumber || 'N/A',
      archiveDate: emp.archived_at ? new Date(emp.archived_at) : new Date(emp.updatedAt),
      archiveReason: emp.archive_reason || 'Not specified',
      clearanceStatus: emp.access_revoked ? 'Revoked' : 'Pending',
      supervisor: 'N/A', // We can add this later if needed
      exitInterview: false, // Default value
      notes: 'N/A',
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
      lastLogin: null // We don't track this yet
    }))

    return NextResponse.json({
      success: true,
      data: {
        employees: transformedEmployees,
        stats,
        reasonsBreakdown: {
          'terminated': archivedEmployees.length,
          'resigned': 0,
          'retired': 0,
          'other': 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching archived employees:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch archived employees',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { employeeId, reason } = await request.json()

    if (!employeeId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee ID is required' 
      }, { status: 400 })
    }

    // Check if employee exists and is active
    const employee = await prisma.employees.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee not found' 
      }, { status: 404 })
    }

    if (employee.status === 'INACTIVE') {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee is already archived' 
      }, { status: 400 })
    }

    // Archive the employee
    const archivedEmployee = await prisma.employees.update({
      where: { id: employeeId },
      data: {
        status: 'INACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Employee archived successfully',
      data: {
        id: archivedEmployee.id,
        employeeId: archivedEmployee.employeeId,
        name: `${archivedEmployee.firstName} ${archivedEmployee.lastName}`,
        status: archivedEmployee.status,
        archiveDate: new Date().toISOString().split('T')[0],
        reason: reason || 'Terminated'
      }
    })

  } catch (error) {
    console.error('Error archiving employee:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to archive employee',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { employeeId } = await request.json()

    if (!employeeId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee ID is required' 
      }, { status: 400 })
    }

    // Check if employee exists and is archived
    const employee = await prisma.employees.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee not found' 
      }, { status: 404 })
    }

    if (employee.status === 'ACTIVE') {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee is not archived' 
      }, { status: 400 })
    }

    // Restore the employee
    const restoredEmployee = await prisma.employees.update({
      where: { id: employeeId },
      data: {
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Employee restored successfully',
      data: {
        id: restoredEmployee.id,
        employeeId: restoredEmployee.employeeId,
        name: `${restoredEmployee.firstName} ${restoredEmployee.lastName}`,
        status: restoredEmployee.status,
        restoreDate: new Date().toISOString().split('T')[0]
      }
    })

  } catch (error) {
    console.error('Error restoring employee:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to restore employee',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
