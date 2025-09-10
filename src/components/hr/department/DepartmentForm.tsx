'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface Department {
  id?: string
  name: string
  description: string
  manager: string
  employeeCount: number
  budget: number
  status: 'active' | 'inactive'
}

interface DepartmentFormProps {
  department?: Department
  onSubmit: (department: Department) => void
  onCancel: () => void
  isEditing?: boolean
}

export function DepartmentForm({ 
  department, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: DepartmentFormProps) {
  const [formData, setFormData] = useState<Department>({
    name: '',
    description: '',
    manager: '',
    employeeCount: 0,
    budget: 0,
    status: 'active',
    ...department
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof Department, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.manager.trim()) {
      newErrors.manager = 'Manager name is required'
    }

    if (formData.budget < 0) {
      newErrors.budget = 'Budget must be a positive number'
    }

    if (formData.employeeCount < 0) {
      newErrors.employeeCount = 'Employee count must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting department:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mock manager options - replace with actual API call
  const managerOptions = [
    'Sarah Johnson',
    'Mike Chen',
    'Lisa Rodriguez',
    'David Wilson',
    'Emma Thompson',
    'John Davis',
    'Maria Garcia',
    'Robert Brown'
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="h-6 w-6 text-orange-500" />
          <CardTitle>
            {isEditing ? 'Edit Department' : 'Add New Department'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Human Resources, Engineering"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the department's role and responsibilities"
              rows={3}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Manager */}
          <div className="space-y-2">
            <Label htmlFor="manager">Department Manager *</Label>
            <Select
              value={formData.manager}
              onValueChange={(value) => handleInputChange('manager', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                {managerOptions.map((manager) => (
                  <SelectItem key={manager} value={manager}>
                    {manager}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.manager && (
              <p className="text-sm text-red-600">{errors.manager}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Count */}
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Employee Count</Label>
              <Input
                id="employeeCount"
                type="number"
                min="0"
                value={formData.employeeCount}
                onChange={(e) => handleInputChange('employeeCount', parseInt(e.target.value) || 0)}
                placeholder="0"
                disabled={isLoading}
              />
              {errors.employeeCount && (
                <p className="text-sm text-red-600">{errors.employeeCount}</p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Annual Budget ($)</Label>
              <div className="relative">
                <CurrencyDollarIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.budget && (
                <p className="text-sm text-red-600">{errors.budget}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update Department' : 'Create Department')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
