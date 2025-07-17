"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
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
  ShareIcon
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

// Sample data - in real app this would come from API
const getSampleAppraisal = (id: string): AppraisalData => {
  const sampleData: Record<string, AppraisalData> = {
    "1": {
      id: 1,
      employeeName: "John Doe",
      employeeId: "EMP001",
      department: "Operations",
      position: "Operations Manager",
      period: "Q1 2024",
      overallRating: 4.5,
      status: "completed",
      submittedAt: "2024-01-28T14:30:00Z",
      reviewedAt: "2024-01-30T16:45:00Z",
      supervisor: "Mark Wilson",
      reviewer: "Sarah Johnson",
      planProgress: 85,
      strengths: "Excellent leadership skills, proactive problem-solving, strong team management",
      areasImprovement: "Time management, delegation, strategic planning documentation",
      goals: "Focus on strategic planning and team development for next quarter",
      lastUpdated: "2024-01-30T16:45:00Z",
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
        },
        {
          achievement: "Developed Team Training Program",
          impact: "Improved team skills and reduced onboarding time by 40%",
          evidence: "Training materials, skill assessments, onboarding metrics"
        }
      ],
      developmentPlans: [
        {
          area: "Strategic Planning",
          currentLevel: "Intermediate",
          targetLevel: "Advanced",
          timeline: "6 months",
          resources: "Strategic planning course, mentorship with senior leadership"
        },
        {
          area: "Time Management",
          currentLevel: "Good",
          targetLevel: "Excellent",
          timeline: "3 months",
          resources: "Time management training, productivity tools, coaching sessions"
        }
      ],
      supervisorComments: "John has consistently exceeded expectations and demonstrated exceptional leadership. His initiative in implementing the workflow automation system resulted in significant productivity gains. Areas for development include enhancing strategic planning skills and improving delegation to better leverage team capabilities.",
      employeeComments: "I appreciate the feedback and am committed to the development areas identified. The workflow automation project was very rewarding, and I look forward to taking on more strategic initiatives. I would benefit from additional mentorship in strategic planning.",
      nextSteps: "1. Enroll in strategic planning certification program by March 2024\\n2. Begin weekly mentorship sessions with senior leadership\\n3. Implement time management system and tools\\n4. Lead next quarter's strategic planning session",
      improvementPlan: "Focus on developing strategic thinking skills through formal training and mentorship. Implement structured time management system to improve efficiency and create more time for strategic activities."
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
      submittedAt: null,
      reviewedAt: null,
      supervisor: "Dr. Amina Hassan",
      reviewer: "Sarah Johnson",
      planProgress: 65,
      strengths: "",
      areasImprovement: "",
      goals: "",
      lastUpdated: "2024-01-25T10:15:00Z",
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

export default function ViewAppraisalPage() {
  const params = useParams()
  const router = useRouter()
  const appraisalId = params.id as string
  
  const [appraisal, setAppraisal] = useState<AppraisalData | null>(null)
  const [activeSection, setActiveSection] = useState("overview")

  useEffect(() => {
    // Load appraisal data
    const appraisalData = getSampleAppraisal(appraisalId)
    setAppraisal(appraisalData)
  }, [appraisalId])

  const metadata = {
    title: `Performance Appraisal - ${appraisal?.employeeName || 'Loading...'}`,
    description: "View detailed performance appraisal information",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Appraisals", href: "/hr/performance/appraisals" },
      { name: appraisal?.employeeName || "View Appraisal" }
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
    if (!appraisal?.performanceAreas.length) return 0
    const totalWeight = appraisal.performanceAreas.reduce((sum, area) => sum + area.weight, 0)
    const weightedScore = appraisal.performanceAreas.reduce((sum, area) => sum + (area.rating * area.weight), 0)
    return totalWeight > 0 ? (weightedScore / totalWeight).toFixed(1) : "0.0"
  }

  if (!appraisal) {
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

  const actions = (
    <div className="flex space-x-3">
      <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
        <PrinterIcon className="h-4 w-4 mr-2" />
        Print
      </button>
      <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
        <ShareIcon className="h-4 w-4 mr-2" />
        Share
      </button>
      {appraisal.status !== "completed" && (
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
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DocumentCheckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{appraisal.employeeName}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{appraisal.position}</span>
                  <span>•</span>
                  <span>{appraisal.department}</span>
                  <span>•</span>
                  <span>ID: {appraisal.employeeId}</span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-600">Period: {appraisal.period}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appraisal.status)}`}>
                    {appraisal.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
            </div>
            
            {appraisal.overallRating && (
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{appraisal.overallRating}</div>
                <div className="text-sm text-gray-600">Overall Rating</div>
                {renderStars(appraisal.overallRating)}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
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
                
                {appraisal.performanceAreas.map((area, index) => (
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
                ))}

                {appraisal.performanceAreas.some(area => area.rating > 0) && (
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
                          {appraisal.performanceAreas.reduce((sum, area) => sum + area.weight, 0)}%
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
                
                {appraisal.achievements.length > 0 ? (
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
                
                {appraisal.developmentPlans.length > 0 ? (
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
                  {appraisal.supervisorComments && (
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

                  {!appraisal.supervisorComments && !appraisal.employeeComments && (
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
      </div>
    </ModulePage>
  )
}
