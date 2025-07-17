'use client';

import { useState } from 'react';
import { ModulePage } from '@/components/layout/enhanced-layout';
import { useSession } from 'next-auth/react';
import {
  ChartBarIcon,
  ChartPieIcon,
  DocumentTextIcon,
  EyeIcon,
  CloudArrowDownIcon,
  ShareIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalDocuments: number;
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  totalUsers: number;
  storageUsed: string;
  avgFileSize: string;
  searchQueries: number;
}

interface DocumentActivity {
  id: string;
  name: string;
  action: 'view' | 'download' | 'share' | 'upload' | 'edit';
  user: string;
  timestamp: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}

interface PopularDocument {
  id: string;
  name: string;
  views: number;
  downloads: number;
  shares: number;
  type: string;
  classification: string;
}

interface SecurityMetric {
  classification: string;
  count: number;
  percentage: number;
  color: string;
}

const mockAnalyticsData: AnalyticsData = {
  totalDocuments: 1847,
  totalViews: 12453,
  totalDownloads: 3261,
  totalShares: 891,
  totalUsers: 156,
  storageUsed: '47.3 GB',
  avgFileSize: '2.8 MB',
  searchQueries: 5647
};

const mockRecentActivity: DocumentActivity[] = [
  {
    id: '1',
    name: 'Annual Budget Report 2024.pdf',
    action: 'download',
    user: 'John Smith',
    timestamp: '2024-01-15 14:32',
    classification: 'CONFIDENTIAL'
  },
  {
    id: '2',
    name: 'Project Proposal.docx',
    action: 'view',
    user: 'Sarah Johnson',
    timestamp: '2024-01-15 14:28',
    classification: 'INTERNAL'
  },
  {
    id: '3',
    name: 'Training Manual v2.pdf',
    action: 'share',
    user: 'Mike Davis',
    timestamp: '2024-01-15 14:15',
    classification: 'PUBLIC'
  },
  {
    id: '4',
    name: 'Security Policy Update.docx',
    action: 'upload',
    user: 'Lisa Chen',
    timestamp: '2024-01-15 14:08',
    classification: 'RESTRICTED'
  },
  {
    id: '5',
    name: 'Monthly Report Q1.xlsx',
    action: 'edit',
    user: 'Tom Wilson',
    timestamp: '2024-01-15 13:45',
    classification: 'INTERNAL'
  }
];

const mockPopularDocuments: PopularDocument[] = [
  {
    id: '1',
    name: 'Employee Handbook 2024',
    views: 847,
    downloads: 234,
    shares: 67,
    type: 'PDF',
    classification: 'PUBLIC'
  },
  {
    id: '2',
    name: 'Project Guidelines',
    views: 623,
    downloads: 189,
    shares: 45,
    type: 'DOCX',
    classification: 'INTERNAL'
  },
  {
    id: '3',
    name: 'Annual Financial Report',
    views: 534,
    downloads: 156,
    shares: 23,
    type: 'PDF',
    classification: 'CONFIDENTIAL'
  },
  {
    id: '4',
    name: 'Training Materials',
    views: 467,
    downloads: 198,
    shares: 89,
    type: 'PPTX',
    classification: 'PUBLIC'
  },
  {
    id: '5',
    name: 'Security Protocols',
    views: 298,
    downloads: 67,
    shares: 12,
    type: 'DOCX',
    classification: 'RESTRICTED'
  }
];

const mockSecurityMetrics: SecurityMetric[] = [
  { classification: 'PUBLIC', count: 745, percentage: 40.3, color: 'bg-green-500' },
  { classification: 'INTERNAL', count: 612, percentage: 33.1, color: 'bg-blue-500' },
  { classification: 'CONFIDENTIAL', count: 356, percentage: 19.3, color: 'bg-yellow-500' },
  { classification: 'RESTRICTED', count: 134, percentage: 7.3, color: 'bg-red-500' }
];

