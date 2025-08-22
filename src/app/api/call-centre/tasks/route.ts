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

    // Get follow-ups as tasks
    const tasks = await prisma.callFollowUp.findMany({
      include: {
        call: {
          select: {
            id: true,
            callerName: true,
            subject: true,
            assignedUser: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to match frontend interface
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      caseNumber: task.call.id.slice(-8), // Use last 8 chars of call ID
      title: task.notes,
      assignedOfficer: task.call.assignedUser?.name || 'Unassigned',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      priority: 'medium' as const,
      type: 'follow-up' as const,
      status: 'pending' as const
    }))

    return NextResponse.json(formattedTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('calls.create') ||
                         session.user?.permissions?.includes('calls.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { caseNumber, title, assignedOfficer } = body

    // Find the call record by case number (partial match)
    const call = await prisma.callCentreRecord.findFirst({
      where: {
        id: {
          endsWith: caseNumber
        }
      }
    })

    if (!call) {
      return NextResponse.json({ error: 'Call record not found' }, { status: 404 })
    }

    // Create follow-up task
    const task = await prisma.callFollowUp.create({
      data: {
        callId: call.id,
        notes: title,
        actionTaken: null
      },
      include: {
        call: {
          select: {
            id: true,
            callerName: true,
            subject: true,
            assignedUser: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Format response
    const formattedTask = {
      id: task.id,
      caseNumber: task.call.id.slice(-8),
      title: task.notes,
      assignedOfficer: task.call.assignedUser?.name || assignedOfficer,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium' as const,
      type: 'follow-up' as const,
      status: 'pending' as const
    }

    return NextResponse.json(formattedTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
