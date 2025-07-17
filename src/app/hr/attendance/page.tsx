"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  DocumentChartBarIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  EyeIcon
} from "@heroicons/react/24/outline"

export default function AttendancePage() {
  const { data: session } = useSession()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [todayWorkTime, setTodayWorkTime] = useState("7h 32m")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedView, setSelectedView] = useState("today")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const metadata = {
    title: "Time & Attendance Management",
    description: "Track attendance, manage punch in/out, and monitor work hours",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Time & Attendance" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <DocumentChartBarIcon className="h-4 w-4 mr-2" />
        Reports
      </button>
      <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
        <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
        Settings
      </button>
    </>
  )

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')
  const canManageAttendance = isHRStaff || userPermissions.includes('hr.attendance')

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={() => setIsCheckedIn(!isCheckedIn)}
            className={`w-full px-4 py-3 rounded-lg font-medium text-center ${
              isCheckedIn 
                ? "bg-red-100 text-red-700 hover:bg-red-200" 
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {isCheckedIn ? (
              <>
                <StopIcon className="h-5 w-5 inline mr-2" />
                Punch Out
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5 inline mr-2" />
                Punch In
              </>
            )}
          </button>
          
          {isCheckedIn && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`w-full px-4 py-3 rounded-lg font-medium text-center ${
                isPaused 
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              {isPaused ? (
                <>
                  <PlayIcon className="h-5 w-5 inline mr-2" />
                  Resume Work
                </>
              ) : (
                <>
                  <PauseIcon className="h-5 w-5 inline mr-2" />
                  Take Break
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Check-in Time</div>
            <div className="font-semibold text-blue-700">08:30 AM</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Work Duration</div>
            <div className="font-semibold text-green-700">{todayWorkTime}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Break Time</div>
            <div className="font-semibold text-yellow-700">45 minutes</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Status</div>
            <div className="font-semibold text-purple-700">
              {isCheckedIn ? (isPaused ? "On Break" : "Working") : "Checked Out"}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">View Options</h3>
        <div className="space-y-2">
          {[
            { id: "today", name: "Today's Activity" },
            { id: "week", name: "This Week" },
            { id: "month", name: "This Month" },
            { id: "roster", name: "Team Roster" },
            { id: "reports", name: "Reports" }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`w-full text-left p-2 rounded-md text-sm ${
                selectedView === view.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {view.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const todayAttendance = [
    {
      id: 1,
      employee: "John Doe",
      department: "Operations",
      checkIn: "08:25 AM",
      checkOut: null,
      workHours: "7h 45m",
      breakTime: "45m",
      status: "working",
      location: "Office - Floor 2"
    },
    {
      id: 2,
      employee: "Jane Smith",
      department: "Healthcare",
      checkIn: "08:30 AM",
      checkOut: null,
      workHours: "7h 40m",
      breakTime: "30m",
      status: "on_break",
      location: "Field - Clinic A"
    },
    {
      id: 3,
      employee: "Mike Wilson",
      department: "Finance",
      checkIn: "09:00 AM",
      checkOut: "05:30 PM",
      workHours: "8h 30m",
      breakTime: "1h",
      status: "checked_out",
      location: "Remote"
    },
    {
      id: 4,
      employee: "Sarah Johnson",
      department: "Programs",
      checkIn: "08:15 AM",
      checkOut: null,
      workHours: "7h 55m",
      breakTime: "20m",
      status: "working",
      location: "Office - Floor 3"
    }
  ]

  const weeklyRoster = [
    {
      employee: "John Doe",
      monday: { status: "present", hours: "8h", checkIn: "08:30", checkOut: "17:00" },
      tuesday: { status: "present", hours: "8h", checkIn: "08:25", checkOut: "17:05" },
      wednesday: { status: "present", hours: "7.5h", checkIn: "08:45", checkOut: "16:45" },
      thursday: { status: "working", hours: "7h 45m", checkIn: "08:25", checkOut: null },
      friday: { status: "scheduled", hours: "8h", checkIn: null, checkOut: null }
    },
    {
      employee: "Jane Smith",
      monday: { status: "present", hours: "8h", checkIn: "08:30", checkOut: "17:00" },
      tuesday: { status: "leave", hours: "0h", checkIn: null, checkOut: null },
      wednesday: { status: "present", hours: "8h", checkIn: "08:30", checkOut: "17:00" },
      thursday: { status: "working", hours: "7h 40m", checkIn: "08:30", checkOut: null },
      friday: { status: "scheduled", hours: "8h", checkIn: null, checkOut: null }
    },
    {
      employee: "Mike Wilson",
      monday: { status: "present", hours: "8.5h", checkIn: "09:00", checkOut: "17:30" },
      tuesday: { status: "present", hours: "8h", checkIn: "09:00", checkOut: "17:00" },
      wednesday: { status: "present", hours: "8h", checkIn: "09:00", checkOut: "17:00" },
      thursday: { status: "present", hours: "8.5h", checkIn: "09:00", checkOut: "17:30" },
      friday: { status: "scheduled", hours: "8h", checkIn: null, checkOut: null }
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working": return "bg-green-100 text-green-800"
      case "on_break": return "bg-yellow-100 text-yellow-800"
      case "checked_out": return "bg-gray-100 text-gray-800"
      case "present": return "bg-green-100 text-green-800"
      case "leave": return "bg-red-100 text-red-800"
      case "scheduled": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "working": return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case "on_break": return <PauseIcon className="h-4 w-4 text-yellow-600" />
      case "checked_out": return <StopIcon className="h-4 w-4 text-gray-600" />
      case "present": return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case "leave": return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
      case "scheduled": return <ClockIcon className="h-4 w-4 text-blue-600" />
      default: return <ClockIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const renderTodayView = () => (
    <div className="space-y-6">
      {/* Current Time Display */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</h2>
            <p className="text-blue-100">{currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">Current Status</div>
            <div className="text-xl">
              {isCheckedIn ? (isPaused ? "On Break" : "Working") : "Not Checked In"}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">87</h3>
              <p className="text-sm text-gray-500">Present Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">8</h3>
              <p className="text-sm text-gray-500">On Leave</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <PauseIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">12</h3>
              <p className="text-sm text-gray-500">On Break</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">7.8h</h3>
              <p className="text-sm text-gray-500">Avg Work Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Attendance Table */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Live Attendance</h3>
          <div className="flex space-x-2">
            <select className="border rounded-md px-3 py-2 text-sm">
              <option>All Departments</option>
              <option>Operations</option>
              <option>Healthcare</option>
              <option>Finance</option>
              <option>Programs</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Break Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {todayAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.employee}</div>
                      <div className="text-sm text-gray-500">{record.department}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkOut || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.workHours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.breakTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {record.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {canManageAttendance && (
                      <button className="text-gray-600 hover:text-gray-900">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderRosterView = () => (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance Roster</h3>
        <div className="flex space-x-2">
          <input
            type="week"
            value="2024-W03"
            className="border rounded-md px-3 py-2 text-sm"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
            Export Roster
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monday
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tuesday
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wednesday
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thursday
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Friday
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {weeklyRoster.map((employee, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.employee}
                </td>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
                  const dayData = employee[day as keyof typeof employee] as any
                  return (
                    <td key={day} className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="space-y-1">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dayData.status)}`}>
                          {dayData.status}
                        </div>
                        <div className="text-xs text-gray-600">{dayData.hours}</div>
                        {dayData.checkIn && (
                          <div className="text-xs text-gray-500">
                            {dayData.checkIn} - {dayData.checkOut || "Active"}
                          </div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      {selectedView === "today" && renderTodayView()}
      {selectedView === "roster" && renderRosterView()}
      {selectedView === "week" && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
          <p className="text-gray-600">Weekly attendance summary view will be implemented here.</p>
        </div>
      )}
      {selectedView === "month" && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Reports</h3>
          <p className="text-gray-600">Monthly attendance reports view will be implemented here.</p>
        </div>
      )}
      {selectedView === "reports" && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Reports</h3>
          <p className="text-gray-600">Detailed attendance reports and analytics will be implemented here.</p>
        </div>
      )}
    </ModulePage>
  )
}
