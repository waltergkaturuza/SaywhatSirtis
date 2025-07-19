"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useNotifications, NotificationContainer } from "@/components/ui/notifications"
import { LoadingWrapper } from "@/components/ui/skeleton"
import { hrApi, handleApiError, withRetry } from "@/lib/api-client"

import { 
  AppraisalFormData, 
  defaultFormData, 
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
    employeeId: "",
    employeeName: "",
    position: "",
    department: "",
    supervisor: "",
    reviewer: "",
    appraisalPeriod: "",
    startDate: "",
    endDate: "",
    appraisalType: "annual",
    performanceAreas: [
      {
        area: "Job Knowledge & Technical Skills",
        description: "",
        weight: 20,
        rating: 0,
        comments: "",
        evidence: ""
      },
      {
        area: "Quality of Work",
        description: "",
        weight: 20,
        rating: 0,
        comments: "",
        evidence: ""
      },
      {
        area: "Communication Skills",
        description: "",
        weight: 15,
        rating: 0,
        comments: "",
        evidence: ""
      },
      {
        area: "Team Collaboration",
        description: "",
        weight: 15,
        rating: 0,
        comments: "",
        evidence: ""
      },
      {
        area: "Initiative & Innovation",
        description: "",
        weight: 15,
        rating: 0,
        comments: "",
        evidence: ""
      },
      {
        area: "Leadership & Management",
        description: "",
        weight: 15,
        rating: 0,
        comments: "",
        evidence: ""
      }
    ],
    achievements: [{ achievement: "", impact: "", evidence: "" }],
    developmentAreas: [{ area: "", currentLevel: "", targetLevel: "", developmentPlan: "", timeline: "" }],
    goals: [{ goal: "", target: "", achieved: "", rating: 0, comments: "" }],
    overallRating: 0,
    overallComments: "",
    strengths: "",
    areasForImprovement: "",
    careerAspirations: "",
    trainingNeeds: "",
    recommendedActions: "",
    supervisorComments: "",
    supervisorRecommendations: "",
    selfAssessmentComments: "",
    employeeAgreement: false,
    employeeComments: "",
    status: "draft",
    submissionDate: "",
    reviewDate: ""
  })

  const metadata = {
    title: "Create Performance Appraisal",
    description: "Conduct comprehensive performance appraisal with ratings and feedback",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Appraisals", href: "/hr/performance/appraisals" },
      { name: "Create Appraisal" }
    ]
  }

  const steps = [
    { id: 1, title: "Employee Details", description: "Basic information and period" },
    { id: 2, title: "Performance Assessment", description: "Rate performance areas" },
    { id: 3, title: "Achievements & Goals", description: "Key achievements and goal assessment" },
    { id: 4, title: "Development Planning", description: "Growth areas and career planning" },
    { id: 5, title: "Comments & Review", description: "Supervisor and employee feedback" },
    { id: 6, title: "Final Review", description: "Submit and finalize appraisal" }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (arrayName: keyof AppraisalFormData, index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addArrayItem = (arrayName: keyof AppraisalFormData, template: any) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as any[]), template]
    }))
  }

  const removeArrayItem = (arrayName: keyof AppraisalFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).filter((_, i) => i !== index)
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const result = await withRetry(
        () => hrApi.createAppraisal({
          formData,
          isDraft: false
        }),
        3, // retry up to 3 times
        1000 // 1 second delay between retries
      )

      showSuccess(
        'Appraisal Submitted Successfully!',
        result.message || 'The performance appraisal has been saved and submitted for review.'
      )
      
      setTimeout(() => {
        router.push("/hr/performance/appraisals")
      }, 2000)
    } catch (error) {
      const errorMessage = handleApiError(error)
      showError(
        'Submission Failed',
        errorMessage
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    
    try {
      const result = await hrApi.createAppraisal({
        formData,
        isDraft: true
      })

      showInfo(
        'Draft Saved',
        result.message || 'Your appraisal draft has been saved successfully.'
      )
    } catch (error) {
      const errorMessage = handleApiError(error)
      showError(
        'Save Failed',
        errorMessage
      )
    } finally {
      setIsSavingDraft(false)
    }
  }

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: "Needs Improvement",
      2: "Below Expectations", 
      3: "Meets Expectations",
      4: "Exceeds Expectations",
      5: "Outstanding"
    }
    return labels[rating as keyof typeof labels] || "Not Rated"
  }

  const calculateOverallRating = () => {
    const totalWeight = formData.performanceAreas.reduce((sum, area) => sum + area.weight, 0)
    const weightedScore = formData.performanceAreas.reduce((sum, area) => sum + (area.rating * area.weight), 0)
    return totalWeight > 0 ? (weightedScore / totalWeight).toFixed(2) : "0.00"
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange("employeeName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange("employeeId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position/Job Title
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter position"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="programs">Programs</option>
                  <option value="finance">Finance</option>
                  <option value="hr">Human Resources</option>
                  <option value="operations">Operations</option>
                  <option value="communications">Communications</option>
                  <option value="monitoring">M&E</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direct Supervisor
                </label>
                <select
                  value={formData.supervisor}
                  onChange={(e) => handleInputChange("supervisor", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Supervisor</option>
                  <option value="john.doe">John Doe - Programs Director</option>
                  <option value="jane.smith">Jane Smith - HR Manager</option>
                  <option value="mike.johnson">Mike Johnson - Operations Manager</option>
                  <option value="sarah.williams">Sarah Williams - Finance Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Reviewer
                </label>
                <select
                  value={formData.reviewer}
                  onChange={(e) => handleInputChange("reviewer", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Reviewer</option>
                  <option value="ceo">Chief Executive Officer</option>
                  <option value="deputy.ceo">Deputy CEO</option>
                  <option value="hr.director">HR Director</option>
                  <option value="programs.head">Head of Programs</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appraisal Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appraisal Type
                  </label>
                  <select
                    value={formData.appraisalType}
                    onChange={(e) => handleInputChange("appraisalType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="annual">Annual Appraisal</option>
                    <option value="midyear">Mid-Year Review</option>
                    <option value="probation">Probation Review</option>
                    <option value="special">Special Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Performance Assessment</h3>
              <p className="text-blue-700">Rate each performance area on a scale of 1-5 and provide detailed comments with evidence.</p>
            </div>

            {formData.performanceAreas.map((area, index) => (
              <div key={index} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{area.area}</h4>
                    <p className="text-sm text-gray-600">Weight: {area.weight}%</p>
                  </div>
                  <div className="ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <select
                      value={area.rating}
                      onChange={(e) => handleArrayChange("performanceAreas", index, "rating", parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select Rating</option>
                      <option value={1}>1 - Needs Improvement</option>
                      <option value={2}>2 - Below Expectations</option>
                      <option value={3}>3 - Meets Expectations</option>
                      <option value={4}>4 - Exceeds Expectations</option>
                      <option value={5}>5 - Outstanding</option>
                    </select>
                  </div>
                </div>

                {area.rating > 0 && (
                  <div className="text-sm text-gray-600">
                    Current Rating: <span className="font-semibold text-blue-600">{getRatingLabel(area.rating)}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Performance Description
                  </label>
                  <textarea
                    value={area.description}
                    onChange={(e) => handleArrayChange("performanceAreas", index, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the performance expectations for this area..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments & Feedback
                  </label>
                  <textarea
                    value={area.comments}
                    onChange={(e) => handleArrayChange("performanceAreas", index, "comments", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide detailed feedback on the employee's performance in this area..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence & Examples
                  </label>
                  <textarea
                    value={area.evidence}
                    onChange={(e) => handleArrayChange("performanceAreas", index, "evidence", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide specific examples or evidence supporting this rating..."
                  />
                </div>
              </div>
            ))}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Calculated Overall Rating</h4>
              <div className="text-2xl font-bold text-blue-600">
                {calculateOverallRating()} / 5.00
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Based on weighted average of all performance areas
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            {/* Key Achievements Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Key Achievements</h3>
                <button
                  onClick={() => addArrayItem("achievements", { achievement: "", impact: "", evidence: "" })}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Achievement
                </button>
              </div>

              {formData.achievements.map((achievement, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-md font-medium text-gray-900">Achievement {index + 1}</h4>
                    {formData.achievements.length > 1 && (
                      <button
                        onClick={() => removeArrayItem("achievements", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Achievement Description
                    </label>
                    <textarea
                      value={achievement.achievement}
                      onChange={(e) => handleArrayChange("achievements", index, "achievement", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the key achievement..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Impact & Results
                    </label>
                    <textarea
                      value={achievement.impact}
                      onChange={(e) => handleArrayChange("achievements", index, "impact", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What was the impact or result of this achievement?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evidence/Metrics
                    </label>
                    <input
                      type="text"
                      value={achievement.evidence}
                      onChange={(e) => handleArrayChange("achievements", index, "evidence", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Quantifiable evidence or metrics..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Goals Assessment Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Goals Assessment</h3>
                <button
                  onClick={() => addArrayItem("goals", { goal: "", target: "", achieved: "", rating: 0, comments: "" })}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Goal
                </button>
              </div>

              {formData.goals.map((goal, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-md font-medium text-gray-900">Goal {index + 1}</h4>
                    {formData.goals.length > 1 && (
                      <button
                        onClick={() => removeArrayItem("goals", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Goal Description
                      </label>
                      <textarea
                        value={goal.goal}
                        onChange={(e) => handleArrayChange("goals", index, "goal", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the goal..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target/Expected Outcome
                      </label>
                      <textarea
                        value={goal.target}
                        onChange={(e) => handleArrayChange("goals", index, "target", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What was the target outcome?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What Was Achieved
                    </label>
                    <textarea
                      value={goal.achieved}
                      onChange={(e) => handleArrayChange("goals", index, "achieved", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what was actually achieved..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Goal Achievement Rating
                      </label>
                      <select
                        value={goal.rating}
                        onChange={(e) => handleArrayChange("goals", index, "rating", parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Select Rating</option>
                        <option value={1}>1 - Not Achieved</option>
                        <option value={2}>2 - Partially Achieved</option>
                        <option value={3}>3 - Achieved</option>
                        <option value={4}>4 - Exceeded</option>
                        <option value={5}>5 - Outstanding Achievement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments
                      </label>
                      <textarea
                        value={goal.comments}
                        onChange={(e) => handleArrayChange("goals", index, "comments", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional comments on goal achievement..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            {/* Development Areas Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Development Areas</h3>
                <button
                  onClick={() => addArrayItem("developmentAreas", { area: "", currentLevel: "", targetLevel: "", developmentPlan: "", timeline: "" })}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Development Area
                </button>
              </div>

              {formData.developmentAreas.map((area, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-md font-medium text-gray-900">Development Area {index + 1}</h4>
                    {formData.developmentAreas.length > 1 && (
                      <button
                        onClick={() => removeArrayItem("developmentAreas", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Development Area
                    </label>
                    <input
                      type="text"
                      value={area.area}
                      onChange={(e) => handleArrayChange("developmentAreas", index, "area", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Leadership Skills, Technical Expertise, Communication..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Level
                      </label>
                      <textarea
                        value={area.currentLevel}
                        onChange={(e) => handleArrayChange("developmentAreas", index, "currentLevel", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe current skill/competency level..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Level
                      </label>
                      <textarea
                        value={area.targetLevel}
                        onChange={(e) => handleArrayChange("developmentAreas", index, "targetLevel", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe desired skill/competency level..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Development Plan
                    </label>
                    <textarea
                      value={area.developmentPlan}
                      onChange={(e) => handleArrayChange("developmentAreas", index, "developmentPlan", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Specific actions, training, mentoring, or experiences needed..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline
                    </label>
                    <input
                      type="text"
                      value={area.timeline}
                      onChange={(e) => handleArrayChange("developmentAreas", index, "timeline", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 6 months, 1 year, ongoing..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Career Development Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Development Planning</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee's Career Aspirations
                  </label>
                  <textarea
                    value={formData.careerAspirations}
                    onChange={(e) => handleInputChange("careerAspirations", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Discuss the employee's career goals and aspirations..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Needs Identified
                  </label>
                  <textarea
                    value={formData.trainingNeeds}
                    onChange={(e) => handleInputChange("trainingNeeds", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List specific training programs, courses, or skills development needed..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommended Actions for Development
                  </label>
                  <textarea
                    value={formData.recommendedActions}
                    onChange={(e) => handleInputChange("recommendedActions", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specific actions recommended for employee development..."
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            {/* Overall Assessment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Assessment</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Performance Rating
                    </label>
                    <select
                      value={formData.overallRating}
                      onChange={(e) => handleInputChange("overallRating", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select Overall Rating</option>
                      <option value={1}>1 - Needs Improvement</option>
                      <option value={2}>2 - Below Expectations</option>
                      <option value={3}>3 - Meets Expectations</option>
                      <option value={4}>4 - Exceeds Expectations</option>
                      <option value={5}>5 - Outstanding</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Calculated Rating:</div>
                      <div className="text-xl font-bold text-blue-600">{calculateOverallRating()}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Comments
                  </label>
                  <textarea
                    value={formData.overallComments}
                    onChange={(e) => handleInputChange("overallComments", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide an overall summary of performance..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Strengths
                    </label>
                    <textarea
                      value={formData.strengths}
                      onChange={(e) => handleInputChange("strengths", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Highlight the employee's main strengths..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Areas for Improvement
                    </label>
                    <textarea
                      value={formData.areasForImprovement}
                      onChange={(e) => handleInputChange("areasForImprovement", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Areas where improvement is needed..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Supervisor Comments */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supervisor's Assessment</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor's Comments
                  </label>
                  <textarea
                    value={formData.supervisorComments}
                    onChange={(e) => handleInputChange("supervisorComments", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Supervisor's detailed assessment and feedback..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor's Recommendations
                  </label>
                  <textarea
                    value={formData.supervisorRecommendations}
                    onChange={(e) => handleInputChange("supervisorRecommendations", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Recommendations for next review period..."
                  />
                </div>
              </div>
            </div>

            {/* Employee Self-Assessment */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Self-Assessment</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee's Self-Assessment Comments
                  </label>
                  <textarea
                    value={formData.selfAssessmentComments}
                    onChange={(e) => handleInputChange("selfAssessmentComments", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Employee's reflection on their performance..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee's Additional Comments
                  </label>
                  <textarea
                    value={formData.employeeComments}
                    onChange={(e) => handleInputChange("employeeComments", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional comments from the employee..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="employeeAgreement"
                    checked={formData.employeeAgreement}
                    onChange={(e) => handleInputChange("employeeAgreement", e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="employeeAgreement" className="ml-2 block text-sm text-gray-700">
                    Employee agrees with the assessment and development plan
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Final Review</h3>
              <p className="text-yellow-700">Please review all information before submitting the appraisal.</p>
            </div>

            {/* Summary Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Employee Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {formData.employeeName}</div>
                  <div><span className="font-medium">Position:</span> {formData.position}</div>
                  <div><span className="font-medium">Department:</span> {formData.department}</div>
                  <div><span className="font-medium">Supervisor:</span> {formData.supervisor}</div>
                  <div><span className="font-medium">Reviewer:</span> {formData.reviewer}</div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Appraisal Summary</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Type:</span> {formData.appraisalType}</div>
                  <div><span className="font-medium">Period:</span> {formData.startDate} to {formData.endDate}</div>
                  <div><span className="font-medium">Calculated Rating:</span> {calculateOverallRating()}</div>
                  <div><span className="font-medium">Overall Rating:</span> {formData.overallRating > 0 ? getRatingLabel(formData.overallRating) : "Not set"}</div>
                  <div><span className="font-medium">Status:</span> {formData.status}</div>
                </div>
              </div>
            </div>

            {/* Performance Areas Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Performance Areas Summary</h4>
              <div className="space-y-2">
                {formData.performanceAreas.map((area, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{area.area}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      area.rating >= 4 ? 'bg-green-100 text-green-800' :
                      area.rating >= 3 ? 'bg-blue-100 text-blue-800' :
                      area.rating >= 2 ? 'bg-yellow-100 text-yellow-800' :
                      area.rating >= 1 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {area.rating > 0 ? `${area.rating} - ${getRatingLabel(area.rating)}` : 'Not Rated'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Development Areas ({formData.developmentAreas.length})</h4>
                <div className="space-y-1 text-sm">
                  {formData.developmentAreas.map((area, index) => (
                    <div key={index}>• {area.area}</div>
                  ))}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Key Achievements ({formData.achievements.length})</h4>
                <div className="space-y-1 text-sm">
                  {formData.achievements.map((achievement, index) => (
                    <div key={index}>• {achievement.achievement.substring(0, 60)}...</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Ready to submit appraisal</span>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.id <= currentStep 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 min-w-0">
                  <p className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep - 1].title}</h2>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-4 py-2 border rounded-md ${
                currentStep === 1 
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingDraft ? 'Saving...' : 'Save as Draft'}
              </button>

              {currentStep === steps.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Appraisal'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
    </ModulePage>
  )
}
