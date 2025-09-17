import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, Department, DEPARTMENT_DEFAULT_ROLES, ROLE_DEFINITIONS, getRoleDisplayName, getDepartmentDisplayName } from '@/types/roles'
import { UserRole as PrismaUserRole } from '@prisma/client'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin or HR permissions
    const userRoles = (session.user.roles as string[]) || []
    if (!userRoles.includes('SYSTEM_ADMINISTRATOR') && !userRoles.includes('HR')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'roles':
        return NextResponse.json({
          success: true,
          data: {
            roles: Object.values(UserRole).map(role => ({
              id: role,
              name: getRoleDisplayName(role),
              description: getRoleDescription(role),
              permissions: ROLE_DEFINITIONS[role],
              userCount: 0 // TODO: Get actual user count from database
            })),
            availableRoles: Object.values(UserRole),
            roleDefinitions: ROLE_DEFINITIONS
          }
        })

      case 'departments':
        return NextResponse.json({
          success: true,
          data: {
            departments: Object.values(Department).map(dept => ({
              id: dept,
              name: getDepartmentDisplayName(dept),
              defaultRole: DEPARTMENT_DEFAULT_ROLES[dept],
              defaultRoleName: getRoleDisplayName(DEPARTMENT_DEFAULT_ROLES[dept])
            }))
          }
        })

      case 'users':
        // Get all users with their roles
        const users = await prisma.users.findMany({
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
            role: true,
            isActive: true,
            createdAt: true,
            lastLogin: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        const transformedUsers = users.map(user => ({
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          email: user.email,
          department: user.department || 'UNASSIGNED',
          currentRole: user.role || 'BASIC_USER_1',
          currentRoleName: getRoleDisplayName(user.role as UserRole || UserRole.BASIC_USER_1),
          suggestedRole: user.department ? DEPARTMENT_DEFAULT_ROLES[user.department as Department] : UserRole.BASIC_USER_1,
          suggestedRoleName: user.department ? getRoleDisplayName(DEPARTMENT_DEFAULT_ROLES[user.department as Department]) : getRoleDisplayName(UserRole.BASIC_USER_1),
          status: user.isActive ? 'active' : 'inactive',
          lastLogin: user.lastLogin?.toISOString(),
          permissions: ROLE_DEFINITIONS[user.role as UserRole || UserRole.BASIC_USER_1]
        }))

        return NextResponse.json({
          success: true,
          data: {
            users: transformedUsers,
            total: users.length
          }
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            roles: Object.values(UserRole),
            departments: Object.values(Department),
            roleDefinitions: ROLE_DEFINITIONS,
            departmentDefaults: DEPARTMENT_DEFAULT_ROLES
          }
        })
    }

  } catch (error) {
    console.error('Error in role management API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch role management data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin permissions
    const userRoles = (session.user.roles as string[]) || []
    if (!userRoles.includes('SYSTEM_ADMINISTRATOR')) {
      return NextResponse.json({ error: 'Only System Administrators can modify roles' }, { status: 403 })
    }

    const body = await request.json()
    const { action, userId, newRole, department } = body

    switch (action) {
      case 'assign_role':
        if (!userId || !newRole) {
          return NextResponse.json({ error: 'User ID and new role are required' }, { status: 400 })
        }

        // Validate role exists
        if (!Object.values(UserRole).includes(newRole as UserRole)) {
          return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 })
        }

        // Update user role
        const updatedUser = await prisma.users.update({
          where: { id: userId },
          data: { role: newRole as PrismaUserRole },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            department: true
          }
        })

        // Log the role change
        await prisma.audit_logs.create({
          data: {
            id: randomUUID(),
            userId: session.user.id,
            action: 'ROLE_ASSIGNED',
            details: `Assigned role ${newRole} to user ${updatedUser.email}`,
            resource: 'User',
            resourceId: userId,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })

        return NextResponse.json({
          success: true,
          message: `Role ${getRoleDisplayName(newRole as UserRole)} assigned successfully`,
          user: {
            ...updatedUser,
            roleName: getRoleDisplayName(newRole as UserRole),
            permissions: ROLE_DEFINITIONS[newRole as UserRole]
          }
        })

      case 'bulk_assign_department_defaults':
        if (!department) {
          return NextResponse.json({ error: 'Department is required' }, { status: 400 })
        }

        const defaultRole = DEPARTMENT_DEFAULT_ROLES[department as Department]
        if (!defaultRole) {
          return NextResponse.json({ error: 'Invalid department specified' }, { status: 400 })
        }

        // Update all users in the department to the default role
        const bulkUpdateResult = await prisma.users.updateMany({
          where: { department: department },
          data: { role: defaultRole as unknown as PrismaUserRole }
        })

        // Log the bulk operation
        await prisma.audit_logs.create({
          data: {
            id: randomUUID(),
            userId: session.user.id,
            action: 'BULK_ROLE_ASSIGNMENT',
            details: `Assigned default role ${defaultRole} to ${bulkUpdateResult.count} users in ${department} department`,
            resource: 'User',
            resourceId: 'bulk',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })

        return NextResponse.json({
          success: true,
          message: `Updated ${bulkUpdateResult.count} users in ${getDepartmentDisplayName(department as Department)} to ${getRoleDisplayName(defaultRole)}`,
          affectedUsers: bulkUpdateResult.count
        })

      case 'reset_user_to_department_default':
        if (!userId) {
          return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Get user's department
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { department: true, email: true }
        })

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const userDepartment = user.department as Department
        const departmentDefaultRole = DEPARTMENT_DEFAULT_ROLES[userDepartment]

        if (!departmentDefaultRole) {
          return NextResponse.json({ error: 'No default role found for user department' }, { status: 400 })
        }

        // Update user to department default role
        const resetUser = await prisma.users.update({
          where: { id: userId },
          data: { role: departmentDefaultRole as unknown as PrismaUserRole },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            department: true
          }
        })

        // Log the reset
        await prisma.audit_logs.create({
          data: {
            id: randomUUID(),
            userId: session.user.id,
            action: 'ROLE_RESET_TO_DEFAULT',
            details: `Reset user ${user.email} to department default role ${departmentDefaultRole}`,
            resource: 'User',
            resourceId: userId,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })

        return NextResponse.json({
          success: true,
          message: `Reset ${user.email} to department default role: ${getRoleDisplayName(departmentDefaultRole)}`,
          user: {
            ...resetUser,
            roleName: getRoleDisplayName(departmentDefaultRole),
            permissions: ROLE_DEFINITIONS[departmentDefaultRole]
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in role management API:', error)
    return NextResponse.json(
      { error: 'Failed to process role management action' },
      { status: 500 }
    )
  }
}

// Helper function to get role descriptions
function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    [UserRole.SUPERUSER]: 'Ultimate system control, all permissions, user management, all modules and security levels',
    [UserRole.BASIC_USER_1]: 'Call Center access, personal profile management, document viewing (up to confidential)',
    [UserRole.BASIC_USER_2]: 'Programs viewing, inventory access, personal profile management, document viewing (up to confidential)', 
    [UserRole.ADVANCE_USER_1]: 'Full call center access, programs and document editing (up to secret), risk management',
    [UserRole.ADVANCE_USER_2]: 'Full programs access, document editing (up to secret), limited call center access',
    [UserRole.HR]: 'HR module access, view other profiles, document management (up to top secret)',
    [UserRole.SYSTEM_ADMINISTRATOR]: 'Full system access, user management, all modules and security levels'
  }
  
  return descriptions[role] || 'Standard user access'
}
