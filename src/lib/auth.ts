import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import * as bcrypt from 'bcryptjs'
import { securityService } from "@/lib/security-service"
import AuditLogger from "@/lib/audit-logger"
import { isTwoFactorEnabled, verifyTwoFactorToken, verifyAndConsumeBackupCode } from "@/lib/two-factor-auth"

// Development users REMOVED for security
// All authentication now uses database only with proper password hashing
// Users must be created through the admin panel or database migrations
const developmentUsers: any[] = []

// Helper function to normalize role names to handle different formats
function normalizeRoleName(role: string): string {
  if (!role) return 'BASIC_USER_1'
  // Uppercase and unify common separators to underscore
  const upper = role.trim().toUpperCase().replace(/[-\s]+/g, '_')

  // Map common role variations to standard names
  const roleMap: Record<string, string> = {
    'SUPERUSER': 'SYSTEM_ADMINISTRATOR',
    'ADMIN': 'SYSTEM_ADMINISTRATOR',
    'ADMINISTRATOR': 'SYSTEM_ADMINISTRATOR',
    'SYS_ADMIN': 'SYSTEM_ADMINISTRATOR',
    'SYSTEM_ADMIN': 'SYSTEM_ADMINISTRATOR',
    'SYSTEM_ADMINISTRATOR': 'SYSTEM_ADMINISTRATOR',
    'HR_MANAGER': 'HR',
    'HR_OFFICER': 'HR',
    'HUMAN_RESOURCES': 'HR'
  }

  return roleMap[upper] || upper
}

// Get union permissions for multiple roles
function getPermissionsForRoles(roles: string[] | undefined | null, department: string): string[] {
  const roleList = (roles && roles.length ? roles : ['BASIC_USER_1']).map(r => normalizeRoleName(r))
  // Deduplicate normalized roles to avoid redundant work
  const uniqueRoles = Array.from(new Set(roleList))
  const collected = new Set<string>()
  // Always include baseline permissions
  ;['dashboard','personalProfile','documents','performance_plans','appraisals','training'].forEach(p => collected.add(p))
  for (const r of uniqueRoles) {
    getUserPermissions(r, department).forEach(p => collected.add(p))
  }
  return Array.from(collected)
}

