"use client"

import { useState, useEffect } from 'react'
import { 
  CircleStackIcon, 
  TableCellsIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface DatabaseStats {
  connection: any
  tables: any[]
  performance: any
  backups: any[]
  migrations: any[]
  recentActivity: any[]
}

interface AdminDatabaseProps {
  className?: string
}

export function AdminDatabase({ className = '' }: AdminDatabaseProps) {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/database')
      
      if (!response.ok) {
        throw new Error('Failed to fetch database stats')
      }
      
      const data = await response.json()
      setDbStats(data.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch database stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDatabaseStats()
  }, [])

  const handleDatabaseAction = async (action: string, params?: any) => {
    try {
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

      if (!response.ok) {
        throw new Error(`Failed to ${action}`)
      }

      const result = await response.json()
      alert(result.message || 'Action completed successfully')
      
      if (action === 'backup_database' || action === 'optimize_database') {
        await fetchDatabaseStats()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action}`)
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
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            <span>Backup Now</span>
          </button>
          <button
            onClick={() => handleDatabaseAction('optimize_database')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Optimize</span>
          </button>
        </div>
      </div>

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
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <tab.icon className="h-5 w-5" />
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
                      <span className="text-sm text-gray-600">Total Queries</span>
                      <span className="text-sm font-medium">{dbStats?.performance?.queries?.total?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Slow Queries</span>
                      <span className="text-sm font-medium text-yellow-600">{dbStats?.performance?.queries?.slow || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Failed Queries</span>
                      <span className="text-sm font-medium text-red-600">{dbStats?.performance?.queries?.failed || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Storage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Size</span>
                      <span className="text-sm font-medium">{dbStats?.performance?.storage?.total || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Used Space</span>
                      <span className="text-sm font-medium">{dbStats?.performance?.storage?.used || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Free Space</span>
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          activity.type === 'SELECT' ? 'bg-blue-100 text-blue-800' :
                          activity.type === 'INSERT' ? 'bg-green-100 text-green-800' :
                          activity.type === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.type}
                        </span>
                        <div>
                          <p className="text-sm text-gray-900">{activity.table}</p>
                          <p className="text-xs text-gray-500">{activity.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{activity.duration}ms</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
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
                          {table.rows.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {table.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(table.lastModified).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDatabaseAction('analyze_table', { table: table.name })}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Analyze
                          </button>
                          <button
                            onClick={() => handleDatabaseAction('export_data', { table: table.name })}
                            className="text-green-600 hover:text-green-900"
                          >
                            Export
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-4">
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
                          <button
                            onClick={() => handleDatabaseAction('restore_backup', { backupId: backup.id })}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Restore
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Download
                          </button>
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
                      onClick={() => handleDatabaseAction('vacuum_database')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                      <span>Vacuum Database</span>
                    </button>
                    <button
                      onClick={() => handleDatabaseAction('optimize_database')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Optimize Database</span>
                    </button>
                    <button
                      onClick={() => handleDatabaseAction('check_health')}
                      className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center space-x-2"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Health Check</span>
                    </button>
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
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
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
