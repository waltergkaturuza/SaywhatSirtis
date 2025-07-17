"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  ArchiveBoxIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline"

export default function EmployeeArchivePage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  const metadata = {
    title: "Employee Archive",
    description: "Manage archived employees and system access control",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Employees", href: "/hr/employees" },
      { name: "Employee Archive" }
    ]
  }

  // Check user permissions for HR access
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')
  const canArchiveEmployees = isHRStaff || userPermissions.includes('hr.employees.archive')

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Export Archive
      </button>
      {canArchiveEmployees && (
        <Link href="/hr/employees">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
            <UserIcon className="h-4 w-4 mr-2" />
            Active Employees
          </button>
        </Link>
      )}
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Archive Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Archived</span>
            <span className="font-semibold text-gray-600">156</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">This Year</span>
            <span className="font-semibold text-red-600">23</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Access Revoked</span>
            <span className="font-semibold text-orange-600">156</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Data Retained</span>
            <span className="font-semibold text-blue-600">156</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Archive Reasons</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Resignation</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }}></div>
              </div>
              <span className="text-xs text-gray-500">60%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Retirement</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "25%" }}></div>
              </div>
              <span className="text-xs text-gray-500">25%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Termination</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "10%" }}></div>
              </div>
              <span className="text-xs text-gray-500">10%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Other</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "5%" }}></div>
              </div>
              <span className="text-xs text-gray-500">5%</span>
            </div>
          </div>
        </div>
      </div>

      {canArchiveEmployees && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/hr/employees" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              View Active Employees
            </Link>
            <Link href="/hr/employees/archive/bulk" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              Bulk Archive
            </Link>
            <Link href="/hr/employees/archive/restore" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              Restore Employee
            </Link>
            <Link href="/hr/employees/archive/export" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              Export Data
            </Link>
          </div>
        </div>
      )}
    </div>
  )

  const archivedEmployees = [
    {
      id: 1,
      name: "James Wilson",
      employeeId: "EMP098",
      email: "james.wilson@saywhat.org",
      phone: "+234 803 456 7890",
      department: "Operations",
      position: "Senior Operations Officer",
      hireDate: "2020-03-15",
      archiveDate: "2024-01-15",
      archiveReason: "Resignation",
      lastLogin: "2024-01-14T18:30:00Z",
      systemAccess: "revoked",
      dataRetention: "retained",
      supervisor: "Sarah Johnson",
      exitInterview: true,
      clearanceStatus: "completed"
    },
    {
      id: 2,
      name: "Rebecca Adamu",
      employeeId: "EMP076",
      email: "rebecca.adamu@saywhat.org",
      phone: "+234 805 234 5678",
      department: "Healthcare",
      position: "Healthcare Assistant",
      hireDate: "2019-08-22",
      archiveDate: "2024-01-08",
      archiveReason: "Retirement",
      lastLogin: "2024-01-07T15:45:00Z",
      systemAccess: "revoked",
      dataRetention: "retained",
      supervisor: "Dr. Amina Hassan",
      exitInterview: true,
      clearanceStatus: "completed"
    },
    {
      id: 3,
      name: "Peter Okafor",
      employeeId: "EMP089",
      email: "peter.okafor@saywhat.org",
      phone: "+234 807 345 6789",
      department: "Finance",
      position: "Accounts Assistant",
      hireDate: "2021-11-10",
      archiveDate: "2023-12-20",
      archiveReason: "Termination",
      lastLogin: "2023-12-19T14:20:00Z",
      systemAccess: "revoked",
      dataRetention: "retained",
      supervisor: "Jennifer Smith",
      exitInterview: false,
      clearanceStatus: "pending"
    },
    {
      id: 4,
      name: "Grace Okoro",
      employeeId: "EMP103",
      email: "grace.okoro@saywhat.org",
      phone: "+234 809 876 5432",
      department: "HR",
      position: "HR Assistant",
      hireDate: "2022-06-01",
      archiveDate: "2024-01-20",
      archiveReason: "Resignation",
      lastLogin: "2024-01-19T16:00:00Z",
      systemAccess: "revoked",
      dataRetention: "retained",
      supervisor: "Sarah Johnson",
      exitInterview: true,
      clearanceStatus: "completed"
    }
  ]

  const getArchiveReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case "resignation":
        return "bg-blue-100 text-blue-800"
      case "retirement":
        return "bg-green-100 text-green-800"
      case "termination":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAccessStatusColor = (status: string) => {
    switch (status) {
      case "revoked":
        return "bg-red-100 text-red-800"
      case "suspended":
        return "bg-yellow-100 text-yellow-800"
      case "active":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getClearanceStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEmployees = archivedEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment
    const matchesStatus = selectedStatus === "all" || employee.archiveReason.toLowerCase() === selectedStatus.toLowerCase()
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleArchiveEmployee = (employee: any) => {
    setSelectedEmployee(employee)
    setShowArchiveModal(true)
  }

  const handleRestoreEmployee = (employeeId: string) => {
    // Implementation for restoring employee access
    console.log(`Restoring employee ${employeeId}`)
  }

  if (!canArchiveEmployees) {
    return (
      <ModulePage metadata={metadata} actions={<></>} sidebar={<></>}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access the employee archive.
            </p>
          </div>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Archive Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ArchiveBoxIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">156</h3>
                <p className="text-sm text-gray-500">Total Archived</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">All time</span>
                <span className="text-gray-600 font-medium">Historical</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <LockClosedIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">156</h3>
                <p className="text-sm text-gray-500">Access Revoked</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">System access</span>
                <span className="text-red-600 font-medium">100%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">156</h3>
                <p className="text-sm text-gray-500">Data Retained</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Records kept</span>
                <span className="text-blue-600 font-medium">Secure</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">23</h3>
                <p className="text-sm text-gray-500">This Year</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">2024 Archives</span>
                <span className="text-yellow-600 font-medium">Recent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Archive Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Employee Archive Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Archived employees have had their system access completely revoked. Their data is retained for historical and compliance purposes. 
                Only HR staff can restore access if needed.
              </p>
            </div>
          </div>
        </div>

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
                  placeholder="Search archived employees by name, email, or ID..."
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
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Reasons</option>
                <option value="resignation">Resignation</option>
                <option value="retirement">Retirement</option>
                <option value="termination">Termination</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Archived Employees Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Archived Employees ({filteredEmployees.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Former employees with revoked system access
            </p>
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
                    Archive Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archive Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System Access
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clearance
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
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {employee.name.split(' ').map(n => n[0]).join('')}
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
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{employee.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getArchiveReasonColor(employee.archiveReason)}`}>
                        {employee.archiveReason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(employee.archiveDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccessStatusColor(employee.systemAccess)}`}>
                        {employee.systemAccess.charAt(0).toUpperCase() + employee.systemAccess.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClearanceStatusColor(employee.clearanceStatus)}`}>
                        {employee.clearanceStatus.charAt(0).toUpperCase() + employee.clearanceStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link href={`/hr/employees/archived/${employee.id}`}>
                          <button className="text-blue-600 hover:text-blue-900">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleRestoreEmployee(employee.employeeId)}
                          className="text-green-600 hover:text-green-900"
                          title="Restore Employee Access"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
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
              <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No archived employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </ModulePage>
  )
}
