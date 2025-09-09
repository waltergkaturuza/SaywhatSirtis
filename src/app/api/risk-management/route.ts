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

    // More permissive permission check for development
    const hasPermission = session?.user?.permissions?.includes("risk.view") ||
                         session?.user?.roles?.includes("admin") ||
                         session?.user?.roles?.includes("manager") ||
                         session?.user?.email || // Allow any authenticated user for now
                         process.env.NODE_ENV === 'development'

    if (!hasPermission) {
      console.log('Permission denied for user:', session.user?.email)
      console.log('User roles:', session.user?.roles)
      console.log('User permissions:', session.user?.permissions)
      return NextResponse.json({ 
        error: 'Insufficient permissions to view risks.' 
      }, { status: 403 })
    }

    // TODO: Replace with actual database queries when Prisma client is updated
    // const risks = await prisma.risk.findMany({
    //   orderBy: {
    //     createdAt: 'desc'
    //   }
    // })

    // Return empty data - no more mock data
    const risks: any[] = []

    // Calculate statistics
    const stats = {
      totalRisks: risks.length,
      openRisks: risks.filter((r: any) => r.status === 'Open').length,
      highRisks: risks.filter((r: any) => r.riskScore >= 7).length,
      overdueMitigations: risks.filter((r: any) => r.status === 'Open' && !r.mitigationPlan).length,
      risksByCategory: risks.reduce((acc: Record<string, number>, risk: any) => {
        acc[risk.category] = (acc[risk.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      risksByDepartment: risks.reduce((acc: Record<string, number>, risk: any) => {
        acc[risk.department] = (acc[risk.department] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      risksByStatus: risks.reduce((acc: Record<string, number>, risk: any) => {
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

    // More permissive permission check for development
    const hasPermission = session?.user?.permissions?.includes("risk.create") ||
                         session?.user?.roles?.includes("admin") ||
                         session?.user?.roles?.includes("manager") ||
                         session?.user?.email || // Allow any authenticated user for now
                         process.env.NODE_ENV === 'development'

    if (!hasPermission) {
      console.log('Permission denied for user:', session.user?.email)
      console.log('User roles:', session.user?.roles)
      console.log('User permissions:', session.user?.permissions)
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

    // TODO: Replace with actual database creation when Prisma client is updated
    // const newRisk = await prisma.risk.create({
    //   data: {
    //     title,
    //     description,
    //     category,
    //     department,
    //     probability,
    //     impact,
    //     riskScore,
    //     owner,
    //     createdBy: session.user.email || 'Unknown'
    //   }
    // })

    // For now, return a simulated response until database is connected
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

    console.log('Risk creation attempted (database not connected):', newRisk)

    return NextResponse.json({
      risk: newRisk,
      message: 'Risk creation attempted - database connection required for persistence'
    }, { status: 201 })

  } catch (error) {
    console.error('Risk creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create risk' },
      { status: 500 }
    )
  }
}
