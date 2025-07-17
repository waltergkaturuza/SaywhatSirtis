import React, { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, ShieldCheckIcon, LockClosedIcon } from "@heroicons/react/24/outline"

interface AccessRule {
  id: string
  role: string
  scope: 'project' | 'organization' | 'team'
  permissions: ('view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'admin')[]
  restrictions?: string[]
}

interface AccessControlSettingsProps {
  accessControls: AccessRule[]
  permissions: any
  onEdit: (access: AccessRule) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

const AccessControlSettings: React.FC<AccessControlSettingsProps> = ({ 
  accessControls, 
  permissions, 
  onEdit, 
  onDelete, 
  onAdd 
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterScope, setFilterScope] = useState<string>("")

  const filteredAccess = accessControls.filter(access => {
    const matchesSearch = access.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesScope = !filterScope || access.scope === filterScope
    return matchesSearch && matchesScope
  })

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'project': return 'bg-blue-100 text-blue-800'
      case 'organization': return 'bg-purple-100 text-purple-800'
      case 'team': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'project': return '📁'
      case 'organization': return '🏢'
      case 'team': return '👥'
      default: return '🔒'
    }
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'view': return 'bg-gray-100 text-gray-800'
      case 'create': return 'bg-green-100 text-green-800'
      case 'edit': return 'bg-blue-100 text-blue-800'
      case 'delete': return 'bg-red-100 text-red-800'
      case 'approve': return 'bg-yellow-100 text-yellow-800'
      case 'export': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'view': return '👁️'
      case 'create': return '➕'
      case 'edit': return '✏️'
      case 'delete': return '🗑️'
      case 'approve': return '✅'
      case 'export': return '📤'
      case 'admin': return '⚡'
      default: return '❓'
    }
  }

  const getRoleIcon = (role: string) => {
    if (role.toLowerCase().includes('manager')) return '👨‍💼'
    if (role.toLowerCase().includes('admin')) return '⚡'
    if (role.toLowerCase().includes('lead')) return '🎯'
    if (role.toLowerCase().includes('member')) return '👤'
    if (role.toLowerCase().includes('viewer')) return '👁️'
    return '👤'
  }

  const getPermissionLevel = (permissions: string[]) => {
    if (permissions.includes('admin')) return { level: 'Full Access', color: 'text-red-600' }
    if (permissions.includes('delete')) return { level: 'High Access', color: 'text-orange-600' }
    if (permissions.includes('edit')) return { level: 'Medium Access', color: 'text-yellow-600' }
    if (permissions.includes('create')) return { level: 'Basic Access', color: 'text-blue-600' }
    if (permissions.includes('view')) return { level: 'Read Only', color: 'text-gray-600' }
    return { level: 'No Access', color: 'text-gray-400' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Access Control</h3>
          <p className="text-sm text-gray-600">
            Manage user roles and permissions for project access and actions
          </p>
        </div>
        {permissions?.canCreate && (
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Role</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Scopes</option>
            <option value="project">Project</option>
            <option value="organization">Organization</option>
            <option value="team">Team</option>
          </select>
        </div>
      </div>

      {/* Access Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAccess.map((access) => {
          const permissionLevel = getPermissionLevel(access.permissions)
          
          return (
            <div
              key={access.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Role Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getRoleIcon(access.role)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{access.role}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScopeColor(access.scope)}`}>
                        <span className="mr-1">{getScopeIcon(access.scope)}</span>
                        {access.scope.charAt(0).toUpperCase() + access.scope.slice(1)}
                      </span>
                      <span className={`text-sm font-medium ${permissionLevel.color}`}>
                        {permissionLevel.level}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {permissions?.canEdit && (
                    <button
                      onClick={() => onEdit(access)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                  {permissions?.canDelete && (
                    <button
                      onClick={() => onDelete(access.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Permissions:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {access.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getPermissionColor(permission)}`}
                      >
                        <span>{getPermissionIcon(permission)}</span>
                        <span className="capitalize">{permission}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Restrictions */}
                {access.restrictions && access.restrictions.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Restrictions:</span>
                    <div className="mt-1 space-y-1">
                      {access.restrictions.map((restriction, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <LockClosedIcon className="h-3 w-3 text-red-500" />
                          <span>{restriction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permission Count */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {access.permissions.length} permission{access.permissions.length !== 1 ? 's' : ''} granted
                    </span>
                    <div className="flex items-center space-x-1">
                      <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAccess.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No access rules found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterScope 
              ? 'Try adjusting your filters' 
              : 'Get started by creating your first access control rule'
            }
          </p>
          {permissions?.canCreate && !searchTerm && !filterScope && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Access Rule
            </button>
          )}
        </div>
      )}

      {/* Permission Matrix Overview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Permission Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {accessControls.length}
            </div>
            <div className="text-sm text-gray-600">Total Roles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Array.from(new Set(accessControls.map(a => a.scope))).length}
            </div>
            <div className="text-sm text-gray-600">Scope Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Array.from(new Set(accessControls.flatMap(a => a.permissions))).length}
            </div>
            <div className="text-sm text-gray-600">Permission Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {accessControls.filter(a => a.permissions.includes('admin')).length}
            </div>
            <div className="text-sm text-gray-600">Admin Roles</div>
          </div>
        </div>
        
        {/* Quick Permission Legend */}
        <div className="border-t pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Permission Levels:</h5>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Read Only</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Basic Access</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Medium Access</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>High Access</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Full Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessControlSettings;
