"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ModulePage } from "@/components/layout/enhanced-layout"
import Link from "next/link"
import {
  UserGroupIcon,
  UserPlusIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  StarIcon,
  ClockIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  EyeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"

interface HRDashboardData {
  metrics: {
    totalEmployees: number
    activeEmployees: number
    employeesOnLeave: number
    newHiresThisMonth: number
    newHireChange: string
    averagePerformance: string
    attendanceRate: string
    attendanceChange: string
  }
  pendingActions: {
    reviewsDue: number
    pendingLeaveRequests: number
    onboardingCount: number
  }
  recentActivity: Array<{
    type: string
    title: string
    description: string
    timestamp: string
    icon: string
  }>
}

interface HRModulesData {
  departments: {
    total: number
    breakdown: Array<{ department: string, _count: { id: number } }>
  }
  training: {
    totalPrograms: number
    activePrograms: number
    completedThisMonth: number
    upcomingPrograms: number
  }
  recruitment: {
    openPositions: number
    applicationsReceived: number
    interviewsScheduled: number
    offersExtended: number
  }
}

export default function HRDashboard() {
  const { data: session } = useSession()
  const [clickedIcons, setClickedIcons] = useState(new Set())
  const [dashboardData, setDashboardData] = useState<HRDashboardData | null>(null)
  const [modulesData, setModulesData] = useState<HRModulesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session) return
      
      try {
        setLoading(true)
        setError("")
        
        const [dashboardResponse, modulesResponse] = await Promise.all([
          fetch('/api/hr/dashboard'),
          fetch('/api/hr/modules')
        ])
        
        if (!dashboardResponse.ok) {
          throw new Error(`Dashboard HTTP ${dashboardResponse.status}: ${dashboardResponse.statusText}`)
        }
        
        if (!modulesResponse.ok) {
          throw new Error(`Modules HTTP ${modulesResponse.status}: ${modulesResponse.statusText}`)
        }
        
        const dashboardData = await dashboardResponse.json()
        const modulesData = await modulesResponse.json()
        
        setDashboardData(dashboardData)
        setModulesData(modulesData)
      } catch (err) {
        console.error('Failed to fetch HR dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [session])

  const handleIconClick = (moduleIndex: number) => {
    setClickedIcons(prev => new Set(prev).add(moduleIndex))
  }
  const metadata = {
    title: "HR Management Dashboard",
    description: "Human resources management overview and navigation",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management" }
    ]
  }

  const actions = (
    <>
      <Link href="/hr/reports">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          HR Reports
        </button>
      </Link>
      <Link href="/hr/employees/add">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </Link>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Employees</span>
            <span className="font-semibold">
              {loading ? 'Loading...' : dashboardData?.metrics.totalEmployees || '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Active</span>
            <span className="font-semibold text-green-600">
              {loading ? 'Loading...' : dashboardData?.metrics.activeEmployees || '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">On Leave</span>
            <span className="font-semibold text-orange-600">
              {loading ? 'Loading...' : dashboardData?.metrics.employeesOnLeave || '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">New Hires (Month)</span>
            <span className="font-semibold text-black">
              {loading ? 'Loading...' : dashboardData?.metrics.newHiresThisMonth || '0'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
        <div className="space-y-3">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-yellow-800">
              {loading ? 'Loading...' : `${dashboardData?.pendingActions.reviewsDue || 0} Reviews Due`}
            </div>
            <div className="text-xs text-yellow-600">Performance reviews pending</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              {loading ? 'Loading...' : `${dashboardData?.pendingActions.pendingLeaveRequests || 0} Leave Requests`}
            </div>
            <div className="text-xs text-blue-600">Awaiting approval</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-800">
              {loading ? 'Loading...' : `${dashboardData?.pendingActions.onboardingCount || 0} Onboarding`}
            </div>
            <div className="text-xs text-green-600">New employee setup</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
        <div className="space-y-2">
          <Link href="/hr/employees" className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Employee Directory
          </Link>
          <Link href="/hr/performance" className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Performance Reviews
          </Link>
          <Link href="/hr/training" className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Training Programs
          </Link>
          <Link href="/hr/payroll" className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Payroll Management
          </Link>
        </div>
      </div>
    </div>
  )

  const hrModules = [
    {
      title: "Employee Directory",
      description: "Manage employee profiles, contacts, and basic information",
      icon: UserGroupIcon,
      href: "/hr/employees",
      color: "blue",
      stats: loading ? "Loading..." : `${dashboardData?.metrics.totalEmployees || 0} employees`
    },
    {
      title: "Performance Management",
      description: "Track performance reviews, goals, and evaluations",
      icon: StarIcon,
      href: "/hr/performance",
      color: "yellow",
      stats: loading ? "Loading..." : `${dashboardData?.pendingActions.reviewsDue || 0} reviews due`
    },
    {
      title: "Training & Development",
      description: "Manage training programs, certifications, and skill development",
      icon: AcademicCapIcon,
      href: "/hr/training",
      color: "purple",
      stats: loading ? "Loading..." : `${modulesData?.training.activePrograms || 0} active programs`
    },
    {
      title: "Payroll Management",
      description: "Access integrated Belina payroll system for processing and reporting",
      icon: BanknotesIcon,
      href: "/hr/payroll",
      color: "green",
      stats: "Belina Integration"
    },
    {
      title: "Time & Attendance",
      description: "Track attendance, punch in/out, time tracking, and attendance roster",
      icon: ClockIcon,
      href: "/hr/attendance",
      color: "indigo",
      stats: loading ? "Loading..." : `${dashboardData?.metrics.activeEmployees || 0} present today`
    },
    {
      title: "Leave Management",
      description: "Plan leave in SIRTIS, apply through integrated Belina system",
      icon: CalendarDaysIcon,
      href: "/hr/leave",
      color: "teal",
      stats: "Planning + Belina"
    },
    {
      title: "Departments",
      description: "Manage organizational structure and department information",
      icon: BuildingOfficeIcon,
      href: "/hr/departments",
      color: "red",
      stats: loading ? "Loading..." : `${modulesData?.departments.total || 0} departments`
    },
    {
      title: "Recruitment",
      description: "Handle job postings, applications, and hiring process",
      icon: UserPlusIcon,
      href: "/hr/recruitment",
      color: "pink",
      stats: loading ? "Loading..." : `${modulesData?.recruitment.openPositions || 0} open positions`
    },
    {
      title: "HR Analytics",
      description: "View HR metrics, reports, and analytics dashboard",
      icon: ChartBarIcon,
      href: "/hr/analytics",
      color: "orange",
      stats: "Real-time insights"
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      green: "bg-green-50 border-green-200 text-green-600",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
      teal: "bg-teal-50 border-teal-200 text-teal-600",
      red: "bg-red-50 border-red-200 text-red-600",
      pink: "bg-pink-50 border-pink-200 text-pink-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600"
    }
    return colorMap[color as keyof typeof colorMap] || "bg-gray-50 border-gray-200 text-gray-600"
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">HR Management Dashboard</h1>
          <p className="text-blue-100">Comprehensive human resources management for your organization</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {loading ? 'Loading...' : dashboardData?.metrics.totalEmployees || '0'}
                </h3>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">vs last month</span>
                <span className="text-green-600 font-medium">
                  {loading ? 'Loading...' : dashboardData?.metrics.newHireChange || '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {loading ? 'Loading...' : modulesData?.training.activePrograms || '0'}
                </h3>
                <p className="text-sm text-gray-500">Training Sessions</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This month</span>
                <span className="text-blue-600 font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {loading ? 'Loading...' : dashboardData?.metrics.averagePerformance || '0.0'}
                </h3>
                <p className="text-sm text-gray-500">Avg Performance</p>
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {loading ? 'Loading...' : dashboardData?.metrics.attendanceRate || '0%'}
                </h3>
                <p className="text-sm text-gray-500">Attendance Rate</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This month</span>
                <span className="text-green-600 font-medium">
                  {loading ? 'Loading...' : dashboardData?.metrics.attendanceChange || '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* HR Modules Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">HR Management Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hrModules.map((module, index) => (
              <Link key={index} href={module.href}>
                <div 
                  className={`p-6 rounded-lg border-2 hover:shadow-lg transition-all duration-200 cursor-pointer ${getColorClasses(module.color)}`}
                  onClick={() => handleIconClick(index)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <module.icon 
                      className={`h-8 w-8 transition-colors duration-200 ${
                        clickedIcons.has(index) 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }`} 
                    />
                    <ChevronRightIcon className="h-5 w-5 opacity-50" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                  <div className="text-xs font-medium opacity-75">{module.stats}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent HR Activity</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading recent activities...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500">Error loading activities: {error}</p>
              </div>
            ) : dashboardData?.recentActivity.length ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.icon === 'UserPlusIcon' && (
                      <UserPlusIcon className="h-6 w-6 text-green-500" />
                    )}
                    {activity.icon === 'StarIcon' && (
                      <StarIcon className="h-6 w-6 text-yellow-500" />
                    )}
                    {activity.icon === 'AcademicCapIcon' && (
                      <AcademicCapIcon className="h-6 w-6 text-purple-500" />
                    )}
                    {activity.icon === 'DocumentTextIcon' && (
                      <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.description} - {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
