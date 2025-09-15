"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("my-plans")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedDeliverable, setSelectedDeliverable] = useState<any>(null)
  const [progressValue, setProgressValue] = useState(0)
  const [progressComment, setProgressComment] = useState("")
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false)
  
  // New state for real data with workflow support
  const [performancePlans, setPerformancePlans] = useState<any[]>([])
  const [statistics, setStatistics] = useState({
    total: 0,
    totalPlans: 0,
    draft: 0,
    supervisorReview: 0,
    supervisorApproved: 0,
    reviewerReview: 0,
    reviewerApproved: 0,
    completed: 0,
    pendingApproval: 0,
    pendingReview: 0,
    approved: 0,
    approvalRate: 0,
    avgProgress: 0
  })
  const [userRole, setUserRole] = useState({
    isHR: false,
    isSupervisor: false,
    isReviewer: false,
    canCreatePlans: false,
    canApprovePlans: false,
    canReviewPlans: false,
    canSeeAllPlans: false,
    canAssignReviewers: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewers, setReviewers] = useState<any[]>([])
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [workflowAction, setWorkflowAction] = useState('')
  const [workflowComment, setWorkflowComment] = useState('')
  const [selectedReviewer, setSelectedReviewer] = useState('')
  const [isProcessingWorkflow, setIsProcessingWorkflow] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [activities, setActivities] = useState<Array<{
    id: string;
    keyDeliverable: string;
    activity: string;
    timeline: string;
    supportDepartment: string;
    successIndicator: string;
    progress: number;
    status: string;
    lastUpdate: string;
    performancePlan?: {
      id: string;
      employee: string;
      department: string;
    };
  }>>([])
  const [departments, setDepartments] = useState<Array<{
    id: string;
    name: string;
    completionRate: number;
    totalPlans: number;
    completedPlans: number;
  }>>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Get status filter for tab
  const getStatusForTab = (tab: string) => {
    switch (tab) {
      case 'my-plans': return 'all'
      case 'draft': return 'draft'
      case 'pending': return 'supervisor-review,reviewer-review'
      case 'approved': return 'supervisor-approved,reviewer-approved,completed'
      default: return 'all'
    }
  }

  // Fetch activities data
  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/hr/performance/activities')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setActivities(data.activities)
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  // Fetch departments data
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDepartments(data.departments)
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  // Generate available years (current year and previous 10 years, plus next 10 years)
  const generateAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    
    // Add previous 10 years, current year, and next 10 years
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i)
    }
    
    setAvailableYears(years.reverse()) // Most recent first
    
    // Set current year as default if selectedYear is still the old hardcoded value
    if (selectedYear === "2024" && currentYear !== 2024) {
      setSelectedYear(currentYear.toString())
    }
  }

  // Fetch performance plans data
  const fetchPerformancePlans = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        year: selectedYear
      })

      if (activeTab !== 'all-plans') {
        params.append('status', getStatusForTab(activeTab))
      }

      const response = await fetch(`/api/hr/performance/plans?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setPerformancePlans(data.data || [])
        setStatistics({
          total: 0,
          totalPlans: 0,
          draft: 0,
          supervisorReview: 0,
          supervisorApproved: 0,
          reviewerReview: 0,
          reviewerApproved: 0,
          completed: 0,
          pendingApproval: 0,
          pendingReview: 0,
          approved: 0,
          approvalRate: 0,
          avgProgress: 0,
          ...data.statistics
        })
        setUserRole(data.userRole || {})
        
        // Set notifications based on statistics
        const notificationList = []
        if (data.statistics?.pendingApproval > 0) {
          notificationList.push({
            type: 'warning',
            title: 'Pending Approvals',
            message: `${data.statistics.pendingApproval} performance plans require your review and approval.`,
            action: 'Review Pending Plans →',
            link: '/hr/performance/plans?tab=pending'
          })
        }
        
        if (data.statistics?.pendingReview > 0) {
          notificationList.push({
            type: 'info',
            title: 'Upcoming Deadlines', 
            message: `${data.statistics.pendingReview} plans are approaching their deadlines this week.`,
            action: 'View Deadlines →',
            link: '/hr/performance/plans?tab=review'
          })
        }
        
        if (data.statistics?.completed > 0) {
          notificationList.push({
            type: 'success',
            title: 'Recent Completions',
            message: `${data.statistics.completed} plans were completed this month across all departments.`,
            action: 'View Completed →',
            link: '/hr/performance/plans?tab=completed'
          })
        }
        
        setNotifications(notificationList)
      } else {
        console.error('Failed to fetch performance plans')
        setError('Failed to load performance plans')
      }

    } catch (error) {
      console.error('Error fetching performance plans:', error)
      setError('Failed to load performance plans')
    } finally {
      setLoading(false)
    }
  }

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/hr/performance/plans'))
      return
    }
  }, [status, router])

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    if (session?.user) {
      fetchPerformancePlans()
      fetchActivities()
      fetchDepartments()
    }
  }, [selectedYear, activeTab, session])

  // Generate available years on component mount
  useEffect(() => {
    generateAvailableYears()
  }, [])

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

  // Show loading state while authentication is being checked
  if (status === 'loading') {
    return (
      <ModulePage metadata={metadata}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ModulePage>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
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
              {loading ? "..." : statistics.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Draft</span>
            <span className="font-semibold text-gray-600">
              {loading ? "..." : statistics.draft}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Supervisor Review</span>
            <span className="font-semibold text-orange-600">
              {loading ? "..." : statistics.supervisorReview}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Reviewer Review</span>
            <span className="font-semibold text-yellow-600">
              {loading ? "..." : statistics.reviewerReview}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="font-semibold text-green-600">
              {loading ? "..." : statistics.completed}
            </span>
          </div>
        </div>
      </div>
      
      {userRole.isHR && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Approval</span>
              <span className="font-medium text-red-600">
                {loading ? "..." : statistics.pendingApproval}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supervisor Approved</span>
              <span className="font-medium text-blue-600">
                {loading ? "..." : statistics.supervisorApproved}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reviewer Approved</span>
              <span className="font-medium text-indigo-600">
                {loading ? "..." : statistics.reviewerApproved}
              </span>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Planning Year</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm max-h-32 overflow-y-auto"
        >
          {availableYears.map((year) => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {canViewAllPlans && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Summary</h3>
          <div className="space-y-3">
            {departments.length > 0 ? (
              departments.map((dept, index) => {
                const getProgressColor = (rate: number) => {
                  if (rate >= 90) return 'bg-green-500'
                  if (rate >= 70) return 'bg-blue-500'
                  if (rate >= 50) return 'bg-yellow-500'
                  return 'bg-red-500'
                }
                
                return (
                  <div key={dept.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{dept.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(dept.completionRate)}`} 
                          style={{ width: `${Math.min(dept.completionRate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{Math.round(dept.completionRate)}%</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-sm text-gray-500">Loading department data...</div>
            )}
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

  // Fetch performance plans with workflow support


  // Fetch available reviewers
  const fetchReviewers = async () => {
    try {
      const response = await fetch('/api/hr/performance/reviewers')
      if (response.ok) {
        const data = await response.json()
        setReviewers(data.reviewers || [])
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error)
    }
  }

  // Handle workflow actions
  const handleWorkflowAction = async (plan: any, action: string) => {
    setSelectedPlan(plan)
    setWorkflowAction(action)
    setWorkflowComment('')
    setSelectedReviewer('')

    if (action === 'assign-reviewer') {
      await fetchReviewers()
    }

    setShowWorkflowModal(true)
  }

  // Process workflow action
  const processWorkflowAction = async () => {
    if (!selectedPlan || !workflowAction) return

    try {
      setIsProcessingWorkflow(true)

      const requestData: any = {
        action: workflowAction,
        comment: workflowComment
      }

      if (workflowAction === 'assign-reviewer' && selectedReviewer) {
        requestData.reviewerId = selectedReviewer
      }

      const response = await fetch(
        `/api/hr/performance/plans/${selectedPlan.id}/workflow`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        }
      )

      if (response.ok) {
        const data = await response.json()
        setShowWorkflowModal(false)
        fetchPerformancePlans() // Refresh the list
        // Could add a success toast here
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to process workflow action')
      }

    } catch (error) {
      console.error('Error processing workflow:', error)
      setError('Failed to process workflow action')
    } finally {
      setIsProcessingWorkflow(false)
    }
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "supervisor-review":
        return "bg-orange-100 text-orange-800"
      case "supervisor-approved":
        return "bg-blue-100 text-blue-800"
      case "reviewer-review":
        return "bg-yellow-100 text-yellow-800"
      case "reviewer-approved":
        return "bg-indigo-100 text-indigo-800"
      case "completed":
        return "bg-green-100 text-green-800"
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

  // Convert next action text to API action
  const getActionFromNextAction = (nextAction: string) => {
    switch (nextAction) {
      case 'Submit for Supervisor Review':
        return 'submit'
      case 'Supervisor Approval Required':
        return 'supervisor-approve'
      case 'Assign Reviewer':
        return 'assign-reviewer'
      case 'Reviewer Approval Required':
        return 'reviewer-approve'
      case 'Ready for Final Completion':
        return 'complete'
      default:
        return 'unknown'
    }
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchPerformancePlans}
              className="mt-2 text-sm text-red-700 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {statistics.totalPlans}
                  </h3>
                  <p className="text-sm text-gray-500">Total Plans</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{selectedYear} Planning Year</span>
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
                    {statistics.approved}
                  </h3>
                  <p className="text-sm text-gray-500">Approved</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Approval rate</span>
                  <span className="text-green-600 font-medium">
                    {statistics.approvalRate}%
                  </span>
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
                    {statistics.pendingReview}
                  </h3>
                  <p className="text-sm text-gray-500">Pending Review</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Awaiting approval</span>
                  <span className="text-yellow-600 font-medium">
                    {statistics.pendingReview > 0 ? 'Review' : 'None'}
                  </span>
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
                    {statistics.avgProgress}%
                  </h3>
                  <p className="text-sm text-gray-500">Avg Progress</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Overall completion</span>
                  <span className="text-purple-600 font-medium">
                    {statistics.avgProgress >= 80 ? 'Excellent' : 
                     statistics.avgProgress >= 60 ? 'Good' : 
                     statistics.avgProgress >= 40 ? 'Fair' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                        {userRole.isHR && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                        )}
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
                              {plan.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {plan.nextAction && (
                              <div className="flex items-center space-x-2">
                                {plan.canUserAct ? (
                                  <button
                                    onClick={() => handleWorkflowAction(plan, getActionFromNextAction(plan.nextAction))}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                                  >
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    {plan.nextAction}
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    {plan.nextAction}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {plan.supervisor}
                          </td>
                          {userRole.isHR && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {plan.reviewer || 'Not assigned'}
                            </td>
                          )}
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
                              {(plan.employeeId === session?.user?.id || userRole.canSeeAllPlans) && (
                                <Link href={`/hr/performance/plans/${plan.id}/edit`}>
                                  <button className="text-gray-600 hover:text-gray-900">
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                </Link>
                              )}
                              {plan.canUserAct && (
                                <button
                                  onClick={() => handleWorkflowAction(plan, getActionFromNextAction(plan.nextAction))}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
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
                  {activities.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <FlagIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-sm font-medium text-gray-600 mb-1">No Key Deliverables Found</h4>
                      <p className="text-sm text-gray-500">Start by creating performance plans with key deliverables and activities.</p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="bg-white border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">{activity.keyDeliverable}</h4>
                            <p className="text-sm text-gray-600 mb-3">{activity.activity}</p>
                            {activity.performancePlan && (
                              <div className="text-xs text-gray-500 mb-2">
                                <span className="font-medium">Employee:</span> {activity.performancePlan.employee} 
                                <span className="ml-3 font-medium">Department:</span> {activity.performancePlan.department}
                              </div>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDeliverableStatusColor(activity.status)}`}>
                            {activity.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                            <div className="flex items-center text-sm text-gray-900">
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {activity.timeline}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Support Department</label>
                            <div className="flex items-center text-sm text-gray-900">
                              <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {activity.supportDepartment}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Success Indicator</label>
                          <p className="text-sm text-gray-900">{activity.successIndicator}</p>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{activity.progress}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(activity.progress)}`}
                              style={{ width: `${activity.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Last updated: {new Date(activity.lastUpdate).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleUpdateProgress(activity)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <ArrowPathIcon className="h-4 w-4 inline mr-1" />
                              Update Progress
                            </button>
                            <Link href={`/hr/performance/plans/deliverables/${activity.id}/edit`}>
                              <button className="text-gray-600 hover:text-gray-800 text-sm">
                                <PencilIcon className="h-4 w-4 inline mr-1" />
                                Edit
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "notifications" && canViewAllPlans && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance Plan Notifications</h3>
                
                {notifications.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">No notifications at this time.</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      notification.type === 'info' ? 'bg-blue-50 border-blue-200' :
                      notification.type === 'success' ? 'bg-green-50 border-green-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center">
                        {notification.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />}
                        {notification.type === 'info' && <BellIcon className="h-5 w-5 text-blue-600 mr-2" />}
                        {notification.type === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />}
                        <h4 className={`font-medium ${
                          notification.type === 'warning' ? 'text-yellow-800' :
                          notification.type === 'info' ? 'text-blue-800' :
                          notification.type === 'success' ? 'text-green-800' :
                          'text-gray-800'
                        }`}>{notification.title}</h4>
                      </div>
                      <p className={`text-sm mt-1 ${
                        notification.type === 'warning' ? 'text-yellow-700' :
                        notification.type === 'info' ? 'text-blue-700' :
                        notification.type === 'success' ? 'text-green-700' :
                        'text-gray-700'
                      }`}>{notification.message}</p>
                      <Link href={notification.link}>
                        <button className={`mt-2 text-sm font-medium ${
                          notification.type === 'warning' ? 'text-yellow-800 hover:text-yellow-900' :
                          notification.type === 'info' ? 'text-blue-800 hover:text-blue-900' :
                          notification.type === 'success' ? 'text-green-800 hover:text-green-900' :
                          'text-gray-800 hover:text-gray-900'
                        }`}>
                          {notification.action}
                        </button>
                      </Link>
                    </div>
                  ))
                )}
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

      {/* Workflow Action Modal */}
      {showWorkflowModal && selectedPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {workflowAction === 'submit' && 'Submit Plan for Review'}
                {workflowAction === 'supervisor-approve' && 'Approve Performance Plan'}
                {workflowAction === 'supervisor-reject' && 'Request Changes'}
                {workflowAction === 'assign-reviewer' && 'Assign Reviewer'}
                {workflowAction === 'reviewer-approve' && 'Approve Plan (Reviewer)'}
                {workflowAction === 'reviewer-reject' && 'Send Back for Changes'}
                {workflowAction === 'complete' && 'Complete Performance Plan'}
              </h3>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="font-semibold text-gray-800">
                  {selectedPlan.employeeName}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedPlan.department} • {selectedPlan.position}
                </p>
                <p className="text-sm text-gray-600">
                  Current Status: <span className="font-medium">{selectedPlan.status}</span>
                </p>
              </div>

              {workflowAction === 'assign-reviewer' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Reviewer
                  </label>
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a reviewer...</option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name} - {reviewer.department} 
                        {reviewer.currentWorkload > 0 && ` (${reviewer.currentWorkload} plans)`}
                      </option>
                    ))}
                  </select>
                  {selectedReviewer && (
                    <div className="mt-2 text-sm">
                      {(() => {
                        const reviewer = reviewers.find(r => r.id === selectedReviewer)
                        return reviewer && (
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              reviewer.availability === 'available' ? 'bg-green-100 text-green-800' :
                              reviewer.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {reviewer.availability}
                            </span>
                            <span className="text-gray-600">
                              Current workload: {reviewer.currentWorkload} plans
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {workflowAction.includes('reject') ? 'Reason for rejection' :
                   workflowAction.includes('approve') ? 'Approval comments (optional)' :
                   'Comments'}
                </label>
                <textarea
                  value={workflowComment}
                  onChange={(e) => setWorkflowComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    workflowAction.includes('reject') ? 'Please provide feedback for improvements...' :
                    'Add any comments about this action...'
                  }
                  required={workflowAction.includes('reject')}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowWorkflowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isProcessingWorkflow}
                >
                  Cancel
                </button>
                <button
                  onClick={processWorkflowAction}
                  className={`px-4 py-2 rounded-md text-white disabled:opacity-50 ${
                    workflowAction.includes('reject') ? 'bg-red-600 hover:bg-red-700' :
                    workflowAction.includes('approve') || workflowAction === 'complete' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={
                    isProcessingWorkflow || 
                    (workflowAction === 'assign-reviewer' && !selectedReviewer) ||
                    (workflowAction.includes('reject') && !workflowComment.trim())
                  }
                >
                  {isProcessingWorkflow ? "Processing..." : 
                   workflowAction.includes('reject') ? 'Send Back' :
                   workflowAction.includes('approve') ? 'Approve' :
                   workflowAction === 'submit' ? 'Submit' :
                   workflowAction === 'assign-reviewer' ? 'Assign Reviewer' :
                   workflowAction === 'complete' ? 'Complete Plan' : 'Confirm'}
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
