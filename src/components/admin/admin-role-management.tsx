"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  ShieldCheckIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
  ClipboardDocumentIcon,
  UsersIcon,
  UserGroupIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface Permission {
  id: string
  name: string
  description: string
  category: string
  module: string
  actions?: string[]
}

interface Department {
  name: string
  modules: string[]
}

interface SupervisoryLevel {
  name: string
  level: number
  permissions: string[]
}

interface ModulePermission {
  id: string
  name: string
  description: string
  actions: string[]
}

type DepartmentKey = 'HR' | 'Finance' | 'Operations' | 'IT' | 'Call Centre' | 'Management'
type SupervisoryLevelKey = 'Staff' | 'Supervisor' | 'Manager' | 'Director'
type ModuleKey = 'Employee Management' | 'Recruitment' | 'Program Management' | 'Call Management' | 'Financial Reports' | 'System Administration' | 'User Management'

interface Role {
  id: string
  name: string
  description: string
  department: string
  supervisoryLevel: string
  permissions: Permission[]
  userCount: number
  createdAt: string
  updatedAt: string
  isSystem: boolean
  isGenerated: boolean // Auto-generated from department + supervisory level
}

interface User {
  id: string
  name: string
  email: string
  department: string
  supervisoryLevel: string
  customRoles: string[] // Additional custom roles beyond department role
  groups: string[]
  isActive: boolean
  createdAt: string
}

interface UserGroup {
  id: string
  name: string
  description: string
  permissions: Permission[]
  users: string[]
  roles: string[]
  createdAt: string
}

interface RoleManagementProps {
  className?: string
}

