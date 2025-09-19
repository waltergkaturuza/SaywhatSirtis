import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable authentication for development testing
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Unified permission check (align with dashboard route)
    const hasPermission = session.user?.permissions?.includes('calls.view') ||
      session.user?.permissions?.includes('calls.full_access') ||
      session.user?.roles?.includes('admin') ||
      session.user?.roles?.includes('manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get quick stats from database
    const now = new Date()

    const [ totalCallsToday, activeCases, pendingFollowups, overdueCases ] = await Promise.all([
      prisma.call_records.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.call_records.count({ where: { status: 'OPEN' } }),
      prisma.call_records.count({ where: { followUpRequired: true, followUpDate: { gte: now } } }),
      prisma.call_records.count({ where: { status: 'OPEN', createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
    ])

    // Calculate valid calls rate
    // Placeholder: treat all calls today as valid until a validation rule is defined
    const validCalls = totalCallsToday

    const validCallsRate = totalCallsToday > 0 ? 
      Math.round((validCalls / totalCallsToday) * 100) : 0

    // For now, officers online is a placeholder
    const officersOnline = 0

    const quickStatsData = {
      totalCallsToday,
      activeCases,
      pendingFollowups,
      overdueCases,
      validCallsRate,
      officersOnline,
      trends: {
        callsChange: '+0%',
        casesChange: '+0%',
        followupsChange: '+0%',
        overdueChange: '+0%',
        validRateChange: '+0%',
        officersStatus: 'Available'
      }
    }

    return NextResponse.json(quickStatsData)
  } catch (error) {
    console.error('Error fetching quick stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quick stats', details: error instanceof Error ? { name: error.name, message: error.message } : 'Unknown error' },
      { status: 500 }
    )
  }
}
