"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  UserPlusIcon,
  UsersIcon,
  CogIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  KeyIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon
} from "@heroicons/react/24/outline"

export default function EmployeeManagementPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSecretariat, setFilterSecretariat] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const metadata = {
    title: "Employee Management",
    description: "Manage employees, access levels, and system permissions",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Employee Management" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Export List
      </button>
      <Link href="/hr/employees/archived">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <UsersIcon className="h-4 w-4 mr-2" />
          Archived Employees
        </button>
      </Link>
      <button 
        onClick={() => setShowAddModal(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
      >
        <UserPlusIcon className="h-4 w-4 mr-2" />
        Add Employee
      </button>
    </>
  )

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')
  const canManageEmployees = isHRStaff || userPermissions.includes('hr.manage_employees')

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Employees</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending Approval</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secretariat</label>
            <select
              value={filterSecretariat}
              onChange={(e) => setFilterSecretariat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Secretariats</option>
              <option value="operations">Operations</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance & Admin</option>
              <option value="programs">Programs & M&E</option>
              <option value="governance">Governance</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Stats</h3>
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-green-800">293</div>
            <div className="text-sm text-green-600">Active Employees</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-yellow-800">8</div>
            <div className="text-sm text-yellow-600">Pending Approval</div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-red-800">15</div>
            <div className="text-sm text-red-600">Archived This Month</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            Add New Employee
          </button>
          <Link href="/hr/employees/import" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Bulk Import
          </Link>
          <Link href="/hr/employees/permissions" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Manage Permissions
          </Link>
          <Link href="/hr/employees/archived" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            View Archived
          </Link>
        </div>
      </div>
    </div>
  )

  const employees = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@saywhat.org",
      phone: "+234-801-123-4567",
      staffId: "SW001",
      position: "Senior Program Officer",
      secretariat: "Programs & M&E",
      supervisor: "Mark Wilson",
      accessLevel: "Standard User",
      permissions: ["programs.view", "programs.edit", "documents.view"],
      status: "active",
      joinDate: "2023-01-15",
      lastLogin: "2024-01-15 14:30",
      performanceRating: 4.2,
      profileImage: "/api/placeholder/32/32"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@saywhat.org",
      phone: "+234-803-987-6543",
      staffId: "SW002",
      position: "Healthcare Coordinator",
      secretariat: "Healthcare",
      supervisor: "Dr. Amina Hassan",
      accessLevel: "Department Admin",
      permissions: ["healthcare.full", "hr.view", "documents.edit"],
      status: "active",
      joinDate: "2022-11-20",
      lastLogin: "2024-01-15 11:45",
      performanceRating: 4.5,
      profileImage: "/api/placeholder/32/32"
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@saywhat.org",
      phone: "+234-805-456-7890",
      staffId: "SW003",
      position: "Finance Assistant",
      secretariat: "Finance & Admin",
      supervisor: "Jennifer Smith",
      accessLevel: "Standard User",
      permissions: ["finance.view", "inventory.view"],
      status: "active",
      joinDate: "2023-08-10",
      lastLogin: "2024-01-14 16:20",
      performanceRating: 3.8,
      profileImage: "/api/placeholder/32/32"
    },
    {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah.johnson@saywhat.org",
      phone: "+234-807-234-5678",
      staffId: "SW004",
      position: "Operations Manager",
      secretariat: "Operations",
      supervisor: "Michael Brown",
      accessLevel: "Senior Admin",
      permissions: ["operations.full", "hr.manage", "analytics.view"],
      status: "active",
      joinDate: "2021-05-03",
      lastLogin: "2024-01-15 09:10",
      performanceRating: 4.7,
      profileImage: "/api/placeholder/32/32"
    },
    {
      id: 5,
      name: "Alex Chen",
      email: "alex.chen@saywhat.org",
      phone: "+234-809-345-6789",
      staffId: "SW005",
      position: "Data Analyst",
      secretariat: "Programs & M&E",
      supervisor: "Mark Wilson",
      accessLevel: "Standard User",
      permissions: ["analytics.view", "programs.view"],
      status: "pending",
      joinDate: "2024-01-10",
      lastLogin: "Never",
      performanceRating: null,
      profileImage: "/api/placeholder/32/32"
    }
  ]

  const accessLevels = [
    {
      name: "System Administrator",
      description: "Full system access including user management and system configuration",
      permissions: ["*"],
      userCount: 3
    },
    {
      name: "HR Administrator",
      description: "Full HR module access with employee management capabilities",
      permissions: ["hr.full_access", "users.manage", "reports.generate"],
      userCount: 8
    },
    {
      name: "Department Admin",
      description: "Department-level administrative access with limited HR functions",
      permissions: ["department.manage", "hr.view", "team.manage"],
      userCount: 15
    },
    {
      name: "Senior User",
      description: "Enhanced access to multiple modules with supervisory functions",
      permissions: ["multiple.modules", "approve.requests", "view.reports"],
      userCount: 42
    },
    {
      name: "Standard User",
      description: "Basic access to assigned modules and personal information",
      permissions: ["basic.access", "personal.data", "assigned.modules"],
      userCount: 225
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "suspended": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "System Administrator": return "text-purple-600"
      case "HR Administrator": return "text-red-600"
      case "Department Admin": return "text-blue-600"
      case "Senior User": return "text-green-600"
      case "Standard User": return "text-gray-600"
      default: return "text-gray-600"
    }
  }

  const getRatingColor = (rating: number | null) => {
    if (!rating) return "text-gray-400"
    if (rating >= 4.0) return "text-green-600"
    if (rating >= 3.5) return "text-blue-600"
    return "text-yellow-600"
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.staffId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || employee.status === filterStatus
    const matchesSecretariat = filterSecretariat === "all" || 
                              employee.secretariat.toLowerCase().includes(filterSecretariat)
    
    return matchesSearch && matchesStatus && matchesSecretariat
  })

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search employees by name, email, or staff ID..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {filteredEmployees.length} of {employees.length} employees
              </span>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>

        {/* Access Levels Overview */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Levels Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {accessLevels.map((level, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <ShieldCheckIcon className={`h-5 w-5 ${getAccessLevelColor(level.name)}`} />
                  <span className="text-lg font-semibold text-gray-900">{level.userCount}</span>
                </div>
                <h4 className={`font-medium ${getAccessLevelColor(level.name)} text-sm`}>{level.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{level.description}</p>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-800 text-xs">
                    Manage Permissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Employee Directory</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.staffId}</div>
                          <div className="text-xs text-gray-400">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                      <div className="text-sm text-gray-500">{employee.secretariat}</div>
                      <div className="text-xs text-gray-400">Supervisor: {employee.supervisor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getAccessLevelColor(employee.accessLevel)}`}>
                        {employee.accessLevel}
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.permissions.length} permissions
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.performanceRating ? (
                        <div className={`text-sm font-medium ${getRatingColor(employee.performanceRating)}`}>
                          {employee.performanceRating}/5.0
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Not rated</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.lastLogin === "Never" ? (
                        <span className="text-red-500">Never</span>
                      ) : (
                        employee.lastLogin
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <KeyIcon className="h-4 w-4" />
                        </button>
                        {employee.status === "active" ? (
                          <button className="text-red-600 hover:text-red-900">
                            <LockClosedIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button className="text-green-600 hover:text-green-900">
                            <LockOpenIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="SW###"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="employee@saywhat.org"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+234-xxx-xxx-xxxx"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position/Title *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Job title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secretariat *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Secretariat</option>
                        <option value="operations">Operations</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance & Admin</option>
                        <option value="programs">Programs & M&E</option>
                        <option value="governance">Governance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Direct Supervisor</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Supervisor</option>
                        <option value="sarah-johnson">Sarah Johnson</option>
                        <option value="dr-amina-hassan">Dr. Amina Hassan</option>
                        <option value="jennifer-smith">Jennifer Smith</option>
                        <option value="mark-wilson">Mark Wilson</option>
                        <option value="dr-ahmed-musa">Dr. Ahmed Musa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Access Level *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Access Level</option>
                        <option value="standard">Standard User</option>
                        <option value="senior">Senior User</option>
                        <option value="department">Department Admin</option>
                        <option value="hr">HR Administrator</option>
                        <option value="system">System Administrator</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional information about the employee..."
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">System Access Permissions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        "Dashboard Access",
                        "HR Module",
                        "Programs Module",
                        "Call Centre",
                        "Inventory",
                        "Documents",
                        "Analytics",
                        "Settings"
                      ].map((permission) => (
                        <label key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                    Add Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
