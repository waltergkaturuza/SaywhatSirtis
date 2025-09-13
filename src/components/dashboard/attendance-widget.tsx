"use client"

import { ClockIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"

export function AttendanceWidget() {
  const attendanceStats = {
    totalEmployees: 234,
    present: 198,
    absent: 18,
    late: 18,
    onTime: 180
  }

  const attendanceRate = Math.round((attendanceStats.present / attendanceStats.totalEmployees) * 100)

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
        <ClockIcon className="h-6 w-6 text-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
          <div className="text-sm text-gray-500">Present</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
          <div className="text-sm text-gray-500">Absent</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Attendance Rate</span>
          <span className="font-semibold">{attendanceRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
          <span>{attendanceStats.onTime} On Time</span>
        </div>
        <div className="flex items-center">
          <XCircleIcon className="h-4 w-4 text-yellow-600 mr-2" />
          <span>{attendanceStats.late} Late</span>
        </div>
      </div>
    </div>
  )
}
