import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handlePrismaError,
  logError,
  HttpStatus,
  ErrorCodes
} from '@/lib/api-utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    // Get all archived employees (inactive users)
    const archivedEmployees = await prisma.user.findMany({
      where: { 
        isActive: false
      },
      select: {
        id: true,
        email: true,
        username: true,
        department: true,
        position: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        archiveReason: true,
        archiveDate: true,
        supervisor: true,
        exitInterview: true,
        clearanceStatus: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Calculate archive statistics
    const stats = {
      totalArchived: archivedEmployees.length,
      thisYear: archivedEmployees.filter(emp => 
        emp.archiveDate && new Date(emp.archiveDate).getFullYear() === new Date().getFullYear()
      ).length,
      accessRevoked: archivedEmployees.length, // All archived employees have revoked access
      dataRetained: archivedEmployees.length
    }

    // Calculate archive reasons breakdown
    const reasonsBreakdown = archivedEmployees.reduce((acc, emp) => {
      const reason = emp.archiveReason || 'other'
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const response = createSuccessResponse({
      employees: archivedEmployees,
      stats,
      reasonsBreakdown
    }, {
      message: `Retrieved ${archivedEmployees.length} archived employees`,
      meta: { count: archivedEmployees.length }
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/employees/archived',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    const body = await request.json()
    const { employeeId, reason, exitInterview, notes } = body

    // Find the employee
    const employee = await prisma.user.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      const { response, status } = createErrorResponse(
        'Employee not found',
        HttpStatus.NOT_FOUND,
        { code: ErrorCodes.NOT_FOUND }
      )
      return NextResponse.json(response, { status })
    }

    if (!employee.isActive) {
      const { response, status } = createErrorResponse(
        'Employee is already archived',
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Archive the employee
    const archivedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: {
        isActive: false,
        archiveDate: new Date(),
        archiveReason: reason,
        exitInterview: exitInterview || false,
        clearanceStatus: 'pending',
        notes: notes || null
      }
    })

    const response = createSuccessResponse(archivedEmployee, {
      message: `Employee ${employee.email} has been archived successfully`
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/employees/archived',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    const body = await request.json()
    const { employeeId, action } = body

    // Find the archived employee
    const employee = await prisma.user.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      const { response, status } = createErrorResponse(
        'Employee not found',
        HttpStatus.NOT_FOUND,
        { code: ErrorCodes.NOT_FOUND }
      )
      return NextResponse.json(response, { status })
    }

    if (action === 'restore') {
      if (employee.isActive) {
        const { response, status } = createErrorResponse(
          'Employee is already active',
          HttpStatus.BAD_REQUEST,
          { code: ErrorCodes.VALIDATION_ERROR }
        )
        return NextResponse.json(response, { status })
      }

      // Restore the employee
      const restoredEmployee = await prisma.user.update({
        where: { id: employeeId },
        data: {
          isActive: true,
          archiveDate: null,
          archiveReason: null,
          clearanceStatus: null
        }
      })

      const response = createSuccessResponse(restoredEmployee, {
        message: `Employee ${employee.email} has been restored successfully`
      })

      return NextResponse.json(response)
    }

    const { response, status } = createErrorResponse(
      'Invalid action specified',
      HttpStatus.BAD_REQUEST,
      { code: ErrorCodes.VALIDATION_ERROR }
    )
    return NextResponse.json(response, { status })
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/employees/archived',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}
