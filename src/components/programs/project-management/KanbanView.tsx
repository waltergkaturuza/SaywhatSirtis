import React, { useState } from "react"
import { 
  PlusIcon, 
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline"
import { Project } from "../project-management"

interface KanbanViewProps {
  projects: Project[]
  onProjectSelect: (projectId: string) => void
  permissions: any
  isLoading: boolean
}

const KanbanView: React.FC<KanbanViewProps> = ({
  projects,
  onProjectSelect,
  permissions,
  isLoading
}) => {
  const [draggedProject, setDraggedProject] = useState<string | null>(null)

  // Group projects by status
  const statusColumns = [
    { id: 'planning', name: 'Planning', color: 'bg-blue-100 border-blue-200' },
    { id: 'active', name: 'Active', color: 'bg-green-100 border-green-200' },
    { id: 'on-hold', name: 'On Hold', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'completed', name: 'Completed', color: 'bg-gray-100 border-gray-200' }
  ]

  const projectsByStatus = statusColumns.reduce((acc, status) => {
    acc[status.id] = projects.filter(project => project.status === status.id)
    return acc
  }, {} as Record<string, Project[]>)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500'
      case 'high': return 'border-l-orange-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600'
      case 'at-risk': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedProject && permissions?.canEdit) {
      // Handle status change
      console.log(`Moving project ${draggedProject} to ${newStatus}`)
      setDraggedProject(null)
    }
  }

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <div
      draggable={permissions?.canEdit}
      onDragStart={(e) => handleDragStart(e, project.id)}
      onClick={() => onProjectSelect(project.id)}
      className={`bg-white rounded-lg border-l-4 ${getPriorityColor(project.priority)} p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
    >
      {/* Project Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
          {project.name}
        </h4>
        <div className="flex items-center space-x-1 ml-2">
          <span className={`text-lg ${getHealthColor(project.health)}`}>
            {getHealthIcon(project.health)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Handle more actions
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Project Description */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {project.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Progress</span>
          <span className="text-xs font-medium text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center space-x-1 text-gray-600">
          <span>📋</span>
          <span>{project.tasks.completed}/{project.tasks.total}</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-600">
          <span>🎯</span>
          <span>{project.milestones.completed}/{project.milestones.total}</span>
        </div>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 2 && (
            <span className="text-xs text-gray-500">+{project.tags.length - 2}</span>
          )}
        </div>
      )}

      {/* Project Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {/* Manager Avatar */}
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">
              {project.manager.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-xs text-gray-600 truncate max-w-20">
            {project.manager.name.split(' ')[0]}
          </span>
        </div>

        {/* Budget */}
        <div className="text-xs text-gray-600">
          {formatCurrency(project.budget)}
        </div>
      </div>

      {/* Due Date */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center space-x-1 text-gray-500">
          <CalendarIcon className="h-3 w-3" />
          <span>Due {formatDate(project.endDate)}</span>
        </div>
        <div className={`font-medium ${
          new Date(project.endDate) < new Date() ? 'text-red-600' : 'text-gray-600'
        }`}>
          {new Date(project.endDate) < new Date() ? 'Overdue' : 
           Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) + 'd'
          }
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-gray-200 rounded"></div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            className={`rounded-lg border-2 ${column.color} min-h-96`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">{column.name}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {projectsByStatus[column.id]?.length || 0}
                  </span>
                </div>
                {permissions?.canCreate && (
                  <button
                    onClick={() => {
                      // Handle add project to this column
                      console.log(`Add project to ${column.name}`)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Column Content */}
            <div className="p-4">
              {projectsByStatus[column.id]?.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {/* Empty State */}
              {(!projectsByStatus[column.id] || projectsByStatus[column.id].length === 0) && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No projects</p>
                  {permissions?.canCreate && (
                    <button
                      onClick={() => {
                        // Handle add project
                      }}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Add project
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {statusColumns.map((column) => {
            const columnProjects = projectsByStatus[column.id] || []
            const totalBudget = columnProjects.reduce((sum, p) => sum + p.budget, 0)
            const avgProgress = columnProjects.length > 0 
              ? columnProjects.reduce((sum, p) => sum + p.progress, 0) / columnProjects.length 
              : 0

            return (
              <div key={column.id} className="text-center">
                <div className="font-medium text-gray-900">{column.name}</div>
                <div className="text-xs text-gray-600 space-y-1 mt-1">
                  <div>{columnProjects.length} projects</div>
                  <div>{formatCurrency(totalBudget)} budget</div>
                  <div>{Math.round(avgProgress)}% avg progress</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default KanbanView
