"use client"

import { useState, useEffect } from 'react'
import { 
  CircleStackIcon, 
  TableCellsIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface BackupSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly'
  weekday: number
  retentionCount: number
}

interface DatabaseStats {
  connection: any
  tables: any[]
  performance: any
  backups: any[]
  backupSchedule?: BackupSchedule
  migrations: any[]
  recentActivity: any[]
  health?: {
    status: 'good' | 'attention'
    checks: Array<{ name: string; ok: boolean; detail: string }>
  }
}

interface AdminDatabaseProps {
  className?: string
}

export function AdminDatabase({ className = '' }: AdminDatabaseProps) {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [backingUp, setBackingUp] = useState(false)
  const [notice, setNotice] = useState('')
  const [schedule, setSchedule] = useState<BackupSchedule>({
    enabled: true,
    frequency: 'daily',
    weekday: 0,
    retentionCount: 14,
  })

  const fetchDatabaseStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const response = await fetch('/api/admin/database')
      
      if (!response.ok) {
        throw new Error('Failed to fetch database stats')
      }
      
      const data = await response.json()
      setError(null)
      setDbStats(data.data || null)
      if (data.data?.backupSchedule) {
        setSchedule(data.data.backupSchedule)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch database stats'
      if (silent) setNotice(message)
      else setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDatabaseStats()
  }, [])

  const handleDatabaseAction = async (action: string, params?: any) => {
    try {
      if (action === 'backup_database') setBackingUp(true)
      setNotice('')
      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...params
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || result.message || `Failed to ${action}`)
      }

      setNotice(result.message || 'Action completed successfully')
      
      if (['backup_database', 'save_backup_schedule', 'optimize_database', 'vacuum_database', 'analyze_table', 'check_health'].includes(action)) {
        await fetchDatabaseStats(true)
        if (action === 'backup_database') setActiveTab('backups')
        if (action === 'check_health' || action === 'vacuum_database' || action === 'optimize_database') setActiveTab('maintenance')
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : `Failed to ${action}`)
    } finally {
      setBackingUp(false)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'tables', name: 'Tables', icon: TableCellsIcon },
    { id: 'backups', name: 'Backups', icon: CloudArrowUpIcon },
    { id: 'maintenance', name: 'Maintenance', icon: Cog6ToothIcon },
  ]

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
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
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
          <CircleStackIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Database Management</h2>
            <p className="text-sm text-gray-600">Monitor and manage database operations</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDatabaseAction('backup_database')}
            disabled={backingUp}
            className="flex items-center space-x-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            <span>{backingUp ? 'Backing up...' : 'Backup Now'}</span>
          </button>
          <button
            onClick={() => handleDatabaseAction('optimize_database')}
            className="flex items-center space-x-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Optimize</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800">
          {notice}
        </div>
      )}

      {/* Connection Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CircleStackIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg font-semibold text-green-600">{dbStats?.connection?.status || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Database</p>
              <p className="text-lg font-semibold text-gray-900">{dbStats?.connection?.database || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PlayIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-lg font-semibold text-gray-900">{dbStats?.connection?.uptime || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StopIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Connections</p>
              <p className="text-lg font-semibold text-gray-900">
                {dbStats?.connection?.activeConnections || 0} / {dbStats?.connection?.maxConnections || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex flex-wrap gap-2 px-4 py-3" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-orange-600 bg-orange-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-700'
                } inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Query Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Transactions</span>
                      <span className="text-sm font-medium">{dbStats?.performance?.queries?.total?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Slow Queries</span>
                      <span className="text-sm font-medium text-yellow-600">{dbStats?.performance?.queries?.slow || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rolled back</span>
                      <span className="text-sm font-medium text-red-600">{dbStats?.performance?.queries?.failed || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Storage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Database size</span>
                      <span className="text-sm font-medium">{dbStats?.performance?.storage?.total || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tables</span>
                      <span className="text-sm font-medium">{dbStats?.performance?.storage?.used || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Indexes</span>
                      <span className="text-sm font-medium text-green-600">{dbStats?.performance?.storage?.free || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Indexes</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Indexes</span>
                      <span className="text-sm font-medium">{dbStats?.performance?.indexes?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Unused</span>
                      <span className="text-sm font-medium text-yellow-600">{dbStats?.performance?.indexes?.unused || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duplicates</span>
                      <span className="text-sm font-medium text-red-600">{dbStats?.performance?.indexes?.duplicates || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {dbStats?.recentActivity && dbStats.recentActivity.length > 0 ? (
                    dbStats.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex max-w-[10rem] truncate rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
                          {activity.type}
                        </span>
                        <div>
                          <p className="text-sm text-gray-900">{activity.table}</p>
                          <p className="text-xs text-gray-500">{activity.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Table Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rows
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Modified
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dbStats?.tables && dbStats.tables.length > 0 ? (
                      dbStats.tables.map((table, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {table.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Number(table.rows || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {table.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {table.lastModified ? new Date(table.lastModified).toLocaleString() : 'Not recorded'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleDatabaseAction('analyze_table', { table: table.name })}
                              className="mr-2 rounded-full bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700"
                            >
                              Analyze
                            </button>
                            <a
                              href={`/api/admin/database/tables/${encodeURIComponent(table.name)}/export`}
                              className="inline-flex rounded-full bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700"
                            >
                              Export
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No tables found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-medium text-gray-900">Automated backup</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Runs every day at 02:00 UTC when enabled. Weekly backups run on the selected day. Files are kept in the documents container.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={schedule.enabled}
                      onChange={(event) => setSchedule(current => ({ ...current, enabled: event.target.checked }))}
                    />
                    Enabled
                  </label>
                  <label className="text-sm text-gray-700">
                    Frequency
                    <select
                      value={schedule.frequency}
                      onChange={(event) => setSchedule(current => ({ ...current, frequency: event.target.value as 'daily' | 'weekly' }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </label>
                  <label className="text-sm text-gray-700">
                    Weekday
                    <select
                      value={schedule.weekday}
                      disabled={schedule.frequency !== 'weekly'}
                      onChange={(event) => setSchedule(current => ({ ...current, weekday: Number(event.target.value) }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                    >
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                        <option key={day} value={index}>{day}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-gray-700">
                    Keep latest
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={schedule.retentionCount}
                      onChange={(event) => setSchedule(current => ({ ...current, retentionCount: Number(event.target.value) }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => handleDatabaseAction('save_backup_schedule', schedule)}
                  className="mt-4 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Save schedule
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Backup ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dbStats?.backups && dbStats.backups.length > 0 ? (
                      dbStats.backups.map((backup, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {backup.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(backup.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            backup.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={`/api/admin/database/backups/${backup.id}/download`}
                            className="inline-flex rounded-full bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No backups available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Database Maintenance</h4>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleDatabaseAction('vacuum_database')}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      <span>Vacuum Database</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDatabaseAction('optimize_database')}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                      <span>Refresh Statistics</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDatabaseAction('check_health')}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                      <span>Health Check</span>
                    </button>
                    {dbStats?.health && (
                      <div className="space-y-2 pt-2">
                        {dbStats.health.checks.map((check) => (
                          <div key={check.name} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                            <span className="text-sm text-gray-700">{check.name}</span>
                            <span className={`text-xs font-medium ${check.ok ? 'text-green-700' : 'text-orange-700'}`}>
                              {check.detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Migrations</h4>
                  <div className="space-y-2">
                    {dbStats?.migrations && dbStats.migrations.length > 0 ? (
                      dbStats.migrations.slice(0, 5).map((migration, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{migration.name}</p>
                          <p className="text-xs text-gray-500">{migration.id}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            migration.status === 'applied'
                              ? 'bg-green-100 text-green-800'
                              : migration.status === 'rolled back'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                          }`}>
                            {migration.status}
                          </span>
                          <p className="text-xs text-gray-500">
                            {new Date(migration.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>No migrations found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
