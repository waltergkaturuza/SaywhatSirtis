"use client"

import { useState, useEffect } from "react"
import { 
  ShieldCheckIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Asset, InventoryPermissions } from '@/types/inventory'

interface AuditManagementProps {
  assets: Asset[]
  permissions: InventoryPermissions
}

interface Audit {
  id: string
  name: string
  scheduledDate: string
  auditor: string
  type: 'FULL_INVENTORY' | 'PARTIAL_INVENTORY' | 'COMPLIANCE_AUDIT' | 'FINANCIAL_AUDIT' | 'SECURITY_AUDIT' | 'QUALITY_AUDIT'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  description?: string
  assets?: string[]
  findings?: string[]
  recommendations?: string[]
  documents?: string[]
  completedDate?: string
  progress?: number
  createdAt: string
  updatedAt: string
}

interface AuditFinding {
  id: string
  assetId: string
  type: 'missing' | 'damaged' | 'discrepancy' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendedAction: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  assignedTo?: string
  dueDate?: string
}

// Audit Findings Form Component
interface AuditFindingsFormProps {
  audit: Audit
  assets: Asset[]
  onSubmit: (data: {
    findings: string[]
    recommendations: string[]
    progress: number
    completed: boolean
    documents: File[]
  }) => void
  onCancel: () => void
}

