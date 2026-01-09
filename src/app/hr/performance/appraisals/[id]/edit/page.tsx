"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  DocumentCheckIcon,
  StarIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"

interface AppraisalFormData {
  id?: string | number
  employeeName: string
  employeeId: string
  department: string
  position: string
  period?: string
  reviewPeriod?: {
    startDate: string
    endDate: string
  }
  overallRating?: number | null
  status: string
  supervisor?: string
  reviewer?: string
  strengths?: string
  areasImprovement?: string
  goals?: string
  performanceAreas?: Array<{
    area: string
    rating: number
    weight: number
    comments: string
    evidence: string
  }>
  achievements?: Array<{
    achievement: string
    impact: string
    evidence: string
  }> | {
    keyResponsibilities: any[]
  }
  development?: {
    trainingNeeds: string[]
    careerAspirations: string
    skillsToImprove: string[]
    developmentPlan: any[]
  }
  developmentPlans?: Array<{
    area: string
    currentLevel: string
    targetLevel: string
    timeline: string
    resources: string
  }>
  comments?: {
    employeeComments: string
    managerComments: string
    hrComments: string
  }
  ratings?: {
    finalRating: number
    actualPoints: number
    maxPoints: number
    percentage: number
    ratingCode: string
    recommendation: string
    salaryRecommendation: string
  }
  supervisorComments?: string
  employeeComments?: string
  nextSteps?: string
  improvementPlan?: string
}

// Sample data - in real app this would come from API
const getSampleAppraisal = (id: string): AppraisalFormData => {
  const sampleData: Record<string, AppraisalFormData> = {
    "1": {
      id: 1,
      employeeName: "John Doe",
      employeeId: "EMP001",
      department: "Operations",
      position: "Operations Manager",
      period: "Q1 2024",
      overallRating: 4.5,
      status: "completed",
      supervisor: "Mark Wilson",
      reviewer: "Sarah Johnson",
      strengths: "Excellent leadership skills, proactive problem-solving, strong team management",
      areasImprovement: "Time management, delegation, strategic planning documentation",
      goals: "Focus on strategic planning and team development for next quarter",
      performanceAreas: [
        {
          area: "Job Knowledge & Technical Skills",
          rating: 4,
          weight: 20,
          comments: "Demonstrates strong technical competency and stays updated with industry trends",
          evidence: "Successfully implemented new workflow system, completed advanced training"
        },
        {
          area: "Quality of Work",
          rating: 5,
          weight: 20,
          comments: "Consistently delivers high-quality results with attention to detail",
          evidence: "Zero defects in quarterly deliverables, positive client feedback"
        },
        {
          area: "Communication Skills",
          rating: 4,
          weight: 15,
          comments: "Clear and effective communication with team and stakeholders",
          evidence: "Led successful stakeholder presentations, improved team communication protocols"
        },
        {
          area: "Team Collaboration",
          rating: 5,
          weight: 15,
          comments: "Excellent team player, promotes collaborative environment",
          evidence: "Facilitated cross-departmental projects, mentored junior staff"
        },
        {
          area: "Initiative & Innovation",
          rating: 4,
          weight: 15,
          comments: "Proactive in identifying improvements and implementing solutions",
          evidence: "Proposed and implemented cost-saving automation, led innovation workshop"
        },
        {
          area: "Leadership & Management",
          rating: 5,
          weight: 15,
          comments: "Outstanding leadership qualities, effective team management",
          evidence: "Improved team productivity by 22%, successful team expansion"
        }
      ],
      achievements: [
        {
          achievement: "Implemented Workflow Automation System",
          impact: "Increased team productivity by 22% and reduced processing time by 35%",
          evidence: "System metrics, team feedback surveys, time tracking data"
        },
        {
          achievement: "Led Cross-Departmental Cost Reduction Initiative",
          impact: "Identified and implemented cost savings of $50,000 annually",
          evidence: "Financial reports, process documentation, stakeholder approval"
        }
      ],
      developmentPlans: [
        {
          area: "Strategic Planning",
          currentLevel: "Intermediate",
          targetLevel: "Advanced",
          timeline: "6 months",
          resources: "Strategic planning course, mentorship with senior leadership"
        }
      ],
      supervisorComments: "John has consistently exceeded expectations and demonstrated exceptional leadership.",
      employeeComments: "I appreciate the feedback and am committed to the development areas identified.",
      nextSteps: "1. Enroll in strategic planning certification program by March 2024\\n2. Begin weekly mentorship sessions",
      improvementPlan: "Focus on developing strategic thinking skills through formal training and mentorship."
    },
    "2": {
      id: 2,
      employeeName: "Michael Adebayo",
      employeeId: "EMP002",
      department: "Healthcare",
      position: "Healthcare Coordinator",
      period: "Q1 2024",
      overallRating: null,
      status: "in-progress",
      supervisor: "Dr. Amina Hassan",
      reviewer: "Sarah Johnson",
      strengths: "",
      areasImprovement: "",
      goals: "",
      performanceAreas: [
        {
          area: "Healthcare Program Management",
          rating: 0,
          weight: 25,
          comments: "",
          evidence: ""
        },
        {
          area: "Community Engagement",
          rating: 0,
          weight: 20,
          comments: "",
          evidence: ""
        },
        {
          area: "Data Management & Reporting",
          rating: 0,
          weight: 20,
          comments: "",
          evidence: ""
        },
        {
          area: "Quality Assurance",
          rating: 0,
          weight: 15,
          comments: "",
          evidence: ""
        },
        {
          area: "Professional Development",
          rating: 0,
          weight: 20,
          comments: "",
          evidence: ""
        }
      ],
      achievements: [],
      developmentPlans: [],
      supervisorComments: "",
      employeeComments: "",
      nextSteps: "",
      improvementPlan: ""
    }
  }
  
  return sampleData[id] || sampleData["1"]
}

