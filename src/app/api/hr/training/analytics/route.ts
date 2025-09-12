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

    // Get analytics data
    const [
      totalPrograms,
      totalEnrollments,
      completedEnrollments,
      certificatesIssued,
      programsByCategory,
      enrollmentsByStatus,
      recentCompletions,
      topPerformers
    ] = await Promise.all([
      // Total active programs
      prisma.trainingProgram.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Total enrollments
      prisma.trainingEnrollment.count(),
      
      // Completed enrollments
      prisma.trainingEnrollment.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Certificates issued
      prisma.trainingCertificate.count(),
      
      // Programs by category
      prisma.trainingProgram.groupBy({
        by: ['category'],
        _count: {
          id: true
        },
        where: { status: 'ACTIVE' }
      }),
      
      // Enrollments by status
      prisma.trainingEnrollment.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // Recent completions (last 30 days)
      prisma.trainingEnrollment.findMany({
        where: {
          status: 'COMPLETED',
          completionDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
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
              lastName: true
            }
          }
        },
        orderBy: {
          completionDate: 'desc'
        },
        take: 10
      }),
      
      // Top performers (highest average scores)
      prisma.trainingEnrollment.groupBy({
        by: ['employeeId'],
        _avg: {
          finalScore: true
        },
        _count: {
          id: true
        },
        where: {
          status: 'COMPLETED',
          finalScore: {
            not: null
          }
        },
        having: {
          finalScore: {
            _avg: {
              gte: 80
            }
          }
        },
        orderBy: {
          _avg: {
            finalScore: 'desc'
          }
        },
        take: 5
      })
    ])

    // Get employee details for top performers
    const topPerformersWithDetails = await Promise.all(
      topPerformers.map(async (performer) => {
        const employee = await prisma.user.findUnique({
          where: { id: performer.employeeId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true
          }
        })
        return {
          ...performer,
          employee
        }
      })
    )

    // Calculate completion rate
    const completionRate = totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0

    const analytics = {
      overview: {
        totalPrograms,
        totalEnrollments,
        completedEnrollments,
        certificatesIssued,
        completionRate
      },
      programsByCategory: programsByCategory.map(item => ({
        category: item.category,
        count: item._count.id
      })),
      enrollmentsByStatus: enrollmentsByStatus.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      recentCompletions,
      topPerformers: topPerformersWithDetails
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Training analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training analytics' },
      { status: 500 }
    )
  }
}
