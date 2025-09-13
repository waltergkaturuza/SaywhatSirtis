import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomUUID } from 'crypto'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    const { id: employeeId } = await params

    // Check if employee exists and is archived
    const existingEmployee = await prisma.employees.findUnique({
      where: { id: employeeId }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      )
    }

    if (existingEmployee.status !== 'ARCHIVED') {
      return NextResponse.json(
        { success: false, message: "Employee is not archived" },
        { status: 400 }
      )
    }

    // Restore the employee
    const restoredEmployee = await prisma.employees.update({
      where: { id: employeeId },
      data: {
        status: 'ACTIVE',
        archived_at: null,
        archive_reason: null,
        access_revoked: false,
        updatedAt: new Date()
      }
    })

    // Create audit log entry
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        action: 'RESTORE',
        resource: 'Employee',
        resourceId: employeeId,
        userId: session.user.id,
        details: `Employee ${existingEmployee.email} restored by ${session.user.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: "Employee restored successfully",
      data: restoredEmployee
    })

  } catch (error) {
    console.error("Error restoring employee:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
