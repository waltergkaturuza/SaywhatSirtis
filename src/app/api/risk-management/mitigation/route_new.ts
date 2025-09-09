import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized. Please log in.' 
      }, { status: 401 })
    }

    // Check if user has risk management permissions
    const hasPermission = session?.user?.permissions?.includes("risk.view") ||
                         session?.user?.roles?.includes("admin") ||
                         session?.user?.roles?.includes("manager")

    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to view mitigation plans.' 
      }, { status: 403 })
    }

    // TODO: Replace with actual database queries when mitigation plans are implemented
    // Return empty data - no more mock data
    const mitigationPlans: any[] = []

    return NextResponse.json({
      plans: mitigationPlans,
      stats: {
        totalPlans: mitigationPlans.length,
        activePlans: 0,
        completedPlans: 0,
        overduePlans: 0
      },
      message: `${mitigationPlans.length} mitigation plans retrieved successfully`
    })

  } catch (error) {
    console.error('Mitigation plans API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve mitigation plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized. Please log in.' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { riskId, title, description, actions, dueDate, budget, priority } = body

    // TODO: Replace with actual database creation when mitigation plans are implemented
    // For now, return a simulated response until database is connected
    const newPlan = {
      id: `MIT-${Date.now()}`,
      riskId,
      title,
      description,
      status: 'Planning',
      priority: priority || 'Medium',
      owner: session.user.email || 'Unknown',
      dueDate,
      progress: 0,
      budget: budget || 0,
      actions: actions || [],
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    console.log('Mitigation plan creation attempted (database not connected):', newPlan)

    return NextResponse.json({
      plan: newPlan,
      message: 'Mitigation plan creation attempted - database connection required for persistence'
    }, { status: 201 })

  } catch (error) {
    console.error('Mitigation plan creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create mitigation plan' },
      { status: 500 }
    )
  }
}
