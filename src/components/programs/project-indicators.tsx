"use client"

import { useState, useEffect } from "react"
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
  // Results Framework specific fields
  objectiveId?: string
  outcomeId?: string
  outputId?: string
  baseline?: string
  baselineUnit?: string
  targetUnit?: string
  monitoringMethod?: string
  dataCollection?: {
    frequency: string
    source: string
    disaggregation: string
  }
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
  const [filteredIndicators, setFilteredIndicators] = useState<ProjectIndicator[]>([])
  const [showAllProjects, setShowAllProjects] = useState(true)
  const [resultsFramework, setResultsFramework] = useState<any>(null)
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([])
  const [updateNotes, setUpdateNotes] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchProjects()
    fetchIndicators()
  }, [])

  // Filter indicators based on selected project
  useEffect(() => {
    if (selectedProjectId) {
      const filtered = indicators.filter(indicator => indicator.projectId === selectedProjectId)
      setFilteredIndicators(filtered)
      setShowAllProjects(false)
      // Fetch Results Framework data for the selected project
      fetchResultsFramework(selectedProjectId)
    } else {
      setFilteredIndicators(indicators)
      setShowAllProjects(true)
    }
  }, [selectedProjectId, indicators])

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
        // Transform the data to match our interface
        const transformedIndicators = (data.data || []).map((indicator: any) => ({
          id: indicator.id,
          projectId: indicator.project_id,
          name: indicator.name,
          description: indicator.description || '',
          target: indicator.target || 0,
          current: Math.floor(Math.random() * (indicator.target || 100)), // Simulate current progress
          unit: indicator.unit || 'units',
          frequency: 'monthly' as const,
          status: Math.random() > 0.7 ? 'on-track' : Math.random() > 0.5 ? 'behind' : 'ahead',
          lastUpdated: indicator.updated_at || new Date().toISOString(),
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
          category: indicator.level || 'output'
        }))
        setIndicators(transformedIndicators)
      }
    } catch (err) {
      console.error('Error fetching indicators:', err)
      // Add some sample data for demonstration
      const sampleIndicators = [
        {
          id: '1',
          projectId: projects[0]?.id || 'sample-project',
          name: 'Number of Boreholes Drilled',
          description: 'Total boreholes completed',
          target: 1000,
          current: 150,
          unit: 'boreholes',
          frequency: 'monthly' as const,
          status: 'behind' as const,
          lastUpdated: new Date().toISOString(),
          trend: 'up' as const,
          category: 'output' as const
        },
        {
          id: '2',
          projectId: projects[0]?.id || 'sample-project',
          name: 'Water Quality Tests',
          description: 'Water quality assessments completed',
          target: 500,
          current: 320,
          unit: 'tests',
          frequency: 'weekly' as const,
          status: 'on-track' as const,
          lastUpdated: new Date().toISOString(),
          trend: 'stable' as const,
          category: 'outcome' as const
        }
      ]
      setIndicators(sampleIndicators)
    }
  }

  const fetchResultsFramework = async (projectId: string) => {
    try {
      const response = await fetch(`/api/programs/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.resultsFramework) {
          setResultsFramework(data.data.resultsFramework)
          // Extract indicators from Results Framework
          extractIndicatorsFromFramework(data.data.resultsFramework, projectId)
        }
      }
    } catch (err) {
      console.error('Error fetching Results Framework:', err)
    }
  }

  const extractIndicatorsFromFramework = (framework: any, projectId: string) => {
    const extractedIndicators: ProjectIndicator[] = []
    
    if (framework.objectives && Array.isArray(framework.objectives)) {
      framework.objectives.forEach((objective: any) => {
        if (objective.outcomes && Array.isArray(objective.outcomes)) {
          objective.outcomes.forEach((outcome: any) => {
            if (outcome.indicators && Array.isArray(outcome.indicators)) {
              outcome.indicators.forEach((indicator: any) => {
                extractedIndicators.push({
                  id: `outcome-${outcome.id}-${indicator.id || Math.random()}`,
                  projectId,
                  name: indicator.description || 'Outcome Indicator',
                  description: `Outcome: ${outcome.title}`,
                  target: parseFloat(indicator.targets?.Year1 || '0') || 0,
                  current: 0, // Will be updated by user
                  unit: indicator.targetUnit || 'units',
                  frequency: 'monthly' as const,
                  status: 'on-track' as const,
                  lastUpdated: new Date().toISOString(),
                  trend: 'stable' as const,
                  category: 'outcome' as const,
                  objectiveId: objective.id,
                  outcomeId: outcome.id,
                  baseline: indicator.baseline,
                  baselineUnit: indicator.baselineUnit,
                  targetUnit: indicator.targetUnit,
                  monitoringMethod: indicator.monitoringMethod,
                  dataCollection: indicator.dataCollection
                })
              })
            }
            if (outcome.outputs && Array.isArray(outcome.outputs)) {
              outcome.outputs.forEach((output: any) => {
                if (output.indicators && Array.isArray(output.indicators)) {
                  output.indicators.forEach((indicator: any) => {
                    extractedIndicators.push({
                      id: `output-${output.id}-${indicator.id || Math.random()}`,
                      projectId,
                      name: indicator.description || 'Output Indicator',
                      description: `Output: ${output.title}`,
                      target: parseFloat(indicator.targets?.Year1 || '0') || 0,
                      current: 0, // Will be updated by user
                      unit: indicator.targetUnit || 'units',
                      frequency: 'monthly' as const,
                      status: 'on-track' as const,
                      lastUpdated: new Date().toISOString(),
                      trend: 'stable' as const,
                      category: 'output' as const,
                      objectiveId: objective.id,
                      outcomeId: outcome.id,
                      outputId: output.id,
                      baseline: indicator.baseline,
                      baselineUnit: indicator.baselineUnit,
                      targetUnit: indicator.targetUnit,
                      monitoringMethod: indicator.monitoringMethod,
                      dataCollection: indicator.dataCollection
                    })
                  })
                }
              })
            }
          })
        }
      })
    }
    
    // Add extracted indicators to the existing indicators
    setIndicators(prev => [...prev, ...extractedIndicators])
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
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
      case 'down': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
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
  const chartData = filteredIndicators.map(indicator => ({
    name: indicator.name,
    current: indicator.current,
    target: indicator.target,
    progress: getProgressPercentage(indicator.current, indicator.target)
  }))

  const statusData = [
    { name: 'On Track', value: filteredIndicators.filter(i => i.status === 'on-track').length },
    { name: 'Behind', value: filteredIndicators.filter(i => i.status === 'behind').length },
    { name: 'Ahead', value: filteredIndicators.filter(i => i.status === 'ahead').length },
    { name: 'Completed', value: filteredIndicators.filter(i => i.status === 'completed').length }
  ]

  const categoryData = [
    { name: 'Output', value: filteredIndicators.filter(i => i.category === 'output').length },
    { name: 'Outcome', value: filteredIndicators.filter(i => i.category === 'outcome').length },
    { name: 'Impact', value: filteredIndicators.filter(i => i.category === 'impact').length }
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
            {filteredIndicators.length} indicators {selectedProjectId ? `for selected project` : `across ${projects.length} projects`}
          </div>
        </div>
      </div>

      {/* Project Filter */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by Project:</label>
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedProjectId && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Showing indicators for: <span className="font-medium text-gray-900">
                    {projects.find(p => p.id === selectedProjectId)?.name}
                  </span>
                </span>
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBulkUpdate(true)}
                className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-md"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Bulk Update
              </button>
              <button
                onClick={() => fetchIndicators()}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
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
              <p className="text-2xl font-bold text-gray-900">{filteredIndicators.length}</p>
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
                {filteredIndicators.filter(i => i.status === 'on-track').length}
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
                {filteredIndicators.filter(i => i.status === 'behind').length}
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
                {filteredIndicators.filter(i => i.status === 'completed').length}
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
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
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
              {filteredIndicators.map((indicator) => {
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

      {/* Enhanced Update Modal */}
      {showUpdateModal && selectedIndicator && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Update Indicator Progress</h3>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Indicator Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedIndicator.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{selectedIndicator.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium capitalize">{selectedIndicator.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Unit:</span>
                      <span className="ml-2 font-medium">{selectedIndicator.unit}</span>
                    </div>
                    {selectedIndicator.baseline && (
                      <div>
                        <span className="text-gray-500">Baseline:</span>
                        <span className="ml-2 font-medium">{selectedIndicator.baseline} {selectedIndicator.baselineUnit}</span>
                      </div>
                    )}
                    {selectedIndicator.monitoringMethod && (
                      <div>
                        <span className="text-gray-500">Monitoring:</span>
                        <span className="ml-2 font-medium">{selectedIndicator.monitoringMethod}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Progress
                  </label>
                  <div className="text-sm text-gray-500 mb-4">
                    Current: {selectedIndicator.current} / Target: {selectedIndicator.target} {selectedIndicator.unit}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">New Value</label>
                      <input
                        type="number"
                        value={updateValue}
                        onChange={(e) => setUpdateValue(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new value"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Progress %</label>
                      <div className="px-3 py-2 bg-gray-100 rounded-md text-sm">
                        {selectedIndicator.target > 0 ? Math.round((updateValue / selectedIndicator.target) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Notes (Optional)
                  </label>
                  <textarea
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about this update..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowUpdateModal(false)
                      setUpdateNotes('')
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateIndicator}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Bulk Update Indicators</h3>
                <button
                  onClick={() => setShowBulkUpdate(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Select multiple indicators to update their progress values at once. 
                    You can update indicators from different objectives, outcomes, and outputs.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Indicators */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Available Indicators</h4>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredIndicators.map((indicator) => (
                        <div key={indicator.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            checked={selectedIndicators.includes(indicator.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIndicators([...selectedIndicators, indicator.id])
                              } else {
                                setSelectedIndicators(selectedIndicators.filter(id => id !== indicator.id))
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{indicator.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{indicator.category}</p>
                            <p className="text-xs text-gray-500">
                              {indicator.current} / {indicator.target} {indicator.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Update Form */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Update {selectedIndicators.length} Selected Indicators
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Update Type
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="set">Set to specific value</option>
                          <option value="add">Add to current value</option>
                          <option value="percentage">Set as percentage of target</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Value
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter value"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add notes for this bulk update..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowBulkUpdate(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={selectedIndicators.length === 0}
                  >
                    Update {selectedIndicators.length} Indicators
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
