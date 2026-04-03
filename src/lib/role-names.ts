/**
 * Canonical role normalization — must stay in sync with permission resolution in auth.ts.
 * Session JWT stores raw DB role strings; this maps them to standard names.
 */
export function normalizeRoleName(role: string): string {
  if (!role) return "BASIC_USER_1"
  const upper = role.trim().toUpperCase().replace(/[-\s]+/g, "_")

  const roleMap: Record<string, string> = {
    SUPERUSER: "SYSTEM_ADMINISTRATOR",
    ADMIN: "SYSTEM_ADMINISTRATOR",
    ADMINISTRATOR: "SYSTEM_ADMINISTRATOR",
    SYS_ADMIN: "SYSTEM_ADMINISTRATOR",
    SYSTEM_ADMIN: "SYSTEM_ADMINISTRATOR",
    SYSTEM_ADMINISTRATOR: "SYSTEM_ADMINISTRATOR",
    HR_MANAGER: "HR",
    HR_OFFICER: "HR",
    HUMAN_RESOURCES: "HR",
  }

  return roleMap[upper] || upper
}

/** True when any assigned role resolves to SYSTEM_ADMINISTRATOR (same bar as full admin in auth). */
export function hasSystemAdministratorRole(
  roles: string[] | undefined | null
): boolean {
  const list = roles && roles.length ? roles : []
  return list.some((r) => normalizeRoleName(String(r)) === "SYSTEM_ADMINISTRATOR")
}
