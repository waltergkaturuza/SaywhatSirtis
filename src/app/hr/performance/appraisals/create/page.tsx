'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import { showToast, showError, showSuccess, showInfo } from '@/components/ui/toast'
import { handleApiError } from '@/lib/utils'
import { hrApi } from '@/lib/api'
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

export default function CreateAppraisalPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<AppraisalFormData>({
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
        { id: '1', name: 'Job Knowledge', rating: 0, comment: '', weight: 20 },
        { id: '2', name: 'Quality of Work', rating: 0, comment: '', weight: 20 },
        { id: '3', name: 'Productivity', rating: 0, comment: '', weight: 15 },
        { id: '4', name: 'Communication', rating: 0, comment: '', weight: 15 },
        { id: '5', name: 'Teamwork', rating: 0, comment: '', weight: 15 },
        { id: '6', name: 'Initiative', rating: 0, comment: '', weight: 15 }
      ],
      strengths: [],
      areasForImprovement: []
    },
    achievements: {
      goals: [{ id: "1", description: "", status: "not-achieved" as const, comment: "" }],
      keyAccomplishments: [""],
      additionalContributions: [""]
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
      recommendation: "maintain-current" as const,
      salaryRecommendation: ""
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateFormData = (updates: Partial<AppraisalFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }))
  }

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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      showSuccess(
        'Appraisal Created',
        'Performance appraisal has been created successfully.'
      )

      setTimeout(() => {
        router.push('/hr/performance/appraisals')
      }, 2000)
    } catch (error) {
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
      showInfo(
        'Draft Saved',
        'Your appraisal draft has been saved successfully.'
      )
    } catch (error) {
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
          <PerformanceAssessmentStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      case 3:
        return (
          <AchievementsGoalsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      case 4:
        return (
          <DevelopmentPlanningStep
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
      <div className="w-full px-6 py-6">
        <h1 className="text-3xl font-bold text-black mb-8">Create Performance Appraisal</h1>

        {/* Progress */}
        <Card className="mb-8 border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Step {currentStep} of {appraisalSteps.length}</h3>
              <span className="text-sm text-orange-600 font-medium">
                {Math.round((currentStep / appraisalSteps.length) * 100)}% Complete
              </span>
            </div>
            <Progress value={(currentStep / appraisalSteps.length) * 100} className="mb-4 [&>div]:bg-orange-500" />
            
            <div className="grid grid-cols-6 gap-4">
              {appraisalSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-center p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-orange-100 border-2 border-orange-500'
                      : currentStep > step.id
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    currentStep === step.id
                      ? 'text-orange-700'
                      : currentStep > step.id
                      ? 'text-green-700'
                      : 'text-gray-600'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-xs mt-1 ${
                    currentStep === step.id
                      ? 'text-orange-600'
                      : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}>
                    {step.description}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-8 border-l-4 border-l-gray-500 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black">{appraisalSteps[currentStep - 1]?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </Button>

            {currentStep === appraisalSteps.length ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Appraisal'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
