import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canView = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canView) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const project = searchParams.get('project')
    const dateRange = searchParams.get('dateRange') || '30' // days

    // Mock analytics data - in a real system, these would be calculated from the database
    const analytics = {
      overview: {
        totalFeedback: 156,
        openIssues: 23,
        resolvedIssues: 128,
        criticalIssues: 5,
        resolutionRate: 82.1,
        avgResponseTime: '2.5 hours',
        avgResolutionTime: '3.2 days'
      },
      byType: {
        suggestion: 45,
        complaint: 67,
        compliment: 23,
        report: 15,
        question: 6
      },
      byStatus: {
        open: 23,
        in_progress: 5,
        resolved: 128,
        closed: 0
      },
      byPriority: {
        low: 89,
        medium: 45,
        high: 17,
        critical: 5
      },
      byProject: {
        'Community Water Program': 98,
        'All Projects': 45,
        'Health Program': 13
      },
      byContactMethod: {
        web: 67,
        whatsapp: 45,
        email: 23,
        phone: 15,
        sms: 6
      },
      trends: {
        daily: [
          { date: '2024-01-10', count: 3 },
          { date: '2024-01-11', count: 5 },
          { date: '2024-01-12', count: 2 },
          { date: '2024-01-13', count: 7 },
          { date: '2024-01-14', count: 4 },
          { date: '2024-01-15', count: 6 },
          { date: '2024-01-16', count: 3 }
        ],
        weekly: [
          { week: 'Week 1', count: 15 },
          { week: 'Week 2', count: 23 },
          { week: 'Week 3', count: 18 },
          { week: 'Week 4', count: 21 }
        ],
        monthly: [
          { month: 'October 2023', count: 45 },
          { month: 'November 2023', count: 52 },
          { month: 'December 2023', count: 38 },
          { month: 'January 2024', count: 21 }
        ]
      },
      topKeywords: [
        { keyword: 'water quality', count: 23 },
        { keyword: 'accessibility', count: 18 },
        { keyword: 'corruption', count: 12 },
        { keyword: 'elderly', count: 9 },
        { keyword: 'infrastructure', count: 8 }
      ],
      responseTime: {
        average: 2.5, // hours
        byPriority: {
          low: 4.2,
          medium: 2.8,
          high: 1.5,
          critical: 0.8
        },
        byType: {
          suggestion: 3.2,
          complaint: 2.1,
          compliment: 1.8,
          report: 1.2,
          question: 2.5
        }
      },
      satisfaction: {
        overall: 4.2, // out of 5
        byType: {
          suggestion: 4.5,
          complaint: 3.8,
          compliment: 4.9,
          report: 4.1,
          question: 4.3
        },
        trends: [
          { month: 'Oct 2023', rating: 3.8 },
          { month: 'Nov 2023', rating: 4.0 },
          { month: 'Dec 2023', rating: 4.1 },
          { month: 'Jan 2024', rating: 4.2 }
        ]
      },
      escalation: {
        totalEscalated: 12,
        escalationRate: 7.7, // percentage
        byLevel: {
          1: 8,
          2: 3,
          3: 1
        },
        avgEscalationTime: '4.2 hours'
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: analytics
    })
  } catch (e) {
    console.error("MEAL feedback analytics error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
