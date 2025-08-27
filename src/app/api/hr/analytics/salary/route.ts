import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const position = searchParams.get('position')

    // Build where clause
    const where: any = {
      salary: { not: null }
    }
    if (department) where.department = department
    if (position) where.position = position

    const [employees, salaryStats] = await Promise.all([
      // Get employees with salary data
      prisma.employee.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          department: true,
          salary: true,
          hireDate: true
        },
        orderBy: { salary: 'desc' }
      }),
      // Get salary statistics
      prisma.employee.aggregate({
        where,
        _avg: { salary: true },
        _min: { salary: true },
        _max: { salary: true },
        _count: { salary: true }
      })
    ])

    // Calculate salary distribution by department
    const departmentStats = await prisma.employee.groupBy({
      by: ['department'],
      where: { salary: { not: null } },
      _avg: { salary: true },
      _count: { salary: true },
      orderBy: { _avg: { salary: 'desc' } }
    })

    // Calculate salary distribution by position
    const positionStats = await prisma.employee.groupBy({
      by: ['position'],
      where: { salary: { not: null } },
      _avg: { salary: true },
      _count: { salary: true },
      orderBy: { _avg: { salary: 'desc' } }
    })

    // Calculate salary ranges
    const salaryRanges = [
      { range: '0-30k', min: 0, max: 30000 },
      { range: '30k-50k', min: 30000, max: 50000 },
      { range: '50k-75k', min: 50000, max: 75000 },
      { range: '75k-100k', min: 75000, max: 100000 },
      { range: '100k+', min: 100000, max: 999999999 }
    ]

    const rangeDistribution = await Promise.all(
      salaryRanges.map(async (range) => {
        const count = await prisma.employee.count({
          where: {
            ...where,
            salary: {
              gte: range.min,
              lt: range.max
            }
          }
        })
        return { ...range, count }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        employees,
        statistics: {
          average: salaryStats._avg.salary,
          minimum: salaryStats._min.salary,
          maximum: salaryStats._max.salary,
          count: salaryStats._count.salary
        },
        departmentBreakdown: departmentStats,
        positionBreakdown: positionStats,
        rangeDistribution
      }
    })
  } catch (error) {
    console.error('Salary analytics fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch salary analytics' },
      { status: 500 }
    )
  }
}
