import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canView = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","MEAL_ADMIN"].includes(r))
    if (!canView) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    // Fetch real escalation rules from database
    let escalationRules: any[] = []
    
    try {
      escalationRules = await prisma.meal_escalation_rules.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
    } catch (dbError: any) {
      // If table doesn't exist, return empty array
      const message: string = dbError?.message || ''
      const code: string = dbError?.code || ''
      if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
        console.log('MEAL escalation rules table not found, returning empty array')
        escalationRules = []
      } else {
        throw dbError
      }
    }

    // If no rules exist, return empty array (no default rules)
    if (escalationRules.length === 0) {
      escalationRules = []
    }

    return NextResponse.json({ 
      success: true, 
      data: escalationRules,
      total: escalationRules.length
    })
  } catch (e) {
    console.error("MEAL escalation rules fetch error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch escalation rules" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canCreate = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","MEAL_ADMIN"].includes(r))
    if (!canCreate) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { name, conditions, actions, isActive } = body

    // Create new escalation rule in database
    try {
      const newRule = await prisma.meal_escalation_rules.create({
        data: {
          name,
          conditions,
          actions,
          isActive: isActive || true,
          createdBy: session.user?.name || 'Unknown'
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: newRule,
        message: "Escalation rule created successfully"
      })
    } catch (dbError: any) {
      const message: string = dbError?.message || ''
      const code: string = dbError?.code || ''
      if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
        console.log('MEAL escalation rules table not found, cannot create rule')
        return NextResponse.json({ 
          success: false, 
          error: "Escalation system is not available. Please try again later." 
        }, { status: 503 })
      } else {
        throw dbError
      }
    }
  } catch (e) {
    console.error("MEAL escalation rule creation error", e)
    return NextResponse.json({ success: false, error: "Failed to create escalation rule" }, { status: 500 })
  }
}
