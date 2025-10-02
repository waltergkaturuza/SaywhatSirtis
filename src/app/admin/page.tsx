"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { UserManagement } from "@/components/admin/user-management"
import Link from "next/link"
import {
  Cog6ToothIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ServerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  KeyIcon
} from "@heroicons/react/24/outline"

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalDocuments: number
  systemUptime: string
  storageUsed: string
  apiCalls: number
  errorRate: number
  responseTime: number
}

interface User {
  id: string
  firstName?: string
  lastName?: string
  email: string
  role: string
  department?: string
  lastLogin?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt?: string
  permissions?: string[]
}

interface AuditLog {
  id: string
  userId?: string
  userName?: string
  action: string
  resource: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  details: string
  severity?: string
}

interface SystemConfig {
  id?: string
  key: string
  value: string
  description?: string
  category?: string
  type: 'string' | 'number' | 'boolean' | 'json'
  validationRules?: any
  lastModified?: string
  modifiedBy?: string
}

export default function SystemAdminPage() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  // State for dashboard stats
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    systemUptime: "0%",
    storageUsed: "0 GB",
    apiCalls: 0,
    errorRate: 0,
    responseTime: 0
  })

  // Access control: admins and full_access only
  const adminAllowed = Boolean(
    session?.user?.permissions?.includes('admin.access') ||
    session?.user?.permissions?.includes('full_access') ||
    (session?.user?.roles || []).some(r => ['system_administrator','administrator','admin','superuser'].includes(r.toLowerCase()))
  )

  // Define before early return to avoid TDZ when effect schedules
  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const dashboardResponse = await fetch('/api/admin/dashboard')
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        if (dashboardData.data?.stats) {
          setSystemStats(dashboardData.data.stats)
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (adminAllowed) {
      fetchAdminData()
    }
  }, [adminAllowed])

  if (!adminAllowed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="lg:pl-72">
          <div className="px-6 py-6">
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-orange-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
              <p className="mt-1 text-sm text-gray-600">You do not have permission to access the Admin module.</p>
              <div className="mt-6">
                <Link href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-md bg-orange-500 text-white">Go to Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar for access denied state */}
        <AdminSidebar />
      </div>
    )
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with left margin for sidebar */}
      <div className="lg:pl-72">
        <div className="w-full">
          {/* Navigation & Header */}
          <div className="mb-8 px-6 pt-6">
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Home
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back
                </button>
              </div>
              
              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700 transition-colors">
                  Home
                </Link>
                <ChevronRightIcon className="h-4 w-4 mx-2" />
                <span className="font-medium text-orange-600">System Administration</span>
              </div>
            </div>
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
              <p className="text-gray-600">Comprehensive system management and monitoring</p>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="px-6">
            <AdminDashboard />
          </div>
        </div>
      </div>
      
      {/* Fixed Sidebar */}
      <AdminSidebar />
    </div>
  )
}

// Separate AdminSidebar component
function AdminSidebar() {
  const pathname = usePathname()
  
  const navItems = [
    { href: "/admin", name: "Admin Dashboard", icon: ChartBarIcon },
    { href: "/admin/users", name: "User Management", icon: UsersIcon },
    { href: "/admin/roles", name: "Role Management", icon: ShieldCheckIcon },
    { href: "/admin/settings", name: "System Settings", icon: Cog6ToothIcon },
    { href: "/admin/audit", name: "Audit Logs", icon: DocumentTextIcon },
    { href: "/admin/api-keys", name: "API Keys", icon: KeyIcon },
    { href: "/admin/database", name: "Database Management", icon: ServerIcon },
    { href: "/admin/server-status", name: "Server Status", icon: ServerIcon }
  ]

  return (
    <div className="fixed inset-y-0 left-0 z-50 lg:block lg:w-72">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SIRTIS</h1>
              <p className="text-xs text-gray-500">SAYWHAT</p>
            </div>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const IconComponent = item.icon
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex gap-x-3 rounded-r-lg p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-500 border-l-4 border-green-700 text-white shadow-sm'
                        : 'bg-green-100 border-l-4 border-green-300 text-gray-800 hover:bg-green-200 hover:border-green-400'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}