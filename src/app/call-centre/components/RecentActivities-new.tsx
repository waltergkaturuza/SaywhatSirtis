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
  status: 'completed' | 'pending' | 'in-progress'
}

interface PendingTask {
  id: string
  title: string
  assignedTo: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  caseNumber: string
}

interface ActivitiesData {
  recentActivities: RecentActivity[]
  pendingTasks: PendingTask[]
}

const RecentActivities: React.FC = () => {
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
        throw new Error('Failed to fetch activities')
      }
      const data = await response.json()
      setActivitiesData(data)
    } catch (error) {
      console.error('Error fetching activities:', error)
      setError('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-saywhat-dark mb-6">Recent Activities</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-500">Loading activities...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-saywhat-dark mb-6">Recent Activities</h2>
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchActivitiesData}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-saywhat-dark mb-6">Recent Activities</h2>
      
      {activitiesData && activitiesData.recentActivities.length > 0 ? (
        <>
          <div className="space-y-4 mb-6">
            {activitiesData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{activity.officer}</span>
                    <span className="mx-2">•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activitiesData.pendingTasks.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Tasks</h3>
              <div className="space-y-3">
                {activitiesData.pendingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600">Case: {task.caseNumber}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <UserIcon className="h-4 w-4 mr-1" />
                        <span>{task.assignedTo}</span>
                        <span className="mx-2">•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="w-full bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
              View All Activities
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">No Recent Activities</h3>
          <p className="text-sm text-gray-500">Activities will appear here as they are completed.</p>
        </div>
      )}
    </div>
  )
}

export default RecentActivities
