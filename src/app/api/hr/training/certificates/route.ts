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

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    const whereClause: any = {}
    if (employeeId) {
      whereClause.enrollment = {
        employeeId: employeeId
      }
    }

    const certificates = await prisma.training_certificates.findMany({
      where: whereClause,
      include: {
        enrollment: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
                category: true
              }
            },
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        issuedDate: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      certificates
    })

  } catch (error) {
    console.error('Training certificates fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training certificates' },
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
    const hasAccess = session.user?.permissions?.includes('hr.training.certify') || 
                     session.user?.permissions?.includes('hr.admin')
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    
    // Verify enrollment exists and is completed
    const enrollment = await prisma.training_enrollments.findFirst({
      where: {
        id: data.enrollmentId,
        status: 'COMPLETED'
      },
      include: {
        program: true
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found or not completed' },
        { status: 400 }
      )
    }

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${enrollment.employeeId.slice(-4)}`

    const certificate = await prisma.training_certificates.create({
      data: {
        enrollmentId: data.enrollmentId,
        certificateNumber,
        issuedDate: new Date(),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null
      },
      include: {
        enrollment: {
          include: {
            program: {
              select: {
                title: true,
                category: true
              }
            },
            employee: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      certificate
    })

  } catch (error) {
    console.error('Training certificate creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create training certificate' },
      { status: 500 }
    )
  }
}
