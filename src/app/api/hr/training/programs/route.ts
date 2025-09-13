import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasAccess = session.user?.permissions?.includes('hr.training.view') || 
                     session.user?.permissions?.includes('hr.admin')
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const programs = await prisma.training_programs.findMany({
      include: {
        training_enrollments: {
          include: {
            employees: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            training_enrollments: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      programs: programs.map(program => ({
        ...program,
        enrolledCount: program._count.training_enrollments,
        participants: program.training_enrollments.map(enrollment => ({
          ...enrollment.employees,
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status,
          completionDate: enrollment.completionDate,
          progress: enrollment.progress
        }))
      }))
    })

  } catch (error) {
    console.error('Training programs fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training programs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasAccess = session.user?.permissions?.includes('hr.training.create') || 
                     session.user?.permissions?.includes('hr.admin')
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    
    const program = await prisma.training_programs.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        category: data.category,
        duration: data.duration,
        format: data.format || 'In-Person',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        instructor: data.instructor,
        capacity: data.capacity,
        prerequisites: data.prerequisites,
        learningObjectives: data.learningObjectives,
        materials: data.materials,
        status: data.status || 'DRAFT',
        cost: data.cost || 0,
        enrollmentDeadline: data.enrollmentDeadline ? new Date(data.enrollmentDeadline) : null,
        certificationAvailable: data.certificationAvailable || false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      program
    })

  } catch (error) {
    console.error('Training program creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create training program' },
      { status: 500 }
    )
  }
}
