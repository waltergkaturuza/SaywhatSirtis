// NextAuth audit integration
import { NextAuthOptions } from 'next-auth'
import AuditLogger from '@/lib/audit-logger'

export const auditAuthEvents = {
  async signIn(user: any, account: any, profile: any, isNewUser: boolean, request: any) {
    try {
      const ipAddress = request?.headers?.['x-forwarded-for'] || request?.headers?.['x-real-ip'] || 'unknown'
      const userAgent = request?.headers?.['user-agent'] || 'unknown'
      
      await AuditLogger.logLogin(
        user.id,
        user.email,
        ipAddress,
        userAgent,
        true // successful login
      )
      
      if (isNewUser) {
        await AuditLogger.logCreate(
          user.id,
          'User Management',
          user.id,
          {
            email: user.email,
            name: user.name,
            provider: account?.provider,
            registrationMethod: 'oauth'
          },
          ipAddress,
          userAgent
        )
      }
    } catch (error) {
      console.error('Failed to log sign-in event:', error)
    }
  },

  async signOut(session: any, request: any) {
    try {
      const ipAddress = request?.headers?.['x-forwarded-for'] || request?.headers?.['x-real-ip'] || 'unknown'
      const userAgent = request?.headers?.['user-agent'] || 'unknown'
      
      if (session?.user) {
        await AuditLogger.logLogout(
          session.user.id,
          session.user.email,
          ipAddress,
          userAgent
        )
      }
    } catch (error) {
      console.error('Failed to log sign-out event:', error)
    }
  },

  async session(session: any, user: any, request: any) {
    // Log session access for security monitoring
    try {
      if (session?.user && Math.random() < 0.1) { // Log 10% of session accesses to avoid spam
        const ipAddress = request?.headers?.['x-forwarded-for'] || request?.headers?.['x-real-ip'] || 'unknown'
        const userAgent = request?.headers?.['user-agent'] || 'unknown'
        
        await AuditLogger.logSecurityEvent(
          'SESSION_ACCESS',
          {
            userId: session.user.id,
            email: session.user.email,
            sessionId: session.sessionToken
          },
          session.user.id,
          ipAddress,
          userAgent
        )
      }
    } catch (error) {
      console.error('Failed to log session event:', error)
    }
  }
}

// Middleware to log failed authentication attempts
export const logFailedAuth = async (email: string, reason: string, request: any) => {
  try {
    const ipAddress = request?.headers?.['x-forwarded-for'] || request?.headers?.['x-real-ip'] || 'unknown'
    const userAgent = request?.headers?.['user-agent'] || 'unknown'
    
    await AuditLogger.logSecurityEvent(
      'LOGIN_FAILURE',
      {
        email,
        reason,
        timestamp: new Date().toISOString()
      },
      undefined, // No user ID for failed login
      ipAddress,
      userAgent
    )
  } catch (error) {
    console.error('Failed to log authentication failure:', error)
  }
}

export default auditAuthEvents