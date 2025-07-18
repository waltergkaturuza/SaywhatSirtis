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

// GET /api/hr/recruitment/applications - Fetch all applications
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
    const jobId = searchParams.get('jobId')
    const department = searchParams.get('department')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace('-', '_')
    }
    if (jobId) {
      where.jobId = jobId
    }
    if (department && department !== 'all') {
      where.job = {
        department: department
      }
    }

    const applicationsWhere: any = {
      ...where
    }

    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { appliedDate: 'desc' },
        take: limit,
        skip: offset,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: true,
              type: true,
              level: true
            }
          }
        }
      }),
      prisma.application.count({ where })
    ])

    // Transform the data to match the frontend interface
    const transformedApplications = applications.map(application => ({
      id: application.id,
      candidateName: application.candidateName,
      email: application.email,
      phone: application.phone,
      status: application.status.toLowerCase().replace('_', '-'),
      position: application.job.title,
      department: application.job.department,
      jobType: application.job.type.toLowerCase().replace('_', '-'),
      level: application.job.level.toLowerCase(),
      resumeUrl: application.resumeUrl || '',
      coverLetter: application.coverLetter || '',
      appliedDate: application.appliedDate.toISOString(),
      notes: application.notes || '',
      score: application.score || 0,
      jobId: application.jobId,
      jobTitle: application.job.title,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.lastUpdated.toISOString()
    }))

    const response = createSuccessResponse(transformedApplications, {
      message: `Retrieved ${transformedApplications.length} applications`,
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
      endpoint: '/api/hr/recruitment/applications',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

// POST /api/hr/recruitment/applications - Create a new application
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
      'candidateName', 'email', 'jobId'
    ])
    
    if (validationError) {
      const { response, status } = createErrorResponse(
        validationError,
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Check if job exists
    const job = await prisma.jobPosting.findUnique({
      where: { id: body.jobId }
    })

    if (!job) {
      const { response, status } = createErrorResponse(
        'Job posting not found',
        HttpStatus.NOT_FOUND,
        { code: ErrorCodes.NOT_FOUND }
      )
      return NextResponse.json(response, { status })
    }

    // Sanitize input data
    const sanitizedData = {
      candidateName: sanitizeInput(body.candidateName),
      email: sanitizeInput(body.email),
      phone: body.phone ? sanitizeInput(body.phone) : null,
      jobId: body.jobId,
      status: body.status ? body.status.toUpperCase().replace('-', '_') : 'SUBMITTED',
      resumeUrl: body.resumeUrl ? sanitizeInput(body.resumeUrl) : null,
      coverLetter: body.coverLetter ? sanitizeInput(body.coverLetter) : null,
      appliedDate: body.appliedDate ? new Date(body.appliedDate) : new Date(),
      notes: body.notes ? sanitizeInput(body.notes) : null,
      score: body.score ? parseInt(body.score) : null
    }

    const application = await prisma.application.create({
      data: sanitizedData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            type: true,
            level: true
          }
        }
      }
    })

    // Transform the response
    const transformedApplication = {
      id: application.id,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      candidatePhone: application.candidatePhone,
      status: application.status.toLowerCase().replace('_', '-'),
      position: application.job.title,
      department: application.job.department,
      jobType: application.job.type.toLowerCase().replace('_', '-'),
      level: application.job.level.toLowerCase(),
      experience: application.experience || '',
      education: application.education || '',
      skills: application.skills ? JSON.parse(application.skills) : [],
      resumeUrl: application.resumeUrl || '',
      coverLetter: application.coverLetter || '',
      portfolioUrl: application.portfolioUrl || '',
      submittedDate: application.submittedDate.toISOString(),
      reviewedDate: application.reviewedDate?.toISOString() || '',
      interviewDate: application.interviewDate?.toISOString() || '',
      notes: application.notes || '',
      score: application.score || 0,
      jobId: application.jobId,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString()
    }

    const response = createSuccessResponse(transformedApplication, {
      message: `Application for "${application.job.title}" created successfully`
    })

    return NextResponse.json(response, { status: HttpStatus.CREATED })
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/recruitment/applications',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

