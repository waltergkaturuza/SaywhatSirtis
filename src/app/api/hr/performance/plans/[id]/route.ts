import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET a single performance plan by ID
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

    console.log('Fetching plan with ID:', planId)

    // Fetch the plan with all related data
    const plan = await prisma.performance_plans.findUnique({
      where: { id: planId },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            department: true,
            supervisor_id: true,
            reviewer_id: true,
            job_descriptions: {
              select: {
                id: true,
                jobTitle: true,
                keyResponsibilities: true,
              }
            }
          }
        },
        performance_responsibilities: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!plan) {
      console.log('Plan not found:', planId)
      return NextResponse.json({ error: 'Performance plan not found' }, { status: 404 })
    }

    console.log('Found plan:', plan.id, 'for employee:', plan.employeeId)

    // Check permissions: employee can view their own, supervisor/reviewer/HR can view
    // Note: supervisorId and reviewerId are user IDs, not employee IDs
    const employeeRecord = await prisma.employees.findFirst({
      where: { email: session.user.email },
      select: { id: true }
    })

    const isOwnPlan = plan.employeeId === employeeRecord?.id
    const isHR = session.user.roles?.some(r => ['HR', 'admin', 'HR_MANAGER', 'ADMIN'].includes(r))
    const isSupervisor = plan.supervisorId === session.user.id
    const isReviewer = plan.reviewerId === session.user.id

    if (!isOwnPlan && !isHR && !isSupervisor && !isReviewer) {
      console.log('Permission denied for user:', session.user.email, 'user.id:', session.user.id)
      console.log('Plan supervisorId:', plan.supervisorId, 'Plan reviewerId:', plan.reviewerId)
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse JSON fields
    const parsedPlan = {
      id: plan.id,
      employeeId: plan.employeeId,
      employeeName: `${plan.employees.firstName} ${plan.employees.lastName}`,
      employeeEmail: plan.employees.email,
      position: plan.employees.position,
      department: plan.employees.department,
      supervisorId: plan.supervisorId,
      reviewerId: plan.reviewerId,
      status: plan.status,
      planType: plan.planPeriod || 'annual',
      planTitle: plan.planTitle || `Performance Plan - ${plan.employees.firstName} ${plan.employees.lastName}`,
      planYear: plan.planYear?.toString() || new Date().getFullYear().toString(),
      startDate: plan.startDate?.toISOString().split('T')[0] || '',
      endDate: plan.endDate?.toISOString().split('T')[0] || '',
      reviewPeriod: {
        startDate: plan.startDate?.toISOString().split('T')[0] || '',
        endDate: plan.endDate?.toISOString().split('T')[0] || '',
      },
      jobDescription: plan.employees.job_descriptions ? {
        jobTitle: plan.employees.job_descriptions.jobTitle,
        keyResponsibilities: plan.employees.job_descriptions.keyResponsibilities,
      } : null,
      // Map deliverables to keyResponsibilities structure - handle both JSON objects and strings
      // First try to use performance_responsibilities table, then fall back to deliverables JSON field
      deliverables: (() => {
        // If we have performance_responsibilities, use those
        if (plan.performance_responsibilities && plan.performance_responsibilities.length > 0) {
          return plan.performance_responsibilities.map((resp: any) => ({
            id: resp.id,
            title: resp.title || '',
            description: resp.description || '',
            tasks: resp.description || '', // Use description as tasks
            weight: resp.weight || 0,
            targetDate: resp.targetDate || '',
            status: resp.status || 'not-started',
            progress: resp.progress || 0,
            successIndicators: resp.successIndicators || []
          }));
        }
        
        // Fall back to deliverables JSON field
        if (!plan.deliverables) return [];
        if (typeof plan.deliverables === 'string') {
          try {
            const parsed = JSON.parse(plan.deliverables);
            return Array.isArray(parsed) ? parsed : (typeof parsed === 'object' ? Object.values(parsed) : []);
          } catch {
            return [];
          }
        }
        return Array.isArray(plan.deliverables) ? plan.deliverables : (typeof plan.deliverables === 'object' ? Object.values(plan.deliverables) : []);
      })(),
      performance_responsibilities: plan.performance_responsibilities || [],
      keyResponsibilities: (() => {
        // If we have performance_responsibilities, use those
        if (plan.performance_responsibilities && plan.performance_responsibilities.length > 0) {
          return plan.performance_responsibilities.map((resp: any) => ({
            id: resp.id,
            description: resp.description || resp.title || '',
            tasks: resp.description || resp.tasks || '',
            weight: resp.weight || 0,
            targetDate: resp.targetDate || '',
            status: resp.status || 'not-started',
            progress: resp.progress || 0,
            successIndicators: resp.successIndicators || []
          }));
        }
        return [];
      })(),
      valueGoals: (() => {
        if (!plan.valueGoals) return [];
        if (typeof plan.valueGoals === 'string') {
          try {
            return JSON.parse(plan.valueGoals);
          } catch {
            return [];
          }
        }
        return Array.isArray(plan.valueGoals) ? plan.valueGoals : (typeof plan.valueGoals === 'object' ? plan.valueGoals : []);
      })(),
      competencies: (() => {
        if (!plan.competencies) return [];
        if (typeof plan.competencies === 'string') {
          try {
            return JSON.parse(plan.competencies);
          } catch {
            return [];
          }
        }
        return Array.isArray(plan.competencies) ? plan.competencies : (typeof plan.competencies === 'object' ? plan.competencies : []);
      })(),
      developmentNeeds: (() => {
        if (!plan.developmentNeeds) return [];
        if (typeof plan.developmentNeeds === 'string') {
          try {
            return JSON.parse(plan.developmentNeeds);
          } catch {
            return [];
          }
        }
        return Array.isArray(plan.developmentNeeds) ? plan.developmentNeeds : (typeof plan.developmentNeeds === 'object' ? plan.developmentNeeds : []);
      })(),
      comments: (() => {
        if (!plan.comments) return { employeeComments: '', supervisorComments: '', reviewerComments: '', supervisor: [], reviewer: [] };
        
        let parsed: any;
        if (typeof plan.comments === 'string') {
          try {
            parsed = JSON.parse(plan.comments);
          } catch {
            return { employeeComments: '', supervisorComments: '', reviewerComments: '', supervisor: [], reviewer: [] };
          }
        } else {
          parsed = plan.comments;
        }
        
        // Handle both structures: workflow comments (arrays) and form comments (strings)
        const comments: any = {
          employeeComments: parsed.employeeComments || '',
          supervisorComments: parsed.supervisorComments || '',
          reviewerComments: parsed.reviewerComments || '',
          supervisor: Array.isArray(parsed.supervisor) ? parsed.supervisor : [],
          reviewer: Array.isArray(parsed.reviewer) ? parsed.reviewer : []
        };
        
        // If we have workflow comments (arrays), extract the latest comment text for display
        if (comments.supervisor.length > 0) {
          const latestSupervisorComment = comments.supervisor[comments.supervisor.length - 1];
          if (latestSupervisorComment?.comment && !comments.supervisorComments) {
            comments.supervisorComments = latestSupervisorComment.comment;
          }
        }
        if (comments.reviewer.length > 0) {
          const latestReviewerComment = comments.reviewer[comments.reviewer.length - 1];
          if (latestReviewerComment?.comment && !comments.reviewerComments) {
            comments.reviewerComments = latestReviewerComment.comment;
          }
        }
        
        return comments;
      })(),
      supervisorApproval: plan.supervisorApproval || 'pending',
      reviewerApproval: plan.reviewerApproval || 'pending',
      supervisorApprovedAt: plan.supervisorApprovedAt,
      reviewerApprovedAt: plan.reviewerApprovedAt,
      submittedAt: plan.submittedAt,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }

    console.log('Returning parsed plan with', parsedPlan.deliverables?.length || 0, 'deliverables')

    return NextResponse.json(parsedPlan)

  } catch (error) {
    console.error('Error fetching performance plan:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing performance plan
export async function PUT(
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

    console.log('Updating plan:', planId)

    // Fetch existing plan
    const existingPlan = await prisma.performance_plans.findUnique({
      where: { id: planId }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Performance plan not found' }, { status: 404 })
    }

    // Check permissions
    const employeeRecord = await prisma.employees.findFirst({
      where: { email: session.user.email },
      select: { id: true }
    })

    const isOwnPlan = existingPlan.employeeId === employeeRecord?.id
    const isHR = session.user.roles?.some(r => ['HR', 'admin'].includes(r))
    // Note: supervisorId and reviewerId are user IDs, not employee IDs
    const isSupervisor = existingPlan.supervisorId === session.user.id
    const isReviewer = existingPlan.reviewerId === session.user.id

    if (!isOwnPlan && !isHR && !isSupervisor && !isReviewer) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Prepare update data with ALL fields from body (formData)
    const updateData: any = {
      updatedAt: new Date()
    }

    // Update basic fields
    if (body.planTitle !== undefined) {
      updateData.planTitle = body.planTitle
    }
    if (body.planYear !== undefined) {
      updateData.planYear = parseInt(body.planYear.toString())
    }
    if (body.planType !== undefined) {
      updateData.planPeriod = body.planPeriod || `Annual ${body.planYear || existingPlan.planYear}`
    }
    
    // Handle planPeriod - it might come as an object with startDate/endDate or as a string
    let planPeriod: string | undefined;
    if (body.planPeriod) {
      if (typeof body.planPeriod === 'string') {
        planPeriod = body.planPeriod;
      } else if (typeof body.planPeriod === 'object') {
        const startDate = body.planPeriod.startDate || body.startDate || '';
        const endDate = body.planPeriod.endDate || body.endDate || '';
        if (startDate && endDate) {
          planPeriod = `${startDate} - ${endDate}`;
        }
      }
      if (planPeriod) {
        updateData.planPeriod = planPeriod;
      }
    }
    
    // Update date fields
    if (body.startDate || body.reviewPeriod?.startDate || body.planPeriod?.startDate) {
      const startDate = body.startDate || body.reviewPeriod?.startDate || body.planPeriod?.startDate;
      if (startDate) {
        updateData.startDate = new Date(startDate);
      }
    }
    if (body.endDate || body.reviewPeriod?.endDate || body.planPeriod?.endDate) {
      const endDate = body.endDate || body.reviewPeriod?.endDate || body.planPeriod?.endDate;
      if (endDate) {
        updateData.endDate = new Date(endDate);
      }
    }

    // Update status
    if (body.status !== undefined) {
      updateData.status = body.status
      // Set submittedAt if status is submitted
      if (body.status === 'submitted' && !existingPlan.submittedAt) {
        updateData.submittedAt = new Date()
      }
    }

    // Save JSON fields (deliverables, valueGoals, competencies, developmentNeeds, comments)
    // Always update these if provided, otherwise keep existing
    if (body.deliverables !== undefined) {
      updateData.deliverables = typeof body.deliverables === 'string' 
        ? body.deliverables 
        : JSON.stringify(body.deliverables)
    }
    if (body.valueGoals !== undefined) {
      updateData.valueGoals = typeof body.valueGoals === 'string'
        ? body.valueGoals
        : JSON.stringify(body.valueGoals)
    }
    if (body.competencies !== undefined) {
      updateData.competencies = typeof body.competencies === 'string'
        ? body.competencies
        : JSON.stringify(body.competencies)
    }
    if (body.developmentNeeds !== undefined) {
      updateData.developmentNeeds = typeof body.developmentNeeds === 'string'
        ? body.developmentNeeds
        : JSON.stringify(body.developmentNeeds)
    }
    if (body.comments !== undefined) {
      updateData.comments = typeof body.comments === 'string'
        ? body.comments
        : JSON.stringify(body.comments)
    }

    // Update approval fields
    if (body.supervisorApproval !== undefined) {
      updateData.supervisorApproval = body.supervisorApproval
    }
    if (body.reviewerApproval !== undefined) {
      updateData.reviewerApproval = body.reviewerApproval
    }
    if (body.supervisorApprovedAt) {
      updateData.supervisorApprovedAt = new Date(body.supervisorApprovedAt)
    }
    if (body.reviewerApprovedAt) {
      updateData.reviewerApprovedAt = new Date(body.reviewerApprovedAt)
    }

    console.log('💾 Updating plan with data:', { ...updateData, deliverables: '[data]', valueGoals: '[data]', competencies: '[data]', developmentNeeds: '[data]', comments: '[data]' })

    // Update the plan
    const updatedPlan = await prisma.performance_plans.update({
      where: { id: planId },
      data: updateData,
      include: {
        performance_responsibilities: true
      }
    })

    // Update performance_responsibilities if keyResponsibilities is provided
    if (body.keyResponsibilities && Array.isArray(body.keyResponsibilities) && body.keyResponsibilities.length > 0) {
      // Delete existing responsibilities
      await prisma.performance_responsibilities.deleteMany({
        where: { planId: updatedPlan.id }
      })

      // Create new responsibilities
      const crypto = require('crypto');
      for (const responsibility of body.keyResponsibilities) {
        await prisma.performance_responsibilities.create({
          data: {
            id: crypto.randomUUID(),
            planId: updatedPlan.id,
            title: (responsibility.description || responsibility.title || 'Responsibility')?.substring(0, 100) || 'Responsibility',
            description: responsibility.description || responsibility.title || '',
            weight: responsibility.weight || 0,
            updatedAt: new Date()
          }
        })
      }
    }

    console.log('✅ Plan updated successfully:', updatedPlan.id)

    return NextResponse.json({
      success: true,
      message: 'Performance plan updated successfully',
      plan: {
        id: updatedPlan.id,
        planYear: updatedPlan.planYear,
        status: updatedPlan.status
      }
    })

  } catch (error) {
    console.error('Error updating performance plan:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a performance plan (Admin/HR only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: planId } = await params

    // Check if user has admin or HR permissions
    const isAdmin = session.user.roles?.some(r => [
      'ADMIN',
      'SYSTEM_ADMINISTRATOR',
      'SUPERUSER',
      'admin'
    ].includes(r))
    
    const isHR = session.user.roles?.some(r => [
      'HR',
      'HR_MANAGER',
      'ADVANCE_USER_1',
      'ADVANCE_USER_2'
    ].includes(r))
    
    const hasHRPermission = session.user.permissions?.some(p => [
      'hr.full_access',
      'hr.view_all_performance',
      'hr.delete_performance'
    ].includes(p))

    if (!isAdmin && !isHR && !hasHRPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only administrators and HR staff can delete performance plans.' },
        { status: 403 }
      )
    }

    // Check if plan exists
    const plan = await prisma.performance_plans.findUnique({
      where: { id: planId },
      select: {
        id: true,
        status: true,
        employeeId: true,
        planYear: true
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Performance plan not found' },
        { status: 404 }
      )
    }

    // Delete the plan (cascading deletes will handle related records like appraisals, responsibilities, etc.)
    await prisma.performance_plans.delete({
      where: { id: planId }
    })

    console.log(`✅ Performance plan ${planId} deleted by ${session.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Performance plan deleted successfully',
      deletedId: planId
    })

  } catch (error) {
    console.error('Error deleting performance plan:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete performance plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
