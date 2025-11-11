"use client"

import { useState, useEffect } from 'react'
import { 
  UsersIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  position: string
  employeeId: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
  employmentType?: string
  startDate?: string
  salary?: number | null
  isSupervisor?: boolean
  isReviewer?: boolean
  isSystemUser?: boolean
  isEmployee?: boolean
  employeeStatus?: string
  roles: Array<{
    role: {
      name: string
      description: string
    }
  }>
  permissions?: string[]
}

interface UserManagementProps {
  className?: string
}

export function AdminUserManagement({ className = '' }: UserManagementProps) {
  // User Management with Edit functionality
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [processingUserId, setProcessingUserId] = useState<string | null>(null)
  const [savingUser, setSavingUser] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [migrating, setMigrating] = useState(false)
  const [departments, setDepartments] = useState<Array<{id: string, name: string, code: string, displayName?: string}>>([])
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    employeeId: '',
    password: '',
    role: 'BASIC_USER_1'
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching users from /api/admin/users...')
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Users fetched successfully:', data)
      console.log('📊 Setting users array:', data.data?.users || [])
      setUsers(data.data?.users || [])
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error('❌ Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments from /api/admin/departments...')
      const response = await fetch('/api/admin/departments')
      if (response.ok) {
        const data = await response.json()
        console.log('Departments fetched successfully:', data)
        setDepartments(data)
      } else {
        console.error('Failed to fetch departments:', response.statusText)
        setDepartments([])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [])

  const handleToggleStatus = async (userId: string) => {
    try {
      setError(null) // Clear previous errors
      setProcessingUserId(userId)
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_status',
          userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to toggle user status')
      }

      await fetchUsers()
      setSuccessMessage('User status updated successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user status')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    const userName = user ? `${user.firstName} ${user.lastName}` : 'this user'
    
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return

    try {
      setError(null) // Clear previous errors
      setProcessingUserId(userId)
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_user',
          userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      await fetchUsers()
      setSuccessMessage('User deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleEditUser = (user: any) => {
    // Clear any previous errors
    setError(null)
    
    // Pre-populate the form with user data for editing
    setNewUser({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      department: user.department || '',
      position: user.position || '',
      employeeId: user.employeeId || '',
      password: '', // Always empty for edits
      role: user.roles?.[0]?.role?.name || 'BASIC_USER_1'
    })
    setEditingUserId(user.id)
    setShowAddDialog(true)
  }

  const validateFields = () => {
    const errors: Record<string, string> = {}
    
    if (!newUser.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!newUser.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!newUser.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!editingUserId && !newUser.password.trim()) {
      errors.password = 'Password is required for new users'
    } else if (!editingUserId && newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateUser = async () => {
    try {
      setSavingUser(true)
      setError(null)
      setFieldErrors({})
      
      // Validate required fields
      if (!validateFields()) {
        return
      }

      const isEditing = editingUserId !== null
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isEditing ? 'update_user' : 'create_user',
          userId: editingUserId,
          ...newUser
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} user`)
      }

      // Success - refresh data and close modal
      await fetchUsers()
      setSuccessMessage(`User ${isEditing ? 'updated' : 'created'} successfully`)
      resetForm()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user')
    } finally {
      setSavingUser(false)
    }
  }

  const resetForm = () => {
    setShowCreateModal(false)
    setShowAddDialog(false)
    setEditingUserId(null)
    setFieldErrors({})
    setError(null)
    setSuccessMessage(null)
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      position: '',
      employeeId: '',
      password: '',
      role: 'BASIC_USER_1'
    })
  }

  const handleMigrateRoles = async () => {
    try {
      setMigrating(true)
      setError(null)

      const response = await fetch('/api/admin/migrate-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'migrate_roles' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Migration failed')
      }

      const result = await response.json()
      setSuccessMessage(`Successfully migrated ${result.results?.filter((r: any) => r.status === 'success').length || 0} users to new role system`)
      
      // Refresh users after migration
      await fetchUsers()
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to migrate roles')
    } finally {
      setMigrating(false)
    }
  }

  const fetchUserPermissions = async (userId: string) => {
    try {
      setLoadingPermissions(true)
      const response = await fetch(`/api/admin/users?action=get_permissions&userId=${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setUserPermissions(data.permissions || [])
      } else {
        console.error('Failed to fetch user permissions')
        setUserPermissions([])
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      setUserPermissions([])
    } finally {
      setLoadingPermissions(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === '' || 
      user.role === selectedRole ||
      (user.roles && user.roles.some && user.roles.some(ur => 
        ur.role?.name === selectedRole
      ))
    
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UsersIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600">Manage system users and their permissions</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setError(null) // Clear any errors
              setEditingUserId(null)
              setNewUser({
                firstName: '',
                lastName: '',
                email: '',
                department: '',
                position: '',
                employeeId: '',
                password: '',
                role: 'BASIC_USER_1'
              })
              setShowAddDialog(true)
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add User</span>
          </button>
          
          <button
            onClick={handleMigrateRoles}
            disabled={migrating}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-orange-400 flex items-center space-x-2"
          >
            {migrating ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-5 w-5" />
            )}
            <span>{migrating ? 'Migrating...' : 'Migrate Roles'}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-lg font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-lg font-semibold text-gray-900">{users.filter(u => u.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserPlusIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-lg font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <EllipsisVerticalIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-lg font-semibold text-gray-900">{[...new Set(users.map(u => u.department))].length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {/* Legacy Roles */}
            <option value="USER">User (Legacy)</option>
            <option value="PROJECT_MANAGER">Project Manager (Legacy)</option>
            <option value="ADMIN">Admin (Legacy)</option>
            {/* New Role System */}
            <option value="BASIC_USER_1">Basic User 1</option>
            <option value="BASIC_USER_2">Basic User 2</option>
            <option value="ADVANCE_USER_1">Advanced User 1</option>
            <option value="ADVANCE_USER_2">Advanced User 2</option>
            <option value="HR">HR Manager</option>
            <option value="SYSTEM_ADMINISTRATOR">System Administrator</option>
          </select>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium text-sm">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.roles.map(ur => ur.role.name).join(', ') || 'No roles assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.department}</div>
                    <div className="text-sm text-gray-500">{user.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserModal(true)
                          fetchUserPermissions(user.id)
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View User"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit User"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={processingUserId === user.id}
                        className={`${
                          user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        } ${processingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {processingUserId === user.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                        ) : (
                          <ShieldCheckIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={processingUserId === user.id}
                        className={`text-red-600 hover:text-red-900 ${processingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Delete User"
                      >
                        {processingUserId === user.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedRole ? 'Try adjusting your filters' : 'Get started by adding a new user'}
          </p>
        </div>
      )}

      {/* Create User Modal */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUserId ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => {
                    setNewUser({...newUser, firstName: e.target.value})
                    if (fieldErrors.firstName) {
                      setFieldErrors({...fieldErrors, firstName: ''})
                    }
                  }}
                  className={`mt-1 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                  placeholder="Enter first name"
                />
                {fieldErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => {
                    setNewUser({...newUser, lastName: e.target.value})
                    if (fieldErrors.lastName) {
                      setFieldErrors({...fieldErrors, lastName: ''})
                    }
                  }}
                  className={`mt-1 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Enter last name"
                />
                {fieldErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => {
                    setNewUser({...newUser, email: e.target.value})
                    if (fieldErrors.email) {
                      setFieldErrors({...fieldErrors, email: ''})
                    }
                  }}
                  className={`mt-1 ${fieldErrors.email ? 'border-red-500' : ''}`}
                  placeholder="user@saywhat.org"
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={newUser.employeeId}
                  onChange={(e) => setNewUser({...newUser, employeeId: e.target.value})}
                  className="mt-1"
                  placeholder="EMP001"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.displayName || `${dept.name} (${dept.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={newUser.position}
                  onChange={(e) => setNewUser({...newUser, position: e.target.value})}
                  className="mt-1"
                  placeholder="Enter position"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white/95 backdrop-blur-sm shadow-2xl border-2">
                    <SelectItem value="BASIC_USER_1">Basic User 1 - Call Center View, Documents View</SelectItem>
                    <SelectItem value="BASIC_USER_2">Basic User 2 - Programs View, Inventory View</SelectItem>
                    <SelectItem value="ADVANCE_USER_1">Advanced User 1 - Call Center Full, Programs Edit, Risks Edit</SelectItem>
                    <SelectItem value="ADVANCE_USER_2">Advanced User 2 - Programs Full, Documents Edit</SelectItem>
                    <SelectItem value="HR">HR Manager - HR Full Access, View Others Profiles</SelectItem>
                    <SelectItem value="SYSTEM_ADMINISTRATOR">System Administrator - Full Access to Everything</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => {
                    setNewUser({...newUser, password: e.target.value})
                    if (fieldErrors.password) {
                      setFieldErrors({...fieldErrors, password: ''})
                    }
                  }}
                  className={`mt-1 ${fieldErrors.password ? 'border-red-500' : ''}`}
                  placeholder={editingUserId ? "Leave blank to keep current password" : "Enter initial password"}
                />
                {fieldErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
                )}
                {!editingUserId && !fieldErrors.password && (
                  <p className="text-xs text-gray-500 mt-1">
                    User will be required to change password on first login
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={savingUser}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingUser || !newUser.firstName || !newUser.lastName || !newUser.email || (!editingUserId && !newUser.password)}
              >
                {savingUser ? (
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-2 border-current border-t-transparent"></div>
                ) : (
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                )}
                {savingUser ? 'Saving...' : editingUserId ? 'Update User' : 'Create User'}
              </Button>
            </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <p className="text-sm text-gray-900">{selectedUser.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Position</label>
                      <p className="text-sm text-gray-900">{selectedUser.position}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Access Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <p className="text-sm text-gray-900">
                        {selectedUser.roles?.map(ur => ur.role.name).join(', ') || 'No roles assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Login</label>
                      <p className="text-sm text-gray-900">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created</label>
                      <p className="text-sm text-gray-900">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Permissions ({userPermissions.length} permissions)
                </h3>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {loadingPermissions ? (
                    <p className="text-sm text-gray-500 col-span-3">Loading permissions...</p>
                  ) : userPermissions.length > 0 ? (
                    userPermissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium"
                      >
                        {permission}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 col-span-3">No permissions assigned</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUserModal(false)
                    setUserPermissions([])
                    setSelectedUser(null)
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
