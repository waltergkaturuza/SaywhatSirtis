'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Shield, 
  Save, 
  X, 
  UserCheck,
  Settings
} from 'lucide-react'

interface Role {
  id?: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
}

interface RoleFormProps {
  role?: Role
  onSubmit: (role: Role) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

const availablePermissions = [
  {
    category: 'Administration',
    permissions: [
      { id: 'admin.access', name: 'Admin Access', description: 'Access to admin panel' },
      { id: 'admin.users.manage', name: 'Manage Users', description: 'Create, edit, and delete users' },
      { id: 'admin.roles.manage', name: 'Manage Roles', description: 'Create, edit, and delete roles' },
      { id: 'admin.system.manage', name: 'System Management', description: 'Manage system settings and configuration' },
      { id: 'admin.audit.view', name: 'View Audit Logs', description: 'View system audit logs' },
    ]
  },
  {
    category: 'Human Resources',
    permissions: [
      { id: 'hr.access', name: 'HR Access', description: 'Access to HR module' },
      { id: 'hr.employees.manage', name: 'Manage Employees', description: 'Create, edit, and delete employee records' },
      { id: 'hr.payroll.manage', name: 'Manage Payroll', description: 'Process payroll and manage salary information' },
      { id: 'hr.performance.manage', name: 'Manage Performance', description: 'Manage performance reviews and appraisals' },
      { id: 'hr.reports.view', name: 'View HR Reports', description: 'Generate and view HR reports' },
    ]
  },
  {
    category: 'Finance',
    permissions: [
      { id: 'finance.access', name: 'Finance Access', description: 'Access to finance module' },
      { id: 'finance.budgets.manage', name: 'Manage Budgets', description: 'Create and manage budgets' },
      { id: 'finance.reports.view', name: 'View Financial Reports', description: 'Generate and view financial reports' },
      { id: 'finance.transactions.manage', name: 'Manage Transactions', description: 'Record and manage financial transactions' },
    ]
  },
  {
    category: 'Call Centre',
    permissions: [
      { id: 'calls.access', name: 'Call Centre Access', description: 'Access to call centre module' },
      { id: 'calls.manage', name: 'Manage Calls', description: 'Create, edit, and manage call records' },
      { id: 'calls.reports', name: 'Call Reports', description: 'Generate and view call reports' },
      { id: 'calls.analytics', name: 'Call Analytics', description: 'View call analytics and metrics' },
    ]
  },
  {
    category: 'Programs',
    permissions: [
      { id: 'programs.access', name: 'Programs Access', description: 'Access to programs module' },
      { id: 'programs.manage', name: 'Manage Programs', description: 'Create and manage programs and projects' },
      { id: 'programs.reports', name: 'Program Reports', description: 'Generate and view program reports' },
      { id: 'programs.monitoring', name: 'Program Monitoring', description: 'Monitor program progress and metrics' },
    ]
  },
  {
    category: 'Documents',
    permissions: [
      { id: 'documents.access', name: 'Documents Access', description: 'Access to document management' },
      { id: 'documents.manage', name: 'Manage Documents', description: 'Upload, edit, and organize documents' },
      { id: 'documents.share', name: 'Share Documents', description: 'Share documents with others' },
      { id: 'documents.approve', name: 'Approve Documents', description: 'Approve document workflows' },
    ]
  },
  {
    category: 'Inventory',
    permissions: [
      { id: 'inventory.access', name: 'Inventory Access', description: 'Access to inventory management' },
      { id: 'inventory.manage', name: 'Manage Inventory', description: 'Add, edit, and track inventory items' },
      { id: 'inventory.reports', name: 'Inventory Reports', description: 'Generate inventory reports' },
      { id: 'inventory.audit', name: 'Inventory Audit', description: 'Perform inventory audits' },
    ]
  }
]

export function RoleForm({ role, onSubmit, onCancel, isEditing = false }: RoleFormProps) {
  const [formData, setFormData] = useState<Role>({
    name: '',
    description: '',
    permissions: [],
    isSystem: false,
    ...role
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const handleCategoryToggle = (categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p))
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !categoryPermissions.includes(p))
        : [...new Set([...prev.permissions, ...categoryPermissions])]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!formData.name.trim()) {
        setError('Role name is required')
        return
      }

      if (!formData.description.trim()) {
        setError('Role description is required')
        return
      }

      if (formData.permissions.length === 0) {
        setError('At least one permission must be selected')
        return
      }

      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting role form:', error)
      setError('An error occurred while saving the role')
    } finally {
      setIsLoading(false)
    }
  }

  const getPermissionById = (id: string) => {
    for (const category of availablePermissions) {
      const permission = category.permissions.find(p => p.id === id)
      if (permission) return permission
    }
    return null
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <CardTitle>
            {isEditing ? 'Edit Role' : 'Create New Role'}
          </CardTitle>
        </div>
        <CardDescription>
          {isEditing 
            ? 'Update role information and permissions'
            : 'Create a new role with specific permissions and access levels'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., HR Manager, Finance Officer"
                required
                disabled={isLoading || formData.isSystem}
              />
              {formData.isSystem && (
                <p className="text-sm text-muted-foreground">
                  System roles cannot be renamed
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the role and its responsibilities"
                required
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Permissions</Label>
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formData.permissions.length} permission(s) selected
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {availablePermissions.map((category) => {
                const categoryPermissionIds = category.permissions.map(p => p.id)
                const selectedInCategory = categoryPermissionIds.filter(id => 
                  formData.permissions.includes(id)
                ).length
                const allCategorySelected = selectedInCategory === categoryPermissionIds.length

                return (
                  <div key={category.category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.category}`}
                          checked={allCategorySelected}
                          onCheckedChange={() => handleCategoryToggle(categoryPermissionIds)}
                          disabled={isLoading}
                        />
                        <Label 
                          htmlFor={`category-${category.category}`}
                          className="text-sm font-semibold"
                        >
                          {category.category}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {selectedInCategory}/{categoryPermissionIds.length}
                        </Badge>
                      </div>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                      {category.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                            disabled={isLoading}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <Label 
                              htmlFor={permission.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {formData.permissions.length > 0 && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">Selected Permissions Summary:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.permissions.map((permissionId) => {
                    const permission = getPermissionById(permissionId)
                    return permission ? (
                      <Badge key={permissionId} variant="outline" className="text-xs">
                        {permission.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || formData.isSystem}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
