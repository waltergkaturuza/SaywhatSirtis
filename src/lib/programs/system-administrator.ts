import { hasSystemAdministratorRole } from "@/lib/role-names"

/**
 * Matches auth.ts: roles that normalize to SYSTEM_ADMINISTRATOR (ADMIN, SUPERUSER, etc.)
 * plus legacy bootstrap admin email.
 */
export function isProgramsSystemAdministrator(user: {
  email?: string | null
  roles?: string[] | null | undefined
}): boolean {
  const email = (user.email || "").toLowerCase().trim()
  if (email === "admin@saywhat.org") return true
  return hasSystemAdministratorRole(user.roles ?? undefined)
}
