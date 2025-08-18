"use client"

import React, { useState, useEffect } from 'react'
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

interface CallCentreStats {
  callsToday: number
  callsThisMonth: number
  callsThisYear: number
  activeCases: number
  pendingCases: number
  overdueCases: number
  resolvedCases: number
  totalCases: number
  resolutionRate: number
  avgSatisfactionRating: number
}

const QuickStats = () => {
  const [stats, setStats] = useState<CallCentreStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/call-centre/stats')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch call centre stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse h-32 rounded-lg"></div>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      name: 'Total Calls Today',
      value: stats.callsToday.toString(),
      change: '+12%', // Would need historical data to calculate real change
      changeType: 'increase' as const,
      icon: PhoneIcon,
      color: 'text-saywhat-orange',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'Active Cases',
      value: stats.activeCases.toString(),
      change: `${stats.totalCases} total`,
      changeType: 'neutral' as const,
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Pending Cases',
      value: stats.pendingCases.toString(),
      change: 'Open cases',
      changeType: 'neutral' as const,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Overdue Cases',
      value: stats.overdueCases.toString(),
      change: stats.overdueCases === 0 ? 'Great job!' : 'Requires action',
      changeType: stats.overdueCases === 0 ? 'decrease' as const : 'increase' as const,
      icon: ExclamationTriangleIcon,
      color: 'text-saywhat-red',
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow p-6 border-l-4 border-l-saywhat-orange">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-saywhat-grey truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-saywhat-dark">
                    {stat.value}
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'increase' 
                      ? 'text-green-600' 
                      : stat.changeType === 'decrease' 
                      ? 'text-red-600' 
                      : 'text-saywhat-grey'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                    ) : stat.changeType === 'decrease' ? (
                      <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                    ) : null}
                    <span className="sr-only">
                      {stat.changeType === 'increase' ? 'Increased' : stat.changeType === 'decrease' ? 'Decreased' : 'Status:'}
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
