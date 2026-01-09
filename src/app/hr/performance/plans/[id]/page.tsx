"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
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
  BuildingOfficeIcon
} from "@heroicons/react/24/outline"

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
  const planId = params.id as string
  
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlanData = async () => {
      try {
        setLoading(true)
        setError(null)
        const planData = await fetchPlanData(planId)
        
        if (planData) {
          setPlan(planData)
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
  }, [planId])

  const metadata = {
    title: `Performance Plan - ${plan?.employeeName || 'Loading...'}`,
    description: "View detailed performance plan information",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Plans", href: "/hr/performance/plans" },
      { name: plan?.employeeName || "View Plan" }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/hr/performance/plans"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{plan.planTitle}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {plan.planYear} • {plan.planType}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                {plan.status}
              </span>
              <Link
                href={`/hr/performance/plans/create?planId=${plan.id}&edit=true`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
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

        {/* Comments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
          <div className="space-y-4">
            {plan.comments?.employeeComments && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Employee Comments</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{plan.comments.employeeComments}</p>
              </div>
            )}
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
            {(!plan.comments?.employeeComments && !plan.comments?.supervisorComments && !plan.comments?.reviewerComments) && (
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
      </div>
    </ModulePage>
  )
}
