"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"

import { 
  PerformancePlanFormData, 
  defaultPlanFormData, 
  performancePlanSteps,
  getPriorityColor,
  getStatusColor
} from "@/components/hr/performance/performance-plan-types"

export default function CreatePerformancePlanPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PerformancePlanFormData>(defaultPlanFormData)
  
  // New state for dynamic data
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [loading, setLoading] = useState({
    employees: false,
    departments: false,
    supervisors: false
  })
  const [error, setError] = useState<string | null>(null)

  const metadata = {
    title: "Create Performance Plan",
    description: "Develop comprehensive performance plan with goals and expectations",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Plans", href: "/hr/performance/plans" },
      { name: "Create Plan" }
    ]
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parentField: keyof PerformancePlanFormData, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [childField]: value
      }
    }))
  }

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(prev => ({ ...prev, employees: true }))
      const response = await fetch('/api/hr/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.data || [])
      } else {
        setError('Failed to load employees')
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError('Failed to load employees')
    } finally {
      setLoading(prev => ({ ...prev, employees: false }))
    }
  }

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setLoading(prev => ({ ...prev, departments: true }))
      const response = await fetch('/api/hr/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
      } else {
        setError('Failed to load departments')
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setError('Failed to load departments')
    } finally {
      setLoading(prev => ({ ...prev, departments: false }))
    }
  }

  // Fetch supervisors from API
  const fetchSupervisors = async () => {
    try {
      setLoading(prev => ({ ...prev, supervisors: true }))
      const response = await fetch('/api/hr/supervisors')
      if (response.ok) {
        const data = await response.json()
        setSupervisors(data.supervisors || [])
      } else {
        setError('Failed to load supervisors')
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error)
      setError('Failed to load supervisors')
    } finally {
      setLoading(prev => ({ ...prev, supervisors: false }))
    }
  }

  // Handle employee selection
  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (employee) {
      setSelectedEmployee(employee)
      
      // Auto-populate employee details
      setFormData(prev => ({
        ...prev,
        employee: {
          id: employee.employeeId,
          name: employee.name,
          position: employee.position,
          department: employee.department
        },
        supervisor: employee.supervisor?.id || ''
      }))
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
    fetchSupervisors()
  }, [])

  const handleDeepNestedInputChange = (parentField: keyof PerformancePlanFormData, nestedField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [nestedField]: {
          ...(prev[parentField] as any)[nestedField],
          [childField]: value
        }
      }
    }))
  }

  const handleArrayChange = (arrayName: keyof PerformancePlanFormData, index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addArrayItem = (arrayName: keyof PerformancePlanFormData, template: any) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as any[]), template]
    }))
  }

  const removeArrayItem = (arrayName: keyof PerformancePlanFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).filter((_, i) => i !== index)
    }))
  }

  const handleNext = () => {
    if (currentStep < performancePlanSteps.length) {
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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/hr/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          isDraft: false
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Success - redirect to plans page
        router.push("/hr/performance/plans")
      } else {
        // Handle different error types
        if (response.status === 401) {
          alert('Authentication required. Please log in to create performance plans. Visit /auth/signin to authenticate.')
        } else {
          alert(result.error || result.message || 'Failed to submit performance plan')
        }
      }
    } catch (error) {
      console.error('Error submitting performance plan:', error)
      alert('An error occurred while submitting the performance plan. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      const response = await fetch('/api/hr/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          isDraft: true
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message || 'Draft saved successfully!')
      } else {
        // Handle different error types
        if (response.status === 401) {
          alert('Authentication required. Please log in to save drafts. Visit /auth/signin to authenticate.')
        } else {
          alert(result.error || result.message || 'Failed to save draft')
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('An error occurred while saving the draft. Please try again.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <select
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.employees}
                >
                  <option value="">
                    {loading.employees ? 'Loading employees...' : 'Choose an employee'}
                  </option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position} ({employee.department})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={formData.employee.id}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                  placeholder="Auto-filled when employee is selected"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={formData.employee.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                  placeholder="Auto-filled when employee is selected"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position/Job Title
                </label>
                <input
                  type="text"
                  value={formData.employee.position}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                  placeholder="Auto-filled when employee is selected"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.employee.department}
                  onChange={(e) => handleNestedInputChange("employee", "department", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.departments}
                >
                  <option value="">
                    {loading.departments ? 'Loading departments...' : 'Select Department'}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name} ({dept.employeeCount} employees)
                    </option>
                  ))}
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
                  disabled={loading.supervisors}
                >
                  <option value="">
                    {loading.supervisors ? 'Loading supervisors...' : 'Select Supervisor'}
                  </option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} - {supervisor.position} ({supervisor.department})
                      {supervisor.subordinateCount > 0 && ` - ${supervisor.subordinateCount} reports`}
                    </option>
                  ))}
                </select>
                {selectedEmployee?.supervisor && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="text-sm text-blue-800">
                      <strong>Current Supervisor:</strong> {selectedEmployee.supervisor.name}
                      <br />
                      <span className="text-blue-600">{selectedEmployee.supervisor.position}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Year
                </label>
                <select
                  value={formData.planYear}
                  onChange={(e) => handleInputChange("planYear", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const years = [];
                    // Generate years from current year to 20 years in the future for long-term planning
                    for (let year = currentYear; year <= currentYear + 20; year++) {
                      years.push(
                        <option key={year} value={year.toString()}>
                          {year} {year === currentYear ? '(Current Year)' : ''}
                        </option>
                      );
                    }
                    return years;
                  })()}
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Type
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => handleInputChange("planType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="annual">Annual Plan</option>
                    <option value="quarterly">Quarterly Plan</option>
                    <option value="project">Project-Based Plan</option>
                    <option value="probation">Probation Plan</option>
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
                    End Date
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
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Strategic Goals</h3>
              <p className="text-blue-700">Define key strategic objectives that align with organizational goals and priorities.</p>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
              <button
                onClick={() => addArrayItem("goals", {
                  id: Date.now().toString(),
                  title: "",
                  description: "",
                  category: "professional",
                  priority: "medium",
                  status: "not-started",
                  targetDate: "",
                  progress: 0,
                  metrics: [],
                  resources: [],
                  comments: ""
                })}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Goal
              </button>
            </div>

            {formData.goals.map((goal, index) => (
              <div key={index} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-semibold text-gray-900">Goal {index + 1}</h4>
                  {formData.goals.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("goals", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={goal.title}
                    onChange={(e) => handleArrayChange("goals", index, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter clear, specific goal title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={goal.description}
                    onChange={(e) => handleArrayChange("goals", index, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide detailed description of the goal and its importance..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={goal.priority}
                      onChange={(e) => handleArrayChange("goals", index, "priority", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={goal.targetDate}
                      onChange={(e) => handleArrayChange("goals", index, "targetDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={goal.status}
                      onChange={(e) => handleArrayChange("goals", index, "status", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success Metrics & Comments
                  </label>
                  <textarea
                    value={goal.comments}
                    onChange={(e) => handleArrayChange("goals", index, "comments", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Define how success will be measured and any additional comments..."
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                    {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">KPIs & Metrics</h3>
              <p className="text-green-700">Define measurable key performance indicators to track progress and success.</p>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Performance Indicators</h3>
              <button
                onClick={() => addArrayItem("kpis", {
                  indicator: "",
                  description: "",
                  target: "",
                  measurement: "",
                  frequency: "monthly",
                  weight: 20,
                  currentValue: ""
                })}
                className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add KPI
              </button>
            </div>

            {formData.kpis.map((kpi, index) => (
              <div key={index} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-semibold text-gray-900">KPI {index + 1}</h4>
                  {formData.kpis.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("kpis", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indicator Name
                    </label>
                    <input
                      type="text"
                      value={kpi.indicator}
                      onChange={(e) => handleArrayChange("kpis", index, "indicator", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Customer Satisfaction Score"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Value
                    </label>
                    <input
                      type="text"
                      value={kpi.target}
                      onChange={(e) => handleArrayChange("kpis", index, "target", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 85% or 50 units"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={kpi.description}
                    onChange={(e) => handleArrayChange("kpis", index, "description", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe what this KPI measures and why it's important..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How to Measure
                    </label>
                    <input
                      type="text"
                      value={kpi.measurement}
                      onChange={(e) => handleArrayChange("kpis", index, "measurement", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Survey scores"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={kpi.frequency}
                      onChange={(e) => handleArrayChange("kpis", index, "frequency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (%)
                    </label>
                    <input
                      type="number"
                      value={kpi.weight}
                      onChange={(e) => handleArrayChange("kpis", index, "weight", parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Value
                    </label>
                    <input
                      type="text"
                      value={kpi.currentValue}
                      onChange={(e) => handleArrayChange("kpis", index, "currentValue", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Current baseline"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Total Weight</h4>
              <p className="text-blue-700">
                Current total: {formData.kpis.reduce((sum, kpi) => sum + kpi.weight, 0)}% 
                {formData.kpis.reduce((sum, kpi) => sum + kpi.weight, 0) !== 100 && (
                  <span className="text-orange-600 ml-2">
                    (Should total 100%)
                  </span>
                )}
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Development Objectives</h3>
              <p className="text-purple-700">Plan professional growth opportunities and skill development initiatives.</p>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Development Areas</h3>
              <button
                onClick={() => addArrayItem("developmentObjectives", {
                  objective: "",
                  description: "",
                  competencyArea: "",
                  developmentActivities: "",
                  resources: "",
                  timeline: "",
                  successCriteria: ""
                })}
                className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Objective
              </button>
            </div>

            {formData.developmentObjectives.map((objective, index) => (
              <div key={index} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-semibold text-gray-900">Development Objective {index + 1}</h4>
                  {formData.developmentObjectives.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("developmentObjectives", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Development Objective
                  </label>
                  <input
                    type="text"
                    value={objective.objective}
                    onChange={(e) => handleArrayChange("developmentObjectives", index, "objective", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Improve project management skills"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={objective.description}
                    onChange={(e) => handleArrayChange("developmentObjectives", index, "description", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Detailed description of the development need..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Competency Area
                    </label>
                    <select
                      value={objective.competencyArea}
                      onChange={(e) => handleArrayChange("developmentObjectives", index, "competencyArea", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Area</option>
                      <option value="technical">Technical Skills</option>
                      <option value="leadership">Leadership</option>
                      <option value="communication">Communication</option>
                      <option value="management">Management</option>
                      <option value="analytical">Analytical</option>
                      <option value="interpersonal">Interpersonal</option>
                      <option value="digital">Digital Literacy</option>
                      <option value="strategic">Strategic Thinking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline
                    </label>
                    <input
                      type="text"
                      value={objective.timeline}
                      onChange={(e) => handleArrayChange("developmentObjectives", index, "timeline", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 6 months, Q2 2025"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Development Activities
                  </label>
                  <textarea
                    value={objective.developmentActivities}
                    onChange={(e) => handleArrayChange("developmentObjectives", index, "developmentActivities", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Specific activities, training, courses, mentoring, job rotation, etc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resources Required
                  </label>
                  <textarea
                    value={objective.resources}
                    onChange={(e) => handleArrayChange("developmentObjectives", index, "resources", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Training budget, time allocation, materials, mentors, etc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success Criteria
                  </label>
                  <textarea
                    value={objective.successCriteria}
                    onChange={(e) => handleArrayChange("developmentObjectives", index, "successCriteria", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="How will success be measured and demonstrated..."
                  />
                </div>
              </div>
            ))}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Behavioral Expectations</h3>
              <p className="text-indigo-700">Define expected behaviors and core values alignment for this role.</p>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Core Behaviors</h3>
              <button
                onClick={() => addArrayItem("behavioralExpectations", {
                  behavior: "",
                  description: "",
                  examples: "",
                  importance: "medium"
                })}
                className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Behavior
              </button>
            </div>

            {formData.behavioralExpectations.map((behavior, index) => (
              <div key={index} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-semibold text-gray-900">Behavioral Expectation {index + 1}</h4>
                  {formData.behavioralExpectations.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("behavioralExpectations", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Behavior/Value
                    </label>
                    <input
                      type="text"
                      value={behavior.behavior}
                      onChange={(e) => handleArrayChange("behavioralExpectations", index, "behavior", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Professional Communication"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Importance Level
                    </label>
                    <select
                      value={behavior.importance}
                      onChange={(e) => handleArrayChange("behavioralExpectations", index, "importance", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={behavior.description}
                    onChange={(e) => handleArrayChange("behavioralExpectations", index, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe what this behavior looks like and why it's important..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Examples & Observable Actions
                  </label>
                  <textarea
                    value={behavior.examples}
                    onChange={(e) => handleArrayChange("behavioralExpectations", index, "examples", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Provide specific examples of how this behavior should be demonstrated..."
                  />
                </div>

                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    behavior.importance === 'critical' ? 'bg-red-100 text-red-800' :
                    behavior.importance === 'high' ? 'bg-orange-100 text-orange-800' :
                    behavior.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {behavior.importance.charAt(0).toUpperCase() + behavior.importance.slice(1)} Importance
                  </span>
                </div>
              </div>
            ))}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Resources & Support</h3>
              <p className="text-orange-700">Identify resources, training, and support needed for success.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="border rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Resource Requirements</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resources Needed
                    </label>
                    <textarea
                      value={formData.resourcesNeeded}
                      onChange={(e) => handleInputChange("resourcesNeeded", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="List all resources needed (equipment, software, budget, tools, access to systems, etc.)..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Requirements
                    </label>
                    <textarea
                      value={formData.trainingRequirements}
                      onChange={(e) => handleInputChange("trainingRequirements", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Specify training programs, courses, certifications, workshops needed..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mentorship & Coaching Needs
                    </label>
                    <textarea
                      value={formData.mentorshipNeeds}
                      onChange={(e) => handleInputChange("mentorshipNeeds", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Identify mentoring relationships, coaching support, or knowledge transfer needs..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support from Manager
                    </label>
                    <textarea
                      value={formData.supportFromManager}
                      onChange={(e) => handleInputChange("supportFromManager", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Define specific support, guidance, and assistance needed from direct supervisor..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Resource Planning Tips</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Be specific about resource requirements and timelines</li>
                  <li>• Consider budget implications and approval processes</li>
                  <li>• Identify internal vs. external training options</li>
                  <li>• Plan for both immediate and long-term development needs</li>
                  <li>• Consider workload adjustments needed for training time</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-teal-900 mb-2">Review Schedule</h3>
              <p className="text-teal-700">Plan regular review milestones to track progress and provide feedback.</p>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Review Milestones</h3>
              <button
                onClick={() => addArrayItem("reviewMilestones", {
                  milestone: "",
                  date: "",
                  reviewType: "informal",
                  expectedOutcomes: ""
                })}
                className="inline-flex items-center px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Milestone
              </button>
            </div>

            {formData.reviewMilestones.map((milestone, index) => (
              <div key={index} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-semibold text-gray-900">Review Milestone {index + 1}</h4>
                  {formData.reviewMilestones.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("reviewMilestones", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Milestone Name
                    </label>
                    <input
                      type="text"
                      value={milestone.milestone}
                      onChange={(e) => handleArrayChange("reviewMilestones", index, "milestone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Quarter 1 Review"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Date
                    </label>
                    <input
                      type="date"
                      value={milestone.date}
                      onChange={(e) => handleArrayChange("reviewMilestones", index, "date", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Type
                    </label>
                    <select
                      value={milestone.reviewType}
                      onChange={(e) => handleArrayChange("reviewMilestones", index, "reviewType", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="informal">Informal Check-in</option>
                      <option value="formal">Formal Review</option>
                      <option value="360">360-Degree Review</option>
                      <option value="self-assessment">Self Assessment</option>
                      <option value="peer-review">Peer Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Outcomes & Focus Areas
                  </label>
                  <textarea
                    value={milestone.expectedOutcomes}
                    onChange={(e) => handleArrayChange("reviewMilestones", index, "expectedOutcomes", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="What should be achieved or discussed during this review..."
                  />
                </div>

                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    milestone.reviewType === 'formal' ? 'bg-blue-100 text-blue-800' :
                    milestone.reviewType === '360' ? 'bg-purple-100 text-purple-800' :
                    milestone.reviewType === 'self-assessment' ? 'bg-green-100 text-green-800' :
                    milestone.reviewType === 'peer-review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {milestone.reviewType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Review
                  </span>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Review Schedule Guidelines</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Plan regular intervals (monthly, quarterly, etc.)</li>
                <li>• Include both formal and informal check-ins</li>
                <li>• Allow time for course corrections and adjustments</li>
                <li>• Consider peak workload periods when scheduling</li>
                <li>• Include milestone celebrations for achievements</li>
              </ul>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Final Review</h3>
              <p className="text-yellow-700">Please review all information before submitting the performance plan.</p>
            </div>

            {/* Summary Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Employee Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {formData.employee.name}</div>
                  <div><span className="font-medium">Position:</span> {formData.employee.position}</div>
                  <div><span className="font-medium">Department:</span> {formData.employee.department}</div>
                  <div><span className="font-medium">Supervisor:</span> {formData.supervisor}</div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Plan Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Plan Year:</span> {formData.planYear}</div>
                  <div><span className="font-medium">Type:</span> {formData.planType}</div>
                  <div><span className="font-medium">Period:</span> {formData.startDate} to {formData.endDate}</div>
                  <div><span className="font-medium">Status:</span> {formData.status}</div>
                </div>
              </div>
            </div>

            {/* Goals Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Goals Summary ({formData.goals.length})</h4>
              <div className="space-y-2">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{goal.title}</span>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                        {goal.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(goal.status)}`}>
                        {goal.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KPIs Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">KPIs & Metrics Summary ({formData.kpis.length})</h4>
              <div className="space-y-2">
                {formData.kpis.map((kpi, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{kpi.indicator}</span>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
                        Target: {kpi.target}
                      </span>
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                        {kpi.weight}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Total Weight: {formData.kpis.reduce((sum, kpi) => sum + kpi.weight, 0)}%
              </div>
            </div>

            {/* Development Objectives Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Development Objectives Summary ({formData.developmentObjectives.length})</h4>
              <div className="space-y-2">
                {formData.developmentObjectives.map((objective, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{objective.objective}</span>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">
                        {objective.competencyArea}
                      </span>
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium">
                        {objective.timeline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavioral Expectations Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Behavioral Expectations Summary ({formData.behavioralExpectations.length})</h4>
              <div className="space-y-2">
                {formData.behavioralExpectations.map((behavior, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{behavior.behavior}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      behavior.importance === 'critical' ? 'bg-red-100 text-red-800' :
                      behavior.importance === 'high' ? 'bg-orange-100 text-orange-800' :
                      behavior.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {behavior.importance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Schedule Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Review Schedule Summary ({formData.reviewMilestones.length})</h4>
              <div className="space-y-2">
                {formData.reviewMilestones.map((milestone, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{milestone.milestone}</span>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 rounded bg-teal-100 text-teal-800 text-xs font-medium">
                        {milestone.date}
                      </span>
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium">
                        {milestone.reviewType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agreement and Sign-off</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Comments
                  </label>
                  <textarea
                    value={formData.employeeComments}
                    onChange={(e) => handleInputChange("employeeComments", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Employee's comments on the performance plan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor Comments
                  </label>
                  <textarea
                    value={formData.supervisorComments}
                    onChange={(e) => handleInputChange("supervisorComments", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Supervisor's comments and expectations..."
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
                    Employee agrees with the performance plan and understands the expectations
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Ready to submit performance plan</span>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Step content coming soon...</p>
          </div>
        )
    }
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {performancePlanSteps.map((step, index) => (
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
                {index < performancePlanSteps.length - 1 && (
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
            <h2 className="text-xl font-semibold text-gray-900">{performancePlanSteps[currentStep - 1].title}</h2>
            <p className="text-gray-600">{performancePlanSteps[currentStep - 1].description}</p>
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

              {currentStep === performancePlanSteps.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Plan'}
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
    </ModulePage>
  )
}
