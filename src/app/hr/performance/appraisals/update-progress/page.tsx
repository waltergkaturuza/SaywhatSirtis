"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftEllipsisIcon
} from "@heroicons/react/24/outline"

interface ProgressUpdate {
  id: number
  employeeName: string
  employeeId: string
  department: string
  position: string
  period: string
  currentStatus: 'draft' | 'in-progress' | 'pending-review' | 'completed'
  completionPercentage: number
  lastUpdated: string
  dueDate: string
  supervisor: string
  nextSteps: string[]
  blockers: string[]
  comments: string
}

// Sample data
const progressUpdates: ProgressUpdate[] = [
  {
    id: 1,
    employeeName: "Michael Adebayo",
    employeeId: "EMP002",
    department: "Healthcare",
    position: "Healthcare Coordinator",
    period: "Q1 2024",
    currentStatus: "in-progress",
    completionPercentage: 65,
    lastUpdated: "2024-04-02",
    dueDate: "2024-04-15",
    supervisor: "Dr. Amina Hassan",
    nextSteps: [
      "Complete self-assessment section",
      "Gather evidence for achievements",
      "Schedule supervisor meeting"
    ],
    blockers: [
      "Waiting for Q1 project reports",
      "Need access to training records"
    ],
    comments: "Making good progress. Need to focus on documentation for achievements section."
  },
  {
    id: 2,
    employeeName: "Sarah Johnson",
    employeeId: "EMP003",
    department: "Education",
    position: "Education Program Manager",
    period: "Q1 2024",
    currentStatus: "pending-review",
    completionPercentage: 90,
    lastUpdated: "2024-04-01",
    dueDate: "2024-04-10",
    supervisor: "Prof. Ibrahim Musa",
    nextSteps: [
      "Supervisor review and feedback",
      "Address any comments",
      "Final submission"
    ],
    blockers: [],
    comments: "Appraisal is ready for supervisor review. All sections completed."
  },
  {
    id: 3,
    employeeName: "Ahmed Hassan",
    employeeId: "EMP005",
    department: "Nutrition",
    position: "Nutrition Coordinator",
    period: "Q1 2024",
    currentStatus: "draft",
    completionPercentage: 15,
    lastUpdated: "2024-03-15",
    dueDate: "2024-04-20",
    supervisor: "Dr. Khadija Omar",
    nextSteps: [
      "Start performance area assessments",
      "Document key achievements",
      "Set development goals"
    ],
    blockers: [
      "Unclear about rating criteria",
      "Need examples of evidence required"
    ],
    comments: "Just started the process. Need guidance on how to complete effectively."
  }
]

