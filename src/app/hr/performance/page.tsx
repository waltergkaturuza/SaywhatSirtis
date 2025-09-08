"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  StarIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon
} from "@heroicons/react/24/outline"

export default function PerformancePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("reviews")
  const [performanceReviews, setPerformanceReviews] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch performance data from backend
  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!session) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/hr/performance')
        if (response.ok) {
          const data = await response.json()
          setPerformanceReviews(data.reviews || [])
          setGoals(data.goals || [])
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch performance data')
        }
      } catch (error) {
        console.error('Error fetching performance data:', error)
        setError('Unable to connect to server')
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [session])

  const metadata = {
    title: "Performance Management",
    description: "Track performance reviews, goals, and evaluations",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Export Report
      </button>
      <Link href="/hr/performance/schedule">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Schedule Review
        </button>
      </Link>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Average Rating</span>
            <span className="font-semibold text-yellow-600">4.7/5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Reviews Due</span>
            <span className="font-semibold text-red-600">15</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="font-semibold text-green-600">234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">In Progress</span>
            <span className="font-semibold text-blue-600">23</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Excellent (4.5-5.0)</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
              <span className="text-xs text-gray-500">45%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Good (3.5-4.4)</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "35%" }}></div>
              </div>
              <span className="text-xs text-gray-500">35%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Average (2.5-3.4)</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "15%" }}></div>
              </div>
              <span className="text-xs text-gray-500">15%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Below Average (&lt;2.5)</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "5%" }}></div>
              </div>
              <span className="text-xs text-gray-500">5%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/hr/performance/schedule" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Schedule Review
          </Link>
          <Link href="/hr/performance/templates" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Review Templates
          </Link>
          <Link href="/hr/performance/goals" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Goal Setting
          </Link>
          <Link href="/hr/performance/reports" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Performance Reports
          </Link>
        </div>
      </div>
    </div>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-gray-100 text-gray-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 text-green-800"
      case "at-risk":
        return "bg-yellow-100 text-yellow-800"
      case "behind":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">Not rated</span>
    
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}</span>
      </div>
    )
  }

  const tabs = [
    { id: "reviews", name: "Performance Reviews", icon: StarIcon },
    { id: "goals", name: "Goals & Objectives", icon: ChartBarIcon },
    { id: "analytics", name: "Performance Analytics", icon: DocumentTextIcon }
  ]

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Performance Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">4.7</h3>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Out of 5.0</span>
                <span className="text-green-600 font-medium">Excellent</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">15</h3>
                <p className="text-sm text-gray-500">Reviews Due</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Action needed</span>
                <span className="text-red-600 font-medium">Overdue</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">234</h3>
                <p className="text-sm text-gray-500">Completed Reviews</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This year</span>
                <span className="text-green-600 font-medium">+12%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">23</h3>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active reviews</span>
                <span className="text-blue-600 font-medium">Ongoing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading performance data...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
                  <p className="text-red-600">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Performance Reviews</h3>
                      <div className="flex space-x-2">
                        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                          <option>All Status</option>
                          <option>Completed</option>
                          <option>In Progress</option>
                          <option>Overdue</option>
                          <option>Scheduled</option>
                        </select>
                        <Link href="/hr/performance/schedule">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                            Schedule Review
                          </button>
                        </Link>
                      </div>
                    </div>

                    {performanceReviews.length === 0 ? (
                      <div className="text-center py-8">
                        <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Reviews</h3>
                        <p className="text-gray-600">No performance reviews found. Schedule a review to get started.</p>
                        <Link href="/hr/performance/schedule">
                          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                            Schedule Review
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goals</th>
                              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {performanceReviews.map((review) => (
                              <tr key={review.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                      <UserIcon className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">{review.employeeName}</div>
                                      <div className="text-sm text-gray-500">{review.position}</div>
                                    </div>
                                  </div>
                                </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {review.reviewType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1).replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStars(review.rating)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {review.reviewer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {new Date(review.dueDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {review.goalsCompleted}/{review.goals}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link href={`/hr/performance/reviews/${review.id}`}>
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </Link>
                              <Link href={`/hr/performance/reviews/${review.id}/edit`}>
                                <button className="text-gray-600 hover:text-gray-900">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "goals" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Employee Goals & Objectives</h3>
                  <Link href="/hr/performance/goals/add">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                      Add Goal
                    </button>
                  </Link>
                </div>

                {goals.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Set</h3>
                    <p className="text-gray-600">No employee goals found. Add a goal to get started.</p>
                    <Link href="/hr/performance/goals/add">
                      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                        Add Goal
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => (
                    <div key={goal.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{goal.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(goal.priority)}`}>
                          {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                goal.progress >= 80 ? 'bg-green-500' :
                                goal.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGoalStatusColor(goal.status)}`}>
                            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1).replace('-', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            Due: {new Date(goal.dueDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                          <div className="text-sm text-gray-600 mb-1">Employee</div>
                          <div className="text-sm font-medium text-gray-900">{goal.employeeName}</div>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Analytics Overview</h3>
                  <Link href="/hr/performance/analytics">
                    <button className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700">
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      View Full Analytics
                    </button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Quick Stats</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Performance Rating</span>
                        <span className="font-semibold">4.2/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reviews Completed This Quarter</span>
                        <span className="font-semibold">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Improvement Rate</span>
                        <span className="font-semibold text-green-600">+15%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Department Comparison</h4>
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Department comparison chart will be implemented here</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Key Performance Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">87%</div>
                      <div className="text-sm text-gray-600">Goal Completion Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">4.7</div>
                      <div className="text-sm text-gray-600">Average Performance Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">92%</div>
                      <div className="text-sm text-gray-600">Review Completion Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
