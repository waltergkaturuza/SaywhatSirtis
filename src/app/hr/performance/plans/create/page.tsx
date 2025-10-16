"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { CheckCircleIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"

import { 
  PerformancePlanFormData, 
  defaultPlanFormData, 
  performancePlanSteps,
  getPriorityColor,
  getStatusColor
} from "@/components/hr/performance/performance-plan-types"

function CreatePerformancePlanPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState('my-plan') // 'my-plan', 'supervisor', 'reviewer'
  const [formData, setFormData] = useState<PerformancePlanFormData>(defaultPlanFormData)
  
  // Check if this is for the current user (accessed from profile)
  const isForCurrentUser = searchParams.get('self') === 'true' || !searchParams.get('employee')
  
  // New state for dynamic data
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [reviewers, setReviewers] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [loading, setLoading] = useState({
    employees: false,
    departments: false,
    supervisors: false,
    reviewers: false
  })
  const [error, setError] = useState<string | null>(null)

  // Workflow state
  const [workflowStatus, setWorkflowStatus] = useState('draft') // 'draft', 'supervisor_review', 'reviewer_assessment', 'completed'
  const [supervisorComments, setSupervisorComments] = useState('')
  const [supervisorApproval, setSupervisorApproval] = useState('pending') // 'pending', 'approved', 'rejected'
  const [reviewerComments, setReviewerComments] = useState('')
  const [reviewerApproval, setReviewerApproval] = useState('pending') // 'pending', 'approved', 'rejected'

  // Tab navigation
  const tabs = [
    {
      id: 'my-plan',
      name: 'My Performance Plan', 
      description: 'Create and manage your performance objectives',
      enabled: true
    },
    {
      id: 'supervisor',
      name: 'Supervisor Review',
      description: 'Supervisor comments and approval',
      enabled: true // Always enabled so employees can view
    },
    {
      id: 'reviewer',
      name: 'Final Review',
      description: 'Final reviewer assessment',
      enabled: true // Always enabled so employees can view
    }
  ]

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
  const handleEmployeeSelect = async (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (employee) {
      setSelectedEmployee(employee)
      
      // Fetch full employee details including job description
      try {
        const response = await fetch(`/api/hr/employees/${employeeId}`)
        if (response.ok) {
          const result = await response.json()
          const fullEmployeeData = result.data || result
          
          // Extract key responsibilities from job description
          let keyResponsibilities: any[] = []
          if (fullEmployeeData.jobDescription?.keyResponsibilities && Array.isArray(fullEmployeeData.jobDescription.keyResponsibilities)) {
            keyResponsibilities = fullEmployeeData.jobDescription.keyResponsibilities.map((resp: any, index: number) => ({
              id: `${Date.now()}-${index}`,
              description: resp.description || '',
              tasks: resp.tasks || '',
              weight: resp.weight || 0,
              targetDate: '',
              status: 'not-started' as const,
              progress: 0,
              successIndicators: [
                {
                  id: '1',
                  indicator: '',
                  target: '',
                  measurement: ''
                }
              ],
              comments: ''
            }))
          }
          
          // Auto-populate employee details and key responsibilities
          setFormData(prev => ({
            ...prev,
            employee: {
              id: employee.employeeId || employee.id,
              name: employee.name,
              email: employee.email || '',
              position: employee.position || '',
              department: employee.department?.name || employee.department || '',
              manager: employee.supervisor?.name || employee.manager || '',
              planPeriod: {
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }
            },
            supervisor: employee.supervisor?.id || '',
            reviewerId: fullEmployeeData.reviewerId || '',
            keyResponsibilities: keyResponsibilities.length > 0 ? keyResponsibilities : [{
              id: '1',
              description: '',
              tasks: '',
              weight: 0,
              targetDate: '',
              status: 'not-started' as const,
              progress: 0,
              successIndicators: [
                {
                  id: '1',
                  indicator: '',
                  target: '',
                  measurement: ''
                }
              ],
              comments: ''
            }]
          }))
        }
      } catch (error) {
        console.error('Error fetching employee details:', error)
        // Fallback to basic employee data
      setFormData(prev => ({
        ...prev,
        employee: {
          id: employee.employeeId || employee.id,
          name: employee.name,
          email: employee.email || '',
          position: employee.position || '',
          department: employee.department?.name || employee.department || '',
          manager: employee.supervisor?.name || employee.manager || '',
          planPeriod: {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        },
        supervisor: employee.supervisor?.id || ''
      }))
      }
    }
  }

  // Fetch reviewers from API
  const fetchReviewers = async () => {
    try {
      setLoading(prev => ({ ...prev, reviewers: true }))
      const response = await fetch('/api/hr/reviewers')
      if (response.ok) {
        const data = await response.json()
        setReviewers(data.data || data.reviewers || [])
      } else {
        setError('Failed to load reviewers')
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error)
      setError('Failed to load reviewers')
    } finally {
      setLoading(prev => ({ ...prev, reviewers: false }))
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
    fetchSupervisors()
    fetchReviewers()
  }, [])

  // Auto-populate current user's information when accessed from profile
  useEffect(() => {
    const autoFillCurrentUser = async () => {
      if (isForCurrentUser && session?.user?.email) {
        try {
          // Fetch current user's employee details
          const response = await fetch(`/api/hr/employees/by-email/${encodeURIComponent(session.user.email)}`)
          if (response.ok) {
            const employeeData = await response.json()
            
            // Extract key responsibilities from job description
            let keyResponsibilities: any[] = []
            if (employeeData.jobDescription?.keyResponsibilities && Array.isArray(employeeData.jobDescription.keyResponsibilities)) {
              keyResponsibilities = employeeData.jobDescription.keyResponsibilities.map((resp: any, index: number) => ({
                id: `${Date.now()}-${index}`,
                description: resp.description || '',
                tasks: resp.tasks || '',
                weight: resp.weight || 0,
                targetDate: '',
                status: 'not-started' as const,
                progress: 0,
                successIndicators: [
                  {
                    id: '1',
                    indicator: '',
                    target: '',
                    measurement: ''
                  }
                ],
                comments: ''
              }))
            }
            
            // Auto-populate the form with current user's details
            setFormData(prev => ({
              ...prev,
              employee: {
                id: employeeData.id || '',
                name: `${employeeData.firstName || ''} ${employeeData.lastName || ''}`.trim() || employeeData.email || '',
                email: employeeData.email || session.user.email || '',
                department: employeeData.department?.name || employeeData.department || '',
                position: employeeData.position || '',
                manager: employeeData.supervisor || 'Not Assigned',
                planPeriod: {
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                }
              },
              reviewerId: employeeData.reviewerId || '',
              keyResponsibilities: keyResponsibilities.length > 0 ? keyResponsibilities : [{
                id: '1',
                description: '',
                tasks: '',
                weight: 0,
                targetDate: '',
                status: 'not-started' as const,
                progress: 0,
                successIndicators: [
                  {
                    id: '1',
                    indicator: '',
                    target: '',
                    measurement: ''
                  }
                ],
                comments: ''
              }]
            }))

            // Set selected employee
            setSelectedEmployee(employeeData)

            // Disable employee selection dropdown since it's for current user
            setLoading(prev => ({ ...prev, autoFilled: true }))
          }
        } catch (error) {
          console.error('Error auto-filling current user data:', error)
          setError('Failed to load your employee information')
        }
      }
    }

    autoFillCurrentUser()
  }, [isForCurrentUser, session?.user?.email])

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
          <div className="space-y-8">
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-white via-orange-25 to-white p-8 rounded-2xl shadow-lg border border-orange-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mr-2"></div>
                    Select Employee *
                  </label>
                  {isForCurrentUser ? (
                    <input
                      type="text"
                      value={formData.employee.name || 'Loading your information...'}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl bg-green-50 text-gray-700 shadow-sm cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={selectedEmployee?.id || ''}
                      onChange={(e) => handleEmployeeSelect(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
                      disabled={loading.employees}
                    >
                      <option value="">
                        {loading.employees ? 'Loading employees...' : 'Choose an employee'}
                      </option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position} ({employee.department?.name || employee.department || 'No Department'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mr-2"></div>
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employee.id}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                    placeholder="Auto-filled when employee is selected"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2"></div>
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={formData.employee.name}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                    placeholder="Auto-filled when employee is selected"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-2"></div>
                    Position/Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.employee.position}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                    placeholder="Auto-filled when employee is selected"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mr-2"></div>
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.employee.department}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                    placeholder="Auto-filled when employee is selected"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mr-2"></div>
                    Direct Supervisor
                  </label>
                  <input
                    type="text"
                    value={selectedEmployee?.supervisor?.name || formData.employee.manager || 'No supervisor assigned'}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none shadow-sm"
                    placeholder="Auto-filled when employee is selected"
                  />
                  {selectedEmployee?.supervisor && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl shadow-sm">
                      <div className="text-sm text-orange-800">
                        <strong>Supervisor:</strong> {selectedEmployee.supervisor.name}
                        <br />
                        <span className="text-orange-600">{selectedEmployee.supervisor.position || 'Position not specified'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full mr-2"></div>
                    Performance Reviewer *
                  </label>
                  <select
                    value={formData.reviewerId}
                    onChange={(e) => handleInputChange("reviewerId", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
                    disabled={loading.reviewers}
                  >
                    <option value="">
                      {loading.reviewers ? 'Loading reviewers...' : 'Select a performance reviewer'}
                    </option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name} - {reviewer.position || 'Reviewer'} ({reviewer.department})
                      </option>
                    ))}
                  </select>
                  {formData.reviewerId && (
                    <p className="mt-2 text-sm text-gray-600">
                      The selected reviewer will conduct the final performance assessment
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mr-2"></div>
                    Plan Year
                  </label>
                  <select
                    value={formData.planYear}
                    onChange={(e) => handleInputChange("planYear", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
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
            </div>

            <div className="bg-gradient-to-br from-white via-blue-25 to-white p-8 rounded-2xl shadow-lg border border-blue-100 mt-8">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Plan Period</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mr-2"></div>
                    Plan Type
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => handleInputChange("planType", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
                  >
                    <option value="annual">Annual Plan</option>
                    <option value="quarterly">Quarterly Plan</option>
                    <option value="project">Project-Based Plan</option>
                    <option value="probation">Probation Plan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2"></div>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mr-2"></div>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-50 via-orange-100 to-red-50 p-8 rounded-2xl shadow-lg border border-orange-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-lg font-bold">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-orange-900">Key Responsibilities</h3>
              </div>
              <p className="text-orange-800 text-lg leading-relaxed">Define key responsibilities and performance areas from your job description.</p>
            </div>

            <div className="bg-gradient-to-br from-white via-gray-25 to-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">📌</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Responsibilities</h3>
                </div>
                <button
                  onClick={() => addArrayItem("keyResponsibilities", {
                    id: Date.now().toString(),
                    description: "",
                    tasks: "",
                    weight: 0,
                    targetDate: "",
                    status: "not-started",
                  progress: 0,
                    successIndicators: [
                      {
                        id: '1',
                        indicator: '',
                        target: '',
                        measurement: ''
                      }
                    ],
                  comments: ""
                  })}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Responsibility
                </button>
              </div>
            </div>

              {formData.keyResponsibilities.map((responsibility, index) => (
                <div key={index} className="bg-gradient-to-br from-white via-blue-25 to-purple-25 border-2 border-gray-200 rounded-2xl p-8 space-y-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Responsibility {index + 1}</h4>
                    </div>
                    {formData.keyResponsibilities.length > 1 && (
                      <button
                        onClick={() => removeArrayItem("keyResponsibilities", index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mr-2"></div>
                      Responsibility Description
                    </label>
                    <textarea
                      value={responsibility.description}
                      onChange={(e) => handleArrayChange("keyResponsibilities", index, "description", e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm resize-none"
                      placeholder="Enter responsibility description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2"></div>
                      Tasks / Activities
                    </label>
                    <textarea
                      value={responsibility.tasks}
                      onChange={(e) => handleArrayChange("keyResponsibilities", index, "tasks", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm resize-none"
                      placeholder="List specific tasks and activities for this responsibility..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-2"></div>
                        Weight (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={responsibility.weight}
                        onChange={(e) => handleArrayChange("keyResponsibilities", index, "weight", parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
                        placeholder="0-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-2"></div>
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={responsibility.targetDate}
                        onChange={(e) => handleArrayChange("keyResponsibilities", index, "targetDate", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mr-2"></div>
                        Status
                      </label>
                      <select
                        value={responsibility.status}
                        onChange={(e) => handleArrayChange("keyResponsibilities", index, "status", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="on-hold">On Hold</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Success Indicators */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-full mr-2"></div>
                        Success Indicators for this Responsibility
                    </label>
              <button
                        onClick={() => {
                          const updatedResponsibilities = [...formData.keyResponsibilities]
                          updatedResponsibilities[index].successIndicators.push({
                            id: Date.now().toString(),
                            indicator: '',
                            target: '',
                            measurement: ''
                          })
                          setFormData(prev => ({ ...prev, keyResponsibilities: updatedResponsibilities }))
                        }}
                        className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-semibold"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                        Add Indicator
              </button>
            </div>

                    {responsibility.successIndicators.map((indicator: any, indicatorIndex: number) => (
                      <div key={indicatorIndex} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-semibold text-green-800">Indicator {indicatorIndex + 1}</span>
                          {responsibility.successIndicators.length > 1 && (
                    <button
                              onClick={() => {
                                const updatedResponsibilities = [...formData.keyResponsibilities]
                                updatedResponsibilities[index].successIndicators.splice(indicatorIndex, 1)
                                setFormData(prev => ({ ...prev, keyResponsibilities: updatedResponsibilities }))
                              }}
                              className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Indicator Name</label>
                    <input
                      type="text"
                              value={indicator.indicator}
                              onChange={(e) => {
                                const updatedResponsibilities = [...formData.keyResponsibilities]
                                updatedResponsibilities[index].successIndicators[indicatorIndex].indicator = e.target.value
                                setFormData(prev => ({ ...prev, keyResponsibilities: updatedResponsibilities }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                              placeholder="e.g., Customer Satisfaction"
                    />
                  </div>
                  <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Target Value</label>
                    <input
                      type="text"
                              value={indicator.target}
                              onChange={(e) => {
                                const updatedResponsibilities = [...formData.keyResponsibilities]
                                updatedResponsibilities[index].successIndicators[indicatorIndex].target = e.target.value
                                setFormData(prev => ({ ...prev, keyResponsibilities: updatedResponsibilities }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                              placeholder="e.g., 95% or 50 units"
                    />
                  </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Measurement Method</label>
                            <input
                              type="text"
                              value={indicator.measurement}
                              onChange={(e) => {
                                const updatedResponsibilities = [...formData.keyResponsibilities]
                                updatedResponsibilities[index].successIndicators[indicatorIndex].measurement = e.target.value
                                setFormData(prev => ({ ...prev, keyResponsibilities: updatedResponsibilities }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                              placeholder="e.g., Monthly survey"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mr-2"></div>
                      Additional Comments
                  </label>
                  <textarea
                      value={responsibility.comments}
                      onChange={(e) => handleArrayChange("keyResponsibilities", index, "comments", e.target.value)}
                    rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm resize-none"
                      placeholder="Any additional comments or notes..."
                  />
                </div>

                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm bg-purple-100 text-purple-800 border-purple-300`}>
                      Weight: {responsibility.weight}%
                    </span>
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${getStatusColor(responsibility.status)}`}>
                      {responsibility.status.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 via-teal-50 to-green-50 p-8 rounded-2xl shadow-lg border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-lg font-bold">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-green-900">Success Indicators Summary</h3>
              </div>
              <p className="text-green-800 text-lg leading-relaxed">Review all success indicators defined for your key responsibilities.</p>
                  </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Success Indicators by Responsibility</h3>
              <p className="text-sm text-gray-600 mb-6">These indicators were defined in Step 2 for each key responsibility.</p>

              {formData.keyResponsibilities.map((responsibility, respIndex) => (
                <div key={respIndex} className="mb-6 border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-gray-50">
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Responsibility {respIndex + 1}: {responsibility.description || 'Untitled'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Weight:</span> {responsibility.weight}% | 
                      <span className="font-semibold ml-2">Status:</span> {responsibility.status.replace('-', ' ')}
                    </p>
                    {responsibility.tasks && (
                      <p className="text-sm text-gray-700 italic">
                        <span className="font-semibold">Tasks:</span> {responsibility.tasks}
                      </p>
                    )}
                  </div>

                  {responsibility.successIndicators && responsibility.successIndicators.length > 0 ? (
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-green-800 mb-3">Success Indicators:</h5>
                      {responsibility.successIndicators.map((indicator: any, indIndex: number) => (
                        <div key={indIndex} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Indicator</p>
                              <p className="text-sm text-gray-900">{indicator.indicator || 'Not specified'}</p>
                  </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Target</p>
                              <p className="text-sm text-gray-900">{indicator.target || 'Not specified'}</p>
                </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Measurement Method</p>
                              <p className="text-sm text-gray-900">{indicator.measurement || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No success indicators defined for this responsibility.</p>
                  )}
              </div>
            ))}

              {formData.keyResponsibilities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No key responsibilities defined yet. Please go back to Step 2 to add responsibilities.</p>
                </div>
              )}

              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">Total Responsibilities: <span className="font-bold">{formData.keyResponsibilities.length}</span></p>
                  </div>
                  <div>
                    <p className="text-blue-700">Total Indicators: <span className="font-bold">
                      {formData.keyResponsibilities.reduce((sum, resp) => sum + (resp.successIndicators?.length || 0), 0)}
                    </span></p>
                  </div>
                </div>
              </div>
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
                    milestone.reviewType === 'formal' ? 'bg-orange-100 text-orange-800' :
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

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Review Schedule Guidelines</h4>
              <ul className="text-orange-700 text-sm space-y-1">
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

            {/* Key Responsibilities Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Key Responsibilities Summary ({formData.keyResponsibilities.length})</h4>
              <div className="space-y-2">
                {formData.keyResponsibilities.map((responsibility, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{responsibility.description || `Responsibility ${index + 1}`}</span>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">
                        {responsibility.weight}%
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(responsibility.status)}`}>
                        {responsibility.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Indicators Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Success Indicators Summary 
                ({formData.keyResponsibilities.reduce((sum, resp) => sum + (resp.successIndicators?.length || 0), 0)} indicators)
              </h4>
              <div className="space-y-3">
                {formData.keyResponsibilities.map((responsibility, respIndex) => (
                  <div key={respIndex}>
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      {responsibility.description || `Responsibility ${respIndex + 1}`} ({responsibility.weight}%)
                    </p>
                    {responsibility.successIndicators && responsibility.successIndicators.length > 0 ? (
                      <div className="pl-3 space-y-1">
                        {responsibility.successIndicators.map((indicator: any, indIndex: number) => (
                          <div key={indIndex} className="flex justify-between items-center text-xs bg-green-50 p-2 rounded">
                            <span className="text-gray-900">{indicator.indicator || 'Unnamed indicator'}</span>
                            <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
                              Target: {indicator.target || 'N/A'}
                      </span>
                  </div>
                ))}
              </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic pl-3">No indicators defined</p>
                    )}
                  </div>
                ))}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Supervisor's comments and expectations..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="employeeAgreement"
                    checked={formData.employeeAgreement}
                    onChange={(e) => handleInputChange("employeeAgreement", e.target.checked)}
                    className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Header Section with SAYWHAT Branding */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Performance Plan Creation
                </h1>
                <p className="text-gray-600 text-sm">SAYWHAT Integrated Real-Time Information System</p>
              </div>
            </div>
          </div>

          {/* Workflow Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => tab.enabled && setActiveTab(tab.id)}
                    disabled={!tab.enabled}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-saywhat-orange text-saywhat-orange'
                        : tab.enabled
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        : 'border-transparent text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{tab.name}</span>
                      {tab.id === 'supervisor' && supervisorApproval === 'approved' && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                      {tab.id === 'reviewer' && reviewerApproval === 'approved' && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{tab.description}</p>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Clean Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {performancePlanSteps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 shadow-lg ${
                      step.id < currentStep
                        ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white'
                      : step.id === currentStep 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step.id < currentStep ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <span className="text-lg font-bold">{step.id}</span>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-semibold ${
                        step.id < currentStep ? 'text-green-600' : step.id === currentStep ? 'text-orange-600' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-24">{step.description}</p>
                    </div>
                  </div>
                  {index < performancePlanSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-300 ${
                      step.id < currentStep ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
            
            {/* My Performance Plan Tab */}
            {activeTab === 'my-plan' && (
              <div>
                {/* Form Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">{currentStep}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{performancePlanSteps[currentStep - 1].title}</h2>
                      <p className="text-gray-600 text-sm mt-1">{performancePlanSteps[currentStep - 1].description}</p>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="px-8 py-8">
                  {renderStepContent()}
                </div>

                {/* Navigation Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    {currentStep > 1 ? (
                      <button
                        onClick={handlePrevious}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <span>← Previous</span>
                      </button>
                    ) : (
                      <div></div>
                    )}
                    
                    {currentStep < performancePlanSteps.length ? (
                      <button
                        onClick={handleNext}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <span>Next →</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <span>Submit Plan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Supervisor Review Tab */}
            {activeTab === 'supervisor' && (
              <div>
                {/* Supervisor Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Supervisor Review</h2>
                      <p className="text-gray-600 text-sm mt-1">Review employee's performance plan and provide feedback</p>
                    </div>
                  </div>
                </div>

                {/* Supervisor Content */}
                <div className="px-8 py-8 space-y-6">
                  {/* Employee View Notice */}
                  {isForCurrentUser && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700 font-medium">
                            You are viewing the supervisor review section. Supervisor comments will appear here once submitted.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Employee Plan Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee's Performance Plan Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Employee:</span>
                        <span className="ml-2 text-gray-900">{formData.employee.name || 'Not Selected'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Plan Year:</span>
                        <span className="ml-2 text-gray-900">{formData.planYear || '2025'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Department:</span>
                        <span className="ml-2 text-gray-900">{formData.employee.department || 'Not Assigned'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 text-gray-900">{workflowStatus.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Supervisor Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supervisor Comments & Feedback
                    </label>
                    <textarea
                      value={supervisorComments}
                      onChange={(e) => setSupervisorComments(e.target.value)}
                      rows={4}
                      readOnly={isForCurrentUser}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${isForCurrentUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder={isForCurrentUser ? "Supervisor comments will appear here..." : "Provide feedback on the employee's performance plan objectives, development activities, and overall approach..."}
                    />
                  </div>

                  {/* Supervisor Approval */}
                  {!isForCurrentUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Supervisor Authorization
                    </label>
                    <div className="space-y-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="supervisorApproval"
                          value="approved"
                          checked={supervisorApproval === 'approved'}
                          onChange={(e) => setSupervisorApproval(e.target.value)}
                          className="form-radio h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">Approve Plan</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="supervisorApproval"
                          value="rejected"
                          checked={supervisorApproval === 'rejected'}
                          onChange={(e) => setSupervisorApproval(e.target.value)}
                          className="form-radio h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">Reject Plan (Requires Revision)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="supervisorApproval"
                          value="pending"
                          checked={supervisorApproval === 'pending'}
                          onChange={(e) => setSupervisorApproval(e.target.value)}
                          className="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">Pending Review</span>
                      </label>
                    </div>
                  </div>
                  )}

                  {/* Approval Status Display for Employee */}
                  {isForCurrentUser && supervisorApproval !== 'pending' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supervisor Decision
                      </label>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                        supervisorApproval === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {supervisorApproval === 'approved' ? '✓ Plan Approved' : '✗ Plan Rejected - Requires Revision'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Supervisor Footer */}
                {!isForCurrentUser && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (supervisorApproval === 'approved') {
                          setWorkflowStatus('reviewer_assessment')
                          setActiveTab('reviewer')
                        }
                      }}
                      disabled={supervisorApproval === 'pending'}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Submit Supervisor Review</span>
                    </button>
                  </div>
                </div>
                )}
              </div>
            )}

            {/* Final Reviewer Tab */}
            {activeTab === 'reviewer' && (
              <div>
                {/* Reviewer Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Final Review</h2>
                      <p className="text-gray-600 text-sm mt-1">Final assessment and approval of the performance plan</p>
                    </div>
                  </div>
                </div>

                {/* Reviewer Content */}
                <div className="px-8 py-8 space-y-6">
                  {/* Employee View Notice */}
                  {isForCurrentUser && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700 font-medium">
                            You are viewing the final review section. Reviewer comments and final approval will appear here once submitted.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Workflow Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Plan Workflow Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-900">Employee completed plan creation</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className={`h-5 w-5 mr-3 ${supervisorApproval === 'approved' ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm text-gray-900">Supervisor approval: {supervisorApproval.toUpperCase()}</span>
                      </div>
                      {supervisorComments && (
                        <div className="ml-8 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">Supervisor Comments:</p>
                          <p className="text-sm text-gray-800 mt-1">{supervisorComments}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reviewer Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Review Comments
                    </label>
                    <textarea
                      value={reviewerComments}
                      onChange={(e) => setReviewerComments(e.target.value)}
                      rows={4}
                      readOnly={isForCurrentUser}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${isForCurrentUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder={isForCurrentUser ? "Final reviewer comments will appear here..." : "Provide final assessment and overall feedback on the performance plan..."}
                    />
                  </div>

                  {/* Reviewer Approval */}
                  {!isForCurrentUser && (
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Final Authorization
                    </label>
                    <div className="space-y-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="reviewerApproval"
                          value="approved"
                          checked={reviewerApproval === 'approved'}
                          onChange={(e) => setReviewerApproval(e.target.value)}
                          className="form-radio h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">Final Approval - Implement Plan</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="reviewerApproval"
                          value="rejected"
                          checked={reviewerApproval === 'rejected'}
                          onChange={(e) => setReviewerApproval(e.target.value)}
                          className="form-radio h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">Reject - Return for Revision</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="reviewerApproval"
                          value="pending"
                          checked={reviewerApproval === 'pending'}
                          onChange={(e) => setReviewerApproval(e.target.value)}
                          className="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">Under Review</span>
                      </label>
                    </div>
                    </div>
                  )}

                  {/* Approval Status Display for Employee */}
                  {isForCurrentUser && reviewerApproval !== 'pending' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Final Decision
                      </label>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                        reviewerApproval === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {reviewerApproval === 'approved' ? '✓ Performance Plan Approved - Ready to Implement' : '✗ Plan Requires Further Revision'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviewer Footer */}
                {!isForCurrentUser && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-t border-gray-200">
                    <div className="flex justify-end">
                      <button
                      onClick={() => {
                        if (reviewerApproval === 'approved') {
                          setWorkflowStatus('completed')
                          // Handle final submission
                        }
                      }}
                      disabled={reviewerApproval === 'pending'}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Finalize Performance Plan</span>
                    </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Original Form Container (now inside tabs) */}
          <div className="hidden bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">{currentStep}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{performancePlanSteps[currentStep - 1].title}</h2>
                  <p className="text-gray-600 text-sm mt-1">{performancePlanSteps[currentStep - 1].description}</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-8 py-8">
              {renderStepContent()}
            </div>

            {/* Navigation Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                {currentStep > 1 ? (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span>← Previous</span>
                  </button>
                ) : (
                  <div></div>
                )}
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    Step {currentStep} of {performancePlanSteps.length}
                  </span>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                  >
                    <span>{isSavingDraft ? 'Saving...' : '💾 Save Draft'}</span>
                  </button>
                  
                  {currentStep < performancePlanSteps.length ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <span>Next →</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                    >
                      <span>{isSubmitting ? 'Submitting...' : '✓ Create Plan'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">S</span>
              </div>
              <span>SAYWHAT Human Resource Management System</span>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}

export default function CreatePerformancePlanPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CreatePerformancePlanPageContent />
    </Suspense>
  )
}
