"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { UserRole, Department, getDefaultRoleForDepartment, getRoleDisplayName, ROLE_DEFINITIONS } from "@/types/roles"
import { UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, BriefcaseIcon, AcademicCapIcon, KeyIcon, DocumentTextIcon, BuildingOfficeIcon, ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

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
  reviewerId: string
  startDate: string
  hireDate: string
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
  
  // Education & Skills (matching create form structure)
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
  trainingCompleted: boolean
  initialTrainingCompleted: boolean
  additionalNotes: string
  
  // Documents
  uploadedDocuments: Array<{
    id: string
    name: string
    type: string
    size: number
    category: string
    file?: File // The actual file object
    tempUrl?: string // Temporary URL for preview
  }>
  
  // System fields
  status: string
  alternativePhone: string
  nationality: string
  nationalId: string
  
  // Legacy compatibility fields
  trainingRequired: string[]
  benefits: string[]
  securityClearance: string
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
  
  const [roles, setRoles] = useState<SystemRole[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    reviewerId: "",
    startDate: "",
    hireDate: "",
    employmentType: "FULL_TIME",
    workLocation: "",
    country: "",
    province: "",
    isSupervisor: false,
    isReviewer: false,
    baseSalary: "",
    currency: "USD",
    payGrade: "",
    payFrequency: "monthly",
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
    education: "",
    skills: "",
    certifications: "",
    orientationTrainingRequired: false,
    securityTrainingRequired: false,
    departmentSpecificTrainingRequired: false,
    accessLevel: "basic",
    userRole: "",
    systemAccess: [],
    documentSecurityClearance: "PUBLIC",
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
    contractSigned: false,
    backgroundCheckCompleted: false,
    medicalCheckCompleted: false,
    trainingCompleted: false,
    initialTrainingCompleted: false,
    additionalNotes: "",
    uploadedDocuments: [],
    status: "ACTIVE",
    alternativePhone: "",
    nationality: "",
    nationalId: "",
    // Legacy compatibility
    trainingRequired: [],
    benefits: [],
    securityClearance: "none"
  })

  const totalSteps = 6 // Complete form with all sections

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
        emergencyContactName: employeeData.emergencyContactName || employeeData.emergencyContact || "",
        emergencyContactPhone: employeeData.emergencyContactPhone || employeeData.emergencyPhone || "",
        emergencyContactRelationship: employeeData.emergencyContactRelationship || employeeData.emergencyRelationship || "",
        employeeId: employeeData.employeeId || "",
        department: employeeData.department || "",
        departmentId: employeeData.departmentId || "",
        position: employeeData.position || "",
        supervisorId: employeeData.supervisorId || "",
        reviewerId: employeeData.reviewerId || "",
        startDate: employeeData.startDate ? new Date(employeeData.startDate).toISOString().split('T')[0] : "",
        hireDate: employeeData.hireDate ? new Date(employeeData.hireDate).toISOString().split('T')[0] : "",
        employmentType: employeeData.employmentType || "FULL_TIME",
        workLocation: employeeData.workLocation || "",
        country: employeeData.country || "",
        province: employeeData.province || "",
        isSupervisor: employeeData.isSupervisor || false,
        isReviewer: employeeData.isReviewer || false,
        baseSalary: employeeData.baseSalary || employeeData.salary?.toString() || "",
        currency: employeeData.currency || "USD",
        payGrade: employeeData.payGrade || "",
        payFrequency: employeeData.payFrequency || "monthly",
        healthInsurance: employeeData.healthInsurance || false,
        dentalCoverage: employeeData.dentalCoverage || false,
        visionCoverage: employeeData.visionCoverage || false,
        lifeInsurance: employeeData.lifeInsurance || false,
        retirementPlan: employeeData.retirementPlan || false,
        flexiblePTO: employeeData.flexiblePTO || false,
        medicalAid: employeeData.medicalAid || false,
        funeralCover: employeeData.funeralCover || false,
        vehicleBenefit: employeeData.vehicleBenefit || false,
        fuelAllowance: employeeData.fuelAllowance || false,
        airtimeAllowance: employeeData.airtimeAllowance || false,
        otherBenefits: employeeData.otherBenefits || (Array.isArray(employeeData.otherBenefits) ? employeeData.otherBenefits.join(', ') : ""),
        education: employeeData.education || "",
        skills: employeeData.skills || (Array.isArray(employeeData.skills) ? employeeData.skills.join(', ') : ""),
        certifications: employeeData.certifications || (Array.isArray(employeeData.certifications) ? employeeData.certifications.join(', ') : ""),
        orientationTrainingRequired: employeeData.orientationTrainingRequired || false,
        securityTrainingRequired: employeeData.securityTrainingRequired || false,
        departmentSpecificTrainingRequired: employeeData.departmentSpecificTrainingRequired || false,
        accessLevel: employeeData.accessLevel || "basic",
        userRole: employeeData.userRole || "",
        systemAccess: employeeData.systemAccess || [],
        documentSecurityClearance: employeeData.documentSecurityClearance || employeeData.securityClearance || "PUBLIC",
        jobDescription: employeeData.jobDescription || {
          jobTitle: employeeData.position || "",
          location: employeeData.workLocation || "",
          jobSummary: "",
          keyResponsibilities: [
            { description: "", weight: 0, tasks: "" }
          ],
          essentialExperience: "",
          essentialSkills: "",
          acknowledgment: false,
          signatureFile: null
        },
        contractSigned: employeeData.contractSigned || false,
        backgroundCheckCompleted: employeeData.backgroundCheckCompleted || false,
        medicalCheckCompleted: employeeData.medicalCheckCompleted || false,
        trainingCompleted: employeeData.trainingCompleted || false,
        initialTrainingCompleted: employeeData.initialTrainingCompleted || false,
        additionalNotes: employeeData.additionalNotes || "",
        uploadedDocuments: employeeData.uploadedDocuments || [],
        status: employeeData.status || "ACTIVE",
        alternativePhone: employeeData.alternativePhone || "",
        nationality: employeeData.nationality || "",
        nationalId: employeeData.nationalId || "",
        // Legacy compatibility
        trainingRequired: employeeData.trainingRequired || [],
        benefits: employeeData.benefits || [],
        securityClearance: employeeData.securityClearance || "none"
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

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true)
      const response = await fetch('/api/hr/roles')
      const result = await response.json()
      if (result.success && result.data?.roles && Array.isArray(result.data.roles)) {
        setRoles(result.data.roles)
      } else {
        console.warn('Invalid roles data received:', result)
        setRoles([])
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      setRoles([])
    } finally {
      setLoadingRoles(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchSupervisors()
    fetchRoles()
  }, [])

  // Cleanup temporary URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any temporary URLs to prevent memory leaks
      formData.uploadedDocuments?.forEach(doc => {
        if (doc.tempUrl) {
          URL.revokeObjectURL(doc.tempUrl)
        }
      })
    }
  }, [])

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      const newDocuments: Array<{
        id: string
        name: string
        type: string
        size: number
        category: string
        file: File
        tempUrl: string
      }> = []
      
      for (const file of Array.from(files)) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`)
          continue
        }

        // Validate file type based on category
        const allowedTypes = getAllowedFileTypes(category)
        if (!allowedTypes.some(type => file.type.includes(type) || file.name.toLowerCase().endsWith(type))) {
          alert(`File ${file.name} is not a supported format for ${category}.`)
          continue
        }

        // Create document object
        const document = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          category: category,
          file: file, // Store the actual file for later upload
          tempUrl: URL.createObjectURL(file) // For preview if needed
        }

        newDocuments.push(document)
      }

      // Add to form data
      setFormData(prev => ({
        ...prev,
        uploadedDocuments: [...(prev.uploadedDocuments || []), ...newDocuments]
      }))

      // Reset the input
      event.target.value = ''
      
      console.log(`Added ${newDocuments.length} documents to ${category} category`)
      
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    }
  }

  // Get allowed file types for each category
  const getAllowedFileTypes = (category: string): string[] => {
    switch (category) {
      case 'cv':
      case 'contracts':
        return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.pdf', '.doc', '.docx']
      case 'identification':
      case 'medical':
      case 'references':
      case 'bank':
        return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
      case 'qualifications':
        return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
      case 'other':
        return ['*'] // Allow all file types for other category
      default:
        return ['application/pdf', '.pdf']
    }
  }

  // Remove document from the list
  const removeDocument = (index: number) => {
    setFormData(prev => {
      const updatedDocuments = [...(prev.uploadedDocuments || [])]
      
      // Clean up temporary URL if it exists
      if (updatedDocuments[index]?.tempUrl) {
        URL.revokeObjectURL(updatedDocuments[index].tempUrl)
      }
      
      updatedDocuments.splice(index, 1)
      
      return {
        ...prev,
        uploadedDocuments: updatedDocuments
      }
    })
  }

  // Upload documents to repository
  const uploadDocumentsToRepository = async (employeeId: string, employeeName: string) => {
    if (!formData.uploadedDocuments || formData.uploadedDocuments.length === 0) {
      return []
    }

    const uploadedDocumentIds: Array<{
      documentId: string
      category: string
      originalName: string
      repositoryTitle: string
    }> = []

    try {
      for (const document of formData.uploadedDocuments) {
        if (!document.file) continue // Skip if no actual file

        // Create folder structure: HR/Employee Profiles/[Category]/[Employee Name or ID]/[Document Name]
        const sanitizedEmployeeName = employeeName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
        const documentCategory = document.category.charAt(0).toUpperCase() + document.category.slice(1).toLowerCase()
        const folderPath = `HR/Employee_Profiles/${documentCategory}_Files/${sanitizedEmployeeName}_${employeeId}`

        const uploadFormData = new FormData()
        uploadFormData.append('file', document.file)
        uploadFormData.append('title', `${employeeName} - ${document.category.toUpperCase()} - ${document.name}`)
        uploadFormData.append('description', `Employee ${document.category} document for ${employeeName} (ID: ${employeeId})`)
        
        // Document Repository required fields
        uploadFormData.append('category', 'Employee Documents') // Use proper category
        uploadFormData.append('classification', 'CONFIDENTIAL') // Employee docs are confidential
        uploadFormData.append('accessLevel', 'department') // HR department access
        uploadFormData.append('department', 'Human Resource Management')
        uploadFormData.append('uploadedBy', employeeName)
        uploadFormData.append('isPersonalRepo', 'false') // Main repository, not personal
        uploadFormData.append('status', 'APPROVED') // HR documents are pre-approved
        
        // Folder structure for organized storage
        uploadFormData.append('folderPath', folderPath)
        
        // Selected access (HR department access)
        uploadFormData.append('selectedDepartments', JSON.stringify(['Human Resource Management']))
        
        // Tags for better organization
        uploadFormData.append('tags', JSON.stringify([
          'employee-document',
          `employee-${employeeId}`,
          `category-${document.category}`,
          'hr-document',
          employeeName.toLowerCase().replace(/\s+/g, '-')
        ]))

        // Custom metadata for tracking
        const customMetadata = {
          relatedEmployeeId: employeeId,
          employeeName: employeeName,
          documentCategory: document.category,
          uploadContext: 'employee-form'
        }
        uploadFormData.append('customMetadata', JSON.stringify(customMetadata))

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: uploadFormData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to upload ${document.name}: ${errorData.error || 'Unknown error'}`)
        }

        const result = await response.json()
        if (result.success) {
          uploadedDocumentIds.push({
            documentId: result.document?.id || result.data?.id,
            category: document.category,
            originalName: document.name,
            repositoryTitle: result.document?.title || result.data?.title
          })
        }
      }

      console.log(`Successfully uploaded ${uploadedDocumentIds.length} documents to repository`)
      return uploadedDocumentIds
      
    } catch (error) {
      console.error('Error uploading documents to repository:', error)
      throw error
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Prepare the employee data
      const employeeData = {
        ...formData,
        salary: formData.baseSalary, // Map baseSalary to salary
        emergencyContact: formData.emergencyContactName,
        emergencyPhone: formData.emergencyContactPhone,
        emergencyRelationship: formData.emergencyContactRelationship
      }

      // Submit the employee data first
      await onSubmit(employeeData)
      
      // After successful employee creation/update, upload documents to repository
      if (formData.uploadedDocuments && formData.uploadedDocuments.length > 0) {
        const employeeName = `${formData.firstName} ${formData.lastName}`.trim()
        const employeeId = formData.employeeId || `EMP_${Date.now()}`
        
        try {
          await uploadDocumentsToRepository(employeeId, employeeName)
          console.log('Documents successfully uploaded to repository')
        } catch (docError) {
          console.error('Warning: Employee created but some documents failed to upload:', docError)
          // Don't fail the entire process if document upload fails
          alert('Employee was created successfully, but some documents failed to upload. You can upload them later from the employee profile.')
        }
      }
      
    } catch (error) {
      console.error('Error during form submission:', error)
      alert('Error saving employee. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
        <div>
          <Label htmlFor="workLocation">Work Location</Label>
          <Input
            id="workLocation"
            value={formData.workLocation}
            onChange={(e) => handleInputChange('workLocation', e.target.value)}
            className="border-2 border-saywhat-grey/30 focus:border-saywhat-green focus:ring-2 focus:ring-saywhat-green/20 rounded-lg px-4 py-3 bg-saywhat-white hover:border-saywhat-green/50 transition-all duration-200"
            placeholder="Enter work location"
          />
        </div>
      </div>
    </div>
    )
  }

  const renderStep4 = () => {
    return (
      <div className="space-y-4">
      <h3 className="text-lg font-medium">Compensation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Access Level</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              User Role & Access Level *
            </label>
            
            {loadingRoles ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-2 text-gray-600">Loading roles...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(roles) && roles.map((role) => (
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
                
                {Array.isArray(roles) && roles.length === 0 && !loadingRoles && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No roles available. Please contact your administrator.</p>
                  </div>
                )}
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
              {formData.userRole && Array.isArray(roles) && roles.find(r => r.id === formData.userRole) && (
                <span className="text-orange-600 font-medium ml-1">
                  (Automatically set to {roles.find(r => r.id === formData.userRole)?.documentLevel.replace('_', ' ')} based on selected role)
                </span>
              )}
            </p>
          </div>

          {/* System Module Access */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">System Module Access (Based on Selected Role):</h3>
            
            {formData.userRole && Array.isArray(roles) && roles.find(r => r.id === formData.userRole) ? (
              <div className="space-y-3">
                {(() => {
                  const selectedRole = Array.isArray(roles) ? roles.find(r => r.id === formData.userRole) : null
                  if (!selectedRole) return null
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
    )
  }

  const renderStep6 = () => {
    return (
      <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Skills</h3>
      <div className="space-y-6">
        {/* Education Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education Level *
          </label>
          <select
            value={formData.education || ''}
            onChange={(e) => handleInputChange('education', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select education level</option>
            <option value="High School">High School</option>
            <option value="Certificate">Certificate</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Master's Degree">Master's Degree</option>
            <option value="PhD">PhD</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills *
          </label>
          <textarea
            value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''}
            onChange={(e) => {
              const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
              handleInputChange('skills', skillsArray)
            }}
            placeholder="Enter skills separated by commas (e.g., Microsoft Office, Project Management, Communication, etc.)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certifications
          </label>
          <textarea
            value={Array.isArray(formData.certifications) ? formData.certifications.join(', ') : formData.certifications || ''}
            onChange={(e) => {
              const certificationsArray = e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert.length > 0)
              handleInputChange('certifications', certificationsArray)
            }}
            placeholder="Enter certifications separated by commas (e.g., PMP, AWS Certified, Microsoft Certified, etc.)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple certifications with commas</p>
        </div>

        {/* Training Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Training Requirements
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="orientationTraining"
                checked={formData.orientationTrainingRequired}
                onChange={(e) => handleInputChange('orientationTrainingRequired', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="orientationTraining" className="text-sm text-gray-700">
                Orientation Training Required
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="securityTraining"
                checked={formData.securityTrainingRequired}
                onChange={(e) => handleInputChange('securityTrainingRequired', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="securityTraining" className="text-sm text-gray-700">
                Security Training Required
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="departmentTraining"
                checked={formData.departmentSpecificTrainingRequired}
                onChange={(e) => handleInputChange('departmentSpecificTrainingRequired', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="departmentTraining" className="text-sm text-gray-700">
                Department-Specific Training Required
              </label>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.additionalNotes || ''}
            onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
            placeholder="Any additional notes, languages, or other relevant information..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Document Status */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium mb-4">Document Status</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="contractSigned"
                checked={formData.contractSigned}
                onChange={(e) => handleInputChange('contractSigned', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="contractSigned" className="text-sm text-gray-700">
                Contract Signed
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="backgroundCheckCompleted"
                checked={formData.backgroundCheckCompleted}
                onChange={(e) => handleInputChange('backgroundCheckCompleted', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="backgroundCheckCompleted" className="text-sm text-gray-700">
                Background Check Completed
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="medicalCheckCompleted"
                checked={formData.medicalCheckCompleted}
                onChange={(e) => handleInputChange('medicalCheckCompleted', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="medicalCheckCompleted" className="text-sm text-gray-700">
                Medical Check Completed
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trainingCompleted"
                checked={formData.trainingCompleted}
                onChange={(e) => handleInputChange('trainingCompleted', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="trainingCompleted" className="text-sm text-gray-700">
                Training Completed
              </label>
            </div>
          </div>
        </div>

        {/* Employee Documents */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium mb-4 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Employee Documents
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
            {/* CV/Resume */}
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-all">
              <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">CV/Resume</div>
              <div className="text-xs text-gray-500 mb-2">
                {formData.uploadedDocuments?.filter(doc => doc.category === 'cv')?.length || 0} files
              </div>
              <label className="cursor-pointer inline-flex items-center px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'cv')}
                />
              </label>
            </div>

            {/* ID Copy */}
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 mx-auto mb-2 bg-indigo-100 rounded-lg flex items-center justify-center">
                <IdentificationIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">ID Copy</div>
              <div className="text-xs text-gray-500 mb-2">
                {formData.uploadedDocuments?.filter(doc => doc.category === 'identification')?.length || 0} files
              </div>
              <label className="cursor-pointer inline-flex items-center px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'identification')}
                />
              </label>
            </div>

            {/* Qualifications */}
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-all">
              <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Qualifications</div>
              <div className="text-xs text-gray-500 mb-2">
                {formData.uploadedDocuments?.filter(doc => doc.category === 'qualifications')?.length || 0} files
              </div>
              <label className="cursor-pointer inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'qualifications')}
                />
              </label>
            </div>

            {/* Contracts */}
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-all">
              <div className="w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Contracts</div>
              <div className="text-xs text-gray-500 mb-2">
                {formData.uploadedDocuments?.filter(doc => doc.category === 'contracts')?.length || 0} files
              </div>
              <label className="cursor-pointer inline-flex items-center px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'contracts')}
                />
              </label>
            </div>

            {/* Medical */}
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-all">
              <div className="w-12 h-12 mx-auto mb-2 bg-pink-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Medical</div>
              <div className="text-xs text-gray-500 mb-2">
                {formData.uploadedDocuments?.filter(doc => doc.category === 'medical')?.length || 0} files
              </div>
              <label className="cursor-pointer inline-flex items-center px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded-md hover:bg-pink-200 transition-colors">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'medical')}
                />
              </label>
            </div>

            {/* References */}
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all">
              <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">References</div>
              <div className="text-xs text-gray-500 mb-2">
                {formData.uploadedDocuments?.filter(doc => doc.category === 'references')?.length || 0} files
              </div>
              <label className="cursor-pointer inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'references')}
                />
              </label>
            </div>

            {/* Bank Details */}
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Bank Details</div>
              <div className="text-xs text-gray-500 mb-2">
                {formData.uploadedDocuments?.filter(doc => doc.category === 'bank')?.length || 0} files
              </div>
              <label className="cursor-pointer inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'bank')}
                />
              </label>
            </div>

            {/* Other */}
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 transition-all">
              <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Other</div>
              <div className="text-xs text-blue-600 font-semibold mb-2">
                {formData.uploadedDocuments?.filter(doc => doc.category === 'other')?.length || 0} files
              </div>
              <label className="cursor-pointer inline-flex items-center px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
                <input
                  type="file"
                  multiple
                  accept="*/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'other')}
                />
              </label>
            </div>
          </div>

          {/* Uploaded Files List */}
          {formData.uploadedDocuments && formData.uploadedDocuments.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Uploaded Documents</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {formData.uploadedDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                        <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-xs text-gray-500">
                          {doc.category.toUpperCase()} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h6 className="text-sm font-medium text-blue-900 mb-1">Document Upload Guidelines</h6>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG</li>
                  <li>• Maximum file size: 10MB per file</li>
                  <li>• Documents will be saved to the central Document Repository</li>
                  <li>• Files can be accessed from HR module and employee profiles</li>
                  <li>• Document security clearance will be applied based on employee role</li>
                </ul>
              </div>
            </div>
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
    <div className="w-full bg-saywhat-white shadow-2xl rounded-xl border border-saywhat-grey/20">
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
        
        <div className="flex justify-between mb-8">
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
            { label: 'Access', color: 'text-saywhat-grey' },
            { label: 'Skills', color: 'text-saywhat-grey' }
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
                disabled={isLoading || isSubmitting}
                className="bg-gradient-to-r from-saywhat-green to-emerald-600 hover:from-emerald-600 hover:to-saywhat-green text-saywhat-white px-10 py-3 rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading || isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-saywhat-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isSubmitting ? 'Saving Documents & Employee...' : 'Saving Employee...'}
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
