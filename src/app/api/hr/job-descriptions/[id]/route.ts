import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch job description by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const jobDescription = await prisma.job_descriptions.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            department: true,
            departments: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: jobDescription
    })

  } catch (error) {
    console.error('Error fetching job description:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch job description',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update job description
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { jobTitle, location, jobSummary, keyResponsibilities, essentialExperience, essentialSkills, acknowledgment } = body

    // Validate keyResponsibilities structure
    if (keyResponsibilities && Array.isArray(keyResponsibilities)) {
      const totalWeight = keyResponsibilities.reduce((sum: number, resp: any) => sum + (resp.weight || 0), 0)
      
      if (totalWeight !== 100 && keyResponsibilities.length > 0) {
        return NextResponse.json(
          { 
            error: 'Invalid weight distribution',
            message: `Total weight must equal 100%. Current total: ${totalWeight}%`
          },
          { status: 400 }
        )
      }

      // Validate each responsibility
      for (const resp of keyResponsibilities) {
        if (!resp.description || !resp.tasks) {
          return NextResponse.json(
            { error: 'Each responsibility must have a description and tasks' },
            { status: 400 }
          )
        }
        if (resp.weight < 0 || resp.weight > 100) {
          return NextResponse.json(
            { error: 'Weight must be between 0 and 100' },
            { status: 400 }
          )
        }
      }
    }

    // Check if job description exists
    const existingJobDescription = await prisma.job_descriptions.findUnique({
      where: { id }
    })

    if (!existingJobDescription) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 404 }
      )
    }

    // Update job description
    const updatedJobDescription = await prisma.job_descriptions.update({
      where: { id },
      data: {
        jobTitle: jobTitle || existingJobDescription.jobTitle,
        location: location || existingJobDescription.location,
        jobSummary: jobSummary !== undefined ? jobSummary : existingJobDescription.jobSummary,
        keyResponsibilities: keyResponsibilities !== undefined ? keyResponsibilities : existingJobDescription.keyResponsibilities,
        essentialExperience: essentialExperience !== undefined ? essentialExperience : existingJobDescription.essentialExperience,
        essentialSkills: essentialSkills !== undefined ? essentialSkills : existingJobDescription.essentialSkills,
        acknowledgment: acknowledgment !== undefined ? acknowledgment : existingJobDescription.acknowledgment,
        version: existingJobDescription.version + 1,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Job description updated successfully',
      data: updatedJobDescription
    })

  } catch (error) {
    console.error('Error updating job description:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update job description',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete job description
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.delete') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    // Soft delete by marking as inactive
    const jobDescription = await prisma.job_descriptions.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Job description deactivated successfully',
      data: jobDescription
    })

  } catch (error) {
    console.error('Error deleting job description:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete job description',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

