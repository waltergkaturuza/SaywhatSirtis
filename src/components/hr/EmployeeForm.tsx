"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { UserRole, Department, getDefaultRoleForDepartment, getRoleDisplayName, ROLE_DEFINITIONS } from "@/types/roles"
import { UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, BriefcaseIcon, AcademicCapIcon, KeyIcon, DocumentTextIcon } from "@heroicons/react/24/outline"

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
  hireDate: string
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
  securityClearance: string
  systemAccess: string[]
  contractSigned: boolean
  backgroundCheckCompleted: boolean
  medicalCheckCompleted: boolean
  trainingCompleted: boolean
  additionalNotes: string
  
  // Documents
  uploadedDocuments: Array<{
    id: string
    name: string
    type: string
    size: number
    category: string
  }>
  
  // System fields
  status: string
  alternativePhone: string
  nationality: string
  nationalId: string
}

interface EmployeeFormProps {
  mode: 'create' | 'edit'
  employeeData?: any // For edit mode
  onSubmit: (formData: EmployeeFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function EmployeeForm({ mode, employeeData, onSubmit, onCancel, isLoading = false }: EmployeeFormProps) {
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
    hireDate: "",
    employmentType: "FULL_TIME",
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
    securityClearance: "none",
    systemAccess: [],
    contractSigned: false,
    backgroundCheckCompleted: false,
    medicalCheckCompleted: false,
    trainingCompleted: false,
    additionalNotes: "",
    uploadedDocuments: [],
    status: "ACTIVE",
    alternativePhone: "",
    nationality: "",
    nationalId: ""
  })

  const totalSteps = 6 // Complete form with all sections

