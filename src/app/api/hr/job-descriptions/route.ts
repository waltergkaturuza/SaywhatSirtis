import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all job descriptions or by employeeId
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (employeeId) {
      // Fetch job description for specific employee
      const jobDescription = await prisma.job_descriptions.findUnique({
        where: { employeeId },
        include: {
          employees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true,
              department: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: jobDescription
      })
    } else {
      // Fetch all job descriptions
      const jobDescriptions = await prisma.job_descriptions.findMany({
        where: {
          isActive: true
        },
        include: {
          employees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true,
              department: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      return NextResponse.json({
        success: true,
        data: jobDescriptions,
        count: jobDescriptions.length
      })
    }
  } catch (error) {
    console.error('Error fetching job descriptions:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch job descriptions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create or update job description
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { employeeId, jobTitle, location, jobSummary, keyResponsibilities, essentialExperience, essentialSkills, acknowledgment } = body

    // Validate required fields
    if (!employeeId || !jobTitle || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, jobTitle, and location are required' },
        { status: 400 }
      )
    }

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

    // Check if employee exists
    const employee = await prisma.employees.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Check if job description already exists
    const existingJobDescription = await prisma.job_descriptions.findUnique({
      where: { employeeId }
    })

    let jobDescription
    if (existingJobDescription) {
      // Update existing job description
      jobDescription = await prisma.job_descriptions.update({
        where: { employeeId },
        data: {
          jobTitle,
          location,
          jobSummary: jobSummary || '',
          keyResponsibilities: keyResponsibilities || [],
          essentialExperience: essentialExperience || '',
          essentialSkills: essentialSkills || '',
          acknowledgment: acknowledgment || false,
          version: existingJobDescription.version + 1,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new job description
      jobDescription = await prisma.job_descriptions.create({
        data: {
          id: crypto.randomUUID(),
          employeeId,
          jobTitle,
          location,
          jobSummary: jobSummary || '',
          keyResponsibilities: keyResponsibilities || [],
          essentialExperience: essentialExperience || '',
          essentialSkills: essentialSkills || '',
          acknowledgment: acknowledgment || false,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: existingJobDescription ? 'Job description updated successfully' : 'Job description created successfully',
      data: jobDescription
    })

  } catch (error) {
    console.error('Error saving job description:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save job description',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

