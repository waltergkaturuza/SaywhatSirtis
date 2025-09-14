import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handlePrismaError,
  validateRequiredFields,
  validateEmail,
  sanitizeInput,
  logError,
  HttpStatus,
  ErrorCodes
} from '@/lib/api-utils'

export async function GET() {
  try {
    // Authentication required for production
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    // Get all active employees with their user data
    const employees = await prisma.employees.findMany({
      where: { 
        status: 'ACTIVE'
      },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { firstName: 'asc' }
    })

    // Transform employee data for frontend
    const transformedEmployees = employees.map((employee: any) => {
      return {
        // Basic employee info
        id: employee.id,
        name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
        email: employee.email,
        department: employee.department || 'N/A',
        position: employee.position || 'N/A',
        phone: employee.phoneNumber || 'N/A',
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        location: employee.location,
        bio: employee.bio,
        
        // Employee-specific data
        employeeId: employee.employeeId,
        salary: employee.salary,
        hireDate: employee.hireDate ? employee.hireDate.toISOString().split('T')[0] : null,
        startDate: employee.startDate ? employee.startDate.toISOString().split('T')[0] : null,
        employmentType: employee.employmentType || 'FULL_TIME',
        status: employee.status || 'ACTIVE',
        supervisorId: employee.supervisor_id,
        supervisor: employee.employees,
        isSupervisor: employee.is_supervisor || false,
        isReviewer: employee.is_reviewer || false,
        
        // Default user-specific data (since users relation is not available)
        roles: [],
        role: 'employee',
        isActive: true,
        
        // Benefits
        benefits: {
          medicalAid: employee.medical_aid || false,
          funeralCover: employee.funeral_cover || false,
          vehicleBenefit: employee.vehicle_benefit || false,
          fuelAllowance: employee.fuel_allowance || false,
          airtimeAllowance: employee.airtime_allowance || false,
          other: employee.other_benefits || []
        }
      }
    })

    const response = createSuccessResponse(transformedEmployees, {
      message: `Retrieved ${transformedEmployees.length} employees`,
      meta: { 
        totalEmployees: employees.length
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/employees',
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
    const { formData } = body

    // Validate required fields
    const validationError = validateRequiredFields(formData, [
      'email', 'position'
    ])
    
    // Department is now optional - employees can be created without departments
    
    if (validationError) {
      const { response, status } = createErrorResponse(
        validationError,
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      const { response, status } = createErrorResponse(
        'Invalid email format',
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Check if employee email already exists
    const existingEmployee = await prisma.employees.findUnique({
      where: { email: formData.email }
    })

    if (existingEmployee) {
      const { response, status } = createErrorResponse(
        'Employee with this email already exists',
        HttpStatus.CONFLICT,
        { code: ErrorCodes.DUPLICATE_ENTRY }
      )
      return NextResponse.json(response, { status })
    }

    // Check if user email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: formData.email }
    })

    if (existingUser) {
      const { response, status } = createErrorResponse(
        'User with this email already exists',
        HttpStatus.CONFLICT,
        { code: ErrorCodes.DUPLICATE_ENTRY }
      )
      return NextResponse.json(response, { status })
    }

    // Handle department validation and resolution
    let departmentName = formData.department || ''
    let validDepartmentId = null

    if (formData.departmentId) {
      // Validate that the departmentId exists
      const department = await prisma.departments.findUnique({
        where: { id: formData.departmentId },
        select: { id: true, name: true, status: true }
      })
      
      if (!department) {
        const { response, status } = createErrorResponse(
          'Invalid department selected',
          HttpStatus.BAD_REQUEST,
          { code: ErrorCodes.VALIDATION_ERROR }
        )
        return NextResponse.json(response, { status })
      }
      
      if (department.status !== 'ACTIVE') {
        const { response, status } = createErrorResponse(
          'Selected department is not active',
          HttpStatus.BAD_REQUEST,
          { code: ErrorCodes.VALIDATION_ERROR }
        )
        return NextResponse.json(response, { status })
      }
      
      validDepartmentId = department.id
      departmentName = department.name
    } else if (formData.department) {
      // Try to find department by name if only name is provided
      const department = await prisma.departments.findFirst({
        where: { 
          name: formData.department,
          status: 'ACTIVE'
        },
        select: { id: true, name: true }
      })
      
      if (department) {
        validDepartmentId = department.id
        departmentName = department.name
      } else {
        // Department name provided but doesn't exist - create it or use null
        console.warn(`Department "${formData.department}" not found, creating employee without department link`)
        departmentName = formData.department
        validDepartmentId = null
      }
    }

    // Generate unique employee ID
    let employeeId: string
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      const employeeCount = await prisma.employees.count()
      employeeId = `EMP${(employeeCount + 1 + attempts).toString().padStart(4, '0')}`
      
      const existingEmployeeId = await prisma.employees.findUnique({
        where: { employeeId },
        select: { id: true }
      })
      
      if (!existingEmployeeId) {
        isUnique = true
      } else {
        attempts++
      }
    }
    
    if (!isUnique) {
      // Fallback to timestamp-based ID
      employeeId = `EMP${Date.now().toString().slice(-8)}`
    }

    // Sanitize input data
    const sanitizedData = {
      employeeId,
      firstName: sanitizeInput(formData.firstName),
      lastName: sanitizeInput(formData.lastName),
      email: formData.email.toLowerCase().trim(),
      phoneNumber: formData.phoneNumber ? sanitizeInput(formData.phoneNumber) : null,
      department: sanitizeInput(departmentName || ''), // Keep for backward compatibility
      departmentId: validDepartmentId, // Use validated departmentId for proper relation
      position: sanitizeInput(formData.position),
      startDate: formData.hireDate ? new Date(formData.hireDate) : new Date(),
      hireDate: formData.hireDate ? new Date(formData.hireDate) : new Date(),
      salary: formData.salary ? parseFloat(formData.salary) : null,
      status: 'ACTIVE' as const,
      // Supervisor and role fields
      supervisorId: formData.supervisorId || null,
      isSupervisor: formData.isSupervisor || false,
      isReviewer: formData.isReviewer || false,
      // Benefits fields
      medicalAid: formData.medicalAid || false,
      funeralCover: formData.funeralCover || false,
      vehicleBenefit: formData.vehicleBenefit || false,
      fuelAllowance: formData.fuelAllowance || false,
      airtimeAllowance: formData.airtimeAllowance || false,
      otherBenefits: formData.otherBenefits || []
    }

    // Create user and employee in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account first
      const newUser = await tx.users.create({
        data: {
          id: randomUUID(),
          email: sanitizedData.email,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          department: sanitizedData.department,
          position: sanitizedData.position,
          role: 'USER',
          updatedAt: new Date()
        }
      })

      // Create employee record
      const newEmployee = await tx.employees.create({
        data: {
          id: randomUUID(),
          userId: newUser.id,
          employeeId: sanitizedData.employeeId,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          email: sanitizedData.email,
          phoneNumber: sanitizedData.phoneNumber,
          department: sanitizedData.department,
          departmentId: sanitizedData.departmentId,
          position: sanitizedData.position,
          startDate: sanitizedData.startDate,
          hireDate: sanitizedData.hireDate,
          salary: sanitizedData.salary,
          status: sanitizedData.status,
          supervisor_id: sanitizedData.supervisorId,
          is_supervisor: sanitizedData.isSupervisor,
          is_reviewer: sanitizedData.isReviewer,
          medical_aid: sanitizedData.medicalAid,
          funeral_cover: sanitizedData.funeralCover,
          vehicle_benefit: sanitizedData.vehicleBenefit,
          fuel_allowance: sanitizedData.fuelAllowance,
          airtime_allowance: sanitizedData.airtimeAllowance,
          other_benefits: sanitizedData.otherBenefits,
          updatedAt: new Date()
        }
      })

      return { newUser, newEmployee }
    })

    const { newEmployee } = result

    const response = createSuccessResponse({
      id: newEmployee.id,
      employeeId: newEmployee.employeeId,
      name: `${newEmployee.firstName} ${newEmployee.lastName}`,
      email: newEmployee.email,
      department: newEmployee.department,
      position: newEmployee.position,
      status: newEmployee.status
    }, {
      message: `Employee ${newEmployee.firstName} ${newEmployee.lastName} created successfully`
    })

    return NextResponse.json(response, { status: HttpStatus.CREATED })
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/employees',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}
