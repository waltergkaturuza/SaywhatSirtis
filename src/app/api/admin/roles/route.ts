import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock roles data
let roles = [
  {
    id: '1',
    name: 'admin',
    description: 'System Administrator',
    permissions: ['admin', 'user_management', 'system_config', 'audit_log'],
    userCount: 2,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'hr_manager',
    description: 'HR Manager',
    permissions: ['hr_management', 'employee_data', 'payroll_management'],
    userCount: 3,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'programs_manager',
    description: 'Programs Manager',
    permissions: ['programs_management', 'project_data', 'reports'],
    userCount: 4,
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10'
  },
  {
    id: '4',
    name: 'call_centre_agent',
    description: 'Call Centre Agent',
    permissions: ['call_centre', 'case_management'],
    userCount: 12,
    createdAt: '2024-05-20',
    updatedAt: '2024-05-20'
  },
  {
    id: '5',
    name: 'employee',
    description: 'Regular Employee',
    permissions: ['basic_access', 'profile_management'],
    userCount: 25,
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01'
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
          'payroll_management',
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
