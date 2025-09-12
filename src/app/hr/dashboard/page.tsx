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
  ArrowLeftIcon
} from "@heroicons/react/24/outline"

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  newEmployeesThisMonth: number
  departmentCount: number
  subunitCount: number
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Debug sidebar state
  useEffect(() => {
    console.log('Sidebar state changed:', sidebarOpen)
  }, [sidebarOpen])

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
      stats: loading ? "Loading..." : `${stats?.departmentCount || 0} depts • ${stats?.subunitCount || 0} subunits`
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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-4 lg:mx-8 xl:mx-16">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
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
            <div className="flex items-center space-x-3 ml-auto">
              {/* Back Button */}
              <Link href="/hr">
                <button className="inline-flex items-center px-3 py-2 border border-orange-300 rounded-lg shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </button>
              </Link>
              
              {/* Home Button */}
              <Link href="/dashboard">
                <button className="inline-flex items-center px-3 py-2 border border-orange-300 rounded-lg shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Home
                </button>
              </Link>
              
              {/* HR Reports Button */}
              <Link href="/hr/reports">
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm text-sm font-medium text-white hover:from-orange-600 hover:to-orange-700 transition-colors">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  HR Reports
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-4 lg:mx-8 xl:mx-16 py-4 relative">
        <div className={`flex flex-col ${sidebarOpen ? 'lg:flex-row' : ''} gap-8`}>
          {/* Main Dashboard Content */}
          <div className={`flex-1 ${sidebarOpen ? '' : 'w-full'}`}>
            <div className="space-y-4">
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-2">HR Management Dashboard</h1>
                <p className="text-orange-100 text-sm">Comprehensive human resources management overview and navigation</p>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg border border-orange-600 p-4 hover:shadow-lg transition-all text-white">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-xl font-bold text-white">
                        {loading ? (
                          <div className="w-8 h-5 bg-white/20 animate-pulse rounded"></div>
                        ) : (
                          stats?.totalEmployees || '0'
                        )}
                      </h3>
                      <p className="text-xs text-orange-100 font-medium">Total Employees</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <ArrowTrendingUpIcon className="w-3 h-3 text-green-300 mr-1" />
                    <span className="text-green-200 font-semibold">
                      +{loading ? '0' : stats?.newEmployeesThisMonth || '0'}
                    </span>
                    <span className="text-orange-100 ml-1">this month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg border border-green-600 p-4 hover:shadow-lg transition-all text-white">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <AcademicCapIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-xl font-bold text-white">
                        {loading ? (
                          <div className="w-8 h-5 bg-white/20 animate-pulse rounded"></div>
                        ) : (
                          stats?.activeTrainings || '0'
                        )}
                      </h3>
                      <p className="text-xs text-green-100 font-medium">Training Sessions</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <div className="w-2 h-2 bg-green-200 rounded-full mr-2"></div>
                    <span className="text-green-200 font-semibold">Active</span>
                    <span className="text-green-100 ml-1">this month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg border border-green-600 p-4 hover:shadow-lg transition-all text-white">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <StarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-xl font-bold text-white">
                        {loading ? (
                          <div className="w-8 h-5 bg-white/20 animate-pulse rounded"></div>
                        ) : (
                          stats?.averagePerformance || '4.7'
                        )}
                      </h3>
                      <p className="text-xs text-green-100 font-medium">Avg Performance</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className="text-green-100">Out of 5.0 - </span>
                    <span className="text-green-200 font-semibold ml-1">Excellent</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg border border-green-600 p-4 hover:shadow-lg transition-all text-white">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <UsersIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-xl font-bold text-white">
                        {loading ? (
                          <div className="w-8 h-5 bg-white/20 animate-pulse rounded"></div>
                        ) : (
                          stats?.activeEmployees || '0'
                        )}
                      </h3>
                      <p className="text-xs text-green-100 font-medium">Active Employees</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <ArrowTrendingUpIcon className="w-3 h-3 text-green-200 mr-1" />
                    <span className="text-green-200 font-semibold">
                      +{loading ? '0' : stats?.newHires || '0'} new
                    </span>
                  </div>
                </div>
              </div>

              {/* HR Modules Grid */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">HR Management Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {hrModules.map((module, index) => (
                    <Link key={index} href={module.href}>
                      <div 
                        className={`p-4 rounded-lg border hover:shadow-lg transition-all duration-300 cursor-pointer ${getColorClasses(module.color)}`}
                        onClick={() => handleIconClick(index)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <module.icon 
                              className={`h-6 w-6 transition-colors duration-200 ${getIconColorClasses(module.color)}`} 
                            />
                          </div>
                          <ChevronRightIcon className="h-4 w-4 opacity-50" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-sm">{module.title}</h3>
                        <p className="text-xs text-gray-700 mb-3 leading-relaxed">{module.description}</p>
                        <div className="text-xs font-semibold text-gray-600 bg-white bg-opacity-50 px-2 py-1 rounded">
                          {module.stats}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent HR Activity</h3>
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
                        <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <IconComponent className={`h-5 w-5 ${getIconColor(activity.color)}`} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.description} - {activity.timeAgo}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">No recent activity to display</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {sidebarOpen && (
            <div className="fixed lg:relative top-16 lg:top-0 left-0 lg:right-auto h-[calc(100vh-4rem)] lg:h-auto w-80 lg:w-80 bg-gray-50 lg:bg-transparent z-30 lg:z-auto overflow-y-auto lg:overflow-visible transform translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none border-l border-gray-200 lg:border-l-0">
              {/* Mobile Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors lg:hidden z-40"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div className="space-y-6 p-4 lg:p-0 pt-16 lg:pt-0">
              <div className="bg-gradient-to-r from-gray-800 to-black rounded-xl border-2 border-gray-700 p-6 shadow-xl text-white">
                <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                {error ? (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                      <div className="text-sm text-red-800">{error}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-orange-600 rounded-lg shadow-lg">
                      <span className="text-sm font-medium text-orange-100">Total Employees</span>
                      <span className="font-bold text-white">
                        {loading ? (
                          <div className="w-8 h-4 bg-white/20 animate-pulse rounded"></div>
                        ) : (
                          stats?.totalEmployees || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-600 rounded-lg shadow-lg">
                      <span className="text-sm font-medium text-green-100">Active</span>
                      <span className="font-bold text-white">
                        {loading ? (
                          <div className="w-8 h-4 bg-white/20 animate-pulse rounded"></div>
                        ) : (
                          stats?.activeEmployees || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-600 rounded-lg shadow-lg">
                      <span className="text-sm font-medium text-red-100">New Hires (Month)</span>
                      <span className="font-bold text-white">
                        {loading ? (
                          <div className="w-8 h-4 bg-white/20 animate-pulse rounded"></div>
                        ) : (
                          stats?.newEmployeesThisMonth || 0
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl border-2 border-red-600 p-6 shadow-xl text-white">
                <h3 className="text-lg font-bold text-white mb-4">Pending Actions</h3>
                {error ? (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm text-red-800">Unable to load pending actions</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg">
                      <div className="text-sm font-bold text-white">
                        {loading ? '...' : `${stats?.pendingReviews || 0} Reviews Due`}
                      </div>
                      <div className="text-xs text-red-100 mt-1">Performance reviews pending</div>
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg">
                      <div className="text-sm font-bold text-white">
                        {loading ? '...' : `${stats?.onboardingCount || 0} Onboarding`}
                      </div>
                      <div className="text-xs text-red-100 mt-1">New employee setup</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl border-2 border-orange-600 p-6 shadow-xl text-white">
                <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/hr/employees" className="flex items-center p-3 text-sm font-medium text-white hover:bg-white/20 hover:text-orange-100 rounded-lg transition-colors">
                    <UserGroupIcon className="h-4 w-4 mr-3" />
                    Employee Directory
                  </Link>
                  <Link href="/hr/performance" className="flex items-center p-3 text-sm font-medium text-white hover:bg-white/20 hover:text-orange-100 rounded-lg transition-colors">
                    <StarIcon className="h-4 w-4 mr-3" />
                    Performance Reviews
                  </Link>
                  <Link href="/hr/training" className="flex items-center p-3 text-sm font-medium text-white hover:bg-white/20 hover:text-orange-100 rounded-lg transition-colors">
                    <AcademicCapIcon className="h-4 w-4 mr-3" />
                    Training Programs
                  </Link>
                  <Link href="/hr/reports" className="flex items-center p-3 text-sm font-medium text-white hover:bg-white/20 hover:text-orange-100 rounded-lg transition-colors">
                    <DocumentTextIcon className="h-4 w-4 mr-3" />
                    HR Reports
                  </Link>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-20 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          sidebarOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
        }`}
        title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        {sidebarOpen ? (
          <XMarkIcon className="h-6 w-6 text-white" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-white" />
        )}
      </button>

      {/* SIRTIS Copilot */}
      <SirtisCopilot />
    </div>
  )
}
