import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock database - in production, use your actual database
const plans: Record<string, unknown>[] = []
let nextId = 1

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return all plans (in production, filter by user permissions)
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { formData, isDraft = false } = body

    // Create new plan
    const newPlan = {
      id: nextId++,
      ...formData,
      isDraft,
      createdBy: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: isDraft ? 'draft' : 'submitted'
    }

    // Add to mock database
    plans.push(newPlan)

    // If not a draft, also save to documents repository
    if (!isDraft) {
      try {
        await saveToDocumentRepository(newPlan)
      } catch (docError) {
        console.warn('Failed to save to document repository:', docError)
        // Continue with the response even if document save fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      plan: newPlan,
      message: isDraft ? 'Draft saved successfully' : 'Performance plan submitted successfully'
    })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Function to save plan to documents repository
async function saveToDocumentRepository(plan: Record<string, unknown>) {
  try {
    // Generate document content
    const documentContent = generatePlanDocument(plan)
    
    // Save to document repository via API
    const documentData = {
      title: `Performance Plan - ${plan.employeeName} - ${new Date().getFullYear()}`,
      content: documentContent,
      type: 'performance_plan',
      category: 'HR Documents',
      tags: ['performance', 'plan', 'hr', (plan.department as string)?.toLowerCase()],
      metadata: {
        employeeName: plan.employeeName,
        position: plan.position,
        department: plan.department,
        planPeriod: plan.planPeriod,
        planId: plan.id
      }
    }

    // In production, make an internal API call to save to document repository
    // For now, we'll simulate this
    console.log('Saving plan document to repository:', documentData)
    
    return { success: true }
  } catch (error) {
    console.error('Error saving to document repository:', error)
    throw error
  }
}

// Function to generate document content from plan data
function generatePlanDocument(plan: Record<string, unknown>) {
  const date = new Date().toLocaleDateString()
  
  return `
# Performance Plan

**Employee:** ${plan.employeeName}
**Position:** ${plan.position}
**Department:** ${plan.department}
**Plan Period:** ${plan.planPeriod?.start} to ${plan.planPeriod?.end}
**Date Generated:** ${date}

## Performance Goals

${plan.goals?.map((goal: Record<string, unknown>, index: number) => `
${index + 1}. **${goal.title}**
   - Description: ${goal.description}
   - Target Date: ${goal.targetDate}
   - Priority: ${goal.priority}
   - Success Metrics: ${goal.successMetrics}
   - Weight: ${goal.weight}%
`).join('\n') || 'No goals defined'}

## Key Performance Indicators (KPIs)

${plan.kpis?.map((kpi: Record<string, unknown>, index: number) => `
${index + 1}. **${kpi.name}**
   - Metric: ${kpi.metric}
   - Target: ${kpi.target}
   - Current Baseline: ${kpi.baseline}
   - Measurement Frequency: ${kpi.frequency}
`).join('\n') || 'No KPIs defined'}

## Development Areas

${plan.developmentAreas?.map((area: Record<string, unknown>, index: number) => `
${index + 1}. **${area.area}**
   - Current Level: ${area.currentLevel}
   - Target Level: ${area.targetLevel}
   - Development Activities: ${area.activities}
   - Timeline: ${area.timeline}
   - Resources Required: ${area.resources}
`).join('\n') || 'No development areas specified'}

## Training and Development Plan

${plan.trainingPlan?.map((training: Record<string, unknown>, index: number) => `
${index + 1}. **${training.program}**
   - Provider: ${training.provider}
   - Duration: ${training.duration}
   - Scheduled Date: ${training.scheduledDate}
   - Cost: ${training.cost}
   - Expected Outcome: ${training.expectedOutcome}
`).join('\n') || 'No training planned'}

## Review Schedule

${plan.reviewSchedule?.map((review: Record<string, unknown>, index: number) => `
${index + 1}. **${review.type} Review**
   - Date: ${review.date}
   - Focus Areas: ${review.focusAreas}
   - Participants: ${review.participants}
`).join('\n') || 'No review schedule defined'}

## Comments and Notes

### Manager Comments
${plan.managerComments || 'No manager comments provided'}

### Employee Comments
${plan.employeeComments || 'No employee comments provided'}

### HR Comments
${plan.hrComments || 'No HR comments provided'}

---
*This document was automatically generated from the SIRTIS Performance Management System*
  `.trim()
}
