"use client"

import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  CogIcon, 
  ShieldCheckIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { UserRole, Department, getRoleDisplayName, getDepartmentDisplayName, hasPermission } from '@/types/roles'

interface User {
  id: string
  name: string
  email: string
  department: string
  currentRole: UserRole
  currentRoleName: string
  suggestedRole: UserRole
  suggestedRoleName: string
  status: 'active' | 'inactive'
  lastLogin?: string
  permissions: any
}

interface RoleInfo {
  id: UserRole
  name: string
  description: string
  permissions: any
  userCount: number
}

interface DepartmentInfo {
  id: Department
  name: string
  defaultRole: UserRole
  defaultRoleName: string
}

export default function RoleManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [departments, setDepartments] = useState<DepartmentInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [activeView, setActiveView] = useState<'users' | 'roles' | 'departments'>('users')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load users
      const usersResponse = await fetch('/api/admin/role-management?action=users')
      if (usersResponse.ok) {
        const { data } = await usersResponse.json()
        setUsers(data.users || [])
      }

      // Load roles
      const rolesResponse = await fetch('/api/admin/role-management?action=roles')
      if (rolesResponse.ok) {
        const { data } = await rolesResponse.json()
        setRoles(data.roles || [])
      }

      // Load departments
      const deptsResponse = await fetch('/api/admin/role-management?action=departments')
      if (deptsResponse.ok) {
        const { data } = await deptsResponse.json()
        setDepartments(data.departments || [])
      }
    } catch (error) {
      console.error('Failed to load role management data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const assignRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch('/api/admin/role-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_role',
          userId,
          newRole
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setMessage(result.message)
        loadData() // Refresh data
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(result.error)
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      setError('Failed to assign role')
      setTimeout(() => setError(''), 5000)
    }
  }

  const resetUserToDefault = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/role-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_user_to_department_default',
          userId
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setMessage(result.message)
        loadData()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(result.error)
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      setError('Failed to reset user role')
      setTimeout(() => setError(''), 5000)
    }
  }

  const bulkAssignDepartmentDefaults = async (department: Department) => {
    try {
      const response = await fetch('/api/admin/role-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_assign_department_defaults',
          department
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setMessage(result.message)
        loadData()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(result.error)
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      setError('Failed to bulk assign roles')
      setTimeout(() => setError(''), 5000)
    }
  }

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.SYSTEM_ADMINISTRATOR]: 'bg-red-100 text-red-800 border-red-200',
      [UserRole.HR]: 'bg-purple-100 text-purple-800 border-purple-200',
      [UserRole.ADVANCE_USER_1]: 'bg-blue-100 text-blue-800 border-blue-200',
      [UserRole.ADVANCE_USER_2]: 'bg-green-100 text-green-800 border-green-200',
      [UserRole.BASIC_USER_1]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [UserRole.BASIC_USER_2]: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading role management...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Role-Based Access Control</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage user roles and permissions with department-based defaults
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 text-sm">{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', name: 'User Management', icon: UserIcon, count: users.length },
            { id: 'roles', name: 'Role Definitions', icon: ShieldCheckIcon, count: roles.length },
            { id: 'departments', name: 'Department Defaults', icon: UsersIcon, count: departments.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
              <span className="ml-2 bg-gray-100 text-gray-900 rounded-full px-2 py-1 text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* User Management View */}
      {activeView === 'users' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">User Role Assignments</h3>
              <p className="text-xs text-gray-500 mt-1">
                Drag roles to users or use dropdown to assign. Suggested roles based on department.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suggested Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getDepartmentDisplayName(user.department as Department)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getRoleColor(user.currentRole)}`}>
                          {user.currentRoleName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.currentRole !== user.suggestedRole ? (
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getRoleColor(user.suggestedRole)}`}>
                              {user.suggestedRoleName}
                            </span>
                            <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 ml-2" />
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-xs text-green-600">Matches department</span>
                            <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.currentRole}
                            onChange={(e) => assignRole(user.id, e.target.value as UserRole)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            {Object.values(UserRole).map((role) => (
                              <option key={role} value={role}>
                                {getRoleDisplayName(role)}
                              </option>
                            ))}
                          </select>
                          
                          {user.currentRole !== user.suggestedRole && (
                            <button
                              onClick={() => resetUserToDefault(user.id)}
                              className="text-xs text-blue-600 hover:text-blue-900"
                              title="Reset to department default"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Role Definitions View */}
      {activeView === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`px-3 py-1 rounded-md text-sm font-medium ${getRoleColor(role.id)}`}>
                  {role.name}
                </div>
                <span className="text-xs text-gray-500">{role.userCount} users</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{role.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-900">Key Permissions:</h4>
                <div className="space-y-1">
                  {Object.entries(role.permissions).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                      <span className={`font-medium ${
                        value === 'full' ? 'text-green-600' :
                        value === 'edit' ? 'text-blue-600' :
                        value === 'view' ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {value as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Defaults View */}
      {activeView === 'departments' && (
        <div className="space-y-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{dept.name}</h3>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-600 mr-3">Default Role:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getRoleColor(dept.defaultRole)}`}>
                      {dept.defaultRoleName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => bulkAssignDepartmentDefaults(dept.id)}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply to All Users
                </button>
              </div>
              
              <div className="mt-3 text-sm text-gray-500">
                Users in this department will automatically be assigned the {dept.defaultRoleName} role.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
