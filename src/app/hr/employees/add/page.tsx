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
  TrashIcon
} from "@heroicons/react/24/outline"

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
  position: string
  reportingManager: string
  startDate: string
  employmentType: string
  workLocation: string
  
  // Compensation
  baseSalary: string
  currency: string
  payGrade: string
  payFrequency: string
  benefits: string[]
  
  // Education & Skills
  education: string
  skills: string[]
  certifications: string[]
  trainingRequired: string[]
  
  // Access & Security
  accessLevel: string
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
    position: "",
    reportingManager: "",
    startDate: "",
    employmentType: "",
    workLocation: "",
    baseSalary: "",
    currency: "USD",
    payGrade: "",
    payFrequency: "monthly",
    benefits: [],
    education: "",
    skills: [],
    certifications: [],
    trainingRequired: [],
    accessLevel: "basic",
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

  useEffect(() => {
    setMounted(true)
  }, [])

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
      <div className="max-w-none px-2 w-full min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-600">Complete all steps to onboard a new team member</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className="relative flex-1">
                  <div className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        currentStep >= step.id
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div
                        className={`absolute top-5 left-10 w-full h-0.5 ${
                          currentStep > step.id ? "bg-indigo-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? "text-orange-600" : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Employment Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange("employeeId", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="human-resources">Human Resources</option>
                      <option value="it">Information Technology</option>
                      <option value="programs">Programs & Development</option>
                      <option value="finance">Finance & Administration</option>
                      <option value="communications">Communications</option>
                      <option value="operations">Operations</option>
                      <option value="research">Research & Development</option>
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
                      Reporting Manager
                    </label>
                    <input
                      type="text"
                      value={formData.reportingManager}
                      onChange={(e) => handleInputChange("reportingManager", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Access & Security</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Level *
                    </label>
                    <select
                      value={formData.accessLevel}
                      onChange={(e) => handleInputChange("accessLevel", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="basic">Basic User</option>
                      <option value="advanced">Advanced User</option>
                      <option value="admin">Administrator</option>
                      <option value="super-admin">Super Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Access
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {["HR System", "Finance System", "Project Management", "Document Management", "Customer Database", "Analytics Dashboard"].map((system) => (
                        <label key={system} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.systemAccess.includes(system)}
                            onChange={(e) => {
                              const currentAccess = formData.systemAccess;
                              if (e.target.checked) {
                                handleInputChange("systemAccess", [...currentAccess, system]);
                              } else {
                                handleInputChange("systemAccess", currentAccess.filter(s => s !== system));
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">{system}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Clearance
                    </label>
                    <select
                      value={formData.securityClearance}
                      onChange={(e) => handleInputChange("securityClearance", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="none">None Required</option>
                      <option value="confidential">Confidential</option>
                      <option value="secret">Secret</option>
                      <option value="top-secret">Top Secret</option>
                    </select>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-yellow-900 mb-2">Security Setup Tasks</h3>
                    <div className="space-y-2">
                      <div className="text-sm text-yellow-800">
                        • Badge/ID card creation required
                      </div>
                      <div className="text-sm text-yellow-800">
                        • System accounts to be provisioned
                      </div>
                      <div className="text-sm text-yellow-800">
                        • Access permissions to be configured
                      </div>
                      <div className="text-sm text-yellow-800">
                        • Security training to be scheduled
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
              
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/hr/employees")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                {currentStep === totalSteps ? (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Create Employee
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnhancedLayout>
  )
}
