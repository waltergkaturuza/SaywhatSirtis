import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Find employee record for this user
    const employee = await prisma.employees.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!employee) {
      return NextResponse.json({
        success: true,
        data: {
          notifications: [],
          unreadCount: 0
        }
      })
    }

    // Build where clause - get notifications for this user
    const whereClause: any = {
      OR: [
        { recipientId: session.user.id },
        { employeeId: employee.id }
      ]
    }

    if (unreadOnly) {
      whereClause.isRead = false
    }

    // Get notifications
    const notifications = await prisma.notifications.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        users_notifications_senderIdTousers: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Get unread count
    const unreadCount = await prisma.notifications.count({
      where: {
        ...whereClause,
        isRead: false
      }
    })

    // Transform notifications
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      actionUrl: notification.actionUrl,
      sender: notification.users_notifications_senderIdTousers
        ? `${notification.users_notifications_senderIdTousers.firstName || ''} ${notification.users_notifications_senderIdTousers.lastName || ''}`.trim()
        : 'System'
    }))

    return NextResponse.json({
      success: true,
      data: {
        notifications: transformedNotifications,
        unreadCount
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

