'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  User,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react'
import Link from 'next/link'

// Import Prisma types for consistency
import type { RiskCategory, RiskProbability, RiskImpact, RiskStatus, MitigationStatus } from '@prisma/client'

// Risk data types - Aligned with database schema
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
  dateIdentified: Date | string
  lastAssessed?: Date | string | null
  tags: string[]
  owner: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  } | null
  createdBy?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  } | null
  mitigations?: {
    id: string
    status: MitigationStatus
    implementationProgress: number
  }[]
  _count?: {
    mitigations: number
    assessments: number
    documents: number
  }
  createdAt: Date | string
  updatedAt: Date | string
}

export default function RiskManagementPage() {
  const { data: session } = useSession()
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  // Check user permissions for edit access
  const userPermissions = session?.user?.permissions || []
  const userRoles = session?.user?.roles || []
  const canEditRisks = userPermissions.includes('risks_edit') || 
                      userPermissions.includes('risks.edit') || 
                      userPermissions.includes('admin.access') ||
                      userRoles.some(role => ['hr', 'advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase()))

  // Risk categories
  const riskCategories = [
    'OPERATIONAL',
    'STRATEGIC', 
    'FINANCIAL',
    'COMPLIANCE',
    'REPUTATIONAL',
    'ENVIRONMENTAL',
    'CYBERSECURITY',
    'HR_PERSONNEL'
  ]

  // Load risks data and departments
  useEffect(() => {
    loadRisks()
    loadDepartments()
  }, [selectedCategory, selectedStatus, selectedDepartment, searchTerm])

  const loadDepartments = async () => {
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
          setDepartments([])
        }
      } else {
        console.error('Department API request failed:', response.statusText)
        setDepartments([])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  const loadRisks = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedDepartment) params.append('department', selectedDepartment)
      if (searchTerm) params.append('search', searchTerm)
      
      // Fetch risks from API
      const response = await fetch(`/api/risk-management/risks?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load risks: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setRisks(data.data.risks || [])
      } else {
        console.error('API Error:', data.error)
        setRisks([])
      }
    } catch (error) {
      console.error('Error loading risks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Export risks to CSV
  const handleExportRisks = async () => {
    try {
      setIsExporting(true)
      
      // Create CSV headers
      const headers = [
        'Risk ID',
        'Title',
        'Description',
        'Category',
        'Probability',
        'Impact',
        'Risk Score',
        'Status',
        'Date Identified',
        'Owner',
        'Mitigations Count'
      ]
      
      // Create CSV rows
      const rows = risks.map(risk => [
        risk.riskId,
        `"${risk.title}"`,
        `"${risk.description.replace(/"/g, '""')}"`,
        risk.category,
        risk.probability,
        risk.impact,
        risk.riskScore,
        risk.status,
        new Date(risk.dateIdentified).toLocaleDateString(),
        risk.owner ? `"${risk.owner.firstName} ${risk.owner.lastName}"` : 'Unassigned',
        risk._count?.mitigations || 0
      ])
      
      // Combine headers and rows
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `risks-export-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
    } catch (error) {
      console.error('Error exporting risks:', error)
      alert('Failed to export risks. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle document viewing
  const handleViewDocuments = (riskId: string) => {
    // Navigate to documents page for this risk
    window.location.href = `/risk-management/risks/${riskId}/documents`
  }

  // Handle risk deletion
  const handleDeleteRisk = async (riskId: string, riskTitle: string) => {
    if (!confirm(`Are you sure you want to delete the risk "${riskTitle}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/risk-management/risks/${riskId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Refresh the risks list
        loadRisks()
        alert('Risk deleted successfully')
      } else {
        const error = await response.json()
        alert(`Failed to delete risk: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting risk:', error)
      alert('Failed to delete risk. Please try again.')
    }
  }

  // Calculate summary statistics
  const riskStats = {
    total: risks.length,
    high: risks.filter(r => r.riskScore >= 7).length,
    medium: risks.filter(r => r.riskScore >= 4 && r.riskScore < 7).length,
    low: risks.filter(r => r.riskScore < 4).length,
    open: risks.filter(r => r.status === 'OPEN').length,
    mitigated: risks.filter(r => r.status === 'MITIGATED').length
  }

  // Get risk color based on score
  const getRiskColor = (score: number) => {
    if (score >= 7) return 'bg-red-100 text-red-800 border-red-200'
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800'
      case 'MITIGATED': return 'bg-green-100 text-green-800'
      case 'ESCALATED': return 'bg-orange-100 text-orange-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/30">
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
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-8 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent mb-3">
                Risk Management
              </h1>
              <p className="text-base text-gray-600">
                Monitor and manage organizational risks with SAYWHAT intelligence and precision
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {canEditRisks && (
                <Link
                  href="/risk-management/add"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Risk
                </Link>
              )}
              <Link
                href="/risk-management/matrix"
                className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-black rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Risk Matrix
              </Link>
              <button 
                onClick={handleExportRisks}
                disabled={isExporting || loading}
                className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-black rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3">
                <Shield className="h-8 w-8 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-black uppercase tracking-wide">Total Risks</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">{riskStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-200 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-black uppercase tracking-wide">High Risk</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{riskStats.high}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-3">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-black uppercase tracking-wide">Medium Risk</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{riskStats.medium}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-200 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-black uppercase tracking-wide">Low Risk</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{riskStats.low}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-3">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-black uppercase tracking-wide">Open</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{riskStats.open}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-black uppercase tracking-wide">Mitigated</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{riskStats.mitigated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-2">
                <Filter className="h-5 w-5 text-gray-700" />
              </div>
              <span className="text-lg font-bold text-black">Smart Filters:</span>
            </div>
            
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search risks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black placeholder-gray-500"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
            >
              <option value="">All Categories</option>
              {riskCategories.map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="MITIGATED">Mitigated</option>
              <option value="ESCALATED">Escalated</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
            >
              <option value="">All Departments</option>
              {loadingDepartments ? (
                <option disabled>Loading departments...</option>
              ) : (
                departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Risk Register Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-800 to-black p-8">
            <h2 className="text-2xl font-bold text-white">Risk Register</h2>
            <p className="text-gray-300 mt-2">Comprehensive organizational risk tracking</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                    Risk ID
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                    Title & Category
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/80 divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600"></div>
                        <span className="mt-4 text-lg font-semibold text-black">Loading risks...</span>
                      </div>
                    </td>
                  </tr>
                ) : risks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 mb-6">
                          <Shield className="h-16 w-16 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-black mb-2">No risks found</h3>
                        <p className="text-gray-600 mb-6">
                          {searchTerm || selectedCategory || selectedStatus || selectedDepartment 
                            ? 'Try adjusting your filters to see more results' 
                            : 'Get started by creating your first comprehensive risk entry.'
                          }
                        </p>
                        <Link
                          href="/risk-management/add"
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Add First Risk
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  risks.map((risk) => (
                    <tr key={risk.id} className="hover:bg-gray-50 transition-all duration-300">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-bold text-black">{risk.riskId}</div>
                        <div className="text-sm text-gray-600">{new Date(risk.dateIdentified).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-black">{risk.title}</div>
                        <div className="text-sm text-gray-600 max-w-xs truncate mb-2">{risk.description}</div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-sm">
                          {risk.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-black">{risk.department}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border-2 shadow-md ${getRiskColor(risk.riskScore)}`}>
                          {risk.riskScore}/9
                        </span>
                        <div className="text-xs font-semibold text-gray-600 mt-1">
                          {risk.probability} × {risk.impact}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-md ${getStatusColor(risk.status)}`}>
                          {risk.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {risk.owner ? (
                          <>
                            <div className="text-sm font-semibold text-black">
                              {risk.owner.firstName} {risk.owner.lastName}
                            </div>
                            <div className="text-sm text-gray-600">{risk.owner.email}</div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-600">Unassigned</div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-black">
                          {risk.mitigations && risk.mitigations.length > 0 ? `${risk.mitigations[0].implementationProgress}%` : 'N/A'}
                        </div>
                        <div className="text-xs font-semibold text-gray-600">
                          {risk._count?.mitigations || 0} mitigation{(risk._count?.mitigations || 0) !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/risk-management/risks/${risk.id}`}
                            className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
                            title="View Risk"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {canEditRisks && (
                            <Link
                              href={`/risk-management/risks/${risk.id}/edit`}
                              className="p-2 bg-gradient-to-r from-green-100 to-green-200 text-green-600 rounded-xl hover:from-green-200 hover:to-green-300 transition-all duration-300 shadow-md hover:shadow-lg"
                              title="Edit Risk"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                          <button 
                            onClick={() => handleViewDocuments(risk.id)}
                            className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
                            title="View Documents"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {canEditRisks && (
                            <button 
                              onClick={() => handleDeleteRisk(risk.id, risk.title)}
                              className="p-2 bg-gradient-to-r from-red-100 to-red-200 text-red-600 rounded-xl hover:from-red-200 hover:to-red-300 transition-all duration-300 shadow-md hover:shadow-lg"
                              title="Delete Risk"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/risk-management/assessment"
            className="block p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-4">
                <FileText className="h-10 w-10 text-orange-600" />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-black mb-2">Risk Assessment</h3>
                <p className="text-gray-600">Submit comprehensive risk evaluations</p>
              </div>
            </div>
          </Link>

          <Link
            href="/risk-management/reports"
            className="block p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4">
                <BarChart3 className="h-10 w-10 text-green-600" />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-black mb-2">Risk Reports</h3>
                <p className="text-gray-600">Access detailed analytics and insights</p>
              </div>
            </div>
          </Link>

          <Link
            href="/risk-management/audit-logs"
            className="block p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4">
                <Activity className="h-10 w-10 text-gray-700" />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-black mb-2">Audit Trail</h3>
                <p className="text-gray-600">Track comprehensive change history</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}