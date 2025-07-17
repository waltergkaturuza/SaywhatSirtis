"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
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
  ArrowLeftIcon
} from "@heroicons/react/24/outline"

export default function ProjectDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canEditProjects = userPermissions.includes('programs.me_access') || userPermissions.includes('programs.create')
  const canUploadProgress = userPermissions.includes('programs.upload') || userPermissions.includes('programs.progress')

  // Sample project data (in real app, this would be fetched based on projectId)
  const project = {
    id: projectId,
    name: "Community Health Improvement Project",
    country: "Nigeria",
    province: "Lagos",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    status: "active",
    progress: 65,
    targetReach: 50000,
    currentReach: 32500,
    budget: 2500000,
    spent: 1625000,
    lastUpdate: "2024-01-10",
    manager: "Dr. Sarah Johnson",
    description: "A comprehensive health improvement project targeting maternal and child health outcomes in underserved communities across Lagos State.",
    objectives: "Improve maternal and child health outcomes in underserved communities through enhanced healthcare delivery, community education, and infrastructure development.",
    activities: [
      "Health screenings and assessments",
      "Vaccination campaigns",
      "Nutrition education programs",
      "Maternal health workshops",
      "Community health worker training",
      "Healthcare facility upgrades"
    ],
    resultsFramework: "The project follows a results-based approach with clear outcomes focused on reducing maternal and infant mortality rates, increasing vaccination coverage, and improving nutritional status of children under 5.",
    indicators: [
      {
        id: 1,
        name: "Number of women receiving prenatal care",
        target: 5000,
        current: 3250,
        measurement: "Monthly clinic records",
        successCriteria: "80% target achievement",
        status: "on-track"
      },
      {
        id: 2,
        name: "Children fully vaccinated",
        target: 8000,
        current: 6400,
        measurement: "Vaccination cards verification",
        successCriteria: "90% vaccination rate",
        status: "on-track"
      },
      {
        id: 3,
        name: "Community health workers trained",
        target: 100,
        current: 75,
        measurement: "Training completion certificates",
        successCriteria: "All CHWs certified",
        status: "on-track"
      },
      {
        id: 4,
        name: "Health facilities upgraded",
        target: 20,
        current: 8,
        measurement: "Physical verification",
        successCriteria: "All facilities meet standards",
        status: "behind"
      }
    ],
    documents: [
      { name: "Project Proposal", type: "pdf", size: "2.4 MB", uploadDate: "2024-01-15" },
      { name: "Baseline Survey", type: "pdf", size: "1.8 MB", uploadDate: "2024-01-20" },
      { name: "Monthly Report - Dec", type: "pdf", size: "950 KB", uploadDate: "2024-01-05" },
      { name: "Budget Breakdown", type: "xlsx", size: "450 KB", uploadDate: "2024-01-10" },
      { name: "Community Photos", type: "zip", size: "15.2 MB", uploadDate: "2024-01-08" }
    ],
    progressReports: [
      {
        date: "2024-01-10",
        uploader: "John Smith - CAM Officer",
        summary: "Significant progress in vaccination campaigns. 1,200 children vaccinated this month.",
        documentsAttached: 3
      },
      {
        date: "2024-01-05",
        uploader: "Mary Johnson - Programs Officer", 
        summary: "Completed CHW training for 25 new workers. Maternal health workshops reached 350 women.",
        documentsAttached: 2
      },
      {
        date: "2023-12-28",
        uploader: "David Chen - Research Officer",
        summary: "Health facility upgrades completed for 2 additional sites. Equipment installation ongoing.",
        documentsAttached: 5
      }
    ]
  }

  const metadata = {
    title: project.name,
    description: `Project details and M&E tracking for ${project.name}`,
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs", href: "/programs" },
      { name: project.name }
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
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "on-hold": return "bg-yellow-100 text-yellow-800"
      case "planning": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getIndicatorStatusColor = (status: string) => {
    switch (status) {
      case "on-track": return "text-green-600"
      case "behind": return "text-red-600"
      case "ahead": return "text-blue-600"
      default: return "text-gray-600"
    }
  }

  const getIndicatorIcon = (status: string) => {
    switch (status) {
      case "on-track": return <CheckCircleIcon className="h-5 w-5" />
      case "behind": return <ExclamationTriangleIcon className="h-5 w-5" />
      case "ahead": return <ChartBarIcon className="h-5 w-5" />
      default: return <ClockIcon className="h-5 w-5" />
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{project.progress}%</div>
            <div className="text-sm text-blue-800">Overall Progress</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">{project.currentReach.toLocaleString()}</div>
            <div className="text-sm text-green-800">People Reached</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">{project.indicators.length}</div>
            <div className="text-sm text-purple-800">M&E Indicators</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {project.progressReports.slice(0, 3).map((report, index) => (
            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">{report.uploader.split(' - ')[1]}</div>
              <div className="text-gray-600 text-xs">{report.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {canUploadProgress && (
            <Link
              href={`/programs/projects/${projectId}/upload`}
              className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Upload Progress Report
            </Link>
          )}
          <Link
            href={`/programs/projects/${projectId}/documents`}
            className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
          >
            View All Documents
          </Link>
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            Generate Report
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
        {/* Project Overview */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">{project.country}</div>
                <div className="text-sm text-gray-500">{project.province}</div>
              </div>
            </div>

            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">{project.startDate}</div>
                <div className="text-sm text-gray-500">to {project.endDate}</div>
              </div>
            </div>

            <div className="flex items-center">
              <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">{project.currentReach.toLocaleString()}</div>
                <div className="text-sm text-gray-500">of {project.targetReach.toLocaleString()} target</div>
              </div>
            </div>

            <div className="flex items-center">
              <FlagIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">{project.manager}</div>
                <div className="text-sm text-gray-500">Project Manager</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm text-gray-500">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Target Reach</span>
                  <span className="text-sm text-gray-500">{Math.round((project.currentReach / project.targetReach) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${(project.currentReach / project.targetReach) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                  <span className="text-sm text-gray-500">{Math.round((project.spent / project.budget) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: `${(project.spent / project.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Target Reach</span>
                <span className="text-sm font-medium text-gray-900">{project.targetReach.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Reach</span>
                <span className="text-sm font-medium text-gray-900">{project.currentReach.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Budget</span>
                <span className="text-sm font-medium text-gray-900">${project.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Spent</span>
                <span className="text-sm font-medium text-gray-900">${project.spent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="text-sm font-medium text-gray-900">{project.lastUpdate}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{project.documents.length}</span> documents uploaded
              </div>
              {project.documents.slice(0, 3).map((doc, index) => (
                <div key={index} className="flex items-center text-sm">
                  <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 truncate">{doc.name}</span>
                </div>
              ))}
              <Link
                href={`/programs/projects/${projectId}/documents`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all documents →
              </Link>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectives</h3>
            <p className="text-gray-700">{project.objectives}</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
            <ul className="space-y-2">
              {project.activities.map((activity, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* M&E Indicators */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">M&E Indicators</h3>
          <div className="space-y-4">
            {project.indicators.map((indicator) => (
              <div key={indicator.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{indicator.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Target: {indicator.target.toLocaleString()}</p>
                  </div>
                  <div className={`flex items-center ${getIndicatorStatusColor(indicator.status)}`}>
                    {getIndicatorIcon(indicator.status)}
                    <span className="ml-1 text-sm font-medium">{indicator.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-500">Current Achievement</div>
                    <div className="text-lg font-semibold text-gray-900">{indicator.current.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Measurement Method</div>
                    <div className="text-sm text-gray-900">{indicator.measurement}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Success Criteria</div>
                    <div className="text-sm text-gray-900">{indicator.successCriteria}</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      indicator.status === 'on-track' ? 'bg-green-500' : 
                      indicator.status === 'behind' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((indicator.current / indicator.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((indicator.current / indicator.target) * 100)}% of target achieved
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Progress Reports */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Progress Reports</h3>
            {canUploadProgress && (
              <Link
                href={`/programs/projects/${projectId}/upload`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Upload New Report
              </Link>
            )}
          </div>
          <div className="space-y-4">
            {project.progressReports.map((report, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{report.uploader}</div>
                    <div className="text-sm text-gray-500">{report.date}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {report.documentsAttached} documents attached
                  </div>
                </div>
                <p className="text-gray-700">{report.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
