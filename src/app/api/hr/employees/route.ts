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

    // Get current user to check permissions
    const currentUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      const { response, status } = createErrorResponse(
        'User not found',
        HttpStatus.NOT_FOUND
      )
      return NextResponse.json(response, { status })
    }

    const isHR = currentUser.roles?.includes('hr') || currentUser.role === 'ADMIN'
    const isSupervisor = currentUser.roles?.includes('supervisor')

    // Build query based on permissions
    let whereClause: any = {
      isActive: true
    }

    // If user is not HR, limit to their scope
    if (!isHR) {
      if (isSupervisor) {
        // Supervisors can see their subordinates and themselves
        const subordinates = await prisma.users.findMany({
          where: { supervisorId: currentUser.id },
          select: { id: true }
        })
        
        const allowedIds = [currentUser.id, ...subordinates.map(sub => sub.id)]
        whereClause.id = { in: allowedIds }
      } else {
        // Regular employees can only see themselves
        whereClause.id = currentUser.id
      }
    }

    // Get all employees with their user details
    const employees = await prisma.employees.findMany({
      where: {
        status: { in: ['ACTIVE', 'ON_LEAVE', 'SUSPENDED'] } // Show active employees
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
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
        }
      },
      orderBy: { firstName: 'asc' }
    })

    // Transform employee data for frontend
    const transformedEmployees = employees.map((emp: any) => {
      return {
        // Basic employee info
        id: emp.id,
        employeeId: emp.employeeId || `EMP${emp.id.slice(-6).toUpperCase()}`,
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department || 'Not Assigned',
        position: emp.position || 'N/A',
        phone: emp.phoneNumber || 'N/A',
        
        // Supervisor info
        supervisor: emp.supervisor ? {
          id: emp.supervisor.id,
          name: `${emp.supervisor.firstName} ${emp.supervisor.lastName}`,
          email: emp.supervisor.email,
          position: emp.supervisor.position
        } : null,
        
        // Employee-specific data
        startDate: emp.startDate || emp.createdAt,
        status: emp.status?.toLowerCase() || 'active',
        employmentType: emp.employmentType,
        salary: emp.salary,
        isSupervisor: emp.isSupervisor || false,
        isReviewer: emp.isReviewer || false,
        
        // System user data (if linked)
        user: emp.user ? {
          id: emp.user.id,
          role: emp.user.role,
          isActive: emp.user.isActive,
          email: emp.user.email
        } : null,
        isSystemUser: !!emp.user,
        
        // Additional info
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt
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
    let employeeId: string = '' // Initialize with empty string
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
