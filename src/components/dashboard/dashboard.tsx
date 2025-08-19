"use client"

import { useSession } from "next-auth/react"
import {
  ChartBarIcon,
  PhoneIcon,
  UsersIcon,
  DocumentIcon,
  BuildingOfficeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline"

// Mock data - in real implementation, this would come from APIs
const mockStats = {
  totalProjects: 24,
  activeProjects: 18,
  onTrackProjects: 15,
  totalCalls: 1247,
  totalCases: 89,
  pendingCases: 12,
  totalMembers: 145,
  newMembersThisMonth: 8,
}

const mockRecentProjects = [
  { id: 1, name: "Youth Health Initiative", status: "On Track", progress: 75, country: "Zimbabwe" },
  { id: 2, name: "Community Outreach Program", status: "Behind", progress: 45, country: "Zambia" },
  { id: 3, name: "Digital Health Platform", status: "On Track", progress: 90, country: "Botswana" },
]

const mockRecentCalls = [
  { id: 1, type: "HIV Information", time: "10:30 AM", status: "Resolved" },
  { id: 2, type: "Mental Health Support", time: "11:15 AM", status: "In Progress" },
  { id: 3, type: "Legal Assistance", time: "2:45 PM", status: "Pending" },
]

export default function Dashboard() {
  const { data: session } = useSession()

  const statCards = [
    {
      name: "Total Projects",
      value: mockStats.totalProjects,
      subValue: `${mockStats.onTrackProjects} on track`,
      icon: DocumentIcon,
      color: "text-blue-600 bg-blue-100",
    },
    {
      name: "Total Calls",
      value: mockStats.totalCalls,
      subValue: `${mockStats.totalCases} cases`,
      icon: PhoneIcon,
      color: "text-green-600 bg-green-100",
    },
    {
      name: "Active Members",
      value: mockStats.totalMembers,
      subValue: `+${mockStats.newMembersThisMonth} this month`,
      icon: UsersIcon,
      color: "text-purple-600 bg-purple-100",
    },
    {
      name: "Pending Cases",
      value: mockStats.pendingCases,
      subValue: "Require attention",
      icon: BuildingOfficeIcon,
      color: "text-orange-600 bg-orange-100",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm">
        <div className="px-6 py-8 sm:px-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome to SIRTIS
          </h1>
          <p className="mt-2 text-indigo-100">
            Real-time overview of SAYWHAT's operational activities and performance metrics
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`inline-flex rounded-md p-3 ${card.color}`}>
                  <card.icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">{card.name}</dt>
                  <dd className="text-lg font-semibold text-gray-900">{card.value}</dd>
                  <dd className="text-sm text-gray-500">{card.subValue}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Projects
            </h3>
            <div className="space-y-4">
              {mockRecentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.country}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === "On Track"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {project.status}
                    </span>
                    <span className="text-sm text-gray-500">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Call Centre Activity */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Call Centre Activity
            </h3>
            <div className="space-y-4">
              {mockRecentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{call.type}</p>
                    <p className="text-sm text-gray-500">{call.time}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      call.status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : call.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {call.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg hover:bg-gray-100">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                  <DocumentIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  Add New Project
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a new project with indicators and assignments
                </p>
              </div>
            </button>

            <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg hover:bg-gray-100">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <PhoneIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  Log New Call
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Record a new call or case in the system
                </p>
              </div>
            </button>

            <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg hover:bg-gray-100">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <UsersIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  Performance Review
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Submit or update performance appraisals
                </p>
              </div>
            </button>

            <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg hover:bg-gray-100">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                  <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  View Reports
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Access analytics and performance reports
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
