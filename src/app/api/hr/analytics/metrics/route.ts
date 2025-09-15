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
    const whereClause: any = {}
    if (department !== 'all') {
      whereClause.departments = {
        OR: [
          { name: { contains: department, mode: 'insensitive' } },
          { code: { contains: department, mode: 'insensitive' } }
        ]
      }
    }

    // Get total employees
    const totalEmployees = await prisma.employees.count({
      where: {
        ...whereClause,
        status: 'ACTIVE'
      }
    })

    // Get active employees (using joinDate instead of lastLogin for active calculation)
    const activeEmployees = await prisma.employees.count({
      where: {
        ...whereClause,
        status: 'ACTIVE'
      }
    })

    // Get new hires in period
    const newHires = await prisma.employees.count({
      where: {
        ...whereClause,
        hireDate: {
          gte: startDate
        }
      }
    })

    // Get departures in period
    const departures = await prisma.employees.count({
      where: {
        ...whereClause,
        status: 'ARCHIVED',
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
    const employees = await prisma.employees.findMany({
      where: {
        ...whereClause,
        status: 'ACTIVE'
      },
      select: {
        hireDate: true,
        departments: true
      }
    })

    const totalTenure = employees.reduce((sum: number, emp: { hireDate: Date | null }) => {
      const tenure = emp.hireDate ? (now.getTime() - emp.hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000) : 0
      return sum + tenure
    }, 0)

    const averageTenure = employees.length > 0 ? totalTenure / employees.length : 0

    // Get real average salary from database
    const salaryData = await prisma.employees.aggregate({
      where: {
        ...whereClause,
        status: 'ACTIVE',
        salary: { not: null }
      },
      _avg: {
        salary: true
      }
    })
    const averageSalary = salaryData._avg.salary || 0

    // Get real performance score from PerformanceReview model
    const performanceData = await prisma.performance_reviews.aggregate({
      where: {
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

    const performanceScore = performanceData._avg.overallRating || 0

    // Get real training completion rate from database
    const trainingData = await prisma.training_enrollments.aggregate({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    const completedTraining = await prisma.training_enrollments.count({
      where: {
        createdAt: {
          gte: startDate
        },
        status: 'COMPLETED'
      }
    })

    const trainingCompletionRate = trainingData._count.id > 0 
      ? (completedTraining / trainingData._count.id) * 100 
      : 0

    const metrics = {
      totalEmployees,
      activeEmployees,
      newHires,
      turnoverRate: Math.round(turnoverRate * 100) / 100,
      averageTenure: Math.round(averageTenure * 100) / 100,
      averageSalary: Math.round(averageSalary),
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
