import type { Prisma } from '@prisma/client'

type SessionLike = {
  user?: {
    id?: string
    department?: string | null
    permissions?: string[]
    roles?: string[]
  }
} | null

/** Broad “see all risks” check (used by reports / uploads). Includes `risk.create`. */
export function userCanSeeAllRisks(session: unknown): boolean {
  if (!session || typeof session !== 'object') return false
  const user = (session as SessionLike)?.user
  if (!user) return false
  const userPermissions = user.permissions || []
  const userRoles = (user.roles || []).map((r) => String(r).toLowerCase())
  return (
    userPermissions.includes('admin.access') ||
    userPermissions.includes('risk.full_access') ||
    userPermissions.includes('risk.create') ||
    userPermissions.includes('risks_edit') ||
    userPermissions.includes('risks.edit') ||
    userRoles.some((role) =>
      ['hr', 'advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role)
    )
  )
}

/**
 * When non-null, restricts queries on related `risks` to rows the user may see.
 * Mirrors visibility rules in `GET /api/risk-management/risks`.
 */
export function riskVisibilityOrFilter(session: unknown): Prisma.risksWhereInput | null {
  const user = (session as SessionLike)?.user
  if (!user) {
    return { id: '__no_session__' }
  }

  const userPermissions = user.permissions || []
  const userRoles = user.roles || []

  if (
    userPermissions.includes('admin.access') ||
    userPermissions.includes('risk.full_access') ||
    userPermissions.includes('risks_edit') ||
    userPermissions.includes('risks.edit') ||
    userRoles.some((role) =>
      ['hr', 'advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase())
    )
  ) {
    return null
  }

  const or: Prisma.risksWhereInput[] = []
  if (user.department) {
    or.push({ department: user.department })
  }
  if (user.id) {
    or.push({ ownerId: user.id })
    or.push({ createdById: user.id })
  }

  if (or.length === 0) {
    return { id: '__no_risk_access__' }
  }

  return { OR: or }
}
