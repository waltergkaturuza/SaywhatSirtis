import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: requestId } = await params

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager') ||
                         session.user?.roles?.includes('hr_staff')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Find the employee (user) by ID
    const employee = await prisma.users.findUnique({
      where: { id: requestId },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        other_users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        }
      }
    })

    if (!employee) {
      return NextResponse.json({ 
        error: 'Employee not found',
        message: `Employee with ID ${requestId} does not exist.`,
        code: 'EMPLOYEE_NOT_FOUND'
      }, { status: 404 })
    }

    // Transform user data to employee format for frontend
    const transformedEmployee = {
      id: employee.id,
      employeeId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      position: employee.position,
      role: employee.role,
      department: employee.department,
      
      // Supervisor relationship
      supervisorId: employee.supervisorId,
      supervisor: employee.users,
      subordinates: employee.other_users,
      
      // Status and timestamps
      isActive: employee.isActive,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: transformedEmployee
    })

  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('PUT request received for employee update')
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('Unauthorized: no session or user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: requestId } = await params
    console.log('Request ID:', requestId)
    
    const formData = await request.json()
    console.log('Form data keys:', Object.keys(formData))
    console.log('Sample form data:', JSON.stringify(formData, null, 2))

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if employee exists
    const existingEmployee = await prisma.users.findUnique({
      where: { id: requestId }
    })

    if (!existingEmployee) {
      return NextResponse.json({ 
        error: 'Employee not found',
        message: `No employee found with ID ${requestId}.`,
        code: 'EMPLOYEE_NOT_FOUND'
      }, { status: 404 })
    }

    // Prepare update data (only include fields that should be updated)
    const updateData: any = {
      updatedAt: new Date()
    }

    // Only update fields that are provided and not undefined
    if (formData.firstName !== undefined) updateData.firstName = formData.firstName
    if (formData.lastName !== undefined) updateData.lastName = formData.lastName
    if (formData.email !== undefined) updateData.email = formData.email.toLowerCase().trim()
    if (formData.phoneNumber !== undefined) updateData.phoneNumber = formData.phoneNumber || null
    if (formData.position !== undefined) updateData.position = formData.position
    if (formData.department !== undefined) updateData.department = formData.department
    if (formData.role !== undefined) updateData.role = formData.role
    if (formData.isActive !== undefined) updateData.isActive = formData.isActive
    
    // Handle supervisor relationship
    if (formData.supervisorId !== undefined) {
      if (formData.supervisorId === 'no-supervisor' || !formData.supervisorId) {
        updateData.supervisorId = null
      } else {
        // Validate that the supervisor exists
        const supervisorExists = await prisma.users.findUnique({
          where: { id: formData.supervisorId },
          select: { id: true }
        })
        
        if (!supervisorExists) {
          console.error(`Supervisor with ID ${formData.supervisorId} not found`)
          updateData.supervisorId = null // Set to null if supervisor doesn't exist
        } else {
          updateData.supervisorId = formData.supervisorId
        }
      }
    }

    console.log(`Updating employee ${requestId} with data:`, updateData)

    // Update the employee
    const updatedEmployee = await prisma.users.update({
      where: { id: requestId },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        other_users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        }
      }
    })

    // Transform updated employee data for frontend
    const transformedEmployee = {
      id: updatedEmployee.id,
      employeeId: updatedEmployee.id,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      fullName: `${updatedEmployee.firstName || ''} ${updatedEmployee.lastName || ''}`.trim(),
      email: updatedEmployee.email,
      phoneNumber: updatedEmployee.phoneNumber,
      position: updatedEmployee.position,
      role: updatedEmployee.role,
      department: updatedEmployee.department,
      
      // Supervisor relationship
      supervisorId: updatedEmployee.supervisorId,
      supervisor: updatedEmployee.users,
      subordinates: updatedEmployee.other_users,
      
      // Status and timestamps
      isActive: updatedEmployee.isActive,
      createdAt: updatedEmployee.createdAt,
      updatedAt: updatedEmployee.updatedAt
    }

    console.log(`✅ Employee ${requestId} updated successfully`)

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: transformedEmployee
    })

  } catch (error) {
    console.error('Error updating employee:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', {
      message: errorMessage,
      code: errorCode,
      stack: errorStack
    })
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
