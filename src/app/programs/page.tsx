"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { ModulePage } from "@/components/layout/enhanced-layout"
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

// Import enhanced components
import { ProjectDashboard } from "../../components/programs/project-dashboard"
import { ProjectGantt } from "../../components/programs/project-gantt"
import { WorkBreakdownStructure } from "../../components/programs/work-breakdown-structure"
import { MilestoneTracker } from "../../components/programs/milestone-tracker"
import { ResourceManagement } from "../../components/programs/resource-management"
import { RiskManagement } from "../../components/programs/risk-management-enhanced"
import { ReportsAnalytics } from "../../components/programs/reports-analytics-enhanced"
import { ProjectSettings } from "../../components/programs/project-settings"
import { ProjectTable } from "../../components/programs/project-table-enhanced"
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
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline'>('list')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
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
    title: "Programs & Projects Management",
    description: "Advanced project management with Gantt charts, WBS, milestones, resource planning, and comprehensive reporting",
    breadcrumbs: [
      { name: "Programs & Projects" }
    ]
  }

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Squares2X2Icon,
      description: "Project overview and key metrics"
    },
    {
      id: "projects",
      name: "Projects",
      icon: ClipboardDocumentListIcon,
      description: "Enhanced project management with multiple views"
    },
    {
      id: "project-table",
      name: "Project Table",
      icon: DocumentTextIcon,
      description: "Traditional project list and management"
    },
    {
      id: "gantt",
      name: "Gantt Chart",
      icon: ChartBarIcon,
      description: "Timeline visualization and scheduling"
    },
    {
      id: "wbs",
      name: "WBS",
      icon: CubeTransparentIcon,
      description: "Work breakdown structure"
    },
    {
      id: "milestones",
      name: "Milestones",
      icon: FlagIcon,
      description: "Key milestones and deliverables"
    },
    {
      id: "resources",
      name: "Resources",
      icon: UsersIcon,
      description: "Resource allocation and management"
    },
    {
      id: "risks",
      name: "Risk Management",
      icon: ExclamationTriangleIcon,
      description: "Risk identification and mitigation"
    },
    {
      id: "reports",
      name: "Reports & Analytics",
      icon: DocumentTextIcon,
      description: "Comprehensive reporting and insights"
    },
    {
      id: "settings",
      name: "Settings",
      icon: CogIcon,
      description: "Project configuration and preferences"
    }
  ]

  const actions = (
    <div className="flex items-center space-x-4">
      {(activeTab === "projects" || activeTab === "project-table") && (
        <div className="flex items-center space-x-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'list' | 'kanban' | 'timeline')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="list">List View</option>
            <option value="kanban">Kanban Board</option>
            <option value="timeline">Timeline View</option>
          </select>
          
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      )}

      {permissions.canGenerateReports && (
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Export
        </button>
      )}

      {permissions.canCreate && (
        <button 
          onClick={() => router.push('/programs/new')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </button>
      )}

      <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
        <CogIcon className="h-4 w-4 mr-2" />
        Settings
      </button>
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
      case "project-table":
        return (
          <ProjectTable 
            permissions={permissions as unknown as Record<string, boolean>} 
            viewMode={viewMode}
            onProjectSelect={setSelectedProject}
            selectedProject={selectedProject}
          />
        )
      case "gantt":
        return (
          <ProjectGantt 
            permissions={permissions as unknown as Record<string, boolean>}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        )
      case "wbs":
        return (
          <WorkBreakdownStructure 
            permissions={permissions as unknown as Record<string, boolean>}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        )
      case "milestones":
        return (
          <MilestoneTracker 
            permissions={permissions as unknown as Record<string, boolean>}
            selectedProject={selectedProject}
          />
        )
      case "resources":
        return (
          <ResourceManagement 
            permissions={permissions as unknown as Record<string, boolean>}
            selectedProject={selectedProject}
          />
        )
      case "risks":
        return (
          <RiskManagement 
            permissions={permissions as unknown as Record<string, boolean>}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        )
      case "reports":
        return (
          <ReportsAnalytics 
            permissions={permissions as unknown as Record<string, boolean>}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        )
      case "settings":
        return (
          <ProjectSettings 
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
