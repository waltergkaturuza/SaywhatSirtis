"use client"

import { useState, useEffect } from "react"
import { 
  ViewColumnsIcon, 
  Squares2X2Icon, 
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline"
import ListView from "./project-management/ListView"
import KanbanView from "./project-management/KanbanView"
import TimelineView from "./project-management/TimelineView"
import ProjectFilters from "./project-management/ProjectFilters"
import BulkActions from "./project-management/BulkActions"

interface ProjectManagementProps {
  permissions: any
  selectedProject: string | null
  onProjectSelect: (projectId: string | null) => void
}

export type ViewMode = 'list' | 'kanban' | 'timeline'

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  startDate: string
  endDate: string
  budget: number
  spent: number
  manager: {
    id: string
    name: string
    avatar?: string
  }
  team: {
    id: string
    name: string
    avatar?: string
  }[]
  health: 'healthy' | 'at-risk' | 'critical'
  tags: string[]
  lastActivity: string
  milestones: {
    total: number
    completed: number
  }
  tasks: {
    total: number
    completed: number
  }
  client?: string
  department?: string
  location?: string
}

export interface ProjectFilters {
  search: string
  status: ProjectStatus[]
  priority: ProjectPriority[]
  manager: string[]
  department: string[]
  dateRange: {
    start?: string
    end?: string
  }
  budgetRange: {
    min?: number
    max?: number
  }
  progressRange: {
    min?: number
    max?: number
  }
  health: string[]
  tags: string[]
  showOverdue: boolean
  showUpcoming: boolean
}

export interface SortConfig {
  field: keyof Project | 'budget_remaining' | 'progress_score'
  direction: 'asc' | 'desc'
}

