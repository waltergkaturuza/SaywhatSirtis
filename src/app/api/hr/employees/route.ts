import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handlePrismaError, withRetry, createErrorResponse, createSuccessResponse } from '@/lib/error-handler'
import { 
  validateRequiredFields,
  validateEmail,
  sanitizeInput
} from '@/lib/api-utils'

export async function GET() {
  try {
    // Authentication required for production
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return createErrorResponse('Authentication required', 401)
    }

    // Get all active employees with retry logic
    const employees = await withRetry(async () => {
      return await (prisma.employee.findMany as any)({
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

    return createSuccessResponse(transformedEmployees, `Retrieved ${employees.length} employees`)

  } catch (error) {
    console.error('Error in GET /api/hr/employees:', error)
    const { error: apiError, status } = handlePrismaError(error)
    return createErrorResponse(apiError, status)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return createErrorResponse('Authentication required', 401)
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch (parseError) {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    const { formData } = body

    // Validate required fields
    if (!formData?.email || !formData?.position) {
      return createErrorResponse('Email and position are required', 400)
    }
    
    // Check that either department or departmentId is provided
    if (!formData.department && !formData.departmentId) {
      return createErrorResponse('Department is required', 400)
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      return createErrorResponse('Invalid email format', 400)
    }

    // Check if employee email already exists with retry logic
    const existingEmployee = await withRetry(async () => {
      return await prisma.employee.findUnique({
        where: { email: formData.email }
      })
    })

    if (existingEmployee) {
      return createErrorResponse('Employee with this email already exists', 409)
    }

    // If departmentId is provided, fetch the department name for backward compatibility
    let departmentName = formData.department
    if (formData.departmentId && !formData.department) {
      const department = await withRetry(async () => {
        return await prisma.department.findUnique({
          where: { id: formData.departmentId },
          select: { name: true }
        })
      })
      departmentName = department?.name || ''
    }

    // Generate employee ID with retry logic
    const employeeCount = await withRetry(async () => {
      return await prisma.employee.count()
    })
    const employeeId = `EMP${(employeeCount + 1).toString().padStart(4, '0')}`

    // Sanitize input data
    const sanitizedData = {
      userId: `user_${employeeId}`, // Temporary user ID for standalone employee
      employeeId,
      firstName: sanitizeInput(formData.firstName || ''),
      lastName: sanitizeInput(formData.lastName || ''),
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

    // Create new employee with retry logic
    const newEmployee = await withRetry(async () => {
      return await (prisma.employee.create as any)({
        data: sanitizedData
      })
    })

    return createSuccessResponse({
      id: newEmployee.id,
      employeeId: newEmployee.employeeId,
      name: `${newEmployee.firstName} ${newEmployee.lastName}`,
      email: newEmployee.email,
      department: newEmployee.department,
      position: newEmployee.position,
      status: newEmployee.status
    }, `Employee ${newEmployee.firstName} ${newEmployee.lastName} created successfully`)

  } catch (error) {
    console.error('Error in POST /api/hr/employees:', error)
    const { error: apiError, status } = handlePrismaError(error)
    return createErrorResponse(apiError, status)
  }
}
