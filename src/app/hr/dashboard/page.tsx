"use client"

import { useState, useEffect } from "react"
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

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  newEmployeesThisMonth: number
  departmentCount: number
  trainingCount: number
  activeTrainings: number
  averagePerformance: number
  attendanceRate: number
  attendanceIncrease: number
  pendingReviews: number
  onboardingCount: number
  departments: Array<{ name: string; count: number }>
}

interface RecentActivity {
  id: string
  type: string
  icon: string
  title: string
  description: string
  timestamp: string
  timeAgo: string
  color: string
}

export default function HRDashboard() {
  const [clickedIcons, setClickedIcons] = useState(new Set())
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      UserPlus: UserPlusIcon,
      Star: StarIcon,
      AcademicCap: AcademicCapIcon,
      DocumentText: DocumentTextIcon,
      BuildingOffice: BuildingOfficeIcon,
      Clock: ClockIcon
    }
    return iconMap[iconName] || UserGroupIcon
  }

  const getIconColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      green: 'text-green-500',
      yellow: 'text-yellow-500',
      purple: 'text-purple-500',
      blue: 'text-blue-500',
      indigo: 'text-indigo-500',
      red: 'text-red-500'
    }
    return colorMap[color] || 'text-gray-500'
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null)
        const [statsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/hr/dashboard/stats'),
          fetch('/api/hr/dashboard/activities')
        ])

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        } else {
          const errorData = await statsResponse.json()
          setError(errorData.error || 'Failed to fetch statistics')
        }

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData)
        } else {
          console.error('Failed to fetch activities')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Unable to connect to server')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
        {error ? (
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Employees</span>
              <span className="font-semibold">
                {loading ? '...' : stats?.totalEmployees || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="font-semibold text-green-600">
                {loading ? '...' : stats?.activeEmployees || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Hires (Month)</span>
              <span className="font-semibold text-black">
                {loading ? '...' : stats?.newEmployeesThisMonth || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
        {error ? (
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-sm text-red-800">Unable to load pending actions</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-yellow-800">
                {loading ? '...' : `${stats?.pendingReviews || 0} Reviews Due`}
              </div>
              <div className="text-xs text-yellow-600">Performance reviews pending</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800">
                {loading ? '...' : `${stats?.onboardingCount || 0} Onboarding`}
              </div>
              <div className="text-xs text-green-600">New employee setup</div>
            </div>
          </div>
        )}
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
          <Link href="/hr/reports" className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            HR Reports
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
      stats: loading ? "Loading..." : `${stats?.totalEmployees || 0} employees`
    },
    {
      title: "Performance Management",
      description: "Track performance reviews, goals, and evaluations",
      icon: StarIcon,
      href: "/hr/performance",
      color: "yellow",
      stats: loading ? "Loading..." : `${stats?.pendingReviews || 0} reviews due`
    },
    {
      title: "Training & Development",
      description: "Manage training programs, certifications, and skill development",
      icon: AcademicCapIcon,
      href: "/hr/training",
      color: "purple",
      stats: loading ? "Loading..." : `${stats?.activeTrainings || 0} active programs`
    },
    {
      title: "Time & Attendance",
      description: "Track attendance, punch in/out, time tracking, and attendance roster",
      icon: ClockIcon,
      href: "/hr/attendance",
      color: "indigo",
      stats: loading ? "Loading..." : `${stats?.attendanceRate || 0}% attendance rate`
    },
    {
      title: "Departments",
      description: "Manage organizational structure and department information",
      icon: BuildingOfficeIcon,
      href: "/hr/departments",
      color: "red",
      stats: loading ? "Loading..." : `${stats?.departmentCount || 0} departments`
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
                  {loading ? '...' : stats?.totalEmployees || '-'}
                </h3>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">vs last month</span>
                <span className="text-green-600 font-medium">
                  {loading ? '...' : `+${stats?.newEmployeesThisMonth || 0}`}
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
                  {loading ? '...' : stats?.activeTrainings || '-'}
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
                  {loading ? '...' : stats?.averagePerformance || '4.7'}
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
                  {loading ? '...' : `${stats?.attendanceRate || '96.2'}%`}
                </h3>
                <p className="text-sm text-gray-500">Attendance Rate</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This month</span>
                <span className="text-green-600 font-medium">
                  {loading ? '...' : `+${stats?.attendanceIncrease || '0.8'}%`}
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
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const IconComponent = getIconComponent(activity.icon)
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <IconComponent className={`h-6 w-6 ${getIconColor(activity.color)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description} - {activity.timeAgo}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No recent activity to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
