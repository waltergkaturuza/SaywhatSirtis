import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable authentication for development testing
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    //Check permissions
    const hasPermission = session.user?.permissions?.includes('calls.view') ||
                         session.user?.permissions?.includes('calls.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get quick stats from database
    const [
      totalCallsToday,
      activeCases,
      pendingFollowups,
      overdueCases
    ] = await Promise.all([
      // Total calls today
      prisma.callRecord.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      // Active cases (calls that are still open)
      prisma.callRecord.count({
        where: {
          status: 'OPEN'
        }
      }),
      // Pending follow-ups
      prisma.callRecord.count({
        where: {
          followUpRequired: true,
          followUpDate: {
            gte: new Date()
          }
        }
      }),
      // Overdue cases (calls older than 7 days and still open)
      prisma.callRecord.count({
        where: {
          status: 'OPEN',
          createdAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Calculate valid calls rate
    const validCalls = await prisma.callRecord.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        // Assuming calls with non-empty summary are valid calls
        summary: {
          not: null
        }
      }
    })

    const validCallsRate = totalCallsToday > 0 ? 
      Math.round((validCalls / totalCallsToday) * 100) : 0

    // For now, officers online is a placeholder
    const officersOnline = 0

    const quickStatsData = {
      totalCallsToday,
      activeCases,
      pendingFollowups,
      overdueCases,
      validCallsRate,
      officersOnline,
      trends: {
        callsChange: '+0%',
        casesChange: '+0%',
        followupsChange: '+0%',
        overdueChange: '+0%',
        validRateChange: '+0%',
        officersStatus: 'Available'
      }
    }

    return NextResponse.json(quickStatsData)
  } catch (error) {
    console.error('Error fetching quick stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quick stats' },
      { status: 500 }
    )
  }
}
