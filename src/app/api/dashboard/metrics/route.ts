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
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

    // Get member count from User table (representing membership database)
    const [totalMembers, activeMembers, newMembersThisMonth] = await Promise.all([
      prisma.user.count({
        where: {
          role: {
            not: 'ADMIN' // Exclude admin users from member count
          }
        }
      }),
      prisma.user.count({
        where: {
          role: {
            not: 'ADMIN'
          },
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Active in last 30 days
          }
        }
      }),
      prisma.user.count({
        where: {
          role: {
            not: 'ADMIN'
          },
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      })
    ])

    // Get call statistics and additional metrics
    const [callsThisMonth, callsThisYear, callsToday, avgSatisfactionRating, callSuccessRate] = await Promise.all([
      prisma.callCentreRecord.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      }),
      prisma.callCentreRecord.count({
        where: {
          createdAt: {
            gte: firstDayOfYear
          }
        }
      }),
      prisma.callCentreRecord.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        }
      }),
      // Calculate average satisfaction rating
      prisma.callCentreRecord.aggregate({
        _avg: {
          satisfactionRating: true
        }
      }).then(result => result._avg?.satisfactionRating || 0),
      // Calculate call success rate (resolved calls vs total calls)
      prisma.callCentreRecord.count({
        where: {
          status: 'RESOLVED'
        }
      }).then(async (resolvedCalls) => {
        const totalCalls = await prisma.callCentreRecord.count()
        return totalCalls > 0 ? (resolvedCalls / totalCalls) * 100 : 0
      })
    ])

    // Get program performance metrics
    const [activePrograms, totalPrograms, completedPrograms] = await Promise.all([
      prisma.project.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.project.count(),
      prisma.project.count({
        where: {
          status: 'COMPLETED'
        }
      })
    ])

    // Calculate program success rate
    const programSuccessRate = totalPrograms > 0 
      ? (completedPrograms / totalPrograms) * 100 
      : 0

    return NextResponse.json({
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      totalCalls: callsThisYear,
      callsToday,
      callsThisMonth,
      avgSatisfactionRating,
      callSuccessRate,
      totalPrograms,
      activePrograms,
      completedPrograms,
      programSuccessRate
    })
    
  } catch (error) {
    console.error('Dashboard metrics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
