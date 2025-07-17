"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  ClipboardDocumentListIcon, 
  FunnelIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  ShareIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  FlagIcon
} from "@heroicons/react/24/outline"

interface ProjectTableProps {
  permissions: any
  viewMode: 'list' | 'kanban' | 'timeline'
  onProjectSelect: (projectId: number | null) => void
  selectedProject: number | null
}

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on-hold' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  startDate: string
  endDate: string
  budget: number
  spent: number
  manager: {
    id: string
    name: string
    avatar: string
  }
  team: Array<{
    id: string
    name: string
    avatar: string
  }>
  health: 'healthy' | 'at-risk' | 'critical'
  tags: string[]
  client?: string
  department?: string
  location?: string
  tasksTotal: number
  tasksCompleted: number
  milestonesTotal: number
  milestonesCompleted: number
}

type SortField = keyof Project | 'budget_remaining' | 'progress_score'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

interface Filters {
  search: string
  status: string[]
  priority: string[]
  health: string[]
  manager: string[]
  department: string[]
  tags: string[]
  showOverdue: boolean
  showUpcoming: boolean
}

export function ProjectTable({ permissions, viewMode, onProjectSelect, selectedProject }: ProjectTableProps) {
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' })
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: [],
    priority: [],
    health: [],
    manager: [],
    department: [],
    tags: [],
    showOverdue: false,
    showUpcoming: false
  })
  const [showFilters, setShowFilters] = useState(false)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  // Mock project data
  useEffect(() => {
    setMounted(true)
    setProjects([
      {
        id: "proj-1",
        name: "SAYWHAT Digital Platform",
        description: "Comprehensive digital transformation initiative",
        status: "active",
        priority: "high",
        progress: 68,
        startDate: "2024-01-15",
        endDate: "2024-12-31",
        budget: 500000,
        spent: 340000,
        manager: { id: "mgr-1", name: "John Doe", avatar: "/avatars/john.jpg" },
        team: [
          { id: "tm-1", name: "Alice Smith", avatar: "/avatars/alice.jpg" },
          { id: "tm-2", name: "Bob Johnson", avatar: "/avatars/bob.jpg" }
        ],
        health: "healthy",
        tags: ["digital-transformation", "strategic"],
        client: "SAYWHAT Organization",
        department: "IT",
        location: "Lagos, Nigeria",
        tasksTotal: 45,
        tasksCompleted: 31,
        milestonesTotal: 8,
        milestonesCompleted: 5
      },
      {
        id: "proj-2", 
        name: "Community Outreach Program",
        description: "Expanding community engagement programs",
        status: "planning",
        priority: "medium",
        progress: 15,
        startDate: "2024-02-01",
        endDate: "2024-11-30",
        budget: 250000,
        spent: 37500,
        manager: { id: "mgr-2", name: "Jane Smith", avatar: "/avatars/jane.jpg" },
        team: [
          { id: "tm-3", name: "Carol Williams", avatar: "/avatars/carol.jpg" },
          { id: "tm-4", name: "David Brown", avatar: "/avatars/david.jpg" }
        ],
        health: "at-risk",
        tags: ["community", "outreach"],
        client: "External NGO",
        department: "Programs",
        location: "Multiple",
        tasksTotal: 32,
        tasksCompleted: 5,
        milestonesTotal: 6,
        milestonesCompleted: 1
      },
      {
        id: "proj-3",
        name: "Infrastructure Modernization",
        description: "Upgrading core infrastructure systems",
        status: "on-hold",
        priority: "critical",
        progress: 42,
        startDate: "2024-01-01",
        endDate: "2024-08-31",
        budget: 750000,
        spent: 315000,
        manager: { id: "mgr-3", name: "Michael Chen", avatar: "/avatars/michael.jpg" },
        team: [
          { id: "tm-5", name: "Sarah Lee", avatar: "/avatars/sarah.jpg" },
          { id: "tm-6", name: "Tom Anderson", avatar: "/avatars/tom.jpg" }
        ],
        health: "critical",
        tags: ["infrastructure", "modernization"],
        client: "Internal",
        department: "Infrastructure",
        location: "Abuja, Nigeria",
        tasksTotal: 67,
        tasksCompleted: 28,
        milestonesTotal: 10,
        milestonesCompleted: 4
      }
    ])
  }, [])

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!project.name.toLowerCase().includes(searchLower) &&
            !project.description.toLowerCase().includes(searchLower) &&
            !project.manager.name.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(project.status)) {
        return false
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(project.priority)) {
        return false
      }

      // Health filter
      if (filters.health.length > 0 && !filters.health.includes(project.health)) {
        return false
      }

      // Manager filter
      if (filters.manager.length > 0 && !filters.manager.includes(project.manager.name)) {
        return false
      }

      // Department filter
      if (filters.department.length > 0 && project.department && !filters.department.includes(project.department)) {
        return false
      }

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => project.tags.includes(tag))) {
        return false
      }

      // Overdue filter
      if (filters.showOverdue) {
        const endDate = new Date(project.endDate)
        const now = new Date()
        if (endDate >= now) {
          return false
        }
      }

      // Upcoming deadlines filter
      if (filters.showUpcoming) {
        const endDate = new Date(project.endDate)
        const now = new Date()
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        if (endDate < now || endDate > weekFromNow) {
          return false
        }
      }

      return true
    })

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.field) {
        case 'budget_remaining':
          aValue = a.budget - a.spent
          bValue = b.budget - b.spent
          break
        case 'progress_score':
          aValue = a.progress
          bValue = b.progress
          break
        default:
          aValue = a[sortConfig.field as keyof Project]
          bValue = b[sortConfig.field as keyof Project]
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [projects, filters, sortConfig])

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const handleSelectAll = () => {
    setSelectedProjects(prev => 
      prev.length === filteredAndSortedProjects.length 
        ? [] 
        : filteredAndSortedProjects.map(p => p.id)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return '🟢'
      case 'at-risk': return '🟡'
      case 'critical': return '🔴'
      default: return '⚫'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!mounted) {
    return <div className="p-6">Loading projects...</div>
  }

  if (!mounted) {
    return <div className="p-6">Loading projects...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Enhanced Project Table</h2>
            <p className="text-gray-600">Advanced project management with filtering and bulk operations</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            {filteredAndSortedProjects.length} of {projects.length} projects
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 border rounded-md text-sm ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search projects..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                multiple
                value={filters.status}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: Array.from(e.target.selectedOptions, option => option.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                multiple
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priority: Array.from(e.target.selectedOptions, option => option.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Health Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Health</label>
              <select
                multiple
                value={filters.health}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  health: Array.from(e.target.selectedOptions, option => option.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="healthy">Healthy</option>
                <option value="at-risk">At Risk</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick Filters</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showOverdue}
                    onChange={(e) => setFilters(prev => ({ ...prev, showOverdue: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Overdue</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showUpcoming}
                    onChange={(e) => setFilters(prev => ({ ...prev, showUpcoming: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Due Soon</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                search: '',
                status: [],
                priority: [],
                health: [],
                manager: [],
                department: [],
                tags: [],
                showOverdue: false,
                showUpcoming: false
              })}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProjects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900">
                {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''} selected
              </span>
              
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  Change Status
                </button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  Assign Manager
                </button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  Export
                </button>
                {permissions?.canDelete && (
                  <button className="px-3 py-1 bg-white border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50">
                    Delete
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setSelectedProjects([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Project Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProjects.length === filteredAndSortedProjects.length && filteredAndSortedProjects.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                
                {/* Sortable Headers */}
                {[
                  { field: 'name' as SortField, label: 'Project Name' },
                  { field: 'status' as SortField, label: 'Status' },
                  { field: 'priority' as SortField, label: 'Priority' },
                  { field: 'progress' as SortField, label: 'Progress' },
                  { field: 'startDate' as SortField, label: 'Start Date' },
                  { field: 'endDate' as SortField, label: 'End Date' },
                  { field: 'budget' as SortField, label: 'Budget' },
                  { field: 'budget_remaining' as SortField, label: 'Remaining' }
                ].map(({ field, label }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      {sortConfig.field === field && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                ))}
                
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-48">{project.description}</div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className={`text-sm font-medium capitalize ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{project.progress}%</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {formatDate(project.startDate)}
                  </td>
                  
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {formatDate(project.endDate)}
                  </td>
                  
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {formatCurrency(project.budget)}
                  </td>
                  
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {formatCurrency(project.budget - project.spent)}
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{getHealthIcon(project.health)}</span>
                      <span className="text-sm text-gray-600 capitalize">{project.health}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {project.manager.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{project.manager.name}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onProjectSelect(parseInt(project.id.split('-')[1]))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {permissions?.canEdit && (
                        <button className="text-gray-600 hover:text-gray-800">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === project.id ? null : project.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <EllipsisHorizontalIcon className="h-4 w-4" />
                        </button>
                        
                        {actionMenuOpen === project.id && (
                          <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                              <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                                Duplicate Project
                              </button>
                              <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                                Archive Project
                              </button>
                              <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                <ShareIcon className="h-4 w-4 mr-2" />
                                Export Data
                              </button>
                              {permissions?.canDelete && (
                                <button className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left">
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Delete Project
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filteredAndSortedProjects.length === 0 && (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status.length > 0 || filters.priority.length > 0
                ? 'Try adjusting your filters to see more projects.'
                : 'Get started by creating a new project.'}
            </p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <FlagIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <PauseIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">On Hold</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projects.filter(p => p.status === 'on-hold').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-indigo-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
