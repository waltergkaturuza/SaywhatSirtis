"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  DocumentCheckIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"
import { useSession } from "next-auth/react"
import { exportService } from "@/lib/export-service"

interface PlanData {
  id: string
  employeeId: string
  employeeName: string
  employeeEmail: string
  position: string
  department: string
  supervisorId: string
  reviewerId: string | null
  status: string
  planType: string
  planTitle: string
  planYear: string
  startDate: string
  endDate: string
  reviewPeriod: {
    startDate: string
    endDate: string
  }
  jobDescription: {
    jobTitle: string
    keyResponsibilities: any
  } | null
  deliverables: any[]
  valueGoals: any[]
  competencies: any[]
  developmentNeeds: any[]
  comments: {
    employeeComments: string
    supervisorComments: string
    reviewerComments: string
    supervisor?: any[]
    reviewer?: any[]
  }
  supervisorApproval: string
  reviewerApproval: string
  supervisorApprovedAt: string | null
  reviewerApprovedAt: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

// Fetch plan data from API
const fetchPlanData = async (planId: string): Promise<PlanData | null> => {
  try {
    const response = await fetch(`/api/hr/performance/plans/${planId}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch plan: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching plan:', error)
    return null
  }
}

export default function ViewPlanPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const planId = params.id as string
  
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupervisor, setIsSupervisor] = useState(false)
  const [isReviewer, setIsReviewer] = useState(false)
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'submitted' | 'supervisor' | 'reviewer'>('submitted')
  const [currentSupervisorComment, setCurrentSupervisorComment] = useState('')
  const [currentReviewerComment, setCurrentReviewerComment] = useState('')
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false)
  const [workflowComments, setWorkflowComments] = useState<{supervisor: any[], reviewer: any[]}>({supervisor: [], reviewer: []})
  const [exportingPDF, setExportingPDF] = useState(false)
  const planContentRef = useRef<HTMLDivElement>(null)

  // Export plan to PDF
  const handleExportPDF = async () => {
    if (!plan || !planContentRef.current) return
    
    setExportingPDF(true)
    try {
      // Ensure element has an ID for export
      if (!planContentRef.current.id) {
        planContentRef.current.id = 'plan-content-to-export'
      }
      
      await exportService.exportFromElement(planContentRef.current.id, {
        format: 'pdf',
        filename: `Performance_Plan_${plan.employeeName.replace(/\s+/g, '_')}_${plan.planYear}_${Date.now()}.pdf`,
        title: `Performance Plan - ${plan.employeeName}`,
        includeLogo: true,
        includeTimestamp: true,
        orientation: 'portrait',
        pageSize: 'a4'
      })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExportingPDF(false)
    }
  }

  useEffect(() => {
    const loadPlanData = async () => {
      try {
        setLoading(true)
        setError(null)
        const planData = await fetchPlanData(planId)
        
        if (planData) {
          setPlan(planData)
          
          // Check if current user is supervisor or reviewer
          // Note: supervisorId and reviewerId are user IDs
          if (session?.user?.id) {
            const isSupervisorRole = planData.supervisorId === session.user.id
            const isReviewerRole = planData.reviewerId === session.user.id
            
            setIsSupervisor(isSupervisorRole)
            setIsReviewer(isReviewerRole)
            
            // Set default tab based on user role and plan status
            if (planData.status !== 'draft') {
              if (isSupervisorRole && planData.supervisorApproval !== 'approved') {
                setActiveWorkflowTab('supervisor')
              } else if (isReviewerRole && planData.reviewerApproval !== 'approved' && planData.supervisorApproval === 'approved') {
                setActiveWorkflowTab('reviewer')
              } else {
                setActiveWorkflowTab('submitted')
              }
            }
          }
          
          // Load workflow comments if they exist
          if (planData.comments?.supervisor || planData.comments?.reviewer) {
            setWorkflowComments({
              supervisor: Array.isArray(planData.comments.supervisor) ? planData.comments.supervisor : [],
              reviewer: Array.isArray(planData.comments.reviewer) ? planData.comments.reviewer : []
            })
          }
        } else {
          setError('Performance plan not found')
        }
      } catch (err) {
        setError('Failed to load performance plan')
        console.error('Error loading plan:', err)
      } finally {
        setLoading(false)
      }
    }

    if (planId) {
      loadPlanData()
    }
  }, [planId, session?.user?.id])
  
  // Handle workflow action (comment, approve, request_changes)
  const handleWorkflowAction = async (action: 'comment' | 'request_changes' | 'approve' | 'final_approve', role: 'supervisor' | 'reviewer') => {
    if (!plan) return
    
    const comment = role === 'supervisor' ? currentSupervisorComment : currentReviewerComment
    
    if (action === 'request_changes' && !comment) {
      alert('Please provide feedback when requesting changes.')
      return
    }
    
    setSubmittingWorkflow(true)
    try {
      const response = await fetch(`/api/hr/performance/plans/${plan.id}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          comment,
          role
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process workflow action')
      }

      const result = await response.json()
      
      // Reload plan data to get updated comments
      const updatedPlan = await fetchPlanData(planId)
      if (updatedPlan) {
        setPlan(updatedPlan)
        if (updatedPlan.comments?.supervisor || updatedPlan.comments?.reviewer) {
          setWorkflowComments({
            supervisor: Array.isArray(updatedPlan.comments.supervisor) ? updatedPlan.comments.supervisor : [],
            reviewer: Array.isArray(updatedPlan.comments.reviewer) ? updatedPlan.comments.reviewer : []
          })
        }
      }
      
      // Clear current comment
      if (role === 'supervisor') {
        setCurrentSupervisorComment('')
      } else {
        setCurrentReviewerComment('')
      }
      
      alert(result.message || 'Action completed successfully')
    } catch (error) {
      console.error('Error processing workflow action:', error)
      alert(error instanceof Error ? error.message : 'Failed to process workflow action')
    } finally {
      setSubmittingWorkflow(false)
    }
  }

