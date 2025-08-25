'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface Department {
  id: string
  name: string
  description: string
  manager: string
  employeeCount: number
  budget: number
  status: 'active' | 'inactive'
  createdAt: string
}

interface DepartmentListProps {
  onEdit?: (department: Department) => void
  onDelete?: (departmentId: string) => void
  onAdd?: () => void
}

export function DepartmentList({ onEdit, onDelete, onAdd }: DepartmentListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with actual API call
  const departments: Department[] = [
    {
      id: '1',
      name: 'Human Resources',
      description: 'Manages employee relations, recruitment, and HR policies',
      manager: 'Sarah Johnson',
      employeeCount: 12,
      budget: 500000,
      status: 'active',
      createdAt: '2023-01-15'
    },
    {
      id: '2',
      name: 'Engineering',
      description: 'Software development and technical infrastructure',
      manager: 'Mike Chen',
      employeeCount: 45,
      budget: 2500000,
      status: 'active',
      createdAt: '2023-01-15'
    },
    {
      id: '3',
      name: 'Operations',
      description: 'Day-to-day operations and process management',
      manager: 'Lisa Rodriguez',
      employeeCount: 28,
      budget: 1200000,
      status: 'active',
      createdAt: '2023-01-15'
    },
    {
      id: '4',
      name: 'Communications',
      description: 'Internal and external communications, marketing',
      manager: 'David Wilson',
      employeeCount: 15,
      budget: 800000,
      status: 'active',
      createdAt: '2023-01-15'
    }
  ]

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-600">Manage organizational departments and their information</p>
        </div>
        <Button onClick={onAdd} className="bg-orange-600 hover:bg-orange-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
        <Input
          placeholder="Search departments or managers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <Card key={department.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">{department.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(department.status)}>
                  {department.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{department.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Manager:</span>
                  <span className="font-medium">{department.manager}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Employees:</span>
                  <span className="font-medium">{department.employeeCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-medium">${department.budget.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit && onEdit(department)}
                  className="flex-1"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete && onDelete(department.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first department.'}
          </p>
        </div>
      )}
    </div>
  )
}
