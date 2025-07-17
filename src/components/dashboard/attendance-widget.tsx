"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ClockIcon,
  UserGroupIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"

interface AttendanceWidgetProps {
  className?: string
}

export function AttendanceWidget({ className = "" }: AttendanceWidgetProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isCheckedIn, setIsCheckedIn] = useState(true)
  const [workTime, setWorkTime] = useState("7h 32m")

  useEffect(() => {
    // Initialize time on client side
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const attendanceStats = {
    present: 87,
    onLeave: 8,
    late: 3,
    absent: 2,
    totalEmployees: 100
  }

  const attendanceRate = ((attendanceStats.present / attendanceStats.totalEmployees) * 100).toFixed(1)

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Time & Attendance</h3>
        </div>
        <Link
          href="/hr/attendance"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
        </Link>
      </div>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {currentTime ? currentTime.toLocaleTimeString() : '--:--:--'}
            </div>
            <div className="text-sm text-gray-600">
              {currentTime ? currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              }) : 'Loading...'}
            </div>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCheckedIn 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {isCheckedIn ? "Checked In" : "Not Checked In"}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Work Time: {workTime}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setIsCheckedIn(!isCheckedIn)}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm ${
            isCheckedIn 
              ? "bg-red-100 text-red-700 hover:bg-red-200" 
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {isCheckedIn ? (
            <>
              <StopIcon className="h-4 w-4 mr-2" />
              Punch Out
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4 mr-2" />
              Punch In
            </>
          )}
        </button>
        <Link
          href="/hr/time-tracking"
          className="flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Time Tracking
        </Link>
      </div>

      {/* Today's Overview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Today's Attendance</h4>
          <span className="text-2xl font-bold text-green-600">{attendanceRate}%</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="font-semibold text-green-700">{attendanceStats.present}</div>
                <div className="text-xs text-green-600">Present</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <div className="font-semibold text-red-700">{attendanceStats.onLeave}</div>
                <div className="text-xs text-red-600">On Leave</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <div className="font-semibold text-yellow-700">{attendanceStats.late}</div>
                <div className="text-xs text-yellow-600">Late</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <div className="font-semibold text-gray-700">{attendanceStats.absent}</div>
                <div className="text-xs text-gray-600">Absent</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/hr/attendance?view=roster"
            className="text-center p-2 rounded-md hover:bg-gray-50"
          >
            <CalendarIcon className="h-5 w-5 mx-auto text-gray-600 mb-1" />
            <div className="text-xs text-gray-600">Roster</div>
          </Link>
          <Link
            href="/hr/leave"
            className="text-center p-2 rounded-md hover:bg-gray-50"
          >
            <CalendarIcon className="h-5 w-5 mx-auto text-gray-600 mb-1" />
            <div className="text-xs text-gray-600">Leave</div>
          </Link>
          <Link
            href="/hr/attendance?view=reports"
            className="text-center p-2 rounded-md hover:bg-gray-50"
          >
            <ChartBarIcon className="h-5 w-5 mx-auto text-gray-600 mb-1" />
            <div className="text-xs text-gray-600">Reports</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
