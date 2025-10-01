import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre activities API')
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
      session.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1'].includes(role.toLowerCase()));

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // For now, return empty data structure since we don't have activity tracking implemented yet
    // This would be connected to actual activity logs, call records, case updates, etc.
    const activitiesData = {
      recentActivities: [],
      pendingTasks: []
    }

    return NextResponse.json(activitiesData)
  } catch (error) {
    console.error('Error fetching activities data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities data' },
      { status: 500 }
    )
  }
}
