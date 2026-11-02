import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { riskVisibilityOrFilter } from '@/lib/risk-management/session-risk-access'

function severityFor(action: string) {
  const value = action.toUpperCase()
  if (value === 'DELETE') return 'HIGH'
  if (value === 'CREATE' || value === 'ASSESSMENT') return 'MEDIUM'
  return 'LOW'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'all'
    const entityType = (searchParams.get('entityType') || 'all').toUpperCase()
    const severity = (searchParams.get('severity') || 'all').toUpperCase()
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = 25

    const vis = riskVisibilityOrFilter(session)
    const where: Record<string, unknown> = {}
    if (vis) where.risks = vis
    if (action !== 'all') where.action = action
    if (dateFrom || dateTo) {
      const end = dateTo ? new Date(dateTo) : null
      if (end && dateTo && dateTo.length <= 10) end.setHours(23, 59, 59, 999)
      where.timestamp = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(end && !Number.isNaN(end.getTime()) ? { lte: end } : {})
      }
    }

    const rows = await prisma.risk_audit_logs.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 500,
      include: {
        users: { select: { id: true, firstName: true, lastName: true, email: true } },
        risks: { select: { id: true, riskId: true, title: true, category: true } }
      }
    })

    const mapped = rows
      .map((row) => {
        const name = [row.users?.firstName, row.users?.lastName].filter(Boolean).join(' ').trim()
        return {
          id: row.id,
          timestamp: row.timestamp.toISOString(),
          userId: row.userId || '',
          userEmail: row.users?.email || '',
          userName: name || row.users?.email || 'Unknown user',
          action: row.action,
          entityType: row.action === 'ASSESSMENT' ? 'ASSESSMENT' : row.action === 'MITIGATION' ? 'MITIGATION' : 'RISK',
          entityId: row.risks?.id || row.riskId,
          entityName: row.risks ? `${row.risks.riskId} — ${row.risks.title}` : row.riskId,
          ipAddress: row.ipAddress || '',
          userAgent: row.userAgent || '',
          details: row.description || row.field || '',
          severity: severityFor(row.action),
          oldValues: row.oldValue ? { value: row.oldValue } : undefined,
          newValues: row.newValue ? { value: row.newValue } : undefined
        }
      })
      .filter((log) => {
        if (!search) return true
        return (
          log.entityName.toLowerCase().includes(search) ||
          log.userName.toLowerCase().includes(search) ||
          log.userEmail.toLowerCase().includes(search) ||
          log.details.toLowerCase().includes(search)
        )
      })
      .filter((log) => entityType === 'ALL' || log.entityType === entityType)
      .filter((log) => severity === 'ALL' || log.severity === severity)

    const start = (page - 1) * limit
    const logs = mapped.slice(start, start + limit)

    return NextResponse.json({
      success: true,
      data: {
        logs,
        total: mapped.length,
        page,
        pages: Math.max(1, Math.ceil(mapped.length / limit))
      }
    })
  } catch (error) {
    console.error('Error fetching risk audit logs:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
