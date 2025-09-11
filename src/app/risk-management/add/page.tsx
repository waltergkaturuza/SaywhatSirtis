'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, X, Plus, Upload, FileText, Calendar, User, AlertTriangle, CheckCircle } from 'lucide-react'
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
      // Load employees
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
      
      // Load departments
      setDepartments([
        { id: '1', name: 'Information Technology' },
        { id: '2', name: 'Finance' },
        { id: '3', name: 'Human Resources' },
        { id: '4', name: 'Operations' },
        { id: '5', name: 'Marketing' },
        { id: '6', name: 'Legal & Compliance' },
        { id: '7', name: 'Customer Service' },
        { id: '8', name: 'Executive' }
      ])
      
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/risk-management"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Risk Management
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Risk</h1>
          <p className="text-gray-600">Create a new risk entry and assessment</p>
        </div>

        {/* Risk Assessment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a clear and descriptive risk title"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide a detailed description of the risk, its potential causes, and consequences"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Identified *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateIdentified}
                  onChange={(e) => handleInputChange('dateIdentified', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Owner
                </label>
                <select
                  value={formData.ownerId || ''}
                  onChange={(e) => handleInputChange('ownerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Probability *
                </label>
                <select
                  required
                  value={formData.probability}
                  onChange={(e) => handleInputChange('probability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="VERY_LOW">Very Low (&lt; 10%)</option>
                  <option value="LOW">Low (10-30%)</option>
                  <option value="MEDIUM">Medium (30-60%)</option>
                  <option value="HIGH">High (60-90%)</option>
                  <option value="VERY_HIGH">Very High (&gt; 90%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact *
                </label>
                <select
                  required
                  value={formData.impact}
                  onChange={(e) => handleInputChange('impact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="VERY_LOW">Very Low (Minimal)</option>
                  <option value="LOW">Low (Minor)</option>
                  <option value="MEDIUM">Medium (Moderate)</option>
                  <option value="HIGH">High (Major)</option>
                  <option value="VERY_HIGH">Very High (Severe)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Score
                </label>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-gray-900">{riskScore}</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${riskLevel.color}`}>
                    {riskLevel.level}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>

          {/* Mitigation Planning */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mitigation Planning (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mitigation Strategy
                </label>
                <textarea
                  rows={3}
                  value={formData.mitigationStrategy}
                  onChange={(e) => handleInputChange('mitigationStrategy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the planned mitigation approach and actions"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => handleInputChange('targetDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.actualCost || ''}
                  onChange={(e) => handleInputChange('actualCost', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Tags and Attachments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
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
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
