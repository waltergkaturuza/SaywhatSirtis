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

interface HRStats {
  totalEmployees: number
  activeEmployees: number
  newEmployeesThisMonth: number
  departmentCount: number
  pendingReviews: number
  trainingPrograms: number
  monthlyPayroll: number
  presentToday: number
  pendingLeaveApprovals: number
  openPositions: number
}

export default function HRDashboard() {
  const [stats, setStats] = useState<HRStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHRStats()
  }, [])

  const fetchHRStats = async () => {
    try {
      const response = await fetch('/api/hr/stats')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch HR stats:', error)
    } finally {
      setLoading(false)
    }
  }
  const metadata = {
    title: "Member Management Dashboard",
    description: "SAYWHAT member management overview and navigation",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Member Management" }
    ]
  }

  const actions = (
    <>
      <Link href="/hr/reports">
        <button className="inline-flex items-center px-4 py-2 border border-saywhat-orange rounded-md shadow-sm text-sm font-medium text-saywhat-orange bg-white hover:bg-orange-50">
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          HR Reports
        </button>
      </Link>
      <Link href="/hr/employees/add">
        <button className="inline-flex items-center px-4 py-2 bg-saywhat-orange border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-600">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Member
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
            <span className="font-semibold">1,248</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Active</span>
            <span className="font-semibold text-green-600">1,195</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">On Leave</span>
            <span className="font-semibold text-yellow-600">42</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">New Hires (Month)</span>
            <span className="font-semibold text-blue-600">23</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
        <div className="space-y-3">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-yellow-800">15 Reviews Due</div>
            <div className="text-xs text-yellow-600">Performance reviews pending</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800">8 Leave Requests</div>
            <div className="text-xs text-blue-600">Awaiting approval</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-800">5 Onboarding</div>
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
      title: "Member Directory",
      description: "Manage member profiles, contacts, and basic information",
      icon: UserGroupIcon,
      href: "/hr/employees",
      color: "orange",
      stats: loading ? "Loading..." : `${stats?.totalEmployees || 0} members`
    },
    {
      title: "Performance Management",
      description: "Track performance reviews, goals, and evaluations",
      icon: StarIcon,
      href: "/hr/performance",
      color: "red",
      stats: loading ? "Loading..." : `${stats?.pendingReviews || 0} reviews due`
    },
    {
      title: "Training & Development",
      description: "Manage training programs, certifications, and skill development",
      icon: AcademicCapIcon,
      href: "/hr/training",
      color: "grey",
      stats: loading ? "Loading..." : `${stats?.trainingPrograms || 0} active programs`
    },
    {
      title: "Payroll Management",
      description: "Handle payroll, benefits, and compensation management",
      icon: BanknotesIcon,
      href: "/hr/payroll",
      color: "green",
      stats: loading ? "Loading..." : stats?.monthlyPayroll ? `$${(stats.monthlyPayroll / 1000000).toFixed(1)}M monthly` : "Not configured"
    },
    {
      title: "Time & Attendance",
      description: "Track attendance, punch in/out, time tracking, and attendance roster",
      icon: ClockIcon,
      href: "/hr/attendance",
      color: "blue",
      stats: loading ? "Loading..." : `${stats?.presentToday || 0} present today`
    },
    {
      title: "Leave Management",
      description: "Handle leave applications, approvals, and leave calendar",
      icon: CalendarDaysIcon,
      href: "/hr/leave",
      color: "teal",
      stats: loading ? "Loading..." : `${stats?.pendingLeaveApprovals || 0} pending approvals`
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
      title: "Recruitment",
      description: "Handle job postings, applications, and hiring process",
      icon: UserPlusIcon,
      href: "/hr/recruitment",
      color: "pink",
      stats: loading ? "Loading..." : `${stats?.openPositions || 0} open positions`
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
      orange: "bg-orange-50 border-orange-200 text-saywhat-orange",
      red: "bg-red-50 border-red-200 text-saywhat-red",
      grey: "bg-gray-50 border-gray-200 text-saywhat-grey",
      green: "bg-green-50 border-green-200 text-green-600",
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      teal: "bg-teal-50 border-teal-200 text-teal-600",
      pink: "bg-pink-50 border-pink-200 text-pink-600"
    }
    return colorMap[color as keyof typeof colorMap] || "bg-gray-50 border-gray-200 text-saywhat-grey"
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
                <h3 className="text-lg font-semibold text-gray-900">1,248</h3>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">vs last month</span>
                <span className="text-green-600 font-medium">+2.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">89</h3>
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
                <h3 className="text-lg font-semibold text-gray-900">4.7</h3>
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
                <h3 className="text-lg font-semibold text-gray-900">96.2%</h3>
                <p className="text-sm text-gray-500">Attendance Rate</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This month</span>
                <span className="text-green-600 font-medium">+0.8%</span>
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
                <div className={`p-6 rounded-lg border-2 hover:shadow-lg transition-all duration-200 cursor-pointer ${getColorClasses(module.color)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <module.icon className="h-8 w-8" />
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
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <UserPlusIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New employee onboarded</p>
                <p className="text-sm text-gray-500">John Doe joined the Operations team - 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <StarIcon className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Performance review completed</p>
                <p className="text-sm text-gray-500">Sarah Johnson's Q4 review scored 4.8/5 - 4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Training session scheduled</p>
                <p className="text-sm text-gray-500">Leadership Development program starts Monday - 1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payroll processed</p>
                <p className="text-sm text-gray-500">January 2024 payroll completed for all employees - 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
