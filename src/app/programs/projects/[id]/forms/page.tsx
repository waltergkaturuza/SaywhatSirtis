"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

export default function ProjectFormsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canManageForms = userPermissions.includes('programs.me_access') || userPermissions.includes('programs.forms')

  const [isSyncing, setIsSyncing] = useState(false)

  // Sample project and forms data
  const project = {
    id: projectId,
    name: "Action for Choice 2",
    description: "Comprehensive reproductive health and rights program"
  }

  const koboForms = [
    {
      id: "aKjH8mN2pQ",
      name: "Baseline Survey - Youth Knowledge Assessment",
      projectId: parseInt(projectId as string),
      url: "https://kf.kobotoolbox.org/aKjH8mN2pQ",
      status: "active" as const,
      submissions: 1247,
      lastSync: "2025-07-14T10:30:00Z",
      created: "2024-01-15",
      indicators: ["Youth SRHR Knowledge", "Service Access Points"],
      description: "Comprehensive baseline assessment of youth knowledge on sexual and reproductive health"
    },
    {
      id: "bLm9xC4rSt",
      name: "Monthly Service Delivery Report",
      projectId: parseInt(projectId as string),
      url: "https://kf.kobotoolbox.org/bLm9xC4rSt",
      status: "active" as const,
      submissions: 324,
      lastSync: "2025-07-14T15:45:00Z",
      created: "2024-02-01",
      indicators: ["Services Provided", "Client Satisfaction"],
      description: "Monthly data collection on health services provided to beneficiaries"
    },
    {
      id: "cNp5yD8uVw",
      name: "Training Feedback Form",
      projectId: parseInt(projectId as string),
      url: "https://kf.kobotoolbox.org/cNp5yD8uVw",
      status: "inactive" as const,
      submissions: 89,
      lastSync: "2025-07-10T09:20:00Z",
      created: "2024-03-10",
      indicators: ["Training Effectiveness", "Knowledge Gained"],
      description: "Post-training evaluation and feedback collection"
    },
    {
      id: "dQr2zA6xBy",
      name: "Community Engagement Tracker",
      projectId: parseInt(projectId as string),
      url: "https://kf.kobotoolbox.org/dQr2zA6xBy",
      status: "draft" as const,
      submissions: 0,
      lastSync: "2025-07-12T14:15:00Z",
      created: "2025-07-01",
      indicators: ["Community Participation", "Outreach Activities"],
      description: "Tracking community engagement activities and participation rates"
    }
  ]

  const handleSync = async (formId: string) => {
    setIsSyncing(true)
    // Simulate API call to sync data from Kobo
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert(`Synced data from form ${formId}`)
    setIsSyncing(false)
  }

  const handleSyncAll = async () => {
    setIsSyncing(true)
    // Simulate syncing all forms
    await new Promise(resolve => setTimeout(resolve, 3000))
    alert('All forms synced successfully!')
    setIsSyncing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-yellow-100 text-yellow-800"
      case "draft": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case "inactive": return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
      case "draft": return <DocumentTextIcon className="h-4 w-4 text-gray-600" />
      default: return <DocumentTextIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const metadata = {
    title: "Form Management",
    description: `Kobo forms and data collection for ${project.name}`,
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs", href: "/programs" },
      { name: project.name, href: `/programs/projects/${projectId}` },
      { name: "Forms" }
    ]
  }

  const actions = (
    <>
      <Link
        href={`/programs/projects/${projectId}`}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Project
      </Link>
      <button
        onClick={handleSyncAll}
        disabled={isSyncing}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        <ArrowPathIcon className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync All Forms'}
      </button>
      {canManageForms && (
        <Link
          href={`/programs/projects/${projectId}/forms/new`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Form
        </Link>
      )}
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Statistics</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{koboForms.length}</div>
            <div className="text-sm text-blue-800">Total Forms</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">
              {koboForms.filter(f => f.status === 'active').length}
            </div>
            <div className="text-sm text-green-800">Active Forms</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {koboForms.reduce((sum, f) => sum + f.submissions, 0).toLocaleString()}
            </div>
            <div className="text-sm text-purple-800">Total Submissions</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span>Kobo API Connected</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            <span>Auto-sync Enabled</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            <span>Last sync: 2 hours ago</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link
            href={`/programs/projects/${projectId}/data-entry`}
            className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded block"
          >
            Manual Data Entry
          </Link>
          <Link
            href={`/programs/projects/${projectId}/reports`}
            className="w-full text-left p-2 text-sm text-green-600 hover:bg-green-50 rounded block"
          >
            View Reports
          </Link>
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            Export All Data
          </button>
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            Configure Auto-sync
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Kobo Integration Overview */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Kobo Toolbox Integration</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Connected</span>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Manage data collection forms and synchronize submissions from Kobo Toolbox for real-time M&E tracking.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <div className="text-lg font-semibold text-blue-900">Auto-Sync</div>
                  <div className="text-sm text-blue-700">Every 30 minutes</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <div className="text-lg font-semibold text-green-900">Real-time</div>
                  <div className="text-sm text-green-700">Data Processing</div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <div className="text-lg font-semibold text-purple-900">Form Builder</div>
                  <div className="text-sm text-purple-700">Integrated</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Project Forms</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {koboForms.map((form) => (
              <div key={form.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getStatusIcon(form.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{form.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(form.status)}`}>
                          {form.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{form.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Created:</span> {form.created}
                        </div>
                        <div>
                          <span className="font-medium">Submissions:</span> {form.submissions.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Last Sync:</span> {new Date(form.lastSync).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Indicators:</span> {form.indicators.length}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-sm text-gray-500 mb-1">Linked Indicators:</div>
                        <div className="flex flex-wrap gap-1">
                          {form.indicators.map((indicator, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {indicator}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSync(form.id)}
                      disabled={isSyncing}
                      className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                      title="Sync Data"
                    >
                      <ArrowPathIcon className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                    <a
                      href={form.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="View in Kobo"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </a>
                    {canManageForms && (
                      <>
                        <Link
                          href={`/programs/projects/${projectId}/forms/${form.id}/edit`}
                          className="p-2 text-gray-400 hover:text-yellow-600"
                          title="Edit Form"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => confirm(`Delete form "${form.name}"?`) && alert('Form deleted')}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete Form"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {koboForms.length === 0 && (
            <div className="p-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No forms found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first data collection form.
              </p>
              {canManageForms && (
                <div className="mt-6">
                  <Link
                    href={`/programs/projects/${projectId}/forms/new`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create First Form
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Integration Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Kobo API Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Automatic Data Sync</h4>
              <ul className="space-y-1">
                <li>• Real-time submission processing</li>
                <li>• Automated indicator updates</li>
                <li>• Error handling and retry logic</li>
                <li>• Data validation and quality checks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Supported Features</h4>
              <ul className="space-y-1">
                <li>• Form creation and management</li>
                <li>• Submission data retrieval</li>
                <li>• Media file downloads</li>
                <li>• Bulk data operations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
