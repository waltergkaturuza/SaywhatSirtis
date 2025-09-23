import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'

// Helper: safe percentage formatting
function pct(part: number, whole: number) {
  if (!whole || whole === 0) return 0
  return parseFloat(((part / whole) * 100).toFixed(1))
}

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre dashboard API')
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

    // Execute queries with timeout and error handling for production stability
    const queryTimeout = 15000; // 15 seconds timeout for each query group
    
    let todayTotal = 0, todayOpen = 0;
    let monthTotal = 0, monthOpen = 0, monthResolved = 0;
    let yearTotal = 0, yearOpen = 0, yearResolved = 0;
    let allTotal = 0, allOpen = 0, allResolved = 0;
    let activeCases = 0, overdueCases = 0;
    let callsByPurpose: any[] = [];

    try {
      // Group 1: Today's metrics with timeout
      const todayPromises = Promise.race([
        Promise.all([
          prisma.call_records.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
          prisma.call_records.count({ where: { createdAt: { gte: todayStart, lte: todayEnd }, status: 'OPEN' } })
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Today metrics timeout')), queryTimeout))
      ]);
      
      [todayTotal, todayOpen] = await todayPromises as [number, number];
    } catch (error) {
      console.warn('Today metrics query failed, using defaults:', error);
    }

    try {
      // Group 2: Month/Year metrics with timeout  
      const periodPromises = Promise.race([
        Promise.all([
          prisma.call_records.count({ where: { createdAt: { gte: thisMonthStart, lte: thisMonthEnd } } }),
          prisma.call_records.count({ where: { createdAt: { gte: thisMonthStart, lte: thisMonthEnd }, status: 'OPEN' } }),
          prisma.call_records.count({ where: { createdAt: { gte: thisMonthStart, lte: thisMonthEnd }, status: 'RESOLVED' } }),
          prisma.call_records.count({ where: { createdAt: { gte: thisYearStart, lte: thisYearEnd } } }),
          prisma.call_records.count({ where: { createdAt: { gte: thisYearStart, lte: thisYearEnd }, status: 'OPEN' } }),
          prisma.call_records.count({ where: { createdAt: { gte: thisYearStart, lte: thisYearEnd }, status: 'RESOLVED' } })
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Period metrics timeout')), queryTimeout))
      ]);
      
      [monthTotal, monthOpen, monthResolved, yearTotal, yearOpen, yearResolved] = await periodPromises as number[];
    } catch (error) {
      console.warn('Period metrics query failed, using defaults:', error);
    }

    try {
      // Group 3: All-time and case metrics with timeout
      const allTimePromises = Promise.race([
        Promise.all([
          prisma.call_records.count(),
          prisma.call_records.count({ where: { status: 'OPEN' } }),
          prisma.call_records.count({ where: { status: 'RESOLVED' } }),
          prisma.call_records.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
          prisma.call_records.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('All-time metrics timeout')), queryTimeout))
      ]);
      
      [allTotal, allOpen, allResolved, activeCases, overdueCases] = await allTimePromises as number[];
    } catch (error) {
      console.warn('All-time metrics query failed, using defaults:', error);
    }

    try {
      // Group 4: Call purpose distribution with timeout
      const purposePromise = Promise.race([
        prisma.call_records.groupBy({
          by: ['callType'],
          _count: { callType: true },
          where: { createdAt: { gte: todayStart, lte: todayEnd } }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Purpose distribution timeout')), queryTimeout))
      ]);
      
      callsByPurpose = await purposePromise as any[];
    } catch (error) {
      console.warn('Purpose distribution query failed, using defaults:', error);
      callsByPurpose = [];
    }

    const todayStats = {
      callsReceived: todayTotal,
      validCalls: todayTotal, // placeholder until validity metric defined
      invalidCalls: 0, // placeholder
      newCases: todayOpen,
      averageCallDuration: 'N/A',
      peakHour: 'N/A'
    }

    const summaryStats = {
      thisMonth: {
        totalCalls: monthTotal,
        validCalls: monthTotal, // placeholder
        newCases: monthOpen,
        resolvedCases: monthResolved
      },
      thisYear: {
        totalCalls: yearTotal,
        validCalls: yearTotal, // placeholder
        newCases: yearOpen,
        resolvedCases: yearResolved
      },
      sinceInception: {
        totalCalls: allTotal,
        validCalls: allTotal, // placeholder
        newCases: allOpen,
        resolvedCases: allResolved
      }
    }

    const response = {
      todaysMetrics: todayStats,
      summaryStats,
      callsByPurpose: callsByPurpose.map(item => ({
        purpose: item.callType || 'UNKNOWN',
        count: item._count.callType,
        color: getColorForCallType(item.callType || 'UNKNOWN')
      })),
      activeCases,
      overdueCases,
      validCallRate: pct(allTotal, allTotal),
      officersOnline: 0 // placeholder until presence tracking implemented
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? { name: error.name, message: error.message } : 'Unknown error'
    }, { status: 500 })
  }
}

function getColorForCallType(callType: string) {
  const colors: { [key: string]: string } = {
    'INQUIRY': 'bg-blue-100 text-blue-800',
    'COMPLAINT': 'bg-red-100 text-red-800',
    'SUPPORT': 'bg-green-100 text-green-800',
    'EMERGENCY': 'bg-purple-100 text-purple-800',
    'FEEDBACK': 'bg-yellow-100 text-yellow-800',
    'UNKNOWN': 'bg-gray-100 text-gray-800'
  }
  return colors[callType] || 'bg-gray-100 text-gray-800'
}
