import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get department statistics
    const departmentStats = await prisma.employee.groupBy({
      by: ['department'],
      _count: {
        id: true
      },
      where: {
        status: 'ACTIVE'
      }
    })

    const totalDepartments = departmentStats.length

    // Mock training data since we don't have a training model yet
    const trainingData = {
      totalPrograms: 12,
      activePrograms: 8,
      completedThisMonth: 15,
      upcomingPrograms: 4
    }

    // Mock recruitment data
    const recruitmentData = {
      openPositions: 8,
      applicationsReceived: 45,
      interviewsScheduled: 12,
      offersExtended: 3
    }

    return NextResponse.json({
      departments: {
        total: totalDepartments,
        breakdown: departmentStats
      },
      training: trainingData,
      recruitment: recruitmentData
    })

  } catch (error) {
    console.error('HR Modules API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch HR modules data' },
      { status: 500 }
    )
  }
}
