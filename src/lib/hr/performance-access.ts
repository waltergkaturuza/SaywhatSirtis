const VIEW_ALL_ROLES = new Set(['SYSTEM_ADMINISTRATOR', 'HR'])

type AccessUser = {
  id?: string | null
  role?: string | null
  roles?: string[] | null
}

type AccessSession = {
  user?: {
    roles?: string[] | null
    permissions?: string[] | null
  } | null
} | null

function normalizeRole(role: string): string {
  const upper = role.trim().toUpperCase().replace(/[-\s]+/g, '_')
  const aliases: Record<string, string> = {
    SUPERUSER: 'SYSTEM_ADMINISTRATOR',
    SUPER_ADMIN: 'SYSTEM_ADMINISTRATOR',
    ADMIN: 'SYSTEM_ADMINISTRATOR',
    ADMINISTRATOR: 'SYSTEM_ADMINISTRATOR',
    SYS_ADMIN: 'SYSTEM_ADMINISTRATOR',
    SYSTEM_ADMIN: 'SYSTEM_ADMINISTRATOR',
    HR_MANAGER: 'HR',
    HR_OFFICER: 'HR',
    HUMAN_RESOURCES: 'HR'
  }
  return aliases[upper] || upper
}

export function canViewAllPerformance(user: AccessUser, session?: AccessSession): boolean {
  const roles = [
    user.role,
    ...(user.roles || []),
    ...(session?.user?.roles || [])
  ].filter((role): role is string => Boolean(role))

  const permissions = session?.user?.permissions || []
  if (
    permissions.includes('hr.full_access') ||
    permissions.includes('hr.view_all_performance')
  ) {
    return true
  }

  return roles.some((role) => VIEW_ALL_ROLES.has(normalizeRole(role)))
}

export function planListStatusFilter(statusParam: string | null) {
  if (!statusParam || statusParam === 'all') return null

  const statuses = new Set<string>()
  const workflows = new Set<string>()

  for (const raw of statusParam.split(',')) {
    const token = raw.trim().toLowerCase()
    if (!token) continue
    const normalized = token.replace(/-/g, '_')

    if (token === 'draft') {
      statuses.add('draft')
      workflows.add('draft')
    } else if (token === 'pending' || normalized === 'supervisor_review') {
      workflows.add('submitted')
      workflows.add('supervisor_review')
    } else if (normalized === 'reviewer_review' || normalized === 'reviewer_assessment') {
      workflows.add('reviewer_assessment')
    } else if (normalized === 'supervisor_approved') {
      statuses.add('supervisor_approved')
      workflows.add('supervisor_approved')
    } else if (normalized === 'reviewer_approved' || normalized === 'approved') {
      statuses.add('approved')
      workflows.add('approved')
    } else if (normalized === 'completed') {
      statuses.add('completed')
      workflows.add('completed')
      workflows.add('approved')
    } else {
      statuses.add(normalized)
      workflows.add(normalized)
    }
  }

  const clauses = []
  if (statuses.size > 0) clauses.push({ status: { in: [...statuses] } })
  if (workflows.size > 0) clauses.push({ workflowStatus: { in: [...workflows] } })
  if (clauses.length === 0) return null
  return clauses.length === 1 ? clauses[0] : { OR: clauses }
}

export function planMatchesListStatus(
  plan: { status?: string | null; workflowStatus?: string | null },
  statusParam: string | null
) {
  const filter = planListStatusFilter(statusParam) as
    | { OR?: Array<{ status?: { in: string[] }; workflowStatus?: { in: string[] } }> }
    | { status?: { in: string[] }; workflowStatus?: { in: string[] } }
    | null
  if (!filter) return true
  const clauses = 'OR' in filter && filter.OR ? filter.OR : [filter as { status?: { in: string[] }; workflowStatus?: { in: string[] } }]
  return clauses.some((clause) => {
    if (clause.status?.in) return clause.status.in.includes(plan.status || '')
    if (clause.workflowStatus?.in) return clause.workflowStatus.in.includes(plan.workflowStatus || '')
    return false
  })
}

export function activityProgress(
  responsibilities: Array<{ performance_activities?: Array<{ status?: string | null }> }> | null | undefined
) {
  const activities = (responsibilities || []).flatMap((item) => item.performance_activities || [])
  if (activities.length === 0) return 0
  const completed = activities.filter((activity) => String(activity.status || '').toLowerCase() === 'completed').length
  return Math.round((completed / activities.length) * 100)
}
