"use client"

import React from 'react'
import {
  ChartBarIcon,
  PhoneIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

const CallCentreDashboard = () => {
  // Today's key metrics
  const todayMetrics = {
    totalCalls: 127,
    validCalls: 111,
    invalidCalls: 16,
    newCases: 8,
    onlineOfficers: 4,
    averageCallTime: '4.2 min',
    validCallRate: 87.4
  }

  // Weekly trends
  const weeklyTrends = {
    callsChange: +12.5,
    validRateChange: +2.3,
    casesChange: +8.7,
    responseTimeChange: -5.1
  }

  // Real-time activity feed
  const recentActivity = [
    {
      id: 1,
      type: 'call',
      message: 'New call: Youth employment inquiry',
      officer: 'Mary Chikuni',
      time: '2 min ago',
      status: 'ongoing'
    },
    {
      id: 2,
      type: 'case',
      message: 'Case resolved: Scholarship application',
      officer: 'David Nyathi',
      time: '15 min ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'call',
      message: 'Call transferred to Programs team',
      officer: 'Alice Mandaza',
      time: '23 min ago',
      status: 'transferred'
    }
  ]

  // Hour-by-hour call volume (simplified chart data)
  const hourlyData = [
    { hour: '08:00', calls: 12 },
    { hour: '09:00', calls: 18 },
    { hour: '10:00', calls: 15 },
    { hour: '11:00', calls: 22 },
    { hour: '12:00', calls: 8 },
    { hour: '13:00', calls: 19 },
    { hour: '14:00', calls: 16 },
    { hour: '15:00', calls: 17 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'transferred': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
    } else {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
    }
  }

  const getTrendColor = (change: number) => {
    return change > 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <PhoneIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Calls Today</p>
              <p className="text-2xl font-semibold text-gray-900">{todayMetrics.totalCalls}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(weeklyTrends.callsChange)}
                <span className={`text-sm ml-1 ${getTrendColor(weeklyTrends.callsChange)}`}>
                  {Math.abs(weeklyTrends.callsChange)}% vs last week
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valid Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{todayMetrics.validCallRate}%</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(weeklyTrends.validRateChange)}
                <span className={`text-sm ml-1 ${getTrendColor(weeklyTrends.validRateChange)}`}>
                  {Math.abs(weeklyTrends.validRateChange)}% vs last week
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Cases</p>
              <p className="text-2xl font-semibold text-gray-900">{todayMetrics.newCases}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(weeklyTrends.casesChange)}
                <span className={`text-sm ml-1 ${getTrendColor(weeklyTrends.casesChange)}`}>
                  {Math.abs(weeklyTrends.casesChange)}% vs last week
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Call Time</p>
              <p className="text-2xl font-semibold text-gray-900">{todayMetrics.averageCallTime}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(-weeklyTrends.responseTimeChange)}
                <span className={`text-sm ml-1 ${getTrendColor(-weeklyTrends.responseTimeChange)}`}>
                  {Math.abs(weeklyTrends.responseTimeChange)}% vs last week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Call Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Call Volume by Hour</h3>
          <div className="space-y-3">
            {hourlyData.map((item) => (
              <div key={item.hour} className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-16">{item.hour}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(item.calls / 25) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{item.calls}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="border-l-4 border-blue-400 pl-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.officer} • {activity.time}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all activities →
            </button>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valid Calls</p>
              <p className="text-3xl font-bold text-green-600">{todayMetrics.validCalls}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">of {todayMetrics.totalCalls} total</p>
              <div className="w-16 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(todayMetrics.validCalls / todayMetrics.totalCalls) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Invalid Calls</p>
              <p className="text-3xl font-bold text-red-600">{todayMetrics.invalidCalls}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">of {todayMetrics.totalCalls} total</p>
              <div className="w-16 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${(todayMetrics.invalidCalls / todayMetrics.totalCalls) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Officers Online</p>
              <p className="text-3xl font-bold text-blue-600">{todayMetrics.onlineOfficers}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Active now</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-green-600">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CallCentreDashboard
