'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
    period: string
  }
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  loading?: boolean
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  variant = 'default',
  loading = false 
}: MetricCardProps) {
  const variantClasses = {
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50'
  }

  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.value > 0) {
      return trend.isPositive ? (
        <TrendingUp className="h-4 w-4 text-green-600" />
      ) : (
        <TrendingUp className="h-4 w-4 text-red-600" />
      )
    } else if (trend.value < 0) {
      return trend.isPositive ? (
        <TrendingDown className="h-4 w-4 text-red-600" />
      ) : (
        <TrendingDown className="h-4 w-4 text-green-600" />
      )
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600'
    
    if (trend.value > 0) {
      return trend.isPositive ? 'text-green-600' : 'text-red-600'
    } else if (trend.value < 0) {
      return trend.isPositive ? 'text-red-600' : 'text-green-600'
    } else {
      return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <Card className={variantClasses[variant]}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={variantClasses[variant]}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        
        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-xs text-gray-600">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs text-gray-500">{trend.period}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface AnalyticsHeaderProps {
  title: string
  description: string
  lastUpdated?: Date
  isLoading?: boolean
  onRefresh?: () => void
}

export function AnalyticsHeader({ 
  title, 
  description, 
  lastUpdated, 
  isLoading = false,
  onRefresh 
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>
      
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg 
            className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          {isLoading ? 'Updating...' : 'Refresh'}
        </button>
      )}
    </div>
  )
}

interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  onDismiss?: () => void
}

export function AlertBanner({ type, title, message, onDismiss }: AlertBannerProps) {
  const typeClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }

  const icons = {
    info: <AlertTriangle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    error: <AlertTriangle className="h-5 w-5" />,
    success: <TrendingUp className="h-5 w-5" />
  }

  return (
    <div className={`border rounded-lg p-4 mb-6 ${typeClasses[type]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-4 text-sm hover:opacity-75"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

interface DataTableProps {
  title: string
  headers: string[]
  data: Array<Record<string, any>>
  loading?: boolean
}

export function DataTable({ title, headers, data, loading = false }: DataTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4 mb-4">
                {headers.map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {headers.map((header, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row[header.toLowerCase().replace(' ', '_')] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