// PUT /api/hr/recruitment/applications - Update an application
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
        'Application ID is required',
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Prepare update data
    const sanitizedData: any = {}
    
    if (updateData.candidateName) sanitizedData.candidateName = sanitizeInput(updateData.candidateName)
    if (updateData.candidateEmail) sanitizedData.candidateEmail = sanitizeInput(updateData.candidateEmail)
    if (updateData.candidatePhone !== undefined) sanitizedData.candidatePhone = updateData.candidatePhone ? sanitizeInput(updateData.candidatePhone) : null
    if (updateData.status) sanitizedData.status = updateData.status.toUpperCase().replace('-', '_')
    if (updateData.experience !== undefined) sanitizedData.experience = updateData.experience ? sanitizeInput(updateData.experience) : null
    if (updateData.education !== undefined) sanitizedData.education = updateData.education ? sanitizeInput(updateData.education) : null
    if (updateData.skills) sanitizedData.skills = JSON.stringify(updateData.skills)
    if (updateData.resumeUrl !== undefined) sanitizedData.resumeUrl = updateData.resumeUrl ? sanitizeInput(updateData.resumeUrl) : null
    if (updateData.coverLetter !== undefined) sanitizedData.coverLetter = updateData.coverLetter ? sanitizeInput(updateData.coverLetter) : null
    if (updateData.portfolioUrl !== undefined) sanitizedData.portfolioUrl = updateData.portfolioUrl ? sanitizeInput(updateData.portfolioUrl) : null
    if (updateData.reviewedDate) sanitizedData.reviewedDate = new Date(updateData.reviewedDate)
    if (updateData.interviewDate) sanitizedData.interviewDate = new Date(updateData.interviewDate)
    if (updateData.notes !== undefined) sanitizedData.notes = updateData.notes ? sanitizeInput(updateData.notes) : null
    if (updateData.score !== undefined) sanitizedData.score = updateData.score ? parseFloat(updateData.score) : null

    // Auto-set reviewedDate when status changes to reviewed or later
    if (updateData.status && ['REVIEWED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'HIRED', 'REJECTED'].includes(updateData.status.toUpperCase().replace('-', '_'))) {
      if (!sanitizedData.reviewedDate) {
        sanitizedData.reviewedDate = new Date()
      }
    }

    const application = await prisma.application.update({
      where: { id },
      data: sanitizedData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            type: true,
            level: true
          }
        }
      }
    })

    // Transform the response
    const transformedApplication = {
      id: application.id,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      candidatePhone: application.candidatePhone,
      status: application.status.toLowerCase().replace('_', '-'),
      position: application.job.title,
      department: application.job.department,
      jobType: application.job.type.toLowerCase().replace('_', '-'),
      level: application.job.level.toLowerCase(),
      experience: application.experience || '',
      education: application.education || '',
      skills: application.skills ? JSON.parse(application.skills) : [],
      resumeUrl: application.resumeUrl || '',
      coverLetter: application.coverLetter || '',
      portfolioUrl: application.portfolioUrl || '',
      submittedDate: application.submittedDate.toISOString(),
      reviewedDate: application.reviewedDate?.toISOString() || '',
      interviewDate: application.interviewDate?.toISOString() || '',
      notes: application.notes || '',
      score: application.score || 0,
      jobId: application.jobId,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString()
    }

    const response = createSuccessResponse(transformedApplication, {
      message: `Application for "${application.candidateName}" updated successfully`
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/recruitment/applications PUT',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

// DELETE /api/hr/recruitment/applications - Delete an application
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
        'Application ID is required',
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    await prisma.application.delete({
      where: { id }
    })

    const response = createSuccessResponse(null, {
      message: 'Application deleted successfully'
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/recruitment/applications DELETE',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}
