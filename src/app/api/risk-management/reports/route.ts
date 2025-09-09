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
        error: 'Insufficient permissions to view risk reports.' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'summary'

    const currentDate = new Date().toISOString().split('T')[0]
    const currentMonth = new Date().toISOString().slice(0, 7)

    // Generate different report types
    const reports = {
      summary: {
        title: 'Risk Management Summary Report',
        generatedDate: currentDate,
        period: currentMonth,
        data: {
          totalRisks: 5,
          newRisks: 2,
          closedRisks: 1,
          riskTrends: [
            { month: '2024-01', total: 3, new: 3, closed: 0 },
            { month: '2024-02', total: 5, new: 2, closed: 1 }
          ],
          categoryBreakdown: {
            'Cybersecurity': 1,
            'Financial': 1,
            'HR/Personnel': 1,
            'Operational': 1,
            'Compliance': 1
          },
          riskLevels: {
            'High': 2,
            'Medium': 2,
            'Low': 1
          }
        }
      },

      detailed: {
        title: 'Detailed Risk Register Report',
        generatedDate: currentDate,
        period: currentMonth,
        data: {
          risks: [
            {
              id: 'RISK-001',
              title: 'Data Breach Risk',
              category: 'Cybersecurity',
              probability: 'Medium',
              impact: 'High',
              score: 6,
              status: 'Open',
              owner: 'IT Manager',
              lastReviewed: '2024-02-01'
            },
            {
              id: 'RISK-002',
              title: 'Donor Funding Delay',
              category: 'Financial',
              probability: 'High',
              impact: 'High',
              score: 9,
              status: 'Open',
              owner: 'Finance Director',
              lastReviewed: '2024-02-15'
            }
          ]
        }
      },

      compliance: {
        title: 'Risk Compliance Report',
        generatedDate: currentDate,
        period: currentMonth,
        data: {
          complianceMetrics: {
            riskReviewCompliance: '85%',
            mitigationPlanCompletion: '70%',
            overdueMitigations: 2,
            complianceRisks: 1
          },
          regulatoryAlignment: {
            donorRequirements: 'Compliant',
            localRegulations: 'Compliant',
            internationalStandards: 'Partial Compliance'
          },
          recommendations: [
            'Complete overdue risk mitigation plans',
            'Enhance cybersecurity measures',
            'Implement regular compliance audits'
          ]
        }
      },

      executive: {
        title: 'Executive Risk Dashboard Report',
        generatedDate: currentDate,
        period: currentMonth,
        data: {
          keyRiskIndicators: {
            overallRiskExposure: 'Medium',
            criticalRisks: 2,
            emergingRisks: 1,
            riskTrend: 'Stable'
          },
          strategicRisks: [
            {
              risk: 'Donor Funding Delay',
              impact: 'Program implementation delays',
              mitigation: 'Diversification strategy in progress'
            }
          ],
          actionItems: [
            'Immediate review of cybersecurity protocols',
            'Accelerate donor diversification efforts',
            'Strengthen operational risk controls'
          ]
        }
      }
    }

    const report = reports[reportType as keyof typeof reports] || reports.summary

    return NextResponse.json({
      report,
      availableTypes: Object.keys(reports),
      message: `${reportType} report generated successfully`
    })

  } catch (error) {
    console.error('Risk reports API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate risk report' },
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
        error: 'Insufficient permissions to generate custom reports.' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { reportType, dateRange, categories, departments, riskLevels } = body

    // Generate custom report based on filters
    const customReport = {
      title: `Custom Risk Report - ${reportType}`,
      generatedDate: new Date().toISOString().split('T')[0],
      generatedBy: session.user.email,
      filters: {
        dateRange,
        categories,
        departments,
        riskLevels
      },
      data: {
        filteredRisks: [],
        summary: {
          totalRisks: 0,
          averageRiskScore: 0,
          categoryDistribution: {}
        }
      }
    }

    console.log('Custom report generated:', customReport)

    return NextResponse.json({
      report: customReport,
      message: 'Custom report generated successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Custom report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate custom report' },
      { status: 500 }
    )
  }
}
