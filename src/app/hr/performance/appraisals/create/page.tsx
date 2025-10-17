'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react'
import { showToast, showError, showSuccess, showInfo } from '@/components/ui/toast'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import {
  AppraisalFormData,
  appraisalSteps,
  WorkflowComment
} from "@/components/hr/performance/appraisal-types"
import { EmployeeDetailsStep } from "@/components/hr/performance/employee-details-step"
import { PerformanceAssessmentStep } from "@/components/hr/performance/performance-assessment-step"
import { AchievementsGoalsStep } from "@/components/hr/performance/achievements-goals-step"
import { DevelopmentPlanningStep } from "@/components/hr/performance/development-planning-step"
import { CommentsReviewStep } from "@/components/hr/performance/comments-review-step"
import { FinalReviewStep } from "@/components/hr/performance/final-review-step"

function CreateAppraisalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  // Check if this is self-assessment mode
  const isSelfAssessment = searchParams?.get('mode') === 'self'
  
  // Check if we're loading an existing appraisal
  const appraisalId = searchParams?.get('appraisalId')
  const isEditMode = !!appraisalId
  
  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState('my-appraisal')
  const [isLoadingAppraisal, setIsLoadingAppraisal] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Workflow state
  const [workflowStatus, setWorkflowStatus] = useState('draft')
  const [supervisorCommentsHistory, setSupervisorCommentsHistory] = useState<WorkflowComment[]>([])
  const [reviewerCommentsHistory, setReviewerCommentsHistory] = useState<WorkflowComment[]>([])
  const [currentSupervisorComment, setCurrentSupervisorComment] = useState('')
  const [currentReviewerComment, setCurrentReviewerComment] = useState('')
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false)
  
  const [formData, setFormData] = useState<AppraisalFormData>({
    id: undefined,
    employee: {
      id: '',
      name: '',
      email: '',
      department: '',
      position: '',
      manager: '',
      hireDate: '',
      reviewPeriod: {
        startDate: '',
        endDate: ''
      }
    },
    performance: {
      overallRating: 0,
      categories: [
        { id: '1', name: 'Teamwork', rating: 0, comment: '', weight: 20, description: 'Working collaboratively with others to achieve common goals and support team success.' },
        { id: '2', name: 'Responsiveness and Effectiveness', rating: 0, comment: '', weight: 20, description: 'Acting promptly and efficiently to meet stakeholder needs and deliver quality results.' },
        { id: '3', name: 'Accountability', rating: 0, comment: '', weight: 20, description: 'Taking ownership of responsibilities and being answerable for actions and outcomes.' },
        { id: '4', name: 'Professionalism and Integrity', rating: 0, comment: '', weight: 20, description: 'Maintaining high ethical standards, honesty, and professional conduct in all interactions.' },
        { id: '5', name: 'Innovation', rating: 0, comment: '', weight: 20, description: 'Embracing creativity and new ideas to improve processes, services, and outcomes.' }
      ],
      strengths: [],
      areasForImprovement: []
    },
    achievements: {
      keyResponsibilities: []
    },
    development: {
      trainingNeeds: [""],
      careerAspirations: "",
      skillsToImprove: [""],
      developmentPlan: []
    },
    comments: {
      employeeComments: "",
      managerComments: "",
      hrComments: ""
    },
    ratings: {
      finalRating: 0,
      actualPoints: 0,
      maxPoints: 0,
      percentage: 0,
      ratingCode: "",
      recommendation: "maintain-current" as const,
      salaryRecommendation: ""
    },
    signatures: {
      supervisorSignature: "",
      supervisorSignedAt: undefined,
      supervisorMeetingDate: undefined,
      supervisorMeetingConfirmed: false,
      reviewerSignature: "",
      reviewerSignedAt: undefined,
      reviewerMeetingDate: undefined,
      reviewerMeetingConfirmed: false
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  // Tab navigation
  const tabs = [
    {
      id: 'my-appraisal',
      name: 'My Appraisal', 
      description: 'Complete your self-assessment',
      enabled: true
    },
    {
      id: 'supervisor',
      name: 'Supervisor Review',
      description: 'Supervisor feedback and approval',
      enabled: true
    },
    {
      id: 'reviewer',
      name: 'Final Review',
      description: 'Final reviewer assessment',
      enabled: true
    }
  ]

  const loadCurrentUserData = async () => {
    try {
      console.log('🔍 Loading employee profile data...')
      const response = await fetch('/api/employee/profile')
      if (response.ok) {
        const profileData = await response.json()
        console.log('✅ Profile data received:', profileData)
        console.log('📋 Job Description:', profileData.jobDescription)
        
        // Extract key responsibilities from job description (same as Performance Plan)
        let keyResponsibilities: any[] = []
        if (profileData.jobDescription?.keyResponsibilities) {
          // Handle both array and object formats from Prisma JSON field
          let responsibilitiesData = profileData.jobDescription.keyResponsibilities
          
          // If it's a string, parse it
          if (typeof responsibilitiesData === 'string') {
            try {
              responsibilitiesData = JSON.parse(responsibilitiesData)
            } catch (e) {
              console.error('Failed to parse keyResponsibilities string:', e)
              responsibilitiesData = []
            }
          }
          
          // Convert object to array if needed (sometimes Prisma returns {0: {...}, 1: {...}})
          if (responsibilitiesData && typeof responsibilitiesData === 'object' && !Array.isArray(responsibilitiesData)) {
            responsibilitiesData = Object.values(responsibilitiesData)
          }
          
          // Now map the array
          if (Array.isArray(responsibilitiesData) && responsibilitiesData.length > 0) {
            console.log(`📋 Found ${responsibilitiesData.length} key responsibilities`)
            keyResponsibilities = responsibilitiesData.map((resp: any, index: number) => ({
              id: `${Date.now()}-${index}`,
              description: resp.description || '',
              tasks: resp.tasks || '',
              weight: resp.weight || 0,
              targetDate: '',
              status: 'Not Started',
              achievementStatus: 'not-achieved' as const,
              comment: '',
              successIndicators: (resp.successIndicators || []).map((indicator: any, indIndex: number) => ({
                id: `ind-${index + 1}-${indIndex + 1}`,
                indicator: indicator.indicator || '',
                target: Number(indicator.target) || 0,
                actualValue: 0,
                weight: Number(indicator.weight) || 0,
                measurement: indicator.measurement || '',
                achievementPercentage: 0
              }))
            }))
          }
        }
        
        updateFormData({
          employee: {
            id: profileData.id || '',
            name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
            email: profileData.email || session?.user?.email || '',
            department: profileData.departments?.name || profileData.department || '',
            position: profileData.position || '',
            manager: profileData.supervisor ? `${profileData.supervisor.firstName} ${profileData.supervisor.lastName}` : '',
            reviewer: profileData.reviewer ? `${profileData.reviewer.firstName} ${profileData.reviewer.lastName}` : '',
            hireDate: profileData.hireDate || profileData.startDate || '',
            reviewPeriod: {
              startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
              endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]
            }
          },
          achievements: {
            ...formData.achievements,
            keyResponsibilities
          }
        })
        
        console.log('💾 Form data updated with', keyResponsibilities.length, 'key responsibilities')
      } else {
        console.error('❌ Failed to fetch profile, status:', response.status)
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error)
    }
  }

  const updateFormData = (updates: Partial<AppraisalFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }))
  }

  // Load existing appraisal if appraisalId is provided
  useEffect(() => {
    const loadExistingAppraisal = async () => {
      if (!appraisalId) return
      
      setIsLoadingAppraisal(true)
      try {
        console.log('🔍 Loading appraisal:', appraisalId)
        const response = await fetch(`/api/hr/performance/appraisals/${appraisalId}`)
        
        if (response.ok) {
          const appraisalData = await response.json()
          console.log('✅ Appraisal loaded:', appraisalData)
          
          // TODO: Transform and populate form data from appraisalData
          // For now, just log it
          alert('Appraisal loading functionality is being implemented. Your appraisal data is available in the console.')
        } else {
          console.error('❌ Failed to load appraisal')
          alert('Failed to load appraisal. It may have been deleted.')
        }
      } catch (error) {
        console.error('❌ Error loading appraisal:', error)
        alert('Error loading appraisal. Please try again.')
      } finally {
        setIsLoadingAppraisal(false)
      }
    }
    
    loadExistingAppraisal()
  }, [appraisalId])

  // Load current user data on mount
  useEffect(() => {
    setMounted(true)
    
    // Auto-fill current user data (always load for the logged-in user)
    if (session?.user?.email) {
      console.log('🚀 useEffect triggered, calling loadCurrentUserData...')
      loadCurrentUserData()
    } else {
      console.log('⚠️ No session or email found')
    }
  }, [session?.user?.email])

  const nextStep = () => {
    if (currentStep < appraisalSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Workflow action handlers
  const handleWorkflowAction = async (action: 'comment' | 'request_changes' | 'approve' | 'final_approve', role: 'supervisor' | 'reviewer') => {
    if (!formData.id) {
      alert('Please save the appraisal first before submitting for review.')
      return
    }

    const comment = role === 'supervisor' ? currentSupervisorComment : currentReviewerComment
    
    if (action === 'request_changes' && !comment) {
      alert('Please provide feedback when requesting changes.')
      return
    }

    setSubmittingWorkflow(true)
    try {
      const response = await fetch(`/api/hr/performance/appraisals/${formData.id}/workflow`, {
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
        throw new Error('Failed to process workflow action')
      }

      const result = await response.json()
      
      // Update local state
      if (result.appraisal.comments) {
        if (role === 'supervisor' && result.appraisal.comments.supervisor) {
          setSupervisorCommentsHistory(result.appraisal.comments.supervisor)
        } else if (role === 'reviewer' && result.appraisal.comments.reviewer) {
          setReviewerCommentsHistory(result.appraisal.comments.reviewer)
        }
      }
      
      setWorkflowStatus(result.appraisal.status)
      
      // Clear current comment
      if (role === 'supervisor') {
        setCurrentSupervisorComment('')
      } else {
        setCurrentReviewerComment('')
      }

      // Show success message
      let message = ''
      switch (action) {
        case 'request_changes':
          message = 'Changes requested. Employee will be notified to revise the appraisal.'
          break
        case 'approve':
          message = 'Appraisal approved and forwarded to final reviewer.'
          break
        case 'final_approve':
          message = 'Appraisal has been given final approval!'
          break
        case 'comment':
          message = 'Comment added successfully.'
          break
      }
      alert(message)

    } catch (error) {
      console.error('Error processing workflow action:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmittingWorkflow(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      console.log('Submitting appraisal data:', formData)
      
      const response = await fetch('/api/hr/performance/appraisals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          status: 'submitted',
          submittedAt: new Date().toISOString()
        })
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to submit appraisal')
      }

      showSuccess(
        isSelfAssessment ? 'Self-Assessment Submitted' : 'Appraisal Created',
        isSelfAssessment 
          ? 'Your self-assessment has been submitted successfully.'
          : 'Performance appraisal has been created successfully.'
      )

      setTimeout(() => {
        router.push(isSelfAssessment ? '/employee/performance' : '/hr/performance/appraisals')
      }, 2000)
    } catch (error) {
      console.error('Error submitting appraisal:', error)
      showError(
        'Creation Failed',
        'An error occurred while creating the appraisal.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    
    try {
      console.log('Saving draft data:', formData)
      
      const response = await fetch('/api/hr/performance/appraisals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft'
        })
      })

      const result = await response.json()
      console.log('Save draft response:', result)

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to save draft')
      }

      showInfo(
        'Draft Saved',
        'Your appraisal draft has been saved successfully.'
      )
    } catch (error) {
      console.error('Error saving draft:', error)
      showError(
        'Save Failed',
        'An error occurred while saving the draft.'
      )
    } finally {
      setIsSavingDraft(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <EmployeeDetailsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      case 2:
        return (
          <AchievementsGoalsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      case 3:
        return (
          <DevelopmentPlanningStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      case 4:
        return (
          <PerformanceAssessmentStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      case 5:
        return (
          <CommentsReviewStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      case 6:
        return (
          <FinalReviewStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      default:
        return null
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation Icons */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={() => router.push(isSelfAssessment ? '/employee' : '/hr/dashboard')}
            className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
            title="Home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <button
            onClick={() => router.back()}
            className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
            title="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button
            onClick={() => router.push(isSelfAssessment ? '/employee/performance' : '/hr/performance/appraisals')}
            className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
            title="Return to Appraisals"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
        </div>

        <h1 className="text-3xl font-bold text-black mb-2">
          {isSelfAssessment ? 'Self-Assessment Appraisal' : 'Create Performance Appraisal'}
        </h1>
        <p className="text-gray-600 mb-8">
          {isSelfAssessment 
            ? 'Complete your self-assessment to reflect on your performance, achievements, and development areas.'
            : 'Comprehensive performance appraisal with goals and expectations'
          }
        </p>

        {/* Tab Navigation */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => tab.enabled && setActiveTab(tab.id)}
                disabled={!tab.enabled}
                className={`flex-1 px-6 py-4 text-center transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-b-4 border-orange-500 text-orange-700 font-semibold'
                    : tab.enabled
                    ? 'hover:bg-gray-50 text-gray-700'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-sm font-medium">{tab.name}</div>
                <div className="text-xs mt-1">{tab.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* My Appraisal Tab */}
          {activeTab === 'my-appraisal' && (
            <div>
        {/* Progress */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Step {currentStep} of {appraisalSteps.length}</h3>
              <span className="text-sm text-orange-600 font-medium">
                {Math.round((currentStep / appraisalSteps.length) * 100)}% Complete
              </span>
            </div>
            <Progress value={(currentStep / appraisalSteps.length) * 100} className="mb-4 [&>div]:bg-orange-500" />
            
            <div className="grid grid-cols-6 gap-4">
                  {appraisalSteps.map((step) => (
                <div
                  key={step.id}
                  className={`text-center p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                          ? 'bg-orange-500 text-white shadow-lg'
                      : currentStep > step.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-white text-gray-600'
                      }`}
                    >
                      <div className="text-xs font-medium">{step.title}</div>
                  </div>
                  ))}
                </div>
            </div>

        {/* Step Content */}
              <div className="px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{appraisalSteps[currentStep - 1]?.title}</h2>
            {renderStepContent()}
              </div>

        {/* Navigation */}
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
                  className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
                    className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </Button>

            {currentStep === appraisalSteps.length ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Appraisal'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
              </div>
            </div>
          )}

          {/* Supervisor Review Tab */}
          {activeTab === 'supervisor' && (
            <div>
              {/* Supervisor Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Supervisor Review</h2>
                      <p className="text-gray-600 text-sm mt-1">Review employee's appraisal and provide feedback</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    workflowStatus === 'supervisor_approved' ? 'bg-green-100 text-green-800' :
                    workflowStatus === 'revision_requested' ? 'bg-yellow-100 text-yellow-800' :
                    workflowStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workflowStatus.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Supervisor Content */}
              <div className="px-8 py-8 space-y-6">
                {/* Appraisal Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee's Appraisal Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Employee:</span>
                      <span className="ml-2 text-gray-900">{formData.employee.name || 'Not Selected'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Review Period:</span>
                      <span className="ml-2 text-gray-900">{formData.employee.reviewPeriod?.startDate} to {formData.employee.reviewPeriod?.endDate}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Department:</span>
                      <span className="ml-2 text-gray-900">{formData.employee.department || 'Not Assigned'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2 text-gray-900">{workflowStatus.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Comments History Timeline */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Comments & Feedback History
                  </h3>
                  
                  {supervisorCommentsHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No comments yet. Supervisor feedback will appear here.</p>
                  ) : (
                    <div className="space-y-4">
                      {supervisorCommentsHistory.map((comment) => (
                        <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {comment.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{comment.name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              comment.action === 'approve' ? 'bg-green-100 text-green-800' :
                              comment.action === 'request_changes' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {comment.action.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {comment.comment && (
                            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded">{comment.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Supervisor Action Panel */}
                {!isSelfAssessment && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supervisor Actions</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Comment or Feedback
                        </label>
                        <textarea
                          value={currentSupervisorComment}
                          onChange={(e) => setCurrentSupervisorComment(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Provide detailed feedback on the employee's appraisal, achievements, and development areas..."
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleWorkflowAction('comment', 'supervisor')}
                          disabled={submittingWorkflow || !currentSupervisorComment}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span>Add Comment</span>
                        </button>

                        <button
                          onClick={() => handleWorkflowAction('request_changes', 'supervisor')}
                          disabled={submittingWorkflow || !currentSupervisorComment}
                          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>Request Changes</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to approve this appraisal and forward it to the final reviewer?')) {
                              handleWorkflowAction('approve', 'supervisor')
                            }
                          }}
                          disabled={submittingWorkflow}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Approve & Forward to Reviewer</span>
                        </button>
                      </div>

                      {submittingWorkflow && (
                        <div className="text-sm text-blue-600 flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final Reviewer Tab */}
          {activeTab === 'reviewer' && (
            <div>
              {/* Reviewer Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Final Review</h2>
                      <p className="text-gray-600 text-sm mt-1">Final assessment and approval of the appraisal</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    workflowStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    workflowStatus === 'supervisor_approved' ? 'bg-blue-100 text-blue-800' :
                    workflowStatus === 'revision_requested' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workflowStatus.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Reviewer Content */}
              <div className="px-8 py-8 space-y-6">
                {/* Workflow Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Appraisal Workflow Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm text-gray-900">Employee: {formData.employee.name || 'Not Selected'}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className={`h-5 w-5 mr-3 ${workflowStatus === 'supervisor_approved' || workflowStatus === 'approved' ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm text-gray-900">Supervisor: {workflowStatus === 'supervisor_approved' || workflowStatus === 'approved' ? 'Approved' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className={`h-5 w-5 mr-3 ${workflowStatus === 'approved' ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm text-gray-900">Final Reviewer: {workflowStatus === 'approved' ? 'Approved' : 'Pending'}</span>
                    </div>
                  </div>
                </div>

                {/* Supervisor Comments Summary */}
                {supervisorCommentsHistory.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Supervisor Feedback Summary</h3>
                    <div className="space-y-2">
                      {supervisorCommentsHistory.slice(-2).map((comment) => (
                        <div key={comment.id} className="bg-white p-3 rounded border border-blue-100">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-gray-900">{comment.name}</p>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              comment.action === 'approve' ? 'bg-green-100 text-green-800' :
                              comment.action === 'request_changes' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {comment.action.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {comment.comment && <p className="text-sm text-gray-700">{comment.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviewer Comments History Timeline */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Final Reviewer Comments & Feedback
                  </h3>
                  
                  {reviewerCommentsHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No final reviewer comments yet. Feedback will appear here once the reviewer provides input.</p>
                  ) : (
                    <div className="space-y-4">
                      {reviewerCommentsHistory.map((comment) => (
                        <div key={comment.id} className="border-l-4 border-green-500 pl-4 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-semibold text-sm">
                                  {comment.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{comment.name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              comment.action === 'final_approve' ? 'bg-green-100 text-green-800' :
                              comment.action === 'request_changes' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {comment.action.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {comment.comment && (
                            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded">{comment.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviewer Action Panel */}
                {!isSelfAssessment && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Reviewer Actions</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Final Review Comment
                        </label>
                        <textarea
                          value={currentReviewerComment}
                          onChange={(e) => setCurrentReviewerComment(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Provide final assessment and overall feedback on the appraisal..."
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleWorkflowAction('comment', 'reviewer')}
                          disabled={submittingWorkflow || !currentReviewerComment}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span>Add Comment</span>
                        </button>

                        <button
                          onClick={() => handleWorkflowAction('request_changes', 'reviewer')}
                          disabled={submittingWorkflow || !currentReviewerComment}
                          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>Request Changes</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to give final approval to this appraisal? This will make it active and complete.')) {
                              handleWorkflowAction('final_approve', 'reviewer')
                            }
                          }}
                          disabled={submittingWorkflow}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0121 12c0 3.044-1.143 5.822-3.018 7.938M15 11l2 2-4 4-2-2m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Final Approval</span>
                        </button>
                      </div>

                      {submittingWorkflow && (
                        <div className="text-sm text-green-600 flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CreateAppraisalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CreateAppraisalContent />
    </Suspense>
  )
}
