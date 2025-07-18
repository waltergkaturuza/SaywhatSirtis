"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Users,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Clock,
  DollarSign,
  Award,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  Briefcase,
  Target,
  Activity,
  RefreshCw,
  ChartBarIcon,
  Phone,
  FileText,
  Building,
  Globe,
  Zap,
  Shield
} from 'lucide-react'

// Mock data for system analytics
const systemMetrics = {
  totalUsers: 1248,
  activeUsers: 892,
  newUsersThisMonth: 156,
  systemUptime: 99.97,
  totalPrograms: 47,
  activePrograms: 38,
  completedPrograms: 142,
  callsToday: 892,
  callsThisMonth: 24567,
  documentsTotal: 15623,
  documentsThisMonth: 1247,
  storageUsed: 87.3,
  performanceScore: 94.2
}

const moduleUsageData = [
  { name: 'HR Management', users: 324, sessions: 1247, growth: 12.5 },
  { name: 'Call Centre', users: 189, sessions: 892, growth: 8.3 },
  { name: 'Programs', users: 267, sessions: 1089, growth: 15.7 },
  { name: 'Documents', users: 445, sessions: 2134, growth: 22.1 },
  { name: 'Inventory', users: 98, sessions: 345, growth: 5.2 },
  { name: 'Analytics', users: 156, sessions: 567, growth: 18.9 }
]

const performanceTrends = [
  { month: 'Jan', users: 850, calls: 18500, documents: 1200, performance: 92 },
  { month: 'Feb', users: 920, calls: 21300, documents: 1380, performance: 93 },
  { month: 'Mar', users: 980, calls: 23100, documents: 1456, performance: 91 },
  { month: 'Apr', users: 1050, calls: 25200, documents: 1523, performance: 94 },
  { month: 'May', users: 1120, calls: 26800, documents: 1678, performance: 95 },
  { month: 'Jun', users: 1200, calls: 28400, documents: 1789, performance: 96 }
]

const departmentStats = [
  { name: 'Operations', value: 35, color: '#3B82F6' },
  { name: 'Finance', value: 20, color: '#10B981' },
  { name: 'HR', value: 15, color: '#F59E0B' },
  { name: 'IT', value: 12, color: '#EF4444' },
  { name: 'Admin', value: 10, color: '#8B5CF6' },
  { name: 'Others', value: 8, color: '#6B7280' }
]

