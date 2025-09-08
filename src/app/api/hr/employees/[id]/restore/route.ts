import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handlePrismaError, withRetry, createErrorResponse, createSuccessResponse } from '@/lib/error-handler'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return createErrorResponse('Not authenticated', 401)
    }

    const { id: employeeId } = await params

    // Check if employee exists and is archived with retry logic
    const existingEmployee = await withRetry(async () => {
      return await prisma.employee.findUnique({
        where: { id: employeeId }
      })
    })

    if (!existingEmployee) {
      return createErrorResponse('Employee not found', 404)
    }

    if (existingEmployee.status !== 'ARCHIVED') {
      return createErrorResponse('Employee is not archived', 400)
    }

    // Restore the employee with retry logic
    const restoredEmployee = await withRetry(async () => {
      return await (prisma.employee.update as any)({
        where: { id: employeeId },
        data: {
          status: 'ACTIVE',
          archivedAt: null,
          archiveReason: null,
          accessRevoked: false
        }
      })
    })

    // Create audit log entry (non-blocking)
    try {
      await withRetry(async () => {
        return await prisma.auditLog.create({
          data: {
            action: 'RESTORE',
            resource: 'Employee',
            resourceId: employeeId,
            userId: session.user.id,
            details: `Employee ${existingEmployee.firstName} ${existingEmployee.lastName} restored from archived status`,
            timestamp: new Date(),
            ipAddress: request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
          }
        })
      })
    } catch (auditError) {
      console.error('Failed to create audit log for restore operation:', auditError)
      // Don't fail the operation if audit logging fails
    }

    return createSuccessResponse(restoredEmployee, "Employee restored successfully")

  } catch (error) {
    console.error("Error in restore employee route:", error)
    const { error: apiError, status } = handlePrismaError(error)
    return createErrorResponse(apiError, status)
  }
}
