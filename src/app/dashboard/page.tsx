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

// Helper function to generate member growth data based on current total
const generateMemberGrowthData = (currentTotal: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const data = []

  // Generate 12 months of data ending with current month
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 11 + i + 12) % 12
    const month = months[monthIndex]
    
    // Calculate the year for this data point
    const yearOffset = currentMonth - 11 + i < 0 ? -1 : 0
    const year = currentYear + yearOffset
    
    // Create display string with month and year
    const monthYear = `${month} ${year}`
    
    // Calculate progressive growth towards current total
    // Start from about 60% of current total a year ago, with some variation
    const progressRatio = (i + 1) / 12
    const baseGrowth = Math.floor(currentTotal * 0.6 + (currentTotal * 0.4 * progressRatio))
    
    // Add some realistic variation (+/- 5%)
    const variation = Math.floor(baseGrowth * (0.95 + Math.random() * 0.1))
    
    // Ensure the last month matches current total
    const members = i === 11 ? currentTotal : Math.max(1, variation)
    
    data.push({
      month: monthYear,
      members
    })
  }
  
  return data
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [callVolumeData, setCallVolumeData] = useState<any[]>([])
  const [totalCallsSinceInception, setTotalCallsSinceInception] = useState(0)
  const [programDistributionData, setProgramDistributionData] = useState<any[]>([])
  const [programTimelineData, setProgramTimelineData] = useState<any[]>([])
  const [callsByProvince, setCallsByProvince] = useState<Array<{province: string, calls: number, validCalls: number}>>([])
  const [callsByAgeGroup, setCallsByAgeGroup] = useState<Array<{ageGroup: string, count: number, percentage: number}>>([])
  const [callsByGender, setCallsByGender] = useState<Array<{gender: string, count: number, percentage: number}>>([])
  const [totalCases, setTotalCases] = useState(0)
  const [newCasesThisMonth, setNewCasesThisMonth] = useState(0)

  // Fetch dashboard metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [metricsResponse, callAnalyticsResponse, totalCallsResponse, programAnalyticsResponse, callSummaryResponse] = await Promise.all([
          fetch('/api/dashboard/metrics'),
          fetch('/api/call-centre/analytics'),
          fetch('/api/call-centre/stats?period=all'),
          fetch('/api/programs/analytics'),
          fetch('/api/call-centre/summary')
        ])
        
        if (metricsResponse.ok) {
          const data = await metricsResponse.json()
          setMetrics(data)
        }

        if (callAnalyticsResponse.ok) {
          const callData = await callAnalyticsResponse.json()
          // Handle both direct response and wrapped response
          const analyticsData = callData.data || callData
          if (analyticsData.monthlyVolume) {
            setCallVolumeData(analyticsData.monthlyVolume)
          }
        }

        if (totalCallsResponse.ok) {
          const totalData = await totalCallsResponse.json()
          setTotalCallsSinceInception(totalData.totalCalls || 0)
        }

        if (programAnalyticsResponse.ok) {
          const programData = await programAnalyticsResponse.json()
          console.log('✅ Program analytics response:', programData)
          console.log('Category distribution:', programData.categoryDistribution)
          console.log('Status timeline:', programData.statusTimeline)
          
          if (programData.categoryDistribution && programData.categoryDistribution.length > 0) {
            console.log(`Setting ${programData.categoryDistribution.length} categories`)
            setProgramDistributionData(programData.categoryDistribution)
          } else {
            console.warn('No category distribution data available')
            setProgramDistributionData([])
          }
          
          if (programData.statusTimeline && programData.statusTimeline.length > 0) {
            console.log(`Setting ${programData.statusTimeline.length} timeline entries`)
            setProgramTimelineData(programData.statusTimeline)
          } else {
            console.warn('No status timeline data available')
            setProgramTimelineData([])
          }
        } else {
          console.error('❌ Failed to fetch program analytics:', programAnalyticsResponse.status)
          const errorText = await programAnalyticsResponse.text()
          console.error('Error response:', errorText)
        }

        if (callSummaryResponse.ok) {
          const summaryData = await callSummaryResponse.json()
          setCallsByProvince(summaryData.callsByProvince || [])
          setCallsByAgeGroup(summaryData.callsByAgeGroup || [])
          setCallsByGender(summaryData.callsByGender || [])
          setTotalCases(summaryData.stats?.totalCases || 0)
          
          // Calculate new cases this month from purposeByTimeframe
          if (summaryData.purposeByTimeframe && summaryData.purposeByTimeframe.length > 0) {
            const totalNewCases = summaryData.purposeByTimeframe.reduce((sum: number, item: any) => sum + (item.month || 0), 0)
            setNewCasesThisMonth(totalNewCases)
          }
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

  // Check if user has dashboard access - Updated to support ADVANCE_USER_1 permissions
  const hasDashboardAccess =
    // Explicit dashboard permissions
    session?.user?.permissions?.includes('dashboard') ||
    session?.user?.permissions?.includes('dashboard.view') ||
    session?.user?.permissions?.includes('dashboard.full_access') ||
    // Global/full access implies dashboard access
    session?.user?.permissions?.includes('full_access') ||
    session?.user?.permissions?.includes('admin.access') ||
    // Any recognized elevated role
    (session?.user?.roles || []).some(r => {
      const rl = r.toLowerCase()
      return [
        'system_administrator',
        'system administrator',
        'administrator',
        'admin',
        'superuser',
        'manager',
        'advance_user_1',
        'advance_user_2'
      ].includes(rl)
    })

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
              <h1 className="text-3xl font-bold text-saywhat-dark">WELCOME TO SIRTIS</h1>
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
                <h1 className="text-3xl font-bold mb-2">SIRTIS</h1>
                <p className="text-orange-100 text-lg">
                  SAYWHAT Integrated Real-Time Information System
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
                      <span className="block text-orange-100">Active Users</span>
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
                    <p className="text-sm font-medium text-saywhat-grey">Total Cases</p>
                    <p className="text-2xl font-bold text-saywhat-dark">
                      {totalCases.toLocaleString()}
                    </p>
                    <p className="text-xs flex items-center mt-1" style={{ color: SAYWHAT_COLORS.orange }}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{newCasesThisMonth} this month
                    </p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${SAYWHAT_COLORS.orange}20` }}
                  >
                    <FileText className="h-6 w-6" style={{ color: SAYWHAT_COLORS.orange }} />
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
                      {metrics && metrics.programSuccessRate !== null ? `${metrics.programSuccessRate.toFixed(1)}%` : '---'}
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
                      {metrics && metrics.callSuccessRate !== null ? `${metrics.callSuccessRate.toFixed(1)}%` : '---'}
                    </p>
                    <p className="text-xs flex items-center mt-1" style={{ color: SAYWHAT_COLORS.dark }}>
                      <Award className="h-3 w-3 mr-1" />
                      {metrics && metrics.avgCallDuration !== null ? `${metrics.avgCallDuration.toFixed(1)}min avg` : '--- avg'}
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
                    User engagement tracking • Program performance analytics • Real-time user insights
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
                User Overview
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calls by Province */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Calls by Province</CardTitle>
                    <p className="text-xs text-saywhat-grey mt-1">Valid / Total</p>
                  </CardHeader>
                  <CardContent>
                    {callsByProvince.length > 0 ? (
                      <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                        {callsByProvince.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 text-sm"
                          >
                            <div className="font-medium text-saywhat-dark truncate mr-2">
                              {item.province}
                            </div>
                            <div className="text-saywhat-grey whitespace-nowrap">
                              <span className="text-green-600 font-semibold">
                                {item.validCalls}
                              </span>{" "}
                              /{" "}
                              <span className="text-saywhat-dark">{item.calls}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-saywhat-grey">
                        <div className="text-center">
                          <ChartBarIcon className="h-12 w-12 mx-auto mb-4" style={{ color: SAYWHAT_COLORS.orange }} />
                          <p>No province data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Calls Distribution by Age Group */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Calls Distribution by Age Group</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {callsByAgeGroup.length > 0 ? (
                      <div className="space-y-3">
                        {callsByAgeGroup.map((item, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    index === 0
                                      ? "bg-blue-500"
                                      : index === 1
                                      ? "bg-green-500"
                                      : index === 2
                                      ? "bg-orange-500"
                                      : index === 3
                                      ? "bg-purple-500"
                                      : index === 4
                                      ? "bg-red-500"
                                      : "bg-gray-500"
                                  }`}
                                ></div>
                                <span className="text-sm font-medium text-saywhat-dark">
                                  {item.ageGroup}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-semibold text-saywhat-dark">
                                  {item.count}
                                </span>
                                <span className="text-saywhat-grey ml-2">
                                  ({item.percentage}%)
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  index === 0
                                    ? "bg-blue-500"
                                    : index === 1
                                    ? "bg-green-500"
                                    : index === 2
                                    ? "bg-orange-500"
                                    : index === 3
                                    ? "bg-purple-500"
                                    : index === 4
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                                }`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-saywhat-grey">
                        <div className="text-center">
                          <Users className="h-12 w-12 mx-auto mb-4" style={{ color: SAYWHAT_COLORS.orange }} />
                          <p>No age data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Calls Distribution by Gender */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Calls Distribution by Gender</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {callsByGender.length > 0 ? (
                      <div className="space-y-4">
                        {callsByGender.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                item.gender === 'Male' ? 'bg-blue-100' :
                                item.gender === 'Female' ? 'bg-pink-100' :
                                'bg-purple-100'
                              }`}>
                                <span className={`text-2xl ${
                                  item.gender === 'Male' ? 'text-blue-600' :
                                  item.gender === 'Female' ? 'text-pink-600' :
                                  'text-purple-600'
                                }`}>
                                  {item.gender === 'Male' ? '♂' : item.gender === 'Female' ? '♀' : '⚥'}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-saywhat-dark">{item.gender}</div>
                                <div className="text-xs text-saywhat-grey">{item.percentage}% of total</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                item.gender === 'Male' ? 'text-blue-600' :
                                item.gender === 'Female' ? 'text-pink-600' :
                                'text-purple-600'
                              }`}>{item.count}</div>
                              <div className="text-xs text-saywhat-grey">calls</div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Visual percentage bar */}
                        <div className="mt-4">
                          <div className="flex h-8 rounded-lg overflow-hidden border border-gray-300">
                            {callsByGender.map((item, index) => (
                              <div
                                key={index}
                                className={`flex items-center justify-center text-xs font-medium text-white ${
                                  item.gender === 'Male' ? 'bg-blue-500' :
                                  item.gender === 'Female' ? 'bg-pink-500' :
                                  'bg-purple-500'
                                }`}
                                style={{ width: `${item.percentage}%` }}
                              >
                                {item.percentage > 10 && `${item.percentage}%`}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-saywhat-grey">
                        <div className="text-center">
                          <Users className="h-12 w-12 mx-auto mb-4" style={{ color: SAYWHAT_COLORS.orange }} />
                          <p>No gender data available</p>
                        </div>
                      </div>
                    )}
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
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
                        <div>
                          <span className="text-sm font-medium text-orange-900 block">Total Calls (All Time)</span>
                          <span className="text-xs text-orange-700">Since inception</span>
                        </div>
                        <span className="text-3xl font-bold text-orange-600">
                          {totalCallsSinceInception.toLocaleString()}
                        </span>
                      </div>
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
                          {metrics && metrics.avgCallDuration !== null ? `${metrics.avgCallDuration.toFixed(1)}min` : '---'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-saywhat-grey">Success Rate</span>
                        <span className="text-2xl font-bold" style={{ color: SAYWHAT_COLORS.orange }}>
                          {metrics && metrics.callSuccessRate !== null ? `${metrics.callSuccessRate.toFixed(1)}%` : '---'}
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
                    {callVolumeData.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center text-saywhat-grey">
                        <div className="text-center">
                          <Phone className="h-12 w-12 mx-auto mb-4" style={{ color: SAYWHAT_COLORS.red }} />
                          <p className="text-sm font-medium">No call data available</p>
                          <p className="text-xs mt-1">Call history will appear here once calls are logged</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={callVolumeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" stroke={SAYWHAT_COLORS.grey} />
                          <YAxis stroke={SAYWHAT_COLORS.grey} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white',
                              border: `1px solid ${SAYWHAT_COLORS.grey}`,
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="calls" fill={SAYWHAT_COLORS.orange} name="Total Calls Received" />
                          <Line 
                            type="monotone" 
                            dataKey="resolved" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            name="Completed/Closed Calls"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    )}
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
                          {metrics && metrics.programSuccessRate !== null ? `${metrics.programSuccessRate.toFixed(1)}%` : '---'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Program Distribution */}
                <Card className="border-saywhat-grey">
                  <CardHeader>
                    <CardTitle className="text-saywhat-dark">Program Distribution by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {programDistributionData.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center text-saywhat-grey">
                        <div className="text-center">
                          <Target className="h-12 w-12 mx-auto mb-4" style={{ color: SAYWHAT_COLORS.grey }} />
                          <p className="text-sm font-medium">No program data available</p>
                          <p className="text-xs mt-1">Programs will appear here once created</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={programDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {programDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#ff6b35', '#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][index % 6]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white',
                              border: `1px solid ${SAYWHAT_COLORS.grey}`,
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Program Status Timeline */}
              <Card className="border-saywhat-grey">
                <CardHeader>
                  <CardTitle className="text-saywhat-dark">Program Status Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {programTimelineData.length === 0 ? (
                    <div className="h-[350px] flex items-center justify-center text-saywhat-grey">
                      <div className="text-center">
                        <Activity className="h-12 w-12 mx-auto mb-4" style={{ color: SAYWHAT_COLORS.grey }} />
                        <p className="text-sm font-medium">No timeline data available</p>
                        <p className="text-xs mt-1">Program status history will appear here</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={programTimelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke={SAYWHAT_COLORS.grey} />
                        <YAxis stroke={SAYWHAT_COLORS.grey} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: `1px solid ${SAYWHAT_COLORS.grey}`,
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="active" 
                          stackId="1" 
                          stroke={SAYWHAT_COLORS.orange} 
                          fill={SAYWHAT_COLORS.orange} 
                          fillOpacity={0.6}
                          name="Active Projects"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="completed" 
                          stackId="1" 
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.6}
                          name="Completed Projects"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="pending" 
                          stackId="1" 
                          stroke="#f59e0b" 
                          fill="#f59e0b" 
                          fillOpacity={0.6}
                          name="Pending Projects"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Access Actions with SAYWHAT Branding */}
          <Card className="border-saywhat-grey">
            <CardHeader>
              <CardTitle className="text-saywhat-dark">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(session?.user?.permissions?.includes("calls.view") || 
                  session?.user?.permissions?.includes("calls.full_access") ||
                  session?.user?.permissions?.includes("call_center_full") ||
                  session?.user?.permissions?.includes("callcentre.access") ||
                  session?.user?.roles?.some(role => ['advance_user_1', 'basic_user_1'].includes(role.toLowerCase()))) && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 border-saywhat-orange hover:bg-saywhat-orange hover:text-white" 
                    onClick={() => window.location.href = '/call-centre'}
                  >
                    <Phone className="h-6 w-6" />
                    <span className="text-xs">Call Centre</span>
                  </Button>
                )}
                {(session?.user?.permissions?.includes("programs.view") || 
                  session?.user?.permissions?.includes("programs.full_access") ||
                  session?.user?.permissions?.includes("programs_edit") ||
                  session?.user?.roles?.some(role => ['advance_user_1', 'advance_user_2', 'basic_user_2'].includes(role.toLowerCase()))) && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 border-saywhat-red hover:bg-saywhat-red hover:text-white" 
                    onClick={() => window.location.href = '/programs'}
                  >
                    <Target className="h-6 w-6" />
                    <span className="text-xs">Programs</span>
                  </Button>
                )}
                {/* Document Repository - Available to ALL authenticated users */}
                {session?.user && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 border-blue-500 hover:bg-blue-500 hover:text-white" 
                    onClick={() => window.location.href = '/documents'}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-xs">Document Repository</span>
                  </Button>
                )}
                {/* Risk Management - Available to ADVANCE_USER_1 and above */}
                {(session?.user?.permissions?.includes("risks_edit") ||
                  session?.user?.roles?.some(role => ['advance_user_1', 'admin', 'manager'].includes(role.toLowerCase()))) && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 border-red-500 hover:bg-red-500 hover:text-white" 
                    onClick={() => window.location.href = '/risk-management'}
                  >
                    <Shield className="h-6 w-6" />
                    <span className="text-xs">Risk Management</span>
                  </Button>
                )}
                {(session?.user?.permissions?.includes("hr.view") || session?.user?.permissions?.includes("hr.full_access")) && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 border-saywhat-grey hover:bg-saywhat-grey hover:text-white" 
                    onClick={() => window.location.href = '/hr'}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-xs">User Management</span>
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
