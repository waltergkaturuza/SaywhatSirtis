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

    // An administrator may have no employee record. Match the user id on
    // every owner column the notifications table uses.
    const employee = await prisma.employees.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    }).catch(() => null)

    const whereClause: any = {
      OR: [
        { recipientId: session.user.id },
        { userId: session.user.id },
        ...(employee ? [{ employeeId: employee.id }] : []),
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

    let notificationsForUser = transformedNotifications
    let unread = unreadCount

    if (notificationsForUser.length === 0) {
      const overdueBefore = new Date()
      overdueBefore.setDate(overdueBefore.getDate() - 7)
      const overdueCases = await prisma.call_records.count({
        where: {
          isCase: { in: ['YES', 'yes', 'Yes'] },
          status: { notIn: ['CLOSED', 'RESOLVED', 'Closed', 'Resolved', 'DONE', 'closed', 'resolved'] },
          createdAt: { lt: overdueBefore },
        },
      }).catch(() => 0)

      if (overdueCases > 0) {
        notificationsForUser = [{
          id: 'live-overdue-cases',
          title: 'Overdue cases',
          message: `${overdueCases} open case${overdueCases === 1 ? '' : 's'} ${overdueCases === 1 ? 'is' : 'are'} past the 7-day due date.`,
          type: 'WARNING',
          isRead: false,
          createdAt: new Date().toISOString(),
          actionUrl: '/call-centre/case-management',
          sender: 'System',
        }]
        unread = 1
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        notifications: notificationsForUser,
        unreadCount: unread
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

