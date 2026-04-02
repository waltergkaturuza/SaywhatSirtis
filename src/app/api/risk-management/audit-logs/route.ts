import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { riskVisibilityOrFilter } from '@/lib/risk-management/session-risk-access'
import type { Prisma } from '@prisma/client'

type UiAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'APPROVE' | 'REJECT'
type UiEntity = 'RISK' | 'MITIGATION' | 'ASSESSMENT' | 'DOCUMENT' | 'REPORT'
type UiSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

function mapRawActionToDisplay(raw: string): UiAction {
  const u = String(raw).toUpperCase()
  if (u === 'ASSESSMENT') return 'CREATE'
  if (u === 'ASSESSMENT_UPDATED') return 'UPDATE'
  if (u === 'ASSESSMENT_DELETED') return 'DELETE'
  if (u === 'DOCUMENT_UPLOADED') return 'CREATE'
  if (u === 'DOCUMENT_DELETED') return 'DELETE'
  if (u === 'MITIGATION_CREATED') return 'CREATE'
  if (u === 'MITIGATION_UPDATED') return 'UPDATE'
  if (u === 'MITIGATION_DELETED') return 'DELETE'
  if (u === 'CREATE' || u === 'UPDATE' || u === 'DELETE') return u as UiAction
  if (u === 'VIEW' || u === 'EXPORT' || u === 'APPROVE' || u === 'REJECT') return u as UiAction
  return 'UPDATE'
}

function mapRawActionToEntityType(raw: string): UiEntity {
  const u = String(raw).toUpperCase()
  if (u.startsWith('ASSESSMENT')) return 'ASSESSMENT'
  if (u.startsWith('DOCUMENT_')) return 'DOCUMENT'
  if (u.startsWith('MITIGATION_')) return 'MITIGATION'
  return 'RISK'
}

function mapSeverity(rawAction: string, riskScore: number | null | undefined): UiSeverity {
  const u = String(rawAction).toUpperCase()
  if (u === 'DELETE' || u === 'ASSESSMENT_DELETED' || u === 'DOCUMENT_DELETED' || u === 'MITIGATION_DELETED')
    return 'HIGH'
  if (
    u === 'ASSESSMENT_UPDATED' ||
    u === 'UPDATE' ||
    u === 'DOCUMENT_UPLOADED' ||
    u === 'MITIGATION_UPDATED'
  )
    return 'MEDIUM'
  if (u === 'CREATE' || u === 'ASSESSMENT' || u === 'MITIGATION_CREATED') {
    if (riskScore != null && riskScore >= 7) return 'HIGH'
    if (riskScore != null && riskScore >= 4) return 'MEDIUM'
    return 'LOW'
  }
  return 'MEDIUM'
}

function actionsForUiFilter(uiAction: string): string[] | null {
  if (uiAction === 'all' || !uiAction) return null
  const u = uiAction.toUpperCase()
  if (u === 'CREATE')
    return ['CREATE', 'ASSESSMENT', 'DOCUMENT_UPLOADED', 'MITIGATION_CREATED']
  if (u === 'UPDATE') return ['UPDATE', 'ASSESSMENT_UPDATED', 'MITIGATION_UPDATED']
  if (u === 'DELETE')
    return ['DELETE', 'ASSESSMENT_DELETED', 'DOCUMENT_DELETED', 'MITIGATION_DELETED']
  return [u]
}

function actionsForEntityTypeFilter(entityType: string): string[] | null {
  if (entityType === 'all' || !entityType) return null
  const u = entityType.toUpperCase()
  if (u === 'RISK') return ['CREATE', 'UPDATE', 'DELETE']
  if (u === 'ASSESSMENT') return ['ASSESSMENT', 'ASSESSMENT_UPDATED', 'ASSESSMENT_DELETED']
  if (u === 'DOCUMENT') return ['DOCUMENT_UPLOADED', 'DOCUMENT_DELETED']
  if (u === 'MITIGATION') return ['MITIGATION_CREATED', 'MITIGATION_UPDATED', 'MITIGATION_DELETED']
  return [] // REPORT — no writers yet
}

