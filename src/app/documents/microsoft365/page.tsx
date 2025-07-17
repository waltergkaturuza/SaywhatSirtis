"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import { 
  CloudArrowUpIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ShareIcon,
  DocumentIcon,
  UserGroupIcon,
  CalendarIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CogIcon,
  KeyIcon,
  ShieldCheckIcon,
  ClockIcon,
  TagIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

// Microsoft 365 Services
const m365Services = [
  {
    id: "sharepoint",
    name: "SharePoint Online",
    description: "Document libraries, lists, and team sites",
    icon: FolderIcon,
    color: "text-blue-600 bg-blue-100",
    status: "connected",
    lastSync: "2024-01-15T10:30:00Z",
    documentCount: 1247,
    sites: [
      { name: "Finance Team Site", url: "/sites/finance", documents: 342 },
      { name: "HR Portal", url: "/sites/hr", documents: 156 },
      { name: "Project Documents", url: "/sites/projects", documents: 589 },
      { name: "Executive Suite", url: "/sites/executive", documents: 160 }
    ]
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Team channels and file repositories",
    icon: ChatBubbleLeftRightIcon,
    color: "text-purple-600 bg-purple-100",
    status: "connected",
    lastSync: "2024-01-15T09:45:00Z",
    documentCount: 892,
    teams: [
      { name: "Executive Team", files: 234 },
      { name: "Finance Department", files: 167 },
      { name: "Project Alpha", files: 298 },
      { name: "HR & Admin", files: 193 }
    ]
  },
  {
    id: "onedrive",
    name: "OneDrive for Business",
    description: "Personal and shared OneDrive files",
    icon: CloudArrowUpIcon,
    color: "text-green-600 bg-green-100",
    status: "connected",
    lastSync: "2024-01-15T11:15:00Z",
    documentCount: 567,
    users: [
      { name: "Sarah Johnson", files: 145 },
      { name: "Michael Chen", files: 123 },
      { name: "Emily Rodriguez", files: 167 },
      { name: "David Wilson", files: 132 }
    ]
  }
];

// Recent sync activities
const recentActivities = [
  {
    id: 1,
    service: "sharepoint",
    action: "Document synced",
    document: "Q4 Financial Report.xlsx",
    user: "Finance Team Site",
    timestamp: "5 minutes ago",
    status: "success"
  },
  {
    id: 2,
    service: "teams",
    action: "New file detected",
    document: "Project Alpha - Status Update.docx",
    user: "Project Alpha Team",
    timestamp: "12 minutes ago",
    status: "success"
  },
  {
    id: 3,
    service: "onedrive",
    action: "File updated",
    document: "Employee Handbook v2.1.pdf",
    user: "HR Department",
    timestamp: "1 hour ago",
    status: "success"
  },
  {
    id: 4,
    service: "sharepoint",
    action: "Sync failed",
    document: "Board Meeting Minutes.docx",
    user: "Executive Suite",
    timestamp: "2 hours ago",
    status: "error"
  }
];

// Integration settings
const integrationSettings = {
  autoSync: true,
  syncInterval: 15, // minutes
  includeMetadata: true,
  preservePermissions: true,
  syncDeletedFiles: false,
  enableWebhooks: true,
  compressionEnabled: true,
  encryptionEnabled: true
};

