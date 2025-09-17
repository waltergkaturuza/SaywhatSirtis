"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EnhancedLayout } from "@/components/layout/enhanced-layout"
import {
  UserIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  BanknotesIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  DocumentPlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { UserRole, Department, getDefaultRoleForDepartment, getRoleDisplayName, ROLE_DEFINITIONS } from "@/types/roles"

interface EmployeeFormData {
  // Personal Information
  firstName: string
  lastName: string
  middleName: string
  dateOfBirth: string
  gender: string
  maritalStatus: string
  phoneNumber: string
  email: string
  personalEmail: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  
  // Employment Information
  employeeId: string
  department: string
  departmentId: string
  position: string
  supervisorId: string
  startDate: string
  employmentType: string
  workLocation: string
  isSupervisor: boolean
  isReviewer: boolean
  
  // Compensation
  baseSalary: string
  currency: string
  payGrade: string
  payFrequency: string
  benefits: string[]
  
  // Additional Benefits
  medicalAid: boolean
  funeralCover: boolean
  vehicleBenefit: boolean
  fuelAllowance: boolean
  airtimeAllowance: boolean
  otherBenefits: string[]
  
  // Education & Skills
  education: string
  skills: string[]
  certifications: string[]
  trainingRequired: string[]
  
  // Access & Security
  accessLevel: string
  userRole: UserRole
  systemAccess: string[]
  securityClearance: string
  
  // Documents
  contractSigned: boolean
  backgroundCheckCompleted: boolean
  medicalCheckCompleted: boolean
  trainingCompleted: boolean
  additionalNotes: string
  uploadedDocuments: Array<{
    id: string
    name: string
    type: string
    size: number
    uploadDate: string
    category: string
  }>
}

export default function AddEmployeePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  

  const [currentStep, setCurrentStep] = useState(1)
  const [departments, setDepartments] = useState<Array<{
    id: string
    name: string
    code?: string
    level: number
    parentId?: string
  }>>([])
  const [supervisors, setSupervisors] = useState<Array<{
    id: string
    firstName: string
    lastName: string
    position: string
    department: string
  }>>([])
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    phoneNumber: "",
    email: "",
    personalEmail: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    employeeId: "",
    department: "",
    departmentId: "",
    position: "",
    supervisorId: "",
    startDate: "",
    employmentType: "",
    workLocation: "",
    isSupervisor: false,
    isReviewer: false,
    baseSalary: "",
    currency: "USD",
    payGrade: "",
    payFrequency: "monthly",
    benefits: [],
    medicalAid: false,
    funeralCover: false,
    vehicleBenefit: false,
    fuelAllowance: false,
    airtimeAllowance: false,
    otherBenefits: [],
    education: "",
    skills: [],
    certifications: [],
    trainingRequired: [],
    accessLevel: "basic",
    userRole: UserRole.BASIC_USER_1,
    systemAccess: [],
    securityClearance: "none",
    contractSigned: false,
    backgroundCheckCompleted: false,
    medicalCheckCompleted: false,
    trainingCompleted: false,
    additionalNotes: "",
    uploadedDocuments: []
  })

  const totalSteps = 6

  // Fetch departments including subunits
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/department/list')
      const result = await response.json()
      if (result.success) {
        setDepartments(result.data || [])
      } else {
        console.error('Failed to fetch departments:', result.error)
        setDepartments([]) // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([]) // Set empty array on network error
    }
  }

  // Fetch supervisors
  const fetchSupervisors = async () => {
    try {
      const response = await fetch('/api/hr/employees/supervisors')
      const result = await response.json()
      if (result.success) {
        setSupervisors(result.data || [])
      } else {
        console.error('Failed to fetch supervisors:', result.error)
        setSupervisors([])
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error)
      setSupervisors([])
    }
  }

  // Helper function to sort departments hierarchically
  const sortDepartmentsHierarchically = (departments: any[]) => {
    const mainDepts = departments.filter(dept => !dept.parentId).sort((a, b) => a.name.localeCompare(b.name))
    const result: any[] = []
    
    const addDepartmentWithSubunits = (dept: any) => {
      result.push(dept)
      const subunits = departments
        .filter(sub => sub.parentId === dept.id)
        .sort((a, b) => a.name.localeCompare(b.name))
      subunits.forEach(addDepartmentWithSubunits)
    }
    
    mainDepts.forEach(addDepartmentWithSubunits)
    return result
  }

  useEffect(() => {
    setMounted(true)
    fetchDepartments()
    fetchSupervisors()
  }, [])

  // Update role when department changes
  useEffect(() => {
    if (formData.departmentId && departments.length > 0) {
      const selectedDept = departments.find(d => d.id === formData.departmentId)
      if (selectedDept) {
        // Map department names to our Department enum
        let departmentKey: Department;
        const deptName = selectedDept.name.toLowerCase();
        
        if (deptName.includes('executive') && deptName.includes('director')) {
          departmentKey = Department.EXECUTIVE_DIRECTORS_OFFICE;
        } else if (deptName.includes('human') && deptName.includes('resource')) {
          departmentKey = Department.HUMAN_RESOURCE_MANAGEMENT;
        } else if (deptName.includes('finance') && deptName.includes('administration')) {
          departmentKey = Department.FINANCE_AND_ADMINISTRATION;
        } else if (deptName.includes('program')) {
          departmentKey = Department.PROGRAMS;
        } else if (deptName.includes('grant') && deptName.includes('compliance')) {
          departmentKey = Department.GRANTS_AND_COMPLIANCE;
        } else if (deptName.includes('communication') && deptName.includes('advocacy')) {
          departmentKey = Department.COMMUNICATIONS_AND_ADVOCACY;
        } else if (deptName.includes('call') || deptName.includes('center')) {
          departmentKey = Department.CALL_CENTER;
        } else if (deptName.includes('hr') || deptName.includes('human')) {
          departmentKey = Department.HR;
        } else if (deptName.includes('finance')) {
          departmentKey = Department.FINANCE;
        } else {
          departmentKey = Department.PROGRAMS; // Default fallback
        }
        
        const defaultRole = getDefaultRoleForDepartment(departmentKey);
        handleInputChange('userRole', defaultRole);
      }
    }
  }, [formData.departmentId, departments])

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      console.log("Submitting employee data:", formData)
      
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData })
      })

      const result = await response.json()

      if (response.ok) {
        // Success - show success message and redirect
        router.push("/hr/employees")
      } else {
        // Handle different error types
        if (response.status === 401) {
          alert('Authentication required. Please log in to create employees. Visit /auth/signin to authenticate.')
        } else {
          alert(result.error || result.message || 'Failed to create employee')
        }
      }
    } catch (error) {
      console.error("Error creating employee:", error)
      alert('An error occurred while creating the employee. Please try again.')
    }
  }

  const steps = [
    { id: 1, name: "Personal Info", icon: UserIcon },
    { id: 2, name: "Employment", icon: DocumentTextIcon },
    { id: 3, name: "Compensation", icon: BanknotesIcon },
    { id: 4, name: "Education", icon: AcademicCapIcon },
    { id: 5, name: "Access & Security", icon: ShieldCheckIcon },
    { id: 6, name: "Documents", icon: DocumentTextIcon }
  ]

  if (!mounted) {
    return null
  }

  return (
    <EnhancedLayout>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  step.id < currentStep
                    ? 'bg-green-600 border-green-600 text-white'
                  : step.id === currentStep 
                    ? 'bg-orange-600 border-orange-600 text-white' 
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
                    step.id < currentStep ? 'text-green-600' : step.id === currentStep ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {step.id === 1 && "Employee's basic personal details"}
                    {step.id === 2 && "Job role and department information"}
                    {step.id === 3 && "Salary and benefits details"}
                    {step.id === 4 && "Educational background and skills"}
                    {step.id === 5 && "System access and permissions"}
                    {step.id === 6 && "Required documents and contracts"}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-orange-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep - 1].name}</h2>
            <p className="text-gray-600">
              {currentStep === 1 && "Employee's basic personal details"}
              {currentStep === 2 && "Job role and department information"}
              {currentStep === 3 && "Salary and benefits details"}
              {currentStep === 4 && "Educational background and skills"}
              {currentStep === 5 && "System access and permissions"}
              {currentStep === 6 && "Required documents and contracts"}
            </p>
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-900">Personal Information</h3>
                </div>
                <p className="text-orange-700 text-sm mt-1">Employee's basic personal details</p>
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <CalendarIcon className="w-4 h-4 text-orange-600 mr-1" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <PhoneIcon className="w-4 h-4 text-green-600 mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <EnvelopeIcon className="w-4 h-4 text-orange-600 mr-1" />
                    Work Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Email
                  </label>
                  <input
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter full address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship
                    </label>
                    <select
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => handleInputChange("emergencyContactRelationship", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employment Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-900">Employment Information</h3>
                </div>
                <p className="text-orange-700 text-sm mt-1">Job details and department assignment</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"  
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange("employeeId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter employee ID"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => {
                      const selectedDept = departments.find(d => d.id === e.target.value)
                      handleInputChange("departmentId", e.target.value)
                      handleInputChange("department", selectedDept?.name || "")
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {sortDepartmentsHierarchically(departments).map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {'  '.repeat(dept.level)}{dept.name}
                        {dept.code && ` (${dept.code})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position/Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor
                  </label>
                  <select
                    value={formData.supervisorId}
                    onChange={(e) => handleInputChange("supervisorId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Supervisor</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.firstName} {supervisor.lastName} - {supervisor.position}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => handleInputChange("employmentType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                    <option value="consultant">Consultant</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Location
                  </label>
                  <select
                    value={formData.workLocation}
                    onChange={(e) => handleInputChange("workLocation", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Location</option>
                    <option value="head-office">Head Office</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="field-office">Field Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isSupervisor"
                    checked={formData.isSupervisor}
                    onChange={(e) => handleInputChange("isSupervisor", e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isSupervisor" className="text-sm font-medium text-gray-700">
                    This employee is a supervisor
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isReviewer"
                    checked={formData.isReviewer}
                    onChange={(e) => handleInputChange("isReviewer", e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isReviewer" className="text-sm font-medium text-gray-700">
                    This employee can conduct performance reviews
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Compensation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                <div className="flex items-center">
                  <BanknotesIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-900">Compensation & Benefits</h3>
                </div>
                <p className="text-orange-700 text-sm mt-1">Salary and benefits details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Salary *
                  </label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => handleInputChange("baseSalary", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter base salary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Select Currency</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Grade
                  </label>
                  <select
                    value={formData.payGrade}
                    onChange={(e) => handleInputChange("payGrade", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Pay Grade</option>
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                    <option value="Level 4">Level 4</option>
                    <option value="Level 5">Level 5</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Frequency *
                  </label>
                  <select
                    value={formData.payFrequency}
                    onChange={(e) => handleInputChange("payFrequency", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Select Pay Frequency</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Benefits Package
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Life Insurance', 
                    'Retirement Plan', 'Paid Time Off', 'Sick Leave', 'Maternity/Paternity Leave'].map((benefit) => (
                    <div key={benefit} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={benefit}
                        checked={formData.benefits.includes(benefit)}
                        onChange={(e) => {
                          const currentBenefits = formData.benefits;
                          if (e.target.checked) {
                            handleInputChange("benefits", [...currentBenefits, benefit]);
                          } else {
                            handleInputChange("benefits", currentBenefits.filter(b => b !== benefit));
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <label htmlFor={benefit} className="text-sm text-gray-700">{benefit}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Education & Skills */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                <div className="flex items-center">
                  <AcademicCapIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-900">Education & Skills</h3>
                </div>
                <p className="text-orange-700 text-sm mt-1">Educational background and skills</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highest Education Level
                </label>
                <select
                  value={formData.education}
                  onChange={(e) => handleInputChange("education", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <textarea
                  value={formData.skills.join(", ")}
                  onChange={(e) => handleInputChange("skills", e.target.value.split(", ").filter(skill => skill.trim()))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                  placeholder="Enter skills separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications (comma-separated)
                </label>
                <textarea
                  value={formData.certifications.join(", ")}
                  onChange={(e) => handleInputChange("certifications", e.target.value.split(", ").filter(cert => cert.trim()))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                  placeholder="Enter certifications separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Required Training
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Safety Training', 'Data Privacy Training', 'Compliance Training', 
                    'Leadership Training', 'Technical Certification', 'Customer Service Training'].map((training) => (
                    <div key={training} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={training}
                        checked={formData.trainingRequired.includes(training)}
                        onChange={(e) => {
                          const currentTraining = formData.trainingRequired;
                          if (e.target.checked) {
                            handleInputChange("trainingRequired", [...currentTraining, training]);
                          } else {
                            handleInputChange("trainingRequired", currentTraining.filter(t => t !== training));
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <label htmlFor={training} className="text-sm text-gray-700">{training}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Access & Security */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-900">Access & Security</h3>
                </div>
                <p className="text-orange-700 text-sm mt-1">System access and permissions</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level
                  </label>
                  <select
                    value={formData.accessLevel}
                    onChange={(e) => handleInputChange("accessLevel", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Access Level</option>
                    <option value="Basic">Basic User</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Clearance
                  </label>
                  <select
                    value={formData.securityClearance}
                    onChange={(e) => handleInputChange("securityClearance", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Clearance Level</option>
                    <option value="none">None Required</option>
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  System Access Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['HR Management', 'Employee Records', 'Payroll', 'Reports', 
                    'Performance Management', 'Training Records'].map((access) => (
                    <div key={access} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={access}
                        checked={formData.systemAccess.includes(access)}
                        onChange={(e) => {
                          const currentAccess = formData.systemAccess;
                          if (e.target.checked) {
                            handleInputChange("systemAccess", [...currentAccess, access]);
                          } else {
                            handleInputChange("systemAccess", currentAccess.filter(a => a !== access));
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <label htmlFor={access} className="text-sm text-gray-700">{access}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Documents */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-900">Documents & Contracts</h3>
                </div>
                <p className="text-orange-700 text-sm mt-1">Required documents and contracts</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Contract
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">Upload employment contract</p>
                    <input type="file" className="mt-2" accept=".pdf,.doc,.docx" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">Upload additional documents (ID, certificates, etc.)</p>
                    <input type="file" className="mt-2" accept=".pdf,.doc,.docx,.jpg,.png" multiple />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Document Checklist</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="contractSigned"
                      checked={formData.contractSigned}
                      onChange={(e) => handleInputChange("contractSigned", e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="contractSigned" className="text-sm text-gray-700">Contract Signed</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="backgroundCheckCompleted"
                      checked={formData.backgroundCheckCompleted}
                      onChange={(e) => handleInputChange("backgroundCheckCompleted", e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="backgroundCheckCompleted" className="text-sm text-gray-700">Background Check Completed</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="medicalCheckCompleted"
                      checked={formData.medicalCheckCompleted}
                      onChange={(e) => handleInputChange("medicalCheckCompleted", e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="medicalCheckCompleted" className="text-sm text-gray-700">Medical Check Completed</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="trainingCompleted"
                      checked={formData.trainingCompleted}
                      onChange={(e) => handleInputChange("trainingCompleted", e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="trainingCompleted" className="text-sm text-gray-700">Initial Training Completed</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={4}
                  placeholder="Enter any additional notes or comments about this employee"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}
            
            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Employee
              </button>
            )}
          </div>
        </div>
      </div>
    </EnhancedLayout>
  )
}