// Comprehensive audit logging utility
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export interface AuditLogData {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  severity?: 'info' | 'warning' | 'error' | 'critical'
  outcome?: 'success' | 'failure' | 'warning'
}

export class AuditLogger {
  private static async createLogEntry(data: AuditLogData) {
    try {
      const logEntry = await prisma.audit_logs.create({
        data: {
          id: randomUUID(),
          userId: data.userId || null,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId || null,
          details: data.details || {},
          ipAddress: data.ipAddress || '127.0.0.1',
          userAgent: data.userAgent || 'System',
          timestamp: new Date()
        }
      })
      return logEntry
    } catch (error) {
      console.error('Failed to create audit log:', error)
      return null
    }
  }

  // Authentication & Security Logs
  static async logLogin(userId: string, email: string, ipAddress?: string, userAgent?: string, success: boolean = true) {
    return this.createLogEntry({
      userId,
      action: success ? 'USER_LOGIN_SUCCESS' : 'USER_LOGIN_FAILURE',
      resource: 'Authentication',
      details: {
        email,
        loginTime: new Date().toISOString(),
        method: 'email_password'
      },
      ipAddress,
      userAgent,
      severity: success ? 'info' : 'warning',
      outcome: success ? 'success' : 'failure'
    })
  }

  static async logLogout(userId: string, email: string, ipAddress?: string, userAgent?: string) {
    return this.createLogEntry({
      userId,
      action: 'USER_LOGOUT',
      resource: 'Authentication',
      details: {
        email,
        logoutTime: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      severity: 'info',
      outcome: 'success'
    })
  }

  static async logSecurityEvent(action: string, details: any, userId?: string, ipAddress?: string, userAgent?: string) {
    return this.createLogEntry({
      userId,
      action: `SECURITY_${action.toUpperCase()}`,
      resource: 'Security',
      details,
      ipAddress,
      userAgent,
      severity: 'warning',
      outcome: 'warning'
    })
  }

  // Data Access Logs
  static async logDataAccess(userId: string, resource: string, resourceId: string, action: 'VIEW' | 'FETCH' | 'SEARCH', details?: any, ipAddress?: string, userAgent?: string) {
    return this.createLogEntry({
      userId,
      action: `DATA_${action}`,
      resource,
      resourceId,
      details: {
        ...details,
        accessTime: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      severity: 'info',
      outcome: 'success'
    })
  }

  // CRUD Operations
  static async logCreate(userId: string, resource: string, resourceId: string, details?: any, ipAddress?: string, userAgent?: string) {
    return this.createLogEntry({
      userId,
      action: 'CREATE',
      resource,
      resourceId,
      details: {
        ...details,
        createdAt: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      severity: 'info',
      outcome: 'success'
    })
  }

  static async logUpdate(userId: string, resource: string, resourceId: string, oldValues?: any, newValues?: any, ipAddress?: string, userAgent?: string) {
    return this.createLogEntry({
      userId,
      action: 'UPDATE',
      resource,
      resourceId,
      details: {
        oldValues,
        newValues,
        updatedAt: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      severity: 'info',
      outcome: 'success'
    })
  }

  static async logDelete(userId: string, resource: string, resourceId: string, details?: any, ipAddress?: string, userAgent?: string) {
    return this.createLogEntry({
      userId,
      action: 'DELETE',
      resource,
      resourceId,
      details: {
        ...details,
        deletedAt: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      severity: 'warning',
      outcome: 'success'
    })
  }

  // Page/Route Access Logs
  static async logPageVisit(userId: string | null, page: string, ipAddress?: string, userAgent?: string) {
    return this.createLogEntry({
      userId: userId || undefined,
      action: 'PAGE_VISIT',
      resource: 'Navigation',
      details: {
        page,
        visitTime: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      severity: 'info',
      outcome: 'success'
    })
  }

  // API Access Logs
  static async logAPIAccess(userId: string | null, endpoint: string, method: string, statusCode: number, ipAddress?: string, userAgent?: string) {
    return this.createLogEntry({
      userId: userId || undefined,
      action: `API_${method.toUpperCase()}`,
      resource: 'API',
      details: {
        endpoint,
        method,
        statusCode,
        accessTime: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      severity: statusCode >= 400 ? 'error' : 'info',
      outcome: statusCode >= 400 ? 'failure' : 'success'
    })
  }

  // System Events
  static async logSystemEvent(action: string, details: any, severity: 'info' | 'warning' | 'error' | 'critical' = 'info') {
    return this.createLogEntry({
      action: `SYSTEM_${action.toUpperCase()}`,
      resource: 'System',
      details: {
        ...details,
        timestamp: new Date().toISOString()
      },
      severity,
      outcome: severity === 'error' || severity === 'critical' ? 'failure' : 'success'
    })
  }

  // Error Logs
  static async logError(error: Error, userId?: string, resource?: string, ipAddress?: string, userAgent?: string) {
    return this.createLogEntry({
      userId,
      action: 'ERROR',
      resource: resource || 'System',
      details: {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      severity: 'error',
      outcome: 'failure'
    })
  }
}

export default AuditLogger