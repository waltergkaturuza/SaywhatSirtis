"use client"

import { useState, useEffect } from "react"
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  EyeIcon,
  PrinterIcon,
  ShareIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UsersIcon
} from "@heroicons/react/24/outline"

interface ReportsAnalyticsProps {
  permissions: Record<string, boolean>
  selectedProject: string | null
  onProjectSelect: (projectId: string | null) => void
}

interface Report {
  id: string
  name: string
  description: string
  type: 'project_summary' | 'financial' | 'milestone' | 'risk' | 'resource' | 'custom'
  category: 'executive' | 'operational' | 'financial' | 'technical'
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on_demand'
  format: 'pdf' | 'excel' | 'dashboard' | 'powerpoint'
  recipients: string[]
  lastGenerated: string
  nextScheduled?: string
  status: 'active' | 'draft' | 'archived'
  metrics: string[]
  filters: Record<string, unknown>
  visualizations: string[]
  dataSource: string[]
  createdBy: string
  createdDate: string
}

interface AnalyticsData {
  projectProgress: {
    completed: number
    inProgress: number
    notStarted: number
    overdue: number
  }
  budgetAnalysis: {
    allocated: number
    spent: number
    remaining: number
    variance: number
  }
  milestoneStatus: {
    onTrack: number
    delayed: number
    completed: number
    upcoming: number
  }
  resourceUtilization: {
    human: number
    equipment: number
    budget: number
    materials: number
  }
  riskProfile: {
    high: number
    medium: number
    low: number
    mitigated: number
  }
}

interface ReportFormData {
  name: string
  description: string
  type: 'project_summary' | 'financial' | 'milestone' | 'risk' | 'resource' | 'custom'
  category: 'executive' | 'operational' | 'financial' | 'technical'
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on_demand'
  format: 'pdf' | 'excel' | 'dashboard' | 'powerpoint'
  recipients: string[]
  metrics: string[]
  visualizations: string[]
}

