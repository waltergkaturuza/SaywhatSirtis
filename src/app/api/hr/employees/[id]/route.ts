import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

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

    // Handle both User IDs and Employee IDs - convert User ID to Employee ID if needed
    let employeeId = requestId
    let employee = null

    // First try as Employee ID
    employee = await prisma.employees.findUnique({
      where: { id: requestId },
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true
          }
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        other_employees: {
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

    // If not found, try as User ID (convert User ID to Employee ID)
    if (!employee) {
      console.log(`Employee not found with ID ${requestId}, trying as User ID...`)
      
      employee = await prisma.employees.findUnique({
        where: { userId: requestId },
        include: {
          departments: {
            select: {
              id: true,
              name: true,
              code: true,
              level: true
            }
          },
          employees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true
            }
          },
          other_employees: {
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
      
      if (employee) {
        console.log(`✅ Found employee by User ID: ${requestId} → Employee ID: ${employee.id}`)
        employeeId = employee.id // Update to use the actual employee ID
      }
    }

    if (!employee) {
      // Try to find a similar employee to provide helpful suggestions
      try {
        const similarEmployees = await prisma.employees.findMany({
          where: {
            OR: [
              { employeeId: { contains: employeeId.slice(-6) } }, // Last 6 chars
              { email: { contains: '@saywhat.org' } }
            ]
          },
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true
          },
          take: 3
        })

        if (similarEmployees.length > 0) {
          return NextResponse.json({ 
            error: 'Employee not found',
            message: `Employee with ID ${employeeId} does not exist. Did you mean one of these?`,
            suggestions: similarEmployees
          }, { status: 404 })
        }
      } catch (suggestionError) {
        console.log('Could not fetch suggestions:', suggestionError.message)
      }

      return NextResponse.json({ 
        error: 'Employee not found',
        message: `Employee with ID ${employeeId} does not exist. Please refresh the employee list.`,
        code: 'EMPLOYEE_NOT_FOUND'
      }, { status: 404 })
    }

    // Transform employee data for frontend
    const transformedEmployee = {
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName,
      fullName: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      alternativePhone: employee.alternativePhone,
      address: employee.address,
      
      // Personal Information
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      nationality: employee.nationality,
      nationalId: employee.nationalId,
      passportNumber: employee.passportNumber,
      
      // Emergency Contact
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      
      // Work Information
      department: employee.department,
      departmentId: employee.departmentId,
      departmentRef: employee.departments,
      position: employee.position,
      employmentType: employee.employmentType,
      startDate: employee.startDate,
      endDate: employee.endDate,
      hireDate: employee.hireDate,
      salary: employee.salary,
      currency: employee.currency,
      status: employee.status,
      
      // Supervisor and Role fields
      supervisorId: employee.supervisor_id,
      supervisor: employee.employees,
      subordinates: employee.other_employees,
      isSupervisor: employee.is_supervisor,
      isReviewer: employee.is_reviewer,
      
      // Benefits fields
      medicalAid: employee.medical_aid,
      funeralCover: employee.funeral_cover,
      vehicleBenefit: employee.vehicle_benefit,
      fuelAllowance: employee.fuel_allowance,
      airtimeAllowance: employee.airtime_allowance,
      otherBenefits: employee.other_benefits,
      
      // Archive fields
      archivedAt: employee.archived_at,
      archiveReason: employee.archive_reason,
      accessRevoked: employee.access_revoked,
      
      // Timestamps
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

    // Handle both User IDs and Employee IDs - find employee by either ID
    let existingEmployee = null
    let employeeId = requestId

    // First try as Employee ID
    existingEmployee = await prisma.employees.findUnique({
      where: { id: requestId }
    })

    // If not found, try as User ID
    if (!existingEmployee) {
      console.log(`Employee not found with ID ${requestId}, trying as User ID...`)
      
      existingEmployee = await prisma.employees.findUnique({
        where: { userId: requestId }
      })
      
      if (existingEmployee) {
        console.log(`✅ Found employee by User ID: ${requestId} → Employee ID: ${existingEmployee.id}`)
        employeeId = existingEmployee.id // Update to use the actual employee ID
      }
    }

    if (!existingEmployee) {
      console.log(`Employee not found with either ID: ${requestId}`)
      
      // Try to find current employees to provide helpful info
      try {
        const currentEmployees = await prisma.employees.findMany({
          select: {
            id: true,
            userId: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true
          },
          take: 5,
          orderBy: { updatedAt: 'desc' }
        })

        return NextResponse.json({ 
          error: 'Employee not found',
          message: `No employee found with ID ${requestId} (tried both Employee ID and User ID).`,
          suggestion: 'Please refresh your browser and try again. The employee list may be outdated.',
          currentEmployees: currentEmployees,
          requestId: requestId,
          code: 'EMPLOYEE_NOT_FOUND'
        }, { status: 404 })
      } catch (listError) {
        console.error('Error fetching employee suggestions:', listError.message)
        return NextResponse.json({ 
          error: 'Employee not found',
          message: `No employee found with ID ${requestId}. Please refresh the employee list.`,
          code: 'EMPLOYEE_NOT_FOUND'
        }, { status: 404 })
      }
    }

    // Prepare update data (only include fields that should be updated)
    const updateData: any = {
      updatedAt: new Date()
    }

    // Only update fields that are provided and not undefined
    if (formData.firstName !== undefined) updateData.firstName = formData.firstName
    if (formData.lastName !== undefined) updateData.lastName = formData.lastName
    if (formData.middleName !== undefined) updateData.middleName = formData.middleName || null
    if (formData.email !== undefined) updateData.email = formData.email.toLowerCase().trim()
    if (formData.phoneNumber !== undefined) updateData.phoneNumber = formData.phoneNumber || null
    if (formData.alternativePhone !== undefined) updateData.alternativePhone = formData.alternativePhone || null
    if (formData.address !== undefined) updateData.address = formData.address || null
    
    // Personal Information
    if (formData.dateOfBirth !== undefined) updateData.dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
    if (formData.gender !== undefined) updateData.gender = formData.gender || null
    if (formData.nationality !== undefined) updateData.nationality = formData.nationality || null
    if (formData.nationalId !== undefined) updateData.nationalId = formData.nationalId || null
    if (formData.passportNumber !== undefined) updateData.passportNumber = formData.passportNumber || null
    
    // Emergency Contact
    if (formData.emergencyContact !== undefined) updateData.emergencyContact = formData.emergencyContact || null
    if (formData.emergencyPhone !== undefined) updateData.emergencyPhone = formData.emergencyPhone || null
    
    // Work Information
    if (formData.department !== undefined) updateData.department = formData.department || null
    if (formData.departmentId !== undefined) updateData.departmentId = formData.departmentId || null
    if (formData.position !== undefined) updateData.position = formData.position
    if (formData.employmentType !== undefined) updateData.employmentType = formData.employmentType || 'FULL_TIME'
    if (formData.startDate !== undefined) updateData.startDate = formData.startDate ? new Date(formData.startDate) : existingEmployee.startDate
    if (formData.hireDate !== undefined) updateData.hireDate = formData.hireDate ? new Date(formData.hireDate) : null
    if (formData.endDate !== undefined) updateData.endDate = formData.endDate ? new Date(formData.endDate) : null
    if (formData.salary !== undefined) updateData.salary = formData.salary ? parseFloat(formData.salary) : null
    if (formData.currency !== undefined) updateData.currency = formData.currency || 'USD'
    if (formData.status !== undefined) updateData.status = formData.status || 'ACTIVE'
    
    // Supervisor and Role fields - validate supervisor exists
    if (formData.supervisorId !== undefined) {
      if (formData.supervisorId === 'no-supervisor' || !formData.supervisorId) {
        updateData.supervisor_id = null
      } else {
        // Validate that the supervisor exists
        const supervisorExists = await prisma.employees.findUnique({
          where: { id: formData.supervisorId },
          select: { id: true }
        })
        
        if (!supervisorExists) {
          console.error(`Supervisor with ID ${formData.supervisorId} not found`)
          updateData.supervisor_id = null // Set to null if supervisor doesn't exist
        } else {
          updateData.supervisor_id = formData.supervisorId
        }
      }
    }
    if (formData.isSupervisor !== undefined) updateData.is_supervisor = formData.isSupervisor || false
    if (formData.isReviewer !== undefined) updateData.is_reviewer = formData.isReviewer || false
    
    // Benefits fields
    if (formData.medicalAid !== undefined) updateData.medical_aid = formData.medicalAid || false
    if (formData.funeralCover !== undefined) updateData.funeral_cover = formData.funeralCover || false
    if (formData.vehicleBenefit !== undefined) updateData.vehicle_benefit = formData.vehicleBenefit || false
    if (formData.fuelAllowance !== undefined) updateData.fuel_allowance = formData.fuelAllowance || false
    if (formData.airtimeAllowance !== undefined) updateData.airtime_allowance = formData.airtimeAllowance || false
    if (formData.otherBenefits !== undefined) updateData.other_benefits = formData.otherBenefits || []

    // Update employee
    const updatedEmployee = await prisma.employees.update({
      where: { id: employeeId },
      data: updateData,
      include: {
        departments: true,
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Create audit log entry
    const { createAuditLog } = await import('@/lib/api-utils')
    await createAuditLog(
      prisma,
      session.user.email,
      'UPDATE',
      'Employee',
      employeeId,
      `Employee ${updatedEmployee.email} updated by ${session.user.email}`,
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown'
    )

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
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
