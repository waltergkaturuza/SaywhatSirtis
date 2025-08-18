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

    // Get current date for calculations
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get HR statistics from the Employee table (using User table as Employee table)
    const [
      totalEmployees,
      activeEmployees,
      newEmployeesThisMonth,
      departmentCount
    ] = await Promise.all([
      // Total employees (non-admin users)
      prisma.user.count({
        where: {
          role: {
            not: 'ADMIN'
          }
        }
      }),
      // Active employees (logged in within last 30 days)
      prisma.user.count({
        where: {
          role: {
            not: 'ADMIN'
          },
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // New employees this month
      prisma.user.count({
        where: {
          role: {
            not: 'ADMIN'
          },
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      }),
      // Department count (using distinct role values as department approximation)
      prisma.user.groupBy({
        by: ['role'],
        where: {
          role: {
            not: 'ADMIN'
          }
        }
      }).then(groups => groups.length)
    ])

    // Calculate additional metrics
    const hrStats = {
      totalEmployees,
      activeEmployees,
      newEmployeesThisMonth,
      departmentCount,
      // Mock values for features not yet implemented
      pendingReviews: 0, // Would come from performance review table
      trainingPrograms: 0, // Would come from training table
      monthlyPayroll: 0, // Would come from payroll table
      presentToday: activeEmployees, // Simplified - would need attendance table
      pendingLeaveApprovals: 0, // Would come from leave table
      openPositions: 0 // Would come from recruitment table
    }

    return NextResponse.json({
      success: true,
      data: hrStats
    })
    
  } catch (error) {
    console.error('HR stats API error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
