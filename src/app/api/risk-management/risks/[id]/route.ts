import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canManageRisks } from '@/lib/risk-management/session-risk-access'

type RiskProbability = 'LOW' | 'MEDIUM' | 'HIGH'
type RiskImpact = 'LOW' | 'MEDIUM' | 'HIGH'

function normalizeRiskProbability(value: string): RiskProbability {
  const v = String(value || '').toUpperCase()
  if (v === 'VERY_LOW' || v === 'LOW') return 'LOW'
  if (v === 'HIGH' || v === 'VERY_HIGH') return 'HIGH'
  return 'MEDIUM'
}

function normalizeRiskImpact(value: string): RiskImpact {
  const v = String(value || '').toUpperCase()
  if (v === 'VERY_LOW' || v === 'LOW') return 'LOW'
  if (v === 'HIGH' || v === 'VERY_HIGH') return 'HIGH'
  return 'MEDIUM'
}

function calculateRiskScore(probability: RiskProbability, impact: RiskImpact): number {
  const score = { LOW: 1, MEDIUM: 2, HIGH: 3 }
  return score[probability] * score[impact]
}

type RiskStatus = 'OPEN' | 'MITIGATED' | 'ESCALATED' | 'CLOSED'

function normalizeRiskStatus(value: unknown): RiskStatus {
  const v = String(value || '').toUpperCase()
  if (v === 'MITIGATED') return 'MITIGATED'
  if (v === 'ESCALATED' || v === 'UNDER_REVIEW' || v === 'TRANSFERRED') return 'ESCALATED'
  if (v === 'CLOSED' || v === 'ACCEPTED') return 'CLOSED'
  return 'OPEN'
}

const mitigationInclude = {
  include: {
    users_risk_mitigations_ownerIdTousers: {
      select: { id: true, firstName: true, lastName: true, email: true }
    }
  }
}

function presentMitigation(mitigation: any) {
  const owner = mitigation.users_risk_mitigations_ownerIdTousers || null
  return {
    ...mitigation,
    title: mitigation.title || mitigation.strategy || 'Mitigation',
    description: mitigation.description || mitigation.controlMeasure || mitigation.notes || '',
    implementationProgress: mitigation.implementationProgress ?? 0,
    assignedTo: owner
  }
}

function presentRisk(risk: any) {
  return {
    ...risk,
    owner: risk.users_risks_ownerIdTousers || null,
    createdBy: risk.users_risks_createdByIdTousers || null,
    mitigations: (risk.risk_mitigations || []).map(presentMitigation),
    assignedToId: risk.ownerId || null,
    _count: risk._count
      ? {
          mitigations: risk._count.risk_mitigations,
          assessments: risk._count.risk_assessments,
          documents: risk._count.risk_documents
        }
      : undefined
  }
}

// GET /api/risk-management/risks/[id] - Get single risk
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const risk = await prisma.risks.findUnique({
      where: { id },
      include: {
        users_risks_ownerIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        users_risks_createdByIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        risk_mitigations: mitigationInclude,
        risk_assessments: true,
        _count: {
          select: {
            risk_mitigations: true,
            risk_assessments: true,
            risk_documents: true
          }
        }
      }
    })

    if (!risk) {
      return Response.json({ error: 'Risk not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: { risk: presentRisk(risk) }
    })

  } catch (error) {
    console.error('Error fetching risk:', error)
    return Response.json(
      { error: 'Failed to fetch risk' },
      { status: 500 }
    )
  }
}

// PUT /api/risk-management/risks/[id] - Update risk
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userPermissions = session.user.permissions || [];
    const userRoles = session.user.roles || [];
    if (!canManageRisks(userPermissions, userRoles)) {
      return Response.json({ error: 'Insufficient permissions to edit risks' }, { status: 403 });
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      department,
      probability,
      impact,
      status,
      ownerId,
      assignedToId,
      tags
    } = body

    const existing = await prisma.risks.findUnique({ where: { id } })
    if (!existing) {
      return Response.json({ error: 'Risk not found' }, { status: 404 })
    }

    const probabilityProvided = probability !== undefined && probability !== ''
    const impactProvided = impact !== undefined && impact !== ''
    const probabilityDb = probabilityProvided ? normalizeRiskProbability(probability) : existing.probability
    const impactDb = impactProvided ? normalizeRiskImpact(impact) : existing.impact
    const ownerProvided = ownerId !== undefined || assignedToId !== undefined
    const nextOwnerId = ownerId || assignedToId || null

    const risk = await prisma.risks.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(department !== undefined ? { department: department || null } : {}),
        ...(probabilityProvided || impactProvided
          ? {
              probability: probabilityDb,
              impact: impactDb,
              riskScore: calculateRiskScore(probabilityDb, impactDb)
            }
          : {}),
        ...(status !== undefined ? { status: normalizeRiskStatus(status) } : {}),
        ...(ownerProvided ? { ownerId: nextOwnerId } : {}),
        ...(tags !== undefined ? { tags: tags || [] } : {}),
        updatedAt: new Date()
      },
      include: {
        users_risks_ownerIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        users_risks_createdByIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        risk_mitigations: mitigationInclude,
        _count: {
          select: {
            risk_mitigations: true,
            risk_assessments: true,
            risk_documents: true
          }
        }
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

    return Response.json({
      success: true,
      data: { risk: presentRisk(risk) }
    })

  } catch (error) {
    console.error('Error updating risk:', error)
    return Response.json(
      { error: 'Failed to update risk' },
      { status: 500 }
    )
  }
}

// DELETE /api/risk-management/risks/[id] - Delete risk
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userPermissions = session.user.permissions || [];
    const userRoles = session.user.roles || [];
    if (!canManageRisks(userPermissions, userRoles)) {
      return Response.json({ error: 'Insufficient permissions to delete risks' }, { status: 403 });
    }

    // Check if risk exists
    const existingRisk = await prisma.risks.findUnique({
      where: { id },
      include: {
        risk_mitigations: true,
        risk_assessments: true
      }
    })

    if (!existingRisk) {
      return Response.json({ error: 'Risk not found' }, { status: 404 })
    }

    // Delete related records first (cascade delete)
    await prisma.$transaction([
      // Delete risk assessments
      prisma.risk_assessments.deleteMany({
        where: { riskId: id }
      }),
      // Delete risk mitigations
      prisma.risk_mitigations.deleteMany({
        where: { riskId: id }
      }),
      // Delete the risk itself
      prisma.risks.delete({
        where: { id }
      })
    ])

    return Response.json({
      success: true,
      message: 'Risk deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting risk:', error)
    return Response.json(
      { error: 'Failed to delete risk' },
      { status: 500 }
    )
  }
}
