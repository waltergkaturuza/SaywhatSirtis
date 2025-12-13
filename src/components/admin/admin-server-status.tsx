"use client"

import { useState, useEffect } from 'react'
import { 
  ServerIcon, 
  CpuChipIcon, 
  CircleStackIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface ServerStatus {
  server: any
  system: any
  database: any
  services: any[]
  logs: any[]
  alerts: any[]
  metrics: any
}

interface AdminServerStatusProps {
  className?: string
}

export function AdminServerStatus({ className = '' }: AdminServerStatusProps) {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchServerStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/server-status')
      
      if (!response.ok) {
        throw new Error('Failed to fetch server status')
      }
      
      const data = await response.json()
      setServerStatus(data.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch server status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServerStatus()
    const interval = setInterval(fetchServerStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchServerStatus()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'online':
      case 'connected':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
      case 'offline':
      case 'disconnected':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'online':
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'error':
      case 'offline':
      case 'disconnected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      default:
        return <CircleStackIcon className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ServerIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Server Status</h2>
            <p className="text-sm text-gray-600">Monitor system health and performance</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Server Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ServerIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${getStatusColor(serverStatus?.server?.status || 'unknown')}`}>
                {serverStatus?.server?.status || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-lg font-semibold text-gray-900">{serverStatus?.server?.uptime || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CpuChipIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Version</p>
              <p className="text-lg font-semibold text-gray-900">{serverStatus?.server?.version || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <GlobeAltIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Environment</p>
              <p className="text-lg font-semibold text-gray-900">{serverStatus?.server?.environment || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">CPU Usage</h4>
            <CpuChipIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">
                {serverStatus?.system?.cpu?.usage || 0}%
              </span>
              <span className="text-sm text-gray-500">
                {serverStatus?.system?.cpu?.cores || 0} cores
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${serverStatus?.system?.cpu?.usage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Memory Usage</h4>
            <CircleStackIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">
                {serverStatus?.system?.memory?.usage || 0}%
              </span>
              <span className="text-sm text-gray-500">
                {serverStatus?.system?.memory?.used || 0} / {serverStatus?.system?.memory?.total || 0} MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${serverStatus?.system?.memory?.usage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Disk Usage</h4>
            <CircleStackIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">
                {serverStatus?.system?.disk?.usage || 0}%
              </span>
              <span className="text-sm text-gray-500">
                {serverStatus?.system?.disk?.used || 0} / {serverStatus?.system?.disk?.total || 0} GB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${serverStatus?.system?.disk?.usage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Network</h4>
            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">
                {serverStatus?.system?.network?.inbound || 0} MB/s
              </span>
              <span className="text-sm text-gray-500">In</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">
                {serverStatus?.system?.network?.outbound || 0} MB/s
              </span>
              <span className="text-sm text-gray-500">Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serverStatus?.services && serverStatus.services.length > 0 ? (
            serverStatus.services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-500">
                    {service.port ? `Port: ${service.port}` : 'Background Service'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </p>
                <p className="text-xs text-gray-500">{service.uptime}</p>
              </div>
            </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-gray-500">
              <p>No services information available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Logs</h3>
        <div className="space-y-2">
          {serverStatus?.logs && serverStatus.logs.length > 0 ? (
            serverStatus.logs.slice(0, 5).map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                  log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {log.level}
                </span>
                <div>
                  <p className="text-sm text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-500">{log.service}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent logs available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
