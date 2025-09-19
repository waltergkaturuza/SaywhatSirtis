import React from "react"
import { 
  CheckIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline"
import { Project, SortConfig } from "../project-management"

interface ListViewProps {
  projects: Project[]
  selectedProjects: string[]
  onProjectSelect: (projectId: string) => void
  onBulkSelect: (projectIds: string[]) => void
  onSort: (field: keyof Project | 'budget_remaining' | 'progress_score') => void
  sortConfig: SortConfig
  permissions: any
  isLoading: boolean
}

const ListView: React.FC<ListViewProps> = ({
  projects,
  selectedProjects,
  onProjectSelect,
  onBulkSelect,
  onSort,
  sortConfig,
  permissions,
  isLoading
}) => {
  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      onBulkSelect([])
    } else {
      onBulkSelect(projects.map(p => p.id))
    }
  }

  const handleSelectProject = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      onBulkSelect(selectedProjects.filter(id => id !== projectId))
    } else {
      onBulkSelect([...selectedProjects, projectId])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const SortableHeader: React.FC<{ 
    field: keyof Project | 'budget_remaining' | 'progress_score'
    children: React.ReactNode 
  }> = ({ field, children }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-1 text-left hover:text-gray-900 focus:outline-none"
    >
      <span>{children}</span>
      {sortConfig.field === field && (
        sortConfig.direction === 'asc' 
          ? <ChevronUpIcon className="h-4 w-4" />
          : <ChevronDownIcon className="h-4 w-4" />
      )}
    </button>
  )

  if (isLoading) {
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
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProjects.length === projects.length && projects.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="name">Project</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="status">Status</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="priority">Priority</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="progress">Progress</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="manager">Manager</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="budget">Budget</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Health
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="endDate">Due Date</SortableHeader>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr
                key={project.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedProjects.includes(project.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => onProjectSelect(project.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleSelectProject(project.id)
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                
                {/* Project Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {project.description}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{project.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </td>

                {/* Priority */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                  </span>
                </td>

                {/* Progress */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {project.tasks.completed}/{project.tasks.total} tasks
                  </div>
                </td>

                {/* Manager */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {project.manager.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {project.manager.name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Budget */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(project.budget)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Spent: {formatCurrency(project.spent)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Remaining: {formatCurrency(project.budget - project.spent)}
                  </div>
                </td>

                {/* Health */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{getHealthIcon(project.health)}</span>
                    <span className={`text-sm font-medium ${getHealthColor(project.health)}`}>
                      {project.health.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </td>

                {/* Due Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(project.endDate)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(project.endDate) < new Date() ? 'Overdue' : 
                     Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) + ' days left'
                    }
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {permissions?.canView && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onProjectSelect(project.id)
                        }}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    )}
                    {permissions?.canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle edit
                        }}
                        className="text-gray-400 hover:text-green-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first project or adjust your filters.
          </p>
        </div>
      )}
    </div>
  )
}

export default ListView
