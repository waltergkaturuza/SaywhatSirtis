"use client"

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  EyeIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  GlobeAltIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userEmail: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  severity: string
  outcome: 'success' | 'failure' | 'warning'
}

interface AuditLogProps {
  className?: string
}

export function AdminAuditLog({ className = '' }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [dateRange, setDateRange] = useState('7d')

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/audit')
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }
      
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all audit logs?')) return

    try {
      const response = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear_logs'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to clear audit logs')
      }

      await fetchAuditLogs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear audit logs')
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesUser = selectedUser === '' || log.userEmail === selectedUser
    const matchesAction = selectedAction === '' || log.action === selectedAction
    
    return matchesSearch && matchesUser && matchesAction
  })

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failure':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <UserIcon className="h-4 w-4" />
      case 'view':
      case 'read':
        return <EyeIcon className="h-4 w-4" />
      case 'delete':
        return <TrashIcon className="h-4 w-4" />
      default:
        return <DocumentTextIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ShieldExclamationIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Audit Log</h2>
            <p className="text-sm text-gray-600">Track all system activities and user actions</p>
          </div>
        </div>
        <button
          onClick={handleClearLogs}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <TrashIcon className="h-5 w-5" />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-lg font-semibold text-gray-900">{logs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {logs.length > 0 ? Math.round((logs.filter(l => l.outcome === 'success').length / logs.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GlobeAltIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Unique IPs</p>
              <p className="text-lg font-semibold text-gray-900">
                {[...new Set(logs.map(l => l.ipAddress))].length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">All Users</option>
            {[...new Set(logs.map(l => l.userEmail))].map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
          >
            <option value="">All Actions</option>
            {[...new Set(logs.map(l => l.action))].map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[22%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Timestamp</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">User</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Resource</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Details</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Outcome</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">IP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const when = new Date(log.timestamp).toLocaleString()
                const detailTitle = log.userAgent ? `${log.details}\n${log.userAgent}` : log.details
                return (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="max-w-0 px-2 py-2 overflow-hidden">
                    <div className="truncate text-sm text-gray-900" title={when}>{when}</div>
                  </td>
                  <td className="max-w-0 px-2 py-2 overflow-hidden">
                    <div className="flex items-center min-w-0">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-xs">
                          {log.userEmail.split('@')[0][0].toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-2 min-w-0 truncate text-sm text-gray-900" title={log.userEmail}>{log.userEmail}</div>
                    </div>
                  </td>
                  <td className="max-w-0 px-2 py-2 overflow-hidden">
                    <div className="flex items-center min-w-0">
                      <div className="shrink-0 mr-1 text-gray-400">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="truncate text-sm text-gray-900" title={log.action}>{log.action}</div>
                    </div>
                  </td>
                  <td className="max-w-0 px-2 py-2 overflow-hidden">
                    <div className="truncate text-sm text-gray-900" title={log.resource}>{log.resource}</div>
                  </td>
                  <td className="max-w-0 px-2 py-2 overflow-hidden">
                    <div className="truncate text-sm text-gray-900" title={detailTitle}>{log.details}</div>
                  </td>
                  <td className="max-w-0 px-2 py-2 overflow-hidden">
                    <span className={`inline-flex max-w-full truncate px-2 py-0.5 text-xs font-medium rounded-full ${getOutcomeColor(log.outcome)}`} title={log.outcome}>
                      {log.outcome}
                    </span>
                  </td>
                  <td className="max-w-0 px-2 py-2 overflow-hidden">
                    <div className="truncate text-sm text-gray-900" title={log.ipAddress}>{log.ipAddress}</div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedUser || selectedAction ? 'Try adjusting your filters' : 'Audit logs will appear here when users perform actions'}
          </p>
        </div>
      )}
    </div>
  )
}
