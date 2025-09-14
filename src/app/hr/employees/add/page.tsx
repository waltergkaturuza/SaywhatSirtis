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
      <div className="max-w-none px-2 w-full min-h-screen bg-gradient-to-br from-saywhat-white to-saywhat-grey/10">
        {/* Navigation Header */}
        <div className="mb-8 bg-gradient-to-r from-saywhat-black via-saywhat-dark to-saywhat-grey text-saywhat-white p-6 rounded-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-saywhat-orange/10 to-saywhat-red/5"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/hr/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-saywhat-orange/20 hover:bg-saywhat-orange/30 rounded-lg border border-saywhat-orange/30 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 text-saywhat-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-saywhat-white font-medium">Home</span>
              </button>
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-4 py-2 bg-saywhat-red/20 hover:bg-saywhat-red/30 rounded-lg border border-saywhat-red/30 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 text-saywhat-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-saywhat-white font-medium">Back</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-saywhat-orange to-saywhat-red rounded-xl flex items-center justify-center shadow-lg">
                <UserIcon className="w-7 h-7 text-saywhat-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-saywhat-orange to-saywhat-red bg-clip-text text-transparent">
                  Add New Employee
                </h1>
                <p className="text-saywhat-grey/80 text-sm font-medium">SAYWHAT Human Resource Management System</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-gradient-to-r from-saywhat-white to-saywhat-grey/5 p-6 rounded-xl shadow-lg border border-saywhat-grey/20">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className="relative flex-1">
                  <div className="flex items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-lg transition-all duration-300 ${
                        currentStep >= step.id
                          ? "border-saywhat-orange bg-gradient-to-br from-saywhat-orange to-saywhat-red text-saywhat-white shadow-saywhat-orange/30"
                          : currentStep === step.id
                          ? "border-saywhat-green bg-gradient-to-br from-saywhat-green to-emerald-500 text-saywhat-white shadow-saywhat-green/30 animate-pulse"
                          : "border-saywhat-grey/50 bg-saywhat-white text-saywhat-grey/60"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div
                        className={`absolute top-6 left-12 w-full h-1 rounded-full transition-all duration-500 ${
                          currentStep > step.id 
                            ? "bg-gradient-to-r from-saywhat-orange to-saywhat-red shadow-lg" 
                            : currentStep === step.id
                            ? "bg-gradient-to-r from-saywhat-green to-emerald-500 shadow-lg"
                            : "bg-saywhat-grey/30"
                        }`}
                      />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <span
                      className={`text-sm font-bold block transition-all duration-300 ${
                        currentStep >= step.id 
                          ? "text-saywhat-orange" 
                          : currentStep === step.id
                          ? "text-saywhat-green"
                          : "text-saywhat-grey"
                      }`}
                    >
                      {step.name}
                    </span>
                    {currentStep === step.id && (
                      <span className="text-xs text-saywhat-green font-medium">Current</span>
                    )}
                    {currentStep > step.id && (
                      <span className="text-xs text-saywhat-orange font-medium">Completed</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-saywhat-white to-saywhat-grey/5 shadow-2xl rounded-xl border-2 border-saywhat-grey/20 overflow-hidden">
          <div className="px-8 py-10">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="flex items-center space-x-4 mb-8 p-4 bg-gradient-to-r from-saywhat-orange/10 to-saywhat-red/5 rounded-xl border-l-4 border-saywhat-orange">
                  <div className="w-12 h-12 bg-gradient-to-br from-saywhat-orange to-saywhat-red rounded-xl flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-saywhat-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-saywhat-black">Personal Information</h2>
                    <p className="text-saywhat-grey text-sm">Employee's basic personal details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-saywhat-black mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-saywhat-black mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange("middleName", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-saywhat-black mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-saywhat-black mb-2 flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-saywhat-orange" />
                      <span>Date of Birth</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-saywhat-black mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-saywhat-black mb-2 flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-saywhat-green" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-saywhat-black mb-2 flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-saywhat-red" />
                      <span>Work Email *</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-saywhat-black mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md resize-none"
                    placeholder="Enter full address"
                  />
                </div>

                <div className="border-t-2 border-saywhat-red/20 pt-8">
                  <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-saywhat-red/10 to-saywhat-orange/5 rounded-xl border-l-4 border-saywhat-red">
                    <div className="w-10 h-10 bg-gradient-to-br from-saywhat-red to-saywhat-orange rounded-xl flex items-center justify-center shadow-lg">
                      <PhoneIcon className="w-5 h-5 text-saywhat-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-saywhat-black">Emergency Contact</h3>
                      <p className="text-saywhat-grey text-sm">Contact person in case of emergency</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-saywhat-black mb-2">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-saywhat-black mb-2">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-saywhat-black mb-2">
                        Relationship
                      </label>
                      <select
                        value={formData.emergencyContactRelationship}
                        onChange={(e) => handleInputChange("emergencyContactRelationship", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
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
              <div className="space-y-8">
                <div className="flex items-center space-x-4 mb-8 p-4 bg-gradient-to-r from-saywhat-green/10 to-saywhat-orange/5 rounded-xl border-l-4 border-saywhat-green">
                  <div className="w-12 h-12 bg-gradient-to-br from-saywhat-green to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BuildingOfficeIcon className="w-6 h-6 text-saywhat-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-saywhat-black">Employment Information</h2>
                    <p className="text-saywhat-grey text-sm">Job details and department assignment</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-saywhat-black mb-2 flex items-center space-x-2">
                      <IdentificationIcon className="w-4 h-4 text-saywhat-orange" />
                      <span>Employee ID *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange("employeeId", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-saywhat-black mb-2 flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-saywhat-green" />
                      <span>Department *</span>
                    </label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => {
                        const selectedDept = departments.find(d => d.id === e.target.value)
                        handleInputChange("departmentId", e.target.value)
                        handleInputChange("department", selectedDept?.name || "")
                      }}
                      className="w-full px-4 py-3 border-2 border-saywhat-grey/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-300 bg-saywhat-white shadow-sm hover:shadow-md"
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

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position/Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Supervisor</option>
                      {supervisors.map((supervisor) => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.firstName} {supervisor.lastName} - {supervisor.position}
                        </option>
                      ))}
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
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isReviewer" className="text-sm font-medium text-gray-700">
                      This employee can conduct performance reviews
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type *
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => handleInputChange("employmentType", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Location</option>
                      <option value="head-office">Head Office</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="field-office">Field Office</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Compensation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Compensation Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Salary *
                    </label>
                    <input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => handleInputChange("baseSalary", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter base salary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange("currency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pay Grade
                    </label>
                    <select
                      value={formData.payGrade}
                      onChange={(e) => handleInputChange("payGrade", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Pay Grade</option>
                      <option value="PO6" className="text-orange-600 font-semibold">PO6 (Highest)</option>
                      <option value="PO4" className="text-orange-500">PO4</option>
                      <option value="PO3" className="text-green-600">PO3</option>
                      <option value="PO2" className="text-green-500">PO2</option>
                      <option value="PO1" className="text-black">PO1</option>
                      <option value="SO2" className="text-gray-700">SO2</option>
                      <option value="SO1" className="text-gray-600">SO1</option>
                      <option value="Scale 5" className="text-gray-500">Scale 5</option>
                      <option value="Scale 4" className="text-gray-400">Scale 4</option>
                      <option value="M1/M2" className="text-gray-300">M1/M2 (Lowest)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pay Frequency
                    </label>
                    <select
                      value={formData.payFrequency}
                      onChange={(e) => handleInputChange("payFrequency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="weekly">Weekly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Additional Benefits</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {["Health Insurance", "Dental Coverage", "Vision Coverage", "Retirement Plan", "Life Insurance", "Flexible PTO"].map((benefit) => (
                      <label key={benefit} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.benefits.includes(benefit)}
                          onChange={(e) => {
                            const currentBenefits = formData.benefits;
                            if (e.target.checked) {
                              handleInputChange("benefits", [...currentBenefits, benefit]);
                            } else {
                              handleInputChange("benefits", currentBenefits.filter(b => b !== benefit));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{benefit}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Specific Benefits</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.medicalAid}
                        onChange={(e) => handleInputChange("medicalAid", e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Medical Aid</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.funeralCover}
                        onChange={(e) => handleInputChange("funeralCover", e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Funeral Cover</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.vehicleBenefit}
                        onChange={(e) => handleInputChange("vehicleBenefit", e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Vehicle Benefit</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.fuelAllowance}
                        onChange={(e) => handleInputChange("fuelAllowance", e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Fuel Allowance</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.airtimeAllowance}
                        onChange={(e) => handleInputChange("airtimeAllowance", e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Airtime Allowance</span>
                    </label>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Benefits (comma-separated)
                    </label>
                    <textarea
                      value={formData.otherBenefits.join(", ")}
                      onChange={(e) => handleInputChange("otherBenefits", e.target.value.split(", ").filter(benefit => benefit.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                      placeholder="e.g., Housing Allowance, Transport Subsidy, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Education */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Education & Skills</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Highest Education Level
                    </label>
                    <select
                      value={formData.education}
                      onChange={(e) => handleInputChange("education", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Education Level</option>
                      <option value="high-school">High School</option>
                      <option value="associate">Associate Degree</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD/Doctorate</option>
                      <option value="professional">Professional Certification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills (comma-separated)
                    </label>
                    <textarea
                      value={formData.skills.join(", ")}
                      onChange={(e) => handleInputChange("skills", e.target.value.split(", ").filter(skill => skill.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="e.g., JavaScript, Project Management, Data Analysis"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certifications (comma-separated)
                    </label>
                    <textarea
                      value={formData.certifications.join(", ")}
                      onChange={(e) => handleInputChange("certifications", e.target.value.split(", ").filter(cert => cert.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="e.g., PMP, AWS Certified, Google Analytics"
                    />
                  </div>

                  <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-green-900 mb-2">Training Requirements</h3>
                    <div className="space-y-2">
                      {["Orientation Training", "Security Training", "Department-specific Training"].map((training) => (
                        <label key={training} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.trainingRequired.includes(training)}
                            onChange={(e) => {
                              const currentTraining = formData.trainingRequired;
                              if (e.target.checked) {
                                handleInputChange("trainingRequired", [...currentTraining, training]);
                              } else {
                                handleInputChange("trainingRequired", currentTraining.filter(t => t !== training));
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-green-800">{training} Required</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Access & Security */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 mr-2 text-indigo-600" />
                  Access & Security
                </h2>
                
                <div className="space-y-8">
                  {/* Department Information Display */}
                  {formData.departmentId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-900">Department Assignment</h4>
                      </div>
                      <p className="text-blue-800 text-sm">
                        Selected Department: <span className="font-semibold">{formData.department}</span>
                      </p>
                      <p className="text-blue-700 text-xs mt-1">
                        Default role will be automatically assigned based on department structure.
                      </p>
                    </div>
                  )}

                  {/* Role Assignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      User Role & Access Level *
                    </label>
                    <div className="space-y-3">
                      {Object.values(UserRole).map((role) => {
                        const permissions = ROLE_DEFINITIONS[role];
                        const isRecommended = formData.departmentId && 
                          (() => {
                            const selectedDept = departments.find(d => d.id === formData.departmentId);
                            if (!selectedDept) return false;
                            
                            const deptName = selectedDept.name.toLowerCase();
                            let departmentKey: Department;
                            
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
                            } else {
                              departmentKey = Department.PROGRAMS;
                            }
                            
                            return getDefaultRoleForDepartment(departmentKey) === role;
                          })();
                        
                        return (
                          <div key={role} className={`border rounded-lg p-4 ${formData.userRole === role ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'} ${isRecommended ? 'ring-2 ring-green-200' : ''}`}>
                            <label className="flex items-start cursor-pointer">
                              <input
                                type="radio"
                                name="userRole"
                                value={role}
                                checked={formData.userRole === role}
                                onChange={(e) => handleInputChange("userRole", e.target.value as UserRole)}
                                className="mt-1 mr-3 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900">
                                    {getRoleDisplayName(role)}
                                  </span>
                                  {isRecommended && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                      Recommended for {formData.department}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                    <div className={`text-xs px-2 py-1 rounded ${permissions.callCenter === 'full' ? 'bg-green-100 text-green-800' : permissions.callCenter === 'edit' ? 'bg-yellow-100 text-yellow-800' : permissions.callCenter === 'view' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                      Call Center: {permissions.callCenter}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded ${permissions.programs === 'full' ? 'bg-green-100 text-green-800' : permissions.programs === 'edit' ? 'bg-yellow-100 text-yellow-800' : permissions.programs === 'view' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                      Programs: {permissions.programs}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded ${permissions.hr === 'full' ? 'bg-green-100 text-green-800' : permissions.hr === 'edit' ? 'bg-yellow-100 text-yellow-800' : permissions.hr === 'view' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                      HR: {permissions.hr}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded ${permissions.documents === 'full' ? 'bg-green-100 text-green-800' : permissions.documents === 'edit' ? 'bg-yellow-100 text-yellow-800' : permissions.documents === 'view' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                      Documents: {permissions.documents}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Department Structure Information */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-600" />
                      SAYWHAT Department Structure
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Main Departments:</h5>
                        <ul className="space-y-1">
                          <li>• Executive Directors Office</li>
                          <li className="ml-4 text-gray-600">→ Subunit: Research and Development</li>
                          <li>• Human Resource Management</li>
                          <li>• Finance and Administration</li>
                        </ul>
                      </div>
                      <div>
                        <ul className="space-y-1">
                          <li>• Programs</li>
                          <li className="ml-4 text-gray-600">→ Subunits: MEAL and Call Center</li>
                          <li>• Grants and Compliance</li>
                          <li>• Communications and Advocacy</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Security Clearance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Security Clearance Level *
                    </label>
                    <select
                      value={formData.securityClearance}
                      onChange={(e) => handleInputChange("securityClearance", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="public">Public (Public documents only)</option>
                      <option value="confidential">Confidential (Public + Confidential)</option>
                      <option value="secret">Secret (Public + Confidential + Secret)</option>
                      <option value="top_secret">Top Secret (All document levels)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Determines the highest level of classified documents this user can access.
                    </p>
                  </div>

                  {/* System Access based on Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Module Access (Based on Role)
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      {formData.userRole && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-800">
                            Access granted for {getRoleDisplayName(formData.userRole)}:
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(ROLE_DEFINITIONS[formData.userRole]).map(([module, access]) => {
                              if (typeof access !== 'string' || ['documentLevel', 'canViewOthersProfiles', 'canManageUsers', 'fullAccess'].includes(module)) return null;
                              
                              const getAccessIcon = (level: string) => {
                                switch (level) {
                                  case 'full': return '🟢';
                                  case 'edit': return '🟡';
                                  case 'view': return '🔵';
                                  case 'none': return '🔴';
                                  default: return '⚪';
                                }
                              };
                              
                              return (
                                <div key={module} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="text-sm capitalize">
                                    {module.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </span>
                                  <span className="text-sm font-medium flex items-center">
                                    {getAccessIcon(access)} {access}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Setup Tasks */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-900 mb-3 flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      Required Security Setup Tasks
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-yellow-800">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Badge/ID card creation required
                      </div>
                      <div className="flex items-center text-sm text-yellow-800">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        System accounts to be provisioned
                      </div>
                      <div className="flex items-center text-sm text-yellow-800">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Access permissions to be configured automatically
                      </div>
                      <div className="flex items-center text-sm text-yellow-800">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Security training to be scheduled
                      </div>
                      <div className="flex items-center text-sm text-yellow-800">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Department-based role assignment will be applied
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Documents */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents & Onboarding</h2>
                
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-green-900 mb-3">Required Documents Checklist</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.contractSigned}
                          onChange={(e) => handleInputChange("contractSigned", e.target.checked)}
                          className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-green-800">Employment Contract Signed</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.backgroundCheckCompleted}
                          onChange={(e) => handleInputChange("backgroundCheckCompleted", e.target.checked)}
                          className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-green-800">Background Check Completed</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.medicalCheckCompleted}
                          onChange={(e) => handleInputChange("medicalCheckCompleted", e.target.checked)}
                          className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-green-800">Medical Check Completed</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.trainingCompleted}
                          onChange={(e) => handleInputChange("trainingCompleted", e.target.checked)}
                          className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-green-800">Initial Training Completed</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">HR Documents</h3>
                      <ul className="text-sm text-gray-800 space-y-1">
                        <li>• Employee handbook acknowledgment</li>
                        <li>• Code of conduct agreement</li>
                        <li>• Emergency contact forms</li>
                        <li>• Tax and payroll forms</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-purple-900 mb-2">IT Setup</h3>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Equipment assignment</li>
                        <li>• Software license allocation</li>
                        <li>• Email account creation</li>
                        <li>• Network access setup</li>
                      </ul>
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <DocumentPlusIcon className="h-5 w-5 mr-2 text-orange-500" />
                        Document Upload & Repository
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formData.uploadedDocuments.length} documents uploaded
                      </span>
                    </div>

                    {/* File Upload Area */}
                    <div className="mb-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Employee Documents</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Drag and drop files here, or click to select files
                        </p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            const newDocs = files.map(file => ({
                              id: Date.now() + Math.random().toString(),
                              name: file.name,
                              type: file.type,
                              size: file.size,
                              uploadDate: new Date().toISOString(),
                              category: 'general'
                            }))
                            handleInputChange('uploadedDocuments', [...formData.uploadedDocuments, ...newDocs])
                          }}
                          className="hidden"
                          id="document-upload"
                        />
                        <label
                          htmlFor="document-upload"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 cursor-pointer"
                        >
                          <DocumentPlusIcon className="h-4 w-4 mr-2" />
                          Choose Files
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)
                        </p>
                      </div>
                    </div>

                    {/* Document Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      {['Personal', 'Employment', 'Medical', 'Training'].map((category) => (
                        <div key={category} className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">{category} Documents</h4>
                          <div className="text-xs text-gray-600">
                            {formData.uploadedDocuments.filter(doc => doc.category === category.toLowerCase()).length} files
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Document Search */}
                    <div className="mb-4">
                      <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search documents..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Uploaded Documents List */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Uploaded Documents</h4>
                      {formData.uploadedDocuments.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No documents uploaded yet</p>
                      ) : (
                        <div className="max-h-40 overflow-y-auto">
                          {formData.uploadedDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-3">
                                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <select
                                  value={doc.category}
                                  onChange={(e) => {
                                    const updatedDocs = formData.uploadedDocuments.map(d => 
                                      d.id === doc.id ? { ...d, category: e.target.value } : d
                                    )
                                    handleInputChange('uploadedDocuments', updatedDocs)
                                  }}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="general">General</option>
                                  <option value="personal">Personal</option>
                                  <option value="employment">Employment</option>
                                  <option value="medical">Medical</option>
                                  <option value="training">Training</option>
                                </select>
                                <button
                                  onClick={() => {
                                    const updatedDocs = formData.uploadedDocuments.filter(d => d.id !== doc.id)
                                    handleInputChange('uploadedDocuments', updatedDocs)
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h3>
                    <textarea
                      value={formData.additionalNotes}
                      onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Any additional notes or special requirements for this employee..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex justify-between items-center">
                <div>
                  {currentStep > 1 && (
                    <button
                      onClick={handlePrevious}
                      className="flex items-center space-x-2 px-6 py-3 text-sm font-bold text-saywhat-grey bg-saywhat-white border-2 border-saywhat-grey/30 rounded-lg hover:bg-saywhat-grey/10 hover:border-saywhat-grey transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => router.push("/hr/employees")}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-bold text-saywhat-red bg-saywhat-white border-2 border-saywhat-red/30 rounded-lg hover:bg-saywhat-red hover:text-saywhat-white transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel</span>
                  </button>
                  
                  {currentStep === totalSteps ? (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center space-x-2 px-8 py-3 text-sm font-bold text-saywhat-white bg-gradient-to-r from-saywhat-green to-emerald-600 border border-transparent rounded-lg hover:from-emerald-600 hover:to-saywhat-green transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Create Employee</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center space-x-2 px-8 py-3 text-sm font-bold text-saywhat-white bg-gradient-to-r from-saywhat-orange to-saywhat-red border border-transparent rounded-lg hover:from-saywhat-red hover:to-saywhat-orange transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gradient-to-r from-saywhat-black via-saywhat-dark to-saywhat-grey text-saywhat-white p-4 rounded-b-xl border-t-2 border-saywhat-grey/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-saywhat-orange to-saywhat-red rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-saywhat-white">S</span>
                </div>
                <span className="text-sm font-medium text-saywhat-grey/80">
                  SAYWHAT Human Resource Management System
                </span>
              </div>
              <div className="text-sm text-saywhat-grey/60">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </EnhancedLayout>
  )
}
