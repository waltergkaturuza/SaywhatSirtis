import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock database - in production, use your actual database
let appraisals: any[] = []
let nextId = 1

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return all appraisals (in production, filter by user permissions)
    return NextResponse.json(appraisals)
  } catch (error) {
    console.error('Error fetching appraisals:', error)
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

    // Create new appraisal
    const newAppraisal = {
      id: nextId++,
      ...formData,
      isDraft,
      createdBy: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: isDraft ? 'draft' : 'submitted'
    }

    // Add to mock database
    appraisals.push(newAppraisal)

    // If not a draft, also save to documents repository
    if (!isDraft) {
      try {
        await saveToDocumentRepository(newAppraisal)
      } catch (docError) {
        console.warn('Failed to save to document repository:', docError)
        // Continue with the response even if document save fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      appraisal: newAppraisal,
      message: isDraft ? 'Draft saved successfully' : 'Appraisal submitted successfully'
    })
  } catch (error) {
    console.error('Error creating appraisal:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Function to save appraisal to documents repository
async function saveToDocumentRepository(appraisal: any) {
  try {
    // Generate document content
    const documentContent = generateAppraisalDocument(appraisal)
    
    // Save to document repository via API
    const documentData = {
      title: `Performance Appraisal - ${appraisal.employeeName} - ${new Date().getFullYear()}`,
      content: documentContent,
      type: 'performance_appraisal',
      category: 'HR Documents',
      tags: ['performance', 'appraisal', 'hr', appraisal.department?.toLowerCase()],
      metadata: {
        employeeName: appraisal.employeeName,
        position: appraisal.position,
        department: appraisal.department,
        reviewPeriod: appraisal.reviewPeriod,
        overallRating: appraisal.overallRating,
        appraisalId: appraisal.id
      }
    }

    // In production, make an internal API call to save to document repository
    // For now, we'll simulate this
    console.log('Saving appraisal document to repository:', documentData)
    
    return { success: true }
  } catch (error) {
    console.error('Error saving to document repository:', error)
    throw error
  }
}

// Function to generate document content from appraisal data
function generateAppraisalDocument(appraisal: any) {
  const date = new Date().toLocaleDateString()
  
  return `
# Performance Appraisal Report

**Employee:** ${appraisal.employeeName}
**Position:** ${appraisal.position}
**Department:** ${appraisal.department}
**Review Period:** ${appraisal.reviewPeriod?.start} to ${appraisal.reviewPeriod?.end}
**Date Generated:** ${date}

## Performance Assessment

${appraisal.performanceAreas?.map((area: any) => `
### ${area.name}
- **Weight:** ${area.weight}%
- **Rating:** ${area.rating}/5
- **Comments:** ${area.comments || 'No comments provided'}
`).join('\n') || 'No performance areas assessed'}

## Key Achievements

${appraisal.achievements?.map((achievement: any, index: number) => `
${index + 1}. **${achievement.title}**
   - Description: ${achievement.description}
   - Impact: ${achievement.impact}
   - Date: ${achievement.date}
`).join('\n') || 'No achievements recorded'}

## Goals for Next Period

${appraisal.goals?.map((goal: any, index: number) => `
${index + 1}. **${goal.title}**
   - Description: ${goal.description}
   - Target Date: ${goal.targetDate}
   - Priority: ${goal.priority}
   - Success Metrics: ${goal.successMetrics}
`).join('\n') || 'No goals set'}

## Development Plan

${appraisal.developmentPlan?.map((item: any, index: number) => `
${index + 1}. **${item.area}**
   - Current Level: ${item.currentLevel}
   - Target Level: ${item.targetLevel}
   - Development Activities: ${item.activities}
   - Timeline: ${item.timeline}
   - Resources: ${item.resources}
`).join('\n') || 'No development plan specified'}

## Comments and Feedback

### Employee Comments
${appraisal.employeeComments || 'No employee comments provided'}

### Supervisor Comments
${appraisal.supervisorComments || 'No supervisor comments provided'}

### HR Comments
${appraisal.hrComments || 'No HR comments provided'}

## Overall Rating
**${appraisal.overallRating}/5** - ${getRatingLabel(appraisal.overallRating)}

---
*This document was automatically generated from the SIRTIS Performance Management System*
  `.trim()

  function getRatingLabel(rating: number): string {
    const labels: { [key: number]: string } = {
      1: "Needs Improvement",
      2: "Below Expectations", 
      3: "Meets Expectations",
      4: "Exceeds Expectations",
      5: "Outstanding"
    }
    return labels[rating] || "Not Rated"
  }
}
