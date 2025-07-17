"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
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
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline"

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

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
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        Export
      </button>
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
            <span className="font-semibold">1,248</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Active</span>
            <span className="font-semibold text-green-600">1,195</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">On Leave</span>
            <span className="font-semibold text-yellow-600">42</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Inactive</span>
            <span className="font-semibold text-red-600">11</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Departments</h3>
        <div className="space-y-2">
          {[
            { name: "Operations", count: 234 },
            { name: "Healthcare", count: 187 },
            { name: "Education", count: 156 },
            { name: "Finance", count: 89 },
            { name: "HR", count: 45 },
            { name: "IT", count: 67 },
            { name: "Admin", count: 34 }
          ].map((dept, index) => (
            <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{dept.name}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{dept.count}</span>
            </div>
          ))}
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

  const employees = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@saywhat.org",
      phone: "+234 803 123 4567",
      department: "Operations",
      position: "Operations Manager",
      employeeId: "EMP001",
      hireDate: "2022-03-15",
      status: "active",
      performance: 4.8,
      avatar: null,
      location: "Lagos, Nigeria"
    },
    {
      id: 2,
      name: "Michael Adebayo",
      email: "michael.adebayo@saywhat.org",
      phone: "+234 806 987 6543",
      department: "Healthcare",
      position: "Healthcare Coordinator",
      employeeId: "EMP002",
      hireDate: "2021-07-22",
      status: "active",
      performance: 4.6,
      avatar: null,
      location: "Abuja, Nigeria"
    },
    {
      id: 3,
      name: "Amina Hassan",
      email: "amina.hassan@saywhat.org",
      phone: "+234 809 456 7890",
      department: "Education",
      position: "Education Director",
      employeeId: "EMP003",
      hireDate: "2020-11-08",
      status: "on-leave",
      performance: 4.9,
      avatar: null,
      location: "Kano, Nigeria"
    },
    {
      id: 4,
      name: "David Okonkwo",
      email: "david.okonkwo@saywhat.org",
      phone: "+234 802 234 5678",
      department: "Finance",
      position: "Financial Analyst",
      employeeId: "EMP004",
      hireDate: "2023-01-10",
      status: "active",
      performance: 4.4,
      avatar: null,
      location: "Port Harcourt, Nigeria"
    },
    {
      id: 5,
      name: "Fatima Bello",
      email: "fatima.bello@saywhat.org",
      phone: "+234 807 345 6789",
      department: "HR",
      position: "HR Specialist",
      employeeId: "EMP005",
      hireDate: "2022-09-05",
      status: "active",
      performance: 4.7,
      avatar: null,
      location: "Lagos, Nigeria"
    },
    {
      id: 6,
      name: "James Okafor",
      email: "james.okafor@saywhat.org",
      phone: "+234 805 678 9012",
      department: "IT",
      position: "Software Developer",
      employeeId: "EMP006",
      hireDate: "2021-04-18",
      status: "inactive",
      performance: 4.2,
      avatar: null,
      location: "Enugu, Nigeria"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "on-leave":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
                        <Link href={`/hr/employees/${employee.id}`}>
                          <button className="text-blue-600 hover:text-blue-900">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link href={`/hr/employees/${employee.id}/edit`}>
                          <button className="text-gray-600 hover:text-gray-900">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
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
    </ModulePage>
  )
}
