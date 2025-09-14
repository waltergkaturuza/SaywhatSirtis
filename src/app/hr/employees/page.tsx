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
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [archiveReason, setArchiveReason] = useState("")
  const [archiveNotes, setArchiveNotes] = useState("")
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [editFormData, setEditFormData] = useState<any>({})
  const [formLoading, setFormLoading] = useState(false)
  
  // API state
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

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
            emp.hireDate
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

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee)
    setShowViewModal(true)
  }

  // Convert snake_case database fields to camelCase for form
  const convertDbDataToFormFormat = (dbData: any) => {
    return {
      id: dbData.id,
      firstName: dbData.firstName,
      lastName: dbData.lastName,
      middleName: dbData.middleName,
      email: dbData.email,
      phoneNumber: dbData.phoneNumber,
      alternativePhone: dbData.alternativePhone,
      address: dbData.address,
      dateOfBirth: dbData.dateOfBirth,
      gender: dbData.gender,
      nationality: dbData.nationality,
      nationalId: dbData.nationalId,
      emergencyContact: dbData.emergencyContact,
      emergencyPhone: dbData.emergencyPhone,
      employeeId: dbData.employeeId,
      position: dbData.position,
      departmentId: dbData.departmentId,
      employmentType: dbData.employmentType,
      startDate: dbData.startDate,
      hireDate: dbData.hireDate,
      salary: dbData.salary?.toString() || '',
      currency: dbData.currency,
      status: dbData.status,
      supervisorId: dbData.supervisor_id,
      isSupervisor: dbData.is_supervisor || false,
      isReviewer: dbData.is_reviewer || false,
      medicalAid: dbData.medical_aid || false,
      funeralCover: dbData.funeral_cover || false,
      vehicleBenefit: dbData.vehicle_benefit || false,
      fuelAllowance: dbData.fuel_allowance || false,
      airtimeAllowance: dbData.airtime_allowance || false,
      otherBenefits: dbData.other_benefits || []
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

  // Prepare form data for API (already in camelCase format expected by API)
  const prepareFormDataForApi = (formData: any) => {
    return {
      id: formData.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      alternativePhone: formData.alternativePhone,
      address: formData.address,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      nationality: formData.nationality,
      nationalId: formData.nationalId,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
      employeeId: formData.employeeId,
      position: formData.position,
      departmentId: formData.departmentId,
      employmentType: formData.employmentType,
      startDate: formData.startDate,
      hireDate: formData.hireDate,
      salary: formData.salary,
      currency: formData.currency,
      status: formData.status,
      supervisorId: formData.supervisorId,
      isSupervisor: formData.isSupervisor || false,
      isReviewer: formData.isReviewer || false,
      medicalAid: formData.medicalAid || false,
      funeralCover: formData.funeralCover || false,
      vehicleBenefit: formData.vehicleBenefit || false,
      fuelAllowance: formData.fuelAllowance || false,
      airtimeAllowance: formData.airtimeAllowance || false,
      otherBenefits: formData.otherBenefits ? 
        (Array.isArray(formData.otherBenefits) ? formData.otherBenefits : formData.otherBenefits.split(',').map((b: string) => b.trim())) 
        : []
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
        fetchEmployees()
        setShowEditModal(false)
        setEditFormData({})
        // You can add a toast notification here
        console.log('Employee updated successfully')
      } else {
        console.error('Failed to update employee:', result.error)
        alert('Failed to update employee: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Error updating employee. Please try again.')
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
        fetchEmployees()
        setShowCreateModal(false)
        console.log('Employee created successfully')
        alert('Employee created successfully!')
      } else {
        // Handle different error types
        if (response.status === 401) {
          alert('Authentication required. Please log in to create employees.')
        } else {
          alert(result.error || result.message || 'Failed to create employee')
        }
      }
    } catch (error) {
      console.error("Error creating employee:", error)
      alert('An error occurred while creating the employee. Please try again.')
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiFormData)
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh employee list and close modal
        fetchEmployees()
        setShowEditModal(false)
        setEditFormData({})
        setSelectedEmployee(null)
        console.log('Employee updated successfully')
        alert('Employee updated successfully!')
      } else {
        console.error('Failed to update employee:', result.error)
        alert('Failed to update employee: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Error updating employee. Please try again.')
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
      alert('Please select a reason for archiving.')
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
        fetchEmployees()
        setShowArchiveModal(false)
        setSelectedEmployee(null)
        console.log('Employee archived successfully:', selectedEmployee.id)
      } else {
        const error = await response.json()
        alert(`Failed to archive employee: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error archiving employee:', error)
      alert('Failed to archive employee. Please try again.')
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
        ['Hire Date', employee.hireDate],
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-saywhat-black uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-saywhat-black font-medium">{employee.department}</div>
                      <div className="text-sm text-saywhat-grey">{employee.location}</div>
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
                        {new Date(employee.hireDate).toLocaleDateString()}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-indigo-600">
                    {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h3>
                  <p className="text-gray-600">{selectedEmployee.position}</p>
                  <p className="text-sm text-gray-500">ID: {selectedEmployee.employeeId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmployee.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Department</Label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmployee.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Location</Label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmployee.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Hire Date</Label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedEmployee.hireDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                    {getStatusText(selectedEmployee.status)}
                  </span>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Performance Rating</Label>
                  <div className="mt-1 flex items-center">
                    <div className="flex">{renderStars(selectedEmployee.performance)}</div>
                    <span className="ml-2 text-sm text-gray-600">{selectedEmployee.performance}</span>
                  </div>
                </div>
              </div>
              
              {/* Training Certificates Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Training Certificates</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // TODO: Open certificate upload modal
                      alert('Certificate upload functionality will be implemented')
                    }}
                  >
                    <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                    Upload Certificate
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {/* Sample certificates - replace with actual data */}
                  {[
                    {
                      id: 1,
                      name: "Leadership Training Certificate",
                      issuer: "Agora Learning Platform",
                      dateCompleted: "2024-01-15",
                      certificateNumber: "AGR-2024-001",
                      status: "verified"
                    },
                    {
                      id: 2,
                      name: "Data Protection & Privacy",
                      issuer: "Learner's Hub",
                      dateCompleted: "2024-02-28",
                      certificateNumber: "LH-2024-047",
                      status: "verified"
                    },
                    {
                      id: 3,
                      name: "Project Management Basics",
                      issuer: "Agora Learning Platform",
                      dateCompleted: "2024-03-10",
                      certificateNumber: "AGR-2024-089",
                      status: "pending"
                    }
                  ].map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          cert.status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                          <p className="text-xs text-gray-500">
                            {cert.issuer} • {new Date(cert.dateCompleted).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">Cert #: {cert.certificateNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          cert.status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {cert.status === 'verified' ? 'Verified' : 'Pending'}
                        </span>
                        <Button size="sm" variant="ghost">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add certificate button */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <p className="text-sm text-gray-500 mb-2">Upload additional certificates</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement certificate upload
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.pdf,.jpg,.jpeg,.png'
                        input.multiple = true
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files) {
                            console.log('Certificate files selected:', files)
                            alert(`Selected ${files.length} certificate(s) for upload`)
                          }
                        }
                        input.click()
                      }}
                    >
                      <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <DownloadPDFButton
                  data={[selectedEmployee]}
                  filename={`employee-${selectedEmployee.employeeId}-profile`}
                  title={`${selectedEmployee.name} - Employee Profile`}
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
