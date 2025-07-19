"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import {
  ClipboardDocumentListIcon,
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
  FlagIcon,
  BellIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"

function PerformancePlansContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("my-plans")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedDeliverable, setSelectedDeliverable] = useState<any>(null)
  const [progressValue, setProgressValue] = useState(0)
  const [progressComment, setProgressComment] = useState("")
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false)

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const metadata = {
    title: "Performance Plans",
    description: "Create and manage performance plans with key deliverables",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Performance Plans" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Export Plans
      </button>
      <Link href="/hr/performance/plans/create">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Plan
        </button>
      </Link>
    </>
  )

  // Check user permissions for HR access
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')
  const isSecretariatMember = userPermissions.includes('hr.secretariat_access')
  const canViewAllPlans = isHRStaff || userPermissions.includes('hr.view_all_performance')

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Plans</span>
            <span className="font-semibold text-blue-600">
              {canViewAllPlans ? "324" : "1"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Approved</span>
            <span className="font-semibold text-green-600">
              {canViewAllPlans ? "298" : "1"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Pending Review</span>
            <span className="font-semibold text-yellow-600">
              {canViewAllPlans ? "18" : "0"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Draft</span>
            <span className="font-semibold text-gray-600">
              {canViewAllPlans ? "8" : "0"}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Planning Year</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>

      {canViewAllPlans && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Operations</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                </div>
                <span className="text-xs text-gray-500">92%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Healthcare</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "88%" }}></div>
                </div>
                <span className="text-xs text-gray-500">88%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Finance</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <span className="text-xs text-gray-500">75%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/hr/performance/plans/create" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Create New Plan
          </Link>
          {canViewAllPlans && (
            <>
              <Link href="/hr/performance/plans/templates" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Plan Templates
              </Link>
              <Link href="/hr/performance/plans/bulk-approve" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Bulk Approve
              </Link>
            </>
          )}
          <Link href="/hr/performance/appraisals" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            View Appraisals
          </Link>
        </div>
      </div>
    </div>
  )

  const performancePlans = [
    {
      id: 1,
      employeeName: session?.user?.name || "Current User",
      employeeId: session?.user?.id || "EMP001",
      department: session?.user?.department || "Operations",
      position: session?.user?.position || "Operations Manager",
      year: 2024,
      status: "approved",
      submittedAt: "2024-01-15T10:30:00Z",
      approvedAt: "2024-01-20T14:15:00Z",
      supervisor: "Mark Wilson",
      reviewer: "Sarah Johnson",
      deliverables: 5,
      completedDeliverables: 3,
      overallProgress: 68,
      lastUpdated: "2024-01-25T09:00:00Z"
    },
    // Add conditional data based on user permissions
    ...(canViewAllPlans ? [
      {
        id: 2,
        employeeName: "Michael Adebayo",
        employeeId: "EMP002",
        department: "Healthcare",
        position: "Healthcare Coordinator",
        year: 2024,
        status: "pending-review",
        submittedAt: "2024-01-18T16:45:00Z",
        approvedAt: null,
        supervisor: "Dr. Amina Hassan",
        reviewer: "Sarah Johnson",
        deliverables: 4,
        completedDeliverables: 1,
        overallProgress: 25,
        lastUpdated: "2024-01-24T11:30:00Z"
      },
      {
        id: 3,
        employeeName: "David Okonkwo",
        employeeId: "EMP004",
        department: "Finance",
        position: "Financial Analyst",
        year: 2024,
        status: "draft",
        submittedAt: null,
        approvedAt: null,
        supervisor: "Jennifer Smith",
        reviewer: "Mark Wilson",
        deliverables: 6,
        completedDeliverables: 0,
        overallProgress: 15,
        lastUpdated: "2024-01-23T14:20:00Z"
      }
    ] : [])
  ]

  const sampleDeliverables = [
    {
      id: 1,
      keyDeliverable: "Improve Team Productivity",
      activity: "Implement new workflow automation tools and train team members",
      timeline: "Q1 2024 - Q2 2024",
      successIndicator: "20% increase in task completion rate, 95% team adoption",
      supportDepartment: "IT Department, Training Unit",
      progress: 75,
      status: "on-track",
      lastUpdate: "2024-01-25T09:00:00Z"
    },
    {
      id: 2,
      keyDeliverable: "Reduce Operational Costs",
      activity: "Conduct cost analysis and implement optimization strategies",
      timeline: "Q1 2024 - Q3 2024",
      successIndicator: "15% reduction in operational expenses, maintain service quality",
      supportDepartment: "Finance Department, Procurement",
      progress: 45,
      status: "on-track",
      lastUpdate: "2024-01-20T15:30:00Z"
    },
    {
      id: 3,
      keyDeliverable: "Enhance Customer Satisfaction",
      activity: "Implement customer feedback system and resolve pending issues",
      timeline: "Q2 2024 - Q4 2024",
      successIndicator: "Customer satisfaction score above 90%, response time under 24hrs",
      supportDepartment: "Customer Service, Quality Assurance",
      progress: 30,
      status: "at-risk",
      lastUpdate: "2024-01-18T11:45:00Z"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending-review":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "rejected":
        return "bg-red-100 text-red-800"
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

  const handleUpdateProgress = (deliverable: any) => {
    setSelectedDeliverable(deliverable)
    setProgressValue(deliverable.progress)
    setProgressComment("")
    setShowProgressModal(true)
  }

  const submitProgressUpdate = async () => {
    if (!selectedDeliverable) return
    
    setIsUpdatingProgress(true)
    try {
      // Here you would normally save to database
      console.log("Updating progress:", {
        deliverableId: selectedDeliverable.id,
        progress: progressValue,
        comment: progressComment
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the local data (in real app, this would come from API refresh)
      selectedDeliverable.progress = progressValue
      selectedDeliverable.lastUpdate = new Date().toISOString()
      
      // Close modal
      setShowProgressModal(false)
      setSelectedDeliverable(null)
      setProgressValue(0)
      setProgressComment("")
    } catch (error) {
      console.error("Error updating progress:", error)
    } finally {
      setIsUpdatingProgress(false)
    }
  }

  const closeProgressModal = () => {
    setShowProgressModal(false)
    setSelectedDeliverable(null)
    setProgressValue(0)
    setProgressComment("")
  }

  const getDeliverableStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 text-green-800"
      case "at-risk":
        return "bg-yellow-100 text-yellow-800"
      case "behind":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const tabs = [
    { id: "my-plans", name: "My Plans", icon: ClipboardDocumentListIcon },
    ...(canViewAllPlans ? [
      { id: "all-plans", name: "All Plans", icon: ChartBarIcon },
      { id: "notifications", name: "Notifications", icon: BellIcon }
    ] : []),
    { id: "deliverables", name: "Key Deliverables", icon: FlagIcon }
  ]

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Performance Plans Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {canViewAllPlans ? "324" : "1"}
                </h3>
                <p className="text-sm text-gray-500">Total Plans</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">2024 Planning Year</span>
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
                  {canViewAllPlans ? "298" : "1"}
                </h3>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Approval rate</span>
                <span className="text-green-600 font-medium">92%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {canViewAllPlans ? "18" : "0"}
                </h3>
                <p className="text-sm text-gray-500">Pending Review</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Awaiting approval</span>
                <span className="text-yellow-600 font-medium">Review</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {canViewAllPlans ? "73%" : "68%"}
                </h3>
                <p className="text-sm text-gray-500">Avg Progress</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Overall completion</span>
                <span className="text-purple-600 font-medium">Good</span>
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
            {(activeTab === "my-plans" || activeTab === "all-plans") && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeTab === "my-plans" ? "My Performance Plans" : "All Performance Plans"} - {selectedYear}
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
                      <option>Approved</option>
                      <option>Pending Review</option>
                      <option>Draft</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deliverables</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {performancePlans.map((plan) => (
                        <tr key={plan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{plan.employeeName}</div>
                                <div className="text-sm text-gray-500">{plan.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{plan.department}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                              {plan.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(plan.overallProgress)}`}
                                  style={{ width: `${plan.overallProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{plan.overallProgress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {plan.completedDeliverables}/{plan.deliverables}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {plan.supervisor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(plan.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link href={`/hr/performance/plans/${plan.id}`}>
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </Link>
                              {(plan.employeeId === session?.user?.id || canViewAllPlans) && (
                                <Link href={`/hr/performance/plans/${plan.id}/edit`}>
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

            {activeTab === "deliverables" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Key Deliverables - Current Plan</h3>
                  <Link href="/hr/performance/plans/deliverables/add">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                      Add Deliverable
                    </button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {sampleDeliverables.map((deliverable) => (
                    <div key={deliverable.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{deliverable.keyDeliverable}</h4>
                          <p className="text-sm text-gray-600 mb-3">{deliverable.activity}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDeliverableStatusColor(deliverable.status)}`}>
                          {deliverable.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                          <div className="flex items-center text-sm text-gray-900">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {deliverable.timeline}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Support Department</label>
                          <div className="flex items-center text-sm text-gray-900">
                            <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {deliverable.supportDepartment}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Success Indicator</label>
                        <p className="text-sm text-gray-900">{deliverable.successIndicator}</p>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{deliverable.progress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(deliverable.progress)}`}
                            style={{ width: `${deliverable.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Last updated: {new Date(deliverable.lastUpdate).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleUpdateProgress(deliverable)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ArrowPathIcon className="h-4 w-4 inline mr-1" />
                            Update Progress
                          </button>
                          <Link href={`/hr/performance/plans/deliverables/${deliverable.id}/edit`}>
                            <button className="text-gray-600 hover:text-gray-800 text-sm">
                              <PencilIcon className="h-4 w-4 inline mr-1" />
                              Edit
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "notifications" && canViewAllPlans && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance Plan Notifications</h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-medium text-yellow-800">Pending Approvals</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">18 performance plans require your review and approval.</p>
                  <Link href="/hr/performance/plans?status=pending-review">
                    <button className="mt-2 text-sm text-yellow-800 font-medium hover:text-yellow-900">
                      Review Pending Plans →
                    </button>
                  </Link>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-800">Upcoming Deadlines</h4>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">5 deliverables are approaching their deadlines this week.</p>
                  <Link href="/hr/performance/plans/deadlines">
                    <button className="mt-2 text-sm text-blue-800 font-medium hover:text-blue-900">
                      View Deadlines →
                    </button>
                  </Link>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Recent Completions</h4>
                  </div>
                  <p className="text-sm text-green-700 mt-1">12 deliverables were completed this month across all departments.</p>
                  <Link href="/hr/performance/plans/completed">
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

      {/* Progress Update Modal */}
      {showProgressModal && selectedDeliverable && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Progress
              </h3>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {selectedDeliverable.keyDeliverable}
                </h4>
                <p className="text-sm text-gray-600">
                  Current Progress: {selectedDeliverable.progress}%
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* Visual Progress Bar */}
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressValue)}`}
                      style={{ width: `${progressValue}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Update Comment
                </label>
                <textarea
                  value={progressComment}
                  onChange={(e) => setProgressComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a comment about this progress update..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeProgressModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isUpdatingProgress}
                >
                  Cancel
                </button>
                <button
                  onClick={submitProgressUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isUpdatingProgress}
                >
                  {isUpdatingProgress ? "Updating..." : "Update Progress"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModulePage>
  )
}

export default function PerformancePlansPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PerformancePlansContent />
    </Suspense>
  )
}
