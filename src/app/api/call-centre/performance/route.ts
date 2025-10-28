import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'

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
        
        // Officer performance data
        prisma.call_records.groupBy({
          by: ['assignedOfficer'],
          where: {
            createdAt: { gte: startOfWeek, lte: endOfWeek },
            assignedOfficer: { not: null }
          },
          _count: { id: true },
          _avg: { satisfactionRating: true }
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

      // Process officer performance data
      const officerPerformance = await Promise.all(
        officerStats.map(async (officer) => {
          // Get additional stats for each officer
          const [validCalls, cases, avgTime] = await Promise.all([
            prisma.call_records.count({
              where: {
                assignedOfficer: officer.assignedOfficer,
                createdAt: { gte: startOfWeek, lte: endOfWeek },
                callValidity: 'valid'
              }
            }),
            prisma.call_records.count({
              where: {
                assignedOfficer: officer.assignedOfficer,
                createdAt: { gte: startOfWeek, lte: endOfWeek },
                isCase: 'YES'
              }
            }),
            prisma.call_records.findMany({
              where: {
                assignedOfficer: officer.assignedOfficer,
                createdAt: { gte: startOfWeek, lte: endOfWeek },
                resolvedAt: { not: null }
              },
              select: { createdAt: true, resolvedAt: true }
            })
          ])

          // Calculate average time for this officer
          let avgTimeStr = '0 min'
          if (avgTime.length > 0) {
            const totalMs = avgTime.reduce((sum, call) => {
              if (call.resolvedAt && call.createdAt) {
                return sum + (call.resolvedAt.getTime() - call.createdAt.getTime())
              }
              return sum
            }, 0)
            const avgMinutes = Math.round(totalMs / (avgTime.length * 1000 * 60))
            avgTimeStr = `${avgMinutes} min`
          }

          const validRate = officer._count.id > 0 ? 
            Math.round((validCalls / officer._count.id) * 100) : 0

          return {
            officer: officer.assignedOfficer || 'Unknown',
            calls: officer._count.id,
            validRate: `${validRate}%`,
            cases: cases,
            avgTime: avgTimeStr,
            rating: Math.round((officer._avg.satisfactionRating || 0) * 10) / 10,
            status: 'online' // Default status - could be enhanced with real status tracking
          }
        })
      )

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
