"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  PencilIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ChartBarIcon,
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline"

interface ProjectData {
  id: string
  name: string
  projectGoal?: string
  description: string
  status: string
  startDate: string
  endDate: string
  country: string
  province?: string
  budget?: number
  actualSpent?: number
  objectives?: any
  createdAt?: string
  updatedAt?: string
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  name: string
  position?: string
  department?: string
}

export default function ProjectDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectLead, setProjectLead] = useState<Employee | null>(null)
  const [projectTeam, setProjectTeam] = useState<Employee[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canEditProjects = userPermissions.includes('programs.me_access') || userPermissions.includes('programs.create')
  const canUploadProgress = userPermissions.includes('programs.upload') || userPermissions.includes('programs.progress')

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/hr/employees')
        const result = await response.json()
        if (result.success && result.data) {
          setEmployees(result.data)
        }
      } catch (err) {
        console.error('Error fetching employees:', err)
      }
    }
    fetchEmployees()
  }, [])

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/programs/projects/${projectId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch project')
        }

        const result = await response.json()
        if (result.success && result.data) {
          const projectData = result.data
          setProject(projectData)

          // Parse objectives if it's a string
          let objectives = projectData.objectives
          if (typeof objectives === 'string') {
            try {
              objectives = JSON.parse(objectives)
            } catch (e) {
              console.error('Error parsing objectives:', e)
              objectives = {}
            }
          }

          // Set project lead and team
          if (objectives?.projectLead && employees.length > 0) {
            const lead = employees.find(emp => emp.id === objectives.projectLead)
            if (lead) setProjectLead(lead)
          }

          if (objectives?.projectTeam && Array.isArray(objectives.projectTeam) && employees.length > 0) {
            const team = employees.filter(emp => objectives.projectTeam.includes(emp.id))
            setProjectTeam(team)
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err)
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    if (projectId && employees.length > 0) {
      fetchProject()
    }
  }, [projectId, employees])

  // Parse objectives
  const getObjectives = () => {
    if (!project?.objectives) return {}
    if (typeof project.objectives === 'string') {
      try {
        return JSON.parse(project.objectives)
      } catch {
        return {}
      }
    }
    return project.objectives
  }

  const objectives = getObjectives()
  const categories = objectives.categories || []
  const implementingOrgs = objectives.implementingOrganizations || []
  const fundingSource = objectives.fundingSource || 'Not specified'
  const countries = objectives.countries || [project?.country]
  const provinces = objectives.provinces || {}

  const metadata = {
    title: project?.name || 'Loading...',
    description: `Project details and M&E tracking for ${project?.name || 'project'}`,
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs", href: "/programs" },
      { name: project?.name || 'Loading...' }
    ]
  }

  const actions = (
    <>
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back
      </button>
      {canUploadProgress && (
        <Link
          href={`/programs/projects/${projectId}/upload`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
          Upload Progress
        </Link>
      )}
      <Link
        href={`/programs/projects/${projectId}/documents`}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Documents
      </Link>
      {canEditProjects && (
        <Link
          href={`/programs/projects/${projectId}/edit`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Project
        </Link>
      )}
    </>
  )

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "on-hold": return "bg-yellow-100 text-yellow-800"
      case "planning": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Info</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm font-medium text-blue-900">Status</div>
            <div className="text-lg font-semibold text-blue-600">{project?.status || 'N/A'}</div>
          </div>
          {project?.budget && (
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm font-medium text-green-900">Budget</div>
              <div className="text-lg font-semibold text-green-600">${project.budget.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {canUploadProgress && (
            <Link
              href={`/programs/projects/${projectId}/upload`}
              className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Upload Progress Report
            </Link>
          )}
          <Link
            href={`/programs/projects/${projectId}/documents`}
            className="block w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
          >
            View All Documents
          </Link>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <ModulePage metadata={metadata} actions={actions}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
          </div>
        </div>
      </ModulePage>
    )
  }

  if (error || !project) {
    return (
      <ModulePage metadata={metadata} actions={actions}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error || 'Project not found'}</p>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Project Overview */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
              {project.projectGoal && (
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Project Goal</h3>
                  <p className="text-gray-600 text-sm">{project.projectGoal}</p>
                </div>
              )}
              <p className="text-gray-600">{project.description}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">{project.country}</div>
                {project.province && (
                  <div className="text-sm text-gray-500">{project.province}</div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(project.startDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                  to {new Date(project.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {project.budget && (
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    ${project.budget.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Budget</div>
                </div>
              </div>
            )}

            {projectLead && (
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{projectLead.name}</div>
                  <div className="text-sm text-gray-500">Project Lead</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Team & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Team */}
          {projectTeam.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-orange-500" />
                Project Team
              </h3>
              <div className="space-y-2">
                {projectTeam.map((member) => (
                  <div key={member.id} className="flex items-center p-2 bg-gray-50 rounded">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium mr-3">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      {member.position && (
                        <div className="text-xs text-gray-500">{member.position}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Implementing Organizations & Funding */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {implementingOrgs.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-green-500" />
                Implementing Organizations
              </h3>
              <ul className="space-y-2">
                {implementingOrgs.filter((org: string) => org.trim()).map((org: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{org}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Information</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Funding Source</div>
                <div className="text-base font-medium text-gray-900">{fundingSource}</div>
              </div>
              {project.budget && (
                <>
                  <div>
                    <div className="text-sm text-gray-500">Total Budget</div>
                    <div className="text-base font-medium text-gray-900">
                      ${project.budget.toLocaleString()}
                    </div>
                  </div>
                  {project.actualSpent !== undefined && (
                    <div>
                      <div className="text-sm text-gray-500">Spent</div>
                      <div className="text-base font-medium text-gray-900">
                        ${project.actualSpent.toLocaleString()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Geographic Coverage */}
        {(countries.length > 0 || Object.keys(provinces).length > 0) && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-purple-500" />
              Geographic Coverage
            </h3>
            <div className="space-y-3">
              {countries.map((country: string) => (
                <div key={country} className="border-l-4 border-purple-500 pl-4">
                  <div className="text-base font-medium text-gray-900">{country}</div>
                  {provinces[country] && provinces[country].length > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      Provinces: {provinces[country].join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Framework */}
        {objectives.resultsFramework && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Results Framework</h3>
            <div className="space-y-4">
              {objectives.resultsFramework.objectives && objectives.resultsFramework.objectives.length > 0 ? (
                objectives.resultsFramework.objectives.map((objective: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{objective.description || `Objective ${index + 1}`}</h4>
                    {objective.indicators && objective.indicators.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-sm font-medium text-gray-700">Indicators:</div>
                        {objective.indicators.map((indicator: any, idx: number) => (
                          <div key={idx} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-300">
                            {indicator.description || indicator.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No objectives defined</p>
              )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="bg-gray-50 rounded-lg border p-4">
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span> {new Date(project.createdAt || '').toLocaleDateString()}
            </div>
            {project.updatedAt && (
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(project.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
