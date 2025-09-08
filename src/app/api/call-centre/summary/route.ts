import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withRetry } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('calls.view') ||
                         session.user?.permissions?.includes('calls.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('supervisor')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: any = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {}

    // Use withRetry and handle missing tables gracefully
    let totalCalls = 0
    let resolvedCalls = 0
    let pendingCalls = 0
    let priorityStats: Array<{ priority: string | null; _count: { id: number } }> = []
    let categoryStats: Array<{ category: string | null; _count: { id: number } }> = []
    let officerPerformance: Array<{ officer: string; totalCalls: number; assignedOfficerId: string | null }> = []
    let recentCalls: any[] = []

    try {
      // Get total call statistics with error handling
      totalCalls = await withRetry(() => 
        prisma.callRecord.count({
          where: dateFilter
        })
      )

      resolvedCalls = await withRetry(() =>
        prisma.callRecord.count({
          where: {
            ...dateFilter,
            status: 'RESOLVED'
          }
        })
      )

      pendingCalls = await withRetry(() =>
        prisma.callRecord.count({
          where: {
            ...dateFilter,
            status: 'OPEN'
          }
        })
      )

      // Get calls by priority
      try {
        const priorityResults = await prisma.callRecord.groupBy({
          by: ['priority'],
          where: dateFilter,
          _count: {
            id: true
          }
        })
        priorityStats = priorityResults
      } catch (error) {
        console.warn('Error fetching priority stats:', error)
        priorityStats = []
      }

      // Get calls by category
      try {
        const categoryResults = await prisma.callRecord.groupBy({
          by: ['category'],
          where: dateFilter,
          _count: {
            id: true
          }
        })
        categoryStats = categoryResults
      } catch (error) {
        console.warn('Error fetching category stats:', error)
        categoryStats = []
      }

      // Get calls grouped by assigned officer
      const callsGroupedByOfficer = await withRetry(() =>
        prisma.callRecord.groupBy({
          by: ['assignedOfficer'],
          where: {
            ...dateFilter,
            assignedOfficer: {
              not: null
            }
          },
          _count: {
            id: true
          }
        })
      )

      // Get officer details for those with calls
      if (callsGroupedByOfficer.length > 0) {
        const officerIds = callsGroupedByOfficer.map(group => group.assignedOfficer).filter(Boolean)
        const officers = await withRetry(() =>
          prisma.user.findMany({
            where: {
              id: {
                in: officerIds as string[]
              }
            },
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          })
        )

        officerPerformance = callsGroupedByOfficer.map(group => {
          const officer = officers.find(o => o.id === group.assignedOfficer);
          return {
            officer: officer ? `${officer.firstName} ${officer.lastName}` : group.assignedOfficer || 'Unknown',
            totalCalls: group._count.id,
            assignedOfficerId: group.assignedOfficer
          }
        })
      }

      // Get recent activity (last 10 calls)
      recentCalls = await withRetry(() =>
        prisma.callRecord.findMany({
          where: dateFilter,
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          select: {
            id: true,
            caseNumber: true,
            callerName: true,
            summary: true,
            status: true,
            priority: true,
            createdAt: true,
            assignedOfficer: true
          }
        })
      )

    } catch (error: any) {
      console.warn('Call centre tables may not exist yet:', error.message)
      // Return empty data structure if tables don't exist
      // This allows the frontend to render without errors
    }

    // Format the response with safe defaults
    const summary = {
      overview: {
        totalCalls,
        resolvedCalls,
        pendingCalls,
        resolutionRate: totalCalls > 0 ? Math.round((resolvedCalls / totalCalls) * 100) : 0
      },
      priorityBreakdown: priorityStats.map(stat => ({
        priority: stat.priority || 'Unknown',
        count: stat._count.id
      })),
      categoryBreakdown: categoryStats.map(stat => ({
        category: stat.category || 'Unknown',
        count: stat._count.id
      })),
      officerPerformance: officerPerformance || [],
      recentActivity: recentCalls.map(call => ({
        id: call.id,
        caseNumber: call.caseNumber || 'N/A',
        caller: call.callerName || 'Unknown',
        summary: call.summary || 'No summary',
        status: call.status || 'UNKNOWN',
        priority: call.priority || 'NORMAL',
        assignedOfficer: call.assignedOfficer || null,
        createdAt: call.createdAt?.toISOString() || new Date().toISOString()
      }))
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Error fetching call centre summary:', error)
    
    // Return a safe default structure instead of 500 error
    const defaultSummary = {
      overview: {
        totalCalls: 0,
        resolvedCalls: 0,
        pendingCalls: 0,
        resolutionRate: 0
      },
      priorityBreakdown: [],
      categoryBreakdown: [],
      officerPerformance: [],
      recentActivity: []
    }
    
    return NextResponse.json(defaultSummary)
  }
}
