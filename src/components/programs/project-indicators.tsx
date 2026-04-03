"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  ArrowPathIcon,
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

/** Target value + label for a specific year row (for bulk updates / display). */
const getTargetForYearIndex = (
  indicator: {
    targetsByYear?: { label: string; value: number }[]
    target?: number
    currentYearLabel?: string
  },
  yearIndex: number
): { value: number; label: string } => {
  const t = indicator.targetsByYear
  if (t && t.length > 0 && yearIndex >= 0 && yearIndex < t.length) {
    return { value: t[yearIndex].value, label: t[yearIndex].label }
  }
  return {
    value: indicator.target ?? 0,
    label: indicator.currentYearLabel || "Reporting period",
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
  /** Which reporting year this increment was logged against (bulk / backfill). */
  reportingYearIndex?: number
  reportingYearLabel?: string
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

/** Per-year actuals from tagged bulk history; legacy totals shown on calendar current year row only. */
type YearlyProgressRow = {
  label: string
  target: number
  progress: number | null
}

const computeYearlyProgressRows = (
  indicator: ProjectIndicator
): YearlyProgressRow[] => {
  const targets = indicator.targetsByYear
  const total = parseNumericValue(indicator.current)

  if (!targets?.length) {
    return [
      {
        label: "Total",
        target: indicator.target ?? 0,
        progress: total,
      },
    ]
  }

  const n = targets.length
  const sums = new Array(n).fill(0)
  let taggedSum = 0

  for (const h of indicator.updateHistory || []) {
    const inc = typeof h.incrementBy === "number" ? h.incrementBy : 0
    if (!inc) continue
    let idx: number | null = null
    if (
      typeof h.reportingYearIndex === "number" &&
      h.reportingYearIndex >= 0 &&
      h.reportingYearIndex < n
    ) {
      idx = h.reportingYearIndex
    } else if (h.reportingYearLabel) {
      const found = targets.findIndex((t) => t.label === h.reportingYearLabel)
      if (found >= 0) idx = found
    }
    if (idx !== null) {
      sums[idx] += inc
      taggedSum += inc
    }
  }

  const untagged = Math.max(0, total - taggedSum)

  if (taggedSum === 0) {
    const curIdx = Math.min(
      Math.max(0, indicator.currentYearIndex ?? 0),
      n - 1
    )
    return targets.map((t, i) => ({
      label: t.label,
      target: t.value,
      progress: i === curIdx ? total : null,
    }))
  }

  const rows = targets.map((t, i) => ({
    label: t.label,
    target: t.value,
    progress: sums[i],
  }))

  if (untagged > 0) {
    rows.push({
      label: "Other (cumulative, not tagged by year)",
      target: 0,
      progress: untagged,
    })
  }

  return rows
}

const fractionElapsedInPeriod = (now: Date, start: Date, end: Date): number => {
  const t0 = start.getTime()
  const t1 = end.getTime()
  if (t1 <= t0) return 1
  return Math.min(1, Math.max(0, (now.getTime() - t0) / (t1 - t0)))
}

/** Approximate reporting-year window when calendar grouping is unavailable. */
const estimatedYearBoundaryWindow = (
  project: { startDate?: string | null; endDate?: string | null } | null,
  yearIndex: number
): { start: Date; end: Date } | null => {
  if (!project?.startDate) return null
  const anchor = new Date(project.startDate)
  if (isNaN(anchor.getTime())) return null
  const s = new Date(anchor)
  s.setFullYear(s.getFullYear() + yearIndex)
  const e = new Date(anchor)
  e.setFullYear(e.getFullYear() + yearIndex + 1)
  e.setDate(e.getDate() - 1)
  return { start: s, end: e }
}

const programmeTotalTarget = (indicator: ProjectIndicator): number => {
  if (typeof indicator.totalTarget === "number" && indicator.totalTarget > 0) {
    return indicator.totalTarget
  }
  if (indicator.targetsByYear?.length) {
    const s = indicator.targetsByYear.reduce((a, t) => a + t.value, 0)
    if (s > 0) return s
  }
  return indicator.target ?? 0
}

/**
 * Status for charts / summary: compares achieved vs time-adjusted expected progress
 * for the same period as the indicator bar chart (cumulative or a reporting year).
 */
const computeDerivedIndicatorStatus = (
  indicator: ProjectIndicator,
  period: "cumulative" | number,
  project: { startDate?: string | null; endDate?: string | null } | null,
  frameworkDuration?: number
): ProjectIndicator["status"] => {
  const now = new Date()
  const totalTarget = programmeTotalTarget(indicator)
  const current = parseNumericValue(indicator.current)
  const behindTol = 0.12
  const aheadTol = 0.08

  if (totalTarget > 0 && current >= totalTarget) {
    return "completed"
  }

  const projectStart = project?.startDate ? new Date(project.startDate) : null
  const projectEndRaw = project?.endDate ? new Date(project.endDate) : null

  const resolveProgrammeEnd = (yearSpan: number): Date => {
    const start = projectStart && !isNaN(projectStart.getTime()) ? projectStart : new Date()
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + Math.max(1, yearSpan))
    end.setDate(end.getDate() - 1)
    return end
  }

  if (period === "cumulative") {
    let expectedRatio = 0.5
    if (projectStart && !isNaN(projectStart.getTime())) {
      let endD =
        projectEndRaw && !isNaN(projectEndRaw.getTime()) && projectEndRaw > projectStart
          ? projectEndRaw
          : null
      if (!endD) {
        const ny =
          indicator.targetsByYear?.length ??
          (typeof frameworkDuration === "number" && frameworkDuration > 0
            ? frameworkDuration
            : 1)
        endD = resolveProgrammeEnd(ny)
      }
      expectedRatio = fractionElapsedInPeriod(now, projectStart, endD)
    }
    const actualRatio = totalTarget > 0 ? current / totalTarget : 0
    if (expectedRatio < 0.02) return "on-track"
    if (actualRatio + 1e-9 < expectedRatio - behindTol) return "behind"
    if (actualRatio > expectedRatio + aheadTol) return "ahead"
    return "on-track"
  }

  const targets = indicator.targetsByYear
  const n = targets?.length ?? 0
  if (n === 0) {
    const t = indicator.target ?? 0
    const ar = t > 0 ? current / t : 0
    let er = 0.5
    if (projectStart && !isNaN(projectStart.getTime())) {
      let endD =
        projectEndRaw && !isNaN(projectEndRaw.getTime()) && projectEndRaw > projectStart
          ? projectEndRaw
          : resolveProgrammeEnd(1)
      er = fractionElapsedInPeriod(now, projectStart, endD)
    }
    if (er < 0.02) return "on-track"
    if (ar + 1e-9 < er - behindTol) return "behind"
    if (ar > er + aheadTol) return "ahead"
    return "on-track"
  }

  const yi = Math.min(Math.max(0, period as number), n - 1)
  const yearTarget = targets![yi].value
  const rows = computeYearlyProgressRows(indicator)
  const row = rows[yi]
  const progress = row?.progress != null ? row.progress : 0

  if (yearTarget > 0 && progress >= yearTarget) {
    return "ahead"
  }

  let elapsedInYear = 0.5
  const groups = getProjectYearGroups(n, project)
  if (groups.length === n && groups[yi]) {
    elapsedInYear = fractionElapsedInPeriod(now, groups[yi].start, groups[yi].end)
  } else {
    const win = estimatedYearBoundaryWindow(project, yi)
    if (win) {
      elapsedInYear = fractionElapsedInPeriod(now, win.start, win.end)
    } else {
      const cy = getCurrentProjectYearInfo(targets, project, frameworkDuration)
      if (yi < cy.index) elapsedInYear = 1
      else if (yi > cy.index) elapsedInYear = 0
      else elapsedInYear = 0.5
    }
  }

  if (yearTarget <= 0) return "on-track"
  const expectedProgress = yearTarget * elapsedInYear
  if (elapsedInYear < 0.02) return "on-track"
  if (progress + 1e-9 < expectedProgress - yearTarget * behindTol) return "behind"
  if (progress > expectedProgress + yearTarget * aheadTol) return "ahead"
  return "on-track"
}

interface ProjectIndicatorsProps {
  permissions: any
  onProjectSelect: (projectId: string | null) => void
  selectedProject: string | null
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

/** Status pie + legend (semantic colors; do not reuse generic COLORS). */
const STATUS_PIE_COLORS: Record<
  ProjectIndicator["status"],
  string
> = {
  "on-track": "#2563EB",
  behind: "#DC2626",
  ahead: "#D97706",
  completed: "#228B22",
}

type StatusPieRow = {
  statusKey: ProjectIndicator["status"]
  name: string
  value: number
  fill: string
  items: { id: string; name: string; detail?: string }[]
}

export function ProjectIndicators({ permissions, onProjectSelect, selectedProject }: ProjectIndicatorsProps) {
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [indicators, setIndicators] = useState<ProjectIndicator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [filteredIndicators, setFilteredIndicators] = useState<ProjectIndicator[]>([])
  const [showAllProjects, setShowAllProjects] = useState(true)
  const [resultsFramework, setResultsFramework] = useState<any>(null)
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  /** Year row index in targetsByYear that increments apply to (default = project "current" year). */
  const [bulkUpdateYearIndex, setBulkUpdateYearIndex] = useState(0)
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
  const [currentUser, setCurrentUser] = useState<string>('System')
  const [showAuditTrail, setShowAuditTrail] = useState<string | null>(null)
  /** Bar chart: cumulative vs reporting year index (0-based). */
  const [progressChartPeriod, setProgressChartPeriod] = useState<
    "cumulative" | number
  >("cumulative")

  useEffect(() => {
    setMounted(true)
    // Clear any cached data that might contain old sample indicators
    localStorage.removeItem('project-indicators-cache')
    sessionStorage.removeItem('project-indicators-cache')
    fetchProjects()
    fetchCurrentUser()
    // Don't fetch indicators on mount - they should only be loaded when a project is selected
  }, [])

  // Keep bulk reporting year within range when selection changes
  useEffect(() => {
    if (!showBulkUpdate || selectedIndicatorDetails.length === 0) return
    const maxIdx = Math.max(
      0,
      ...selectedIndicatorDetails.map((i) =>
        Math.max(0, (i.targetsByYear?.length ?? 1) - 1)
      )
    )
    setBulkUpdateYearIndex((prev) => (prev > maxIdx ? maxIdx : prev))
  }, [showBulkUpdate, selectedIndicators])

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
      setShowAllProjects(false)
      // Fetch Results Framework data for the selected project
      fetchResultsFramework(selectedProjectId)
    } else {
      setFilteredIndicators(indicators)
      setShowAllProjects(true)
    }
  }, [selectedProjectId])

  useEffect(() => {
    setProgressChartPeriod("cumulative")
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


  const openBulkUpdateModal = () => {
    const proj = projects.find((p) => p.id === selectedProjectId) ?? null
    const seed =
      filteredIndicators.find((i) => selectedIndicators.includes(i.id)) ??
      filteredIndicators[0]
    let idx = 0
    if (seed?.targetsByYear?.length) {
      const cy = getCurrentProjectYearInfo(
        seed.targetsByYear,
        proj,
        resultsFramework?.projectDuration
      )
      idx = Math.max(
        0,
        Math.min(cy.index, seed.targetsByYear.length - 1)
      )
    }
    setBulkUpdateYearIndex(idx)
    setShowBulkUpdate(true)
  }

  const handleBulkUpdate = async () => {
    if (selectedIndicators.length === 0) return

    try {
      console.log('Bulk updating indicators:', selectedIndicators, 'with details:', selectedIndicatorDetails)
      console.log('Update notes:', updateNotes)
      console.log('Reporting year index:', bulkUpdateYearIndex)
      
      const hasIncrements = selectedIndicatorDetails.some(detail => (detail.pendingIncrement ?? 0) !== 0)
      if (!hasIncrements) {
        console.log('No increments provided, skipping bulk update')
        setShowBulkUpdate(false)
        setBulkUpdateYearIndex(0)
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
          const yr = getTargetForYearIndex(indicator, bulkUpdateYearIndex)
          updatedFramework = updateIndicatorInFramework(
            updatedFramework,
            indicator.id,
            incrementValue,
            updateNotes,
            { index: bulkUpdateYearIndex, label: yr.label }
          )
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
      setBulkUpdateYearIndex(0)

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

  const updateIndicatorInFramework = (
    framework: any,
    indicatorId: string,
    incrementValue: number,
    notes: string = '',
    reportingYear?: { index: number; label: string }
  ) => {
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
                  notes: notes,
                  ...(reportingYear
                    ? {
                        reportingYearIndex: reportingYear.index,
                        reportingYearLabel: reportingYear.label,
                      }
                    : {}),
                })

                // Update current progress tracking fields
                indicator.current = newValue
                indicator.lastUpdated = now
                indicator.lastUpdatedBy = currentUser
                indicator.notes = notes // Save the current notes to main notes field
                console.log(
                  "✓ Updated outcome indicator:",
                  indicator.id,
                  "from",
                  previousValue,
                  "to",
                  newValue,
                  "(+" + incrementValue + ")",
                  "notes:",
                  notes,
                  reportingYear ? `year:${reportingYear.label}` : ""
                )
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
                    notes: notes,
                    ...(reportingYear
                      ? {
                          reportingYearIndex: reportingYear.index,
                          reportingYearLabel: reportingYear.label,
                        }
                      : {}),
                  })

                  // Update current progress tracking fields
                  indicator.current = newValue
                  indicator.lastUpdated = now
                  indicator.lastUpdatedBy = currentUser
                  indicator.notes = notes // Save the current notes to main notes field
                  console.log(
                    "✓ Updated output indicator:",
                    indicator.id,
                    "from",
                    previousValue,
                    "to",
                    newValue,
                    "(+" + incrementValue + ")",
                    "notes:",
                    notes,
                    reportingYear ? `year:${reportingYear.label}` : ""
                  )
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
    if (!target || target <= 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  /** Denominator for cumulative %: all-years total when available, else current-year target. */
  const getCumulativeProgressDenominator = (indicator: ProjectIndicator): number => {
    if (typeof indicator.totalTarget === "number" && indicator.totalTarget > 0) {
      return indicator.totalTarget
    }
    if (indicator.targetsByYear && indicator.targetsByYear.length > 0) {
      const sum = indicator.targetsByYear.reduce((s, t) => s + t.value, 0)
      if (sum > 0) return sum
    }
    const t = indicator.target
    return t && t > 0 ? t : 0
  }

  const getCumulativeProgressPercentage = (indicator: ProjectIndicator) => {
    const denom = getCumulativeProgressDenominator(indicator)
    return getProgressPercentage(parseNumericValue(indicator.current), denom)
  }

  /** Normalized chart values (0–100%) so mixed units share one scale. */
  const getIndicatorChartPercentages = (
    indicator: ProjectIndicator,
    period: "cumulative" | number
  ) => {
    if (period === "cumulative") {
      const denom = getCumulativeProgressDenominator(indicator)
      const cur = parseNumericValue(indicator.current)
      return {
        currentPct: getProgressPercentage(cur, denom),
        targetPct: 100,
        rawCurrent: cur,
        rawTarget: denom,
        periodLabel: "All years (cumulative)",
      }
    }
    const targets = indicator.targetsByYear
    const n = targets?.length ?? 0
    if (n === 0) {
      const t = indicator.target ?? 0
      const cur = parseNumericValue(indicator.current)
      return {
        currentPct: getProgressPercentage(cur, t),
        targetPct: 100,
        rawCurrent: cur,
        rawTarget: t,
        periodLabel: "Reporting period",
      }
    }
    const yi = Math.min(Math.max(0, period), n - 1)
    const rows = computeYearlyProgressRows(indicator)
    const row = rows[yi]
    const tval = targets![yi].value
    const prog = row?.progress != null ? row.progress : 0
    return {
      currentPct: getProgressPercentage(prog, tval),
      targetPct: 100,
      rawCurrent: prog,
      rawTarget: tval,
      periodLabel: targets![yi].label,
    }
  }

  const progressChartYearOptions = useMemo(() => {
    let maxN = 0
    for (const ind of filteredIndicators) {
      maxN = Math.max(maxN, ind.targetsByYear?.length ?? 0)
    }
    const labels: string[] = []
    for (let j = 0; j < maxN; j++) {
      const src = filteredIndicators.find(
        (ind) => ind.targetsByYear && ind.targetsByYear[j]
      )
      labels.push(src?.targetsByYear![j].label ?? `Year ${j + 1}`)
    }
    return { maxN, labels }
  }, [filteredIndicators])

  useEffect(() => {
    if (progressChartPeriod === "cumulative") return
    const { maxN } = progressChartYearOptions
    if (maxN === 0) {
      setProgressChartPeriod("cumulative")
      return
    }
    if (progressChartPeriod < 0 || progressChartPeriod >= maxN) {
      setProgressChartPeriod(
        Math.max(0, Math.min(progressChartPeriod, maxN - 1))
      )
    }
  }, [progressChartYearOptions, progressChartPeriod])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'output': return 'bg-blue-100 text-blue-800'
      case 'outcome': return 'bg-green-100 text-green-800'
      case 'impact': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const chartData = useMemo(() => {
    return filteredIndicators.map((indicator, index) => {
      const stats = getIndicatorChartPercentages(
        indicator,
        progressChartPeriod
      )
      return {
        name: `Indicator ${index + 1}`,
        fullName: indicator.name,
        current: stats.currentPct,
        target: stats.targetPct,
        progress: stats.currentPct,
        rawCurrent: stats.rawCurrent,
        rawTarget: stats.rawTarget,
        unit: indicator.unit || "",
        periodLabel: stats.periodLabel,
      }
    })
  }, [filteredIndicators, progressChartPeriod])

  const selectedProjectRow = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  const indicatorDerivedStatus = useMemo(() => {
    const map = new Map<string, ProjectIndicator["status"]>()
    const fwDur = resultsFramework?.projectDuration as number | undefined
    for (const ind of filteredIndicators) {
      const proj =
        projects.find((p) => p.id === ind.projectId) ?? selectedProjectRow
      const durForInd =
        selectedProjectId && ind.projectId === selectedProjectId
          ? fwDur
          : undefined
      map.set(
        ind.id,
        computeDerivedIndicatorStatus(
          ind,
          progressChartPeriod,
          proj,
          durForInd
        )
      )
    }
    return map
  }, [
    filteredIndicators,
    progressChartPeriod,
    projects,
    selectedProjectRow,
    selectedProjectId,
    resultsFramework?.projectDuration,
  ])

  const statusTally = useMemo(() => {
    const tallies = {
      "on-track": 0,
      behind: 0,
      ahead: 0,
      completed: 0,
    }
    for (const ind of filteredIndicators) {
      const s = indicatorDerivedStatus.get(ind.id) ?? ind.status
      tallies[s]++
    }
    return tallies
  }, [filteredIndicators, indicatorDerivedStatus])

  const statusPieSlices: StatusPieRow[] = useMemo(() => {
    const order: ProjectIndicator["status"][] = [
      "on-track",
      "behind",
      "ahead",
      "completed",
    ]
    const titles: Record<ProjectIndicator["status"], string> = {
      "on-track": "On track",
      behind: "Behind",
      ahead: "Ahead",
      completed: "Completed",
    }
    return order.map((statusKey) => {
      const items = filteredIndicators
        .filter(
          (ind) =>
            (indicatorDerivedStatus.get(ind.id) ?? ind.status) === statusKey
        )
        .map((ind) => {
          const base = { id: ind.id, name: ind.name }
          if (statusKey !== "completed") return base
          const tt = programmeTotalTarget(ind)
          const cur = parseNumericValue(ind.current)
          const detail =
            tt > 0
              ? `${cur.toLocaleString()} / ${tt.toLocaleString()}${ind.unit ? ` ${ind.unit}` : ""}`
              : undefined
          return { ...base, detail }
        })
      return {
        statusKey,
        name: titles[statusKey],
        value: statusTally[statusKey],
        fill: STATUS_PIE_COLORS[statusKey],
        items,
      }
    })
  }, [filteredIndicators, indicatorDerivedStatus, statusTally])

  const statusPieChartData = useMemo(
    () => statusPieSlices.filter((s) => s.value > 0),
    [statusPieSlices]
  )

  const totalSelectedReportingYearTarget = selectedIndicatorDetails.reduce((sum, indicator) => {
    return sum + getTargetForYearIndex(indicator, bulkUpdateYearIndex).value
  }, 0)

  const bulkYearMaxIndex = (() => {
    if (selectedIndicatorDetails.length === 0) {
      const fromList = filteredIndicators.map((i) =>
        Math.max(0, (i.targetsByYear?.length ?? 1) - 1)
      )
      return Math.max(0, ...fromList, 0)
    }
    return Math.max(
      0,
      ...selectedIndicatorDetails.map((i) =>
        Math.max(0, (i.targetsByYear?.length ?? 1) - 1)
      )
    )
  })()

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
                onClick={openBulkUpdateModal}
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
                {statusTally["on-track"]}
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
                {statusTally.behind}
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
                {statusTally.completed}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section — max height so left legend can’t grow the row unbounded (enables scroll) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch lg:min-h-0">
        {/* Progress Chart */}
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-orange-500 p-6 pb-7 flex flex-col min-h-0 h-full max-h-[calc(100dvh-7.5rem)] sm:max-h-[calc(100dvh-8.5rem)] lg:max-h-[calc(100dvh-9.5rem)] overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 shrink-0">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-orange-100 rounded-lg mr-3 shrink-0">
                <ChartBarIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Indicator progress (% of target)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bars use one scale (0–100%). Orange = attainment; gray = full target for the
                  selected period. Raw values differ by unit.
                </p>
              </div>
            </div>
            {progressChartYearOptions.maxN > 0 ? (
              <label className="flex items-center gap-2 text-sm text-gray-700 shrink-0">
                <span className="font-medium whitespace-nowrap">Period</span>
                <select
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white min-w-[10rem]"
                  value={
                    progressChartPeriod === "cumulative"
                      ? "cumulative"
                      : String(progressChartPeriod)
                  }
                  onChange={(e) => {
                    const v = e.target.value
                    setProgressChartPeriod(
                      v === "cumulative" ? "cumulative" : Number(v)
                    )
                  }}
                >
                  <option value="cumulative">All years (cumulative)</option>
                  {progressChartYearOptions.labels.map((label, idx) => (
                    <option key={idx} value={String(idx)}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          <div className="w-full shrink-0" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={0} textAnchor="middle" />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                width={44}
              />
              <Tooltip 
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    const u = data.unit ? ` ${data.unit}` : ""
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg max-w-xs">
                        <p className="font-semibold text-sm text-gray-900">{data.fullName}</p>
                        <p className="text-[11px] text-gray-500 mt-1">{data.periodLabel}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Attainment: {Number(data.current).toFixed(1)}% of target
                        </p>
                        <p className="text-xs text-gray-600">
                          Target bar: {Number(data.target).toFixed(0)}% (normalized)
                        </p>
                        <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">
                          Raw: {Number(data.rawCurrent).toLocaleString()}
                          {u} / {Number(data.rawTarget).toLocaleString()}
                          {u}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="current" fill="#F97316" name="Attainment %" />
              <Bar dataKey="target" fill="#D1D5DB" name="100% target" />
            </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend: fills remaining card height; inner list scrolls */}
          <div className="mt-4 flex flex-col flex-1 min-h-0 border-t-2 border-orange-200 pt-3 bg-gradient-to-b from-orange-50 to-white p-3 rounded-lg overflow-hidden">
            <h4 className="text-xs font-bold text-orange-600 mb-2 flex items-center shrink-0 bg-gradient-to-b from-orange-50 to-orange-50/95 pb-2 -mt-1 pt-1 border-b border-orange-200/60">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 shrink-0"></span>
              Indicator Legend (by Objective → Outcome)
              <span className="ml-2 font-normal text-orange-600/80 normal-case">
                — scroll
              </span>
            </h4>
            <div
              className="space-y-3 text-xs leading-relaxed flex-1 overflow-y-auto overscroll-y-contain pr-1 touch-pan-y [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-orange-300/90 [&::-webkit-scrollbar-track]:bg-orange-100/50 min-h-[9rem]"
              style={{
                flex: "1 1 0%",
                WebkitOverflowScrolling: "touch",
              }}
            >
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
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-green-500 p-6 pb-7 flex flex-col min-h-0 h-full max-h-[calc(100dvh-7.5rem)] sm:max-h-[calc(100dvh-8.5rem)] lg:max-h-[calc(100dvh-9.5rem)] overflow-x-hidden overflow-y-auto">
          <div className="flex items-start mb-4 shrink-0">
            <div className="p-2 bg-green-100 rounded-lg mr-3 shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Status Distribution</h3>
              <p className="text-xs text-gray-500 mt-1">
                Uses the same <span className="font-medium">Period</span> as the indicator bar chart.
                Compares achievement to expected progress along the project timeline (linear baseline).
              </p>
            </div>
          </div>

          {statusPieChartData.length > 0 ? (
            <div className="w-full flex justify-center shrink-0">
              <div className="relative w-full max-w-[min(100%,320px)] aspect-square rounded-lg bg-gray-50/40 box-border">
                <div className="absolute inset-0 min-h-0 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie
                        data={statusPieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        isAnimationActive={true}
                        innerRadius={0}
                        outerRadius="78%"
                        dataKey="value"
                      >
                      {statusPieChartData.map((entry) => (
                        <Cell
                          key={entry.statusKey}
                          fill={entry.fill}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (!active || !payload?.length) return null
                        const row = payload[0].payload as StatusPieRow
                        const total = filteredIndicators.length || 1
                        const pct = ((row.value / total) * 100).toFixed(1)
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-sm">
                            <p className="font-semibold text-sm text-gray-900">
                              {row.value} {row.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {pct}% of indicators
                            </p>
                            {row.items.length > 0 && (
                              <ul className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-700 max-h-48 overflow-y-auto space-y-2">
                                {row.items.map((item) => (
                                  <li key={item.id}>
                                    <span className="font-medium text-gray-900">
                                      {item.name}
                                    </span>
                                    {item.detail ? (
                                      <div className="text-[11px] text-gray-500 mt-0.5 pl-0">
                                        Achieved vs programme target:{" "}
                                        {item.detail}
                                      </div>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[160px] w-full flex items-center justify-center text-sm text-gray-500 rounded-lg border border-dashed border-gray-200 shrink-0">
              No indicators to chart
            </div>
          )}

          <div className="w-full shrink-0 border-t-2 border-green-200 bg-gradient-to-b from-green-50 to-white rounded-lg px-3 pt-3 pb-3 mt-4">
            <h4 className="text-xs font-bold text-green-600 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shrink-0"></span>
              Status breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
              {statusPieSlices.map((item) => (
                <div
                  key={item.statusKey}
                  className="flex items-center gap-2 w-full min-w-0 bg-white rounded-lg shadow-sm border border-green-100/90 px-3 py-3 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner ring-1 ring-black/5"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="flex flex-col min-w-0 flex-1 leading-tight">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700 capitalize truncate">
                      {item.name}
                    </span>
                    <span className="text-base font-bold text-gray-900 tabular-nums">
                      {item.value}
                    </span>
                  </div>
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
              <p className="text-sm text-gray-600 mt-1">
                Add progress only via <span className="font-semibold text-green-600">Bulk Update</span> (choose the reporting year there). Yearly Progress below shows totals per period where tagged in the audit trail; legacy data appears on the calendar current year until split.
              </p>
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
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[200px]">
                  Yearly Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-36">
                  Cumulative Progress
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
                const progressPercentage = getCumulativeProgressPercentage(indicator)
                
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
                    <td className="px-6 py-4 align-top whitespace-normal">
                      <div className="text-xs space-y-1.5 bg-gray-50 border border-gray-200 rounded-lg p-2 max-w-xs">
                        {computeYearlyProgressRows(indicator).map((row) => {
                          const pct =
                            row.target > 0 && row.progress != null
                              ? Math.min(
                                  (row.progress / row.target) * 100,
                                  100
                                )
                              : null
                          return (
                            <div
                              key={row.label}
                              className="flex flex-col border-b border-gray-100 last:border-0 pb-1.5 last:pb-0"
                            >
                              <div className="flex justify-between gap-2 text-gray-700">
                                <span className="font-medium text-gray-800 shrink-0">
                                  {row.label}
                                </span>
                                <span className="text-right tabular-nums">
                                  {row.progress == null ? (
                                    <span className="text-gray-400">—</span>
                                  ) : (
                                    <>
                                      <span className="font-semibold text-black">
                                        {row.progress}
                                      </span>
                                      <span className="text-gray-500 ml-1">
                                        {indicator.unit}
                                      </span>
                                    </>
                                  )}
                                </span>
                              </div>
                              {row.target > 0 && (
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                  Target {row.target.toLocaleString()}{" "}
                                  {indicator.unit}
                                  {pct != null && row.progress != null
                                    ? ` · ${Math.round(pct)}%`
                                    : ""}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 max-w-xs">
                        Cumulative total:{" "}
                        <span className="font-semibold text-gray-700">
                          {indicator.current} {indicator.unit}
                        </span>
                      </p>
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
                          {progressPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${getStatusColor(
                          indicatorDerivedStatus.get(indicator.id) ??
                            indicator.status
                        )}`}
                      >
                        {(
                          indicatorDerivedStatus.get(indicator.id) ??
                          indicator.status
                        )
                          .replace("-", " ")
                          .toUpperCase()}
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

      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-2xl rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-black">Bulk Update Indicators</h3>
                <button
                  onClick={() => {
                    setShowBulkUpdate(false)
                    setBulkUpdateYearIndex(0)
                  }}
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
                                      const isCalendarCurrent =
                                        indicator.currentYearIndex === index
                                      const isBulkYear = bulkUpdateYearIndex === index
                                      return (
                                        <div
                                          key={label}
                                          className={`flex justify-between rounded px-1 ${
                                            isBulkYear
                                              ? "bg-orange-100 text-orange-900 font-semibold ring-1 ring-orange-300"
                                              : isCalendarCurrent
                                                ? "text-gray-900 font-semibold"
                                                : "text-gray-600"
                                          }`}
                                        >
                                          <span>
                                            {label}
                                            {isBulkYear ? " · updating" : ""}
                                          </span>
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

                        <div className="mt-3 mb-3">
                          <label
                            htmlFor="bulk-reporting-year"
                            className="block text-sm font-semibold text-blue-900 mb-1"
                          >
                            Reporting year for this update
                          </label>
                          <p className="text-xs text-blue-800/90 mb-2">
                            Defaults to the current project year from start dates. Choose another year
                            to backfill or correct data for older periods.
                          </p>
                          <select
                            id="bulk-reporting-year"
                            value={bulkUpdateYearIndex}
                            onChange={(e) =>
                              setBulkUpdateYearIndex(Number(e.target.value))
                            }
                            className="w-full max-w-md px-3 py-2 border border-blue-200 rounded-md text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            {Array.from({ length: bulkYearMaxIndex + 1 }, (_, i) => {
                              const src =
                                selectedIndicatorDetails.find(
                                  (ind) => ind.targetsByYear?.[i]
                                ) ??
                                filteredIndicators.find(
                                  (ind) => ind.targetsByYear?.[i]
                                )
                              const lab =
                                src?.targetsByYear?.[i]?.label ??
                                `Period ${i + 1}`
                              return (
                                <option key={i} value={i}>
                                  {lab}
                                </option>
                              )
                            })}
                          </select>
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-blue-900">
                          <div className="bg-white border border-blue-200 rounded-md p-3 shadow-sm">
                            <div className="font-semibold text-blue-900">
                              Target total (selected year)
                            </div>
                            <div className="text-base font-bold">
                              {totalSelectedReportingYearTarget.toLocaleString()}{" "}
                              {bulkUnitsLabel}
                            </div>
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
                                  <div>
                                    Selected year target (
                                    {getTargetForYearIndex(indicator, bulkUpdateYearIndex).label}):{" "}
                                    <span className="font-medium text-gray-900">
                                      {getTargetForYearIndex(indicator, bulkUpdateYearIndex).value}{" "}
                                      {indicator.unit}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-gray-500">
                                    Calendar current year (
                                    {indicator.currentYearLabel || "—"}):{" "}
                                    <span className="font-medium text-gray-800">
                                      {indicator.target} {indicator.unit}
                                    </span>
                                  </div>
                                  {typeof indicator.totalTarget === 'number' && indicator.totalTarget > indicator.target && (
                                    <div>Total Across Years: <span className="font-medium text-gray-900">{indicator.totalTarget} {indicator.unit}</span></div>
                                  )}
                                </div>
                                {indicator.targetsByYear && indicator.targetsByYear.length > 0 && (
                                  <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-3">
                                    <div className="font-semibold text-gray-800 mb-1">Yearly Breakdown</div>
                                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                      {indicator.targetsByYear.map(({ label, value }, index) => {
                                        const isCalendarCurrent = indicator.currentYearIndex === index
                                        const isBulkYear = bulkUpdateYearIndex === index
                                        return (
                                          <div
                                            key={label}
                                            className={`flex justify-between rounded px-1 ${
                                              isBulkYear
                                                ? "bg-orange-100 text-orange-900 font-semibold"
                                                : isCalendarCurrent
                                                  ? "text-gray-900 font-semibold"
                                                  : ""
                                            }`}
                                          >
                                            <span>{label}{isBulkYear ? " · updating" : ""}</span>
                                            <span className="font-medium">{value} {indicator.unit}</span>
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
                    onClick={() => {
                      setShowBulkUpdate(false)
                      setBulkUpdateYearIndex(0)
                    }}
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
