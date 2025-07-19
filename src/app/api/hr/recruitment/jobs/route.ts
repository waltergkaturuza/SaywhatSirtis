import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handlePrismaError,
  validateRequiredFields,
  sanitizeInput,
  logError,
  HttpStatus,
  ErrorCodes
} from '@/lib/api-utils'

// GET /api/hr/recruitment/jobs - Fetch all job postings
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: Record<string, unknown> = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (department && department !== 'all') {
      where.department = department
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          applications: {
            select: { id: true, status: true }
          }
        }
      }),
      prisma.jobPosting.count({ where })
    ])

    // Transform the data to match the frontend interface
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type.toLowerCase().replace('_', '-'),
      level: job.level.toLowerCase(),
      status: job.status.toLowerCase().replace('_', '-'),
      description: job.description || '',
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
      salary: {
        min: job.salaryMin ? parseFloat(job.salaryMin.toString()) : 0,
        max: job.salaryMax ? parseFloat(job.salaryMax.toString()) : 0,
        currency: job.currency
      },
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
      applicationCount: job.applications.length,
      postedDate: job.postedDate?.toISOString() || job.createdAt.toISOString(),
      closingDate: job.closingDate?.toISOString() || '',
      createdBy: job.createdBy,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    }))

    const response = createSuccessResponse(transformedJobs, {
      message: `Retrieved ${transformedJobs.length} job postings`,
      meta: { 
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/recruitment/jobs',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

// POST /api/hr/recruitment/jobs - Create a new job posting
export async function POST(request: NextRequest) {
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

    // Validate required fields
    const validationError = validateRequiredFields(body, [
      'title', 'department', 'location', 'type', 'level', 'description'
    ])
    
    if (validationError) {
      const { response, status } = createErrorResponse(
        validationError,
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Sanitize input data
    const sanitizedData = {
      title: sanitizeInput(body.title),
      department: sanitizeInput(body.department),
      location: sanitizeInput(body.location),
      type: body.type.toUpperCase().replace('-', '_'),
      level: body.level.toUpperCase(),
      status: body.status ? body.status.toUpperCase().replace('-', '_') : 'DRAFT',
      description: body.description ? sanitizeInput(body.description) : null,
      requirements: body.requirements ? JSON.stringify(body.requirements) : JSON.stringify([]),
      responsibilities: body.responsibilities ? JSON.stringify(body.responsibilities) : JSON.stringify([]),
      salaryMin: body.salary?.min ? parseFloat(body.salary.min) : null,
      salaryMax: body.salary?.max ? parseFloat(body.salary.max) : null,
      currency: body.salary?.currency || 'USD',
      benefits: body.benefits ? JSON.stringify(body.benefits) : JSON.stringify([]),
      postedDate: body.postedDate ? new Date(body.postedDate) : null,
      closingDate: body.closingDate ? new Date(body.closingDate) : null,
      createdBy: session.user.email
    }

    const job = await prisma.jobPosting.create({
      data: sanitizedData,
      include: {
        applications: {
          select: { id: true, status: true }
        }
      }
    })

    // Transform the response
    const transformedJob = {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type.toLowerCase().replace('_', '-'),
      level: job.level.toLowerCase(),
      status: job.status.toLowerCase().replace('_', '-'),
      description: job.description || '',
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
      salary: {
        min: job.salaryMin ? parseFloat(job.salaryMin.toString()) : 0,
        max: job.salaryMax ? parseFloat(job.salaryMax.toString()) : 0,
        currency: job.currency
      },
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
      applicationCount: job.applications.length,
      postedDate: job.postedDate?.toISOString() || job.createdAt.toISOString(),
      closingDate: job.closingDate?.toISOString() || '',
      createdBy: job.createdBy,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    }

    const response = createSuccessResponse(transformedJob, {
      message: `Job posting "${job.title}" created successfully`
    })

    return NextResponse.json(response, { status: HttpStatus.CREATED })
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/recruitment/jobs',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

// PUT /api/hr/recruitment/jobs - Update a job posting
export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body

    if (!id) {
      const { response, status } = createErrorResponse(
        'Job ID is required',
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Prepare update data
    const sanitizedData: Record<string, unknown> = {}
    
    if (updateData.title) sanitizedData.title = sanitizeInput(updateData.title)
    if (updateData.department) sanitizedData.department = sanitizeInput(updateData.department)
    if (updateData.location) sanitizedData.location = sanitizeInput(updateData.location)
    if (updateData.type) sanitizedData.type = updateData.type.toUpperCase().replace('-', '_')
    if (updateData.level) sanitizedData.level = updateData.level.toUpperCase()
    if (updateData.status) sanitizedData.status = updateData.status.toUpperCase().replace('-', '_')
    if (updateData.description !== undefined) sanitizedData.description = updateData.description ? sanitizeInput(updateData.description) : null
    if (updateData.requirements) sanitizedData.requirements = JSON.stringify(updateData.requirements)
    if (updateData.responsibilities) sanitizedData.responsibilities = JSON.stringify(updateData.responsibilities)
    if (updateData.salary?.min !== undefined) sanitizedData.salaryMin = updateData.salary.min ? parseFloat(updateData.salary.min) : null
    if (updateData.salary?.max !== undefined) sanitizedData.salaryMax = updateData.salary.max ? parseFloat(updateData.salary.max) : null
    if (updateData.salary?.currency) sanitizedData.currency = updateData.salary.currency
    if (updateData.benefits) sanitizedData.benefits = JSON.stringify(updateData.benefits)
    if (updateData.postedDate) sanitizedData.postedDate = new Date(updateData.postedDate)
    if (updateData.closingDate) sanitizedData.closingDate = new Date(updateData.closingDate)

    const job = await prisma.jobPosting.update({
      where: { id },
      data: sanitizedData,
      include: {
        applications: {
          select: { id: true, status: true }
        }
      }
    })

    // Transform the response
    const transformedJob = {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type.toLowerCase().replace('_', '-'),
      level: job.level.toLowerCase(),
      status: job.status.toLowerCase().replace('_', '-'),
      description: job.description || '',
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
      salary: {
        min: job.salaryMin ? parseFloat(job.salaryMin.toString()) : 0,
        max: job.salaryMax ? parseFloat(job.salaryMax.toString()) : 0,
        currency: job.currency
      },
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
      applicationCount: job.applications.length,
      postedDate: job.postedDate?.toISOString() || job.createdAt.toISOString(),
      closingDate: job.closingDate?.toISOString() || '',
      createdBy: job.createdBy,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    }

    const response = createSuccessResponse(transformedJob, {
      message: `Job posting "${job.title}" updated successfully`
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/recruitment/jobs PUT',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

// DELETE /api/hr/recruitment/jobs - Delete a job posting
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      const { response, status } = createErrorResponse(
        'Job ID is required',
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Check if job has applications
    const applicationCount = await prisma.application.count({
      where: { jobId: id }
    })

    if (applicationCount > 0) {
      const { response, status } = createErrorResponse(
        'Cannot delete job posting with existing applications',
        HttpStatus.CONFLICT,
        { 
          code: ErrorCodes.VALIDATION_ERROR,
          details: { applicationCount }
        }
      )
      return NextResponse.json(response, { status })
    }

    await prisma.jobPosting.delete({
      where: { id }
    })

    const response = createSuccessResponse(null, {
      message: 'Job posting deleted successfully'
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/recruitment/jobs DELETE',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}
