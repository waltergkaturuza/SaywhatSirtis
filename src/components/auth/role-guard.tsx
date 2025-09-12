'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
  requireAll?: boolean
  minHierarchy?: number
}

// Role hierarchy for access control
const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 7,
  ADMIN: 6,
  HR_MANAGER: 5,
  PROJECT_MANAGER: 4,
  CALL_CENTRE_AGENT: 3,
  EMPLOYEE: 2,
  USER: 1
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null, 
  requireAll = false,
  minHierarchy
}: RoleGuardProps) {
  const { data: session } = useSession()
  
  if (!session?.user) {
    return <>{fallback}</>
  }

  const userRoles = session.user.roles as string[] || []
  const primaryRole = userRoles[0] || 'USER'
  const userHierarchy = ROLE_HIERARCHY[primaryRole] || 0

  // Check minimum hierarchy level
  if (minHierarchy && userHierarchy < minHierarchy) {
    return <>{fallback}</>
  }

  // Check specific roles
  if (allowedRoles.length > 0) {
    const hasAccess = requireAll
      ? allowedRoles.every(role => userRoles.includes(role))
      : allowedRoles.some(role => {
          const requiredHierarchy = ROLE_HIERARCHY[role] || 0
          return userHierarchy >= requiredHierarchy || userRoles.includes(role)
        })

    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

// Permission-based component wrapper
interface PermissionGuardProps {
  children: ReactNode
  permissions: string[]
  fallback?: ReactNode
  requireAll?: boolean
}

export function PermissionGuard({ 
  children, 
  permissions, 
  fallback = null, 
  requireAll = false 
}: PermissionGuardProps) {
  const { data: session } = useSession()
  
  if (!session?.user) {
    return <>{fallback}</>
  }

  const userPermissions = session.user.permissions as string[] || []
  const userRoles = session.user.roles as string[] || []
  const primaryRole = userRoles[0] || 'USER'

  // Super admin has all permissions
  if (primaryRole === 'SUPER_ADMIN' || userRoles.includes('admin') || userPermissions.includes('*')) {
    return <>{children}</>
  }

  const hasAccess = requireAll
    ? permissions.every(permission => userPermissions.includes(permission))
    : permissions.some(permission => userPermissions.includes(permission))

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Smart role-aware UI components
interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function HROnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function ManagerOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGuard 
      allowedRoles={['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER']} 
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  )
}

// Hook for checking roles and permissions
export function useRoleAccess() {
  const { data: session } = useSession()
  
  const hasRole = (roles: string | string[]) => {
    if (!session?.user?.roles) return false
    
    const userRoles = session.user.roles as string[] || []
    const primaryRole = userRoles[0] || 'USER'
    const userHierarchy = ROLE_HIERARCHY[primaryRole] || 0
    const roleArray = Array.isArray(roles) ? roles : [roles]
    
    return roleArray.some(role => {
      const requiredHierarchy = ROLE_HIERARCHY[role] || 0
      return userHierarchy >= requiredHierarchy || userRoles.includes(role.toLowerCase())
    })
  }

  const hasPermission = (permissions: string | string[]) => {
    if (!session?.user) return false
    
    const userRoles = session.user.roles as string[] || []
    const primaryRole = userRoles[0] || 'USER'
    const userPermissions = session.user.permissions as string[] || []
    
    // Super admin or admin role has all permissions
    if (primaryRole === 'SUPER_ADMIN' || userRoles.includes('admin') || userPermissions.includes('*')) {
      return true
    }
    
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
    return permissionArray.some(permission => userPermissions.includes(permission))
  }

  const isAdmin = () => hasRole(['SUPER_ADMIN', 'ADMIN']) || (session?.user?.roles as string[] || []).includes('admin')
  const isHR = () => hasRole(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'])
  const isManager = () => hasRole(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'])
  
  const userRoles = session?.user?.roles as string[] || []
  const primaryRole = userRoles[0] || 'USER'
  
  return {
    hasRole,
    hasPermission,
    isAdmin,
    isHR,
    isManager,
    userRole: primaryRole,
    userRoles,
    userHierarchy: ROLE_HIERARCHY[primaryRole] || 0
  }
}

// Navigation item with role-based visibility
interface RoleBasedNavItemProps {
  children: ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
  minHierarchy?: number
}

export function RoleBasedNavItem({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  minHierarchy 
}: RoleBasedNavItemProps) {
  const { hasRole, hasPermission } = useRoleAccess()
  
  // Check role access
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return null
  }
  
  // Check permission access
  if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
    return null
  }
  
  // Check hierarchy
  if (minHierarchy) {
    const { userHierarchy } = useRoleAccess()
    if (userHierarchy < minHierarchy) {
      return null
    }
  }
  
  return <>{children}</>
}
