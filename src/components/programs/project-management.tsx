"use client"

import { useState, useEffect } from "react"
import { 
  ViewColumnsIcon, 
  Squares2X2Icon, 
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PlusIcon,
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
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  // Projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "proj-1",
      name: "SAYWHAT Digital Platform",
      description: "Comprehensive digital transformation initiative for SAYWHAT organization",
      status: "active",
      priority: "high",
      progress: 68,
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      budget: 500000,
      spent: 340000,
      manager: {
        id: "mgr-1",
        name: "John Doe",
        avatar: "/avatars/john.jpg"
      },
      team: [
        { id: "tm-1", name: "Alice Smith", avatar: "/avatars/alice.jpg" },
        { id: "tm-2", name: "Bob Johnson", avatar: "/avatars/bob.jpg" },
        { id: "tm-3", name: "Carol Williams", avatar: "/avatars/carol.jpg" }
      ],
      health: "healthy",
      tags: ["digital-transformation", "high-priority", "strategic"],
      lastActivity: "2024-01-20T10:30:00Z",
      milestones: { total: 8, completed: 5 },
      tasks: { total: 45, completed: 31 },
      client: "SAYWHAT Organization",
      department: "IT",
      location: "Lagos, Nigeria"
    },
    {
      id: "proj-2",
      name: "Community Outreach Program",
      description: "Expanding community engagement and support programs across multiple regions",
      status: "planning",
      priority: "medium",
      progress: 15,
      startDate: "2024-02-01",
      endDate: "2024-11-30",
      budget: 250000,
      spent: 37500,
      manager: {
        id: "mgr-2",
        name: "Jane Wilson",
        avatar: "/avatars/jane.jpg"
      },
      team: [
        { id: "tm-4", name: "David Brown", avatar: "/avatars/david.jpg" },
        { id: "tm-5", name: "Eva Davis", avatar: "/avatars/eva.jpg" }
      ],
      health: "at-risk",
      tags: ["community", "outreach", "social-impact"],
      lastActivity: "2024-01-19T14:15:00Z",
      milestones: { total: 6, completed: 1 },
      tasks: { total: 28, completed: 4 },
      client: "Community Partners",
      department: "Community Relations",
      location: "Multi-location"
    },
    {
      id: "proj-3",
      name: "Infrastructure Modernization",
      description: "Upgrading core infrastructure and technology systems",
      status: "on-hold",
      priority: "critical",
      progress: 42,
      startDate: "2023-10-01",
      endDate: "2024-06-30",
      budget: 750000,
      spent: 315000,
      manager: {
        id: "mgr-3",
        name: "Michael Chen",
        avatar: "/avatars/michael.jpg"
      },
      team: [
        { id: "tm-6", name: "Sarah Lee", avatar: "/avatars/sarah.jpg" },
        { id: "tm-7", name: "Tom Anderson", avatar: "/avatars/tom.jpg" },
        { id: "tm-8", name: "Lisa Garcia", avatar: "/avatars/lisa.jpg" }
      ],
      health: "critical",
      tags: ["infrastructure", "modernization", "critical"],
      lastActivity: "2024-01-18T09:45:00Z",
      milestones: { total: 10, completed: 4 },
      tasks: { total: 67, completed: 28 },
      client: "Internal",
      department: "Infrastructure",
      location: "Abuja, Nigeria"
    }
  ])

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

  useEffect(() => {
    setMounted(true)
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      // API call to load projects
      // const response = await fetch('/api/projects')
      // const data = await response.json()
      // setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleCreateProject = () => {
    // Navigate to create project page or open modal
    console.log('Create new project')
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
        {permissions?.canCreate && (
          <button
            onClick={handleCreateProject}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Project</span>
          </button>
        )}
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 border rounded-md ${
              showFilters 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
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
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
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
