"use client"

import React from 'react'
import {
  UserIcon,
  StarIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

const PerformanceMetrics = () => {
  const officerPerformance = [
    {
      id: '1',
      name: 'Mary Chikuni',
      avatar: '👩‍💼',
      callsToday: 28,
      validCallsRate: 92.3,
      casesCreated: 3,
      averageCallTime: '4.2 min',
      status: 'online',
      rating: 4.8
    },
    {
      id: '2', 
      name: 'David Nyathi',
      avatar: '👨‍💼',
      callsToday: 24,
      validCallsRate: 89.1,
      casesCreated: 2,
      averageCallTime: '3.8 min',
      status: 'online',
      rating: 4.6
    },
    {
      id: '3',
      name: 'Alice Mandaza',
      avatar: '👩‍💻',
      callsToday: 22,
      validCallsRate: 95.5,
      casesCreated: 4,
      averageCallTime: '5.1 min',
      status: 'break',
      rating: 4.9
    },
    {
      id: '4',
      name: 'Peter Masvingo',
      avatar: '👨‍💻',
      callsToday: 19,
      validCallsRate: 87.2,
      casesCreated: 1,
      averageCallTime: '3.5 min',
      status: 'online',
      rating: 4.4
    }
  ]

  const teamMetrics = {
    totalCallsThisWeek: 892,
    averageValidCallRate: 89.7,
    totalCasesThisWeek: 67,
    averageResolutionTime: '2.3 days',
    customerSatisfaction: 4.6,
    responseTime: '1.2 min'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'break': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'break': return 'On Break'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Team Performance Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
          Team Performance
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Calls This Week</span>
            <span className="text-lg font-semibold text-blue-600">{teamMetrics.totalCallsThisWeek}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Valid Call Rate</span>
            <span className="text-lg font-semibold text-green-600">{teamMetrics.averageValidCallRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cases Created</span>
            <span className="text-lg font-semibold text-purple-600">{teamMetrics.totalCasesThisWeek}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Resolution</span>
            <span className="text-lg font-semibold text-orange-600">{teamMetrics.averageResolutionTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Satisfaction</span>
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-lg font-semibold text-yellow-600">{teamMetrics.customerSatisfaction}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Response Time</span>
            <span className="text-lg font-semibold text-indigo-600">{teamMetrics.responseTime}</span>
          </div>
        </div>
      </div>

      {/* Individual Officer Performance */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
          Officer Performance Today
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Officer
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calls
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Rate
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cases
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Time
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {officerPerformance.map((officer) => (
                <tr key={officer.id} className="hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{officer.avatar}</span>
                      <span className="text-sm font-medium text-gray-900">{officer.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-sm text-gray-900">{officer.callsToday}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${officer.validCallsRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{officer.validCallsRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-sm text-gray-900">{officer.casesCreated}</td>
                  <td className="py-4 px-2 text-sm text-gray-900">{officer.averageCallTime}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">{officer.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(officer.status)} mr-2`}></div>
                      <span className="text-sm text-gray-600">{getStatusText(officer.status)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PerformanceMetrics
