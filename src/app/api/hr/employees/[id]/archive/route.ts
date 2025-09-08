import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handlePrismaError, withRetry, createErrorResponse, createSuccessResponse } from '@/lib/error-handler'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { id: employeeId } = await params
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return createErrorResponse('Insufficient permissions', 403)
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch (parseError) {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    // Validate employee exists with retry logic
    const existingEmployee = await withRetry(async () => {
      return await prisma.employee.findUnique({
        where: { id: employeeId }
      })
    })

    if (!existingEmployee) {
      return createErrorResponse('Employee not found', 404)
    }

    if (existingEmployee.status === 'ARCHIVED') {
      return createErrorResponse('Employee is already archived', 400)
    }

    // Update employee status to ARCHIVED with retry logic
    const updatedEmployee = await withRetry(async () => {
      return await (prisma.employee.update as any)({
        where: { id: employeeId },
        data: {
          status: 'ARCHIVED',
          archivedAt: new Date(),
          archiveReason: body.reason || 'Other',
          accessRevoked: true,
          updatedAt: new Date()
        },
        include: {
          departmentRef: {
            select: {
              name: true
            }
          }
        }
      })
    })

    // Create audit log entry (non-blocking)
    try {
      await withRetry(async () => {
        return await prisma.auditLog.create({
          data: {
            action: 'ARCHIVE_EMPLOYEE',
            resource: 'Employee',
            resourceId: employeeId,
            userId: session.user.id,
            details: `Employee ${existingEmployee.firstName} ${existingEmployee.lastName} archived with reason: ${body.reason || 'Other'}`,
            timestamp: new Date(),
            ipAddress: request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
          }
        })
      })
    } catch (auditError) {
      console.error('Failed to create audit log for archive operation:', auditError)
      // Don't fail the operation if audit logging fails
    }

    return createSuccessResponse(updatedEmployee, 'Employee archived successfully')

  } catch (error) {
    console.error('Error in archive employee route:', error)
    const { error: apiError, status } = handlePrismaError(error)
    return createErrorResponse(apiError, status)
  }
}
