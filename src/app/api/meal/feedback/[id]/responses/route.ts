import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canRespond = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canRespond) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { message, isInternal, attachments } = body
    const id = context?.params?.id as string

    // Create new response
    try {
      const newResponse = await prisma.meal_feedback_responses.create({
        data: {
          feedbackId: id,
          respondedBy: session.user?.name || 'Unknown',
          message,
          isInternal: isInternal || false,
          attachments: attachments || []
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: newResponse,
        message: "Response added successfully"
      })
    } catch (err: any) {
      const message: string = err?.message || ''
      const code: string = err?.code || ''
      if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
        console.log('MEAL feedback responses table not found, cannot create response')
        return NextResponse.json({ 
          success: false, 
          error: "Feedback system is not available. Please try again later." 
        }, { status: 503 })
      } else {
        throw err
      }
    }
  } catch (e) {
    console.error("MEAL feedback response creation error", e)
    return NextResponse.json({ success: false, error: "Failed to add response" }, { status: 500 })
  }
}
