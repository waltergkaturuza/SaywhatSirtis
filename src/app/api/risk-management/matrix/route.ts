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
        error: 'Insufficient permissions to view risk matrix.' 
      }, { status: 403 })
    }

    // Risk matrix data - probability vs impact
    const matrixData = [
      // Low Impact
      { probability: 'Low', impact: 'Low', score: 1, count: 2, risks: ['RISK-005'] },
      { probability: 'Medium', impact: 'Low', score: 2, count: 0, risks: [] },
      { probability: 'High', impact: 'Low', score: 3, count: 0, risks: [] },
      
      // Medium Impact
      { probability: 'Low', impact: 'Medium', score: 2, count: 0, risks: [] },
      { probability: 'Medium', impact: 'Medium', score: 4, count: 2, risks: ['RISK-003', 'RISK-004'] },
      { probability: 'High', impact: 'Medium', score: 6, count: 0, risks: [] },
      
      // High Impact
      { probability: 'Low', impact: 'High', score: 3, count: 1, risks: ['RISK-005'] },
      { probability: 'Medium', impact: 'High', score: 6, count: 1, risks: ['RISK-001'] },
      { probability: 'High', impact: 'High', score: 9, count: 1, risks: ['RISK-002'] }
    ]

    // Risk appetite thresholds
    const riskAppetite = {
      acceptable: [1, 2],      // Green: scores 1-2
      tolerable: [3, 4, 6],    // Yellow: scores 3, 4, 6
      unacceptable: [9]        // Red: scores 9
    }

    // Matrix statistics
    const stats = {
      totalRisks: matrixData.reduce((sum, cell) => sum + cell.count, 0),
      acceptableRisks: matrixData.filter(cell => riskAppetite.acceptable.includes(cell.score))
                                .reduce((sum, cell) => sum + cell.count, 0),
      tolerableRisks: matrixData.filter(cell => riskAppetite.tolerable.includes(cell.score))
                                .reduce((sum, cell) => sum + cell.count, 0),
      unacceptableRisks: matrixData.filter(cell => riskAppetite.unacceptable.includes(cell.score))
                                  .reduce((sum, cell) => sum + cell.count, 0)
    }

    return NextResponse.json({
      matrixData,
      riskAppetite,
      stats,
      message: 'Risk matrix data retrieved successfully'
    })

  } catch (error) {
    console.error('Risk matrix API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve risk matrix data' },
      { status: 500 }
    )
  }
}
