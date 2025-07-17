"use client"

import { useState } from "react"
import { EnhancedLayout } from "@/components/layout/enhanced-layout"
import { 
  ChartBarIcon,
  CalendarDaysIcon,
  UsersIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline"

export default function LeaveReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-quarter")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedLeaveType, setSelectedLeaveType] = useState("all")
  const [reportType, setReportType] = useState("summary")

  // Mock data for leave reports
  const leaveStats = {
    totalApplications: 245,
    approvedApplications: 210,
    pendingApplications: 15,
    rejectedApplications: 20,
    averageProcessingTime: 2.3,
    mostUsedLeaveType: "Annual Leave"
  }

  const departmentStats = [
    { department: "IT", total: 45, approved: 42, pending: 2, rejected: 1, utilizationRate: 78 },
    { department: "Programs", total: 68, approved: 61, pending: 4, rejected: 3, utilizationRate: 85 },
    { department: "HR", total: 28, approved: 26, pending: 1, rejected: 1, utilizationRate: 92 },
    { department: "Finance", total: 35, approved: 32, pending: 2, rejected: 1, utilizationRate: 71 },
    { department: "Operations", total: 69, approved: 49, pending: 6, rejected: 14, utilizationRate: 65 }
  ]

  const leaveTypeStats = [
    { type: "Annual Leave", applications: 125, avgDuration: 5.2, totalDays: 650 },
    { type: "Sick Leave", applications: 78, avgDuration: 2.1, totalDays: 164 },
    { type: "Personal Leave", applications: 25, avgDuration: 1.8, totalDays: 45 },
    { type: "Maternity Leave", applications: 8, avgDuration: 84, totalDays: 672 },
    { type: "Emergency Leave", applications: 9, avgDuration: 1.2, totalDays: 11 }
  ]

  const monthlyTrends = [
    { month: "Jan", applications: 18, avgProcessingTime: 2.1 },
    { month: "Feb", applications: 22, avgProcessingTime: 2.5 },
    { month: "Mar", applications: 28, avgProcessingTime: 2.2 },
    { month: "Apr", applications: 35, avgProcessingTime: 2.8 },
    { month: "May", applications: 42, avgProcessingTime: 2.1 },
    { month: "Jun", applications: 38, avgProcessingTime: 2.4 }
  ]

  const topLeaveReasons = [
    { reason: "Family vacation", count: 45 },
    { reason: "Medical appointment", count: 32 },
    { reason: "Personal matters", count: 28 },
    { reason: "Wedding/ceremony", count: 22 },
    { reason: "Child care", count: 18 }
  ]

  const handleExportReport = () => {
    // Implementation for exporting report
    console.log("Exporting report...")
  }

  return (
    <EnhancedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive leave management insights and analytics</p>
          </div>
          
          <button
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="current-month">Current Month</option>
                <option value="current-quarter">Current Quarter</option>
                <option value="current-year">Current Year</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Departments</option>
                <option value="it">IT</option>
                <option value="programs">Programs</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
                <option value="operations">Operations</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Leave Types</option>
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="emergency">Emergency Leave</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="trends">Trend Analysis</option>
                <option value="utilization">Utilization Report</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{leaveStats.totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{leaveStats.approvedApplications}</p>
                <p className="text-sm text-green-600">
                  {Math.round((leaveStats.approvedApplications / leaveStats.totalApplications) * 100)}% approval rate
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{leaveStats.pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">{leaveStats.averageProcessingTime}</p>
                <p className="text-sm text-gray-500">days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Statistics */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Department Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilization Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departmentStats.map((dept) => (
                    <tr key={dept.department}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {dept.approved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {dept.pending}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${dept.utilizationRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{dept.utilizationRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leave Type Statistics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Leave Type Analysis</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {leaveTypeStats.map((type) => (
                  <div key={type.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{type.type}</h3>
                      <span className="text-sm text-gray-500">{type.applications} applications</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Avg Duration</p>
                        <p className="font-semibold">{type.avgDuration} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Days</p>
                        <p className="font-semibold">{type.totalDays} days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Leave Reasons */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Top Leave Reasons</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topLeaveReasons.map((reason, index) => (
                  <div key={reason.reason} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-900">{reason.reason}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{reason.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Trends</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {monthlyTrends.map((month) => (
                <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{month.month}</h3>
                  <p className="text-2xl font-bold text-indigo-600">{month.applications}</p>
                  <p className="text-xs text-gray-500">applications</p>
                  <p className="text-sm text-gray-600 mt-1">{month.avgProcessingTime}d avg</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EnhancedLayout>
  )
}
