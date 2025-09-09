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
        error: 'Insufficient permissions to view risks.' 
      }, { status: 403 })
    }

    // Mock risk data - in production, this would come from database
    const risks = [
      {
        id: 'RISK-001',
        title: 'Data Breach Risk',
        description: 'Potential unauthorized access to beneficiary personal data due to inadequate cybersecurity measures',
        category: 'Cybersecurity',
        department: 'IT',
        probability: 'Medium',
        impact: 'High',
        riskScore: 6,
        status: 'Open',
        dateIdentified: '2024-01-15',
        owner: 'IT Manager',
        createdBy: 'System Admin',
        lastReviewed: '2024-02-01',
        mitigationPlan: 'Implement multi-factor authentication and regular security audits',
        documents: ['security_audit_2024.pdf', 'data_protection_policy.pdf']
      },
      {
        id: 'RISK-002',
        title: 'Donor Funding Delay',
        description: 'Risk of delayed funding from major donors affecting program implementation timelines',
        category: 'Financial',
        department: 'Finance',
        probability: 'High',
        impact: 'High',
        riskScore: 9,
        status: 'Open',
        dateIdentified: '2024-02-01',
        owner: 'Finance Director',
        createdBy: 'Finance Team',
        lastReviewed: '2024-02-15',
        mitigationPlan: 'Diversify funding sources and maintain emergency reserves',
        documents: ['donor_agreements_2024.pdf']
      },
      {
        id: 'RISK-003',
        title: 'Staff Turnover in Key Positions',
        description: 'High turnover rate in critical program management positions affecting service delivery',
        category: 'HR/Personnel',
        department: 'HR',
        probability: 'Medium',
        impact: 'Medium',
        riskScore: 4,
        status: 'Mitigated',
        dateIdentified: '2024-01-10',
        owner: 'HR Manager',
        createdBy: 'HR Team',
        lastReviewed: '2024-02-20',
        mitigationPlan: 'Implemented retention programs, competitive compensation review, and succession planning',
        documents: ['hr_retention_strategy.pdf', 'compensation_analysis.pdf']
      },
      {
        id: 'RISK-004',
        title: 'Equipment Theft/Loss',
        description: 'Risk of theft or loss of valuable equipment including vehicles, generators, and IT equipment',
        category: 'Operational',
        department: 'Operations',
        probability: 'Medium',
        impact: 'Medium',
        riskScore: 4,
        status: 'Open',
        dateIdentified: '2024-01-20',
        owner: 'Operations Manager',
        createdBy: 'Field Team',
        lastReviewed: '2024-02-10'
      },
      {
        id: 'RISK-005',
        title: 'Compliance Violation',
        description: 'Risk of non-compliance with donor regulations and local government requirements',
        category: 'Compliance',
        department: 'Programs',
        probability: 'Low',
        impact: 'High',
        riskScore: 3,
        status: 'Closed',
        dateIdentified: '2024-01-05',
        owner: 'Program Director',
        createdBy: 'Compliance Officer',
        lastReviewed: '2024-02-25',
        mitigationPlan: 'Enhanced compliance monitoring and regular training programs'
      }
    ]

    // Calculate statistics
    const stats = {
      totalRisks: risks.length,
      openRisks: risks.filter(r => r.status === 'Open').length,
      highRisks: risks.filter(r => r.riskScore >= 7).length,
      overdueMitigations: risks.filter(r => r.status === 'Open' && !r.mitigationPlan).length,
      risksByCategory: risks.reduce((acc, risk) => {
        acc[risk.category] = (acc[risk.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      risksByDepartment: risks.reduce((acc, risk) => {
        acc[risk.department] = (acc[risk.department] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      risksByStatus: risks.reduce((acc, risk) => {
        acc[risk.status] = (acc[risk.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      risks,
      stats,
      message: `${risks.length} risks retrieved successfully`
    })

  } catch (error) {
    console.error('Risk management API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve risks' },
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
        error: 'Insufficient permissions to create risks.' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, department, probability, impact, owner } = body

    // Validate required fields
    if (!title || !description || !category || !department || !probability || !impact || !owner) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Calculate risk score (simplified)
    const probabilityScores: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3 }
    const impactScores: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3 }
    const probabilityScore = probabilityScores[probability] || 1
    const impactScore = impactScores[impact] || 1
    const riskScore = probabilityScore * impactScore

    // Create new risk (in production, this would be saved to database)
    const newRisk = {
      id: `RISK-${Date.now()}`,
      title,
      description,
      category,
      department,
      probability,
      impact,
      riskScore,
      status: 'Open',
      dateIdentified: new Date().toISOString().split('T')[0],
      owner,
      createdBy: session.user.email || 'Unknown',
      lastReviewed: new Date().toISOString().split('T')[0]
    }

    console.log('New risk created:', newRisk)

    return NextResponse.json({
      risk: newRisk,
      message: 'Risk registered successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Risk creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create risk' },
      { status: 500 }
    )
  }
}
