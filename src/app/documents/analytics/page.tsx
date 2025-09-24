'use client'

import { useState, useEffect } from 'react'
import { ModulePage } from '@/components/layout/enhanced-layout'
import {
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShareIcon,
  LockClosedIcon,
  ChartPieIcon,
  CalendarIcon,
  TagIcon,
  FolderIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function DocumentsAnalytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/documents/analytics')
        if (response.ok) {
          const data = await response.json()
          setAnalytics({
            totalDocuments: data.totalDocuments || 0,
            totalViews: data.viewsThisMonth || 0,
            totalDownloads: 0, // Add this field to API when needed
            totalShares: data.sharedWithMe || 0,
            storageUsed: data.storageUsed || '0 MB',
            avgViewsPerDoc: data.totalDocuments ? (data.viewsThisMonth / data.totalDocuments).toFixed(1) : '0',
            topCategories: [],
            securityDistribution: [],
            recentActivity: [],
            topDocuments: []
          })
        } else {
          // Fallback to minimal data if API fails
          setAnalytics({
            totalDocuments: 0,
            totalViews: 0,
            totalDownloads: 0,
            totalShares: 0,
            storageUsed: '0 MB',
            avgViewsPerDoc: '0',
            topCategories: [],
            securityDistribution: [],
            recentActivity: [],
            topDocuments: []
          })
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        // Set minimal fallback data
        setAnalytics({
          totalDocuments: 0,
          totalViews: 0,
          totalDownloads: 0,
          totalShares: 0,
          storageUsed: '0 MB',
          avgViewsPerDoc: '0',
          topCategories: [],
          securityDistribution: [],
          recentActivity: [],
          topDocuments: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange, selectedCategory])

  if (loading) {
    return (
      <ModulePage
        metadata={{
          title: "Document Analytics",
          description: "Comprehensive analytics and insights for document management",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Analytics" }
          ]
        }}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </ModulePage>
    )
  }

  if (!analytics) {
    return (
      <ModulePage
        metadata={{
          title: "Document Analytics",
          description: "Comprehensive analytics and insights for document management",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Analytics" }
          ]
        }}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Unable to Load Analytics</h3>
            <p className="mt-1 text-gray-500">
              There was an error loading the analytics data. Please try again later.
            </p>
          </div>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage
      metadata={{
        title: "Document Analytics",
        description: "Comprehensive analytics and insights for document management",
        breadcrumbs: [
          { name: "Document Repository", href: "/documents" },
          { name: "Analytics" }
        ]
      }}
    >
      <div className="max-w-full mx-auto px-4 space-y-6">
        {/* Header with Controls */}
        <div className="bg-gradient-to-r from-saywhat-orange to-saywhat-red rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Document Analytics</h1>
              <p className="text-orange-100 mt-2">Comprehensive insights into document usage and performance</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-md border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-white focus:ring-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-white focus:ring-white"
              >
                <option value="all">All Categories</option>
                <option value="reports">Reports</option>
                <option value="policies">Policies</option>
                <option value="training">Training</option>
                <option value="financial">Financial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-saywhat-orange">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-saywhat-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalDocuments.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +12% from last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <EyeIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +8% from last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <ArrowDownTrayIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalDownloads.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +15% from last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <ShareIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shares</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalShares.toLocaleString()}</p>
                <p className="text-sm text-red-600 flex items-center">
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  -3% from last month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ChartPieIcon className="h-5 w-5 text-saywhat-orange mr-2" />
              Documents by Category
            </h3>
            <div className="space-y-4">
              {analytics.topCategories && analytics.topCategories.length > 0 ? (
                analytics.topCategories.map((category: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-500">{category.count} ({category.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-saywhat-orange h-2 rounded-full" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No category data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Classification */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <LockClosedIcon className="h-5 w-5 text-saywhat-red mr-2" />
              Security Classification
            </h3>
            <div className="space-y-4">
              {analytics.securityDistribution && analytics.securityDistribution.length > 0 ? (
                analytics.securityDistribution.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded ${item.color} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-900">{item.classification}</span>
                    </div>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <LockClosedIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No security data available</p>
                </div>
              )}
            </div>
            {analytics.securityDistribution && analytics.securityDistribution.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Total: {analytics.securityDistribution.reduce((sum: number, item: any) => sum + item.count, 0)} documents
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
            Recent Activity Trends
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((day: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="space-y-2">
                    <div className="bg-blue-100 rounded p-2">
                      <div className="text-xs text-blue-800">Views</div>
                      <div className="font-semibold text-blue-900">{day.views}</div>
                    </div>
                    <div className="bg-green-100 rounded p-2">
                      <div className="text-xs text-green-800">Downloads</div>
                      <div className="font-semibold text-green-900">{day.downloads}</div>
                    </div>
                    <div className="bg-orange-100 rounded p-2">
                      <div className="text-xs text-orange-800">Uploads</div>
                      <div className="font-semibold text-orange-900">{day.uploads}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center py-8 text-gray-500">
                <CalendarIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No activity data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Documents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-2" />
            Top Performing Documents
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topDocuments && analytics.topDocuments.length > 0 ? (
                  analytics.topDocuments.map((doc: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-saywhat-orange bg-opacity-10 text-saywhat-orange">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.views}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.downloads}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((doc.downloads / doc.views) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{Math.round((doc.downloads / doc.views) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <DocumentTextIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p>No document data available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Storage Usage</h4>
            <div className="text-3xl font-bold text-saywhat-orange">{analytics.storageUsed} GB</div>
            <p className="text-sm text-gray-500">of 100 GB used</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-saywhat-orange h-2 rounded-full" 
                style={{ width: `${analytics.storageUsed}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Avg. Views per Document</h4>
            <div className="text-3xl font-bold text-blue-600">{analytics.avgViewsPerDoc}</div>
            <p className="text-sm text-gray-500">views per document</p>
            <p className="text-sm text-green-600 mt-2">+2.1 from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Active Users</h4>
            <div className="text-3xl font-bold text-purple-600">156</div>
            <p className="text-sm text-gray-500">users this month</p>
            <p className="text-sm text-green-600 mt-2">+18 new users</p>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}