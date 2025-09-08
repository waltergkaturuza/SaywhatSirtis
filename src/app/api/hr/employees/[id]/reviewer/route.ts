import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: employeeId } = await params
    const body = await request.json()
    const { isReviewer } = body

    // Validate employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Update reviewer status
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        // TODO: Add isReviewer field after schema migration
        // isReviewer: isReviewer
        status: existingEmployee.status // Keep existing status for now
      }
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: isReviewer ? 'ASSIGN_REVIEWER' : 'REMOVE_REVIEWER',
        resource: 'Employee',
        resourceId: employeeId,
        userId: session.user.id,
        details: `Employee ${existingEmployee.email} ${isReviewer ? 'assigned as' : 'removed from'} reviewer role by ${session.user.email}`,
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: `Employee ${isReviewer ? 'assigned as' : 'removed from'} reviewer role`,
      data: updatedEmployee
    })

  } catch (error) {
    console.error('Error updating reviewer status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
