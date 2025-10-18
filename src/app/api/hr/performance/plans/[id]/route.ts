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
        }
      }
    })

    if (!plan) {
      console.log('Plan not found:', planId)
      return NextResponse.json({ error: 'Performance plan not found' }, { status: 404 })
    }

    console.log('Found plan:', plan.id, 'for employee:', plan.employeeId)

    // Check permissions: employee can view their own, supervisor/reviewer/HR can view
    const employeeRecord = await prisma.employees.findFirst({
      where: { email: session.user.email },
      select: { id: true }
    })

    const isOwnPlan = plan.employeeId === employeeRecord?.id
    const isHR = session.user.roles?.some(r => ['HR', 'admin'].includes(r))
    const isSupervisor = plan.supervisorId === employeeRecord?.id
    const isReviewer = plan.reviewerId === employeeRecord?.id

    if (!isOwnPlan && !isHR && !isSupervisor && !isReviewer) {
      console.log('Permission denied for user:', session.user.email)
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
      // Map deliverables to keyResponsibilities structure
      deliverables: plan.deliverables ? (typeof plan.deliverables === 'string' ? JSON.parse(plan.deliverables) : plan.deliverables) : [],
      valueGoals: plan.valueGoals ? (typeof plan.valueGoals === 'string' ? JSON.parse(plan.valueGoals) : plan.valueGoals) : [],
      competencies: plan.competencies ? (typeof plan.competencies === 'string' ? JSON.parse(plan.competencies) : plan.competencies) : [],
      developmentNeeds: plan.developmentNeeds ? (typeof plan.developmentNeeds === 'string' ? JSON.parse(plan.developmentNeeds) : plan.developmentNeeds) : [],
      comments: plan.comments ? (typeof plan.comments === 'string' ? JSON.parse(plan.comments) : plan.comments) : { employeeComments: '', supervisorComments: '', reviewerComments: '' },
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
    const isSupervisor = existingPlan.supervisorId === employeeRecord?.id
    const isReviewer = existingPlan.reviewerId === employeeRecord?.id

    if (!isOwnPlan && !isHR && !isSupervisor && !isReviewer) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (body.deliverables !== undefined) {
      updateData.deliverables = body.deliverables
    }
    if (body.valueGoals !== undefined) {
      updateData.valueGoals = body.valueGoals
    }
    if (body.competencies !== undefined) {
      updateData.competencies = body.competencies
    }
    if (body.developmentNeeds !== undefined) {
      updateData.developmentNeeds = body.developmentNeeds
    }
    if (body.comments !== undefined) {
      updateData.comments = body.comments
    }
    if (body.status) {
      updateData.status = body.status
    }
    if (body.supervisorApproval) {
      updateData.supervisorApproval = body.supervisorApproval
    }
    if (body.reviewerApproval) {
      updateData.reviewerApproval = body.reviewerApproval
    }
    if (body.supervisorApprovedAt) {
      updateData.supervisorApprovedAt = new Date(body.supervisorApprovedAt)
    }
    if (body.reviewerApprovedAt) {
      updateData.reviewerApprovedAt = new Date(body.reviewerApprovedAt)
    }
    if (body.reviewPeriod?.startDate) {
      updateData.startDate = new Date(body.reviewPeriod.startDate)
    }
    if (body.reviewPeriod?.endDate) {
      updateData.endDate = new Date(body.reviewPeriod.endDate)
    }

    // Update the plan
    const updatedPlan = await prisma.performance_plans.update({
      where: { id: planId },
      data: updateData
    })

    console.log('Plan updated successfully:', updatedPlan.id)

    return NextResponse.json({
      success: true,
      message: 'Performance plan updated successfully',
      planId: updatedPlan.id
    })

  } catch (error) {
    console.error('Error updating performance plan:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
