import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canViewAllPerformance } from '@/lib/hr/performance-access'

function readWorkflowComments(value: unknown) {
  if (!value) return { supervisor: [] as unknown[], reviewer: [] as unknown[] }
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (parsed && typeof parsed === 'object') {
      const comments = parsed as { supervisor?: unknown; reviewer?: unknown }
      return {
        supervisor: Array.isArray(comments.supervisor) ? comments.supervisor : [],
        reviewer: Array.isArray(comments.reviewer) ? comments.reviewer : []
      }
    }
  } catch {
    return { supervisor: [], reviewer: [] }
  }
  return { supervisor: [], reviewer: [] }
}

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
    let { action, comment, role, reviewerId } = body

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

    const sessionRoles = (session.user as { roles?: string[] }).roles
    const sessionPermissions = (session.user as { permissions?: string[] }).permissions
    const isHR = canViewAllPerformance(
      { roles: sessionRoles },
      { user: { roles: sessionRoles, permissions: sessionPermissions } }
    )

    if (!employee && !isHR) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
    }

    if (action === 'supervisor-approve') {
      action = 'approve'
      role = role || 'supervisor'
    } else if (action === 'reviewer-approve') {
      action = 'final_approve'
      role = role || 'reviewer'
    } else if (action === 'complete') {
      action = 'complete'
      role = role || 'reviewer'
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
    // Note: supervisorId and reviewerId are USER IDs, not employee IDs
    const userId = session.user.id;
    let isSupervisor = plan.supervisorId === userId || plan.supervisorId === employee?.id;
    let isReviewer = plan.reviewerId === userId || plan.reviewerId === employee?.id;
    
    // Also check if user is supervisor via employee relationship
    // This handles cases where the plan's supervisorId might not match but the employee's supervisor does
    if (!isSupervisor && plan.employeeId) {
      const planEmployee = await prisma.employees.findUnique({
        where: { id: plan.employeeId },
        select: {
          supervisor_id: true,
          reviewer_id: true
        }
      })
      
      if (planEmployee?.supervisor_id) {
        // Get the supervisor employee record
        const supervisorEmployee = await prisma.employees.findUnique({
          where: { id: planEmployee.supervisor_id },
          select: { userId: true }
        })
        
        // Check if supervisor's userId matches current user
        if (supervisorEmployee?.userId === userId) {
          isSupervisor = true
        }
      }
      
      // Similar check for reviewer
      if (!isReviewer && planEmployee?.reviewer_id) {
        const reviewerEmployee = await prisma.employees.findUnique({
          where: { id: planEmployee.reviewer_id },
          select: { userId: true }
        })
        
        if (reviewerEmployee?.userId === userId) {
          isReviewer = true
        }
      }
    }
    
    // Check if current user is the employee themselves (cannot review own plan)
    const isPlanOwner = Boolean(employee) && plan.employeeId === employee?.id
    
    console.log('Workflow permission check:', {
      userId: userId,
      planSupervisorId: plan.supervisorId,
      planReviewerId: plan.reviewerId,
      planEmployeeId: plan.employeeId,
      employeeId: employee?.id || null,
      isPlanOwner,
      isSupervisor,
      isReviewer
    });
    
    const canActAsSupervisor = !isPlanOwner && (isSupervisor || isHR)
    const canActAsReviewer = !isPlanOwner && (isReviewer || isHR)
    const canSubmit = action === 'submit' && (isPlanOwner || isHR)
    const canAssignReviewer = action === 'assign-reviewer' && Boolean(reviewerId) && canActAsSupervisor
    const canComplete = action === 'complete' && (plan.workflowStatus === 'approved' || plan.status === 'approved') && (canActAsReviewer || isPlanOwner || isHR)

    const canAct = canSubmit || canAssignReviewer || canComplete || (role === 'supervisor' && canActAsSupervisor) || (role === 'reviewer' && canActAsReviewer)

    if (!canAct) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const currentComments = readWorkflowComments(plan.comments)
    const actorName = employee
      ? `${employee.firstName} ${employee.lastName}`
      : ((session.user as { name?: string; email?: string }).name || session.user.email || 'HR')

    // Create new comment entry
    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: actorName,
      userId: employee?.id || userId,
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

    // Determine new workflow status and approval status
    let newStatus = plan.status
    let newWorkflowStatus = plan.workflowStatus || plan.status
    let supervisorApproval = plan.supervisorApproval
    let reviewerApproval = plan.reviewerApproval
    
    let supervisorApprovedAt = plan.supervisorApprovedAt
    let reviewerApprovedAt = plan.reviewerApprovedAt
    
    if (action === 'request_changes') {
      newStatus = 'revision_requested'
      newWorkflowStatus = 'revision_requested'
      if (role === 'supervisor') {
        supervisorApproval = 'revision_requested'
        // Reset to submitted so employee can edit
        newStatus = 'submitted'
        newWorkflowStatus = 'submitted'
      } else if (role === 'reviewer') {
        reviewerApproval = 'revision_requested'
        // If reviewer requests changes, reset supervisor approval if it was approved
        // This allows supervisor to edit again (e.g., to add missing ratings)
        if (plan.supervisorApprovedAt) {
          supervisorApproval = 'pending'
          supervisorApprovedAt = null
        }
      }
    } else if (action === 'approve' && role === 'supervisor') {
      newStatus = 'supervisor_approved'
      newWorkflowStatus = 'supervisor_approved'
      supervisorApproval = 'approved'
      supervisorApprovedAt = new Date()
      // Move to reviewer stage
      if (plan.reviewerId) {
        newWorkflowStatus = 'reviewer_assessment'
      }
    } else if (action === 'final_approve' && role === 'reviewer') {
      newStatus = 'approved'
      newWorkflowStatus = 'approved'
      reviewerApproval = 'approved'
      reviewerApprovedAt = new Date()
    } else if (action === 'submit') {
      newStatus = 'submitted'
      newWorkflowStatus = 'supervisor_review'
    } else if (action === 'assign-reviewer') {
      newWorkflowStatus = 'reviewer_assessment'
    } else if (action === 'complete') {
      newStatus = 'completed'
      newWorkflowStatus = 'completed'
    } else if (!['comment', 'request_changes', 'approve', 'final_approve'].includes(action)) {
      return NextResponse.json({ error: 'Unknown workflow action' }, { status: 400 })
    }

    // Update the plan
    const updatedPlan = await prisma.performance_plans.update({
      where: { id: planId },
      data: {
        status: newStatus,
        workflowStatus: newWorkflowStatus,
        ...(action === 'assign-reviewer' && reviewerId ? { reviewerId } : {}),
        comments: currentComments,
        supervisorApproval: supervisorApproval,
        reviewerApproval: reviewerApproval,
        supervisorApprovedAt: supervisorApprovedAt,
        reviewerApprovedAt: reviewerApprovedAt,
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
        comments: readWorkflowComments(updatedPlan.comments)
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

    const comments = readWorkflowComments(plan.comments)

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

