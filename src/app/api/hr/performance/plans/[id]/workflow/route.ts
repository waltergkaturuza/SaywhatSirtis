import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: planId } = await params
    const body = await request.json()
    const { action, comment, role } = body // action: 'comment' | 'request_changes' | 'approve' | 'final_approve'

    // Get the current user's employee record
    const employee = await prisma.employees.findFirst({
      where: { email: session.user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        is_supervisor: true,
        is_reviewer: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
    }

    // Get the performance plan
    const plan = await prisma.performance_plans.findUnique({
      where: { id: planId },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json({ error: 'Performance plan not found' }, { status: 404 })
    }

    // Verify permissions
    const isSupervisor = plan.supervisorId === employee.id
    const isReviewer = plan.reviewerId === employee.id
    const isHR = session.user.roles?.some(r => [
      'HR',
      'admin',
      'SYSTEM_ADMINISTRATOR',
      'SUPERUSER',
      'ADVANCE_USER_1',
      'ADVANCE_USER_2'
    ].includes(r))
    const canAct = (role === 'supervisor' && isSupervisor) || (role === 'reviewer' && isReviewer) || isHR

    if (!canAct) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get current comments
    const currentComments = plan.comments ? JSON.parse(plan.comments as string) : { supervisor: [], reviewer: [] }

    // Create new comment entry
    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${employee.firstName} ${employee.lastName}`,
      userId: employee.id,
      comment: comment || '',
      action,
      timestamp: new Date().toISOString()
    }

    // Add comment to appropriate array
    if (role === 'supervisor') {
      currentComments.supervisor = currentComments.supervisor || []
      currentComments.supervisor.push(newComment)
    } else {
      currentComments.reviewer = currentComments.reviewer || []
      currentComments.reviewer.push(newComment)
    }

    // Determine new workflow status
    let newStatus = plan.status
    if (action === 'request_changes') {
      newStatus = 'revision_requested'
    } else if (action === 'approve' && role === 'supervisor') {
      newStatus = 'supervisor_approved'
    } else if (action === 'final_approve' && role === 'reviewer') {
      newStatus = 'approved'
    }

    // Update the plan
    const updatedPlan = await prisma.performance_plans.update({
      where: { id: planId },
      data: {
        status: newStatus,
        comments: JSON.stringify(currentComments),
        supervisorApprovedAt: action === 'approve' && role === 'supervisor' ? new Date() : plan.supervisorApprovedAt,
        reviewerApprovedAt: action === 'final_approve' && role === 'reviewer' ? new Date() : plan.reviewerApprovedAt,
        updatedAt: new Date()
      }
    })

    // TODO: Send notification to employee if changes requested
    // TODO: Send notification to reviewer if supervisor approved

    return NextResponse.json({
      success: true,
      plan: {
        id: updatedPlan.id,
        status: updatedPlan.status,
        comments: JSON.parse(updatedPlan.comments as string)
      },
      message: `Successfully ${action.replace('_', ' ')}`
    })

  } catch (error) {
    console.error('Error processing workflow action:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET workflow history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: planId } = await params

    const plan = await prisma.performance_plans.findUnique({
      where: { id: planId },
      select: {
        id: true,
        status: true,
        comments: true,
        supervisorApprovedAt: true,
        reviewerApprovedAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!plan) {
      return NextResponse.json({ error: 'Performance plan not found' }, { status: 404 })
    }

    const comments = plan.comments ? JSON.parse(plan.comments as string) : { supervisor: [], reviewer: [] }

    return NextResponse.json({
      success: true,
      workflow: {
        status: plan.status,
        supervisorComments: comments.supervisor || [],
        reviewerComments: comments.reviewer || [],
        supervisorApprovedAt: plan.supervisorApprovedAt,
        reviewerApprovedAt: plan.reviewerApprovedAt,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      }
    })

  } catch (error) {
    console.error('Error fetching workflow history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

