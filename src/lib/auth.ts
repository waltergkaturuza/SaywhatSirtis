import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Development users (in production, this would come from database)
const developmentUsers = [
  {
    id: "1",
    email: "admin@saywhat.org",
    password: "admin123",
    name: "System Administrator",
    department: "IT",
    position: "System Administrator",
    roles: ["admin"],
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

        // Find user in development users
        const user = developmentUsers.find(u => u.email === credentials.email)
        
        if (!user || user.password !== credentials.password) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          department: user.department,
          position: user.position,
          roles: user.roles,
          permissions: user.permissions
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.department = user.department
        token.position = user.position
        token.roles = user.roles
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.department = token.department as string
        session.user.position = token.position as string
        session.user.roles = token.roles as string[]
        session.user.permissions = token.permissions as string[]
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  }
}
