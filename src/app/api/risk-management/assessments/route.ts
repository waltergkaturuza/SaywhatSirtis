import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { riskVisibilityOrFilter } from '@/lib/risk-management/session-risk-access'
import type { RiskImpact, RiskProbability } from '@prisma/client'

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

function canCreateAssessment(session: {
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

/** List assessments for risks the user is allowed to see */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500)

    const vis = riskVisibilityOrFilter(session)
    const riskFilter = vis ? { risks: { AND: [vis] } } : {}

    const rows = await prisma.risk_assessments.findMany({
      where: riskFilter,
      take: limit,
      orderBy: { assessmentDate: 'desc' },
      include: {
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
      },
    })

    const assessments = rows.map((a) => ({
      id: a.id,
      riskId: a.risks.riskId,
      assessorId: a.assessorId ?? '',
      assessmentDate: a.assessmentDate.toISOString(),
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
    }))

    return NextResponse.json({ success: true, data: { assessments } })
  } catch (error) {
    console.error('Error fetching risk assessments:', error)
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canCreateAssessment(session)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      riskId,
      probability,
      impact,
      findings,
      recommendations,
      nextAssessmentDate,
    } = body as {
      riskId?: string
      probability?: string
      impact?: string
      findings?: string
      recommendations?: string
      nextAssessmentDate?: string | null
    }

    if (!riskId || !findings?.trim() || !recommendations?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const vis = riskVisibilityOrFilter(session)
    const risk = await prisma.risks.findFirst({
      where: {
        AND: [{ id: riskId }, ...(vis ? [vis] : [])],
      },
    })

    if (!risk) {
      return NextResponse.json({ error: 'Risk not found or access denied' }, { status: 404 })
    }

    const newProbability = normalizeRiskProbability(probability || 'MEDIUM')
    const newImpact = normalizeRiskImpact(impact || 'MEDIUM')
    const newRiskScore = calculateRiskScore(newProbability, newImpact)

    let nextDate: Date | null = null
    if (nextAssessmentDate && String(nextAssessmentDate).trim() !== '') {
      const d = new Date(nextAssessmentDate)
      if (!Number.isNaN(d.getTime())) nextDate = d
    }

    const created = await prisma.$transaction(async (tx) => {
      const assessment = await tx.risk_assessments.create({
        data: {
          id: crypto.randomUUID(),
          riskId: risk.id,
          assessorId: session.user!.id,
          previousProbability: risk.probability,
          previousImpact: risk.impact,
          newProbability,
          newImpact,
          newRiskScore,
          reasoning: findings.trim(),
          recommendations: recommendations.trim(),
          status: 'COMPLETED',
          nextAssessmentDate: nextDate,
          updatedAt: new Date(),
        },
        include: {
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
        },
      })

      await tx.risks.update({
        where: { id: risk.id },
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
          riskId: risk.id,
          action: 'ASSESSMENT',
          userId: session.user!.id,
          description: `Risk assessment recorded (score ${newRiskScore})`,
        },
      })

      return assessment
    })

    const a = created
    const assessment = {
      id: a.id,
      riskId: a.risks.riskId,
      assessorId: a.assessorId ?? '',
      assessmentDate: a.assessmentDate.toISOString(),
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

    return NextResponse.json({ success: true, data: { assessment } }, { status: 201 })
  } catch (error) {
    console.error('Error creating risk assessment:', error)
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 })
  }
}
