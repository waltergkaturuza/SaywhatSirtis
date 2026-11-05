import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  canManageReferralDirectory,
  ensureReferralTables,
  organizationIdFromName,
  parseOrganizationInput
} from '@/lib/call-centre/referral-store'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canManageReferralDirectory(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await ensureReferralTables()
    const organizations = await prisma.referral_organizations.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { referrals: true } } }
    })

    return NextResponse.json({
      success: true,
      organizations: organizations.map(({ _count, ...org }) => ({
        ...org,
        referralCount: _count.referrals,
        createdAt: org.createdAt.toISOString(),
        updatedAt: org.updatedAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error listing referral organisations:', error)
    return NextResponse.json({ error: 'Failed to load organisations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canManageReferralDirectory(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await ensureReferralTables()
    const body = await request.json().catch(() => ({}))
    const { errors, data } = parseOrganizationInput(body)

    if (!errors.name) {
      const duplicate = await prisma.referral_organizations.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' } },
        select: { id: true }
      })
      if (duplicate) errors.name = 'An organisation with this name is already in the directory'
    }
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Please correct the highlighted fields', errors }, { status: 400 })
    }

    const now = new Date()
    const organization = await prisma.referral_organizations.create({
      data: { id: organizationIdFromName(data.name), ...data, createdAt: now, updatedAt: now }
    })

    return NextResponse.json({ success: true, organization }, { status: 201 })
  } catch (error) {
    console.error('Error creating referral organisation:', error)
    return NextResponse.json({ error: 'Failed to create organisation' }, { status: 500 })
  }
}
