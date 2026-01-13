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

    const { id: appraisalId } = await params
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

    // Get the performance appraisal
    const appraisal = await prisma.performance_appraisals.findUnique({
      where: { id: appraisalId },
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

    if (!appraisal) {
      return NextResponse.json({ error: 'Performance appraisal not found' }, { status: 404 })
    }

    // Verify permissions
    // Note: supervisorId and reviewerId are USER IDs, not employee IDs
    const userId = session.user.id;
    const isSupervisor = appraisal.supervisorId === userId;
    const isReviewer = appraisal.reviewerId === userId;
    
    // Check if the current user is the supervisor of the employee associated with the appraisal
    let isEmployeeSupervisor = false
    let isEmployeeReviewer = false
    if (appraisal.employeeId) {
      const appraisalEmployee = await prisma.employees.findUnique({
        where: { id: appraisal.employeeId },
        select: { supervisor_id: true, reviewer_id: true }
      })
      if (appraisalEmployee?.supervisor_id) {
        const supervisorEmployee = await prisma.employees.findUnique({
          where: { id: appraisalEmployee.supervisor_id },
          select: { userId: true }
        })
        if (supervisorEmployee?.userId === userId) {
          isEmployeeSupervisor = true
        }
      }
      if (appraisalEmployee?.reviewer_id) {
        const reviewerEmployee = await prisma.employees.findUnique({
          where: { id: appraisalEmployee.reviewer_id },
          select: { userId: true }
        })
        if (reviewerEmployee?.userId === userId) {
          isEmployeeReviewer = true
        }
      }
    }

    const isHR = session.user.roles?.some(r => [
      'HR',
      'admin',
      'SYSTEM_ADMINISTRATOR',
      'SUPERUSER',
      'ADVANCE_USER_1',
      'ADVANCE_USER_2',
      'HR_MANAGER',
      'ADMIN'
    ].includes(r))
    const hasHRPermission = session.user.permissions?.some(p => [
      'hr.full_access',
      'hr.view_all_performance'
    ].includes(p))
    
    // HR/Admin users can act as supervisors/reviewers if needed
    const canActAsSupervisor = isSupervisor || isEmployeeSupervisor || isHR || hasHRPermission
    const canActAsReviewer = isReviewer || isEmployeeReviewer || isHR || hasHRPermission
    
    const canAct = (role === 'supervisor' && canActAsSupervisor) || (role === 'reviewer' && canActAsReviewer)

    console.log('Workflow permission check:', {
      userId: userId,
      employeeId: employee.id,
      appraisalSupervisorId: appraisal.supervisorId,
      appraisalReviewerId: appraisal.reviewerId,
      isSupervisor,
      isReviewer,
      isHR,
      requestedRole: role,
      canAct,
      userRoles: session.user.roles
    })

    if (!canAct) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        details: `You are not authorized to act as ${role} for this appraisal`
      }, { status: 403 })
    }

    // Get current comments
    const currentComments = appraisal.comments ? JSON.parse(appraisal.comments as string) : { supervisor: [], reviewer: [] }

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
    let newStatus = appraisal.status
    if (action === 'request_changes') {
      newStatus = 'revision_requested'
    } else if (action === 'approve' && role === 'supervisor') {
      newStatus = 'supervisor_approved'
      // If there's a reviewer, push to reviewer_assessment
      if (appraisal.reviewerId) {
        newStatus = 'reviewer_assessment'
      } else {
        // If no reviewer, supervisor approval is final
        newStatus = 'approved'
      }
    } else if (action === 'final_approve' && role === 'reviewer') {
      newStatus = 'approved'
    }

    // Update the appraisal
    const updatedAppraisal = await prisma.performance_appraisals.update({
      where: { id: appraisalId },
      data: {
        status: newStatus,
        comments: JSON.stringify(currentComments),
        supervisorApprovedAt: action === 'approve' && role === 'supervisor' ? new Date() : appraisal.supervisorApprovedAt,
        reviewerApprovedAt: action === 'final_approve' && role === 'reviewer' ? new Date() : appraisal.reviewerApprovedAt,
        updatedAt: new Date()
      }
    })

    // TODO: Send notification to employee if changes requested
    // TODO: Send notification to reviewer if supervisor approved

    return NextResponse.json({
      success: true,
      appraisal: {
        id: updatedAppraisal.id,
        status: updatedAppraisal.status,
        comments: JSON.parse(updatedAppraisal.comments as string)
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

    const { id: appraisalId } = await params

    const appraisal = await prisma.performance_appraisals.findUnique({
      where: { id: appraisalId },
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

    if (!appraisal) {
      return NextResponse.json({ error: 'Performance appraisal not found' }, { status: 404 })
    }

    const comments = appraisal.comments ? JSON.parse(appraisal.comments as string) : { supervisor: [], reviewer: [] }

    return NextResponse.json({
      success: true,
      workflow: {
        status: appraisal.status,
        supervisorComments: comments.supervisor || [],
        reviewerComments: comments.reviewer || [],
        supervisorApprovedAt: appraisal.supervisorApprovedAt,
        reviewerApprovedAt: appraisal.reviewerApprovedAt,
        createdAt: appraisal.createdAt,
        updatedAt: appraisal.updatedAt
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

