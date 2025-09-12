"use client"

import { useState, useEffect } from "react"
import {
  UsersIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserPlusIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon
} from "@heroicons/react/24/outline"

interface User {
  id: string
  firstName?: string
  lastName?: string
  email: string
  role: string
  department?: string
  position?: string
  lastLogin?: string
  status: 'active' | 'inactive' | 'suspended'
  permissions?: string[]
  createdAt?: string
  avatar?: string
  phone?: string
}

interface UserManagementProps {
  className?: string
}

export function UserManagement({ className = "" }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null)
  const [showEditUser, setShowEditUser] = useState<string | null>(null)
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null)

  // Fetch users from API
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        if (data.users) {
          setUsers(data.users)
        }
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus = !statusFilter || user.status === statusFilter
    const matchesDepartment = !departmentFilter || user.department === departmentFilter
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })

  const departments = [...new Set(users.map(u => u.department))]
  const roles = [...new Set(users.map(u => u.role))]

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map(u => u.id)
    )
  }

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return
      
      const newStatus = user.status === 'active' ? 'suspended' : 'active'
      
      // Call API to update user status
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          userId: userId
        })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user =>
          user.id === userId
            ? { ...user, status: newStatus as 'active' | 'inactive' | 'suspended' }
            : user
        ))
        alert(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`)
      } else {
        alert('Failed to update user status. Please try again.')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const resetUserPassword = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      // In production, call API to reset password
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          userId: userId
        })
      })

      if (response.ok) {
        alert(`Password reset email sent to ${user.email}`)
      } else {
        alert('Failed to reset password. Please try again.')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const deleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete_user',
            userId: userId
          })
        })

        if (response.ok) {
          setUsers(prev => prev.filter(user => user.id !== userId))
          alert('User deleted successfully!')
        } else {
          alert('Failed to delete user. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('An error occurred. Please try again.')
      }
    }
  }

  const viewUserDetails = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUserForView(user)
      setShowUserDetails(userId)
    }
  }

  const editUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setShowEditUser(userId)
      // In a real implementation, this would open an edit form
      alert(`Edit functionality for ${user.firstName} ${user.lastName} would open here. This would typically show a form with current user data that can be modified.`)
    }
  }

  const bulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return

    const confirmMessage = {
      'activate': `Are you sure you want to activate ${selectedUsers.length} users?`,
      'suspend': `Are you sure you want to suspend ${selectedUsers.length} users?`,
      'delete': `Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`
    }

    if (!confirm(confirmMessage[action as keyof typeof confirmMessage])) {
      return
    }

    try {
      setLoading(true)
      
      // Process each user individually for now (in production, implement bulk API)
      for (const userId of selectedUsers) {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: action === 'activate' ? 'toggle_status' : 
                   action === 'suspend' ? 'toggle_status' : 'delete_user',
            userId: userId
          })
        })

        if (!response.ok) {
          console.error(`Failed to ${action} user ${userId}`)
        }
      }

      // Update local state based on action
      switch (action) {
        case 'activate':
          setUsers(prev => prev.map(user =>
            selectedUsers.includes(user.id) ? { ...user, status: 'active' as const } : user
          ))
          break
        case 'suspend':
          setUsers(prev => prev.map(user =>
            selectedUsers.includes(user.id) ? { ...user, status: 'suspended' as const } : user
          ))
          break
        case 'delete':
          setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)))
          break
      }

      alert(`Successfully ${action}d ${selectedUsers.length} users!`)
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error)
      alert(`An error occurred while performing bulk ${action}. Please try again.`)
    } finally {
      setLoading(false)
      setSelectedUsers([])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-700 border border-gray-200'
      case 'suspended': return 'bg-orange-100 text-orange-700 border border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'suspended': return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
      default: return <CheckCircleIcon className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className={`space-y-6 w-full max-w-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">User Management</h2>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium shadow-md"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <button className="flex items-center justify-center px-3 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium">
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2 text-gray-600" />
            <span className="text-gray-700">More Filters</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-sm text-black font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-3">
              <button
                onClick={() => bulkAction('activate')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors duration-200 font-medium shadow-sm"
              >
                Activate
              </button>
              <button
                onClick={() => bulkAction('suspend')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors duration-200 font-medium shadow-sm"
              >
                Suspend
              </button>
              <button
                onClick={() => bulkAction('delete')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors duration-200 font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={selectAllUsers}
                  className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                User Information
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                Role & Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-5 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center border-2 border-orange-300">
                        <span className="text-sm font-bold text-orange-700">
                          {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || user.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-black">
                        {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <EnvelopeIcon className="h-3 w-3 mr-1 text-gray-500" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <PhoneIcon className="h-3 w-3 mr-1 text-gray-500" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-medium text-black">{user.role}</div>
                  <div className="text-sm text-gray-600 font-medium">{user.department}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {user.permissions?.length || 0} permission{(user.permissions?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(user.status)}
                    <span className={`ml-2 inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewUserDetails(user.id)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4 text-black" />
                    </button>
                    <button
                      onClick={() => editUser(user.id)}
                      className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors duration-200"
                      title="Edit User"
                    >
                      <PencilIcon className="h-4 w-4 text-orange-600" />
                    </button>
                    <button
                      onClick={() => resetUserPassword(user.id)}
                      className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors duration-200"
                      title="Reset Password"
                    >
                      <KeyIcon className="h-4 w-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        user.status === 'active' 
                          ? 'bg-orange-100 hover:bg-orange-200' 
                          : 'bg-green-100 hover:bg-green-200'
                      }`}
                      title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                    >
                      <ShieldCheckIcon className={`h-4 w-4 ${
                        user.status === 'active' ? 'text-orange-600' : 'text-green-600'
                      }`} />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200"
                      title="Delete User"
                    >
                      <TrashIcon className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">Loading users...</h3>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
            <div className="text-3xl font-bold text-black">{users.length}</div>
            <div className="text-sm font-medium text-gray-600 mt-1">Total Users</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm font-medium text-green-700 mt-1">Active Users</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
            <div className="text-3xl font-bold text-orange-600">
              {users.filter(u => u.status === 'suspended').length}
            </div>
            <div className="text-sm font-medium text-orange-700 mt-1">Suspended Users</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-white">
              {departments.length}
            </div>
            <div className="text-sm font-medium text-gray-200 mt-1">Departments</div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUserForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">User Details</h3>
              <button
                onClick={() => {
                  setShowUserDetails(null)
                  setSelectedUserForView(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Info Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center border-2 border-orange-300">
                    <span className="text-xl font-bold text-orange-700">
                      {`${selectedUserForView.firstName?.[0] || ''}${selectedUserForView.lastName?.[0] || ''}` || selectedUserForView.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-semibold text-black">
                      {`${selectedUserForView.firstName || ''} ${selectedUserForView.lastName || ''}`.trim() || selectedUserForView.email}
                    </h4>
                    <p className="text-gray-600">{selectedUserForView.position || 'No position specified'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                  <h5 className="font-semibold text-black mb-3">Contact Information</h5>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{selectedUserForView.email}</span>
                    </div>
                    {selectedUserForView.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">{selectedUserForView.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                  <h5 className="font-semibold text-black mb-3">Role & Access</h5>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Role:</span>
                      <p className="font-medium text-black">{selectedUserForView.role}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Department:</span>
                      <p className="font-medium text-black">{selectedUserForView.department}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUserForView.status)}`}>
                        {selectedUserForView.status.charAt(0).toUpperCase() + selectedUserForView.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                <h5 className="font-semibold text-black mb-3">Account Information</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Last Login:</span>
                    <p className="font-medium text-black">
                      {selectedUserForView.lastLogin ? new Date(selectedUserForView.lastLogin).toLocaleString() : 'Never logged in'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Account Created:</span>
                    <p className="font-medium text-black">
                      {selectedUserForView.createdAt ? new Date(selectedUserForView.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              {selectedUserForView.permissions && selectedUserForView.permissions.length > 0 && (
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                  <h5 className="font-semibold text-black mb-3">Permissions ({selectedUserForView.permissions.length})</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUserForView.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full border border-green-200"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => editUser(selectedUserForView.id)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
                >
                  Edit User
                </button>
                <button
                  onClick={() => resetUserPassword(selectedUserForView.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => toggleUserStatus(selectedUserForView.id)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-white ${
                    selectedUserForView.status === 'active' 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {selectedUserForView.status === 'active' ? 'Suspend User' : 'Activate User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
