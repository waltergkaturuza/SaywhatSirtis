'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { canManageRisks } from '@/lib/risk-management/session-risk-access'

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
  const { data: session } = useSession()
  const canDelete = canManageRisks(session?.user?.permissions || [], session?.user?.roles || [])
  const [reports, setReports] = useState<RiskReport[]>([])
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    loadReportsAndMetrics()
  }, [selectedPeriod, selectedType])

  const loadReportsAndMetrics = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (selectedPeriod) params.set('period', selectedPeriod)
      if (selectedType && selectedType !== 'all') params.set('reportType', selectedType)

      const response = await fetch(`/api/risk-management/reports?${params.toString()}`)
      const data = await response.json()
      if (!response.ok || !data.success) {
        setMetrics(null)
        setReports([])
        return
      }

      setMetrics(data.data.metrics)
      setReports(data.data.reports || [])
      
    } catch (error) {
      console.error('Error loading reports and metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (type: string) => {
    try {
      setGenerating(type)

      const response = await fetch('/api/risk-management/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        alert(data.error || 'Failed to generate report. Please try again.')
        return
      }

      await loadReportsAndMetrics()
      
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(null)
    }
  }

  const handleDownloadReport = (report: RiskReport) => {
    window.open(`/api/documents/${report.id}/download`, '_blank')
  }

  const handleDeleteReport = async (report: RiskReport) => {
    if (!confirm(`Delete "${report.title}"?`)) return
    const response = await fetch(`/api/risk-management/reports?id=${report.id}`, { method: 'DELETE' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || data.success === false) {
      alert(data.error || 'Failed to delete report')
      return
    }
    await loadReportsAndMetrics()
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="animate-pulse">
            <div className="h-12 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl w-1/3 mb-3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-orange-100/50 p-3">
                  <div className="h-6 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl w-3/4 mb-4"></div>
                  <div className="h-10 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-sm  font-semibold"
            >
              🏠
            </Link>
            <Link
              href="/risk-management"
              className="inline-flex items-center px-4 py-2 text-orange-700 hover:text-orange-900 bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200/50 hover:bg-orange-50/80 transition-all duration-300 shadow-lg hover:shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Risk Management
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-sm "
            >
              <Download className="h-5 w-5 mr-2" />
              Export Metrics
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-3">
          
          <div className="text-center mb-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">
              Risk Reports
            </h1>
            <p className="text-sm text-gray-600">
              Counts and files come from the risk register.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-md px-3 py-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filters</span>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="all">All time</option>
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            {[
              ['Total Risks', metrics.totalRisks],
              ['High Risk', metrics.highRisks],
              ['Open Risks', metrics.openRisks],
              ['Overdue', metrics.overdueMitigations],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-white border border-gray-200 rounded-md px-3 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Report Generation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-orange-100/50 p-3 mb-3">
          <div className="text-center mb-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
              Generate New Report
            </h2>
            <p className="text-orange-700/70">Create comprehensive risk intelligence reports</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { type: 'summary', label: 'Summary Report', description: 'High-level risk overview' },
              { type: 'detailed', label: 'Detailed Report', description: 'Comprehensive risk analysis' },
              { type: 'analytics', label: 'Analytics Report', description: 'Trends and insights' },
              { type: 'compliance', label: 'Compliance Report', description: 'Regulatory compliance' }
            ].map(({ type, label, description }) => (
              <button
                key={type}
                onClick={() => handleGenerateReport(type)}
                disabled={generating === type}
                className="px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 text-left disabled:opacity-50 bg-white"
              >
                <span className="block text-sm font-medium text-gray-900">{label}</span>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                {generating === type && (
                  <div className="mt-4">
                    <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs font-semibold text-orange-600 mt-2">Generating report...</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-orange-100/50 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3">
            <h2 className="text-2xl font-bold text-white">Available Reports</h2>
            <p className="text-orange-100 mt-2">Your comprehensive risk intelligence library</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100/50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/60 divide-y divide-orange-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">
                      No reports yet. Generate one above.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-orange-50/60 transition-all duration-300">
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {report.title}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-md">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-orange-900">
                        {formatDate(report.generatedDate)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-orange-900">
                        {report.fileSize || 'N/A'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-md ${
                          report.status === 'ready' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                          report.status === 'generating' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                          'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {report.status === 'ready' && (
                            <button
                              onClick={() => handleDownloadReport(report)}
                              className="inline-flex items-center px-2 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-xs"
                            >
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Download
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteReport(report)}
                              className="inline-flex items-center px-2 py-1 border border-red-200 text-red-700 rounded-md hover:bg-red-50 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
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
      </div>
    </div>
  )
}
