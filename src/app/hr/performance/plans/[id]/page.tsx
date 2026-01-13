
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
import { 
  PerformancePlanFormData, 
  performancePlanSteps,
  getStatusColor
} from "@/components/hr/performance/performance-plan-types"

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
  planPeriod?: string
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
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PerformancePlanFormData | null>(null)

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
          // Also check if user is supervisor via employee relationship
          if (session?.user?.id) {
            let isSupervisorRole = planData.supervisorId === session.user.id
            let isReviewerRole = planData.reviewerId === session.user.id
            
            // Also check if user is supervisor via employee relationship
            // This handles cases where the plan's supervisorId might not match but the employee's supervisor does
            if (!isSupervisorRole && planData.employeeId) {
              try {
                const employeeResponse = await fetch(`/api/hr/employees/${planData.employeeId}`)
                if (employeeResponse.ok) {
                  const employeeData = await employeeResponse.json()
                  const employee = employeeData.data || employeeData
                  
                  // Check if employee has a supervisor and if that supervisor's userId matches current user
                  if (employee.supervisor_id) {
                    const supervisorResponse = await fetch(`/api/hr/employees/${employee.supervisor_id}`)
                    if (supervisorResponse.ok) {
                      const supervisorData = await supervisorResponse.json()
                      const supervisor = supervisorData.data || supervisorData
                      
                      // Check if supervisor's userId matches current user
                      if (supervisor.userId === session.user.id) {
                        isSupervisorRole = true
                      }
                    }
                  }
                  
                  // Similar check for reviewer
                  if (!isReviewerRole && employee.reviewer_id) {
                    const reviewerResponse = await fetch(`/api/hr/employees/${employee.reviewer_id}`)
                    if (reviewerResponse.ok) {
                      const reviewerData = await reviewerResponse.json()
                      const reviewer = reviewerData.data || reviewerData
                      
                      if (reviewer.userId === session.user.id) {
                        isReviewerRole = true
                      }
                    }
                  }
                }
              } catch (error) {
                console.error('Error checking employee supervisor relationship:', error)
              }
            }
            
            // Also check if user is HR/admin - they can review plans too
            const isHR = session.user.roles?.some((r: string) => ['HR', 'ADMIN', 'HR_MANAGER', 'SUPERUSER', 'admin'].includes(r))
            const hasHRPermission = session.user.permissions?.some((p: string) => ['hr.full_access', 'hr.view_all_performance'].includes(p))
            
            // HR/Admin users can act as supervisors/reviewers if needed
            const canActAsSupervisor = isHR || hasHRPermission || isSupervisorRole
            const canActAsReviewer = isHR || hasHRPermission || isReviewerRole
            
            console.log('🔍 Supervisor/Reviewer Check:', {
              userId: session.user.id,
              supervisorId: planData.supervisorId,
              reviewerId: planData.reviewerId,
              employeeId: planData.employeeId,
              isSupervisorRole,
              isReviewerRole,
              isHR,
              hasHRPermission,
              canActAsSupervisor,
              canActAsReviewer,
              planStatus: planData.status,
              supervisorApproval: planData.supervisorApproval,
              reviewerApproval: planData.reviewerApproval
            })
            
            setIsSupervisor(canActAsSupervisor)
            setIsReviewer(canActAsReviewer)
            
            // Set default tab based on user role and plan status
            if (planData.status !== 'draft') {
              if (canActAsSupervisor && planData.supervisorApproval !== 'approved') {
                setActiveWorkflowTab('supervisor')
              } else if (canActAsReviewer && planData.reviewerApproval !== 'approved' && planData.supervisorApproval === 'approved') {
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
      
      // Reload plan data to get updated comments and approval status
      const updatedPlan = await fetchPlanData(planId)
      if (updatedPlan) {
        setPlan(updatedPlan)
        if (updatedPlan.comments?.supervisor || updatedPlan.comments?.reviewer) {
          setWorkflowComments({
            supervisor: Array.isArray(updatedPlan.comments.supervisor) ? updatedPlan.comments.supervisor : [],
            reviewer: Array.isArray(updatedPlan.comments.reviewer) ? updatedPlan.comments.reviewer : []
          })
        }
        
        // If supervisor approved, switch to reviewer tab if user is reviewer
        if (action === 'approve' && role === 'supervisor' && updatedPlan.supervisorApproval === 'approved') {
          // Check if user is reviewer
          const isReviewerRole = updatedPlan.reviewerId === session?.user?.id
          if (isReviewerRole || isReviewer) {
            setActiveWorkflowTab('reviewer')
          } else {
            setActiveWorkflowTab('submitted')
          }
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

  // Transform plan data to formData format
  useEffect(() => {
    if (plan) {
      const transformedData: PerformancePlanFormData = {
        id: plan.id,
        employee: {
          id: plan.employeeId,
          name: plan.employeeName,
          email: plan.employeeEmail,
          department: plan.department,
          position: plan.position,
          manager: plan.supervisorId || '',
          planPeriod: {
            startDate: plan.reviewPeriod?.startDate || plan.startDate || (plan.planPeriod && typeof plan.planPeriod === 'string' ? plan.planPeriod.split(' - ')[0]?.trim() : '') || '',
            endDate: plan.reviewPeriod?.endDate || plan.endDate || (plan.planPeriod && typeof plan.planPeriod === 'string' ? plan.planPeriod.split(' - ')[1]?.trim() : '') || ''
          }
        },
        planType: plan.planType || 'annual',
        planTitle: plan.planTitle || '',
        planDescription: '',
        status: plan.status,
        supervisor: plan.supervisorId || '',
        reviewerId: plan.reviewerId || '',
        planYear: plan.planYear || '',
        startDate: plan.startDate || '',
        endDate: plan.endDate || '',
        planPeriod: {
          startDate: plan.reviewPeriod?.startDate || plan.startDate || (plan.planPeriod && typeof plan.planPeriod === 'string' ? plan.planPeriod.split(' - ')[0]?.trim() : '') || '',
          endDate: plan.reviewPeriod?.endDate || plan.endDate || (plan.planPeriod && typeof plan.planPeriod === 'string' ? plan.planPeriod.split(' - ')[1]?.trim() : '') || ''
        },
        keyResponsibilities: Array.isArray(plan.deliverables) && plan.deliverables.length > 0
          ? plan.deliverables.map((del: any) => ({
              id: del.id || Date.now().toString(),
              description: del.description || del.title || del.keyDeliverable || '',
              tasks: del.tasks || '',
              weight: del.weight || 0,
              targetDate: del.targetDate || del.timeline || '',
              status: del.status || 'not-started',
              progress: del.progress || 0,
              successIndicators: del.successIndicators || [],
              comments: del.comments || ''
            }))
          : [],
        development: {
          strengths: [],
          areasForImprovement: [],
          skillGaps: [],
          trainingNeeds: [],
          careerObjectives: '',
          mentorshipNeeds: ''
        },
        developmentObjectives: Array.isArray(plan.developmentNeeds) ? plan.developmentNeeds.map((need: any) => ({
          objective: need.area || need.title || need.need || '',
          description: need.description || '',
          competencyArea: need.competencyArea || '',
          developmentActivities: need.activities || '',
          resources: need.resources || '',
          timeline: need.timeline || '',
          successCriteria: need.successCriteria || '',
          targetDate: need.targetDate || '',
          priority: need.priority || 'medium',
          status: need.status || 'not-started'
        })) : [],
        kpis: [],
        competencies: Array.isArray(plan.competencies) ? plan.competencies.map((comp: any) => ({
          id: comp.id || Date.now().toString(),
          name: comp.name || comp.title || comp.competency || '',
          currentLevel: comp.currentLevel || 0,
          targetLevel: comp.level || comp.targetLevel || 0,
          description: comp.description || '',
          developmentActions: comp.actions || []
        })) : [],
        milestones: [],
        valueGoals: Array.isArray(plan.valueGoals) ? plan.valueGoals.map((goal: any) => ({
          id: goal.id || Date.now().toString(),
          goal: goal.title || goal.description || goal,
          description: goal.description || '',
          target: goal.target || '',
          measurement: goal.measurement || '',
          timeline: goal.timeline || ''
        })) : [],
        reviewMilestones: [],
        resourcesNeeded: '',
        trainingRequirements: '',
        mentorshipNeeds: '',
        supportFromManager: '',
        coreValuesAcknowledgment: {},
        allCoreValuesAcknowledged: false,
        careerAspirationsShortTerm: '',
        careerAspirationsLongTerm: '',
        trainingNeeds: '',
        trainingPriority: 'medium',
        developmentActionPlan: '',
        developmentActionPlanTargetDate: '',
        developmentSupportNeeded: '',
        comments: {
          employeeComments: plan.comments?.employeeComments || '',
          supervisorComments: plan.comments?.supervisorComments || '',
          reviewerComments: plan.comments?.reviewerComments || ''
        },
        review: {
          reviewFrequency: 'monthly' as const,
          nextReviewDate: '',
          checkInNotes: '',
          managerComments: plan.comments?.supervisorComments || '',
          employeeComments: plan.comments?.employeeComments || ''
        },
        employeeAgreement: false,
        managerApproval: plan.supervisorApproval === 'approved',
        hrApproval: plan.reviewerApproval === 'approved',
        employeeComments: plan.comments?.employeeComments || '',
        supervisorComments: plan.comments?.supervisorComments || '',
        behavioralExpectations: Array.isArray(plan.competencies) ? plan.competencies : [],
        deliverables: Array.isArray(plan.deliverables) ? plan.deliverables : [],
        developmentNeeds: Array.isArray(plan.developmentNeeds) ? plan.developmentNeeds : []
      }
      setFormData(transformedData)
    }
  }, [plan])

  // Step navigation
  const handleNext = () => {
    if (currentStep < performancePlanSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Render step content in read-only mode
  const renderStepContent = () => {
    if (!formData) return null

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white via-orange-25 to-white p-8 rounded-2xl shadow-lg border border-orange-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mr-2"></div>
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={formData.employee.name}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mr-2"></div>
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employee.id}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2"></div>
                    Position/Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.employee.position}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mr-2"></div>
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.employee.department}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mr-2"></div>
                    Plan Year
                  </label>
                  <input
                    type="text"
                    value={formData.planYear}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full mr-2"></div>
                    Plan Type
                  </label>
                  <input
                    type="text"
                    value={formData.planType}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white via-blue-25 to-white p-8 rounded-2xl shadow-lg border border-blue-100 mt-8">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Plan Period</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2"></div>
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={formData.startDate ? new Date(formData.startDate).toLocaleDateString() : ''}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mr-2"></div>
                    End Date
                  </label>
                  <input
                    type="text"
                    value={formData.endDate ? new Date(formData.endDate).toLocaleDateString() : ''}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-50 via-orange-100 to-red-50 p-8 rounded-2xl shadow-lg border border-orange-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-lg font-bold">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-orange-900">Key Responsibilities</h3>
              </div>
              <p className="text-orange-800 text-lg leading-relaxed">Key responsibilities and performance areas from your job description.</p>
            </div>

            {formData.keyResponsibilities && formData.keyResponsibilities.length > 0 ? (
              formData.keyResponsibilities.map((responsibility, index) => (
                <div key={index} className="bg-gradient-to-br from-white via-blue-25 to-purple-25 border-2 border-gray-200 rounded-2xl p-8 space-y-6 shadow-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Responsibility {index + 1}</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mr-2"></div>
                      Responsibility Description
                    </label>
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm min-h-[60px]">
                      <p className="text-gray-900">{responsibility.description || 'N/A'}</p>
                    </div>
                  </div>

                  {responsibility.tasks && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2"></div>
                        Tasks / Activities
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm min-h-[80px]">
                        <p className="text-gray-900">{responsibility.tasks}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-2"></div>
                        Weight (%)
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm">
                        <p className="text-gray-900">{responsibility.weight}%</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-2"></div>
                        Target Date
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm">
                        <p className="text-gray-900">{responsibility.targetDate ? new Date(responsibility.targetDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mr-2"></div>
                        Status
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm">
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${getStatusColor(responsibility.status)}`}>
                          {responsibility.status.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {responsibility.successIndicators && responsibility.successIndicators.length > 0 && (
                    <div className="border-t-2 border-gray-200 pt-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-full mr-2"></div>
                        Success Indicators for this Responsibility
                      </label>
                      {responsibility.successIndicators.map((indicator: any, indicatorIndex: number) => (
                        <div key={indicatorIndex} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Indicator Name</p>
                              <p className="text-sm text-gray-900">{indicator.indicator || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Target Value</p>
                              <p className="text-sm text-gray-900">{indicator.target || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Measurement Method</p>
                              <p className="text-sm text-gray-900">{indicator.measurement || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {responsibility.comments && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mr-2"></div>
                        Additional Comments
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm min-h-[60px]">
                        <p className="text-gray-900">{responsibility.comments}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No key responsibilities defined.</p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 via-teal-50 to-green-50 p-8 rounded-2xl shadow-lg border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-lg font-bold">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-green-900">Success Indicators Summary</h3>
              </div>
              <p className="text-green-800 text-lg leading-relaxed">Review all success indicators defined for your key responsibilities.</p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Success Indicators by Responsibility</h3>
              {formData.keyResponsibilities && formData.keyResponsibilities.length > 0 ? (
                formData.keyResponsibilities.map((responsibility, respIndex) => (
                  <div key={respIndex} className="mb-6 border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-gray-50">
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        Responsibility {respIndex + 1}: {responsibility.description || 'Untitled'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">Weight:</span> {responsibility.weight}% | 
                        <span className="font-semibold ml-2">Status:</span> {responsibility.status.replace('-', ' ')}
                      </p>
                    </div>

                    {responsibility.successIndicators && responsibility.successIndicators.length > 0 ? (
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-green-800 mb-3">Success Indicators:</h5>
                        {responsibility.successIndicators.map((indicator: any, indIndex: number) => (
                          <div key={indIndex} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Indicator</p>
                                <p className="text-sm text-gray-900">{indicator.indicator || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Target</p>
                                <p className="text-sm text-gray-900">{indicator.target || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Measurement Method</p>
                                <p className="text-sm text-gray-900">{indicator.measurement || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No success indicators defined for this responsibility.</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No key responsibilities defined yet.</p>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        const coreValues = [
          { name: "Teamwork", description: "Working collaboratively with others to achieve common goals and support team success.", icon: "👥" },
          { name: "Responsiveness and Effectiveness", description: "Acting promptly and efficiently to meet stakeholder needs and deliver quality results.", icon: "⚡" },
          { name: "Accountability", description: "Taking ownership of responsibilities and being answerable for actions and outcomes.", icon: "✓" },
          { name: "Professionalism and Integrity", description: "Maintaining high ethical standards, honesty, and professional conduct in all interactions.", icon: "🎯" },
          { name: "Innovation", description: "Embracing creativity and new ideas to improve processes, services, and outcomes.", icon: "💡" }
        ]

        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-xl border-l-4 border-indigo-500">
              <h3 className="text-2xl font-bold text-indigo-900 mb-2">SAYWHAT Core Values</h3>
              <p className="text-indigo-700 text-lg">Review and acknowledge your understanding of our organizational core values.</p>
            </div>

            <div className="space-y-4">
              {coreValues.map((value, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">{value.icon}</span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{value.name}</h4>
                      <p className="text-gray-700 mb-4 leading-relaxed">{value.description}</p>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.coreValuesAcknowledgment?.[index] || false}
                          readOnly
                          className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          I understand and commit to upholding this core value
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 mt-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">✓</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.allCoreValuesAcknowledged || false}
                      readOnly
                      className="mt-1 w-5 h-5 text-orange-600 border-2 border-gray-300 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      I acknowledge that I have read, understood, and commit to demonstrating all five SAYWHAT Core Values in my daily work and interactions.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Development Objectives</h3>
              <p className="text-purple-700">Plan professional growth opportunities and skill development initiatives.</p>
            </div>

            {formData.developmentObjectives && formData.developmentObjectives.length > 0 ? (
              formData.developmentObjectives.map((objective, index) => (
                <div key={index} className="border rounded-lg p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Development Objective {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Development Objective</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                        <p className="text-gray-900">{objective.objective || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                        <p className="text-gray-900">{objective.timeline || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[60px]">
                      <p className="text-gray-900">{objective.description || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Development Activities</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[80px]">
                      <p className="text-gray-900">{objective.developmentActivities || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resources Required</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[60px]">
                      <p className="text-gray-900">{objective.resources || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Success Criteria</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[60px]">
                      <p className="text-gray-900">{objective.successCriteria || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No development objectives defined.</p>
              </div>
            )}

            {formData.careerAspirationsShortTerm && (
              <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Aspirations</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short-term Career Goals (1-2 years)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[80px]">
                      <p className="text-gray-900">{formData.careerAspirationsShortTerm}</p>
                    </div>
                  </div>
                  {formData.careerAspirationsLongTerm && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Long-term Career Goals (3-5 years)</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[80px]">
                        <p className="text-gray-900">{formData.careerAspirationsLongTerm}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
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
              {isReviewer && plan.status !== 'draft' && plan.supervisorApproval === 'approved' && (
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
        {activeWorkflowTab === 'submitted' && formData && (
          <div className="space-y-6">
            {/* Step Navigation */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
              <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{currentStep}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {performancePlanSteps[currentStep - 1]?.title || 'Step'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {performancePlanSteps[currentStep - 1]?.description || ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Step {currentStep} of {performancePlanSteps.length}
                  </span>
                </div>
              </div>
              
              {/* Step Indicators */}
              <div className="px-8 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  {performancePlanSteps.map((step, index) => (
                    <div key={index} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <button
                          onClick={() => setCurrentStep(index + 1)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                            currentStep === index + 1
                              ? 'bg-orange-500 text-white shadow-lg scale-110'
                              : currentStep > index + 1
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          {currentStep > index + 1 ? '✓' : index + 1}
                        </button>
                        <span className={`text-xs mt-2 text-center ${
                          currentStep === index + 1 ? 'font-bold text-orange-600' : 'text-gray-600'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      {index < performancePlanSteps.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 ${
                          currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Performance Plan Details</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.planTitle} • {plan.planYear} • {plan.employeeName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-8 py-8">
                {renderStepContent()}
              </div>

              {/* Navigation Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      currentStep === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentStep === performancePlanSteps.length}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      currentStep === performancePlanSteps.length
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* Comments & Approval Status Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments & Feedback</h2>
              <div className="space-y-6">
                {plan.comments?.employeeComments && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Employee Comments</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{plan.comments.employeeComments}</p>
                  </div>
                )}
                
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
              </div>
            </div>

            {/* Approval Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Supervisor Approval</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        (plan.supervisorApproval === 'approved' || plan.status === 'supervisor_approved')
                          ? 'bg-green-100 text-green-800'
                          : (plan.supervisorApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                      }`}
                    >
                      {(plan.supervisorApproval === 'approved' || plan.status === 'supervisor_approved')
                        ? 'approved'
                        : (plan.supervisorApproval || 'pending')}
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
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        (plan.reviewerApproval === 'approved' || plan.status === 'approved')
                          ? 'bg-green-100 text-green-800'
                          : (plan.reviewerApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                      }`}
                    >
                      {(plan.reviewerApproval === 'approved' || plan.status === 'approved')
                        ? 'approved'
                        : (plan.reviewerApproval || 'pending')}
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
                      {(() => {
                        const submittedTimestamp =
                          plan.submittedAt ||
                          plan.supervisorApprovedAt ||
                          plan.reviewerApprovedAt

                        return submittedTimestamp
                          ? new Date(submittedTimestamp).toLocaleDateString()
                          : 'Not submitted'
                      })()}
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
                {plan.supervisorApproval === 'approved' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <p className="text-green-800 font-medium">This plan has been approved by you.</p>
                    </div>
                    {plan.supervisorApprovedAt && (
                      <p className="text-sm text-green-700 mt-2">
                        Approved on: {new Date(plan.supervisorApprovedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
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
                        disabled={submittingWorkflow || plan.supervisorApproval === 'approved'}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                          plan.supervisorApproval === 'approved'
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {submittingWorkflow ? 'Processing...' : plan.supervisorApproval === 'approved' ? '✓ Approved' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleWorkflowAction('request_changes', 'supervisor')}
                        disabled={submittingWorkflow || !currentSupervisorComment.trim() || plan.supervisorApproval === 'approved'}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submittingWorkflow ? 'Processing...' : 'Request Changes'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Final Review (Reviewer) */}
        {activeWorkflowTab === 'reviewer' && isReviewer && plan.status !== 'draft' && plan.supervisorApproval === 'approved' && (
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
