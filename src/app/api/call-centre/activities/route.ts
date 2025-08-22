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
