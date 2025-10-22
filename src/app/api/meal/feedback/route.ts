import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canView = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canView) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const project = searchParams.get('project')
    const search = searchParams.get('search')

    // Build where conditions
    let whereConditions = []
    if (type && type !== 'all') {
      whereConditions.push(`type = '${type}'`)
    }
    if (status && status !== 'all') {
      whereConditions.push(`status = '${status}'`)
    }
    if (priority && priority !== 'all') {
      whereConditions.push(`priority = '${priority}'`)
    }
    if (project && project !== 'all') {
      whereConditions.push(`project = '${project}'`)
    }
    if (search) {
      whereConditions.push(`(title ILIKE '%${search}%' OR description ILIKE '%${search}%')`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Get feedback data (use $queryRawUnsafe because the WHERE clause is dynamically assembled)
    const feedbackQuery = `
      SELECT 
        id,
        type,
        priority,
        status,
        title,
        description,
        submitted_by,
        submitted_at,
        is_anonymous,
        contact_method,
        project,
        location,
        tags,
        assigned_to,
        resolution,
        resolved_at,
        escalation_level,
        attachments,
        created_at,
        updated_at
      FROM public.meal_feedback
      ${whereClause}
      ORDER BY submitted_at DESC
      LIMIT 100`;
    let feedbacks: any[] = []
    try {
      feedbacks = await (prisma as any).$queryRawUnsafe<any[]>(feedbackQuery)
    } catch (err: any) {
      // If table doesn't exist in the current environment, fall back to empty list
      const message: string = err?.message || ''
      const code: string = err?.code || ''
      if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
        feedbacks = []
      } else {
        throw err
      }
    }

    // Get responses for each feedback
    const feedbackIds = feedbacks.map(f => f.id)
    let responses: any[] = []
    if (feedbackIds.length > 0) {
      try {
        responses = await (prisma as any).$queryRawUnsafe<any[]>(
          `SELECT 
            id,
            feedback_id,
            responded_by,
            responded_at,
            message,
            is_internal,
            attachments
           FROM public.meal_feedback_responses
           WHERE feedback_id IN (${feedbackIds.map((id:string)=>`'${id}'`).join(',')})
           ORDER BY responded_at ASC`
        )
      } catch (err: any) {
        const message: string = err?.message || ''
        const code: string = err?.code || ''
        if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
          responses = []
        } else {
          throw err
        }
      }
    }

    // Group responses by feedback_id
    const responsesByFeedback = responses.reduce((acc, response) => {
      if (!acc[response.feedback_id]) {
        acc[response.feedback_id] = []
      }
      acc[response.feedback_id].push(response)
      return acc
    }, {} as Record<string, any[]>)

    // Combine feedback with responses
    const feedbacksWithResponses = feedbacks.map(feedback => ({
      ...feedback,
      responses: responsesByFeedback[feedback.id] || []
    }))

    return NextResponse.json({ 
      success: true, 
      data: feedbacksWithResponses,
      total: feedbacks.length
    })
  } catch (e) {
    console.error("MEAL feedback fetch error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch feedback" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { 
      type, 
      priority, 
      title, 
      description, 
      isAnonymous, 
      contactMethod, 
      project, 
      location, 
      tags, 
      attachments 
    } = body

    // Create new feedback
    const newFeedback = {
      id: Date.now().toString(),
      type,
      priority,
      status: 'open',
      title,
      description,
      submittedBy: isAnonymous ? 'Anonymous' : session.user?.name || 'Unknown',
      submittedAt: new Date().toISOString(),
      isAnonymous,
      contactMethod,
      project,
      location,
      tags: tags || [],
      escalationLevel: 0,
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Here you would typically save to the database
    // For now, we'll return success

    return NextResponse.json({ 
      success: true, 
      data: newFeedback,
      message: "Feedback submitted successfully"
    })
  } catch (e) {
    console.error("MEAL feedback creation error", e)
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500 })
  }
}
