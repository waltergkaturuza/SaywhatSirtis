"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FunnelIcon,
  UsersIcon,
  BuildingOfficeIcon,
  PlusIcon
} from "@heroicons/react/24/outline"

export default function LeaveCalendarPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)) // January 2024
  const [viewMode, setViewMode] = useState("month") // month, week, day
  const [filterSecretariat, setFilterSecretariat] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const metadata = {
    title: "Leave Calendar",
    description: "View team leave schedule and manage coverage",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Leave Management", href: "/hr/leave" },
      { name: "Calendar" }
    ]
  }

  const actions = (
    <>
      <Link href="/hr/leave/approvals">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <ClockIcon className="h-4 w-4 mr-2" />
          Pending Approvals
        </button>
      </Link>
      <Link href="/hr/leave">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Apply for Leave
        </button>
      </Link>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar Filters</h3>
        <div className="space-y-3">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="month">Month View</option>
              <option value="week">Week View</option>
              <option value="day">Day View</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-blue-800">28</div>
            <div className="text-sm text-blue-600">Total Leave Days</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-green-800">23</div>
            <div className="text-sm text-green-600">Approved Leaves</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-yellow-800">5</div>
            <div className="text-sm text-yellow-600">Pending Approval</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Operations:</span>
            <span className="text-green-600 font-medium">85% covered</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Healthcare:</span>
            <span className="text-green-600 font-medium">92% covered</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Finance:</span>
            <span className="text-yellow-600 font-medium">70% covered</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Programs:</span>
            <span className="text-red-600 font-medium">60% covered</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Approved Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>Pending Approval</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Emergency Leave</span>
          </div>
        </div>
      </div>
    </div>
  )

  // Sample leave data for calendar
  const leaveEvents = [
    {
      id: 1,
      employeeName: "John Doe",
      leaveType: "Annual Leave",
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 0, 19),
      status: "approved",
      secretariat: "Operations",
      reason: "Family vacation"
    },
    {
      id: 2,
      employeeName: "Jane Smith",
      leaveType: "Sick Leave",
      startDate: new Date(2024, 0, 18),
      endDate: new Date(2024, 0, 20),
      status: "approved",
      secretariat: "Healthcare",
      reason: "Medical treatment"
    },
    {
      id: 3,
      employeeName: "Mike Wilson",
      leaveType: "Personal Leave",
      startDate: new Date(2024, 0, 22),
      endDate: new Date(2024, 0, 23),
      status: "pending",
      secretariat: "Finance",
      reason: "Personal matters"
    },
    {
      id: 4,
      employeeName: "Sarah Johnson",
      leaveType: "Emergency Leave",
      startDate: new Date(2024, 0, 25),
      endDate: new Date(2024, 0, 26),
      status: "approved",
      secretariat: "Operations",
      reason: "Family emergency"
    },
    {
      id: 5,
      employeeName: "Emma Thompson",
      leaveType: "Annual Leave",
      startDate: new Date(2024, 0, 29),
      endDate: new Date(2024, 1, 2),
      status: "approved",
      secretariat: "Healthcare",
      reason: "Extended weekend"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500"
      case "pending": return "bg-yellow-500"
      case "in-progress": return "bg-blue-500"
      case "emergency": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "Annual Leave": return "border-blue-200 bg-blue-50"
      case "Sick Leave": return "border-red-200 bg-red-50"
      case "Personal Leave": return "border-purple-200 bg-purple-50"
      case "Emergency Leave": return "border-orange-200 bg-orange-50"
      default: return "border-gray-200 bg-gray-50"
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getEventsForDate = (date: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date)
    return leaveEvents.filter(event => {
      const eventStart = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate())
      const eventEnd = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate())
      return targetDate >= eventStart && targetDate <= eventEnd
    })
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-32 p-2 border border-gray-200 bg-gray-50">
        </div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const eventsForDay = getEventsForDate(day)
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentDate.getMonth() && 
                     new Date().getFullYear() === currentDate.getFullYear()

      days.push(
        <div key={day} className={`min-h-32 p-2 border border-gray-200 bg-white hover:bg-gray-50 ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {day}
            </span>
            {eventsForDay.length > 0 && (
              <span className="text-xs text-gray-500">
                {eventsForDay.length} event{eventsForDay.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {eventsForDay.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className={`text-xs p-1 rounded border ${getLeaveTypeColor(event.leaveType)} cursor-pointer hover:shadow-sm`}
                title={`${event.employeeName} - ${event.leaveType}: ${event.reason}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)} mr-1`}></div>
                    <span className="font-medium truncate">{event.employeeName}</span>
                  </div>
                </div>
                <div className="text-gray-600 truncate">{event.leaveType}</div>
                <div className="text-gray-500 truncate">{event.secretariat}</div>
              </div>
            ))}
            {eventsForDay.length > 3 && (
              <div className="text-xs text-gray-500 text-center py-1">
                +{eventsForDay.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Calendar Header */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">{formatDate(currentDate)}</h2>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="inline-flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Today
              </button>
            </div>
          </div>

          {/* Calendar Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-lg font-semibold text-blue-900">28</div>
                  <div className="text-sm text-blue-700">Total Leave Days</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-lg font-semibold text-green-900">23</div>
                  <div className="text-sm text-green-700">Approved</div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <div className="text-lg font-semibold text-yellow-900">5</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-lg font-semibold text-purple-900">15</div>
                  <div className="text-sm text-purple-700">Employees on Leave</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border">
          <div className="p-6">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-0 mb-4">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                <div key={day} className="p-4 text-center font-medium text-gray-700 border-b border-gray-200">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0">
              {renderCalendarGrid()}
            </div>
          </div>
        </div>

        {/* Upcoming Leaves */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Leaves This Month</h3>
          <div className="space-y-3">
            {leaveEvents
              .filter(event => event.startDate.getMonth() === currentDate.getMonth())
              .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`}></div>
                    <UserIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{event.employeeName}</div>
                      <div className="text-sm text-gray-600">{event.leaveType} • {event.secretariat}</div>
                      <div className="text-sm text-gray-500">{event.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      event.status === 'approved' ? 'bg-green-100 text-green-800' :
                      event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Team Coverage Analysis */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Coverage Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { secretariat: "Operations", total: 85, onLeave: 12, coverage: 85 },
              { secretariat: "Healthcare", total: 72, onLeave: 6, coverage: 92 },
              { secretariat: "Finance", total: 48, onLeave: 14, coverage: 70 },
              { secretariat: "Programs", total: 56, onLeave: 22, coverage: 60 },
              { secretariat: "Governance", total: 32, onLeave: 5, coverage: 84 }
            ].map((dept) => (
              <div key={dept.secretariat} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{dept.secretariat}</h4>
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Staff:</span>
                    <span className="text-gray-900">{dept.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">On Leave:</span>
                    <span className="text-gray-900">{dept.onLeave}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage:</span>
                    <span className={`font-medium ${
                      dept.coverage >= 85 ? 'text-green-600' :
                      dept.coverage >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {dept.coverage}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        dept.coverage >= 85 ? 'bg-green-500' :
                        dept.coverage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dept.coverage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
