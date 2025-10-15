import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: {
        activities: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: project
    })

  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params
    const body = await request.json()

    // Check if project exists
    const existingProject = await prisma.projects.findUnique({
      where: { id: projectId }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Prepare objectives data with projectLead and projectTeam
    const objectives = body.objectives || {}
    if (body.projectLead !== undefined) {
      objectives.projectLead = body.projectLead
    }
    if (body.projectTeam !== undefined) {
      objectives.projectTeam = body.projectTeam
    }
    if (body.categories !== undefined) {
      objectives.categories = body.categories
    }
    if (body.implementingOrganizations !== undefined) {
      objectives.implementingOrganizations = body.implementingOrganizations
    }

    // Update the project
    const updatedProject = await prisma.projects.update({
      where: { id: projectId },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        country: body.country,
        budget: body.budget ? parseFloat(body.budget) : undefined,
        objectives: Object.keys(objectives).length > 0 ? JSON.stringify(objectives) : undefined,
        updatedAt: new Date()
      },
      include: {
        activities: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProject
    })

  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Check if project exists
    const project = await prisma.projects.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete the project (let the database handle cascading if configured)
    await prisma.projects.delete({
      where: { id: projectId }
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}