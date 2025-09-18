import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/hr/notifications - Get notifications with routing data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.some(role => ['SUPERUSER', 'ADMIN', 'HR_MANAGER', 'HR_SPECIALIST'].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    let whereClause: any = {}
    
    if (category !== 'all') {
      switch (category) {
        case 'performance':
          whereClause.type = { in: ['PERFORMANCE_PLAN', 'APPRAISAL'] }
          break
        case 'training':
          whereClause.type = 'TRAINING'
          break
        case 'deadlines':
          whereClause.type = 'DEADLINE'
          break
        case 'escalations':
          whereClause.type = 'ESCALATION'
          break
        case 'approvals':
          whereClause.type = 'APPROVAL'
          break
        default:
          // All notifications
          break
      }
    }

    if (status) {
      whereClause.status = status
    }

    if (priority) {
      whereClause.priority = priority
    }

    // Get notifications
    const notifications = await prisma.notifications.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true,
            departments: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Get summary statistics
    const [totalCount, pendingCount, escalatedCount, successRate] = await Promise.all([
      prisma.notifications.count({ where: whereClause }),
      prisma.notifications.count({ 
        where: { ...whereClause, status: 'pending' } 
      }),
      prisma.notifications.count({ 
        where: { ...whereClause, status: 'escalated' } 
      }),
      // Calculate success rate (acknowledged / total sent)
      prisma.notifications.aggregate({
        where: { 
          ...whereClause,
          status: { in: ['sent', 'delivered', 'acknowledged'] }
        },
        _count: {
          status: true
        }
      }).then(async (sent) => {
        const acknowledged = await prisma.notifications.count({
          where: { 
            ...whereClause,
            status: 'acknowledged'
          }
        })
        return sent._count.status > 0 ? Math.round((acknowledged / sent._count.status) * 100) : 0
      })
    ])

    // Transform notifications for frontend
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type.toLowerCase(),
      title: notification.title,
      message: notification.message,
      status: notification.status,
      priority: notification.priority,
      employee: notification.employee ? 
        `${notification.employee.firstName} ${notification.employee.lastName}` :
        'N/A',
      supervisor: notification.recipient ?
        `${notification.recipient.firstName || ''} ${notification.recipient.lastName || ''}`.trim() :
        'Unknown',
      secretariat: notification.employee?.departments?.name || 
                   notification.employee?.department || 
                   'Unknown',
      timestamp: notification.createdAt.toISOString(),
      deadline: notification.deadline?.toISOString(),
      isRead: notification.isRead,
      actionUrl: notification.actionUrl
    }))

    return NextResponse.json({
      success: true,
      data: {
        notifications: transformedNotifications,
        statistics: {
          total: totalCount,
          pending: pendingCount,
          escalated: escalatedCount,
          successRate
        }
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

// POST /api/hr/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.some(role => ['SUPERUSER', 'ADMIN', 'HR_MANAGER', 'HR_SPECIALIST'].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      message,
      type,
      priority = 'normal',
      recipientId,
      employeeId,
      deadline,
      actionUrl,
      metadata
    } = body

    // Create notification
    const notification = await prisma.notifications.create({
      data: {
        title,
        message,
        type: type.toUpperCase(),
        priority,
        userId: recipientId,
        recipientId,
        employeeId,
        senderId: session.user.id,
        deadline: deadline ? new Date(deadline) : null,
        actionUrl,
        metadata,
        status: 'pending'
      },
      include: {
        recipient: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}