const systemHealthData = [
  { name: 'CPU', value: 45, color: '#3B82F6' },
  { name: 'Memory', value: 72, color: '#F59E0B' },
  { name: 'Storage', value: 56, color: '#10B981' },
  { name: 'Network', value: 34, color: '#EF4444' }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  // Redirect to login if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated" || !session) {
    window.location.href = "/auth/signin"
    return null
  }

  // Check if user has dashboard access
  const hasDashboardAccess = session?.user?.permissions?.includes("dashboard.view") ||
                            session?.user?.permissions?.includes("dashboard.full_access") ||
                            session?.user?.roles?.includes("admin") ||
                            session?.user?.roles?.includes("manager")

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  // Access control check
  if (!hasDashboardAccess) {
    return (
      <DashboardLayout>
        <div className="px-6">
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Limited Access</h3>
            <p className="mt-1 text-sm text-gray-500">
              You have limited access to dashboard features. Contact your administrator for full access.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SIRTIS Dashboard</h1>
              <p className="mt-2 text-gray-600">Comprehensive overview of system performance and operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleRefresh}
                variant="outline" 
                size="sm"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">SIRTIS Dashboard</h1>
              <p className="text-blue-100 text-lg">
                SAYWHAT Integrated Real-Time Information System
              </p>
              <div className="mt-4 flex space-x-6 text-sm">
                <div>
                  <span className="block text-blue-100">Last Updated</span>
                  <span className="font-semibold">{new Date().toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-blue-100">System Status</span>
                  <span className="font-semibold text-green-300 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    All Systems Operational
                  </span>
                </div>
                <div>
                  <span className="block text-blue-100">Uptime</span>
                  <span className="font-semibold">{systemMetrics.systemUptime}%</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Zap className="h-16 w-16 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{systemMetrics.newUsersThisMonth} this month
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Programs</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.activePrograms}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Target className="h-3 w-3 mr-1" />
                    {systemMetrics.totalPrograms} total programs
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Calls Today</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.callsToday.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Activity className="h-3 w-3 mr-1" />
                    {systemMetrics.callsThisMonth.toLocaleString()} this month
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance Score</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.performanceScore}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Award className="h-3 w-3 mr-1" />
                    Excellent performance
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="modules">Module Analytics</TabsTrigger>
            {(session?.user?.roles?.includes("admin") || session?.user?.permissions?.includes("system.performance")) && (
              <TabsTrigger value="performance">Performance</TabsTrigger>
            )}
            {(session?.user?.roles?.includes("admin") || session?.user?.permissions?.includes("system.health")) && (
              <TabsTrigger value="health">System Health</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={performanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="users" fill="#3B82F6" name="Users" />
                      <Line yAxisId="right" type="monotone" dataKey="performance" stroke="#10B981" strokeWidth={3} name="Performance %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Department Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {departmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>System Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="calls" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Calls" />
                    <Area type="monotone" dataKey="documents" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Documents" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Usage Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={moduleUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="users" fill="#3B82F6" name="Active Users" />
                    <Bar yAxisId="left" dataKey="sessions" fill="#10B981" name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {moduleUsageData.map((module, index) => (
                <Card key={module.name}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{module.name}</h3>
                      <Badge variant={module.growth > 15 ? "default" : module.growth > 10 ? "secondary" : "outline"}>
                        +{module.growth}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Users</span>
                        <span className="font-medium">{module.users}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sessions</span>
                        <span className="font-medium">{module.sessions}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {(session?.user?.roles?.includes("admin") || session?.user?.permissions?.includes("system.performance")) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="performance" stroke="#3B82F6" strokeWidth={3} name="Performance Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={systemHealthData}>
                        <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Access Restricted</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have permission to view performance metrics.
                </p>
              </div>
            )}

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemHealthData.map((metric, index) => (
                <Card key={metric.name}>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 mb-2">{metric.name}</h3>
                      <div className="relative">
                        <div className="w-20 h-20 mx-auto">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="transparent"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={`${
                                metric.value > 70 ? 'text-red-500' : 
                                metric.value > 50 ? 'text-yellow-500' : 'text-green-500'
                              }`}
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              fill="transparent"
                              strokeDasharray={`${metric.value}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold">{metric.value}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            {(session?.user?.roles?.includes("admin") || session?.user?.permissions?.includes("system.health")) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium">API Services</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="font-medium">Storage</span>
                      </div>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">Warning</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium">Network</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">Stable</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent System Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Storage Usage High</p>
                        <p className="text-xs text-gray-600">Storage usage is at 87%. Consider cleanup.</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">System Maintenance Scheduled</p>
                        <p className="text-xs text-gray-600">Planned maintenance window this weekend.</p>
                        <p className="text-xs text-gray-500 mt-1">6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <UserCheck className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Backup Completed</p>
                        <p className="text-xs text-gray-600">Daily system backup completed successfully.</p>
                        <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Access Restricted</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have permission to view system health information.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Access Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(session?.user?.permissions?.includes("hr.view") || session?.user?.permissions?.includes("hr.full_access")) && (
                <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => window.location.href = '/hr'}>
                  <Users className="h-6 w-6" />
                  <span className="text-xs">HR Management</span>
                </Button>
              )}
              {(session?.user?.permissions?.includes("calls.view") || session?.user?.permissions?.includes("calls.full_access")) && (
                <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => window.location.href = '/call-centre'}>
                  <Phone className="h-6 w-6" />
                  <span className="text-xs">Call Centre</span>
                </Button>
              )}
              {(session?.user?.permissions?.includes("programs.view") || session?.user?.permissions?.includes("programs.full_access")) && (
                <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => window.location.href = '/programs'}>
                  <Briefcase className="h-6 w-6" />
                  <span className="text-xs">Programs</span>
                </Button>
              )}
              {(session?.user?.permissions?.includes("documents.view") || session?.user?.permissions?.includes("documents.full_access")) && (
                <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => window.location.href = '/documents'}>
                  <FileText className="h-6 w-6" />
                  <span className="text-xs">Documents</span>
                </Button>
              )}
              {(session?.user?.permissions?.includes("inventory.view") || session?.user?.permissions?.includes("inventory.full_access")) && (
                <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => window.location.href = '/inventory'}>
                  <Building className="h-6 w-6" />
                  <span className="text-xs">Inventory</span>
                </Button>
              )}
              {(session?.user?.permissions?.includes("analytics.view") || session?.user?.permissions?.includes("analytics.full_access")) && (
                <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => window.location.href = '/analytics'}>
                  <ChartBarIcon className="h-6 w-6" />
                  <span className="text-xs">Analytics</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}
