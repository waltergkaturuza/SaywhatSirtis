"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { exportService } from "@/lib/export-service"
import { 
  AppraisalFormData, 
  appraisalSteps
} from "@/components/hr/performance/appraisal-types"
import { EmployeeDetailsStep } from "@/components/hr/performance/employee-details-step"
import { PerformanceAssessmentStep } from "@/components/hr/performance/performance-assessment-step"
import { AchievementsGoalsStep } from "@/components/hr/performance/achievements-goals-step"
import { DevelopmentPlanningStep } from "@/components/hr/performance/development-planning-step"
import { CommentsReviewStep } from "@/components/hr/performance/comments-review-step"
import { FinalReviewStep } from "@/components/hr/performance/final-review-step"
import {
  DocumentCheckIcon,
  CalendarIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  TrophyIcon,
  LightBulbIcon,
  ArrowPathIcon,
  PrinterIcon,
  ShareIcon,
  EyeIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline"

interface AppraisalData {
  id: number
  employeeName: string
  employeeId: string
  department: string
  position: string
  period: string
  overallRating: number | null
  status: string
  submittedAt: string | null
  reviewedAt: string | null
  supervisorApprovedAt?: string | null
  reviewerApprovedAt?: string | null
  supervisorApproval?: string
  reviewerApproval?: string
  supervisor: string
  reviewer: string
  planProgress: number
  strengths: string
  areasImprovement: string
  goals: string
  lastUpdated: string
  performanceAreas: Array<{
    area: string
    rating: number
    weight: number
    comments: string
    evidence: string
  }>
  achievements: Array<{
    achievement: string
    impact: string
    evidence: string
  }>
  developmentPlans: Array<{
    area: string
    currentLevel: string
    targetLevel: string
    timeline: string
    resources: string
  }>
  supervisorComments: string
  employeeComments: string
  nextSteps: string
  improvementPlan: string
}

// Fetch appraisal data from API
const fetchAppraisalData = async (id: string): Promise<AppraisalData | null> => {
  try {
    const response = await fetch(`/api/hr/performance/appraisals/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch appraisal: ${response.status}`);
    }
    const result = await response.json();
    // Handle both response formats: { success: true, data: ... } or { success: true, appraisal: ... }
    return result.success ? (result.data || result.appraisal) : null;
  } catch (error) {
    console.error('Error fetching appraisal data:', error);
    return null;
  }
}

