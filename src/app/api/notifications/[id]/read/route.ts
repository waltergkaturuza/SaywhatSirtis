import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/notifications/[id]/read - Mark notification as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify notification belongs to user
    const notification = await prisma.notifications.findUnique({
      where: { id },
      select: { recipientId: true, employeeId: true }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Check if user owns this notification
    const employee = await prisma.employees.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    const ownsNotification = 
      notification.recipientId === session.user.id ||
      (employee && notification.employeeId === employee.id)

    if (!ownsNotification) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Mark as read
    await prisma.notifications.update({
      where: { id },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

