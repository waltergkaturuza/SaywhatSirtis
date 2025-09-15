import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomUUID } from 'crypto'

// Helper functions for role management - aligned with HR module definitions
function getRoleDisplayName(role: string): string {
  return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

function getRolePermissions(role: string): string[] {
  // Common baseline permissions for all users
  const basePermissions = [
    'dashboard',
    'personalProfile',
    'documents',
    'performance_plans',
    'appraisals',
    'training'
  ]

  const rolePermissions = {
    'BASIC_USER_1': [
      ...basePermissions,
      'call_center_view',
      'documents_view'
    ],
    'BASIC_USER_2': [
      ...basePermissions,
      'programs_view',
      'inventory_view'
    ],
    'ADVANCE_USER_1': [
      ...basePermissions,
      'call_center_full',
      'programs_edit',
      'risks_edit',
      'reports_generate'
    ],
    'ADVANCE_USER_2': [
      ...basePermissions,
      'programs_full',
      'documents_edit',
      'inventory_edit',
      'reports_generate'
    ],
    'HR': [
      ...basePermissions,
      'hr_full',
      'view_other_profiles',
      'manage_performance',
      'recruitment',
      'employee_reports'
    ],
    'SYSTEM_ADMINISTRATOR': [
      'full_access',
      'admin_panel',
      'user_management',
      'system_settings',
      'security_management',
      'audit_logs'
    ]
  }
  
  return rolePermissions[role as keyof typeof rolePermissions] || basePermissions
}

function getDepartmentPermissions(department: string): string[] {
  const departmentPermissions = {
    'EXECUTIVE_LEADERSHIP': ['strategic_planning', 'executive_reports', 'board_communications'],
    'FINANCE_AND_ADMINISTRATION': ['financial_management', 'budget_oversight', 'admin_operations'],
    'PROGRAMS_AND_OPERATIONS': ['program_management', 'field_operations', 'beneficiary_management'],
    'HUMAN_RESOURCES': ['staff_management', 'recruitment_full', 'performance_management'],
    'GRANTS_AND_COMPLIANCE': ['grant_applications', 'donor_reports', 'compliance_monitoring', 'audit_support'],
    'COMMUNICATIONS_AND_ADVOCACY': ['media_relations', 'content_creation', 'social_media', 'advocacy_campaigns'],
    // Legacy departments
    'HR': ['hr_policies', 'staff_management', 'recruitment_full'],
    'FINANCE': ['financial_reports', 'budget_management'],
    'PROGRAMS': ['project_management', 'field_operations'],
    'CALL_CENTER': ['customer_service', 'data_entry', 'reporting'],
    'INVENTORY': ['asset_tracking', 'procurement_support', 'maintenance_logs'],
    'DOCUMENTS': ['document_classification', 'archive_management', 'version_control']
  }
  
  return departmentPermissions[department] || []
}

// Enhanced function to combine role and department permissions  
function getCombinedPermissions(role: string, department: string): string[] {
  const rolePerms = getRolePermissions(role)
  const deptPerms = getDepartmentPermissions(department)
  
  // Combine and deduplicate permissions
  return [...new Set([...rolePerms, ...deptPerms])]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    const session = await getServerSession(authOptions)

    // Temporarily allow unauthenticated access in development for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges (allow in development)
    if (session) {
      const hasAdminAccess = session.user?.email?.includes("admin") || 
                            session.user?.email?.includes("john.doe")
      
      if (!hasAdminAccess && !isDevelopment) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    // Handle specific user permissions request
    if (action === 'get_permissions' && userId) {
      try {
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: {
            role: true,
            department: true
          }
        })

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const permissions = getCombinedPermissions(user.role || 'BASIC_USER_1', user.department || '')
        
        return NextResponse.json({
          success: true,
          permissions
        })
      } catch (error) {
        console.error("Error fetching user permissions:", error)
        return NextResponse.json(
          { error: "Failed to fetch user permissions" },
          { status: 500 }
        )
      }
    }

    // Fetch users from database
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        position: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to match frontend interface
    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'User',
      email: user.email,
      role: user.role || 'BASIC_USER_1',
      department: user.department || 'Unassigned',
      position: user.position || 'No Position',
      employeeId: user.id, // Using user ID as employee ID for now
      isActive: user.isActive,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.createdAt.toISOString(),
      roles: [{
        role: {
          name: user.role || 'BASIC_USER_1',
          description: getRoleDisplayName(user.role || 'BASIC_USER_1')
        }
      }],
      permissions: getCombinedPermissions(user.role || 'BASIC_USER_1', user.department || '')
    }))

    return NextResponse.json({
      success: true,
      data: {
        users: transformedUsers,
        total: transformedUsers.length,
        page: 1,
        totalPages: 1
      }
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Temporarily allow unauthenticated access in development for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges (allow in development)
    if (session) {
      const hasAdminAccess = session.user?.email?.includes("admin") || 
                            session.user?.email?.includes("john.doe")
      
      if (!hasAdminAccess && !isDevelopment) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    const requestBody = await request.json()
    const { action, userId } = requestBody
    
    // Extract userData from request body (handle both nested and flattened structures)
    let userData
    if (requestBody.userData) {
      userData = requestBody.userData
    } else {
      // Extract user fields from flattened structure
      const { action: _, userId: __, ...userFields } = requestBody
      userData = userFields
    }

    switch (action) {
      case 'toggle_status':
        try {
          const user = await prisma.users.findUnique({
            where: { id: userId }
          })

          if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
          }

          const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              department: true,
              position: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
            }
          })

          const transformedUser = {
            id: updatedUser.id,
            firstName: updatedUser.firstName || 'Unknown',
            lastName: updatedUser.lastName || 'User',
            email: updatedUser.email,
            role: updatedUser.role || 'USER',
            department: updatedUser.department || 'Unassigned',
            position: updatedUser.position || 'No Position',
            lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : null,
            status: updatedUser.isActive ? 'active' : 'inactive',
            isActive: updatedUser.isActive,
            createdAt: updatedUser.createdAt.toISOString(),
            permissions: getCombinedPermissions(updatedUser.role || 'USER', updatedUser.department || ''),
            roles: [{
              role: {
                name: updatedUser.role || 'USER',
                displayName: getRoleDisplayName(updatedUser.role || 'USER'),
                permissions: getCombinedPermissions(updatedUser.role || 'USER', updatedUser.department || '')
              }
            }]
          }

          return NextResponse.json({
            success: true,
            user: transformedUser,
            message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`
          })
        } catch (error) {
          console.error("Error updating user status:", error)
          return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 }
          )
        }

      case 'create_user':
        try {
          // Validate required fields
          if (!userData.email || !userData.firstName || !userData.lastName) {
            return NextResponse.json(
              { error: "Missing required fields: email, firstName, and lastName are required" },
              { status: 400 }
            )
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(userData.email)) {
            return NextResponse.json(
              { error: "Invalid email format" },
              { status: 400 }
            )
          }

          // Check if user already exists
          const existingUser = await prisma.users.findUnique({
            where: { email: userData.email }
          })

          if (existingUser) {
            return NextResponse.json(
              { error: "User with this email already exists" },
              { status: 409 }
            )
          }

          // Note: Password handling would be implemented here in production
          // For now, we create users without password (OAuth/SSO authentication)
          
          const newUser = await prisma.users.create({
            data: {
              id: randomUUID(),
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role ? userData.role.toUpperCase() as any : 'BASIC_USER_1',
              department: userData.department || '',
              position: userData.position || '',
              isActive: true,
              updatedAt: new Date()
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              department: true,
              position: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
            }
          })

          const transformedUser = {
            id: newUser.id,
            firstName: newUser.firstName || 'Unknown',
            lastName: newUser.lastName || 'User',
            email: newUser.email,
            role: newUser.role || 'BASIC_USER_1',
            department: newUser.department || 'Unassigned',
            position: newUser.position || 'No Position',
            lastLogin: newUser.lastLogin ? newUser.lastLogin.toISOString() : null,
            status: newUser.isActive ? 'active' : 'inactive',
            isActive: newUser.isActive,
            createdAt: newUser.createdAt.toISOString(),
            permissions: getCombinedPermissions(newUser.role || 'USER', newUser.department || ''),
            roles: [{
              role: {
                name: newUser.role || 'USER',
                displayName: getRoleDisplayName(newUser.role || 'USER'),
                permissions: getCombinedPermissions(newUser.role || 'USER', newUser.department || '')
              }
            }]
          }

          return NextResponse.json({
            success: true,
            user: transformedUser,
            message: "User created successfully"
          })
        } catch (error) {
          console.error("Error creating user:", error)
          return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
          )
        }

      case 'update_user':
        try {
          const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role ? userData.role.toUpperCase() as any : undefined,
              department: userData.department,
              position: userData.position,
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              department: true,
              position: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
            }
          })

          const transformedUser = {
            id: updatedUser.id,
            firstName: updatedUser.firstName || 'Unknown',
            lastName: updatedUser.lastName || 'User', 
            email: updatedUser.email,
            role: updatedUser.role || 'USER',
            department: updatedUser.department || 'Unassigned',
            position: updatedUser.position || 'No Position',
            lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : null,
            status: updatedUser.isActive ? 'active' : 'inactive',
            isActive: updatedUser.isActive,
            createdAt: updatedUser.createdAt.toISOString(),
            permissions: getCombinedPermissions(updatedUser.role || 'USER', updatedUser.department || ''),
            roles: [{
              role: {
                name: updatedUser.role || 'USER',
                displayName: getRoleDisplayName(updatedUser.role || 'USER'),
                permissions: getCombinedPermissions(updatedUser.role || 'USER', updatedUser.department || '')
              }
            }]
          }

          return NextResponse.json({
            success: true,
            user: transformedUser,
            message: "User updated successfully"
          })
        } catch (error) {
          console.error("Error updating user:", error)
          return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
          )
        }

      case 'delete_user':
        try {
          await prisma.users.delete({
            where: { id: userId }
          })

          return NextResponse.json({
            success: true,
            message: "User deleted successfully"
          })
        } catch (error) {
          console.error("Error deleting user:", error)
          return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