export default function ViewAppraisalPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const appraisalId = params.id as string
  
  const [appraisal, setAppraisal] = useState<AppraisalData | null>(null)
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'submitted' | 'supervisor' | 'reviewer'>('submitted')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupervisor, setIsSupervisor] = useState(false)
  const [isReviewer, setIsReviewer] = useState(false)
  const [currentSupervisorComment, setCurrentSupervisorComment] = useState('')
  const [currentReviewerComment, setCurrentReviewerComment] = useState('')
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false)
  const [workflowComments, setWorkflowComments] = useState<{supervisor: any[], reviewer: any[]}>({supervisor: [], reviewer: []})
  const [exportingPDF, setExportingPDF] = useState(false)
  const appraisalContentRef = useRef<HTMLDivElement>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<AppraisalFormData | null>(null)
  const [isSavingRatings, setIsSavingRatings] = useState(false)
  const [isEmployee, setIsEmployee] = useState(false)

  // Export appraisal to PDF
  const handleExportPDF = async () => {
    if (!appraisal || !appraisalContentRef.current) return
    
    setExportingPDF(true)
    try {
      // Ensure element has an ID for export
      if (!appraisalContentRef.current.id) {
        appraisalContentRef.current.id = 'appraisal-content-to-export'
      }
      
      await exportService.exportFromElement(appraisalContentRef.current.id, {
        format: 'pdf',
        filename: `Performance_Appraisal_${appraisal.employeeName.replace(/\s+/g, '_')}_${appraisal.period?.replace(/\s+/g, '_') || Date.now()}_${Date.now()}.pdf`,
        title: `Performance Appraisal - ${appraisal.employeeName}`,
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
    // Load appraisal data from API
    const loadAppraisalData = async () => {
      try {
        setLoading(true)
        setError(null)
        const appraisalData = await fetchAppraisalData(appraisalId)
        
        if (appraisalData) {
          // Transform API response to match frontend interface
          const apiData = appraisalData as any
          const normalizedData: AppraisalData = {
            id: apiData.id || 0,
            employeeName: apiData.employee?.name || apiData.employeeName || '',
            employeeId: apiData.employee?.id || apiData.employeeId || '',
            department: apiData.employee?.department || apiData.department || '',
            position: apiData.employee?.position || apiData.position || '',
            period: apiData.employee?.reviewPeriod?.startDate && apiData.employee?.reviewPeriod?.endDate
              ? `${apiData.employee.reviewPeriod.startDate} - ${apiData.employee.reviewPeriod.endDate}`
              : (apiData.period || ''),
            overallRating: apiData.performance?.overallRating || apiData.ratings?.finalRating || apiData.overallRating || null,
            status: apiData.status || 'draft',
            submittedAt: apiData.submittedAt || null,
            reviewedAt: apiData.approvedAt || apiData.reviewedAt || null,
            supervisorApprovedAt: apiData.supervisorApprovedAt || null,
            reviewerApprovedAt: apiData.reviewerApprovedAt || null,
            supervisorApproval: apiData.supervisorApproval || (apiData.supervisorApprovedAt ? 'approved' : 'pending'),
            reviewerApproval: apiData.reviewerApproval || (apiData.reviewerApprovedAt ? 'approved' : 'pending'),
            supervisor: apiData.employee?.manager || apiData.supervisor || '',
            reviewer: apiData.employee?.reviewer || apiData.reviewer || '',
            planProgress: apiData.planProgress || 0,
            strengths: Array.isArray(apiData.performance?.strengths) 
              ? apiData.performance.strengths.join(', ')
              : (apiData.performance?.strengths || apiData.strengths || ''),
            areasImprovement: Array.isArray(apiData.performance?.areasForImprovement)
              ? apiData.performance.areasForImprovement.join(', ')
              : (apiData.performance?.areasForImprovement || apiData.areasImprovement || ''),
            goals: apiData.goals || '',
            lastUpdated: apiData.createdAt || apiData.lastUpdated || new Date().toISOString(),
            performanceAreas: Array.isArray(apiData.performance?.categories) 
              ? apiData.performance.categories 
              : (Array.isArray(apiData.performanceAreas) ? apiData.performanceAreas : []),
            achievements: Array.isArray(apiData.achievements)
              ? apiData.achievements
              : (Array.isArray(apiData.achievements?.keyResponsibilities)
                  ? apiData.achievements.keyResponsibilities.map((item: any) => ({
                      achievement: item.title || item.description || item,
                      impact: item.impact || '',
                      evidence: item.evidence || ''
                    }))
                  : []),
            developmentPlans: Array.isArray(apiData.developmentPlans)
              ? apiData.developmentPlans
              : (Array.isArray(apiData.development?.developmentPlan)
                  ? apiData.development.developmentPlan.map((item: any) => ({
                      area: item.area || item.title || item,
                      currentLevel: item.currentLevel || '',
                      targetLevel: item.targetLevel || '',
                      timeline: item.timeline || '',
                      resources: item.resources || ''
                    }))
                  : []),
            supervisorComments: apiData.comments?.managerComments || apiData.comments?.supervisorComments || apiData.supervisorComments || '',
            employeeComments: apiData.comments?.employeeComments || apiData.employeeComments || '',
            nextSteps: apiData.nextSteps || '',
            improvementPlan: apiData.improvementPlan || ''
          }
          setAppraisal(normalizedData)
          
          // Check if current user is supervisor or reviewer
          // Note: supervisorId and reviewerId are user IDs
          if (session?.user?.id && apiData) {
            // Get supervisorId and reviewerId from the appraisal data (these are user IDs)
            const supervisorId = apiData.supervisorId
            const reviewerId = apiData.reviewerId
            
            let isSupervisorRole = supervisorId === session.user.id
            let isReviewerRole = reviewerId === session.user.id
            
            // Also check if user is supervisor via employee relationship
            // This handles cases where the appraisal's supervisorId might not match but the employee's supervisor does
            if (!isSupervisorRole && normalizedData.employeeId) {
              try {
                const employeeResponse = await fetch(`/api/hr/employees/${normalizedData.employeeId}`)
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
            
            // Also check if user is HR/admin - they can review appraisals too
            const isHR = session.user.roles?.some((r: string) => ['HR', 'ADMIN', 'HR_MANAGER', 'SUPERUSER', 'admin'].includes(r))
            const hasHRPermission = session.user.permissions?.some((p: string) => ['hr.full_access', 'hr.view_all_performance'].includes(p))
            
            // HR/Admin users can act as supervisors/reviewers if needed
            const canActAsSupervisor = isSupervisorRole || isHR || hasHRPermission
            const canActAsReviewer = isReviewerRole || isHR || hasHRPermission
            
            console.log('🔍 Appraisal Supervisor/Reviewer Check:', {
              userId: session.user.id,
              supervisorId: supervisorId,
              reviewerId: reviewerId,
              employeeId: normalizedData.employeeId,
              isSupervisorRole,
              isReviewerRole,
              isHR,
              hasHRPermission,
              canActAsSupervisor,
              canActAsReviewer,
              appraisalStatus: normalizedData.status,
              supervisorApproval: normalizedData.supervisorApproval
            })
            
            setIsSupervisor(canActAsSupervisor)
            setIsReviewer(canActAsReviewer)
            
            // Check if user is the employee (cannot edit submitted appraisals)
            try {
              const userEmployeeResponse = await fetch(`/api/hr/employees/by-email/${encodeURIComponent(session.user.email || '')}`)
              if (userEmployeeResponse.ok) {
                const userEmployee = await userEmployeeResponse.json()
                const isEmployeeOwner = userEmployee?.id === normalizedData.employeeId
                setIsEmployee(isEmployeeOwner)
              }
            } catch (err) {
              console.error('Error checking employee ownership:', err)
              setIsEmployee(false)
            }
            
            // Load workflow comments if they exist
            let comments = { supervisor: [] as any[], reviewer: [] as any[] }
            if (apiData.comments?.supervisor || apiData.comments?.reviewer) {
              comments = {
                supervisor: Array.isArray(apiData.comments.supervisor) ? apiData.comments.supervisor : [],
                reviewer: Array.isArray(apiData.comments.reviewer) ? apiData.comments.reviewer : []
              }
              setWorkflowComments(comments)
            }
            
            // Set default tab based on user role and appraisal status (after loading comments)
            if (normalizedData.status !== 'draft') {
              // Check if supervisor has already approved
              const hasSupervisorApproved = normalizedData.supervisorApproval === 'approved'
              
              if (canActAsSupervisor && !hasSupervisorApproved) {
                setActiveWorkflowTab('supervisor')
              } else if (canActAsReviewer && hasSupervisorApproved) {
                setActiveWorkflowTab('reviewer')
              } else {
                setActiveWorkflowTab('submitted')
              }
            }
          }
        } else {
          setError('Appraisal not found')
        }
      } catch (err) {
        setError('Failed to load appraisal data')
        console.error('Error loading appraisal:', err)
      } finally {
        setLoading(false)
      }
    }

    if (appraisalId) {
      loadAppraisalData()
    }
  }, [appraisalId, session?.user?.id])

  // Handle workflow action (comment, approve, request_changes)
  const handleWorkflowAction = async (action: 'comment' | 'request_changes' | 'approve' | 'final_approve', role: 'supervisor' | 'reviewer') => {
    if (!appraisal) return
    
    const comment = role === 'supervisor' ? currentSupervisorComment : currentReviewerComment
    
    if (action === 'request_changes' && !comment) {
      alert('Please provide feedback when requesting changes.')
      return
    }
    
    setSubmittingWorkflow(true)
    try {
      const response = await fetch(`/api/hr/performance/appraisals/${appraisal.id}/workflow`, {
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
      
      // Reload appraisal data to get updated comments and status
      const updatedAppraisalData = await fetchAppraisalData(appraisalId)
      if (updatedAppraisalData) {
        const apiData = updatedAppraisalData as any
        const normalizedData: AppraisalData = {
          ...appraisal,
          status: apiData.status || appraisal.status,
          supervisorComments: apiData.comments?.managerComments || apiData.comments?.supervisorComments || apiData.supervisorComments || appraisal.supervisorComments,
          employeeComments: apiData.comments?.employeeComments || apiData.employeeComments || appraisal.employeeComments
        }
        setAppraisal(normalizedData)
        
        if (apiData.comments?.supervisor || apiData.comments?.reviewer) {
          setWorkflowComments({
            supervisor: Array.isArray(apiData.comments.supervisor) ? apiData.comments.supervisor : [],
            reviewer: Array.isArray(apiData.comments.reviewer) ? apiData.comments.reviewer : []
          })
        }

        // Update approval fields from API response
        if (apiData.supervisorApproval) {
          normalizedData.supervisorApproval = apiData.supervisorApproval
        }
        if (apiData.reviewerApproval) {
          normalizedData.reviewerApproval = apiData.reviewerApproval
        }
        if (apiData.supervisorApprovedAt) {
          normalizedData.supervisorApprovedAt = apiData.supervisorApprovedAt
        }
        if (apiData.reviewerApprovedAt) {
          normalizedData.reviewerApprovedAt = apiData.reviewerApprovedAt
        }
        setAppraisal(normalizedData)

        // If supervisor approved, and user is reviewer, move to reviewer tab
        if (action === 'approve' && role === 'supervisor' && normalizedData.supervisorApproval === 'approved') {
          const isReviewerRole = apiData.reviewerId === session?.user?.id
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

  // Transform appraisal data to formData format
  useEffect(() => {
    if (appraisalId) {
      // Fetch full appraisal data from API to get complete structure
      const loadFullAppraisalData = async () => {
        try {
          const fullData = await fetchAppraisalData(appraisalId)
          if (fullData) {
            const apiData = fullData as any

            const transformedData: AppraisalFormData = {
              id: apiData.id?.toString() || appraisal?.id?.toString(),
              employee: {
                id: apiData.employee?.id || appraisal?.employeeId || '',
                name: apiData.employee?.name || appraisal?.employeeName || '',
                email: apiData.employee?.email || '',
                department: apiData.employee?.department || appraisal?.department || '',
                position: apiData.employee?.position || appraisal?.position || '',
                manager: apiData.employee?.manager || appraisal?.supervisor || '',
                reviewer: apiData.employee?.reviewer || appraisal?.reviewer || '',
                hireDate: apiData.employee?.hireDate || '',
                reviewPeriod: {
                  startDate: apiData.employee?.reviewPeriod?.startDate || (apiData.period ? apiData.period.split(' - ')[0] : ''),
                  endDate: apiData.employee?.reviewPeriod?.endDate || (apiData.period ? apiData.period.split(' - ')[1] : '')
                }
              },
              performance: {
                overallRating: apiData.performance?.overallRating || apiData.ratings?.finalRating || appraisal?.overallRating || 0,
                categories: Array.isArray(apiData.performance?.categories) && apiData.performance.categories.length > 0
                  ? apiData.performance.categories
                  : (Array.isArray(appraisal?.performanceAreas) && appraisal!.performanceAreas.length > 0
                      ? appraisal!.performanceAreas.map((area: any) => ({
                          id: area.id || Date.now().toString(),
                          name: area.name || area.area || '',
                          rating: area.rating || 0,
                          comment: area.comment || '',
                          weight: area.weight || 20,
                          description: area.description || ''
                        }))
                      : [
                          { id: '1', name: 'Teamwork', rating: 0, comment: '', weight: 20, description: 'Working collaboratively with others to achieve common goals and support team success.' },
                          { id: '2', name: 'Responsiveness and Effectiveness', rating: 0, comment: '', weight: 20, description: 'Acting promptly and efficiently to meet stakeholder needs and deliver quality results.' },
                          { id: '3', name: 'Accountability', rating: 0, comment: '', weight: 20, description: 'Taking ownership of responsibilities and being answerable for actions and outcomes.' },
                          { id: '4', name: 'Professionalism and Integrity', rating: 0, comment: '', weight: 20, description: 'Maintaining high ethical standards, honesty, and professional conduct in all interactions.' },
                          { id: '5', name: 'Innovation', rating: 0, comment: '', weight: 20, description: 'Embracing creativity and new ideas to improve processes, services, and outcomes.' }
                        ]),
                strengths: Array.isArray(apiData.performance?.strengths)
                  ? apiData.performance.strengths
                  : (appraisal?.strengths ? appraisal.strengths.split(',').map(s => s.trim()).filter(s => s) : []),
                areasForImprovement: Array.isArray(apiData.performance?.areasForImprovement)
                  ? apiData.performance.areasForImprovement
                  : (appraisal?.areasImprovement ? appraisal.areasImprovement.split(',').map(s => s.trim()).filter(s => s) : [])
              },
              achievements: {
                keyResponsibilities: Array.isArray(apiData.achievements?.keyResponsibilities) && apiData.achievements.keyResponsibilities.length > 0
                  ? apiData.achievements.keyResponsibilities
                  : (Array.isArray(appraisal?.achievements) && appraisal!.achievements.length > 0
                      ? appraisal!.achievements.map((ach: any, index: number) => ({
                          id: ach.id || Date.now().toString() + index,
                          description: ach.achievement || ach.description || '',
                          tasks: ach.tasks || '',
                          weight: ach.weight || 0,
                          targetDate: ach.targetDate || '',
                          status: ach.status || 'Not Started' as const,
                          achievementStatus: ach.achievementStatus || 'not-achieved' as const,
                          comment: ach.comment || ach.impact || '',
                          successIndicators: ach.successIndicators || []
                        }))
                      : [])
              },
              development: {
                trainingNeeds: Array.isArray(apiData.development?.trainingNeeds)
                  ? apiData.development.trainingNeeds
                  : [],
                careerAspirations: apiData.development?.careerAspirations || '',
                skillsToImprove: Array.isArray(apiData.development?.skillsToImprove)
                  ? apiData.development.skillsToImprove
                  : [],
                developmentPlan: Array.isArray(apiData.development?.developmentPlan) && apiData.development.developmentPlan.length > 0
                  ? apiData.development.developmentPlan
                  : (Array.isArray(appraisal?.developmentPlans) && appraisal!.developmentPlans.length > 0
                      ? appraisal!.developmentPlans.map((plan: any) => ({
                          objective: plan.area || plan.objective || '',
                          actions: Array.isArray(plan.actions) ? plan.actions : [],
                          timeline: plan.timeline || '',
                          resources: Array.isArray(plan.resources) ? plan.resources : (plan.resources ? [plan.resources] : [])
                        }))
                      : [])
              },
              comments: {
                employeeComments: apiData.comments?.employeeComments || appraisal?.employeeComments || '',
                managerComments: apiData.comments?.managerComments || apiData.comments?.supervisorComments || appraisal?.supervisorComments || '',
                hrComments: apiData.comments?.hrComments || ''
              },
              ratings: {
                finalRating: apiData.ratings?.finalRating || apiData.performance?.overallRating || appraisal?.overallRating || 0,
                actualPoints: apiData.ratings?.actualPoints || 0,
                maxPoints: apiData.ratings?.maxPoints || 0,
                percentage: apiData.ratings?.percentage || 0,
                ratingCode: apiData.ratings?.ratingCode || '',
                recommendation: apiData.ratings?.recommendation || 'maintain-current' as const,
                salaryRecommendation: apiData.ratings?.salaryRecommendation || ''
              },
              signatures: {
                supervisorSignature: apiData.signatures?.supervisorSignature || '',
                supervisorSignedAt: apiData.signatures?.supervisorSignedAt,
                supervisorMeetingDate: apiData.signatures?.supervisorMeetingDate,
                supervisorMeetingConfirmed: apiData.signatures?.supervisorMeetingConfirmed || false,
                reviewerSignature: apiData.signatures?.reviewerSignature || '',
                reviewerSignedAt: apiData.signatures?.reviewerSignedAt,
                reviewerMeetingDate: apiData.signatures?.reviewerMeetingDate,
                reviewerMeetingConfirmed: apiData.signatures?.reviewerMeetingConfirmed || false
              },
              status: apiData.status || appraisal?.status || 'draft',
              workflowStatus: apiData.workflowStatus || appraisal?.status || 'draft',
              appraisalType: apiData.appraisalType || 'annual',
              recommendations: apiData.recommendations || {},
              submittedAt: apiData.submittedAt || appraisal?.submittedAt || undefined,
              approvedAt: apiData.approvedAt || appraisal?.reviewedAt || undefined,
              createdAt: apiData.createdAt || appraisal?.lastUpdated || undefined
            }
            setFormData(transformedData)
          }
        } catch (error) {
          console.error('Error transforming appraisal data:', error)
        }
      }
      
      loadFullAppraisalData()
    }
  }, [appraisalId])

  // Step navigation
  const handleNext = () => {
    if (currentStep < appraisalSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Save supervisor ratings
  const handleSaveRatings = async () => {
    if (!formData || !appraisal) return
    
    setIsSavingRatings(true)
    try {
      // Calculate overall rating from categories before saving
      const categories = formData.performance.categories || []
      let calculatedOverallRating = 0
      
      if (categories.length > 0) {
        const totalWeight = categories.reduce((sum, cat) => sum + (cat.weight || 0), 0)
        const weightedScore = categories.reduce((sum, cat) => sum + ((cat.rating || 0) * (cat.weight || 0)), 0)
        calculatedOverallRating = totalWeight > 0 ? parseFloat((weightedScore / totalWeight).toFixed(2)) : 0
      }
      
      const response = await fetch(`/api/hr/performance/appraisals/${appraisalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ratings: {
            overall: calculatedOverallRating,
            categories: formData.performance.categories
          },
          performance: {
            overallRating: calculatedOverallRating,
            categories: formData.performance.categories,
            strengths: formData.performance.strengths,
            areasForImprovement: formData.performance.areasForImprovement
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save ratings')
      }

      const result = await response.json()
      const newOverall = result?.appraisal?.overallRating ?? calculatedOverallRating

      // Update local appraisal header (Overall Rating 0.0/5)
      setAppraisal(prev => prev ? { ...prev, overallRating: newOverall } : prev)
      // Keep formData in sync with the saved rating
      setFormData(prev => prev ? {
        ...prev,
        performance: {
          ...prev.performance,
          overallRating: newOverall
        }
      } : prev)
      
      alert('Ratings saved successfully')
    } catch (error) {
      console.error('Error saving ratings:', error)
      alert('Failed to save ratings. Please try again.')
    } finally {
      setIsSavingRatings(false)
    }
  }

  // Render step content - allow editing for supervisors on step 4 (Performance Assessment)
  const renderStepContent = () => {
    if (!formData) return null

    // Determine if this step can be edited
    // Supervisors can edit step 4 (Performance Assessment) on submitted appraisals
    // Employees cannot edit submitted appraisals
    const canEditStep = (step: number) => {
      if (!appraisal) return false
      
      // If status is revision_requested, determine who can edit
      if (appraisal.status === 'revision_requested') {
        // If supervisor approval was reset (reviewer requested changes), supervisor can edit
        if (step === 4 && isSupervisor && !appraisal.supervisorApprovedAt) {
          return true // Supervisor can edit ratings when reviewer requested changes
        }
        // If status is revision_requested and supervisor requested changes, employee can edit
        if (isEmployee) {
          return true // Employee can edit when supervisor requested changes
        }
      }
      
      // Employees cannot edit submitted appraisals (unless revision_requested)
      if (isEmployee && appraisal.status !== 'draft' && appraisal.status !== 'revision_requested') {
        return false
      }
      
      // Supervisors can edit ratings on submitted appraisals (before approval or after revision request)
      if (step === 4 && isSupervisor && appraisal.status !== 'draft') {
        // Can edit if: not approved yet, or approval was reset (revision_requested)
        if (!appraisal.supervisorApprovedAt || appraisal.status === 'revision_requested') {
          return true
        }
      }
      
      return false // All other cases are read-only
    }

    // Create update function - only allow updates if step is editable
    const createUpdateFunction = (step: number) => {
      if (canEditStep(step)) {
        return (updates: Partial<AppraisalFormData>) => {
          setFormData(prev => prev ? { ...prev, ...updates } : null)
        }
      }
      return () => {
        // No-op for read-only mode
      }
    }

    switch (currentStep) {
      case 1:
        return <EmployeeDetailsStep formData={formData} updateFormData={createUpdateFunction(1)} />
      case 2:
        return <AchievementsGoalsStep formData={formData} updateFormData={createUpdateFunction(2)} />
      case 3:
        return <DevelopmentPlanningStep formData={formData} updateFormData={createUpdateFunction(3)} />
      case 4:
        return (
          <div>
            <PerformanceAssessmentStep formData={formData} updateFormData={createUpdateFunction(4)} />
            {canEditStep(4) && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveRatings}
                  disabled={isSavingRatings}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSavingRatings ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Save Ratings</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )
      case 5:
        return <CommentsReviewStep formData={formData} updateFormData={createUpdateFunction(5)} />
      case 6:
        return <FinalReviewStep formData={formData} updateFormData={createUpdateFunction(6)} />
      default:
        return null
    }
  }

  // Determine if this is a review/supervise context
  const isReviewContext = (isSupervisor || isReviewer) && appraisal && appraisal.status !== 'draft'
  const pageTitle = isReviewContext 
    ? (isSupervisor ? `Supervise Employee - ${appraisal?.employeeName || 'Loading...'}` : `Review Employee - ${appraisal?.employeeName || 'Loading...'}`)
    : `Performance Appraisal - ${appraisal?.employeeName || 'Loading...'}`
  const pageDescription = isReviewContext
    ? (isSupervisor ? "Review and provide feedback on employee performance appraisal" : "Final review and approval of employee performance appraisal")
    : "View detailed performance appraisal information"

  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Appraisals", href: "/hr/performance/appraisals" },
      { name: isReviewContext ? (isSupervisor ? "Supervise Employee" : "Review Employee") : (appraisal?.employeeName || "View Appraisal") }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600"
    if (rating >= 3.5) return "text-blue-600"
    if (rating >= 2.5) return "text-yellow-600"
    return "text-red-600"
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    )
  }

  const calculateOverallRating = () => {
    // First try to use formData.performance.categories (most up-to-date)
    if (formData?.performance?.categories && Array.isArray(formData.performance.categories) && formData.performance.categories.length > 0) {
      const totalWeight = formData.performance.categories.reduce((sum, cat) => sum + (cat.weight || 0), 0)
      const weightedScore = formData.performance.categories.reduce((sum, cat) => sum + ((cat.rating || 0) * (cat.weight || 0)), 0)
      if (totalWeight > 0) {
        // Convert weighted score to 0-5 scale: (weightedScore / totalWeight) gives us the average rating
        return (weightedScore / totalWeight).toFixed(1)
      }
    }
    
    // Fallback to appraisal.performanceAreas if formData not available
    if (appraisal?.performanceAreas && Array.isArray(appraisal.performanceAreas) && appraisal.performanceAreas.length > 0) {
      const totalWeight = appraisal.performanceAreas.reduce((sum, area) => sum + (area.weight || 0), 0)
      const weightedScore = appraisal.performanceAreas.reduce((sum, area) => sum + ((area.rating || 0) * (area.weight || 0)), 0)
      return totalWeight > 0 ? (weightedScore / totalWeight).toFixed(1) : "0.0"
    }
    
    return "0.0"
  }

  if (loading) {
    return (
      <ModulePage metadata={metadata}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading appraisal...</p>
          </div>
        </div>
      </ModulePage>
    )
  }

  if (error || !appraisal) {
    return (
      <ModulePage metadata={metadata}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Appraisal Not Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              The performance appraisal you're looking for could not be loaded.
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm text-white hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </ModulePage>
    )
  }

  const actions = (
    <div className="flex space-x-3">
      <button
        onClick={handleExportPDF}
        disabled={exportingPDF || !appraisal}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowDownTrayIcon className={`h-4 w-4 mr-2 ${exportingPDF ? 'animate-spin' : ''}`} />
        {exportingPDF ? 'Exporting...' : 'Export PDF'}
      </button>
      {/* Only show edit button for drafts, not for submitted appraisals when reviewing */}
      {appraisal && appraisal.status === "draft" && !isReviewContext && (
        <Link href={`/hr/performance/appraisals/${appraisal.id}/edit`}>
          <button className="inline-flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-md text-sm text-white hover:bg-blue-700">
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Appraisal
          </button>
        </Link>
      )}
    </div>
  )

  return (
    <ModulePage metadata={metadata} actions={actions}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Export PDF Button */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/hr/performance/appraisals"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {appraisal.employeeName}'s Performance Appraisal
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {appraisal.period} • {appraisal.position} • {appraisal.department}
                </p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appraisal.status)}`}>
                    {appraisal.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
              <button
                onClick={handleExportPDF}
                disabled={exportingPDF || !appraisal}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className={`h-4 w-4 mr-2 ${exportingPDF ? 'animate-spin' : ''}`} />
                {exportingPDF ? 'Exporting...' : 'Export PDF'}
              </button>
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
                  <span>{appraisal.employeeName}'s Performance Appraisal</span>
                </button>
                {isSupervisor && appraisal.status !== 'draft' && (
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
                {isReviewer && appraisal.status !== 'draft' && (appraisal.supervisorApproval === 'approved' || (appraisal.status === 'revision_requested' && appraisal.supervisorApprovedAt)) && (
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

        <div className="space-y-6" id="appraisal-content-to-export" ref={appraisalContentRef}>
          {/* Tab 1: Submitted Appraisal Content */}
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
                        {appraisalSteps[currentStep - 1]?.title || 'Step'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appraisalSteps[currentStep - 1]?.description || ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Step {currentStep} of {appraisalSteps.length}
                  </span>
                </div>
              </div>
              
              {/* Step Indicators */}
              <div className="px-8 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  {appraisalSteps.map((step, index) => (
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
                      {index < appraisalSteps.length - 1 && (
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
                    <h2 className="text-2xl font-bold text-gray-900">Performance Appraisal Details</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {appraisal.period} • {appraisal.employeeName} • {appraisal.position}
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
                    disabled={currentStep === appraisalSteps.length}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      currentStep === appraisalSteps.length
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    Next →
                  </button>
                </div>
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
                        (appraisal.supervisorApproval === 'approved' || appraisal.status === 'supervisor_approved')
                          ? 'bg-green-100 text-green-800'
                          : (appraisal.supervisorApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                      }`}
                    >
                      {(appraisal.supervisorApproval === 'approved' || appraisal.status === 'supervisor_approved')
                        ? 'approved'
                        : (appraisal.supervisorApproval || 'pending')}
                    </span>
                  </div>
                  {appraisal.supervisorApprovedAt && (
                    <p className="text-xs text-gray-500">
                      Approved: {new Date(appraisal.supervisorApprovedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Reviewer Approval</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        (appraisal.reviewerApproval === 'approved' || appraisal.reviewerApprovedAt)
                          ? 'bg-green-100 text-green-800'
                          : (appraisal.reviewerApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                      }`}
                    >
                      {(appraisal.reviewerApproval === 'approved' || appraisal.reviewerApprovedAt)
                        ? 'approved'
                        : (appraisal.reviewerApproval || 'pending')}
                    </span>
                  </div>
                  {appraisal.reviewerApprovedAt && (
                    <p className="text-xs text-gray-500">
                      Approved: {new Date(appraisal.reviewerApprovedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Legacy content removed - now using step-by-step view */}
          {activeWorkflowTab === 'submitted' && !formData && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading appraisal data...</p>
            </div>
          )}

          {/* Tab 2: Supervisor Review */}
          {activeWorkflowTab === 'supervisor' && isSupervisor && appraisal.status !== 'draft' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <UserCircleIcon className="h-6 w-6 text-orange-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Supervisor Review</h2>
                    <p className="text-sm text-gray-600">Review and provide feedback on {appraisal.employeeName}'s performance appraisal</p>
                  </div>
                </div>

                {/* Appraisal Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Appraisal Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Period:</span>
                      <p className="font-medium text-gray-900">{appraisal.period}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Overall Rating:</span>
                      <p className="font-medium text-gray-900">
                        {(() => {
                          const calculated = calculateOverallRating()
                          const stored = appraisal.overallRating
                          // Prefer calculated from formData (most up-to-date), then stored, then fallback
                          const displayRating = calculated !== "0.0" ? calculated : (stored || "0.0")
                          return `${displayRating}/5`
                        })()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium text-gray-900">{appraisal.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Submitted:</span>
                      <p className="font-medium text-gray-900">
                        {appraisal.submittedAt ? new Date(appraisal.submittedAt).toLocaleDateString() : 'Not submitted'}
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
                  {appraisal.supervisorApproval === 'approved' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <p className="text-green-800 font-medium">This appraisal has been approved by you.</p>
                      </div>
                      {appraisal.supervisorApprovedAt && (
                        <p className="text-sm text-green-700 mt-2">
                          Approved on: {new Date(appraisal.supervisorApprovedAt).toLocaleString()}
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
                        placeholder="Provide your feedback and comments on this performance appraisal..."
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
                          disabled={submittingWorkflow || appraisal.supervisorApproval === 'approved'}
                          className={`px-6 py-2 rounded-lg transition-colors ${
                            appraisal.supervisorApproval === 'approved'
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {submittingWorkflow ? 'Processing...' : appraisal.supervisorApproval === 'approved' ? '✓ Approved' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleWorkflowAction('request_changes', 'supervisor')}
                          disabled={submittingWorkflow || !currentSupervisorComment.trim() || appraisal.supervisorApproval === 'approved'}
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
          {activeWorkflowTab === 'reviewer' && isReviewer && appraisal.status !== 'draft' && (appraisal.supervisorApproval === 'approved' || (appraisal.status === 'revision_requested' && appraisal.supervisorApprovedAt)) && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Final Review</h2>
                    <p className="text-sm text-gray-600">Final reviewer assessment for {appraisal.employeeName}'s performance appraisal</p>
                  </div>
                </div>

                {/* Appraisal Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Appraisal Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Period:</span>
                      <p className="font-medium text-gray-900">{appraisal.period}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Overall Rating:</span>
                      <p className="font-medium text-gray-900">
                        {(() => {
                          const calculated = calculateOverallRating()
                          const stored = appraisal.overallRating
                          // Prefer calculated from formData (most up-to-date), then stored, then fallback
                          const displayRating = calculated !== "0.0" ? calculated : (stored || "0.0")
                          return `${displayRating}/5`
                        })()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium text-gray-900">{appraisal.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Supervisor:</span>
                      <p className={`font-medium ${
                        appraisal.supervisorApproval === 'approved' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {appraisal.supervisorApproval === 'approved' ? 'Approved' : 'Pending'}
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
                  {appraisal.reviewerApproval === 'approved' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <p className="text-green-800 font-medium">This appraisal has been approved by you.</p>
                      </div>
                      {appraisal.reviewerApprovedAt && (
                        <p className="text-sm text-green-700 mt-2">
                          Approved on: {new Date(appraisal.reviewerApprovedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModulePage>
  )
}
