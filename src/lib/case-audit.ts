import { randomUUID } from 'crypto'
import { prisma } from '@/lib/db-connection'

export type CaseChange = {
  from: string
  to: string
  fieldLabel: string
}

type HistoryRequest = {
  headers: { get(name: string): string | null }
}

function text(value: unknown) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export function canonicalCaseStatus(value: unknown) {
  const normalized = text(value).toUpperCase().replace(/[\s-]+/g, '_')
  if (!normalized) return ''
  return normalized === 'DONE' ? 'RESOLVED' : normalized
}

export function caseDateKey(value: unknown) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return text(value)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Harare' }).format(date)
}

export function trackChange(
  changes: Record<string, CaseChange>,
  key: string,
  label: string,
  from: unknown,
  to: unknown
) {
  const previous = text(from)
  const next = text(to)
  if (previous === next) return
  changes[key] = { from: previous || '—', to: next || '—', fieldLabel: label }
}

export async function recordCaseHistory(options: {
  caseId: string
  caseNumber?: string | null
  action?: 'UPDATE' | 'CREATE' | 'CLOSE' | 'RESOLVE'
  changes: Record<string, CaseChange>
  reason?: string | null
  userId?: string | null
  userName?: string | null
  userEmail?: string | null
  request?: HistoryRequest
}) {
  const action = options.action || 'UPDATE'
  if (action === 'UPDATE' && Object.keys(options.changes).length === 0) return false

  let userId: string | null = null
  if (options.userId) {
    const byId = await prisma.users.findUnique({
      where: { id: options.userId },
      select: { id: true },
    }).catch(() => null)
    userId = byId?.id ?? null
  }
  if (!userId && options.userEmail) {
    const byEmail = await prisma.users.findUnique({
      where: { email: options.userEmail },
      select: { id: true },
    }).catch(() => null)
    userId = byEmail?.id ?? null
  }

  const data = {
    id: randomUUID(),
    userId,
    action,
    resource: 'CASE',
    resourceId: options.caseId,
    details: {
      action: action === 'CREATE' ? 'CASE_CREATED' : 'CASE_UPDATE',
      changes: options.changes,
      changeCount: Object.keys(options.changes).length,
      caseNumber: options.caseNumber ?? null,
      reason: options.reason?.trim() || (action === 'CREATE' ? 'Case opened' : 'Case information updated'),
      updatedBy: options.userName || options.userEmail || 'Unknown user',
      updatedByEmail: options.userEmail || null,
    },
    ipAddress: options.request?.headers.get('x-forwarded-for') || options.request?.headers.get('x-real-ip') || null,
    userAgent: options.request?.headers.get('user-agent') || null,
    timestamp: new Date(),
  }

  try {
    await prisma.audit_logs.create({ data })
    return true
  } catch (error) {
    console.warn('Case history write failed, retrying without user link:', error)
    try {
      await prisma.audit_logs.create({ data: { ...data, userId: null } })
      return true
    } catch (retryError) {
      console.error('Case history could not be saved:', retryError)
      return false
    }
  }
}
