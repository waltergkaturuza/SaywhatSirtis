import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomUUID } from 'crypto'
import * as bcrypt from 'bcryptjs'
import { securityService } from "@/lib/security-service"
import AuditLogger from "@/lib/audit-logger"
import emailService from "@/lib/email-service"
import { hasAdminAccess as checkAdminAccess } from "@/lib/admin-auth"
import { accessConfigForRole } from "@/lib/access-role"

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
      // Call Centre - view only
      'call_center_view',
      'callcentre.access',
      'callcentre.view',
      // Programs - full access
      'programs_full',
      'programs.full_access',
      'programs.view',
      'programs.create',
      'programs.edit',
      'programs.delete',
      // HR - none (no HR permissions)
      // Inventory - edit access
      'inventory_edit',
      'inventory.view',
      'inventory.edit',
      'inventory.create',
      // Risk Management - edit access  
      'risks_edit',
      'risk.view',
      'risk.edit',
      'risk.create',
      // Documents - edit access (up to SECRET level)
      'documents_edit',
      'documents.view',
      'documents.create',
      'documents.edit',
      'documents.upload',
      'documents.download',
      'documents.share',
      // Reporting
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
  const departmentPermissions: Record<string, string[]> = {
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
    if (session && !checkAdminAccess(session) && !isDevelopment) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
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

    // Fetch ALL system users with optional employee data
    // This shows all users who can log into the system, regardless of employment status
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
        updatedAt: true,
        employees: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
            status: true,
            employmentType: true,
            startDate: true,
            salary: true,
            is_supervisor: true,
            is_reviewer: true,
            user_role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }).catch(async (error) => {
      console.error("Database connection failed, trying users only:", error)
      // Fallback: try to fetch just users if employee relation fails
      return await prisma.users.findMany({
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
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    })

    // Transform data to match frontend interface, clearly distinguishing system users and employees
    const transformedUsers = users.map(user => {
      const employeeData = ('employees' in user) ? user.employees : null
      const isEmployee = !!employeeData
      
      // For system users, prioritize user table data; for employees, show employee data
      const displayName = user.firstName || employeeData?.firstName || 'Unknown'
      const displayLastName = user.lastName || employeeData?.lastName || 'User'
      const displayDepartment = user.department || employeeData?.department || 'System'
      const displayPosition = user.position || employeeData?.position || 'System User'
      
      return {
        id: user.id,
        firstName: displayName,
        lastName: displayLastName,
        email: user.email,
        role: user.role || 'USER',
        department: displayDepartment,
        position: displayPosition,
        employeeId: employeeData?.employeeId || `SYS-${user.id.slice(-6)}`,
        isActive: user.isActive,
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
        createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: (user as any).updatedAt ? (user as any).updatedAt.toISOString() : (user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()),
        
        // Employee-specific fields (null/default if not an employee)
        employmentType: employeeData?.employmentType || null,
        startDate: employeeData?.startDate?.toISOString() || null,
        salary: employeeData?.salary || null,
        isSupervisor: employeeData?.is_supervisor || false,
        isReviewer: employeeData?.is_reviewer || false,
        
        // Clear distinction between system access and employment
        isSystemUser: true, // All users in this list have system access
        isEmployee: isEmployee,
        requestedRole: employeeData?.user_role || null,
        employeeStatus: employeeData?.status || (isEmployee ? 'UNKNOWN' : 'NOT_EMPLOYEE'),
        
        // Legacy role structure for backward compatibility
        roles: [{
          role: {
            name: user.role || 'USER',
            description: getRoleDisplayName(user.role || 'USER')
          }
        }],
        permissions: getCombinedPermissions(user.role || 'USER', displayDepartment)
      }
    })

    const pendingEmployees = await prisma.employees.findMany({
      where: {
        status: { not: 'ARCHIVED' },
        OR: [
          { userId: null },
          { users: { passwordHash: null } },
        ],
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        user_role: true,
        userId: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        users: transformedUsers,
        pendingEmployees: pendingEmployees.map((employee) => ({
          id: employee.id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department || 'Unassigned',
          position: employee.position,
          requestedRole: employee.user_role || 'BASIC_USER_1',
          hasLoginShell: Boolean(employee.userId),
        })),
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
    if (session && !checkAdminAccess(session) && !isDevelopment) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
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

          const nextActive = !user.isActive
          const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { isActive: nextActive },
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

          await prisma.employees.updateMany({
            where: { userId },
            data: { access_revoked: !nextActive, updatedAt: new Date() },
          })

          const transformedUser = {
            id: updatedUser.id,
            firstName: updatedUser.firstName || 'Unknown',
            lastName: updatedUser.lastName || 'User',
            email: updatedUser.email,
            role: updatedUser.role || 'BASIC_USER_1',
            department: updatedUser.department || 'Unassigned',
            position: updatedUser.position || 'No Position',
            lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : null,
            status: updatedUser.isActive ? 'active' : 'inactive',
            isActive: updatedUser.isActive,
            createdAt: updatedUser.createdAt.toISOString(),
            permissions: getCombinedPermissions(updatedUser.role || 'BASIC_USER_1', updatedUser.department || ''),
            roles: [{
              role: {
                name: updatedUser.role || 'BASIC_USER_1',
                displayName: getRoleDisplayName(updatedUser.role || 'BASIC_USER_1'),
                permissions: getCombinedPermissions(updatedUser.role || 'BASIC_USER_1', updatedUser.department || '')
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

      case 'activate_login':
        try {
          const employeeRecordId = requestBody.employeeId || userData.employeeId
          const role = userData.role || 'BASIC_USER_1'
          const password = userData.password

          if (!employeeRecordId || !password) {
            return NextResponse.json(
              { error: "Choose an employee and enter a password" },
              { status: 400 }
            )
          }

          const passwordValidation = securityService.validatePasswordStrength(password)
          if (!passwordValidation.isValid) {
            return NextResponse.json(
              {
                error: "Password does not meet security requirements",
                details: passwordValidation.errors,
              },
              { status: 400 }
            )
          }

          const employee = await prisma.employees.findUnique({
            where: { id: employeeRecordId },
            include: {
              users: {
                select: { id: true, passwordHash: true, isActive: true },
              },
            },
          })

          if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
          }
          if (employee.status === 'ARCHIVED') {
            return NextResponse.json({ error: "Archived employees cannot be given a login" }, { status: 400 })
          }
          if (employee.users?.passwordHash && employee.users.isActive) {
            return NextResponse.json(
              { error: "This employee already has a login. Change the access level from the user list." },
              { status: 409 }
            )
          }

          const emailOwner = await prisma.users.findUnique({
            where: { email: employee.email },
            include: { employees: { select: { id: true } } },
          })
          if (emailOwner?.employees && emailOwner.employees.id !== employee.id) {
            return NextResponse.json(
              { error: "This email is already used by another employee login" },
              { status: 409 }
            )
          }

          const hashedPassword = await bcrypt.hash(password, 10)
          const roleConfig = accessConfigForRole(role)
          const loginUser = emailOwner
            ? await prisma.users.update({
                where: { id: emailOwner.id },
                data: {
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  department: employee.department || 'Unassigned',
                  position: employee.position,
                  employeeId: employee.employeeId,
                  role: role as any,
                  passwordHash: hashedPassword,
                  isActive: true,
                  updatedAt: new Date(),
                },
              })
            : await prisma.users.create({
                data: {
                  id: randomUUID(),
                  email: employee.email,
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  department: employee.department || 'Unassigned',
                  position: employee.position,
                  employeeId: employee.employeeId,
                  role: role as any,
                  passwordHash: hashedPassword,
                  isActive: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              })

          await prisma.employees.update({
            where: { id: employee.id },
            data: {
              userId: loginUser.id,
              access_level: roleConfig.accessLevel,
              document_security_clearance: roleConfig.documentLevel,
              access_revoked: false,
              updatedAt: new Date(),
            },
          })

          emailService.sendWelcomeEmail(
            loginUser.email,
            loginUser.firstName || employee.firstName,
            loginUser.email,
            password
          ).catch((err) => console.error('Failed to send welcome email:', err))

          return NextResponse.json({
            success: true,
            message: `Login created for ${employee.firstName} ${employee.lastName}`,
          })
        } catch (error) {
          console.error("Error activating employee login:", error)
          return NextResponse.json({ error: "Failed to create login" }, { status: 500 })
        }

      case 'create_user':
        return NextResponse.json(
          { error: "Create the employee in HR first. Logins are issued from the waiting list." },
          { status: 400 }
        )
      case 'update_user':
        try {
          if (!userId) {
            return NextResponse.json(
              { error: "User ID is required for update" },
              { status: 400 }
            )
          }

          // Check if user exists
          const existingUser = await prisma.users.findUnique({
            where: { id: userId }
          })

          if (!existingUser) {
            return NextResponse.json(
              { error: "User not found" },
              { status: 404 }
            )
          }

          // Prepare update data
          const updateData: any = {
            updatedAt: new Date()
          }

          if (userData.firstName) updateData.firstName = userData.firstName
          if (userData.lastName) updateData.lastName = userData.lastName
          if (userData.email) updateData.email = userData.email
          if (userData.role) updateData.role = userData.role
          if (userData.department) updateData.department = userData.department
          if (userData.position) updateData.position = userData.position

          // Hash password if provided
          if (userData.password && userData.password.trim()) {
            const passwordValidation = securityService.validatePasswordStrength(userData.password)
            if (!passwordValidation.isValid) {
              return NextResponse.json(
                {
                  error: "Password does not meet security requirements",
                  details: passwordValidation.errors,
                },
                { status: 400 }
              )
            }
            updateData.passwordHash = await bcrypt.hash(userData.password, 10)
            console.log('🔒 Password hashed successfully, hash length:', updateData.passwordHash.length)
          } else {
            console.log('🔒 No password update requested')
          }

          console.log('🔄 Updating user with data:', {
            ...updateData,
            passwordHash: updateData.passwordHash ? '[HASHED]' : undefined
          })

          // Update user
          const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: updateData,
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
              updatedAt: true,
            }
          })

          if (updatedUser.role) {
            const roleConfig = accessConfigForRole(updatedUser.role)
            await prisma.employees.updateMany({
              where: { userId },
              data: {
                access_level: roleConfig.accessLevel,
                document_security_clearance: roleConfig.documentLevel,
                ...(updatedUser.isActive ? { access_revoked: false } : {}),
                updatedAt: new Date(),
              },
            })
          }

          const transformedUser = {
            id: updatedUser.id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            position: updatedUser.position,
            employeeId: updatedUser.id,
            isActive: updatedUser.isActive,
            lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : null,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
            roles: [{
              role: {
                name: updatedUser.role || 'BASIC_USER_1',
                description: getRoleDisplayName(updatedUser.role || 'BASIC_USER_1')
              }
            }],
            permissions: getCombinedPermissions(updatedUser.role || 'BASIC_USER_1', updatedUser.department || '')
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
          if (!userId) {
            return NextResponse.json(
              { error: "User ID is required for deletion" },
              { status: 400 }
            )
          }

          // Check if user exists
          const existingUser = await prisma.users.findUnique({
            where: { id: userId }
          })

          if (!existingUser) {
            return NextResponse.json(
              { error: "User not found" },
              { status: 404 }
            )
          }

          await prisma.employees.updateMany({
            where: { userId },
            data: {
              userId: null,
              access_revoked: true,
              updatedAt: new Date(),
            },
          })

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
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
