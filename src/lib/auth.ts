import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import * as bcrypt from 'bcryptjs'

// Development users (in production, this would come from database)
const developmentUsers = [
  {
    id: "1",
    email: "admin@saywhat.org",
    password: "admin123",
    name: "System Administrator",
    department: "HR",
    position: "System Administrator",
    roles: ["superuser", "admin"],
    permissions: [
      // HR Module - Full Access
      "hr.full_access", "hr.view", "hr.create", "hr.edit", "hr.delete", 
      "hr.notifications", "hr.performance", "hr.training", "hr.employees",
      // Programs Module - Full Access  
      "programs.full_access", "programs.view", "programs.create", "programs.edit", "programs.delete",
      "programs.me_access", "programs.upload", "programs.documents", "programs.progress", 
      "programs.indicators", "programs.analysis", "programs.head", "programs.kobo",
      // Call Centre Module - Full Access
      "callcentre.access", "callcentre.officer", "callcentre.admin", "callcentre.reports", 
      "callcentre.management", "callcentre.cases", "callcentre.data_entry", "callcentre.view",
      "callcentre.create", "callcentre.edit", "callcentre.delete",
      // Inventory Module - Full Access
      "inventory.full_access", "inventory.view", "inventory.create", "inventory.edit", "inventory.delete",
      "inventory.rfid", "inventory.tracking", "inventory.reports",
      // Documents Module - Full Access
      "documents.full_access", "documents.view", "documents.create", "documents.edit", "documents.delete",
      "documents.ai", "documents.search", "documents.upload", "documents.download", "documents.share",
      "documents.workflow", "documents.approve", "documents.security", "documents.classify", 
      "documents.analytics", "documents.audit", "documents.version", "documents.metadata",
      "documents.microsoft365", "documents.sharepoint", "documents.teams", "documents.onedrive",
      // Analytics & Dashboard - Full Access
      "analytics.full_access", "analytics.view", "analytics.create", "analytics.reports",
      "dashboard.full_access", "dashboard.view", "dashboard.widgets",
      // System Administration - Full Access
      "admin.access", "admin.users", "admin.roles", "admin.settings", "admin.audit", "admin.apikeys", 
      "admin.database", "admin.server", "system.admin", "system.settings", "system.users", 
      "system.permissions", "system.audit"
    ]
  },
  {
    id: "2", 
    email: "hr@saywhat.org",
    password: "hr123",
    name: "HR Manager",
    department: "Human Resources",
    position: "HR Manager", 
    roles: ["hr_manager"],
    permissions: ["hr.full_access", "hr.notifications"]
  },
  {
    id: "3",
    email: "supervisor@saywhat.org", 
    password: "supervisor123",
    name: "Department Supervisor",
    department: "Operations",
    position: "Supervisor",
    roles: ["supervisor"],
    permissions: ["hr.view", "programs.view", "programs.head", "callcentre.access"]
  },
  {
    id: "4",
    email: "employee@saywhat.org",
    password: "employee123", 
    name: "Employee User",
    department: "Operations",
    position: "Field Officer",
    roles: ["employee"],
    permissions: ["hr.view", "programs.view"]
  },
  {
    id: "5",
    email: "me@saywhat.org",
    password: "me123",
    name: "M&E Officer",
    department: "Programs",
    position: "M&E Officer",
    roles: ["me_officer"],
    permissions: ["programs.me_access", "programs.create", "programs.edit", "programs.delete", "programs.indicators"]
  },
  {
    id: "6",
    email: "cam@saywhat.org",
    password: "cam123",
    name: "CAM Officer",
    department: "Programs",
    position: "CAM Officer",
    roles: ["cam_officer"],
    permissions: ["programs.view", "programs.upload", "programs.documents", "programs.progress"]
  },
  {
    id: "7",
    email: "research@saywhat.org",
    password: "research123",
    name: "Research Officer",
    department: "Programs",
    position: "Research Officer",
    roles: ["research_officer"],
    permissions: ["programs.view", "programs.upload", "programs.documents", "programs.progress", "programs.analysis"]
  },
  {
    id: "8",
    email: "programs@saywhat.org",
    password: "programs123",
    name: "Programs Officer",
    department: "Programs",
    position: "Programs Officer",
    roles: ["programs_officer"],
    permissions: ["programs.view", "programs.upload", "programs.documents", "programs.progress"]
  },
  {
    id: "9",
    email: "callcentre.head@saywhat.org",
    password: "callcentre123",
    name: "Call Centre Head",
    department: "Call Centre",
    position: "Call Centre Head",
    roles: ["callcentre_head"],
    permissions: ["callcentre.access", "callcentre.officer", "callcentre.admin", "callcentre.reports", "callcentre.management"]
  },
  {
    id: "10",
    email: "mary.chikuni@saywhat.org",
    password: "officer123",
    name: "Mary Chikuni",
    department: "Call Centre",
    position: "Call Centre Officer",
    roles: ["callcentre_officer"],
    permissions: ["callcentre.access", "callcentre.officer", "callcentre.cases", "callcentre.data_entry"]
  },
  {
    id: "11",
    email: "david.nyathi@saywhat.org",
    password: "officer123",
    name: "David Nyathi",
    department: "Call Centre",
    position: "Call Centre Officer",
    roles: ["callcentre_officer"],
    permissions: ["callcentre.access", "callcentre.officer", "callcentre.cases", "callcentre.data_entry"]
  },
  {
    id: "12",
    email: "alice.mandaza@saywhat.org",
    password: "officer123",
    name: "Alice Mandaza",
    department: "Call Centre",
    position: "Call Centre Officer",
    roles: ["callcentre_officer"],
    permissions: ["callcentre.access", "callcentre.officer", "callcentre.cases", "callcentre.data_entry"]
  },
  {
    id: "13",
    email: "peter.masvingo@saywhat.org",
    password: "officer123",
    name: "Peter Masvingo",
    department: "Call Centre",
    position: "Call Centre Officer",
    roles: ["callcentre_officer"],
    permissions: ["callcentre.access", "callcentre.officer", "callcentre.cases", "callcentre.data_entry"]
  },
  {
    id: "14",
    email: "callcentre@saywhat.org",
    password: "call123",
    name: "Call Centre Test User",
    department: "Call Centre",
    position: "Call Centre Officer",
    roles: ["callcentre_officer"],
    permissions: ["callcentre.access", "callcentre.officer", "callcentre.cases", "callcentre.data_entry", "callcentre.view"]
  }
]

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

  const rolePermissions = {
    'BASIC_USER_1': [
      ...basePermissions,
      'call_center_view',
      'documents_view',
      'documents.view'
    ],
    'BASIC_USER_2': [
      ...basePermissions,
      'programs_view',
      'inventory_view',
      'documents.view'
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
      'documents.edit'
    ],
    'SYSTEM_ADMINISTRATOR': [
      'full_access',
      'admin_panel',
      'user_management',
      'system_settings',
      'security_management',
      'audit_logs',
      'hr.full_access',
      'programs.full_access',
      'callcentre.access',
      'callcentre.admin',
      'inventory.full_access',
      'documents.full_access',
      'analytics.full_access',
      'admin.access'
    ]
  }
  
  const departmentPermissions: Record<string, string[]> = {
    'Call Center (CC)': ['callcentre.access', 'callcentre.officer', 'callcentre.cases'],
    'HR': ['hr_policies', 'staff_management'],
    'FINANCE': ['financial_reports', 'budget_management'],
    'PROGRAMS': ['project_management', 'field_operations']
  }
  
  const rolePerms = rolePermissions[role as keyof typeof rolePermissions] || basePermissions
  const deptPerms = departmentPermissions[department] || []
  
  // Combine and deduplicate permissions
  const combined = rolePerms.concat(deptPerms)
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        console.log('🔐 LOGIN ATTEMPT:', credentials.email)

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
              isActive: true
            }
          })

          if (dbUser && dbUser.isActive) {
            console.log('✅ Database user found:', dbUser.email)
            console.log('🔍 Password hash exists:', !!dbUser.passwordHash)
            console.log('🔍 Password hash length:', dbUser.passwordHash ? dbUser.passwordHash.length : 0)
            
            // Verify password against hash - only if hash exists
            if (!dbUser.passwordHash) {
              console.log('⚠️ No password hash found for database user, skipping database auth')
            } else {
              try {
                const passwordMatch = await bcrypt.compare(credentials.password, String(dbUser.passwordHash))
                
                if (passwordMatch) {
                  console.log('✅ Password verified for database user')
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

                  // Map database user to auth format
                  return {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: `${dbUser.firstName} ${dbUser.lastName}`,
                    department: dbUser.department || 'Unassigned',
                    position: dbUser.position || 'No Position',
                    roles: dbUser.roles || [dbUser.role || 'BASIC_USER_1'],
                    permissions: getUserPermissions(dbUser.role || 'BASIC_USER_1', dbUser.department || '')
                  }
                } else {
                  console.log('❌ Password mismatch for database user')
                }
              } catch (bcryptError) {
                console.error('❌ bcrypt comparison error:', bcryptError)
              }
            }
          } else {
            console.log('⚠️ User not found in database or inactive')
          }
        } catch (error) {
          console.error('❌ Database authentication error:', error)
          // Continue to development users fallback
        }

        // Fallback to development users for development/testing
        console.log('🔄 Falling back to development users...')
        const user = developmentUsers.find(u => u.email === credentials.email)
        
        if (!user || user.password !== credentials.password) {
          console.log('❌ User not found in development users or password mismatch')
          return null
        }

        console.log('✅ Development user authenticated:', user.email)
        
        // Try to update lastLogin for development user if they exist in database
        try {
          const dbUserForUpdate = await prisma.users.findUnique({
            where: { email: user.email }
          })
          
          if (dbUserForUpdate) {
            await prisma.users.update({
              where: { email: user.email },
              data: { lastLogin: new Date() }
            })
            console.log('✅ Updated lastLogin for development user in database:', user.email)
          } else {
            console.log('⚠️ Development user not found in database, cannot update lastLogin')
          }
        } catch (updateError) {
          console.error('❌ Failed to update lastLogin for development user:', updateError)
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          department: user.department,
          position: user.position,
          roles: user.roles,
          permissions: getUserPermissions(user.roles[0] || 'BASIC_USER_1', user.department || '')
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
