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

    // Check if project exists
    const project = await prisma.projects.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Archive the project by updating its status
    const archivedProject = await prisma.projects.update({
      where: { id: projectId },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: archivedProject
    })

  } catch (error) {
    console.error('Error archiving project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}