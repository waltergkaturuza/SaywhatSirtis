// React hook for easy audit logging
import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

export interface AuditAction {
  action: string
  resource: string
  resourceId?: string
  details?: any
}

export const useAuditLog = () => {
  const { data: session } = useSession()

  const logAction = useCallback(async (auditData: AuditAction) => {
    try {
      const response = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          action: auditData.action,
          resource: auditData.resource,
          resourceId: auditData.resourceId,
          details: {
            ...auditData.details,
            timestamp: new Date().toISOString(),
            userEmail: session?.user?.email
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Audit logging failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to log audit action:', error)
      // Don't throw - audit failures shouldn't break the app
      return null
    }
  }, [session])

  // Convenience methods for common actions
  const logPageVisit = useCallback((page: string) => {
    return logAction({
      action: 'PAGE_VISIT',
      resource: 'Navigation',
      details: { page, visitTime: new Date().toISOString() }
    })
  }, [logAction])

  const logDataAccess = useCallback((resource: string, resourceId: string, action: 'VIEW' | 'FETCH' | 'SEARCH' = 'VIEW') => {
    return logAction({
      action: `DATA_${action}`,
      resource,
      resourceId,
      details: { accessType: action }
    })
  }, [logAction])

  const logCreate = useCallback((resource: string, resourceId: string, data?: any) => {
    return logAction({
      action: 'CREATE',
      resource,
      resourceId,
      details: { createdData: data }
    })
  }, [logAction])

  const logUpdate = useCallback((resource: string, resourceId: string, oldData?: any, newData?: any) => {
    return logAction({
      action: 'UPDATE',
      resource,
      resourceId,
      details: { oldValues: oldData, newValues: newData }
    })
  }, [logAction])

  const logDelete = useCallback((resource: string, resourceId: string, data?: any) => {
    return logAction({
      action: 'DELETE',
      resource,
      resourceId,
      details: { deletedData: data }
    })
  }, [logAction])

  const logExport = useCallback((resource: string, format: string, recordCount?: number) => {
    return logAction({
      action: 'EXPORT',
      resource,
      details: { format, recordCount, exportTime: new Date().toISOString() }
    })
  }, [logAction])

  const logSearch = useCallback((resource: string, query: string, resultCount?: number) => {
    return logAction({
      action: 'SEARCH',
      resource,
      details: { query, resultCount, searchTime: new Date().toISOString() }
    })
  }, [logAction])

  const logSecurityEvent = useCallback((eventType: string, details: any) => {
    return logAction({
      action: `SECURITY_${eventType.toUpperCase()}`,
      resource: 'Security',
      details
    })
  }, [logAction])

  return {
    logAction,
    logPageVisit,
    logDataAccess,
    logCreate,
    logUpdate,
    logDelete,
    logExport,
    logSearch,
    logSecurityEvent
  }
}

export default useAuditLog