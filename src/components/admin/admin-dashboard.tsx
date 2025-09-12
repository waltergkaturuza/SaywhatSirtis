"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Activity, Users, Database, HardDrive } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalDepartments: number
  totalDocuments: number
  systemUptime: string
  storageUsed: string
  apiCalls: number
  errorRate: number
  responseTime: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkUsage: number
  databaseConnections: number
  activeTransactions: number
  queryResponseTime: number
}

interface ServiceStatus {
  database: {
    status: 'online' | 'offline' | 'degraded'
    uptime: string
    connections: number
    responseTime: number
  }
  authentication: {
    status: 'online' | 'offline' | 'degraded'
    uptime: string
    activeSession: number
  }
  storage: {
    status: 'online' | 'offline' | 'degraded'
    uptime: string
    totalSize: string
    usedSize: string
    usage: number
  }
  api: {
    status: 'online' | 'offline' | 'degraded'
    uptime: string
    requestCount: number
    errorRate: number
  }
}

interface SecurityEvent {
  id: string
  type: string
  user: string
  ipAddress: string
  timestamp: string
  details: string
}

interface Alert {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
}

interface DeploymentData {
  current: {
    platform: string
    environment: string
    region: string
    url: string
  }
  database: {
    provider: string
    connectionString: string
    sharedAccess: boolean
  }
  deployments: {
    vercel: {
      status: string
      requestCount?: number
      lastSeen?: number | null
      responseTime?: number | null
    }
    render: {
      status: string
      requestCount?: number
      lastSeen?: number | null
      responseTime?: number | null
    }
    total: {
      combinedRequests: number
      sharedDatabase: boolean
      dataConsistency: string
    }
  }
}

interface DashboardData {
  stats: DashboardStats
  serviceStatus: ServiceStatus
  securityEvents: SecurityEvent[]
  alerts: Alert[]
  deploymentData?: DeploymentData
  timestamp: string
}

interface AdminDashboardProps {
  className?: string
}

export function AdminDashboard({ className = "" }: AdminDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const result = await response.json()
      
      if (result.success) {
        setDashboardData(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      setError('Network error: Unable to fetch dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshStats = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/admin/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh_stats' })
      })
      const result = await response.json()
      
      if (result.success && dashboardData) {
        setDashboardData({
          ...dashboardData,
          stats: result.data.stats,
          timestamp: new Date().toISOString()
        })
      }
    } catch (err) {
      console.error('Failed to refresh stats:', err)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500' 
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default'
      case 'warning': return 'secondary'
      case 'error': return 'destructive'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">System Dashboard</h2>
          <div className="animate-pulse bg-gray-200 rounded h-10 w-32"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">System Dashboard</h2>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData) return null

  const { stats, serviceStatus, securityEvents, alerts } = dashboardData

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">System Dashboard</h2>
        <Button 
          onClick={refreshStats} 
          variant="outline" 
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.databaseConnections}</div>
            <p className="text-xs text-muted-foreground">
              {stats.queryResponseTime}ms avg response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed}</div>
            <p className="text-xs text-muted-foreground">
              {serviceStatus.storage.totalSize} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.errorRate * 100).toFixed(2)}% error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Real-time resource usage from Vercel/Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>{stats.cpuUsage}%</span>
              </div>
              <Progress value={stats.cpuUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>{stats.memoryUsage}%</span>
              </div>
              <Progress value={stats.memoryUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disk Usage</span>
                <span>{stats.diskUsage}%</span>
              </div>
              <Progress value={stats.diskUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Network Usage</span>
                <span>{stats.networkUsage}%</span>
              </div>
              <Progress value={stats.networkUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Live platform service health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(serviceStatus.database.status)}
                <span className="text-sm font-medium">Supabase Database</span>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {serviceStatus.database.connections} connections
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {serviceStatus.database.responseTime}ms
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(serviceStatus.authentication.status)}
                <span className="text-sm font-medium">NextAuth</span>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {serviceStatus.authentication.activeSession} sessions
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {serviceStatus.authentication.uptime} uptime
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(serviceStatus.storage.status)}
                <span className="text-sm font-medium">Vercel Storage</span>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {serviceStatus.storage.usage.toFixed(1)}% used
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {serviceStatus.storage.usedSize} / {serviceStatus.storage.totalSize}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(serviceStatus.api.status)}
                <span className="text-sm font-medium">API Gateway</span>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {serviceStatus.api.requestCount} requests
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {serviceStatus.api.errorRate.toFixed(2)}% errors
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>Live audit logs from Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {event.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {event.user} • {event.ipAddress}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {securityEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent events</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Platform health notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={getAlertVariant(alert.type)}>
                      {alert.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-sm text-muted-foreground">No current alerts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Deployment Status */}
      {dashboardData.deploymentData && (
        <Card>
          <CardHeader>
            <CardTitle>Multi-Platform Deployment Status</CardTitle>
            <CardDescription>Vercel & Render connecting to shared Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Environment */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">Current Environment</h4>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData.deploymentData.current.platform} • {dashboardData.deploymentData.current.environment}
                  </p>
                </div>
                <Badge variant="outline">
                  {dashboardData.deploymentData.current.region}
                </Badge>
              </div>

              {/* Database Connection */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">Shared Database</h4>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData.deploymentData.database.provider} • Shared Access: {dashboardData.deploymentData.database.sharedAccess ? 'Yes' : 'No'}
                  </p>
                </div>
                <Badge variant="secondary">
                  {dashboardData.deploymentData.database.connectionString}
                </Badge>
              </div>

              {/* Platform Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Vercel</h4>
                    <Badge 
                      variant={dashboardData.deploymentData.deployments.vercel.status === 'active' ? 'default' : 'secondary'}
                    >
                      {dashboardData.deploymentData.deployments.vercel.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Requests: {dashboardData.deploymentData.deployments.vercel.requestCount || 0}</p>
                    {dashboardData.deploymentData.deployments.vercel.responseTime && (
                      <p>Response: {dashboardData.deploymentData.deployments.vercel.responseTime}ms</p>
                    )}
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Render</h4>
                    <Badge 
                      variant={dashboardData.deploymentData.deployments.render.status === 'active' ? 'default' : 'secondary'}
                    >
                      {dashboardData.deploymentData.deployments.render.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Requests: {dashboardData.deploymentData.deployments.render.requestCount || 0}</p>
                    {dashboardData.deploymentData.deployments.render.responseTime && (
                      <p>Response: {dashboardData.deploymentData.deployments.render.responseTime}ms</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Combined Stats */}
              <div className="p-3 bg-green-50 border-green-200 border rounded-lg">
                <h4 className="font-medium text-green-800">Data Synchronization</h4>
                <p className="text-sm text-green-600">
                  {dashboardData.deploymentData.deployments.total.dataConsistency} • 
                  Combined requests: {dashboardData.deploymentData.deployments.total.combinedRequests}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />
      
      <div className="text-sm text-muted-foreground">
        Last updated: {new Date(dashboardData.timestamp).toLocaleString()} • Data from Vercel, Render & Supabase
      </div>
    </div>
  )
}
