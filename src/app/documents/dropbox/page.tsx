"use client";

import { useState } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  GlobeAltIcon,
  FolderIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  UserIcon,
  CalendarIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

// Initialize with empty data - will be populated from API
const dropboxFiles: any[] = [];

const syncStatus = {
  connected: false,
  lastSync: "Never",
  totalFiles: 0,
  syncedFiles: 0,
  pendingFiles: 0,
  storageUsed: "0 GB",
  storageLimit: "16 GB",
  syncInProgress: false
};

export default function DropboxPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const metadata = {
    title: "Dropbox Integration",
    description: "Access and synchronize your Dropbox files with SIRTIS",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Document Management", href: "/documents" },
      { name: "Dropbox" }
    ]
  };

  const actions = (
    <>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Documents
      </button>
      <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
        Sync All Files
      </button>
    </>
  );

  const filteredFiles = dropboxFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return FolderIcon;
      case 'pdf':
      case 'document':
        return DocumentTextIcon;
      case 'video':
        return VideoCameraIcon;
      case 'image':
        return PhotoIcon;
      default:
        return DocumentIcon;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'folder':
        return 'text-blue-600 bg-blue-100';
      case 'pdf':
        return 'text-red-600 bg-red-100';
      case 'document':
        return 'text-green-600 bg-green-100';
      case 'video':
        return 'text-purple-600 bg-purple-100';
      case 'image':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <ModulePage metadata={metadata} actions={actions}>
      <div className="space-y-6">
        
        {/* Connection Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Dropbox Connection</h3>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                syncStatus.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {syncStatus.connected ? (
                  <>
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                    Disconnected
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{syncStatus.totalFiles}</div>
                <div className="text-sm text-gray-500">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{syncStatus.syncedFiles}</div>
                <div className="text-sm text-gray-500">Synced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{syncStatus.pendingFiles}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 mb-1">{syncStatus.storageUsed}</div>
                <div className="text-xs text-gray-500">of {syncStatus.storageLimit}</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium mb-1 ${syncStatus.syncInProgress ? 'text-blue-600' : 'text-gray-900'}`}>
                  {syncStatus.syncInProgress ? 'Syncing...' : 'Up to date'}
                </div>
                <div className="text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 inline mr-1" />
                  {syncStatus.lastSync}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Browser */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h3 className="text-lg font-medium text-gray-900">Dropbox Files</h3>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="folder">Folders</option>
                  <option value="document">Documents</option>
                  <option value="pdf">PDFs</option>
                  <option value="video">Videos</option>
                  <option value="image">Images</option>
                </select>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getFileTypeColor(file.type)}`}>
                            <FileIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            {file.shared && (
                              <div className="text-xs text-blue-600">Shared</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getFileTypeColor(file.type)}`}>
                          {file.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {file.modified}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          file.synced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {file.synced ? (
                            <>
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Synced
                            </>
                          ) : (
                            <>
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Open in Dropbox"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Download"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                          {!file.synced && (
                            <button
                              className="text-orange-600 hover:text-orange-900"
                              title="Sync Now"
                            >
                              <CloudArrowUpIcon className="h-4 w-4" />
                            </button>
                          )}
                          {file.shared && (
                            <ShareIcon className="h-4 w-4 text-gray-400" title="Shared File" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Force Sync
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                Open Dropbox
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <ShareIcon className="h-5 w-5 mr-2" />
                Manage Sharing
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <LinkIcon className="h-5 w-5 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Storage Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Storage Overview</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Storage Used</span>
                <span>{syncStatus.storageUsed} of {syncStatus.storageLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(parseFloat(syncStatus.storageUsed) / parseFloat(syncStatus.storageLimit)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">Documents</div>
                <div className="text-sm text-gray-500">2.3 GB</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-600">Media</div>
                <div className="text-sm text-gray-500">4.8 GB</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">Other</div>
                <div className="text-sm text-gray-500">1.6 GB</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ModulePage>
  );
}
