import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '12months'

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

    // Get real department statistics from database
    const departmentStats = await prisma.employees.groupBy({
      by: ['departmentId'],
      where: {
        status: 'ACTIVE'
      },
      _count: {
        id: true
      },
      _avg: {
        salary: true
      }
    })

    // Get all departments for name mapping
    const allDepartments = await prisma.departments.findMany({
      select: {
        id: true,
        name: true
      }
    })

    // Get total active employees for percentage calculation
    const totalEmployees = await prisma.employees.count({
      where: { status: 'ACTIVE' }
    })

    // Get departures in period for turnover calculation
    const departuresByDept = await prisma.employees.groupBy({
      by: ['departmentId'],
      where: {
        status: 'ARCHIVED',
        updatedAt: {
          gte: startDate,
          lte: new Date()
        }
      },
      _count: {
        id: true
      }
    })

    // Get performance data by department
    const performanceByDept = await prisma.performance_reviews.groupBy({
      by: ['employeeId'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _avg: {
        overallRating: true
      }
    })

    // Build real department data
    const departmentData = await Promise.all(
      departmentStats.map(async (deptStat) => {
        const dept = allDepartments.find(d => d.id === deptStat.departmentId)
        const departmentName = dept?.name || 'Unknown Department'
        
        const departures = departuresByDept.find(d => d.departmentId === deptStat.departmentId)?._count.id || 0
        const employees = deptStat._count.id
        const turnoverRate = employees > 0 ? (departures / (employees + departures)) * 100 : 0
        
        // Get employees in this department for performance calculation
        const deptEmployees = await prisma.employees.findMany({
          where: {
            departmentId: deptStat.departmentId,
            status: 'ACTIVE'
          },
          select: { id: true }
        })
        
        // Calculate average performance for this department
        const deptPerformance = await prisma.performance_reviews.aggregate({
          where: {
            employeeId: {
              in: deptEmployees.map(e => e.id)
            },
            createdAt: { gte: startDate }
          },
          _avg: {
            overallRating: true
          }
        })

        return {
          department: departmentName,
          employees: employees,
          avgSalary: Math.round(deptStat._avg.salary || 0),
          turnoverRate: Math.round(turnoverRate * 100) / 100,
          performanceScore: Math.round((deptPerformance._avg.overallRating || 0) * 100) / 100,
          satisfactionScore: Math.round(((deptPerformance._avg.overallRating || 0) * 0.9) * 100) / 100, // Approximate satisfaction from performance
          percentage: totalEmployees > 0 ? Math.round((employees / totalEmployees) * 100) : 0
        }
      })
    )

    return NextResponse.json(departmentData)
  } catch (error) {
    console.error('Error fetching department analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department analytics' },
      { status: 500 }
    )
  }
}
