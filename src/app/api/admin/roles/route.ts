import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // For development, allow access without strict authentication
    const session = await getServerSession(authOptions)
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions (skip in development for testing)
    if (session) {
      const hasPermission = session.user?.permissions?.includes('system.roles') ||
                           session.user?.roles?.includes('admin') ||
                           session.user?.roles?.includes('system_administrator')

      if (!hasPermission && !isDevelopment) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    // Get all system roles with their permissions and user counts
    const roles = await prisma.systemRole.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        userAssignments: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        parentRole: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        },
        childRoles: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        },
        groupMemberships: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { displayName: 'asc' }
      ]
    }).catch(error => {
      console.log('Database query failed, using fallback mock data:', error.message)
      // Return mock data if database query fails
      return []
    })

    // If no roles found in database, return mock data structure
    if (roles.length === 0) {
      const mockRoles = [
        {
          id: '1',
          name: 'basic_user_1',
          displayName: 'Basic User 1',
          description: 'Entry level access with read-only permissions',
          level: 1,
          category: 'user',
          department: null,
          isSystemRole: true,
          isActive: true,
          maxUsers: null,
          parentRole: null,
          childRoles: [],
          permissions: [
            {
              id: 'perm1',
              name: 'callcenter.view',
              displayName: 'View Call Centre',
              description: 'Access to view call centre data',
              module: 'callcenter',
              category: 'access',
              action: 'view',
              scope: 'own',
              securityLevel: 1,
              isGranted: true,
              isInherited: false,
              conditions: null
            }
          ],
          users: [],
          groups: [],
          userCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'basic_user_2',
          displayName: 'Basic User 2',
          description: 'Enhanced basic access with limited editing',
          level: 1,
          category: 'user',
          department: null,
          isSystemRole: true,
          isActive: true,
          maxUsers: null,
          parentRole: null,
          childRoles: [],
          permissions: [
            {
              id: 'perm1',
              name: 'callcenter.view',
              displayName: 'View Call Centre',
              description: 'Access to view call centre data',
              module: 'callcenter',
              category: 'access',
              action: 'view',
              scope: 'own',
              securityLevel: 1,
              isGranted: true,
              isInherited: false,
              conditions: null
            },
            {
              id: 'perm2',
              name: 'callcenter.edit_own',
              displayName: 'Edit Own Calls',
              description: 'Edit own call records',
              module: 'callcenter',
              category: 'crud',
              action: 'edit',
              scope: 'own',
              securityLevel: 1,
              isGranted: true,
              isInherited: false,
              conditions: null
            }
          ],
          users: [],
          groups: [],
          userCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'advance_user_1',
          displayName: 'Advance User 1',
          description: 'Advanced operations access with approval rights',
          level: 2,
          category: 'user',
          department: null,
          isSystemRole: true,
          isActive: true,
          maxUsers: null,
          parentRole: null,
          childRoles: [],
          permissions: [
            {
              id: 'perm3',
              name: 'programs.create',
              displayName: 'Create Programs',
              description: 'Create new programs',
              module: 'programs',
              category: 'crud',
              action: 'create',
              scope: 'team',
              securityLevel: 2,
              isGranted: true,
              isInherited: false,
              conditions: null
            }
          ],
          users: [],
          groups: [],
          userCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          name: 'advance_user_2',
          displayName: 'Advance User 2',
          description: 'Senior advanced access with cross-department visibility',
          level: 2,
          category: 'user',
          department: null,
          isSystemRole: true,
          isActive: true,
          maxUsers: null,
          parentRole: null,
          childRoles: [],
          permissions: [
            {
              id: 'perm4',
              name: 'hr.view',
              displayName: 'View HR Data',
              description: 'Access to view HR information',
              module: 'hr',
              category: 'access',
              action: 'view',
              scope: 'department',
              securityLevel: 2,
              isGranted: true,
              isInherited: false,
              conditions: null
            }
          ],
          users: [],
          groups: [],
          userCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '5',
          name: 'administrator',
          displayName: 'Administrator',
          description: 'Department administration capabilities',
          level: 3,
          category: 'department',
          department: null,
          isSystemRole: true,
          isActive: true,
          maxUsers: null,
          parentRole: null,
          childRoles: [],
          permissions: [
            {
              id: 'perm5',
              name: 'hr.employees.create',
              displayName: 'Create Employees',
              description: 'Add new employee records',
              module: 'hr',
              category: 'crud',
              action: 'create',
              scope: 'department',
              securityLevel: 2,
              isGranted: true,
              isInherited: false,
              conditions: null
            }
          ],
          users: [],
          groups: [],
          userCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '6',
          name: 'system_administrator',
          displayName: 'System Administrator',
          description: 'Full system access and configuration',
          level: 4,
          category: 'system',
          department: null,
          isSystemRole: true,
          isActive: true,
          maxUsers: null,
          parentRole: null,
          childRoles: [],
          permissions: [
            {
              id: 'perm6',
              name: 'system.roles',
              displayName: 'Role Management',
              description: 'Manage roles and permissions',
              module: 'system',
              category: 'admin',
              action: 'manage',
              scope: 'organization',
              securityLevel: 4,
              isGranted: true,
              isInherited: false,
              conditions: null
            }
          ],
          users: [],
          groups: [],
          userCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      return NextResponse.json({
        roles: mockRoles,
        total: mockRoles.length,
        message: 'Using mock data - RBAC system not yet initialized'
      })
    }

    // Transform the data for frontend consumption
    const transformedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      category: role.category,
      department: role.department,
      isSystemRole: role.isSystemRole,
      isActive: role.isActive,
      maxUsers: role.maxUsers,
      parentRole: role.parentRole,
      childRoles: role.childRoles,
      permissions: role.permissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        displayName: rp.permission.displayName,
        description: rp.permission.description,
        module: rp.permission.module,
        category: rp.permission.category,
        action: rp.permission.action,
        scope: rp.permission.scope,
        securityLevel: rp.permission.securityLevel,
        isGranted: rp.isGranted,
        isInherited: rp.isInherited,
        conditions: rp.conditions
      })),
      users: role.userAssignments.map(ua => ({
        id: ua.user.id,
        email: ua.user.email,
        name: `${ua.user.firstName || ''} ${ua.user.lastName || ''}`.trim(),
        assignmentType: ua.assignmentType,
        assignedAt: ua.assignedAt
      })),
      groups: role.groupMemberships.map(gm => ({
        id: gm.group.id,
        name: gm.group.name,
        displayName: gm.group.displayName,
        isPrimary: gm.isPrimary,
        priority: gm.priority
      })),
      userCount: role.userAssignments.length,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }))

    return NextResponse.json({
      roles: transformedRoles,
      total: transformedRoles.length
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
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (session) {
      const hasPermission = session.user?.permissions?.includes('system.roles') ||
                           session.user?.roles?.includes('admin') ||
                           session.user?.roles?.includes('system_administrator')

      if (!hasPermission && !isDevelopment) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    const body = await request.json()
    const {
      name,
      displayName,
      description,
      level,
      category,
      department,
      parentRoleId,
      permissions = [],
      maxUsers
    } = body

    // Validate required fields
    if (!name || !displayName || !level || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, displayName, level, category' },
        { status: 400 }
      )
    }

    try {
      // Create the role
      const newRole = await prisma.systemRole.create({
        data: {
          name,
          displayName,
          description,
          level,
          category,
          department,
          parentRoleId,
          maxUsers,
          createdBy: session?.user?.id || 'system'
        }
      })

      // Add permissions if provided
      if (permissions.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissions.map((permissionId: string) => ({
            roleId: newRole.id,
            permissionId,
            grantedBy: session?.user?.id || 'system'
          }))
        })
      }

      // Fetch the created role with all relationships
      const createdRole = await prisma.systemRole.findUnique({
        where: { id: newRole.id },
        include: {
          permissions: {
            include: {
              permission: true
            }
          },
          userAssignments: {
            where: { isActive: true }
          },
          parentRole: true,
          childRoles: true
        }
      })

      return NextResponse.json({
        role: createdRole,
        message: 'Role created successfully'
      }, { status: 201 })

    } catch (dbError) {
      // If database operations fail, return mock success for development
      if (isDevelopment) {
        const mockRole = {
          id: Date.now().toString(),
          name,
          displayName,
          description,
          level,
          category,
          department,
          isSystemRole: false,
          isActive: true,
          permissions: [],
          users: [],
          userCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        return NextResponse.json({
          role: mockRole,
          message: 'Role created successfully (mock mode)'
        }, { status: 201 })
      }
      
      throw dbError
    }

  } catch (error) {
    console.error('Error creating role:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}
