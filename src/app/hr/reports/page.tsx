"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ModulePage } from "@/components/layout/enhanced-layout"
import Link from "next/link"
import {
  ChartBarIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline"

const reportTypes = [
  {
    title: "Employee Reports",
    description: "Employee lists, demographics, and status reports",
    icon: UserGroupIcon,
    color: "bg-blue-50 text-blue-600",
    href: "/hr/employees/reports"
  },
  {
    title: "Department Reports", 
    description: "Department structure and employee distribution",
    icon: BuildingOfficeIcon,
    color: "bg-green-50 text-green-600",
    href: "/hr/departments/reports"
  },
  {
    title: "Performance Reports",
    description: "Performance reviews, ratings, and analytics",
    icon: ChartBarIcon,
    color: "bg-purple-50 text-purple-600", 
    href: "/hr/performance/reports"
  },
  {
    title: "Training Reports",
    description: "Training completion, certificates, and progress",
    icon: AcademicCapIcon,
    color: "bg-orange-50 text-orange-600",
    href: "/hr/training/reports"
  },

  {
    title: "Custom Reports",
    description: "Build custom reports with filters and exports",
    icon: TableCellsIcon,
    color: "bg-gray-50 text-gray-600",
    href: "/hr/reports/custom"
  }
]

export default function HRReports() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/hr/reports')
      return
    }

    // Check HR permissions
    if (session?.user) {
      const hasPermission = session.user?.permissions?.includes('hr.view') ||
                           session.user?.permissions?.includes('hr.full_access') ||
                           session.user?.roles?.includes('admin') ||
                           session.user?.roles?.includes('hr_manager')
      
      if (!hasPermission) {
        router.push('/')
        return
      }
    }

    setLoading(false)
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "Generate Employee List",
      description: "Export current employee roster",
      action: () => alert("Employee list export feature coming soon"),
      icon: ArrowDownTrayIcon,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Monthly Summary",
      description: "Generate monthly HR summary",
      action: () => alert("Monthly summary feature coming soon"),
      icon: DocumentTextIcon,
      color: "bg-green-600 hover:bg-green-700"
    }
  ]

  return (
    <ModulePage
      metadata={{
        title: "HR Reports",
        description: "Generate and view human resources reports and analytics",
        breadcrumbs: [
          { name: "HR", href: "/hr" },
          { name: "Reports", href: "/hr/reports" }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-lg text-left transition-colors`}
              >
                <div className="flex items-center">
                  <action.icon className="h-6 w-6 mr-3" />
                  <div>
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report, index) => (
              <Link
                key={index}
                href={report.href}
                className="group block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {report.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {report.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h2>
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent reports</p>
            <p className="text-sm">Generated reports will appear here</p>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
