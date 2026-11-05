import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canUseCallCentre, ensureReferralTables } from '@/lib/call-centre/referral-store'

const URGENCY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const text = (value: unknown, max = 2000) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

function referralNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `REF-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canUseCallCentre(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await ensureReferralTables()
    const caseNumber = new URL(request.url).searchParams.get('caseNumber')

    const referrals = await prisma.call_centre_referrals.findMany({
      where: caseNumber ? { caseNumber } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { organization: { select: { id: true, name: true } } }
    })

    return NextResponse.json({
      success: true,
      referrals: referrals.map((referral) => ({
        id: referral.id,
        referralNumber: referral.referralNumber,
        organizationId: referral.organizationId,
        organizationName: referral.organization?.name || '',
        caseNumber: referral.caseNumber,
        clientName: referral.clientName,
        clientPhone: referral.clientPhone,
        reason: referral.reason,
        urgency: referral.urgency,
        status: referral.status,
        followUpDate: referral.followUpDate?.toISOString() || null,
        createdByName: referral.createdByName,
        createdAt: referral.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canUseCallCentre(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await ensureReferralTables()
    const body = await request.json().catch(() => ({}))

    const organizationId = text(body.organizationId, 200)
    const clientName = text(body.clientName, 200)
    const reason = text(body.reason)
    const consentGiven = body.consentGiven === true
    const errors: Record<string, string> = {}

    if (!organizationId) errors.organizationId = 'Choose the organisation to refer to'
    if (!clientName) errors.clientName = 'Enter the client name'
    if (!reason) errors.reason = 'Describe the reason for the referral'
    if (!consentGiven) errors.consentGiven = 'Confirm the client agreed to be referred'

    const organization = organizationId
      ? await prisma.referral_organizations.findFirst({ where: { id: organizationId, isActive: true }, select: { id: true, name: true } })
      : null
    if (organizationId && !organization) errors.organizationId = 'That organisation is no longer in the directory'

    const caseNumber = text(body.caseNumber, 100)
    if (caseNumber) {
      const linkedCase = await prisma.call_records.findUnique({ where: { caseNumber }, select: { id: true } })
      if (!linkedCase) errors.caseNumber = 'No call-centre case has that number'
    }

    const followUpRaw = text(body.followUpDate, 40)
    const followUpDate = followUpRaw ? new Date(followUpRaw) : null
    if (followUpDate && Number.isNaN(followUpDate.getTime())) errors.followUpDate = 'Enter a valid follow-up date'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Please complete the highlighted fields', errors }, { status: 400 })
    }

    const urgencyInput = typeof body.urgency === 'string' ? body.urgency.toUpperCase() : 'MEDIUM'
    const user = session.user as { id?: string; name?: string | null; email?: string | null }
    const now = new Date()

    const referral = await prisma.call_centre_referrals.create({
      data: {
        id: crypto.randomUUID(),
        referralNumber: referralNumber(),
        organizationId: organization!.id,
        caseNumber,
        clientName: clientName!,
        clientPhone: text(body.clientPhone, 50),
        clientAge: text(body.clientAge, 20),
        clientGender: text(body.clientGender, 30),
        clientProvince: text(body.clientProvince, 80),
        reason: reason!,
        servicesRequested: text(body.servicesRequested),
        urgency: URGENCY.includes(urgencyInput) ? urgencyInput : 'MEDIUM',
        consentGiven,
        followUpDate,
        notes: text(body.notes),
        status: 'PENDING',
        createdById: user.id || null,
        createdByName: user.name || user.email || null,
        createdAt: now,
        updatedAt: now
      }
    })

    return NextResponse.json({
      success: true,
      referral: {
        id: referral.id,
        referralNumber: referral.referralNumber,
        organizationName: organization!.name
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating referral:', error)
    return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 })
  }
}
