"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
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

export default function AppraisalAnalyticsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [periods, setPeriods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch departments and periods
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [deptResponse, periodsResponse] = await Promise.all([
          fetch('/api/hr/departments'),
          fetch('/api/hr/performance/periods')
        ])

        if (deptResponse.ok) {
          const deptData = await deptResponse.json()
          setDepartments(deptData.success ? deptData.data : [])
        }

        if (periodsResponse.ok) {
          const periodsData = await periodsResponse.json()
          setPeriods(periodsData.success ? periodsData.data : [])
        }
      } catch (error) {
        console.error('Error fetching filters:', error)
      }
    }

    fetchFilters()
  }, [])

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (selectedDepartment !== 'all') {
          params.append('department', selectedDepartment)
        }
        if (selectedPeriod !== 'all') {
          params.append('period', selectedPeriod)
        }

        const response = await fetch(`/api/hr/performance/appraisals/analytics?${params}`)
        const data = await response.json()

        if (data.success) {
          setAnalyticsData(data.data)
        } else {
          setError(data.error || 'Failed to load analytics data')
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setError('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [selectedDepartment, selectedPeriod])

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
                  disabled={loading}
                >
                  <option value="all">All Periods</option>
                  {periods && periods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  disabled={loading}
                >
                  <option value="all">All Departments</option>
                  {departments && departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading analytics data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading analytics data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && !error && analyticsData && (
          <>
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
                        {getTrendIcon(analyticsData.totalAppraisals, analyticsData.totalAppraisals - 7)}
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
                      <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalAppraisals > 0 ? Math.round((analyticsData.completedAppraisals / analyticsData.totalAppraisals) * 100) : 0}%</p>
                      <div className="flex items-center mt-1">
                        {getTrendIcon(analyticsData.totalAppraisals > 0 ? Math.round((analyticsData.completedAppraisals / analyticsData.totalAppraisals) * 100) : 0, 85)}
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
                        {getTrendIcon(analyticsData.averageRating, analyticsData.averageRating - 0.2)}
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
                        {getTrendIcon(analyticsData.onTimeCompletion, analyticsData.onTimeCompletion - 3)}
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
                        const deptCompletionRate = dept.total > 0 ? Math.round((dept.completed / dept.total) * 100) : 0
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
                                    className={`h-2 rounded-full ${getProgressColor(deptCompletionRate)}`}
                                    style={{ width: `${deptCompletionRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{deptCompletionRate}%</span>
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
                          <span className="font-medium">{month.month}</span>
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
                        {analyticsData.improvementAreas.length > 0 
                          ? `${analyticsData.improvementAreas[0].area} training needed for employees with low ratings`
                          : 'Training programs available for skill development'
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">Follow-up Required</h3>
                      <p className="text-sm text-yellow-700">
                        {analyticsData.totalAppraisals - analyticsData.completedAppraisals} appraisals are pending completion and need immediate attention
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Recognition Program</h3>
                      <p className="text-sm text-green-700">
                        {analyticsData.topPerformers.length} top performers should be considered for recognition or promotion
                      </p>
                    </div>
                  </div>
                </div>
            </>
        )}
      </div>
    </ModulePage>
  )
}
