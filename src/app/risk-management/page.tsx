'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
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
  mitigations: {
    id: string
    status: MitigationStatus
    implementationProgress: number
  }[]
  _count: {
    mitigations: number
    assessments: number
    documents: number
  }
  createdAt: Date | string
  updatedAt: Date | string
}

export default function RiskManagementPage() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [isExporting, setIsExporting] = useState(false)

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

  // Load risks data
  useEffect(() => {
    loadRisks()
  }, [selectedCategory, selectedStatus, selectedDepartment, searchTerm])

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
        risk._count.mitigations
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
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage organizational risks</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/risk-management/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Risk
            </Link>
            <Link
              href="/risk-management/matrix"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Risk Matrix
            </Link>
            <button 
              onClick={handleExportRisks}
              disabled={isExporting || loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Risks</p>
                <p className="text-2xl font-bold text-gray-900">{riskStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">{riskStats.high}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-gray-900">{riskStats.medium}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-gray-900">{riskStats.low}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{riskStats.open}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mitigated</p>
                <p className="text-2xl font-bold text-gray-900">{riskStats.mitigated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search risks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {riskCategories.map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option value="Programs">Programs</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        {/* Risk Register Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Risk Register</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading risks...</span>
                      </div>
                    </td>
                  </tr>
                ) : risks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Shield className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No risks found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm || selectedCategory || selectedStatus || selectedDepartment 
                            ? 'Try adjusting your filters' 
                            : 'Get started by creating your first risk entry.'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  risks.map((risk) => (
                    <tr key={risk.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{risk.riskId}</div>
                        <div className="text-sm text-gray-500">{new Date(risk.dateIdentified).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{risk.description}</div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {risk.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{risk.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(risk.riskScore)}`}>
                          {risk.riskScore}/9
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {risk.probability} × {risk.impact}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
                          {risk.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {risk.owner ? (
                          <>
                            <div className="text-sm text-gray-900">
                              {risk.owner.firstName} {risk.owner.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{risk.owner.email}</div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">Unassigned</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {risk.mitigations.length > 0 ? `${risk.mitigations[0].implementationProgress}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {risk._count.mitigations} mitigation{risk._count.mitigations !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/risk-management/risks/${risk.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Risk"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/risk-management/risks/${risk.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Risk"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => handleViewDocuments(risk.id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Documents"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRisk(risk.id, risk.title)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Risk"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/risk-management/assessment"
            className="block p-6 bg-white rounded-lg shadow border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Risk Assessment</h3>
                <p className="text-sm text-gray-600">Submit new risk assessment</p>
              </div>
            </div>
          </Link>

          <Link
            href="/risk-management/reports"
            className="block p-6 bg-white rounded-lg shadow border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Risk Reports</h3>
                <p className="text-sm text-gray-600">View detailed risk reports</p>
              </div>
            </div>
          </Link>

          <Link
            href="/risk-management/audit-logs"
            className="block p-6 bg-white rounded-lg shadow border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Audit Trail</h3>
                <p className="text-sm text-gray-600">View risk change history</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}