"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  ClockIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"

export default function TimeTrackingPage() {
  const { data: session } = useSession()
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [currentProject, setCurrentProject] = useState("")
  const [currentTask, setCurrentTask] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTimer])

  const metadata = {
    title: "Time Tracking",
    description: "Track work hours, manage projects, and analyze productivity",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Time Tracking" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        Export
      </button>
      <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
        <PlusIcon className="h-4 w-4 mr-2" />
        New Project
      </button>
    </>
  )

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = (project: string, task: string) => {
    setActiveTimer(`${project}-${task}`)
    setCurrentProject(project)
    setCurrentTask(task)
    setElapsedTime(0)
  }

  const stopTimer = () => {
    setActiveTimer(null)
    setCurrentProject("")
    setCurrentTask("")
    setElapsedTime(0)
  }

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Timer</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {activeTimer ? (
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-blue-600 mb-2">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-sm text-gray-600 mb-1">{currentProject}</div>
              <div className="text-xs text-gray-500">{currentTask}</div>
              <button
                onClick={stopTimer}
                className="mt-3 w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                <StopIcon className="h-4 w-4 inline mr-2" />
                Stop Timer
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <ClockIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm">No active timer</div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Total Work Time</div>
            <div className="font-semibold text-blue-700">7h 32m</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Billable Hours</div>
            <div className="font-semibold text-green-700">6h 45m</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Projects Worked</div>
            <div className="font-semibold text-purple-700">4</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Break Time</div>
            <div className="font-semibold text-orange-700">47m</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
        <div className="space-y-2">
          {[
            { project: "SAYWHAT Programs", task: "Field Monitoring" },
            { project: "Healthcare Initiative", task: "Data Collection" },
            { project: "Admin Tasks", task: "Report Writing" },
            { project: "Training", task: "Capacity Building" }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => startTimer(item.project, item.task)}
              disabled={!!activeTimer}
              className="w-full text-left p-2 rounded-md text-sm border hover:bg-gray-50 disabled:opacity-50"
            >
              <div className="font-medium">{item.project}</div>
              <div className="text-gray-500 text-xs">{item.task}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const projects = [
    {
      id: 1,
      name: "SAYWHAT Programs",
      description: "Core program implementation and monitoring",
      totalTime: "142h 30m",
      thisWeek: "32h 15m",
      tasks: [
        { name: "Field Monitoring", time: "45h 20m", status: "active" },
        { name: "Data Collection", time: "38h 45m", status: "completed" },
        { name: "Report Writing", time: "28h 30m", status: "active" },
        { name: "Stakeholder Meetings", time: "29h 55m", status: "active" }
      ]
    },
    {
      id: 2,
      name: "Healthcare Initiative",
      description: "Healthcare service delivery and improvement",
      totalTime: "98h 45m",
      thisWeek: "24h 30m",
      tasks: [
        { name: "Clinic Operations", time: "35h 15m", status: "active" },
        { name: "Patient Data Management", time: "28h 20m", status: "active" },
        { name: "Training Sessions", time: "22h 30m", status: "completed" },
        { name: "Equipment Maintenance", time: "12h 40m", status: "active" }
      ]
    },
    {
      id: 3,
      name: "Administrative Tasks",
      description: "General administrative and operational tasks",
      totalTime: "76h 20m",
      thisWeek: "18h 45m",
      tasks: [
        { name: "HR Documentation", time: "25h 30m", status: "active" },
        { name: "Financial Reports", time: "20h 15m", status: "completed" },
        { name: "Policy Review", time: "18h 40m", status: "active" },
        { name: "Team Meetings", time: "11h 55m", status: "active" }
      ]
    }
  ]

  const timeEntries = [
    {
      id: 1,
      date: "2024-01-15",
      project: "SAYWHAT Programs",
      task: "Field Monitoring",
      startTime: "08:30",
      endTime: "12:15",
      duration: "3h 45m",
      description: "Conducted site visits to monitor program implementation",
      billable: true
    },
    {
      id: 2,
      date: "2024-01-15",
      project: "Healthcare Initiative",
      task: "Data Collection",
      startTime: "13:00",
      endTime: "16:30",
      duration: "3h 30m",
      description: "Collected patient data and updated health records",
      billable: true
    },
    {
      id: 3,
      date: "2024-01-15",
      project: "Administrative Tasks",
      task: "Team Meetings",
      startTime: "16:45",
      endTime: "17:30",
      duration: "45m",
      description: "Weekly team coordination meeting",
      billable: false
    },
    {
      id: 4,
      date: "2024-01-14",
      project: "SAYWHAT Programs",
      task: "Report Writing",
      startTime: "09:00",
      endTime: "12:00",
      duration: "3h",
      description: "Prepared quarterly progress report",
      billable: true
    }
  ]

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Time Tracking Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">42h 15m</h3>
                <p className="text-sm text-gray-500">This Week</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">38h 30m</h3>
                <p className="text-sm text-gray-500">Billable Hours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DocumentChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">12</h3>
                <p className="text-sm text-gray-500">Active Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">91%</h3>
                <p className="text-sm text-gray-500">Productivity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Time Breakdown */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Project Time Breakdown</h3>
            <div className="flex space-x-2">
              <select className="border rounded-md px-3 py-2 text-sm">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
                <option>Last Month</option>
              </select>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                View All Projects
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{project.thisWeek}</div>
                    <div className="text-sm text-gray-500">This week</div>
                    <div className="text-xs text-gray-400">Total: {project.totalTime}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {project.tasks.map((task, index) => (
                    <div key={index} className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">{task.name}</h5>
                        <button
                          onClick={() => startTimer(project.name, task.name)}
                          disabled={!!activeTimer}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">{task.time}</div>
                      <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                        task.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {task.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Time Entries */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Time Entries</h3>
            <div className="flex space-x-2">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                Add Entry
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project / Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.project}</div>
                      <div className="text-sm text-gray-500">{entry.task}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.startTime} - {entry.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.duration}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.billable 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {entry.billable ? "Billable" : "Non-billable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
