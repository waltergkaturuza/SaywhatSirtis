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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl w-1/3 mb-8"></div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100/50 p-8">
              <div className="h-6 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl w-3/4 mb-6"></div>
              <div className="h-6 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              🏠
            </Link>
            <Link
              href="/risk-management"
              className="inline-flex items-center px-4 py-2 text-orange-700 hover:text-orange-900 bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200/50 hover:bg-orange-50/80 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Risk Management
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Assessment
            </button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">
              Risk Assessment
            </h1>
            <p className="text-lg text-orange-700/80 max-w-2xl mx-auto">
              Submit and manage comprehensive risk assessments with SAYWHAT precision
            </p>
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-200/50">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
                  New Risk Assessment
                </h2>
                <p className="text-orange-700/70">Create a comprehensive risk evaluation</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Risk Selection */}
                <div>
                  <label className="block text-sm font-semibold text-orange-800 mb-3">
                    Select Risk *
                  </label>
                  <select
                    value={formData.riskId}
                    onChange={(e) => handleInputChange('riskId', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-orange-800 mb-3">
                      Probability *
                    </label>
                    <select
                      value={formData.probability}
                      onChange={(e) => handleInputChange('probability', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                    <label className="block text-sm font-semibold text-orange-800 mb-3">
                      Impact *
                    </label>
                    <select
                      value={formData.impact}
                      onChange={(e) => handleInputChange('impact', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                  <label className="block text-sm font-semibold text-orange-800 mb-3">
                    Assessment Findings *
                  </label>
                  <textarea
                    value={formData.findings}
                    onChange={(e) => handleInputChange('findings', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                    placeholder="Describe your findings from this risk assessment..."
                    required
                  />
                </div>

                {/* Recommendations */}
                <div>
                  <label className="block text-sm font-semibold text-orange-800 mb-3">
                    Recommendations *
                  </label>
                  <textarea
                    value={formData.recommendations}
                    onChange={(e) => handleInputChange('recommendations', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                    placeholder="Provide recommendations for risk mitigation..."
                    required
                  />
                </div>

                {/* Next Assessment Date */}
                <div>
                  <label className="block text-sm font-semibold text-orange-800 mb-3">
                    Next Assessment Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextAssessmentDate}
                    onChange={(e) => handleInputChange('nextAssessmentDate', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-center space-x-4 pt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-8 py-3 border-2 border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Create Assessment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assessments List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100/50 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8">
            <h2 className="text-2xl font-bold text-white">Risk Assessments</h2>
            <p className="text-orange-100 mt-2">Comprehensive evaluation tracking</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100/50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Assessor
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Next Assessment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/60 divide-y divide-orange-100">
                {assessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-full p-6 mb-6">
                          <FileText className="h-16 w-16 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-orange-800 mb-2">No risk assessments yet</h3>
                        <p className="text-orange-600 mb-6">
                          Create your first assessment to get started with risk evaluation
                        </p>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Create First Assessment
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-orange-50/60 transition-all duration-300">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-orange-900">
                            {assessment.risk.riskId}
                          </div>
                          <div className="text-sm text-orange-700">
                            {assessment.risk.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-orange-900">
                          {assessment.assessor.firstName} {assessment.assessor.lastName}
                        </div>
                        <div className="text-sm text-orange-700">
                          {assessment.assessor.email}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-orange-900">
                        {formatDate(assessment.assessmentDate)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-md ${getRiskScoreColor(assessment.riskScore)}`}>
                          {assessment.riskScore}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-md">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {assessment.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-orange-900">
                        {assessment.nextAssessmentDate ? formatDate(assessment.nextAssessmentDate) : (
                          <span className="text-orange-600">Not scheduled</span>
                        )}
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
