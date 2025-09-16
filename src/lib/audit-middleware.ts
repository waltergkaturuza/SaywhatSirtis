// Audit middleware for Next.js
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AuditLogger from '@/lib/audit-logger'

export async function auditMiddleware(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null
    const userEmail = session?.user?.email || null
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    
    // Log API calls
    if (request.nextUrl.pathname.startsWith('/api/')) {
      await AuditLogger.logAPIAccess(
        userId,
        request.nextUrl.pathname,
        request.method,
        200, // Will be updated based on actual response
        ipAddress,
        userAgent
      )
    }
    
    // Log page visits for important pages
    const importantPages = [
      '/admin', '/dashboard', '/hr', '/inventory', '/call-centre', 
      '/programs', '/documents', '/risk-management', '/settings'
    ]
    
    if (importantPages.some(page => request.nextUrl.pathname.startsWith(page))) {
      await AuditLogger.logPageVisit(
        userId,
        request.nextUrl.pathname,
        ipAddress,
        userAgent
      )
    }

    // Log authentication events
    if (request.nextUrl.pathname.includes('/auth/signin') && request.method === 'POST') {
      // This will be handled by the sign-in callback
    }

  } catch (error) {
    console.error('Audit middleware error:', error)
    // Don't block requests due to audit failures
  }
}

// Enhanced audit utility for client-side logging
export const clientAuditLogger = {
  async logAction(action: string, resource: string, details?: any) {
    try {
      await fetch('/api/admin/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          resource,
          details,
          ipAddress: '', // Will be populated server-side
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Client audit logging failed:', error)
    }
  }
}

export default auditMiddleware