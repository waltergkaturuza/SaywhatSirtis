"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
  progress: number
}

// Sample data - in real app this would come from API
const getSampleDeliverable = (id: string): DeliverableFormData => {
  const sampleData: Record<string, DeliverableFormData> = {
    "1": {
      keyDeliverable: "Improve Team Productivity",
      description: "Enhance overall team efficiency and output quality through process improvements and automation.",
      activity: "Implement new workflow automation tools and train team members",
      timeline: "Q1 2024 - Q2 2024",
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      supportDepartment: "IT Department, Training Unit",
      responsiblePerson: "john.doe",
      successIndicator: "20% increase in task completion rate, 95% team adoption",
      priority: "high",
      status: "on-track",
      estimatedEffort: "120 hours",
      resources: "Automation software licenses, training materials, consultant fees",
      risks: "Resistance to change, technical integration issues",
      dependencies: "IT infrastructure upgrades, budget approval",
      progress: 75
    },
    "2": {
      keyDeliverable: "Reduce Operational Costs",
      description: "Identify and implement cost-saving measures across operational processes.",
      activity: "Conduct cost analysis and implement optimization strategies",
      timeline: "Q1 2024 - Q3 2024",
      startDate: "2024-01-15",
      endDate: "2024-09-30",
      supportDepartment: "Finance Department",
      responsiblePerson: "sarah.williams",
      successIndicator: "15% reduction in operational expenses",
      priority: "medium",
      status: "at-risk",
      estimatedEffort: "80 hours",
      resources: "Financial analysis tools, process documentation",
      risks: "Market volatility, supplier changes",
      dependencies: "Management approval, vendor negotiations",
      progress: 30
    }
  }
  
  return sampleData[id] || sampleData["1"]
}

export default function EditDeliverablePage() {
  const router = useRouter()
  const params = useParams()
  const deliverableId = params.id as string
  
  const [formData, setFormData] = useState<DeliverableFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Load deliverable data
    const deliverableData = getSampleDeliverable(deliverableId)
    setFormData(deliverableData)
  }, [deliverableId])

  const metadata = {
    title: "Edit Deliverable",
    description: "Edit existing key deliverable for performance plan",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Plans", href: "/hr/performance/plans" },
      { name: "Key Deliverables", href: "/hr/performance/plans#deliverables" },
      { name: "Edit Deliverable" }
    ]
  }

  const handleInputChange = (field: keyof DeliverableFormData, value: string | number) => {
    if (!formData) return
    setFormData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    
    setIsSubmitting(true)

    try {
      // Here you would normally save to database
      console.log("Updating deliverable:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect back to plans page with deliverables tab active
      router.push("/hr/performance/plans?tab=deliverables")
    } catch (error) {
      console.error("Error updating deliverable:", error)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'on-track':
        return 'bg-blue-100 text-blue-800'
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-purple-100 text-purple-800'
      case 'not-started':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!formData) {
    return (
      <ModulePage metadata={metadata}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading deliverable...</p>
          </div>
        </div>
      </ModulePage>
    )
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
                <h1 className="text-2xl font-bold text-gray-900">Edit Deliverable</h1>
                <p className="text-gray-600">Update key deliverable information and progress</p>
              </div>
            </div>
            
            {/* Current Status */}
            <div className="flex items-center space-x-4 mt-4 p-3 bg-gray-50 rounded-lg">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(formData.status)}`}>
                {formData.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{formData.progress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${formData.progress}%` }}
                  ></div>
                </div>
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
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleInputChange("progress", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  <option value="IT Department, Training Unit">IT Department, Training Unit</option>
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
                  />
                </div>
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
              {isSubmitting ? "Updating..." : "Update Deliverable"}
            </button>
          </div>
        </form>
      </div>
    </ModulePage>
  )
}
