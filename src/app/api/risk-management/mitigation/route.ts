import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageRisks } from '@/lib/risk-management/session-risk-access'

const MITIGATION_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] as const

function normalizeStatus(value: unknown) {
  const status = String(value || 'PLANNED').toUpperCase()
  return MITIGATION_STATUSES.includes(status as (typeof MITIGATION_STATUSES)[number])
    ? (status as (typeof MITIGATION_STATUSES)[number])
    : 'PLANNED'
}

function parseDate(value: unknown) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    if (!canManageRisks(session.user.permissions || [], session.user.roles || [])) {
      return NextResponse.json({ error: 'Insufficient permissions to add a mitigation.' }, { status: 403 })
    }

    const body = await request.json()
    const strategy = String(body.strategy || body.title || '').trim()
    if (!body.riskId || !strategy) {
      return NextResponse.json({ error: 'Risk and mitigation strategy are required.' }, { status: 400 })
    }

    const risk = await prisma.risks.findUnique({ where: { id: body.riskId } })
    if (!risk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 })
    }

    const now = new Date()
    const plan = await prisma.risk_mitigations.create({
      data: {
        id: crypto.randomUUID(),
        riskId: risk.id,
        strategy,
        controlMeasure: body.controlMeasure || body.description || null,
        deadline: parseDate(body.deadline || body.dueDate),
        status: normalizeStatus(body.status),
        ownerId: body.ownerId || body.assignedToId || session.user.id,
        notes: body.notes || null,
        lastUpdated: now,
        updatedAt: now,
        createdById: session.user.id,
      },
      include: {
        users_risk_mitigations_ownerIdTousers: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    })

    await prisma.risk_audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        riskId: risk.id,
        action: 'MITIGATION',
        userId: session.user.id,
        description: `Mitigation added: ${strategy}`
      }
    })

    return NextResponse.json({ success: true, data: plan }, { status: 201 })
  } catch (error) {
    console.error('Mitigation create error:', error)
    return NextResponse.json({ error: 'Failed to create mitigation plan' }, { status: 500 })
  }
}
