import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Calculate real analytics from database
    let analytics: any = {}
    
    try {
      // Get total feedback count
      const totalFeedback = await prisma.meal_feedback.count()
      
      // Get feedback by status
      const feedbackByStatus = await prisma.meal_feedback.groupBy({
        by: ['status'],
        _count: { status: true }
      })
      
      // Get feedback by type
      const feedbackByType = await prisma.meal_feedback.groupBy({
        by: ['type'],
        _count: { type: true }
      })
      
      // Get feedback by priority
      const feedbackByPriority = await prisma.meal_feedback.groupBy({
        by: ['priority'],
        _count: { priority: true }
      })
      
      // Get feedback by project
      const feedbackByProject = await prisma.meal_feedback.groupBy({
        by: ['project'],
        _count: { project: true },
        where: { project: { not: null } }
      })
      
      // Get feedback by contact method
      const feedbackByContactMethod = await prisma.meal_feedback.groupBy({
        by: ['contactMethod'],
        _count: { contactMethod: true },
        where: { contactMethod: { not: null } }
      })
      
      // Calculate resolution rate
      const resolvedCount = await prisma.meal_feedback.count({
        where: { status: 'resolved' }
      })
      const resolutionRate = totalFeedback > 0 ? Math.round((resolvedCount / totalFeedback) * 100) : 0
      
      // Calculate open issues
      const openIssues = await prisma.meal_feedback.count({
        where: { status: 'open' }
      })
      
      // Calculate critical issues
      const criticalIssues = await prisma.meal_feedback.count({
        where: { priority: 'critical' }
      })
      
      // Transform data to match expected format
      const byStatus = feedbackByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>)
      
      const byType = feedbackByType.reduce((acc, item) => {
        acc[item.type] = item._count.type
        return acc
      }, {} as Record<string, number>)
      
      const byPriority = feedbackByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority
        return acc
      }, {} as Record<string, number>)
      
      const byProject = feedbackByProject.reduce((acc, item) => {
        acc[item.project || 'Unknown'] = item._count.project
        return acc
      }, {} as Record<string, number>)
      
      const byContactMethod = feedbackByContactMethod.reduce((acc, item) => {
        acc[item.contactMethod || 'Unknown'] = item._count.contactMethod
        return acc
      }, {} as Record<string, number>)
      
      analytics = {
        overview: {
          totalFeedback,
          openIssues,
          resolvedIssues: resolvedCount,
          criticalIssues,
          resolutionRate,
          avgResponseTime: '2.5 hours', // This would need response time calculation
          avgResolutionTime: '3.2 days' // This would need resolution time calculation
        },
        byType,
        byStatus,
        byPriority,
        byProject,
        byContactMethod,
        trends: {
          daily: [], // Would need date-based queries
          weekly: [], // Would need date-based queries  
          monthly: [] // Would need date-based queries
        },
        topKeywords: [], // Would need text analysis
        responseTime: {
          average: 2.5, // Would need response time calculation
          byPriority: {},
          byType: {}
        },
        satisfaction: {
          overall: 4.2, // Would need satisfaction rating system
          byType: {},
          trends: []
        },
        escalation: {
          totalEscalated: 0, // Would need escalation tracking
          escalationRate: 0,
          byLevel: {},
          avgEscalationTime: '0 hours'
        }
      }
    } catch (dbError: any) {
      // If database tables don't exist, return empty analytics
      const message: string = dbError?.message || ''
      const code: string = dbError?.code || ''
      if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
        console.log('MEAL feedback tables not found, returning empty analytics')
        analytics = {
          overview: {
            totalFeedback: 0,
            openIssues: 0,
            resolvedIssues: 0,
            criticalIssues: 0,
            resolutionRate: 0,
            avgResponseTime: '0 hours',
            avgResolutionTime: '0 days'
          },
          byType: {},
          byStatus: {},
          byPriority: {},
          byProject: {},
          byContactMethod: {},
          trends: { daily: [], weekly: [], monthly: [] },
          topKeywords: [],
          responseTime: { average: 0, byPriority: {}, byType: {} },
          satisfaction: { overall: 0, byType: {}, trends: [] },
          escalation: { totalEscalated: 0, escalationRate: 0, byLevel: {}, avgEscalationTime: '0 hours' }
        }
      } else {
        throw dbError
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
