"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import { 
  DocumentIcon,
  DocumentTextIcon,
  FolderIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  HeartIcon,
  ChartBarIcon,
  StarIcon,
  BookmarkIcon,
  PlusIcon,
  CloudIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

// Security classifications - Updated for internal/confidential focus
const securityClassifications = {
  "PUBLIC": { 
    count: 156, 
    color: "text-green-600 bg-green-100", 
    icon: ShareIcon,
    description: "Accessible to all employees within the organization" 
  },
  "CONFIDENTIAL": { 
    count: 89, 
    color: "text-saywhat-orange bg-orange-100", 
    icon: LockClosedIcon,
    description: "Sensitive information requiring authorized access" 
  },
  "SECRET": { 
    count: 34, 
    color: "text-saywhat-red bg-red-100", 
    icon: ShieldCheckIcon,
    description: "Highly sensitive information - secret level" 
  },
  "TOP_SECRET": { 
    count: 12, 
    color: "text-red-800 bg-red-200", 
    icon: ShieldCheckIcon,
    description: "Highly sensitive information - top secret level" 
  }
};

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  // Check permissions
  const hasAccess = session?.user?.permissions?.includes("documents.view") ||
                   session?.user?.permissions?.includes("documents.full_access");

  if (!hasAccess) {
    return (
      <ModulePage
        metadata={{
          title: "Document Repository",
          description: "Access Denied",
          breadcrumbs: [{ name: "Document Repository" }]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access the document repository.
          </p>
        </div>
      </ModulePage>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload": return CloudArrowUpIcon;
      case "download": return ArrowDownTrayIcon;
      case "share": return ShareIcon;
      case "edit": return TagIcon;
      case "view": return EyeIcon;
      default: return DocumentIcon;
    }
  };

  const getClassificationConfig = (classification: string) => {
    return securityClassifications[classification as keyof typeof securityClassifications] || 
           { color: "text-gray-600 bg-gray-100", icon: DocumentIcon };
  };

  return (
    <ModulePage
      metadata={{
        title: "Document Repository",
        description: "AI-powered document management with advanced security classifications",
        breadcrumbs: [{ name: "Document Repository" }]
      }}
    >
      <div className="max-w-full mx-auto px-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Documents
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                                            0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">+                      0</span>
                <span className="text-gray-500"> this month</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Storage Used
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0 GB
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: '0%' }}
                  ></div>
                </div>
                <span className="text-gray-500">0% of quota</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EyeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Views This Month
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-blue-600 font-medium">0</span>
                <span className="text-gray-500"> downloads</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <SparklesIcon className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      AI Quality Score
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-purple-600 font-medium">0%</span>
                <span className="text-gray-500"> readability</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Classification Overview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Security Classification Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(securityClassifications).map(([level, config]) => {
                const IconComponent = config.icon;
                return (
                  <div key={level} className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${config.color} mb-3`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 mb-1">
                      {config.count}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {level}
                    </div>
                    <div className="text-xs text-gray-500">
                      {config.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload some documents to see activity here.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analytics Insights */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                AI Analytics Insights
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Document Sentiment</span>
                    <span className="text-sm text-gray-900">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Overall positive sentiment in documents</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Readability Score</span>
                    <span className="text-sm text-gray-900">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Average readability across all documents</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <HeartIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">78%</div>
                    <div className="text-xs text-gray-500">Positive Sentiment</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <ChartBarIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">82%</div>
                    <div className="text-xs text-gray-500">Readability</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <StarIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">91%</div>
                    <div className="text-xs text-gray-500">Quality Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <button
                onClick={() => window.location.href = '/documents/upload'}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-orange-600 transition-colors"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Upload Document
              </button>
              
              <button
                onClick={() => window.location.href = '/documents/ai-search'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                AI Search
              </button>
              
              <button
                onClick={() => window.location.href = '/documents/ai-assistant'}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                AI Assistant
              </button>
              
              <button
                onClick={() => window.location.href = '/documents/library'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FolderIcon className="h-5 w-5 mr-2" />
                Browse Library
              </button>
              
              <button
                onClick={() => window.location.href = '/documents/analytics'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ChartPieIcon className="h-5 w-5 mr-2" />
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Cloud Integrations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Cloud Integrations</h3>
            <p className="text-sm text-gray-500 mt-1">Connect and sync with your cloud storage providers</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Microsoft 365 */}
              <button
                onClick={() => window.location.href = '/documents/microsoft365'}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <CloudIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Microsoft 365</h4>
                  <p className="text-sm text-gray-500">Access Office 365 documents</p>
                </div>
              </button>

              {/* SharePoint */}
              <button
                onClick={() => window.location.href = '/documents/sharepoint'}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <FolderIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">SharePoint</h4>
                  <p className="text-sm text-gray-500">SharePoint document libraries</p>
                </div>
              </button>

              {/* OneDrive */}
              <button
                onClick={() => window.location.href = '/documents/onedrive'}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center mr-3">
                  <CloudArrowUpIcon className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">OneDrive</h4>
                  <p className="text-sm text-gray-500">Personal cloud storage</p>
                </div>
              </button>

              {/* Teams */}
              <button
                onClick={() => window.location.href = '/documents/teams'}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Microsoft Teams</h4>
                  <p className="text-sm text-gray-500">Team collaboration files</p>
                </div>
              </button>

              {/* Google Drive */}
              <button
                onClick={() => window.location.href = '/documents/googledrive'}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <GlobeAltIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Google Drive</h4>
                  <p className="text-sm text-gray-500">Google workspace files</p>
                </div>
              </button>

              {/* Dropbox */}
              <button
                onClick={() => window.location.href = '/documents/dropbox'}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Dropbox</h4>
                  <p className="text-sm text-gray-500">Dropbox cloud storage</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Usage Statistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  0
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Document Views</div>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  +12% from last month
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  0
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Downloads</div>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  +8% from last month
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  0
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Shares</div>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  +15% from last month
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}

// Redirect users to enhanced repository on page load
if (typeof window !== 'undefined') {
  window.location.href = '/documents/enhanced-repository';
}
