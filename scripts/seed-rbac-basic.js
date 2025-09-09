const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedRBACData() {
  console.log('🚀 Starting RBAC Data Seeding...')

  try {
    // Check if we can connect to the database
    await prisma.$connect()
    console.log('✅ Database connection established')

    // Seed System Roles (based on user's 6-tier hierarchy)
    console.log('📊 Seeding System Roles...')
    
    const systemRoles = [
      {
        id: 'role_basic_1',
        name: 'basic_user_1',
        displayName: 'Basic User 1',
        description: 'Entry-level user with basic access to essential features',
        level: 1,
        category: 'user',
        isSystemRole: true,
        isActive: true,
        createdBy: 'system'
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
        createdBy: 'system'
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
        createdBy: 'system'
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
        createdBy: 'system'
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
        createdBy: 'system'
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
        createdBy: 'system'
      }
    ]

    for (const role of systemRoles) {
      try {
        const existingRole = await prisma.systemRole.findUnique({
          where: { name: role.name }
        })
        
        if (existingRole) {
          await prisma.systemRole.update({
            where: { name: role.name },
            data: role
          })
          console.log(`✅ Role updated: ${role.displayName}`)
        } else {
          await prisma.systemRole.create({
            data: role
          })
          console.log(`✅ Role created: ${role.displayName}`)
        }
      } catch (error) {
        console.log(`⚠️  Role operation warning for ${role.displayName}: ${error.message}`)
      }
    }

    // Seed System Permissions
    console.log('🔐 Seeding System Permissions...')
    
    const systemPermissions = [
      // Call Centre Module
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
        createdBy: 'system'
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
        createdBy: 'system'
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
        createdBy: 'system'
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
        createdBy: 'system'
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
        createdBy: 'system'
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
        createdBy: 'system'
      }
    ]

    for (const permission of systemPermissions) {
      try {
        const existingPermission = await prisma.systemPermission.findUnique({
          where: { name: permission.name }
        })
        
        if (existingPermission) {
          await prisma.systemPermission.update({
            where: { name: permission.name },
            data: permission
          })
          console.log(`✅ Permission updated: ${permission.displayName}`)
        } else {
          await prisma.systemPermission.create({
            data: permission
          })
          console.log(`✅ Permission created: ${permission.displayName}`)
        }
      } catch (error) {
        console.log(`⚠️  Permission operation warning for ${permission.displayName}: ${error.message}`)
      }
    }

    // Assign basic permissions to Basic User 1
    console.log('🔗 Assigning permissions to Basic User 1...')
    
    try {
      const basicRole = await prisma.systemRole.findUnique({
        where: { name: 'basic_user_1' }
      })
      
      const dashboardPerm = await prisma.systemPermission.findUnique({
        where: { name: 'dashboard.view' }
      })
      
      if (basicRole && dashboardPerm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: basicRole.id,
              permissionId: dashboardPerm.id
            }
          },
          update: {},
          create: {
            roleId: basicRole.id,
            permissionId: dashboardPerm.id,
            grantedBy: 'system'
          }
        })
        console.log(`✅ Dashboard permission assigned to Basic User 1`)
      }
    } catch (error) {
      console.log(`⚠️  Permission assignment warning: ${error.message}`)
    }

    console.log('🎉 RBAC Data seeding completed!')
    console.log('\n📋 Summary:')
    console.log(`   - 6 system roles seeded`)
    console.log(`   - 6 core permissions seeded`)
    console.log(`   - Basic role-permission mappings established`)
    console.log('\n🚀 Your RBAC system foundation is ready!')

  } catch (error) {
    console.error('❌ Error seeding RBAC data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedRBACData().catch(console.error)
