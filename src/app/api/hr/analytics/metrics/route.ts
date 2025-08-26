import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '12months'
    const department = searchParams.get('department') || 'all'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        break
      case '24months':
        startDate = new Date(now.getFullYear() - 2, now.getMonth(), 1)
        break
      default: // 12months
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    }

    // Build where clause for department filter
    const whereClause: Record<string, string> = {}
    if (department !== 'all') {
      whereClause.department = department
    }

    // Get total employees
    const totalEmployees = await prisma.user.count({
      where: {
        ...whereClause,
        isActive: true
      }
    })

    // Get active employees
    const activeEmployees = await prisma.user.count({
      where: {
        ...whereClause,
        isActive: true,
        lastLogin: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })

    // Get new hires in period
    const newHires = await prisma.user.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: startDate
        }
      }
    })

    // Get departures in period (approximation using inactive users)
    const departures = await prisma.user.count({
      where: {
        ...whereClause,
        isActive: false,
        updatedAt: {
          gte: startDate,
          lte: now
        }
      }
    })

    // Calculate turnover rate
    const averageEmployees = totalEmployees + (departures / 2)
    const turnoverRate = averageEmployees > 0 ? (departures / averageEmployees) * 100 : 0

    // Calculate average tenure
    const employees = await prisma.user.findMany({
      where: {
        ...whereClause,
        isActive: true
      },
      select: {
        createdAt: true
      }
    })

    const totalTenure = employees.reduce((sum: number, emp: { createdAt: Date }) => {
      const tenure = (now.getTime() - emp.createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      return sum + tenure
    }, 0)

    const averageTenure = employees.length > 0 ? totalTenure / employees.length : 0

    // Mock salary data (handled by Belina software externally)
    const averageSalary = 65000 // Mock average salary for display purposes

    // Get attendance rate (mock calculation - you'd implement based on your attendance system)
    const attendanceRate = 92.5 // This would be calculated from actual attendance data

    // Get performance score from PerformanceReview model
    const performanceData = await prisma.performanceReview.aggregate({
      where: {
        employee: department !== 'all' ? { department } : undefined,
        createdAt: {
          gte: startDate
        }
      },
      _avg: {
        overallRating: true
      },
      _count: {
        overallRating: true
      }
    })

    // Mock performance score since we need actual performance data
    const performanceScore = 4.2 // This would be calculated from actual performance data

    // Get training completion rate (mock calculation)
    const trainingCompletionRate = 85.3 // This would be calculated from training data

    const metrics = {
      totalEmployees,
      activeEmployees,
      newHires,
      turnoverRate: Math.round(turnoverRate * 100) / 100,
      averageTenure: Math.round(averageTenure * 100) / 100,
      averageSalary: Math.round(averageSalary),
      attendanceRate,
      performanceScore: Math.round(performanceScore * 100) / 100,
      trainingCompletionRate
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching HR metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch HR metrics' },
      { status: 500 }
    )
  }
}
