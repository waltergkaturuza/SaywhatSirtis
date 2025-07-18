"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ModulePage } from "@/components/layout/enhanced-layout"
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
  Headphones
} from 'lucide-react'

// Mock data for call centre analytics
const callMetrics = {
  totalCalls: 1247,
  answeredCalls: 1156,
  missedCalls: 91,
  averageWaitTime: 45,
  averageCallDuration: 8.5,
  resolutionRate: 87.3,
  satisfactionScore: 4.2,
  activeAgents: 12,
  peakHours: "2:00 PM - 4:00 PM"
}

const callTrends = [
  { date: 'Mon', incoming: 180, answered: 165, resolved: 142, satisfaction: 4.1 },
  { date: 'Tue', incoming: 220, answered: 205, resolved: 178, satisfaction: 4.3 },
  { date: 'Wed', incoming: 195, answered: 182, resolved: 160, satisfaction: 4.0 },
  { date: 'Thu', incoming: 240, answered: 225, resolved: 198, satisfaction: 4.4 },
  { date: 'Fri', incoming: 280, answered: 260, resolved: 230, satisfaction: 4.5 },
  { date: 'Sat', incoming: 150, answered: 140, resolved: 125, satisfaction: 4.2 },
  { date: 'Sun', incoming: 132, answered: 120, resolved: 108, satisfaction: 4.1 }
]

const callTypes = [
  { name: 'Technical Support', value: 35, color: '#3B82F6' },
  { name: 'Billing Inquiry', value: 25, color: '#10B981' },
  { name: 'Product Information', value: 20, color: '#F59E0B' },
  { name: 'Complaints', value: 12, color: '#EF4444' },
  { name: 'General Inquiry', value: 8, color: '#8B5CF6' }
]

const agentPerformance = [
  { name: 'Agent 1', callsHandled: 95, avgDuration: 7.2, satisfaction: 4.5, resolution: 92 },
  { name: 'Agent 2', callsHandled: 87, avgDuration: 8.1, satisfaction: 4.3, resolution: 88 },
  { name: 'Agent 3', callsHandled: 92, avgDuration: 7.8, satisfaction: 4.4, resolution: 90 },
  { name: 'Agent 4', callsHandled: 78, avgDuration: 9.2, satisfaction: 4.1, resolution: 85 },
  { name: 'Agent 5', callsHandled: 85, avgDuration: 8.5, satisfaction: 4.2, resolution: 87 }
]

const hourlyData = [
  { hour: '08:00', calls: 15, wait: 30 },
  { hour: '09:00', calls: 25, wait: 35 },
  { hour: '10:00', calls: 40, wait: 45 },
  { hour: '11:00', calls: 55, wait: 50 },
  { hour: '12:00', calls: 35, wait: 40 },
  { hour: '13:00', calls: 30, wait: 35 },
  { hour: '14:00', calls: 65, wait: 60 },
  { hour: '15:00', calls: 70, wait: 65 },
  { hour: '16:00', calls: 60, wait: 55 },
  { hour: '17:00', calls: 45, wait: 50 }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function CallCentreAnalyticsPage() {
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)
  
  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || 
                             userPermissions.includes('programs.head') ||
                             userPermissions.includes('callcentre.officer')

  const metadata = {
    title: "Call Centre Analytics",
    description: "Comprehensive call centre performance metrics and insights",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Call Centre", href: "/call-centre" },
      { name: "Analytics" }
    ]
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  if (!canAccessCallCentre) {
    return (
      <ModulePage metadata={metadata}>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            This module is restricted to Call Centre officers and Head of Programs only.
          </p>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage 
      metadata={metadata}
      actions={
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
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
      }
    >
      <div className="space-y-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{callMetrics.totalCalls.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2% from last week
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Answer Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{((callMetrics.answeredCalls / callMetrics.totalCalls) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {callMetrics.answeredCalls} answered
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
                  <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-gray-900">{callMetrics.averageWaitTime}s</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Target: 30s
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">{callMetrics.satisfactionScore}/5</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Award className="h-3 w-3 mr-1" />
                    Excellent rating
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
                    <ComposedChart data={callTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="incoming" fill="#3B82F6" name="Incoming Calls" />
                      <Bar yAxisId="left" dataKey="answered" fill="#10B981" name="Answered Calls" />
                      <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#8B5CF6" strokeWidth={3} name="Satisfaction" />
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
                        data={callTypes}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {callTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                <CardTitle>Hourly Call Pattern & Wait Times</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="calls" fill="#3B82F6" name="Call Volume" />
                    <Line yAxisId="right" type="monotone" dataKey="wait" stroke="#EF4444" strokeWidth={2} name="Wait Time (sec)" />
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
                  <BarChart data={agentPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="callsHandled" fill="#3B82F6" name="Calls Handled" />
                    <Bar yAxisId="left" dataKey="resolution" fill="#10B981" name="Resolution %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agentPerformance.map((agent, index) => (
                <Card key={agent.name}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <Badge variant={agent.resolution > 90 ? "default" : agent.resolution > 85 ? "secondary" : "outline"}>
                        {agent.resolution}% Resolution
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Calls Handled</span>
                        <span className="font-medium">{agent.callsHandled}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Duration</span>
                        <span className="font-medium">{agent.avgDuration}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Satisfaction</span>
                        <span className="font-medium">{agent.satisfaction}/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={callTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="answered" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Answered" />
                      <Area type="monotone" dataKey="resolved" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Resolved" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Satisfaction Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={callTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[3.5, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="satisfaction" stroke="#8B5CF6" strokeWidth={3} name="Customer Satisfaction" />
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
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Strong Performance</p>
                      <p className="text-xs text-gray-600">Call resolution rate increased by 5% this week</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Peak Hours</p>
                      <p className="text-xs text-gray-600">Highest call volume between 2-4 PM daily</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Attention Needed</p>
                      <p className="text-xs text-gray-600">Wait times exceed target during peak hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-medium text-blue-900">Staffing Optimization</h4>
                    <p className="text-sm text-blue-700">Consider adding 2 more agents during 2-4 PM peak hours</p>
                  </div>
                  <div className="p-3 border-l-4 border-green-500 bg-green-50">
                    <h4 className="font-medium text-green-900">Training Success</h4>
                    <p className="text-sm text-green-700">Agent performance improvement shows training effectiveness</p>
                  </div>
                  <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                    <h4 className="font-medium text-purple-900">Customer Feedback</h4>
                    <p className="text-sm text-purple-700">Implement feedback collection for unresolved cases</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ModulePage>
  )
}
