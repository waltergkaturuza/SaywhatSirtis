'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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

interface Analytics {
  totalDocuments: number;
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  storageUsed: number;
  avgViewsPerDoc: number;
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  securityDistribution: Array<{
    classification: string;
    count: number;
    color: string;
  }>;
  recentActivity: Array<{
    date: string;
    views: number;
    uploads: number;
    downloads: number;
  }>;
  topDocuments: Array<{
    name: string;
    views: number;
    downloads: number;
    category: string;
  }>;
}

export default function DocumentsAnalytics() {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, selectedCategory])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/documents/analytics?timeRange=${timeRange}&category=${selectedCategory}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
      // Set empty analytics for graceful fallback
      setAnalytics({
        totalDocuments: 0,
        totalViews: 0,
        totalDownloads: 0,
        totalShares: 0,
        storageUsed: 0,
        avgViewsPerDoc: 0,
        topCategories: [],
        securityDistribution: [
          { classification: 'PUBLIC', count: 0, color: 'bg-green-500' },
          { classification: 'CONFIDENTIAL', count: 0, color: 'bg-saywhat-orange' },
          { classification: 'SECRET', count: 0, color: 'bg-saywhat-red' },
          { classification: 'TOP_SECRET', count: 0, color: 'bg-red-800' }
        ],
        recentActivity: [],
        topDocuments: []
      })
    } finally {
      setLoading(false)
    }
  }

  // Check permissions
  const hasAccess = session?.user?.permissions?.includes("documents.view") ||
                   session?.user?.permissions?.includes("documents.full_access")

  if (!hasAccess) {
    return (
      <ModulePage
        metadata={{
          title: "Documents Analytics",
          description: "Access Denied",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Analytics" }
          ]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-saywhat-red" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-saywhat-grey">
            You don't have permission to view document analytics.
          </p>
        </div>
      </ModulePage>
    )
  }

  if (loading) {
    return (
      <ModulePage
        metadata={{
          title: "Documents Analytics",
          description: "Loading analytics...",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Analytics" }
          ]
        }}
      >
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
          <p className="mt-4 text-saywhat-grey">Loading analytics...</p>
        </div>
      </ModulePage>
    )
  }

  if (!analytics) {
    return (
      <ModulePage
        metadata={{
          title: "Documents Analytics",
          description: "Error loading analytics",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Analytics" }
          ]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-saywhat-red" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Analytics</h3>
          <p className="mt-1 text-sm text-saywhat-grey">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-orange-600"
          >
            Try Again
          </button>
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
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <EyeIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <ArrowDownTrayIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalDownloads.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <ShareIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.storageUsed} GB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Classification Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analytics.securityDistribution.map((item) => (
              <div key={item.classification} className="text-center">
                <div className={`${item.color} rounded-lg p-4 mb-2`}>
                  <LockClosedIcon className="h-8 w-8 text-white mx-auto" />
                </div>
                <p className="text-sm font-medium text-gray-900">{item.classification}</p>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        {analytics.topCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Document Categories</h3>
            <div className="space-y-4">
              {analytics.topCategories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FolderIcon className="h-5 w-5 text-saywhat-orange mr-3" />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{category.count} documents</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-saywhat-orange h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Documents */}
        {analytics.topDocuments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Documents</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topDocuments.map((doc, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-saywhat-orange mr-3" />
                          <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-saywhat-orange/10 text-saywhat-orange">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.downloads.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
