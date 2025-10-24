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
        activities: true,
        users_projects_managerIdTousers: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
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

    // Prepare objectives data
    let objectives = body.objectives
    if (typeof objectives === 'string') {
      try {
        objectives = JSON.parse(objectives)
      } catch {
        // If it's not valid JSON, treat as plain text
        objectives = { description: objectives }
      }
    }

    // Resolve managerId: the UI may post an employeeId. Convert to users.id if needed.
    let managerUserId: string | undefined = body.managerId || undefined
    if (managerUserId) {
      // 1) Direct users.id match
      const user = await prisma.users.findUnique({ where: { id: managerUserId } })
      if (!user) {
        // 2) users by employeeId
        const possibleUser = await prisma.users.findFirst({ where: { employeeId: managerUserId } })
        if (possibleUser) {
          managerUserId = possibleUser.id
        } else {
          // 3) resolve employee -> email -> users by email
          const employee = await prisma.employees.findUnique({ where: { id: managerUserId } })
          if (employee?.email) {
            const userByEmail = await prisma.users.findUnique({ where: { email: employee.email } })
            if (userByEmail) managerUserId = userByEmail.id
            else managerUserId = undefined
          } else {
            managerUserId = undefined
          }
        }
      }
    }

    // Update the project
    const updatedProject = await prisma.projects.update({
      where: { id: projectId },
      data: {
        name: body.name,
        projectGoal: body.projectGoal,
        description: body.description,
        status: body.status,
        priority: body.priority,
        progress: body.progress,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        country: body.country,
        province: body.province,
        budget: body.budget ? parseFloat(body.budget) : undefined,
        actualSpent: body.actualSpent ? parseFloat(body.actualSpent) : undefined,
        managerId: managerUserId,
        currency: body.currency,
        timeframe: body.timeframe,
        objectives: objectives ? JSON.stringify(objectives) : undefined,
        resultsFramework: body.resultsFramework ? JSON.stringify(body.resultsFramework) : undefined,
        updatedAt: new Date()
      },
      include: {
        activities: true,
        users_projects_managerIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
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