export default function UpdateProgressPage() {
  const [selectedUpdate, setSelectedUpdate] = useState<ProgressUpdate | null>(null)
  const [newComment, setNewComment] = useState("")
  const [newNextStep, setNewNextStep] = useState("")
  const [newBlocker, setNewBlocker] = useState("")

  const metadata = {
    title: "Update Progress - Performance Appraisals",
    description: "Track and update appraisal progress",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Appraisals", href: "/hr/performance/appraisals" },
      { name: "Update Progress" }
    ]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-blue-600" />
      case 'pending-review':
        return <DocumentCheckIcon className="h-5 w-5 text-yellow-600" />
      case 'draft':
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending-review':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleAddNextStep = (updateId: number) => {
    if (!newNextStep.trim()) return
    
    // In real app, this would update the backend
    console.log(`Adding next step to update ${updateId}:`, newNextStep)
    setNewNextStep("")
  }

  const handleAddBlocker = (updateId: number) => {
    if (!newBlocker.trim()) return
    
    // In real app, this would update the backend
    console.log(`Adding blocker to update ${updateId}:`, newBlocker)
    setNewBlocker("")
  }

  const handleAddComment = (updateId: number) => {
    if (!newComment.trim()) return
    
    // In real app, this would update the backend
    console.log(`Adding comment to update ${updateId}:`, newComment)
    setNewComment("")
  }

  const handleSendReminder = (updateId: number) => {
    console.log(`Sending reminder for update ${updateId}`)
    // In real app, this would send an email/notification
  }

  const handleRequestExtension = (updateId: number) => {
    console.log(`Requesting extension for update ${updateId}`)
    // In real app, this would create an extension request
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ArrowPathIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Update Progress</h1>
              <p className="text-gray-600">Track and manage appraisal progress</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {progressUpdates.filter(u => u.currentStatus === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DocumentCheckIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {progressUpdates.filter(u => u.currentStatus === 'pending-review').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Not Started</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {progressUpdates.filter(u => u.currentStatus === 'draft').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {progressUpdates.filter(u => getDaysRemaining(u.dueDate) < 7 && u.currentStatus !== 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Updates List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Progress Updates</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {progressUpdates.map((update) => {
              const daysRemaining = getDaysRemaining(update.dueDate)
              const isOverdue = daysRemaining < 0
              const isAtRisk = daysRemaining < 7 && daysRemaining >= 0

              return (
                <div key={update.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(update.currentStatus)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {update.employeeName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {update.position} • {update.department} • {update.period}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(update.currentStatus)}`}>
                          {update.currentStatus.replace('-', ' ')}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{update.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(update.completionPercentage)}`}
                            style={{ width: `${update.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Due Date Info */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Due: {new Date(update.dueDate).toLocaleDateString()}
                        </div>
                        {isOverdue && (
                          <span className="text-red-600 text-sm font-medium">
                            Overdue by {Math.abs(daysRemaining)} days
                          </span>
                        )}
                        {isAtRisk && (
                          <span className="text-yellow-600 text-sm font-medium">
                            Due in {daysRemaining} days
                          </span>
                        )}
                      </div>

                      {/* Current Comments */}
                      {update.comments && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">{update.comments}</p>
                        </div>
                      )}

                      {/* Next Steps */}
                      {update.nextSteps.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Next Steps:</h4>
                          <ul className="space-y-1">
                            {update.nextSteps.map((step, index) => (
                              <li key={index} className="flex items-center text-sm text-gray-600">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Blockers */}
                      {update.blockers.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-red-700 mb-2">Blockers:</h4>
                          <ul className="space-y-1">
                            {update.blockers.map((blocker, index) => (
                              <li key={index} className="flex items-center text-sm text-red-600">
                                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                                {blocker}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedUpdate(selectedUpdate?.id === update.id ? null : update)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                        >
                          {selectedUpdate?.id === update.id ? 'Hide Details' : 'Update Progress'}
                        </button>
                        <button
                          onClick={() => handleSendReminder(update.id)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200"
                        >
                          Send Reminder
                        </button>
                        {(isOverdue || isAtRisk) && (
                          <button
                            onClick={() => handleRequestExtension(update.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                          >
                            Request Extension
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Update Form */}
                  {selectedUpdate?.id === update.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Add Next Step */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Next Step</h4>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newNextStep}
                              onChange={(e) => setNewNextStep(e.target.value)}
                              placeholder="Enter next step..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                              onClick={() => handleAddNextStep(update.id)}
                              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Add Blocker */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Blocker</h4>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newBlocker}
                              onChange={(e) => setNewBlocker(e.target.value)}
                              placeholder="Enter blocker..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                              onClick={() => handleAddBlocker(update.id)}
                              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                              <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Add Comment */}
                        <div className="lg:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Progress Comment</h4>
                          <div className="flex space-x-2">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add progress comment..."
                              rows={3}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                              onClick={() => handleAddComment(update.id)}
                              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Progress Update Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">For Employees:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Update progress regularly (at least weekly)</li>
                <li>• Document specific achievements and evidence</li>
                <li>• Communicate blockers early</li>
                <li>• Request help when needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">For Supervisors:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Review progress updates promptly</li>
                <li>• Provide constructive feedback</li>
                <li>• Help resolve blockers</li>
                <li>• Set clear expectations and deadlines</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
