'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ModulePage } from "@/components/layout/enhanced-layout"
import Link from 'next/link'
import { 
  BuildingOfficeIcon,
  PlusIcon,
  UserGroupIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Department {
  id: string
  name: string
  description?: string
  employeeCount?: number
  manager?: string
  budget?: number
  createdAt: string
  updatedAt: string
}

export default function DepartmentsPage() {
  const { data: session } = useSession()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hr/department')
      if (!response.ok) {
        throw new Error('Failed to fetch departments')
      }
      const result = await response.json()
      // Handle API response structure
      const data = result.success ? result.data : result
      // Ensure data is an array
      setDepartments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load departments')
      setDepartments([]) // Set empty array on error
      console.error('Error fetching departments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/hr/department', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDepartment),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchDepartments()
        setNewDepartment({ name: '', description: '' })
        setShowAddForm(false)
      } else {
        // Handle different error types
        if (response.status === 401) {
          setError('Authentication required. Please log in to create departments. Visit /auth/signin to authenticate.')
        } else {
          setError(result.error || result.message || 'Failed to create department')
        }
      }
    } catch (err) {
      setError('Failed to create department. Please try again.')
      console.error('Error creating department:', err)
    }
  }

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) {
      return
    }

    try {
      const response = await fetch(`/api/hr/department?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        await fetchDepartments()
      } else {
        // Handle different error types
        if (response.status === 401) {
          setError('Authentication required. Please log in to delete departments. Visit /auth/signin to authenticate.')
        } else {
          setError(result.error || result.message || 'Failed to delete department')
        }
      }
    } catch (err) {
      setError('Failed to delete department. Please try again.')
      console.error('Error deleting department:', err)
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to access HR departments.</p>
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const metadata = {
    title: "Departments",
    description: "Manage organizational departments and structure",
    breadcrumbs: [
      { name: "SIRTIS", href: "/" },
      { name: "HR Management", href: "/hr" },
      { name: "Departments" }
    ]
  }

  const actions = (
    <button
      onClick={() => setShowAddForm(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      Add Department
    </button>
  )

  return (
    <ModulePage metadata={metadata} actions={actions}>
      <div className="space-y-6">

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Department Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Department</h2>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name
              </label>
              <input
                type="text"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Department
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Departments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Departments</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="p-6 text-center">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first department.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Department
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Array.isArray(departments) && departments.map((department) => (
              <div key={department.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {department.name}
                        </h3>
                        {department.description && (
                          <p className="text-gray-600 mt-1">
                            {department.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {department.employeeCount || 0} employees
                      </div>
                      {department.manager && (
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Manager:</span> {department.manager}
                        </div>
                      )}
                      {department.budget && (
                        <div className="flex items-center text-sm text-gray-500">
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          Budget: ${department.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {/* TODO: Implement edit */}}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit department"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete department"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average per Department</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.length > 0 
                  ? Math.round(departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0) / departments.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ModulePage>
  )
}
