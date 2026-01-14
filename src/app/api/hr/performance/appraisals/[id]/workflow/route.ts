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
    // Handle both cases: comments might be a JSON string or already an object
    let currentComments: any = { supervisor: [], reviewer: [] }
    if (appraisal.comments) {
      try {
        // Log the type and value for debugging
        console.log('Processing comments - type:', typeof appraisal.comments, 'isArray:', Array.isArray(appraisal.comments))
        
        if (typeof appraisal.comments === 'string') {
          // It's a string, parse it
          currentComments = JSON.parse(appraisal.comments)
        } else if (appraisal.comments && typeof appraisal.comments === 'object') {
          // Already an object (Prisma returns JSON fields as objects)
          // Deep clone to avoid any reference issues
          currentComments = JSON.parse(JSON.stringify(appraisal.comments))
        } else {
          // Fallback for other types
          console.warn('Unexpected comments type:', typeof appraisal.comments, appraisal.comments)
          currentComments = { supervisor: [], reviewer: [] }
        }
        
        // Ensure the structure is correct
        if (!Array.isArray(currentComments.supervisor)) currentComments.supervisor = []
        if (!Array.isArray(currentComments.reviewer)) currentComments.reviewer = []
      } catch (e) {
        console.error('Error processing comments:', e)
        console.error('Comments value type:', typeof appraisal.comments)
        console.error('Comments value:', appraisal.comments)
        currentComments = { supervisor: [], reviewer: [] }
      }
    }

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

    // Determine new workflow status and reset approvals if needed
    let newStatus = appraisal.status
    let supervisorApprovedAt = appraisal.supervisorApprovedAt
    let reviewerApprovedAt = appraisal.reviewerApprovedAt
    
    if (action === 'request_changes') {
      newStatus = 'revision_requested'
      
      // If reviewer requests changes, reset supervisor approval if it was approved
      // This allows supervisor to edit again (e.g., to add missing ratings)
      if (role === 'reviewer' && appraisal.supervisorApprovedAt) {
        supervisorApprovedAt = null
      }
      
      // If supervisor requests changes, reset to submitted status so employee can edit
      if (role === 'supervisor') {
        newStatus = 'submitted' // Allow employee to edit
      }
    } else if (action === 'approve' && role === 'supervisor') {
      newStatus = 'supervisor_approved'
      supervisorApprovedAt = new Date()
      // If there's a reviewer, push to reviewer_assessment
      if (appraisal.reviewerId) {
        newStatus = 'reviewer_assessment'
      } else {
        // If no reviewer, supervisor approval is final
        newStatus = 'approved'
      }
    } else if (action === 'final_approve' && role === 'reviewer') {
      newStatus = 'approved'
      reviewerApprovedAt = new Date()
    }

    // Update the appraisal
    const updatedAppraisal = await prisma.performance_appraisals.update({
      where: { id: appraisalId },
      data: {
        status: newStatus,
        comments: JSON.stringify(currentComments),
        supervisorApprovedAt: supervisorApprovedAt,
        reviewerApprovedAt: reviewerApprovedAt,
        updatedAt: new Date()
      }
    })

    // TODO: Send notification to employee if changes requested
    // TODO: Send notification to reviewer if supervisor approved

    // Determine approval status based on timestamps
    const supervisorApproval = updatedAppraisal.supervisorApprovedAt ? 'approved' : 'pending'
    const reviewerApproval = updatedAppraisal.reviewerApprovedAt ? 'approved' : 'pending'

    return NextResponse.json({
      success: true,
      appraisal: {
        id: updatedAppraisal.id,
        status: updatedAppraisal.status,
        comments: (() => {
          try {
            if (!updatedAppraisal.comments) return { supervisor: [], reviewer: [] }
            if (typeof updatedAppraisal.comments === 'string') {
              return JSON.parse(updatedAppraisal.comments)
            } else if (typeof updatedAppraisal.comments === 'object' && updatedAppraisal.comments !== null) {
              return updatedAppraisal.comments as any
            }
            return { supervisor: [], reviewer: [] }
          } catch (e) {
            console.error('Error processing updated comments:', e)
            return { supervisor: [], reviewer: [] }
          }
        })(),
        supervisorApproval,
        reviewerApproval,
        supervisorApprovedAt: updatedAppraisal.supervisorApprovedAt?.toISOString(),
        reviewerApprovedAt: updatedAppraisal.reviewerApprovedAt?.toISOString()
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

    // Handle both cases: comments might be a JSON string or already an object
    let comments: any = { supervisor: [], reviewer: [] }
    if (appraisal.comments) {
      try {
        if (typeof appraisal.comments === 'string') {
          comments = JSON.parse(appraisal.comments)
        } else if (typeof appraisal.comments === 'object' && appraisal.comments !== null) {
          // Already an object (Prisma returns JSON fields as objects)
          comments = appraisal.comments
        } else {
          comments = { supervisor: [], reviewer: [] }
        }
        
        // Ensure the structure is correct
        if (!comments.supervisor) comments.supervisor = []
        if (!comments.reviewer) comments.reviewer = []
      } catch (e) {
        console.error('Error processing comments in GET:', e, 'Comments value:', appraisal.comments)
        comments = { supervisor: [], reviewer: [] }
      }
    }

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

