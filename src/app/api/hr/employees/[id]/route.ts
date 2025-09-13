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

    const { id: employeeId } = await params

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager') ||
                         session.user?.roles?.includes('hr_staff')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch employee with all details including relationships
    const employee = await prisma.employees.findUnique({
      where: { id: employeeId },
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

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: employeeId } = await params
    const formData = await request.json()

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Validate employee exists
    const existingEmployee = await prisma.users.findUnique({
      where: { id: employeeId }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName || null,
      email: formData.email.toLowerCase().trim(),
      phoneNumber: formData.phoneNumber || null,
      alternativePhone: formData.alternativePhone || null,
      address: formData.address || null,
      
      // Personal Information
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      gender: formData.gender || null,
      nationality: formData.nationality || null,
      nationalId: formData.nationalId || null,
      passportNumber: formData.passportNumber || null,
      
      // Emergency Contact
      emergencyContact: formData.emergencyContact || null,
      emergencyPhone: formData.emergencyPhone || null,
      
      // Work Information
      department: formData.department || null,
      departmentId: formData.departmentId || null,
      position: formData.position,
      employmentType: formData.employmentType || 'FULL_TIME',
      salary: formData.salary ? parseFloat(formData.salary) : null,
      currency: formData.currency || 'USD',
      status: formData.status || 'ACTIVE',
      
      // Supervisor and Role fields
      supervisorId: formData.supervisorId || null,
      isSupervisor: formData.isSupervisor || false,
      isReviewer: formData.isReviewer || false,
      
      // Benefits fields
      medicalAid: formData.medicalAid || false,
      funeralCover: formData.funeralCover || false,
      vehicleBenefit: formData.vehicleBenefit || false,
      fuelAllowance: formData.fuelAllowance || false,
      airtimeAllowance: formData.airtimeAllowance || false,
      otherBenefits: formData.otherBenefits || [],
      
      updatedAt: new Date()
    }

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
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        action: 'UPDATE',
        resource: 'Employee',
        resourceId: employeeId,
        userId: session.user.id,
        details: `Employee ${updatedEmployee.email} updated by ${session.user.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    })

  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
