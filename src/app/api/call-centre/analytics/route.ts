import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'
import { createSuccessResponse, createErrorResponse, HttpStatus, ErrorCodes } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre analytics API')
      const { response, status } = createErrorResponse(
        'Database connection unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
        { code: 'DB_CONNECTION_FAILED' }
      )
      return NextResponse.json(response, { status })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    // Check permissions
    const hasPermission = session.user.permissions?.includes('callcentre.access') ||
                         session.user.permissions?.includes('calls.view') ||
                         session.user.permissions?.includes('calls.full_access') ||
                         session.user.roles?.includes('admin') ||
                         session.user.roles?.includes('manager')

    if (!hasPermission) {
      const { response, status } = createErrorResponse(
        'Insufficient permissions',
        HttpStatus.FORBIDDEN,
        { code: ErrorCodes.FORBIDDEN }
      )
      return NextResponse.json(response, { status })
    }

    // Period applies to every metric and chart: 7, 30, 90, this-year, a calendar year, or all.
    const { searchParams } = new URL(request.url)
    const periodParam = (searchParams.get('period') || searchParams.get('days') || '30').trim()
    const now = new Date()
    let rangeStart: Date | null = null
    let rangeEnd: Date | null = null
    let rangeLabel = 'Last 30 days'

    if (periodParam === 'all') {
      rangeLabel = 'All time'
    } else if (periodParam === 'this-year') {
      rangeStart = new Date(now.getFullYear(), 0, 1)
      rangeLabel = `This year (${now.getFullYear()})`
    } else if (/^\d{4}$/.test(periodParam)) {
      const year = parseInt(periodParam, 10)
      rangeStart = new Date(year, 0, 1)
      rangeEnd = new Date(year, 11, 31, 23, 59, 59, 999)
      rangeLabel = String(year)
    } else {
      const days = [7, 30, 90].includes(parseInt(periodParam, 10)) ? parseInt(periodParam, 10) : 30
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      rangeStart.setDate(rangeStart.getDate() - (days - 1))
      rangeLabel = `Last ${days} days`
    }

    const createdAtFilter: { gte?: Date; lte?: Date } = {}
    if (rangeStart) createdAtFilter.gte = rangeStart
    if (rangeEnd) createdAtFilter.lte = rangeEnd
    const dateWhere = rangeStart || rangeEnd ? { createdAt: createdAtFilter } : {}

    // Execute all queries in parallel for better performance
    const [
      totalCalls,
      completedCalls,
      pendingCalls,
      validCalls,
      callsWithSatisfaction,
      trendRecords,
      agentPerformanceData,
      callsByType,
      averageSatisfaction,
      averageResolutionTime
    ] = await Promise.all([
      prisma.call_records.count({ where: dateWhere }),
      prisma.call_records.count({
        where: { ...dateWhere, OR: [{ status: 'CLOSED' }, { status: 'RESOLVED' }] }
      }),
      prisma.call_records.count({
        where: { ...dateWhere, status: 'OPEN' }
      }),
      prisma.call_records.count({
        where: { ...dateWhere, callValidity: 'valid' }
      }),
      prisma.call_records.count({
        where: {
          ...dateWhere,
          satisfactionRating: { gt: 0 }
        }
      }),

      prisma.call_records.findMany({
        where: dateWhere,
        select: { createdAt: true, status: true }
      }),

      prisma.call_records.findMany({
        where: dateWhere,
        select: { assignedOfficer: true, officerName: true, satisfactionRating: true }
      }),

      prisma.call_records.groupBy({
        by: ['purpose'],
        where: dateWhere,
        _count: { id: true }
      }),

      prisma.call_records.aggregate({
        _avg: { satisfactionRating: true },
        where: {
          ...dateWhere,
          satisfactionRating: { gt: 0 }
        }
      }),

      prisma.call_records.findMany({
        where: {
          ...dateWhere,
          resolvedAt: { not: null }
        },
        select: {
          createdAt: true,
          resolvedAt: true
        }
      })
    ])

    // Calculate metrics
    const totalCallsCount = totalCalls || 0
    const completionRate = totalCallsCount > 0 ? (completedCalls / totalCallsCount) * 100 : 0
    const answerRate = totalCallsCount > 0 ? (validCalls / totalCallsCount) * 100 : 0
    const satisfactionScore = averageSatisfaction._avg.satisfactionRating || 0

    // Calculate average resolution time in hours
    let avgResolutionHours = 0
    if (averageResolutionTime.length > 0) {
      const totalResolutionTime = averageResolutionTime.reduce((sum, call) => {
        if (call.resolvedAt && call.createdAt) {
          const diff = call.resolvedAt.getTime() - call.createdAt.getTime()
          return sum + diff
        }
        return sum
      }, 0)
      avgResolutionHours = totalResolutionTime / (averageResolutionTime.length * 1000 * 60 * 60) // Convert to hours
    }

    const trendEnd = rangeEnd ?? now
    const earliestRecord = trendRecords.reduce<Date | null>((earliest, call) => {
      if (!earliest || call.createdAt < earliest) return call.createdAt
      return earliest
    }, null)
    const trendStart = rangeStart ?? earliestRecord ?? now
    const spanDays = Math.max(1, Math.ceil((trendEnd.getTime() - trendStart.getTime()) / (24 * 60 * 60 * 1000)) + 1)
    const useMonthly = periodParam === 'all' || periodParam === 'this-year' || /^\d{4}$/.test(periodParam) || spanDays > 92

    const dailyTrends: Array<{ day: string; date: string; calls: number; answered: number; resolved: number }> = []
    if (useMonthly) {
      const cursor = new Date(trendStart.getFullYear(), trendStart.getMonth(), 1)
      const lastMonth = new Date(trendEnd.getFullYear(), trendEnd.getMonth(), 1)
      while (cursor <= lastMonth) {
        const monthStart = new Date(cursor)
        const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999)
        const monthData = trendRecords.filter(call => call.createdAt >= monthStart && call.createdAt <= monthEnd)
        dailyTrends.push({
          day: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          date: monthStart.toISOString().split('T')[0],
          calls: monthData.length,
          answered: monthData.filter(call => call.status !== 'MISSED').length,
          resolved: monthData.filter(call => ['CLOSED', 'RESOLVED'].includes(call.status || '')).length
        })
        cursor.setMonth(cursor.getMonth() + 1)
      }
    } else {
      const cursor = new Date(trendStart.getFullYear(), trendStart.getMonth(), trendStart.getDate())
      const lastDay = new Date(trendEnd.getFullYear(), trendEnd.getMonth(), trendEnd.getDate())
      while (cursor <= lastDay) {
        const dayStart = new Date(cursor)
        const dayEnd = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 23, 59, 59, 999)
        const dayData = trendRecords.filter(call => call.createdAt >= dayStart && call.createdAt <= dayEnd)
        dailyTrends.push({
          day: spanDays <= 14
            ? dayStart.toLocaleDateString('en-US', { weekday: 'short' })
            : dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date: dayStart.toISOString().split('T')[0],
          calls: dayData.length,
          answered: dayData.filter(call => call.status !== 'MISSED').length,
          resolved: dayData.filter(call => ['CLOSED', 'RESOLVED'].includes(call.status || '')).length
        })
        cursor.setDate(cursor.getDate() + 1)
      }
    }

    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourCalls = trendRecords.filter(call => call.createdAt.getUTCHours() === hour)
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        calls: hourCalls.length,
        answered: hourCalls.length
      }
    })

    // Process agent performance
    const agentStats = agentPerformanceData.reduce((acc: Record<string, { calls: number, totalSatisfaction: number, ratingCount: number }>, call) => {
      const officer = call.officerName || call.assignedOfficer || 'Unassigned'
      if (!acc[officer]) {
        acc[officer] = { calls: 0, totalSatisfaction: 0, ratingCount: 0 }
      }
      acc[officer].calls++
      if (call.satisfactionRating && call.satisfactionRating > 0) {
        acc[officer].totalSatisfaction += call.satisfactionRating
        acc[officer].ratingCount++
      }
      return acc
    }, {})

    const agentPerformance = Object.entries(agentStats).map(([name, stats]) => ({
      name,
      callsHandled: stats.calls,
      avgSatisfaction: stats.ratingCount > 0 ? Math.round((stats.totalSatisfaction / stats.ratingCount) * 10) / 10 : 0,
      responseTime: '< 30s',
      efficiency: Math.min(100, Math.round((stats.calls / Math.max(1, totalCallsCount)) * 100 * 10))
    })).sort((a, b) => b.callsHandled - a.callsHandled).slice(0, 10)

    // Process call types
    const callTypesData = callsByType.map(type => ({
      type: type.purpose || 'Other',
      count: type._count.id,
      percentage: Math.round(((type._count.id / Math.max(1, totalCallsCount)) * 100) * 10) / 10
    }))

    const monthlyVolume = dailyTrends
      .filter(() => useMonthly)
      .map(point => ({
        month: point.day,
        calls: point.calls,
        resolved: point.resolved
      }))

    // Prepare comprehensive analytics data
    const analytics = {
      // Main metrics matching frontend structure
      callMetrics: {
        totalCalls: totalCallsCount,
        answerRate: Math.round(answerRate * 10) / 10,
        avgHandleTime: `${Math.round(avgResolutionHours * 10) / 10}h`,
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        pendingCalls: pendingCalls || 0,
        resolvedCalls: completedCalls || 0,
        validCalls: validCalls || 0
      },

      // Trends data
      callTrends: dailyTrends,

      // Monthly volume for charts
      monthlyVolume: monthlyVolume,

      // Call types distribution
      callTypes: callTypesData,

      // Agent performance data
      agentPerformance: agentPerformance.slice(0, 10), // Top 10 agents

      // Hourly patterns
      hourlyData: hourlyData,

      // Additional metadata
      metadata: {
        dataRange: rangeLabel,
        trendGranularity: useMonthly ? 'month' : 'day',
        lastUpdated: new Date().toISOString(),
        totalAgents: Object.keys(agentStats).length,
        averageResolutionHours: Math.round(avgResolutionHours * 10) / 10
      }
    }

    const response = createSuccessResponse(analytics, {
      message: 'Call centre analytics retrieved successfully'
    })
    return NextResponse.json(response)
  } catch (error) {
    console.error('Call centre analytics error:', error)
    const { response, status } = createErrorResponse(
      'Failed to retrieve analytics',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { code: ErrorCodes.INTERNAL_SERVER_ERROR, details: { message: error instanceof Error ? error.message : 'Unknown error' } }
    )
    return NextResponse.json(response, { status })
  }
}
