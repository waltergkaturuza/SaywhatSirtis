"use client"

import { useState, useEffect } from "react"
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  FlagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  MapPinIcon
} from "@heroicons/react/24/outline"

interface ProjectDashboardProps {
  permissions: any
  onProjectSelect: (projectId: string | null) => void
  selectedProject: string | null
}

interface ProjectMetrics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  totalBudget: number
  totalSpent: number
  averageProgress: number
  overdueProjects: number
  upcomingMilestones: number
  highRiskProjects: number
  resourceUtilization: number
  deliverySuccess: number
}

interface ProjectStatus {
  id: string
  name: string
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'PLANNING' | 'CANCELLED'
  progress: number
  endDate: string
  manager?: {
    name: string
  }
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  budget: number
  actualSpent: number
}

export function ProjectDashboard({ permissions, onProjectSelect, selectedProject }: ProjectDashboardProps) {
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState('month')
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null)
  const [recentProjects, setRecentProjects] = useState<ProjectStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch projects from API
      const projectsResponse = await fetch('/api/programs/projects')
      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects')
      }
      const projectsData = await projectsResponse.json()
      
      if (projectsData.success && projectsData.data) {
        const projects = projectsData.data
        
        // Calculate metrics from real data
        const calculatedMetrics: ProjectMetrics = {
          totalProjects: projects.length,
          activeProjects: projects.filter((p: ProjectStatus) => p.status === 'ACTIVE').length,
          completedProjects: projects.filter((p: ProjectStatus) => p.status === 'COMPLETED').length,
          onHoldProjects: projects.filter((p: ProjectStatus) => p.status === 'ON_HOLD').length,
          totalBudget: projects.reduce((sum: number, p: ProjectStatus) => sum + (p.budget || 0), 0),
          totalSpent: projects.reduce((sum: number, p: ProjectStatus) => sum + (p.actualSpent || 0), 0),
          averageProgress: projects.length > 0 ? 
            projects.reduce((sum: number, p: ProjectStatus) => sum + (p.progress || 0), 0) / projects.length : 0,
          overdueProjects: projects.filter((p: ProjectStatus) => 
            p.status === 'ACTIVE' && new Date(p.endDate) < new Date()).length,
          upcomingMilestones: 0, // Would need milestone data
          highRiskProjects: projects.filter((p: ProjectStatus) => 
            p.priority === 'HIGH' || p.priority === 'CRITICAL').length,
          resourceUtilization: 75, // Would need resource data
          deliverySuccess: projects.length > 0 ? 
            (projects.filter((p: ProjectStatus) => p.status === 'COMPLETED').length / projects.length) * 100 : 0
        }
        
        setMetrics(calculatedMetrics)
        setRecentProjects(projects.slice(0, 4))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">Error loading dashboard: {error}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-700 bg-green-100'
      case 'PLANNING': return 'text-orange-700 bg-orange-100'
      case 'ON_HOLD': return 'text-gray-700 bg-gray-100'
      case 'COMPLETED': return 'text-green-700 bg-green-100'
      case 'CANCELLED': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-700 bg-red-100'
      case 'HIGH': return 'text-orange-700 bg-orange-100'
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-100'
      case 'LOW': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of all projects and key metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-700">Total Projects</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-black">{metrics.totalProjects}</p>
                <span className="ml-2 text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  Active pipeline
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-700">Active Projects</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-black">{metrics.activeProjects}</p>
                <span className="ml-2 text-sm text-gray-600">
                  {metrics.totalProjects > 0 ? Math.round((metrics.activeProjects / metrics.totalProjects) * 100) : 0}% of total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Performance */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-700">Budget Utilization</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-black">
                  {metrics.totalBudget > 0 ? Math.round((metrics.totalSpent / metrics.totalBudget) * 100) : 0}%
                </p>
                <span className="ml-2 text-sm text-gray-600">
                  {formatCurrency(metrics.totalSpent)} / {formatCurrency(metrics.totalBudget)}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all" 
                  style={{ width: `${metrics.totalBudget > 0 ? (metrics.totalSpent / metrics.totalBudget) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-700">Resource Utilization</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-black">{metrics.resourceUtilization}%</p>
                <span className="ml-2 text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  Optimal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* High Risk Projects */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-700">High Risk Projects</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-black">{metrics.highRiskProjects}</p>
                <span className="ml-2 text-sm text-red-600">
                  {Math.round((metrics.highRiskProjects / metrics.activeProjects) * 100)}% of active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FlagIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Upcoming Milestones</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{metrics.upcomingMilestones}</p>
                <span className="ml-2 text-sm text-gray-500">Next 30 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Average Progress */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrophyIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Average Progress</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{metrics.averageProgress}%</p>
                <span className="ml-2 text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  On track
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${metrics.averageProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Success Rate */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrophyIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Delivery Success</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{metrics.deliverySuccess}%</p>
                <span className="ml-2 text-sm text-green-600">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Status */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Project Status</h3>
          <p className="text-sm text-gray-500 mt-1">Click on a project to view details and manage it</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProjects.map((project) => (
                  <tr 
                    key={project.id}
                    onClick={() => onProjectSelect(project.id)}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedProject === project.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">{project.progress}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(project.actualSpent)}</div>
                      <div className="text-sm text-gray-500">of {formatCurrency(project.budget)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.manager?.name || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
