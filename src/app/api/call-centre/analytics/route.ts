import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, HttpStatus, ErrorCodes } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    
    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date()
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Basic call metrics
    const totalCalls = await prisma.callRecord.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    })

    const completedCalls = await prisma.callRecord.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    })

    const openCalls = await prisma.callRecord.count({
      where: {
        status: 'OPEN',
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    })

    const resolvedCalls = await prisma.callRecord.count({
      where: {
        resolvedAt: {
          not: null,
          gte: startDate,
          lte: now
        }
      }
    })

    // Average satisfaction rating
    const satisfactionResult = await prisma.callRecord.aggregate({
      where: {
        satisfactionRating: {
          not: null
        },
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      _avg: {
        satisfactionRating: true
      }
    })

    // Call duration calculations
    const callsWithDuration = await prisma.callRecord.findMany({
      where: {
        callStartTime: { not: null },
        callEndTime: { not: null },
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      select: {
        callStartTime: true,
        callEndTime: true
      }
    })

    const avgCallDuration = callsWithDuration.length > 0 
      ? callsWithDuration.reduce((sum, call) => {
          const duration = call.callEndTime!.getTime() - call.callStartTime!.getTime()
          return sum + (duration / 1000 / 60) // Convert to minutes
        }, 0) / callsWithDuration.length
      : 0

    // Daily call trends for the period
    const dailyTrends = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_calls,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_calls,
        COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as resolved_calls,
        AVG(satisfaction_rating) as avg_satisfaction
      FROM call_records 
      WHERE created_at >= ${startDate} AND created_at <= ${now}
      GROUP BY DATE(created_at)
      ORDER BY date
    ` as any[]

    // Call types distribution
    const callTypeDistribution = await prisma.callRecord.groupBy({
      by: ['category'],
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      _count: {
        category: true
      }
    })

    // Agent performance (based on assigned officer)
    const agentPerformance = await prisma.callRecord.groupBy({
      by: ['assignedOfficer'],
      where: {
        assignedOfficer: { not: null },
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      _count: {
        assignedOfficer: true
      },
      _avg: {
        satisfactionRating: true
      }
    })

    // Hourly distribution
    const hourlyData = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as call_count
      FROM call_records 
      WHERE created_at >= ${startDate} AND created_at <= ${now}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    ` as any[]

    const analytics = {
      summary: {
        totalCalls,
        completedCalls,
        openCalls,
        resolvedCalls,
        answerRate: totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0,
        resolutionRate: totalCalls > 0 ? (resolvedCalls / totalCalls) * 100 : 0,
        avgSatisfaction: satisfactionResult._avg.satisfactionRating || 0,
        avgCallDuration: Math.round(avgCallDuration * 10) / 10
      },
      trends: dailyTrends.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        incoming: Number(day.total_calls),
        answered: Number(day.completed_calls),
        resolved: Number(day.resolved_calls),
        satisfaction: Number(day.avg_satisfaction) || 0
      })),
      callTypes: callTypeDistribution.map((type, index) => ({
        name: type.category || 'Unknown',
        value: type._count.category,
        percentage: totalCalls > 0 ? (type._count.category / totalCalls) * 100 : 0
      })),
      agentPerformance: agentPerformance.map((agent) => ({
        name: agent.assignedOfficer || 'Unassigned',
        callsHandled: agent._count.assignedOfficer,
        avgSatisfaction: Number(agent._avg.satisfactionRating) || 0
      })),
      hourlyDistribution: hourlyData.map((hour: any) => ({
        hour: `${String(Number(hour.hour)).padStart(2, '0')}:00`,
        calls: Number(hour.call_count)
      }))
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
      { code: ErrorCodes.INTERNAL_SERVER_ERROR }
    )
    return NextResponse.json(response, { status })
  }
}