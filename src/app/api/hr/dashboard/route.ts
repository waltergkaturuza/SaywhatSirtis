import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get HR dashboard statistics
    const stats = await Promise.all([
      // Total active employees
      prisma.user.count({
        where: { isActive: true }
      }),
      
      // Total archived employees
      prisma.user.count({
        where: { isActive: false }
      }),
      
      // Recent hires (last 30 days)
      prisma.user.count({
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Employees by department
      prisma.user.groupBy({
        by: ['department'],
        where: { isActive: true },
        _count: { id: true }
      })
    ])

    const [totalEmployees, archivedEmployees, recentHires, departmentBreakdown] = stats

    const dashboardData = {
      totalEmployees,
      archivedEmployees,
      recentHires,
      departmentBreakdown: departmentBreakdown.reduce((acc, dept) => {
        if (dept.department) {
          acc[dept.department] = dept._count.id
        }
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })
  } catch (error) {
    console.error('HR Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch HR dashboard data' },
      { status: 500 }
    )
  }
}
