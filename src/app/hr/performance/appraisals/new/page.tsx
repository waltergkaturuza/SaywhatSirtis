"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  UserPlusIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"

interface NewAppraisalForm {
  employeeId: string
  period: string
  appraisalType: string
  dueDate: string
  supervisor: string
  reviewer: string
  objectives: string[]
  performanceAreas: Array<{
    area: string
    weight: number
    description: string
  }>
  instructions: string
  selfAssessmentRequired: boolean
  peerFeedbackRequired: boolean
  customerFeedbackRequired: boolean
}

// Default performance areas
const defaultPerformanceAreas = [
  { area: "Job Knowledge & Technical Skills", weight: 20, description: "Understanding of role requirements and technical competencies" },
  { area: "Quality of Work", weight: 20, description: "Accuracy, thoroughness, and attention to detail" },
  { area: "Communication Skills", weight: 15, description: "Verbal and written communication effectiveness" },
  { area: "Team Collaboration", weight: 15, description: "Ability to work effectively with others" },
  { area: "Initiative & Innovation", weight: 15, description: "Proactive approach and creative problem-solving" },
  { area: "Leadership & Management", weight: 15, description: "Leadership abilities and people management skills" }
]

export default function NewAppraisalPage() {
  const router = useRouter()
  
  // State for form data
  const [formData, setFormData] = useState<NewAppraisalForm>({
    employeeId: "",
    period: "",
    appraisalType: "annual",
    dueDate: "",
    supervisor: "",
    reviewer: "",
    objectives: [""],
    performanceAreas: defaultPerformanceAreas,
    instructions: "",
    selfAssessmentRequired: true,
    peerFeedbackRequired: false,
    customerFeedbackRequired: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // State for data fetching
  const [employees, setEmployees] = useState<Array<{id: string, name: string, department: string, position: string}>>([])
  const [supervisors, setSupervisors] = useState<Array<{id: string, name: string, department: string}>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [employeesRes, supervisorsRes] = await Promise.all([
        fetch('/api/hr/employees'),
        fetch('/api/hr/supervisors')
      ])
      
      if (!employeesRes.ok || !supervisorsRes.ok) {
        throw new Error('Failed to load data')
      }
      
      const [employeesData, supervisorsData] = await Promise.all([
        employeesRes.json(),
        supervisorsRes.json()
      ])
      
      setEmployees(employeesData.map((emp: any) => ({
        id: emp.id.toString(),
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        position: emp.position || 'Employee'
      })))
      
      setSupervisors(supervisorsData.map((sup: any) => ({
        id: sup.id.toString(),
        name: `${sup.firstName} ${sup.lastName}`,
        department: sup.department
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const metadata = {
    title: "Create New Appraisal",
    description: "Set up a new performance appraisal",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Appraisals", href: "/hr/performance/appraisals" },
      { name: "New Appraisal" }
    ]
  }

  const handleInputChange = (field: keyof NewAppraisalForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives]
    newObjectives[index] = value
    setFormData(prev => ({ ...prev, objectives: newObjectives }))
  }

  const addObjective = () => {
    setFormData(prev => ({ ...prev, objectives: [...prev.objectives, ""] }))
  }

  const removeObjective = (index: number) => {
    if (formData.objectives.length > 1) {
      setFormData(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index)
      }))
    }
  }

  const handlePerformanceAreaChange = (index: number, field: string, value: any) => {
    const newAreas = [...formData.performanceAreas]
    newAreas[index] = { ...newAreas[index], [field]: value }
    setFormData(prev => ({ ...prev, performanceAreas: newAreas }))
  }

  const addPerformanceArea = () => {
    setFormData(prev => ({
      ...prev,
      performanceAreas: [...prev.performanceAreas, { area: "", weight: 0, description: "" }]
    }))
  }

  const removePerformanceArea = (index: number) => {
    if (formData.performanceAreas.length > 1) {
      setFormData(prev => ({
        ...prev,
        performanceAreas: prev.performanceAreas.filter((_, i) => i !== index)
      }))
    }
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.employeeId && formData.period && formData.appraisalType && formData.dueDate
      case 2:
        return formData.supervisor && formData.reviewer
      case 3:
        return formData.objectives.some(obj => obj.trim()) && 
               formData.performanceAreas.length > 0 &&
               formData.performanceAreas.every(area => area.area && area.weight > 0)
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    setIsSubmitting(true)
    try {
      // Here you would normally submit to your backend
      console.log("Creating new appraisal:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to appraisals list
      router.push("/hr/performance/appraisals")
    } catch (error) {
      console.error("Error creating appraisal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedEmployee = employees.find(emp => emp.id === formData.employeeId)
  const totalWeight = formData.performanceAreas.reduce((sum, area) => sum + area.weight, 0)

  const steps = [
    { id: 1, title: "Basic Information" },
    { id: 2, title: "Assignees" },
    { id: 3, title: "Performance Areas" },
    { id: 4, title: "Settings" }
  ]

  return (
    <ModulePage metadata={metadata}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlusIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Appraisal</h1>
              <p className="text-gray-600">Set up a new performance appraisal for an employee</p>
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
                  </div>
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
        <div className="bg-white shadow-sm rounded-lg p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </option>
                    ))}
                  </select>
                  {selectedEmployee && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-600">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        {selectedEmployee.department}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appraisal Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.appraisalType}
                    onChange={(e) => handleInputChange('appraisalType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="annual">Annual Review</option>
                    <option value="mid-year">Mid-Year Review</option>
                    <option value="quarterly">Quarterly Review</option>
                    <option value="probationary">Probationary Review</option>
                    <option value="project">Project-Based Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Period <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => handleInputChange('period', e.target.value)}
                    placeholder="e.g., Q1 2024, Jan-Dec 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Assignees</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.supervisor}
                    onChange={(e) => handleInputChange('supervisor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select supervisor</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.name}>
                        {supervisor.name} - {supervisor.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reviewer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.reviewer}
                    onChange={(e) => handleInputChange('reviewer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select reviewer</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.name}>
                        {supervisor.name} - {supervisor.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectives for this Review
                </label>
                <div className="space-y-3">
                  {formData.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => handleObjectiveChange(index, e.target.value)}
                        placeholder={`Objective ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.objectives.length > 1 && (
                        <button
                          onClick={() => removeObjective(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addObjective}
                    className="px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                  >
                    Add Objective
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Performance Areas</h2>
                <div className="text-sm text-gray-600">
                  Total Weight: <span className={`font-semibold ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalWeight}%
                  </span>
                  {totalWeight !== 100 && <span className="text-red-600 ml-1">(should be 100%)</span>}
                </div>
              </div>

              <div className="space-y-4">
                {formData.performanceAreas.map((area, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-gray-900">Performance Area {index + 1}</h3>
                      {formData.performanceAreas.length > 1 && (
                        <button
                          onClick={() => removePerformanceArea(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area Name
                        </label>
                        <input
                          type="text"
                          value={area.area}
                          onChange={(e) => handlePerformanceAreaChange(index, 'area', e.target.value)}
                          placeholder="e.g., Technical Skills"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={area.weight}
                          onChange={(e) => handlePerformanceAreaChange(index, 'weight', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={area.description}
                          onChange={(e) => handlePerformanceAreaChange(index, 'description', e.target.value)}
                          rows={2}
                          placeholder="Describe what this area evaluates..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addPerformanceArea}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600"
                >
                  Add Performance Area
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Settings & Instructions</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions for Employee
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  rows={4}
                  placeholder="Provide specific instructions for completing this appraisal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Requirements</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.selfAssessmentRequired}
                      onChange={(e) => handleInputChange('selfAssessmentRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Self-assessment required</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.peerFeedbackRequired}
                      onChange={(e) => handleInputChange('peerFeedbackRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Peer feedback required</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.customerFeedbackRequired}
                      onChange={(e) => handleInputChange('customerFeedbackRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Customer/stakeholder feedback required</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              {currentStep < steps.length ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!validateStep(currentStep)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateStep(currentStep) || totalWeight !== 100}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Appraisal"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
