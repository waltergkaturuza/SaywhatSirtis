"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ModulePage } from "@/components/layout/enhanced-layout"
import { EnhancedNewProjectForm } from "@/components/programs/enhanced-new-project-form"
import {
  Squares2X2Icon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  FlagIcon,
  CubeTransparentIcon,
  ExclamationTriangleIcon,
  CogIcon,
  PlusIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  UsersIcon,
  BanknotesIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  TrophyIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import {
  CheckCircleIcon
} from "@heroicons/react/24/solid"

// Import essential components
import { ProjectDashboard } from "../../components/programs/project-dashboard"
import { ReportsAnalytics } from "../../components/programs/reports-analytics-enhanced"
import { ProjectManagement } from "../../components/programs/project-management"

interface ProgramPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canManageResources: boolean
  canViewFinancials: boolean
  canManageFinancials: boolean
  canGenerateReports: boolean
  canManageRisks: boolean
  canApproveChanges: boolean
  canManageStakeholders: boolean
  canViewSensitiveData: boolean
}

function EnhancedProgramsContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [permissions, setPermissions] = useState<ProgramPermissions>({
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageResources: false,
    canViewFinancials: false,
    canManageFinancials: false,
    canGenerateReports: false,
    canManageRisks: false,
    canApproveChanges: false,
    canManageStakeholders: false,
    canViewSensitiveData: false,
  })

  useEffect(() => {
    // Enhanced permission checking
    if (session?.user) {
      const userRoles = session.user.roles || []
      const userPermissions = session.user.permissions || []
      const userDepartment = session.user.department

      const hasBasicAccess = userPermissions.includes('programs.view') || 
                           userRoles.includes('project_manager') ||
                           userRoles.includes('admin')

      if (hasBasicAccess) {
        setPermissions({
          canView: true,
          canCreate: userPermissions.includes('programs.create') || userRoles.includes('project_manager'),
          canEdit: userPermissions.includes('programs.edit') || userRoles.includes('project_manager'),
          canDelete: userPermissions.includes('programs.delete') || userRoles.includes('admin'),
          canManageResources: userPermissions.includes('programs.resources') || userRoles.includes('project_manager'),
          canViewFinancials: userDepartment === 'Finance' || userPermissions.includes('programs.finance.view'),
          canManageFinancials: userDepartment === 'Finance' || userPermissions.includes('programs.finance.manage'),
          canGenerateReports: userPermissions.includes('programs.reports') || userRoles.includes('project_manager'),
          canManageRisks: userPermissions.includes('programs.risks') || userRoles.includes('project_manager'),
          canApproveChanges: userPermissions.includes('programs.approve') || userRoles.includes('admin'),
          canManageStakeholders: userPermissions.includes('programs.stakeholders') || userRoles.includes('project_manager'),
          canViewSensitiveData: userPermissions.includes('programs.sensitive') || userRoles.includes('admin'),
        })
      }
    }
  }, [session])

  useEffect(() => {
    // Check for success parameter
    const success = searchParams.get('success')
    if (success === 'project-created') {
      setShowSuccessMessage(true)
      // Auto-hide after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams])

  // Access control check
  if (!permissions.canView) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the Programs and Projects module.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator to request access.
          </p>
        </div>
      </div>
    )
  }

  const metadata = {
    title: "Programs Management", // Removed "& Projects" as requested
    description: "Program management with results framework, budget integration, and comprehensive reporting",
    breadcrumbs: [
      { name: "Programs Management" }
    ]
  }

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Squares2X2Icon,
      description: "Program overview, key metrics, budget performance, and project analytics"
    },
    {
      id: "projects",
      name: "Projects",
      icon: ClipboardDocumentListIcon,
      description: "Donor-funded projects with results framework and progress tracking"
    },
    {
      id: "flagship-events",
      name: "SAYWHAT Flagship Events",
      icon: TrophyIcon,
      description: "Annual flagship events planning and management with Gantt scheduling"
    },
    {
      id: "reports",
      name: "Reports & Analytics",
      icon: DocumentTextIcon,
      description: "Project performance analytics, budget integration, and detailed reporting"
    }
  ]

  const actions = (
    <div className="flex items-center space-x-4">
      {activeTab === "projects" && (
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-2 border border-saywhat-orange rounded-md text-sm text-saywhat-orange hover:bg-orange-50">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter by Category
          </button>
        </div>
      )}

      {permissions.canGenerateReports && (
        <button className="flex items-center px-4 py-2 border border-saywhat-grey rounded-md text-sm text-saywhat-grey hover:bg-gray-50">
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Export Reports
        </button>
      )}

      {permissions.canCreate && (
        <button 
          onClick={() => setShowNewProject(true)}
          className="flex items-center px-4 py-2 bg-saywhat-orange text-white rounded-md text-sm hover:bg-orange-600"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </button>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "projects":
        return (
          <ProjectManagement 
            permissions={permissions as unknown as Record<string, boolean>} 
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        )
      case "flagship-events":
        return (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-saywhat-dark mb-2">SAYWHAT Flagship Events</h3>
                <p className="text-saywhat-grey">
                  Annual flagship events planning and management with Gantt chart scheduling and work breakdown structure
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/programs/flagship-events"
                  className="text-sm text-saywhat-orange hover:text-orange-600 font-medium"
                >
                  View All Events →
                </Link>
                {permissions.canCreate && (
                  <button className="flex items-center px-4 py-2 bg-saywhat-orange text-white rounded-md text-sm hover:bg-orange-600">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    Schedule Event
                  </button>
                )}
              </div>
            </div>

            {/* Flagship Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Agriculture Colleges Sports Gala */}
              <div className="bg-white rounded-lg shadow border-l-4 border-l-saywhat-orange p-6">
                <div className="flex items-center mb-4">
                  <TrophyIcon className="h-6 w-6 text-saywhat-orange mr-3" />
                  <h4 className="text-lg font-medium text-saywhat-dark">Agriculture Colleges Sports Gala</h4>
                </div>
                <p className="text-sm text-saywhat-grey mb-4">Annual sports competition for agriculture colleges across the region</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Status:</span>
                    <span className="text-green-600 font-medium">Planning</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Next Event:</span>
                    <span className="text-saywhat-dark">2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Lead:</span>
                    <span className="text-saywhat-dark">Not assigned</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Link 
                    href="/programs/flagship-events/agriculture-sports-gala"
                    className="flex-1 text-center text-xs px-3 py-2 bg-saywhat-orange text-white rounded hover:bg-orange-600"
                  >
                    View Timeline
                  </Link>
                  <button className="flex-1 text-xs px-3 py-2 border border-saywhat-orange text-saywhat-orange rounded hover:bg-orange-50">
                    Documents
                  </button>
                </div>
              </div>

              {/* SAYWHAT Quiz and SASI Debate Challenge */}
              <div className="bg-white rounded-lg shadow border-l-4 border-l-saywhat-red p-6">
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-6 w-6 text-saywhat-red mr-3" />
                  <h4 className="text-lg font-medium text-saywhat-dark">SAYWHAT Quiz & SASI Debate Challenge</h4>
                </div>
                <p className="text-sm text-saywhat-grey mb-4">Intellectual competition fostering knowledge and debate skills</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Status:</span>
                    <span className="text-yellow-600 font-medium">In Progress</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Next Event:</span>
                    <span className="text-saywhat-dark">2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Lead:</span>
                    <span className="text-saywhat-dark">Not assigned</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 text-xs px-3 py-2 bg-saywhat-red text-white rounded hover:bg-red-600">
                    View Timeline
                  </button>
                  <button className="flex-1 text-xs px-3 py-2 border border-saywhat-red text-saywhat-red rounded hover:bg-red-50">
                    Documents
                  </button>
                </div>
              </div>

              {/* The Chase and CRAFT */}
              <div className="bg-white rounded-lg shadow border-l-4 border-l-saywhat-grey p-6">
                <div className="flex items-center mb-4">
                  <UsersIcon className="h-6 w-6 text-saywhat-grey mr-3" />
                  <h4 className="text-lg font-medium text-saywhat-dark">The Chase and CRAFT</h4>
                </div>
                <p className="text-sm text-saywhat-grey mb-4">Creative arts and talent showcase events</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Status:</span>
                    <span className="text-blue-600 font-medium">Scheduled</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Next Event:</span>
                    <span className="text-saywhat-dark">2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Lead:</span>
                    <span className="text-saywhat-dark">Not assigned</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 text-xs px-3 py-2 bg-saywhat-grey text-white rounded hover:bg-gray-600">
                    View Timeline
                  </button>
                  <button className="flex-1 text-xs px-3 py-2 border border-saywhat-grey text-saywhat-grey rounded hover:bg-gray-50">
                    Documents
                  </button>
                </div>
              </div>

              {/* National Students Conference */}
              <div className="bg-white rounded-lg shadow border-l-4 border-l-green-500 p-6">
                <div className="flex items-center mb-4">
                  <UsersIcon className="h-6 w-6 text-green-500 mr-3" />
                  <h4 className="text-lg font-medium text-saywhat-dark">National Students Conference</h4>
                </div>
                <p className="text-sm text-saywhat-grey mb-4">Annual national conference with multiple specialized events</p>
                <div className="space-y-2">
                  <div className="text-xs text-saywhat-grey">Includes:</div>
                  <ul className="text-xs text-saywhat-dark space-y-1 ml-4">
                    <li>• Orathon</li>
                    <li>• Web for Life Symposium</li>
                    <li>• Mugota/Ixhiba Young Men's Forum</li>
                    <li>• Research Indaba</li>
                    <li>• Forum of College Authorities on Students SRH</li>
                    <li>• Awards Ceremony</li>
                  </ul>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 text-xs px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    View Timeline
                  </button>
                  <button className="flex-1 text-xs px-3 py-2 border border-green-500 text-green-500 rounded hover:bg-green-50">
                    Documents
                  </button>
                </div>
              </div>

              {/* Southern African Regional Conference */}
              <div className="bg-white rounded-lg shadow border-l-4 border-l-purple-500 p-6">
                <div className="flex items-center mb-4">
                  <MapIcon className="h-6 w-6 text-purple-500 mr-3" />
                  <h4 className="text-lg font-medium text-saywhat-dark">Southern African Regional Students & Youth Conference</h4>
                </div>
                <p className="text-sm text-saywhat-grey mb-4">Regional conference bringing together students and youth from across Southern Africa</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Status:</span>
                    <span className="text-purple-600 font-medium">Planning</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Next Event:</span>
                    <span className="text-saywhat-dark">2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-saywhat-grey">Lead:</span>
                    <span className="text-saywhat-dark">Not assigned</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 text-xs px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                    View Timeline
                  </button>
                  <button className="flex-1 text-xs px-3 py-2 border border-purple-500 text-purple-500 rounded hover:bg-purple-50">
                    Documents
                  </button>
                </div>
              </div>
            </div>

            {/* Annual Gantt Chart View */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-medium text-saywhat-dark mb-4">Annual Events Timeline</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800">
                  <strong>Coming Soon:</strong> Interactive Gantt chart for annual event scheduling by months with work breakdown structure (WBS) for concept notes, budgets, and event reports.
                </p>
                <div className="mt-3">
                  <p className="text-sm text-blue-700">
                    <strong>Features:</strong> Monthly view, drag-and-drop scheduling, document uploads (concept notes, budgets, reports), progress tracking, and collaborative planning tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case "reports":
        return (
          <ReportsAnalytics 
            permissions={permissions as unknown as Record<string, boolean>}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        )
      default:
        return (
          <ProjectDashboard 
            permissions={permissions as unknown as Record<string, boolean>}
            onProjectSelect={setSelectedProject}
            selectedProject={selectedProject}
          />
        )
    }
  }

  return (
    <ModulePage metadata={metadata} actions={actions}>
      <div className="space-y-6">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 relative">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Project Created Successfully!</h3>
                <p className="text-sm text-green-600 mt-1">Your new project has been created and is ready for management.</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="ml-4 text-green-400 hover:text-green-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Tab Navigation with Descriptions */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex flex-col items-center min-w-0 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                title={tab.description}
              >
                <tab.icon className="h-5 w-5 mb-1" />
                <span className="truncate">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Project Context Bar */}
        {selectedProject && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Project Selected: #{selectedProject}</h3>
                  <p className="text-sm text-blue-600">Working on active project context</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Quick Metrics Bar */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Active Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <FlagIcon className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Milestones</p>
                  <p className="text-2xl font-semibold text-gray-900">89</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <BanknotesIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Budget</p>
                  <p className="text-2xl font-semibold text-gray-900">$2.4M</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Team Members</p>
                  <p className="text-2xl font-semibold text-gray-900">156</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">High Risks</p>
                  <p className="text-2xl font-semibold text-gray-900">7</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <TrophyIcon className="h-8 w-8 text-indigo-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Completion</p>
                  <p className="text-2xl font-semibold text-gray-900">78%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {renderTabContent()}
        </div>
      </div>

      {/* Enhanced New Project Form Modal */}
      {showNewProject && (
        <EnhancedNewProjectForm 
          onCancel={() => setShowNewProject(false)}
          onSuccess={() => {
            setShowNewProject(false)
            setShowSuccessMessage(true)
            // Refresh projects data if needed
            setTimeout(() => setShowSuccessMessage(false), 5000)
          }}
        />
      )}
    </ModulePage>
  )
}

export default function EnhancedProgramsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EnhancedProgramsContent />
    </Suspense>
  )
}
