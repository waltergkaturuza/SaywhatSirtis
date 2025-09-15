"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  CalendarIcon, 
  BuildingOfficeIcon, 
  FlagIcon,
  ChartBarIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline"

interface DeliverableFormData {
  keyDeliverable: string
  description: string
  activity: string
  timeline: string
  startDate: string
  endDate: string
  supportDepartment: string
  responsiblePerson: string
  successIndicator: string
  priority: string
  status: string
  estimatedEffort: string
  resources: string
  risks: string
  dependencies: string
}

const defaultFormData: DeliverableFormData = {
  keyDeliverable: "",
  description: "",
  activity: "",
  timeline: "",
  startDate: "",
  endDate: "",
  supportDepartment: "",
  responsiblePerson: "",
  successIndicator: "",
  priority: "medium",
  status: "not-started",
  estimatedEffort: "",
  resources: "",
  risks: "",
  dependencies: ""
}

export default function AddDeliverablePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<DeliverableFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const metadata = {
    title: "Add New Deliverable",
    description: "Create a new key deliverable for performance plan",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Plans", href: "/hr/performance/plans" },
      { name: "Key Deliverables", href: "/hr/performance/plans#deliverables" },
      { name: "Add Deliverable" }
    ]
  }

  const handleInputChange = (field: keyof DeliverableFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would normally save to database
      console.log("Saving deliverable:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect back to plans page with deliverables tab active
      router.push("/hr/performance/plans?tab=deliverables")
    } catch (error) {
      console.error("Error saving deliverable:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FlagIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Deliverable</h1>
                <p className="text-gray-600">Create a new key deliverable for the performance plan</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Deliverable Title *
                </label>
                <input
                  type="text"
                  value={formData.keyDeliverable}
                  onChange={(e) => handleInputChange("keyDeliverable", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Improve Team Productivity"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide a detailed description of this deliverable..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Implementation Activity *
                </label>
                <textarea
                  value={formData.activity}
                  onChange={(e) => handleInputChange("activity", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the specific activities and actions required..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-track">On Track</option>
                    <option value="at-risk">At Risk</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Effort
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedEffort}
                    onChange={(e) => handleInputChange("estimatedEffort", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 40 hours, 2 weeks"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Responsibility */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Timeline & Responsibility
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline Description
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange("timeline", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q1 2024 - Q2 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsible Person
                </label>
                <select
                  value={formData.responsiblePerson}
                  onChange={(e) => handleInputChange("responsiblePerson", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Person</option>
                  <option value="john.doe">John Doe - Programs Manager</option>
                  <option value="jane.smith">Jane Smith - HR Specialist</option>
                  <option value="mike.johnson">Mike Johnson - Operations Lead</option>
                  <option value="sarah.williams">Sarah Williams - Project Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
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
                  Target End Date
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

          {/* Support & Resources */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
              Support & Resources
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Department
                </label>
                <select
                  value={formData.supportDepartment}
                  onChange={(e) => handleInputChange("supportDepartment", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="HR, Training Unit">HR, Training Unit</option>
                  <option value="Finance Department">Finance Department</option>
                  <option value="HR Department">HR Department</option>
                  <option value="Operations Department">Operations Department</option>
                  <option value="Programs Department">Programs Department</option>
                  <option value="Communications Department">Communications Department</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Resources
                </label>
                <textarea
                  value={formData.resources}
                  onChange={(e) => handleInputChange("resources", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List required resources (budget, tools, personnel, etc.)..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Indicator *
                </label>
                <textarea
                  value={formData.successIndicator}
                  onChange={(e) => handleInputChange("successIndicator", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Define how success will be measured..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Potential Risks
                  </label>
                  <textarea
                    value={formData.risks}
                    onChange={(e) => handleInputChange("risks", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Identify potential risks and challenges..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dependencies
                  </label>
                  <textarea
                    value={formData.dependencies}
                    onChange={(e) => handleInputChange("dependencies", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List dependencies on other projects, teams, or resources..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{formData.keyDeliverable || "Deliverable Title"}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(formData.priority)}`}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{formData.activity || "Implementation activity description"}</p>
              <div className="text-xs text-gray-500">
                Timeline: {formData.timeline || "Not specified"} | 
                Support: {formData.supportDepartment || "Not assigned"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Deliverable"}
            </button>
          </div>
        </form>
      </div>
    </ModulePage>
  )
}
