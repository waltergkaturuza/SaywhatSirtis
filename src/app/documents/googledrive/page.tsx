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
  CalendarIcon
} from "@heroicons/react/24/outline";

// Mock Google Drive data
const googleDriveFiles = [
  {
    id: "1",
    name: "Project Documentation.docx",
    type: "document",
    size: "2.5 MB",
    modified: "2024-01-15",
    owner: "john.doe@saywhat.org",
    shared: true,
    url: "https://drive.google.com/file/d/1abc..."
  },
  {
    id: "2",
    name: "Budget Spreadsheet Q1.xlsx",
    type: "spreadsheet",
    size: "1.8 MB",
    modified: "2024-01-14",
    owner: "sarah.johnson@saywhat.org",
    shared: false,
    url: "https://drive.google.com/file/d/2def..."
  },
  {
    id: "3",
    name: "Team Photos",
    type: "folder",
    size: "45 files",
    modified: "2024-01-13",
    owner: "team@saywhat.org",
    shared: true,
    url: "https://drive.google.com/drive/folders/3ghi..."
  },
  {
    id: "4",
    name: "Presentation Template.pptx",
    type: "presentation",
    size: "12.3 MB",
    modified: "2024-01-12",
    owner: "admin@saywhat.org",
    shared: true,
    url: "https://drive.google.com/file/d/4jkl..."
  }
];

const syncStatus = {
  connected: true,
  lastSync: "2024-01-15 14:30",
  totalFiles: 156,
  syncedFiles: 148,
  pendingFiles: 8,
  storageUsed: "2.3 GB",
  storageLimit: "15 GB"
};

export default function GoogleDrivePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const metadata = {
    title: "Google Drive Integration",
    description: "Access and manage your Google Drive files from SIRTIS",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Document Management", href: "/documents" },
      { name: "Google Drive" }
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
      <button className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700">
        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
        Sync Now
      </button>
    </>
  );

  const filteredFiles = googleDriveFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return FolderIcon;
      case 'document':
      case 'spreadsheet':
      case 'presentation':
        return DocumentIcon;
      default:
        return DocumentIcon;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'folder':
        return 'text-blue-600 bg-blue-100';
      case 'document':
        return 'text-green-600 bg-green-100';
      case 'spreadsheet':
        return 'text-emerald-600 bg-emerald-100';
      case 'presentation':
        return 'text-orange-600 bg-orange-100';
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
              <h3 className="text-lg font-medium text-gray-900">Connection Status</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{syncStatus.totalFiles}</div>
                <div className="text-sm text-gray-500">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{syncStatus.syncedFiles}</div>
                <div className="text-sm text-gray-500">Synced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{syncStatus.pendingFiles}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 mb-1">{syncStatus.storageUsed} / {syncStatus.storageLimit}</div>
                <div className="text-sm text-gray-500">Storage Used</div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              Last synced: {syncStatus.lastSync}
            </div>
          </div>
        </div>

        {/* File Browser */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Google Drive Files</h3>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
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
                    Owner
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {file.owner}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="text-green-600 hover:text-green-900"
                            title="Open in Google Drive"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="Download"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                          {file.shared && (
                            <ShareIcon className="h-4 w-4 text-gray-400" title="Shared" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Force Sync
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                Open Google Drive
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <LinkIcon className="h-5 w-5 mr-2" />
                Manage Integration
              </button>
            </div>
          </div>
        </div>

      </div>
    </ModulePage>
  );
}
