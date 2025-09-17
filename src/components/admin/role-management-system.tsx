'use client'

import { useState, useEffect } from 'react'
import {
  UserGroupIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { UserRole } from '../../types/roles'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name: string
  role: UserRole
  department?: string
  position?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  roleInfo: {
    permissions: string[]
    hierarchy: number
    description: string
  }
  canEditRole: boolean
}

interface RoleStats {
  role: UserRole
  count: number
  label: string
  permissions: number
}

interface RoleInfo {
  value: string
  label: string
  description: string
  permissions: string[]
  hierarchy: number
}

interface RoleManagementData {
  users: User[]
  roleStats: RoleStats[]
  totalUsers: number
  activeUsers: number
}

const ROLE_COLORS: Record<UserRole, string> = {
  SUPERUSER: 'bg-red-200 text-red-900 border-red-300',
  BASIC_USER_1: 'bg-gray-100 text-gray-800 border-gray-200',
  BASIC_USER_2: 'bg-slate-100 text-slate-800 border-slate-200',
  ADVANCE_USER_1: 'bg-blue-100 text-blue-800 border-blue-200',
  ADVANCE_USER_2: 'bg-green-100 text-green-800 border-green-200',
  HR: 'bg-purple-100 text-purple-800 border-purple-200',
  SYSTEM_ADMINISTRATOR: 'bg-red-100 text-red-800 border-red-200'
}

export default function RoleManagementSystem() {
  const [data, setData] = useState<RoleManagementData | null>(null)
  const [availableRoles, setAvailableRoles] = useState<RoleInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('ALL')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
    loadRolePermissions()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/role-management')
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        showMessage('error', 'Failed to load role management data')
      }
    } catch (error) {
      console.error('Error loading role management data:', error)
      showMessage('error', 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const loadRolePermissions = async () => {
    try {
      const response = await fetch('/api/admin/role-management?action=permissions')
      if (response.ok) {
        const result = await response.json()
        setAvailableRoles(result.data.availableRoles)
      }
    } catch (error) {
      console.error('Error loading role permissions:', error)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch('/api/admin/role-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_role',
          userId,
          newRole
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        showMessage('success', result.message)
        await loadData() // Refresh data
        setEditingUser(null)
      } else {
        showMessage('error', result.error)
      }
    } catch (error) {
      showMessage('error', 'Failed to update user role')
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const filteredUsers = data?.users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole
    
    return matchesSearch && matchesRole
  }) || []

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SYSTEM_ADMINISTRATOR':
        return <ShieldCheckIcon className="h-4 w-4" />
      case 'HR':
        return <UserGroupIcon className="h-4 w-4" />
      case 'ADVANCE_USER_1':
      case 'ADVANCE_USER_2':
        return <AdjustmentsHorizontalIcon className="h-4 w-4" />
      default:
        return <UserIcon className="h-4 w-4" />
    }
  }

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <span className="text-gray-600">Loading role management system...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600 mt-1">Manage user roles, permissions, and access control with drag-and-drop</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 mr-2" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Statistics Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{data.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{data.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Available Roles</p>
                <p className="text-2xl font-semibold text-gray-900">{availableRoles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <AdjustmentsHorizontalIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Role Types</p>
                <p className="text-2xl font-semibold text-gray-900">{data.roleStats.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Distribution */}
      {data && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {data.roleStats.map((stat) => (
              <div key={stat.role} className="text-center">
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${
                  ROLE_COLORS[stat.role]
                }`}>
                  {getRoleIcon(stat.role)}
                  <span className="ml-1">{stat.count}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                <p className="text-xs text-gray-500">{stat.permissions} perms</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Roles</option>
                {availableRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredUsers.length} of {data?.totalUsers || 0} users
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || selectedRole !== 'ALL' ? 'No users match your filters' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${
                          user.isActive ? 'bg-green-100' : 'bg-red-100'
                        } flex items-center justify-center`}>
                          <UserIcon className={`h-5 w-5 ${
                            user.isActive ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                          onBlur={() => setEditingUser(null)}
                          autoFocus
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                          disabled={!user.canEditRole}
                        >
                          {availableRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 ${
                            ROLE_COLORS[user.role]
                          }`}
                          onClick={() => user.canEditRole && setEditingUser(user.id)}
                          title={user.canEditRole ? 'Click to edit role' : 'Cannot edit this role'}
                        >
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role.replace(/_/g, ' ')}</span>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{user.department || 'Unassigned'}</div>
                      <div className="text-xs text-gray-500">{user.position || 'No position'}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.roleInfo.permissions.includes('*') ? 'All' : user.roleInfo.permissions.length}
                      </div>
                      <div className="text-xs text-gray-500">
                        Level {user.roleInfo.hierarchy}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => user.canEditRole && setEditingUser(user.id)}
                          disabled={!user.canEditRole}
                          className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Edit Role
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <UserGroupIcon className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Bulk Role Assignment</span>
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Permission Audit</span>
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <ShieldCheckIcon className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Security Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}
