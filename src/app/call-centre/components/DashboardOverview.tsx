"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { ensureArray, safeFilter, safeMap } from '@/lib/array-utils'
import {
  CalendarIcon,
  MapPinIcon,
  LanguageIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface Task {
  id: string
  caseNumber: string
  title: string
  assignedOfficer: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  type: 'follow-up' | 'documentation' | 'referral' | 'assessment'
  notes?: string
  callId?: string
  clientName?: string
  phone?: string
}

interface CaseOption {
  id: string
  caseNumber: string
  clientName: string
  status: string
}

interface OfficerOption {
  id: string
  name: string
  email: string
  role: string
  department?: string
}

interface DashboardData {
  todaysMetrics: {
    callsReceived: number
    validCalls: number
    invalidCalls: number
    newCases: number
    averageCallDuration: string
    peakHour: string
  }
  summaryStats: {
    thisMonth: {
      totalCalls: number
      validCalls: number
      newCases: number
      resolvedCases: number
    }
    thisYear: {
      totalCalls: number
      validCalls: number
      newCases: number
      resolvedCases: number
    }
    sinceInception: {
      totalCalls: number
      validCalls: number
      newCases: number
      resolvedCases: number
    }
  }
  callsByPurpose: {
    purpose: string
    count: number
    color: string
  }[]
  activeCases: number
  overdueCases: number
  validCallRate: string
  officersOnline: number
}

const DashboardOverview = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<CaseOption[]>([])
  const [officers, setOfficers] = useState<OfficerOption[]>([])
  const [dropdownsLoading, setDropdownsLoading] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newOfficer: '',
    rescheduleNotes: ''
  })
  const [newTask, setNewTask] = useState({
    caseNumber: '',
    title: '',
    assignedOfficer: '',
    dueDate: '',
    priority: 'medium' as Task['priority'],
    type: 'follow-up' as Task['type']
  })
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)

  // Fetch dropdown data (cases and officers)
  const fetchDropdownData = useCallback(async () => {
    setDropdownsLoading(true)
    try {
      const [casesResponse, officersResponse] = await Promise.all([
        fetch('/api/call-centre/cases'),
        fetch('/api/call-centre/officers')
      ])

      if (casesResponse.ok) {
        const casesData = await casesResponse.json()
        if (casesData.success && Array.isArray(casesData.cases)) {
          setCases(ensureArray<any>(casesData.cases).map((caseItem: any) => ({
            id: caseItem.id,
            caseNumber: caseItem.caseNumber,
            clientName: caseItem.clientName,
            status: caseItem.status
          })))
        } else {
          console.error('Cases API response format issue:', casesData)
          setCases(ensureArray<CaseOption>([])) // Ensure cases is always an array
        }
      } else {
        console.error('Cases API request failed:', casesResponse.status, casesResponse.statusText)
        setCases([]) // Ensure cases is always an array
      }

      if (officersResponse.ok) {
        const officersData = await officersResponse.json()
        if (officersData.success && Array.isArray(officersData.officers)) {
          const mappedOfficers = ensureArray<any>(officersData.officers).map((officer: any) => ({
            id: officer.id,
            name: officer.name || officer.displayName,
            email: officer.email,
            role: officer.role,
            department: officer.department
          }))
          setOfficers(mappedOfficers)
        } else {
          console.error('Officers API response format issue:', officersData)
          setOfficers(ensureArray<OfficerOption>([])) // Ensure officers is always an array
        }
      } else {
        console.error('Officers API request failed:', officersResponse.status, officersResponse.statusText)
        setOfficers(ensureArray<OfficerOption>([])) // Ensure officers is always an array
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
      // Ensure arrays are set to empty arrays on error
      setCases(ensureArray<CaseOption>([]))
      setOfficers(ensureArray<OfficerOption>([]))
    } finally {
      setDropdownsLoading(false)
    }
  }, [])

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, tasksResponse] = await Promise.all([
          fetch('/api/call-centre/dashboard'),
          fetch('/api/call-centre/tasks')
        ])

        if (dashboardResponse.ok) {
          const dashboard = await dashboardResponse.json()
          setDashboardData(dashboard)
        }

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json()
          if (tasksData && Array.isArray(tasksData)) {
            setTasks(ensureArray<Task>(tasksData))
          } else if (tasksData.success && tasksData.data && Array.isArray(tasksData.data.tasks)) {
            setTasks(ensureArray<Task>(tasksData.data.tasks))
          } else if (tasksData.success && Array.isArray(tasksData.tasks)) {
            setTasks(ensureArray<Task>(tasksData.tasks))
          } else {
            console.error('Tasks API response format issue:', tasksData)
            setTasks(ensureArray<Task>([]))
          }
        } else {
          console.error('Tasks API request failed:', tasksResponse.status, tasksResponse.statusText)
          setTasks(ensureArray<Task>([]))
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Ensure tasks array is set to empty array on error
        setTasks(ensureArray<Task>([]))
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    fetchDropdownData() // Also fetch dropdown data on component mount
  }, [fetchDropdownData])

  // Create new task via API
  const handleCreateTask = async () => {
    if (newTask.caseNumber && newTask.title && newTask.assignedOfficer) {
      try {
        const response = await fetch('/api/call-centre/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTask),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          // Add the created task to the tasks list
          const createdTask = {
            id: result.data.id,
            caseNumber: result.data.caseNumber,
            title: result.data.title,
            assignedOfficer: result.data.assignedOfficer,
            dueDate: result.data.dueDate,
            priority: result.data.priority,
            status: result.data.status || 'pending',
            type: result.data.type || 'general'
          }
          setTasks(prev => [createdTask, ...ensureArray<Task>(prev)])
          
          // Reset form
          setNewTask({
            caseNumber: '',
            title: '',
            assignedOfficer: '',
            dueDate: '',
            priority: 'medium',
            type: 'follow-up'
          })
          setShowNewTaskForm(false)
          
          // Show success message (optional)
          console.log('Task created successfully:', result.message)
        } else {
          console.error('Failed to create task:', result.error || result.message)
          alert(`Failed to create task: ${result.error || result.message}`)
        }
      } catch (error) {
        console.error('Error creating task:', error)
        alert('Error creating task. Please try again.')
      }
    } else {
      alert('Please fill in all required fields (Case Number, Title, and Assigned Officer)')
    }
  }

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => ensureArray<Task>(prev).map(task => 
      task.id === taskId ? { ...task, status } : task
    ))
  }

  // Handle follow-up task completion
  const handleCompleteFollowUp = async () => {
    if (!selectedTask) return

    try {
      const response = await fetch('/api/call-centre/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete_followup',
          callId: selectedTask.id,
          updates: {
            completionNotes,
            previousNotes: selectedTask.notes
          }
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Remove completed task from list
        setTasks(prev => ensureArray<Task>(prev).filter(task => task.id !== selectedTask.id))
        setShowCompleteModal(false)
        setCompletionNotes('')
        setSelectedTask(null)
        alert('Follow-up task completed successfully!')
      } else {
        alert(`Failed to complete task: ${result.error || result.message}`)
      }
    } catch (error) {
      console.error('Error completing follow-up:', error)
      alert('Error completing task. Please try again.')
    }
  }

  // Handle follow-up task rescheduling
  const handleRescheduleFollowUp = async () => {
    if (!selectedTask || !rescheduleData.newDate) {
      alert('Please select a new date')
      return
    }

    try {
      const response = await fetch('/api/call-centre/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reschedule_followup',
          callId: selectedTask.id,
          updates: {
            newDate: rescheduleData.newDate,
            newOfficer: rescheduleData.newOfficer || selectedTask.assignedOfficer,
            currentOfficer: selectedTask.assignedOfficer,
            rescheduleNotes: rescheduleData.rescheduleNotes,
            previousNotes: selectedTask.notes
          }
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Update task in list with new details
        setTasks(prev => ensureArray<Task>(prev).map(task => 
          task.id === selectedTask.id ? {
            ...task,
            dueDate: rescheduleData.newDate,
            assignedOfficer: rescheduleData.newOfficer || task.assignedOfficer
          } : task
        ))
        setShowRescheduleModal(false)
        setRescheduleData({ newDate: '', newOfficer: '', rescheduleNotes: '' })
        setSelectedTask(null)
        alert(result.message)
      } else {
        alert(`Failed to reschedule task: ${result.error || result.message}`)
      }
    } catch (error) {
      console.error('Error rescheduling follow-up:', error)
      alert('Error rescheduling task. Please try again.')
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-saywhat-red bg-red-50 border-red-200'
      case 'medium': return 'text-saywhat-orange bg-orange-50 border-orange-200'
      case 'low': return 'text-saywhat-grey bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'completed': return 'text-green-600 bg-green-50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-saywhat-orange" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
        <span className="ml-2 text-red-600">Failed to load dashboard data</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats - Now prominent at top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* This Month */}
        <div className="bg-gradient-to-r from-saywhat-orange to-orange-500 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-4">This Month</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Total Calls</span>
              <span className="text-2xl font-bold">{dashboardData.summaryStats.thisMonth.totalCalls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Valid Calls</span>
              <span className="text-lg font-semibold">{dashboardData.summaryStats.thisMonth.validCalls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">New Cases</span>
              <span className="text-lg font-semibold">{dashboardData.summaryStats.thisMonth.newCases.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* This Year */}
        <div className="bg-gradient-to-r from-saywhat-red to-red-500 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-4">This Year</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Total Calls</span>
              <span className="text-2xl font-bold">{dashboardData.summaryStats.thisYear.totalCalls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Valid Calls</span>
              <span className="text-lg font-semibold">{dashboardData.summaryStats.thisYear.validCalls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">New Cases</span>
              <span className="text-lg font-semibold">{dashboardData.summaryStats.thisYear.newCases.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Since Inception */}
        <div className="bg-gradient-to-r from-saywhat-dark to-gray-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-4">Since Inception</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Total Calls</span>
              <span className="text-2xl font-bold">{dashboardData.summaryStats.sinceInception.totalCalls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Valid Calls</span>
              <span className="text-lg font-semibold">{dashboardData.summaryStats.sinceInception.validCalls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Total Cases</span>
              <span className="text-lg font-semibold">{dashboardData.summaryStats.sinceInception.newCases.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Task & Pending Tasks Section */}
        <div className="bg-white rounded-lg shadow-lg border border-saywhat-light-grey">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-saywhat-dark">Tasks Management</h3>
            <button
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saywhat-orange"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Task
            </button>
          </div>

          {/* New Task Form */}
          {showNewTaskForm && (
            <div className="p-6 border-b border-gray-200 bg-saywhat-light-grey">
              <h4 className="text-md font-medium text-saywhat-dark mb-4">Create New Task</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    value={newTask.caseNumber}
                    onChange={(e) => setNewTask({...newTask, caseNumber: e.target.value})}
                    disabled={dropdownsLoading}
                  >
                    <option value="">Select a case...</option>
                    {safeMap(cases, (caseItem: any) => (
                      <option key={caseItem.id} value={caseItem.caseNumber}>
                        {caseItem.caseNumber} - {caseItem.clientName}
                      </option>
                    ))}
                  </select>
                  {dropdownsLoading && (
                    <p className="text-sm text-gray-500 mt-1">Loading cases...</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    value={newTask.assignedOfficer}
                    onChange={(e) => setNewTask({...newTask, assignedOfficer: e.target.value})}
                    disabled={dropdownsLoading}
                  >
                    <option value="">Select an officer...</option>
                    {safeMap(officers, (officer: any) => (
                      <option key={officer.id} value={officer.name}>
                        {officer.name} ({officer.role})
                      </option>
                    ))}
                  </select>
                  {dropdownsLoading && (
                    <p className="text-sm text-gray-500 mt-1">Loading officers...</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    placeholder="Describe the task"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewTaskForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 bg-saywhat-orange text-white rounded-md text-sm font-medium hover:bg-orange-600"
                >
                  Create Task
                </button>
              </div>
            </div>
          )}

          {/* Pending Tasks List */}
          <div className="p-6">
            <h4 className="text-md font-medium text-saywhat-dark mb-4">
              Pending Tasks ({safeFilter(tasks, (t: Task) => t.status === 'pending').length})
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {safeFilter(tasks, (task: Task) => task.status === 'pending').map((task) => (
                <div key={task.id} className={`p-4 rounded-lg border ${getPriorityColor(task.priority)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-600">Case: {task.caseNumber}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <h5 className="font-medium text-gray-900">{task.title}</h5>
                      <p className="text-sm text-gray-600">Assigned to: {task.assignedOfficer}</p>
                      <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      {task.type === 'follow-up' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedTask(task)
                              setShowCompleteModal(true)
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Complete Follow-up"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(task)
                              setRescheduleData({
                                newDate: task.dueDate,
                                newOfficer: task.assignedOfficer,
                                rescheduleNotes: ''
                              })
                              setShowRescheduleModal(true)
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Reschedule Follow-up"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in-progress')}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Start Task"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Complete Task"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {safeFilter(tasks, (task: Task) => task.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pending tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Overview */}
        <div className="bg-white rounded-lg shadow-lg border border-saywhat-light-grey">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-saywhat-dark">Today's Overview</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Calls Received</span>
                <span className="text-2xl font-semibold text-saywhat-orange">{dashboardData.todaysMetrics.callsReceived}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valid Calls</span>
                <span className="text-lg font-medium text-green-600">{dashboardData.todaysMetrics.validCalls}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Invalid Calls</span>
                <span className="text-lg font-medium text-saywhat-red">{dashboardData.todaysMetrics.invalidCalls}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Cases Created</span>
                <span className="text-lg font-medium text-purple-600">{dashboardData.todaysMetrics.newCases}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Duration</span>
                <span className="text-lg font-medium text-saywhat-dark">{dashboardData.todaysMetrics.averageCallDuration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Peak Hour</span>
                <span className="text-lg font-medium text-saywhat-orange">{dashboardData.todaysMetrics.peakHour}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Purposes */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Call Purposes - Today</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeMap(dashboardData?.callsByPurpose, (item: any) => (
            <div key={item.purpose} className="flex items-center p-3 border border-gray-200 rounded-lg">
              <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.purpose}</p>
                <p className="text-sm text-gray-500">{item.count} calls</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Follow-up Modal */}
      {showCompleteModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Follow-up Task</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Case:</strong> {selectedTask.caseNumber}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Task:</strong> {selectedTask.title}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Assigned to:</strong> {selectedTask.assignedOfficer}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Notes (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes about the follow-up completion..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCompleteModal(false)
                    setCompletionNotes('')
                    setSelectedTask(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteFollowUp}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Complete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Follow-up Modal */}
      {showRescheduleModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reschedule Follow-up Task</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Case:</strong> {selectedTask.caseNumber}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Task:</strong> {selectedTask.title}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Current Officer:</strong> {selectedTask.assignedOfficer}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Due Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    value={rescheduleData.newDate}
                    onChange={(e) => setRescheduleData({...rescheduleData, newDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reassign to Officer (Optional)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    value={rescheduleData.newOfficer}
                    onChange={(e) => setRescheduleData({...rescheduleData, newOfficer: e.target.value})}
                    disabled={dropdownsLoading}
                  >
                    <option value="">Keep current officer</option>
                    {safeMap(officers, (officer: any) => (
                      <option key={officer.id} value={officer.name}>
                        {officer.name} ({officer.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reschedule Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    rows={3}
                    value={rescheduleData.rescheduleNotes}
                    onChange={(e) => setRescheduleData({...rescheduleData, rescheduleNotes: e.target.value})}
                    placeholder="Reason for rescheduling..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRescheduleModal(false)
                    setRescheduleData({ newDate: '', newOfficer: '', rescheduleNotes: '' })
                    setSelectedTask(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleFollowUp}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Reschedule Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardOverview
