import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageReferralDirectory, ensureReferralTables, parseOrganizationInput } from '@/lib/call-centre/referral-store'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canManageReferralDirectory(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await ensureReferralTables()
    const { id } = await params
    const existing = await prisma.referral_organizations.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))

    if (Object.keys(body).length === 1 && typeof body.isActive === 'boolean') {
      const organization = await prisma.referral_organizations.update({
        where: { id },
        data: { isActive: body.isActive, updatedAt: new Date() }
      })
      return NextResponse.json({ success: true, organization })
    }

    const { errors, data } = parseOrganizationInput(body)
    if (!errors.name) {
      const duplicate = await prisma.referral_organizations.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' }, NOT: { id } },
        select: { id: true }
      })
      if (duplicate) errors.name = 'Another organisation already uses this name'
    }
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Please correct the highlighted fields', errors }, { status: 400 })
    }

    const organization = await prisma.referral_organizations.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    })
    return NextResponse.json({ success: true, organization })
  } catch (error) {
    console.error('Error updating referral organisation:', error)
    return NextResponse.json({ error: 'Failed to update organisation' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canManageReferralDirectory(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await ensureReferralTables()
    const { id } = await params
    const existing = await prisma.referral_organizations.findUnique({
      where: { id },
      include: { _count: { select: { referrals: true } } }
    })
    if (!existing) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })

    if (existing._count.referrals > 0) {
      await prisma.referral_organizations.update({
        where: { id },
        data: { isActive: false, updatedAt: new Date() }
      })
      return NextResponse.json({
        success: true,
        deactivated: true,
        message: 'This organisation has referrals on record, so it was hidden from the directory instead of deleted.'
      })
    }

    await prisma.referral_organizations.delete({ where: { id } })
    return NextResponse.json({ success: true, deleted: true })
  } catch (error) {
    console.error('Error deleting referral organisation:', error)
    return NextResponse.json({ error: 'Failed to delete organisation' }, { status: 500 })
  }
}
