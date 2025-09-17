import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole, ROLE_DEFINITIONS, getRoleDisplayName } from '@/types/roles'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has HR permissions
    const userRoles = (session.user.roles as string[]) || []
    const hasPermission = userRoles.includes('SUPERUSER') || 
                         userRoles.includes('SYSTEM_ADMINISTRATOR') || 
                         userRoles.includes('HR') ||
                         session.user?.permissions?.includes('hr.read') ||
                         session.user?.permissions?.includes('hr.full_access')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all available roles with their permissions and access levels
    const roles = Object.values(UserRole).map(role => {
      const permissions = ROLE_DEFINITIONS[role]
      
      return {
        id: role,
        name: getRoleDisplayName(role),
        value: role,
        permissions: {
          callCenter: permissions.callCenter,
          programs: permissions.programs,
          hr: permissions.hr,
          documents: permissions.documents,
          inventory: permissions.inventory,
          risks: permissions.risks,
          dashboard: permissions.dashboard,
          personalProfile: permissions.personalProfile
        },
        documentLevel: permissions.documentLevel,
        canViewOthersProfiles: permissions.canViewOthersProfiles,
        canManageUsers: permissions.canManageUsers,
        fullAccess: permissions.fullAccess,
        description: getRoleDescription(role)
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        roles,
        total: roles.length
      }
    })

  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

// Helper function to get role descriptions
function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    [UserRole.SUPERUSER]: 'Ultimate system control, all permissions, user management, all modules and security levels',
    [UserRole.BASIC_USER_1]: 'Call Center access (view), personal profile management, document viewing (up to CONFIDENTIAL)',
    [UserRole.BASIC_USER_2]: 'Programs viewing, inventory access, personal profile management, document viewing (up to CONFIDENTIAL)', 
    [UserRole.ADVANCE_USER_1]: 'Full call center access, programs and document editing (up to SECRET), risk management',
    [UserRole.ADVANCE_USER_2]: 'Full programs access, document editing (up to SECRET), limited call center access',
    [UserRole.HR]: 'HR module access, view other profiles, document management (up to TOP SECRET)',
    [UserRole.SYSTEM_ADMINISTRATOR]: 'Full system access, user management, all modules and security levels'
  }
  
  return descriptions[role] || 'Standard user access'
}