  // Load employee data in edit mode
  useEffect(() => {
    if (mode === 'edit' && employeeData) {
      setFormData({
        firstName: employeeData.firstName || "",
        lastName: employeeData.lastName || "",
        middleName: employeeData.middleName || "",
        dateOfBirth: employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth).toISOString().split('T')[0] : "",
        gender: employeeData.gender || "",
        maritalStatus: employeeData.maritalStatus || "",
        phoneNumber: employeeData.phoneNumber || "",
        email: employeeData.email || "",
        personalEmail: employeeData.personalEmail || "",
        address: employeeData.address || "",
        emergencyContactName: employeeData.emergencyContact || "",
        emergencyContactPhone: employeeData.emergencyPhone || "",
        emergencyContactRelationship: employeeData.emergencyRelationship || "",
        employeeId: employeeData.employeeId || "",
        department: employeeData.department || "",
        departmentId: employeeData.departmentId || "",
        position: employeeData.position || "",
        supervisorId: employeeData.supervisorId || "",
        startDate: employeeData.startDate ? new Date(employeeData.startDate).toISOString().split('T')[0] : "",
        hireDate: employeeData.hireDate ? new Date(employeeData.hireDate).toISOString().split('T')[0] : "",
        employmentType: employeeData.employmentType || "FULL_TIME",
        workLocation: employeeData.workLocation || "",
        isSupervisor: employeeData.isSupervisor || false,
        isReviewer: employeeData.isReviewer || false,
        baseSalary: employeeData.salary?.toString() || "",
        currency: employeeData.currency || "USD",
        payGrade: employeeData.payGrade || "",
        payFrequency: employeeData.payFrequency || "monthly",
        benefits: employeeData.benefits || [],
        medicalAid: employeeData.medicalAid || false,
        funeralCover: employeeData.funeralCover || false,
        vehicleBenefit: employeeData.vehicleBenefit || false,
        fuelAllowance: employeeData.fuelAllowance || false,
        airtimeAllowance: employeeData.airtimeAllowance || false,
        otherBenefits: employeeData.otherBenefits || [],
        education: employeeData.education || "",
        skills: employeeData.skills || [],
        certifications: employeeData.certifications || [],
        trainingRequired: employeeData.trainingRequired || [],
        accessLevel: employeeData.accessLevel || "basic",
        securityClearance: employeeData.securityClearance || "none",
        systemAccess: employeeData.systemAccess || [],
        contractSigned: employeeData.contractSigned || false,
        backgroundCheckCompleted: employeeData.backgroundCheckCompleted || false,
        medicalCheckCompleted: employeeData.medicalCheckCompleted || false,
        trainingCompleted: employeeData.trainingCompleted || false,
        additionalNotes: employeeData.additionalNotes || "",
        uploadedDocuments: employeeData.uploadedDocuments || [],
        status: employeeData.status || "ACTIVE",
        alternativePhone: employeeData.alternativePhone || "",
        nationality: employeeData.nationality || "",
        nationalId: employeeData.nationalId || ""
      })
    }
  }, [mode, employeeData])

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/department/list')
      const result = await response.json()
      if (result.success) {
        setDepartments(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    }
  }

  // Fetch supervisors
  const fetchSupervisors = async () => {
    try {
      const response = await fetch('/api/hr/employees/supervisors')
      const result = await response.json()
      if (result.success) {
        setSupervisors(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error)
      setSupervisors([])
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchSupervisors()
  }, [])

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    // Convert to format expected by APIs
    const apiData = {
      ...formData,
      salary: formData.baseSalary, // Map baseSalary to salary
      emergencyContact: formData.emergencyContactName,
      emergencyPhone: formData.emergencyContactPhone,
      emergencyRelationship: formData.emergencyContactRelationship
    }
    
    await onSubmit(apiData)
  }

  const sortDepartmentsHierarchically = (departments: any[]) => {
    return departments.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level
      return a.name.localeCompare(b.name)
    })
  }

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-8 p-4 bg-gradient-to-r from-saywhat-orange/10 to-saywhat-red/5 rounded-xl border-l-4 border-saywhat-orange">
        <div className="w-12 h-12 bg-gradient-to-br from-saywhat-orange to-saywhat-red rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-saywhat-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-saywhat-black">Personal Information</h3>
          <p className="text-saywhat-grey text-sm">Basic employee details and personal information</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-saywhat-white to-saywhat-light-grey/50 p-8 rounded-xl border border-saywhat-grey/20 shadow-lg">
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-saywhat-black font-semibold flex items-center">
              First Name *
              <span className="text-saywhat-red ml-1">●</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
              className="border-2 border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-2 focus:ring-saywhat-orange/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-orange/50 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-saywhat-black font-semibold flex items-center">
              Last Name *
              <span className="text-saywhat-red ml-1">●</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
              className="border-2 border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-2 focus:ring-saywhat-orange/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-orange/50 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName" className="text-saywhat-black font-semibold">Middle Name</Label>
            <Input
              id="middleName"
              value={formData.middleName}
              onChange={(e) => handleInputChange('middleName', e.target.value)}
              className="border-2 border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-2 focus:ring-saywhat-orange/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-orange/50 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-saywhat-black font-semibold flex items-center">
              Email Address *
              <span className="text-saywhat-red ml-1">●</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="border-2 border-saywhat-grey/30 focus:border-saywhat-green focus:ring-2 focus:ring-saywhat-green/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-green/50 transition-all duration-200"
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber" className="text-saywhat-dark font-medium">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-saywhat-orange"
            />
          </div>
          <div>
            <Label htmlFor="alternativePhone" className="text-saywhat-dark font-medium">Alternative Phone</Label>
            <Input
              id="alternativePhone"
              value={formData.alternativePhone}
              onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
              className="border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-saywhat-orange"
            />
          </div>
          <div className="col-span-3 space-y-2">
            <Label htmlFor="address" className="text-saywhat-black font-semibold">Full Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="border-2 border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-2 focus:ring-saywhat-orange/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-orange/50 transition-all duration-200"
              placeholder="Enter full residential address"
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth" className="text-saywhat-dark font-medium">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-saywhat-orange"
            />
          </div>
          <div>
            <Label htmlFor="gender" className="text-saywhat-dark font-medium">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger className="border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-saywhat-orange">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nationality" className="text-saywhat-dark font-medium">Nationality</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              className="border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-saywhat-orange"
            />
          </div>
          <div>
            <Label htmlFor="nationalId" className="text-saywhat-dark font-medium">National ID</Label>
            <Input
              id="nationalId"
              value={formData.nationalId}
              onChange={(e) => handleInputChange('nationalId', e.target.value)}
              className="border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-saywhat-orange"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => {
    return (
      <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-8 p-4 bg-gradient-to-r from-saywhat-red/10 to-saywhat-orange/5 rounded-xl border-l-4 border-saywhat-red">
        <div className="w-12 h-12 bg-gradient-to-br from-saywhat-red to-saywhat-orange rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-saywhat-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-saywhat-black">Emergency Contact Information</h3>
          <p className="text-saywhat-grey text-sm">Contact person in case of emergency</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-saywhat-white to-saywhat-light-grey/50 p-8 rounded-xl border border-saywhat-grey/20 shadow-lg">
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName" className="text-saywhat-black font-semibold">Emergency Contact Name</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              className="border-2 border-saywhat-grey/30 focus:border-saywhat-red focus:ring-2 focus:ring-saywhat-red/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-red/50 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone" className="text-saywhat-black font-semibold">Emergency Contact Phone</Label>
            <Input
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
              className="border-2 border-saywhat-grey/30 focus:border-saywhat-red focus:ring-2 focus:ring-saywhat-red/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-red/50 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelationship" className="text-saywhat-black font-semibold">Relationship</Label>
            <Select value={formData.emergencyContactRelationship} onValueChange={(value) => handleInputChange('emergencyContactRelationship', value)}>
              <SelectTrigger className="border-2 border-saywhat-grey/30 focus:border-saywhat-red focus:ring-2 focus:ring-saywhat-red/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-red/50 transition-all duration-200">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
    )
  }

  const renderStep3 = () => {
    return (
      <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-8 p-4 bg-gradient-to-r from-saywhat-green/10 to-saywhat-orange/5 rounded-xl border-l-4 border-saywhat-green">
        <BriefcaseIcon className="w-8 h-8 text-saywhat-green" />
        <div>
          <h3 className="text-xl font-bold text-saywhat-black">Employment Information</h3>
          <p className="text-saywhat-grey text-sm">Work details and organizational structure</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8">
        {mode === 'edit' && (
          <div>
            <Label htmlFor="employeeId" className="text-saywhat-black font-semibold">Employee ID</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              readOnly
              className="border-2 border-saywhat-grey/20 bg-saywhat-grey/10 text-saywhat-black font-medium rounded-lg px-4 py-3"
            />
          </div>
        )}
        <div>
          <Label htmlFor="position" className="text-saywhat-black font-semibold">Position *</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            required
            className="border-2 border-saywhat-grey/30 focus:border-saywhat-green focus:ring-2 focus:ring-saywhat-green/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-green/50 transition-all duration-200"
            placeholder="Enter job position"
          />
        </div>
        <div>
          <Label htmlFor="department" className="text-saywhat-black font-semibold">Department</Label>
          <Select value={formData.departmentId} onValueChange={(value) => {
            const selectedDept = departments.find(d => d.id === value)
            handleInputChange('departmentId', value)
            handleInputChange('department', selectedDept?.name || '')
          }}>
            <SelectTrigger className="border-2 border-saywhat-grey/30 focus:border-saywhat-green focus:ring-2 focus:ring-saywhat-green/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-green/50 transition-all duration-200">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {sortDepartmentsHierarchically(departments)
                .filter((dept) => dept.id && dept.id.trim() !== '')
                .map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {'  '.repeat(dept.level || 0)}
                  {dept.name} ({dept.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="employmentType">Employment Type</Label>
          <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
            <SelectTrigger className="border-2 border-saywhat-grey/30 focus:border-saywhat-green focus:ring-2 focus:ring-saywhat-green/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-green/50 transition-all duration-200">
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg">
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="INTERN">Intern</SelectItem>
              <SelectItem value="CONSULTANT">Consultant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="hireDate">Hire Date</Label>
          <Input
            id="hireDate"
            type="date"
            value={formData.hireDate}
            onChange={(e) => handleInputChange('hireDate', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="baseSalary">Base Salary</Label>
          <Input
            id="baseSalary"
            type="number"
            value={formData.baseSalary}
            onChange={(e) => handleInputChange('baseSalary', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
            <SelectTrigger className="border-2 border-saywhat-grey/30 focus:border-saywhat-green focus:ring-2 focus:ring-saywhat-green/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-green/50 transition-all duration-200">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg">
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ZWL">ZWL</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              <SelectItem value="TERMINATED">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="supervisor">Supervisor</Label>
          <Select 
            value={formData.supervisorId || 'no-supervisor'} 
            onValueChange={(value) => handleInputChange('supervisorId', value === 'no-supervisor' ? null : value)}
          >
            <SelectTrigger className="border-2 border-saywhat-grey/30 focus:border-saywhat-green focus:ring-2 focus:ring-saywhat-green/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-green/50 transition-all duration-200">
              <SelectValue placeholder="Select supervisor" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg">
              <SelectItem value="no-supervisor">No Supervisor</SelectItem>
              {supervisors.map((supervisor) => (
                <SelectItem key={supervisor.id} value={supervisor.id}>
                  {supervisor.firstName} {supervisor.lastName} - {supervisor.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
    )
  }

  const renderStep4 = () => {
    return (
      <div className="space-y-4">
      <h3 className="text-lg font-medium">Compensation</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="baseSalary">Base Salary</Label>
          <Input
            id="baseSalary"
            type="number"
            value={formData.baseSalary}
            onChange={(e) => handleInputChange('baseSalary', e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ZWL">ZWL</SelectItem>
              <SelectItem value="ZAR">ZAR</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="payGrade">Pay Grade</Label>
          <Select value={formData.payGrade} onValueChange={(value) => handleInputChange('payGrade', value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Pay Grade" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg">
              <SelectItem value="PO6" className="text-orange-600 font-semibold hover:bg-orange-50">PO6 (Highest)</SelectItem>
              <SelectItem value="PO4" className="text-orange-500 hover:bg-orange-50">PO4</SelectItem>
              <SelectItem value="PO3" className="text-green-600 hover:bg-green-50">PO3</SelectItem>
              <SelectItem value="PO2" className="text-green-500 hover:bg-green-50">PO2</SelectItem>
              <SelectItem value="PO1" className="text-black hover:bg-gray-50">PO1</SelectItem>
              <SelectItem value="SO2" className="text-gray-700 hover:bg-gray-50">SO2</SelectItem>
              <SelectItem value="SO1" className="text-gray-600 hover:bg-gray-50">SO1</SelectItem>
              <SelectItem value="Scale 5" className="text-gray-500 hover:bg-gray-50">Scale 5</SelectItem>
              <SelectItem value="Scale 4" className="text-gray-400 hover:bg-gray-50">Scale 4</SelectItem>
              <SelectItem value="M1/M2" className="text-gray-300 hover:bg-gray-50">M1/M2 (Lowest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="payFrequency">Pay Frequency</Label>
          <Select value={formData.payFrequency} onValueChange={(value) => handleInputChange('payFrequency', value)}>
            <SelectTrigger className="border-2 border-saywhat-grey/30 focus:border-saywhat-green focus:ring-2 focus:ring-saywhat-green/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-green/50 transition-all duration-200">
              <SelectValue placeholder="Select pay frequency" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg">
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-md font-medium mb-3">Benefits</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="medicalAid"
              checked={formData.medicalAid}
              onCheckedChange={(checked) => handleInputChange('medicalAid', checked)}
            />
            <Label htmlFor="medicalAid">Medical Aid</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="funeralCover"
              checked={formData.funeralCover}
              onCheckedChange={(checked) => handleInputChange('funeralCover', checked)}
            />
            <Label htmlFor="funeralCover">Funeral Cover</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vehicleBenefit"
              checked={formData.vehicleBenefit}
              onCheckedChange={(checked) => handleInputChange('vehicleBenefit', checked)}
            />
            <Label htmlFor="vehicleBenefit">Vehicle Benefit</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fuelAllowance"
              checked={formData.fuelAllowance}
              onCheckedChange={(checked) => handleInputChange('fuelAllowance', checked)}
            />
            <Label htmlFor="fuelAllowance">Fuel Allowance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="airtimeAllowance"
              checked={formData.airtimeAllowance}
              onCheckedChange={(checked) => handleInputChange('airtimeAllowance', checked)}
            />
            <Label htmlFor="airtimeAllowance">Airtime Allowance</Label>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="otherBenefits">Other Benefits (comma-separated)</Label>
          <Input
            id="otherBenefits"
            value={Array.isArray(formData.otherBenefits) ? formData.otherBenefits.join(', ') : ''}
            onChange={(e) => handleInputChange('otherBenefits', e.target.value.split(',').map(b => b.trim()))}
            placeholder="e.g., Housing allowance, Transport allowance"
          />
        </div>
      </div>
    </div>
    )
  }

  const renderStep5 = () => {
    return (
      <div className="space-y-4">
      <h3 className="text-lg font-medium">Education & Skills</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="education">Education Level</Label>
          <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Certificate">Certificate</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
              <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
              <SelectItem value="Master's Degree">Master's Degree</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <Input
            id="skills"
            value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
            onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()))}
            placeholder="e.g., JavaScript, Project Management, etc."
          />
        </div>
        <div>
          <Label htmlFor="certifications">Certifications (comma-separated)</Label>
          <Input
            id="certifications"
            value={Array.isArray(formData.certifications) ? formData.certifications.join(', ') : ''}
            onChange={(e) => handleInputChange('certifications', e.target.value.split(',').map(c => c.trim()))}
            placeholder="e.g., PMP, AWS Certified, etc."
          />
        </div>
        <div>
          <Label htmlFor="trainingRequired">Training Required (comma-separated)</Label>
          <Input
            id="trainingRequired"
            value={Array.isArray(formData.trainingRequired) ? formData.trainingRequired.join(', ') : ''}
            onChange={(e) => handleInputChange('trainingRequired', e.target.value.split(',').map(t => t.trim()))}
            placeholder="e.g., Safety Training, Software Training, etc."
          />
        </div>
      </div>
    </div>
    )
  }

  const renderStep6 = () => {
    return (
      <div className="space-y-6">
      <h3 className="text-lg font-medium">Access, Permissions & Documents</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSupervisor"
              checked={formData.isSupervisor}
              onCheckedChange={(checked) => handleInputChange('isSupervisor', checked)}
            />
            <Label htmlFor="isSupervisor">Is Supervisor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isReviewer"
              checked={formData.isReviewer}
              onCheckedChange={(checked) => handleInputChange('isReviewer', checked)}
            />
            <Label htmlFor="isReviewer">Is Reviewer</Label>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-md font-medium mb-3">System Access</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select value={formData.accessLevel} onValueChange={(value) => handleInputChange('accessLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="securityClearance">Security Clearance</Label>
              <Select value={formData.securityClearance} onValueChange={(value) => handleInputChange('securityClearance', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="secret">Secret</SelectItem>
                  <SelectItem value="top-secret">Top Secret</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="systemAccess">System Access (comma-separated)</Label>
            <Input
              id="systemAccess"
              value={Array.isArray(formData.systemAccess) ? formData.systemAccess.join(', ') : ''}
              onChange={(e) => handleInputChange('systemAccess', e.target.value.split(',').map(s => s.trim()))}
              placeholder="e.g., HR System, Finance System, etc."
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-md font-medium mb-3">Document Status</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="contractSigned"
                checked={formData.contractSigned}
                onCheckedChange={(checked) => handleInputChange('contractSigned', checked)}
              />
              <Label htmlFor="contractSigned">Contract Signed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="backgroundCheckCompleted"
                checked={formData.backgroundCheckCompleted}
                onCheckedChange={(checked) => handleInputChange('backgroundCheckCompleted', checked)}
              />
              <Label htmlFor="backgroundCheckCompleted">Background Check Completed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="medicalCheckCompleted"
                checked={formData.medicalCheckCompleted}
                onCheckedChange={(checked) => handleInputChange('medicalCheckCompleted', checked)}
              />
              <Label htmlFor="medicalCheckCompleted">Medical Check Completed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trainingCompleted"
                checked={formData.trainingCompleted}
                onCheckedChange={(checked) => handleInputChange('trainingCompleted', checked)}
              />
              <Label htmlFor="trainingCompleted">Training Completed</Label>
            </div>
          </div>

          {/* Documents Section */}
          <div className="border-t pt-6 mt-6">
            <h4 className="text-md font-medium mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Employee Documents
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "CV/Resume", category: "cv", icon: "📄" },
                { name: "ID Copy", category: "identification", icon: "🆔" },
                { name: "Qualifications", category: "qualifications", icon: "🎓" },
                { name: "Contracts", category: "contracts", icon: "📋" },
                { name: "Medical", category: "medical", icon: "🏥" },
                { name: "References", category: "references", icon: "📝" },
                { name: "Bank Details", category: "banking", icon: "🏦" },
                { name: "Other", category: "other", icon: "📁" }
              ].map((docType) => (
                <div
                  key={docType.category}
                  className="border border-gray-200 rounded-lg p-3 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    // Create a file input for document upload
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files
                      if (files) {
                        const newDocs = Array.from(files).map(file => ({
                          id: Math.random().toString(36).substr(2, 9),
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          category: docType.category
                        }))
                        handleInputChange('uploadedDocuments', [...formData.uploadedDocuments, ...newDocs])
                      }
                    }
                    input.click()
                  }}
                >
                  <div className="text-2xl mb-1">{docType.icon}</div>
                  <div className="text-xs font-medium">{docType.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.uploadedDocuments.filter(doc => doc.category === docType.category).length} files
                  </div>
                </div>
              ))}
            </div>

            {/* Uploaded Documents List */}
            {formData.uploadedDocuments.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Uploaded Documents ({formData.uploadedDocuments.length})</h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.uploadedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doc.name}</span>
                        <span className="text-xs text-gray-500">({doc.category})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedDocs = formData.uploadedDocuments.filter(d => d.id !== doc.id)
                          handleInputChange('uploadedDocuments', updatedDocs)
                        }}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Input
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Any additional notes or comments"
            />
          </div>
        </div>
      </div>
    </div>
    )
  }

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      case 6:
        return renderStep6()
      default:
        return renderStep1()
    }
  }

  return (
    <div className="max-w-7xl mx-auto bg-saywhat-white shadow-2xl rounded-xl border border-saywhat-grey/20">
      {/* Header with SAYWHAT Branding */}
      <div className="bg-gradient-to-r from-saywhat-black via-saywhat-dark to-saywhat-grey text-saywhat-white p-6 rounded-t-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-saywhat-orange/10 to-saywhat-red/5"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-saywhat-orange to-saywhat-red rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-saywhat-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-saywhat-white">
                {mode === 'create' ? 'Add New Employee' : 'Edit Employee'}
              </h2>
              <p className="text-saywhat-grey/80 text-sm font-medium">SAYWHAT Human Resource Management System</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-br from-saywhat-orange to-saywhat-red/80 px-6 py-3 rounded-xl shadow-lg border border-saywhat-white/20">
              <div className="text-saywhat-white font-bold text-xl">Step {currentStep}</div>
              <div className="text-saywhat-white/80 text-sm">of {totalSteps}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="p-8 border-b border-saywhat-grey/20 bg-gradient-to-r from-saywhat-light-grey to-saywhat-white">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-saywhat-black">Form Progress</h3>
          <div className="bg-saywhat-green/10 px-6 py-3 rounded-xl border border-saywhat-green/20">
            <div className="text-lg font-bold text-saywhat-green">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`relative px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                currentStep === step
                  ? 'bg-gradient-to-r from-saywhat-orange to-saywhat-red text-saywhat-white shadow-xl scale-110'
                  : currentStep > step
                  ? 'bg-gradient-to-r from-saywhat-green to-emerald-500 text-saywhat-white shadow-lg hover:shadow-xl'
                  : 'bg-saywhat-white text-saywhat-grey border-2 border-saywhat-grey/30 hover:bg-saywhat-light-grey hover:text-saywhat-black hover:border-saywhat-orange/50'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center w-6 h-6">
                {currentStep > step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </span>
              {currentStep === step && (
                <div className="absolute inset-0 bg-gradient-to-r from-saywhat-orange to-saywhat-red rounded-xl animate-pulse opacity-20"></div>
              )}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-saywhat-grey/20 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-saywhat-green via-saywhat-orange to-saywhat-red h-3 rounded-full transition-all duration-700 shadow-lg relative overflow-hidden"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          >
            <div className="absolute inset-0 bg-saywhat-white/30 animate-pulse"></div>
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mt-4 text-sm font-medium">
          {[
            { label: 'Personal', color: 'text-saywhat-grey' },
            { label: 'Contact', color: 'text-saywhat-grey' },
            { label: 'Employment', color: 'text-saywhat-grey' },
            { label: 'Compensation', color: 'text-saywhat-grey' },
            { label: 'Skills', color: 'text-saywhat-grey' },
            { label: 'Access', color: 'text-saywhat-grey' }
          ].map((item, index) => (
            <span 
              key={index}
              className={`${
                index + 1 === currentStep 
                  ? 'text-saywhat-orange font-bold' 
                  : index + 1 < currentStep 
                  ? 'text-saywhat-green font-semibold'
                  : item.color
              }`}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-10">
        <div className="min-h-[600px] bg-gradient-to-br from-saywhat-white to-saywhat-light-grey border-2 border-saywhat-grey/10 rounded-xl p-10 shadow-inner">
          {getCurrentStepContent()}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-gradient-to-r from-saywhat-light-grey via-saywhat-white to-saywhat-light-grey p-6 rounded-b-xl border-t-2 border-saywhat-grey/20">
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="border-2 border-saywhat-grey text-saywhat-black hover:bg-saywhat-grey hover:text-saywhat-white transition-all duration-300 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-2 border-saywhat-red text-saywhat-red hover:bg-saywhat-red hover:text-saywhat-white transition-all duration-300 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-gradient-to-r from-saywhat-orange to-saywhat-red hover:from-saywhat-red hover:to-saywhat-orange text-saywhat-white px-8 py-3 rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Next Step
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-saywhat-green to-emerald-600 hover:from-emerald-600 hover:to-saywhat-green text-saywhat-white px-10 py-3 rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-saywhat-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Employee...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {mode === 'create' ? 'Create Employee' : 'Update Employee'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
