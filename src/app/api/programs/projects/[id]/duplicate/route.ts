import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Get the original project
    const originalProject = await prisma.projects.findUnique({
      where: { id: projectId }
    })

    if (!originalProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create the duplicate project
    const { randomUUID } = await import('crypto')
    const duplicateProject = await prisma.projects.create({
      data: {
        id: randomUUID(),
        name: `${originalProject.name} (Copy)`,
        description: originalProject.description || '',
        status: 'PLANNING',
        timeframe: 'TBD',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        country: originalProject.country || 'Zimbabwe',
        objectives: originalProject.objectives || '{}',
        creatorId: session.user.id!,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Note: This is a basic duplication. In a full implementation,
    // you would copy related data like stakeholders, risks, resources, etc.

    return NextResponse.json({
      success: true,
      data: duplicateProject
    })

  } catch (error) {
    console.error('Error duplicating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}