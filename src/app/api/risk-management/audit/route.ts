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
        error: 'Insufficient permissions to view audit logs.' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')
    const user = searchParams.get('user')

    // Mock audit log data - in production, this would come from database
    const auditLogs = [
      {
        id: 'AUDIT-001',
        timestamp: '2024-02-25T10:30:00Z',
        action: 'RISK_CREATED',
        entity: 'RISK-002',
        entityTitle: 'Donor Funding Delay',
        user: 'finance.director@saywhat.org',
        details: {
          category: 'Financial',
          probability: 'High',
          impact: 'High',
          riskScore: 9
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'AUDIT-002',
        timestamp: '2024-02-24T14:15:00Z',
        action: 'RISK_UPDATED',
        entity: 'RISK-001',
        entityTitle: 'Data Breach Risk',
        user: 'it.manager@saywhat.org',
        details: {
          changedFields: ['mitigationPlan', 'lastReviewed'],
          oldValues: { mitigationPlan: null },
          newValues: { mitigationPlan: 'Implement multi-factor authentication and regular security audits' }
        },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'AUDIT-003',
        timestamp: '2024-02-23T09:45:00Z',
        action: 'RISK_STATUS_CHANGED',
        entity: 'RISK-003',
        entityTitle: 'Staff Turnover in Key Positions',
        user: 'hr.manager@saywhat.org',
        details: {
          oldStatus: 'Open',
          newStatus: 'Mitigated',
          reason: 'Retention programs successfully implemented'
        },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'AUDIT-004',
        timestamp: '2024-02-22T16:20:00Z',
        action: 'RISK_DELETED',
        entity: 'RISK-006',
        entityTitle: 'Outdated Equipment Risk',
        user: 'system.admin@saywhat.org',
        details: {
          reason: 'Risk no longer applicable - equipment upgraded',
          deletedBy: 'System Admin'
        },
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'AUDIT-005',
        timestamp: '2024-02-21T11:30:00Z',
        action: 'REPORT_GENERATED',
        entity: 'REPORT-001',
        entityTitle: 'Monthly Risk Summary Report',
        user: 'program.director@saywhat.org',
        details: {
          reportType: 'summary',
          period: '2024-02',
          filters: { categories: ['All'], departments: ['All'] }
        },
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'AUDIT-006',
        timestamp: '2024-02-20T13:10:00Z',
        action: 'RISK_REVIEWED',
        entity: 'RISK-001',
        entityTitle: 'Data Breach Risk',
        user: 'it.manager@saywhat.org',
        details: {
          reviewNotes: 'Risk assessment updated based on new cybersecurity measures',
          nextReviewDate: '2024-03-20'
        },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ]

    // Filter audit logs based on query parameters
    let filteredLogs = auditLogs

    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action)
    }

    if (user) {
      filteredLogs = filteredLogs.filter(log => log.user.toLowerCase().includes(user.toLowerCase()))
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    // Statistics
    const stats = {
      totalLogs: filteredLogs.length,
      actionBreakdown: auditLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      userActivity: auditLogs.reduce((acc, log) => {
        acc[log.user] = (acc[log.user] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recentActivity: auditLogs.slice(0, 5).map(log => ({
        timestamp: log.timestamp,
        action: log.action,
        user: log.user,
        entity: log.entityTitle
      }))
    }

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredLogs.length / limit),
        totalItems: filteredLogs.length,
        itemsPerPage: limit
      },
      stats,
      message: `${paginatedLogs.length} audit logs retrieved successfully`
    })

  } catch (error) {
    console.error('Audit logs API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve audit logs' },
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
    const { action, entity, entityTitle, details } = body

    // Create new audit log entry
    const auditLog = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      entity,
      entityTitle,
      user: session.user.email || 'Unknown',
      details,
      ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
      userAgent: request.headers.get('user-agent') || 'Unknown'
    }

    console.log('Audit log created:', auditLog)

    return NextResponse.json({
      auditLog,
      message: 'Audit log entry created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Audit log creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create audit log entry' },
      { status: 500 }
    )
  }
}
