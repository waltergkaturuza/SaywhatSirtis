'use client'

import React, { useState, useEffect } from 'react'
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import {
  DocumentTextIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  FolderIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  EyeIcon,
  StarIcon,
  ShareIcon,
  ChartPieIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

// Types for Document Analytics
interface DocumentMetrics {
  totalDocuments: number
  totalSize: string
  viewsThisMonth: number
  downloadsThisMonth: number
  sharedDocuments: number
  favoriteDocuments: number
  avgFileSize: string
  documentGrowthRate: number
}

interface CategoryData {
  category: string
  count: number
  size: number
  percentage: number
  avgSize: number
}

interface DepartmentData {
  department: string
  documents: number
  size: number
  views: number
  downloads: number
  activeUsers: number
}

interface TimeSeriesData {
  month: string
  uploads: number
  views: number
  downloads: number
  shares: number
}

interface SecurityData {
  classification: string
  count: number
  percentage: number
  color: string
}

interface UserActivityData {
  user: string
  uploads: number
  views: number
  downloads: number
  shares: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7300', '#A28CFF', '#FF6B9D']
const CHART_COLORS = {
  primary: '#f97316', // saywhat-orange
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  pink: '#ec4899'
}

export default function DocumentAnalytics() {
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('12months')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [metrics, setMetrics] = useState<DocumentMetrics>({
    totalDocuments: 0,
    totalSize: '0 GB',
    viewsThisMonth: 0,
    downloadsThisMonth: 0,
    sharedDocuments: 0,
    favoriteDocuments: 0,
    avgFileSize: '0 MB',
    documentGrowthRate: 0
  })
  
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [securityData, setSecurityData] = useState<SecurityData[]>([])
  const [userActivityData, setUserActivityData] = useState<UserActivityData[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod, selectedDepartment])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/documents/analytics/comprehensive?period=${selectedPeriod}&department=${selectedDepartment}`)
      
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
        setCategoryData(data.categories)
        setDepartmentData(data.departments)
        setTimeSeriesData(data.timeSeries)
        setSecurityData(data.security)
        setUserActivityData(data.userActivity)
      } else {
        setError('Failed to load analytics data')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Unable to load analytics at this time')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`/api/documents/analytics/export?format=${format}&period=${selectedPeriod}&department=${selectedDepartment}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `document-analytics-${selectedPeriod}.${format}`
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export analytics')
    }
  }

  const metadata = {
    title: "Document Analytics Dashboard",
    description: "Professional analytics and workforce insights",
    breadcrumbs: [
      { name: "SIRTIS", href: "/" },
      { name: "Documents", href: "/documents" },
      { name: "Analytics" }
    ]
  }

  const actions = (
    <div className="flex items-center space-x-3">
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1month">Last Month</SelectItem>
          <SelectItem value="3months">Last 3 Months</SelectItem>
          <SelectItem value="6months">Last 6 Months</SelectItem>
          <SelectItem value="12months">Last 12 Months</SelectItem>
          <SelectItem value="24months">Last 2 Years</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          <SelectItem value="Programs">Programs</SelectItem>
          <SelectItem value="Human Resource Management">Human Resource Management</SelectItem>
          <SelectItem value="Finance and Administration">Finance and Administration</SelectItem>
          <SelectItem value="Communications">Communications</SelectItem>
        </SelectContent>
      </Select>
      
      <Button onClick={() => handleExport('xlsx')} variant="outline">
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        Export
      </Button>

      <Button onClick={fetchAnalytics} variant="outline" disabled={loading}>
        <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Updating...' : 'Refresh'}
      </Button>
    </div>
  )

  if (loading && !metrics.totalDocuments) {
    return (
      <ModulePage metadata={metadata} actions={actions}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ArrowPathIcon className="h-12 w-12 text-saywhat-orange animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage metadata={metadata} actions={actions}>
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-900">Total Documents</CardTitle>
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{metrics.totalDocuments.toLocaleString()}</div>
              <p className="text-xs text-blue-700 mt-1">
                +{metrics.documentGrowthRate}% vs last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-900">Storage Used</CardTitle>
                <CloudArrowUpIcon className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{metrics.totalSize}</div>
              <p className="text-xs text-green-700 mt-1">
                Avg: {metrics.avgFileSize}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-900">Views This Month</CardTitle>
                <EyeIcon className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{metrics.viewsThisMonth.toLocaleString()}</div>
              <p className="text-xs text-purple-700 mt-1">
                {metrics.downloadsThisMonth.toLocaleString()} downloads
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-900">Engagement</CardTitle>
                <StarIcon className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{metrics.favoriteDocuments}</div>
              <p className="text-xs text-orange-700 mt-1">
                {metrics.sharedDocuments} shared
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ChartPieIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
                    Document Distribution by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Upload Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
                    Upload & Activity Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="uploads" stackId="1" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} name="Uploads" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="views" stackId="2" stroke={CHART_COLORS.secondary} fill={CHART_COLORS.secondary} name="Views" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="downloads" stackId="3" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} name="Downloads" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Department Performance Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
                  Department Performance Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="documents" fill={CHART_COLORS.primary} name="Document Count" />
                    <Bar yAxisId="right" dataKey="views" fill={CHART_COLORS.secondary} name="Total Views" />
                    <Bar yAxisId="right" dataKey="downloads" fill={CHART_COLORS.success} name="Total Downloads" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Size Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Storage by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={categoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="size" fill={CHART_COLORS.primary} name="Size (MB)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Average File Size */}
              <Card>
                <CardHeader>
                  <CardTitle>Average File Size by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgSize" fill={CHART_COLORS.teal} name="Avg Size (MB)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categoryData.map((cat, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cat.count.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cat.size.toFixed(1)} MB</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cat.avgSize.toFixed(2)} MB</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-saywhat-orange h-2 rounded-full" 
                                  style={{ width: `${cat.percentage}%` }}
                                ></div>
                              </div>
                              <span>{cat.percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            {/* Department Activity Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Department Activity Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={departmentData.slice(0, 6)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="department" />
                    <PolarRadiusAxis />
                    <Radar name="Documents" dataKey="documents" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.6} />
                    <Radar name="Views" dataKey="views" stroke={CHART_COLORS.secondary} fill={CHART_COLORS.secondary} fillOpacity={0.6} />
                    <Radar name="Downloads" dataKey="downloads" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Department Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size (MB)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Users</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departmentData.map((dept, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.documents.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.size.toFixed(1)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.views.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.downloads.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.activeUsers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Classification Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
                    Security Classification Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={securityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ classification, percentage }) => `${classification}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {securityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Security Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">{item.classification}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">{item.count} docs</span>
                            <Badge variant="outline">{item.percentage}%</Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full" 
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: item.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Recommendations */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-900">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Security Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-900">Review Public Documents</h4>
                      <p className="text-sm text-yellow-800">
                        {securityData.find(s => s.classification === 'PUBLIC')?.count || 0} documents are marked as public. 
                        Ensure sensitive information is not exposed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-900">Confidential Documents Access</h4>
                      <p className="text-sm text-yellow-800">
                        {securityData.find(s => s.classification === 'CONFIDENTIAL')?.count || 0} confidential documents require proper access controls.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-900">Archive Old Documents</h4>
                      <p className="text-sm text-yellow-800">
                        Consider archiving documents older than 2 years to optimize storage and performance.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploads</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Score</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userActivityData.map((user, index) => {
                        const activityScore = user.uploads + user.views + user.downloads + user.shares
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={index < 3 ? "default" : "outline"}>#{index + 1}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.user}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.uploads}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.views}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.downloads}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.shares}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-gradient-to-r from-saywhat-orange to-orange-600 text-white">
                                {activityScore}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* User Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Activity Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={userActivityData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="user" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="uploads" fill={CHART_COLORS.primary} name="Uploads" />
                    <Bar dataKey="views" fill={CHART_COLORS.secondary} name="Views" />
                    <Bar dataKey="downloads" fill={CHART_COLORS.success} name="Downloads" />
                    <Bar dataKey="shares" fill={CHART_COLORS.purple} name="Shares" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Key Insights Section */}
        <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center text-cyan-900">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Repository Size</h4>
                <p className="text-2xl font-bold text-cyan-600">{metrics.totalSize}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {metrics.totalDocuments.toLocaleString()} total documents
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Most Active Category</h4>
                <p className="text-2xl font-bold text-cyan-600">
                  {categoryData[0]?.category || 'N/A'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {categoryData[0]?.count || 0} documents ({categoryData[0]?.percentage.toFixed(1) || 0}%)
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Engagement Rate</h4>
                <p className="text-2xl font-bold text-cyan-600">
                  {metrics.totalDocuments > 0 ? ((metrics.viewsThisMonth / metrics.totalDocuments) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Average views per document this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePage>
  )
}
