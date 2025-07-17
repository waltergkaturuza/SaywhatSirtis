"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from "@heroicons/react/24/outline"

interface AnalyticsData {
  totalAppraisals: number
  completedAppraisals: number
  averageRating: number
  onTimeCompletion: number
  departmentStats: Array<{
    department: string
    total: number
    completed: number
    averageRating: number
    onTime: number
  }>
  ratingDistribution: Array<{
    rating: number
    count: number
    percentage: number
  }>
  monthlyTrends: Array<{
    month: string
    completed: number
    averageRating: number
  }>
  topPerformers: Array<{
    name: string
    department: string
    rating: number
    period: string
  }>
  improvementAreas: Array<{
    area: string
    averageRating: number
    count: number
  }>
}

// Sample analytics data
const analyticsData: AnalyticsData = {
  totalAppraisals: 125,
  completedAppraisals: 98,
  averageRating: 4.2,
  onTimeCompletion: 87,
  departmentStats: [
    {
      department: "Operations",
      total: 25,
      completed: 22,
      averageRating: 4.4,
      onTime: 88
    },
    {
      department: "Healthcare",
      total: 30,
      completed: 28,
      averageRating: 4.3,
      onTime: 93
    },
    {
      department: "Education",
      total: 20,
      completed: 18,
      averageRating: 4.1,
      onTime: 90
    },
    {
      department: "Water & Sanitation",
      total: 15,
      completed: 13,
      averageRating: 4.0,
      onTime: 80
    },
    {
      department: "Nutrition",
      total: 18,
      completed: 17,
      averageRating: 4.5,
      onTime: 85
    },
    {
      department: "Protection",
      total: 17,
      completed: 15,
      averageRating: 4.2,
      onTime: 88
    }
  ],
  ratingDistribution: [
    { rating: 5, count: 35, percentage: 36 },
    { rating: 4, count: 28, percentage: 29 },
    { rating: 3, count: 20, percentage: 20 },
    { rating: 2, count: 10, percentage: 10 },
    { rating: 1, count: 5, percentage: 5 }
  ],
  monthlyTrends: [
    { month: "Jan", completed: 32, averageRating: 4.1 },
    { month: "Feb", completed: 28, averageRating: 4.3 },
    { month: "Mar", completed: 38, averageRating: 4.2 },
    { month: "Apr", completed: 25, averageRating: 4.4 }
  ],
  topPerformers: [
    { name: "Ahmed Hassan", department: "Nutrition", rating: 4.9, period: "Q1 2024" },
    { name: "Sarah Johnson", department: "Education", rating: 4.8, period: "Q1 2024" },
    { name: "John Doe", department: "Operations", rating: 4.7, period: "Q1 2024" },
    { name: "Dr. Amina Hassan", department: "Healthcare", rating: 4.6, period: "Q1 2024" },
    { name: "Fatima Al-Zahra", department: "Water & Sanitation", rating: 4.5, period: "Q1 2024" }
  ],
  improvementAreas: [
    { area: "Strategic Planning", averageRating: 3.2, count: 45 },
    { area: "Time Management", averageRating: 3.4, count: 38 },
    { area: "Delegation", averageRating: 3.6, count: 32 },
    { area: "Innovation", averageRating: 3.8, count: 28 },
    { area: "Mentoring", averageRating: 3.9, count: 25 }
  ]
}

export default function AppraisalAnalyticsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q1 2024')

  const metadata = {
    title: "Analytics - Performance Appraisals",
    description: "Performance appraisal analytics and insights",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Appraisals", href: "/hr/performance/appraisals" },
      { name: "Analytics" }
    ]
  }

  const completionRate = Math.round((analyticsData.completedAppraisals / analyticsData.totalAppraisals) * 100)

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 80) return 'bg-blue-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
    } else if (current < previous) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
    }
    return null
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Appraisal Analytics</h1>
                <p className="text-gray-600">Performance insights and trends</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Q1 2024">Q1 2024</option>
                  <option value="Q4 2023">Q4 2023</option>
                  <option value="Q3 2023">Q3 2023</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Departments</option>
                  {analyticsData.departmentStats.map((dept) => (
                    <option key={dept.department} value={dept.department}>
                      {dept.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appraisals</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalAppraisals}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(125, 118)}
                  <span className="text-xs text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{completionRate}%</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(completionRate, 82)}
                  <span className="text-xs text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.averageRating}/5</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(4.2, 4.0)}
                  <span className="text-xs text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On-Time Completion</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.onTimeCompletion}%</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(87, 84)}
                  <span className="text-xs text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Department Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Total</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Completed</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Completion Rate</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Avg Rating</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">On-Time %</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.departmentStats.map((dept) => {
                  const completionRate = Math.round((dept.completed / dept.total) * 100)
                  return (
                    <tr key={dept.department} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {dept.department}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">{dept.total}</td>
                      <td className="text-center py-3 px-4">{dept.completed}</td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(completionRate)}`}
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{completionRate}%</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`font-semibold ${getRatingColor(dept.averageRating)}`}>
                          {dept.averageRating}/5
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">{dept.onTime}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Rating Distribution</h2>
            <div className="space-y-4">
              {analyticsData.ratingDistribution.map((rating) => (
                <div key={rating.rating} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-sm font-medium mr-2">{rating.rating}</span>
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${rating.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm text-gray-600">{rating.count} ({rating.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Trends</h2>
            <div className="space-y-4">
              {analyticsData.monthlyTrends.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="font-medium">{month.month} 2024</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Completed</div>
                      <div className="font-semibold">{month.completed}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Avg Rating</div>
                      <div className={`font-semibold ${getRatingColor(month.averageRating)}`}>
                        {month.averageRating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performers</h2>
            <div className="space-y-4">
              {analyticsData.topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{performer.name}</div>
                    <div className="text-sm text-gray-600">{performer.department}</div>
                    <div className="text-xs text-gray-500">{performer.period}</div>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-bold text-green-600">{performer.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Improvement Areas */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Common Improvement Areas</h2>
            <div className="space-y-4">
              {analyticsData.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{area.area}</div>
                    <div className="text-sm text-gray-600">{area.count} employees need improvement</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getRatingColor(area.averageRating)}`}>
                      {area.averageRating}/5
                    </div>
                    <div className="text-xs text-gray-500">Avg Rating</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Schedule Training</h3>
              <p className="text-sm text-blue-700">
                Strategic Planning training for 45 employees with ratings below 3.5
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Follow-up Required</h3>
              <p className="text-sm text-yellow-700">
                27 appraisals are pending completion and need immediate attention
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Recognition Program</h3>
              <p className="text-sm text-green-700">
                5 top performers should be considered for recognition or promotion
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
