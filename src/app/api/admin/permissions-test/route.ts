import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return our seeded RBAC permissions for testing
    const mockPermissions = [
      {
        id: 'perm_cc_1',
        name: 'callcenter.view',
        displayName: 'View Call Centre',
        description: 'Access to view call centre data and dashboard',
        module: 'callcenter',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 1,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_cc_2',
        name: 'callcenter.create',
        displayName: 'Create Call Records',
        description: 'Create new call records and case entries',
        module: 'callcenter',
        category: 'crud',
        action: 'create',
        scope: 'own',
        securityLevel: 1,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_hr_1',
        name: 'hr.view',
        displayName: 'View HR Data',
        description: 'Access to view basic HR information',
        module: 'hr',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 1,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_hr_2',
        name: 'hr.employees.create',
        displayName: 'Create Employees',
        description: 'Add new employee records',
        module: 'hr',
        category: 'crud',
        action: 'create',
        scope: 'department',
        securityLevel: 2,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_prog_1',
        name: 'programs.view',
        displayName: 'View Programs',
        description: 'Access to view program and project data',
        module: 'programs',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 1,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_prog_2',
        name: 'programs.create',
        displayName: 'Create Programs',
        description: 'Create new programs and projects',
        module: 'programs',
        category: 'crud',
        action: 'create',
        scope: 'team',
        securityLevel: 2,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_doc_1',
        name: 'documents.view_public',
        displayName: 'View Public Documents',
        description: 'Access to public documents and resources',
        module: 'documents',
        category: 'access',
        action: 'view',
        scope: 'organization',
        securityLevel: 1,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_doc_2',
        name: 'documents.view_confidential',
        displayName: 'View Confidential Documents',
        description: 'Access to confidential documents',
        module: 'documents',
        category: 'access',
        action: 'view',
        scope: 'department',
        securityLevel: 2,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_doc_3',
        name: 'documents.view_secret',
        displayName: 'View Secret Documents',
        description: 'Access to secret documents',
        module: 'documents',
        category: 'access',
        action: 'view',
        scope: 'team',
        securityLevel: 3,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_doc_4',
        name: 'documents.view_topsecret',
        displayName: 'View Top Secret Documents',
        description: 'Access to top secret documents',
        module: 'documents',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 4,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_dash_1',
        name: 'dashboard.view',
        displayName: 'View Dashboard',
        description: 'Access to main dashboard',
        module: 'dashboard',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 1,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_sys_1',
        name: 'system.roles',
        displayName: 'Role Management',
        description: 'Manage roles and permissions',
        module: 'system',
        category: 'admin',
        action: 'manage',
        scope: 'organization',
        securityLevel: 4,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'perm_sys_2',
        name: 'system.users',
        displayName: 'User Management',
        description: 'Manage system users',
        module: 'system',
        category: 'admin',
        action: 'manage',
        scope: 'organization',
        securityLevel: 4,
        isSystemPermission: true,
        isActive: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Group permissions by module for better organization
    const groupedPermissions = mockPermissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = []
      }
      acc[permission.module].push(permission)
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      permissions: mockPermissions,
      groupedPermissions,
      total: mockPermissions.length,
      modules: [...new Set(mockPermissions.map(p => p.module))],
      categories: [...new Set(mockPermissions.map(p => p.category))],
      message: 'RBAC permissions fetched successfully (mock data)'
    })

  } catch (error) {
    console.error('Error in test permissions API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}
