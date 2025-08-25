"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EnhancedLayout } from "@/components/layout/enhanced-layout"
import { 
  CalendarIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  BellIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

interface Employee {
  id: string
  name: string
  department: string
  position: string
}

interface Reviewer {
  id: string
  name: string
  title: string
}

export default function ScheduleReviewPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    employeeId: "",
    reviewType: "",
    reviewDate: "",
    reviewTime: "",
    reviewPeriod: "",
    reviewer: "",
    location: "",
    description: "",
    sendNotification: true,
    includeGoals: true,
    selfAssessment: true
  })

  const reviewTypes = [
    { value: "annual", label: "Annual Performance Review" },
    { value: "quarterly", label: "Quarterly Check-in" },
    { value: "probationary", label: "Probationary Review" },
    { value: "project", label: "Project-based Review" },
    { value: "improvement", label: "Performance Improvement Review" },
    { value: "exit", label: "Exit Interview" }
  ]

  // Simulate data loading - replace with real API calls
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API calls
        // const employeesData = await fetchEmployees()
        // const reviewersData = await fetchReviewers()
        // setEmployees(employeesData)
        // setReviewers(reviewersData)
        
        // For now, set empty arrays
        setEmployees([])
        setReviewers([])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Here you would submit to your API
      console.log("Scheduling review:", formData)
      // await schedulePerformanceReview(formData)
      router.push("/hr/performance")
    } catch (error) {
      console.error("Error scheduling review:", error)
    }
  }

  const selectedEmployee = employees.find(emp => emp.id === formData.employeeId)
  const selectedReviewer = reviewers.find(rev => rev.id === formData.reviewer)

  if (isLoading) {
    return (
      <EnhancedLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </EnhancedLayout>
    )
  }

  return (
    <EnhancedLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Performance Review</h1>
          <p className="text-gray-600">Set up a performance review session with an employee</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Employee Selection */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Employee Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Employee *
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange("employeeId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Choose an employee</option>
                    {employees.length === 0 ? (
                      <option value="" disabled>No employees available</option>
                    ) : (
                      employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position} ({employee.department})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Type *
                  </label>
                  <select
                    value={formData.reviewType}
                    onChange={(e) => handleInputChange("reviewType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select review type</option>
                    {reviewTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedEmployee && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Employee Details</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p><strong>Name:</strong> {selectedEmployee.name}</p>
                    <p><strong>Department:</strong> {selectedEmployee.department}</p>
                    <p><strong>Position:</strong> {selectedEmployee.position}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Schedule Details
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Date *
                  </label>
                  <input
                    type="date"
                    value={formData.reviewDate}
                    onChange={(e) => handleInputChange("reviewDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Time *
                  </label>
                  <input
                    type="time"
                    value={formData.reviewTime}
                    onChange={(e) => handleInputChange("reviewTime", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Period
                  </label>
                  <select
                    value={formData.reviewPeriod}
                    onChange={(e) => handleInputChange("reviewPeriod", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select period</option>
                    <option value="Q1-2025">Q1 2025</option>
                    <option value="Q2-2025">Q2 2025</option>
                    <option value="Q3-2025">Q3 2025</option>
                    <option value="Q4-2025">Q4 2025</option>
                    <option value="Annual-2025">Annual 2025</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reviewer *
                  </label>
                  <select
                    value={formData.reviewer}
                    onChange={(e) => handleInputChange("reviewer", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select reviewer</option>
                    {reviewers.length === 0 ? (
                      <option value="" disabled>No reviewers available</option>
                    ) : (
                      reviewers.map((reviewer) => (
                        <option key={reviewer.id} value={reviewer.id}>
                          {reviewer.name} - {reviewer.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Conference Room A, Virtual Meeting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  placeholder="Add any specific notes or objectives for this review..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Review Options */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Review Options
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendNotification"
                  checked={formData.sendNotification}
                  onChange={(e) => handleInputChange("sendNotification", e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="sendNotification" className="ml-3 text-sm text-gray-700">
                  Send email notification to employee and reviewer
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeGoals"
                  checked={formData.includeGoals}
                  onChange={(e) => handleInputChange("includeGoals", e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="includeGoals" className="ml-3 text-sm text-gray-700">
                  Include goal setting in this review
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="selfAssessment"
                  checked={formData.selfAssessment}
                  onChange={(e) => handleInputChange("selfAssessment", e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="selfAssessment" className="ml-3 text-sm text-gray-700">
                  Request self-assessment before review
                </label>
              </div>
            </div>
          </div>

          {/* Review Summary */}
          {formData.employeeId && formData.reviewDate && formData.reviewTime && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 flex items-center mb-4">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Review Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Employee:</strong> {selectedEmployee?.name}</p>
                  <p><strong>Review Type:</strong> {reviewTypes.find(t => t.value === formData.reviewType)?.label}</p>
                  <p><strong>Date & Time:</strong> {formData.reviewDate} at {formData.reviewTime}</p>
                </div>
                <div>
                  <p><strong>Reviewer:</strong> {selectedReviewer?.name}</p>
                  <p><strong>Location:</strong> {formData.location || "Not specified"}</p>
                  <p><strong>Period:</strong> {formData.reviewPeriod || "Not specified"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/hr/performance")}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Schedule Review
            </button>
          </div>
        </form>
      </div>
    </EnhancedLayout>
  )
}
