import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - Allow HR role and users with HR permissions
    const userRole = session.user?.role || session.user?.roles?.[0]
    const hasPermission = 
      userRole === 'HR' ||
      userRole === 'SUPERUSER' ||
      userRole === 'SYSTEM_ADMINISTRATOR' ||
      session.user?.permissions?.includes('hr.view') ||
      session.user?.permissions?.includes('hr.full_access') ||
      session.user?.roles?.includes('admin') ||
      session.user?.roles?.includes('hr_manager') ||
      session.user?.roles?.includes('hr_staff')

    if (!hasPermission) {
      console.log('Permission denied for user:', session.user?.email, 'Role:', userRole, 'Permissions:', session.user?.permissions)
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch employees who are marked as supervisors or reviewers
    const supervisorEmployees = await executeQuery(async (prisma) => {
      return prisma.employees.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { is_supervisor: true },
            { is_reviewer: true }
          ]
        },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true
            }
          }
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' }
        ]
      })
    })

    // Also include users with supervisor-like position titles as fallback
    const positionBasedSupervisors = await executeQuery(async (prisma) => {
      return prisma.employees.findMany({
        where: {
          status: 'ACTIVE',
          AND: [
            {
              OR: [
                { is_supervisor: { not: true } },
                { is_reviewer: { not: true } }
              ]
            },
            {
              position: {
                contains: 'manager',
                mode: 'insensitive'
              }
            }
          ]
        },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true
            }
          }
        }
      })
    })

    // Combine both lists and remove duplicates
    const allSupervisors = [...supervisorEmployees, ...positionBasedSupervisors]
    const uniqueSupervisors = allSupervisors.filter((supervisor, index, self) => 
      index === self.findIndex(s => s.id === supervisor.id)
    )

    // Transform the data for frontend
    const supervisors = uniqueSupervisors
      .filter(emp => emp.users && emp.users.isActive) // Only active users
      .map(emp => ({
        id: emp.users.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        position: emp.position,
        department: emp.department,
        email: emp.email,
        isSupervisor: emp.is_supervisor || false,
        isReviewer: emp.is_reviewer || false
      }))

    return NextResponse.json({
      success: true,
      data: supervisors
    })

  } catch (error) {
    console.error('Error fetching supervisors:', error)
    
    // Check if it's a database connectivity issue
    if (error instanceof Error && error.message?.includes("Can't reach database server")) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your internet connection and try again.',
        code: 'DB_CONNECTION_FAILED'
      }, { status: 503 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching supervisors.',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
