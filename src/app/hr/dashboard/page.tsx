"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import SirtisCopilot from "@/components/ui/sirtis-copilot"
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
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ArrowLeftIcon,
  BuildingOffice2Icon,
  ChartPieIcon
} from "@heroicons/react/24/outline"

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  newEmployeesThisMonth: number
  departmentCount: number
  trainingCount: number
  activeTrainings: number
  averagePerformance: number
  newHires: number
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clickedIcons, setClickedIcons] = useState(new Set())
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)


  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/hr/dashboard')
      return
    }

    // Check HR permissions
    if (session?.user) {
      const hasPermission = session.user?.permissions?.includes('hr.view') ||
                           session.user?.permissions?.includes('hr.full_access') ||
                           session.user?.roles?.includes('admin') ||
                           session.user?.roles?.includes('hr_manager')
      
      if (!hasPermission) {
        setError('You do not have permission to access the HR dashboard')
        setLoading(false)
        return
      }
    }
  }, [session, status, router])

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
    // Don't fetch data if not authenticated or no permission
    if (status !== 'authenticated' || error) return

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
          console.error('Stats API error:', errorData)
          if (statsResponse.status === 401) {
            router.push('/auth/signin?callbackUrl=/hr/dashboard')
            return
          } else if (statsResponse.status === 403) {
            setError('You do not have permission to view HR statistics')
          } else {
            setError(errorData.error || 'Failed to fetch statistics')
          }
        }

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData)
        } else {
          const errorData = await activitiesResponse.json()
          console.error('Activities API error:', errorData)
          if (activitiesResponse.status === 401) {
            router.push('/auth/signin?callbackUrl=/hr/dashboard')
            return
          } else if (activitiesResponse.status === 403) {
            console.warn('No permission to view activities')
          } else {
            console.error('Failed to fetch activities:', errorData)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Unable to connect to server')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session, status, error, router])

  const handleIconClick = (moduleIndex: number) => {
    setClickedIcons(prev => new Set(prev).add(moduleIndex))
  }

  const hrModules = [
    {
      title: "Employee Directory",
      description: "Manage employee profiles, contacts, and basic information",
      icon: UserGroupIcon,
      href: "/hr/employees",
      color: "orange",
      stats: loading ? "Loading..." : `${stats?.totalEmployees || 0} employees`
    },
    {
      title: "Performance Management",
      description: "Track performance reviews, goals, and evaluations",
      icon: StarIcon,
      href: "/hr/performance",
      color: "green",
      stats: loading ? "Loading..." : `${stats?.pendingReviews || 0} reviews due`
    },
    {
      title: "Training & Development",
      description: "Manage training programs, certifications, and skill development",
      icon: AcademicCapIcon,
      href: "/hr/training",
      color: "green",
      stats: loading ? "Loading..." : `${stats?.activeTrainings || 0} active programs`
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
      color: "gray",
      stats: "Real-time insights"
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      orange: "bg-gradient-to-br from-orange-400 to-orange-500 border-orange-500 hover:border-orange-600 text-white shadow-lg hover:shadow-orange-200",
      green: "bg-gradient-to-br from-green-500 to-green-600 border-green-600 hover:border-green-700 text-white shadow-lg hover:shadow-green-200", 
      red: "bg-gradient-to-br from-red-500 to-red-600 border-red-600 hover:border-red-700 text-white shadow-lg hover:shadow-red-200",
      gray: "bg-gradient-to-br from-gray-600 to-gray-700 border-gray-700 hover:border-gray-800 text-white shadow-lg hover:shadow-gray-200",
      black: "bg-gradient-to-br from-gray-900 to-black border-black hover:border-gray-800 text-white shadow-lg hover:shadow-gray-400"
    }
    return colorMap[color as keyof typeof colorMap] || "bg-gradient-to-br from-gray-600 to-gray-700 border-gray-700 hover:border-gray-800 text-white shadow-lg"
  }

  const getIconColorClasses = (color: string) => {
    const iconColorMap = {
      orange: "text-orange-100",
      green: "text-green-100", 
      red: "text-red-100",
      gray: "text-gray-100",
      black: "text-white"
    }
    return iconColorMap[color as keyof typeof iconColorMap] || "text-gray-100"
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">



      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-4 lg:mx-8 xl:mx-16">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Home and Back Navigation Icons */}
              <div className="flex items-center space-x-2">
                <Link href="/">
                  <button className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-green-500 hover:to-green-600 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md">
                    <HomeIcon className="h-5 w-5 text-white" />
                  </button>
                </Link>
                <Link href="/hr">
                  <button className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-green-500 hover:to-green-600 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md">
                    <ArrowLeftIcon className="h-5 w-5 text-white" />
                  </button>
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SIRTIS</h1>
                  <p className="text-xs text-gray-500">HR Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/hr/reports">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  HR Reports
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-4 lg:mx-8 xl:mx-16 py-6">
        <div className="flex flex-col gap-6">
          {/* Main Dashboard Content */}
          <div className="w-full">
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-2">HR Management Dashboard</h1>
                <p className="text-orange-100 text-base">Comprehensive human resources management overview and navigation</p>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="bg-white border border-gray-200 rounded-md px-3 py-2">
                  <p className="text-lg font-semibold text-gray-900">{loading ? '—' : stats?.totalEmployees || '0'}</p>
                  <p className="text-xs text-gray-500">Total Employees</p>
                  <p className="text-xs text-gray-400">+{loading ? '0' : stats?.newEmployeesThisMonth || '0'} this month</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-md px-3 py-2">
                  <p className="text-lg font-semibold text-gray-900">{loading ? '—' : stats?.activeTrainings || '0'}</p>
                  <p className="text-xs text-gray-500">Training Sessions</p>
                  <p className="text-xs text-gray-400">Active this month</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-md px-3 py-2">
                  <p className="text-lg font-semibold text-gray-900">{loading ? '—' : stats?.averagePerformance || '0'}</p>
                  <p className="text-xs text-gray-500">Avg Performance</p>
                  <p className="text-xs text-gray-400">Out of 5.0</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-md px-3 py-2">
                  <p className="text-lg font-semibold text-gray-900">{loading ? '—' : stats?.activeEmployees || '0'}</p>
                  <p className="text-xs text-gray-500">Active Employees</p>
                  <p className="text-xs text-gray-400">+{loading ? '0' : stats?.newHires || '0'} new</p>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className={`grid grid-cols-1 gap-6 transition-all duration-300 ${
                sidebarOpen ? 'lg:grid-cols-4' : 'lg:grid-cols-1'
              }`}>
                {/* HR Modules */}
                <div className={`transition-all duration-300 ${
                  sidebarOpen ? 'lg:col-span-3' : 'lg:col-span-1'
                }`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">HR Management Modules</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  {hrModules.map((module, index) => (
                    <Link key={index} href={module.href}>
                      <div className="px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900">{module.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                        <p className="text-xs text-gray-700 mt-1">{module.stats}</p>
                      </div>
                    </Link>
                  ))}
                  </div>
                </div>
                
                {/* Sidebar */}
                {sidebarOpen && (
                  <div className="lg:col-span-1 transition-all duration-300 space-y-4">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <Link href="/hr/employees/add">
                          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-800 rounded-lg transition-all duration-200 group border border-orange-100 hover:border-orange-200">
                            <UserPlusIcon className="h-4 w-4 mr-3 text-orange-500 group-hover:text-orange-700" />
                            Add New Employee
                          </button>
                        </Link>
                        <Link href="/hr/departments/add">
                          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-800 rounded-lg transition-all duration-200 group border border-orange-100 hover:border-orange-200">
                            <BuildingOffice2Icon className="h-4 w-4 mr-3 text-orange-500 group-hover:text-orange-700" />
                            Add New Department
                          </button>
                        </Link>
                        <Link href="/hr/performance/plans">
                          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-800 rounded-lg transition-all duration-200 group border border-orange-100 hover:border-orange-200">
                            <ChartPieIcon className="h-4 w-4 mr-3 text-orange-500 group-hover:text-orange-700" />
                            Performance Plans
                          </button>
                        </Link>
                        <Link href="/hr/performance/appraisals">
                          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-800 rounded-lg transition-all duration-200 group border border-orange-100 hover:border-orange-200">
                            <StarIcon className="h-4 w-4 mr-3 text-orange-500 group-hover:text-orange-700" />
                            Appraisals
                          </button>
                        </Link>
                      </div>
                    </div>
                    
                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-20">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="space-y-3">
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
                        activities.slice(0, 6).map((activity) => {
                          const IconComponent = getIconComponent(activity.icon)
                          return (
                            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                              <div className="flex-shrink-0">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                  <IconComponent className={`h-4 w-4 ${getIconColor(activity.color)}`} />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                                <p className="text-xs text-gray-600">{activity.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{activity.timeAgo}</p>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-6">
                          <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Sidebar Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-20 right-4 z-50 p-3 bg-white border-2 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-xl ${
          sidebarOpen 
            ? 'border-orange-500 hover:border-orange-600' 
            : 'border-gray-300 hover:border-orange-400'
        }`}
        title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
      >
        <Bars3Icon className={`h-5 w-5 transition-colors duration-200 ${
          sidebarOpen ? 'text-orange-600' : 'text-gray-700'
        }`} />
      </button>

      {/* SIRTIS Copilot */}
      <SirtisCopilot />
    </div>
  )
}