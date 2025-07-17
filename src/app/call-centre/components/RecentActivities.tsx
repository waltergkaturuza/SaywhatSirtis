"use client"

import React from 'react'
import {
  PhoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const RecentActivities = () => {
  const recentActivities = [
    {
      id: '1',
      type: 'call',
      title: 'New call received',
      description: 'Youth employment inquiry from Harare',
      officer: 'Mary Chikuni',
      time: '2 minutes ago',
      status: 'completed',
      priority: 'normal'
    },
    {
      id: '2',
      type: 'case',
      title: 'Case escalated',
      description: 'Scholarship application follow-up required',
      officer: 'David Nyathi',
      time: '15 minutes ago',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '3',
      type: 'call',
      title: 'Call transferred',
      description: 'Skills development inquiry transferred to programs team',
      officer: 'Alice Mandaza',
      time: '23 minutes ago',
      status: 'transferred',
      priority: 'normal'
    },
    {
      id: '4',
      type: 'case',
      title: 'Case resolved',
      description: 'Bursary application status inquiry resolved',
      officer: 'Peter Masvingo',
      time: '45 minutes ago',
      status: 'resolved',
      priority: 'low'
    },
    {
      id: '5',
      type: 'call',
      title: 'Callback scheduled',
      description: 'Follow-up call scheduled for internship placement',
      officer: 'Mary Chikuni',
      time: '1 hour ago',
      status: 'scheduled',
      priority: 'normal'
    },
    {
      id: '6',
      type: 'case',
      title: 'New case created',
      description: 'Technical training inquiry requires assessment',
      officer: 'David Nyathi',
      time: '1 hour ago',
      status: 'new',
      priority: 'normal'
    }
  ]

  const pendingTasks = [
    {
      id: '1',
      task: 'Follow up on scholarship applications',
      dueTime: 'Due in 2 hours',
      assignee: 'Mary Chikuni',
      priority: 'high'
    },
    {
      id: '2',
      task: 'Review escalated cases',
      dueTime: 'Due in 4 hours',
      assignee: 'David Nyathi',
      priority: 'high'
    },
    {
      id: '3',
      task: 'Prepare weekly report',
      dueTime: 'Due tomorrow',
      assignee: 'Alice Mandaza',
      priority: 'medium'
    },
    {
      id: '4',
      task: 'Update case database',
      dueTime: 'Due in 2 days',
      assignee: 'Peter Masvingo',
      priority: 'low'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneIcon className="h-5 w-5 text-blue-500" />
      case 'case':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" />
      default:
        return <UserIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'resolved':
        return 'text-green-600 bg-green-100'
      case 'pending':
      case 'new':
        return 'text-yellow-600 bg-yellow-100'
      case 'transferred':
      case 'scheduled':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
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
      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
            Recent Activities
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            View all
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
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
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-500" />
            Pending Tasks
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            Manage tasks
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className={getPriorityColor(task.priority)}>
                      {getPriorityIcon(task.priority)}
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">{task.task}</h4>
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
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Create New Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecentActivities
