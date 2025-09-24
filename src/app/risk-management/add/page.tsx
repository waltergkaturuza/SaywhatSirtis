'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, X, Plus, Upload, FileText, Calendar, User, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

interface Department {
  id: string
  name: string
}

interface Employee {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  department?: string
}

export default function AddRiskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
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
    try {
      // Load employees (keeping mock data for now)
      setEmployees([
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@saywhat.com',
          department: 'IT'
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@saywhat.com',
          department: 'Finance'
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@saywhat.com',
          department: 'Operations'
        }
      ])
      
      // Load departments from HR API
      try {
        setLoadingDepartments(true)
        const response = await fetch('/api/hr/departments/main')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setDepartments(result.data.map((dept: any) => ({
              id: dept.id,
              name: dept.name
            })))
          } else {
            console.error('Failed to fetch departments:', result.message)
            // Fallback to empty departments
            setDepartments([])
          }
        } else {
          console.error('Department API request failed:', response.statusText)
          // Fallback to empty departments
          setDepartments([])
        }
      } catch (deptError) {
        console.error('Error fetching departments:', deptError)
        // Fallback to empty departments
        setDepartments([])
      } finally {
        setLoadingDepartments(false)
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
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
    const probabilityValues = {
      'VERY_LOW': 1,
      'LOW': 2,
      'MEDIUM': 3,
      'HIGH': 4,
      'VERY_HIGH': 5
    }
    
    const impactValues = {
      'VERY_LOW': 1,
      'LOW': 2,
      'MEDIUM': 3,
      'HIGH': 4,
      'VERY_HIGH': 5
    }
    
    const prob = probabilityValues[formData.probability as keyof typeof probabilityValues] || 3
    const imp = impactValues[formData.impact as keyof typeof impactValues] || 3
    
    return prob * imp
  }

  const getRiskLevel = (score: number) => {
    if (score <= 4) return { level: 'Low', color: 'text-green-600 bg-green-100' }
    if (score <= 9) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' }
    if (score <= 16) return { level: 'High', color: 'text-orange-600 bg-orange-100' }
    return { level: 'Critical', color: 'text-red-600 bg-red-100' }
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
      
      // Handle file uploads if any
      if (formData.attachments && formData.attachments.length > 0) {
        const uploadPromises = formData.attachments.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('riskId', result.id)
          
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/risk-management"
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 font-semibold"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Risk Management
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 font-semibold"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Home
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
              Add New Risk
            </h1>
            <p className="text-lg text-gray-600 font-medium">Create a comprehensive risk entry and assessment for your organization</p>
          </div>
        </div>

        {/* Risk Assessment Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Basic Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Risk Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium text-black"
                  placeholder="Enter a clear and descriptive risk title"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Risk Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium text-black resize-none"
                  placeholder="Provide a detailed description of the risk, its potential causes, and consequences"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Risk Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                >
                  <option value="OPERATIONAL">Operational</option>
                  <option value="FINANCIAL">Financial</option>
                  <option value="STRATEGIC">Strategic</option>
                  <option value="COMPLIANCE">Compliance</option>
                  <option value="CYBERSECURITY">Cybersecurity</option>
                  <option value="REPUTATIONAL">Reputational</option>
                  <option value="ENVIRONMENTAL">Environmental</option>
                  <option value="LEGAL">Legal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
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
              
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Date Identified *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateIdentified}
                  onChange={(e) => handleInputChange('dateIdentified', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Risk Owner
                </label>
                <select
                  value={formData.ownerId || ''}
                  onChange={(e) => handleInputChange('ownerId', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                >
                  <option value="">Select Risk Owner</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} ({employee.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Risk Assessment
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Probability *
                </label>
                <select
                  required
                  value={formData.probability}
                  onChange={(e) => handleInputChange('probability', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                >
                  <option value="VERY_LOW">Very Low (&lt; 10%)</option>
                  <option value="LOW">Low (10-30%)</option>
                  <option value="MEDIUM">Medium (30-60%)</option>
                  <option value="HIGH">High (60-90%)</option>
                  <option value="VERY_HIGH">Very High (&gt; 90%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Impact *
                </label>
                <select
                  required
                  value={formData.impact}
                  onChange={(e) => handleInputChange('impact', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                >
                  <option value="VERY_LOW">Very Low (Minimal)</option>
                  <option value="LOW">Low (Minor)</option>
                  <option value="MEDIUM">Medium (Moderate)</option>
                  <option value="HIGH">High (Major)</option>
                  <option value="VERY_HIGH">Very High (Severe)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Risk Score
                </label>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {riskScore}
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${riskLevel.color}`}>
                    {riskLevel.level}
                  </div>
                </div>
              </div>
            </div>
              
            <div className="mt-8">
              <label className="block text-sm font-bold text-orange-800 mb-3">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
              >
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="MITIGATED">Mitigated</option>
                <option value="CLOSED">Closed</option>
                <option value="TRANSFERRED">Transferred</option>
              </select>
            </div>
          </div>

          {/* Mitigation Planning */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Mitigation Planning (Optional)
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Mitigation Strategy
                </label>
                <textarea
                  rows={3}
                  value={formData.mitigationStrategy}
                  onChange={(e) => handleInputChange('mitigationStrategy', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium text-black resize-none"
                  placeholder="Describe the planned mitigation approach and actions"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => handleInputChange('targetDate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.actualCost || ''}
                  onChange={(e) => handleInputChange('actualCost', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Tags and Attachments */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Additional Information
              </h2>
            </div>
            
            <div className="space-y-8">
              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">
                  Tags
                </label>
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium text-black"
                    placeholder="Enter a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg font-semibold"
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
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
              className="px-6 py-3 border-2 border-orange-300 text-orange-700 rounded-xl font-semibold hover:bg-orange-50 hover:text-orange-900 transition-all duration-300 shadow-lg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
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
