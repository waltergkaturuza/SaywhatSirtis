'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Save, X } from 'lucide-react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

// Import Prisma types for consistency
import type { RiskCategory, RiskProbability, RiskImpact, RiskStatus } from '@prisma/client'

interface Risk {
  id: string
  riskId: string
  title: string
  description: string
  category: RiskCategory
  department: string | null
  probability: RiskProbability
  impact: RiskImpact
  riskScore: number
  status: RiskStatus
  dateIdentified: string
  targetResolutionDate?: string | null
  tags: string[]
  assignedToId?: string | null
}

interface User {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
}

export default function EditRiskPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const riskId = params.id as string
  
  // Check user permissions for edit access
  const userPermissions = session?.user?.permissions || []
  const userRoles = session?.user?.roles || []
  const canEditRisks = userPermissions.includes('risks_edit') || 
                      userPermissions.includes('risks.edit') || 
                      userPermissions.includes('admin.access') ||
                      userRoles.some(role => ['hr', 'advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase()))

  // If user doesn't have permissions, show access denied
  if (session && !canEditRisks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have permission to edit risks.</p>
          <div className="mt-6">
            <Link
              href="/risk-management"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
            >
              Back to Risk Management
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  const [risk, setRisk] = useState<Risk | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OPERATIONAL' as RiskCategory,
    department: '',
    probability: 'MEDIUM' as RiskProbability,
    impact: 'MEDIUM' as RiskImpact,
    status: 'OPEN' as RiskStatus,
    targetResolutionDate: '',
    assignedToId: '',
    tags: [] as string[],
    newTag: ''
  })

  const riskCategories = [
    { value: 'OPERATIONAL', label: 'Operational' },
    { value: 'STRATEGIC', label: 'Strategic' },
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'COMPLIANCE', label: 'Compliance' },
    { value: 'REPUTATIONAL', label: 'Reputational' },
    { value: 'ENVIRONMENTAL', label: 'Environmental' },
    { value: 'CYBERSECURITY', label: 'Cybersecurity' },
    { value: 'HR_PERSONNEL', label: 'HR/Personnel' }
  ]

  const riskProbabilities = [
    { value: 'VERY_LOW', label: 'Very Low' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'VERY_HIGH', label: 'Very High' }
  ]

  const riskImpacts = [
    { value: 'VERY_LOW', label: 'Very Low' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'VERY_HIGH', label: 'Very High' }
  ]

  const riskStatuses = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'MITIGATED', label: 'Mitigated' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'ACCEPTED', label: 'Accepted' }
  ]

  useEffect(() => {
    if (riskId) {
      loadRiskAndUsers()
    }
  }, [riskId])

  const loadRiskAndUsers = async () => {
    try {
      setLoading(true)
      
      // Load risk details
      const riskResponse = await fetch(`/api/risk-management/risks/${riskId}`)
      if (riskResponse.ok) {
        const riskData = await riskResponse.json()
        if (riskData.success) {
          const riskInfo = riskData.data.risk
          setRisk(riskInfo)
          setFormData({
            title: riskInfo.title,
            description: riskInfo.description,
            category: riskInfo.category,
            department: riskInfo.department || '',
            probability: riskInfo.probability,
            impact: riskInfo.impact,
            status: riskInfo.status,
            targetResolutionDate: riskInfo.targetResolutionDate ? new Date(riskInfo.targetResolutionDate).toISOString().split('T')[0] : '',
            assignedToId: riskInfo.assignedToId || '',
            tags: riskInfo.tags || [],
            newTag: ''
          })
        }
      }
      
      // Load users for assignment
      const usersResponse = await fetch('/api/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        if (usersData.success) {
          setUsers(usersData.data.users || [])
        }
      }
      
      // Load departments from HR API
      try {
        setLoadingDepartments(true)
        const deptResponse = await fetch('/api/hr/departments/main')
        if (deptResponse.ok) {
          const deptResult = await deptResponse.json()
          if (deptResult.success && deptResult.data) {
            setDepartments(deptResult.data.map((dept: any) => ({
              id: dept.id,
              name: dept.name
            })))
          } else {
            console.error('Failed to fetch departments:', deptResult.message)
            setDepartments([])
          }
        } else {
          console.error('Department API request failed:', deptResponse.statusText)
          setDepartments([])
        }
      } catch (deptError) {
        console.error('Error fetching departments:', deptError)
        setDepartments([])
      } finally {
        setLoadingDepartments(false)
      }
      
    } catch (error) {
      console.error('Error loading risk and users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      setSaving(true)
      
      const response = await fetch(`/api/risk-management/risks/${riskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          department: formData.department.trim() || null,
          probability: formData.probability,
          impact: formData.impact,
          status: formData.status,
          targetResolutionDate: formData.targetResolutionDate || null,
          assignedToId: formData.assignedToId || null,
          tags: formData.tags
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          router.push(`/risk-management/risks/${riskId}`)
        } else {
          alert(`Failed to update risk: ${result.error}`)
        }
      } else {
        alert(`Failed to update risk: ${response.statusText}`)
      }
      
    } catch (error) {
      console.error('Error updating risk:', error)
      alert('Failed to update risk. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!risk) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Risk not found</h2>
            <Link
              href="/risk-management"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Risk Management
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/risk-management/risks/${riskId}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Risk Details
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">Edit Risk</h1>
          <p className="text-sm text-gray-600">Risk ID: {risk.riskId}</p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter risk title"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the risk in detail"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {riskCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {loadingDepartments ? (
                  <option disabled>Loading departments...</option>
                ) : (
                  departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Probability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probability *
              </label>
              <select
                value={formData.probability}
                onChange={(e) => handleInputChange('probability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {riskProbabilities.map(prob => (
                  <option key={prob.value} value={prob.value}>
                    {prob.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Impact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact *
              </label>
              <select
                value={formData.impact}
                onChange={(e) => handleInputChange('impact', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {riskImpacts.map(impact => (
                  <option key={impact.value} value={impact.value}>
                    {impact.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {riskStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                value={formData.assignedToId}
                onChange={(e) => handleInputChange('assignedToId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select assignee</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Resolution Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Resolution Date
              </label>
              <input
                type="date"
                value={formData.targetResolutionDate}
                onChange={(e) => handleInputChange('targetResolutionDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.newTag}
                    onChange={(e) => handleInputChange('newTag', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex items-center justify-end space-x-3">
            <Link
              href={`/risk-management/risks/${riskId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
