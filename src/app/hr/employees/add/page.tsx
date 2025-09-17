"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EnhancedLayout } from "@/components/layout/enhanced-layout"
import {
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  BanknotesIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline"

interface RolePermissions {
  callCenter: 'none' | 'view' | 'edit' | 'full'
  programs: 'none' | 'view' | 'edit' | 'full'
  hr: 'none' | 'view' | 'edit' | 'full'
  documents: 'none' | 'view' | 'edit' | 'full'
  inventory: 'none' | 'view' | 'edit' | 'full'
  risks: 'none' | 'view' | 'edit' | 'full'
  dashboard: 'none' | 'view' | 'edit' | 'full'
  personalProfile: 'none' | 'view' | 'edit' | 'full'
}

interface SystemRole {
  id: string
  name: string
  value: string
  permissions: RolePermissions
  documentLevel: 'PUBLIC' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET'
  canViewOthersProfiles: boolean
  canManageUsers: boolean
  fullAccess: boolean
  description: string
}

interface EmployeeFormData {
  // Personal Information
  firstName: string
  lastName: string
  middleName: string
  dateOfBirth: string
  gender: string
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
  reviewerId: string
  startDate: string
  employmentType: string
  workLocation: string
  country: string
  province: string
  isSupervisor: boolean
  isReviewer: boolean

  // Compensation
  baseSalary: string
  currency: string
  payGrade: string
  payFrequency: string

  // Additional Benefits
  healthInsurance: boolean
  dentalCoverage: boolean
  visionCoverage: boolean
  lifeInsurance: boolean
  retirementPlan: boolean
  flexiblePTO: boolean
  medicalAid: boolean
  funeralCover: boolean
  vehicleBenefit: boolean
  fuelAllowance: boolean
  airtimeAllowance: boolean
  otherBenefits: string

  // Education & Skills
  education: string
  skills: string
  certifications: string
  orientationTrainingRequired: boolean
  securityTrainingRequired: boolean
  departmentSpecificTrainingRequired: boolean

  // Access & Security
  accessLevel: string
  userRole: string
  systemAccess: string[]
  documentSecurityClearance: string

  // Job Description
  jobDescription: {
    jobTitle: string
    location: string
    jobSummary: string
    keyResponsibilities: Array<{
      description: string
      weight: number
      tasks: string
    }>
    essentialExperience: string
    essentialSkills: string
    acknowledgment: boolean
    signatureFile: File | null
  }

  // Documents
  contractSigned: boolean
  backgroundCheckCompleted: boolean
  medicalCheckCompleted: boolean
  initialTrainingCompleted: boolean
  additionalNotes: string
}

export default function AddEmployeePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1)
  const [departments, setDepartments] = useState<Array<{
    id: string
    name: string
    code?: string
    level: number
    parentId?: string
  }>>([])
  const [supervisors, setSupervisors] = useState<Array<{
    id: string
    name: string
    position: string
    department: string
    subordinateCount: number
  }>>([])
  const [reviewers, setReviewers] = useState<Array<{
    id: string
    name: string
    position: string
    department: string
    reviewCount: number
    isHR: boolean
    isSupervisor: boolean
  }>>([])
  const [countries, setCountries] = useState<Array<{
    code: string
    name: string
    provinces: number
  }>>([])
  const [provinces, setProvinces] = useState<Array<{
    id: string
    name: string
    code: string
  }>>([])
  const [roles, setRoles] = useState<SystemRole[]>([])
  const [loading, setLoading] = useState({
    departments: false,
    supervisors: false,
    reviewers: false,
    countries: false,
    provinces: false,
    roles: false
  })
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",
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
    reviewerId: "",
    startDate: "",
    employmentType: "",
    workLocation: "",
    country: "",
    province: "",
    isSupervisor: false,
    isReviewer: false,
    baseSalary: "",
    currency: "USD",
    payGrade: "",
    payFrequency: "monthly",
    
    // Additional Benefits
    healthInsurance: false,
    dentalCoverage: false,
    visionCoverage: false,
    lifeInsurance: false,
    retirementPlan: false,
    flexiblePTO: false,
    medicalAid: false,
    funeralCover: false,
    vehicleBenefit: false,
    fuelAllowance: false,
    airtimeAllowance: false,
    otherBenefits: "",
    
    // Education & Skills
    education: "",
    skills: "",
    certifications: "",
    orientationTrainingRequired: false,
    securityTrainingRequired: false,
    departmentSpecificTrainingRequired: false,
    
    // Access & Security
    accessLevel: "basic",
    userRole: "",
    systemAccess: [],
    documentSecurityClearance: "PUBLIC",
    
    // Job Description
    jobDescription: {
      jobTitle: "",
      location: "",
      jobSummary: "",
      keyResponsibilities: [
        { description: "", weight: 0, tasks: "" }
      ],
      essentialExperience: "",
      essentialSkills: "",
      acknowledgment: false,
      signatureFile: null
    },
    
    // Documents
    contractSigned: false,
    backgroundCheckCompleted: false,
    medicalCheckCompleted: false,
    initialTrainingCompleted: false,
    additionalNotes: ""
  })

  const totalSteps = 7

  useEffect(() => {
    setMounted(true)
    fetchDepartments()
    fetchSupervisors()
    fetchReviewers()
    fetchCountries()
    fetchRoles()
  }, [])

  // Fetch departments
  const fetchDepartments = async () => {
    setLoading(prev => ({ ...prev, departments: true }))
    try {
      const response = await fetch('/api/hr/department')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.data || data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(prev => ({ ...prev, departments: false }))
    }
  }

  // Fetch supervisors
  const fetchSupervisors = async () => {
    setLoading(prev => ({ ...prev, supervisors: true }))
    try {
      const response = await fetch('/api/hr/supervisors')
      if (response.ok) {
        const data = await response.json()
        setSupervisors(data.data || data.supervisors || [])
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error)
    } finally {
      setLoading(prev => ({ ...prev, supervisors: false }))
    }
  }

  // Fetch reviewers
  const fetchReviewers = async () => {
    setLoading(prev => ({ ...prev, reviewers: true }))
    try {
      const response = await fetch('/api/hr/reviewers')
      if (response.ok) {
        const data = await response.json()
        setReviewers(data.data || data.reviewers || [])
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error)
    } finally {
      setLoading(prev => ({ ...prev, reviewers: false }))
    }
  }

  // Fetch countries
  const fetchCountries = async () => {
    setLoading(prev => ({ ...prev, countries: true }))
    try {
      const response = await fetch('/api/hr/locations/countries')
      if (response.ok) {
        const data = await response.json()
        setCountries(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching countries:', error)
    } finally {
      setLoading(prev => ({ ...prev, countries: false }))
    }
  }

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(prev => ({ ...prev, roles: true }))
    try {
      const response = await fetch('/api/hr/roles')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.roles) {
          setRoles(data.data.roles)
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(prev => ({ ...prev, roles: false }))
    }
  }

  // Helper function to get permission display color
  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'none': return 'text-gray-600'
      case 'view': return 'text-blue-600'
      case 'edit': return 'text-yellow-600'
      case 'full': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  // Helper function to get role border color
  const getRoleBorderColor = (role: SystemRole) => {
    if (role.fullAccess) return 'border-green-200 bg-green-50'
    if (role.permissions.hr === 'full') return 'border-purple-200 bg-purple-50'
    if (role.permissions.callCenter === 'full' || role.permissions.programs === 'full') return 'border-blue-200 bg-blue-50'
    return 'border-gray-200'
  }

  // Helper functions for key responsibilities management
  const addKeyResponsibility = () => {
    if (formData.jobDescription.keyResponsibilities.length < 10) {
      const newResponsibilities = [...formData.jobDescription.keyResponsibilities, {
        description: "",
        weight: 0,
        tasks: ""
      }]
      handleInputChange("jobDescription", { 
        ...formData.jobDescription, 
        keyResponsibilities: newResponsibilities 
      })
    }
  }

  const removeKeyResponsibility = (index: number) => {
    if (formData.jobDescription.keyResponsibilities.length > 1) {
      const newResponsibilities = formData.jobDescription.keyResponsibilities.filter((_, i) => i !== index)
      handleInputChange("jobDescription", { 
        ...formData.jobDescription, 
        keyResponsibilities: newResponsibilities 
      })
    }
  }

  const updateKeyResponsibility = (index: number, field: 'description' | 'weight' | 'tasks', value: string | number) => {
    const newResponsibilities = formData.jobDescription.keyResponsibilities.map((resp, i) => 
      i === index ? { ...resp, [field]: value } : resp
    )
    handleInputChange("jobDescription", { 
      ...formData.jobDescription, 
      keyResponsibilities: newResponsibilities 
    })
  }

  // Calculate total weight percentage
  const getTotalWeight = (responsibilities: Array<{description: string, weight: number, tasks: string}>) => {
    return responsibilities.reduce((total, resp) => total + (resp.weight || 0), 0)
  }

  // Fetch provinces when country changes
  const fetchProvinces = async (countryCode: string) => {
    if (!countryCode) {
      setProvinces([])
      return
    }
    
    setLoading(prev => ({ ...prev, provinces: true }))
    try {
      const response = await fetch(`/api/hr/locations/countries?country=${countryCode}`)
      if (response.ok) {
        const data = await response.json()
        setProvinces(data.data?.provinces || [])
      }
    } catch (error) {
      console.error('Error fetching provinces:', error)
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }))
    }
  }

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Fetch provinces when country changes
    if (field === 'country') {
      setFormData(prev => ({ ...prev, province: '' })) // Reset province
      fetchProvinces(value)
    }
  }

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.position) {
        alert("Please fill in all required fields (First Name, Last Name, Email, Position)")
        return
      }

      // Job Description validation
      if (!formData.jobDescription.jobTitle) {
        alert("Please enter a job title in the Job Description section")
        return
      }

      if (!formData.jobDescription.location) {
        alert("Please enter a job location in the Job Description section")
        return
      }

      if (!formData.jobDescription.jobSummary) {
        alert("Please provide a job summary in the Job Description section")
        return
      }

      if (formData.jobDescription.keyResponsibilities.length === 0) {
        alert("Please add at least one key responsibility in the Job Description section")
        return
      }

      // Validate key responsibilities
      const totalWeight = getTotalWeight(formData.jobDescription.keyResponsibilities)
      if (totalWeight !== 100) {
        alert(`Key responsibilities weights must total 100%. Current total: ${totalWeight}%`)
        return
      }

      // Check if all responsibilities have descriptions
      const emptyResponsibilities = formData.jobDescription.keyResponsibilities.filter(resp => !resp.description.trim())
      if (emptyResponsibilities.length > 0) {
        alert("Please provide descriptions for all key responsibilities")
        return
      }

      if (!formData.jobDescription.essentialExperience) {
        alert("Please provide essential experience requirements in the Job Description section")
        return
      }

      if (!formData.jobDescription.essentialSkills) {
        alert("Please provide essential skills requirements in the Job Description section")
        return
      }

      if (!formData.jobDescription.acknowledgment) {
        alert("Please acknowledge the job description declaration")
        return
      }

      console.log("Submitting employee data:", formData)
      console.log("Supervisor status:", formData.isSupervisor)
      console.log("Reviewer status:", formData.isReviewer)
      
      // Get selected role data for enhanced submission
      const selectedRole = roles.find(r => r.id === formData.userRole)
      
      // Prepare the data for submission with role-based enhancements
      const submissionData = {
        formData: {
          ...formData,
          // Ensure supervisor and reviewer flags are included
          isSupervisor: formData.isSupervisor || false,
          isReviewer: formData.isReviewer || false,
          // Map form fields to API expected fields
          hireDate: formData.startDate,
          salary: formData.baseSalary,
          // Additional mappings for proper data structure
          department: formData.departmentId ? undefined : formData.department, // Let API handle department resolution
          medicalAid: formData.medicalAid || false,
          funeralCover: formData.funeralCover || false,
          vehicleBenefit: formData.vehicleBenefit || false,
          fuelAllowance: formData.fuelAllowance || false,
          airtimeAllowance: formData.airtimeAllowance || false,
          otherBenefits: formData.otherBenefits ? [formData.otherBenefits] : [],
          // Role-based data
          role: formData.userRole, // Primary role ID
          permissions: selectedRole?.permissions || {},
          canViewOthersProfiles: selectedRole?.canViewOthersProfiles || false,
          canManageUsers: selectedRole?.canManageUsers || false,
          fullAccess: selectedRole?.fullAccess || false,
          roleDescription: selectedRole?.description || ''
        }
      }
      
      console.log("Final submission data:", submissionData)
      
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log("Employee created successfully:", result)
        alert("Employee created successfully!")
        // Redirect to employees list or show success message
        router.push('/hr/employees')
      } else {
        console.error("Error creating employee:", result)
        alert(`Error creating employee: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("An error occurred while creating the employee. Please try again.")
    }
  }

  // Step validation function
  const validateStep = (step: number): { isValid: boolean; message?: string } => {
    switch (step) {
      case 1: // Personal Info
        if (!formData.firstName.trim()) return { isValid: false, message: "First name is required" }
        if (!formData.lastName.trim()) return { isValid: false, message: "Last name is required" }
        if (!formData.email.trim()) return { isValid: false, message: "Email is required" }
        if (!formData.phoneNumber.trim()) return { isValid: false, message: "Phone number is required" }
        return { isValid: true }
      
      case 2: // Employment
        if (!formData.position.trim()) return { isValid: false, message: "Position is required" }
        if (!formData.startDate) return { isValid: false, message: "Start date is required" }
        return { isValid: true }
      
      case 3: // Compensation
        if (!formData.baseSalary) return { isValid: false, message: "Base salary is required" }
        return { isValid: true }
      
      case 4: // Education
        // Education is optional
        return { isValid: true }
      
      case 5: // Access & Security
        if (!formData.userRole) return { isValid: false, message: "User role is required" }
        if (!formData.documentSecurityClearance) return { isValid: false, message: "Document security clearance is required" }
        return { isValid: true }
      
      case 6: // Job Description
        if (!formData.jobDescription.jobTitle.trim()) return { isValid: false, message: "Job title is required" }
        if (!formData.jobDescription.location.trim()) return { isValid: false, message: "Job location is required" }
        if (!formData.jobDescription.jobSummary.trim()) return { isValid: false, message: "Job summary is required" }
        if (formData.jobDescription.keyResponsibilities.length === 0) return { isValid: false, message: "At least one key responsibility is required" }
        
        const totalWeight = getTotalWeight(formData.jobDescription.keyResponsibilities)
        if (totalWeight !== 100) return { isValid: false, message: `Key responsibilities weights must total 100%. Current: ${totalWeight}%` }
        
        const emptyResponsibilities = formData.jobDescription.keyResponsibilities.filter(resp => !resp.description.trim())
        if (emptyResponsibilities.length > 0) return { isValid: false, message: "All key responsibilities must have descriptions" }
        
        if (!formData.jobDescription.essentialExperience.trim()) return { isValid: false, message: "Essential experience is required" }
        if (!formData.jobDescription.essentialSkills.trim()) return { isValid: false, message: "Essential skills are required" }
        if (!formData.jobDescription.acknowledgment) return { isValid: false, message: "Job description acknowledgment is required" }
        return { isValid: true }
      
      default:
        return { isValid: true }
    }
  }

  const handleNextStep = () => {
    const validation = validateStep(currentStep)
    if (!validation.isValid) {
      alert(validation.message)
      return
    }
    setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)
  }

  const steps = [
    { id: 1, name: "Personal Info", icon: UserIcon },
    { id: 2, name: "Employment", icon: DocumentTextIcon },
    { id: 3, name: "Compensation", icon: BanknotesIcon },
    { id: 4, name: "Education", icon: AcademicCapIcon },
    { id: 5, name: "Access & Security", icon: ShieldCheckIcon },
    { id: 6, name: "Job Description", icon: DocumentTextIcon },
    { id: 7, name: "Documents", icon: DocumentTextIcon }
  ]

  if (!mounted) {
    return null
  }

  return (
    <EnhancedLayout>
      <div className="w-full px-6">
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  step.id < currentStep
                    ? 'bg-green-500 text-white'
                  : step.id === currentStep 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
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
                    {step.id === 1 && "Current"}
                    {step.id === 2 && "Current"}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step.id < currentStep ? 'bg-green-500' : step.id === currentStep ? 'bg-orange-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow rounded-lg p-8 w-full">
          
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                <p className="text-gray-600 text-sm mt-1">Employee's basic personal details</p>
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 mt-6">
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                </div>
                <p className="text-gray-600 text-sm mt-1">Contact person in case of emergency</p>
              </div>

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
          )}

          {/* Step 2: Employment Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Employment Information</h3>
                </div>
                <p className="text-gray-600 text-sm mt-1">Job details and department assignment</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    onChange={(e) => handleInputChange("departmentId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">
                      {loading.departments ? 'Loading departments...' : 'Select Department'}
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} {dept.code ? `(${dept.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Performance Reviewer
                  </label>
                  <select
                    value={formData.reviewerId}
                    onChange={(e) => handleInputChange("reviewerId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">
                      {loading.reviewers ? 'Loading reviewers...' : 'Select Reviewer'}
                    </option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name} - {reviewer.position} ({reviewer.department})
                        {reviewer.isHR && ' [HR]'}
                        {reviewer.reviewCount > 0 && ` - ${reviewer.reviewCount} reviews`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => handleInputChange("employmentType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                    <option value="volunteer">Volunteer</option>
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
                    <option value="office">Office</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="field">Field</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">
                      {loading.countries ? 'Loading countries...' : 'Select African Country'}
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.provinces} provinces)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province/State *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleInputChange("province", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    disabled={!formData.country}
                  >
                    <option value="">
                      {loading.provinces ? 'Loading provinces...' : 
                       !formData.country ? 'Select country first' : 'Select Province/State'}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isSupervisor}
                    onChange={(e) => handleInputChange("isSupervisor", e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">This employee is a supervisor</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isReviewer}
                    onChange={(e) => handleInputChange("isReviewer", e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">This employee can conduct performance reviews</label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Compensation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Compensation Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Salary *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="text"
                      value={formData.baseSalary}
                      onChange={(e) => handleInputChange("baseSalary", e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter base salary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Grade
                  </label>
                  <select
                    value={formData.payGrade}
                    onChange={(e) => handleInputChange("payGrade", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Pay Grade</option>
                    <option value="PO6">PO6 Highest</option>
                    <option value="PO4">PO4</option>
                    <option value="PO3">PO3</option>
                    <option value="PO2">PO2</option>
                    <option value="PO1">PO1</option>
                    <option value="SO2">SO2</option>
                    <option value="SO1">SO1</option>
                    <option value="Scale5">Scale 5</option>
                    <option value="Scale4">Scale 4</option>
                    <option value="M1M2">M1/M2 Lowest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Frequency
                  </label>
                  <select
                    value={formData.payFrequency}
                    onChange={(e) => handleInputChange("payFrequency", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Additional Benefits</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="healthInsurance"
                      checked={formData.healthInsurance}
                      onChange={(e) => handleInputChange("healthInsurance", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="healthInsurance" className="text-sm text-gray-700">Health Insurance</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dentalCoverage"
                      checked={formData.dentalCoverage}
                      onChange={(e) => handleInputChange("dentalCoverage", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="dentalCoverage" className="text-sm text-gray-700">Dental Coverage</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="visionCoverage"
                      checked={formData.visionCoverage}
                      onChange={(e) => handleInputChange("visionCoverage", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="visionCoverage" className="text-sm text-gray-700">Vision Coverage</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="retirementPlan"
                      checked={formData.retirementPlan}
                      onChange={(e) => handleInputChange("retirementPlan", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="retirementPlan" className="text-sm text-gray-700">Retirement Plan</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lifeInsurance"
                      checked={formData.lifeInsurance}
                      onChange={(e) => handleInputChange("lifeInsurance", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lifeInsurance" className="text-sm text-gray-700">Life Insurance</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="flexiblePTO"
                      checked={formData.flexiblePTO}
                      onChange={(e) => handleInputChange("flexiblePTO", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="flexiblePTO" className="text-sm text-gray-700">Flexible PTO</label>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mt-8">Specific Benefits</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="medicalAid"
                      checked={formData.medicalAid}
                      onChange={(e) => handleInputChange("medicalAid", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="medicalAid" className="text-sm text-gray-700">Medical Aid</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="funeralCover"
                      checked={formData.funeralCover}
                      onChange={(e) => handleInputChange("funeralCover", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="funeralCover" className="text-sm text-gray-700">Funeral Cover</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="vehicleBenefit"
                      checked={formData.vehicleBenefit}
                      onChange={(e) => handleInputChange("vehicleBenefit", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="vehicleBenefit" className="text-sm text-gray-700">Vehicle Benefit</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="fuelAllowance"
                      checked={formData.fuelAllowance}
                      onChange={(e) => handleInputChange("fuelAllowance", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="fuelAllowance" className="text-sm text-gray-700">Fuel Allowance</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="airtimeAllowance"
                      checked={formData.airtimeAllowance}
                      onChange={(e) => handleInputChange("airtimeAllowance", e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="airtimeAllowance" className="text-sm text-gray-700">Airtime Allowance</label>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Benefits (comma-separated)
                  </label>
                  <textarea
                    value={formData.otherBenefits}
                    onChange={(e) => handleInputChange("otherBenefits", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highest Education Level
                </label>
                <select
                  value={formData.education}
                  onChange={(e) => handleInputChange("education", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Education Level</option>
                  <option value="high-school">High School</option>
                  <option value="diploma">Diploma</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="e.g., JavaScript, Project Management, Data Analysis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications (comma-separated)
                </label>
                <textarea
                  value={formData.certifications}
                  onChange={(e) => handleInputChange("certifications", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="e.g., PMP, AWS Certified, Google Analytics"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Training Requirements</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="orientationTrainingRequired"
                      checked={formData.orientationTrainingRequired}
                      onChange={(e) => handleInputChange("orientationTrainingRequired", e.target.checked)}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="orientationTrainingRequired" className="text-sm text-green-700">Orientation Training Required</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="securityTrainingRequired"
                      checked={formData.securityTrainingRequired}
                      onChange={(e) => handleInputChange("securityTrainingRequired", e.target.checked)}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="securityTrainingRequired" className="text-sm text-green-700">Security Training Required</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="departmentSpecificTrainingRequired"
                      checked={formData.departmentSpecificTrainingRequired}
                      onChange={(e) => handleInputChange("departmentSpecificTrainingRequired", e.target.checked)}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="departmentSpecificTrainingRequired" className="text-sm text-green-700">Department-specific Training Required</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Access & Security */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Access & Security</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    User Role & Access Level *
                  </label>
                  
                  {loading.roles ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      <span className="ml-2 text-gray-600">Loading roles...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {roles.map((role) => (
                        <div key={role.id} className={`border rounded-lg p-4 ${getRoleBorderColor(role)}`}>
                          <div className="flex items-start mb-3">
                            <input
                              type="radio"
                              id={role.id}
                              name="userRole"
                              value={role.id}
                              checked={formData.userRole === role.id}
                              onChange={(e) => {
                                handleInputChange("userRole", e.target.value)
                                // Automatically set document security clearance based on role
                                handleInputChange("documentSecurityClearance", role.documentLevel)
                                // Set access level based on role permissions
                                const accessLevel = role.fullAccess ? 'full' : 
                                                   (role.permissions.hr === 'full' || role.permissions.callCenter === 'full') ? 'advanced' : 'basic'
                                handleInputChange("accessLevel", accessLevel)
                              }}
                              className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 mt-1"
                            />
                            <div className="flex-1">
                              <label htmlFor={role.id} className="text-sm font-medium text-gray-900 block mb-1">
                                {role.name}
                                {role.fullAccess && <span className=" ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Full Access</span>}
                              </label>
                              <p className="text-xs text-gray-600 mb-3">{role.description}</p>
                              
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                                <span className={`${getPermissionColor(role.permissions.callCenter)} font-medium`}>
                                  Call Centre: {role.permissions.callCenter}
                                </span>
                                <span className={`${getPermissionColor(role.permissions.programs)} font-medium`}>
                                  Programs: {role.permissions.programs}
                                </span>
                                <span className={`${getPermissionColor(role.permissions.hr)} font-medium`}>
                                  HR: {role.permissions.hr}
                                </span>
                                <span className={`${getPermissionColor(role.permissions.documents)} font-medium`}>
                                  Documents: {role.permissions.documents}
                                </span>
                                <span className={`${getPermissionColor(role.permissions.inventory)} font-medium`}>
                                  Inventory: {role.permissions.inventory}
                                </span>
                                <span className={`${getPermissionColor(role.permissions.risks)} font-medium`}>
                                  Risks: {role.permissions.risks}
                                </span>
                                <span className="text-gray-700 font-medium">
                                  Max Doc Level: <span className="text-sm">{role.documentLevel.replace('_', ' ')}</span>
                                </span>
                                {role.canViewOthersProfiles && (
                                  <span className="text-purple-600 font-medium text-xs">
                                    ✓ View Others' Profiles
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SAYWHAT Department Structure */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                    SAYWHAT Department Structure
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="font-medium text-gray-900">Main Departments:</div>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Executive Directors Office
                        <ul className="list-disc list-inside ml-4 text-gray-600">
                          <li>Subunit: Research and Development</li>
                        </ul>
                      </li>
                      <li>Human Resource Management</li>
                      <li>Finance and Administration</li>
                      <li>Programs
                        <ul className="list-disc list-inside ml-4 text-gray-600">
                          <li>Subunits: MEAL and Call Center</li>
                        </ul>
                      </li>
                      <li>Grants and Compliance</li>
                      <li>Communications and Advocacy</li>
                    </ul>
                  </div>
                </div>

                {/* Document Security Clearance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Security Clearance Level *
                  </label>
                  <select
                    value={formData.documentSecurityClearance}
                    onChange={(e) => handleInputChange("documentSecurityClearance", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="PUBLIC">PUBLIC (Public documents only)</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL (Internal and confidential documents)</option>
                    <option value="SECRET">SECRET (Up to secret level documents)</option>
                    <option value="TOP_SECRET">TOP SECRET (All document levels)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Determines the highest level of classified documents this user can access. 
                    {formData.userRole && roles.find(r => r.id === formData.userRole) && (
                      <span className="text-orange-600 font-medium ml-1">
                        (Automatically set to {roles.find(r => r.id === formData.userRole)?.documentLevel.replace('_', ' ')} based on selected role)
                      </span>
                    )}
                  </p>
                </div>

                {/* System Module Access */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">System Module Access (Based on Selected Role):</h3>
                  
                  {formData.userRole && roles.find(r => r.id === formData.userRole) ? (
                    <div className="space-y-3">
                      {(() => {
                        const selectedRole = roles.find(r => r.id === formData.userRole)!
                        const moduleNames = [
                          { key: 'callCenter', label: 'Call Center' },
                          { key: 'dashboard', label: 'Dashboard' },
                          { key: 'personalProfile', label: 'Personal Profile' },
                          { key: 'programs', label: 'Programs' },
                          { key: 'documents', label: 'Documents' },
                          { key: 'inventory', label: 'Inventory' },
                          { key: 'hr', label: 'HR' },
                          { key: 'risks', label: 'Risks' }
                        ]
                        
                        return (
                          <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              {moduleNames.map(({ key, label }) => {
                                const permission = selectedRole.permissions[key as keyof RolePermissions]
                                return (
                                  <div key={key} className="flex flex-col">
                                    <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
                                    <div className={`text-sm font-medium ${getPermissionColor(permission)} capitalize`}>
                                      {permission}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="text-sm text-blue-800">
                                <strong>Special Permissions:</strong>
                                <div className="mt-1 space-y-1">
                                  {selectedRole.canViewOthersProfiles && (
                                    <div>✓ Can view other employees' profiles</div>
                                  )}
                                  {selectedRole.canManageUsers && (
                                    <div>✓ Can manage user accounts</div>
                                  )}
                                  {selectedRole.fullAccess && (
                                    <div>✓ Full superuser access</div>
                                  )}
                                  <div>✓ Maximum document clearance: <span className="font-medium">{selectedRole.documentLevel.replace('_', ' ')}</span></div>
                                </div>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Please select a user role above to see the system module access permissions.
                    </div>
                  )}
                </div>

                {/* Required Security Setup Tasks */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <h3 className="text-sm font-medium text-yellow-800">Required Security Setup Tasks</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm text-yellow-700">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      Badge/ID card creation required
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      System accounts to be provisioned
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      Access permissions to be configured automatically
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      Security training to be scheduled
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      Department-based role assignment will be applied
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Job Description */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Description</h2>

              <div className="space-y-6">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.jobDescription.jobTitle}
                    onChange={(e) => handleInputChange("jobDescription", { ...formData.jobDescription, jobTitle: e.target.value })}
                    placeholder="Enter the official job title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Location *
                  </label>
                  <input
                    type="text"
                    value={formData.jobDescription.location}
                    onChange={(e) => handleInputChange("jobDescription", { ...formData.jobDescription, location: e.target.value })}
                    placeholder="Enter work location (e.g., Kampala Office, Remote, Field-based)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Job Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Summary *
                  </label>
                  <textarea
                    value={formData.jobDescription.jobSummary}
                    onChange={(e) => handleInputChange("jobDescription", { ...formData.jobDescription, jobSummary: e.target.value })}
                    placeholder="Provide a comprehensive overview of the role's purpose, scope, and main objectives..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Key Responsibilities */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Key Responsibilities & Tasks
                    </label>
                    <div className="text-sm text-gray-600">
                      Total Weight: {getTotalWeight(formData.jobDescription.keyResponsibilities)}%
                      <span className={getTotalWeight(formData.jobDescription.keyResponsibilities) === 100 ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                        {getTotalWeight(formData.jobDescription.keyResponsibilities) === 100 ? '✓' : '⚠️'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.jobDescription.keyResponsibilities.map((responsibility, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Responsibility {index + 1}</h4>
                          {formData.jobDescription.keyResponsibilities.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeKeyResponsibility(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Responsibility Description *
                            </label>
                            <textarea
                              value={responsibility.description}
                              onChange={(e) => updateKeyResponsibility(index, 'description', e.target.value)}
                              placeholder="Describe the responsibility and associated tasks..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Weight (%) *
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={responsibility.weight}
                              onChange={(e) => updateKeyResponsibility(index, 'weight', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Percentage of time/effort for this responsibility
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Specific Tasks
                          </label>
                          <textarea
                            value={responsibility.tasks}
                            onChange={(e) => updateKeyResponsibility(index, 'tasks', e.target.value)}
                            placeholder="List specific tasks and deliverables for this responsibility..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          />
                        </div>
                      </div>
                    ))}

                    {formData.jobDescription.keyResponsibilities.length < 10 && (
                      <button
                        type="button"
                        onClick={addKeyResponsibility}
                        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                      >
                        + Add Another Responsibility (Max 10)
                      </button>
                    )}

                    {getTotalWeight(formData.jobDescription.keyResponsibilities) !== 100 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                          <p className="text-sm text-yellow-800">
                            Total weight must equal 100%. Current total: {getTotalWeight(formData.jobDescription.keyResponsibilities)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Person Specification - Essential Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Essential Experience *
                  </label>
                  <textarea
                    value={formData.jobDescription.essentialExperience}
                    onChange={(e) => handleInputChange("jobDescription", { ...formData.jobDescription, essentialExperience: e.target.value })}
                    placeholder="List the essential work experience, qualifications, and background required for this role..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Person Specification - Essential Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Essential Skills *
                  </label>
                  <textarea
                    value={formData.jobDescription.essentialSkills}
                    onChange={(e) => handleInputChange("jobDescription", { ...formData.jobDescription, essentialSkills: e.target.value })}
                    placeholder="List the essential technical skills, competencies, and abilities required for this role..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Declaration and Acknowledgment */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Declaration and Acknowledgment</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="jobDescriptionAcknowledgment"
                        checked={formData.jobDescription.acknowledgment}
                        onChange={(e) => handleInputChange("jobDescription", { ...formData.jobDescription, acknowledgment: e.target.checked })}
                        className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 mt-1"
                      />
                      <label htmlFor="jobDescriptionAcknowledgment" className="text-sm text-gray-700">
                        I acknowledge that this job description accurately reflects the role's responsibilities, requirements, and expectations. 
                        I understand that this will be used for performance planning and evaluation purposes.
                      </label>
                    </div>

                    {/* Electronic Signature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Electronic Signature Upload
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleInputChange("jobDescription", { ...formData.jobDescription, signatureFile: file })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload an image or PDF file containing your electronic signature (Max 5MB)
                      </p>
                      {formData.jobDescription.signatureFile && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Signature file selected: {formData.jobDescription.signatureFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Planning Integration Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium text-blue-900">Performance Planning Integration</h3>
                  </div>
                  <p className="text-sm text-blue-800">
                    This job description will be integrated with the HR Performance Planning system. The key responsibilities 
                    and their weights will be used to set performance targets and conduct evaluations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Documents */}
          {currentStep === 7 && (
            <div className="space-y-8">
              {/* Required Documents Checklist */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Documents & Onboarding</h3>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-3">Required Documents Checklist</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="inline-flex items-center text-sm text-green-800">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={formData.contractSigned}
                        onChange={(e) => handleInputChange("contractSigned", e.target.checked)}
                      />
                      Employment Contract Signed
                    </label>
                    <label className="inline-flex items-center text-sm text-green-800">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={formData.backgroundCheckCompleted}
                        onChange={(e) => handleInputChange("backgroundCheckCompleted", e.target.checked)}
                      />
                      Background Check Completed
                    </label>
                    <label className="inline-flex items-center text-sm text-green-800">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={formData.medicalCheckCompleted}
                        onChange={(e) => handleInputChange("medicalCheckCompleted", e.target.checked)}
                      />
                      Medical Check Completed
                    </label>
                    <label className="inline-flex items-center text-sm text-green-800">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={formData.initialTrainingCompleted}
                        onChange={(e) => handleInputChange("initialTrainingCompleted", e.target.checked)}
                      />
                      Initial Training Completed
                    </label>
                  </div>
                </div>
              </div>

              {/* HR & IT Setup Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">HR Documents</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Employee handbook acknowledgment</li>
                    <li>Code of conduct agreement</li>
                    <li>Emergency contact forms</li>
                    <li>Tax and payroll forms</li>
                  </ul>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">IT Setup</h4>
                  <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                    <li>Equipment assignment</li>
                    <li>Software license allocation</li>
                    <li>Email account creation</li>
                    <li>Network access setup</li>
                  </ul>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-orange-500 mr-2" />
                    Document Upload & Repository
                  </h3>
                  <span className="text-sm text-gray-500">0 documents uploaded</span>
                </div>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Employee Documents</h4>
                  <p className="text-gray-600 mb-4">Drag and drop files here, or click to select files</p>
                  
                  <button className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                    <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                    Choose Files
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)
                  </p>
                </div>

                {/* Document Categories */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 mb-2">Personal Documents</h4>
                    <p className="text-sm text-gray-500">0 files</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 mb-2">Employment Documents</h4>
                    <p className="text-sm text-gray-500">0 files</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 mb-2">Medical Documents</h4>
                    <p className="text-sm text-gray-500">0 files</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 mb-2">Training Documents</h4>
                    <p className="text-sm text-gray-500">0 files</p>
                  </div>
                </div>

                {/* Search Documents */}
                <div className="mt-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search documents"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Uploaded Documents</h4>
                  <p className="text-sm text-gray-500 text-center py-8">No documents uploaded yet</p>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  placeholder="Any additional notes or special requirements for this employee..."
                />
              </div>
            </div>
          )}

          {/* Additional steps would go here */}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Previous
              </button>
            ) : (
              <button
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Previous
              </button>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Create Employee
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </EnhancedLayout>
  )
}