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

const extractYearNumber = (label: string): number => {
  if (!label) return 0
  const match = label.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

const parseNumericValue = (value: any): number => {
  if (value === null || value === undefined) return 0
  const numeric = parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(numeric) ? numeric : 0
}

const getTargetsArray = (targets: any): { label: string; value: number }[] => {
  if (!targets || typeof targets !== 'object') return []

  return Object.entries(targets)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([label, value]) => ({
      label,
      value: parseNumericValue(value)
    }))
    .sort((a, b) => extractYearNumber(a.label) - extractYearNumber(b.label))
}

const getTotalTargetValue = (targets: any): number => {
  return getTargetsArray(targets).reduce((sum, target) => sum + target.value, 0)
}

const getProjectYearGroups = (
  targetCount: number,
  project: { startDate?: string | null; endDate?: string | null } | null
): { start: Date; end: Date }[] => {
  if (!project || targetCount <= 0) return []

  const parseDate = (value?: string | null) => {
    if (!value) return null
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const start = parseDate(project.startDate)
  let end = parseDate(project.endDate)

  if (!start) return []

  if (!end || end <= start) {
    end = new Date(start)
    end.setFullYear(end.getFullYear() + targetCount)
    end.setDate(end.getDate() - 1)
  }

  const periods: { start: Date; end: Date }[] = []
  let currentYear = start.getFullYear()
  const endYear = end.getFullYear()

  for (let year = currentYear; year <= endYear; year++) {
    const periodStart = year === start.getFullYear()
      ? new Date(start)
      : new Date(year, 0, 1)

    const periodEnd = year === end.getFullYear()
      ? new Date(end)
      : new Date(year, 11, 31, 23, 59, 59, 999)

    periods.push({ start: periodStart, end: periodEnd })
  }

  if (periods.length === 0) return []

  let groups = periods.map(period => [period])

  while (groups.length > targetCount && groups.length > 1) {
    const first = groups.shift() || []
    const second = groups.shift() || []
    groups.unshift([...first, ...second])
  }

  if (groups.length === 0) return []

  if (groups.length < targetCount) {
    const lastGroup = groups[groups.length - 1]
    while (groups.length < targetCount) {
      groups.push(lastGroup)
    }
  }

  return groups.map(group => {
    const first = group[0]
    const last = group[group.length - 1]
    return {
      start: new Date(first.start),
      end: new Date(last.end)
    }
  })
}

const getCurrentProjectYearInfo = (
  targetsByYear: { label: string; value: number }[] | undefined,
  project: { startDate?: string | null; endDate?: string | null } | null,
  frameworkDuration?: number
) => {
  if (!targetsByYear || targetsByYear.length === 0) {
    return {
      index: 0,
      label: 'Year 1',
      value: 0
    }
  }

  const now = new Date()
  const startDate = project?.startDate ? new Date(project.startDate) : null
  const endDate = project?.endDate ? new Date(project.endDate) : null
  const targetCount = targetsByYear.length

  const groups = getProjectYearGroups(
    targetCount,
    project
  )

  if (groups.length === targetCount && groups.length > 0) {
    let yearIndex = groups.findIndex(period => {
      return now >= period.start && now <= period.end
    })

    if (yearIndex === -1) {
      if (now < groups[0].start) {
        yearIndex = 0
      } else {
        yearIndex = groups.length - 1
      }
    }

    const targetInfo = targetsByYear[yearIndex] || targetsByYear[0]

    return {
      index: yearIndex,
      label: targetInfo.label,
      value: targetInfo.value
    }
  }

  let yearIndex = 0
  if (startDate && !isNaN(startDate.getTime())) {
    if (now <= startDate) {
      yearIndex = 0
    } else {
      const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
      yearIndex = Math.floor(monthsDiff / 12)
    }
  }

  // Clamp using framework duration if provided
  let maxIndex = targetsByYear.length - 1
  if (typeof frameworkDuration === 'number' && frameworkDuration > 0) {
    maxIndex = Math.min(maxIndex, frameworkDuration - 1)
  }

  if (endDate && !isNaN(endDate.getTime())) {
    if (now > endDate) {
      yearIndex = maxIndex
    }
  }

  yearIndex = Math.max(0, Math.min(yearIndex, maxIndex))
  const targetInfo = targetsByYear[yearIndex] || targetsByYear[0]

  return {
    index: yearIndex,
    label: targetInfo.label,
    value: targetInfo.value
  }
}

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

interface UpdateHistory {
  value: number
  incrementBy: number
  previousValue: number
  updatedBy: string
  updatedAt: string
  notes?: string
}

interface ProjectIndicator {
  id: string
  projectId: string
  name: string
  description: string
  target: number
  totalTarget?: number
  targetsByYear?: { label: string; value: number }[]
  currentYearLabel?: string
  currentYearIndex?: number
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
  updateHistory?: UpdateHistory[]
  pendingIncrement?: number
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
  const [editingIndicator, setEditingIndicator] = useState<string | null>(null)
  const [quickUpdateValue, setQuickUpdateValue] = useState('')
  const [currentUser, setCurrentUser] = useState<string>('System')
  const [showAuditTrail, setShowAuditTrail] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // Clear any cached data that might contain old sample indicators
    localStorage.removeItem('project-indicators-cache')
    sessionStorage.removeItem('project-indicators-cache')
    fetchProjects()
    fetchCurrentUser()
    // Don't fetch indicators on mount - they should only be loaded when a project is selected
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const session = await response.json()
        console.log('Session data:', session)
        if (session?.user) {
          // Try to get employee name first, then fall back to user name/email
          let userName = session.user.name || session.user.email || 'Unknown User'
          
          // If we have an employeeId, try to fetch the employee's full name
          if (session.user.employeeId) {
            try {
              const empResponse = await fetch(`/api/hr/employees?employeeId=${session.user.employeeId}`)
              if (empResponse.ok) {
                const empData = await empResponse.json()
                if (empData.data && empData.data.length > 0) {
                  const employee = empData.data[0]
                  userName = `${employee.firstName} ${employee.lastName}`.trim()
                  console.log('Using employee name:', userName)
                }
              }
            } catch (empErr) {
              console.log('Could not fetch employee name, using session name')
            }
          }
          
          setCurrentUser(userName)
          console.log('Current user set to:', userName)
        }
      }
    } catch (err) {
      console.error('Error fetching current user:', err)
    }
  }

  // Filter indicators based on selected project
  useEffect(() => {
    if (selectedProjectId) {
      // Clear existing indicators and fetch fresh data from Results Framework
      console.log('Clearing all indicators and fetching fresh data for project:', selectedProjectId)
      setIndicators([])
      setFilteredIndicators([])
      setSelectedIndicators([])
      setSelectedIndicatorDetails([])
      setEditingIndicator(null)
      setQuickUpdateValue('')
      setShowAllProjects(false)
      // Fetch Results Framework data for the selected project
      fetchResultsFramework(selectedProjectId)
    } else {
      setFilteredIndicators(indicators)
      setShowAllProjects(true)
    }
  }, [selectedProjectId])

  // Debug indicators state changes
  useEffect(() => {
    console.log('Indicators state changed:', {
      indicators: indicators.length,
      filteredIndicators: filteredIndicators.length,
      selectedProjectId,
      showAllProjects
    })
  }, [indicators, filteredIndicators, selectedProjectId, showAllProjects])

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
      // Clear any existing indicators first to prevent cached old IDs
      setIndicators([])
      setFilteredIndicators([])
      
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/meal/indicators?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        // Transform the data to match our interface
        const transformedIndicators = (data.data || []).map((indicator: any) => ({
          id: indicator.id,
          projectId: indicator.project_id,
          name: indicator.name,
          description: indicator.description || '',
          target: indicator.target || 0,
          current: indicator.current || 0, // Use actual current value from database
          unit: indicator.unit || 'units',
          frequency: 'monthly' as const,
          status: indicator.status || 'on-track',
          lastUpdated: indicator.updated_at || new Date().toISOString(),
          trend: 'stable' as const,
          category: indicator.level || 'output',
          lastUpdatedBy: indicator.last_updated_by,
          lastUpdatedAt: indicator.last_updated_at,
          notes: indicator.notes
        }))
        
        // Debug: Log all indicator IDs to identify any old sample IDs
        console.log('Fetched indicators with IDs:', transformedIndicators.map((ind: any) => ind.id))
        
        setIndicators(transformedIndicators)
        setFilteredIndicators(transformedIndicators)
      }
    } catch (err) {
      console.error('Error fetching indicators:', err)
      // Add some sample data for demonstration
      const sampleIndicators = [
        {
          id: crypto.randomUUID(),
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
          category: 'output' as const,
          lastUpdatedBy: 'System',
          lastUpdatedAt: new Date().toISOString(),
          notes: ''
        },
        {
          id: crypto.randomUUID(),
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
          category: 'outcome' as const,
          lastUpdatedBy: 'System',
          lastUpdatedAt: new Date().toISOString(),
          notes: ''
        }
      ]
      
      // Debug: Log sample indicator IDs
      console.log('Using sample indicators with IDs:', sampleIndicators.map(ind => ind.id))
      
      setIndicators(sampleIndicators)
      setFilteredIndicators(sampleIndicators)
    }
  }

  const fetchResultsFramework = async (projectId: string) => {
    try {
      console.log('Fetching Results Framework for project:', projectId)
      const response = await fetch(`/api/programs/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Project data received:', data)
        console.log('Raw resultsFramework:', data.data.resultsFramework)
        console.log('Type of resultsFramework:', typeof data.data.resultsFramework)
        
        let framework = data.data.resultsFramework
        const projectRecord = data.data
        
        // Prisma should return resultsFramework as an object (Json type auto-parses)
        // But handle string case for backwards compatibility
        if (typeof framework === 'string') {
          try {
            framework = JSON.parse(framework)
            console.log('Parsed resultsFramework from string (backwards compatibility):', framework)
          } catch (parseError) {
            console.error('Failed to parse resultsFramework string:', parseError)
            framework = null
          }
        }
        
        if (data.success && framework && framework.objectives && Array.isArray(framework.objectives)) {
          console.log('✓ Results Framework found with', framework.objectives.length, 'objectives')
          console.log('Full framework structure:', JSON.stringify(framework, null, 2))
          setResultsFramework(framework)
          // Extract indicators from Results Framework
          extractIndicatorsFromFramework(framework, projectRecord)
        } else {
          console.log('❌ No Results Framework or no objectives found for this project')
          console.log('Framework value:', framework)
          console.log('Has objectives?', framework?.objectives)
          console.log('Is array?', Array.isArray(framework?.objectives))
          // Clear indicators if no framework
          setIndicators([])
          setFilteredIndicators([])
        }
      } else {
        console.error('Failed to fetch project data:', response.status)
      }
    } catch (err) {
      console.error('Error fetching Results Framework:', err)
    }
  }

  const extractIndicatorsFromFramework = (framework: any, project: any) => {
    console.log('Extracting indicators from framework:', framework)
    const extractedIndicators: ProjectIndicator[] = []
    const projectId = project?.id
    
    if (framework.objectives && Array.isArray(framework.objectives)) {
      console.log('Found objectives:', framework.objectives.length)
      framework.objectives.forEach((objective: any) => {
        if (objective.outcomes && Array.isArray(objective.outcomes)) {
          objective.outcomes.forEach((outcome: any) => {
            // Extract outcome indicators
            if (outcome.indicators && Array.isArray(outcome.indicators)) {
              outcome.indicators.forEach((indicator: any, indicatorIndex: number) => {
                const frameworkIndicatorId = indicator.id || `auto-${outcome.id}-${indicatorIndex}`
                if (!indicator.id) {
                  indicator.id = frameworkIndicatorId
                }
                const targetsByYear = getTargetsArray(indicator.targets)
                const currentYearInfo = getCurrentProjectYearInfo(targetsByYear, project, framework.projectDuration)
                extractedIndicators.push({
                  id: `outcome-${outcome.id}-${frameworkIndicatorId}`,
                  projectId,
                  name: indicator.description || 'Outcome Indicator',
                  description: `Objective: ${objective.title} → Outcome: ${outcome.title}`,
                  target: currentYearInfo.value,
                  totalTarget: getTotalTargetValue(indicator.targets),
                  targetsByYear,
                  currentYearLabel: currentYearInfo.label,
                  currentYearIndex: currentYearInfo.index,
                  current: parseNumericValue(indicator.current), // Use saved value or default to 0
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
                  lastUpdatedBy: indicator.lastUpdatedBy || 'System',
                  lastUpdatedAt: indicator.lastUpdated || new Date().toISOString(),
                  notes: indicator.notes || '',
                  updateHistory: indicator.updateHistory || []
                })
              })
            }
            
            // Extract output indicators
            if (outcome.outputs && Array.isArray(outcome.outputs)) {
              outcome.outputs.forEach((output: any) => {
                if (output.indicators && Array.isArray(output.indicators)) {
                  output.indicators.forEach((indicator: any, indicatorIndex: number) => {
                    const frameworkIndicatorId = indicator.id || `auto-${output.id}-${indicatorIndex}`
                    if (!indicator.id) {
                      indicator.id = frameworkIndicatorId
                    }
                        const targetsByYear = getTargetsArray(indicator.targets)
                      const currentYearInfo = getCurrentProjectYearInfo(targetsByYear, project, framework.projectDuration)
                    extractedIndicators.push({
                      id: `output-${output.id}-${frameworkIndicatorId}`,
                      projectId,
                      name: indicator.description || 'Output Indicator',
                      description: `Objective: ${objective.title} → Outcome: ${outcome.title} → Output: ${output.title}`,
                        target: currentYearInfo.value,
                          totalTarget: getTotalTargetValue(indicator.targets),
                          targetsByYear,
                        currentYearLabel: currentYearInfo.label,
                        currentYearIndex: currentYearInfo.index,
                      current: parseNumericValue(indicator.current), // Use saved value or default to 0
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
                      lastUpdatedBy: indicator.lastUpdatedBy || 'System',
                      lastUpdatedAt: indicator.lastUpdated || new Date().toISOString(),
                      notes: indicator.notes || '',
                      updateHistory: indicator.updateHistory || []
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
    
    // Debug: Log extracted indicator IDs
    console.log('Extracted indicators with IDs:', extractedIndicators.map(ind => ind.id))
    
    console.log('Setting indicators state with', extractedIndicators.length, 'indicators')
    setIndicators(extractedIndicators)
    setFilteredIndicators(extractedIndicators)
  }


  const handleBulkUpdate = async () => {
    if (selectedIndicators.length === 0) return

    try {
      console.log('Bulk updating indicators:', selectedIndicators, 'with details:', selectedIndicatorDetails)
      console.log('Update notes:', updateNotes)
      
      const hasIncrements = selectedIndicatorDetails.some(detail => (detail.pendingIncrement ?? 0) !== 0)
      if (!hasIncrements) {
        console.log('No increments provided, skipping bulk update')
        setShowBulkUpdate(false)
        setSelectedIndicators([])
        setSelectedIndicatorDetails([])
        setUpdateNotes('')
        return
      }

      // Update the project's resultsFramework with all indicator updates
      if (selectedProjectId && resultsFramework) {
        let updatedFramework = JSON.parse(JSON.stringify(resultsFramework)) // Deep clone once
        
        // Update each selected indicator in the framework (cumulative updates)
        selectedIndicatorDetails.forEach((indicator) => {
          const incrementValue = indicator.pendingIncrement ?? 0
          if (!incrementValue) {
            console.log(`Skipping indicator ${indicator.id} because increment is zero or undefined`)
            return
          }
          console.log(`Updating indicator ${indicator.id} with increment ${incrementValue} and notes: "${updateNotes}"`)
          updatedFramework = updateIndicatorInFramework(updatedFramework, indicator.id, incrementValue, updateNotes)
        })
        
        // Save the updated framework to the project
        const response = await fetch(`/api/programs/projects/${selectedProjectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            resultsFramework: updatedFramework
          })
        })

        if (response.ok) {
          const appliedIndicators = selectedIndicatorDetails.filter(detail => (detail.pendingIncrement ?? 0) !== 0)
          console.log(`Successfully updated ${appliedIndicators.length} indicators in project framework`)
          // Refresh the indicators from the updated framework
          fetchResultsFramework(selectedProjectId)
        } else {
          console.error('Failed to update project framework:', response.status)
        }
      }

      // Set success message and audit trail
      const appliedIndicators = selectedIndicatorDetails.filter(detail => (detail.pendingIncrement ?? 0) !== 0)
      if (appliedIndicators.length > 0) {
        setUpdateResults({
          successCount: appliedIndicators.length,
          totalCount: selectedIndicators.length,
          updatedBy: currentUser,
          timestamp: new Date().toLocaleString(),
          notes: updateNotes
        } as any)
        setShowSuccessMessage(true)
      }
      
      // Reset form and refresh data
      setShowBulkUpdate(false)
      setSelectedIndicators([])
      setSelectedIndicatorDetails([])
      setBulkUpdateValue('')
      setUpdateNotes('')
      setBulkUpdateType('set')
      
      // Refresh indicators from the project's Results Framework
      if (selectedProjectId) {
        fetchResultsFramework(selectedProjectId)
      }
      
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
    const details = filteredIndicators
      .filter(indicator => indicatorIds.includes(indicator.id))
      .map(indicator => {
        const existing = selectedIndicatorDetails.find(detail => detail.id === indicator.id)
        return {
          ...indicator,
          pendingIncrement: existing?.pendingIncrement ?? 0
        }
      })
    setSelectedIndicatorDetails(details)
  }

  const updateIndicatorInFramework = (framework: any, indicatorId: string, incrementValue: number, notes: string = '') => {
    if (!framework) return framework

    // Work directly on the passed framework (already cloned by caller)
    console.log('Updating indicator with composite ID:', indicatorId, 'incrementing by:', incrementValue)
    
    // Parse the composite ID to get the parts
    // Format: "outcome-{outcomeId}-{indicatorId}" or "output-{outputId}-{indicatorId}"
    const parts = indicatorId.split('-')
    const type = parts[0] // 'outcome' or 'output'
    const parentId = parts[1] // outcome or output ID
    const actualIndicatorId = parts.slice(2).join('-') // indicator ID (may contain dashes)
    
    console.log('Parsed ID parts:', { type, parentId, actualIndicatorId })
    
    const now = new Date().toISOString()
    
    // Update the indicator in the framework
    framework.objectives.forEach((objective: any) => {
      objective.outcomes.forEach((outcome: any) => {
        if (type === 'outcome' && outcome.id === parentId) {
          // Update outcome indicators
          if (outcome.indicators) {
            outcome.indicators.forEach((indicator: any, index: number) => {
              if (!indicator.id) {
                indicator.id = `auto-${outcome.id}-${index}`
              }
              if (indicator.id === actualIndicatorId) {
                const previousValue = indicator.current || 0
                const newValue = previousValue + incrementValue
                
                // Initialize update history if it doesn't exist
                if (!indicator.updateHistory) {
                  indicator.updateHistory = []
                }
                
                // Add to update history
                indicator.updateHistory.push({
                  value: newValue,
                  incrementBy: incrementValue,
                  previousValue: previousValue,
                  updatedBy: currentUser,
                  updatedAt: now,
                  notes: notes
                })
                
                // Update current progress tracking fields
                indicator.current = newValue
                indicator.lastUpdated = now
                indicator.lastUpdatedBy = currentUser
                indicator.notes = notes // Save the current notes to main notes field
                console.log('✓ Updated outcome indicator:', indicator.id, 'from', previousValue, 'to', newValue, '(+' + incrementValue + ')', 'notes:', notes)
              }
            })
          }
        }
        
        // Update output indicators
        if (type === 'output' && outcome.outputs) {
          outcome.outputs.forEach((output: any) => {
            if (output.id === parentId && output.indicators) {
              output.indicators.forEach((indicator: any, index: number) => {
                if (!indicator.id) {
                  indicator.id = `auto-${output.id}-${index}`
                }
                if (indicator.id === actualIndicatorId) {
                  const previousValue = indicator.current || 0
                  const newValue = previousValue + incrementValue
                  
                  // Initialize update history if it doesn't exist
                  if (!indicator.updateHistory) {
                    indicator.updateHistory = []
                  }
                  
                  // Add to update history
                  indicator.updateHistory.push({
                    value: newValue,
                    incrementBy: incrementValue,
                    previousValue: previousValue,
                    updatedBy: currentUser,
                    updatedAt: now,
                    notes: notes
                  })
                  
                  // Update current progress tracking fields
                  indicator.current = newValue
                  indicator.lastUpdated = now
                  indicator.lastUpdatedBy = currentUser
                  indicator.notes = notes // Save the current notes to main notes field
                  console.log('✓ Updated output indicator:', indicator.id, 'from', previousValue, 'to', newValue, '(+' + incrementValue + ')', 'notes:', notes)
                }
              })
            }
          })
        }
      })
    })
    
    console.log('Updated framework with cumulative values for indicator:', indicatorId)
    return framework
  }

  const handleQuickUpdate = async (indicatorId: string) => {
    if (!quickUpdateValue) return

    console.log('Attempting to update indicator:', indicatorId, 'with value:', quickUpdateValue)

    try {
      // Check if this is a sample indicator (not in database)
      const indicator = filteredIndicators.find(ind => ind.id === indicatorId)
      console.log('Found indicator:', indicator)
      
      // Check for any invalid UUID patterns
      if (indicatorId.includes('sample-') || indicatorId === 'sample-1' || indicatorId === 'sample-2') {
        console.log('Detected old sample indicator with invalid ID, updating local state only')
        const updatedIndicators = indicators.map(ind => 
          ind.id === indicatorId 
            ? { ...ind, current: Number(quickUpdateValue) }
            : ind
        )
        setIndicators(updatedIndicators)
        setFilteredIndicators(updatedIndicators)
        setEditingIndicator(null)
        setQuickUpdateValue('')
        return
      }
      
      if (indicator && (indicator.name.includes('Number of Beneficiaries') || indicator.name.includes('Training Sessions') || indicator.name.includes('Boreholes') || indicator.name.includes('Water Quality'))) {
        // This is a sample indicator, just update the local state
        console.log('Sample indicator detected, updating local state only')
        const updatedIndicators = indicators.map(ind => 
          ind.id === indicatorId 
            ? { ...ind, current: Number(quickUpdateValue) }
            : ind
        )
        setIndicators(updatedIndicators)
        setFilteredIndicators(updatedIndicators)
        setEditingIndicator(null)
        setQuickUpdateValue('')
        return
      }

      // For real indicators from Results Framework, update the project's resultsFramework
      if (selectedProjectId && resultsFramework) {
        const clonedFramework = JSON.parse(JSON.stringify(resultsFramework))
        const updatedFramework = updateIndicatorInFramework(clonedFramework, indicatorId, Number(quickUpdateValue), '')
        
        const response = await fetch(`/api/programs/projects/${selectedProjectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            resultsFramework: updatedFramework
          })
        })

        if (response.ok) {
          setEditingIndicator(null)
          setQuickUpdateValue('')
          // Refresh the indicators from the updated framework
          fetchResultsFramework(selectedProjectId)
        }
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
        // Refresh indicators from the project's Results Framework
        if (selectedProjectId) {
          fetchResultsFramework(selectedProjectId)
        }
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

  // Chart data preparation with numbered labels
  const chartData = filteredIndicators.map((indicator, index) => ({
    name: `Indicator ${index + 1}`,
    fullName: indicator.name,
    current: indicator.current,
    target: indicator.target,
    progress: getProgressPercentage(indicator.current, indicator.target)
  }))

  const totalSelectedCurrentYearTarget = selectedIndicatorDetails.reduce((sum, indicator) => {
    return sum + (indicator.target || 0)
  }, 0)

  const totalSelectedAllYearsTarget = selectedIndicatorDetails.reduce((sum, indicator) => {
    return sum + (indicator.totalTarget || indicator.target || 0)
  }, 0)

  const totalSelectedPendingIncrement = selectedIndicatorDetails.reduce((sum, indicator) => {
    return sum + (indicator.pendingIncrement || 0)
  }, 0)

  const bulkUnitsSet = new Set(selectedIndicatorDetails.map(indicator => indicator.unit).filter(Boolean))
  const bulkUnitsLabel = bulkUnitsSet.size === 1 ? Array.from(bulkUnitsSet)[0] : (bulkUnitsSet.size > 1 ? 'mixed units' : '')
  
  // Legend mapping for indicators with full hierarchy
  const indicatorLegend = filteredIndicators.map((indicator, index) => {
    // Extract objective and outcome info from description
    const descParts = indicator.description.split(' → ')
    const objective = descParts[0]?.replace('Objective: ', '') || ''
    const outcome = descParts[1]?.replace('Outcome: ', '') || ''
    const output = descParts[2]?.replace('Output: ', '') || ''
    
    return {
      number: index + 1,
      name: indicator.name,
      category: indicator.category,
      objective: objective,
      outcome: outcome,
      output: output,
      hierarchy: output 
        ? `${objective} → ${outcome} → ${output}`
        : `${objective} → ${outcome}`
    }
  })

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
            <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-lg p-4 mb-4 border border-orange-200">
              <div className="text-sm text-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Updated by:</span>
                  <span className="font-bold text-orange-600">{updateResults.updatedBy}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Date & Time:</span>
                  <span className="font-bold text-black">{updateResults.timestamp}</span>
                </div>
                {(updateResults as any).notes && (
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <span className="font-medium text-gray-700 block mb-1">Notes:</span>
                    <span className="text-sm text-gray-800 bg-white p-2 rounded block">{(updateResults as any).notes}</span>
                  </div>
                )}
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
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-white">Project Indicators Dashboard</h2>
              <p className="text-orange-100">Track and update project output indicator progress with complete audit trail</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <div className="text-sm font-medium text-white">
                {filteredIndicators.length} indicators
              </div>
              <div className="text-xs text-orange-100">
                {selectedProjectId ? `Selected Project` : `${projects.length} Projects`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Filter */}
      <div className="bg-white rounded-xl shadow-md border-l-4 border-orange-500 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-gray-800">Filter by Project:</label>
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white hover:border-orange-400 transition-colors"
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
              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                <span className="text-sm text-gray-700">
                  Showing: <span className="font-semibold text-orange-600">
                    {projects.find(p => p.id === selectedProjectId)?.name}
                  </span>
                </span>
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="text-xs font-medium text-orange-600 hover:text-orange-800 underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkUpdate(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-md transition-all transform hover:scale-105"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Bulk Update
              </button>
              <button
                onClick={() => selectedProjectId ? fetchResultsFramework(selectedProjectId) : null}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm transition-all"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Indicators */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100 mb-1">Total Indicators</p>
              <p className="text-4xl font-bold text-white">{filteredIndicators.length}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* On Track */}
        <div className="bg-white rounded-xl shadow-md border-2 border-green-500 p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">On Track</p>
              <p className="text-4xl font-bold text-green-600">
                {filteredIndicators.filter(i => i.status === 'on-track').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Behind */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Behind</p>
              <p className="text-4xl font-bold text-gray-700">
                {filteredIndicators.filter(i => i.status === 'behind').length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100 mb-1">Completed</p>
              <p className="text-4xl font-bold text-white">
                {filteredIndicators.filter(i => i.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-orange-500 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <ChartBarIcon className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Indicator Progress</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={0} textAnchor="middle" />
              <YAxis />
              <Tooltip 
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                        <p className="font-semibold text-sm text-gray-900">{data.fullName}</p>
                        <p className="text-xs text-blue-600">Current: {data.current}</p>
                        <p className="text-xs text-gray-600">Target: {data.target}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="current" fill="#F97316" name="Current" />
              <Bar dataKey="target" fill="#D1D5DB" name="Target" />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend - Grouped by Objective and Outcome */}
          <div className="mt-4 max-h-48 overflow-y-auto border-t-2 border-orange-200 pt-3 bg-gradient-to-b from-orange-50 to-white p-3 rounded-lg">
            <h4 className="text-xs font-bold text-orange-600 mb-3 flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Indicator Legend (by Objective → Outcome):
            </h4>
            <div className="space-y-3 text-xs">
              {(() => {
                // Group indicators by objective and outcome
                const grouped: any = {}
                indicatorLegend.forEach((item) => {
                  const key = `${item.objective}|||${item.outcome}`
                  if (!grouped[key]) {
                    grouped[key] = {
                      objective: item.objective,
                      outcome: item.outcome,
                      indicators: []
                    }
                  }
                  grouped[key].indicators.push(item)
                })
                
                return Object.values(grouped).map((group: any, groupIndex: number) => (
                  <div key={groupIndex} className="bg-white p-3 rounded-lg border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-bold text-black mb-1 text-sm flex items-center">
                      <span className="text-orange-500 mr-2">📊</span>
                      {group.objective}
                    </div>
                    <div className="text-gray-700 ml-6 mb-2 font-semibold flex items-center">
                      <span className="text-green-500 mr-2">→</span>
                      {group.outcome}
                    </div>
                    <div className="ml-8 space-y-1.5">
                      {group.indicators.map((item: any) => (
                        <div key={item.number} className="flex items-start hover:bg-orange-50 p-1.5 rounded transition-colors">
                          <span className="font-bold text-orange-600 mr-2 min-w-[24px]">#{item.number}</span>
                          <span className="text-gray-800 flex-1 text-xs leading-relaxed">{item.name}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded font-semibold text-xs ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-green-500 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Status Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent, value }: any) => value > 0 ? `${name}: ${value}` : ''}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                        <p className="font-semibold text-sm text-gray-900">{data.name}</p>
                        <p className="text-xs text-gray-600">Count: {data.value} indicators</p>
                        <p className="text-xs text-gray-500">
                          {((data.value / filteredIndicators.length) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Status Legend */}
          <div className="mt-4 border-t-2 border-green-200 pt-3 bg-gradient-to-b from-green-50 to-white p-3 rounded-lg">
            <h4 className="text-xs font-bold text-green-600 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Status Breakdown:
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="w-4 h-4 rounded-full mr-2 shadow-inner" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-800 font-medium">{item.name}:</span>
                  <span className="ml-1 font-bold text-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Indicators Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-orange-500">
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b-2 border-orange-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <PencilIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Project Indicators Progress Update</h3>
              <p className="text-sm text-gray-600 mt-1">Enter <span className="font-semibold text-orange-600">incremental progress</span> for each indicator - values will be <span className="font-semibold text-green-600">added</span> to current totals</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-1/4">
                  Indicator
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-32">
                  Target
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-40">
                  Current Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-32">
                  Progress %
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-28">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-40">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-1/5">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIndicators.map((indicator) => {
                const project = projects.find(p => p.id === indicator.projectId)
                const progressPercentage = getProgressPercentage(indicator.current, indicator.target)
                
                return (
                  <tr key={indicator.id} className="hover:bg-orange-50 transition-colors border-b border-gray-100">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-black">{indicator.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{indicator.description}</div>
                        <div className={`inline-block text-xs font-bold mt-2 px-2 py-1 rounded ${
                          indicator.category === 'outcome' ? 'bg-green-100 text-green-700' : 
                          indicator.category === 'output' ? 'bg-orange-100 text-orange-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {indicator.category.toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        Current Year Target
                        {indicator.currentYearLabel ? ` (${indicator.currentYearLabel})` : ''}: {indicator.target} {indicator.unit}
                      </div>
                      {indicator.totalTarget !== undefined && indicator.targetsByYear && indicator.targetsByYear.length > 1 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Total Across Years: <span className="font-semibold text-gray-800">{indicator.totalTarget} {indicator.unit}</span>
                        </div>
                      )}
                      {indicator.targetsByYear && indicator.targetsByYear.length > 0 && (
                        <div className="mt-2 space-y-1 text-xs text-gray-600 bg-gray-50 rounded-md border border-gray-200 p-2">
                          {indicator.targetsByYear.map(({ label, value }, index) => {
                            const isCurrent = indicator.currentYearIndex === index
                            return (
                              <div
                                key={label}
                                className={`flex justify-between ${isCurrent ? 'text-gray-900 font-semibold' : ''}`}
                              >
                                <span>{label}</span>
                                <span className={`${isCurrent ? 'text-gray-900' : 'text-gray-700'} font-medium`}>
                                  {value} {indicator.unit}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {indicator.baseline && (
                        <div className="text-xs text-gray-500 mt-2">
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
                            className="w-20 px-3 py-1.5 text-sm font-medium border-2 border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50"
                            placeholder="Add..."
                            autoFocus
                          />
                          <span className="text-xs font-medium text-gray-600">{indicator.unit}</span>
                          <button
                            onClick={() => handleQuickUpdate(indicator.id)}
                            className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transition-all"
                            title="Save increment"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingIndicator(null)
                              setQuickUpdateValue('')
                            }}
                            className="p-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                            title="Cancel"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-black">
                            {indicator.current}
                          </span>
                          <span className="text-xs text-gray-600">{indicator.unit}</span>
                          <button
                            onClick={() => {
                              setEditingIndicator(indicator.id)
                              setQuickUpdateValue('') // Start with empty for increment
                            }}
                            className="p-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                            title="Add increment"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-3 mr-3 shadow-inner">
                          <div 
                            className={`h-3 rounded-full transition-all ${
                              progressPercentage >= 75 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              progressPercentage >= 50 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                              'bg-gradient-to-r from-orange-300 to-orange-400'
                            }`}
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${getStatusColor(indicator.status)}`}>
                        {indicator.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                          {(indicator.lastUpdatedBy || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {indicator.lastUpdatedBy || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {indicator.lastUpdatedAt ? new Date(indicator.lastUpdatedAt).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }) : 'Never'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-gray-700 whitespace-normal leading-relaxed">
                        {indicator.notes || <span className="text-gray-400 italic">No notes</span>}
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
                            <div className="text-xs text-gray-600 mt-2 space-y-1">
                              <div>
                                <span className="font-medium text-gray-700">Current:</span> {indicator.current} {indicator.unit}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Current Year Target{indicator.currentYearLabel ? ` (${indicator.currentYearLabel})` : ''}:
                                </span> {indicator.target} {indicator.unit}
                              </div>
                              {typeof indicator.totalTarget === 'number' && indicator.totalTarget > indicator.target && (
                                <div>
                                  <span className="font-medium text-gray-700">All Years Target:</span> {indicator.totalTarget} {indicator.unit}
                                </div>
                              )}
                              {indicator.targetsByYear && indicator.targetsByYear.length > 0 && (
                                <div className="pt-1">
                                  <div className="font-medium text-gray-700">Yearly Breakdown:</div>
                                  <div className="grid grid-cols-2 gap-1 mt-1">
                                    {indicator.targetsByYear.map(({ label, value }, index) => {
                                      const isCurrent = indicator.currentYearIndex === index
                                      return (
                                        <div key={label} className={`flex justify-between ${isCurrent ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                          <span>{label}</span>
                                          <span>{value}</span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
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
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-blue-900">
                          <div className="bg-white border border-blue-200 rounded-md p-3 shadow-sm">
                            <div className="font-semibold text-blue-900">Current Year Target Total</div>
                            <div className="text-base font-bold">{totalSelectedCurrentYearTarget.toLocaleString()} {bulkUnitsLabel}</div>
                          </div>
                          <div className="bg-white border border-blue-200 rounded-md p-3 shadow-sm">
                            <div className="font-semibold text-blue-900">All Years Target Total</div>
                            <div className="text-base font-bold">{totalSelectedAllYearsTarget.toLocaleString()} {bulkUnitsLabel}</div>
                          </div>
                          <div className="bg-white border border-blue-200 rounded-md p-3 shadow-sm">
                            <div className="font-semibold text-blue-900">Pending Increment Total</div>
                            <div className="text-base font-bold">{totalSelectedPendingIncrement.toLocaleString()} {bulkUnitsLabel}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Individual Value Inputs for Each Selected Indicator */}
                      {selectedIndicatorDetails.length > 0 && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Increment Values for Each Indicator (will be ADDED to current values):
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-3">
                                  <div className="font-semibold text-gray-800 mb-1">Targets</div>
                                  <div>Current Year Target{indicator.currentYearLabel ? ` (${indicator.currentYearLabel})` : ''}: <span className="font-medium text-gray-900">{indicator.target} {indicator.unit}</span></div>
                                  {typeof indicator.totalTarget === 'number' && indicator.totalTarget > indicator.target && (
                                    <div>Total Across Years: <span className="font-medium text-gray-900">{indicator.totalTarget} {indicator.unit}</span></div>
                                  )}
                                </div>
                                {indicator.targetsByYear && indicator.targetsByYear.length > 0 && (
                                  <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-3">
                                    <div className="font-semibold text-gray-800 mb-1">Yearly Breakdown</div>
                                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                      {indicator.targetsByYear.map(({ label, value }, index) => {
                                        const isCurrent = indicator.currentYearIndex === index
                                        return (
                                          <div key={label} className={`flex justify-between ${isCurrent ? 'text-gray-900 font-semibold' : ''}`}>
                                            <span>{label}</span>
                                            <span className={`${isCurrent ? 'text-gray-900' : 'text-gray-700'} font-medium`}>{value} {indicator.unit}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  id={`bulk-value-${indicator.id}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                  placeholder={`Enter increment in ${indicator.unit} (e.g., +5)`}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value)
                                    const incrementValue = Number.isFinite(value) ? value : 0
                                    const updatedDetails = selectedIndicatorDetails.map(detail =>
                                      detail.id === indicator.id
                                        ? { ...detail, pendingIncrement: incrementValue }
                                        : detail
                                    )
                                    setSelectedIndicatorDetails(updatedDetails)
                                  }}
                                  value={indicator.pendingIncrement ?? ''}
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

      {/* Add New Indicator Form - Removed - indicators are now created in project edit popup */}
    </div>
  )
}
