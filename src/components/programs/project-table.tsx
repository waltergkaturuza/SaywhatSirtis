import Link from 'next/link'
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'
import { Project } from '@/types/programs'

// Helper function to format numbers consistently
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

interface ProjectTableProps {
  projects: Project[]
  canEditProjects: boolean
  canUploadProgress: boolean
}

export default function ProjectTable({ 
  projects, 
  canEditProjects, 
  canUploadProgress 
}: ProjectTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "planning": return "bg-yellow-100 text-yellow-800"
      case "on-hold": return "bg-red-100 text-red-800"
      case "suspended": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or create a new project.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Project Portfolio ({projects.length} projects)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location & Donor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline & Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress & Reach
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 truncate" title={project.name}>
                      {project.name}
                    </div>
                    <div className="text-sm text-gray-500">Manager: {project.manager}</div>
                    {project.projectGoal && (
                      <div className="text-xs text-blue-600 truncate" title={project.projectGoal}>
                        Goal: {project.projectGoal.substring(0, 60)}...
                      </div>
                    )}
                    <div className="text-xs text-gray-400 truncate" title={project.description}>
                      {project.description.substring(0, 80)}...
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.country}</div>
                      <div className="text-sm text-gray-500">{project.province}</div>
                      <div className="text-xs text-gray-400">{project.donor}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-start space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-900">{project.startDate}</div>
                      <div className="text-sm text-gray-500">to {project.endDate}</div>
                      <div className="text-xs text-gray-400">${formatNumber(project.budget)}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {formatNumber(project.currentReach)}/{formatNumber(project.targetReach)}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <Link
                      href={`/programs/projects/${project.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </Link>
                    {canEditProjects && (
                      <Link
                        href={`/programs/projects/${project.id}/edit`}
                        className="text-xs text-green-600 hover:text-green-800"
                      >
                        Edit
                      </Link>
                    )}
                    {canUploadProgress && (
                      <Link
                        href={`/programs/projects/${project.id}/upload`}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        Upload Progress
                      </Link>
                    )}
                    <Link
                      href={`/programs/projects/${project.id}/forms`}
                      className="text-xs text-orange-600 hover:text-orange-800"
                    >
                      Manage Forms
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