export function AdminRoleManagement({ className = '' }: RoleManagementProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'groups' | 'permissions'>('roles')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Role | User | UserGroup | null>(null)
  const [editingItem, setEditingItem] = useState<Role | User | UserGroup | null>(null)
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [dragOverItem, setDragOverItem] = useState<any>(null)

  // Departments and their modules
  const departments: Record<DepartmentKey, Department> = {
    'HR': {
      name: 'Human Resources',
      modules: ['Employee Management', 'Recruitment', 'Performance', 'Payroll', 'Time & Attendance']
    },
    'Finance': {
      name: 'Finance & Accounting',
      modules: ['Accounting', 'Budget Management', 'Financial Reports', 'Procurement', 'Asset Management']
    },
    'Operations': {
      name: 'Operations',
      modules: ['Program Management', 'Project Tracking', 'Resource Allocation', 'Quality Control']
    },
    'IT': {
      name: 'Information Technology',
      modules: ['System Administration', 'User Management', 'Security', 'Infrastructure', 'Support']
    },
    'Call Centre': {
      name: 'Call Centre',
      modules: ['Call Management', 'Case Tracking', 'Customer Service', 'Analytics', 'Quality Assurance']
    },
    'Management': {
      name: 'Senior Management',
      modules: ['Strategic Planning', 'Executive Reports', 'Policy Management', 'Compliance', 'Audit']
    }
  }

  // Supervisory levels with hierarchy
  const supervisoryLevels: Record<SupervisoryLevelKey, SupervisoryLevel> = {
    'Staff': {
      name: 'Staff Level',
      level: 1,
      permissions: ['view', 'create', 'edit_own']
    },
    'Supervisor': {
      name: 'Supervisor Level',
      level: 2,
      permissions: ['view', 'create', 'edit', 'edit_own', 'approve_basic']
    },
    'Manager': {
      name: 'Manager Level',
      level: 3,
      permissions: ['view', 'create', 'edit', 'delete', 'edit_own', 'approve_basic', 'approve_advanced', 'manage_team']
    },
    'Director': {
      name: 'Director Level',
      level: 4,
      permissions: ['view', 'create', 'edit', 'delete', 'edit_own', 'approve_basic', 'approve_advanced', 'manage_team', 'manage_department', 'strategic_access']
    }
  }

  // Module-specific permissions with actions
  const modulePermissions: Record<string, ModulePermission[]> = {
    'Employee Management': [
      { id: 'emp.view', name: 'View Employees', description: 'View employee profiles and basic information', actions: ['view'] },
      { id: 'emp.create', name: 'Create Employees', description: 'Add new employees to the system', actions: ['create'] },
      { id: 'emp.edit', name: 'Edit Employees', description: 'Modify employee information', actions: ['edit'] },
      { id: 'emp.edit_own', name: 'Edit Own Profile', description: 'Edit own employee profile', actions: ['edit_own'] },
      { id: 'emp.delete', name: 'Delete Employees', description: 'Remove employees from system', actions: ['delete'] },
      { id: 'emp.approve_basic', name: 'Approve Basic Changes', description: 'Approve basic employee changes', actions: ['approve_basic'] },
      { id: 'emp.manage_team', name: 'Manage Team', description: 'Manage team members', actions: ['manage_team'] },
    ],
    'Recruitment': [
      { id: 'rec.view', name: 'View Recruitment', description: 'View job postings and applications', actions: ['view'] },
      { id: 'rec.create', name: 'Create Job Postings', description: 'Create new job postings', actions: ['create'] },
      { id: 'rec.edit', name: 'Edit Recruitment', description: 'Modify job postings and applications', actions: ['edit'] },
      { id: 'rec.delete', name: 'Delete Recruitment', description: 'Remove job postings', actions: ['delete'] },
      { id: 'rec.approve_basic', name: 'Approve Applications', description: 'Approve job applications', actions: ['approve_basic'] },
      { id: 'rec.manage_team', name: 'Manage Recruitment Team', description: 'Oversee recruitment team', actions: ['manage_team'] },
    ],
    'Program Management': [
      { id: 'prog.view', name: 'View Programs', description: 'View program information and status', actions: ['view'] },
      { id: 'prog.create', name: 'Create Programs', description: 'Create new programs', actions: ['create'] },
      { id: 'prog.edit', name: 'Edit Programs', description: 'Modify program details', actions: ['edit'] },
      { id: 'prog.delete', name: 'Delete Programs', description: 'Remove programs', actions: ['delete'] },
      { id: 'prog.approve_advanced', name: 'Approve Program Changes', description: 'Approve major program changes', actions: ['approve_advanced'] },
      { id: 'prog.manage_team', name: 'Manage Program Team', description: 'Manage program team members', actions: ['manage_team'] },
    ],
    'Call Management': [
      { id: 'call.view', name: 'View Calls', description: 'View call records and details', actions: ['view'] },
      { id: 'call.create', name: 'Create Call Records', description: 'Log new calls', actions: ['create'] },
      { id: 'call.edit', name: 'Edit Call Records', description: 'Modify call information', actions: ['edit'] },
      { id: 'call.edit_own', name: 'Edit Own Calls', description: 'Edit own call records', actions: ['edit_own'] },
      { id: 'call.approve_basic', name: 'Approve Call Records', description: 'Approve call record changes', actions: ['approve_basic'] },
      { id: 'call.manage_team', name: 'Manage Call Team', description: 'Manage call centre team', actions: ['manage_team'] },
    ],
    'Financial Reports': [
      { id: 'finrep.view', name: 'View Financial Reports', description: 'View financial reports and data', actions: ['view'] },
      { id: 'finrep.create', name: 'Create Financial Reports', description: 'Generate new financial reports', actions: ['create'] },
      { id: 'finrep.edit', name: 'Edit Financial Reports', description: 'Modify financial report data', actions: ['edit'] },
      { id: 'finrep.approve_advanced', name: 'Approve Financial Reports', description: 'Approve financial reports for publication', actions: ['approve_advanced'] },
      { id: 'finrep.strategic_access', name: 'Strategic Financial Access', description: 'Access to strategic financial information', actions: ['strategic_access'] },
    ],
    'System Administration': [
      { id: 'sysadmin.view', name: 'View System Status', description: 'View system health and status', actions: ['view'] },
      { id: 'sysadmin.edit', name: 'System Configuration', description: 'Configure system settings', actions: ['edit'] },
      { id: 'sysadmin.manage_department', name: 'Manage IT Department', description: 'Manage IT department operations', actions: ['manage_department'] },
      { id: 'sysadmin.strategic_access', name: 'Strategic System Access', description: 'Full system administrative access', actions: ['strategic_access'] },
    ],
    'User Management': [
      { id: 'user.view', name: 'View Users', description: 'View user accounts and profiles', actions: ['view'] },
      { id: 'user.create', name: 'Create Users', description: 'Create new user accounts', actions: ['create'] },
      { id: 'user.edit', name: 'Edit Users', description: 'Modify user account information', actions: ['edit'] },
      { id: 'user.delete', name: 'Delete Users', description: 'Remove user accounts', actions: ['delete'] },
      { id: 'user.manage_team', name: 'Manage User Teams', description: 'Manage user team assignments', actions: ['manage_team'] },
      { id: 'user.manage_department', name: 'Manage Department Users', description: 'Manage all users in department', actions: ['manage_department'] },
    ]
  }

  // Function to get permissions for a department + supervisory level combination
  const getRolePermissions = (department: DepartmentKey, supervisoryLevel: SupervisoryLevelKey): Permission[] => {
    const dept = departments[department]
    const level = supervisoryLevels[supervisoryLevel]
    
    if (!dept || !level) return []
    
    const permissions: Permission[] = []
    
    // Get all modules for this department
    dept.modules.forEach((module: string) => {
      const modulePerms = modulePermissions[module] || []
      
      // Filter permissions based on supervisory level
      modulePerms.forEach((perm: ModulePermission) => {
        const hasPermission = perm.actions.some((action: string) => level.permissions.includes(action))
        if (hasPermission) {
          permissions.push({
            id: perm.id,
            name: perm.name,
            description: perm.description,
            category: module,
            module: department,
            actions: perm.actions
          })
        }
      })
    })
    
    return permissions
  }

  // Generate role name based on department and supervisory level
  const generateRoleName = (department: DepartmentKey, supervisoryLevel: SupervisoryLevelKey): string => {
    return `${departments[department]?.name || department} ${supervisoryLevels[supervisoryLevel]?.name || supervisoryLevel}`
  }

  // Available permissions organized by module
  const availablePermissions = modulePermissions

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Generate mock roles based on department + supervisory level combinations
      const mockRoles: Role[] = []
      
      // Generate some sample departmental roles
      const roleCombinations = [
        { dept: 'HR' as DepartmentKey, level: 'Manager' as SupervisoryLevelKey },
        { dept: 'HR' as DepartmentKey, level: 'Staff' as SupervisoryLevelKey },
        { dept: 'Finance' as DepartmentKey, level: 'Director' as SupervisoryLevelKey },
        { dept: 'Finance' as DepartmentKey, level: 'Manager' as SupervisoryLevelKey },
        { dept: 'Operations' as DepartmentKey, level: 'Supervisor' as SupervisoryLevelKey },
        { dept: 'IT' as DepartmentKey, level: 'Manager' as SupervisoryLevelKey },
        { dept: 'Call Centre' as DepartmentKey, level: 'Supervisor' as SupervisoryLevelKey },
        { dept: 'Management' as DepartmentKey, level: 'Director' as SupervisoryLevelKey },
      ]
      
      roleCombinations.forEach(({ dept, level }, index) => {
        const permissions = getRolePermissions(dept, level)
        const roleName = generateRoleName(dept, level)
        
        mockRoles.push({
          id: (index + 1).toString(),
          name: roleName,
          description: `Auto-generated role for ${departments[dept].name} at ${supervisoryLevels[level].name}`,
          department: dept,
          supervisoryLevel: level,
          permissions: permissions,
          userCount: Math.floor(Math.random() * 10) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSystem: false,
          isGenerated: true
        })
      })
      
      // Add a system admin role
      mockRoles.push({
        id: '999',
        name: 'System Administrator',
        description: 'Full system access with all permissions',
        department: 'IT',
        supervisoryLevel: 'Director',
        permissions: Object.values(modulePermissions).flat().map(perm => ({
          id: perm.id,
          name: perm.name,
          description: perm.description,
          category: 'System Administration',
          module: 'IT',
          actions: perm.actions
        })),
        userCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSystem: true,
        isGenerated: false
      })

      const mockUsers: User[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@saywhat.com',
          department: 'HR',
          supervisoryLevel: 'Manager',
          customRoles: [],
          groups: ['1'],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@saywhat.com',
          department: 'Finance',
          supervisoryLevel: 'Director',
          customRoles: [],
          groups: ['2'],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob.johnson@saywhat.com',
          department: 'Operations',
          supervisoryLevel: 'Supervisor',
          customRoles: [],
          groups: ['3'],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Alice Brown',
          email: 'alice.brown@saywhat.com',
          department: 'IT',
          supervisoryLevel: 'Manager',
          customRoles: ['999'], // Has system admin role
          groups: [],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Charlie Wilson',
          email: 'charlie.wilson@saywhat.com',
          department: 'Call Centre',
          supervisoryLevel: 'Supervisor',
          customRoles: [],
          groups: [],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]

      const mockGroups: UserGroup[] = [
        {
          id: '1',
          name: 'HR Management Team',
          description: 'Human Resources management group',
          permissions: getRolePermissions('HR', 'Manager'),
          users: ['1'],
          roles: ['1'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Finance Leadership',
          description: 'Financial leadership and oversight group',
          permissions: getRolePermissions('Finance', 'Director'),
          users: ['2'],
          roles: ['3'],
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Operations Team',
          description: 'Operations management group',
          permissions: getRolePermissions('Operations', 'Supervisor'),
          users: ['3'],
          roles: ['5'],
          createdAt: new Date().toISOString()
        }
      ]
      
      setRoles(mockRoles)
      setUsers(mockUsers)
      setGroups(mockGroups)
      
      // Flatten permissions from module permissions
      const allPermissions = Object.entries(modulePermissions).flatMap(([module, perms]) =>
        perms.map(p => ({ 
          ...p, 
          category: module, 
          module: module.toLowerCase().replace(/\s+/g, '_'),
          actions: p.actions
        }))
      )
      setPermissions(allPermissions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateRole = async (roleData: any) => {
    try {
      let newRole: Role
      
      if (roleData.department && roleData.supervisoryLevel) {
        // Auto-generate role based on department + supervisory level
        const permissions = getRolePermissions(roleData.department as DepartmentKey, roleData.supervisoryLevel as SupervisoryLevelKey)
        const roleName = generateRoleName(roleData.department as DepartmentKey, roleData.supervisoryLevel as SupervisoryLevelKey)
        
        newRole = {
          id: Date.now().toString(),
          name: roleName,
          description: roleData.description || `Auto-generated role for ${departments[roleData.department as DepartmentKey].name} at ${supervisoryLevels[roleData.supervisoryLevel as SupervisoryLevelKey].name}`,
          department: roleData.department,
          supervisoryLevel: roleData.supervisoryLevel,
          permissions: permissions,
          userCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSystem: false,
          isGenerated: true
        }
      } else {
        // Custom role
        newRole = {
          id: Date.now().toString(),
          name: roleData.name,
          description: roleData.description,
          department: roleData.department || 'Management',
          supervisoryLevel: roleData.supervisoryLevel || 'Staff',
          permissions: roleData.permissions || [],
          userCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSystem: false,
          isGenerated: false
        }
      }
      
      setRoles(prev => [...prev, newRole])
      setShowCreateModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role')
    }
  }

  const handleUpdateRole = async (roleId: string, roleData: any) => {
    try {
      setRoles(prev => prev.map(role => 
        role.id === roleId 
          ? { 
              ...role, 
              ...roleData, 
              updatedAt: new Date().toISOString(),
              // If department or supervisory level changed, update permissions
              permissions: (roleData.department || roleData.supervisoryLevel) && role.isGenerated
                ? getRolePermissions(roleData.department || role.department, roleData.supervisoryLevel || role.supervisoryLevel)
                : roleData.permissions || role.permissions
            }
          : role
      ))
      setEditingItem(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      setRoles(prev => prev.filter(role => role.id !== roleId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role')
    }
  }

  const handleCreateUser = async (userData: any) => {
    try {
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        department: userData.department || 'Management',
        supervisoryLevel: userData.supervisoryLevel || 'Staff',
        customRoles: userData.customRoles || [],
        groups: userData.groups || [],
        isActive: userData.isActive ?? true,
        createdAt: new Date().toISOString()
      }
      
      setUsers(prev => [...prev, newUser])
      setShowCreateModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, ...userData }
          : user
      ))
      setEditingItem(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const handleCreateGroup = async (groupData: any) => {
    try {
      const newGroup: UserGroup = {
        id: Date.now().toString(),
        name: groupData.name,
        description: groupData.description,
        permissions: groupData.permissions || [],
        users: groupData.users || [],
        roles: groupData.roles || [],
        createdAt: new Date().toISOString()
      }
      
      setGroups(prev => [...prev, newGroup])
      setShowCreateModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group')
    }
  }

  const handleUpdateGroup = async (groupId: string, groupData: any) => {
    try {
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, ...groupData }
          : group
      ))
      setEditingItem(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      setGroups(prev => prev.filter(group => group.id !== groupId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, item: any) => {
    e.preventDefault()
    setDragOverItem(item)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetItem: any) => {
    e.preventDefault()
    
    if (draggedItem && targetItem && draggedItem.id !== targetItem.id) {
      // Handle dropping permissions onto roles/users/groups
      if (draggedItem.category && (targetItem.name || targetItem.email)) {
        // Dropping permission onto role/user/group
        const permission = draggedItem
        
        if (activeTab === 'roles') {
          const updatedRoles = roles.map(role => {
            if (role.id === targetItem.id) {
              const hasPermission = role.permissions.some(p => p.id === permission.id)
              if (!hasPermission) {
                return { ...role, permissions: [...role.permissions, permission] }
              }
            }
            return role
          })
          setRoles(updatedRoles)
        } else if (activeTab === 'users') {
          // Add permission to user (through roles)
          console.log('Adding permission to user:', permission, targetItem)
        } else if (activeTab === 'groups') {
          const updatedGroups = groups.map(group => {
            if (group.id === targetItem.id) {
              const hasPermission = group.permissions.some(p => p.id === permission.id)
              if (!hasPermission) {
                return { ...group, permissions: [...group.permissions, permission] }
              }
            }
            return group
          })
          setGroups(updatedGroups)
        }
      }
    }
    
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const filteredData = () => {
    const data = activeTab === 'roles' ? roles : 
                  activeTab === 'users' ? users : 
                  activeTab === 'groups' ? groups : permissions
    
    return data.filter((item: any) => {
      const matchesSearch = searchTerm === '' || 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
  }

  const tabs = [
    { id: 'roles', name: 'Roles', icon: ShieldCheckIcon, count: roles.length },
    { id: 'users', name: 'Users', icon: UsersIcon, count: users.length },
    { id: 'groups', name: 'Groups', icon: UserGroupIcon, count: groups.length },
    { id: 'permissions', name: 'Permissions', icon: KeyIcon, count: permissions.length },
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
          <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Role Management</h2>
            <p className="text-sm text-gray-600">Manage user roles, permissions, and groups with drag-and-drop</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'roles' && (
            <RolesTabComponent
              roles={filteredData() as Role[]}
              onEdit={setEditingItem}
              onDelete={handleDeleteRole}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverItem={dragOverItem}
            />
          )}
          
          {activeTab === 'users' && (
            <UsersTabComponent
              users={filteredData() as User[]}
              onEdit={setEditingItem}
              onDelete={handleDeleteUser}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverItem={dragOverItem}
            />
          )}
          
          {activeTab === 'groups' && (
            <GroupsTabComponent
              groups={filteredData() as UserGroup[]}
              onEdit={setEditingItem}
              onDelete={handleDeleteGroup}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverItem={dragOverItem}
            />
          )}
          
          {activeTab === 'permissions' && (
            <PermissionsTabComponent
              permissions={filteredData() as Permission[]}
              availablePermissions={availablePermissions}
              onDragStart={handleDragStart}
            />
          )}
        </div>

        {/* Sidebar - Drag and Drop Area */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-2">
                💡 <strong>Drag & Drop:</strong> Drag permissions to roles/users/groups to assign them
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-100 flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create New {activeTab.slice(0, -1)}</span>
              </button>
            </div>
          </div>

          {/* Permissions Panel */}
          {activeTab !== 'permissions' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Permissions</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(availablePermissions).map(([category, perms]) => (
                  <div key={category} className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">{category}</h4>
                    {perms.map((permission) => (
                      <div
                        key={permission.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, { ...permission, category })}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100"
                      >
                        <Bars3Icon className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateModalComponent
          type={activeTab}
          onClose={() => setShowCreateModal(false)}
          onCreate={
            activeTab === 'roles' ? handleCreateRole :
            activeTab === 'users' ? handleCreateUser :
            activeTab === 'groups' ? handleCreateGroup :
            () => {}
          }
          availablePermissions={availablePermissions}
          departments={departments}
          supervisoryLevels={supervisoryLevels}
          roles={roles}
          getRolePermissions={getRolePermissions}
          generateRoleName={generateRoleName}
        />
      )}

      {editingItem && (
        <EditModalComponent
          type={activeTab}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={
            activeTab === 'roles' ? handleUpdateRole :
            activeTab === 'users' ? handleUpdateUser :
            activeTab === 'groups' ? handleUpdateGroup :
            () => {}
          }
          availablePermissions={availablePermissions}
          departments={departments}
          supervisoryLevels={supervisoryLevels}
          roles={roles}
        />
      )}
    </div>
  )
}

// Roles Tab Component
interface RolesTabProps {
  roles: Role[]
  onEdit: (role: Role) => void
  onDelete: (roleId: string) => void
  onDragStart: (e: React.DragEvent, item: any) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent, item: any) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, item: any) => void
  dragOverItem: any
}

function RolesTabComponent({ roles, onEdit, onDelete, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, dragOverItem }: RolesTabProps) {
  const [expandedRoles, setExpandedRoles] = useState<string[]>([])

  const toggleExpanded = (roleId: string) => {
    setExpandedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Roles</h3>
        <p className="text-sm text-gray-600">Manage user roles and their permissions</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`p-6 hover:bg-gray-50 ${dragOverItem?.id === role.id ? 'bg-blue-50 border-blue-200' : ''}`}
            onDragOver={onDragOver}
            onDragEnter={(e) => onDragEnter(e, role)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, role)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                    {role.isSystem && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        System
                      </span>
                    )}
                    {role.isGenerated && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Auto-Generated
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">
                      {role.department} - {role.supervisoryLevel}
                    </span>
                    <span className="text-sm text-gray-500">
                      {role.permissions.length} permissions
                    </span>
                    <span className="text-sm text-gray-500">
                      {role.userCount} users
                    </span>
                    <button
                      onClick={() => toggleExpanded(role.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                    >
                      {expandedRoles.includes(role.id) ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                      <span>Permissions</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(role)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => onDelete(role.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            {expandedRoles.includes(role.id) && (
              <div className="mt-4 pl-11">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Assigned Permissions</h5>
                  <div className="space-y-1">
                    {role.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {permission.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Users Tab Component
interface UsersTabProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
  onDragStart: (e: React.DragEvent, item: any) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent, item: any) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, item: any) => void
  dragOverItem: any
}

function UsersTabComponent({ users, onEdit, onDelete, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, dragOverItem }: UsersTabProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Users</h3>
        <p className="text-sm text-gray-600">Manage user accounts and their role assignments</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div
            key={user.id}
            className={`p-6 hover:bg-gray-50 ${dragOverItem?.id === user.id ? 'bg-blue-50 border-blue-200' : ''}`}
            onDragOver={onDragOver}
            onDragEnter={(e) => onDragEnter(e, user)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, user)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                    {!user.isActive && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">
                      {user.department} - {user.supervisoryLevel}
                    </span>
                    <span className="text-sm text-gray-500">
                      {user.customRoles.length} custom roles
                    </span>
                    <span className="text-sm text-gray-500">
                      {user.groups.length} groups
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(user)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(user.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Groups Tab Component
interface GroupsTabProps {
  groups: UserGroup[]
  onEdit: (group: UserGroup) => void
  onDelete: (groupId: string) => void
  onDragStart: (e: React.DragEvent, item: any) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent, item: any) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, item: any) => void
  dragOverItem: any
}

function GroupsTabComponent({ groups, onEdit, onDelete, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, dragOverItem }: GroupsTabProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">User Groups</h3>
        <p className="text-sm text-gray-600">Manage user groups and their permissions</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`p-6 hover:bg-gray-50 ${dragOverItem?.id === group.id ? 'bg-blue-50 border-blue-200' : ''}`}
            onDragOver={onDragOver}
            onDragEnter={(e) => onDragEnter(e, group)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, group)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-600">{group.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">
                      {group.permissions.length} permissions
                    </span>
                    <span className="text-sm text-gray-500">
                      {group.users.length} users
                    </span>
                    <span className="text-sm text-gray-500">
                      {group.roles.length} roles
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(group)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(group.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Permissions Tab Component
interface PermissionsTabProps {
  permissions: Permission[]
  availablePermissions: any
  onDragStart: (e: React.DragEvent, item: any) => void
}

function PermissionsTabComponent({ permissions, availablePermissions, onDragStart }: PermissionsTabProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
        <p className="text-sm text-gray-600">All available system permissions</p>
      </div>
      
      <div className="p-6 space-y-6">
        {Object.entries(availablePermissions).map(([category, perms]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-lg font-medium text-gray-900">{category}</h4>
            <div className="grid grid-cols-1 gap-2">
              {(perms as any[]).map((permission) => (
                <div
                  key={permission.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, { ...permission, category })}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 border border-gray-200"
                >
                  <Bars3Icon className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-sm font-medium text-gray-900">{permission.name}</h5>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {permission.id}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Create Modal Component
interface CreateModalProps {
  type: string
  onClose: () => void
  onCreate: (data: any) => void
  availablePermissions: any
  departments: Record<DepartmentKey, Department>
  supervisoryLevels: Record<SupervisoryLevelKey, SupervisoryLevel>
  roles: Role[]
  getRolePermissions: (department: DepartmentKey, supervisoryLevel: SupervisoryLevelKey) => Permission[]
  generateRoleName: (department: DepartmentKey, supervisoryLevel: SupervisoryLevelKey) => string
}

function CreateModalComponent({ type, onClose, onCreate, availablePermissions, departments, supervisoryLevels, roles, getRolePermissions, generateRoleName }: CreateModalProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    department: '',
    supervisoryLevel: '',
    permissions: [],
    customRoles: [],
    groups: [],
    email: '',
    isActive: true,
    autoGenerate: false // Flag to auto-generate role from department + supervisory level
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
  }

  const handleAutoGenerate = (department: string, supervisoryLevel: string) => {
    if (department && supervisoryLevel) {
      const roleName = generateRoleName(department as DepartmentKey, supervisoryLevel as SupervisoryLevelKey)
      const permissions = getRolePermissions(department as DepartmentKey, supervisoryLevel as SupervisoryLevelKey)
      
      setFormData({
        ...formData,
        name: roleName,
        description: `Auto-generated role for ${departments[department as DepartmentKey]?.name} at ${supervisoryLevels[supervisoryLevel as SupervisoryLevelKey]?.name}`,
        permissions: permissions,
        autoGenerate: true
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Create New {type.slice(0, -1)}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {type === 'users' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Department and Supervisory Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.department}
                onChange={(e) => {
                  setFormData({ ...formData, department: e.target.value })
                  if (type === 'roles' && e.target.value && formData.supervisoryLevel) {
                    handleAutoGenerate(e.target.value, formData.supervisoryLevel)
                  }
                }}
              >
                <option value="">Select Department</option>
                {Object.entries(departments).map(([key, dept]) => (
                  <option key={key} value={key}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supervisory Level
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.supervisoryLevel}
                onChange={(e) => {
                  setFormData({ ...formData, supervisoryLevel: e.target.value })
                  if (type === 'roles' && formData.department && e.target.value) {
                    handleAutoGenerate(formData.department, e.target.value)
                  }
                }}
              >
                <option value="">Select Level</option>
                {Object.entries(supervisoryLevels).map(([key, level]) => (
                  <option key={key} value={key}>{level.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto-generate notification for roles */}
          {type === 'roles' && formData.department && formData.supervisoryLevel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Auto-generating role:</strong> Selecting a department and supervisory level will automatically generate appropriate permissions based on the role hierarchy.
              </p>
            </div>
          )}

          {/* Custom Roles for Users */}
          {type === 'users' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Custom Roles
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                {roles.filter(role => !role.isGenerated).map((role) => (
                  <label key={role.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={formData.customRoles.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            customRoles: [...formData.customRoles, role.id]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            customRoles: formData.customRoles.filter((id: string) => id !== role.id)
                          })
                        }
                      }}
                    />
                    <span>{role.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Permissions for roles and groups */}
          {(type === 'roles' || type === 'groups') && !formData.autoGenerate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Permissions
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {Object.entries(availablePermissions).map(([module, perms]) => (
                  <div key={module} className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{module}</h4>
                    {(perms as ModulePermission[]).map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={formData.permissions.some((p: any) => p.id === permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                permissions: [...formData.permissions, { 
                                  ...permission, 
                                  category: module,
                                  module: module.toLowerCase().replace(/\s+/g, '_')
                                }]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                permissions: formData.permissions.filter((p: any) => p.id !== permission.id)
                              })
                            }
                          }}
                        />
                        <span>{permission.name}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Create {type.slice(0, -1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Modal Component
interface EditModalProps {
  type: string
  item: any
  onClose: () => void
  onUpdate: (id: string, data: any) => void
  availablePermissions: any
  departments: Record<DepartmentKey, Department>
  supervisoryLevels: Record<SupervisoryLevelKey, SupervisoryLevel>
  roles: Role[]
}

function EditModalComponent({ type, item, onClose, onUpdate, availablePermissions, departments, supervisoryLevels, roles }: EditModalProps) {
  const [formData, setFormData] = useState<any>({
    name: item.name || '',
    description: item.description || '',
    department: item.department || '',
    supervisoryLevel: item.supervisoryLevel || '',
    permissions: item.permissions || [],
    customRoles: item.customRoles || [],
    groups: item.groups || [],
    email: item.email || '',
    isActive: item.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(item.id, formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit {type.slice(0, -1)}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {type === 'users' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Department and Supervisory Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="">Select Department</option>
                {Object.entries(departments).map(([key, dept]) => (
                  <option key={key} value={key}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supervisory Level
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.supervisoryLevel}
                onChange={(e) => setFormData({ ...formData, supervisoryLevel: e.target.value })}
              >
                <option value="">Select Level</option>
                {Object.entries(supervisoryLevels).map(([key, level]) => (
                  <option key={key} value={key}>{level.name}</option>
                ))}
              </select>
            </div>
          </div>

          {type === 'users' && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          )}

          {/* Custom Roles for Users */}
          {type === 'users' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Custom Roles
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                {roles.filter(role => !role.isGenerated).map((role) => (
                  <label key={role.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={formData.customRoles.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            customRoles: [...formData.customRoles, role.id]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            customRoles: formData.customRoles.filter((id: string) => id !== role.id)
                          })
                        }
                      }}
                    />
                    <span>{role.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(type === 'roles' || type === 'groups') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {Object.entries(availablePermissions).map(([module, perms]) => (
                  <div key={module} className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{module}</h4>
                    {(perms as ModulePermission[]).map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={formData.permissions.some((p: any) => p.id === permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                permissions: [...formData.permissions, { 
                                  ...permission, 
                                  category: module,
                                  module: module.toLowerCase().replace(/\s+/g, '_')
                                }]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                permissions: formData.permissions.filter((p: any) => p.id !== permission.id)
                              })
                            }
                          }}
                        />
                        <span>{permission.name}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Update {type.slice(0, -1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
