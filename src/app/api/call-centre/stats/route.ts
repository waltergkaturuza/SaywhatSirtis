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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

    // Get call centre statistics
    const [
      callsToday,
      callsThisMonth,
      callsThisYear,
      activeCases,
      pendingCases,
      overdueCases,
      resolvedCases,
      totalCases
    ] = await Promise.all([
      // Calls today
      prisma.callCentreRecord.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      // Calls this month
      prisma.callCentreRecord.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      }),
      // Calls this year
      prisma.callCentreRecord.count({
        where: {
          createdAt: {
            gte: firstDayOfYear
          }
        }
      }),
      // Active cases
      prisma.callCentreRecord.count({
        where: {
          status: 'IN_PROGRESS'
        }
      }),
      // Pending cases (using OPEN status)
      prisma.callCentreRecord.count({
        where: {
          status: 'OPEN'
        }
      }),
      // Overdue cases (more than 7 days old and not resolved)
      prisma.callCentreRecord.count({
        where: {
          status: {
            notIn: ['RESOLVED', 'CLOSED']
          },
          createdAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // Resolved cases
      prisma.callCentreRecord.count({
        where: {
          status: 'RESOLVED'
        }
      }),
      // Total cases
      prisma.callCentreRecord.count()
    ])

    // Calculate resolution rate
    const resolutionRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0

    // Calculate average satisfaction rating
    const avgSatisfactionResult = await prisma.callCentreRecord.aggregate({
      _avg: {
        satisfactionRating: true
      }
    })
    const avgSatisfactionRating = avgSatisfactionResult._avg?.satisfactionRating || 0

    return NextResponse.json({
      success: true,
      data: {
        callsToday,
        callsThisMonth,
        callsThisYear,
        activeCases,
        pendingCases,
        overdueCases,
        resolvedCases,
        totalCases,
        resolutionRate,
        avgSatisfactionRating
      }
    })
    
  } catch (error) {
    console.error('Call centre stats API error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
