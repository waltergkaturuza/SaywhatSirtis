"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { exportService } from "@/lib/export-service"
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
  const [activeSection, setActiveSection] = useState("overview")
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
            
            const isSupervisorRole = supervisorId === session.user.id
            const isReviewerRole = reviewerId === session.user.id
            
            setIsSupervisor(isSupervisorRole)
            setIsReviewer(isReviewerRole)
            
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
              // Check if supervisor has already approved by looking at workflow comments
              const hasSupervisorApproved = comments.supervisor.some((c: any) => c.action === 'approve') || false
              
              if (isSupervisorRole && !hasSupervisorApproved) {
                setActiveWorkflowTab('supervisor')
              } else if (isReviewerRole && hasSupervisorApproved) {
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
      
      // Reload appraisal data to get updated comments
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
    if (!appraisal?.performanceAreas || !Array.isArray(appraisal.performanceAreas) || appraisal.performanceAreas.length === 0) return 0
    const totalWeight = appraisal.performanceAreas.reduce((sum, area) => sum + (area.weight || 0), 0)
    const weightedScore = appraisal.performanceAreas.reduce((sum, area) => sum + ((area.rating || 0) * (area.weight || 0)), 0)
    return totalWeight > 0 ? (weightedScore / totalWeight).toFixed(1) : "0.0"
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
                {isReviewer && appraisal.status !== 'draft' && (
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
          {activeWorkflowTab === 'submitted' && (
          <>
          {/* Navigation Tabs for Content Sections */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: "overview", name: "Overview", icon: ChartBarIcon },
                { id: "performance", name: "Performance Areas", icon: StarIcon },
                { id: "achievements", name: "Achievements", icon: TrophyIcon },
                { id: "development", name: "Development", icon: LightBulbIcon },
                { id: "feedback", name: "Feedback", icon: ChatBubbleLeftRightIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeSection === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeSection === "overview" && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Overall Rating</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {appraisal.overallRating || calculateOverallRating()}
                        </p>
                      </div>
                      <StarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Plan Progress</p>
                        <p className="text-2xl font-bold text-green-900">{appraisal.planProgress}%</p>
                      </div>
                      <ArrowPathIcon className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Completion</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {appraisal.status === "completed" ? "100%" : "In Progress"}
                        </p>
                      </div>
                      <CheckCircleIcon className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Appraisal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Appraisal Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Supervisor:</span>
                        <span className="font-medium">{appraisal.supervisor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reviewer:</span>
                        <span className="font-medium">{appraisal.reviewer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">
                          {appraisal.submittedAt 
                            ? new Date(appraisal.submittedAt).toLocaleDateString()
                            : "Not submitted"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reviewed:</span>
                        <span className="font-medium">
                          {appraisal.reviewedAt 
                            ? new Date(appraisal.reviewedAt).toLocaleDateString()
                            : "Not reviewed"
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Key Strengths</h4>
                        <p className="text-sm text-gray-600">
                          {appraisal.strengths || "Not yet provided"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Areas for Improvement</h4>
                        <p className="text-sm text-gray-600">
                          {appraisal.areasImprovement || "Not yet provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "performance" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Performance Areas Assessment</h3>
                
                {appraisal.performanceAreas && Array.isArray(appraisal.performanceAreas) && appraisal.performanceAreas.length > 0 ? (
                  appraisal.performanceAreas.map((area, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{area.area}</h4>
                        <p className="text-sm text-gray-600 mt-1">Weight: {area.weight}%</p>
                      </div>
                      <div className="text-right">
                        {area.rating > 0 ? (
                          <>
                            {renderStars(area.rating)}
                            <p className="text-sm text-gray-600 mt-1">
                              Weighted Score: {((area.rating * area.weight) / 100).toFixed(1)}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Not rated</span>
                        )}
                      </div>
                    </div>

                    {area.comments && (
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-700 mb-1">Comments</h5>
                        <p className="text-sm text-gray-600">{area.comments}</p>
                      </div>
                    )}

                    {area.evidence && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Evidence</h5>
                        <p className="text-sm text-gray-600">{area.evidence}</p>
                      </div>
                    )}
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <StarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No performance areas recorded yet</p>
                  </div>
                )}

                {appraisal.performanceAreas && Array.isArray(appraisal.performanceAreas) && appraisal.performanceAreas.some(area => (area.rating || 0) > 0) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Overall Performance Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Calculated Rating:</span>
                        <span className="ml-2 font-semibold">{calculateOverallRating()}/5</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Total Weight:</span>
                        <span className="ml-2 font-semibold">
                          {appraisal.performanceAreas && Array.isArray(appraisal.performanceAreas) 
                            ? appraisal.performanceAreas.reduce((sum, area) => sum + (area.weight || 0), 0)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "achievements" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Key Achievements</h3>
                
                {appraisal.achievements && Array.isArray(appraisal.achievements) && appraisal.achievements.length > 0 ? (
                  appraisal.achievements.map((achievement, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <TrophyIcon className="h-6 w-6 text-yellow-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{achievement.achievement}</h4>
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Impact</h5>
                              <p className="text-sm text-gray-600">{achievement.impact}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Evidence</h5>
                              <p className="text-sm text-gray-600">{achievement.evidence}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrophyIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No achievements recorded yet</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === "development" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Development Plans</h3>
                
                {appraisal.developmentPlans && Array.isArray(appraisal.developmentPlans) && appraisal.developmentPlans.length > 0 ? (
                  appraisal.developmentPlans.map((plan, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <LightBulbIcon className="h-6 w-6 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-3">{plan.area}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Current Level</h5>
                              <p className="text-sm text-gray-600">{plan.currentLevel}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Target Level</h5>
                              <p className="text-sm text-gray-600">{plan.targetLevel}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Timeline</h5>
                              <p className="text-sm text-gray-600">{plan.timeline}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Resources</h5>
                              <p className="text-sm text-gray-600">{plan.resources}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <LightBulbIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No development plans created yet</p>
                  </div>
                )}

                {appraisal.improvementPlan && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h4 className="font-semibold text-orange-900 mb-2">Improvement Plan</h4>
                    <p className="text-sm text-orange-800">{appraisal.improvementPlan}</p>
                  </div>
                )}

                {appraisal.nextSteps && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-2">Next Steps</h4>
                    <div className="text-sm text-green-800">
                      {appraisal.nextSteps.split('\\n').map((step, index) => (
                        <p key={index} className="mb-1">{step}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "feedback" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Feedback & Comments</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Employee Comments */}
                  {appraisal.employeeComments && (
                    <div className="border rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Employee Response</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{appraisal.employeeComments}</p>
                          <p className="text-xs text-gray-500 mt-2">— {appraisal.employeeName}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Supervisor Comments History */}
                  {workflowComments.supervisor && workflowComments.supervisor.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Supervisor Comments History</h4>
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
                      <h4 className="font-semibold text-gray-900 mb-3">Reviewer Comments History</h4>
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
                  {workflowComments.supervisor.length === 0 && workflowComments.reviewer.length === 0 && appraisal.supervisorComments && (
                    <div className="border rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <UserIcon className="h-6 w-6 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Supervisor Comments</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{appraisal.supervisorComments}</p>
                          <p className="text-xs text-gray-500 mt-2">— {appraisal.supervisor}</p>
                        </div>
                      </div>
                    </div>
                  )}


                  {!appraisal.supervisorComments && !appraisal.employeeComments && workflowComments.supervisor.length === 0 && workflowComments.reviewer.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No feedback provided yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>
          </>
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
                      <p className="font-medium text-gray-900">{appraisal.overallRating || calculateOverallRating()}/5</p>
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
          {activeWorkflowTab === 'reviewer' && isReviewer && appraisal.status !== 'draft' && (
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
                      <p className="font-medium text-gray-900">{appraisal.overallRating || calculateOverallRating()}/5</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium text-gray-900">{appraisal.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Supervisor:</span>
                      <p className={`font-medium ${
                        workflowComments.supervisor && workflowComments.supervisor.some((c: any) => c.action === 'approve') ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {workflowComments.supervisor && workflowComments.supervisor.some((c: any) => c.action === 'approve') ? 'Approved' : 'Pending'}
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
      </div>
    </ModulePage>
  )
}
