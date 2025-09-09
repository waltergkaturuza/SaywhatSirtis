import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return our seeded RBAC data directly for testing
    const mockRoles = [
      {
        id: 'role_basic_1',
        name: 'basic_user_1',
        displayName: 'Basic User 1',
        description: 'Entry-level user with basic access to essential features',
        level: 1,
        category: 'user',
        isSystemRole: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCount: 2,
        permissions: [
          {
            permission: {
              id: 'perm_dash_1',
              name: 'dashboard.view',
              displayName: 'View Dashboard',
              description: 'Access to main dashboard',
              module: 'dashboard',
              action: 'view'
            }
          }
        ]
      },
      {
        id: 'role_basic_2',
        name: 'basic_user_2',
        displayName: 'Basic User 2',
        description: 'Basic user with slightly elevated permissions',
        level: 1,
        category: 'user',
        isSystemRole: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCount: 3,
        permissions: [
          {
            permission: {
              id: 'perm_dash_1',
              name: 'dashboard.view',
              displayName: 'View Dashboard',
              description: 'Access to main dashboard',
              module: 'dashboard',
              action: 'view'
            }
          },
          {
            permission: {
              id: 'perm_cc_1',
              name: 'callcenter.view',
              displayName: 'View Call Centre',
              description: 'Access to view call centre data',
              module: 'callcenter',
              action: 'view'
            }
          }
        ]
      },
      {
        id: 'role_advance_1',
        name: 'advance_user_1',
        displayName: 'Advance User 1',
        description: 'Advanced user with departmental access and some management capabilities',
        level: 2,
        category: 'department',
        isSystemRole: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCount: 5,
        permissions: [
          {
            permission: {
              id: 'perm_dash_1',
              name: 'dashboard.view',
              displayName: 'View Dashboard',
              description: 'Access to main dashboard',
              module: 'dashboard',
              action: 'view'
            }
          },
          {
            permission: {
              id: 'perm_hr_1',
              name: 'hr.view',
              displayName: 'View HR Data',
              description: 'Access to view HR information',
              module: 'hr',
              action: 'view'
            }
          }
        ]
      },
      {
        id: 'role_advance_2',
        name: 'advance_user_2',
        displayName: 'Advance User 2',
        description: 'Senior advanced user with cross-departmental access',
        level: 2,
        category: 'department',
        isSystemRole: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCount: 4,
        permissions: [
          {
            permission: {
              id: 'perm_dash_1',
              name: 'dashboard.view',
              displayName: 'View Dashboard',
              description: 'Access to main dashboard',
              module: 'dashboard',
              action: 'view'
            }
          },
          {
            permission: {
              id: 'perm_hr_1',
              name: 'hr.view',
              displayName: 'View HR Data',
              description: 'Access to view HR information',
              module: 'hr',
              action: 'view'
            }
          },
          {
            permission: {
              id: 'perm_prog_1',
              name: 'programs.view',
              displayName: 'View Programs',
              description: 'Access to view program data',
              module: 'programs',
              action: 'view'
            }
          }
        ]
      },
      {
        id: 'role_administrator',
        name: 'administrator',
        displayName: 'Administrator',
        description: 'System administrator with high-level access and management capabilities',
        level: 3,
        category: 'system',
        isSystemRole: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCount: 2,
        permissions: [
          {
            permission: {
              id: 'perm_dash_1',
              name: 'dashboard.view',
              displayName: 'View Dashboard',
              description: 'Access to main dashboard',
              module: 'dashboard',
              action: 'view'
            }
          },
          {
            permission: {
              id: 'perm_hr_2',
              name: 'hr.employees.create',
              displayName: 'Create Employees',
              description: 'Add new employee records',
              module: 'hr',
              action: 'create'
            }
          },
          {
            permission: {
              id: 'perm_doc_2',
              name: 'documents.view_confidential',
              displayName: 'View Confidential Documents',
              description: 'Access to confidential documents',
              module: 'documents',
              action: 'view'
            }
          }
        ]
      },
      {
        id: 'role_system_administrator',
        name: 'system_administrator',
        displayName: 'System Administrator',
        description: 'Highest level system administrator with full access to all features',
        level: 4,
        category: 'system',
        isSystemRole: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCount: 1,
        permissions: [
          {
            permission: {
              id: 'perm_sys_1',
              name: 'system.roles',
              displayName: 'Role Management',
              description: 'Manage roles and permissions',
              module: 'system',
              action: 'manage'
            }
          },
          {
            permission: {
              id: 'perm_sys_2',
              name: 'system.users',
              displayName: 'User Management',
              description: 'Manage system users',
              module: 'system',
              action: 'manage'
            }
          },
          {
            permission: {
              id: 'perm_doc_4',
              name: 'documents.view_topsecret',
              displayName: 'View Top Secret Documents',
              description: 'Access to top secret documents',
              module: 'documents',
              action: 'view'
            }
          }
        ]
      }
    ]

    return NextResponse.json({
      roles: mockRoles,
      total: mockRoles.length,
      message: 'RBAC roles fetched successfully (mock data)'
    })

  } catch (error) {
    console.error('Error in test roles API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock role creation
    const newRole = {
      id: `role_${Date.now()}`,
      name: body.name || 'custom_role',
      displayName: body.displayName || body.name || 'Custom Role',
      description: body.description || 'Custom created role',
      level: body.level || 1,
      category: body.category || 'user',
      isSystemRole: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      userCount: 0,
      permissions: []
    }

    return NextResponse.json({
      role: newRole,
      message: 'Role created successfully (mock mode)'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating test role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}
