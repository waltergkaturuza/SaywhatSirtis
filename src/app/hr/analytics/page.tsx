'use client'

import React, { useState, useEffect } from 'react'
import { ModulePage } from "@/components/layout/enhanced-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MetricCard, 
  AnalyticsHeader, 
  AlertBanner, 
  DataTable 
} from '@/components/hr/analytics/analytics-components'
import { useHRAnalytics } from '@/hooks/use-hr-analytics'
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
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts'
import {
  Users,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
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
  ChartBarIcon
} from 'lucide-react'

// Types for HR Analytics data
interface HRMetrics {
  totalEmployees: number
  activeEmployees: number
  newHires: number
  turnoverRate: number
  averageTenure: number
  averageSalary: number
  totalPayroll: number
  attendanceRate: number
  performanceScore: number
  trainingCompletionRate: number
}

interface DepartmentData {
  department: string
  employees: number
  avgSalary: number
  turnoverRate: number
  performanceScore: number
  satisfactionScore: number
}

interface TurnoverData {
  month: string
  departures: number
  hires: number
  netChange: number
  turnoverRate: number
}

interface PerformanceData {
  rating: string
  count: number
  percentage: number
}

interface SalaryData {
  range: string
  count: number
  avgSalary: number
}

interface AttendanceData {
  date: string
  present: number
  absent: number
  late: number
  remote: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7300']

export default function HRAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('12months')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [hrMetrics, setHrMetrics] = useState<HRMetrics | null>(null)
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([])
  const [turnoverData, setTurnoverData] = useState<TurnoverData[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [salaryData, setSalaryData] = useState<SalaryData[]>([])
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([])

  const { 
    loading, 
    error, 
    lastUpdated, 
    refreshAllData, 
    exportData, 
    clearError 
  } = useHRAnalytics()

  // Fetch HR Analytics data
  useEffect(() => {
    fetchHRAnalytics()
  }, [selectedPeriod, selectedDepartment])

  const fetchHRAnalytics = async () => {
    try {
      const data = await refreshAllData(selectedPeriod, selectedDepartment)
      setHrMetrics(data.metrics)
      setDepartmentData(data.departments)
      setTurnoverData(data.turnover)
      setPerformanceData(data.performance)
      setSalaryData(data.salary)
      setAttendanceData(data.attendance)
    } catch (error) {
      console.error('Error fetching HR analytics:', error)
    }
  }

  const handleExport = async (type: string) => {
    try {
      await exportData(type, selectedPeriod, selectedDepartment)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const metadata = {
    title: "HR Analytics Dashboard",
    description: "Comprehensive insights into workforce metrics and trends",
    breadcrumbs: [
      { name: "SIRTIS", href: "/" },
      { name: "HR Management", href: "/hr" },
      { name: "Analytics" }
    ]
  }

  const actions = (
    <>
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3months">Last 3 Months</SelectItem>
          <SelectItem value="6months">Last 6 Months</SelectItem>
          <SelectItem value="12months">Last 12 Months</SelectItem>
          <SelectItem value="24months">Last 2 Years</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          <SelectItem value="Technology">Technology</SelectItem>
          <SelectItem value="Human Resources">Human Resources</SelectItem>
          <SelectItem value="Programs">Programs</SelectItem>
          <SelectItem value="Call Centre">Call Centre</SelectItem>
          <SelectItem value="Analytics">Analytics</SelectItem>
          <SelectItem value="Finance">Finance</SelectItem>
          <SelectItem value="Operations">Operations</SelectItem>
        </SelectContent>
      </Select>
      
      <Button onClick={() => handleExport('comprehensive')} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      <Button onClick={fetchHRAnalytics} variant="outline" disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Updating...' : 'Refresh'}
      </Button>
    </>
  )

  return (
    <ModulePage metadata={metadata} actions={actions}>
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <AlertBanner
            type="error"
            title="Error Loading Analytics"
            message={error}
            onDismiss={clearError}
          />
        )}

        {/* Last Updated Info */}
        {lastUpdated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          </div>
        )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Employees"
          value={hrMetrics?.totalEmployees || 0}
          description={`+${hrMetrics?.newHires || 0} new hires`}
          icon={Users}
          change="5.2% vs last quarter"
          changeType="increase"
        />

        <MetricCard
          title="Turnover Rate"
          value={`${hrMetrics?.turnoverRate || 0}%`}
          description="Industry avg: 15%"
          icon={TrendingUp}
          change="-2.1% vs last year"
          changeType="decrease"
        />

        <MetricCard
          title="Avg Tenure"
          value={`${hrMetrics?.averageTenure || 0} years`}
          description="+0.3 vs last year"
          icon={Clock}
          change="8.3% vs last year"
          changeType="increase"
        />

        <MetricCard
          title="Avg Salary"
          value={`$${hrMetrics?.averageSalary?.toLocaleString() || 0}`}
          description="+5.2% vs last year"
          icon={DollarSign}
          change="5.2%"
          changeType="increase"
        />

        <MetricCard
          title="Performance"
          value={`${hrMetrics?.performanceScore || 0}/5`}
          description="+0.2 vs last quarter"
          icon={Award}
          change="4.8% vs last quarter"
          changeType="increase"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workforce">Workforce</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Distribution by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ department, percentage }) => `${department}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="employees"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Turnover Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Turnover Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={turnoverData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="departures" stroke="#ff6b6b" name="Departures" />
                    <Line type="monotone" dataKey="hires" stroke="#51cf66" name="New Hires" />
                    <Line type="monotone" dataKey="turnoverRate" stroke="#339af0" name="Turnover Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="employees" fill="#8884d8" name="Employee Count" />
                  <Bar yAxisId="right" dataKey="performanceScore" fill="#82ca9d" name="Performance Score" />
                  <Bar yAxisId="right" dataKey="satisfactionScore" fill="#ffc658" name="Satisfaction Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workforce Tab */}
        <TabsContent value="workforce" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { ageRange: '20-25', count: 45, percentage: 15 },
                    { ageRange: '26-30', count: 78, percentage: 26 },
                    { ageRange: '31-35', count: 65, percentage: 22 },
                    { ageRange: '36-40', count: 52, percentage: 17 },
                    { ageRange: '41-45', count: 38, percentage: 13 },
                    { ageRange: '46+', count: 22, percentage: 7 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageRange" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Female', value: 52, color: '#ff69b4' },
                        { name: 'Male', value: 45, color: '#4169e1' },
                        { name: 'Other', value: 3, color: '#32cd32' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Female', value: 52, color: '#ff69b4' },
                        { name: 'Male', value: 45, color: '#4169e1' },
                        { name: 'Other', value: 3, color: '#32cd32' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tenure Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Tenure Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { tenure: '0-1 years', count: 85, atRisk: 15 },
                  { tenure: '1-2 years', count: 68, atRisk: 22 },
                  { tenure: '2-5 years', count: 92, atRisk: 8 },
                  { tenure: '5-10 years', count: 47, atRisk: 5 },
                  { tenure: '10+ years', count: 23, atRisk: 2 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tenure" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="count" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total Employees" />
                  <Area type="monotone" dataKey="atRisk" stackId="2" stroke="#ff7300" fill="#ff7300" name="At Risk" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance vs Salary Correlation */}
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Salary Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={[
                    { performance: 2.1, salary: 45000, department: 'Operations' },
                    { performance: 2.8, salary: 52000, department: 'HR' },
                    { performance: 3.2, salary: 58000, department: 'Programs' },
                    { performance: 3.7, salary: 65000, department: 'Technology' },
                    { performance: 4.1, salary: 72000, department: 'Analytics' },
                    { performance: 4.5, salary: 85000, department: 'Technology' },
                    { performance: 4.8, salary: 95000, department: 'Technology' }
                  ]}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="performance" name="Performance Score" domain={[1, 5]} />
                    <YAxis type="number" dataKey="salary" name="Salary" domain={[40000, 100000]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Employees" dataKey="salary" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends by Department */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={departmentData}>
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff' }}
                    background
                    dataKey="performanceScore"
                  />
                  <Legend iconSize={18} wrapperStyle={{ top: '50%', right: '0%', transform: 'translate(0, -50%)', lineHeight: '24px' }} />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compensation Tab */}
        <TabsContent value="compensation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salary Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Salary Range Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Salary by Department */}
            <Card>
              <CardHeader>
                <CardTitle>Average Salary by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Average Salary']} />
                    <Bar dataKey="avgSalary" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Compensation Equity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Compensation Equity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">98.2%</p>
                  <p className="text-sm text-gray-600">Pay Equity Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">$2,450</p>
                  <p className="text-sm text-gray-600">Gender Pay Gap</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">5.2%</p>
                  <p className="text-sm text-gray-600">Market Premium</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  { category: 'Entry Level', male: 48000, female: 46500, market: 47000 },
                  { category: 'Mid Level', male: 65000, female: 63200, market: 64000 },
                  { category: 'Senior Level', male: 85000, female: 82800, market: 84000 },
                  { category: 'Executive', male: 120000, female: 118500, market: 125000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="male" stroke="#8884d8" name="Male Average" />
                  <Line type="monotone" dataKey="female" stroke="#82ca9d" name="Female Average" />
                  <Line type="monotone" dataKey="market" stroke="#ffc658" name="Market Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Attendance Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Attendance Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="present" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Present" />
                    <Area type="monotone" dataKey="remote" stackId="1" stroke="#8884d8" fill="#8884d8" name="Remote" />
                    <Area type="monotone" dataKey="late" stackId="2" stroke="#ffc658" fill="#ffc658" name="Late" />
                    <Area type="monotone" dataKey="absent" stackId="2" stroke="#ff7300" fill="#ff7300" name="Absent" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attendance Rate by Department */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Rate by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData.map(dept => ({
                    ...dept,
                    attendanceRate: Math.random() * 15 + 85 // Mock data
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip formatter={(value) => typeof value === 'number' ? `${value.toFixed(1)}%` : `${value}%`} />
                    <Bar dataKey="attendanceRate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">92.5%</p>
                  <p className="text-sm text-gray-600">Overall Attendance</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">35%</p>
                  <p className="text-sm text-gray-600">Remote Work</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">4.2%</p>
                  <p className="text-sm text-gray-600">Late Arrivals</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">3.3%</p>
                  <p className="text-sm text-gray-600">Absenteeism</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Predictive Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>HR Trends & Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={[
                  { month: 'Jan', employees: 285, predicted: null, turnover: 8.5, satisfaction: 4.2 },
                  { month: 'Feb', employees: 290, predicted: null, turnover: 7.8, satisfaction: 4.3 },
                  { month: 'Mar', employees: 295, predicted: null, turnover: 9.2, satisfaction: 4.1 },
                  { month: 'Apr', employees: 300, predicted: null, turnover: 6.5, satisfaction: 4.4 },
                  { month: 'May', employees: 310, predicted: null, turnover: 8.1, satisfaction: 4.2 },
                  { month: 'Jun', employees: 315, predicted: null, turnover: 7.3, satisfaction: 4.5 },
                  { month: 'Jul', employees: null, predicted: 320, turnover: 7.0, satisfaction: 4.4 },
                  { month: 'Aug', employees: null, predicted: 325, turnover: 6.8, satisfaction: 4.5 },
                  { month: 'Sep', employees: null, predicted: 330, turnover: 6.5, satisfaction: 4.6 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="employees" stroke="#8884d8" strokeWidth={2} name="Actual Employees" />
                  <Line yAxisId="left" type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={2} strokeDasharray="5 5" name="Predicted Employees" />
                  <Line yAxisId="right" type="monotone" dataKey="turnover" stroke="#ff7300" name="Turnover Rate %" />
                  <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#82ca9d" name="Satisfaction Score" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Growth Projection</p>
                    <p className="text-lg font-bold text-gray-900">+15 employees</p>
                    <p className="text-xs text-green-600">Next 3 months</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">At Risk Employees</p>
                    <p className="text-lg font-bold text-gray-900">12 employees</p>
                    <p className="text-xs text-yellow-600">High turnover risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hiring Goal</p>
                    <p className="text-lg font-bold text-gray-900">78% complete</p>
                    <p className="text-xs text-blue-600">Q3 target</p>
                  </div>
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