export default function DocumentAnalytics() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  // Check permissions
  const hasAccess = session?.user?.permissions?.includes("documents.analytics") ||
                   session?.user?.permissions?.includes("documents.full_access");

  const metadata = {
    title: "Document Analytics",
    description: "Document access and usage analytics",
    breadcrumbs: [
      { name: 'Documents', href: '/documents' },
      { name: 'Analytics', href: '/documents/analytics' }
    ]
  };

  if (!hasAccess) {
    return (
      <ModulePage metadata={metadata}>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view document analytics.
          </p>
        </div>
      </ModulePage>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <EyeIcon className="h-4 w-4 text-blue-500" />;
      case 'download':
        return <CloudArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'share':
        return <ShareIcon className="h-4 w-4 text-purple-500" />;
      case 'upload':
        return <DocumentTextIcon className="h-4 w-4 text-orange-500" />;
      case 'edit':
        return <DocumentDuplicateIcon className="h-4 w-4 text-indigo-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getClassificationBadge = (classification: string) => {
    const colors = {
      PUBLIC: 'bg-green-100 text-green-800',
      INTERNAL: 'bg-blue-100 text-blue-800',
      CONFIDENTIAL: 'bg-yellow-100 text-yellow-800',
      RESTRICTED: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[classification as keyof typeof colors]}`}>
        <LockClosedIcon className="h-3 w-3 mr-1" />
        {classification}
      </span>
    );
  };

  return (
    <ModulePage metadata={metadata}>
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Usage Analytics</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Documents</p>
                <p className="text-3xl font-bold">{mockAnalyticsData.totalDocuments.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-blue-200 mr-1" />
                  <span className="text-sm text-blue-200">+12% from last month</span>
                </div>
              </div>
              <DocumentTextIcon className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Views</p>
                <p className="text-3xl font-bold">{mockAnalyticsData.totalViews.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-200 mr-1" />
                  <span className="text-sm text-green-200">+8% from last month</span>
                </div>
              </div>
              <EyeIcon className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Downloads</p>
                <p className="text-3xl font-bold">{mockAnalyticsData.totalDownloads.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-purple-200 mr-1" />
                  <span className="text-sm text-purple-200">-3% from last month</span>
                </div>
              </div>
              <CloudArrowDownIcon className="h-12 w-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Shares</p>
                <p className="text-3xl font-bold">{mockAnalyticsData.totalShares.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-orange-200 mr-1" />
                  <span className="text-sm text-orange-200">+15% from last month</span>
                </div>
              </div>
              <ShareIcon className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <UserIcon className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-xl font-semibold">{mockAnalyticsData.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <FolderIcon className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-xl font-semibold">{mockAnalyticsData.storageUsed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <DocumentDuplicateIcon className="h-8 w-8 text-pink-500" />
              <div>
                <p className="text-sm text-gray-600">Avg File Size</p>
                <p className="text-xl font-semibold">{mockAnalyticsData.avgFileSize}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <MagnifyingGlassIcon className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Search Queries</p>
                <p className="text-xl font-semibold">{mockAnalyticsData.searchQueries.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Classification Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Classification Distribution</h3>
            <div className="space-y-4">
              {mockSecurityMetrics.map((metric) => (
                <div key={metric.classification} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${metric.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{metric.classification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{metric.count}</span>
                    <span className="text-sm text-gray-500">({metric.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Visual Bar Chart */}
            <div className="mt-6 space-y-2">
              {mockSecurityMetrics.map((metric) => (
                <div key={metric.classification} className="flex items-center gap-2">
                  <span className="text-xs w-20 text-gray-600">{metric.classification}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${metric.color}`}
                      style={{ width: `${metric.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-10">{metric.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Trends */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Activity Trends</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Activity trend chart would be displayed here</p>
                <p className="text-sm text-gray-400">Integration with charting library required</p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Documents */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Most Popular Documents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classification
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockPopularDocuments.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500">{doc.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <EyeIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">{doc.views.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CloudArrowDownIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-900">{doc.downloads.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShareIcon className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900">{doc.shares.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getClassificationBadge(doc.classification)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Document Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{activity.user}</span>
                      <span className="text-sm text-gray-500">{activity.action}d</span>
                      <span className="font-medium text-gray-900 truncate">{activity.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3" />
                        {activity.timestamp}
                      </div>
                      {getClassificationBadge(activity.classification)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                <span className="font-medium text-gray-900">Trending Documents</span>
              </div>
              <p className="text-sm text-gray-600">
                "Employee Handbook 2024" has seen 47% increase in views this week, likely due to recent policy updates.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-gray-900">Security Alert</span>
              </div>
              <p className="text-sm text-gray-600">
                3 RESTRICTED documents have been accessed by users without proper clearance this week.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <ChartPieIcon className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-gray-900">Usage Pattern</span>
              </div>
              <p className="text-sm text-gray-600">
                Peak document access occurs between 9-11 AM and 2-4 PM on weekdays.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <ArrowPathIcon className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-gray-900">Optimization</span>
              </div>
              <p className="text-sm text-gray-600">
                Consider archiving 23 documents that haven't been accessed in over 6 months.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
