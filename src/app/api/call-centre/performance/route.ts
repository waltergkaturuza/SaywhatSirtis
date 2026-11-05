import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'
import { isPlaceholderOfficer, repairPlaceholderOfficersOnce, UNKNOWN_OFFICER_LABEL } from '@/lib/call-centre/officer-names'

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre performance API')
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' }, 
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('calls.view') ||
                         session.user?.permissions?.includes('calls.full_access') ||
                         session.user?.permissions?.includes('call_center_full') ||
                         session.user?.permissions?.includes('callcentre.access') ||
                         session.user?.permissions?.includes('callcentre.officer') ||
                         session.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1'].includes(role.toLowerCase()))

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await repairPlaceholderOfficersOnce()

    // Calculate date ranges
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // End of current week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999)

    try {
      // Get team metrics for this week
      const [
        totalCallsThisWeek,
        validCallsThisWeek,
        totalCasesThisWeek,
        resolvedCallsThisWeek,
        satisfactionData,
        officerStats
      ] = await Promise.all([
        // Total calls this week
        prisma.call_records.count({
          where: { createdAt: { gte: startOfWeek, lte: endOfWeek } }
        }),
        
        // Valid calls this week
        prisma.call_records.count({
          where: { 
            createdAt: { gte: startOfWeek, lte: endOfWeek },
            callValidity: 'valid'
          }
        }),
        
        // Total cases this week
        prisma.call_records.count({
          where: { 
            createdAt: { gte: startOfWeek, lte: endOfWeek },
            isCase: 'YES'
          }
        }),
        
        // Resolved calls for resolution time calculation
        prisma.call_records.findMany({
          where: {
            createdAt: { gte: startOfWeek, lte: endOfWeek },
            resolvedAt: { not: null }
          },
          select: { createdAt: true, resolvedAt: true }
        }),
        
        // Satisfaction ratings
        prisma.call_records.aggregate({
          where: {
            createdAt: { gte: startOfWeek, lte: endOfWeek },
            satisfactionRating: { gt: 0 }
          },
          _avg: { satisfactionRating: true },
          _count: { satisfactionRating: true }
        }),
        
        prisma.call_records.findMany({
          where: { createdAt: { gte: startOfWeek, lte: endOfWeek } },
          select: {
            officerName: true,
            assignedOfficer: true,
            callValidity: true,
            isCase: true,
            category: true,
            callStartTime: true,
            callEndTime: true,
            satisfactionRating: true
          }
        })
      ])

      // Calculate team metrics
      const averageValidCallRate = totalCallsThisWeek > 0 ? 
        Math.round((validCallsThisWeek / totalCallsThisWeek) * 100) : 0

      // Calculate average resolution time
      let averageResolutionTime = '0 days'
      if (resolvedCallsThisWeek.length > 0) {
        const totalResolutionMs = resolvedCallsThisWeek.reduce((sum, call) => {
          if (call.resolvedAt && call.createdAt) {
            return sum + (call.resolvedAt.getTime() - call.createdAt.getTime())
          }
          return sum
        }, 0)
        const avgResolutionDays = totalResolutionMs / (resolvedCallsThisWeek.length * 1000 * 60 * 60 * 24)
        averageResolutionTime = avgResolutionDays < 1 ? 
          `${Math.round(avgResolutionDays * 24)} hours` : 
          `${Math.round(avgResolutionDays)} days`
      }

      const customerSatisfaction = satisfactionData._avg.satisfactionRating || 0

      type OfficerTotals = {
        calls: number
        valid: number
        cases: number
        timedCalls: number
        totalMs: number
        ratingSum: number
        ratingCount: number
      }
      const totalsByOfficer = new Map<string, OfficerTotals>()

      for (const call of officerStats) {
        const name = !isPlaceholderOfficer(call.officerName)
          ? String(call.officerName).trim()
          : !isPlaceholderOfficer(call.assignedOfficer)
            ? String(call.assignedOfficer).trim()
            : UNKNOWN_OFFICER_LABEL
        const totals = totalsByOfficer.get(name) || { calls: 0, valid: 0, cases: 0, timedCalls: 0, totalMs: 0, ratingSum: 0, ratingCount: 0 }
        totals.calls += 1
        if ((call.callValidity || '').toLowerCase() === 'valid') totals.valid += 1
        if ((call.isCase || '').toUpperCase() === 'YES' || (call.category || '').toUpperCase() === 'CASE') totals.cases += 1
        if (call.callStartTime && call.callEndTime && call.callEndTime > call.callStartTime) {
          totals.timedCalls += 1
          totals.totalMs += call.callEndTime.getTime() - call.callStartTime.getTime()
        }
        if (call.satisfactionRating && call.satisfactionRating > 0) {
          totals.ratingSum += call.satisfactionRating
          totals.ratingCount += 1
        }
        totalsByOfficer.set(name, totals)
      }

      const officerPerformance = [...totalsByOfficer.entries()]
        .map(([name, totals]) => {
          const avgMinutes = totals.timedCalls > 0 ? Math.round(totals.totalMs / (totals.timedCalls * 60000)) : 0
          return {
            id: name,
            name,
            avatar: '👤',
            callsToday: totals.calls,
            validCallsRate: totals.calls > 0 ? Math.min(100, Math.round((totals.valid / totals.calls) * 100)) : 0,
            casesCreated: totals.cases,
            averageCallTime: totals.timedCalls === 0 ? '0 min' : avgMinutes > 0 ? `${avgMinutes} min` : '< 1 min',
            rating: totals.ratingCount > 0 ? Math.round((totals.ratingSum / totals.ratingCount) * 10) / 10 : 0,
            status: 'online'
          }
        })
        .sort((a, b) => b.callsToday - a.callsToday)

      const performanceData = {
        teamMetrics: {
          totalCallsThisWeek,
          averageValidCallRate,
          totalCasesThisWeek,
          averageResolutionTime,
          customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
          responseTime: '0 min' // Could be enhanced with actual response time tracking
        },
        officerPerformance
      }

      return NextResponse.json(performanceData)
    } catch (error) {
      console.error('Error fetching performance data:', error)
      // Return fallback data if queries fail
      const fallbackData = {
        teamMetrics: {
          totalCallsThisWeek: 0,
          averageValidCallRate: 0,
          totalCasesThisWeek: 0,
          averageResolutionTime: '0 days',
          customerSatisfaction: 0,
          responseTime: '0 min'
        },
        officerPerformance: []
      }
      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}
