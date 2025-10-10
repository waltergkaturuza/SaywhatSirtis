"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import RoleManagementSystem from "@/components/admin/role-management-system"
import RoleManagement from "@/components/admin/RoleManagement"
import { AdminOnly } from "@/components/auth/role-guard"
import { useState, useEffect } from "react"
import {
  Cog6ToothIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  CpuChipIcon,
  ServerIcon,
  CloudIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  VideoCameraIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline"

interface SystemStatus {
  database: { status: string; message: string }
  apiServices: { status: string; message: string }
  fileStorage: { status: string; message: string }
  emailService: { status: string; message: string }
}

interface LocaleOptions {
  timezones: Array<{ value: string; label: string; offset: string; region: string }>
  currencies: Array<{ value: string; label: string; symbol: string; region: string }>
  languages: Array<{ value: string; label: string; native: string; region: string }>
}

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  department?: string
  position?: string
  status: string
  lastLogin?: string
  createdAt: string
  permissions: string[]
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [localeOptions, setLocaleOptions] = useState<LocaleOptions | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  
  // Form state management
  const [organizationSettings, setOrganizationSettings] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    timezone: "Africa/Harare",
    defaultLanguage: "en",
    currency: "USD"
  })

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    inApp: true
  })

  const [timeSettings, setTimeSettings] = useState({
    maintenanceStart: "22:00",
    maintenanceEnd: "08:00"
  })

  const [saveMessage, setSaveMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Load organization settings and system data
  useEffect(() => {
    loadSettings()
    loadLocaleData()
    loadSystemStatus()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
      loadRoles()
    }
  }, [activeTab])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/organization')
      if (response.ok) {
        const { data } = await response.json()
        setOrganizationSettings(data)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const { users: userData } = await response.json()
        setUsers(userData || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  const loadRoles = async () => {
    setRolesLoading(true)
    try {
      const response = await fetch('/api/admin/roles')
      if (response.ok) {
        const { data } = await response.json()
        setRoles(data?.roles || [])
      }
    } catch (error) {
      console.error('Failed to load roles:', error)
      setRoles([])
    } finally {
      setRolesLoading(false)
    }
  }

  const loadLocaleData = async () => {
    try {
      const response = await fetch('/api/settings/locale-data')
      if (response.ok) {
        const { data } = await response.json()
        setLocaleOptions(data)
      }
    } catch (error) {
      console.error('Failed to load locale data:', error)
    }
  }

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const { data } = await response.json()
        setSystemStatus(data.systemStatus)
      }
    } catch (error) {
      console.error('Failed to load system status:', error)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    setErrorMessage("")
    setSaveMessage("")
    
    try {
      const response = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organizationSettings),
      })

      const result = await response.json()
      
      if (response.ok) {
        setSaveMessage("Settings saved successfully!")
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        setErrorMessage(result.error || "Failed to save settings")
        setTimeout(() => setErrorMessage(""), 5000)
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.")
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const metadata = {
    title: "System Settings",
    description: "Comprehensive platform configuration and administration",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Settings" }
    ]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Database</span>
            {systemStatus ? getStatusIcon(systemStatus.database.status) : <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Services</span>
            {systemStatus ? getStatusIcon(systemStatus.apiServices.status) : <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">File Storage</span>
            {systemStatus ? getStatusIcon(systemStatus.fileStorage.status) : <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email Service</span>
            {systemStatus ? getStatusIcon(systemStatus.emailService.status) : <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />}
          </div>
        </div>
        
        {systemStatus && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 space-y-1">
              <div>DB: {systemStatus.database.message}</div>
              <div>API: {systemStatus.apiServices.message}</div>
              <div>Storage: {systemStatus.fileStorage.message}</div>
              <div>Email: {systemStatus.emailService.message}</div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            System Backup
          </button>
          <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Clear Cache
          </button>
          <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Export Logs
          </button>
          <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Database Maintenance
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
        <div className="space-y-3">
          <div className="text-sm">
            <div className="font-medium text-gray-900">Security Update</div>
            <div className="text-gray-500">Authentication settings - 2 hrs ago</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">User Added</div>
            <div className="text-gray-500">New admin user - 1 day ago</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">Theme Updated</div>
            <div className="text-gray-500">UI customization - 3 days ago</div>
          </div>
        </div>
      </div>
    </div>
  )

  const settingsTabs = [
    { id: "general", name: "General", icon: Cog6ToothIcon },
    { id: "users", name: "Users & Roles", icon: UserGroupIcon },
    { id: "rbac", name: "Role Management", icon: AdjustmentsHorizontalIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "integrations", name: "Integrations", icon: GlobeAltIcon },
    { id: "system", name: "System", icon: CpuChipIcon },
    { id: "appearance", name: "Appearance", icon: PaintBrushIcon },
    { id: "reports", name: "Reports", icon: ChartBarIcon }
  ]



  return (
    <AdminOnly fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access system settings.</p>
          <p className="text-sm text-gray-500">Only system administrators can access this page.</p>
        </div>
      </div>
    }>
      <ModulePage
        metadata={metadata}
        sidebar={sidebar}
      >
      <div className="space-y-6">
        {/* Settings Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={organizationSettings.name}
                        onChange={(e) => setOrganizationSettings(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Zone
                      </label>
                      <select 
                        value={organizationSettings.timezone}
                        onChange={(e) => setOrganizationSettings(prev => ({
                          ...prev,
                          timezone: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {localeOptions?.timezones?.map(tz => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        )) || (
                          <option value="Africa/Harare">Africa/Harare (CAT)</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Language
                      </label>
                      <select 
                        value={organizationSettings.defaultLanguage}
                        onChange={(e) => setOrganizationSettings(prev => ({
                          ...prev,
                          defaultLanguage: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {localeOptions?.languages?.map(lang => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label} ({lang.native})
                          </option>
                        )) || (
                          <option value="en">English</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select 
                        value={organizationSettings.currency}
                        onChange={(e) => setOrganizationSettings(prev => ({
                          ...prev,
                          currency: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {localeOptions?.currencies?.map(cur => (
                          <option key={cur.value} value={cur.value}>
                            {cur.label} ({cur.symbol})
                          </option>
                        )) || (
                          <option value="USD">US Dollar ($)</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Email
                      </label>
                      <input
                        type="email"
                        value={organizationSettings.email}
                        onChange={(e) => setOrganizationSettings(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Phone
                      </label>
                      <input
                        type="tel"
                        value={organizationSettings.phone}
                        onChange={(e) => setOrganizationSettings(prev => ({
                          ...prev,
                          phone: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={organizationSettings.address}
                        onChange={(e) => setOrganizationSettings(prev => ({
                          ...prev,
                          address: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button and Messages */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex flex-col space-y-2">
                    {saveMessage && (
                      <p className="text-sm text-green-600 flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        {saveMessage}
                      </p>
                    )}
                    {errorMessage && (
                      <p className="text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errorMessage}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                      Add User
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {usersLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading users...</span>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                No users found
                              </td>
                            </tr>
                          ) : (
                            users.map((user) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
                                    </div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.role || 'USER'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.department || 'Unassigned'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.status === 'active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                  <button className="text-red-600 hover:text-red-900">
                                    {user.status === 'active' ? 'Disable' : 'Enable'}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Roles & Permissions</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                      Create Role
                    </button>
                  </div>
                  
                  {rolesLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading roles...</span>
                    </div>
                  ) : roles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No roles found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {roles.map((role) => (
                        <div key={role.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-900 capitalize">
                              {role.name.replace(/_/g, ' ')}
                            </h4>
                            <span className="text-sm text-gray-500">{role.userCount} users</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 6).map((permission) => (
                              <span key={permission} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {permission.replace(/_/g, ' ')}
                              </span>
                            ))}
                            {role.permissions.length > 6 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{role.permissions.length - 6} more
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <button className="text-sm text-blue-600 hover:text-blue-900">Edit</button>
                            <button className="text-sm text-red-600 hover:text-red-900">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "rbac" && (
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Role-Based Access Control</h3>
                  <p className="text-gray-600 mt-1">
                    Comprehensive role management with drag-and-drop functionality, permission hierarchy, and real-time access control.
                  </p>
                </div>
                <RoleManagementSystem />
              </div>
            )}

            {activeTab === "rbac" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Role-Based Access Control</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Comprehensive role management system with department-based default roles and granular permissions.
                  </p>
                </div>
                <RoleManagement />
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Multi-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Require MFA for all users</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-blue-600" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Biometric Login</h4>
                        <p className="text-sm text-gray-500">Allow fingerprint and face recognition</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-blue-600" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Session Timeout</h4>
                        <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>2 hours</option>
                        <option>Never</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Protection</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Data Encryption</h4>
                        <p className="text-sm text-gray-500">AES-256 encryption for sensitive data</p>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Enabled</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Audit Logging</h4>
                        <p className="text-sm text-gray-500">Track all user activities</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-blue-600" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Backup Frequency</h4>
                        <p className="text-sm text-gray-500">Automated system backups</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-500">System alerts and updates via email</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                          <p className="text-sm text-gray-500">Critical alerts via text message</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                          <p className="text-sm text-gray-500">Browser and mobile push notifications</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Cog6ToothIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">In-App Notifications</h4>
                          <p className="text-sm text-gray-500">Notifications within the application</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600"
                        checked={notifications.inApp}
                        onChange={(e) => setNotifications({...notifications, inApp: e.target.checked})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiet Hours Start
                      </label>
                      <input 
                        type="time" 
                        value={timeSettings.maintenanceStart} 
                        onChange={(e) => setTimeSettings(prev => ({
                          ...prev,
                          maintenanceStart: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiet Hours End
                      </label>
                      <input 
                        type="time" 
                        value={timeSettings.maintenanceEnd} 
                        onChange={(e) => setTimeSettings(prev => ({
                          ...prev,
                          maintenanceEnd: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">External Integrations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-8 w-8 text-blue-500 mr-3" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Office 365</h4>
                            <p className="text-sm text-gray-500">Email and calendar integration</p>
                          </div>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Connected</span>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-900">Configure</button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <CloudIcon className="h-8 w-8 text-orange-500 mr-3" />
                          <div>
                            <h4 className="font-semibold text-gray-900">AWS S3</h4>
                            <p className="text-sm text-gray-500">File storage and backup</p>
                          </div>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Connected</span>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-900">Configure</button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <VideoCameraIcon className="h-8 w-8 text-purple-500 mr-3" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Zoom</h4>
                            <p className="text-sm text-gray-500">Video conferencing integration</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">Not Connected</span>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-900">Connect</button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <PhoneIcon className="h-8 w-8 text-green-500 mr-3" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Twilio</h4>
                            <p className="text-sm text-gray-500">SMS and voice services</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">Not Connected</span>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-900">Connect</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "system" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <CpuChipIcon className="h-6 w-6 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">Performance</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">CPU Usage:</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Memory Usage:</span>
                          <span className="font-medium">72%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Disk Usage:</span>
                          <span className="font-medium">24%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <ServerIcon className="h-6 w-6 text-green-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">Database</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Version:</span>
                          <span className="font-medium">PostgreSQL 14.2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium">2.4 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Connections:</span>
                          <span className="font-medium">45/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Maintenance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <ServerIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-blue-900">Backup Database</div>
                    </button>
                    <button className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                      <Cog6ToothIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-yellow-900">Clear Cache</div>
                    </button>
                    <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      <DocumentTextIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-green-900">Export Logs</div>
                    </button>
                    <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                      <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-purple-900">System Report</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Theme</label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border-2 border-blue-500 rounded-lg p-4 bg-white">
                          <div className="text-center">
                            <div className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2"></div>
                            <span className="text-sm font-medium">Default</span>
                          </div>
                        </div>
                        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-900">
                          <div className="text-center">
                            <div className="w-full h-16 bg-gradient-to-r from-gray-800 to-gray-600 rounded mb-2"></div>
                            <span className="text-sm font-medium text-white">Dark</span>
                          </div>
                        </div>
                        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                          <div className="text-center">
                            <div className="w-full h-16 bg-gradient-to-r from-gray-100 to-gray-300 rounded mb-2"></div>
                            <span className="text-sm font-medium">Light</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded border-2 border-blue-800 cursor-pointer"></div>
                        <div className="w-8 h-8 bg-green-600 rounded border-2 border-gray-300 cursor-pointer"></div>
                        <div className="w-8 h-8 bg-purple-600 rounded border-2 border-gray-300 cursor-pointer"></div>
                        <div className="w-8 h-8 bg-red-600 rounded border-2 border-gray-300 cursor-pointer"></div>
                        <div className="w-8 h-8 bg-orange-600 rounded border-2 border-gray-300 cursor-pointer"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Compact Mode</h4>
                        <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-blue-600" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Fixed Sidebar</h4>
                        <p className="text-sm text-gray-500">Keep sidebar always visible</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-blue-600" checked />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Reports</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">System Usage Report</h4>
                          <p className="text-sm text-gray-500">Daily system performance and usage statistics</p>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>Schedule: Daily at 6:00 AM</span>
                        <span className="mx-2">•</span>
                        <span>Recipients: admin@saywhat.org</span>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">Security Audit Report</h4>
                          <p className="text-sm text-gray-500">Weekly security monitoring and incident summary</p>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>Schedule: Weekly on Monday</span>
                        <span className="mx-2">•</span>
                        <span>Recipients: security@saywhat.org</span>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">User Activity Report</h4>
                          <p className="text-sm text-gray-500">Monthly user engagement and activity analysis</p>
                        </div>
                        <span className="text-sm text-gray-500">Inactive</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>Schedule: Monthly on 1st</span>
                        <span className="mx-2">•</span>
                        <span>Recipients: hr@saywhat.org</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    Create New Report
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
    </AdminOnly>
  )
}
