"use client"

import React, { useState, useEffect } from 'react'
import {
  PhoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface RecentActivity {
  id: string
  type: 'call' | 'case'
  title: string
  description: string
  officer: string
  time: string
  status: 'completed' | 'pending' | 'transferred' | 'resolved' | 'scheduled' | 'new'
  priority: 'high' | 'medium' | 'low' | 'normal'
}

interface PendingTask {
  id: string
  task: string
  dueTime: string
  assignee: string
  priority: 'high' | 'medium' | 'low'
}

interface ActivitiesData {
  recentActivities: RecentActivity[]
  pendingTasks: PendingTask[]
}

const RecentActivities = () => {
  const [activitiesData, setActivitiesData] = useState<ActivitiesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchActivitiesData()
  }, [])

  const fetchActivitiesData = async () => {
    try {
      const response = await fetch('/api/call-centre/activities')
      if (!response.ok) {
        throw new Error('Failed to fetch activities data')
      }
      const data = await response.json()
      setActivitiesData(data)
    } catch (error) {
      console.error('Error fetching activities data:', error)
      setError('Failed to load activities data')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneIcon className="h-4 w-4 text-saywhat-orange" />
      case 'case':
        return <DocumentTextIcon className="h-4 w-4 text-saywhat-red" />
      default:
        return <UserIcon className="h-4 w-4 text-saywhat-grey" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'transferred':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'new':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'medium':
        return <ClockIcon className="h-4 w-4" />
      case 'low':
        return <CheckCircleIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {loading ? (
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
            <span className="ml-2 text-gray-600">Loading activities...</span>
          </div>
        </div>
      ) : error ? (
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-32 text-red-600">
            <span>{error}</span>
          </div>
        </div>
      ) : activitiesData ? (
        <>
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-saywhat-dark flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
                Recent Activities
              </h3>
              <button className="text-sm text-saywhat-orange hover:text-orange-600 flex items-center">
                View all
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activitiesData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-saywhat-dark">{activity.title}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">by {activity.officer}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              {activitiesData.recentActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-saywhat-dark flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
                Pending Tasks
              </h3>
              <button className="text-sm text-saywhat-orange hover:text-orange-600 flex items-center">
                Manage tasks
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {activitiesData.pendingTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={getPriorityColor(task.priority)}>
                          {getPriorityIcon(task.priority)}
                        </div>
                        <h4 className="text-sm font-medium text-saywhat-dark">{task.task}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Assigned to: {task.assignee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{task.dueTime}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} bg-opacity-10`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {activitiesData.pendingTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pending tasks</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full bg-saywhat-orange text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                Create New Task
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default RecentActivities