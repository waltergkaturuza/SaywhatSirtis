import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NotificationService } from '@/lib/services/notificationService'

// POST /api/hr/notifications/[id]/read - Mark notification as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: notificationId } = await params

    // Mark notification as read
    const notification = await NotificationService.markAsRead(
      notificationId,
      session.user.id
    )

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    })

  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

// PUT /api/hr/notifications/[id]/read - Update notification status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: notificationId } = await params
    const body = await request.json()
    const { status } = body

    // Update notification status
    const notification = await NotificationService.updateStatus(
      notificationId,
      status,
      session.user.id
    )

    return NextResponse.json({
      success: true,
      message: 'Notification status updated',
      data: notification
    })

  } catch (error) {
    console.error('Error updating notification status:', error)
    return NextResponse.json(
      { error: 'Failed to update notification status' },
      { status: 500 }
    )
  }
}