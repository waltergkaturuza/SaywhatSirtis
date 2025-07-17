"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  DocumentCheckIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  StarIcon,
  BellIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline"

export default function PerformanceAppraisalsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("my-appraisals")
  const [selectedPeriod, setSelectedPeriod] = useState("Q1-2024")

  const metadata = {
    title: "Performance Appraisals",
    description: "Conduct and manage performance appraisals with progress updates",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Performance Appraisals" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Export Appraisals
      </button>
      <Link href="/hr/performance/appraisals/create">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Appraisal
        </button>
      </Link>
    </>
  )

  // Check user permissions for HR access
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')
  const isSecretariatMember = userPermissions.includes('hr.secretariat_access')
  const canViewAllAppraisals = isHRStaff || userPermissions.includes('hr.view_all_performance')

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appraisal Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Appraisals</span>
            <span className="font-semibold text-blue-600">
              {canViewAllAppraisals ? "324" : "4"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="font-semibold text-green-600">
              {canViewAllAppraisals ? "287" : "3"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">In Progress</span>
            <span className="font-semibold text-yellow-600">
              {canViewAllAppraisals ? "25" : "1"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Overdue</span>
            <span className="font-semibold text-red-600">
              {canViewAllAppraisals ? "12" : "0"}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appraisal Period</h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="Q1-2024">Q1 2024</option>
          <option value="Q4-2023">Q4 2023</option>
          <option value="Q3-2023">Q3 2023</option>
          <option value="Annual-2023">Annual 2023</option>
        </select>
      </div>

      {canViewAllAppraisals && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Excellent (4.5-5.0)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "42%" }}></div>
                </div>
                <span className="text-xs text-gray-500">42%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Good (3.5-4.4)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "38%" }}></div>
                </div>
                <span className="text-xs text-gray-500">38%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average (2.5-3.4)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                </div>
                <span className="text-xs text-gray-500">15%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Below Average (&lt;2.5)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: "5%" }}></div>
                </div>
                <span className="text-xs text-gray-500">5%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/hr/performance/appraisals/create" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Start New Appraisal
          </Link>
          <Link href="/hr/performance/plans" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            View Performance Plans
          </Link>
          {canViewAllAppraisals && (
            <>
              <Link href="/hr/performance/appraisals/bulk-review" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Bulk Review
              </Link>
              <Link href="/hr/performance/appraisals/analytics" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Analytics Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const performanceAppraisals = [
    {
      id: 1,
      employeeName: session?.user?.name || "Current User",
      employeeId: session?.user?.id || "EMP001",
      department: session?.user?.department || "Operations",
      position: session?.user?.position || "Operations Manager",
      period: "Q1 2024",
      overallRating: 4.5,
      status: "completed",
      submittedAt: "2024-01-28T14:30:00Z",
      reviewedAt: "2024-01-30T16:45:00Z",
      supervisor: "Mark Wilson",
      reviewer: "Sarah Johnson",
      planProgress: 85,
      strengths: "Excellent leadership skills, proactive problem-solving",
      areasImprovement: "Time management, delegation",
      goals: "Focus on strategic planning and team development",
      lastUpdated: "2024-01-30T16:45:00Z"
    },
    // Add conditional data based on user permissions
    ...(canViewAllAppraisals ? [
      {
        id: 2,
        employeeName: "Michael Adebayo",
        employeeId: "EMP002",
        department: "Healthcare",
        position: "Healthcare Coordinator",
        period: "Q1 2024",
        overallRating: null,
        status: "in-progress",
        submittedAt: null,
        reviewedAt: null,
        supervisor: "Dr. Amina Hassan",
        reviewer: "Sarah Johnson",
        planProgress: 65,
        strengths: "",
        areasImprovement: "",
        goals: "",
        lastUpdated: "2024-01-25T10:15:00Z"
      },
      {
        id: 3,
        employeeName: "David Okonkwo",
        employeeId: "EMP004",
        department: "Finance",
        position: "Financial Analyst",
        period: "Q1 2024",
        overallRating: 4.2,
        status: "completed",
        submittedAt: "2024-01-26T11:20:00Z",
        reviewedAt: "2024-01-29T09:30:00Z",
        supervisor: "Jennifer Smith",
        reviewer: "Mark Wilson",
        planProgress: 78,
        strengths: "Strong analytical skills, attention to detail",
        areasImprovement: "Communication, presentation skills",
        goals: "Develop advanced financial modeling expertise",
        lastUpdated: "2024-01-29T09:30:00Z"
      },
      {
        id: 4,
        employeeName: "Fatima Bello",
        employeeId: "EMP005",
        department: "HR",
        position: "HR Specialist",
        period: "Q1 2024",
        overallRating: null,
        status: "overdue",
        submittedAt: null,
        reviewedAt: null,
        supervisor: "Sarah Johnson",
        reviewer: "Mark Wilson",
        planProgress: 45,
        strengths: "",
        areasImprovement: "",
        goals: "",
        lastUpdated: "2024-01-20T14:00:00Z"
      }
    ] : [])
  ]

  const planDeliverables = [
    {
      id: 1,
      keyDeliverable: "Improve Team Productivity",
      activity: "Implement workflow automation",
      planProgress: 85,
      currentUpdate: "Successfully implemented automation tools, team training completed",
      timeline: "Q1-Q2 2024",
      successIndicator: "20% increase in productivity",
      actualProgress: "22% increase achieved",
      status: "completed",
      lastUpdate: "2024-01-28T09:00:00Z"
    },
    {
      id: 2,
      keyDeliverable: "Reduce Operational Costs",
      activity: "Cost analysis and optimization",
      planProgress: 60,
      currentUpdate: "Completed cost analysis, implementing optimization strategies",
      timeline: "Q1-Q3 2024",
      successIndicator: "15% cost reduction",
      actualProgress: "8% reduction so far, on track for target",
      status: "on-track",
      lastUpdate: "2024-01-25T15:30:00Z"
    },
    {
      id: 3,
      keyDeliverable: "Customer Satisfaction Enhancement",
      activity: "Feedback system implementation",
      planProgress: 40,
      currentUpdate: "Feedback system deployed, analyzing initial responses",
      timeline: "Q2-Q4 2024",
      successIndicator: "90% satisfaction score",
      actualProgress: "Initial deployment completed, data collection ongoing",
      status: "in-progress",
      lastUpdate: "2024-01-22T11:45:00Z"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getDeliverableStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "on-track":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "at-risk":
        return "bg-orange-100 text-orange-800"
      case "behind":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">Not rated</span>
    
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}</span>
      </div>
    )
  }

  const tabs = [
    { id: "my-appraisals", name: "My Appraisals", icon: DocumentCheckIcon },
    ...(canViewAllAppraisals ? [
      { id: "all-appraisals", name: "All Appraisals", icon: ChartBarIcon },
      { id: "notifications", name: "Notifications", icon: BellIcon }
    ] : []),
    { id: "plan-progress", name: "Plan Progress Updates", icon: ArrowPathIcon }
  ]

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Performance Appraisals Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {canViewAllAppraisals ? "324" : "4"}
                </h3>
                <p className="text-sm text-gray-500">Total Appraisals</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{selectedPeriod}</span>
                <span className="text-blue-600 font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {canViewAllAppraisals ? "287" : "3"}
                </h3>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completion rate</span>
                <span className="text-green-600 font-medium">89%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">4.3</h3>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Out of 5.0</span>
                <span className="text-yellow-600 font-medium">Good</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {canViewAllAppraisals ? "12" : "0"}
                </h3>
                <p className="text-sm text-gray-500">Overdue</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Needs attention</span>
                <span className="text-red-600 font-medium">Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {(activeTab === "my-appraisals" || activeTab === "all-appraisals") && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeTab === "my-appraisals" ? "My Performance Appraisals" : "All Performance Appraisals"} - {selectedPeriod}
                  </h3>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Departments</option>
                      <option>Operations</option>
                      <option>Healthcare</option>
                      <option>Finance</option>
                      <option>HR</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Status</option>
                      <option>Completed</option>
                      <option>In Progress</option>
                      <option>Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {performanceAppraisals.map((appraisal) => (
                        <tr key={appraisal.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{appraisal.employeeName}</div>
                                <div className="text-sm text-gray-500">{appraisal.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{appraisal.department}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appraisal.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appraisal.status)}`}>
                              {appraisal.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStars(appraisal.overallRating)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(appraisal.planProgress)}`}
                                  style={{ width: `${appraisal.planProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{appraisal.planProgress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appraisal.supervisor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(appraisal.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link href={`/hr/performance/appraisals/${appraisal.id}`}>
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </Link>
                              {(appraisal.employeeId === session?.user?.id || canViewAllAppraisals) && (
                                <Link href={`/hr/performance/appraisals/${appraisal.id}/edit`}>
                                  <button className="text-gray-600 hover:text-gray-900">
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "plan-progress" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Plan Progress Updates</h3>
                  <div className="text-sm text-gray-500">Current Plan: {selectedPeriod}</div>
                </div>

                <div className="space-y-4">
                  {planDeliverables.map((deliverable) => (
                    <div key={deliverable.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{deliverable.keyDeliverable}</h4>
                          <p className="text-sm text-gray-600 mb-2">{deliverable.activity}</p>
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {deliverable.timeline}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDeliverableStatusColor(deliverable.status)}`}>
                          {deliverable.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Success Indicator</label>
                          <p className="text-sm text-gray-900">{deliverable.successIndicator}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Actual Progress</label>
                          <p className="text-sm text-gray-900">{deliverable.actualProgress}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Update</label>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                            <p className="text-sm text-blue-900">{deliverable.currentUpdate}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Plan Progress</span>
                          <span className="font-medium">{deliverable.planProgress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(deliverable.planProgress)}`}
                            style={{ width: `${deliverable.planProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Last updated: {new Date(deliverable.lastUpdate).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <Link href={`/hr/performance/appraisals/update-progress/${deliverable.id}`}>
                            <button className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm">
                              <ArrowPathIcon className="h-4 w-4 mr-1" />
                              Update Progress
                            </button>
                          </Link>
                          <Link href={`/hr/performance/plans/deliverables/${deliverable.id}`}>
                            <button className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm">
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Add Progress Update</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Deliverable</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option>Select deliverable to update...</option>
                        {planDeliverables.map(d => (
                          <option key={d.id} value={d.id}>{d.keyDeliverable}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progress Update</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows={3}
                        placeholder="Describe the progress made, challenges faced, and next steps..."
                      />
                    </div>
                    <div className="flex justify-end">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                        Submit Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && canViewAllAppraisals && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Appraisal Notifications</h3>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-800">Overdue Appraisals</h4>
                  </div>
                  <p className="text-sm text-red-700 mt-1">12 appraisals are overdue and require immediate attention.</p>
                  <Link href="/hr/performance/appraisals?status=overdue">
                    <button className="mt-2 text-sm text-red-800 font-medium hover:text-red-900">
                      Review Overdue Appraisals →
                    </button>
                  </Link>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-medium text-yellow-800">Due This Week</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">8 appraisals are due for completion this week.</p>
                  <Link href="/hr/performance/appraisals?due=this-week">
                    <button className="mt-2 text-sm text-yellow-800 font-medium hover:text-yellow-900">
                      View Due Appraisals →
                    </button>
                  </Link>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-800">Progress Updates</h4>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">45 new progress updates have been submitted for review.</p>
                  <Link href="/hr/performance/appraisals/progress-updates">
                    <button className="mt-2 text-sm text-blue-800 font-medium hover:text-blue-900">
                      Review Updates →
                    </button>
                  </Link>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Recent Completions</h4>
                  </div>
                  <p className="text-sm text-green-700 mt-1">23 appraisals were completed and submitted this week.</p>
                  <Link href="/hr/performance/appraisals/completed">
                    <button className="mt-2 text-sm text-green-800 font-medium hover:text-green-900">
                      View Completed →
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
