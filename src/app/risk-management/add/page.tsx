'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Save, X, Plus, Upload, FileText, Calendar, User, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { HomeBack } from '@/components/layout/home-back'
import { useRouter } from 'next/navigation'
import { canManageRisks } from '@/lib/risk-management/session-risk-access'

interface RiskFormData {
  title: string
  description: string
  category: string
  department: string
  probability: string
  impact: string
  status: string
  dateIdentified: string
  tags: string[]
  ownerId?: string
  mitigationStrategy?: string
  targetDate?: string
  actualCost?: number
  attachments?: File[]
}

interface DepartmentOption {
  id: string
  name: string
  label: string
}

interface RiskOwnerOption {
  userId: string
  name: string
  email: string
}

export default function AddRiskPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // Check user permissions for edit access
  const userPermissions = session?.user?.permissions || []
  const userRoles = session?.user?.roles || []
  const canEditRisks = canManageRisks(userPermissions, userRoles)

  // If user doesn't have permissions, show access denied
  if (session && !canEditRisks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have permission to add new risks.</p>
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
  
  const [loading, setLoading] = useState(false)
  const [riskOwners, setRiskOwners] = useState<RiskOwnerOption[]>([])
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [currentTag, setCurrentTag] = useState('')
  const [formData, setFormData] = useState<RiskFormData>({
    title: '',
    description: '',
    category: 'OPERATIONAL',
    department: '',
    probability: 'MEDIUM',
    impact: 'MEDIUM',
    status: 'OPEN',
    dateIdentified: new Date().toISOString().split('T')[0],
    tags: [],
    mitigationStrategy: '',
    targetDate: '',
    actualCost: undefined,
    attachments: []
  })

  useEffect(() => {
    loadEmployeesAndDepartments()
  }, [])

  const loadEmployeesAndDepartments = async () => {
    setLoadingDepartments(true)
    setLoadingEmployees(true)
    try {
      const [deptRes, empRes] = await Promise.all([
        fetch('/api/hr/departments/hierarchy'),
        fetch('/api/hr/employees')
      ])

      if (deptRes.ok) {
        const result = await deptRes.json()
        const flat = result.success && result.data?.flat ? result.data.flat : []
        setDepartments(
          flat.map((d: { id: string; name: string; displayName?: string }) => ({
            id: d.id,
            name: d.name,
            label: d.displayName || d.name
          }))
        )
      } else {
        console.error('Department API request failed:', deptRes.statusText)
        setDepartments([])
      }

      if (empRes.ok) {
        const result = await empRes.json()
        const rows = result.success && Array.isArray(result.data) ? result.data : []
        const owners: RiskOwnerOption[] = rows
          .filter((e: { user?: { id?: string } }) => e.user?.id)
          .map((e: { user: { id: string }; name: string; email: string }) => ({
            userId: e.user.id,
            name: e.name,
            email: e.email
          }))
        owners.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
        setRiskOwners(owners)
      } else {
        console.error('Employees API request failed:', empRes.statusText)
        setRiskOwners([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setDepartments([])
      setRiskOwners([])
    } finally {
      setLoadingDepartments(false)
      setLoadingEmployees(false)
    }
  }

  const handleInputChange = (field: keyof RiskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || []
    }))
  }

  const calculateRiskScore = () => {
    const level = (value: string) => {
      const normalized = value.toUpperCase()
      if (normalized === 'VERY_LOW' || normalized === 'LOW') return 1
      if (normalized === 'HIGH' || normalized === 'VERY_HIGH') return 3
      return 2
    }
    return level(formData.probability) * level(formData.impact)
  }

  const getRiskLevel = (score: number) => {
    if (score >= 6) return { level: 'High', color: 'text-red-600 bg-red-100' }
    if (score >= 3) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' }
    return { level: 'Low', color: 'text-green-600 bg-green-100' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const riskScore = calculateRiskScore()
      
      const payload = {
        ...formData,
        riskScore,
        dateIdentified: new Date(formData.dateIdentified).toISOString(),
        targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString() : null
      }

      const response = await fetch('/api/risk-management/risks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to create risk')
      }

      const result = await response.json()
      const newRiskId = result.data?.id ?? result.id

      // Handle file uploads if any
      if (formData.attachments && formData.attachments.length > 0 && newRiskId) {
        const uploadPromises = formData.attachments.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('riskId', newRiskId)
          
          return fetch('/api/risk-management/documents/upload', {
            method: 'POST',
            body: formData
          })
        })
        
        await Promise.all(uploadPromises)
      }

      alert('Risk created successfully!')
      router.push('/risk-management')
      
    } catch (error) {
      console.error('Error creating risk:', error)
      alert('Failed to create risk. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const riskScore = calculateRiskScore()
  const riskLevel = getRiskLevel(riskScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <HomeBack backHref="/risk-management" backLabel="Back" />
          <div className="min-w-0 border-l border-gray-200 pl-3">
            <h1 className="truncate text-lg font-semibold leading-tight text-gray-900">Add New Risk</h1>
            <p className="truncate text-xs text-gray-600">Create a comprehensive risk entry and assessment for your organization</p>
          </div>
        </div>

        {/* Risk Assessment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Basic Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Risk Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium text-black"
                  placeholder="Enter a clear and descriptive risk title"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Risk Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium text-black resize-none"
                  placeholder="Provide a detailed description of the risk, its potential causes, and consequences"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Risk Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                >
                  <option value="OPERATIONAL">Operational</option>
                  <option value="STRATEGIC">Strategic</option>
                  <option value="FINANCIAL">Financial</option>
                  <option value="COMPLIANCE">Compliance</option>
                  <option value="REPUTATIONAL">Reputational</option>
                  <option value="ENVIRONMENTAL">Environmental</option>
                  <option value="CYBERSECURITY">Cybersecurity</option>
                  <option value="HR_PERSONNEL">HR / Personnel</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={loadingDepartments}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black disabled:opacity-60"
                >
                  {loadingDepartments ? (
                    <option value="">Loading departments...</option>
                  ) : departments.length === 0 ? (
                    <option value="">No departments available</option>
                  ) : (
                    <>
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.label}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Date Identified *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateIdentified}
                  onChange={(e) => handleInputChange('dateIdentified', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Risk Owner
                </label>
                <select
                  value={formData.ownerId || ''}
                  onChange={(e) => handleInputChange('ownerId', e.target.value || undefined)}
                  disabled={loadingEmployees}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black disabled:opacity-60"
                >
                  <option value="">Select Risk Owner</option>
                  {loadingEmployees ? (
                    <option disabled value="">
                      Loading employees...
                    </option>
                  ) : riskOwners.length === 0 ? (
                    <option disabled value="">
                      No linked users available
                    </option>
                  ) : (
                    riskOwners.map((o) => (
                      <option key={o.userId} value={o.userId}>
                        {o.name} ({o.email})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Risk Assessment
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Probability *
                </label>
                <select
                  required
                  value={formData.probability}
                  onChange={(e) => handleInputChange('probability', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                >
                  <option value="VERY_LOW">Very Low (&lt; 10%)</option>
                  <option value="LOW">Low (10-30%)</option>
                  <option value="MEDIUM">Medium (30-60%)</option>
                  <option value="HIGH">High (60-90%)</option>
                  <option value="VERY_HIGH">Very High (&gt; 90%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Impact *
                </label>
                <select
                  required
                  value={formData.impact}
                  onChange={(e) => handleInputChange('impact', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                >
                  <option value="VERY_LOW">Very Low (Minimal)</option>
                  <option value="LOW">Low (Minor)</option>
                  <option value="MEDIUM">Medium (Moderate)</option>
                  <option value="HIGH">High (Major)</option>
                  <option value="VERY_HIGH">Very High (Severe)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Risk Score
                </label>
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {riskScore}
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${riskLevel.color}`}>
                    {riskLevel.level}
                  </div>
                </div>
              </div>
            </div>
              
            <div className="mt-8">
              <label className="block text-xs font-semibold text-orange-800 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
              >
                <option value="OPEN">Open</option>
                <option value="ESCALATED">Escalated</option>
                <option value="MITIGATED">Mitigated</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          {/* Mitigation Planning */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Mitigation Planning (Optional)
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Mitigation Strategy
                </label>
                <textarea
                  rows={3}
                  value={formData.mitigationStrategy}
                  onChange={(e) => handleInputChange('mitigationStrategy', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium text-black resize-none"
                  placeholder="Describe the planned mitigation approach and actions"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => handleInputChange('targetDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.actualCost || ''}
                  onChange={(e) => handleInputChange('actualCost', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Tags and Attachments */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Additional Information
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-orange-800 mb-1">
                  Tags
                </label>
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium text-black"
                    placeholder="Enter a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg font-semibold"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-2 border-orange-200 font-semibold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-orange-600 hover:text-red-600 transition-colors duration-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload supporting documents
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF, DOC, XLS files up to 10MB each
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
                
                {/* Display uploaded files */}
                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/risk-management"
              className="px-4 py-2 text-sm border-2 border-orange-300 text-orange-700 rounded-lg font-semibold hover:bg-orange-50 hover:text-orange-900 transition-all duration-300 shadow-lg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2 text-sm bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold shadow-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Risk
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
