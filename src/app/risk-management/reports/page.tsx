'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Download, FileText, BarChart3, PieChart, TrendingUp, Calendar, Filter } from 'lucide-react'
import Link from 'next/link'

interface RiskReport {
  id: string
  title: string
  type: 'summary' | 'detailed' | 'analytics' | 'compliance'
  generatedDate: string
  status: 'ready' | 'generating' | 'error'
  fileSize?: string
  downloadUrl?: string
}

interface RiskMetrics {
  totalRisks: number
  highRisks: number
  mediumRisks: number
  lowRisks: number
  openRisks: number
  mitigatedRisks: number
  overdueMitigations: number
  risksByCategory: { [key: string]: number }
}

export default function RiskReportsPage() {
  const [reports, setReports] = useState<RiskReport[]>([])
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('current_month')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    loadReportsAndMetrics()
  }, [selectedPeriod, selectedType])

  const loadReportsAndMetrics = async () => {
    try {
      setLoading(true)
      
      // Load risk metrics for dashboard
      setMetrics({
        totalRisks: 15,
        highRisks: 3,
        mediumRisks: 8,
        lowRisks: 4,
        openRisks: 9,
        mitigatedRisks: 6,
        overdueMitigations: 2,
        risksByCategory: {
          'CYBERSECURITY': 4,
          'OPERATIONAL': 5,
          'FINANCIAL': 3,
          'COMPLIANCE': 2,
          'STRATEGIC': 1
        }
      })
      
      // Load available reports
      setReports([
        {
          id: '1',
          title: 'Monthly Risk Summary - September 2025',
          type: 'summary',
          generatedDate: '2025-09-11T10:00:00Z',
          status: 'ready',
          fileSize: '2.4 MB',
          downloadUrl: '/api/risk-management/reports/monthly-summary-sept-2025.pdf'
        },
        {
          id: '2',
          title: 'Risk Assessment Analytics Report',
          type: 'analytics',
          generatedDate: '2025-09-10T14:30:00Z',
          status: 'ready',
          fileSize: '5.1 MB',
          downloadUrl: '/api/risk-management/reports/analytics-sept-2025.pdf'
        },
        {
          id: '3',
          title: 'Compliance Risk Detailed Report',
          type: 'compliance',
          generatedDate: '2025-09-09T09:15:00Z',
          status: 'ready',
          fileSize: '3.8 MB',
          downloadUrl: '/api/risk-management/reports/compliance-detailed-sept-2025.pdf'
        }
      ])
      
    } catch (error) {
      console.error('Error loading reports and metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (type: string) => {
    try {
      setGenerating(type)
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Add new report to the list
      const newReport: RiskReport = {
        id: Date.now().toString(),
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        type: type as any,
        generatedDate: new Date().toISOString(),
        status: 'ready',
        fileSize: '1.2 MB',
        downloadUrl: `/api/risk-management/reports/${type}-${Date.now()}.pdf`
      }
      
      setReports(prev => [newReport, ...prev])
      
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(null)
    }
  }

  const handleDownloadReport = (report: RiskReport) => {
    // Simulate file download
    const link = document.createElement('a')
    link.href = report.downloadUrl || '#'
    link.download = `${report.title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToCSV = () => {
    if (!metrics) return
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Risks', metrics.totalRisks],
      ['High Risk Items', metrics.highRisks],
      ['Medium Risk Items', metrics.mediumRisks],
      ['Low Risk Items', metrics.lowRisks],
      ['Open Risks', metrics.openRisks],
      ['Mitigated Risks', metrics.mitigatedRisks],
      ['Overdue Mitigations', metrics.overdueMitigations],
      ...Object.entries(metrics.risksByCategory).map(([category, count]) => [category, count])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `risk-metrics-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <FileText className="h-5 w-5 text-green-600" />
      case 'generating':
        return <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      case 'error':
        return <FileText className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
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
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Metrics
              </button>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Risk Reports</h1>
          <p className="text-gray-600">View detailed risk reports and analytics</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Report Types</option>
              <option value="summary">Summary Reports</option>
              <option value="detailed">Detailed Reports</option>
              <option value="analytics">Analytics Reports</option>
              <option value="compliance">Compliance Reports</option>
            </select>
          </div>
        </div>

        {/* Risk Metrics Overview */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Risks</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.totalRisks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.highRisks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <PieChart className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Risks</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.openRisks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.overdueMitigations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Report Generation */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { type: 'summary', label: 'Summary Report', icon: FileText, description: 'High-level risk overview' },
              { type: 'detailed', label: 'Detailed Report', icon: BarChart3, description: 'Comprehensive risk analysis' },
              { type: 'analytics', label: 'Analytics Report', icon: TrendingUp, description: 'Trends and insights' },
              { type: 'compliance', label: 'Compliance Report', icon: PieChart, description: 'Regulatory compliance' }
            ].map(({ type, label, icon: Icon, description }) => (
              <button
                key={type}
                onClick={() => handleGenerateReport(type)}
                disabled={generating === type}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center mb-2">
                  <Icon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <p className="text-sm text-gray-600">{description}</p>
                {generating === type && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-200 rounded">
                      <div className="h-1 bg-blue-600 rounded animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Generating...</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Reports</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No reports available</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Generate your first report using the options above
                      </p>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(report.status)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {report.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(report.generatedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.fileSize || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === 'ready' ? 'bg-green-100 text-green-800' :
                          report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {report.status === 'ready' && (
                          <button
                            onClick={() => handleDownloadReport(report)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
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
