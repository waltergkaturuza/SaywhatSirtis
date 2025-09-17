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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
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
  const [loading, setLoading] = useState({
    departments: false,
    supervisors: false,
    reviewers: false,
    countries: false,
    provinces: false
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
    documentSecurityClearance: "public",
    
    // Documents
    contractSigned: false,
    backgroundCheckCompleted: false,
    medicalCheckCompleted: false,
    initialTrainingCompleted: false,
    additionalNotes: ""
  })

  const totalSteps = 6

  useEffect(() => {
    setMounted(true)
    fetchDepartments()
    fetchSupervisors()
    fetchReviewers()
    fetchCountries()
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
    console.log("Submitting employee data:", formData)
    // Add submit logic here
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
        <div className="bg-white shadow rounded-lg p-8">
          
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
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
                  
                  <div className="space-y-4">
                    {/* Basic User 1 */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          id="basicUser1"
                          name="userRole"
                          value="basicUser1"
                          checked={formData.userRole === "basicUser1"}
                          onChange={(e) => handleInputChange("userRole", e.target.value)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="basicUser1" className="text-sm font-medium text-gray-900">Basic User 1</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs ml-7">
                        <span className="text-blue-600">Call Centre: view</span>
                        <span className="text-gray-600">Programs: none</span>
                        <span className="text-gray-600">HR: none</span>
                        <span className="text-blue-600">Documents: view</span>
                      </div>
                    </div>

                    {/* Basic User 2 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          id="basicUser2"
                          name="userRole"
                          value="basicUser2"
                          checked={formData.userRole === "basicUser2"}
                          onChange={(e) => handleInputChange("userRole", e.target.value)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="basicUser2" className="text-sm font-medium text-gray-900">Basic User 2</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs ml-7">
                        <span className="text-gray-600">Call Centre: none</span>
                        <span className="text-blue-600">Programs: view</span>
                        <span className="text-gray-600">HR: none</span>
                        <span className="text-blue-600">Documents: view</span>
                      </div>
                    </div>

                    {/* Advanced User 1 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          id="advancedUser1"
                          name="userRole"
                          value="advancedUser1"
                          checked={formData.userRole === "advancedUser1"}
                          onChange={(e) => handleInputChange("userRole", e.target.value)}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="advancedUser1" className="text-sm font-medium text-gray-900">Advanced User 1</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs ml-7">
                        <span className="text-green-600">Call Centre: full</span>
                        <span className="text-yellow-600">Programs: edit</span>
                        <span className="text-gray-600">HR: none</span>
                        <span className="text-yellow-600">Documents: edit</span>
                      </div>
                    </div>

                    {/* Advanced User 2 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          id="advancedUser2"
                          name="userRole"
                          value="advancedUser2"
                          checked={formData.userRole === "advancedUser2"}
                          onChange={(e) => handleInputChange("userRole", e.target.value)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="advancedUser2" className="text-sm font-medium text-gray-900">Advanced User 2</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs ml-7">
                        <span className="text-blue-600">Call Centre: view</span>
                        <span className="text-green-600">Programs: full</span>
                        <span className="text-gray-600">HR: none</span>
                        <span className="text-yellow-600">Documents: edit</span>
                      </div>
                    </div>

                    {/* HR */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          id="hr"
                          name="userRole"
                          value="hr"
                          checked={formData.userRole === "hr"}
                          onChange={(e) => handleInputChange("userRole", e.target.value)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="hr" className="text-sm font-medium text-gray-900">Hr</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs ml-7">
                        <span className="text-blue-600">Call Centre: view</span>
                        <span className="text-blue-600">Programs: view</span>
                        <span className="text-green-600">HR: full</span>
                        <span className="text-yellow-600">Documents: edit</span>
                      </div>
                    </div>

                    {/* System Administrator */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          id="systemAdmin"
                          name="userRole"
                          value="systemAdmin"
                          checked={formData.userRole === "systemAdmin"}
                          onChange={(e) => handleInputChange("userRole", e.target.value)}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="systemAdmin" className="text-sm font-medium text-gray-900">System Administrator</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs ml-7">
                        <span className="text-green-600">Call Centre: full</span>
                        <span className="text-green-600">Programs: full</span>
                        <span className="text-green-600">HR: full</span>
                        <span className="text-green-600">Documents: full</span>
                      </div>
                    </div>
                  </div>
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
                    <option value="public">Public (Public documents only)</option>
                    <option value="internal">Internal (Internal documents)</option>
                    <option value="confidential">Confidential</option>
                    <option value="restricted">Restricted</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Determines the highest level of classified documents this user can access.</p>
                </div>

                {/* System Module Access */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">System Module Access (Based on Role):</h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Call Center</div>
                        <div className="text-sm text-blue-600">view</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Dashboard</div>
                        <div className="text-sm text-blue-600">view</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Personal Profile</div>
                        <div className="text-sm text-green-600">full</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Programs</div>
                        <div className="text-sm text-red-600">none</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Documents</div>
                        <div className="text-sm text-blue-600">view</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Inventory</div>
                        <div className="text-sm text-red-600">none</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Hr</div>
                        <div className="text-sm text-red-600">none</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Risks</div>
                        <div className="text-sm text-blue-600">view</div>
                      </div>
                    </div>
                  </div>
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

          {/* Step 6: Documents */}
          {currentStep === 6 && (
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
                onClick={() => setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5 | 6)}
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
                  onClick={() => setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
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