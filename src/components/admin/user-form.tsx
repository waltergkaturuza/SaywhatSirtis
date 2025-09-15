'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { 
  Loader2, 
  User, 
  Shield, 
  Camera, 
  Eye, 
  EyeOff,
  UserPlus,
  Save,
  X,
  Check
} from 'lucide-react'

interface User {
  id?: string
  email: string
  username?: string
  firstName: string
  lastName: string
  phone?: string
  profileImage?: string
  department: string
  position: string
  employeeId?: string
  isActive: boolean
  biometricEnabled: boolean
  mfaEnabled: boolean
  roles: string[]
  permissions: string[]
}

interface UserFormProps {
  user?: User
  onSubmit: (user: User) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

// Departments will be fetched dynamically from the HR departments API
const defaultDepartments: string[] = []

const positions = [
  'Director',
  'Manager',
  'Supervisor',
  'Officer',
  'Assistant',
  'Coordinator',
  'Specialist',
  'Analyst',
  'Administrator',
  'Intern'
]

const availableRoles = [
  'SUPER_ADMIN',
  'ADMIN',
  'HR_MANAGER',
  'HR_OFFICER',
  'FINANCE_MANAGER',
  'FINANCE_OFFICER',
  'CALL_CENTRE_MANAGER',
  'CALL_CENTRE_AGENT',
  'PROGRAM_MANAGER',
  'PROGRAM_OFFICER',
  'USER'
]

const availablePermissions = [
  'admin.access',
  'admin.users.manage',
  'admin.roles.manage',
  'admin.system.manage',
  'hr.access',
  'hr.employees.manage',
  'hr.performance.manage',
  'finance.access',
  'finance.budgets.manage',
  'finance.reports.view',
  'calls.access',
  'calls.manage',
  'calls.reports',
  'programs.access',
  'programs.manage',
  'programs.reports',
  'documents.access',
  'documents.manage',
  'inventory.access',
  'inventory.manage'
]

export function UserForm({ user, onSubmit, onCancel, isEditing = false }: UserFormProps) {
  const [formData, setFormData] = useState<User>({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    isActive: true,
    biometricEnabled: false,
    mfaEnabled: false,
    roles: [],
    permissions: [],
    ...user
  })
  
  const [departments, setDepartments] = useState<string[]>(defaultDepartments)
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || '')

  // Fetch departments from Admin API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/admin/departments')
        if (response.ok) {
          const data = await response.json()
          const deptNames = data.map((dept: any) => dept.name)
          setDepartments(deptNames)
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
        setDepartments([])
      }
    }
    
    fetchDepartments()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfileImagePreview(result)
        setFormData(prev => ({
          ...prev,
          profileImage: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validation
      if (!isEditing && password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (!isEditing && password.length < 12) {
        setError('Password must be at least 12 characters long')
        return
      }

      if (!formData.email || !formData.firstName || !formData.lastName) {
        setError('Please fill in all required fields')
        return
      }

      const submitData = {
        ...formData,
        ...((!isEditing && password) && { password })
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Error submitting user form:', error)
      setError('An error occurred while saving the user')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <CardTitle>
            {isEditing ? 'Edit User' : 'Create New User'}
          </CardTitle>
        </div>
        <CardDescription>
          {isEditing 
            ? 'Update user information, roles, and permissions'
            : 'Create a new user account with appropriate roles and permissions'
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

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImagePreview} alt="Profile" />
                    <AvatarFallback className="text-lg">
                      {getInitials(formData.firstName || 'U', formData.lastName || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => document.getElementById('profileImage')?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange('department', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleSelectChange('position', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="isActive">Active User</Label>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              {!isEditing && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required={!isEditing}
                          disabled={isLoading}
                          placeholder="Minimum 12 characters"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required={!isEditing}
                          disabled={isLoading}
                          placeholder="Confirm password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mfaEnabled"
                    checked={formData.mfaEnabled}
                    onCheckedChange={(checked) => handleSwitchChange('mfaEnabled', checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="mfaEnabled">Enable Multi-Factor Authentication</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="biometricEnabled"
                    checked={formData.biometricEnabled}
                    onCheckedChange={(checked) => handleSwitchChange('biometricEnabled', checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="biometricEnabled">Enable Biometric Authentication</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRoles.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={formData.roles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                      disabled={isLoading}
                    />
                    <Label htmlFor={role} className="text-sm font-medium">
                      {role.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
              
              {formData.roles.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Selected Roles:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePermissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={() => handlePermissionToggle(permission)}
                      disabled={isLoading}
                    />
                    <Label htmlFor={permission} className="text-sm">
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
              
              {formData.permissions.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Selected Permissions:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

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
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
