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
                         session.user?.roles?.includes('supervisor')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')

    // Build filter
    const where: any = {
      followUpRequired: true
    }

    if (status === 'pending') {
      where.followUpDate = {
        gte: new Date()
      }
    } else if (status === 'overdue') {
      where.followUpDate = {
        lt: new Date()
      }
    }

    if (assignedTo) {
      where.assignedOfficer = assignedTo
    }

    // Fetch calls with follow-up requirements
    const calls = await prisma.callRecord.findMany({
      where,
      select: {
        id: true,
        caseNumber: true,
        callerName: true,
        summary: true,
        notes: true,
        followUpDate: true,
        followUpRequired: true,
        priority: true,
        assignedOfficer: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        followUpDate: 'asc'
      }
    })

    // Format as tasks
    const tasks = calls.map(call => ({
      id: call.id,
      caseNumber: call.caseNumber,
      title: call.summary || 'Follow-up required',
      description: call.notes,
      assignedOfficer: call.assignedOfficer || 'Unassigned',
      dueDate: call.followUpDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      priority: call.priority.toLowerCase() as 'low' | 'medium' | 'high',
      type: 'follow-up' as const,
      status: call.followUpDate && call.followUpDate < new Date() ? 'overdue' as const : 'pending' as const,
      caller: call.callerName
    }))

    return NextResponse.json(tasks)

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

    // Check permissions for creating follow-ups
    const hasPermission = session.user?.permissions?.includes('calls.edit') ||
                         session.user?.permissions?.includes('calls.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('supervisor')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { callId, title, dueDate, assignedOfficer } = await request.json()

    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 })
    }

    // Update the call record to enable follow-up
    const updatedCall = await prisma.callRecord.update({
      where: { id: callId },
      data: {
        followUpRequired: true,
        followUpDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedOfficer: assignedOfficer || session.user?.name,
        summary: title || undefined
      }
    })

    // Format response
    const formattedTask = {
      id: updatedCall.id,
      caseNumber: updatedCall.caseNumber,
      title: title || 'Follow-up task',
      assignedOfficer: updatedCall.assignedOfficer || 'Unassigned',
      dueDate: updatedCall.followUpDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      priority: updatedCall.priority.toLowerCase() as 'low' | 'medium' | 'high',
      type: 'follow-up' as const,
      status: 'pending' as const
    }

    return NextResponse.json(formattedTask, { status: 201 })

  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('calls.edit') ||
                         session.user?.permissions?.includes('calls.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('supervisor')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id, status, assignedOfficer, dueDate, notes } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Update the call record
    const updateData: any = {}

    if (status === 'completed') {
      updateData.followUpRequired = false
      updateData.followUpDate = null
    } else if (dueDate) {
      updateData.followUpDate = new Date(dueDate)
    }

    if (assignedOfficer) {
      updateData.assignedOfficer = assignedOfficer
    }

    if (notes) {
      updateData.notes = notes
    }

    const updatedCall = await prisma.callRecord.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      id: updatedCall.id,
      status: updatedCall.followUpRequired ? 'pending' : 'completed'
    })

  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