export function ProjectManagement({ permissions, selectedProject, onProjectSelect }: ProjectManagementProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  // Projects data - now fetched from backend
  const [projects, setProjects] = useState<Project[]>([])

  // Fetch projects from the backend
  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/programs/projects')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch projects')
      }
      
      if (result.success) {
        // Transform API data to match component interface
        const transformedProjects = result.data.map((project: any) => ({
          id: project.id.toString(),
          name: project.name,
          description: project.description || '',
          status: mapStatus(project.status),
          priority: (project.priority || 'MEDIUM').toString().toLowerCase(),
          progress: calculateProgress(project),
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
          budget: project.budget || 0,
          spent: project.actualSpent || 0,
          manager: {
            id: project.users_projects_managerIdTousers?.id || 'unassigned',
            name: project.users_projects_managerIdTousers ? `${project.users_projects_managerIdTousers.firstName || ''} ${project.users_projects_managerIdTousers.lastName || ''}`.trim() || 'Unassigned' : 'Unassigned',
            avatar: undefined
          },
          team: [], // You may want to add team members to the schema
          health: calculateHealth(project),
          tags: [], // You may want to add tags to the schema
          lastActivity: project.updatedAt ? new Date(project.updatedAt).toISOString() : new Date().toISOString(),
          milestones: { total: project._count?.activities || 0, completed: 0 },
          tasks: { total: project._count?.activities || 0, completed: 0 },
          client: 'SAYWHAT', // Default client
          department: 'Programs', // Default department
          location: `${project.province || ''}, ${project.country || ''}`.trim().replace(/^,\s*/, '')
        }))
        
        setProjects(transformedProjects)
      } else {
        throw new Error(result.error || 'Failed to load projects')
      }
    } catch (error) {
      console.error('Projects fetch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to map database status to component status
  const mapStatus = (dbStatus: string): ProjectStatus => {
    switch (dbStatus?.toUpperCase()) {
      case 'ACTIVE': return 'active'
      case 'PLANNING': return 'planning'
      case 'ON_HOLD': return 'on-hold'
      case 'COMPLETED': return 'completed'
      case 'CANCELLED': return 'cancelled'
      default: return 'planning'
    }
  }

  // Helper function to calculate progress based on time elapsed
  const calculateProgress = (project: any) => {
    if (!project.startDate || !project.endDate) return 0
    
    const start = new Date(project.startDate).getTime()
    const end = new Date(project.endDate).getTime()
    const now = new Date().getTime()
    
    if (now < start) return 0
    if (now > end) return 100
    
    const elapsed = now - start
    const total = end - start
    
    return Math.round((elapsed / total) * 100)
  }

  // Helper function to calculate project health
  const calculateHealth = (project: any): 'healthy' | 'at-risk' | 'critical' => {
    const progress = calculateProgress(project)
    const budgetUtilization = project.budget > 0 ? (project.actualSpent / project.budget) * 100 : 0
    
    if (project.status === 'ON_HOLD' || budgetUtilization > 90) return 'critical'
    if (progress < 50 && budgetUtilization > 70) return 'at-risk'
    return 'healthy'
  }

  useEffect(() => {
    setMounted(true)
    fetchProjects()
  }, [])

  // Filters and sorting
  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    status: [],
    priority: [],
    manager: [],
    department: [],
    dateRange: { start: undefined, end: undefined },
    budgetRange: { min: undefined, max: undefined },
    progressRange: { min: undefined, max: undefined },
    health: [],
    tags: [],
    showOverdue: false,
    showUpcoming: false
  })

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc'
  })

  // View modes configuration
  const viewModes = [
    { id: 'list', name: 'List', icon: ViewColumnsIcon },
    { id: 'kanban', name: 'Kanban', icon: Squares2X2Icon },
    { id: 'timeline', name: 'Timeline', icon: CalendarIcon }
  ]

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = 
          project.name.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          project.manager.name.toLowerCase().includes(searchTerm) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(project.status)) {
        return false
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(project.priority)) {
        return false
      }

      // Manager filter
      if (filters.manager.length > 0 && !filters.manager.includes(project.manager.id)) {
        return false
      }

      // Department filter
      if (filters.department.length > 0 && project.department && !filters.department.includes(project.department)) {
        return false
      }

      // Health filter
      if (filters.health.length > 0 && !filters.health.includes(project.health)) {
        return false
      }

      // Date range filter
      if (filters.dateRange.start && project.startDate < filters.dateRange.start) {
        return false
      }
      if (filters.dateRange.end && project.endDate > filters.dateRange.end) {
        return false
      }

      // Budget range filter
      if (filters.budgetRange.min !== undefined || filters.budgetRange.max !== undefined) {
        if (
          (filters.budgetRange.min !== undefined && project.budget < filters.budgetRange.min) ||
          (filters.budgetRange.max !== undefined && project.budget > filters.budgetRange.max)
        ) {
          return false
        }
      }

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some((tag: string) => project.tags.includes(tag))) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      let aValue: any = a[sortConfig.field as keyof Project]
      let bValue: any = b[sortConfig.field as keyof Project]

      // Handle special computed fields
      if (sortConfig.field === 'budget_remaining') {
        aValue = a.budget - a.spent
        bValue = b.budget - b.spent
      } else if (sortConfig.field === 'progress_score') {
        aValue = a.progress
        bValue = b.progress
      }

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue
      }

      // Default string comparison
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })

  // Handlers
  const handleProjectSelect = (projectId: string) => {
    onProjectSelect(projectId)
  }

  const handleBulkSelect = (projectIds: string[]) => {
    setSelectedProjects(projectIds)
  }

  const handleBulkAction = async (action: string, projectIds: string[]) => {
    setIsLoading(true)
    try {
      // Handle bulk actions
      switch (action) {
        case 'delete':
          setProjects(prev => prev.filter(p => !projectIds.includes(p.id)))
          break
        case 'archive':
          setProjects(prev => prev.map(p => 
            projectIds.includes(p.id) ? { ...p, status: 'completed' as ProjectStatus } : p
          ))
          break
        case 'export':
          // Export functionality
          break
      }
      setSelectedProjects([])
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: keyof Project | 'budget_remaining' | 'progress_score') => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Projects</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
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
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <ViewColumnsIcon className="h-8 w-8 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-white">Project Management</h2>
            <p className="text-orange-100">
              Manage and track all your projects with advanced filtering and multiple view modes
            </p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-md border-l-4 border-orange-500 p-5">
        <div className="flex items-center justify-between">
          {/* Left side - Search and Filters */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" />
              <input
                type="text"
                placeholder="🔍 Search projects..."
                value={filters.search}
                onChange={(e) => setFilters((prev: ProjectFilters) => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-72 font-medium hover:border-orange-400 transition-colors shadow-sm"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2.5 border-2 rounded-lg font-medium transition-all shadow-sm ${
                showFilters 
                  ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 shadow-md' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
              {Object.values(filters).some(filter => 
                Array.isArray(filter) ? filter.length > 0 : 
                typeof filter === 'string' ? filter !== '' :
                typeof filter === 'object' && filter !== null ? 
                  Object.values(filter).some(v => v !== '' && v !== 0) : false
              ) && (
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-md">
                  Active
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <button className="flex items-center space-x-2 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50 shadow-sm transition-all">
                <ArrowsUpDownIcon className="h-5 w-5" />
                <span>Sort</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

        {/* Right side - View modes and bulk actions */}
        <div className="flex items-center space-x-4">
          {/* Bulk Actions */}
          {selectedProjects.length > 0 && (
            <BulkActions
              selectedProjects={selectedProjects}
              onAction={(action: string) => handleBulkAction(action, selectedProjects)}
              onClear={() => setSelectedProjects([])}
              permissions={permissions}
            />
          )}

          {/* View Mode Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-inner">
            {viewModes.map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as ViewMode)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all transform ${
                    viewMode === mode.id
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-white hover:text-orange-600 hover:shadow-sm'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{mode.name}</span>
                </button>
              )
            })}
          </div>
        </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <ProjectFilters
          filters={filters}
          onFiltersChange={setFilters}
          projects={projects}
          isOpen={showFilters}
          onToggle={() => setShowFilters(false)}
        />
      )}

      {/* Project Count and Status */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-800">
          📊 Showing <span className="text-orange-600 font-bold">{filteredAndSortedProjects.length}</span> of <span className="font-bold">{projects.length}</span> projects
        </div>
        <div className="flex items-center space-x-4 text-sm font-medium">
          <span className="flex items-center bg-green-100 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Active: <span className="ml-1 font-bold text-green-700">{projects.filter(p => p.status === 'active').length}</span>
          </span>
          <span className="flex items-center bg-blue-100 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Planning: <span className="ml-1 font-bold text-blue-700">{projects.filter(p => p.status === 'planning').length}</span>
          </span>
          <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
            On Hold: <span className="ml-1 font-bold text-gray-700">{projects.filter(p => p.status === 'on-hold').length}</span>
          </span>
          <span className="flex items-center bg-green-100 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
            Completed: <span className="ml-1 font-bold text-green-700">{projects.filter(p => p.status === 'completed').length}</span>
          </span>
        </div>
      </div>

      {/* Main Content - Different Views */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {viewMode === 'list' && (
          <ListView
            projects={filteredAndSortedProjects}
            selectedProjects={selectedProjects}
            onProjectSelect={handleProjectSelect}
            onBulkSelect={handleBulkSelect}
            onSort={handleSort}
            sortConfig={sortConfig}
            permissions={permissions}
            isLoading={isLoading}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanView
            projects={filteredAndSortedProjects}
            onProjectSelect={handleProjectSelect}
            permissions={permissions}
            isLoading={isLoading}
          />
        )}

        {viewMode === 'timeline' && (
          <TimelineView
            projects={filteredAndSortedProjects}
            onProjectSelect={handleProjectSelect}
            permissions={permissions}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

export default ProjectManagement
