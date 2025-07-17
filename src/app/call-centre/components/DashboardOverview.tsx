"use client"

import React from 'react'
import {
  CalendarIcon,
  MapPinIcon,
  LanguageIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const DashboardOverview = () => {
  const todaysMetrics = {
    callsReceived: 127,
    validCalls: 111,
    invalidCalls: 16,
    newCases: 8,
    averageCallDuration: '4.3 min',
    peakHour: '10:00 - 11:00'
  }

  const callsByLanguage = [
    { language: 'English', count: 45, percentage: 40.5 },
    { language: 'Shona', count: 38, percentage: 34.2 },
    { language: 'Ndebele', count: 28, percentage: 25.3 }
  ]

  const callsByProvince = [
    { province: 'Harare', count: 32 },
    { province: 'Bulawayo', count: 23 },
    { province: 'Manicaland', count: 18 },
    { province: 'Mashonaland Central', count: 15 },
    { province: 'Mashonaland East', count: 12 }
  ]

  const callsByPurpose = [
    { purpose: 'HIV Information & Counselling', count: 28, color: 'bg-blue-500' },
    { purpose: 'Mental Health Support', count: 22, color: 'bg-green-500' },
    { purpose: 'GBV Support', count: 18, color: 'bg-red-500' },
    { purpose: 'Sexual & Reproductive Health', count: 15, color: 'bg-purple-500' },
    { purpose: 'Child Protection', count: 12, color: 'bg-yellow-500' },
    { purpose: 'Legal Assistance', count: 8, color: 'bg-indigo-500' }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Today's Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Overview</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Calls Received</span>
            <span className="text-2xl font-semibold text-blue-600">{todaysMetrics.callsReceived}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Valid Calls</span>
            <span className="text-lg font-medium text-green-600">{todaysMetrics.validCalls}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Invalid Calls</span>
            <span className="text-lg font-medium text-red-600">{todaysMetrics.invalidCalls}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">New Cases Created</span>
            <span className="text-lg font-medium text-purple-600">{todaysMetrics.newCases}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Average Duration</span>
            <span className="text-lg font-medium text-gray-800">{todaysMetrics.averageCallDuration}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Peak Hour</span>
            <span className="text-lg font-medium text-orange-600">{todaysMetrics.peakHour}</span>
          </div>
        </div>
      </div>

      {/* Call Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Call Distribution</h3>
        
        {/* By Language */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <LanguageIcon className="h-4 w-4 mr-2" />
            By Language
          </h4>
          <div className="space-y-2">
            {callsByLanguage.map((item) => (
              <div key={item.language} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.language}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Provinces */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <MapPinIcon className="h-4 w-4 mr-2" />
            Top Provinces
          </h4>
          <div className="space-y-2">
            {callsByProvince.map((item) => (
              <div key={item.province} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.province}</span>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call Purposes */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Call Purposes - Today</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {callsByPurpose.map((item) => (
            <div key={item.purpose} className="flex items-center p-3 border border-gray-200 rounded-lg">
              <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.purpose}</p>
                <p className="text-sm text-gray-500">{item.count} calls</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
