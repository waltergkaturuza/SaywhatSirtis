"use client"

import React, { useState, useEffect } from 'react'
import {
  UserIcon,
  StarIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

interface OfficerPerformance {
  id: string
  name: string
  avatar: string
  callsToday: number
  validCallsRate: number
  casesCreated: number
  averageCallTime: string
  status: 'online' | 'break' | 'offline'
  rating: number
}

interface TeamMetrics {
  totalCallsThisWeek: number
  averageValidCallRate: number
  totalCasesThisWeek: number
  averageResolutionTime: string
  customerSatisfaction: number
  responseTime: string
}

interface PerformanceData {
  teamMetrics: TeamMetrics
  officerPerformance: OfficerPerformance[]
}

const PerformanceMetrics = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/call-centre/performance')
      if (!response.ok) {
        throw new Error('Failed to fetch performance data')
      }
      const data = await response.json()
      setPerformanceData(data)
    } catch (error) {
      console.error('Error fetching performance data:', error)
      setError('Failed to load performance data')
    } finally {
      setLoading(false)
    }
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
      {loading ? (
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
            <span className="ml-2 text-gray-600">Loading performance data...</span>
          </div>
        </div>
      ) : error ? (
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-32 text-red-600">
            <span>{error}</span>
          </div>
        </div>
      ) : performanceData ? (
        <>
          {/* Team Performance Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-saywhat-dark mb-4 flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
              Team Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Calls This Week</span>
                <span className="text-lg font-semibold text-saywhat-orange">{performanceData.teamMetrics.totalCallsThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valid Call Rate</span>
                <span className="text-lg font-semibold text-green-600">{performanceData.teamMetrics.averageValidCallRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cases Created</span>
                <span className="text-lg font-semibold text-saywhat-red">{performanceData.teamMetrics.totalCasesThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Resolution</span>
                <span className="text-lg font-semibold text-saywhat-orange">{performanceData.teamMetrics.averageResolutionTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Satisfaction</span>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-lg font-semibold text-yellow-600">{performanceData.teamMetrics.customerSatisfaction}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-lg font-semibold text-saywhat-grey">{performanceData.teamMetrics.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Individual Officer Performance */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-saywhat-dark mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
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
                  {performanceData.officerPerformance.map((officer) => (
                    <tr key={officer.id} className="hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{officer.avatar}</span>
                          <span className="text-sm font-medium text-saywhat-dark">{officer.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-saywhat-dark">{officer.callsToday}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${officer.validCallsRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-saywhat-dark">{officer.validCallsRate}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-saywhat-dark">{officer.casesCreated}</td>
                      <td className="py-4 px-2 text-sm text-saywhat-dark">{officer.averageCallTime}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-saywhat-dark">{officer.rating}</span>
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
              {performanceData.officerPerformance.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No officer performance data available</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default PerformanceMetrics
