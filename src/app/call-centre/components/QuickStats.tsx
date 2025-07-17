"use client"

import React from 'react'
import {
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

const QuickStats = () => {
  const stats = [
    {
      name: 'Total Calls Today',
      value: '127',
      change: '+12%',
      changeType: 'increase',
      icon: PhoneIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Active Cases',
      value: '45',
      change: '+8%',
      changeType: 'increase',
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Pending Follow-ups',
      value: '23',
      change: '-5%',
      changeType: 'decrease',
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Overdue Cases',
      value: '8',
      change: '-15%',
      changeType: 'decrease',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Valid Calls Rate',
      value: '87.5%',
      change: '+3.2%',
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      name: 'Officers Online',
      value: '12',
      change: 'All present',
      changeType: 'neutral',
      icon: UserGroupIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'increase' 
                      ? 'text-green-600' 
                      : stat.changeType === 'decrease' 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                    ) : stat.changeType === 'decrease' ? (
                      <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                    ) : null}
                    <span className="sr-only">
                      {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                    </span>
                    {stat.change}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default QuickStats