  // Determine if this is a review/supervise context
  const isReviewContext = (isSupervisor || isReviewer) && plan && plan.status !== 'draft'
  const pageTitle = isReviewContext 
    ? (isSupervisor ? `Supervise Employee - ${plan?.employeeName || 'Loading...'}` : `Review Employee - ${plan?.employeeName || 'Loading...'}`)
    : `Performance Plan - ${plan?.employeeName || 'Loading...'}`
  const pageDescription = isReviewContext
    ? (isSupervisor ? "Review and provide feedback on employee performance plan" : "Final review and approval of employee performance plan")
    : "View detailed performance plan information"

  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Plans", href: "/hr/performance/plans" },
      { name: isReviewContext ? (isSupervisor ? "Supervise Employee" : "Review Employee") : (plan?.employeeName || "View Plan") }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800"
      case "submitted":
      case "supervisor_review":
      case "reviewer_assessment":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "revision_requested":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <ModulePage metadata={metadata}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading performance plan...</p>
          </div>
        </div>
      </ModulePage>
    )
  }

  if (error || !plan) {
    return (
      <ModulePage metadata={metadata}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Plan Not Found</h3>
            <p className="mt-2 text-sm text-gray-500">{error || 'The performance plan you are looking for does not exist.'}</p>
            <div className="mt-6">
              <Link
                href="/hr/performance/plans"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Plans
              </Link>
            </div>
          </div>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage metadata={metadata}>
      {/* Header with Export PDF Button */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/hr/performance/plans"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {plan.employeeName}'s Performance Plan
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {plan.planTitle} • {plan.planYear} • {plan.position} • {plan.department}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
              {plan.status}
            </span>
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF || !plan}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className={`h-4 w-4 mr-2 ${exportingPDF ? 'animate-spin' : ''}`} />
              {exportingPDF ? 'Exporting...' : 'Export PDF'}
            </button>
            {!isReviewContext && plan.status === 'draft' && (
              <Link
                href={`/hr/performance/plans/create?planId=${plan.id}&edit=true`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Link>
            )}
          </div>
        </div>
        
        {/* Workflow Tabs */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Workflow Tabs">
              <button
                onClick={() => setActiveWorkflowTab('submitted')}
                className={`flex-1 py-4 px-6 border-b-2 font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
                  activeWorkflowTab === 'submitted'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClipboardDocumentCheckIcon className="h-5 w-5" />
                <span>{plan.employeeName}'s Performance Plan</span>
              </button>
              {isSupervisor && plan.status !== 'draft' && (
                <button
                  onClick={() => setActiveWorkflowTab('supervisor')}
                  className={`flex-1 py-4 px-6 border-b-2 font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
                    activeWorkflowTab === 'supervisor'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Supervisor Review</span>
                </button>
              )}
              {isReviewer && plan.status !== 'draft' && (
                <button
                  onClick={() => setActiveWorkflowTab('reviewer')}
                  className={`flex-1 py-4 px-6 border-b-2 font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
                    activeWorkflowTab === 'reviewer'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Final Review</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>
      
      <div className="space-y-6" id="plan-content-to-export" ref={planContentRef}>
        {/* Tab 1: Submitted Plan Content */}
        {activeWorkflowTab === 'submitted' && (
          <>
          {/* Employee Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{plan.employeeName}</p>
                  <p className="text-xs text-gray-500">{plan.position}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-xs text-gray-500">{plan.department || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Period</p>
                  <p className="text-xs text-gray-500">
                    {plan.reviewPeriod.startDate && plan.reviewPeriod.endDate
                      ? `${new Date(plan.reviewPeriod.startDate).toLocaleDateString()} - ${new Date(plan.reviewPeriod.endDate).toLocaleDateString()}`
                      : plan.startDate && plan.endDate
                        ? `${new Date(plan.startDate).toLocaleDateString()} - ${new Date(plan.endDate).toLocaleDateString()}`
                        : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* Deliverables */}
        {plan.deliverables && Array.isArray(plan.deliverables) && plan.deliverables.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Deliverables</h2>
            <div className="space-y-4">
              {plan.deliverables.map((deliverable: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {deliverable.title || deliverable.keyDeliverable || `Deliverable ${index + 1}`}
                      </h3>
                      {deliverable.description && (
                        <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                      )}
                      {deliverable.timeline && (
                        <p className="text-xs text-gray-500 mt-2">
                          Timeline: {deliverable.timeline}
                        </p>
                      )}
                    </div>
                    {deliverable.weight && (
                      <span className="ml-4 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {deliverable.weight}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Goals */}
        {plan.valueGoals && Array.isArray(plan.valueGoals) && plan.valueGoals.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Value Goals</h2>
            <div className="space-y-3">
              {plan.valueGoals.map((goal: any, index: number) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                  <p className="text-sm text-gray-900">{goal.title || goal.description || goal}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competencies / Behavioral Expectations */}
        {plan.competencies && Array.isArray(plan.competencies) && plan.competencies.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Competencies & Behavioral Expectations</h2>
            <div className="space-y-3">
              {plan.competencies.map((competency: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {competency.title || competency.name || competency.competency || `Competency ${index + 1}`}
                  </h3>
                  {competency.description && (
                    <p className="text-sm text-gray-600">{competency.description}</p>
                  )}
                  {competency.level && (
                    <p className="text-xs text-gray-500 mt-2">
                      Expected Level: {competency.level}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Development Needs */}
        {plan.developmentNeeds && Array.isArray(plan.developmentNeeds) && plan.developmentNeeds.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Development Needs</h2>
            <div className="space-y-4">
              {plan.developmentNeeds.map((need: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {need.area || need.title || need.need || `Development Area ${index + 1}`}
                  </h3>
                  {need.description && (
                    <p className="text-sm text-gray-600 mt-1">{need.description}</p>
                  )}
                  {need.timeline && (
                    <p className="text-xs text-gray-500 mt-2">
                      Timeline: {need.timeline}
                    </p>
                  )}
                  {need.resources && (
                    <p className="text-xs text-gray-500 mt-1">
                      Resources: {need.resources}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments & Feedback</h2>
          <div className="space-y-6">
            {/* Employee Comments */}
            {plan.comments?.employeeComments && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Employee Comments</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{plan.comments.employeeComments}</p>
              </div>
            )}
            
            {/* Supervisor Comments History */}
            {workflowComments.supervisor && workflowComments.supervisor.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Supervisor Comments History</h3>
                <div className="space-y-3">
                  {workflowComments.supervisor.map((comment: any, index: number) => (
                    <div key={comment.id || index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">{comment.name || 'Supervisor'}</span>
                          <span className="text-xs text-gray-500">
                            {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          comment.action === 'approve' ? 'bg-green-100 text-green-800' :
                          comment.action === 'request_changes' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {comment.action?.replace('_', ' ').toUpperCase() || 'COMMENT'}
                        </span>
                      </div>
                      {comment.comment && (
                        <p className="text-sm text-gray-700">{comment.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reviewer Comments History */}
            {workflowComments.reviewer && workflowComments.reviewer.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Reviewer Comments History</h3>
                <div className="space-y-3">
                  {workflowComments.reviewer.map((comment: any, index: number) => (
                    <div key={comment.id || index} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">{comment.name || 'Reviewer'}</span>
                          <span className="text-xs text-gray-500">
                            {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          comment.action === 'final_approve' ? 'bg-green-100 text-green-800' :
                          comment.action === 'request_changes' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {comment.action?.replace('_', ' ').toUpperCase() || 'COMMENT'}
                        </span>
                      </div>
                      {comment.comment && (
                        <p className="text-sm text-gray-700">{comment.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fallback to simple comments if workflow comments don't exist */}
            {workflowComments.supervisor.length === 0 && workflowComments.reviewer.length === 0 && (
              <>
                {plan.comments?.supervisorComments && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Supervisor Comments</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{plan.comments.supervisorComments}</p>
                  </div>
                )}
                {plan.comments?.reviewerComments && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Reviewer Comments</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{plan.comments.reviewerComments}</p>
                  </div>
                )}
              </>
            )}
            
            {!plan.comments?.employeeComments && workflowComments.supervisor.length === 0 && workflowComments.reviewer.length === 0 && !plan.comments?.supervisorComments && !plan.comments?.reviewerComments && (
              <p className="text-sm text-gray-500 italic">No comments yet.</p>
            )}
          </div>
        </div>

        {/* Approval Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Supervisor Approval</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  plan.supervisorApproval === 'approved' ? 'bg-green-100 text-green-800' :
                  plan.supervisorApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {plan.supervisorApproval || 'pending'}
                </span>
              </div>
              {plan.supervisorApprovedAt && (
                <p className="text-xs text-gray-500">
                  Approved: {new Date(plan.supervisorApprovedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Reviewer Approval</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  plan.reviewerApproval === 'approved' ? 'bg-green-100 text-green-800' :
                  plan.reviewerApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {plan.reviewerApproval || 'pending'}
                </span>
              </div>
              {plan.reviewerApprovedAt && (
                <p className="text-xs text-gray-500">
                  Approved: {new Date(plan.reviewerApprovedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
          </>
        )}

        {/* Tab 2: Supervisor Review */}
        {activeWorkflowTab === 'supervisor' && isSupervisor && plan.status !== 'draft' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <UserCircleIcon className="h-6 w-6 text-orange-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Supervisor Review</h2>
                  <p className="text-sm text-gray-600">Review and provide feedback on {plan.employeeName}'s performance plan</p>
                </div>
              </div>

              {/* Plan Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Plan Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Plan Title:</span>
                    <p className="font-medium text-gray-900">{plan.planTitle}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Year:</span>
                    <p className="font-medium text-gray-900">{plan.planYear}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium text-gray-900">{plan.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Submitted:</span>
                    <p className="font-medium text-gray-900">
                      {plan.submittedAt ? new Date(plan.submittedAt).toLocaleDateString() : 'Not submitted'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supervisor Comments History */}
              {workflowComments.supervisor && workflowComments.supervisor.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Comments</h3>
                  <div className="space-y-3">
                    {workflowComments.supervisor.map((comment: any, index: number) => (
                      <div key={comment.id || index} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">{comment.name || 'Supervisor'}</span>
                            <span className="text-xs text-gray-500">
                              {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ''}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            comment.action === 'approve' ? 'bg-green-100 text-green-800' :
                            comment.action === 'request_changes' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {comment.action?.replace('_', ' ').toUpperCase() || 'COMMENT'}
                          </span>
                        </div>
                        {comment.comment && (
                          <p className="text-sm text-gray-700">{comment.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Supervisor Comment Form */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Your Review</h3>
                <textarea
                  value={currentSupervisorComment}
                  onChange={(e) => setCurrentSupervisorComment(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Provide your feedback and comments on this performance plan..."
                />
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleWorkflowAction('comment', 'supervisor')}
                    disabled={submittingWorkflow || !currentSupervisorComment.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingWorkflow ? 'Submitting...' : 'Add Comment'}
                  </button>
                  <button
                    onClick={() => handleWorkflowAction('approve', 'supervisor')}
                    disabled={submittingWorkflow}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingWorkflow ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleWorkflowAction('request_changes', 'supervisor')}
                    disabled={submittingWorkflow || !currentSupervisorComment.trim()}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingWorkflow ? 'Processing...' : 'Request Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Final Review (Reviewer) */}
        {activeWorkflowTab === 'reviewer' && isReviewer && plan.status !== 'draft' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Final Review</h2>
                  <p className="text-sm text-gray-600">Final reviewer assessment for {plan.employeeName}'s performance plan</p>
                </div>
              </div>

              {/* Plan Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Plan Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Plan Title:</span>
                    <p className="font-medium text-gray-900">{plan.planTitle}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Year:</span>
                    <p className="font-medium text-gray-900">{plan.planYear}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium text-gray-900">{plan.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Supervisor:</span>
                    <p className={`font-medium ${
                      plan.supervisorApproval === 'approved' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {plan.supervisorApproval === 'approved' ? 'Approved' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviewer Comments History */}
              {workflowComments.reviewer && workflowComments.reviewer.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Comments</h3>
                  <div className="space-y-3">
                    {workflowComments.reviewer.map((comment: any, index: number) => (
                      <div key={comment.id || index} className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">{comment.name || 'Reviewer'}</span>
                            <span className="text-xs text-gray-500">
                              {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ''}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            comment.action === 'final_approve' ? 'bg-green-100 text-green-800' :
                            comment.action === 'request_changes' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {comment.action?.replace('_', ' ').toUpperCase() || 'COMMENT'}
                          </span>
                        </div>
                        {comment.comment && (
                          <p className="text-sm text-gray-700">{comment.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Reviewer Comment Form */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Your Final Review</h3>
                <textarea
                  value={currentReviewerComment}
                  onChange={(e) => setCurrentReviewerComment(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Provide your final review feedback and assessment..."
                />
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleWorkflowAction('comment', 'reviewer')}
                    disabled={submittingWorkflow || !currentReviewerComment.trim()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingWorkflow ? 'Submitting...' : 'Add Comment'}
                  </button>
                  <button
                    onClick={() => handleWorkflowAction('final_approve', 'reviewer')}
                    disabled={submittingWorkflow}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingWorkflow ? 'Processing...' : 'Final Approve'}
                  </button>
                  <button
                    onClick={() => handleWorkflowAction('request_changes', 'reviewer')}
                    disabled={submittingWorkflow || !currentReviewerComment.trim()}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingWorkflow ? 'Processing...' : 'Request Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
