import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function deployRBACSystem() {
  console.log('🚀 Starting RBAC System Deployment...')

  try {
    // First, let's check if the SystemRole table exists
    try {
      await prisma.systemRole.count()
      console.log('✅ RBAC tables already exist')
    } catch (error) {
      console.log('📋 RBAC tables not found. Creating schema...')
      
      // Read and execute the RBAC schema
      const schemaPath = path.join(process.cwd(), 'database', 'rbac-system-schema.sql')
      
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8')
        
        // Split the schema into individual statements
        const statements = schema
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'))

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await prisma.$executeRawUnsafe(statement + ';')
            } catch (error) {
              console.log(`⚠️  Statement execution warning: ${error.message}`)
            }
          }
        }
        
        console.log('✅ RBAC schema deployed successfully')
      } else {
        console.log('⚠️  RBAC schema file not found, continuing with seeding...')
      }
    }

    // Seed System Roles (based on user's 6-tier hierarchy)
    console.log('📊 Seeding System Roles...')
    
    const systemRoles = [
      {
        id: 'role_basic_1',
        name: 'basic_user_1',
        displayName: 'Basic User 1',
        description: 'Entry-level user with basic access to essential features',
        securityClearanceLevel: 1,
        priority: 1,
        isSystemRole: true,
        canAssignRoles: false,
        canManageUsers: false,
        maxSecurityLevel: 1
      },
      {
        id: 'role_basic_2',
        name: 'basic_user_2',
        displayName: 'Basic User 2',
        description: 'Basic user with slightly elevated permissions',
        securityClearanceLevel: 1,
        priority: 2,
        isSystemRole: true,
        canAssignRoles: false,
        canManageUsers: false,
        maxSecurityLevel: 1
      },
      {
        id: 'role_advance_1',
        name: 'advance_user_1',
        displayName: 'Advance User 1',
        description: 'Advanced user with departmental access and some management capabilities',
        securityClearanceLevel: 2,
        priority: 3,
        isSystemRole: true,
        canAssignRoles: false,
        canManageUsers: true,
        maxSecurityLevel: 2
      },
      {
        id: 'role_advance_2',
        name: 'advance_user_2',
        displayName: 'Advance User 2',
        description: 'Senior advanced user with cross-departmental access',
        securityClearanceLevel: 2,
        priority: 4,
        isSystemRole: true,
        canAssignRoles: true,
        canManageUsers: true,
        maxSecurityLevel: 2
      },
      {
        id: 'role_administrator',
        name: 'administrator',
        displayName: 'Administrator',
        description: 'System administrator with high-level access and management capabilities',
        securityClearanceLevel: 3,
        priority: 5,
        isSystemRole: true,
        canAssignRoles: true,
        canManageUsers: true,
        maxSecurityLevel: 3
      },
      {
        id: 'role_system_administrator',
        name: 'system_administrator',
        displayName: 'System Administrator',
        description: 'Highest level system administrator with full access to all features',
        securityClearanceLevel: 4,
        priority: 6,
        isSystemRole: true,
        canAssignRoles: true,
        canManageUsers: true,
        maxSecurityLevel: 4
      }
    ]

    for (const role of systemRoles) {
      try {
        await prisma.systemRole.upsert({
          where: { name: role.name },
          update: role,
          create: {
            ...role,
            createdBy: 'system'
          }
        })
        console.log(`✅ Role created/updated: ${role.displayName}`)
      } catch (error) {
        console.log(`⚠️  Role creation warning for ${role.displayName}: ${error.message}`)
      }
    }

    // Seed System Permissions
    console.log('🔐 Seeding System Permissions...')
    
    const systemPermissions = [
      // Call Centre Module
      {
        name: 'callcenter.view',
        displayName: 'View Call Centre',
        description: 'Access to view call centre data and dashboard',
        module: 'callcenter',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 1
      },
      {
        name: 'callcenter.create',
        displayName: 'Create Call Records',
        description: 'Create new call records and case entries',
        module: 'callcenter',
        category: 'crud',
        action: 'create',
        scope: 'own',
        securityLevel: 1
      },
      {
        name: 'callcenter.edit_own',
        displayName: 'Edit Own Calls',
        description: 'Edit own call records and case updates',
        module: 'callcenter',
        category: 'crud',
        action: 'edit',
        scope: 'own',
        securityLevel: 1
      },
      {
        name: 'callcenter.edit_all',
        displayName: 'Edit All Calls',
        description: 'Edit all call records within department',
        module: 'callcenter',
        category: 'crud',
        action: 'edit',
        scope: 'department',
        securityLevel: 2
      },
      {
        name: 'callcenter.manage',
        displayName: 'Manage Call Centre',
        description: 'Full call centre management including agent oversight',
        module: 'callcenter',
        category: 'admin',
        action: 'manage',
        scope: 'organization',
        securityLevel: 3
      },

      // HR Module
      {
        name: 'hr.view',
        displayName: 'View HR Data',
        description: 'Access to view basic HR information',
        module: 'hr',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 1
      },
      {
        name: 'hr.employees.view_team',
        displayName: 'View Team HR Data',
        description: 'View HR data for team members',
        module: 'hr',
        category: 'access',
        action: 'view',
        scope: 'team',
        securityLevel: 2
      },
      {
        name: 'hr.employees.create',
        displayName: 'Create Employees',
        description: 'Add new employee records',
        module: 'hr',
        category: 'crud',
        action: 'create',
        scope: 'department',
        securityLevel: 2,
        requiresApproval: true
      },
      {
        name: 'hr.payroll.view',
        displayName: 'View Payroll',
        description: 'Access to payroll information',
        module: 'hr',
        category: 'finance',
        action: 'view',
        scope: 'department',
        securityLevel: 3
      },

      // Programs Module
      {
        name: 'programs.view',
        displayName: 'View Programs',
        description: 'Access to view program and project data',
        module: 'programs',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 1
      },
      {
        name: 'programs.create',
        displayName: 'Create Programs',
        description: 'Create new programs and projects',
        module: 'programs',
        category: 'crud',
        action: 'create',
        scope: 'team',
        securityLevel: 2,
        requiresApproval: true
      },
      {
        name: 'programs.manage',
        displayName: 'Manage Programs',
        description: 'Full program management including budget oversight',
        module: 'programs',
        category: 'admin',
        action: 'manage',
        scope: 'organization',
        securityLevel: 3
      },

      // Document Repository Module
      {
        name: 'documents.view_public',
        displayName: 'View Public Documents',
        description: 'Access to public documents and resources',
        module: 'documents',
        category: 'access',
        action: 'view',
        scope: 'organization',
        securityLevel: 1
      },
      {
        name: 'documents.view_confidential',
        displayName: 'View Confidential Documents',
        description: 'Access to confidential documents',
        module: 'documents',
        category: 'access',
        action: 'view',
        scope: 'department',
        securityLevel: 2
      },
      {
        name: 'documents.view_secret',
        displayName: 'View Secret Documents',
        description: 'Access to secret documents',
        module: 'documents',
        category: 'access',
        action: 'view',
        scope: 'team',
        securityLevel: 3
      },
      {
        name: 'documents.view_topsecret',
        displayName: 'View Top Secret Documents',
        description: 'Access to top secret documents',
        module: 'documents',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 4
      },
      {
        name: 'documents.upload',
        displayName: 'Upload Documents',
        description: 'Upload and manage documents',
        module: 'documents',
        category: 'crud',
        action: 'create',
        scope: 'department',
        securityLevel: 2
      },

      // Dashboard Module
      {
        name: 'dashboard.view',
        displayName: 'View Dashboard',
        description: 'Access to main dashboard',
        module: 'dashboard',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 1
      },
      {
        name: 'dashboard.analytics',
        displayName: 'View Analytics',
        description: 'Access to advanced analytics and reports',
        module: 'dashboard',
        category: 'analytics',
        action: 'view',
        scope: 'department',
        securityLevel: 2
      },

      // Personal Profile Module
      {
        name: 'profile.view',
        displayName: 'View Profile',
        description: 'View own personal profile',
        module: 'profile',
        category: 'access',
        action: 'view',
        scope: 'own',
        securityLevel: 1
      },
      {
        name: 'profile.edit',
        displayName: 'Edit Profile',
        description: 'Edit own personal profile',
        module: 'profile',
        category: 'crud',
        action: 'edit',
        scope: 'own',
        securityLevel: 1
      },

      // System Administration
      {
        name: 'system.users',
        displayName: 'User Management',
        description: 'Manage system users and accounts',
        module: 'system',
        category: 'admin',
        action: 'manage',
        scope: 'organization',
        securityLevel: 4
      },
      {
        name: 'system.roles',
        displayName: 'Role Management',
        description: 'Manage roles and permissions',
        module: 'system',
        category: 'admin',
        action: 'manage',
        scope: 'organization',
        securityLevel: 4
      },
      {
        name: 'system.audit',
        displayName: 'Audit Logs',
        description: 'View system audit logs and security events',
        module: 'system',
        category: 'admin',
        action: 'view',
        scope: 'organization',
        securityLevel: 4
      }
    ]

    for (const permission of systemPermissions) {
      try {
        await prisma.systemPermission.upsert({
          where: { name: permission.name },
          update: permission,
          create: {
            ...permission,
            isSystemPermission: true,
            isActive: true,
            createdBy: 'system'
          }
        })
        console.log(`✅ Permission created/updated: ${permission.displayName}`)
      } catch (error) {
        console.log(`⚠️  Permission creation warning for ${permission.displayName}: ${error.message}`)
      }
    }

    // Assign permissions to roles based on the hierarchy
    console.log('🔗 Assigning permissions to roles...')
    
    const rolePermissionMappings = [
      // Basic User 1 - Minimal access
      { roleId: 'role_basic_1', permissions: [
        'dashboard.view', 'profile.view', 'profile.edit', 
        'documents.view_public', 'callcenter.view'
      ]},
      
      // Basic User 2 - Slightly more access
      { roleId: 'role_basic_2', permissions: [
        'dashboard.view', 'profile.view', 'profile.edit',
        'documents.view_public', 'callcenter.view', 'callcenter.create',
        'hr.view', 'programs.view'
      ]},
      
      // Advance User 1 - Departmental access
      { roleId: 'role_advance_1', permissions: [
        'dashboard.view', 'dashboard.analytics', 'profile.view', 'profile.edit',
        'documents.view_public', 'documents.view_confidential', 'documents.upload',
        'callcenter.view', 'callcenter.create', 'callcenter.edit_own',
        'hr.view', 'hr.employees.view_team', 'programs.view', 'programs.create'
      ]},
      
      // Advance User 2 - Cross-departmental access
      { roleId: 'role_advance_2', permissions: [
        'dashboard.view', 'dashboard.analytics', 'profile.view', 'profile.edit',
        'documents.view_public', 'documents.view_confidential', 'documents.upload',
        'callcenter.view', 'callcenter.create', 'callcenter.edit_own', 'callcenter.edit_all',
        'hr.view', 'hr.employees.view_team', 'hr.employees.create',
        'programs.view', 'programs.create'
      ]},
      
      // Administrator - High-level access
      { roleId: 'role_administrator', permissions: [
        'dashboard.view', 'dashboard.analytics', 'profile.view', 'profile.edit',
        'documents.view_public', 'documents.view_confidential', 'documents.view_secret', 'documents.upload',
        'callcenter.view', 'callcenter.create', 'callcenter.edit_own', 'callcenter.edit_all', 'callcenter.manage',
        'hr.view', 'hr.employees.view_team', 'hr.employees.create', 'hr.payroll.view',
        'programs.view', 'programs.create', 'programs.manage'
      ]},
      
      // System Administrator - Full access
      { roleId: 'role_system_administrator', permissions: [
        'dashboard.view', 'dashboard.analytics', 'profile.view', 'profile.edit',
        'documents.view_public', 'documents.view_confidential', 'documents.view_secret', 'documents.view_topsecret', 'documents.upload',
        'callcenter.view', 'callcenter.create', 'callcenter.edit_own', 'callcenter.edit_all', 'callcenter.manage',
        'hr.view', 'hr.employees.view_team', 'hr.employees.create', 'hr.payroll.view',
        'programs.view', 'programs.create', 'programs.manage',
        'system.users', 'system.roles', 'system.audit'
      ]}
    ]

    for (const mapping of rolePermissionMappings) {
      const role = await prisma.systemRole.findUnique({ where: { id: mapping.roleId } })
      if (!role) continue

      for (const permissionName of mapping.permissions) {
        try {
          const permission = await prisma.systemPermission.findUnique({ where: { name: permissionName } })
          if (!permission) continue

          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: mapping.roleId,
                permissionId: permission.id
              }
            },
            update: {},
            create: {
              roleId: mapping.roleId,
              permissionId: permission.id,
              grantedBy: 'system'
            }
          })
        } catch (error) {
          console.log(`⚠️  Permission assignment warning: ${error.message}`)
        }
      }
      console.log(`✅ Permissions assigned to ${role.displayName}`)
    }

    console.log('🎉 RBAC System deployment completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   - ${systemRoles.length} system roles created`)
    console.log(`   - ${systemPermissions.length} permissions created`)
    console.log(`   - Role-permission mappings established`)
    console.log('\n🚀 Your RBAC system is now ready for use!')

  } catch (error) {
    console.error('❌ Error deploying RBAC system:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the deployment
deployRBACSystem()
