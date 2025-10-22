"use client"

import { useState, useEffect } from "react"
import { 
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface Project {
  id: string
  name: string
  projectGoal?: string
  description: string
  status: string
  progress: number
  startDate: string
  endDate: string
  budget: number
  actualSpent: number
  manager: {
    id: string
    name: string
    email?: string
  }
}

interface ProjectIndicator {
  id: string
  projectId: string
  name: string
  description: string
  target: number
  current: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  status: 'on-track' | 'behind' | 'ahead' | 'completed'
  lastUpdated: string
  trend: 'up' | 'down' | 'stable'
  category: 'output' | 'outcome' | 'impact'
}

interface ProjectIndicatorsProps {
  permissions: any
  onProjectSelect: (projectId: string | null) => void
  selectedProject: string | null
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ProjectIndicators({ permissions, onProjectSelect, selectedProject }: ProjectIndicatorsProps) {
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [indicators, setIndicators] = useState<ProjectIndicator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState<ProjectIndicator | null>(null)
  const [updateValue, setUpdateValue] = useState(0)

  useEffect(() => {
    setMounted(true)
    fetchProjects()
    fetchIndicators()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/programs/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchIndicators = async () => {
    try {
      const response = await fetch('/api/meal/indicators')
      if (response.ok) {
        const data = await response.json()
        setIndicators(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching indicators:', err)
    }
  }

  const handleUpdateIndicator = async () => {
    if (!selectedIndicator) return

    try {
      const response = await fetch(`/api/meal/indicators/${selectedIndicator.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current: updateValue,
          lastUpdated: new Date().toISOString()
        }),
      })

      if (response.ok) {
        // Refresh indicators
        fetchIndicators()
        setShowUpdateModal(false)
        setSelectedIndicator(null)
        setUpdateValue(0)
      }
    } catch (err) {
      console.error('Error updating indicator:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100'
      case 'behind': return 'text-red-600 bg-red-100'
      case 'ahead': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDownIcon className="h-4 w-4 text-red-500" />
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'output': return 'bg-blue-100 text-blue-800'
      case 'outcome': return 'bg-green-100 text-green-800'
      case 'impact': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Chart data preparation
  const chartData = indicators.map(indicator => ({
    name: indicator.name,
    current: indicator.current,
    target: indicator.target,
    progress: getProgressPercentage(indicator.current, indicator.target)
  }))

  const statusData = [
    { name: 'On Track', value: indicators.filter(i => i.status === 'on-track').length },
    { name: 'Behind', value: indicators.filter(i => i.status === 'behind').length },
    { name: 'Ahead', value: indicators.filter(i => i.status === 'ahead').length },
    { name: 'Completed', value: indicators.filter(i => i.status === 'completed').length }
  ]

  const categoryData = [
    { name: 'Output', value: indicators.filter(i => i.category === 'output').length },
    { name: 'Outcome', value: indicators.filter(i => i.category === 'outcome').length },
    { name: 'Impact', value: indicators.filter(i => i.category === 'impact').length }
  ]

  if (!mounted) return null

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Indicators</h2>
            <p className="text-gray-600">Track and update project output indicator progress</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            {indicators.length} indicators across {projects.length} projects
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Indicators</p>
              <p className="text-2xl font-bold text-gray-900">{indicators.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-gray-900">
                {indicators.filter(i => i.status === 'on-track').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Behind</p>
              <p className="text-2xl font-bold text-gray-900">
                {indicators.filter(i => i.status === 'behind').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {indicators.filter(i => i.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicator Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#3B82F6" />
              <Bar dataKey="target" fill="#E5E7EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indicators Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Project Output Indicators</h3>
          <p className="text-sm text-gray-600">Update and track progress for each indicator</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicators.map((indicator) => {
                const project = projects.find(p => p.id === indicator.projectId)
                const progressPercentage = getProgressPercentage(indicator.current, indicator.target)
                
                return (
                  <tr key={indicator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{indicator.name}</div>
                        <div className="text-sm text-gray-500">{indicator.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{project?.name || 'Unknown Project'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(indicator.category)}`}>
                        {indicator.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {indicator.current} / {indicator.target} {indicator.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(indicator.status)}`}>
                        {indicator.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTrendIcon(indicator.trend)}
                        <span className="ml-1 text-sm text-gray-900 capitalize">{indicator.trend}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(indicator.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedIndicator(indicator)
                            setUpdateValue(indicator.current)
                            setShowUpdateModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onProjectSelect(indicator.projectId)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedIndicator && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Indicator Progress</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedIndicator.name}
                </label>
                <div className="text-sm text-gray-500 mb-4">
                  Current: {selectedIndicator.current} / Target: {selectedIndicator.target} {selectedIndicator.unit}
                </div>
                <input
                  type="number"
                  value={updateValue}
                  onChange={(e) => setUpdateValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new value"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateIndicator}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
