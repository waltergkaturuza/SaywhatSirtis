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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    // Get all users (employees) with active status
    const employees = await prisma.user.findMany({
      where: { 
        isActive: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        department: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      },
      orderBy: { email: 'asc' }
    })

    const response = createSuccessResponse(employees, {
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
      'email', 'position', 'department'
    ])
    
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
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email }
    })

    if (existingUser) {
      const { response, status } = createErrorResponse(
        'Employee with this email already exists',
        HttpStatus.CONFLICT,
        { code: ErrorCodes.DUPLICATE_ENTRY }
      )
      return NextResponse.json(response, { status })
    }

    // Sanitize input data
    const sanitizedData = {
      email: formData.email.toLowerCase().trim(),
      username: formData.username ? sanitizeInput(formData.username) : null,
      department: sanitizeInput(formData.department),
      position: sanitizeInput(formData.position),
    }

    // Create new employee
    const newEmployee = await prisma.user.create({
      data: {
        ...sanitizedData,
        password: '$2a$10$rZvGJ5xI7gMEwAi8IWW8KO7/Eo3QKsVxQhVJ2X7w9m0N1QmRZJQzK', // Default password
        isActive: true
      }
    })

    const response = createSuccessResponse(newEmployee, {
      message: `Employee ${newEmployee.email} created successfully`
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
