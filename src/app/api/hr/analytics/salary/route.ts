import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const position = searchParams.get('position')

    // Build where clause
    const where: any = {
      salary: { not: null }
    }
    if (department && department !== 'all') {
      // Try to match by department name or use departmentId if it's an ID
      where.OR = [
        { department: department },
        { departments: { name: department } },
        { departments: { code: department } }
      ]
    }
    if (position) where.position = position

    const [employees, salaryStats] = await Promise.all([
      // Get employees with salary data
      prisma.employees.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          department: true,
          salary: true,
          hireDate: true,
          departments: {
            select: {
              name: true,
              code: true
            }
          }
        },
        orderBy: { salary: 'desc' }
      }),
      // Get salary statistics
      prisma.employees.aggregate({
        where,
        _avg: { salary: true },
        _min: { salary: true },
        _max: { salary: true },
        _count: { salary: true }
      })
    ])

    // Calculate salary distribution by department
    const departmentStats = await prisma.employees.groupBy({
      by: ['department'],
      where: { 
        salary: { not: null },
        department: { not: null }
      },
      _avg: { salary: true },
      _count: { salary: true },
      orderBy: { _avg: { salary: 'desc' } }
    })

    // Calculate salary distribution by position
    const positionStats = await prisma.employees.groupBy({
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
        const count = await prisma.employees.count({
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
