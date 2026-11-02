const RISK_MANAGER_ROLES = [
  'hr',
  'hr_manager',
  'advance_user_1',
  'advance_user_2',
  'admin',
  'manager',
  'system_administrator',
  'superuser',
  'super_admin',
]

export function canManageRisks(permissions: string[] = [], roles: string[] = []): boolean {
  const normalized = roles.map((role) => String(role).toLowerCase())
  return (
    permissions.includes('risk.create') ||
    permissions.includes('risk.edit') ||
    permissions.includes('risk.update') ||
    permissions.includes('risk.delete') ||
    permissions.includes('admin.access') ||
    permissions.includes('risk.full_access') ||
    permissions.includes('risks_edit') ||
    permissions.includes('risks.edit') ||
    normalized.some((role) => RISK_MANAGER_ROLES.includes(role))
  )
}

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
      [
        'hr',
        'hr_manager',
        'advance_user_1',
        'advance_user_2',
        'admin',
        'manager',
        'system_administrator',
        'superuser',
        'super_admin'
      ].includes(role)
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
