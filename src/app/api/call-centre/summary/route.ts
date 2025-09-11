import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {}

    // Test if CallRecord table exists first
    let totalCalls, resolvedCalls, pendingCalls
    
    try {
      // Get total call statistics
      totalCalls = await prisma.callRecord.count({
        where: dateFilter
      })

      resolvedCalls = await prisma.callRecord.count({
        where: {
          ...dateFilter,
          status: 'RESOLVED'
        }
      })

      pendingCalls = await prisma.callRecord.count({
        where: {
          ...dateFilter,
          status: 'OPEN'
        }
      })
    } catch (dbError) {
      // Database table doesn't exist or connection issue
      console.error('Database error in call-centre summary:', dbError)
      
      // Return mock data when database is not available
      return NextResponse.json({
        overview: {
          totalCalls: 0,
          resolvedCalls: 0,
          pendingCalls: 0,
          resolutionRate: 0
        },
        priorityBreakdown: [],
        categoryBreakdown: [],
        officerPerformance: [],
        recentActivity: [],
        message: "Call centre data not available - database table may need migration"
      })
    }

    // Get calls by priority
    const priorityStats = await prisma.callRecord.groupBy({
      by: ['priority'],
      where: dateFilter,
      _count: {
        id: true
      }
    }).catch(() => [])

    // Get calls by category
    const categoryStats = await prisma.callRecord.groupBy({
      by: ['category'],
      where: dateFilter,
      _count: {
        id: true
      }
    }).catch(() => [])    // Get calls grouped by assigned officer
    const callsGroupedByOfficer = await prisma.callRecord.groupBy({
      by: ['assignedOfficer'],
      where: {
        ...dateFilter,
        assignedOfficer: {
          not: null
        }
      },
      _count: {
        id: true
      },
      _avg: {
        // We'll calculate response time if available
      }
    }).catch(() => [])

    // Get officer details for those with calls
    const officerIds = callsGroupedByOfficer.map(group => group.assignedOfficer).filter(Boolean)
    const officers = await prisma.user.findMany({
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
    }).catch(() => [])

    const officerPerformance = callsGroupedByOfficer.map(group => {
      const officer = officers.find(o => o.id === group.assignedOfficer);
      return {
        officer: officer ? `${officer.firstName} ${officer.lastName}` : group.assignedOfficer,
        totalCalls: group._count.id,
        assignedOfficerId: group.assignedOfficer
      }
    })

    // Get recent activity (last 10 calls)
    const recentCalls = await prisma.callRecord.findMany({
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
    }).catch(() => [])

    // Format the response
    const summary = {
      overview: {
        totalCalls,
        resolvedCalls,
        pendingCalls,
        resolutionRate: totalCalls > 0 ? Math.round((resolvedCalls / totalCalls) * 100) : 0
      },
      priorityBreakdown: priorityStats.map(stat => ({
        priority: stat.priority,
        count: stat._count.id
      })),
      categoryBreakdown: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count.id
      })),
      officerPerformance,
      recentActivity: recentCalls.map(call => ({
        id: call.id,
        caseNumber: call.caseNumber,
        caller: call.callerName,
        summary: call.summary,
        status: call.status,
        priority: call.priority,
        assignedOfficer: call.assignedOfficer,
        createdAt: call.createdAt.toISOString()
      }))
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Error fetching call centre summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
