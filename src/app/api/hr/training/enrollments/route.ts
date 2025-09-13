import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

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

    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')
    const employeeId = searchParams.get('employeeId')

    const whereClause: any = {}
    if (programId) whereClause.programId = programId
    if (employeeId) whereClause.employeeId = employeeId

    const enrollments = await prisma.training_enrollments.findMany({
      where: whereClause,
      include: {
        training_programs: {
          select: {
            id: true,
            title: true,
            category: true,
            startDate: true,
            endDate: true
          }
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: {
        enrollmentDate: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      enrollments
    })

  } catch (error) {
    console.error('Training enrollments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training enrollments' },
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
    const hasAccess = session.user?.permissions?.includes('hr.training.enroll') || 
                     session.user?.permissions?.includes('hr.admin')
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    
    // Check if enrollment already exists
    const existingEnrollment = await prisma.training_enrollments.findFirst({
      where: {
        programId: data.programId,
        employeeId: data.employeeId
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Employee is already enrolled in this program' },
        { status: 400 }
      )
    }

    const enrollment = await prisma.training_enrollments.create({
      data: {
        id: randomUUID(),
        programId: data.programId,
        employeeId: data.employeeId,
        status: data.status || 'ENROLLED',
        enrollmentDate: new Date(),
        progress: 0,
        updatedAt: new Date()
      },
      include: {
        training_programs: {
          select: {
            title: true,
            category: true
          }
        },
        employees: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      enrollment
    })

  } catch (error) {
    console.error('Training enrollment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create training enrollment' },
      { status: 500 }
    )
  }
}
