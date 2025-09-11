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

// Risk data types
interface Risk {
  id: string
  riskId: string
  title: string
  description: string
  category: string
  department: string
  probability: 'LOW' | 'MEDIUM' | 'HIGH'
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
  riskScore: number
  status: 'OPEN' | 'MITIGATED' | 'ESCALATED' | 'CLOSED'
  dateIdentified: string
  owner: {
    firstName: string
    lastName: string
    email: string
  }
  mitigations: {
    status: string
    implementationProgress: number
  }[]
  _count: {
    mitigations: number
    assessments: number
    documents: number
  }
}

export default function RiskManagementPage() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')

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
      
      // For now, use mock data until database is connected
      const mockRisks: Risk[] = [
        {
          id: '1',
          riskId: 'RISK-2025-001',
          title: 'Staff Turnover in Programs Department',
          description: 'High turnover rate affecting program continuity and institutional knowledge',
          category: 'HR_PERSONNEL',
          department: 'Programs',
          probability: 'HIGH',
          impact: 'HIGH',
          riskScore: 9,
          status: 'OPEN',
          dateIdentified: '2025-01-15',
          owner: { firstName: 'John', lastName: 'Doe', email: 'john.doe@saywhat.org' },
          mitigations: [{ status: 'IN_PROGRESS', implementationProgress: 45 }],
          _count: { mitigations: 2, assessments: 1, documents: 3 }
        },
        {
          id: '2',
          riskId: 'RISK-2025-002',
          title: 'Donor Funding Shortfall',
          description: 'Potential 30% reduction in donor funding for next fiscal year',
          category: 'FINANCIAL',
          department: 'Finance',
          probability: 'MEDIUM',
          impact: 'HIGH',
          riskScore: 6,
          status: 'OPEN',
          dateIdentified: '2025-02-01',
          owner: { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@saywhat.org' },
          mitigations: [{ status: 'PLANNED', implementationProgress: 10 }],
          _count: { mitigations: 1, assessments: 2, documents: 1 }
        },
        {
          id: '3',
          riskId: 'RISK-2025-003',
          title: 'Data Security Breach',
          description: 'Vulnerable systems could lead to beneficiary data exposure',
          category: 'CYBERSECURITY',
          department: 'IT',
          probability: 'LOW',
          impact: 'HIGH',
          riskScore: 3,
          status: 'MITIGATED',
          dateIdentified: '2025-01-20',
          owner: { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@saywhat.org' },
          mitigations: [{ status: 'COMPLETED', implementationProgress: 100 }],
          _count: { mitigations: 3, assessments: 1, documents: 5 }
        },
        {
          id: '4',
          riskId: 'RISK-2025-004',
          title: 'Program Delivery Delays',
          description: 'Weather conditions affecting field operations and program delivery timelines',
          category: 'OPERATIONAL',
          department: 'Programs',
          probability: 'MEDIUM',
          impact: 'MEDIUM',
          riskScore: 4,
          status: 'OPEN',
          dateIdentified: '2025-02-10',
          owner: { firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@saywhat.org' },
          mitigations: [{ status: 'PLANNED', implementationProgress: 0 }],
          _count: { mitigations: 1, assessments: 0, documents: 2 }
        },
        {
          id: '5',
          riskId: 'RISK-2025-005',
          title: 'Compliance Audit Findings',
          description: 'Non-compliance with new donor reporting requirements',
          category: 'COMPLIANCE',
          department: 'Finance',
          probability: 'HIGH',
          impact: 'MEDIUM',
          riskScore: 6,
          status: 'ESCALATED',
          dateIdentified: '2025-01-05',
          owner: { firstName: 'David', lastName: 'Brown', email: 'david.brown@saywhat.org' },
          mitigations: [{ status: 'IN_PROGRESS', implementationProgress: 75 }],
          _count: { mitigations: 2, assessments: 3, documents: 4 }
        }
      ]
      
      // Apply filters
      let filteredRisks = mockRisks
      if (selectedCategory) {
        filteredRisks = filteredRisks.filter(risk => risk.category === selectedCategory)
      }
      if (selectedStatus) {
        filteredRisks = filteredRisks.filter(risk => risk.status === selectedStatus)
      }
      if (selectedDepartment) {
        filteredRisks = filteredRisks.filter(risk => risk.department === selectedDepartment)
      }
      if (searchTerm) {
        filteredRisks = filteredRisks.filter(risk => 
          risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          risk.riskId.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setRisks(filteredRisks)
    } catch (error) {
      console.error('Error loading risks:', error)
    } finally {
      setLoading(false)
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
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
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
                        <div className="text-sm text-gray-900">{risk.owner.firstName} {risk.owner.lastName}</div>
                        <div className="text-sm text-gray-500">{risk.owner.email}</div>
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
                            className="text-gray-600 hover:text-gray-900"
                            title="Documents"
                          >
                            <FileText className="h-4 w-4" />
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