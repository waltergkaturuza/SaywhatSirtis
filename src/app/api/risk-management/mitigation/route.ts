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

    // Mock mitigation plans data
    const mitigationPlans = [
      {
        id: 'MIT-001',
        riskId: 'RISK-001',
        riskTitle: 'Data Breach Risk',
        title: 'Cybersecurity Enhancement Plan',
        description: 'Comprehensive plan to enhance cybersecurity measures and prevent data breaches',
        status: 'In Progress',
        priority: 'High',
        owner: 'IT Manager',
        dueDate: '2024-03-15',
        progress: 65,
        budget: 25000,
        actions: [
          {
            id: 'ACT-001',
            description: 'Implement multi-factor authentication',
            status: 'Completed',
            dueDate: '2024-02-15',
            assignee: 'IT Team',
            completedDate: '2024-02-10'
          },
          {
            id: 'ACT-002',
            description: 'Conduct security audit',
            status: 'In Progress',
            dueDate: '2024-03-01',
            assignee: 'External Auditor',
            progress: 40
          },
          {
            id: 'ACT-003',
            description: 'Staff security training',
            status: 'Pending',
            dueDate: '2024-03-15',
            assignee: 'HR Team'
          }
        ],
        createdDate: '2024-01-20',
        lastUpdated: '2024-02-20'
      },
      {
        id: 'MIT-002',
        riskId: 'RISK-002',
        riskTitle: 'Donor Funding Delay',
        title: 'Funding Diversification Strategy',
        description: 'Strategic plan to diversify funding sources and reduce dependency on major donors',
        status: 'Planning',
        priority: 'High',
        owner: 'Finance Director',
        dueDate: '2024-06-30',
        progress: 25,
        budget: 50000,
        actions: [
          {
            id: 'ACT-004',
            description: 'Identify new donor prospects',
            status: 'In Progress',
            dueDate: '2024-03-30',
            assignee: 'Fundraising Team',
            progress: 60
          },
          {
            id: 'ACT-005',
            description: 'Develop grant applications',
            status: 'Pending',
            dueDate: '2024-04-30',
            assignee: 'Programs Team'
          },
          {
            id: 'ACT-006',
            description: 'Establish emergency reserve fund',
            status: 'Pending',
            dueDate: '2024-05-31',
            assignee: 'Finance Team'
          }
        ],
        createdDate: '2024-02-01',
        lastUpdated: '2024-02-20'
      },
      {
        id: 'MIT-003',
        riskId: 'RISK-003',
        riskTitle: 'Staff Turnover in Key Positions',
        title: 'Staff Retention Enhancement Program',
        description: 'Comprehensive program to improve staff retention and reduce turnover',
        status: 'Completed',
        priority: 'Medium',
        owner: 'HR Manager',
        dueDate: '2024-02-28',
        progress: 100,
        budget: 15000,
        actions: [
          {
            id: 'ACT-007',
            description: 'Conduct compensation review',
            status: 'Completed',
            dueDate: '2024-01-31',
            assignee: 'HR Team',
            completedDate: '2024-01-25'
          },
          {
            id: 'ACT-008',
            description: 'Implement career development program',
            status: 'Completed',
            dueDate: '2024-02-15',
            assignee: 'HR Team',
            completedDate: '2024-02-10'
          },
          {
            id: 'ACT-009',
            description: 'Establish mentorship program',
            status: 'Completed',
            dueDate: '2024-02-28',
            assignee: 'HR Team',
            completedDate: '2024-02-25'
          }
        ],
        createdDate: '2024-01-10',
        lastUpdated: '2024-02-25'
      }
    ]

    // Calculate statistics
    const stats = {
      totalPlans: mitigationPlans.length,
      activePlans: mitigationPlans.filter(p => p.status === 'In Progress').length,
      completedPlans: mitigationPlans.filter(p => p.status === 'Completed').length,
      overduePlans: mitigationPlans.filter(p => {
        const dueDate = new Date(p.dueDate)
        const today = new Date()
        return dueDate < today && p.status !== 'Completed'
      }).length,
      averageProgress: Math.round(
        mitigationPlans.reduce((sum, p) => sum + p.progress, 0) / mitigationPlans.length
      ),
      totalBudget: mitigationPlans.reduce((sum, p) => sum + p.budget, 0),
      statusBreakdown: mitigationPlans.reduce((acc, plan) => {
        acc[plan.status] = (acc[plan.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      mitigationPlans,
      stats,
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

    // Check if user has risk management permissions
    const hasPermission = session?.user?.permissions?.includes("risk.create") ||
                         session?.user?.roles?.includes("admin") ||
                         session?.user?.roles?.includes("manager")

    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to create mitigation plans.' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { riskId, riskTitle, title, description, priority, owner, dueDate, budget, actions } = body

    // Validate required fields
    if (!riskId || !title || !description || !owner || !dueDate) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Create new mitigation plan
    const newPlan = {
      id: `MIT-${Date.now()}`,
      riskId,
      riskTitle,
      title,
      description,
      status: 'Planning',
      priority: priority || 'Medium',
      owner,
      dueDate,
      progress: 0,
      budget: budget || 0,
      actions: actions || [],
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    console.log('New mitigation plan created:', newPlan)

    return NextResponse.json({
      mitigationPlan: newPlan,
      message: 'Mitigation plan created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Mitigation plan creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create mitigation plan' },
      { status: 500 }
    )
  }
}
