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
  ArrowPathIcon,
  PlusIcon
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
  // Audit trail fields
  lastUpdatedBy?: string
  lastUpdatedAt?: string
  notes?: string
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
  const [bulkUpdateType, setBulkUpdateType] = useState('set')
  const [bulkUpdateValue, setBulkUpdateValue] = useState('')
  const [selectedIndicatorDetails, setSelectedIndicatorDetails] = useState<ProjectIndicator[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [updateResults, setUpdateResults] = useState<{
    successCount: number
    totalCount: number
    updatedBy: string
    timestamp: string
  } | null>(null)
  const [showIndicatorForm, setShowIndicatorForm] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<string | null>(null)
  const [quickUpdateValue, setQuickUpdateValue] = useState('')
  const [newIndicator, setNewIndicator] = useState({
    name: '',
    description: '',
    target: 0,
    unit: '',
    category: 'output' as const,
    frequency: 'monthly' as const,
    baseline: '',
    baselineUnit: '',
    targetUnit: '',
    monitoringMethod: '',
    dataCollection: {
      frequency: 'monthly',
      source: '',
      disaggregation: 'None'
    }
  })

  useEffect(() => {
    setMounted(true)
    fetchProjects()
    fetchIndicators()
  }, [])

  // Filter indicators based on selected project
  useEffect(() => {
    if (selectedProjectId) {
      // Clear existing indicators and fetch fresh data from Results Framework
      setIndicators([])
      setFilteredIndicators([])
      setShowAllProjects(false)
      // Fetch Results Framework data for the selected project
      fetchResultsFramework(selectedProjectId)
    } else {
      setFilteredIndicators(indicators)
      setShowAllProjects(true)
    }
  }, [selectedProjectId])

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
      console.log('Fetching Results Framework for project:', projectId)
      const response = await fetch(`/api/programs/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Project data received:', data)
        if (data.success && data.data.resultsFramework) {
          console.log('Results Framework found:', data.data.resultsFramework)
          setResultsFramework(data.data.resultsFramework)
          // Extract indicators from Results Framework
          extractIndicatorsFromFramework(data.data.resultsFramework, projectId)
        } else {
          console.log('No Results Framework found for this project')
          // If no Results Framework, show sample indicators for testing
          const sampleIndicators = [
            {
              id: 'sample-1',
              projectId: projectId,
              name: 'Number of Beneficiaries Reached',
              description: 'Total number of people who have benefited from the project',
              target: 1000,
              current: 0,
              unit: 'people',
              frequency: 'monthly' as const,
              status: 'on-track' as const,
              lastUpdated: new Date().toISOString(),
              trend: 'stable' as const,
              category: 'outcome' as const
            },
            {
              id: 'sample-2',
              projectId: projectId,
              name: 'Training Sessions Completed',
              description: 'Number of training sessions delivered to beneficiaries',
              target: 50,
              current: 0,
              unit: 'sessions',
              frequency: 'monthly' as const,
              status: 'on-track' as const,
              lastUpdated: new Date().toISOString(),
              trend: 'stable' as const,
              category: 'output' as const
            }
          ]
          setIndicators(sampleIndicators)
          setFilteredIndicators(sampleIndicators)
        }
      } else {
        console.error('Failed to fetch project data:', response.status)
      }
    } catch (err) {
      console.error('Error fetching Results Framework:', err)
    }
  }

  const extractIndicatorsFromFramework = (framework: any, projectId: string) => {
    console.log('Extracting indicators from framework:', framework)
    const extractedIndicators: ProjectIndicator[] = []
    
    if (framework.objectives && Array.isArray(framework.objectives)) {
      console.log('Found objectives:', framework.objectives.length)
      framework.objectives.forEach((objective: any) => {
        if (objective.outcomes && Array.isArray(objective.outcomes)) {
          objective.outcomes.forEach((outcome: any) => {
            // Extract outcome indicators
            if (outcome.indicators && Array.isArray(outcome.indicators)) {
              outcome.indicators.forEach((indicator: any) => {
                extractedIndicators.push({
                  id: `outcome-${outcome.id}-${indicator.id || Math.random()}`,
                  projectId,
                  name: indicator.description || 'Outcome Indicator',
                  description: `Objective: ${objective.title} → Outcome: ${outcome.title}`,
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
                  dataCollection: indicator.dataCollection,
                  // Audit trail fields
                  lastUpdatedBy: 'System',
                  lastUpdatedAt: new Date().toISOString(),
                  notes: ''
                })
              })
            }
            
            // Extract output indicators
            if (outcome.outputs && Array.isArray(outcome.outputs)) {
              outcome.outputs.forEach((output: any) => {
                if (output.indicators && Array.isArray(output.indicators)) {
                  output.indicators.forEach((indicator: any) => {
                    extractedIndicators.push({
                      id: `output-${output.id}-${indicator.id || Math.random()}`,
                      projectId,
                      name: indicator.description || 'Output Indicator',
                      description: `Objective: ${objective.title} → Outcome: ${outcome.title} → Output: ${output.title}`,
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
                      dataCollection: indicator.dataCollection,
                      // Audit trail fields
                      lastUpdatedBy: 'System',
                      lastUpdatedAt: new Date().toISOString(),
                      notes: ''
                    })
                  })
                }
              })
            }
          })
        }
      })
    }
    
    // Set the extracted indicators as the main indicators list
    console.log('Extracted indicators:', extractedIndicators.length, extractedIndicators)
    setIndicators(extractedIndicators)
    setFilteredIndicators(extractedIndicators)
  }

  const handleCreateIndicator = async () => {
    if (!selectedProjectId || !newIndicator.name) return

    try {
      const response = await fetch('/api/meal/indicators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: selectedProjectId,
          name: newIndicator.name,
          description: newIndicator.description,
          target: newIndicator.target,
          unit: newIndicator.unit,
          level: newIndicator.category,
          baseline: newIndicator.baseline,
          baseline_unit: newIndicator.baselineUnit,
          target_unit: newIndicator.targetUnit,
          monitoring_method: newIndicator.monitoringMethod,
          data_collection: newIndicator.dataCollection
        })
      })

      if (response.ok) {
        // Reset form
        setNewIndicator({
          name: '',
          description: '',
          target: 0,
          unit: '',
          category: 'output' as const,
          frequency: 'monthly' as const,
          baseline: '',
          baselineUnit: '',
          targetUnit: '',
          monitoringMethod: '',
          dataCollection: {
            frequency: 'monthly',
            source: '',
            disaggregation: 'None'
          }
        })
        setShowIndicatorForm(false)
        fetchIndicators()
      }
    } catch (err) {
      console.error('Error creating indicator:', err)
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedIndicators.length === 0) return

    try {
      console.log('Bulk updating indicators:', selectedIndicators, 'with details:', selectedIndicatorDetails)
      
      // Update each selected indicator individually with their specific values
      const updatePromises = selectedIndicatorDetails.map(async (indicator) => {
        // Use the current value from the form (which was updated via onChange)
        const newValue = indicator.current

        console.log(`Updating indicator ${indicator.name} to ${newValue} ${indicator.unit}`)

        // Update the indicator via API
        const response = await fetch(`/api/meal/indicators/${indicator.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            current: newValue,
            notes: updateNotes
          })
        })

        if (!response.ok) {
          console.error(`Failed to update indicator ${indicator.id}:`, response.status)
        }
        
        return response.ok
      })

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises)
      const successCount = results.filter(Boolean).length
      
      console.log(`Successfully updated ${successCount} out of ${selectedIndicators.length} indicators`)
      
      // Set success message and audit trail
      setUpdateResults({
        successCount,
        totalCount: selectedIndicators.length,
        updatedBy: 'Current User', // This will be updated by the backend with actual user info
        timestamp: new Date().toLocaleString()
      })
      setShowSuccessMessage(true)
      
      // Reset form and refresh data
      setShowBulkUpdate(false)
      setSelectedIndicators([])
      setSelectedIndicatorDetails([])
      setBulkUpdateValue('')
      setUpdateNotes('')
      setBulkUpdateType('set')
      
      // Refresh indicators
      fetchIndicators()
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
        setUpdateResults(null)
      }, 3000)
      
    } catch (err) {
      console.error('Error bulk updating indicators:', err)
    }
  }

  const updateSelectedIndicatorDetails = (indicatorIds: string[]) => {
    const details = filteredIndicators.filter(indicator => indicatorIds.includes(indicator.id))
    setSelectedIndicatorDetails(details)
  }

  const handleQuickUpdate = async (indicatorId: string) => {
    if (!quickUpdateValue) return

    try {
      const response = await fetch(`/api/meal/indicators/${indicatorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current: Number(quickUpdateValue)
        })
      })

      if (response.ok) {
        setEditingIndicator(null)
        setQuickUpdateValue('')
        fetchIndicators()
      }
    } catch (err) {
      console.error('Error updating indicator:', err)
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
      {/* Success Message */}
      {showSuccessMessage && updateResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black text-center mb-2">Update Successful!</h3>
            <p className="text-gray-600 text-center mb-4">
              Successfully updated {updateResults.successCount} out of {updateResults.totalCount} indicators
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Updated by:</span>
                  <span className="font-medium text-black">{updateResults.updatedBy}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Date & Time:</span>
                  <span className="font-medium text-black">{updateResults.timestamp}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSuccessMessage(false)
                setUpdateResults(null)
              }}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ChartBarIcon className="h-8 w-8 text-orange-500 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-black">Project Indicators</h2>
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
                onClick={() => setShowIndicatorForm(true)}
                className="flex items-center px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 border border-green-600 rounded-md"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Indicator
              </button>
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
          <h3 className="text-lg font-semibold text-gray-900">Project Indicators Progress Update</h3>
          <p className="text-sm text-gray-600">Enter current progress for each indicator from the selected project's Results Framework</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIndicators.map((indicator) => {
                const project = projects.find(p => p.id === indicator.projectId)
                const progressPercentage = getProgressPercentage(indicator.current, indicator.target)
                
                return (
                  <tr key={indicator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{indicator.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{indicator.description}</div>
                        <div className="text-xs text-blue-600 mt-1 capitalize">{indicator.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {indicator.target} {indicator.unit}
                      </div>
                      {indicator.baseline && (
                        <div className="text-xs text-gray-500">
                          Baseline: {indicator.baseline} {indicator.baselineUnit}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingIndicator === indicator.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={quickUpdateValue}
                            onChange={(e) => setQuickUpdateValue(e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={indicator.current.toString()}
                            autoFocus
                          />
                          <span className="text-xs text-gray-500">{indicator.unit}</span>
                          <button
                            onClick={() => handleQuickUpdate(indicator.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Save"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingIndicator(null)
                              setQuickUpdateValue('')
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">
                            {indicator.current} {indicator.unit}
                          </span>
                          <button
                            onClick={() => {
                              setEditingIndicator(indicator.id)
                              setQuickUpdateValue(indicator.current.toString())
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Update progress"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
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
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(indicator.status)}`}>
                        {indicator.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {indicator.lastUpdatedBy || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {indicator.lastUpdatedAt ? new Date(indicator.lastUpdatedAt).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={indicator.notes || ''}>
                        {indicator.notes || 'No notes'}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-2xl rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-black">Bulk Update Indicators</h3>
                <button
                  onClick={() => setShowBulkUpdate(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800 font-medium">
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
                              let newSelected
                              if (e.target.checked) {
                                newSelected = [...selectedIndicators, indicator.id]
                              } else {
                                newSelected = selectedIndicators.filter(id => id !== indicator.id)
                              }
                              setSelectedIndicators(newSelected)
                              updateSelectedIndicatorDetails(newSelected)
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{indicator.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                indicator.category === 'outcome' ? 'bg-green-100 text-green-800' : 
                                indicator.category === 'output' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {indicator.category.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {indicator.current} / {indicator.target} {indicator.unit}
                            </p>
                            {indicator.baseline && (
                              <p className="text-xs text-gray-400">
                                Baseline: {indicator.baseline} {indicator.baselineUnit}
                              </p>
                            )}
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
                    
                    {/* Selected Indicators Summary */}
                    {selectedIndicatorDetails.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Selected Indicators:</h5>
                        <div className="space-y-1">
                          {selectedIndicatorDetails.map((indicator) => (
                            <div key={indicator.id} className="text-xs text-blue-800">
                              <span className="font-medium">{indicator.name}</span>
                              <span className="ml-2 px-1 py-0.5 bg-blue-200 rounded text-blue-800">
                                {indicator.category.toUpperCase()}
                              </span>
                              <span className="ml-2 text-blue-600">
                                ({indicator.unit})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Individual Value Inputs for Each Selected Indicator */}
                      {selectedIndicatorDetails.length > 0 && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update Values for Each Indicator:
                          </label>
                          {selectedIndicatorDetails.map((indicator, index) => (
                            <div key={indicator.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <span className="text-sm font-semibold text-black">{indicator.name}</span>
                                  <span className={`ml-2 px-2 py-1 text-xs rounded font-medium ${
                                    indicator.category === 'outcome' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-orange-100 text-orange-800'
                                  }`}>
                                    {indicator.category.toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  Current: {indicator.current} {indicator.unit}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  id={`bulk-value-${indicator.id}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                  placeholder={`Enter new value in ${indicator.unit}`}
                                  onChange={(e) => {
                                    // Update the indicator's value in the details array
                                    const updatedDetails = selectedIndicatorDetails.map(detail => 
                                      detail.id === indicator.id 
                                        ? { ...detail, current: parseFloat(e.target.value) || 0 }
                                        : detail
                                    )
                                    setSelectedIndicatorDetails(updatedDetails)
                                  }}
                                />
                                <span className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded font-medium">
                                  {indicator.unit}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Notes
                        </label>
                        <textarea
                          value={updateNotes}
                          onChange={(e) => setUpdateNotes(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Add notes for this bulk update..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowBulkUpdate(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpdate}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
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

      {/* Add New Indicator Form */}
      {showIndicatorForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Add New Indicator</h3>
                <button
                  onClick={() => setShowIndicatorForm(false)}
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
                    Create a new indicator for tracking project progress. This will be added to the selected project's Results Framework.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Basic Information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Indicator Name *
                      </label>
                      <input
                        type="text"
                        value={newIndicator.name}
                        onChange={(e) => setNewIndicator({...newIndicator, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Number of boreholes drilled"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newIndicator.description}
                        onChange={(e) => setNewIndicator({...newIndicator, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe what this indicator measures..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={newIndicator.category}
                          onChange={(e) => setNewIndicator({...newIndicator, category: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="output">Output</option>
                          <option value="outcome">Outcome</option>
                          <option value="impact">Impact</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequency *
                        </label>
                        <select
                          value={newIndicator.frequency}
                          onChange={(e) => setNewIndicator({...newIndicator, frequency: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="annually">Annually</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Targets and Units */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Targets & Units</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Value *
                        </label>
                        <input
                          type="number"
                          value={newIndicator.target}
                          onChange={(e) => setNewIndicator({...newIndicator, target: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit *
                        </label>
                        <input
                          type="text"
                          value={newIndicator.unit}
                          onChange={(e) => setNewIndicator({...newIndicator, unit: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., boreholes, people, %"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Baseline Value
                        </label>
                        <input
                          type="text"
                          value={newIndicator.baseline}
                          onChange={(e) => setNewIndicator({...newIndicator, baseline: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Starting value"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Baseline Unit
                        </label>
                        <input
                          type="text"
                          value={newIndicator.baselineUnit}
                          onChange={(e) => setNewIndicator({...newIndicator, baselineUnit: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., boreholes, people"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Unit
                      </label>
                      <input
                        type="text"
                        value={newIndicator.targetUnit}
                        onChange={(e) => setNewIndicator({...newIndicator, targetUnit: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., boreholes, people, %"
                      />
                    </div>
                  </div>
                </div>

                {/* Monitoring & Data Collection */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Monitoring & Data Collection</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monitoring Method
                      </label>
                      <input
                        type="text"
                        value={newIndicator.monitoringMethod}
                        onChange={(e) => setNewIndicator({...newIndicator, monitoringMethod: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Field surveys, Reports, Direct observation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Collection Frequency
                      </label>
                      <select
                        value={newIndicator.dataCollection.frequency}
                        onChange={(e) => setNewIndicator({
                          ...newIndicator, 
                          dataCollection: {...newIndicator.dataCollection, frequency: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Source
                      </label>
                      <input
                        type="text"
                        value={newIndicator.dataCollection.source}
                        onChange={(e) => setNewIndicator({
                          ...newIndicator, 
                          dataCollection: {...newIndicator.dataCollection, source: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Project reports, Field teams, Beneficiaries"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Disaggregation
                      </label>
                      <select
                        value={newIndicator.dataCollection.disaggregation}
                        onChange={(e) => setNewIndicator({
                          ...newIndicator, 
                          dataCollection: {...newIndicator.dataCollection, disaggregation: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="None">None</option>
                        <option value="Age">Age</option>
                        <option value="Gender">Gender</option>
                        <option value="Location">Location</option>
                        <option value="Disability">Disability</option>
                        <option value="Education level">Education level</option>
                        <option value="Income level">Income level</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Fields from Project Creation Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Responsible Person
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Name of person responsible for data collection"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reporting Schedule
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Quality Assurance
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe how data quality will be ensured..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowIndicatorForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateIndicator}
                    disabled={!newIndicator.name || !newIndicator.target || !newIndicator.unit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Create Indicator
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