export default function EditAppraisalPage() {
  const params = useParams()
  const router = useRouter()
  const appraisalId = params.id as string
  
  const [formData, setFormData] = useState<AppraisalFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    // Load appraisal data from API
    const loadAppraisalData = async () => {
      try {
        const response = await fetch(`/api/hr/performance/appraisals/${appraisalId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch appraisal: ${response.status}`);
        }
        const result = await response.json();
        const appraisalData = result.success ? (result.data || result.appraisal) : null;
        
        if (appraisalData) {
          // Transform API data to form data format
          const reviewPeriod = appraisalData.employee?.reviewPeriod || { startDate: '', endDate: '' };
          const formData: AppraisalFormData = {
            id: appraisalData.id,
            employeeName: appraisalData.employee?.name || '',
            employeeId: appraisalData.employee?.id || '',
            department: appraisalData.employee?.department || '',
            position: appraisalData.employee?.position || '',
            period: reviewPeriod.startDate && reviewPeriod.endDate ? 
              `${reviewPeriod.startDate} - ${reviewPeriod.endDate}` : 
              '',
            reviewPeriod: reviewPeriod,
            overallRating: appraisalData.ratings?.finalRating || appraisalData.performance?.overallRating || null,
            status: appraisalData.status || 'draft',
            supervisor: appraisalData.employee?.manager || '',
            reviewer: appraisalData.employee?.reviewer || '',
            performanceAreas: appraisalData.performance?.categories || [],
            achievements: appraisalData.achievements || { keyResponsibilities: [] },
            development: appraisalData.development || { trainingNeeds: [''], careerAspirations: '', skillsToImprove: [''], developmentPlan: [] },
            comments: appraisalData.comments || { employeeComments: '', managerComments: '', hrComments: '' },
            ratings: appraisalData.ratings || { finalRating: 0, actualPoints: 0, maxPoints: 0, percentage: 0, ratingCode: '', recommendation: 'maintain-current', salaryRecommendation: '' }
          };
          setFormData(formData);
        } else {
          // Fallback to sample data if API fails
          const sampleData = getSampleAppraisal(appraisalId);
          setFormData(sampleData);
        }
      } catch (error) {
        console.error('Error loading appraisal data:', error);
        // Fallback to sample data on error
        const sampleData = getSampleAppraisal(appraisalId);
        setFormData(sampleData);
      }
    };

    if (appraisalId) {
      loadAppraisalData();
    }
  }, [appraisalId])

  const metadata = {
    title: `Edit Appraisal - ${formData?.employeeName || 'Loading...'}`,
    description: "Edit performance appraisal details",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Appraisals", href: "/hr/performance/appraisals" },
      { name: formData?.employeeName || "Edit Appraisal" }
    ]
  }

  const handleInputChange = (field: keyof AppraisalFormData, value: any) => {
    if (!formData) return
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null)
  }

  const handlePerformanceAreaChange = (index: number, field: string, value: any) => {
    if (!formData) return
    setFormData(prev => prev ? ({
      ...prev,
      performanceAreas: (prev.performanceAreas || []).map((area, i) => 
        i === index ? { ...area, [field]: value } : area
      )
    }) : null)
  }

  const handleAchievementChange = (index: number, field: string, value: string) => {
    if (!formData) return
    setFormData(prev => {
      if (!prev) return null
      // Handle both array and object formats
      if (Array.isArray(prev.achievements)) {
        return {
          ...prev,
          achievements: prev.achievements.map((achievement, i) => 
            i === index ? { ...achievement, [field]: value } : achievement
          )
        }
      }
      return prev
    })
  }

  const addAchievement = () => {
    if (!formData) return
    setFormData(prev => {
      if (!prev) return null
      // Handle both array and object formats
      if (Array.isArray(prev.achievements)) {
        return {
          ...prev,
          achievements: [...prev.achievements, { achievement: "", impact: "", evidence: "" }]
        }
      }
      return prev
    })
  }

  const removeAchievement = (index: number) => {
    if (!formData) return
    setFormData(prev => {
      if (!prev) return null
      // Handle both array and object formats
      if (Array.isArray(prev.achievements)) {
        return {
          ...prev,
          achievements: prev.achievements.filter((_, i) => i !== index)
        }
      }
      return prev
    })
  }

  const handleDevelopmentPlanChange = (index: number, field: string, value: string) => {
    if (!formData) return
    setFormData(prev => prev ? ({
      ...prev,
      developmentPlans: (prev.developmentPlans || []).map((plan, i) => 
        i === index ? { ...plan, [field]: value } : plan
      )
    }) : null)
  }

  const addDevelopmentPlan = () => {
    if (!formData) return
    setFormData(prev => prev ? ({
      ...prev,
      developmentPlans: [...(prev.developmentPlans || []), {
        area: "",
        currentLevel: "",
        targetLevel: "",
        timeline: "",
        resources: ""
      }]
    }) : null)
  }

  const removeDevelopmentPlan = (index: number) => {
    if (!formData) return
    setFormData(prev => prev ? ({
      ...prev,
      developmentPlans: (prev.developmentPlans || []).filter((_, i) => i !== index)
    }) : null)
  }

  const calculateOverallRating = () => {
    if (!formData?.performanceAreas || formData.performanceAreas.length === 0) return 0
    const totalWeight = formData.performanceAreas.reduce((sum, area) => sum + area.weight, 0)
    const weightedScore = formData.performanceAreas.reduce((sum, area) => sum + (area.rating * area.weight), 0)
    return totalWeight > 0 ? parseFloat((weightedScore / totalWeight).toFixed(1)) : 0
  }

  const handleSubmit = async () => {
    if (!formData) return
    
    setIsSubmitting(true)
    try {
      // Calculate overall rating
      const overallRating = calculateOverallRating()
      
      // Here you would normally save to database
      console.log("Updating appraisal:", { ...formData, overallRating })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect back to appraisal view
      router.push(`/hr/performance/appraisals/${formData.id}`)
    } catch (error) {
      console.error("Error updating appraisal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const renderStars = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <StarIcon
              className={`h-6 w-6 ${
                star <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    )
  }

  if (!formData) {
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

  const steps = [
    { id: 1, title: "Performance Areas", description: "Rate performance in key areas" },
    { id: 2, title: "Achievements", description: "Document key achievements" },
    { id: 3, title: "Development", description: "Plan development areas" },
    { id: 4, title: "Summary", description: "Overall assessment and feedback" }
  ]

  return (
    <ModulePage metadata={metadata}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DocumentCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Appraisal</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>{formData.employeeName}</span>
                <span>•</span>
                <span>{formData.position}</span>
                <span>•</span>
                <span>{formData.period}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.id <= activeStep 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step.id < activeStep ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className={`text-sm font-medium ${
                      step.id <= activeStep ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step.id < activeStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          {activeStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Performance Areas Assessment</h2>
              
              {(formData.performanceAreas || []).map((area, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{area.area}</h3>
                      <p className="text-sm text-gray-600">Weight: {area.weight}%</p>
                    </div>
                    <div>
                      {renderStars(area.rating, (rating) => handlePerformanceAreaChange(index, 'rating', rating))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments
                      </label>
                      <textarea
                        value={area.comments}
                        onChange={(e) => handlePerformanceAreaChange(index, 'comments', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Provide specific comments about performance in this area..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evidence
                      </label>
                      <textarea
                        value={area.evidence}
                        onChange={(e) => handlePerformanceAreaChange(index, 'evidence', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Provide evidence or examples supporting this rating..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Calculated Overall Rating</h4>
                <div className="text-2xl font-bold text-blue-600">{calculateOverallRating()}/5</div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Key Achievements</h2>
                <button
                  onClick={addAchievement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Achievement
                </button>
              </div>

              {(Array.isArray(formData.achievements) ? formData.achievements : []).map((achievement, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900">Achievement {index + 1}</h3>
                    <button
                      onClick={() => removeAchievement(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Achievement
                      </label>
                      <input
                        type="text"
                        value={achievement.achievement}
                        onChange={(e) => handleAchievementChange(index, 'achievement', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the achievement..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Impact
                      </label>
                      <textarea
                        value={achievement.impact}
                        onChange={(e) => handleAchievementChange(index, 'impact', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the impact or results..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evidence
                      </label>
                      <textarea
                        value={achievement.evidence}
                        onChange={(e) => handleAchievementChange(index, 'evidence', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Provide supporting evidence..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {(!Array.isArray(formData.achievements) || formData.achievements.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No achievements added yet. Click "Add Achievement" to get started.</p>
                </div>
              )}
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Development Plans</h2>
                <button
                  onClick={addDevelopmentPlan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Development Plan
                </button>
              </div>

              {(formData.developmentPlans || []).map((plan, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900">Development Plan {index + 1}</h3>
                    <button
                      onClick={() => removeDevelopmentPlan(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Development Area
                      </label>
                      <input
                        type="text"
                        value={plan.area}
                        onChange={(e) => handleDevelopmentPlanChange(index, 'area', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Strategic Planning"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeline
                      </label>
                      <input
                        type="text"
                        value={plan.timeline}
                        onChange={(e) => handleDevelopmentPlanChange(index, 'timeline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 6 months"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Level
                      </label>
                      <select
                        value={plan.currentLevel}
                        onChange={(e) => handleDevelopmentPlanChange(index, 'currentLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Level
                      </label>
                      <select
                        value={plan.targetLevel}
                        onChange={(e) => handleDevelopmentPlanChange(index, 'targetLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resources Required
                      </label>
                      <textarea
                        value={plan.resources}
                        onChange={(e) => handleDevelopmentPlanChange(index, 'resources', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Training, mentorship, courses, etc..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Summary & Feedback</h2>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Strengths
                  </label>
                  <textarea
                    value={formData.strengths}
                    onChange={(e) => handleInputChange('strengths', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Highlight key strengths and positive aspects..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Areas for Improvement
                  </label>
                  <textarea
                    value={formData.areasImprovement}
                    onChange={(e) => handleInputChange('areasImprovement', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Identify areas that need improvement..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goals for Next Period
                  </label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Set goals and objectives for the next period..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor Comments
                  </label>
                  <textarea
                    value={formData.supervisorComments}
                    onChange={(e) => handleInputChange('supervisorComments', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed supervisor feedback and recommendations..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Comments
                  </label>
                  <textarea
                    value={formData.employeeComments}
                    onChange={(e) => handleInputChange('employeeComments', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Employee's response and self-reflection..."
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Final Overall Rating</h4>
                  <div className="text-3xl font-bold text-blue-600">{calculateOverallRating()}/5</div>
                  <p className="text-sm text-blue-700 mt-1">Based on weighted performance areas</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div>
              {activeStep > 1 && (
                <button
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              {activeStep < steps.length ? (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Appraisal"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
