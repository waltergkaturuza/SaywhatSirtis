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

// Dashboard Metrics State
interface DashboardMetrics {
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
  totalCalls: number
  callsToday: number
  callsThisMonth: number
  avgCallDuration: number
  callSuccessRate: number
  totalPrograms: number
  activePrograms: number
  completedPrograms: number
  programSuccessRate: number
}

const SAYWHAT_COLORS = {
  orange: '#ff6b35',
  red: '#dc2626', 
  grey: '#6b7280',
  dark: '#1f2937',
  lightGrey: '#f3f4f6'
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch dashboard metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [selectedPeriod])

  // Redirect to login if not authenticated
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
          <p className="mt-4 text-saywhat-grey">Loading...</p>
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

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/dashboard/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to refresh metrics:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Access control check
  if (!hasDashboardAccess) {
    return (
      <DashboardLayout>
        <div className="px-6">
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-saywhat-orange" />
            <h3 className="mt-2 text-lg font-medium text-saywhat-dark">Limited Access</h3>
            <p className="mt-1 text-sm text-saywhat-grey">
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
        {/* Header Section with SAYWHAT Branding */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-saywhat-dark">SAYWHAT SIRTIS Dashboard</h1>
              <p className="mt-2 text-saywhat-grey">Real-time insights into member engagement and program performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 border-saywhat-grey">
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
                className="border-saywhat-grey hover:bg-saywhat-light-grey"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''} text-saywhat-orange`} />
                Refresh
              </Button>
              <Button 
                size="sm"
                className="bg-saywhat-orange hover:bg-saywhat-red text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Welcome Section with SAYWHAT Branding */}
          <div 
            className="rounded-lg p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${SAYWHAT_COLORS.orange} 0%, ${SAYWHAT_COLORS.red} 50%, ${SAYWHAT_COLORS.dark} 100%)`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">SAYWHAT SIRTIS</h1>
                <p className="text-orange-100 text-lg">
                  Integrated Member Management & Program Performance System
                </p>
                <div className="mt-4 flex space-x-6 text-sm">
                  <div>
                    <span className="block text-orange-100">Last Updated</span>
                    <span className="font-semibold">{new Date().toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-orange-100">System Status</span>
                    <span className="font-semibold text-green-300 flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      All Systems Operational
                    </span>
                  </div>
                  {metrics && (
                    <div>
                      <span className="block text-orange-100">Active Members</span>
                      <span className="font-semibold">{metrics.activeMembers}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
                <Zap className="h-16 w-16 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Key Performance Indicators - Updated per client feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-saywhat-grey">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-saywhat-grey">Total Members</p>
                    <p className="text-2xl font-bold text-saywhat-dark">
                      {metrics ? metrics.totalMembers.toLocaleString() : '---'}
                    </p>
                    <p className="text-xs flex items-center mt-1" style={{ color: SAYWHAT_COLORS.orange }}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{metrics ? metrics.newMembersThisMonth : 0} this month
                    </p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${SAYWHAT_COLORS.orange}20` }}
                  >
                    <Users className="h-6 w-6" style={{ color: SAYWHAT_COLORS.orange }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-saywhat-grey">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-saywhat-grey">Call Statistics</p>
                    <p className="text-2xl font-bold text-saywhat-dark">
                      {metrics ? metrics.callsToday.toLocaleString() : '---'}
                    </p>
                    <p className="text-xs flex items-center mt-1" style={{ color: SAYWHAT_COLORS.red }}>
                      <Phone className="h-3 w-3 mr-1" />
                      {metrics ? metrics.callsThisMonth.toLocaleString() : '---'} this month
                    </p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${SAYWHAT_COLORS.red}20` }}
                  >
                    <Phone className="h-6 w-6" style={{ color: SAYWHAT_COLORS.red }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-saywhat-grey">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-saywhat-grey">Program Performance</p>
                    <p className="text-2xl font-bold text-saywhat-dark">
                      {metrics ? `${metrics.programSuccessRate.toFixed(1)}%` : '---'}
                    </p>
                    <p className="text-xs flex items-center mt-1" style={{ color: SAYWHAT_COLORS.grey }}>
                      <Target className="h-3 w-3 mr-1" />
                      {metrics ? metrics.activePrograms : 0} active programs
                    </p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${SAYWHAT_COLORS.grey}20` }}
                  >
                    <Target className="h-6 w-6" style={{ color: SAYWHAT_COLORS.grey }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-saywhat-grey">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-saywhat-grey">Call Success Rate</p>
                    <p className="text-2xl font-bold text-saywhat-dark">
                      {metrics ? `${metrics.callSuccessRate.toFixed(1)}%` : '---'}
                    </p>
                    <p className="text-xs flex items-center mt-1" style={{ color: SAYWHAT_COLORS.dark }}>
                      <Award className="h-3 w-3 mr-1" />
                      {metrics ? `${metrics.avgCallDuration.toFixed(1)}min avg` : '--- avg'}
                    </p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${SAYWHAT_COLORS.dark}20` }}
                  >
                    <Award className="h-6 w-6" style={{ color: SAYWHAT_COLORS.dark }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SAYWHAT Program Performance Banner */}
          <div 
            className="rounded-lg p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${SAYWHAT_COLORS.red} 0%, ${SAYWHAT_COLORS.dark} 100%)`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Program Management Active</h3>
                  <p className="text-red-100">
                    Member engagement tracking • Program performance analytics • Real-time member insights
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => window.location.href = '/programs'}
                >
                  View Programs
                </Button>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {metrics ? metrics.activePrograms : 0} Active
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Analytics Tabs - Focused on relevant data */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-saywhat-light-grey">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-saywhat-orange data-[state=active]:text-white"
              >
                Member Overview
              </TabsTrigger>
              <TabsTrigger 
                value="calls"
                className="data-[state=active]:bg-saywhat-red data-[state=active]:text-white"
              >
                Call Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="programs"
                className="data-[state=active]:bg-saywhat-grey data-[state=active]:text-white"
              >
                Program Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Growth Chart */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Member Growth Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-saywhat-grey">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-4" style={{ color: SAYWHAT_COLORS.orange }} />
                        <p>Member growth analytics will be displayed here</p>
                        <p className="text-sm">Connected to real member data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Member Activity */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Member Activity Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${SAYWHAT_COLORS.orange}20` }}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: SAYWHAT_COLORS.orange }}></div>
                          <span className="font-medium text-saywhat-dark">Active Members</span>
                        </div>
                        <span className="font-bold text-saywhat-dark">
                          {metrics ? metrics.activeMembers : '---'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${SAYWHAT_COLORS.grey}20` }}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: SAYWHAT_COLORS.grey }}></div>
                          <span className="font-medium text-saywhat-dark">Total Members</span>
                        </div>
                        <span className="font-bold text-saywhat-dark">
                          {metrics ? metrics.totalMembers : '---'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${SAYWHAT_COLORS.red}20` }}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: SAYWHAT_COLORS.red }}></div>
                          <span className="font-medium text-saywhat-dark">New This Month</span>
                        </div>
                        <span className="font-bold text-saywhat-dark">
                          {metrics ? metrics.newMembersThisMonth : '---'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="calls" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Call Volume Chart */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Call Volume Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-saywhat-grey">Calls Today</span>
                        <span className="text-2xl font-bold text-saywhat-dark">
                          {metrics ? metrics.callsToday : '---'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-saywhat-grey">Calls This Month</span>
                        <span className="text-2xl font-bold text-saywhat-dark">
                          {metrics ? metrics.callsThisMonth.toLocaleString() : '---'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-saywhat-grey">Average Duration</span>
                        <span className="text-2xl font-bold text-saywhat-dark">
                          {metrics ? `${metrics.avgCallDuration.toFixed(1)}min` : '---'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-saywhat-grey">Success Rate</span>
                        <span className="text-2xl font-bold" style={{ color: SAYWHAT_COLORS.orange }}>
                          {metrics ? `${metrics.callSuccessRate.toFixed(1)}%` : '---'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Call Performance */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Call Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-saywhat-grey">
                      <div className="text-center">
                        <Phone className="h-12 w-12 mx-auto mb-4" style={{ color: SAYWHAT_COLORS.red }} />
                        <p>Call performance charts will be displayed here</p>
                        <p className="text-sm">Connected to call centre data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="programs" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Program Performance */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Program Success Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-saywhat-grey">Total Programs</span>
                        <span className="text-2xl font-bold text-saywhat-dark">
                          {metrics ? metrics.totalPrograms : '---'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-saywhat-grey">Active Programs</span>
                        <span className="text-2xl font-bold text-saywhat-dark">
                          {metrics ? metrics.activePrograms : '---'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-saywhat-grey">Completed Programs</span>
                        <span className="text-2xl font-bold text-saywhat-dark">
                          {metrics ? metrics.completedPrograms : '---'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-saywhat-grey">Success Rate</span>
                        <span className="text-2xl font-bold" style={{ color: SAYWHAT_COLORS.orange }}>
                          {metrics ? `${metrics.programSuccessRate.toFixed(1)}%` : '---'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Program Distribution */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Program Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-saywhat-grey">
                      <div className="text-center">
                        <Target className="h-12 w-12 mx-auto mb-4" style={{ color: SAYWHAT_COLORS.grey }} />                        
                        <p className="text-sm">Connected to program management data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Access Actions with SAYWHAT Branding */}
          <Card className="border-saywhat-grey">
            <CardHeader>
              <CardTitle className="text-saywhat-dark">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(session?.user?.permissions?.includes("calls.view") || session?.user?.permissions?.includes("calls.full_access")) && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 border-saywhat-orange hover:bg-saywhat-orange hover:text-white" 
                    onClick={() => window.location.href = '/call-centre'}
                  >
                    <Phone className="h-6 w-6" />
                    <span className="text-xs">Call Centre</span>
                  </Button>
                )}
                {(session?.user?.permissions?.includes("programs.view") || session?.user?.permissions?.includes("programs.full_access")) && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 border-saywhat-red hover:bg-saywhat-red hover:text-white" 
                    onClick={() => window.location.href = '/programs'}
                  >
                    <Target className="h-6 w-6" />
                    <span className="text-xs">Programs</span>
                  </Button>
                )}
                {(session?.user?.permissions?.includes("hr.view") || session?.user?.permissions?.includes("hr.full_access")) && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 border-saywhat-grey hover:bg-saywhat-grey hover:text-white" 
                    onClick={() => window.location.href = '/hr'}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-xs">Member Management</span>
                  </Button>
                )}
                {(session?.user?.permissions?.includes("analytics.view") || session?.user?.permissions?.includes("analytics.full_access")) && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 border-saywhat-dark hover:bg-saywhat-dark hover:text-white" 
                    onClick={() => window.location.href = '/analytics'}
                  >
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
