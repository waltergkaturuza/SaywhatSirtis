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
                         session.user?.roles?.includes('manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get current date ranges
    const now = new Date()
    
    // Today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    
    // This month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    // This year
    const thisYearStart = new Date(now.getFullYear(), 0, 1)
    const thisYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

    // Get today's metrics
    const todaysMetrics = await prisma.callRecord.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    })

    // Get this month's metrics
    const thisMonthMetrics = await prisma.callRecord.findMany({
      where: {
        createdAt: {
          gte: thisMonthStart,
          lte: thisMonthEnd
        }
      }
    })

    // Get this year's metrics
    const thisYearMetrics = await prisma.callRecord.findMany({
      where: {
        createdAt: {
          gte: thisYearStart,
          lte: thisYearEnd
        }
      }
    })

    // Get all-time metrics
    const allTimeMetrics = await prisma.callRecord.findMany()

    // Calculate statistics
    const todayStats = {
      callsReceived: todaysMetrics.length,
      validCalls: todaysMetrics.filter(call => call.status !== 'SPAM').length,
      invalidCalls: todaysMetrics.filter(call => call.status === 'SPAM').length,
      newCases: todaysMetrics.filter(call => call.status === 'OPEN').length,
      averageCallDuration: '4.3 min', // This would need additional field in DB
      peakHour: '10:00 - 11:00' // This would need hour-by-hour analysis
    }

    const summaryStats = {
      thisMonth: {
        totalCalls: thisMonthMetrics.length,
        validCalls: thisMonthMetrics.filter(call => call.status !== 'SPAM').length,
        newCases: thisMonthMetrics.filter(call => call.status === 'OPEN').length,
        resolvedCases: thisMonthMetrics.filter(call => call.status === 'RESOLVED').length
      },
      thisYear: {
        totalCalls: thisYearMetrics.length,
        validCalls: thisYearMetrics.filter(call => call.status !== 'SPAM').length,
        newCases: thisYearMetrics.filter(call => call.status === 'OPEN').length,
        resolvedCases: thisYearMetrics.filter(call => call.status === 'RESOLVED').length
      },
      sinceInception: {
        totalCalls: allTimeMetrics.length,
        validCalls: allTimeMetrics.filter(call => call.status !== 'SPAM').length,
        newCases: allTimeMetrics.filter(call => call.status === 'OPEN').length,
        resolvedCases: allTimeMetrics.filter(call => call.status === 'RESOLVED').length
      }
    }

    // Get call distribution by type/purpose
    const callsByPurpose = await prisma.callRecord.groupBy({
      by: ['callType'],
      _count: {
        callType: true
      },
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    })

    // Get active cases count
    const activeCases = await prisma.callRecord.count({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        }
      }
    })

    // Get overdue cases count
    const overdueCases = await prisma.callRecord.count({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        },
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      }
    })

    return NextResponse.json({
      todaysMetrics: todayStats,
      summaryStats,
      callsByPurpose: callsByPurpose.map(item => ({
        purpose: item.callType,
        count: item._count.callType,
        color: getColorForCallType(item.callType)
      })),
      activeCases,
      overdueCases,
      validCallRate: allTimeMetrics.length > 0 ? 
        ((allTimeMetrics.filter(call => call.status !== 'SPAM').length / allTimeMetrics.length) * 100).toFixed(1) : 
        0,
      officersOnline: 12 // This would need session tracking
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getColorForCallType(callType: string) {
  const colors: { [key: string]: string } = {
    'INQUIRY': 'bg-blue-100 text-blue-800',
    'COMPLAINT': 'bg-red-100 text-red-800',
    'SUPPORT': 'bg-green-100 text-green-800',
    'EMERGENCY': 'bg-purple-100 text-purple-800',
    'FEEDBACK': 'bg-yellow-100 text-yellow-800'
  }
  return colors[callType] || 'bg-gray-100 text-gray-800'
}
