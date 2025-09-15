"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
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
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    autoForward: true,
    supervisorEscalation: true,
    reminderFrequency: "daily"
  })

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
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
        Settings
      </button>
      <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
        <PlusIcon className="h-4 w-4 mr-2" />
        New Rule
      </button>
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
            { id: "all", name: "All Notifications", count: 156 },
            { id: "performance", name: "Performance Plans", count: 45 },
            { id: "appraisals", name: "Appraisals", count: 32 },
            { id: "training", name: "Training", count: 28 },
            { id: "deadlines", name: "Deadlines", count: 18 },
            { id: "approvals", name: "Approvals", count: 23 },
            { id: "escalations", name: "Escalations", count: 10 }
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

  const routingRules = [
    {
      id: 1,
      name: "Performance Plan Submission",
      description: "Route new performance plans to direct supervisors for review",
      trigger: "performance_plan_created",
      routes: [
        { recipient: "Direct Supervisor", action: "Review & Approve", deadline: "3 days" },
        { recipient: "HR Department", action: "Monitor Progress", deadline: "7 days" },
        { recipient: "Department Head", action: "Final Approval", deadline: "5 days" }
      ],
      status: "active",
      lastTriggered: "2024-01-15 14:30",
      successRate: 94
    },
    {
      id: 2,
      name: "Appraisal Review Process",
      description: "Route completed appraisals through review hierarchy",
      trigger: "appraisal_completed",
      routes: [
        { recipient: "Direct Supervisor", action: "Initial Review", deadline: "2 days" },
        { recipient: "Secondary Reviewer", action: "Cross-validation", deadline: "2 days" },
        { recipient: "HR Department", action: "Final Processing", deadline: "3 days" }
      ],
      status: "active",
      lastTriggered: "2024-01-15 11:20",
      successRate: 89
    },
    {
      id: 3,
      name: "Training Completion Alerts",
      description: "Notify supervisors of training completions and requirements",
      trigger: "training_completed",
      routes: [
        { recipient: "Direct Supervisor", action: "Acknowledge", deadline: "1 day" },
        { recipient: "Training Coordinator", action: "Update Records", deadline: "1 day" },
        { recipient: "HR Department", action: "Compliance Tracking", deadline: "2 days" }
      ],
      status: "active",
      lastTriggered: "2024-01-14 16:45",
      successRate: 97
    },
    {
      id: 4,
      name: "Deadline Escalation",
      description: "Escalate overdue items to higher management levels",
      trigger: "deadline_overdue",
      routes: [
        { recipient: "Direct Supervisor", action: "Immediate Review", deadline: "immediate" },
        { recipient: "Department Head", action: "Escalation Review", deadline: "4 hours" },
        { recipient: "HR Director", action: "Final Escalation", deadline: "1 day" }
      ],
      status: "active",
      lastTriggered: "2024-01-15 09:15",
      successRate: 76
    },
    {
      id: 5,
      name: "Employee Archive Notification",
      description: "Notify relevant parties when employees are archived",
      trigger: "employee_archived",
      routes: [
        { recipient: "Direct Supervisor", action: "Confirm Archive", deadline: "1 day" },
        { recipient: "HR Department", action: "Revoke Access", deadline: "immediate" },

      ],
      status: "active",
      lastTriggered: "2024-01-12 13:30",
      successRate: 100
    },





  ]

  const recentNotifications = [
    {
      id: 1,
      type: "performance_plan",
      title: "Performance Plan Review Required",
      employee: "John Doe",
      supervisor: "Sarah Johnson",
      secretariat: "Operations",
      timestamp: "2024-01-15 14:30",
      status: "pending",
      priority: "high",
      deadline: "2024-01-18 17:00"
    },
    {
      id: 2,
      type: "appraisal",
      title: "Quarterly Appraisal Completed",
      employee: "Jane Smith",
      supervisor: "Dr. Amina Hassan",
      secretariat: "Healthcare",
      timestamp: "2024-01-15 11:20",
      status: "completed",
      priority: "normal",
      deadline: "2024-01-17 17:00"
    },
    {
      id: 3,
      type: "training",
      title: "Training Completion Notification",
      employee: "Mike Wilson",
      supervisor: "Jennifer Smith",
      secretariat: "Finance",
      timestamp: "2024-01-14 16:45",
      status: "acknowledged",
      priority: "low",
      deadline: "2024-01-16 17:00"
    },
    {
      id: 4,
      type: "deadline",
      title: "Deadline Approaching: Q4 Reviews",
      employee: "Multiple",
      supervisor: "Mark Wilson",
      secretariat: "Programs",
      timestamp: "2024-01-15 09:15",
      status: "escalated",
      priority: "high",
      deadline: "2024-01-16 17:00"
    },

  ]

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">156</h3>
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
                <h3 className="text-lg font-semibold text-gray-900">89%</h3>
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
                <h3 className="text-lg font-semibold text-gray-900">23</h3>
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
                <h3 className="text-lg font-semibold text-gray-900">5</h3>
                <p className="text-sm text-gray-500">Escalations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Routing Rules */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Routing Rules</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Add New Rule
            </button>
          </div>

          <div className="space-y-4">
            {routingRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${getSuccessRateColor(rule.successRate)}`}>
                      {rule.successRate}% success
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {rule.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  {rule.routes.map((route, index) => (
                    <div key={index} className="bg-gray-50 rounded p-3">
                      <div className="font-medium text-gray-900 text-sm">{route.recipient}</div>
                      <div className="text-sm text-gray-600">{route.action}</div>
                      <div className="text-xs text-gray-500 mt-1">Due: {route.deadline}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                  <span>Last triggered: {rule.lastTriggered}</span>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button className="text-gray-600 hover:text-gray-800">View Logs</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm">Mark All Read</button>
              <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
            </div>
          </div>

          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {notification.type === "performance_plan" && <DocumentTextIcon className="h-5 w-5 text-blue-600" />}
                    {notification.type === "appraisal" && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                    {notification.type === "training" && <UserGroupIcon className="h-5 w-5 text-purple-600" />}
                    {notification.type === "deadline" && <ClockIcon className="h-5 w-5 text-red-600" />}

                    {notification.type === "emergency_leave" && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
                    {notification.type === "leave_extension" && <ArrowPathIcon className="h-5 w-5 text-orange-600" />}
                    {notification.type === "medical_leave" && <DocumentTextIcon className="h-5 w-5 text-green-600" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <div className="text-sm text-gray-600">
                      {notification.employee} • {notification.secretariat} Secretariat • Supervisor: {notification.supervisor}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {notification.timestamp} • Deadline: {notification.deadline}
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
                  <button className="text-blue-600 hover:text-blue-800">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supervisor Mapping */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Supervisor Hierarchy Mapping</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Update Mapping
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                secretariat: "Operations Secretariat",
                supervisor: "Sarah Johnson",
                reviewer: "Michael Brown",
                employees: 85,
                pendingApprovals: 5
              },
              {
                secretariat: "Healthcare Secretariat",
                supervisor: "Dr. Amina Hassan",
                reviewer: "Dr. Patrick O'Connor",
                employees: 72,
                pendingApprovals: 3
              },
              {
                secretariat: "Finance & Admin",
                supervisor: "Jennifer Smith",
                reviewer: "Robert Taylor",
                employees: 48,
                pendingApprovals: 7
              },
              {
                secretariat: "Programs & M&E",
                supervisor: "Mark Wilson",
                reviewer: "Lisa Anderson",
                employees: 56,
                pendingApprovals: 4
              },
              {
                secretariat: "Governance",
                supervisor: "Dr. Ahmed Musa",
                reviewer: "Catherine Davis",
                employees: 32,
                pendingApprovals: 2
              }
            ].map((dept, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{dept.secretariat}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supervisor:</span>
                    <span className="text-gray-900">{dept.supervisor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reviewer:</span>
                    <span className="text-gray-900">{dept.reviewer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employees:</span>
                    <span className="text-gray-900">{dept.employees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className={`font-medium ${dept.pendingApprovals > 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {dept.pendingApprovals}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
