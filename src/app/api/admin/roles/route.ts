import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// HR Module roles - matching the actual role system
let roles = [
  {
    id: '1',
    name: 'BASIC_1',
    description: 'Basic 1 - Entry level user with basic permissions',
    permissions: ['basic_access', 'profile_management'],
    userCount: 0,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'BASIC_2',
    description: 'Basic 2 - Basic user with additional permissions',
    permissions: ['basic_access', 'profile_management', 'department_data'],
    userCount: 0,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'ADVANCE_USER_1',
    description: 'Advanced User 1 - Advanced user with departmental access',
    permissions: ['departmental_access', 'project_data', 'reports'],
    userCount: 0,
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10'
  },
  {
    id: '4',
    name: 'ADVANCE_USER_2',
    description: 'Advanced User 2 - Advanced user with cross-departmental access',
    permissions: ['cross_departmental_access', 'advanced_reports', 'project_management'],
    userCount: 1,
    createdAt: '2024-05-20',
    updatedAt: '2024-05-20'
  },
  {
    id: '5',
    name: 'SUPER_ADMIN',
    description: 'Super Admin - Full system administrator access',
    permissions: ['admin', 'user_management', 'system_config', 'audit_log', 'all_access'],
    userCount: 1,
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01'
  },
  {
    id: '6',
    name: 'ADMIN',
    description: 'Admin - Administrative access to most features',
    permissions: ['admin', 'user_management', 'system_config', 'hr_management'],
    userCount: 1,
    createdAt: '2024-07-01',
    updatedAt: '2024-07-01'
  },
  {
    id: '7',
    name: 'HR_MANAGER',
    description: 'HR Manager - Human Resources management access',
    permissions: ['hr_management', 'employee_data', 'performance_management'],
    userCount: 1,
    createdAt: '2024-08-01',
    updatedAt: '2024-08-01'
  },
  {
    id: '8',
    name: 'PROJECT_MANAGER',
    description: 'Project Manager - Project management and oversight access',
    permissions: ['project_management', 'project_data', 'reports', 'team_management'],
    userCount: 1,
    createdAt: '2024-09-01',
    updatedAt: '2024-09-01'
  },
  {
    id: '9',
    name: 'CALL_CENTRE_AGENT',
    description: 'Call Centre Agent - Call centre operations access',
    permissions: ['call_centre', 'case_management', 'customer_data'],
    userCount: 0,
    createdAt: '2024-10-01',
    updatedAt: '2024-10-01'
  },
  {
    id: '10',
    name: 'EMPLOYEE',
    description: 'Employee - Standard employee access',
    permissions: ['basic_access', 'profile_management', 'self_service'],
    userCount: 0,
    createdAt: '2024-11-01',
    updatedAt: '2024-11-01'
  },
  {
    id: '11',
    name: 'USER',
    description: 'User - Basic user access',
    permissions: ['basic_access', 'profile_view'],
    userCount: 1,
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01'
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let filteredRoles = roles

    if (search) {
      filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        role.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        roles: filteredRoles,
        total: filteredRoles.length,
        availablePermissions: [
          'admin',
          'user_management',
          'system_config',
          'audit_log',
          'hr_management',
          'employee_data',
          'programs_management',
          'project_data',
          'reports',
          'call_centre',
          'case_management',
          'basic_access',
          'profile_management',
          'inventory_management',
          'document_management'
        ]
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { action, roleId, roleData } = body

    switch (action) {
      case 'create_role':
        const newRole = {
          id: (roles.length + 1).toString(),
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions || [],
          userCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        
        roles.push(newRole)
        
        return NextResponse.json({
          success: true,
          message: 'Role created successfully',
          data: newRole
        })

      case 'update_role':
        const roleIndex = roles.findIndex(r => r.id === roleId)
        if (roleIndex === -1) {
          return NextResponse.json({ error: 'Role not found' }, { status: 404 })
        }
        
        roles[roleIndex] = {
          ...roles[roleIndex],
          ...roleData,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        
        return NextResponse.json({
          success: true,
          message: 'Role updated successfully',
          data: roles[roleIndex]
        })

      case 'delete_role':
        const roleToDelete = roles.find(r => r.id === roleId)
        if (!roleToDelete) {
          return NextResponse.json({ error: 'Role not found' }, { status: 404 })
        }
        
        if (roleToDelete.userCount > 0) {
          return NextResponse.json(
            { error: 'Cannot delete role with assigned users' },
            { status: 400 }
          )
        }
        
        roles = roles.filter(r => r.id !== roleId)
        
        return NextResponse.json({
          success: true,
          message: 'Role deleted successfully'
        })

      case 'clone_role':
        const originalRole = roles.find(r => r.id === roleId)
        if (!originalRole) {
          return NextResponse.json({ error: 'Role not found' }, { status: 404 })
        }
        
        const clonedRole = {
          id: (roles.length + 1).toString(),
          name: `${originalRole.name}_copy`,
          description: `Copy of ${originalRole.description}`,
          permissions: [...originalRole.permissions],
          userCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        
        roles.push(clonedRole)
        
        return NextResponse.json({
          success: true,
          message: 'Role cloned successfully',
          data: clonedRole
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error processing role management action:', error)
    return NextResponse.json(
      { error: 'Failed to process role action' },
      { status: 500 }
    )
  }
}
