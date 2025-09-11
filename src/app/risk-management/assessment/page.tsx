'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, FileText, Calendar, User, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// Import Prisma types for consistency
import type { RiskCategory, RiskProbability, RiskImpact, RiskStatus } from '@prisma/client'

interface RiskAssessment {
  id: string
  riskId: string
  assessorId: string
  assessmentDate: string
  probability: RiskProbability
  impact: RiskImpact
  riskScore: number
  findings: string
  recommendations: string
  nextAssessmentDate?: string | null
  status: string
  assessor: {
    firstName: string | null
    lastName: string | null
    email: string
  }
  risk: {
    id: string
    riskId: string
    title: string
    category: RiskCategory
    status: RiskStatus
  }
}

interface Risk {
  id: string
  riskId: string
  title: string
  category: RiskCategory
  status: RiskStatus
}

export default function RiskAssessmentPage() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    riskId: '',
    probability: 'MEDIUM' as RiskProbability,
    impact: 'MEDIUM' as RiskImpact,
    findings: '',
    recommendations: '',
    nextAssessmentDate: ''
  })

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

  useEffect(() => {
    loadAssessmentsAndRisks()
  }, [])

  const loadAssessmentsAndRisks = async () => {
    try {
      setLoading(true)
      
      // Load risks for the dropdown
      const risksResponse = await fetch('/api/risk-management/risks')
      if (risksResponse.ok) {
        const risksData = await risksResponse.json()
        if (risksData.success) {
          setRisks(risksData.data.risks || [])
        }
      }
      
      // For now, we'll use mock assessments since the API might not be implemented yet
      setAssessments([
        {
          id: '1',
          riskId: 'RISK-2025-001',
          assessorId: 'user1',
          assessmentDate: '2025-09-01',
          probability: 'HIGH',
          impact: 'MEDIUM',
          riskScore: 12,
          findings: 'Security vulnerabilities identified in system access controls.',
          recommendations: 'Implement multi-factor authentication and regular security audits.',
          nextAssessmentDate: '2025-12-01',
          status: 'COMPLETED',
          assessor: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@saywhat.org'
          },
          risk: {
            id: '1',
            riskId: 'RISK-2025-001',
            title: 'Cybersecurity Breach',
            category: 'CYBERSECURITY',
            status: 'OPEN'
          }
        }
      ])
      
    } catch (error) {
      console.error('Error loading assessments and risks:', error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.riskId || !formData.findings || !formData.recommendations) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      // Here you would make an API call to create the assessment
      console.log('Creating assessment:', formData)
      
      // For now, simulate success
      alert('Risk assessment created successfully!')
      setShowCreateForm(false)
      setFormData({
        riskId: '',
        probability: 'MEDIUM',
        impact: 'MEDIUM',
        findings: '',
        recommendations: '',
        nextAssessmentDate: ''
      })
      
      // Reload assessments
      loadAssessmentsAndRisks()
      
    } catch (error) {
      console.error('Error creating assessment:', error)
      alert('Failed to create assessment. Please try again.')
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score <= 5) return 'bg-green-100 text-green-800'
    if (score <= 10) return 'bg-yellow-100 text-yellow-800'
    if (score <= 15) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/risk-management"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Risk Management
            </Link>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Risk Assessment</h1>
          <p className="text-gray-600">Submit and manage risk assessments</p>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">New Risk Assessment</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Risk Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Risk *
                  </label>
                  <select
                    value={formData.riskId}
                    onChange={(e) => handleInputChange('riskId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a risk</option>
                    {risks.map(risk => (
                      <option key={risk.id} value={risk.id}>
                        {risk.riskId} - {risk.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Probability & Impact */}
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                {/* Findings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Findings *
                  </label>
                  <textarea
                    value={formData.findings}
                    onChange={(e) => handleInputChange('findings', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your findings from this risk assessment"
                    required
                  />
                </div>

                {/* Recommendations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendations *
                  </label>
                  <textarea
                    value={formData.recommendations}
                    onChange={(e) => handleInputChange('recommendations', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide recommendations for risk mitigation"
                    required
                  />
                </div>

                {/* Next Assessment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Assessment Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextAssessmentDate}
                    onChange={(e) => handleInputChange('nextAssessmentDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Assessment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assessments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Risk Assessments</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Assessment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No risk assessments yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Create your first assessment to get started
                      </p>
                    </td>
                  </tr>
                ) : (
                  assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assessment.risk.riskId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assessment.risk.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assessment.assessor.firstName} {assessment.assessor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assessment.assessor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(assessment.assessmentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskScoreColor(assessment.riskScore)}`}>
                          {assessment.riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {assessment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assessment.nextAssessmentDate ? formatDate(assessment.nextAssessmentDate) : 'Not scheduled'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