export default function Microsoft365IntegrationPage() {
  const { data: session } = useSession();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Check permissions
  const hasAccess = session?.user?.permissions?.includes("documents.microsoft365") ||
                   session?.user?.permissions?.includes("documents.full_access");

  if (!hasAccess) {
    return (
      <ModulePage
        metadata={{
          title: "Microsoft 365 Integration",
          description: "Access Denied",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Microsoft 365 Integration" }
          ]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access Microsoft 365 integration.
          </p>
        </div>
      </ModulePage>
    );
  }

  const handleManualSync = async (serviceId?: string) => {
    setSyncStatus("syncing");
    
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }, 2000);
  };

  const getServiceIcon = (serviceId: string) => {
    const service = m365Services.find(s => s.id === serviceId);
    return service?.icon || DocumentIcon;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-600 bg-green-100";
      case "error": return "text-red-600 bg-red-100";
      case "connected": return "text-green-600 bg-green-100";
      case "disconnected": return "text-gray-600 bg-gray-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <ModulePage
      metadata={{
        title: "Microsoft 365 Integration",
        description: "Connect and sync with SharePoint, Teams, and OneDrive",
        breadcrumbs: [
          { name: "Document Repository", href: "/documents" },
          { name: "Microsoft 365 Integration" }
        ]
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Connection Status Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Microsoft 365 Services</h2>
              <p className="text-sm text-gray-500">Manage connections to SharePoint, Teams, and OneDrive</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <CogIcon className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button
                onClick={() => handleManualSync()}
                disabled={syncStatus === "syncing"}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {syncStatus === "syncing" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Sync All
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {m365Services.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <div
                  key={service.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${service.color}`}>
                      <ServiceIcon className="h-6 w-6" />
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Connected
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Documents:</span>
                      <span className="font-medium">{service.documentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sync:</span>
                      <span>{formatTimestamp(service.lastSync)}</span>
                    </div>
                  </div>

                  {selectedService === service.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-2">
                        {service.id === "sharepoint" && service.sites?.map(site => (
                          <div key={site.name} className="flex justify-between text-sm">
                            <span className="text-gray-600">{site.name}</span>
                            <span className="font-medium">{site.documents} docs</span>
                          </div>
                        ))}
                        {service.id === "teams" && service.teams?.map(team => (
                          <div key={team.name} className="flex justify-between text-sm">
                            <span className="text-gray-600">{team.name}</span>
                            <span className="font-medium">{team.files} files</span>
                          </div>
                        ))}
                        {service.id === "onedrive" && service.users?.map(user => (
                          <div key={user.name} className="flex justify-between text-sm">
                            <span className="text-gray-600">{user.name}</span>
                            <span className="font-medium">{user.files} files</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManualSync(service.id);
                          }}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <ArrowPathIcon className="h-3 w-3 mr-1" />
                          Sync
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-3 w-3 mr-1" />
                          Browse
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Settings */}
        {showSettings && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Sync Configuration</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Auto Sync</span>
                      <input
                        type="checkbox"
                        checked={integrationSettings.autoSync}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Sync Interval (minutes)</label>
                      <input
                        type="number"
                        value={integrationSettings.syncInterval}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Include Metadata</span>
                      <input
                        type="checkbox"
                        checked={integrationSettings.includeMetadata}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Preserve Permissions</span>
                      <input
                        type="checkbox"
                        checked={integrationSettings.preservePermissions}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Security & Performance</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Enable Webhooks</span>
                      <input
                        type="checkbox"
                        checked={integrationSettings.enableWebhooks}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Compression</span>
                      <input
                        type="checkbox"
                        checked={integrationSettings.compressionEnabled}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Encryption</span>
                      <input
                        type="checkbox"
                        checked={integrationSettings.encryptionEnabled}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Sync Deleted Files</span>
                      <input
                        type="checkbox"
                        checked={integrationSettings.syncDeletedFiles}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Sync Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Sync Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const ServiceIcon = getServiceIcon(activity.service);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <ServiceIcon className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}</span>: {activity.document}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-gray-500">{activity.user}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status === "success" ? (
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          )}
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => window.location.href = '/documents/microsoft365/sharepoint'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FolderIcon className="h-5 w-5 mr-2" />
                Browse SharePoint
              </button>
              
              <button
                onClick={() => window.location.href = '/documents/microsoft365/teams'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Teams Files
              </button>
              
              <button
                onClick={() => window.location.href = '/documents/microsoft365/onedrive'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                OneDrive Access
              </button>
              
              <button
                onClick={() => window.location.href = '/documents/microsoft365/sync'}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Manual Sync
              </button>
            </div>
          </div>
        </div>

        {/* Integration Statistics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Integration Statistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {m365Services.reduce((total, service) => total + service.documentCount, 0).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Total Documents Synced</div>
                <div className="text-xs text-gray-500">Across all M365 services</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {m365Services.length}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Connected Services</div>
                <div className="text-xs text-gray-500">SharePoint, Teams, OneDrive</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  15 min
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Sync Interval</div>
                <div className="text-xs text-gray-500">Automatic background sync</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
