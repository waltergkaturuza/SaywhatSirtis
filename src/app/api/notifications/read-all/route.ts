import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find employee record for this user
    const employee = await prisma.employees.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!employee) {
      return NextResponse.json({ success: true })
    }

    // Mark all user's notifications as read
    await prisma.notifications.updateMany({
      where: {
        OR: [
          { recipientId: session.user.id },
          { employeeId: employee.id }
        ],
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    )
  }
}

