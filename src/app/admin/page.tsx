"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { EnhancedLayout } from "@/components/layout/enhanced-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { UserManagement } from "@/components/admin/user-management"
import {
  Cog6ToothIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ServerIcon,
  DocumentTextIcon,
  BellIcon,
  CpuChipIcon,
  GlobeAltIcon,
  KeyIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  EyeIcon
} from "@heroicons/react/24/outline"

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalDocuments: number
  systemUptime: string
  storageUsed: string
  apiCalls: number
  errorRate: number
  responseTime: number
}

interface User {
  id: string
  firstName?: string
  lastName?: string
  email: string
  role: string
  department?: string
  lastLogin?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt?: string
  permissions?: string[]
}

interface AuditLog {
  id: string
  userId?: string
  userName?: string
  action: string
  resource: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  details: string
  severity?: string
}

interface SystemConfig {
  id?: string
  key: string
  value: string
  description?: string
  category?: string
  type: 'string' | 'number' | 'boolean' | 'json'
  validationRules?: any
  lastModified?: string
  modifiedBy?: string
}

export default function SystemAdminPage() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)

  // State for different admin sections
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    systemUptime: "0%",
    storageUsed: "0 GB",
    apiCalls: 0,
    errorRate: 0,
    responseTime: 0
  })

  const [users, setUsers] = useState<User[]>([])

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const [systemConfigs, setSystemConfigs] = useState<SystemConfig[]>([])

  useEffect(() => {
    setMounted(true)
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const dashboardResponse = await fetch('/api/admin/dashboard')
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        if (dashboardData.data?.stats) {
          setSystemStats(dashboardData.data.stats)
        }
      }
      
      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        if (usersData.users) {
          setUsers(usersData.users)
        }
      }
      
      // Fetch audit logs
      const auditResponse = await fetch('/api/admin/audit')
      if (auditResponse.ok) {
        const auditData = await auditResponse.json()
        if (auditData.logs) {
          setAuditLogs(auditData.logs)
        }
      }
      
      // Fetch system configs
      const configResponse = await fetch('/api/admin/config')
      if (configResponse.ok) {
        const configData = await configResponse.json()
        if (configData.configs) {
          setSystemConfigs(configData.configs)
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSystemStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'refresh_stats' })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSystemStats(data.stats)
      }
    } catch (error) {
      console.error("Error refreshing stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle_status', userId })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? result.user : user
        ))
      } else {
        // Handle different error types
        if (response.status === 401) {
          alert('Authentication required. Please log in to manage users. Visit /auth/signin to authenticate.')
        } else {
          alert(result.error || result.message || 'Failed to update user status')
        }
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert('An error occurred while updating user status. Please try again.')
    }
  }

  const updateSystemConfig = async (key: string, value: string) => {
    try {
      const config = systemConfigs.find(c => c.key === key)
      if (!config) return

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'update_config', 
          configId: config.id || key,
          configData: { value } 
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSystemConfigs(prev => prev.map(config =>
          config.key === key ? result.config : config
        ))
      } else {
        // Handle different error types
        if (response.status === 401) {
          alert('Authentication required. Please log in to update system configuration. Visit /auth/signin to authenticate.')
        } else {
          alert(result.error || result.message || 'Failed to update system configuration')
        }
      }
    } catch (error) {
      console.error('Error updating config:', error)
      alert('An error occurred while updating system configuration. Please try again.')
    }
  }

  if (!mounted) {
    return null
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'users', name: 'User Management', icon: UsersIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'system', name: 'System Config', icon: Cog6ToothIcon },
    { id: 'database', name: 'Database', icon: ServerIcon },
    { id: 'monitoring', name: 'Monitoring', icon: ServerIcon },
    { id: 'audit', name: 'Audit Logs', icon: DocumentTextIcon },
    { id: 'maintenance', name: 'Maintenance', icon: ExclamationTriangleIcon }
  ]

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null
  }

  return (
    <EnhancedLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600">Comprehensive system management and monitoring</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <AdminDashboard />
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <UserManagement />
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Security Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Settings */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                      <p className="text-xs text-gray-500">Require 2FA for all users</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Password Complexity</label>
                      <p className="text-xs text-gray-500">Enforce strong password policy</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Session Monitoring</label>
                      <p className="text-xs text-gray-500">Track user session activity</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">IP Whitelisting</label>
                      <p className="text-xs text-gray-500">Restrict access by IP address</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" />
                  </div>
                </div>
              </div>

              {/* Recent Security Events */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Security Events</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Successful Login</p>
                      <p className="text-xs text-gray-500">john.doe@saywhat.org - 192.168.1.100</p>
                      <p className="text-xs text-gray-400">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Failed Login Attempt</p>
                      <p className="text-xs text-gray-500">unknown@external.com - 45.123.456.789</p>
                      <p className="text-xs text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <KeyIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Password Changed</p>
                      <p className="text-xs text-gray-500">jane.smith@saywhat.org</p>
                      <p className="text-xs text-gray-400">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Configuration Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">System Configuration</h2>
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Config
              </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Configuration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {systemConfigs.map((config) => (
                    <tr key={config.key}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{config.key}</div>
                          <div className="text-sm text-gray-500">{config.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {config.type === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={config.value === 'true'}
                            onChange={(e) => updateSystemConfig(config.key, e.target.checked.toString())}
                            className="h-4 w-4 text-indigo-600 rounded"
                          />
                        ) : (
                          <input
                            type={config.type === 'number' ? 'number' : 'text'}
                            value={config.value}
                            onChange={(e) => updateSystemConfig(config.key, e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{config.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Database Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Database Stats */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Database Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Records</span>
                    <span className="text-sm font-medium">1,234,567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database Size</span>
                    <span className="text-sm font-medium">2.4 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Connections</span>
                    <span className="text-sm font-medium">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Query Performance</span>
                    <span className="text-sm font-medium text-green-600">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                </div>
              </div>

              {/* Database Operations */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Database Operations</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <ServerIcon className="h-4 w-4 mr-2" />
                    Create Backup
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Restore Database
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    Optimize Tables
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Monitoring</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-medium">{systemStats?.responseTime || 0}ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="text-sm font-medium">{systemStats?.errorRate || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Throughput</span>
                      <span className="text-sm font-medium">1.2k req/min</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Status */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Web Server</span>
                    <span className="flex items-center text-sm text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="flex items-center text-sm text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Service</span>
                    <span className="flex items-center text-sm text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">File Storage</span>
                    <span className="flex items-center text-sm text-yellow-600">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      Warning
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Gateway</span>
                    <span className="flex items-center text-sm text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Usage</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">CPU</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Memory</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Storage</span>
                      <span className="text-sm font-medium">34%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Network</span>
                      <span className="text-sm font-medium">23%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
              <div className="flex space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>All Actions</option>
                  <option>Login/Logout</option>
                  <option>Data Changes</option>
                  <option>Security Events</option>
                </select>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                  Export Logs
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.userName || log.userId || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.action.includes('LOGIN') ? 'bg-green-100 text-green-800' :
                          log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                          log.action.includes('FAILED') ? 'bg-red-100 text-red-800' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.resource}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.ipAddress || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Maintenance</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scheduled Tasks */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduled Tasks</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Daily Backup</p>
                      <p className="text-xs text-gray-500">Runs every day at 2:00 AM</p>
                    </div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Log Cleanup</p>
                      <p className="text-xs text-gray-500">Runs weekly on Sunday</p>
                    </div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Database Optimization</p>
                      <p className="text-xs text-gray-500">Runs monthly</p>
                    </div>
                    <span className="text-xs text-yellow-600">Pending</span>
                  </div>
                </div>
              </div>

              {/* Manual Operations */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Operations</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <ServerIcon className="h-4 w-4 mr-2" />
                    Force Backup Now
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Restart Services
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    Clear Cache
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    Emergency Stop
                  </button>
                </div>
              </div>
            </div>

            {/* Maintenance Schedule */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Maintenance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border-l-4 border-blue-500 bg-blue-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Update v2.1.0</p>
                    <p className="text-xs text-gray-600">Scheduled for July 20, 2025 at 2:00 AM</p>
                    <p className="text-xs text-gray-500">Estimated downtime: 30 minutes</p>
                  </div>
                  <span className="text-sm text-blue-600">Scheduled</span>
                </div>
                <div className="flex items-center justify-between p-4 border-l-4 border-yellow-500 bg-yellow-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Database Migration</p>
                    <p className="text-xs text-gray-600">Scheduled for July 25, 2025 at 1:00 AM</p>
                    <p className="text-xs text-gray-500">Estimated downtime: 2 hours</p>
                  </div>
                  <span className="text-sm text-yellow-600">Pending Approval</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </EnhancedLayout>
  )
}
