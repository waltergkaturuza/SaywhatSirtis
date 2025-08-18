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
  onProjectSelect: (projectId: number | null) => void
  selectedProject: number | null
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

interface Project {
  id: number
  name: string
  status: string
  startDate: string
  endDate: string
  budget: number | null
  actualSpent: number | null
  country: string
  province: string | null
  description: string
  createdAt: string
  updatedAt: string
}

export function ProjectDashboard({ permissions, onProjectSelect, selectedProject }: ProjectDashboardProps) {
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState('month')
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchProjectsData()
  }, [])

  const fetchProjectsData = async () => {
    try {
      const response = await fetch('/api/programs/projects')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const projects = data.data as Project[]
          setRecentProjects(projects.slice(0, 6)) // Show first 6 projects
          
          // Calculate metrics from real data
          const totalProjects = projects.length
          const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
          const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
          const onHoldProjects = projects.filter(p => p.status === 'ON_HOLD').length
          const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
          const totalSpent = projects.reduce((sum, p) => sum + (p.actualSpent || 0), 0)
          
          // Calculate overdue projects
          const now = new Date()
          const overdueProjects = projects.filter(p => 
            new Date(p.endDate) < now && p.status !== 'COMPLETED'
          ).length

          setMetrics({
            totalProjects,
            activeProjects,
            completedProjects,
            onHoldProjects,
            totalBudget,
            totalSpent,
            averageProgress: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
            overdueProjects,
            upcomingMilestones: 0, // Would need milestone data
            highRiskProjects: 0, // Would need risk assessment data
            resourceUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
            deliverySuccess: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading || !metrics) {
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
      case 'ACTIVE': return 'text-saywhat-orange bg-orange-100'
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'ON_HOLD': return 'text-yellow-600 bg-yellow-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      case 'PLANNING': return 'text-saywhat-grey bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-saywhat-dark">Programs Dashboard</h1>
          <p className="text-saywhat-grey mt-1">Real-time overview of all SAYWHAT programs and key metrics</p>
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
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-saywhat-orange">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-saywhat-orange" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-saywhat-grey">Total Programs</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-saywhat-dark">{metrics.totalProjects}</p>
                <span className="ml-2 text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  Growing portfolio
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-saywhat-grey">Active Programs</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-saywhat-dark">{metrics.activeProjects}</p>
                <span className="ml-2 text-sm text-saywhat-grey">
                  {metrics.totalProjects > 0 ? Math.round((metrics.activeProjects / metrics.totalProjects) * 100) : 0}% of total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Performance */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-saywhat-red">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-saywhat-red" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-saywhat-grey">Budget Utilization</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-saywhat-dark">
                  {metrics.totalBudget > 0 ? Math.round((metrics.totalSpent / metrics.totalBudget) * 100) : 0}%
                </p>
                <span className="ml-2 text-sm text-saywhat-grey">
                  {formatCurrency(metrics.totalSpent)} / {formatCurrency(metrics.totalBudget)}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${(metrics.totalSpent / metrics.totalBudget) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Resource Utilization</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{metrics.resourceUtilization}%</p>
                <span className="ml-2 text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +5% vs target
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* High Risk Projects */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">High Risk Projects</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{metrics.highRiskProjects}</p>
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
                    className={`hover:bg-saywhat-light-grey cursor-pointer ${
                      selectedProject === project.id ? 'bg-orange-50 border-l-4 border-saywhat-orange' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-saywhat-dark">{project.name}</div>
                          <div className="text-xs text-saywhat-grey mt-1">
                            {project.country}{project.province ? `, ${project.province}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="text-sm text-saywhat-dark">
                            {project.status === 'COMPLETED' ? '100' : 
                             project.status === 'ACTIVE' ? '50' : 
                             project.status === 'ON_HOLD' ? '25' : '0'}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-saywhat-orange h-2 rounded-full" 
                              style={{ 
                                width: `${project.status === 'COMPLETED' ? 100 : 
                                        project.status === 'ACTIVE' ? 50 : 
                                        project.status === 'ON_HOLD' ? 25 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-saywhat-dark">
                        {project.actualSpent ? formatCurrency(project.actualSpent) : '$0'}
                      </div>
                      <div className="text-sm text-saywhat-grey">
                        of {project.budget ? formatCurrency(project.budget) : 'No budget set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-saywhat-dark">
                        <CalendarIcon className="h-4 w-4 mr-1 text-saywhat-grey" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-saywhat-dark">
                      Not assigned
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
