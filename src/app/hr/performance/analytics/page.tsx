"use client"

import { useState } from "react"
import { EnhancedLayout } from "@/components/layout/enhanced-layout"
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  AcademicCapIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from "@heroicons/react/24/outline"

export default function PerformanceAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("quarterly")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // Mock data for performance analytics
  const performanceMetrics = {
    overall: {
      averageRating: 4.2,
      totalReviews: 156,
      completionRate: 89,
      improvementRate: 15
    },
    departments: [
      { name: "IT", avgRating: 4.5, employees: 25, trend: "up" },
      { name: "Programs", avgRating: 4.3, employees: 35, trend: "up" },
      { name: "HR", avgRating: 4.1, employees: 12, trend: "stable" },
      { name: "Finance", avgRating: 3.9, employees: 18, trend: "down" },
      { name: "Operations", avgRating: 4.0, employees: 22, trend: "up" }
    ],
    topPerformers: [
      { name: "Sarah Johnson", department: "IT", rating: 4.9, position: "Senior Developer" },
      { name: "Michael Chen", department: "Programs", rating: 4.8, position: "Project Manager" },
      { name: "Emily Davis", department: "HR", rating: 4.7, position: "HR Specialist" },
      { name: "David Wilson", department: "Finance", rating: 4.6, position: "Financial Analyst" },
      { name: "Lisa Anderson", department: "Operations", rating: 4.6, position: "Operations Lead" }
    ],
    needsAttention: [
      { name: "John Smith", department: "Finance", rating: 2.8, position: "Accountant", issue: "Missed deadlines" },
      { name: "Jane Doe", department: "Operations", rating: 3.1, position: "Admin Assistant", issue: "Communication issues" },
      { name: "Bob Johnson", department: "IT", rating: 3.2, position: "Junior Developer", issue: "Technical skills gap" }
    ],
    skillGaps: [
      { skill: "Data Analysis", gap: 35, priority: "high" },
      { skill: "Project Management", gap: 28, priority: "medium" },
      { skill: "Communication", gap: 22, priority: "high" },
      { skill: "Leadership", gap: 18, priority: "medium" },
      { skill: "Technical Writing", gap: 15, priority: "low" }
    ]
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
      case "down":
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <EnhancedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into employee performance and development</p>
          </div>
          
          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              <option value="it">IT</option>
              <option value="programs">Programs</option>
              <option value="hr">HR</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.overall.averageRating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Reviews Completed</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.overall.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.overall.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Improvement Rate</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.overall.improvementRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Department Performance</h2>
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
                      Average Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceMetrics.departments.map((dept) => (
                    <tr key={dept.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.avgRating}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.employees}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getTrendIcon(dept.trend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
                Top Performers
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {performanceMetrics.topPerformers.map((performer, index) => (
                  <div key={performer.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{performer.name}</p>
                      <p className="text-sm text-gray-600">{performer.position} - {performer.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{performer.rating}</p>
                      <p className="text-xs text-gray-500">#{index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                Needs Attention
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {performanceMetrics.needsAttention.map((employee) => (
                  <div key={employee.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.position} - {employee.department}</p>
                      <p className="text-xs text-red-600">{employee.issue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{employee.rating}</p>
                      <button className="text-xs text-indigo-600 hover:text-indigo-800">
                        Create Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Gaps Analysis */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-2" />
              Skill Gaps Analysis
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {performanceMetrics.skillGaps.map((skill) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(skill.priority)}`}>
                        {skill.priority} priority
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${skill.gap}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{skill.gap}% skill gap identified</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recommended Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">Training Programs</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Schedule training for identified skill gaps in Data Analysis and Communication
                </p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                  Schedule Training →
                </button>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-900">Performance Reviews</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Conduct follow-up reviews for 3 employees needing attention
                </p>
                <button className="mt-2 text-sm text-yellow-600 hover:text-yellow-800">
                  Schedule Reviews →
                </button>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900">Recognition Program</h3>
                <p className="text-sm text-green-700 mt-1">
                  Recognize and reward top 5 performers this quarter
                </p>
                <button className="mt-2 text-sm text-green-600 hover:text-green-800">
                  Create Recognition →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnhancedLayout>
  )
}
