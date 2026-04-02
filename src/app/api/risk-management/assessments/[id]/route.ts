import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { riskVisibilityOrFilter } from '@/lib/risk-management/session-risk-access'
import type { RiskImpact, RiskProbability } from '@prisma/client'
import type { Prisma } from '@prisma/client'

type RiskProbabilityDb = RiskProbability
type RiskImpactDb = RiskImpact

function calculateRiskScore(probability: RiskProbabilityDb, impact: RiskImpactDb): number {
  const probabilityScore: Record<RiskProbabilityDb, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 }
  const impactScore: Record<RiskImpactDb, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 }
  return probabilityScore[probability] * impactScore[impact]
}

function normalizeRiskProbability(value: string): RiskProbabilityDb {
  const v = String(value).toUpperCase()
  if (v === 'VERY_LOW' || v === 'LOW') return 'LOW'
  if (v === 'HIGH' || v === 'VERY_HIGH') return 'HIGH'
  return 'MEDIUM'
}

function normalizeRiskImpact(value: string): RiskImpactDb {
  const v = String(value).toUpperCase()
  if (v === 'VERY_LOW' || v === 'LOW') return 'LOW'
  if (v === 'HIGH' || v === 'VERY_HIGH') return 'HIGH'
  return 'MEDIUM'
}

function canModifyAssessments(session: {
  user?: { permissions?: string[]; roles?: string[] }
}): boolean {
  const userPermissions = session.user?.permissions || []
  const userRoles = session.user?.roles || []
  return (
    userPermissions.includes('risk.create') ||
    userPermissions.includes('admin.access') ||
    userPermissions.includes('risks_edit') ||
    userPermissions.includes('risks.edit') ||
    userPermissions.includes('risk.edit') ||
    userRoles.some((role) =>
      ['hr', 'advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase())
    )
  )
}

const includeAssessment = {
  risks: {
    select: {
      id: true,
      riskId: true,
      title: true,
      category: true,
      status: true,
    },
  },
  users_risk_assessments_assessorIdTousers: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.risk_assessmentsInclude

function mapRow(a: {
  id: string
  riskId: string
  assessmentDate: Date
  assessorId: string | null
  previousProbability: RiskProbability | null
  previousImpact: RiskImpact | null
  newProbability: RiskProbability
  newImpact: RiskImpact
  newRiskScore: number
  reasoning: string | null
  recommendations: string | null
  status: string
  nextAssessmentDate: Date | null
  risks: {
    id: string
    riskId: string
    title: string
    category: string
    status: string
  }
  users_risk_assessments_assessorIdTousers: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
  } | null
}) {
  return {
    id: a.id,
    riskId: a.risks.riskId,
    riskInternalId: a.risks.id,
    assessorId: a.assessorId ?? '',
    assessmentDate: a.assessmentDate.toISOString(),
    previousProbability: a.previousProbability,
    previousImpact: a.previousImpact,
    probability: a.newProbability,
    impact: a.newImpact,
    riskScore: a.newRiskScore,
    findings: a.reasoning ?? '',
    recommendations: a.recommendations ?? '',
    nextAssessmentDate: a.nextAssessmentDate?.toISOString() ?? null,
    status: a.status,
    assessor: {
      firstName: a.users_risk_assessments_assessorIdTousers?.firstName ?? null,
      lastName: a.users_risk_assessments_assessorIdTousers?.lastName ?? null,
      email: a.users_risk_assessments_assessorIdTousers?.email ?? '',
    },
    risk: {
      id: a.risks.id,
      riskId: a.risks.riskId,
      title: a.risks.title,
      category: a.risks.category,
      status: a.risks.status,
    },
  }
}

async function findAssessmentForSession(session: Awaited<ReturnType<typeof getServerSession>>, id: string) {
  const vis = riskVisibilityOrFilter(session)
  return prisma.risk_assessments.findFirst({
    where: {
      id,
      ...(vis ? { risks: { AND: [vis] } } : {}),
    },
    include: includeAssessment,
  })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const row = await findAssessmentForSession(session, id)
    if (!row) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { assessment: mapRow(row) } })
  } catch (error) {
    console.error('Error fetching risk assessment:', error)
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canModifyAssessments(session)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const existing = await findAssessmentForSession(session, id)
    if (!existing) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      probability,
      impact,
      findings,
      recommendations,
      nextAssessmentDate,
      status,
    } = body as {
      probability?: string
      impact?: string
      findings?: string
      recommendations?: string
      nextAssessmentDate?: string | null
      status?: string
    }

    if (!findings?.trim() || !recommendations?.trim()) {
      return NextResponse.json({ error: 'Findings and recommendations are required' }, { status: 400 })
    }

    const newProbability = normalizeRiskProbability(probability || existing.newProbability)
    const newImpact = normalizeRiskImpact(impact || existing.newImpact)
    const newRiskScore = calculateRiskScore(newProbability, newImpact)

    let nextDate: Date | null = existing.nextAssessmentDate
    if (nextAssessmentDate !== undefined) {
      if (nextAssessmentDate === null || String(nextAssessmentDate).trim() === '') {
        nextDate = null
      } else {
        const d = new Date(nextAssessmentDate)
        nextDate = Number.isNaN(d.getTime()) ? existing.nextAssessmentDate : d
      }
    }

    const newStatus =
      status && String(status).trim() ? String(status).trim().toUpperCase() : existing.status

    const updated = await prisma.$transaction(async (tx) => {
      const a = await tx.risk_assessments.update({
        where: { id },
        data: {
          newProbability,
          newImpact,
          newRiskScore,
          reasoning: findings.trim(),
          recommendations: recommendations.trim(),
          nextAssessmentDate: nextDate,
          status: newStatus,
          updatedAt: new Date(),
        },
        include: includeAssessment,
      })

      await tx.risks.update({
        where: { id: existing.riskId },
        data: {
          probability: newProbability,
          impact: newImpact,
          riskScore: newRiskScore,
          lastAssessed: new Date(),
          updatedAt: new Date(),
        },
      })

      await tx.risk_audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          riskId: existing.riskId,
          action: 'ASSESSMENT_UPDATED',
          userId: session.user!.id,
          description: `Risk assessment ${id} updated (score ${newRiskScore})`,
        },
      })

      return a
    })

    return NextResponse.json({ success: true, data: { assessment: mapRow(updated) } })
  } catch (error) {
    console.error('Error updating risk assessment:', error)
    return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canModifyAssessments(session)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const existing = await findAssessmentForSession(session, id)
    if (!existing) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.risk_assessments.delete({ where: { id } })
      await tx.risk_audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          riskId: existing.riskId,
          action: 'ASSESSMENT_DELETED',
          userId: session.user!.id,
          description: `Risk assessment ${id} deleted`,
        },
      })
    })

    return NextResponse.json({ success: true, message: 'Assessment deleted' })
  } catch (error) {
    console.error('Error deleting risk assessment:', error)
    return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 })
  }
}
