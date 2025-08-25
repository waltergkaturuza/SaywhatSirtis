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

    // Get comprehensive HR data summary
    const [
      totalUsers,
      activeEmployees,
      archivedEmployees,
      recentHires,
      departmentStats,
      positionStats
    ] = await Promise.all([
      // Total users in system
      prisma.user.count(),
      
      // Active employees
      prisma.user.count({
        where: { isActive: true }
      }),
      
      // Archived employees
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
      
      // Department breakdown
      prisma.user.groupBy({
        by: ['department'],
        where: { 
          isActive: true,
          department: { not: null }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      
      // Position breakdown
      prisma.user.groupBy({
        by: ['position'],
        where: { 
          isActive: true,
          position: { not: null }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      })
    ])

    // Calculate growth metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    
    const [currentMonthHires, previousMonthHires] = await Promise.all([
      prisma.user.count({
        where: {
          isActive: true,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.user.count({
        where: {
          isActive: true,
          createdAt: { 
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      })
    ])

    const growthRate = previousMonthHires > 0 
      ? ((currentMonthHires - previousMonthHires) / previousMonthHires) * 100
      : currentMonthHires > 0 ? 100 : 0

    const summary = {
      overview: {
        totalUsers,
        activeEmployees,
        archivedEmployees,
        recentHires,
        growthRate: Math.round(growthRate * 100) / 100
      },
      departments: departmentStats.map(dept => ({
        name: dept.department || 'Unassigned',
        count: dept._count.id
      })),
      positions: positionStats.slice(0, 10).map(pos => ({
        name: pos.position || 'Unassigned',
        count: pos._count.id
      })),
      metrics: {
        activeRate: totalUsers > 0 ? Math.round((activeEmployees / totalUsers) * 100) : 0,
        retentionRate: totalUsers > 0 ? Math.round(((totalUsers - archivedEmployees) / totalUsers) * 100) : 0,
        avgHiresPerMonth: Math.round(recentHires * (30 / 30)) // Current month projection
      }
    }

    return NextResponse.json({
      success: true,
      data: summary
    })
  } catch (error) {
    console.error('HR Data Summary API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch HR data summary' },
      { status: 500 }
    )
  }
}
