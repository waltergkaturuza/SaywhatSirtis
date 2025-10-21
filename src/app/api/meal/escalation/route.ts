import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canView = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","MEAL_ADMIN"].includes(r))
    if (!canView) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    // Mock escalation rules - in a real system, these would come from the database
    const escalationRules = [
      {
        id: '1',
        name: 'Critical Issues Escalation',
        conditions: {
          priority: ['critical'],
          keywords: ['corruption', 'fraud', 'safety', 'emergency']
        },
        actions: {
          assignTo: 'Senior Management',
          notify: ['director@example.com', 'legal@example.com'],
          deadline: 2, // hours
          autoEscalate: true
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Water Quality Issues',
        conditions: {
          type: ['complaint'],
          keywords: ['water', 'quality', 'contamination', 'taste', 'color']
        },
        actions: {
          assignTo: 'Water Quality Team',
          notify: ['water-team@example.com'],
          deadline: 24, // hours
          autoEscalate: true
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Accessibility Issues',
        conditions: {
          type: ['suggestion', 'complaint'],
          keywords: ['accessibility', 'elderly', 'disabled', 'ramp', 'access']
        },
        actions: {
          assignTo: 'Infrastructure Team',
          notify: ['infrastructure@example.com'],
          deadline: 48, // hours
          autoEscalate: false
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Financial Misconduct',
        conditions: {
          keywords: ['corruption', 'fraud', 'misappropriation', 'funds', 'money']
        },
        actions: {
          assignTo: 'Legal Team',
          notify: ['legal@example.com', 'audit@example.com'],
          deadline: 1, // hours
          autoEscalate: true
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

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

    // Create new escalation rule
    const newRule = {
      id: Date.now().toString(),
      name,
      conditions,
      actions,
      isActive: isActive || true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user?.name || 'Unknown'
    }

    // Here you would typically save to the database
    // For now, we'll return success

    return NextResponse.json({ 
      success: true, 
      data: newRule,
      message: "Escalation rule created successfully"
    })
  } catch (e) {
    console.error("MEAL escalation rule creation error", e)
    return NextResponse.json({ success: false, error: "Failed to create escalation rule" }, { status: 500 })
  }
}
