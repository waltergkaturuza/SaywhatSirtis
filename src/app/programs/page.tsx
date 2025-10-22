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
import { ProjectTable } from "../../components/programs/project-table-enhanced"
import { ProjectManagement } from "../../components/programs/project-management"
import { ProjectIndicators } from "../../components/programs/project-indicators"
import { SaywhatFlagshipEvents } from "../../components/programs/saywhat-flagship-events"
import { ReportsAnalytics } from "../../components/programs/reports-analytics-enhanced"
import { ProjectCalendar } from "../../components/programs/project-calendar"
import MealModule from "../../components/programs/MealModule"

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
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline' | 'calendar'>('list')
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
      
      // Debug logging
      console.log('Programs Access Check:', {
        userEmail: session.user.email,
        userRoles,
        userPermissions,
        userDepartment
      })

      // Special case for System Administrator - always grant access
      if (session.user.email === 'admin@saywhat.org') {
        console.log('Granting full access to System Administrator')
        setPermissions({
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canManageResources: true,
          canViewFinancials: true,
          canManageFinancials: true,
          canGenerateReports: true,
          canManageRisks: true,
          canApproveChanges: true,
          canManageStakeholders: true,
          canViewSensitiveData: true,
        })
        return
      }

      const hasBasicAccess = userPermissions.includes('programs.view') || 
                           userRoles.includes('PROJECT_MANAGER') ||
                           userRoles.includes('ADMIN') ||
                           userRoles.includes('SUPER_ADMIN') ||
                           userRoles.includes('project_manager') ||
                           userRoles.includes('admin') ||
                           userRoles.includes('system_admin') ||
                           userPermissions.includes('programs.full_access') ||
                           userPermissions.includes('all_access') ||
                           userPermissions.includes('admin')

      if (hasBasicAccess) {
        const isSystemAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN') || 
                          userRoles.includes('admin') || userRoles.includes('system_admin') || 
                          userRoles.includes('superuser') ||
                          userPermissions.includes('all_access') || userPermissions.includes('admin')
        const isProjectManager = userRoles.includes('PROJECT_MANAGER') || userRoles.includes('project_manager')
        
        setPermissions({
          canView: true,
          canCreate: isSystemAdmin || userPermissions.includes('programs.create') || isProjectManager,
          canEdit: isSystemAdmin || userPermissions.includes('programs.edit') || isProjectManager,
          canDelete: isSystemAdmin || userPermissions.includes('programs.delete'),
          canManageResources: isSystemAdmin || userPermissions.includes('programs.resources') || isProjectManager,
          canViewFinancials: isSystemAdmin || userDepartment === 'Finance' || userPermissions.includes('programs.finance.view'),
          canManageFinancials: isSystemAdmin || userDepartment === 'Finance' || userPermissions.includes('programs.finance.manage'),
          canGenerateReports: isSystemAdmin || userPermissions.includes('programs.reports') || isProjectManager,
          canManageRisks: isSystemAdmin || userPermissions.includes('programs.risks') || isProjectManager,
          canApproveChanges: isSystemAdmin || userPermissions.includes('programs.approve'),
          canManageStakeholders: isSystemAdmin || userPermissions.includes('programs.stakeholders') || isProjectManager,
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

  // Loading state
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

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
          <div className="mt-4 text-xs text-gray-400">
            Debug: User: {session?.user?.email}, Roles: {JSON.stringify(session?.user?.roles)}, Permissions: {JSON.stringify(session?.user?.permissions)}
          </div>
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
      id: "calendar",
      name: "Calendar",
      icon: CalendarDaysIcon,
      description: "Project and event calendar with monthly/yearly planning"
    },
    {
      id: "projects",
      name: "Projects",
      icon: ClipboardDocumentListIcon,
      description: "Enhanced project management with multiple views"
    },
    {
      id: "project-indicators",
      name: "Project Indicators",
      icon: ChartBarIcon,
      description: "Track and update project output indicator progress"
    },
    {
      id: "meal",
      name: "MEAL",
      icon: ClipboardDocumentListIcon,
      description: "Monitoring, Evaluation, Accountability and Learning"
    },
    {
      id: "saywhat-events",
      name: "SAYWHAT Flagship Events",
      icon: TrophyIcon,
      description: "Major organizational events and campaigns"
    },
    {
      id: "reports",
      name: "Reports & Analytics",
      icon: ChartPieIcon,
      description: "Comprehensive reporting and insights"
    }
  ]

  const actions = (
    <div className="flex items-center space-x-4">
      {activeTab === "projects" && (
        <div className="flex items-center space-x-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'list' | 'kanban' | 'timeline' | 'calendar')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="list">List View</option>
            <option value="kanban">Kanban Board</option>
            <option value="timeline">Timeline View</option>
            <option value="calendar">Calendar View</option>
          </select>
          
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="flex items-center space-x-2">
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
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {activeTab === "calendar" ? "New Event" : "New Project"}
        </button>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <ProjectDashboard 
            permissions={permissions as unknown as Record<string, boolean>}
            onProjectSelect={setSelectedProject}
            selectedProject={selectedProject}
          />
        )
      case "calendar":
        return (
          <ProjectCalendar 
            permissions={permissions as unknown as Record<string, boolean>}
            onItemSelect={(id, type) => {
              // Handle item selection - could navigate to detail view
              console.log(`Selected ${type}: ${id}`)
            }}
          />
        )
      case "projects":
        return (
          <ProjectManagement 
            permissions={permissions as unknown as Record<string, boolean>} 
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        )
      case "project-indicators":
        return (
          <ProjectIndicators 
            permissions={permissions as unknown as Record<string, boolean>} 
            onProjectSelect={setSelectedProject}
            selectedProject={selectedProject}
          />
        )
      case "meal":
        return (
          <div className="p-6">
            <MealModule />
          </div>
        )
      case "saywhat-events":
        return (
          <SaywhatFlagshipEvents 
            permissions={permissions as unknown as Record<string, boolean>}
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
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex flex-col items-center min-w-0 transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-green-300 hover:text-green-600"
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
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-orange-900">Project Selected: #{selectedProject}</h3>
                  <p className="text-sm text-orange-600">Working on active project context</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
              >
                Clear Selection
              </button>
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
