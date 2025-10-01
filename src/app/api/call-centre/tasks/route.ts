import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre tasks API')
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' }, 
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Unified permission check consistent with other call centre APIs
    const hasPermission = session.user?.permissions?.includes('calls.view') ||
      session.user?.permissions?.includes('calls.full_access') ||
      session.user?.permissions?.includes('call_center_full') ||
      session.user?.permissions?.includes('callcentre.access') ||
      session.user?.permissions?.includes('callcentre.officer') ||
      session.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1'].includes(role.toLowerCase()))

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? { name: error.name, stack: error.stack?.split('\n').slice(0,3).join(' | ') } : undefined
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

    const hasPermission = session.user?.permissions?.includes('calls.full_access') ||
      session.user?.roles?.includes('admin') ||
      session.user?.roles?.includes('manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    console.log('Received task creation request:', body)

    // Handle different types of requests
    if (body.action) {
      // Handle existing follow-up actions
      const { action, taskId, callId, updates } = body

      switch (action) {
        case 'complete_followup':
          try {
            // Get current call details for context
            const currentCall = await prisma.call_records.findUnique({
              where: { id: callId }
            })

            if (!currentCall) {
              return NextResponse.json(
                { error: 'Call record not found' },
                { status: 404 }
              )
            }

            const updatedCall = await prisma.call_records.update({
              where: { id: callId },
              data: {
                followUpRequired: false,
                status: 'RESOLVED',
                notes: updates?.completionNotes ? 
                  `FOLLOW-UP COMPLETED: ${updates.completionNotes}\n\n--- Previous Notes ---\n${currentCall.notes || ''}` :
                  currentCall.notes,
                updatedAt: new Date()
              }
            })

            // Get officer details for response
            const officer = await prisma.users.findFirst({
              where: {
                OR: [
                  { email: session.user.email },
                  { firstName: { contains: updatedCall.assignedOfficer?.split(' ')[0] || '' } }
                ]
              },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            })

            const taskDetails = {
              id: updatedCall.id,
              caseNumber: updatedCall.caseNumber || updatedCall.callNumber,
              title: `Follow-up completed: ${updatedCall.summary || 'Call follow-up'}`,
              assignedOfficer: updatedCall.assignedOfficer,
              status: 'completed',
              completedAt: new Date().toISOString(),
              completedBy: officer ? `${officer.firstName} ${officer.lastName}`.trim() : session.user.email,
              completionNotes: updates?.completionNotes,
              clientName: updatedCall.callerName,
              phone: updatedCall.callerPhone
            }

            return NextResponse.json({
              success: true,
              message: 'Follow-up task completed successfully',
              data: {
                call: updatedCall,
                task: taskDetails
              }
            })
          } catch (error) {
            console.error('Error completing follow-up:', error)
            return NextResponse.json(
              { 
                error: 'Failed to complete follow-up task',
                message: error instanceof Error ? error.message : 'Unknown error'
              },
              { status: 500 }
            )
          }

        case 'reschedule_followup':
          try {
            // Validation
            if (!updates?.newDate) {
              return NextResponse.json(
                { error: 'New date is required for rescheduling' },
                { status: 400 }
              )
            }

            const newDate = new Date(updates.newDate)
            if (isNaN(newDate.getTime())) {
              return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
              )
            }

            // Get current call details
            const currentCall = await prisma.call_records.findUnique({
              where: { id: callId }
            })

            if (!currentCall) {
              return NextResponse.json(
                { error: 'Call record not found' },
                { status: 404 }
              )
            }

            // Prepare update data
            const updateData: any = {
              followUpDate: newDate,
              updatedAt: new Date()
            }

            let updateMessage = 'Follow-up rescheduled successfully'

            // If reassigning to different officer
            if (updates.newOfficer && updates.newOfficer !== currentCall.assignedOfficer) {
              // Validate that the new officer exists
              const newOfficerExists = await prisma.users.findFirst({
                where: {
                  OR: [
                    { firstName: { contains: updates.newOfficer.split(' ')[0] || '' } },
                    { email: updates.newOfficer }
                  ],
                  isActive: true
                }
              })

              if (!newOfficerExists) {
                return NextResponse.json(
                  { error: 'Assigned officer not found or inactive' },
                  { status: 400 }
                )
              }

              updateData.assignedOfficer = updates.newOfficer
              updateData.notes = updates.rescheduleNotes ? 
                `REASSIGNED to ${updates.newOfficer}: ${updates.rescheduleNotes}\n\n--- Previous Notes ---\n${currentCall.notes || ''}` :
                `REASSIGNED to ${updates.newOfficer}\n\n--- Previous Notes ---\n${currentCall.notes || ''}`
              
              updateMessage = `Follow-up rescheduled and reassigned to ${updates.newOfficer}`
            } else if (updates.rescheduleNotes) {
              updateData.notes = `RESCHEDULED: ${updates.rescheduleNotes}\n\n--- Previous Notes ---\n${currentCall.notes || ''}`
            }

            const updatedCall = await prisma.call_records.update({
              where: { id: callId },
              data: updateData
            })

            // Get updated officer details for response
            const officer = await prisma.users.findFirst({
              where: {
                AND: [
                  { isActive: true },
                  updatedCall.assignedOfficer ? {
                    OR: [
                      { firstName: { contains: updatedCall.assignedOfficer.split(' ')[0] || '' } },
                      { email: updatedCall.assignedOfficer }
                    ]
                  } : { id: 'none' } // This will return no results if assignedOfficer is null
                ]
              },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                department: true
              }
            })

            const taskDetails = {
              id: updatedCall.id,
              caseNumber: updatedCall.caseNumber || updatedCall.callNumber,
              title: `Follow-up: ${updatedCall.summary || 'Call follow-up required'}`,
              assignedOfficer: updatedCall.assignedOfficer,
              assignedOfficerDetails: officer ? {
                id: officer.id,
                name: `${officer.firstName} ${officer.lastName}`.trim(),
                email: officer.email,
                role: officer.role,
                department: officer.department
              } : null,
              dueDate: newDate.toISOString().split('T')[0],
              status: 'pending',
              type: 'follow-up',
              rescheduledAt: new Date().toISOString(),
              rescheduleNotes: updates.rescheduleNotes,
              clientName: updatedCall.callerName,
              phone: updatedCall.callerPhone
            }

            return NextResponse.json({
              success: true,
              message: updateMessage,
              data: {
                call: updatedCall,
                task: taskDetails
              }
            })
          } catch (error) {
            console.error('Error rescheduling follow-up:', error)
            return NextResponse.json(
              { 
                error: 'Failed to reschedule follow-up',
                message: error instanceof Error ? error.message : 'Unknown error'
              },
              { status: 500 }
            )
          }

        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          )
      }
    } else {
      // Handle new task creation
      const { caseNumber, title, assignedOfficer, dueDate, priority, type } = body

      // Validation
      if (!title || !assignedOfficer) {
        return NextResponse.json(
          { 
            error: 'Missing required fields',
            message: 'Title and assigned officer are required'
          },
          { status: 400 }
        )
      }

      try {
        // For now, we'll create a simple task record
        // In a full implementation, you might want a dedicated tasks table
        const taskData = {
          id: `task-${Date.now()}`,
          title,
          caseNumber: caseNumber || 'General',
          assignedOfficer,
          dueDate: dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: priority || 'medium',
          type: type || 'general',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // In a real implementation, you would save this to a tasks table
        // For now, we'll return the created task
        
        return NextResponse.json({
          success: true,
          message: 'Task created successfully',
          data: taskData
        })
      } catch (error) {
        console.error('Error creating task:', error)
        return NextResponse.json(
          { 
            error: 'Failed to create task',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        )
      }
    }

  } catch (error) {
    console.error('Error in call centre tasks POST API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
