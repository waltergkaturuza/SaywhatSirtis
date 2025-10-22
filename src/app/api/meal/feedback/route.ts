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

    // Get feedback data using Prisma client instead of raw queries
    let feedbacks: any[] = []
    try {
      feedbacks = await prisma.meal_feedback.findMany({
        where: {
          ...(type && type !== 'all' ? { type } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          ...(priority && priority !== 'all' ? { priority } : {}),
          ...(project && project !== 'all' ? { project } : {}),
          ...(search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          } : {})
        },
        orderBy: { submittedAt: 'desc' },
        take: 100
      })
    } catch (err: any) {
      // If table doesn't exist in the current environment, fall back to empty list
      const message: string = err?.message || ''
      const code: string = err?.code || ''
      if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
        console.log('MEAL feedback table not found, returning empty list')
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
        responses = await prisma.meal_feedback_responses.findMany({
          where: {
            feedbackId: { in: feedbackIds }
          },
          orderBy: { respondedAt: 'asc' }
        })
      } catch (err: any) {
        const message: string = err?.message || ''
        const code: string = err?.code || ''
        if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
          console.log('MEAL feedback responses table not found, returning empty list')
          responses = []
        } else {
          throw err
        }
      }
    }

    // Group responses by feedbackId
    const responsesByFeedback = responses.reduce((acc, response) => {
      if (!acc[response.feedbackId]) {
        acc[response.feedbackId] = []
      }
      acc[response.feedbackId].push(response)
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
    try {
      const newFeedback = await prisma.meal_feedback.create({
        data: {
          type,
          priority,
          title,
          description,
          submittedBy: isAnonymous ? 'Anonymous' : session.user?.name || 'Unknown',
          isAnonymous,
          contactMethod,
          project,
          location,
          tags: tags || [],
          attachments: attachments || []
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: newFeedback,
        message: "Feedback submitted successfully"
      })
    } catch (err: any) {
      const message: string = err?.message || ''
      const code: string = err?.code || ''
      if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
        console.log('MEAL feedback table not found, cannot create feedback')
        return NextResponse.json({ 
          success: false, 
          error: "Feedback system is not available. Please try again later." 
        }, { status: 503 })
      } else {
        throw err
      }
    }
  } catch (e) {
    console.error("MEAL feedback creation error", e)
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500 })
  }
}
