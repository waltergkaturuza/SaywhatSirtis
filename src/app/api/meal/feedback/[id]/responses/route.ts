import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

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
    const newResponse = {
      id: Date.now().toString(),
      feedbackId: id,
      respondedBy: session.user?.name || 'Unknown',
      respondedAt: new Date().toISOString(),
      message,
      isInternal: isInternal || false,
      attachments: attachments || []
    }

    // Here you would typically save to the database
    // For now, we'll return success

    return NextResponse.json({ 
      success: true, 
      data: newResponse,
      message: "Response added successfully"
    })
  } catch (e) {
    console.error("MEAL feedback response creation error", e)
    return NextResponse.json({ success: false, error: "Failed to add response" }, { status: 500 })
  }
}
