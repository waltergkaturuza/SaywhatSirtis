import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { ensureReferralTables } from '@/lib/call-centre/referral-store'

const EMPTY_REFERRALS = new Set(['', 'none', 'no', 'n/a', 'na', 'nil', 'null', 'undefined', '-', 'not applicable', 'no referral'])

type CallReferralSource = {
  caseNumber: string
  referral: string | null
  callerName: string
  callerPhone: string | null
  callerAge: string | null
  callerGender: string | null
  callerProvince: string | null
  clientName: string | null
  clientAge: string | null
  clientSex: string | null
  clientProvince: string | null
  servicesRecommended: string | null
  callDescription: string | null
  subject: string
  priority: string | null
  officerName: string | null
  assignedOfficer: string | null
  createdAt: Date
}

const CALL_FIELDS = {
  caseNumber: true,
  referral: true,
  callerName: true,
  callerPhone: true,
  callerAge: true,
  callerGender: true,
  callerProvince: true,
  clientName: true,
  clientAge: true,
  clientSex: true,
  clientProvince: true,
  servicesRecommended: true,
  callDescription: true,
  subject: true,
  priority: true,
  officerName: true,
  assignedOfficer: true,
  createdAt: true
} as const

function referralTarget(raw: string | null | undefined) {
  if (!raw) return ''
  let value = raw.trim()
  if (value.startsWith('{')) {
    try {
      const parsed = JSON.parse(value) as Record<string, unknown>
      value = String(parsed.name || parsed.label || parsed.value || parsed.organization || '').trim()
    } catch {
      return value.slice(0, 300)
    }
  }
  return EMPTY_REFERRALS.has(value.toLowerCase()) ? '' : value.slice(0, 300)
}

function urgencyFromPriority(priority: string | null) {
  const value = String(priority || '').toUpperCase()
  if (value === 'URGENT' || value === 'CRITICAL') return 'URGENT'
  if (value === 'HIGH') return 'HIGH'
  if (value === 'LOW') return 'LOW'
  return 'MEDIUM'
}

function referralNumber(date: Date) {
  const day = date.toISOString().slice(0, 10).replace(/-/g, '')
  return `REF-${day}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

async function findOrganization(target: string) {
  return prisma.referral_organizations.findFirst({
    where: { name: { equals: target, mode: 'insensitive' } },
    select: { id: true, name: true }
  })
}

async function upsertCallReferral(call: CallReferralSource) {
  const target = referralTarget(call.referral)
  const existing = await prisma.call_centre_referrals.findFirst({
    where: { caseNumber: call.caseNumber, source: 'CALL' },
    select: { id: true, status: true }
  })

  if (!target) {
    if (existing && existing.status !== 'CANCELLED') {
      await prisma.call_centre_referrals.update({
        where: { id: existing.id },
        data: { status: 'CANCELLED', updatedAt: new Date() }
      })
    }
    return
  }

  const organization = await findOrganization(target)
  const details = {
    organizationId: organization?.id || null,
    organizationName: organization?.name || target,
    clientName: (call.clientName || call.callerName || 'Unknown').slice(0, 200),
    clientPhone: call.callerPhone,
    clientAge: call.clientAge || call.callerAge,
    clientGender: call.clientSex || call.callerGender,
    clientProvince: call.clientProvince || call.callerProvince,
    reason: (call.servicesRecommended || call.callDescription || call.subject || 'Referral recorded on the call').slice(0, 2000),
    servicesRequested: call.servicesRecommended,
    urgency: urgencyFromPriority(call.priority),
    createdByName: call.officerName || call.assignedOfficer
  }

  if (existing) {
    await prisma.call_centre_referrals.update({
      where: { id: existing.id },
      data: {
        ...details,
        status: existing.status === 'CANCELLED' ? 'PENDING' : existing.status,
        updatedAt: new Date()
      }
    })
    return
  }

  try {
    await prisma.call_centre_referrals.create({
      data: {
        id: crypto.randomUUID(),
        referralNumber: referralNumber(call.createdAt),
        caseNumber: call.caseNumber,
        source: 'CALL',
        consentGiven: false,
        status: 'PENDING',
        notes: 'Recorded automatically from the call record',
        ...details,
        createdAt: call.createdAt,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code !== 'P2002') throw error
  }
}

export async function syncCallReferral(caseNumber: string | null | undefined) {
  if (!caseNumber) return
  try {
    await ensureReferralTables()
    const call = await prisma.call_records.findUnique({ where: { caseNumber }, select: CALL_FIELDS })
    if (call) await upsertCallReferral(call)
  } catch (error) {
    console.error('Failed to sync referral from call record:', caseNumber, error)
  }
}

let backfillPromise: Promise<void> | null = null

async function backfillCallReferrals() {
  await ensureReferralTables()
  const synced = await prisma.call_centre_referrals.findMany({
    where: { source: 'CALL', caseNumber: { not: null } },
    select: { caseNumber: true }
  })
  const done = new Set(synced.map((row) => row.caseNumber))

  const calls = await prisma.call_records.findMany({
    where: { referral: { not: null } },
    select: CALL_FIELDS,
    orderBy: { createdAt: 'asc' }
  })

  for (const call of calls) {
    if (done.has(call.caseNumber) || !referralTarget(call.referral)) continue
    await upsertCallReferral(call)
  }
}

export function backfillCallReferralsOnce() {
  if (!backfillPromise) {
    backfillPromise = backfillCallReferrals().catch((error) => {
      backfillPromise = null
      console.error('Failed to backfill referrals from call records:', error)
    })
  }
  return backfillPromise
}
