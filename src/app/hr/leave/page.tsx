"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon,
  UserIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BellIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"

export default function LeaveManagementPage() {
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState("my-leaves")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  const metadata = {
    title: "Leave Management",
    description: "Manage leave applications and approvals with document routing",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Leave Management" }
    ]
  }

  const actions = (
    <>
      <Link href="/hr/leave/calendar">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Leave Calendar
        </button>
      </Link>
      <Link href="/hr/leave/reports">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Reports
        </button>
      </Link>
      <Link href="/hr/leave/apply">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Apply for Leave
        </button>
      </Link>
    </>
  )

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')
  const isSupervisor = userPermissions.includes('hr.supervisor')
  const canApproveLeaves = isHRStaff || isSupervisor

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Categories</h3>
        <div className="space-y-2">
          {[
            { id: "my-leaves", name: "My Leave Applications", count: 8 },
            { id: "pending-approval", name: "Pending Approval", count: 12 },
            { id: "team-leaves", name: "Team Leaves", count: 24 },
            { id: "approved", name: "Approved Leaves", count: 45 },
            { id: "rejected", name: "Rejected", count: 3 },
            { id: "emergency", name: "Emergency Leaves", count: 2 }
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedTab(category.id)}
              className={`w-full text-left p-2 rounded-md text-sm ${
                selectedTab === category.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{category.name}</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {category.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h3>
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-green-800">18</div>
            <div className="text-sm text-green-600">Annual Leave Days</div>
            <div className="text-xs text-green-500">Remaining this year</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-blue-800">5</div>
            <div className="text-sm text-blue-600">Sick Leave Days</div>
            <div className="text-xs text-blue-500">Available</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-purple-800">3</div>
            <div className="text-sm text-purple-600">Personal Days</div>
            <div className="text-xs text-purple-500">Remaining</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setShowApplicationModal(true)}
            className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            Apply for Leave
          </button>
          <Link href="/hr/leave/calendar" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            View Team Calendar
          </Link>
          <Link href="/hr/leave/policies" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Leave Policies
          </Link>
          {canApproveLeaves && (
            <Link href="/hr/leave/approvals" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              Approval Queue
            </Link>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-2">
          <div className="text-sm text-gray-700 p-2 bg-green-50 rounded">
            Annual leave approved
          </div>
          <div className="text-sm text-gray-700 p-2 bg-blue-50 rounded">
            Sick leave submitted
          </div>
          <div className="text-sm text-gray-700 p-2 bg-yellow-50 rounded">
            Emergency leave pending
          </div>
        </div>
      </div>
    </div>
  )

  const leaveApplications = [
    {
      id: 1,
      employeeName: "John Doe",
      employeeId: "SW001",
      leaveType: "Annual Leave",
      startDate: "2024-02-15",
      endDate: "2024-02-20",
      duration: "5 days",
      reason: "Family vacation",
      status: "pending",
      appliedDate: "2024-01-15",
      supervisor: "Sarah Johnson",
      hrApprover: "Jennifer Smith",
      documents: ["medical_certificate.pdf"],
      urgency: "normal",
      secretariat: "Operations",
      routingHistory: [
        { stage: "Employee", date: "2024-01-15 09:00", status: "submitted", person: "John Doe" },
        { stage: "Supervisor", date: "2024-01-15 14:30", status: "pending", person: "Sarah Johnson" }
      ]
    },
    {
      id: 2,
      employeeName: "Jane Smith",
      employeeId: "SW002",
      leaveType: "Sick Leave",
      startDate: "2024-01-18",
      endDate: "2024-01-20",
      duration: "3 days",
      reason: "Medical treatment",
      status: "approved",
      appliedDate: "2024-01-16",
      supervisor: "Dr. Amina Hassan",
      hrApprover: "Jennifer Smith",
      documents: ["medical_certificate.pdf", "prescription.pdf"],
      urgency: "high",
      secretariat: "Healthcare",
      routingHistory: [
        { stage: "Employee", date: "2024-01-16 08:30", status: "submitted", person: "Jane Smith" },
        { stage: "Supervisor", date: "2024-01-16 10:15", status: "approved", person: "Dr. Amina Hassan" },
        { stage: "HR", date: "2024-01-16 15:20", status: "approved", person: "Jennifer Smith" }
      ]
    },
    {
      id: 3,
      employeeName: "Mike Wilson",
      employeeId: "SW003",
      leaveType: "Personal Leave",
      startDate: "2024-02-01",
      endDate: "2024-02-02",
      duration: "2 days",
      reason: "Personal matters",
      status: "rejected",
      appliedDate: "2024-01-14",
      supervisor: "Jennifer Smith",
      hrApprover: "Jennifer Smith",
      documents: [],
      urgency: "low",
      secretariat: "Finance",
      rejectionReason: "Insufficient notice period",
      routingHistory: [
        { stage: "Employee", date: "2024-01-14 16:00", status: "submitted", person: "Mike Wilson" },
        { stage: "Supervisor", date: "2024-01-15 09:00", status: "rejected", person: "Jennifer Smith" }
      ]
    },
    {
      id: 4,
      employeeName: "Sarah Johnson",
      employeeId: "SW004",
      leaveType: "Emergency Leave",
      startDate: "2024-01-17",
      endDate: "2024-01-19",
      duration: "3 days",
      reason: "Family emergency",
      status: "approved",
      appliedDate: "2024-01-16",
      supervisor: "Michael Brown",
      hrApprover: "Jennifer Smith",
      documents: ["emergency_document.pdf"],
      urgency: "urgent",
      secretariat: "Operations",
      routingHistory: [
        { stage: "Employee", date: "2024-01-16 22:30", status: "submitted", person: "Sarah Johnson" },
        { stage: "Supervisor", date: "2024-01-17 07:00", status: "approved", person: "Michael Brown" },
        { stage: "HR", date: "2024-01-17 08:30", status: "approved", person: "Jennifer Smith" }
      ]
    }
  ]

  const leaveTypes = [
    {
      type: "Annual Leave",
      description: "Yearly vacation entitlement",
      maxDays: 21,
      notice: "2 weeks",
      approvalLevels: ["Supervisor", "HR"],
      documents: ["Leave Application Form"]
    },
    {
      type: "Sick Leave",
      description: "Medical leave for illness",
      maxDays: 10,
      notice: "Immediate",
      approvalLevels: ["Supervisor", "HR"],
      documents: ["Medical Certificate", "Leave Application Form"]
    },
    {
      type: "Personal Leave",
      description: "Personal matters leave",
      maxDays: 5,
      notice: "1 week",
      approvalLevels: ["Supervisor"],
      documents: ["Leave Application Form"]
    },
    {
      type: "Emergency Leave",
      description: "Urgent family/personal emergencies",
      maxDays: 7,
      notice: "Immediate",
      approvalLevels: ["Supervisor", "HR"],
      documents: ["Emergency Documentation", "Leave Application Form"]
    },
    {
      type: "Maternity/Paternity Leave",
      description: "Leave for new parents",
      maxDays: 90,
      notice: "1 month",
      approvalLevels: ["Supervisor", "HR", "Director"],
      documents: ["Medical Certificate", "Birth Certificate", "Leave Application Form"]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "cancelled": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "text-red-600"
      case "high": return "text-orange-600"
      case "normal": return "text-blue-600"
      case "low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "Annual Leave": return "text-blue-600"
      case "Sick Leave": return "text-red-600"
      case "Personal Leave": return "text-purple-600"
      case "Emergency Leave": return "text-orange-600"
      case "Maternity/Paternity Leave": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const filteredApplications = leaveApplications.filter(app => {
    const matchesSearch = app.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || app.status === filterStatus
    
    // Filter based on selected tab
    if (selectedTab === "my-leaves") {
      return app.employeeName === session?.user?.name && matchesSearch && matchesStatus
    } else if (selectedTab === "pending-approval") {
      return app.status === "pending" && matchesSearch && matchesStatus
    } else if (selectedTab === "approved") {
      return app.status === "approved" && matchesSearch && matchesStatus
    } else if (selectedTab === "rejected") {
      return app.status === "rejected" && matchesSearch && matchesStatus
    } else if (selectedTab === "emergency") {
      return app.leaveType === "Emergency Leave" && matchesSearch && matchesStatus
    }
    
    return matchesSearch && matchesStatus
  })

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Leave Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">94</h3>
                <p className="text-sm text-gray-500">Total Applications</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">12</h3>
                <p className="text-sm text-gray-500">Pending Approval</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">79</h3>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">3</h3>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </div>
          </div>
        </div>

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
                  placeholder="Search leave applications..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="text-sm text-gray-500">
                {filteredApplications.length} applications
              </span>
            </div>
          </div>
        </div>

        {/* Leave Types Overview */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Types & Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((leaveType, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className={`font-medium ${getLeaveTypeColor(leaveType.type)} mb-2`}>
                  {leaveType.type}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{leaveType.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Days:</span>
                    <span className="text-gray-900">{leaveType.maxDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Notice:</span>
                    <span className="text-gray-900">{leaveType.notice}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Approval Levels:</span>
                    <div className="mt-1">
                      {leaveType.approvalLevels.map((level, idx) => (
                        <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Applications Table */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Leave Applications</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Routing Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{application.employeeName}</div>
                          <div className="text-sm text-gray-500">{application.employeeId}</div>
                          <div className="text-xs text-gray-400">{application.secretariat}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getLeaveTypeColor(application.leaveType)}`}>
                        {application.leaveType}
                      </div>
                      <div className="text-sm text-gray-900">{application.reason}</div>
                      <div className="text-xs text-gray-500">
                        Applied: {application.appliedDate}
                      </div>
                      {application.documents.length > 0 && (
                        <div className="flex items-center mt-1">
                          <DocumentTextIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{application.documents.length} documents</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.duration}</div>
                      <div className="text-sm text-gray-500">
                        {application.startDate} to {application.endDate}
                      </div>
                      <div className={`text-xs font-medium ${getUrgencyColor(application.urgency)}`}>
                        {application.urgency} priority
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                      {application.status === "rejected" && application.rejectionReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {application.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {application.routingHistory.map((stage, idx) => (
                          <div key={idx} className="flex items-center text-xs">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              stage.status === 'approved' ? 'bg-green-500' :
                              stage.status === 'rejected' ? 'bg-red-500' :
                              stage.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <span className="text-gray-600">{stage.stage} - {stage.person}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {application.status === "pending" && canApproveLeaves && (
                          <>
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {application.status === "pending" && application.employeeName === session?.user?.name && (
                          <button className="text-gray-600 hover:text-gray-900">
                            <PencilIcon className="h-4 w-4" />
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

        {/* Leave Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Apply for Leave</h3>
                  <button 
                    onClick={() => setShowApplicationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Leave Type</option>
                        <option value="annual">Annual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="personal">Personal Leave</option>
                        <option value="emergency">Emergency Leave</option>
                        <option value="maternity">Maternity/Paternity Leave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave *</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please provide a detailed reason for your leave request..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Documents</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload files</span>
                            <input type="file" className="sr-only" multiple />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Handover Notes</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe work handover arrangements, pending tasks, or coverage plans..."
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Document Routing Process</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>1. Application submitted to Direct Supervisor</div>
                      <div>2. Supervisor review and approval/rejection</div>
                      <div>3. HR Department final processing</div>
                      <div>4. Email notifications sent to all parties</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => setShowApplicationModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                    Submit Application
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
