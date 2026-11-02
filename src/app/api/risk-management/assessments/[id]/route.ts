import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageRisks } from '@/lib/risk-management/session-risk-access'

function score(probability: 'LOW' | 'MEDIUM' | 'HIGH', impact: 'LOW' | 'MEDIUM' | 'HIGH') {
  const values = { LOW: 1, MEDIUM: 2, HIGH: 3 }
  return values[probability] * values[impact]
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = session.user as { permissions?: string[]; roles?: string[] }
    if (!canManageRisks(user.permissions || [], user.roles || [])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const assessment = await prisma.risk_assessments.findUnique({ where: { id } })
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      if (assessment.previousProbability && assessment.previousImpact) {
        await tx.risks.update({
          where: { id: assessment.riskId },
          data: {
            probability: assessment.previousProbability,
            impact: assessment.previousImpact,
            riskScore: score(assessment.previousProbability, assessment.previousImpact),
            updatedAt: new Date(),
          },
        })
      }
      await tx.risk_assessments.delete({ where: { id } })
      await tx.risk_audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          riskId: assessment.riskId,
          action: 'ASSESSMENT',
          userId: session.user!.id,
          description: 'Risk assessment deleted',
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting risk assessment:', error)
    return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 })
  }
}
