import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    // Get all active employees
    const employees = await prisma.user.findMany({
      where: { 
        status: 'ACTIVE'
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        departmentId: true,
        departmentRef: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true
          }
        },
        position: true,
        phoneNumber: true,
        hireDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Supervisor and role fields
        supervisorId: true,
        isSupervisor: true,
        isReviewer: true,
        // Benefits fields
        medicalAid: true,
        funeralCover: true,
        vehicleBenefit: true,
        fuelAllowance: true,
        airtimeAllowance: true,
        otherBenefits: true,
        // Archive fields
        archivedAt: true,
        archiveReason: true,
        accessRevoked: true
      },
      orderBy: { firstName: 'asc' }
    })

    // Transform data for frontend
    const transformedEmployees = employees.map((emp: any) => ({
      id: emp.id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      department: emp.departmentRef?.name || emp.department || 'N/A',
      departmentCode: emp.departmentRef?.code,
      departmentLevel: emp.departmentRef?.level,
      position: emp.position,
      phone: emp.phoneNumber,
      hireDate: emp.hireDate ? emp.hireDate.toISOString().split('T')[0] : 'N/A',
      status: emp.status,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
      // Supervisor and role fields
      supervisorId: emp.supervisorId,
      isSupervisor: emp.isSupervisor,
      isReviewer: emp.isReviewer,
      // Benefits fields
      medicalAid: emp.medicalAid,
      funeralCover: emp.funeralCover,
      vehicleBenefit: emp.vehicleBenefit,
      fuelAllowance: emp.fuelAllowance,
      airtimeAllowance: emp.airtimeAllowance,
      otherBenefits: emp.otherBenefits,
      // Archive fields
      archivedAt: emp.archivedAt,
      archiveReason: emp.archiveReason,
      accessRevoked: emp.accessRevoked
    }))

    const response = createSuccessResponse(transformedEmployees, {
      message: `Retrieved ${employees.length} employees`,
      meta: { count: employees.length }
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
    const existingEmployee = await prisma.user.findUnique({
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
      const department = await prisma.department.findUnique({
        where: { id: formData.departmentId },
        select: { name: true }
      })
      departmentName = department?.name || ''
    }

    // Generate employee ID
    const employeeCount = await prisma.user.count()
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

    // Create new employee
    const newEmployee = await prisma.user.create({
      data: sanitizedData
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
