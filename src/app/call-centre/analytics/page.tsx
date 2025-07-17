"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function CallCentreAnalyticsPage() {
  const { data: session } = useSession()
  const [dateRange, setDateRange] = useState('7days')
  const [selectedOfficer, setSelectedOfficer] = useState('all')
  
  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || 
                             userPermissions.includes('programs.head') ||
                             userPermissions.includes('callcentre.officer')

  if (!canAccessCallCentre) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            This module is restricted to Call Centre officers and Head of Programs only.
          </p>
        </div>
      </div>
    )
  }

  // Analytics data
  const analyticsData = {
    totalCalls: 1247,
    validCalls: 1119,
    invalidCalls: 128,
    validCallRate: 89.7,
    totalCases: 142,
    resolvedCases: 98,
    pendingCases: 44,
    caseResolutionRate: 69.0,
    averageCallDuration: '4.2 min',
    averageResponseTime: '1.3 min'
  }

  const callsByDay = [
    { day: 'Mon', calls: 186, valid: 167 },
    { day: 'Tue', calls: 195, valid: 175 },
    { day: 'Wed', calls: 172, valid: 154 },
    { day: 'Thu', calls: 208, valid: 188 },
    { day: 'Fri', calls: 223, valid: 201 },
    { day: 'Sat', calls: 145, valid: 126 },
    { day: 'Sun', calls: 118, valid: 108 }
  ]

  const callsByLanguage = [
    { language: 'English', calls: 505, percentage: 40.5 },
    { language: 'Shona', calls: 426, percentage: 34.2 },
    { language: 'Ndebele', calls: 316, percentage: 25.3 }
  ]

  const callsByProvince = [
    { province: 'Harare', calls: 324, percentage: 26.0 },
    { province: 'Bulawayo', calls: 287, percentage: 23.0 },
    { province: 'Chitungwiza', calls: 186, percentage: 14.9 },
    { province: 'Gweru', calls: 142, percentage: 11.4 },
    { province: 'Mutare', calls: 126, percentage: 10.1 },
    { province: 'Masvingo', calls: 95, percentage: 7.6 },
    { province: 'Others', calls: 87, percentage: 7.0 }
  ]

  const callPurposes = [
    { purpose: 'HIV Information & Counselling', calls: 312, percentage: 25.0 },
    { purpose: 'Youth Employment Inquiry', calls: 287, percentage: 23.0 },
    { purpose: 'Scholarship/Bursary Information', calls: 198, percentage: 15.9 },
    { purpose: 'Technical Skills Training', calls: 156, percentage: 12.5 },
    { purpose: 'Business Development Support', calls: 134, percentage: 10.7 },
    { purpose: 'General Program Information', calls: 98, percentage: 7.9 },
    { purpose: 'Other', calls: 62, percentage: 5.0 }
  ]

  const officerPerformance = [
    { name: 'Mary Chikuni', calls: 342, validRate: 92.3, cases: 28, satisfaction: 4.8 },
    { name: 'David Nyathi', calls: 318, validRate: 89.1, cases: 24, satisfaction: 4.6 },
    { name: 'Alice Mandaza', calls: 295, validRate: 95.5, cases: 31, satisfaction: 4.9 },
    { name: 'Peter Masvingo', calls: 292, validRate: 87.2, cases: 22, satisfaction: 4.4 }
  ]

  const exportToPDF = () => {
    window.print()
  }

  const exportToCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Calls', analyticsData.totalCalls],
      ['Valid Calls', analyticsData.validCalls],
      ['Invalid Calls', analyticsData.invalidCalls],
      ['Valid Call Rate (%)', analyticsData.validCallRate],
      ['Total Cases', analyticsData.totalCases],
      ['Resolved Cases', analyticsData.resolvedCases],
      ['Pending Cases', analyticsData.pendingCases],
      ['Case Resolution Rate (%)', analyticsData.caseResolutionRate]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call-centre-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
                Call Centre Analytics
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive analytics and reporting dashboard</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Officers</option>
                <option value="mary">Mary Chikuni</option>
                <option value="david">David Nyathi</option>
                <option value="alice">Alice Mandaza</option>
                <option value="peter">Peter Masvingo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalCalls.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +12.5% from last period
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valid Call Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.validCallRate}%</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +2.3% from last period
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalCases}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +8.7% from last period
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.caseResolutionRate}%</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +5.2% from last period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Call Volume */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Call Volume</h3>
            <div className="space-y-3">
              {callsByDay.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 w-12">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${(day.calls / 250) * 100}%` }}
                      ></div>
                      <div
                        className="bg-green-500 h-4 rounded-full absolute top-0"
                        style={{ width: `${(day.valid / 250) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{day.calls}</div>
                    <div className="text-xs text-green-600">{day.valid} valid</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls by Language</h3>
            <div className="space-y-4">
              {callsByLanguage.map((lang) => (
                <div key={lang.language} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{lang.language}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${lang.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{lang.percentage}%</span>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{lang.calls}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* More Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Provinces */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls by Province</h3>
            <div className="space-y-3">
              {callsByProvince.map((province) => (
                <div key={province.province} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{province.province}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${province.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{province.percentage}%</span>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{province.calls}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call Purposes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Purposes</h3>
            <div className="space-y-3">
              {callPurposes.map((purpose) => (
                <div key={purpose.purpose} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 flex-1 pr-3">{purpose.purpose}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${purpose.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{purpose.percentage}%</span>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{purpose.calls}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Officer Performance Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Officer Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Officer Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Calls
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Rate
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cases Created
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satisfaction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {officerPerformance.map((officer) => (
                  <tr key={officer.name} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{officer.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{officer.calls}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{officer.validRate}%</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{officer.cases}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">⭐ {officer.satisfaction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
