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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100/50 p-8">
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
          <div className="flex items-center space-x-4">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Metrics
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">
              Risk Reports
            </h1>
            <p className="text-lg text-orange-700/80 max-w-2xl mx-auto">
              Comprehensive risk analytics and reporting dashboard powered by SAYWHAT intelligence
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100/50 p-8 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-2">
                <Filter className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-lg font-bold text-orange-800">Smart Filters:</span>
            </div>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-semibold text-orange-800"
            >
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-semibold text-orange-800"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4">
                  <BarChart3 className="h-10 w-10 text-blue-600" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">Total Risks</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{metrics.totalRisks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-2xl p-4">
                  <TrendingUp className="h-10 w-10 text-red-600" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">High Risk</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{metrics.highRisks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4">
                  <PieChart className="h-10 w-10 text-yellow-600" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">Open Risks</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">{metrics.openRisks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-4">
                  <Calendar className="h-10 w-10 text-orange-600" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">Overdue</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{metrics.overdueMitigations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Report Generation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100/50 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
              Generate New Report
            </h2>
            <p className="text-orange-700/70">Create comprehensive risk intelligence reports</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: 'summary', label: 'Summary Report', icon: FileText, description: 'High-level risk overview', color: 'blue' },
              { type: 'detailed', label: 'Detailed Report', icon: BarChart3, description: 'Comprehensive risk analysis', color: 'green' },
              { type: 'analytics', label: 'Analytics Report', icon: TrendingUp, description: 'Trends and insights', color: 'purple' },
              { type: 'compliance', label: 'Compliance Report', icon: PieChart, description: 'Regulatory compliance', color: 'red' }
            ].map(({ type, label, icon: Icon, description, color }) => (
              <button
                key={type}
                onClick={() => handleGenerateReport(type)}
                disabled={generating === type}
                className="p-6 border-2 border-orange-200 rounded-2xl hover:bg-orange-50/60 text-left disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 bg-white/60 backdrop-blur-sm"
              >
                <div className="flex items-center mb-4">
                  <div className={`bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-xl p-3`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                  </div>
                  <span className="font-bold text-orange-800 ml-3">{label}</span>
                </div>
                <p className="text-sm text-orange-700 mb-4">{description}</p>
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100/50 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8">
            <h2 className="text-2xl font-bold text-white">Available Reports</h2>
            <p className="text-orange-100 mt-2">Your comprehensive risk intelligence library</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100/50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/60 divide-y divide-orange-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-full p-6 mb-6">
                          <FileText className="h-16 w-16 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-orange-800 mb-2">No reports available</h3>
                        <p className="text-orange-600 mb-6">
                          Generate your first comprehensive risk intelligence report using the options above
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-orange-50/60 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-2 mr-4">
                            {getStatusIcon(report.status)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-orange-900">
                              {report.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-md">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-orange-900">
                        {formatDate(report.generatedDate)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-orange-900">
                        {report.fileSize || 'N/A'}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-md ${
                          report.status === 'ready' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                          report.status === 'generating' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                          'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        {report.status === 'ready' && (
                          <button
                            onClick={() => handleDownloadReport(report)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Download className="h-4 w-4 mr-2" />
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
