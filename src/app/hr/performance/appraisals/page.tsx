"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
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
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
  const [departments, setDepartments] = useState<any[]>([])
  const [periods, setPeriods] = useState<any[]>([])
  const [performanceAppraisals, setPerformanceAppraisals] = useState<any[]>([])
  const [planDeliverables, setPlanDeliverables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState({
    dueThisWeek: 0,
    progressUpdates: 0,
    completedThisWeek: 0
  })
  const [statistics, setStatistics] = useState({
    totalAppraisals: 0,
    completedAppraisals: 0,
    pendingAppraisals: 0,
    overdueAppraisals: 0,
    averageRating: 0,
    completionRate: 0,
    ratingDistribution: {
      excellent: 0,
      good: 0,
      average: 0,
      belowAverage: 0
    }
  })

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
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Export Appraisals
      </button>
      <Link href="/hr/performance/appraisals/create">
        <button className="inline-flex items-center px-4 py-2 bg-orange-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-700 transition-colors">
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

  // Fetch performance appraisals data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return
      
      setLoading(true)
      try {
        const [appraisalsRes, deliverablesRes, statisticsRes, departmentsRes, periodsRes, notificationsRes] = await Promise.all([
          fetch('/api/hr/performance/appraisals'),
          fetch('/api/hr/performance/deliverables'),
          fetch('/api/hr/performance/appraisals/analytics'),
          fetch('/api/hr/departments'),
          fetch('/api/hr/performance/periods'),
          fetch('/api/hr/performance/notifications')
        ])
        
        if (appraisalsRes.ok) {
          const appraisalsData = await appraisalsRes.json()
          setPerformanceAppraisals(appraisalsData.appraisals || [])
        }
        
        if (deliverablesRes.ok) {
          const deliverablesData = await deliverablesRes.json()
          setPlanDeliverables(deliverablesData.deliverables || [])
        }
        
        if (statisticsRes.ok) {
          const statsResponse = await statisticsRes.json()
          const statsData = statsResponse.data || statsResponse
          setStatistics({
            totalAppraisals: statsData.totalAppraisals || 0,
            completedAppraisals: statsData.completedAppraisals || 0,
            pendingAppraisals: statsData.pendingAppraisals || 0,
            overdueAppraisals: statsData.overdueAppraisals || 0,
            averageRating: statsData.averageRating || 0,
            completionRate: statsData.completionRate || 0,
            ratingDistribution: {
              excellent: statsData.ratingDistribution?.excellent || 0,
              good: statsData.ratingDistribution?.good || 0,
              average: statsData.ratingDistribution?.average || 0,
              belowAverage: statsData.ratingDistribution?.belowAverage || 0
            }
          })
        }

        if (departmentsRes.ok) {
          const departmentsResponse = await departmentsRes.json()
          const departmentsData = departmentsResponse.data || departmentsResponse
          setDepartments(departmentsData)
        }

        if (periodsRes.ok) {
          const periodsResponse = await periodsRes.json()
          const periodsData = periodsResponse.data || periodsResponse
          setPeriods(periodsData)
          // Set the first period as default if none selected
          if (periodsData.length > 0 && !selectedPeriod) {
            setSelectedPeriod(periodsData[0].value)
          }
        }

        if (notificationsRes.ok) {
          const notificationsResponse = await notificationsRes.json()
          const notificationsData = notificationsResponse.data || notificationsResponse
          setNotifications({
            dueThisWeek: notificationsData.dueThisWeek || 0,
            progressUpdates: notificationsData.progressUpdates || 0,
            completedThisWeek: notificationsData.completedThisWeek || 0
          })
        }
      } catch (error) {
        console.error('Error fetching appraisal data:', error)
        setError('Failed to load appraisal data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [session?.user?.id, canViewAllAppraisals])

  const sidebar = (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">Appraisal Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Appraisals</span>
            <span className="font-semibold text-orange-600">
              {loading ? "..." : statistics.totalAppraisals}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="font-semibold text-green-600">
              {loading ? "..." : statistics.completedAppraisals}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">In Progress</span>
            <span className="font-semibold text-orange-600">
              {loading ? "..." : statistics.pendingAppraisals}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Overdue</span>
            <span className="font-semibold text-red-600">
              {loading ? "..." : statistics.overdueAppraisals}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border-l-4 border-gray-500 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">Appraisal Period</h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-orange-500 focus:ring-orange-500"
        >
          {loading ? (
            <option>Loading periods...</option>
          ) : periods.length > 0 ? (
            periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))
          ) : (
            <option value="Current">Current Period</option>
          )}
        </select>
      </div>

      {canViewAllAppraisals && (
        <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
          <h3 className="text-lg font-semibold text-black mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Excellent (4.5-5.0)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: loading ? "0%" : `${statistics.ratingDistribution.excellent}%` }}></div>
                </div>
                <span className="text-xs text-gray-600">
                  {loading ? "..." : `${statistics.ratingDistribution.excellent}%`}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Good (3.5-4.4)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: loading ? "0%" : `${statistics.ratingDistribution.good}%` }}></div>
                </div>
                <span className="text-xs text-gray-600">
                  {loading ? "..." : `${statistics.ratingDistribution.good}%`}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average (2.5-3.4)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{ width: loading ? "0%" : `${statistics.ratingDistribution.average}%` }}></div>
                </div>
                <span className="text-xs text-gray-600">
                  {loading ? "..." : `${statistics.ratingDistribution.average}%`}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Below Average (&lt;2.5)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: loading ? "0%" : `${statistics.ratingDistribution.belowAverage}%` }}></div>
                </div>
                <span className="text-xs text-gray-600">
                  {loading ? "..." : `${statistics.ratingDistribution.belowAverage}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border-l-4 border-black shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/hr/performance/appraisals/create" className="block w-full text-left p-2 text-sm text-orange-600 hover:bg-orange-50 rounded transition-colors">
            Start New Appraisal
          </Link>
          <Link href="/hr/performance/plans" className="block w-full text-left p-2 text-sm text-orange-600 hover:bg-orange-50 rounded transition-colors">
            View Performance Plans
          </Link>
          {canViewAllAppraisals && (
            <>
              <Link href="/hr/performance/appraisals/bulk-review" className="block w-full text-left p-2 text-sm text-orange-600 hover:bg-orange-50 rounded transition-colors">
                Bulk Review
              </Link>
              <Link href="/hr/performance/appraisals/analytics" className="block w-full text-left p-2 text-sm text-orange-600 hover:bg-orange-50 rounded transition-colors">
                Analytics Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // Data is now loaded via useEffect and stored in state

  // planDeliverables data is now loaded via useEffect and stored in state

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
      <div className="w-full space-y-6">
        {/* Performance Appraisals Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-l-4 border-l-orange-500 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DocumentCheckIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-black">
                  {loading ? "..." : statistics.totalAppraisals}
                </h3>
                <p className="text-sm text-gray-600">Total Appraisals</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{selectedPeriod}</span>
                <span className="text-orange-600 font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-l-4 border-l-green-500 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-black">
                  {loading ? "..." : statistics.completedAppraisals}
                </h3>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion rate</span>
                <span className="text-green-600 font-medium">
                  {loading ? "..." : `${statistics.completionRate}%`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-l-4 border-l-gray-500 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-black">
                  {loading ? "..." : (statistics.averageRating || 0).toFixed(1)}
                </h3>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Out of 5.0</span>
                <span className="text-gray-600 font-medium">Good</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-l-4 border-l-red-500 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-black">
                  {loading ? "..." : statistics.overdueAppraisals}
                </h3>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Needs attention</span>
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
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
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
                    <select 
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="All Departments">All Departments</option>
                      {departments.length > 0 ? (
                        departments.map(dept => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))
                      ) : loading ? (
                        <option disabled>Loading departments...</option>
                      ) : null}
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
                    <thead className="bg-gray-50 border-t-2 border-orange-500">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Plan Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Supervisor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Updated</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {performanceAppraisals.map((appraisal) => (
                        <tr key={appraisal.id} className="hover:bg-orange-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-orange-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-black">{appraisal.employeeName}</div>
                                <div className="text-sm text-gray-600">{appraisal.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm text-black">{appraisal.department}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appraisal.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appraisal.status)}`}>
                              {appraisal.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
                              <Link href={`/hr/performance/appraisals/create?appraisalId=${appraisal.id}`}>
                                <button className="text-orange-600 hover:text-orange-900 transition-colors">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </Link>
                              {(appraisal.employeeId === session?.user?.id || canViewAllAppraisals) && (
                                <Link href={`/hr/performance/appraisals/create?appraisalId=${appraisal.id}&edit=true`}>
                                  <button className="text-gray-600 hover:text-black transition-colors">
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
                          {deliverable.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
                  <p className="text-sm text-red-700 mt-1">
                    {loading ? "Loading..." : `${statistics.overdueAppraisals} appraisals are overdue and require immediate attention.`}
                  </p>
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
                  <p className="text-sm text-yellow-700 mt-1">
                    {loading ? "Loading..." : `${notifications.dueThisWeek} appraisals are due for completion this week.`}
                  </p>
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
                  <p className="text-sm text-blue-700 mt-1">
                    {loading ? "Loading..." : `${notifications.progressUpdates} new progress updates have been submitted for review.`}
                  </p>
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
                  <p className="text-sm text-green-700 mt-1">
                    {loading ? "Loading..." : `${notifications.completedThisWeek} appraisals were completed and submitted this week.`}
                  </p>
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
