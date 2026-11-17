export function accessConfigForRole(role: string) {
  const roleMap: Record<string, { accessLevel: string; documentLevel: string }> = {
    BASIC_USER_1: { accessLevel: 'BASIC', documentLevel: 'CONFIDENTIAL' },
    BASIC_USER_2: { accessLevel: 'BASIC', documentLevel: 'CONFIDENTIAL' },
    ADVANCE_USER_1: { accessLevel: 'ADVANCED', documentLevel: 'SECRET' },
    ADVANCE_USER_2: { accessLevel: 'ADVANCED', documentLevel: 'SECRET' },
    HR: { accessLevel: 'FULL', documentLevel: 'TOP_SECRET' },
    SUPERUSER: { accessLevel: 'FULL', documentLevel: 'TOP_SECRET' },
    SYSTEM_ADMINISTRATOR: { accessLevel: 'FULL', documentLevel: 'TOP_SECRET' },
  }
  return roleMap[role] || { accessLevel: 'BASIC', documentLevel: 'PUBLIC' }
}

export function loginAccountStatus(employee: {
  userId?: string | null
  users?: { isActive?: boolean | null; passwordHash?: string | null } | null
}) {
  if (!employee.userId || !employee.users?.passwordHash) return 'PENDING_ACCOUNT'
  if (employee.users.isActive === false) return 'DISABLED'
  return 'ACTIVE'
}

export function roleLabel(role?: string | null) {
  if (!role) return 'Not set'
  return role.replace(/_/g, ' ')
}
