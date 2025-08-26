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

    // Get follow-ups as tasks from CallRecord (no separate follow-up table)
    const callsNeedingFollowUp = await prisma.callRecord.findMany({
      where: {
        followUpRequired: true,
        status: { in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] }
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        caseNumber: true,
        callerName: true,
        summary: true,
        notes: true,
        assignedOfficer: true,
        priority: true,
        followUpDate: true,
        updatedAt: true
      }
    })

    // Transform to match frontend interface
    const formattedTasks = callsNeedingFollowUp.map(call => ({
      id: call.id,
      caseNumber: call.caseNumber.slice(-8),
      title: call.summary || call.notes || 'Follow-up',
      assignedOfficer: call.assignedOfficer || 'Unassigned',
      dueDate: (call.followUpDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        .toISOString().split('T')[0],
      priority: (call.priority?.toLowerCase() as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
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
  const { caseNumber, title, assignedOfficer, dueDate } = body

    // Find the call record by exact case number
    const call = await prisma.callRecord.findUnique({
      where: { caseNumber }
    })

    if (!call) {
      return NextResponse.json({ error: 'Call record not found' }, { status: 404 })
    }

    // Update call to mark follow-up required and set details
    const updated = await prisma.callRecord.update({
      where: { id: call.id },
      data: {
        followUpRequired: true,
        followUpDate: dueDate ? new Date(dueDate) : (call.followUpDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        notes: [call.notes, title].filter(Boolean).join('\n'),
        assignedOfficer: assignedOfficer || call.assignedOfficer
      },
      select: {
        id: true,
        caseNumber: true,
        summary: true,
        notes: true,
        assignedOfficer: true,
        priority: true,
        followUpDate: true
      }
    })

    // Format response
    const formattedTask = {
      id: updated.id,
      caseNumber: updated.caseNumber.slice(-8),
      title: updated.summary || title,
      assignedOfficer: updated.assignedOfficer || 'Unassigned',
      dueDate: (updated.followUpDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      // Map priority enum to lowercase label
      priority: (updated.priority?.toLowerCase() as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
      type: 'follow-up' as const,
      status: 'pending' as const
    }

    return NextResponse.json(formattedTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
