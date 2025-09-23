"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ModulePage } from "@/components/layout/enhanced-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar
} from 'recharts'
import {
  Phone,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Clock,
  Award,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  Target,
  Activity,
  RefreshCw,
  ChartBarIcon,
  Users,
  CheckCircle,
  XCircle,
  Headphones,
  Loader2
} from 'lucide-react'

// TypeScript interfaces for API response
interface CallMetrics {
  totalCalls: number
  answerRate: number
  avgHandleTime: string
  satisfactionScore: number
  completionRate: number
  pendingCalls: number
  resolvedCalls: number
  validCalls: number
}

interface CallTrend {
  day: string
  date: string
  calls: number
  answered: number
  resolved: number
}

interface CallType {
  type: string
  count: number
  percentage: number
}

interface AgentPerformance {
  name: string
  callsHandled: number
  avgSatisfaction: number
  responseTime: string
  efficiency: number
}

interface HourlyData {
  hour: string
  calls: number
  answered: number
}

interface AnalyticsData {
  callMetrics: CallMetrics
  callTrends: CallTrend[]
  callTypes: CallType[]
  agentPerformance: AgentPerformance[]
  hourlyData: HourlyData[]
  metadata: {
    dataRange: string
    lastUpdated: string
    totalAgents: number
    averageResolutionHours: number
  }
}

const COLORS = ['#FF8C00', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] // SAYWHAT Orange as primary color

export default function CallCentreAnalyticsPage() {
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || 
                             userPermissions.includes('calls.view') ||
                             userPermissions.includes('calls.full_access') ||
                             userPermissions.includes('programs.head') ||
                             userPermissions.includes('callcentre.officer') ||
                             userPermissions.includes('admin') ||
                             session?.user?.roles?.includes('admin') ||
                             session?.user?.roles?.includes('manager')

  const metadata = {
    title: "Call Centre Analytics",
    description: "Comprehensive call centre performance metrics and insights",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Call Centre", href: "/call-centre" },
      { name: "Analytics" }
    ]
  }

  // Fetch analytics data
  const fetchAnalyticsData = async (days: string = selectedPeriod) => {
    try {
      setError(null)
      const response = await fetch(`/api/call-centre/analytics?days=${days}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch analytics data')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setAnalyticsData(result.data)
      } else {
        throw new Error(result.message || 'Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial data load
  useEffect(() => {
    if (canAccessCallCentre && session) {
      fetchAnalyticsData()
    }
  }, [session, canAccessCallCentre])

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod)
    setLoading(true)
    fetchAnalyticsData(newPeriod)
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalyticsData()
  }

  // Handle export
  const handleExport = () => {
    if (!analyticsData) return
    
    const exportData = {
      generatedAt: new Date().toISOString(),
      period: `${selectedPeriod} days`,
      ...analyticsData
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call-centre-analytics-${selectedPeriod}days-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!canAccessCallCentre) {
    return (
      <ModulePage metadata={metadata}>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            This module is restricted to Call Centre officers and authorized personnel only.
          </p>
        </div>
      </ModulePage>
    )
  }

  if (error) {
    return (
      <ModulePage metadata={metadata}>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Analytics</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <Button 
            onClick={handleRefresh} 
            className="mt-4"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Try Again
          </Button>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage 
      metadata={metadata}
      actions={
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            size="sm"
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm"
            onClick={handleExport}
            disabled={!analyticsData || loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Data Content */}
        {!loading && analyticsData && (
          <>
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Calls</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.callMetrics.totalCalls.toLocaleString()}</p>
                      <p className="text-xs text-orange-600 flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {analyticsData.metadata.dataRange}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Answer Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.callMetrics.answerRate.toFixed(1)}%</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {analyticsData.callMetrics.validCalls} valid calls
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Handle Time</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.callMetrics.avgHandleTime}</p>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Resolution time
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.callMetrics.satisfactionScore.toFixed(1)}/5</p>
                      <p className="text-xs text-purple-600 flex items-center mt-1">
                        <Award className="h-3 w-3 mr-1" />
                        {analyticsData.callMetrics.completionRate.toFixed(1)}% completed
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Call Overview</TabsTrigger>
                <TabsTrigger value="performance">Agent Performance</TabsTrigger>
                <TabsTrigger value="trends">Call Trends</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Call Volume Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Call Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={analyticsData.callTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis yAxisId="left" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="calls" fill="#FF8C00" name="Total Calls" />
                          <Bar yAxisId="left" dataKey="answered" fill="#10B981" name="Answered Calls" />
                          <Bar yAxisId="left" dataKey="resolved" fill="#3B82F6" name="Resolved Calls" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Call Types Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Call Types Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData.callTypes}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ type, percentage }) => `${type}: ${percentage}%`}
                          >
                            {analyticsData.callTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Hourly Call Pattern */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hourly Call Pattern</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={analyticsData.hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="calls" fill="#FF8C00" name="Call Volume" />
                        <Line type="monotone" dataKey="answered" stroke="#10B981" strokeWidth={2} name="Answered Calls" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={analyticsData.agentPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="callsHandled" fill="#FF8C00" name="Calls Handled" />
                        <Bar yAxisId="left" dataKey="efficiency" fill="#10B981" name="Efficiency %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {analyticsData.agentPerformance.map((agent) => (
                    <Card key={agent.name}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          <Badge variant={agent.efficiency > 90 ? "default" : agent.efficiency > 75 ? "secondary" : "outline"}>
                            {agent.efficiency}% Efficiency
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Calls Handled</span>
                            <span className="font-medium">{agent.callsHandled}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Response Time</span>
                            <span className="font-medium">{agent.responseTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Avg Satisfaction</span>
                            <span className="font-medium">{agent.avgSatisfaction.toFixed(1)}/5</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {analyticsData.agentPerformance.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No agent performance data available for the selected period</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Call Resolution Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.callTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="answered" stackId="1" stroke="#FF8C00" fill="#FF8C00" fillOpacity={0.6} name="Answered" />
                          <Area type="monotone" dataKey="resolved" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Resolved" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Call Volume Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.callTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="calls" stroke="#FF8C00" strokeWidth={3} name="Total Calls" />
                          <Line type="monotone" dataKey="answered" stroke="#10B981" strokeWidth={2} name="Answered" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Total Call Volume</p>
                          <p className="text-xs text-gray-600">{analyticsData.callMetrics.totalCalls} calls in {analyticsData.metadata.dataRange}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Answer Rate</p>
                          <p className="text-xs text-gray-600">{analyticsData.callMetrics.answerRate.toFixed(1)}% of calls answered successfully</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Handle Time</p>
                          <p className="text-xs text-gray-600">Average {analyticsData.callMetrics.avgHandleTime} per call</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                        <h4 className="font-medium text-orange-900">Active Agents</h4>
                        <p className="text-sm text-orange-700">{analyticsData.metadata.totalAgents} agents handling calls</p>
                      </div>
                      <div className="p-3 border-l-4 border-green-500 bg-green-50">
                        <h4 className="font-medium text-green-900">Resolution Time</h4>
                        <p className="text-sm text-green-700">Avg {analyticsData.metadata.averageResolutionHours.toFixed(1)} hours to resolve</p>
                      </div>
                      <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                        <h4 className="font-medium text-purple-900">Data Updated</h4>
                        <p className="text-sm text-purple-700">{new Date(analyticsData.metadata.lastUpdated).toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </ModulePage>
  )
}