const AuditFindingsForm: React.FC<AuditFindingsFormProps> = ({
  audit,
  assets,
  onSubmit,
  onCancel
}) => {
  const [findings, setFindings] = useState<string[]>(audit.findings || [])
  const [recommendations, setRecommendations] = useState<string[]>(audit.recommendations || [])
  const [progress, setProgress] = useState(audit.progress || 0)
  const [newFinding, setNewFinding] = useState('')
  const [newRecommendation, setNewRecommendation] = useState('')
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      findings,
      recommendations,
      progress,
      completed: progress === 100,
      documents: selectedDocuments
    })
  }

  const addFinding = () => {
    if (newFinding.trim()) {
      setFindings([...findings, newFinding.trim()])
      setNewFinding('')
    }
  }

  const removeFinding = (index: number) => {
    setFindings(findings.filter((_, i) => i !== index))
  }

  const addRecommendation = () => {
    if (newRecommendation.trim()) {
      setRecommendations([...recommendations, newRecommendation.trim()])
      setNewRecommendation('')
    }
  }

  const removeRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedDocuments(Array.from(e.target.files))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Audit Progress */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audit Progress: {progress}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Findings Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audit Findings
        </label>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newFinding}
              onChange={(e) => setNewFinding(e.target.value)}
              placeholder="Add a new finding..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFinding())}
            />
            <Button
              type="button"
              onClick={addFinding}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
            >
              Add
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {findings.map((finding, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="flex-1 text-sm text-gray-900">{finding}</p>
                <button
                  type="button"
                  onClick={() => removeFinding(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recommendations
        </label>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newRecommendation}
              onChange={(e) => setNewRecommendation(e.target.value)}
              placeholder="Add a recommendation..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecommendation())}
            />
            <Button
              type="button"
              onClick={addRecommendation}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl"
            >
              Add
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="flex-1 text-sm text-gray-900">{recommendation}</p>
                <button
                  type="button"
                  onClick={() => removeRecommendation(index)}
                  className="text-green-500 hover:text-green-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supporting Documents & Evidence
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="evidence-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload audit evidence
              </span>
              <span className="text-sm text-gray-500">
                Images, documents, reports (PDF, JPG, PNG, DOC)
              </span>
            </label>
            <input
              id="evidence-upload"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {selectedDocuments.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Selected files:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                {selectedDocuments.map((file, index) => (
                  <li key={index} className="flex items-center justify-center">
                    <span>{file.name}</span>
                    <span className="ml-2 text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
        >
          {progress === 100 ? 'Complete Audit' : 'Save Findings'}
        </button>
      </div>
    </form>
  )
}

export const AuditManagement: React.FC<AuditManagementProps> = ({
  assets,
  permissions
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'schedule' | 'audits' | 'findings' | 'compliance'>('overview')
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showFindingsModal, setShowFindingsModal] = useState(false)
  const [showAuditSelectionModal, setShowAuditSelectionModal] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Employee data for auditor selection
  const [employees, setEmployees] = useState<any[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  // Fetch employees from HR API
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await fetch('/api/hr/employees')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setEmployees(data.data || [])
    } catch (err) {
      console.error('Failed to fetch employees:', err)
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  // Fetch employees when component mounts
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Fetch audits from API
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true)
        setError("")
        
        const response = await fetch('/api/inventory/audits')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setAudits(data.audits || [])
      } catch (err) {
        console.error('Failed to fetch audits:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setAudits([]) // Empty state instead of mock data
      } finally {
        setLoading(false)
      }
    }
    
    fetchAudits()
  }, [])

  const filteredAudits = (audits || []).filter(audit => {
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter
    const matchesType = typeFilter === 'all' || audit.type === typeFilter
    const matchesSearch = !searchQuery || 
      audit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesType && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-white bg-green-500 shadow-lg'
      case 'IN_PROGRESS': return 'text-white bg-blue-500 shadow-lg'
      case 'PENDING': return 'text-white bg-orange-500 shadow-lg'
      case 'CANCELLED': return 'text-white bg-red-500 shadow-lg'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-white bg-red-500 shadow-lg'
      case 'high': return 'text-white bg-red-400 shadow-lg'
      case 'medium': return 'text-white bg-orange-500 shadow-lg'
      case 'low': return 'text-white bg-blue-500 shadow-lg'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleDeleteAudit = async (auditId: string) => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch(`/api/inventory/audits?id=${auditId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Refresh audits data
        const fetchResponse = await fetch('/api/inventory/audits')
        if (fetchResponse.ok) {
          const data = await fetchResponse.json()
          setAudits(data.audits || [])
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete audit')
      }
    } catch (err) {
      console.error('Error deleting audit:', err)
      setError('Failed to delete audit')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Loading audits...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 font-medium">Failed to load audits</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-8 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed top-20 right-20 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse -z-10 animation-delay-2s"></div>
      
      {/* World-Class Header */}
      <div className="relative overflow-hidden bg-orange-600 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Audit & Compliance Management</h1>
              <p className="text-orange-100 text-lg">Track asset audits, compliance checks, and findings with comprehensive reporting</p>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{audits.length}</div>
                <div className="text-orange-100 text-sm">Total Audits</div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {(audits || []).reduce((sum, audit) => sum + (audit.findings || []).length, 0)}
                </div>
                <div className="text-orange-100 text-sm">Open Findings</div>
              </div>
              {permissions.canAudit && (
                <Button
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Schedule Audit
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Premium Navigation */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ShieldCheckIcon },
            { id: 'audits', name: 'Audit History', icon: ClipboardDocumentListIcon },
            { id: 'findings', name: 'Findings', icon: ExclamationTriangleIcon },
            { id: 'compliance', name: 'Compliance', icon: CheckCircleIcon }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/50'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="p-8">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Audits</p>
                    <p className="text-2xl font-bold text-gray-900">{audits.length}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="p-8">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(audits || []).filter(a => a.status === 'IN_PROGRESS').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="p-8">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(audits || []).filter(a => a.status === 'COMPLETED').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="p-8">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-8 w-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Findings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(audits || []).reduce((sum, audit) => sum + (audit.findings || []).length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Audits */}
          <div className="lg:col-span-2">
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="p-8 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Recent Audits</h3>
                <p className="text-gray-600 mt-1">Latest audit activities and status</p>
              </div>
              <div className="p-8">
                {audits.length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 mt-4">No audits found</p>
                    <p className="text-gray-400 text-sm">Schedule your first audit to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(audits || []).slice(0, 5).map((audit) => (
                      <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{audit.name}</h4>
                          <p className="text-sm text-gray-600">
                            {audit.auditor} • {new Date(audit.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                          {audit.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Findings Summary */}
          <div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="p-8 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Active Findings</h3>
                <p className="text-gray-600 mt-1">Open audit findings requiring attention</p>
              </div>
              <div className="p-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 rounded text-xs font-medium text-white bg-red-500 shadow-lg">
                      TOTAL FINDINGS
                    </span>
                    <span className="font-medium">
                      {(audits || []).reduce((sum, audit) => sum + (audit.findings || []).length, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 rounded text-xs font-medium text-white bg-orange-500 shadow-lg">
                      PENDING AUDITS
                    </span>
                    <span className="font-medium">
                      {(audits || []).filter(a => a.status === 'PENDING').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'audits' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-6">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search audits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Types</option>
              <option value="FULL_INVENTORY">Full Inventory</option>
              <option value="PARTIAL_INVENTORY">Partial Inventory</option>
              <option value="COMPLIANCE_AUDIT">Compliance Audit</option>
              <option value="FINANCIAL_AUDIT">Financial Audit</option>
              <option value="SECURITY_AUDIT">Security Audit</option>
              <option value="QUALITY_AUDIT">Quality Audit</option>
            </select>
          </div>

          {/* Audits List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAudits.map((audit) => (
              <div key={audit.id} className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer">
                <div className="p-8 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{audit.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                      {audit.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">
                    {audit.auditor} • {new Date(audit.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-8">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Type:</span>
                      <span className="ml-2 capitalize">{audit.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Assets:</span>
                      <span className="ml-2">{(audit.assets && Array.isArray(audit.assets)) ? audit.assets.length : 0} items</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Findings:</span>
                      <span className="ml-2">{(audit.findings && Array.isArray(audit.findings)) ? audit.findings.length : 0} issues</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAudit(audit)
                        setShowScheduleModal(true)
                      }}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {audit.status === 'IN_PROGRESS' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAudit(audit)
                          setShowFindingsModal(true)
                        }}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        Add Findings
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Are you sure you want to delete the audit "${audit.name}"? This action cannot be undone.`)) {
                          handleDeleteAudit(audit.id)
                        }
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAudits.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 mt-4">No audits match your filters</p>
              <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Findings View */}
      {activeView === 'findings' && (
        <div className="space-y-4">
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Audit Findings</h3>
                  <p className="text-gray-600 mt-1">Track and manage audit findings from completed inspections</p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowAuditSelectionModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Select Audit to Add Findings
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-8">
              {/* Audits Needing Findings */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Audits Ready for Findings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {audits.filter(audit => audit.status === 'IN_PROGRESS').map((audit) => (
                    <div key={audit.id} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{audit.name}</h5>
                          <p className="text-sm text-gray-600">{audit.auditor} • {new Date(audit.scheduledDate).toLocaleDateString()}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAudit(audit)
                            setShowFindingsModal(true)
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          Add Findings
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {audits.filter(audit => audit.status === 'IN_PROGRESS').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ClockIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>No audits in progress ready for findings</p>
                  </div>
                )}
              </div>

              {/* Existing Findings */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Existing Findings</h4>
                {audits.filter(audit => audit.findings && audit.findings.length > 0).length === 0 ? (
                  <div className="text-center py-12">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 mt-4">No findings available</p>
                    <p className="text-gray-400 text-sm">Complete an audit to generate findings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {audits.filter(audit => audit.findings && audit.findings.length > 0).map((audit) => (
                      <div key={audit.id} className="border rounded-lg p-6 bg-white/50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">{audit.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{new Date(audit.scheduledDate).toLocaleDateString()}</span>
                            {audit.status === 'IN_PROGRESS' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAudit(audit)
                                  setShowFindingsModal(true)
                                }}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(audit.findings || []).map((finding, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{finding}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance View */}
      {activeView === 'compliance' && (
        <div className="space-y-4">
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="p-8 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Compliance Status</h3>
              <p className="text-gray-600 mt-1">Monitor compliance levels and regulatory requirements</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Compliance Metrics */}
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-700">
                    {audits.filter(a => a.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-green-600">Completed Audits</div>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <ClockIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-700">
                    {audits.filter(a => a.status === 'IN_PROGRESS').length}
                  </div>
                  <div className="text-sm text-blue-600">In Progress</div>
                </div>
                
                <div className="text-center p-6 bg-orange-50 rounded-xl">
                  <ExclamationTriangleIcon className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-orange-700">
                    {audits.reduce((sum, audit) => sum + (audit.findings?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-orange-600">Total Findings</div>
                </div>
              </div>

              {/* Compliance By Type */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900">Compliance by Audit Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['COMPLIANCE_AUDIT', 'SECURITY_AUDIT', 'QUALITY_AUDIT'].map(type => {
                    const typeAudits = audits.filter(a => a.type === type)
                    const completedAudits = typeAudits.filter(a => a.status === 'COMPLETED')
                    const complianceRate = typeAudits.length > 0 ? 
                      Math.round((completedAudits.length / typeAudits.length) * 100) : 0
                    
                    return (
                      <div key={type} className="p-4 border rounded-lg bg-white/50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className={`text-sm font-medium ${
                            complianceRate >= 80 ? 'text-green-600' :
                            complianceRate >= 60 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {complianceRate}%
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              complianceRate >= 80 ? 'bg-green-500' :
                              complianceRate >= 60 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${complianceRate}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {completedAudits.length} of {typeAudits.length} audits completed
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Audit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowScheduleModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule New Audit</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ScheduleAuditForm
              assets={assets}
              employees={employees}
              loadingEmployees={loadingEmployees}
              onSubmit={async (auditData) => {
                try {
                  const response = await fetch('/api/inventory/audits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(auditData)
                  })

                  if (response.ok) {
                    setShowScheduleModal(false)
                    // Refresh audits data
                    const fetchResponse = await fetch('/api/inventory/audits')
                    if (fetchResponse.ok) {
                      const data = await fetchResponse.json()
                      setAudits(data.audits || [])
                    }
                  } else {
                    const errorData = await response.json()
                    setError(errorData.error || 'Failed to create audit')
                  }
                } catch (err) {
                  setError('Failed to create audit')
                }
              }}
              onCancel={() => setShowScheduleModal(false)}
            />
          </div>
        </div>
      )}

      {/* Audit Findings Modal */}
      {showFindingsModal && selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFindingsModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Add Findings - {selectedAudit.name}
              </h2>
              <button
                onClick={() => setShowFindingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <AuditFindingsForm
              audit={selectedAudit}
              assets={assets}
              onSubmit={async (findingsData) => {
                try {
                  // First, upload documents to document repository
                  let uploadedDocuments: string[] = []
                  
                  if (findingsData.documents.length > 0) {
                    for (const document of findingsData.documents) {
                      const formData = new FormData()
                      formData.append('file', document)
                      formData.append('title', `${selectedAudit.name} - Evidence - ${document.name}`)
                      formData.append('category', 'AUDIT_EVIDENCE')
                      formData.append('classification', 'INTERNAL')
                      formData.append('auditId', selectedAudit.id)
                      
                      const uploadResponse = await fetch('/api/documents/upload', {
                        method: 'POST',
                        body: formData
                      })
                      
                      if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json()
                        uploadedDocuments.push(uploadData.document.id)
                      }
                    }
                  }

                  // Then update the audit with findings and document references
                  const response = await fetch(`/api/inventory/audits?id=${selectedAudit.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...selectedAudit,
                      findings: findingsData.findings,
                      recommendations: findingsData.recommendations,
                      progress: findingsData.progress,
                      documents: uploadedDocuments,
                      status: findingsData.completed ? 'COMPLETED' : 'IN_PROGRESS',
                      completedDate: findingsData.completed ? new Date().toISOString() : null
                    })
                  })

                  if (response.ok) {
                    setShowFindingsModal(false)
                    setSelectedAudit(null)
                    // Refresh audits data
                    const fetchResponse = await fetch('/api/inventory/audits')
                    if (fetchResponse.ok) {
                      const data = await fetchResponse.json()
                      setAudits(data.audits || [])
                    }
                  } else {
                    const errorData = await response.json()
                    setError(errorData.error || 'Failed to update audit findings')
                  }
                } catch (err) {
                  setError('Failed to update audit findings')
                }
              }}
              onCancel={() => setShowFindingsModal(false)}
            />
          </div>
        </div>
      )}

      {/* Audit Selection Modal */}
      {showAuditSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuditSelectionModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Select Audit for Findings</h3>
                <button
                  onClick={() => setShowAuditSelectionModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Choose an audit to add findings and evidence</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {audits.filter(audit => audit.status === 'IN_PROGRESS' || audit.status === 'COMPLETED').map((audit) => (
                  <div key={audit.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{audit.name}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Auditor: {audit.auditor}</span>
                          <span>Date: {new Date(audit.scheduledDate).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            audit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {audit.status}
                          </span>
                        </div>
                        {audit.description && (
                          <p className="text-sm text-gray-500 mt-1">{audit.description}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedAudit(audit)
                          setShowAuditSelectionModal(false)
                          setShowFindingsModal(true)
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white ml-4"
                        size="sm"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        Add Findings
                      </Button>
                    </div>
                  </div>
                ))}
                
                {audits.filter(audit => audit.status === 'IN_PROGRESS' || audit.status === 'COMPLETED').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No audits available for findings</p>
                    <p className="text-sm">Complete an audit to add findings</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Schedule Audit Form Component
interface ScheduleAuditFormProps {
  assets: Asset[]
  employees: any[]
  loadingEmployees: boolean
  onSubmit: (data: any) => void
  onCancel: () => void
}

const ScheduleAuditForm: React.FC<ScheduleAuditFormProps> = ({ assets, employees, loadingEmployees, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'FULL_INVENTORY' as const,
    scheduledDate: '',
    auditor: '',
    description: '',
    assets: [] as string[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audit Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Q4 Full Inventory Audit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audit Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="FULL_INVENTORY">Full Inventory</option>
            <option value="PARTIAL_INVENTORY">Partial Inventory</option>
            <option value="COMPLIANCE_AUDIT">Compliance Audit</option>
            <option value="FINANCIAL_AUDIT">Financial Audit</option>
            <option value="SECURITY_AUDIT">Security Audit</option>
            <option value="QUALITY_AUDIT">Quality Audit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scheduled Date
          </label>
          <input
            type="date"
            required
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auditor
          </label>
          <select
            required
            value={formData.auditor}
            onChange={(e) => setFormData({ ...formData, auditor: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={loadingEmployees}
          >
            <option value="">
              {loadingEmployees ? 'Loading employees...' : 'Select an auditor'}
            </option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.name}>
                {employee.name} ({employee.department}) - {employee.position}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Brief description of the audit scope and objectives..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assets to Include (Optional)
        </label>
        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-xl p-4">
          {assets.length === 0 ? (
            <p className="text-gray-500 text-sm">No assets available</p>
          ) : (
            <div className="space-y-2">
              {assets.slice(0, 20).map((asset) => (
                <label key={asset.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.assets.includes(asset.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, assets: [...formData.assets, asset.id] })
                      } else {
                        setFormData({ ...formData, assets: formData.assets.filter(id => id !== asset.id) })
                      }
                    }}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{asset.name}</span>
                </label>
              ))}
              {assets.length > 20 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing first 20 assets. Leave empty to include all assets.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
        >
          Schedule Audit
        </button>
      </div>
    </form>
  )
}
