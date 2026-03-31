export function userCanSeeAllRisks(session: { user?: unknown } | null): boolean {
  if (!session?.user) return false
  const u = session.user as {
    permissions?: string[]
    roles?: string[]
  }
  const userPermissions = u.permissions || []
  const userRoles = (u.roles || []).map((r) => String(r).toLowerCase())
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

export function riskVisibilityOrFilter(
  session: { user?: unknown } | null
): Record<string, unknown> | null {
  if (!session?.user || userCanSeeAllRisks(session)) return null
  const u = session.user as {
    id?: string
    department?: string | null
  }
  return {
    OR: [
      { department: u.department },
      { ownerId: u.id },
      { createdById: u.id },
    ],
  }
}
