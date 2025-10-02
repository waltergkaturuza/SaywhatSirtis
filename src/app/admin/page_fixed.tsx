"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { UserManagement } from "@/components/admin/user-management"
import Link from "next/link"
import {
  Cog6ToothIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ServerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  KeyIcon
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

  // Access control: admins and full_access only
  const adminAllowed = Boolean(
    session?.user?.permissions?.includes('admin.access') ||
    session?.user?.permissions?.includes('full_access') ||
    (session?.user?.roles || []).some(r => ['system_administrator','administrator','admin','superuser'].includes(r.toLowerCase()))
  )

  // Define before early return to avoid TDZ when effect schedules
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

  useEffect(() => {
    setMounted(true)
    if (adminAllowed) {
      fetchAdminData()
    }
  }, [adminAllowed])

  if (!adminAllowed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="lg:pl-72">
          <div className="px-6 py-6">
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-orange-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
              <p className="mt-1 text-sm text-gray-600">You do not have permission to access the Admin module.</p>
              <div className="mt-6">
                <Link href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-md bg-orange-500 text-white">Go to Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar for access denied state */}
        <AdminSidebar />
      </div>
    )
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

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with left margin for sidebar */}
      <div className="lg:pl-72">
        <div className="w-full">
          {/* Navigation & Header */}
          <div className="mb-8 px-6 pt-6">
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Home
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back
                </button>
              </div>
              
              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700 transition-colors">
                  Home
                </Link>
                <ChevronRightIcon className="h-4 w-4 mx-2" />
                <span className="font-medium text-orange-600">System Administration</span>
              </div>
            </div>
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
              <p className="text-gray-600">Comprehensive system management and monitoring</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8 px-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600 bg-orange-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-orange-300 hover:bg-gray-50'
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
          <div className="px-6">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Security Management</h2>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  <p className="text-gray-600">Security configuration options will be displayed here.</p>
                </div>
              </div>
            )}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">System Configuration</h2>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
                  <p className="text-gray-600">System configuration options will be displayed here.</p>
                </div>
              </div>
            )}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Database Management</h2>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Database Operations</h3>
                  <p className="text-gray-600">Database management tools will be displayed here.</p>
                </div>
              </div>
            )}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">System Monitoring</h2>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                  <p className="text-gray-600">System monitoring dashboard will be displayed here.</p>
                </div>
              </div>
            )}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Audit Trail</h3>
                  <p className="text-gray-600">Audit log viewer will be displayed here.</p>
                </div>
              </div>
            )}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">System Maintenance</h2>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Tools</h3>
                  <p className="text-gray-600">System maintenance utilities will be displayed here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed Sidebar */}
      <AdminSidebar />
    </div>
  )
}

// Separate AdminSidebar component
function AdminSidebar() {
  return (
    <div className="fixed inset-y-0 left-0 z-50 lg:block lg:w-72">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SIRTIS</h1>
              <p className="text-xs text-gray-500">SAYWHAT</p>
            </div>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <div className="mb-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500 rounded-md mr-3">
                    <Cog6ToothIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Admin</h2>
                    <p className="text-sm text-gray-600">Administrative tools and settings</p>
                  </div>
                </div>
              </div>
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <Link
                    href="/admin"
                    className="bg-orange-500 text-white group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <ChartBarIcon className="h-5 w-5 shrink-0" />
                    Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/users"
                    className="text-gray-700 hover:text-orange-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <UsersIcon className="h-5 w-5 shrink-0" />
                    User Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/roles"
                    className="text-gray-700 hover:text-orange-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <ShieldCheckIcon className="h-5 w-5 shrink-0" />
                    Role Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/settings"
                    className="text-gray-700 hover:text-orange-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <Cog6ToothIcon className="h-5 w-5 shrink-0" />
                    System Settings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/audit"
                    className="text-gray-700 hover:text-orange-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <DocumentTextIcon className="h-5 w-5 shrink-0" />
                    Audit Logs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/api-keys"
                    className="text-gray-700 hover:text-orange-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <KeyIcon className="h-5 w-5 shrink-0" />
                    API Keys
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/database"
                    className="text-gray-700 hover:text-orange-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <ServerIcon className="h-5 w-5 shrink-0" />
                    Database Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/server-status"
                    className="text-gray-700 hover:text-orange-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <ServerIcon className="h-5 w-5 shrink-0" />
                    Server Status
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}