import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageRisks } from '@/lib/risk-management/session-risk-access'

const MITIGATION_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] as const

function normalizeStatus(value: unknown) {
  const status = String(value || '').toUpperCase()
  return MITIGATION_STATUSES.includes(status as (typeof MITIGATION_STATUSES)[number])
    ? (status as (typeof MITIGATION_STATUSES)[number])
    : null
}

function parseDate(value: unknown) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    if (!canManageRisks(session.user.permissions || [], session.user.roles || [])) {
      return NextResponse.json({ error: 'Insufficient permissions to update mitigation plans.' }, { status: 403 })
    }

    const body = await request.json()
    const status = body.status !== undefined ? normalizeStatus(body.status) : undefined
    if (body.status !== undefined && !status) {
      return NextResponse.json({ error: 'Invalid mitigation status' }, { status: 400 })
    }

    const now = new Date()
    const plan = await prisma.risk_mitigations.update({
      where: { id },
      data: {
        ...(body.strategy !== undefined || body.title !== undefined
          ? { strategy: String(body.strategy ?? body.title) }
          : {}),
        ...(body.controlMeasure !== undefined || body.description !== undefined
          ? { controlMeasure: body.controlMeasure ?? body.description ?? null }
          : {}),
        ...(status ? { status } : {}),
        ...(body.deadline !== undefined || body.dueDate !== undefined
          ? { deadline: parseDate(body.deadline ?? body.dueDate) }
          : {}),
        ...(body.completedAt !== undefined || body.completedDate !== undefined
          ? { completedAt: parseDate(body.completedAt ?? body.completedDate) }
          : {}),
        ...(body.implementationProgress !== undefined || body.progress !== undefined
          ? { implementationProgress: Number(body.implementationProgress ?? body.progress) || 0 }
          : {}),
        ...(body.ownerId !== undefined || body.assignedToId !== undefined
          ? { ownerId: body.ownerId || body.assignedToId || null }
          : {}),
        ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
        lastUpdated: now,
        updatedAt: now,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mitigation plan updated successfully',
      data: plan
    })
  } catch (error) {
    console.error('Mitigation plan update error:', error)
    return NextResponse.json({ error: 'Failed to update mitigation plan' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    if (!canManageRisks(session.user.permissions || [], session.user.roles || [])) {
      return NextResponse.json({ error: 'Insufficient permissions to delete mitigation plans.' }, { status: 403 })
    }

    const existing = await prisma.risk_mitigations.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Mitigation plan not found' }, { status: 404 })
    }

    await prisma.risk_mitigations.delete({ where: { id } })
    await prisma.risk_audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        riskId: existing.riskId,
        action: 'MITIGATION',
        userId: session.user.id,
        description: `Mitigation removed: ${existing.strategy}`
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mitigation plan deleted successfully',
      planId: id
    })
  } catch (error) {
    console.error('Mitigation plan deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete mitigation plan' }, { status: 500 })
  }
}
