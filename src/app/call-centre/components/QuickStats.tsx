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

interface QuickStatsData {
  totalCallsToday: number
  activeCases: number
  pendingFollowups: number
  overdueCases: number
  validCallsRate: number
  officersOnline: number
  trends: {
    callsChange: string
    casesChange: string
    followupsChange: string
    overdueChange: string
    validRateChange: string
    officersStatus: string
  }
}

interface StatItem {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
  bgColor: string
}

const QuickStats = () => {
  const [statsData, setStatsData] = useState<QuickStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQuickStats()
  }, [])

  const fetchQuickStats = async () => {
    try {
      const response = await fetch('/api/call-centre/quick-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch quick stats')
      }
      const data = await response.json()
      setStatsData(data)
    } catch (error) {
      console.error('Error fetching quick stats:', error)
      setError('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-lg h-12 w-12"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  if (!statsData) return null

  const getChangeType = (change: string): 'increase' | 'decrease' | 'neutral' => {
    if (change.startsWith('+')) return 'increase'
    if (change.startsWith('-')) return 'decrease'
    return 'neutral'
  }

  const stats: StatItem[] = [
    {
      name: 'Total Calls Today',
      value: statsData.totalCallsToday.toString(),
      change: statsData.trends.callsChange,
      changeType: getChangeType(statsData.trends.callsChange),
      icon: PhoneIcon,
      color: 'text-saywhat-orange',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'Active Cases',
      value: statsData.activeCases.toString(),
      change: statsData.trends.casesChange,
      changeType: getChangeType(statsData.trends.casesChange),
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Pending Follow-ups',
      value: statsData.pendingFollowups.toString(),
      change: statsData.trends.followupsChange,
      changeType: getChangeType(statsData.trends.followupsChange),
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Overdue Cases',
      value: statsData.overdueCases.toString(),
      change: statsData.trends.overdueChange,
      changeType: getChangeType(statsData.trends.overdueChange),
      icon: ExclamationTriangleIcon,
      color: 'text-saywhat-red',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Valid Calls Rate',
      value: `${statsData.validCallsRate}%`,
      change: statsData.trends.validRateChange,
      changeType: getChangeType(statsData.trends.validRateChange),
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      name: 'Officers Online',
      value: statsData.officersOnline.toString(),
      change: statsData.trends.officersStatus,
      changeType: 'neutral',
      icon: UserGroupIcon,
      color: 'text-saywhat-grey',
      bgColor: 'bg-gray-100'
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
                  <div className="text-2xl font-semibold text-saywhat-dark">
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
