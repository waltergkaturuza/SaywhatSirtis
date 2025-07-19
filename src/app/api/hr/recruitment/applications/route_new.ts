import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    
    if (department && department !== 'all') {
      where.job = { department }
    }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (search) {
      where.OR = [
        { candidateName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { job: { title: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get total count
    const totalCount = await prisma.application.count({ where })

    // Get applications with job details
    const applications = await prisma.application.findMany({
      where,
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
      },
      orderBy: {
        appliedDate: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Transform applications
    const transformedApplications = applications.map(application => ({
      id: application.id,
      status: application.status,
      candidateName: application.candidateName,
      email: application.email,
      phone: application.phone || '',
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
      lastUpdated: application.lastUpdated.toISOString()
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
    console.error('Error fetching applications:', error)
    const { response, status } = createErrorResponse(
      'Failed to fetch applications',
      500
    )
    return NextResponse.json(response, { status })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.jobId || !data.candidateName || !data.email) {
      const { response, status } = createErrorResponse(
        'Missing required fields',
        400
      )
      return NextResponse.json(response, { status })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: data.jobId,
        candidateName: data.candidateName,
        email: data.email,
        phone: data.phone || null,
        resumeUrl: data.resumeUrl || null,
        coverLetter: data.coverLetter || null,
        notes: data.notes || null,
        score: data.score ? parseInt(data.score) : null,
        status: data.status ? data.status.toUpperCase() : 'SUBMITTED'
      },
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

    // Transform response
    const transformedApplication = {
      id: application.id,
      status: application.status,
      candidateName: application.candidateName,
      email: application.email,
      phone: application.phone || '',
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
      lastUpdated: application.lastUpdated.toISOString()
    }

    const response = createSuccessResponse(transformedApplication, {
      message: 'Application created successfully'
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    const { response, status } = createErrorResponse(
      'Failed to create application',
      500
    )
    return NextResponse.json(response, { status })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.id) {
      const { response, status } = createErrorResponse(
        'Missing required field',
        400
      )
      return NextResponse.json(response, { status })
    }

    // Build update data
    const updateData: any = {}
    if (data.candidateName) updateData.candidateName = data.candidateName
    if (data.email) updateData.email = data.email
    if (data.phone) updateData.phone = data.phone
    if (data.resumeUrl) updateData.resumeUrl = data.resumeUrl
    if (data.coverLetter) updateData.coverLetter = data.coverLetter
    if (data.notes) updateData.notes = data.notes
    if (data.score) updateData.score = parseInt(data.score)
    if (data.status) updateData.status = data.status.toUpperCase()

    // Update application
    const application = await prisma.application.update({
      where: { id: data.id },
      data: updateData,
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

    // Transform response
    const transformedApplication = {
      id: application.id,
      status: application.status,
      candidateName: application.candidateName,
      email: application.email,
      phone: application.phone || '',
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
      lastUpdated: application.lastUpdated.toISOString()
    }

    const response = createSuccessResponse(transformedApplication, {
      message: 'Application updated successfully'
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating application:', error)
    const { response, status } = createErrorResponse(
      'Failed to update application',
      500
    )
    return NextResponse.json(response, { status })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      const { response, status } = createErrorResponse(
        'Missing required parameter',
        400
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
    console.error('Error deleting application:', error)
    const { response, status } = createErrorResponse(
      'Failed to delete application',
      500
    )
    return NextResponse.json(response, { status })
  }
}
