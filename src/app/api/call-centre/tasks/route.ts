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

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('Database connection test successful for tasks')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')

    let calls: any[] = []

    try {
      // Build filter for follow-up calls
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
      calls = await prisma.call_records.findMany({
        where,
        select: {
          id: true,
          caseNumber: true,
          callerName: true,
          callerPhone: true,
          category: true,
          priority: true,
          status: true,
          assignedOfficer: true,
          summary: true,
          followUpDate: true,
          followUpRequired: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          followUpDate: 'asc'
        }
      })
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }

    // Transform the data for frontend consumption
    const tasks = calls.map(call => ({
      id: call.id,
      title: `Follow-up: ${call.caseNumber}`,
      description: call.summary || `Follow-up call for ${call.callerName}`,
      type: 'follow-up',
      priority: call.priority,
      status: call.followUpDate && call.followUpDate < new Date() ? 'overdue' : 'pending',
      assignedTo: call.assignedOfficer || 'Unassigned',
      dueDate: call.followUpDate?.toISOString(),
      callDetails: {
        caseNumber: call.caseNumber,
        callerName: call.callerName,
        callerPhone: call.callerPhone,
        category: call.category,
        originalCallDate: call.createdAt.toISOString()
      },
      createdAt: call.createdAt.toISOString(),
      updatedAt: call.updatedAt.toISOString()
    }))

    // Add some sample task types for demonstration
    const sampleTasks = [
      {
        id: 'sample-1',
        title: 'Review pending cases',
        description: 'Weekly review of all pending cases older than 3 days',
        type: 'review',
        priority: 'MEDIUM',
        status: 'pending',
        assignedTo: 'System',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    const allTasks = [...tasks, ...sampleTasks]

    return NextResponse.json({
      success: true,
      data: {
        tasks: allTasks,
        summary: {
          total: allTasks.length,
          pending: allTasks.filter(t => t.status === 'pending').length,
          overdue: allTasks.filter(t => t.status === 'overdue').length,
          completed: allTasks.filter(t => t.status === 'completed').length
        }
      }
    })

  } catch (error) {
    console.error('Error in call centre tasks API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch tasks',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, taskId, callId, updates } = await request.json()

    switch (action) {
      case 'complete_followup':
        try {
          const updatedCall = await prisma.call_records.update({
            where: { id: callId },
            data: {
              followUpRequired: false,
              status: 'RESOLVED',
              updatedAt: new Date()
            }
          })

          return NextResponse.json({
            success: true,
            message: 'Follow-up task completed',
            data: updatedCall
          })
        } catch (error) {
          console.error('Error completing follow-up:', error)
          return NextResponse.json(
            { error: 'Failed to complete follow-up task' },
            { status: 500 }
          )
        }

      case 'reschedule_followup':
        try {
          const updatedCall = await prisma.call_records.update({
            where: { id: callId },
            data: {
              followUpDate: new Date(updates.newDate),
              updatedAt: new Date()
            }
          })

          return NextResponse.json({
            success: true,
            message: 'Follow-up rescheduled',
            data: updatedCall
          })
        } catch (error) {
          console.error('Error rescheduling follow-up:', error)
          return NextResponse.json(
            { error: 'Failed to reschedule follow-up' },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in call centre tasks POST API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process task action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
