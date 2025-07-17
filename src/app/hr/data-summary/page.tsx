"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  ChartBarIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingOfficeIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BellIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"

export default function HRDataSummaryPage() {
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState("Q1-2024")
  const [selectedSecretariat, setSelectedSecretariat] = useState("all")
  const [viewMode, setViewMode] = useState("overview")

  const metadata = {
    title: "HR Data Summary",
    description: "Secretariat performance analysis and employee metrics",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Data Summary" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Export Report
      </button>
      <Link href="/hr/performance/plans">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Performance Plans
        </button>
      </Link>
    </>
  )

  // Check user permissions for HR access
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')
  const canViewAllData = isHRStaff || userPermissions.includes('hr.analytics')

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Filters</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="Q1-2024">Q1 2024</option>
              <option value="Q4-2023">Q4 2023</option>
              <option value="Q3-2023">Q3 2023</option>
              <option value="Annual-2023">Annual 2023</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secretariat</label>
            <select
              value={selectedSecretariat}
              onChange={(e) => setSelectedSecretariat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Secretariats</option>
              <option value="operations">Operations</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance & Admin</option>
              <option value="programs">Programs & M&E</option>
              <option value="governance">Governance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed Analysis</option>
              <option value="trends">Performance Trends</option>
              <option value="comparisons">Department Comparison</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Top Performer</span>
            </div>
            <p className="text-sm text-green-700 mt-1">Operations Secretariat - 94% avg rating</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">Needs Attention</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">3 departments below 70% target</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <BellIcon className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Update Available</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">New performance data for {selectedPeriod}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/hr/performance/plans" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Performance Plans
          </Link>
          <Link href="/hr/performance/appraisals" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            View Appraisals
          </Link>
          <Link href="/hr/employees" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Employee Directory
          </Link>
          <Link href="/hr/training" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Training Programs
          </Link>
        </div>
      </div>
    </div>
  )

  const secretariatData = [
    {
      id: 1,
      name: "Operations Secretariat",
      totalEmployees: 85,
      satisfactoryPerforming: 79,
      underperforming: 6,
      averageRating: 4.2,
      completionRate: 94,
      trend: "up",
      trendValue: 8,
      topPerformers: 15,
      improvementNeeded: 6,
      supervisor: "Sarah Johnson",
      keyMetrics: {
        goalCompletion: 92,
        skillDevelopment: 88,
        teamCollaboration: 95,
        innovation: 85
      }
    },
    {
      id: 2,
      name: "Healthcare Secretariat",
      totalEmployees: 72,
      satisfactoryPerforming: 65,
      underperforming: 7,
      averageRating: 4.0,
      completionRate: 90,
      trend: "up",
      trendValue: 5,
      topPerformers: 12,
      improvementNeeded: 7,
      supervisor: "Dr. Amina Hassan",
      keyMetrics: {
        goalCompletion: 88,
        skillDevelopment: 92,
        teamCollaboration: 89,
        innovation: 78
      }
    },
    {
      id: 3,
      name: "Finance & Admin Secretariat",
      totalEmployees: 48,
      satisfactoryPerforming: 42,
      underperforming: 6,
      averageRating: 3.8,
      completionRate: 88,
      trend: "down",
      trendValue: -3,
      topPerformers: 8,
      improvementNeeded: 6,
      supervisor: "Jennifer Smith",
      keyMetrics: {
        goalCompletion: 85,
        skillDevelopment: 82,
        teamCollaboration: 90,
        innovation: 75
      }
    },
    {
      id: 4,
      name: "Programs & M&E Secretariat",
      totalEmployees: 56,
      satisfactoryPerforming: 48,
      underperforming: 8,
      averageRating: 3.9,
      completionRate: 86,
      trend: "stable",
      trendValue: 1,
      topPerformers: 10,
      improvementNeeded: 8,
      supervisor: "Mark Wilson",
      keyMetrics: {
        goalCompletion: 82,
        skillDevelopment: 85,
        teamCollaboration: 88,
        innovation: 90
      }
    },
    {
      id: 5,
      name: "Governance Secretariat",
      totalEmployees: 32,
      satisfactoryPerforming: 26,
      underperforming: 6,
      averageRating: 3.7,
      completionRate: 81,
      trend: "down",
      trendValue: -5,
      topPerformers: 5,
      improvementNeeded: 6,
      supervisor: "Dr. Ahmed Musa",
      keyMetrics: {
        goalCompletion: 78,
        skillDevelopment: 80,
        teamCollaboration: 85,
        innovation: 72
      }
    }
  ]

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.0) return "text-green-600"
    if (rating >= 3.5) return "text-blue-600"
    if (rating >= 3.0) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === "up") return <ArrowUpIcon className="h-4 w-4 text-green-600" />
    if (trend === "down") return <ArrowDownIcon className="h-4 w-4 text-red-600" />
    return <span className="text-gray-400">—</span>
  }

  const calculateSatisfactoryPercentage = (satisfactory: number, total: number) => {
    return Math.round((satisfactory / total) * 100)
  }

  const calculateUnderperformingPercentage = (underperforming: number, total: number) => {
    return Math.round((underperforming / total) * 100)
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Overall Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">293</h3>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Across all secretariats</span>
                <span className="text-blue-600 font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">260</h3>
                <p className="text-sm text-gray-500">Satisfactory Performing</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">88.7% of workforce</span>
                <span className="text-green-600 font-medium">Good</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">33</h3>
                <p className="text-sm text-gray-500">Underperforming</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">11.3% need support</span>
                <span className="text-red-600 font-medium">Action Needed</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">3.9</h3>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Out of 5.0</span>
                <span className="text-yellow-600 font-medium">Good</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Distribution Chart */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Distribution by Secretariat</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Period:</span>
              <span className="text-sm font-medium text-gray-900">{selectedPeriod}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {secretariatData.map((secretariat) => (
              <div key={secretariat.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">{secretariat.name}</h4>
                      <p className="text-sm text-gray-500">Supervised by {secretariat.supervisor}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getRatingColor(secretariat.averageRating)}`}>
                        {secretariat.averageRating}/5.0
                      </div>
                      <div className="text-xs text-gray-500">Avg Rating</div>
                    </div>
                    <div className="flex items-center">
                      {getTrendIcon(secretariat.trend, secretariat.trendValue)}
                      <span className={`text-sm ml-1 ${
                        secretariat.trend === "up" ? "text-green-600" : 
                        secretariat.trend === "down" ? "text-red-600" : "text-gray-500"
                      }`}>
                        {secretariat.trendValue > 0 ? `+${secretariat.trendValue}` : secretariat.trendValue}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{secretariat.totalEmployees}</div>
                    <div className="text-sm text-gray-500">Total Staff</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{secretariat.satisfactoryPerforming}</div>
                    <div className="text-sm text-gray-500">Satisfactory</div>
                    <div className="text-xs text-green-600">
                      {calculateSatisfactoryPercentage(secretariat.satisfactoryPerforming, secretariat.totalEmployees)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{secretariat.underperforming}</div>
                    <div className="text-sm text-gray-500">Underperforming</div>
                    <div className="text-xs text-red-600">
                      {calculateUnderperformingPercentage(secretariat.underperforming, secretariat.totalEmployees)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{secretariat.topPerformers}</div>
                    <div className="text-sm text-gray-500">Top Performers</div>
                    <div className="text-xs text-blue-600">
                      {Math.round((secretariat.topPerformers / secretariat.totalEmployees) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Performance Visualization */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Performance Distribution</span>
                    <span className="text-gray-900">{secretariat.completionRate}% completion rate</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 relative">
                    <div
                      className="bg-green-500 h-3 rounded-l-full"
                      style={{ width: `${calculateSatisfactoryPercentage(secretariat.satisfactoryPerforming, secretariat.totalEmployees)}%` }}
                    ></div>
                    <div
                      className="bg-red-500 h-3 rounded-r-full absolute top-0"
                      style={{ 
                        left: `${calculateSatisfactoryPercentage(secretariat.satisfactoryPerforming, secretariat.totalEmployees)}%`,
                        width: `${calculateUnderperformingPercentage(secretariat.underperforming, secretariat.totalEmployees)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Satisfactory ({calculateSatisfactoryPercentage(secretariat.satisfactoryPerforming, secretariat.totalEmployees)}%)</span>
                    <span>Underperforming ({calculateUnderperformingPercentage(secretariat.underperforming, secretariat.totalEmployees)}%)</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                  <div className="text-center">
                    <div className={`text-sm font-medium ${getPerformanceColor(secretariat.keyMetrics.goalCompletion)}`}>
                      {secretariat.keyMetrics.goalCompletion}%
                    </div>
                    <div className="text-xs text-gray-500">Goal Completion</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${getPerformanceColor(secretariat.keyMetrics.skillDevelopment)}`}>
                      {secretariat.keyMetrics.skillDevelopment}%
                    </div>
                    <div className="text-xs text-gray-500">Skill Development</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${getPerformanceColor(secretariat.keyMetrics.teamCollaboration)}`}>
                      {secretariat.keyMetrics.teamCollaboration}%
                    </div>
                    <div className="text-xs text-gray-500">Team Collaboration</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${getPerformanceColor(secretariat.keyMetrics.innovation)}`}>
                      {secretariat.keyMetrics.innovation}%
                    </div>
                    <div className="text-xs text-gray-500">Innovation</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {secretariat.improvementNeeded} employees need improvement support
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/hr/performance/plans?secretariat=${secretariat.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View Plans
                        </button>
                      </Link>
                      <Link href={`/hr/performance/appraisals?secretariat=${secretariat.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View Appraisals
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trends and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-800">Improving Secretariats</div>
                  <div className="text-sm text-green-600">2 secretariats showing upward trends</div>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-medium text-red-800">Declining Performance</div>
                  <div className="text-sm text-red-600">2 secretariats need attention</div>
                </div>
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800">Overall Completion</div>
                  <div className="text-sm text-blue-600">87.8% average completion rate</div>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h3>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-yellow-800">33 Underperforming Employees</div>
                  <div className="text-sm text-yellow-700">Require performance improvement plans</div>
                  <Link href="/hr/performance/plans/create?type=improvement">
                    <button className="text-yellow-800 text-sm font-medium hover:text-yellow-900 mt-1">
                      Create Improvement Plans →
                    </button>
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <BellIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-800">Training Opportunities</div>
                  <div className="text-sm text-blue-700">Identify skill gaps for development</div>
                  <Link href="/hr/training">
                    <button className="text-blue-800 text-sm font-medium hover:text-blue-900 mt-1">
                      View Training Programs →
                    </button>
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-green-800">Recognition Programs</div>
                  <div className="text-sm text-green-700">50 top performers eligible for recognition</div>
                  <Link href="/hr/performance/recognition">
                    <button className="text-green-800 text-sm font-medium hover:text-green-900 mt-1">
                      Manage Recognition →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
