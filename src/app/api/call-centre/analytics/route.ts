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

    // Get date range from query parameters (default to last 30 days)
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Execute all queries in parallel for better performance
    const [
      totalCalls,
      completedCalls,
      pendingCalls,
      validCalls,
      callsWithSatisfaction,
      callsLast7Days,
      callsLast30Days,
      hourlyCallsToday,
      agentPerformanceData,
      callsByType,
      averageSatisfaction,
      averageResolutionTime
    ] = await Promise.all([
      // Basic metrics
      prisma.call_records.count(),
      prisma.call_records.count({
        where: { OR: [{ status: 'CLOSED' }, { status: 'RESOLVED' }] }
      }),
      prisma.call_records.count({
        where: { status: 'OPEN' }
      }),
      prisma.call_records.count({
        where: { callValidity: 'valid' }
      }),
      prisma.call_records.count({
        where: { 
          satisfactionRating: { 
            gt: 0
          } 
        }
      }),

      // Trend data
      prisma.call_records.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        select: { createdAt: true, status: true }
      }),
      
      prisma.call_records.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: { createdAt: true, status: true, callValidity: true }
      }),

      // Hourly data for today
      prisma.call_records.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        select: { createdAt: true }
      }),

      // Agent performance data (skip null officers for now)
      prisma.call_records.findMany({
        where: {
          assignedOfficer: { 
            not: null 
          },
          createdAt: { gte: startDate }
        },
        select: { assignedOfficer: true, satisfactionRating: true }
      }),

      // Call types distribution
      prisma.call_records.groupBy({
        by: ['purpose'],
        _count: { id: true }
      }),

      // Average satisfaction rating (only where rating exists)
      prisma.call_records.aggregate({
        _avg: { satisfactionRating: true },
        where: { 
          satisfactionRating: { 
            gt: 0
          } 
        }
      }),

      // Average resolution time (for resolved calls)
      prisma.call_records.findMany({
        where: {
          resolvedAt: {
            not: null
          }
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

    // Process daily trends for last 7 days
    const dailyTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayData = callsLast7Days.filter(call => 
        call.createdAt >= dayStart && call.createdAt <= dayEnd
      )
      
      dailyTrends.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        calls: dayData.length,
        answered: dayData.filter(call => call.status !== 'MISSED').length,
        resolved: dayData.filter(call => ['CLOSED', 'RESOLVED'].includes(call.status || '')).length
      })
    }

    // Process hourly data for today
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourCalls = hourlyCallsToday.filter(call => {
        const callHour = call.createdAt.getUTCHours()
        return callHour === hour
      })
      
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        calls: hourCalls.length,
        answered: hourCalls.length // Assuming all logged calls were answered
      }
    })

    // Process agent performance
    const agentStats = agentPerformanceData.reduce((acc: Record<string, { calls: number, totalSatisfaction: number, ratingCount: number }>, call) => {
      const officer = call.assignedOfficer || 'Unassigned'
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
      responseTime: '< 30s', // This would need actual timing data
      efficiency: Math.min(100, Math.round((stats.calls / Math.max(1, totalCallsCount)) * 100 * 10)) // Calculated efficiency
    })).slice(0, 10) // Top 10 agents

    // Process call types
    const callTypesData = callsByType.map(type => ({
      type: type.purpose || 'Other',
      count: type._count.id,
      percentage: Math.round(((type._count.id / Math.max(1, totalCallsCount)) * 100) * 10) / 10
    }))

    // Generate monthly volume data for charts (last 12 months)
    const monthlyVolume = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      monthDate.setDate(1);
      monthDate.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(monthDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const monthCalls = await prisma.call_records.count({
        where: {
          createdAt: {
            gte: monthDate,
            lt: nextMonth
          }
        }
      });

      const monthResolved = await prisma.call_records.count({
        where: {
          createdAt: {
            gte: monthDate,
            lt: nextMonth
          },
          OR: [{ status: 'CLOSED' }, { status: 'RESOLVED' }]
        }
      });

      monthlyVolume.push({
        month: monthDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
        calls: monthCalls,
        resolved: monthResolved
      });
    }

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
        dataRange: `${days} days`,
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
