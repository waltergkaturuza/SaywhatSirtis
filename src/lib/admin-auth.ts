import { Session } from "next-auth"

/**
 * Check if a user has admin access based on roles and permissions
 * This is the standardized way to check admin access across the application
 */
export function hasAdminAccess(session: Session | null | undefined): boolean {
  if (!session?.user) {
    return false
  }

  const userRoles = (session.user.roles as string[]) || []
  const userPermissions = (session.user.permissions as string[]) || []
  
  // Normalize roles to uppercase for consistent comparison
  const normalizedRoles = userRoles.map(r => r.toUpperCase())
  
  // Check for admin permissions
  const hasAdminPermission = 
    userPermissions.includes('admin.access') ||
    userPermissions.includes('full_access')
  
  // Check for admin roles (case-insensitive)
  const hasAdminRole = normalizedRoles.some(role => 
    ['SYSTEM_ADMINISTRATOR', 'SYSTEM ADMINISTRATOR', 'ADMINISTRATOR', 'ADMIN', 'SUPERUSER', 'SUPER_ADMIN'].includes(role)
  )
  
  return hasAdminPermission || hasAdminRole
}

