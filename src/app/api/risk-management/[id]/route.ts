import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageRisks } from '@/lib/risk-management/session-risk-access'

type RiskProbability = 'LOW' | 'MEDIUM' | 'HIGH'
type RiskImpact = 'LOW' | 'MEDIUM' | 'HIGH'
type RiskStatus = 'OPEN' | 'MITIGATED' | 'ESCALATED' | 'CLOSED'

function normalizeLevel(value: string): RiskProbability {
  const v = String(value || '').toUpperCase()
  if (v === 'VERY_LOW' || v === 'LOW') return 'LOW'
  if (v === 'HIGH' || v === 'VERY_HIGH') return 'HIGH'
  return 'MEDIUM'
}

function normalizeStatus(value: unknown): RiskStatus {
  const v = String(value || '').toUpperCase()
  if (v === 'MITIGATED') return 'MITIGATED'
  if (v === 'ESCALATED' || v === 'UNDER_REVIEW' || v === 'TRANSFERRED') return 'ESCALATED'
  if (v === 'CLOSED' || v === 'ACCEPTED') return 'CLOSED'
  return 'OPEN'
}

function score(probability: RiskProbability, impact: RiskImpact) {
  const values = { LOW: 1, MEDIUM: 2, HIGH: 3 }
  return values[probability] * values[impact]
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
      return NextResponse.json({ error: 'Insufficient permissions to update risks.' }, { status: 403 })
    }

    const existing = await prisma.risks.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 })
    }

    const body = await request.json()
    const probability = body.probability !== undefined ? normalizeLevel(body.probability) : existing.probability
    const impact = body.impact !== undefined ? normalizeLevel(body.impact) : existing.impact
    const risk = await prisma.risks.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
        ...(body.department !== undefined ? { department: body.department || null } : {}),
        ...(body.probability !== undefined || body.impact !== undefined
          ? { probability, impact, riskScore: score(probability, impact) }
          : {}),
        ...(body.status !== undefined ? { status: normalizeStatus(body.status) } : {}),
        ...(body.ownerId !== undefined || body.assignedToId !== undefined
          ? { ownerId: body.ownerId || body.assignedToId || null }
          : {}),
        updatedAt: new Date()
      }
    })

    await prisma.risk_audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        riskId: risk.id,
        action: 'UPDATE',
        userId: session.user.id,
        description: `Risk "${risk.title}" updated`
      }
    })

    return NextResponse.json({ success: true, data: { risk } })
  } catch (error) {
    console.error('Risk update error:', error)
    return NextResponse.json({ error: 'Failed to update risk' }, { status: 500 })
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
      return NextResponse.json({ error: 'Insufficient permissions to delete risks.' }, { status: 403 })
    }

    const existing = await prisma.risks.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.risk_assessments.deleteMany({ where: { riskId: id } }),
      prisma.risk_mitigations.deleteMany({ where: { riskId: id } }),
      prisma.risks.delete({ where: { id } })
    ])

    return NextResponse.json({ success: true, message: 'Risk deleted successfully', riskId: id })
  } catch (error) {
    console.error('Risk deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete risk' }, { status: 500 })
  }
}
