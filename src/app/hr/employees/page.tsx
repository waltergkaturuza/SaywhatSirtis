"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ExportButton } from "@/components/ui/export-button"
import { ImportButton } from "@/components/ui/import-button"
import { PrintButton } from "@/components/ui/print-button"
import { DownloadExcelButton, DownloadPDFButton } from "@/components/ui/download-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmployeeForm } from "@/components/hr/EmployeeForm"
import { ARCHIVE_REASON_OPTIONS } from "@/types/employee"
import {
  UserGroupIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  StarIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline"

export default function EmployeesPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [activeViewTab, setActiveViewTab] = useState('personal')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [archiveReason, setArchiveReason] = useState("")
  const [archiveNotes, setArchiveNotes] = useState("")
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [editFormData, setEditFormData] = useState<any>({})
  const [formLoading, setFormLoading] = useState(false)
  
  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  
  // API state
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  
  // Employee documents state
  const [employeeDocuments, setEmployeeDocuments] = useState<any[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)

  // Helper function to format dates safely
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'Not Set'
    
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleDateString()
    } catch (error) {
      return 'Invalid Date'
    }
  }

  // Notification functions
  const showSuccessNotification = (message: string) => {
    setNotification({ type: 'success', message })
    setTimeout(() => {
      setNotification({ type: null, message: '' })
    }, 5000) // Auto hide after 5 seconds
  }

  const showErrorNotification = (message: string) => {
    setNotification({ type: 'error', message })
    setTimeout(() => {
      setNotification({ type: null, message: '' })
    }, 7000) // Auto hide after 7 seconds for errors
  }

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch('/api/hr/employees')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setEmployees(data.data || [])
    } catch (err) {
      console.error('Failed to fetch employees:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setEmployees([]) // Empty state instead of mock data
    } finally {
      setLoading(false)
    }
  }

  // Fetch employee documents from API
  const fetchEmployeeDocuments = async (employeeId: string) => {
    try {
      setDocumentsLoading(true)
      
      const response = await fetch(`/api/documents?employeeId=${employeeId}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const documents = await response.json()
      setEmployeeDocuments(documents || [])
    } catch (err) {
      console.error('Failed to fetch employee documents:', err)
      setEmployeeDocuments([])
    } finally {
      setDocumentsLoading(false)
    }
  }

  useEffect(() => {

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
    
    if (session) {
      fetchEmployees()
      fetchDepartments()
      fetchSupervisors()
    }
  }, [session])

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

  const metadata = {
    title: "Employee Directory",
    description: "Manage employee profiles, contacts, and basic information",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Employees" }
    ]
  }

  const actions = (
    <>
      <ImportButton
        onImportComplete={(result) => {
          if (result.success) {
            console.log('Import completed:', result)
            // Refresh employee data
          }
        }}
        acceptedFormats={['excel', 'csv']}
        templateFields={['name', 'email', 'phone', 'department', 'position', 'employeeId']}
        title="Import Employees"
        variant="outline"
        size="sm"
      />
      <ExportButton
        data={{
          headers: ['Name', 'Email', 'Phone', 'Department', 'Position', 'Employee ID', 'Status', 'Hire Date'],
          rows: employees.map(emp => [
            emp.name,
            emp.email,
            emp.phone,
            emp.department,
            emp.position,
            emp.employeeId,
            emp.status,
            formatDate(emp.hireDate)
          ])
        }}
        filename="employees-export"
        title="Export Employees"
        showOptions={true}
      />
      <Link href="/hr/employees/add">
        <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-saywhat-orange to-saywhat-red border border-transparent rounded-md shadow-md text-sm font-medium text-saywhat-white hover:from-saywhat-red hover:to-saywhat-orange hover:shadow-lg transition-all duration-200 transform hover:scale-105">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </Link>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-saywhat-green/10 to-saywhat-orange/5 border-l-4 border-saywhat-green/30 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-saywhat-black mb-4 flex items-center">
          <UserGroupIcon className="h-5 w-5 text-saywhat-orange mr-2" />
          Employee Stats
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-saywhat-white/50 rounded-md">
            <span className="text-sm text-saywhat-grey font-medium">Total Employees</span>
            <span className="font-bold text-saywhat-black bg-saywhat-orange/10 px-2 py-1 rounded">-</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-saywhat-white/50 rounded-md">
            <span className="text-sm text-saywhat-grey font-medium">Active</span>
            <span className="font-bold text-saywhat-green bg-saywhat-green/10 px-2 py-1 rounded">-</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-saywhat-white/50 rounded-md">
            <span className="text-sm text-saywhat-grey font-medium">On Leave</span>
            <span className="font-bold text-saywhat-orange bg-saywhat-orange/10 px-2 py-1 rounded">-</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-saywhat-white/50 rounded-md">
            <span className="text-sm text-saywhat-grey font-medium">Inactive</span>
            <span className="font-bold text-saywhat-grey bg-saywhat-grey/10 px-2 py-1 rounded">-</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-saywhat-orange/10 to-saywhat-green/5 border-l-4 border-saywhat-orange/30 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-saywhat-black mb-4 flex items-center">
          <FunnelIcon className="h-5 w-5 text-saywhat-green mr-2" />
          Departments
        </h3>
        <div className="space-y-2">
          <div className="text-sm text-saywhat-grey text-center py-4 bg-saywhat-white/50 rounded-md">
            Loading departments...
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-saywhat-red/5 to-saywhat-orange/10 border-l-4 border-saywhat-red/30 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-saywhat-black mb-4 flex items-center">
          <UserPlusIcon className="h-5 w-5 text-saywhat-red mr-2" />
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="block w-full text-left p-3 text-sm font-medium text-saywhat-orange hover:text-saywhat-white bg-saywhat-white hover:bg-gradient-to-r hover:from-saywhat-orange hover:to-saywhat-red rounded-lg border-l-2 border-saywhat-orange hover:border-saywhat-green shadow-sm hover:shadow-md transition-all duration-200"
          >
            Add New Employee
          </button>
          <Link href="/hr/employees/bulk-import" className="block w-full text-left p-3 text-sm font-medium text-saywhat-orange hover:text-saywhat-white bg-saywhat-white hover:bg-gradient-to-r hover:from-saywhat-orange hover:to-saywhat-red rounded-lg border-l-2 border-saywhat-orange hover:border-saywhat-green shadow-sm hover:shadow-md transition-all duration-200">
            Bulk Import
          </Link>
          <Link href="/hr/employees/reports" className="block w-full text-left p-3 text-sm font-medium text-saywhat-orange hover:text-saywhat-white bg-saywhat-white hover:bg-gradient-to-r hover:from-saywhat-orange hover:to-saywhat-red rounded-lg border-l-2 border-saywhat-orange hover:border-saywhat-green shadow-sm hover:shadow-md transition-all duration-200">
            Generate Report
          </Link>
        </div>
      </div>
    </div>
  )

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
      case "active":
        return "bg-saywhat-green/20 text-saywhat-green border border-saywhat-green/30"
      case "on-leave":
      case "on_leave":
        return "bg-saywhat-orange/20 text-saywhat-orange border border-saywhat-orange/30"
      case "inactive":
        return "bg-saywhat-grey/20 text-saywhat-grey border border-saywhat-grey/30"
      default:
        return "bg-saywhat-white text-saywhat-black border border-saywhat-grey/20"
    }
  }

  const getStatusText = (status: string) => {
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
      case "active":
        return "Active"
      case "on-leave":
      case "on_leave":
        return "On Leave"
      case "inactive":
        return "Inactive"
      default:
        return "Unknown"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-saywhat-orange fill-current"
            : "text-saywhat-grey/30"
        }`}
      />
    ))
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment
    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleViewEmployee = async (employee: any) => {
    try {
      setLoading(true)
      // Reset tab to personal when opening
      setActiveViewTab('personal')
      // Fetch complete employee data from the API
      const response = await fetch(`/api/hr/employees/${employee.id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log('✅ Employee API data received:', result.data)
          console.log('📞 Phone Number:', result.data.phoneNumber)
          console.log('📍 Address:', result.data.address)
          setSelectedEmployee(result.data)
          
          // Fetch employee documents using employee ID
          await fetchEmployeeDocuments(result.data.id)
        } else {
          console.error('Failed to fetch employee details:', result.error)
          setSelectedEmployee(employee) // Fallback to basic data
        }
      } else {
        console.error('Failed to fetch employee details')
        setSelectedEmployee(employee) // Fallback to basic data
      }
    } catch (error) {
      console.error('Error fetching employee details:', error)
      setSelectedEmployee(employee) // Fallback to basic data
    } finally {
      setLoading(false)
      setShowViewModal(true)
    }
  }

  // Convert snake_case database fields to camelCase for form
  const convertDbDataToFormFormat = (dbData: any) => {
    return {
      id: dbData.id,
      // Personal Information
      firstName: dbData.firstName,
      lastName: dbData.lastName,
      middleName: dbData.middleName,
      dateOfBirth: dbData.dateOfBirth,
      gender: dbData.gender,
      maritalStatus: dbData.maritalStatus || "",
      phoneNumber: dbData.phoneNumber,
      email: dbData.email,
      personalEmail: dbData.personalEmail,
      address: dbData.address,
      emergencyContactName: dbData.emergencyContact,
      emergencyContact: dbData.emergencyContact, // For EmployeeForm compatibility
      emergencyContactPhone: dbData.emergencyPhone,
      emergencyPhone: dbData.emergencyPhone, // For EmployeeForm compatibility
      emergencyContactRelationship: dbData.emergencyContactRelationship,
      emergencyRelationship: dbData.emergencyContactRelationship, // For EmployeeForm compatibility
      
      // Employment Information
      employeeId: dbData.employeeId,
      department: dbData.department || "",
      departmentId: dbData.departmentId,
      position: dbData.position,
      supervisorId: dbData.supervisor_id,
      reviewerId: dbData.reviewerId || "",
      startDate: dbData.startDate,
      hireDate: dbData.hireDate,
      employmentType: dbData.employmentType || "FULL_TIME",
      workLocation: dbData.workLocation || "",
      country: dbData.country || "",
      province: dbData.province || "",
      isSupervisor: dbData.is_supervisor || false,
      isReviewer: dbData.is_reviewer || false,
      
      // Compensation
      baseSalary: dbData.salary?.toString() || "",
      salary: dbData.salary?.toString() || "", // For EmployeeForm compatibility
      currency: dbData.currency || "USD",
      payGrade: dbData.payGrade || "",
      payFrequency: dbData.payFrequency || "monthly",
      benefits: dbData.benefits || [],
      
      // Additional Benefits (new fields)
      healthInsurance: dbData.healthInsurance || false,
      dentalCoverage: dbData.dentalCoverage || false,
      visionCoverage: dbData.visionCoverage || false,
      lifeInsurance: dbData.lifeInsurance || false,
      retirementPlan: dbData.retirementPlan || false,
      flexiblePTO: dbData.flexiblePTO || false,
      medicalAid: dbData.medical_aid || false,
      funeralCover: dbData.funeral_cover || false,
      vehicleBenefit: dbData.vehicle_benefit || false,
      fuelAllowance: dbData.fuel_allowance || false,
      airtimeAllowance: dbData.airtime_allowance || false,
      otherBenefits: dbData.other_benefits || [],
      
      // Education & Skills (updated to match create form)
      education: dbData.education || "",
      skills: dbData.skills || [],
      certifications: dbData.certifications || [],
      orientationTrainingRequired: dbData.orientationTrainingRequired || false,
      securityTrainingRequired: dbData.securityTrainingRequired || false,
      departmentSpecificTrainingRequired: dbData.departmentSpecificTrainingRequired || false,
      trainingRequired: dbData.trainingRequired || [],
      
      // Access & Security (updated)
      accessLevel: dbData.accessLevel || "basic",
      userRole: dbData.userRole || "",
      securityClearance: dbData.securityClearance || "none",
      documentSecurityClearance: dbData.documentSecurityClearance || dbData.securityClearance || "PUBLIC",
      systemAccess: dbData.systemAccess || [],
      
      // Job Description (new)
      jobDescription: dbData.jobDescription || {
        jobTitle: dbData.position || "",
        location: dbData.workLocation || "",
        jobSummary: "",
        keyResponsibilities: [
          { description: "", weight: 0, tasks: "" }
        ],
        essentialExperience: "",
        essentialSkills: "",
        acknowledgment: false,
        signatureFile: null
      },
      
      contractSigned: dbData.contractSigned || false,
      backgroundCheckCompleted: dbData.backgroundCheckCompleted || false,
      medicalCheckCompleted: dbData.medicalCheckCompleted || false,
      trainingCompleted: dbData.trainingCompleted || false,
      initialTrainingCompleted: dbData.initialTrainingCompleted || false,
      additionalNotes: dbData.additionalNotes || "",
      
      // Documents
      uploadedDocuments: dbData.uploadedDocuments || [],
      
      // System fields
      status: dbData.status || "ACTIVE",
      alternativePhone: dbData.alternativePhone,
      nationality: dbData.nationality,
      nationalId: dbData.nationalId
    }
  }

  const handleEditEmployee = async (employee: any) => {
    setSelectedEmployee(employee)
    setFormLoading(true)
    
    try {
      // Fetch full employee details
      const response = await fetch(`/api/hr/employees/${employee.id}`)
      const result = await response.json()
      
      if (result.success) {
        // Convert database format to form format
        const formData = convertDbDataToFormFormat(result.data)
        console.log('Database data:', result.data)
        console.log('Converted form data:', formData)
        setEditFormData(formData)
      } else {
        console.error('Failed to fetch employee details:', result.error)
        // Use basic employee data as fallback
        const formData = convertDbDataToFormFormat(employee)
        setEditFormData(formData)
      }
    } catch (error) {
      console.error('Error fetching employee details:', error)
      const formData = convertDbDataToFormFormat(employee)
      setEditFormData(formData)
    } finally {
      setFormLoading(false)
      setShowEditModal(true)
    }
  }

  // Prepare form data for API (convert form format to API format)
  const prepareFormDataForApi = (formData: any) => {
    return {
      id: formData.id,
      // Personal Information
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      personalEmail: formData.personalEmail,
      address: formData.address,
      emergencyContact: formData.emergencyContactName,
      emergencyPhone: formData.emergencyContactPhone,
      emergencyContactRelationship: formData.emergencyContactRelationship,
      
      // Employment Information
      employeeId: formData.employeeId,
      department: formData.department,
      departmentId: formData.departmentId,
      position: formData.position,
      supervisorId: formData.supervisorId,
      startDate: formData.startDate,
      hireDate: formData.hireDate,
      employmentType: formData.employmentType,
      workLocation: formData.workLocation,
      isSupervisor: formData.isSupervisor || false,
      isReviewer: formData.isReviewer || false,
      
      // Compensation
      salary: formData.baseSalary,
      currency: formData.currency,
      payGrade: formData.payGrade,
      payFrequency: formData.payFrequency,
      benefits: formData.benefits,
      
      // Additional Benefits
      medicalAid: formData.medicalAid || false,
      funeralCover: formData.funeralCover || false,
      vehicleBenefit: formData.vehicleBenefit || false,
      fuelAllowance: formData.fuelAllowance || false,
      airtimeAllowance: formData.airtimeAllowance || false,
      otherBenefits: formData.otherBenefits ? 
        (Array.isArray(formData.otherBenefits) ? formData.otherBenefits : formData.otherBenefits.split(',').map((b: string) => b.trim())) 
        : [],
      
      // Education & Skills
      education: formData.education,
      skills: formData.skills,
      certifications: formData.certifications,
      trainingRequired: formData.trainingRequired,
      
      // Access & Security
      accessLevel: formData.accessLevel,
      securityClearance: formData.securityClearance,
      systemAccess: formData.systemAccess,
      contractSigned: formData.contractSigned,
      backgroundCheckCompleted: formData.backgroundCheckCompleted,
      medicalCheckCompleted: formData.medicalCheckCompleted,
      trainingCompleted: formData.trainingCompleted,
      additionalNotes: formData.additionalNotes,
      
      // Documents
      uploadedDocuments: formData.uploadedDocuments,
      
      // System fields
      status: formData.status,
      alternativePhone: formData.alternativePhone,
      nationality: formData.nationality,
      nationalId: formData.nationalId
    }
  }

  const handleSaveEmployee = async () => {
    if (!editFormData.id) return

    setFormLoading(true)
    try {
      // Prepare form data for API
      const apiFormData = prepareFormDataForApi(editFormData)
      console.log('Original form data:', editFormData)
      console.log('API form data:', apiFormData)

      const response = await fetch(`/api/hr/employees/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiFormData)
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh employee list
        await fetchEmployees()
        setShowEditModal(false)
        setEditFormData({})
        showSuccessNotification('Employee updated successfully!')
        console.log('Employee updated successfully')
      } else {
        console.error('Failed to update employee:', result.error)
        showErrorNotification('Failed to update employee: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      showErrorNotification('Error updating employee. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCreateEmployee = async (formData: any) => {
    setFormLoading(true)
    try {
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData })
      })

      const result = await response.json()

      if (response.ok) {
        // Success - refresh employee list and close modal
        await fetchEmployees()
        setShowCreateModal(false)
        console.log('Employee created successfully')
        showSuccessNotification('Employee created successfully!')
      } else {
        // Handle different error types
        if (response.status === 401) {
          showErrorNotification('Authentication required. Please log in to create employees.')
        } else {
          showErrorNotification(result.error || result.message || 'Failed to create employee')
        }
      }
    } catch (error) {
      console.error("Error creating employee:", error)
      showErrorNotification('An error occurred while creating the employee. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateEmployee = async (formData: any) => {
    if (!selectedEmployee?.id) return

    setFormLoading(true)
    try {
      // Prepare form data for API
      const apiFormData = prepareFormDataForApi(formData)
      console.log('Updating employee with data:', apiFormData)

      const response = await fetch(`/api/hr/employees/${selectedEmployee.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiFormData)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('Employee updated successfully')
        
        // Wait for employee list to refresh completely before proceeding
        await fetchEmployees()
        
        // Close modal and clear form data
        setShowEditModal(false)
        setEditFormData({})
        setSelectedEmployee(null)
        
        // Show success notification after everything is complete
        showSuccessNotification('Employee updated successfully!')
      } else {
        console.error('Failed to update employee:', result.error)
        showErrorNotification('Failed to update employee: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      showErrorNotification('Error updating employee. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArchiveEmployee = async (employee: any) => {
    setSelectedEmployee(employee)
    setArchiveReason("")
    setArchiveNotes("")
    setShowArchiveModal(true)
  }

  const confirmArchiveEmployee = async () => {
    if (!archiveReason) {
      showErrorNotification('Please select a reason for archiving.')
      return
    }

    try {
      const response = await fetch(`/api/hr/employees/${selectedEmployee.id}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason: archiveReason,
          notes: archiveNotes
        })
      })

      if (response.ok) {
        await fetchEmployees()
        setShowArchiveModal(false)
        setSelectedEmployee(null)
        showSuccessNotification('Employee archived successfully!')
        console.log('Employee archived successfully:', selectedEmployee.id)
      } else {
        const error = await response.json()
        showErrorNotification(`Failed to archive employee: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error archiving employee:', error)
      showErrorNotification('Failed to archive employee. Please try again.')
    }
  }

  const handleExportEmployee = (employee: any) => {
    const exportData = {
      headers: ['Field', 'Value'],
      rows: [
        ['Name', employee.name],
        ['Email', employee.email],
        ['Phone', employee.phone],
        ['Department', employee.department],
        ['Position', employee.position],
        ['Employee ID', employee.employeeId],
        ['Hire Date', formatDate(employee.hireDate)],
        ['Status', employee.status],
        ['Performance', employee.performance.toString()],
        ['Location', employee.location]
      ]
    }
    
    // Use the export service to export individual employee
    console.log('Exporting employee:', employee.name)
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Notification Component */}
        {notification.type && (
          <div 
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30' 
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
            } rounded-lg border border-white/20 backdrop-blur-sm`}
          >
            <div className="flex items-start p-4">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification({ type: null, message: '' })}
                  className="inline-flex text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gradient-to-r from-saywhat-white to-saywhat-light-grey rounded-xl border-2 border-saywhat-orange/20 p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 text-saywhat-orange" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employees by name, email, or ID..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-saywhat-green/30 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange bg-saywhat-white text-saywhat-black placeholder-saywhat-grey shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-3 border-2 border-saywhat-green/30 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange bg-saywhat-white text-saywhat-black shadow-sm"
              >
                <option value="all">All Departments</option>
                {sortDepartmentsHierarchically(departments).map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {'  '.repeat(dept.level)}{dept.name}
                    {dept.code && ` (${dept.code})`}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border-2 border-saywhat-green/30 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange bg-saywhat-white text-saywhat-black shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <Link
                href="/hr/employees/archived"
                className="inline-flex items-center px-4 py-3 border-2 border-saywhat-green/30 rounded-lg text-sm font-medium text-saywhat-grey bg-saywhat-white hover:bg-saywhat-green hover:text-saywhat-white hover:border-saywhat-green shadow-sm hover:shadow-md transition-all duration-200"
              >
                <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                View Archived
              </Link>
              
              <button className="inline-flex items-center px-4 py-3 border-2 border-saywhat-orange/30 rounded-lg text-sm font-medium text-saywhat-grey bg-saywhat-white hover:bg-saywhat-orange hover:text-saywhat-white hover:border-saywhat-orange shadow-sm hover:shadow-md transition-all duration-200">
                <FunnelIcon className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-gradient-to-r from-saywhat-white to-saywhat-light-grey shadow-xl rounded-xl overflow-hidden border-2 border-saywhat-orange/20">
          <div className="px-6 py-5 border-b-2 border-saywhat-green/30 bg-gradient-to-r from-saywhat-green/10 to-saywhat-orange/5">
            <h3 className="text-xl font-bold text-saywhat-black flex items-center">
              <UserGroupIcon className="h-6 w-6 text-saywhat-orange mr-3" />
              Employee Directory ({filteredEmployees.length} employees)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-saywhat-orange/20">
              <thead className="bg-gradient-to-r from-saywhat-orange/10 to-saywhat-green/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-saywhat-black uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-saywhat-black uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-saywhat-black uppercase tracking-wider max-w-40">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-saywhat-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-saywhat-black uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-saywhat-black uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-saywhat-white divide-y-2 divide-saywhat-green/20">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gradient-to-r hover:from-saywhat-green/5 hover:to-saywhat-orange/5 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-saywhat-orange to-saywhat-red flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-saywhat-white">
                            {employee.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-saywhat-black">{employee.name}</div>
                          <div className="text-sm text-saywhat-grey font-medium">{employee.position}</div>
                          <div className="text-xs text-saywhat-orange font-medium">ID: {employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-saywhat-black flex items-center font-medium">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-saywhat-green" />
                        {employee.email}
                      </div>
                      <div className="text-sm text-saywhat-grey flex items-center mt-1">
                        <PhoneIcon className="h-4 w-4 mr-2 text-saywhat-orange" />
                        {employee.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-40">
                      <div className="text-sm text-saywhat-black font-medium break-words">{employee.department}</div>
                      <div className="text-sm text-saywhat-grey break-words">{employee.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {getStatusText(employee.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-saywhat-black">{employee.position}</div>
                      <div className="text-xs text-saywhat-grey font-medium">{employee.employmentType || 'Full Time'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-saywhat-black flex items-center font-medium">
                        <CalendarIcon className="h-4 w-4 mr-2 text-saywhat-green" />
                        {formatDate(employee.hireDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewEmployee(employee)}
                          className="text-saywhat-green hover:text-saywhat-white p-2 rounded-lg hover:bg-saywhat-green shadow-sm hover:shadow-md transition-all duration-200"
                          title="View Employee"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditEmployee(employee)}
                          className="text-saywhat-orange hover:text-saywhat-white p-2 rounded-lg hover:bg-saywhat-orange shadow-sm hover:shadow-md transition-all duration-200"
                          title="Edit Employee"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <DownloadPDFButton
                          data={[employee]}
                          filename={`employee-${employee.employeeId}`}
                          title={`${employee.name} Profile`}
                          headers={['Name', 'Email', 'Phone', 'Department', 'Position', 'Employee ID', 'Status']}
                          variant="ghost"
                          size="sm"
                          iconOnly={true}
                          className="text-saywhat-green hover:text-saywhat-white p-2 rounded-lg hover:bg-saywhat-green shadow-sm hover:shadow-md transition-all duration-200 h-9 w-9"
                        />
                        <button 
                          onClick={() => handleArchiveEmployee(employee)}
                          className="text-saywhat-red hover:text-saywhat-white p-2 rounded-lg hover:bg-saywhat-red shadow-sm hover:shadow-md transition-all duration-200"
                          title="Archive Employee"
                        >
                          <ArchiveBoxIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12 bg-gradient-to-r from-saywhat-green/5 to-saywhat-orange/5">
              <UserGroupIcon className="mx-auto h-12 w-12 text-saywhat-orange" />
              <h3 className="mt-2 text-sm font-semibold text-saywhat-black">No employees found</h3>
              <p className="mt-1 text-sm text-saywhat-grey">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Employee Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="flex items-center space-x-6 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-l-4 border-orange-500">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(selectedEmployee.firstName?.[0] || '') + (selectedEmployee.lastName?.[0] || '')}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedEmployee.firstName} {selectedEmployee.middleName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-lg text-gray-600">{selectedEmployee.position}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">ID: {selectedEmployee.employeeId}</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                      {getStatusText(selectedEmployee.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabbed Content */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'personal', label: 'Personal Info', icon: '👤' },
                    { id: 'employment', label: 'Employment', icon: '💼' },
                    { id: 'compensation', label: 'Compensation', icon: '💰' },
                    { id: 'skills', label: 'Skills & Education', icon: '🎓' },
                    { id: 'access', label: 'Access & Security', icon: '🔐' },
                    { id: 'documents', label: 'Documents', icon: '📄' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveViewTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeViewTab === tab.id
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="py-6">
                {activeViewTab === 'personal' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.firstName} {selectedEmployee.middleName} {selectedEmployee.lastName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.dateOfBirth ? formatDate(selectedEmployee.dateOfBirth) : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Gender</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Marital Status</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.maritalStatus || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Nationality</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.nationality || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">National ID</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.nationalId || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Personal Email</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.personalEmail || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.phoneNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Alternative Phone</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.alternativePhone || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Address</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.address || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Emergency Contact</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.emergencyContact || 'Not provided'}
                          {selectedEmployee.emergencyPhone && ` - ${selectedEmployee.emergencyPhone}`}
                          {selectedEmployee.emergencyContactRelationship && ` (${selectedEmployee.emergencyContactRelationship})`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 'employment' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Employee ID</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.employeeId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Position</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.position}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Department</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Supervisor</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.supervisor 
                            ? `${selectedEmployee.supervisor.firstName} ${selectedEmployee.supervisor.lastName}` 
                            : 'Not assigned'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Work Location</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.workLocation || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.startDate ? formatDate(selectedEmployee.startDate) : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Hire Date</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.hireDate ? formatDate(selectedEmployee.hireDate) : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Employment Type</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.employmentType || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Supervisor Role</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.isSupervisor ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Reviewer Role</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.isReviewer ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 'compensation' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Salary</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.salary 
                            ? `${selectedEmployee.currency || 'USD'} ${Number(selectedEmployee.salary).toLocaleString()}`
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Pay Grade</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.payGrade || 'Not assigned'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Pay Frequency</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.payFrequency || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Benefits</Label>
                        <div className="mt-2 space-y-1">
                          {[
                            { key: 'medicalAid', label: 'Medical Aid' },
                            { key: 'funeralCover', label: 'Funeral Cover' },
                            { key: 'vehicleBenefit', label: 'Vehicle Benefit' },
                            { key: 'fuelAllowance', label: 'Fuel Allowance' },
                            { key: 'airtimeAllowance', label: 'Airtime Allowance' }
                          ].map(benefit => (
                            <div key={benefit.key} className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                selectedEmployee[benefit.key] ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              <span className="text-sm text-gray-700">{benefit.label}</span>
                            </div>
                          ))}
                          {selectedEmployee.otherBenefits && selectedEmployee.otherBenefits.length > 0 && (
                            <div className="mt-2">
                              <Label className="text-xs font-medium text-gray-600">Other Benefits:</Label>
                              <p className="text-sm text-gray-900">{selectedEmployee.otherBenefits.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 'skills' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Education Level</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.education || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Skills</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {Array.isArray(selectedEmployee.skills) 
                            ? selectedEmployee.skills.join(', ') 
                            : selectedEmployee.skills || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Certifications</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {Array.isArray(selectedEmployee.certifications) 
                            ? selectedEmployee.certifications.join(', ') 
                            : selectedEmployee.certifications || 'None listed'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Training Requirements</Label>
                      <div className="mt-2 space-y-1">
                        {[
                          { key: 'orientationTrainingRequired', label: 'Orientation Training' },
                          { key: 'securityTrainingRequired', label: 'Security Training' },
                          { key: 'departmentSpecificTrainingRequired', label: 'Department-Specific Training' }
                        ].map(training => (
                          <div key={training.key} className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              selectedEmployee[training.key] ? 'bg-orange-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-sm text-gray-700">{training.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedEmployee.additionalNotes && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Additional Notes</Label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeViewTab === 'access' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">User Role</Label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                          {selectedEmployee.userRole ? 
                            selectedEmployee.userRole.replace(/_/g, ' ').toUpperCase() : 
                            'Not set'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Determines system module access permissions
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Document Security Clearance</Label>
                        <p className={`mt-1 text-sm font-medium ${
                          selectedEmployee.documentSecurityClearance === 'TOP_SECRET' ? 'text-red-600' :
                          selectedEmployee.documentSecurityClearance === 'SECRET' ? 'text-orange-600' :
                          selectedEmployee.documentSecurityClearance === 'CONFIDENTIAL' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {selectedEmployee.documentSecurityClearance ? 
                            selectedEmployee.documentSecurityClearance.replace(/_/g, ' ') : 
                            'PUBLIC'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum document classification level accessible
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">System Access Modules</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {Array.isArray(selectedEmployee.systemAccess) && selectedEmployee.systemAccess.length > 0
                            ? selectedEmployee.systemAccess.join(', ')
                            : 'Based on assigned role'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Available system modules and permission levels
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Security Status</Label>
                        <div className="mt-2 space-y-1">
                          {[
                            { key: 'contractSigned', label: 'Contract Signed' },
                            { key: 'backgroundCheckCompleted', label: 'Background Check' },
                            { key: 'medicalCheckCompleted', label: 'Medical Check' },
                            { key: 'trainingCompleted', label: 'Security Training' }
                          ].map(status => (
                            <div key={status.key} className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                selectedEmployee[status.key] ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span className="text-sm text-gray-700">{status.label}</span>
                              <span className={`ml-2 text-xs ${
                                selectedEmployee[status.key] ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {selectedEmployee[status.key] ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Access Level (Legacy)</Label>
                        <p className="mt-1 text-sm text-gray-500 italic">
                          {selectedEmployee.accessLevel || 'Not set'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          ⚠️ Legacy field - Use Document Security Clearance above
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 'documents' && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-4 block">Employee Documents</Label>
                      
                      {documentsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                          <span className="ml-2 text-gray-600">Loading documents...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-4">
                          {[
                            { category: 'cv', label: 'CV/Resume', icon: '📄', color: 'purple' },
                            { category: 'identification', label: 'ID Copy', icon: '🆔', color: 'indigo' },
                            { category: 'qualifications', label: 'Qualifications', icon: '🎓', color: 'green' },
                            { category: 'contracts', label: 'Contracts', icon: '📋', color: 'orange' },
                            { category: 'medical', label: 'Medical', icon: '🏥', color: 'pink' },
                            { category: 'references', label: 'References', icon: '📝', color: 'blue' },
                            { category: 'bank', label: 'Bank Details', icon: '🏦', color: 'gray' },
                            { category: 'other', label: 'Other', icon: '📁', color: 'yellow' }
                          ].map(docType => {
                            // Filter documents by category
                            const categoryDocs = employeeDocuments.filter((doc: any) => {
                              // Map uploaded category to display category
                              const categoryMap: { [key: string]: string } = {
                                'cv': 'cv',
                                'education': 'qualifications',
                                'identification': 'identification',
                                'contracts': 'contracts',
                                'medical': 'medical',
                                'references': 'references',
                                'bank': 'bank',
                                'other': 'other'
                              }
                              return categoryMap[doc.category?.toLowerCase()] === docType.category ||
                                     doc.fileName?.toLowerCase().includes(docType.category) ||
                                     doc.title?.toLowerCase().includes(docType.category)
                            })
                            
                            const count = categoryDocs.length
                            
                            return (
                              <div 
                                key={docType.category} 
                                className={`text-center p-4 border border-gray-200 rounded-lg transition-all ${
                                  count > 0 ? 'hover:border-orange-300 cursor-pointer hover:shadow-md' : ''
                                }`}
                                onClick={() => {
                                  if (count > 0) {
                                    // Handle document category click
                                    console.log(`Documents for category ${docType.category}:`, categoryDocs)
                                  }
                                }}
                              >
                                <div className={`w-12 h-12 mx-auto mb-2 bg-${docType.color}-100 rounded-lg flex items-center justify-center text-2xl`}>
                                  {docType.icon}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{docType.label}</div>
                                <div className="text-xs text-gray-500">{count} file{count !== 1 ? 's' : ''}</div>
                                
                                {/* Show document list if there are documents */}
                                {count > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {categoryDocs.slice(0, 3).map((doc: any, index: number) => (
                                      <div 
                                        key={index}
                                        className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer truncate"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          // Open document in new tab
                                          window.open(`/documents/view/${doc.id}`, '_blank')
                                        }}
                                        title={doc.title}
                                      >
                                        {doc.title}
                                      </div>
                                    ))}
                                    {count > 3 && (
                                      <div className="text-xs text-gray-500">
                                        +{count - 3} more
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      
                      {/* All Documents List */}
                      {!documentsLoading && employeeDocuments.length > 0 && (
                        <div className="mt-8">
                          <h4 className="text-md font-medium text-gray-900 mb-4">All Documents ({employeeDocuments.length})</h4>
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="max-h-60 overflow-y-auto">
                              {employeeDocuments.map((doc: any, index: number) => (
                                <div 
                                  key={index}
                                  className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => window.open(`/documents/view/${doc.id}`, '_blank')}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                      <span className="text-xs font-medium text-blue-600">
                                        {doc.type || 'DOC'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                                      <div className="text-xs text-gray-500">
                                        {doc.uploadDate} • {doc.size} • {doc.uploadedBy}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      doc.classification === 'PUBLIC' ? 'bg-green-100 text-green-800' :
                                      doc.classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' :
                                      doc.classification === 'CONFIDENTIAL' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {doc.classification}
                                    </span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {!documentsLoading && employeeDocuments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-2">No documents found for this employee</p>
                          <p className="text-sm text-gray-400">Documents uploaded during employee creation will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 border-t pt-6">
                <DownloadPDFButton
                  data={[selectedEmployee]}
                  filename={`employee-${selectedEmployee.employeeId}-profile`}
                  title={`${selectedEmployee.firstName} ${selectedEmployee.lastName} - Employee Profile`}
                  headers={['Name', 'Email', 'Phone', 'Department', 'Position', 'Status']}
                  variant="outline"
                  iconOnly={false}
                />
                <Button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditEmployee(selectedEmployee)
                  }}
                >
                  Edit Employee
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        setShowEditModal(open)
        if (!open) {
          setEditFormData({})
          setSelectedEmployee(null)
        }
      }}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-saywhat-orange to-saywhat-red bg-clip-text text-transparent">
              Edit Employee
            </DialogTitle>
          </DialogHeader>
          {formLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2">Loading employee details...</span>
            </div>
          ) : editFormData && Object.keys(editFormData).length > 0 && (
            <EmployeeForm
              mode="edit"
              employeeData={editFormData}
              onSubmit={handleUpdateEmployee}
              onCancel={() => {
                setShowEditModal(false)
                setEditFormData({})
                setSelectedEmployee(null)
              }}
              isLoading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Employee Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto p-0">
          <div className="p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl font-bold text-saywhat-black">Add New Employee</DialogTitle>
            </DialogHeader>
            <EmployeeForm
              mode="create"
              onSubmit={handleCreateEmployee}
              onCancel={() => setShowCreateModal(false)}
              isLoading={formLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Employee Modal */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Archive Employee</DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Archiving {selectedEmployee.firstName} {selectedEmployee.lastName} will:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                  <li>Move them to archived employees</li>
                  <li>Automatically revoke system access</li>
                  <li>Preserve all historical data</li>
                  <li>Allow future restoration if needed</li>
                </ul>
              </div>

              <div>
                <Label htmlFor="archiveReason">Reason for Archiving *</Label>
                <Select value={archiveReason} onValueChange={setArchiveReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ARCHIVE_REASON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="archiveNotes">Additional Notes (Optional)</Label>
                <textarea
                  id="archiveNotes"
                  value={archiveNotes}
                  onChange={(e) => setArchiveNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Any additional information about the archiving..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowArchiveModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmArchiveEmployee}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                  Archive Employee
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModulePage>
  )
}