function userDisplayName(u: {
  firstName: string | null
  lastName: string | null
  email: string
  username: string | null
}): string {
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
  if (name) return name
  if (u.username?.trim()) return u.username.trim()
  return u.email
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const forExport = searchParams.get('export') === '1'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(
      forExport ? 5000 : 100,
      Math.max(1, parseInt(searchParams.get('limit') || '25', 10))
    )
    const search = searchParams.get('search')?.trim() || ''
    const actionFilter = searchParams.get('action') || 'all'
    const entityTypeFilter = searchParams.get('entityType') || 'all'
    const severityFilter = searchParams.get('severity') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const vis = riskVisibilityOrFilter(session)

    const andParts: Prisma.risk_audit_logsWhereInput[] = []
    if (vis) {
      andParts.push({ risks: { AND: [vis] } })
    }

    const aSet = actionFilter === 'all' ? null : actionsForUiFilter(actionFilter)
    const eSet = entityTypeFilter === 'all' ? null : actionsForEntityTypeFilter(entityTypeFilter)

    if (eSet && eSet.length === 0) {
      return NextResponse.json({
        success: true,
        data: { logs: [], total: 0, page, limit, totalPages: 0 },
      })
    }

    let actionIn: string[] | null = null
    if (aSet && eSet) {
      actionIn = aSet.filter((a) => eSet!.includes(a))
    } else if (aSet) {
      actionIn = aSet
    } else if (eSet) {
      actionIn = eSet
    }

    if (actionIn && actionIn.length === 0) {
      return NextResponse.json({
        success: true,
        data: { logs: [], total: 0, page, limit, totalPages: 0 },
      })
    }
    if (actionIn && actionIn.length > 0) {
      andParts.push({ action: { in: actionIn } })
    }

    const tsFilter: { gte?: Date; lte?: Date } = {}
    if (dateFrom) {
      const d = new Date(dateFrom)
      if (!Number.isNaN(d.getTime())) tsFilter.gte = d
    }
    if (dateTo) {
      const d = new Date(dateTo)
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999)
        tsFilter.lte = d
      }
    }
    if (tsFilter.gte || tsFilter.lte) {
      andParts.push({ timestamp: tsFilter })
    }

    if (search) {
      andParts.push({
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { field: { contains: search, mode: 'insensitive' } },
          { oldValue: { contains: search, mode: 'insensitive' } },
          { newValue: { contains: search, mode: 'insensitive' } },
          { risks: { title: { contains: search, mode: 'insensitive' } } },
          { risks: { riskId: { contains: search, mode: 'insensitive' } } },
          {
            users: {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      })
    }

    const where: Prisma.risk_audit_logsWhereInput =
      andParts.length > 0 ? { AND: andParts } : {}

    const rawRows = await prisma.risk_audit_logs.findMany({
      where,
      include: {
        risks: { select: { id: true, title: true, riskId: true, riskScore: true } },
        users: {
          select: { id: true, email: true, firstName: true, lastName: true, username: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: forExport ? limit : 3000,
    })

    const mapped = rawRows.map((row) => {
      const displayAction = mapRawActionToDisplay(row.action)
      const entityType = mapRawActionToEntityType(row.action)
      const severity = mapSeverity(row.action, row.risks?.riskScore)
      const u = row.users

      let entityName = row.risks?.title ?? 'Unknown risk'
      if (entityType === 'DOCUMENT' && row.description) {
        const m = row.description.match(/^Document (?:uploaded|deleted):\s*(.+)$/i)
        if (m?.[1]) entityName = m[1].trim()
      }

      const oldValues =
        row.oldValue != null && row.oldValue !== ''
          ? { [row.field?.trim() || 'value']: row.oldValue }
          : undefined
      const newValues =
        row.newValue != null && row.newValue !== ''
          ? { [row.field?.trim() || 'value']: row.newValue }
          : undefined

      return {
        id: row.id,
        timestamp: row.timestamp.toISOString(),
        userId: row.userId ?? '',
        userEmail: u?.email ?? '—',
        userName: u ? userDisplayName(u) : 'System',
        action: displayAction,
        rawAction: String(row.action),
        entityType,
        entityId: row.risks?.id ?? row.riskId,
        entityName,
        riskDisplayId: row.risks?.riskId ?? '',
        oldValues: oldValues && Object.keys(oldValues).length ? oldValues : undefined,
        newValues: newValues && Object.keys(newValues).length ? newValues : undefined,
        ipAddress: row.ipAddress ?? '—',
        userAgent: row.userAgent ?? '—',
        details: row.description ?? `${row.action} · ${row.risks?.title ?? 'risk'}`,
        severity,
      }
    })

    const severityFiltered =
      severityFilter !== 'all'
        ? mapped.filter((l) => l.severity === severityFilter.toUpperCase())
        : mapped

    const total = severityFiltered.length
    const totalPages = forExport ? 1 : Math.max(1, Math.ceil(total / limit))
    const start = forExport ? 0 : (page - 1) * limit
    const logs = forExport ? severityFiltered : severityFiltered.slice(start, start + limit)

    return NextResponse.json({
      success: true,
      data: { logs, total, page: forExport ? 1 : page, limit: forExport ? logs.length : limit, totalPages },
    })
  } catch (error) {
    console.error('Error fetching risk audit logs:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
