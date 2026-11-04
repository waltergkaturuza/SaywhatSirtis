import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export const PASSWORD_MAX_AGE_DAYS = 30
const PASSWORD_CHANGED_ACTION = 'PASSWORD_CHANGED'
const DAY = 24 * 60 * 60 * 1000

export async function recordPasswordChange(userId: string, ipAddress?: string | null, userAgent?: string | null) {
  await prisma.audit_logs.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      action: PASSWORD_CHANGED_ACTION,
      resource: 'User',
      resourceId: userId,
      details: { module: 'Password expiry', changedAt: new Date().toISOString() },
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown'
    }
  })
}

export async function getPasswordStatus(userId: string) {
  const [lastChange, user] = await Promise.all([
    prisma.audit_logs.findFirst({
      where: { userId, action: { in: [PASSWORD_CHANGED_ACTION, 'PASSWORD_CHANGE'] } },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true }
    }),
    prisma.users.findUnique({ where: { id: userId }, select: { createdAt: true, passwordHash: true } })
  ])

  const changedAt = lastChange?.timestamp || user?.createdAt || new Date(0)
  const dueAt = new Date(changedAt.getTime() + PASSWORD_MAX_AGE_DAYS * DAY)
  const daysLeft = Math.ceil((dueAt.getTime() - Date.now()) / DAY)

  return {
    hasPassword: Boolean(user?.passwordHash),
    lastChangedAt: lastChange?.timestamp?.toISOString() || null,
    dueAt: dueAt.toISOString(),
    daysLeft,
    isDue: Boolean(user?.passwordHash) && daysLeft <= 0,
    maxAgeDays: PASSWORD_MAX_AGE_DAYS
  }
}
