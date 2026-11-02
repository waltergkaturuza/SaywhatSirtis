import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageRisks } from '@/lib/risk-management/session-risk-access'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = session.user as { permissions?: string[]; roles?: string[] }
    if (!canManageRisks(user.permissions || [], user.roles || [])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const existing = await prisma.risk_audit_logs.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Audit log not found' }, { status: 404 })
    }

    await prisma.risk_audit_logs.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting audit log:', error)
    return NextResponse.json({ error: 'Failed to delete audit log' }, { status: 500 })
  }
}
