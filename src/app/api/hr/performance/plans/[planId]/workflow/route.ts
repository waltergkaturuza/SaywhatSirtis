import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { planId } = await params
    const { action, comment, reviewerId } = await request.json()

    const user = await executeQuery(async (prisma) => {
      return prisma.users.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          roles: true
        }
      })
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch the current plan
    const plan = await executeQuery(async (prisma) => {
      return prisma.performance_plans.findUnique({
        where: { id: planId },
        include: {
          employees: {
            include: {
              users: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          },
          users_performance_plans_supervisorIdTousers: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          users_performance_plans_reviewerIdTousers: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      })
    })

    if (!plan) {
      return NextResponse.json({ error: 'Performance plan not found' }, { status: 404 })
    }

    const isHR = user.roles?.includes('hr') || user.role === 'ADMIN'
    const isSupervisor = user.roles?.includes('supervisor')
    const isReviewer = user.roles?.includes('reviewer')

    // Validate permissions and state transitions
    let newStatus = plan.status
    let updateData: any = {}
    let commentType = 'general'

    switch (action) {
      case 'submit':
        // Employee submits plan for supervisor review
        if (plan.employeeId !== user.id) {
          return NextResponse.json({ error: 'Only the plan owner can submit it' }, { status: 403 })
        }
        if (plan.status !== 'draft') {
          return NextResponse.json({ error: 'Can only submit draft plans' }, { status: 400 })
        }
        newStatus = 'supervisor-review'
        updateData.submittedAt = new Date()
        commentType = 'submit'
        break

      case 'supervisor-approve':
        // Supervisor approves the plan
        if (plan.supervisorId !== user.id && !isHR) {
          return NextResponse.json({ error: 'Only the assigned supervisor or HR can approve' }, { status: 403 })
        }
        if (plan.status !== 'supervisor-review') {
          return NextResponse.json({ error: 'Plan must be in supervisor review status' }, { status: 400 })
        }
        newStatus = 'supervisor-approved'
        updateData.supervisorApprovedAt = new Date()
        updateData.supervisorComments = comment
        commentType = 'supervisor-approve'
        break

      case 'supervisor-reject':
        // Supervisor rejects the plan (back to draft)
        if (plan.supervisorId !== user.id && !isHR) {
          return NextResponse.json({ error: 'Only the assigned supervisor or HR can reject' }, { status: 403 })
        }
        if (plan.status !== 'supervisor-review') {
          return NextResponse.json({ error: 'Plan must be in supervisor review status' }, { status: 400 })
        }
        newStatus = 'draft'
        updateData.supervisorComments = comment
        commentType = 'supervisor-reject'
        break

      case 'assign-reviewer':
        // Assign a reviewer to the plan
        if (plan.supervisorId !== user.id && !isHR) {
          return NextResponse.json({ error: 'Only the supervisor or HR can assign reviewers' }, { status: 403 })
        }
        if (plan.status !== 'supervisor-approved') {
          return NextResponse.json({ error: 'Plan must be supervisor-approved to assign reviewer' }, { status: 400 })
        }
        if (!reviewerId) {
          return NextResponse.json({ error: 'Reviewer ID is required' }, { status: 400 })
        }

        // Verify reviewer exists and has reviewer role
            const reviewer = await executeQuery(async (prisma) => {
              return prisma.users.findUnique({ where: { id: reviewerId }, select: { id: true, roles: true, role: true } })
            })
        if (!reviewer || (!reviewer.roles?.includes('reviewer') && reviewer.role !== 'ADMIN')) {
          return NextResponse.json({ error: 'Invalid reviewer selected' }, { status: 400 })
        }

        newStatus = 'reviewer-review'
        updateData.reviewerId = reviewerId
        commentType = 'assign-reviewer'
        break

      case 'reviewer-approve':
        // Reviewer approves the plan
        if (plan.reviewerId !== user.id && !isHR) {
          return NextResponse.json({ error: 'Only the assigned reviewer or HR can approve' }, { status: 403 })
        }
        if (plan.status !== 'reviewer-review') {
          return NextResponse.json({ error: 'Plan must be in reviewer review status' }, { status: 400 })
        }
        newStatus = 'reviewer-approved'
        updateData.reviewerApprovedAt = new Date()
        updateData.reviewerComments = comment
        commentType = 'reviewer-approve'
        break

      case 'reviewer-reject':
        // Reviewer rejects the plan (back to supervisor)
        if (plan.reviewerId !== user.id && !isHR) {
          return NextResponse.json({ error: 'Only the assigned reviewer or HR can reject' }, { status: 403 })
        }
        if (plan.status !== 'reviewer-review') {
          return NextResponse.json({ error: 'Plan must be in reviewer review status' }, { status: 400 })
        }
        newStatus = 'supervisor-review'
        updateData.reviewerComments = comment
        commentType = 'reviewer-reject'
        break

      case 'complete':
        // Final completion (HR only)
        if (!isHR) {
          return NextResponse.json({ error: 'Only HR can complete plans' }, { status: 403 })
        }
        if (plan.status !== 'reviewer-approved') {
          return NextResponse.json({ error: 'Plan must be reviewer-approved to complete' }, { status: 400 })
        }
        newStatus = 'completed'
        commentType = 'complete'
        break

      case 'reopen':
        // Reopen completed plan for modifications (HR only)
        if (!isHR) {
          return NextResponse.json({ error: 'Only HR can reopen plans' }, { status: 403 })
        }
        if (plan.status !== 'completed') {
          return NextResponse.json({ error: 'Can only reopen completed plans' }, { status: 400 })
        }
        newStatus = 'supervisor-review'
        commentType = 'reopen'
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Perform the update in a transaction
    const result = await executeQuery(async (prisma) => {
      return prisma.$transaction(async (tx) => {
      // Update the plan status
      const updatedPlan = await tx.performance_plans.update({
        where: { id: planId },
        data: {
          status: newStatus,
          ...updateData
        },
        include: {
          employees: {
            include: {
              users: { select: { firstName: true, lastName: true, email: true } }
            }
          },
          users_performance_plans_supervisorIdTousers: { select: { firstName: true, lastName: true, email: true } },
          users_performance_plans_reviewerIdTousers: { select: { firstName: true, lastName: true, email: true } }
        }
      })

      // Add workflow comment
      await tx.performance_plan_comments.create({
        data: {
          id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          planId,
          userId: user.id,
          comment: comment || `${action.replace('-', ' ')} by ${user.firstName} ${user.lastName}`,
          commentType
        }
      })

      return updatedPlan
      })
    })

    // Determine next actions based on new status
    const nextActions = getNextActions(result, user)

    return NextResponse.json({
      message: `Plan ${action} successful`,
      plan: result,
      nextActions
    })

  } catch (error) {
    console.error('Error updating performance plan:', error)
    return NextResponse.json(
      { error: 'Failed to update performance plan' },
      { status: 500 }
    )
  }
}

function getNextActions(plan: any, user: any) {
  const isHR = user.roles?.includes('hr') || user.role === 'ADMIN'
  const actions = []

  switch (plan.status) {
    case 'draft':
      if (plan.employeeId === user.id) {
        actions.push({ action: 'submit', label: 'Submit for Review', primary: true })
      }
      break
    case 'supervisor-review':
      if (plan.supervisorId === user.id || isHR) {
        actions.push({ action: 'supervisor-approve', label: 'Approve', primary: true })
        actions.push({ action: 'supervisor-reject', label: 'Request Changes', primary: false })
      }
      break
    case 'supervisor-approved':
      if (plan.supervisorId === user.id || isHR) {
        actions.push({ action: 'assign-reviewer', label: 'Assign Reviewer', primary: true })
      }
      break
    case 'reviewer-review':
      if (plan.reviewerId === user.id || isHR) {
        actions.push({ action: 'reviewer-approve', label: 'Approve', primary: true })
        actions.push({ action: 'reviewer-reject', label: 'Send Back', primary: false })
      }
      break
    case 'reviewer-approved':
      if (isHR) {
        actions.push({ action: 'complete', label: 'Complete Plan', primary: true })
      }
      break
    case 'completed':
      if (isHR) {
        actions.push({ action: 'reopen', label: 'Reopen Plan', primary: false })
      }
      break
  }

  return actions
}
