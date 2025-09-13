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

    // Get all active users with their employee data (left join to include users without employee records)
    const usersWithEmployees = await prisma.users.findMany({
      where: { 
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        roles: true,
        location: true,
        bio: true,
        role: true
      },
      orderBy: { firstName: 'asc' }
    })

    // Get corresponding employee records
    const employeeRecords = await prisma.employees.findMany({
      where: {
        userId: { in: usersWithEmployees.map(u => u.id) }
      },
      select: {
        id: true,
        userId: true,
        employeeId: true,
        salary: true,
        hireDate: true,
        startDate: true,
        employmentType: true,
        status: true,
        supervisor_id: true,
        is_supervisor: true,
        is_reviewer: true,
        medical_aid: true,
        funeral_cover: true,
        vehicle_benefit: true,
        fuel_allowance: true,
        airtime_allowance: true,
        other_benefits: true,
        departmentId: true
      }
    })

    // Create a map for quick lookup
    const employeeMap = new Map(employeeRecords.map(emp => [emp.userId, emp]))

    // Transform data for frontend - merge user and employee data
    const transformedEmployees = usersWithEmployees.map((user: any) => {
      const employeeData = employeeMap.get(user.id)
      
      return {
        // Basic user info
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        department: user.department || 'N/A',
        position: user.position || 'N/A',
        phone: user.phoneNumber || 'N/A',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: user.roles || [],
        location: user.location,
        bio: user.bio,
        role: user.role,
        
        // Employee-specific data (if exists)
        employeeId: employeeData?.employeeId || null,
        salary: employeeData?.salary || null,
        hireDate: employeeData?.hireDate ? employeeData.hireDate.toISOString().split('T')[0] : null,
        startDate: employeeData?.startDate ? employeeData.startDate.toISOString().split('T')[0] : null,
        employmentType: employeeData?.employmentType || 'FULL_TIME',
        status: employeeData?.status || 'ACTIVE',
        supervisorId: employeeData?.supervisor_id || null,
        isSupervisor: employeeData?.is_supervisor || false,
        isReviewer: employeeData?.is_reviewer || false,
        
        // Benefits
        benefits: {
          medicalAid: employeeData?.medical_aid || false,
          funeralCover: employeeData?.funeral_cover || false,
          vehicleBenefit: employeeData?.vehicle_benefit || false,
          fuelAllowance: employeeData?.fuel_allowance || false,
          airtimeAllowance: employeeData?.airtime_allowance || false,
          other: employeeData?.other_benefits || []
        },
        
        // Flag to indicate if user has employee record
        hasEmployeeRecord: !!employeeData
      }
    })

    const response = createSuccessResponse(transformedEmployees, {
      message: `Retrieved ${transformedEmployees.length} users/employees`,
      meta: { 
        totalUsers: usersWithEmployees.length,
        usersWithEmployeeRecords: employeeRecords.length,
        usersWithoutEmployeeRecords: usersWithEmployees.length - employeeRecords.length
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
    
    // Check that either department or departmentId is provided
    if (!formData.department && !formData.departmentId) {
      const { response, status } = createErrorResponse(
        'Department is required',
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }
    
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
    const existingEmployee = await prisma.users.findUnique({
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

    // If departmentId is provided, fetch the department name for backward compatibility
    let departmentName = formData.department
    if (formData.departmentId && !formData.department) {
      const department = await prisma.departments.findUnique({
        where: { id: formData.departmentId },
        select: { name: true }
      })
      departmentName = department?.name || ''
    }

    // Generate employee ID
    const employeeCount = await prisma.users.count()
    const employeeId = `EMP${(employeeCount + 1).toString().padStart(4, '0')}`

    // Sanitize input data
    const sanitizedData = {
      employeeId,
      firstName: sanitizeInput(formData.firstName),
      lastName: sanitizeInput(formData.lastName),
      email: formData.email.toLowerCase().trim(),
      phoneNumber: formData.phoneNumber ? sanitizeInput(formData.phoneNumber) : null,
      department: sanitizeInput(departmentName || ''), // Keep for backward compatibility
      departmentId: formData.departmentId || null, // Use departmentId for proper relation
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

    // Create user account first
    const newUser = await prisma.users.create({
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
    const newEmployee = await prisma.employees.create({
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
