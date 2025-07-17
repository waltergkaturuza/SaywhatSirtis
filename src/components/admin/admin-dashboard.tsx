"use client"

import { useState, useEffect } from "react"
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CpuChipIcon,
  CloudIcon
} from "@heroicons/react/24/outline"

interface AdminDashboardProps {
  className?: string
}

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
}

interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'warning'
  uptime: string
  lastCheck: string
}

export function AdminDashboard({ className = "" }: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 67,
    disk: 34,
    network: 23
  })

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Web Server", status: "online", uptime: "99.9%", lastCheck: "2 min ago" },
    { name: "Database", status: "online", uptime: "99.8%", lastCheck: "1 min ago" },
    { name: "Email Service", status: "online", uptime: "98.5%", lastCheck: "3 min ago" },
    { name: "File Storage", status: "warning", uptime: "95.2%", lastCheck: "5 min ago" },
    { name: "API Gateway", status: "online", uptime: "99.9%", lastCheck: "1 min ago" }
  ])

  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Simulate real-time updates only on client side
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.max(20, Math.min(80, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(20, Math.min(60, prev.disk + (Math.random() - 0.5) * 2)),
        network: Math.max(10, Math.min(50, prev.network + (Math.random() - 0.5) * 8))
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [mounted])

  const refreshData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // In production, fetch real data from API
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMetricColor = (value: number, type: string) => {
    if (type === 'cpu' || type === 'memory') {
      if (value > 80) return 'text-red-600 bg-red-100'
      if (value > 60) return 'text-yellow-600 bg-yellow-100'
      return 'text-green-600 bg-green-100'
    }
    return 'text-blue-600 bg-blue-100'
  }

  const getProgressColor = (value: number, type: string) => {
    if (type === 'cpu' || type === 'memory') {
      if (value > 80) return 'bg-red-500'
      if (value > 60) return 'bg-yellow-500'
      return 'bg-green-500'
    }
    return 'bg-blue-500'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Dashboard</h2>
          <p className="text-gray-600">Real-time system monitoring and metrics</p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
              <p className="text-xs text-green-600">↑ 12% from yesterday</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">API Requests</p>
              <p className="text-2xl font-bold text-gray-900">15.7K</p>
              <p className="text-xs text-blue-600">Last 24 hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
              <p className="text-xs text-green-600">✓ All systems operational</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">145ms</p>
              <p className="text-xs text-gray-600">Within target range</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Resources</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CpuChipIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">CPU Usage</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metrics.cpu, 'cpu')}`}
                    style={{ width: `${metrics.cpu}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getMetricColor(metrics.cpu, 'cpu')}`}>
                  {metrics.cpu.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CloudIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">Memory Usage</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metrics.memory, 'memory')}`}
                    style={{ width: `${metrics.memory}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getMetricColor(metrics.memory, 'memory')}`}>
                  {metrics.memory.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ServerIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">Disk Usage</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metrics.disk, 'disk')}`}
                    style={{ width: `${metrics.disk}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getMetricColor(metrics.disk, 'disk')}`}>
                  {metrics.disk.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">Network I/O</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metrics.network, 'network')}`}
                    style={{ width: `${metrics.network}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getMetricColor(metrics.network, 'network')}`}>
                  {metrics.network.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  {service.status === 'online' && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {service.status === 'warning' && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  )}
                  {service.status === 'offline' && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    service.status === 'online' ? 'bg-green-100 text-green-800' :
                    service.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {service.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{service.lastCheck}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent System Events</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">System Backup Completed</p>
              <p className="text-xs text-gray-500">Database backup completed successfully (2.4GB)</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">High Memory Usage Alert</p>
              <p className="text-xs text-gray-500">Memory usage exceeded 65% threshold</p>
              <p className="text-xs text-gray-400">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Security Scan Completed</p>
              <p className="text-xs text-gray-500">No vulnerabilities detected in system scan</p>
              <p className="text-xs text-gray-400">6 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Scheduled Maintenance</p>
              <p className="text-xs text-gray-500">System update v2.1.0 scheduled for July 20, 2025</p>
              <p className="text-xs text-gray-400">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
