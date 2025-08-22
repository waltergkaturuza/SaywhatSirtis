'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Users, 
  DollarSign,
  Filter,
  Search,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react'

export interface Project {
  id: string
  name: string
  status: 'active' | 'completed' | 'on_hold' | 'planning'
  progress: number
  budget: number
  spent: number
  startDate: string
  endDate: string
  beneficiaries: number
}

interface Report {
  id: string
  name: string
  description: string
  type: 'project_summary' | 'financial' | 'impact' | 'compliance' | 'resource'
  category: 'executive' | 'operational' | 'financial' | 'programmatic' | 'compliance'
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  format: 'pdf' | 'excel' | 'dashboard' | 'presentation'
  recipients: string[]
  lastGenerated: string | null
  nextScheduled: string | null
  status: 'active' | 'inactive' | 'draft'
  metrics: string[]
  visualizations: string[]
  createdAt: Date
  updatedAt: Date
}

interface AnalyticsData {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalBudget: number
  totalSpent: number
  averageProgress: number
  overdueProjects: number
  upcomingMilestones: number
  topPerformingProjects: Project[]
  recentActivities: any[]
  budgetTrends: any[]
  progressTrends: any[]
}

interface ReportFormData {
  name: string
  description: string
  type: string
  category: string
  frequency: string
  format: string
  recipients: string[]
  metrics: string[]
  visualizations: string[]
}

interface ReportsAnalyticsProps {
  permissions: any
  selectedProject: string | null
  onProjectSelect: (projectId: string | null) => void
}

export function ReportsAnalytics({ permissions, selectedProject, onProjectSelect }: ReportsAnalyticsProps) {
  const [mounted, setMounted] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'dashboard' | 'reports' | 'analytics'>('dashboard')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const [reportForm, setReportForm] = useState<ReportFormData>({
    name: '',
    description: '',
    type: 'project_summary',
    category: 'operational',
    frequency: 'monthly',
    format: 'pdf',
    recipients: [''],
    metrics: [''],
    visualizations: ['']
  })

  useEffect(() => {
    setMounted(true)
    loadReports()
    loadAnalyticsData()
  }, [selectedProject])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // For now, show empty state for reports since this is a new deployment
      // In the future, you can implement:
      // const response = await fetch('/api/programs/reports')
      // const result = await response.json()
      // if (result.success) setReports(result.data)
      
      setReports([])
      
    } catch (error) {
      console.error('Error loading reports:', error)
      setError(error instanceof Error ? error.message : 'Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalyticsData = async () => {
    try {
      // Fetch real analytics data from the dashboard API
      const response = await fetch('/api/programs/dashboard')
      const result = await response.json()
      
      if (result.success) {
        const { metrics } = result.data
        setAnalyticsData({
          totalProjects: metrics.totalProjects,
          activeProjects: metrics.activeProjects,
          completedProjects: metrics.completedProjects,
          totalBudget: metrics.totalBudget,
          totalSpent: metrics.totalSpent,
          averageProgress: metrics.averageProgress,
          overdueProjects: metrics.overdueProjects,
          upcomingMilestones: metrics.upcomingMilestones,
          topPerformingProjects: [], // Will need to implement
          recentActivities: [], // Will need to implement
          budgetTrends: [], // Will need to implement
          progressTrends: [] // Will need to implement
        })
      }
    } catch (error) {
      console.error('Error loading analytics data:', error)
    }
  }

  const saveReport = async () => {
    try {
      setIsLoading(true)
      
      // In the future, implement report saving:
      // const response = await fetch('/api/programs/reports', {
      //   method: editingReport ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...reportForm,
      //     id: editingReport?.id
      //   })
      // })
      
      alert('Report saving feature will be implemented in future updates.')
      setShowReportModal(false)
      setEditingReport(null)
      loadReports()
      
    } catch (error) {
      console.error('Error saving report:', error)
      alert('Error saving report')
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async (reportId: string) => {
    try {
      setIsLoading(true)
      alert('Report generation feature will be implemented in future updates.')
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    
    try {
      setIsLoading(true)
      alert('Report deletion feature will be implemented in future updates.')
      loadReports()
    } catch (error) {
      console.error('Error deleting report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return <div>Loading...</div>

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={loadReports}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive reporting and analytics dashboard</p>
        </div>
        <div className="flex space-x-3">
          {['dashboard', 'reports', 'analytics'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard View */}
      {viewMode === 'dashboard' && analyticsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.activeProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analyticsData.totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.averageProgress}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Analytics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Project Status Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active</span>
                    <span className="font-medium">{analyticsData.activeProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span className="font-medium">{analyticsData.completedProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-medium">{analyticsData.totalProjects}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Budget Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Budget</span>
                    <span className="font-medium">${analyticsData.totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent</span>
                    <span className="font-medium">${analyticsData.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilization</span>
                    <span className="font-medium">
                      {((analyticsData.totalSpent / analyticsData.totalBudget) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports View */}
      {viewMode === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Categories</option>
                <option value="executive">Executive</option>
                <option value="operational">Operational</option>
                <option value="financial">Financial</option>
                <option value="programmatic">Programmatic</option>
              </select>
            </div>
            {permissions.canWrite && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </button>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Created Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first report to start generating insights from your project data.
              </p>
              {permissions.canWrite && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-green-600"
                >
                  Create First Report
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'active' ? 'bg-green-100 text-green-800' :
                        report.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium">{report.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Frequency:</span>
                        <span className="font-medium">{report.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Format:</span>
                        <span className="font-medium">{report.format.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => generateReport(report.id)}
                        className="text-orange-600 hover:text-orange-700"
                        title="Generate Report"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-gray-600 hover:text-gray-700"
                        title="View Report"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {permissions.canWrite && (
                        <>
                          <button
                            onClick={() => {
                              setEditingReport(report)
                              setReportForm({
                                name: report.name,
                                description: report.description,
                                type: report.type,
                                category: report.category,
                                frequency: report.frequency,
                                format: report.format,
                                recipients: report.recipients,
                                metrics: report.metrics,
                                visualizations: report.visualizations
                              })
                              setShowReportModal(true)
                            }}
                            className="text-gray-600 hover:text-gray-700"
                            title="Edit Report"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteReport(report.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {report.lastGenerated ? `Generated ${report.lastGenerated}` : 'Never generated'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h4>
            <p className="text-gray-500">
              Detailed charts, trends, and insights will be available in future updates.
            </p>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingReport ? 'Edit Report' : 'Create New Report'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportForm.name}
                  onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={reportForm.type}
                    onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="project_summary">Project Summary</option>
                    <option value="financial">Financial</option>
                    <option value="impact">Impact</option>
                    <option value="compliance">Compliance</option>
                    <option value="resource">Resource</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={reportForm.category}
                    onChange={(e) => setReportForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="executive">Executive</option>
                    <option value="operational">Operational</option>
                    <option value="financial">Financial</option>
                    <option value="programmatic">Programmatic</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={reportForm.frequency}
                    onChange={(e) => setReportForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="real_time">Real Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format
                  </label>
                  <select
                    value={reportForm.format}
                    onChange={(e) => setReportForm(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setEditingReport(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveReport}
                disabled={isLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : editingReport ? 'Update Report' : 'Create Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
