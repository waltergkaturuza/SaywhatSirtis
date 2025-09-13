import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: employeeId } = await params
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()

    // Validate employee exists
    const existingEmployee = await prisma.employees.findUnique({
      where: { id: employeeId }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Update employee status to ARCHIVED and revoke access
    const updatedEmployee = await prisma.employees.update({
      where: { id: employeeId },
      data: {
        status: 'ARCHIVED',
        archived_at: new Date(),
        archive_reason: body.reason || 'Other',
        access_revoked: true, // Automatically revoke access when archiving
        updatedAt: new Date()
      },
      include: {
        departments: {
          select: {
            name: true
          }
        }
      }
    })

    // Create audit log entry for archiving
    try {
      await prisma.audit_logs.create({
        data: {
          id: randomUUID(),
          action: 'ARCHIVE_EMPLOYEE',
          resource: 'Employee',
          resourceId: employeeId,
          userId: session.user.id,
          details: {
            employeeName: `${existingEmployee.firstName} ${existingEmployee.lastName}`,
            previousStatus: existingEmployee.status,
            newStatus: 'ARCHIVED',
            reason: 'Employee archived via HR dashboard'
          }
        }
      })
    } catch (auditError) {
      // Log audit error but don't fail the archive operation
      console.error('Failed to create audit log:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'Employee archived successfully',
      employee: updatedEmployee
    })

  } catch (error) {
    console.error('Error archiving employee:', error)
    return NextResponse.json(
      { error: 'Failed to archive employee' },
      { status: 500 }
    )
  }
}