// Helper function to get user permissions based on role and department
function getUserPermissions(role: string, department: string): string[] {
  // Common baseline permissions for all users
  const basePermissions = [
    'dashboard',
    'personalProfile',
    'documents',
    'performance_plans',
    'appraisals',
    'training'
  ]

  // Normalize role names to handle different formats
  const normalizedRole = normalizeRoleName(role)

  const rolePermissions = {
    'BASIC_USER_1': [
      ...basePermissions,
      // Call Centre - Full data capture permissions
      'call_center_view',
      'call_center_full',
      'calls.view',
      'calls.create',
      'calls.edit',
      'callcentre.access',
      'callcentre.view',
      'callcentre.officer',
      'callcentre.data_entry',
      'callcentre.cases',
      'callcentre.create',
      // Documents
      'documents_view',
      'documents.view'
    ],
    'BASIC_USER_2': [
      ...basePermissions,
      // Programs - Full data capture permissions
      'programs_view',
      'programs.view',
      'programs.create',
      'programs.edit',
      'programs_edit',
      'programs.upload',
      'programs.documents',
      'programs.progress',
      'programs.indicators',
      'programs.data_entry',
      // Inventory
      'inventory_view',
      'inventory.view',
      // Documents
      'documents.view',
      'documents_view'
    ],
    'ADVANCE_USER_1': [
      ...basePermissions,
      'call_center_full',
      'programs_edit',
      'risks_edit',
      'reports_generate',
      'callcentre.access',
      'callcentre.officer',
      'callcentre.cases',
      'callcentre.data_entry',
      // Document Repository permissions
      'documents.view',
      'documents.create',
      'documents.edit',
      'documents_edit',
      'documents_view',
      // Risk Management permissions
      'risk.view',
      'risk.edit',
      'risk.create'
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
      'employee_reports',
      'documents.view',
      'documents.create',
      'documents.edit',
      'risks_edit',
      'risks.edit'
    ],
    'SYSTEM_ADMINISTRATOR': [
      'full_access',
      'admin_panel',
      'user_management',
      'system_settings',
      'security_management',
      'audit_logs',
      // HR
      'hr.full_access',
      'hr.view',
      'hr_full',
      // Programs
      'programs.full_access',
      // Call Centre
      'callcentre.access',
      'callcentre.admin',
      // Inventory
      'inventory.full_access',
      // Documents
      'documents.full_access',
      // Analytics
      'analytics.full_access',
      // Admin - comprehensive permissions
      'admin.access',
      'admin.users',
      'admin.roles',
      'admin.settings',
      'admin.audit',
      'admin.apikeys',
      'admin.database',
      'admin.server',
      // Risk Management
      'risks_edit',
      'risks.edit',
      // Dashboard (ensure full dashboard access)
      'dashboard',
      'dashboard.view',
      'dashboard.full_access'
    ],
    // Legacy role mappings for backward compatibility
    'superuser': [
      'full_access',
      'admin.access',
      'admin.users',
      'admin.roles',
      'admin.settings',
      'admin.audit',
      'admin.apikeys',
      'admin.database',
      'admin.server',
      // HR
      'hr.full_access',
      'hr.view',
      'hr_full',
      // Programs
      'programs.full_access',
      // Call Centre
      'callcentre.access',
      'callcentre.admin',
      // Inventory
      'inventory.full_access',
      // Documents
      'documents.full_access',
      // Analytics
      'analytics.full_access',
      // Risk Management
      'risks_edit',
      'risks.edit',
      // Dashboard
      'dashboard',
      'dashboard.view',
      'dashboard.full_access'
    ],
    'admin': [
      'full_access',
      'admin.access',
      'admin.users',
      'admin.roles',
      'admin.settings',
      'admin.audit',
      'admin.apikeys',
      'admin.database',
      'admin.server',
      // HR
      'hr.full_access',
      'hr.view',
      'hr_full',
      // Programs
      'programs.full_access',
      // Call Centre
      'callcentre.access',
      'callcentre.admin',
      // Inventory
      'inventory.full_access',
      // Documents
      'documents.full_access',
      // Analytics
      'analytics.full_access',
      // Risk Management
      'risks_edit',
      'risks.edit',
      // Dashboard
      'dashboard',
      'dashboard.view',
      'dashboard.full_access'
    ]
  }
  
  const departmentPermissions: Record<string, string[]> = {
    'Call Center (CC)': ['callcentre.access', 'callcentre.officer', 'callcentre.cases'],
    'HR': ['hr_policies', 'staff_management'],
    'FINANCE': ['financial_reports', 'budget_management'],
    'PROGRAMS': ['project_management', 'field_operations']
  }
  
  const rolePerms = rolePermissions[normalizedRole as keyof typeof rolePermissions] || []
  const deptPerms = departmentPermissions[department] || []
  
  // Debug logging for role resolution
  console.log(`🔍 Role Resolution: '${role}' -> '${normalizedRole}' -> permissions:`, rolePerms.length)
  
  // Combine and deduplicate permissions (always include baseline permissions)
  const combined = basePermissions.concat(rolePerms, deptPerms)
  return Array.from(new Set(combined))
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Get IP address for brute force protection and audit logging
        const ipAddress = (request?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                         (request?.headers?.['x-real-ip'] as string) ||
                         'unknown'
        const userAgent = (request?.headers?.['user-agent'] as string) || 'unknown'
        
        // Use email + IP as identifier for brute force protection
        const identifier = `${credentials.email}:${ipAddress}`

        console.log('🔐 LOGIN ATTEMPT:', credentials.email, 'from IP:', ipAddress)

        // Check if account is locked due to brute force attempts
        if (securityService.isAccountLocked(identifier)) {
          console.log('🚫 Account locked due to brute force attempts:', credentials.email)
          // Log security violation
          await AuditLogger.logSecurityEvent(
            'BRUTE_FORCE_LOCKED',
            {
              email: credentials.email,
              ipAddress,
              userAgent,
              reason: 'Account locked due to multiple failed login attempts',
              timestamp: new Date().toISOString()
            },
            undefined, // No user ID for failed login
            ipAddress,
            userAgent
          ).catch(err => console.error('Failed to log security event:', err))
          
          return null
        }

        let authenticationSuccess = false
        let authenticatedUser: any = null

        try {
          // First, try to find user in database
          console.log('🔍 Checking database for user...')
          const dbUser = await prisma.users.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              passwordHash: true,
              department: true,
              position: true,
              role: true,
              roles: true,
              isActive: true,
              twoFactorEnabled: true,
              twoFactorSecret: true
            }
          })

          if (dbUser && dbUser.isActive) {
            console.log('✅ Database user found:', dbUser.email)
            console.log('🔍 Password hash exists:', !!dbUser.passwordHash)
            
            // Verify password against hash - only if hash exists
            if (!dbUser.passwordHash) {
              console.log('⚠️ No password hash found for database user, skipping database auth')
            } else {
              try {
                const passwordMatch = await bcrypt.compare(credentials.password, String(dbUser.passwordHash))
                
                if (passwordMatch) {
                  console.log('✅ Password verified for database user')
                  
                  // Check if 2FA is enabled
                  if (dbUser.twoFactorEnabled && dbUser.twoFactorSecret) {
                    const twoFactorToken = (credentials as any).twoFactorToken;
                    const backupCode = (credentials as any).backupCode;
                    
                    // Require 2FA token or backup code
                    if (!twoFactorToken && !backupCode) {
                      console.log('🔐 2FA required but token not provided')
                      // Return special error that frontend can handle
                      throw new Error('2FA_REQUIRED')
                    }
                    
                    // Verify 2FA token or backup code
                    let twoFactorValid = false;
                    if (twoFactorToken) {
                      twoFactorValid = verifyTwoFactorToken(twoFactorToken, dbUser.twoFactorSecret);
                    } else if (backupCode) {
                      twoFactorValid = await verifyAndConsumeBackupCode(dbUser.id, backupCode);
                    }
                    
                    if (!twoFactorValid) {
                      console.log('❌ 2FA verification failed')
                      // Record failed attempt
                      securityService.recordFailedAttempt(identifier)
                      
                      // Log failed 2FA attempt
                      await AuditLogger.logSecurityEvent(
                        '2FA_VERIFICATION_FAILED',
                        {
                          userId: dbUser.id,
                          email: dbUser.email,
                          timestamp: new Date().toISOString()
                        },
                        dbUser.id,
                        ipAddress,
                        userAgent
                      ).catch(err => console.error('Failed to log 2FA failure:', err))
                      
                      return null
                    }
                    
                    console.log('✅ 2FA verified successfully')
                  }
                  
                  authenticationSuccess = true
                  
                  // Clear failed attempts on successful login
                  securityService.clearFailedAttempts(identifier)
                  
                  // Update lastLogin timestamp for database users
                  try {
                    await prisma.users.update({
                      where: { id: dbUser.id },
                      data: { lastLogin: new Date() }
                    })
                    console.log('✅ Updated lastLogin for user:', dbUser.email)
                  } catch (updateError) {
                    console.error('❌ Failed to update lastLogin:', updateError)
                  }

                  // Log successful login
                  await AuditLogger.logLogin(
                    dbUser.id,
                    dbUser.email,
                    ipAddress,
                    userAgent,
                    true
                  ).catch(err => console.error('Failed to log login:', err))

                  // Map database user to auth format
                  const userRoles = dbUser.roles && dbUser.roles.length ? dbUser.roles : [dbUser.role || 'BASIC_USER_1']
                  
                  authenticatedUser = {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: `${dbUser.firstName} ${dbUser.lastName}`,
                    department: dbUser.department || 'Unassigned',
                    position: dbUser.position || 'No Position',
                    roles: userRoles,
                    // Union permissions across all roles so admins don't lose capabilities
                    permissions: getPermissionsForRoles(userRoles, dbUser.department || '')
                  }
                } else {
                  console.log('❌ Password mismatch for database user')
                  // Record failed attempt
                  const isLocked = securityService.recordFailedAttempt(identifier)
                  if (isLocked) {
                    console.log('🚫 Account locked after multiple failed attempts')
                  }
                  
                  // Log failed login attempt
                  await AuditLogger.logLogin(
                    dbUser.id,
                    dbUser.email,
                    ipAddress,
                    userAgent,
                    false
                  ).catch(err => console.error('Failed to log failed login:', err))
                }
              } catch (bcryptError) {
                console.error('❌ bcrypt comparison error:', bcryptError)
                // Record failed attempt
                securityService.recordFailedAttempt(identifier)
              }
            }
          } else {
            console.log('⚠️ User not found in database or inactive')
          }
        } catch (error) {
          console.error('❌ Database authentication error:', error)
          // Record failed attempt for database errors
          securityService.recordFailedAttempt(identifier)
        }

        // If authentication succeeded, return user
        if (authenticationSuccess && authenticatedUser) {
          return authenticatedUser
        }

        // Fallback to development users ONLY if user doesn't exist in database
        // This prevents old hardcoded passwords from working after password change
        const devUser = developmentUsers.find(u => u.email === credentials.email)
        
        if (devUser) {
          // Check if this user exists in database
          try {
            const existsInDb = await prisma.users.findUnique({
              where: { email: devUser.email },
              select: { id: true, passwordHash: true }
            })
            
            if (existsInDb && existsInDb.passwordHash) {
              // User exists in database with a password hash - DO NOT use dev password
              console.log('❌ User exists in database, dev password disabled for security')
              // Record failed attempt
              securityService.recordFailedAttempt(identifier)
              return null
            }
          } catch (err) {
            console.error('Error checking database for dev user:', err)
          }
        }

        // Only use dev users if they don't exist in database
        console.log('🔄 Falling back to development users...')
        
        if (!devUser || devUser.password !== credentials.password) {
          console.log('❌ User not found in development users or password mismatch')
          // Record failed attempt
          securityService.recordFailedAttempt(identifier)
          
          // Log failed login attempt (no user ID available)
          await AuditLogger.logSecurityEvent(
            'LOGIN_FAILURE',
            {
              email: credentials.email,
              ipAddress,
              userAgent,
              reason: 'Invalid credentials',
              timestamp: new Date().toISOString()
            },
            undefined,
            ipAddress,
            userAgent
          ).catch(err => console.error('Failed to log security event:', err))
          
          return null
        }

        console.log('✅ Development user authenticated (not in database):', devUser.email)
        
        // Clear failed attempts on successful login
        securityService.clearFailedAttempts(identifier)
        
        // Try to update lastLogin for development user if they exist in database
        try {
          const dbUserForUpdate = await prisma.users.findUnique({
            where: { email: devUser.email }
          })
          
          if (dbUserForUpdate) {
            await prisma.users.update({
              where: { email: devUser.email },
              data: { lastLogin: new Date() }
            })
            console.log('✅ Updated lastLogin for development user in database:', devUser.email)
            
            // Log successful login
            await AuditLogger.logLogin(
              dbUserForUpdate.id,
              devUser.email,
              ipAddress,
              userAgent,
              true
            ).catch(err => console.error('Failed to log login:', err))
          } else {
            console.log('⚠️ Development user not found in database, cannot update lastLogin')
          }
        } catch (updateError) {
          console.error('❌ Failed to update lastLogin for development user:', updateError)
        }
        
        return {
          id: devUser.id,
          email: devUser.email,
          name: devUser.name,
          department: devUser.department,
          position: devUser.position,
          roles: devUser.roles,
          // Use union for dev users too
          permissions: getPermissionsForRoles(devUser.roles, devUser.department || '')
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // Handle new login
      if (user) {
        token.id = user.id
        token.department = (user as any).department
        token.position = (user as any).position
        token.roles = (user as any).roles
        token.permissions = (user as any).permissions
      }
      return token
    },
    async session({ session, token }) {
      // Handle potential token decryption issues gracefully
      try {
        if (token) {
          (session.user as any).id = token.id as string
          (session.user as any).department = token.department as string
          (session.user as any).position = token.position as string
          (session.user as any).roles = token.roles as string[]
          (session.user as any).permissions = token.permissions as string[]
        }
      } catch (error) {
        console.error('Session callback error:', error)
        // Return session without additional data if token is corrupted
        return session
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  }
}
