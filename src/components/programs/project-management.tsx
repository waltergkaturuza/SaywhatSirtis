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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Management</h2>
          <p className="text-sm text-gray-600">
            Manage and track all your projects with advanced filtering and multiple view modes
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        {/* Left side - Search and Filters */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters((prev: ProjectFilters) => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 w-64"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 border rounded-md transition-colors ${
              showFilters 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
            {Object.values(filters).some(filter => 
              Array.isArray(filter) ? filter.length > 0 : 
              typeof filter === 'string' ? filter !== '' :
              typeof filter === 'object' && filter !== null ? 
                Object.values(filter).some(v => v !== '' && v !== 0) : false
            ) && (
              <span className="bg-orange-600 text-white text-xs rounded-full px-2 py-1">
                Active
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <ArrowsUpDownIcon className="h-4 w-4" />
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
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {viewModes.map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as ViewMode)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{mode.name}</span>
                </button>
              )
            })}
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
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {filteredAndSortedProjects.length} of {projects.length} projects
        </div>
        <div className="flex items-center space-x-4">
          <span>Active: {projects.filter(p => p.status === 'active').length}</span>
          <span>Planning: {projects.filter(p => p.status === 'planning').length}</span>
          <span>On Hold: {projects.filter(p => p.status === 'on-hold').length}</span>
          <span>Completed: {projects.filter(p => p.status === 'completed').length}</span>
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
