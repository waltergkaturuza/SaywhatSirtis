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
import {
  UserGroupIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
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
  
  // API state
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")  // Fetch employees from API
  useEffect(() => {
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
    
    if (session) {
      fetchEmployees()
    }
  }, [session])

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
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </Link>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Employees</span>
            <span className="font-semibold">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Active</span>
            <span className="font-semibold text-green-600">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">On Leave</span>
            <span className="font-semibold text-orange-600">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Inactive</span>
            <span className="font-semibold text-gray-600">-</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Departments</h3>
        <div className="space-y-2">
          <div className="text-sm text-gray-500 text-center py-4">
            Loading departments...
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/hr/employees/add" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Add New Employee
          </Link>
          <Link href="/hr/employees/bulk-import" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Bulk Import
          </Link>
          <Link href="/hr/employees/reports" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Generate Report
          </Link>
        </div>
      </div>
    </div>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "on-leave":
        return "bg-orange-100 text-orange-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-white text-black"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active"
      case "on-leave":
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
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
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

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee)
    setShowEditModal(true)
  }

  const handleDeleteEmployee = (employeeId: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      // Implement delete functionality
      console.log('Deleting employee:', employeeId)
      // Here you would call an API to delete the employee
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
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employees by name, email, or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="Operations">Operations</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FunnelIcon className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Employee Directory ({filteredEmployees.length} employees)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {employee.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.position}</div>
                          <div className="text-xs text-gray-400">ID: {employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {employee.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {employee.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                      <div className="text-sm text-gray-500">{employee.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {getStatusText(employee.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex">{renderStars(employee.performance)}</div>
                        <span className="ml-2 text-sm text-gray-600">{employee.performance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(employee.hireDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Employee"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditEmployee(employee)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
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
                          className="text-green-600 hover:text-green-900 p-1 h-8 w-8"
                        />
                        <button 
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Employee"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
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
              
              <div className="flex justify-end space-x-3">
                <DownloadPDFButton
                  data={[selectedEmployee]}
                  filename={`employee-${selectedEmployee.employeeId}-profile`}
                  title={`${selectedEmployee.name} - Employee Profile`}
                  headers={['Name', 'Email', 'Phone', 'Department', 'Position', 'Status']}
                  variant="outline"
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
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={selectedEmployee.name}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={selectedEmployee.email}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    defaultValue={selectedEmployee.phone}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    defaultValue={selectedEmployee.employeeId}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select defaultValue={selectedEmployee.department}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    defaultValue={selectedEmployee.position}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    defaultValue={selectedEmployee.location}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={selectedEmployee.status}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Handle save employee changes
                    console.log('Saving employee changes')
                    setShowEditModal(false)
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModulePage>
  )
}
