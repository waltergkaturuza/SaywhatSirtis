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

    // Get call centre statistics
    const totalCalls = await prisma.call_records.count()
    
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const callsToday = await prisma.call_records.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    })

    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    thisMonthStart.setHours(0, 0, 0, 0)
    
    const callsThisMonth = await prisma.call_records.count({
      where: {
        createdAt: {
          gte: thisMonthStart
        }
      }
    })

    // Calculate satisfaction rating average
    const satisfactionStats = await prisma.call_records.aggregate({
      _avg: {
        satisfactionRating: true
      },
      where: {
        satisfactionRating: {
          not: null
        }
      }
    })

    // Count successful calls (resolved)
    const successfulCalls = await prisma.call_records.count({
      where: {
        status: 'RESOLVED'
      }
    })

    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0
    const avgSatisfaction = satisfactionStats._avg?.satisfactionRating || 0

    return NextResponse.json({
      totalCalls,
      callsToday,
      callsThisMonth,
      avgSatisfactionRating: avgSatisfaction,
      callSuccessRate: successRate,
      successfulCalls
    })

  } catch (error) {
    console.error('Error fetching call centre stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not implemented' },
    { status: 501 }
  )
}
