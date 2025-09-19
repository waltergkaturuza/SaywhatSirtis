import React, { useState, useMemo } from "react"
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon
} from "@heroicons/react/24/outline"
import { Project } from "../project-management"

interface TimelineViewProps {
  projects: Project[]
  onProjectSelect: (projectId: string) => void
  permissions: any
  isLoading: boolean
}

const TimelineView: React.FC<TimelineViewProps> = ({
  projects,
  onProjectSelect,
  permissions,
  isLoading
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'quarter' | 'year'>('month')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Calculate timeline range based on view mode
  const timelineRange = useMemo(() => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    switch (viewMode) {
      case 'month':
        start.setDate(1)
        end.setMonth(end.getMonth() + 1, 0)
        break
      case 'quarter':
        const quarter = Math.floor(start.getMonth() / 3)
        start.setMonth(quarter * 3, 1)
        end.setMonth((quarter + 1) * 3, 0)
        break
      case 'year':
        start.setMonth(0, 1)
        end.setMonth(11, 31)
        break
    }

    return { start, end }
  }, [currentDate, viewMode])

  // Generate timeline columns
  const timelineColumns = useMemo(() => {
    const columns = []
    const current = new Date(timelineRange.start)
    
    while (current <= timelineRange.end) {
      columns.push(new Date(current))
      
      switch (viewMode) {
        case 'month':
          current.setDate(current.getDate() + 1)
          break
        case 'quarter':
          current.setDate(current.getDate() + 7) // Weekly columns
          break
        case 'year':
          current.setMonth(current.getMonth() + 1)
          break
      }
    }
    
    return columns
  }, [timelineRange, viewMode])

  // Filter projects that are visible in current timeline
  const visibleProjects = useMemo(() => {
    return projects.filter(project => {
      const startDate = new Date(project.startDate)
      const endDate = new Date(project.endDate)
      return startDate <= timelineRange.end && endDate >= timelineRange.start
    })
  }, [projects, timelineRange])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400'
      case 'planning': return 'bg-blue-400'
      case 'on-hold': return 'bg-yellow-400'
      case 'completed': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount)
  }

  const formatDate = (date: Date, mode: string) => {
    switch (mode) {
      case 'month':
        return date.getDate().toString()
      case 'quarter':
        return `${date.getDate()}/${date.getMonth() + 1}`
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short' })
      default:
        return date.toLocaleDateString()
    }
  }

  const calculateProjectPosition = (project: Project) => {
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    
    // Calculate start and end positions as percentages
    const totalDuration = timelineRange.end.getTime() - timelineRange.start.getTime()
    
    const startOffset = Math.max(0, startDate.getTime() - timelineRange.start.getTime())
    const endOffset = Math.min(totalDuration, endDate.getTime() - timelineRange.start.getTime())
    
    const left = (startOffset / totalDuration) * 100
    const width = ((endOffset - startOffset) / totalDuration) * 100
    
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` }
  }

  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3))
        break
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1))
        break
    }
    
    setCurrentDate(newDate)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Timeline View</h3>
          
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'quarter', 'year'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm font-medium rounded-md capitalize ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateTimeline('prev')}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <span className="font-medium text-gray-900 min-w-32 text-center">
              {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {viewMode === 'quarter' && `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`}
              {viewMode === 'year' && currentDate.getFullYear()}
            </span>
            
            <button
              onClick={() => navigateTimeline('next')}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Today
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Timeline Header Row */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {/* Project Info Column */}
            <div className="w-80 p-4 border-r border-gray-200">
              <span className="text-sm font-medium text-gray-900">Project</span>
            </div>
            
            {/* Timeline Columns */}
            <div className="flex-1 overflow-x-auto">
              <div className="grid gap-px bg-gray-200" style={{ gridTemplateColumns: `repeat(${timelineColumns.length}, minmax(40px, 1fr))` }}>
                {timelineColumns.map((date, index) => (
                  <div key={index} className="bg-gray-50 p-2 text-center">
                    <span className="text-xs text-gray-600">
                      {formatDate(date, viewMode)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Project Rows */}
        <div className="divide-y divide-gray-200">
          {visibleProjects.map((project) => {
            const position = calculateProjectPosition(project)
            
            return (
              <div key={project.id} className="flex hover:bg-gray-50">
                {/* Project Info */}
                <div className="w-80 p-4 border-r border-gray-200">
                  <div className="flex items-center space-x-3">
                    {/* Priority Indicator */}
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`}></div>
                    
                    {/* Project Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <UserIcon className="h-3 w-3" />
                          <span>{project.manager.name.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <CurrencyDollarIcon className="h-3 w-3" />
                          <span>{formatCurrency(project.budget)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onProjectSelect(project.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {permissions?.canEdit && (
                        <button
                          onClick={() => {
                            // Handle edit
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Timeline Bar */}
                <div className="flex-1 relative p-4">
                  <div className="relative h-8">
                    <div
                      className={`absolute top-1 h-6 rounded ${getStatusColor(project.status)} opacity-80 hover:opacity-100 cursor-pointer transition-opacity`}
                      style={{
                        left: position.left,
                        width: position.width
                      }}
                      onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                    >
                      {/* Progress indicator */}
                      <div
                        className="h-full bg-black bg-opacity-20 rounded"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                      
                      {/* Project name on bar (if wide enough) */}
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-xs text-white font-medium truncate">
                          {project.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Milestones */}
                    {project.milestones && (
                      <div className="absolute top-0 left-0 right-0 h-8">
                        {/* Sample milestone markers - you'd calculate actual positions */}
                        <div className="absolute top-0 h-8 w-1 bg-red-500" style={{ left: '25%' }}>
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                            Milestone 1
                          </div>
                        </div>
                        <div className="absolute top-0 h-8 w-1 bg-red-500" style={{ left: '75%' }}>
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                            Milestone 2
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {visibleProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CalendarIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects in this timeframe</h3>
            <p className="text-gray-500">
              Try adjusting the timeline view or date range to see projects.
            </p>
          </div>
        )}
      </div>

      {/* Project Details Panel */}
      {selectedProject && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          {(() => {
            const project = projects.find(p => p.id === selectedProject)
            if (!project) return null
            
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="font-medium capitalize">{project.status}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Progress:</span>
                    <div className="font-medium">{project.progress}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget:</span>
                    <div className="font-medium">{formatCurrency(project.budget)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Manager:</span>
                    <div className="font-medium">{project.manager.name}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Timeline:</span>
                  <div className="text-sm">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-gray-700">Priority</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-gray-700">Status</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 rounded bg-green-400"></div>
                <span>Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 rounded bg-blue-400"></div>
                <span>Planning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 rounded bg-yellow-400"></div>
                <span>On Hold</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 rounded bg-gray-400"></div>
                <span>Completed</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-gray-700">Progress</div>
            <div className="text-xs text-gray-600">
              Dark overlay on project bars shows completion percentage
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-gray-700">Milestones</div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-4 bg-red-500"></div>
              <span className="text-xs">Key milestones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineView
