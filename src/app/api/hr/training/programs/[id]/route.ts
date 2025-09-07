import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = session.user?.permissions?.includes('hr.training.view') || 
                     session.user?.permissions?.includes('hr.admin')
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const program = await prisma.trainingProgram.findUnique({
      where: { id: params.id },
      include: {
        enrollments: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })

    if (!program) {
      return NextResponse.json({ error: 'Training program not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      program
    })

  } catch (error) {
    console.error('Training program fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training program' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = session.user?.permissions?.includes('hr.training.edit') || 
                     session.user?.permissions?.includes('hr.admin')
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    const updatedProgram = await prisma.trainingProgram.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        duration: data.duration,
        format: data.format,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        instructor: data.instructor,
        status: data.status,
        certificationAvailable: data.certificationAvailable,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      program: updatedProgram
    })

  } catch (error) {
    console.error('Training program update error:', error)
    return NextResponse.json(
      { error: 'Failed to update training program' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = session.user?.permissions?.includes('hr.training.delete') || 
                     session.user?.permissions?.includes('hr.admin')
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if program has enrollments
    const enrollmentCount = await prisma.trainingEnrollment.count({
      where: { programId: params.id }
    })

    if (enrollmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete program with existing enrollments' },
        { status: 400 }
      )
    }

    await prisma.trainingProgram.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Training program deleted successfully'
    })

  } catch (error) {
    console.error('Training program deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete training program' },
      { status: 500 }
    )
  }
}
