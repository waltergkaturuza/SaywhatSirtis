'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, FileText, Trash2, Calendar, User, BarChart3, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Risk {
  id: string
  riskId: string
  title: string
  description: string
  category: string
  department: string | null
  probability: string
  impact: string
  riskScore: number
  status: string
  dateIdentified: string
  lastAssessed?: string | null
  tags: string[]
  owner: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  } | null
  createdBy: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  } | null
  mitigations: {
    id: string
    title: string
    description: string
    status: string
    implementationProgress: number
    assignedTo: {
      firstName: string | null
      lastName: string | null
      email: string
    } | null
  }[]
  _count: {
    mitigations: number
    assessments: number
    documents: number
  }
  createdAt: string
  updatedAt: string
}

export default function RiskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const riskId = params.id as string
  
  const [risk, setRisk] = useState<Risk | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (riskId) {
      loadRisk()
    }
  }, [riskId])

  const loadRisk = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/risk-management/risks/${riskId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRisk(data.data.risk)
        } else {
          console.error('API Error:', data.error)
        }
      } else if (response.status === 404) {
        router.push('/risk-management')
      } else {
        console.error('Failed to load risk:', response.statusText)
      }
      
    } catch (error) {
      console.error('Error loading risk:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score <= 5) return 'bg-green-100 text-green-800'
    if (score <= 10) return 'bg-yellow-100 text-yellow-800'
    if (score <= 15) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'MITIGATED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMitigationStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!risk) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Risk not found</h2>
            <p className="text-gray-600 mb-4">The risk you're looking for doesn't exist or has been deleted.</p>
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
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/risk-management/risks/${risk.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Risk
              </Link>
              <Link
                href={`/risk-management/risks/${risk.id}/documents`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Documents ({risk._count.documents})
              </Link>
            </div>
          </div>
        </div>

        {/* Risk Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Risk Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{risk.title}</h1>
                  <p className="text-sm text-gray-600">Risk ID: {risk.riskId}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(risk.status)}`}>
                    {risk.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(risk.riskScore)}`}>
                    Risk Score: {risk.riskScore}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{risk.description}</p>
              </div>

              {risk.tags && risk.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {risk.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risk Mitigations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Risk Mitigations ({risk.mitigations?.length || 0})
              </h2>
              
              {(!risk.mitigations || risk.mitigations.length === 0) ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No mitigations defined for this risk</p>
                  <Link
                    href={`/risk-management/risks/${risk.id}/edit`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
                  >
                    Add Mitigation
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {risk.mitigations?.map((mitigation) => (
                    <div key={mitigation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{mitigation.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMitigationStatusColor(mitigation.status)}`}>
                          {mitigation.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{mitigation.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Progress</p>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${mitigation.implementationProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">{mitigation.implementationProgress}%</p>
                          </div>
                          
                          {mitigation.assignedTo && (
                            <div>
                              <p className="text-sm font-medium text-gray-900">Assigned To</p>
                              <p className="text-sm text-gray-600">
                                {mitigation.assignedTo.firstName} {mitigation.assignedTo.lastName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Category</p>
                  <p className="text-sm text-gray-600">{risk.category.replace('_', ' ')}</p>
                </div>
                
                {risk.department && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Department</p>
                    <p className="text-sm text-gray-600">{risk.department}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-900">Probability</p>
                  <p className="text-sm text-gray-600">{risk.probability.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-900">Impact</p>
                  <p className="text-sm text-gray-600">{risk.impact.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-900">Date Identified</p>
                  <p className="text-sm text-gray-600">{formatDate(risk.dateIdentified)}</p>
                </div>
                
                {risk.lastAssessed && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Assessed</p>
                    <p className="text-sm text-gray-600">{formatDate(risk.lastAssessed)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Ownership */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ownership</h3>
              
              <div className="space-y-4">
                {risk.owner ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Risk Owner</p>
                    <p className="text-sm text-gray-600">
                      {risk.owner.firstName} {risk.owner.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{risk.owner.email}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Risk Owner</p>
                    <p className="text-sm text-gray-500">Unassigned</p>
                  </div>
                )}
                
                {risk.createdBy && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created By</p>
                    <p className="text-sm text-gray-600">
                      {risk.createdBy.firstName} {risk.createdBy.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{risk.createdBy.email}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-600">{formatDate(risk.createdAt)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-600">{formatDate(risk.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mitigations</span>
                  <span className="text-sm font-medium text-gray-900">{risk._count.mitigations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assessments</span>
                  <span className="text-sm font-medium text-gray-900">{risk._count.assessments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documents</span>
                  <span className="text-sm font-medium text-gray-900">{risk._count.documents}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
