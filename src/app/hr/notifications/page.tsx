"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  BellIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline"

export default function NotificationRoutingPage() {
  const { data: session } = useSession()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [routingRules, setRoutingRules] = useState<any[]>([])
  const [supervisorMapping, setSupervisorMapping] = useState<any>({})
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    escalated: 0,
    successRate: 0
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    autoForward: true,
    supervisorEscalation: true,
    reminderFrequency: "daily"
  })

  // Fetch notifications data
  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
      fetchRoutingRules()
      fetchSupervisorMapping()
    }
  }, [session, selectedCategory])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/hr/notifications?category=${selectedCategory}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data.notifications)
        setStatistics(data.data.statistics)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutingRules = async () => {
    try {
      const response = await fetch('/api/hr/notifications/routing')
      if (response.ok) {
        const data = await response.json()
        setRoutingRules(data.data)
      }
    } catch (error) {
      console.error('Error fetching routing rules:', error)
    }
  }

  const fetchSupervisorMapping = async () => {
    try {
      const response = await fetch('/api/hr/notifications/supervisors')
      if (response.ok) {
        const data = await response.json()
        setSupervisorMapping(data.data)
      }
    } catch (error) {
      console.error('Error fetching supervisor mapping:', error)
    }
  }

  const metadata = {
    title: "Notification Routing",
    description: "Manage HR notifications and supervisor routing",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Notification Routing" }
    ]
  }

  const actions = (
    <>
      <Link href="/hr/notifications/settings">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
          Settings
        </button>
      </Link>
      <Link href="/hr/notifications/rules/new">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Rule
        </button>
      </Link>
    </>
  )

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')
  const canManageNotifications = isHRStaff || userPermissions.includes('hr.notifications')

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Categories</h3>
        <div className="space-y-2">
          {[
            { id: "all", name: "All Notifications", count: statistics.total },
            { id: "performance", name: "Performance Plans", count: notifications.filter(n => n.type === 'performance_plan').length },
            { id: "appraisals", name: "Appraisals", count: notifications.filter(n => n.type === 'appraisal').length },
            { id: "training", name: "Training", count: notifications.filter(n => n.type === 'training').length },
            { id: "deadlines", name: "Deadlines", count: notifications.filter(n => n.type === 'deadline').length },
            { id: "approvals", name: "Approvals", count: notifications.filter(n => n.type === 'approval').length },
            { id: "escalations", name: "Escalations", count: statistics.escalated }
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left p-2 rounded-md text-sm ${
                selectedCategory === category.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{category.name}</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {category.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notificationSettings.emailEnabled}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                emailEnabled: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notificationSettings.inAppEnabled}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                inAppEnabled: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">In-App Notifications</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notificationSettings.autoForward}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                autoForward: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-forward to Supervisors</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notificationSettings.supervisorEscalation}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                supervisorEscalation: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Supervisor Escalation</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-2">
          <div className="text-sm text-gray-700 p-2 bg-green-50 rounded">
            Performance plan approved
          </div>
          <div className="text-sm text-gray-700 p-2 bg-blue-50 rounded">
            Appraisal reminder sent
          </div>
          <div className="text-sm text-gray-700 p-2 bg-yellow-50 rounded">
            Deadline approaching
          </div>
        </div>
      </div>
    </div>
  )

  // Helper functions for styling
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/hr/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      if (response.ok) {
        // Refresh notifications
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n: any) => !n.isRead)
      
      for (const notification of unreadNotifications) {
        await fetch(`/api/hr/notifications/${notification.id}/read`, {
          method: 'POST'
        })
      }
      
      // Refresh notifications
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-green-100 text-green-800"
      case "acknowledged": return "bg-blue-100 text-blue-800"
      case "escalated": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600"
      case "normal": return "text-blue-600"
      case "low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-600"
    if (rate >= 85) return "text-blue-600"
    if (rate >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Notification Overview */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                  <div className="ml-4">
                    <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BellIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{statistics.total}</h3>
                  <p className="text-sm text-gray-500">Active Notifications</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{statistics.successRate}%</h3>
                  <p className="text-sm text-gray-500">Success Rate</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{statistics.pending}</h3>
                  <p className="text-sm text-gray-500">Pending Actions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{statistics.escalated}</h3>
                  <p className="text-sm text-gray-500">Escalations</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Routing Rules */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Routing Rules</h3>
            <Link href="/hr/notifications/rules/new">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Add New Rule
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {routingRules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BellIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No routing rules configured yet.</p>
                  <Link href="/hr/notifications/rules/new">
                    <button className="mt-2 text-blue-600 hover:text-blue-800">
                      Create your first routing rule
                    </button>
                  </Link>
                </div>
              ) : (
                routingRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {rule.type?.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {rule.isActive ? 'active' : 'inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      {rule.routes?.map((route: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded p-3">
                          <div className="font-medium text-gray-900 text-sm">
                            {route.recipient?.name || 'Unknown Recipient'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {route.recipient?.position || 'Position not specified'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Delay: {route.delay || 0} minutes
                          </div>
                        </div>
                      )) || (
                        <div className="col-span-3 text-center text-gray-500 py-4">
                          No routes configured for this rule
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <span>Priority: {rule.priority || 1}</span>
                      <div className="flex space-x-2">
                        <Link href={`/hr/notifications/rules/${rule.id}/edit`}>
                          <button className="text-blue-600 hover:text-blue-800">Edit</button>
                        </Link>
                        <Link href={`/hr/notifications/rules/${rule.id}/logs`}>
                          <button className="text-gray-600 hover:text-gray-800">View Logs</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            <div className="flex space-x-2">
              <button 
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-800 text-sm"
                disabled={loading}
              >
                Mark All Read
              </button>
              <Link href="/hr/notifications/all">
                <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-64 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BellIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No notifications found.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {notification.type === "performance_plan" && <DocumentTextIcon className="h-5 w-5 text-blue-600" />}
                        {notification.type === "appraisal" && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                        {notification.type === "training" && <UserGroupIcon className="h-5 w-5 text-purple-600" />}
                        {notification.type === "deadline" && <ClockIcon className="h-5 w-5 text-red-600" />}
                        {notification.type === "escalation" && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
                        {notification.type === "approval" && <CheckCircleIcon className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <div className="text-sm text-gray-600">
                          {notification.employee} • {notification.secretariat} • Supervisor: {notification.supervisor}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()} 
                          {notification.deadline && ` • Deadline: ${new Date(notification.deadline).toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      <button 
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Supervisor Mapping */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Supervisor Hierarchy Mapping</h3>
            <Link href="/hr/notifications/supervisors/edit">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Update Mapping
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(supervisorMapping).length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No supervisor mapping data available.</p>
                </div>
              ) : (
                Object.entries(supervisorMapping).map(([department, data]: [string, any], index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{department}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employees:</span>
                        <span className="text-gray-900">{data.statistics?.totalEmployees || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Supervisors:</span>
                        <span className="text-gray-900">{data.statistics?.totalSupervisors || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Span:</span>
                        <span className="text-gray-900">{data.statistics?.averageSpanOfControl || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Levels:</span>
                        <span className="text-gray-900">{data.statistics?.hierarchyLevels || 0}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link href={`/hr/notifications/supervisors/${encodeURIComponent(department)}`}>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View Hierarchy
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ModulePage>
  )
}