export function ReportsAnalytics({ permissions, selectedProject, onProjectSelect }: ReportsAnalyticsProps) {
  const [mounted, setMounted] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReports(getMockReports())
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalyticsData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setAnalyticsData(getMockAnalyticsData())
    } catch (error) {
      console.error('Error loading analytics data:', error)
    }
  }

  const getMockReports = (): Report[] => {
    return [
      {
        id: 'rpt-1',
        name: 'Monthly Project Status Report',
        description: 'Comprehensive monthly overview of all project activities, milestones, and performance indicators',
        type: 'project_summary',
        category: 'executive',
        frequency: 'monthly',
        format: 'pdf',
        recipients: ['sarah.johnson@saywhat.org', 'board@saywhat.org'],
        lastGenerated: '2025-07-01',
        nextScheduled: '2025-08-01',
        status: 'active',
        metrics: ['Project Progress', 'Budget Utilization', 'Milestone Achievement', 'Risk Status'],
        filters: { dateRange: 'last_month', projects: 'all' },
        visualizations: ['Progress Charts', 'Budget Graphs', 'Timeline View'],
        dataSource: ['Projects', 'Milestones', 'Budget', 'Risks'],
        createdBy: 'Sarah Johnson',
        createdDate: '2025-01-15'
      },
      {
        id: 'rpt-2',
        name: 'Financial Performance Dashboard',
        description: 'Real-time financial metrics and budget tracking across all projects',
        type: 'financial',
        category: 'financial',
        frequency: 'real_time',
        format: 'dashboard',
        recipients: ['finance@saywhat.org', 'sarah.johnson@saywhat.org'],
        lastGenerated: '2025-07-17',
        status: 'active',
        metrics: ['Budget vs Actual', 'Burn Rate', 'Cost per Beneficiary', 'Donor Compliance'],
        filters: { projects: 'all', currency: 'USD' },
        visualizations: ['Budget Charts', 'Spend Analysis', 'Variance Reports'],
        dataSource: ['Budget', 'Expenses', 'Donor Reports'],
        createdBy: 'Finance Team',
        createdDate: '2025-02-01'
      },
      {
        id: 'rpt-3',
        name: 'Risk Management Summary',
        description: 'Weekly risk assessment and mitigation status report',
        type: 'risk',
        category: 'operational',
        frequency: 'weekly',
        format: 'excel',
        recipients: ['risk.manager@saywhat.org', 'project.managers@saywhat.org'],
        lastGenerated: '2025-07-14',
        nextScheduled: '2025-07-21',
        status: 'active',
        metrics: ['Risk Count by Level', 'Mitigation Progress', 'New Risks Identified'],
        filters: { riskLevel: 'all', status: 'active' },
        visualizations: ['Risk Matrix', 'Trend Analysis', 'Status Charts'],
        dataSource: ['Risk Register', 'Mitigation Plans'],
        createdBy: 'Risk Manager',
        createdDate: '2025-01-20'
      },
      {
        id: 'rpt-4',
        name: 'Resource Utilization Report',
        description: 'Monthly analysis of resource allocation and capacity planning',
        type: 'resource',
        category: 'operational',
        frequency: 'monthly',
        format: 'powerpoint',
        recipients: ['hr@saywhat.org', 'operations@saywhat.org'],
        lastGenerated: '2025-07-01',
        nextScheduled: '2025-08-01',
        status: 'active',
        metrics: ['Resource Availability', 'Utilization Rate', 'Cost per Resource'],
        filters: { resourceType: 'all', period: 'last_month' },
        visualizations: ['Capacity Charts', 'Utilization Graphs', 'Cost Analysis'],
        dataSource: ['Resources', 'Allocations', 'Costs'],
        createdBy: 'Operations Manager',
        createdDate: '2025-02-15'
      },
      {
        id: 'rpt-5',
        name: 'Donor Impact Report',
        description: 'Quarterly report showcasing project impact and outcomes for donors',
        type: 'custom',
        category: 'executive',
        frequency: 'quarterly',
        format: 'pdf',
        recipients: ['donors@saywhat.org', 'communications@saywhat.org'],
        lastGenerated: '2025-04-01',
        nextScheduled: '2025-10-01',
        status: 'active',
        metrics: ['Beneficiaries Reached', 'Outcomes Achieved', 'Impact Indicators'],
        filters: { projects: 'donor_funded', outcomes: 'all' },
        visualizations: ['Impact Maps', 'Before/After Charts', 'Success Stories'],
        dataSource: ['Projects', 'Outcomes', 'Beneficiaries'],
        createdBy: 'Communications Team',
        createdDate: '2025-01-10'
      }
    ]
  }

  const getMockAnalyticsData = (): AnalyticsData => {
    return {
      projectProgress: {
        completed: 3,
        inProgress: 8,
        notStarted: 2,
        overdue: 1
      },
      budgetAnalysis: {
        allocated: 2500000,
        spent: 1750000,
        remaining: 750000,
        variance: -50000
      },
      milestoneStatus: {
        onTrack: 15,
        delayed: 3,
        completed: 12,
        upcoming: 8
      },
      resourceUtilization: {
        human: 85,
        equipment: 70,
        budget: 75,
        materials: 60
      },
      riskProfile: {
        high: 2,
        medium: 8,
        low: 12,
        mitigated: 5
      }
    }
  }

  const createReport = async (reportData: ReportFormData) => {
    setIsLoading(true)
    try {
      const newReport: Report = {
        id: `rpt-${Date.now()}`,
        name: reportData.name,
        description: reportData.description,
        type: reportData.type,
        category: reportData.category,
        frequency: reportData.frequency,
        format: reportData.format,
        recipients: reportData.recipients.filter(r => r.trim()),
        lastGenerated: new Date().toISOString().split('T')[0],
        nextScheduled: reportData.frequency !== 'on_demand' && reportData.frequency !== 'real_time' 
          ? getNextScheduledDate(reportData.frequency) : undefined,
        status: 'draft',
        metrics: reportData.metrics.filter(m => m.trim()),
        filters: {},
        visualizations: reportData.visualizations.filter(v => v.trim()),
        dataSource: getDataSourceByType(reportData.type),
        createdBy: 'Current User',
        createdDate: new Date().toISOString().split('T')[0]
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      setReports(prev => [...prev, newReport])
      setShowReportModal(false)
      resetReportForm()
    } catch (error) {
      console.error('Error creating report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateReport = async (reportId: string, updates: Partial<Report>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, ...updates } : report
      ))
      setEditingReport(null)
      setShowReportModal(false)
      resetReportForm()
    } catch (error) {
      console.error('Error updating report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setReports(prev => prev.filter(report => report.id !== reportId))
    } catch (error) {
      console.error('Error deleting report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async (reportId: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, lastGenerated: new Date().toISOString().split('T')[0] }
          : report
      ))
      alert('Report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getNextScheduledDate = (frequency: string): string => {
    const now = new Date()
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString().split('T')[0]
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()).toISOString().split('T')[0]
      case 'annual':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0]
      default:
        return new Date().toISOString().split('T')[0]
    }
  }

  const getDataSourceByType = (type: string): string[] => {
    switch (type) {
      case 'project_summary': return ['Projects', 'Milestones', 'Budget', 'Resources']
      case 'financial': return ['Budget', 'Expenses', 'Donor Reports']
      case 'milestone': return ['Milestones', 'Tasks', 'Timeline']
      case 'risk': return ['Risk Register', 'Mitigation Plans']
      case 'resource': return ['Resources', 'Allocations', 'Costs']
      case 'custom': return ['All Data Sources']
      default: return ['Projects']
    }
  }

  const resetReportForm = () => {
    setReportForm({
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
  }

  const handleEditReport = (report: Report) => {
    setEditingReport(report)
    setReportForm({
      name: report.name,
      description: report.description,
      type: report.type,
      category: report.category,
      frequency: report.frequency,
      format: report.format,
      recipients: report.recipients.length > 0 ? report.recipients : [''],
      metrics: report.metrics.length > 0 ? report.metrics : [''],
      visualizations: report.visualizations.length > 0 ? report.visualizations : ['']
    })
    setShowReportModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project_summary': return DocumentTextIcon
      case 'financial': return ChartBarIcon
      case 'milestone': return CalendarIcon
      case 'risk': return ExclamationTriangleIcon
      case 'resource': return UsersIcon
      case 'custom': return DocumentChartBarIcon
      default: return DocumentTextIcon
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return DocumentTextIcon
      case 'excel': return TableCellsIcon
      case 'dashboard': return ChartBarIcon
      case 'powerpoint': return PresentationChartLineIcon
      default: return DocumentTextIcon
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory
    const matchesType = filterType === 'all' || report.type === filterType
    return matchesSearch && matchesCategory && matchesType
  })

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-600">Generate insights and manage reporting workflows</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {permissions.canCreate && (
            <button
              onClick={() => {
                setEditingReport(null)
                resetReportForm()
                setShowReportModal(true)
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Report
            </button>
          )}
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
          { key: 'reports', label: 'Reports', icon: DocumentTextIcon },
          { key: 'analytics', label: 'Analytics', icon: ChartPieIcon }
        ].map(mode => (
          <button
            key={mode.key}
            onClick={() => setViewMode(mode.key as 'dashboard' | 'reports' | 'analytics')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === mode.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <mode.icon className="h-4 w-4 mr-2" />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Dashboard View */}
      {viewMode === 'dashboard' && analyticsData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.projectProgress.inProgress}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-green-600">+{analyticsData.projectProgress.completed}</span>
                  <span className="ml-2">completed this month</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Math.round((analyticsData.budgetAnalysis.spent / analyticsData.budgetAnalysis.allocated) * 100)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(analyticsData.budgetAnalysis.spent / analyticsData.budgetAnalysis.allocated) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Milestones On Track</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.milestoneStatus.onTrack}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-red-600">{analyticsData.milestoneStatus.delayed}</span>
                  <span className="ml-2">delayed</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Risks</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.riskProfile.high}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-green-600">{analyticsData.riskProfile.mitigated}</span>
                  <span className="ml-2">mitigated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Progress Chart */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Progress</h3>
              <div className="space-y-4">
                {Object.entries(analyticsData.projectProgress).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            key === 'completed' ? 'bg-green-500' :
                            key === 'inProgress' ? 'bg-blue-500' :
                            key === 'overdue' ? 'bg-red-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${(value / 14) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Utilization */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Utilization</h3>
              <div className="space-y-4">
                {Object.entries(analyticsData.resourceUtilization).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{key}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            value >= 80 ? 'bg-red-500' :
                            value >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">{value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Analysis */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Allocated</span>
                  <span className="text-sm font-medium">${analyticsData.budgetAnalysis.allocated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="text-sm font-medium">${analyticsData.budgetAnalysis.spent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="text-sm font-medium text-green-600">${analyticsData.budgetAnalysis.remaining.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-sm font-medium text-gray-900">Variance</span>
                  <span className={`text-sm font-medium ${analyticsData.budgetAnalysis.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${analyticsData.budgetAnalysis.variance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Profile */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Profile</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.riskProfile).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{key}</span>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        key === 'high' ? 'bg-red-500' :
                        key === 'medium' ? 'bg-yellow-500' :
                        key === 'low' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 w-8">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports View */}
      {viewMode === 'reports' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 max-w-xs"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="executive">Executive</option>
              <option value="operational">Operational</option>
              <option value="financial">Financial</option>
              <option value="technical">Technical</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="project_summary">Project Summary</option>
              <option value="financial">Financial</option>
              <option value="milestone">Milestone</option>
              <option value="risk">Risk</option>
              <option value="resource">Resource</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg border">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type & Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Generated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map(report => {
                      const TypeIcon = getTypeIcon(report.type)
                      const FormatIcon = getFormatIcon(report.format)
                      return (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <TypeIcon className="h-5 w-5 text-gray-500 mt-1" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{report.name}</div>
                                <div className="text-sm text-gray-500 max-w-xs">
                                  {report.description.length > 100 
                                    ? `${report.description.slice(0, 100)}...` 
                                    : report.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-gray-900 capitalize">{report.type.replace('_', ' ')}</span>
                              <span className="text-sm text-gray-500 capitalize">{report.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-900 capitalize">{report.frequency.replace('_', ' ')}</span>
                              <FormatIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(report.lastGenerated).toLocaleDateString()}
                            </div>
                            {report.nextScheduled && (
                              <div className="text-sm text-gray-500">
                                Next: {new Date(report.nextScheduled).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => generateReport(report.id)}
                                disabled={isLoading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Generate Report"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                              {permissions.canEdit && (
                                <button
                                  onClick={() => handleEditReport(report)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Edit"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              )}
                              {permissions.canDelete && (
                                <button
                                  onClick={() => deleteReport(report.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
            <label className="text-sm font-medium text-gray-700">Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Apply Filter
            </button>
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Analysis */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Completion Trends</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Interactive chart would be rendered here</p>
                  <p className="text-sm text-gray-500">Showing completion rates over time</p>
                </div>
              </div>
            </div>

            {/* Budget Variance Analysis */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Variance Analysis</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartPieIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Budget variance visualization</p>
                  <p className="text-sm text-gray-500">Budget vs actual spending analysis</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Key Performance Indicators</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">On-time Delivery Rate</span>
                  <span className="text-lg font-semibold text-green-600">87%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Budget Accuracy</span>
                  <span className="text-lg font-semibold text-blue-600">92%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Resource Efficiency</span>
                  <span className="text-lg font-semibold text-yellow-600">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Risk Mitigation Success</span>
                  <span className="text-lg font-semibold text-purple-600">83%</span>
                </div>
              </div>
            </div>

            {/* Comparative Analysis */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Comparison</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PresentationChartLineIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Comparative project analysis</p>
                  <p className="text-sm text-gray-500">Performance comparison across projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedReport.name}</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Report Details</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Description:</dt>
                    <dd className="text-gray-900">{selectedReport.description}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Type:</dt>
                    <dd className="text-gray-900 capitalize">{selectedReport.type.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Category:</dt>
                    <dd className="text-gray-900 capitalize">{selectedReport.category}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Format:</dt>
                    <dd className="text-gray-900 uppercase">{selectedReport.format}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Frequency:</dt>
                    <dd className="text-gray-900 capitalize">{selectedReport.frequency.replace('_', ' ')}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Schedule & Status</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Status:</dt>
                    <dd className="text-gray-900 capitalize">{selectedReport.status}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Last Generated:</dt>
                    <dd className="text-gray-900">{new Date(selectedReport.lastGenerated).toLocaleDateString()}</dd>
                  </div>
                  {selectedReport.nextScheduled && (
                    <div>
                      <dt className="font-medium text-gray-500">Next Scheduled:</dt>
                      <dd className="text-gray-900">{new Date(selectedReport.nextScheduled).toLocaleDateString()}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium text-gray-500">Created By:</dt>
                    <dd className="text-gray-900">{selectedReport.createdBy}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Created Date:</dt>
                    <dd className="text-gray-900">{new Date(selectedReport.createdDate).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>

              {selectedReport.recipients.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recipients</h4>
                  <div className="space-y-1">
                    {selectedReport.recipients.map((recipient, index) => (
                      <div key={index} className="text-sm text-gray-600">{recipient}</div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.metrics.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Metrics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.metrics.map((metric, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.visualizations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Visualizations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.visualizations.map((viz, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                        {viz}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.dataSource.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">Data Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.dataSource.map((source, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => generateReport(selectedReport.id)}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingReport ? 'Edit Report' : 'Create New Report'}
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              if (editingReport) {
                updateReport(editingReport.id, {
                  name: reportForm.name,
                  description: reportForm.description,
                  type: reportForm.type,
                  category: reportForm.category,
                  frequency: reportForm.frequency,
                  format: reportForm.format,
                  recipients: reportForm.recipients.filter(r => r.trim()),
                  metrics: reportForm.metrics.filter(m => m.trim()),
                  visualizations: reportForm.visualizations.filter(v => v.trim())
                })
              } else {
                createReport(reportForm)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Name *
                </label>
                <input
                  type="text"
                  value={reportForm.name}
                  onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={reportForm.type}
                    onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value as ReportFormData['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="project_summary">Project Summary</option>
                    <option value="financial">Financial</option>
                    <option value="milestone">Milestone</option>
                    <option value="risk">Risk</option>
                    <option value="resource">Resource</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={reportForm.category}
                    onChange={(e) => setReportForm(prev => ({ ...prev, category: e.target.value as ReportFormData['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="executive">Executive</option>
                    <option value="operational">Operational</option>
                    <option value="financial">Financial</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency *
                  </label>
                  <select
                    value={reportForm.frequency}
                    onChange={(e) => setReportForm(prev => ({ ...prev, frequency: e.target.value as ReportFormData['frequency'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="real_time">Real Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="on_demand">On Demand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format *
                  </label>
                  <select
                    value={reportForm.format}
                    onChange={(e) => setReportForm(prev => ({ ...prev, format: e.target.value as ReportFormData['format'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="powerpoint">PowerPoint</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients
                </label>
                {reportForm.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => {
                        const newRecipients = [...reportForm.recipients]
                        newRecipients[index] = e.target.value
                        setReportForm(prev => ({ ...prev, recipients: newRecipients }))
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Email address"
                    />
                    {reportForm.recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newRecipients = reportForm.recipients.filter((_, i) => i !== index)
                          setReportForm(prev => ({ ...prev, recipients: newRecipients }))
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setReportForm(prev => ({ ...prev, recipients: [...prev.recipients, ''] }))}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Recipient
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingReport ? 'Update Report' : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
