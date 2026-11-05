import { prisma } from '@/lib/prisma'

const PLACEHOLDER_OFFICERS = new Set(['current officer', 'unknown officer', 'unknown user', 'n/a'])

export const UNKNOWN_OFFICER_LABEL = 'Unknown officer'

export function isPlaceholderOfficer(value: unknown) {
  if (typeof value !== 'string') return true
  const trimmed = value.trim().toLowerCase()
  return !trimmed || PLACEHOLDER_OFFICERS.has(trimmed)
}

export function officerLabel(value: string | null | undefined) {
  return isPlaceholderOfficer(value) ? UNKNOWN_OFFICER_LABEL : String(value).trim()
}

let repairPromise: Promise<void> | null = null

async function repairPlaceholderOfficers() {
  const affected = await prisma.call_records.findMany({
    where: {
      OR: [
        { officerName: { equals: 'Current Officer', mode: 'insensitive' } },
        { assignedOfficer: { equals: 'Current Officer', mode: 'insensitive' } }
      ]
    },
    select: { id: true, officerName: true, assignedOfficer: true }
  })
  if (affected.length === 0) return

  const history = await prisma.audit_logs.findMany({
    where: { resource: 'CASE', resourceId: { in: affected.map((call) => call.id) } },
    orderBy: { timestamp: 'asc' },
    select: { resourceId: true, userId: true, details: true }
  })

  const userIds = [...new Set(history.map((entry) => entry.userId).filter((id): id is string => Boolean(id)))]
  const users = userIds.length
    ? await prisma.users.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true, email: true } })
    : []
  const userNames = new Map(
    users.map((user) => [user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email])
  )

  const creatorByCall = new Map<string, string>()
  for (const entry of history) {
    if (!entry.resourceId || creatorByCall.has(entry.resourceId)) continue
    const fromUser = entry.userId ? userNames.get(entry.userId) : undefined
    const details = (entry.details && typeof entry.details === 'object' ? entry.details : {}) as { updatedBy?: unknown }
    const fromDetails = typeof details.updatedBy === 'string' && !isPlaceholderOfficer(details.updatedBy) ? details.updatedBy : undefined
    const name = fromUser || fromDetails
    if (name) creatorByCall.set(entry.resourceId, name)
  }

  for (const call of affected) {
    const name = creatorByCall.get(call.id)
    if (!name) continue
    await prisma.call_records.update({
      where: { id: call.id },
      data: {
        ...(isPlaceholderOfficer(call.officerName) ? { officerName: name } : {}),
        ...(isPlaceholderOfficer(call.assignedOfficer) && call.assignedOfficer ? { assignedOfficer: name } : {})
      }
    })
  }
}

export function repairPlaceholderOfficersOnce() {
  if (!repairPromise) {
    repairPromise = repairPlaceholderOfficers().catch((error) => {
      repairPromise = null
      console.error('Failed to repair placeholder officer names:', error)
    })
  }
  return repairPromise
}
