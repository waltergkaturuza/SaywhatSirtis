'use client';

import { useState } from 'react';
import ModulePage from '@/components/layout/main-layout';
import { useSession } from 'next-auth/react';
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  FolderIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  ArrowLeftIcon,
  CloudIcon,
  ServerIcon,
  LockClosedIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface OneDriveFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  modifiedBy: string;
  path: string;
  fileType?: string;
  downloadUrl?: string;
  isShared: boolean;
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error';
  driveType: 'personal' | 'business';
  permissions: string[];
}

const mockOneDriveFiles: OneDriveFile[] = [
  {
    id: '1',
    name: 'Quarterly Reports',
    type: 'folder',
    modified: '2024-01-15',
    modifiedBy: 'John Smith',
    path: '/Business/Reports',
    fileType: 'folder',
    isShared: true,
    syncStatus: 'synced',
    driveType: 'business',
    permissions: ['read', 'write', 'share']
  },
  {
    id: '2',
    name: 'Personal Documents',
    type: 'folder',
    modified: '2024-01-14',
    modifiedBy: 'Current User',
    path: '/Personal',
    fileType: 'folder',
    isShared: false,
    syncStatus: 'synced',
    driveType: 'personal',
    permissions: ['read', 'write', 'delete']
  },
  {
    id: '3',
    name: 'Project Presentation.pptx',
    type: 'file',
    size: '4.2 MB',
    modified: '2024-01-13',
    modifiedBy: 'Sarah Johnson',
    path: '/Business/Presentations',
    fileType: 'pptx',
    downloadUrl: '#',
    isShared: true,
    syncStatus: 'syncing',
    driveType: 'business',
    permissions: ['read', 'edit']
  },
  {
    id: '4',
    name: 'Budget Spreadsheet.xlsx',
    type: 'file',
    size: '2.8 MB',
    modified: '2024-01-12',
    modifiedBy: 'Mike Davis',
    path: '/Business/Finance',
    fileType: 'xlsx',
    downloadUrl: '#',
    isShared: false,
    syncStatus: 'synced',
    driveType: 'business',
    permissions: ['read', 'write']
  },
  {
    id: '5',
    name: 'Family Photos',
    type: 'folder',
    modified: '2024-01-11',
    modifiedBy: 'Current User',
    path: '/Personal/Photos',
    fileType: 'folder',
    isShared: false,
    syncStatus: 'pending',
    driveType: 'personal',
    permissions: ['read', 'write', 'delete']
  },
  {
    id: '6',
    name: 'Contract Template.docx',
    type: 'file',
    size: '1.5 MB',
    modified: '2024-01-10',
    modifiedBy: 'Lisa Chen',
    path: '/Business/Templates',
    fileType: 'docx',
    downloadUrl: '#',
    isShared: true,
    syncStatus: 'error',
    driveType: 'business',
    permissions: ['read']
  }
];

const driveFilters = [
  { label: 'All Drives', value: 'all' },
  { label: 'OneDrive Personal', value: 'personal' },
  { label: 'OneDrive for Business', value: 'business' }
];

export default function OneDriveIntegration() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrive, setSelectedDrive] = useState('all');
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [syncFilter, setSyncFilter] = useState<'all' | 'synced' | 'syncing' | 'pending' | 'error'>('all');

  const filteredFiles = mockOneDriveFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDrive = selectedDrive === 'all' || file.driveType === selectedDrive;
    const matchesSync = syncFilter === 'all' || file.syncStatus === syncFilter;
    return matchesSearch && matchesDrive && matchesSync;
  });

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pptx':
        return <DocumentTextIcon className="h-5 w-5 text-orange-500" />;
      case 'docx':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'xlsx':
        return <DocumentTextIcon className="h-5 w-5 text-green-500" />;
      case 'folder':
        return <FolderIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CloudIcon className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <ArrowPathIcon className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <CloudIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <CloudIcon className="h-4 w-4 text-red-500" />;
      default:
        return <CloudIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDriveIcon = (driveType: string) => {
    return driveType === 'business' ? 
      <ServerIcon className="h-4 w-4 text-blue-500" /> : 
      <CloudIcon className="h-4 w-4 text-purple-500" />;
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const getStorageStats = () => {
    const personalFiles = mockOneDriveFiles.filter(f => f.driveType === 'personal').length;
    const businessFiles = mockOneDriveFiles.filter(f => f.driveType === 'business').length;
    const sharedFiles = mockOneDriveFiles.filter(f => f.isShared).length;
    const syncingFiles = mockOneDriveFiles.filter(f => f.syncStatus === 'syncing').length;
    
    return { personalFiles, businessFiles, sharedFiles, syncingFiles };
  };

  const stats = getStorageStats();

  const breadcrumbItems = [
    { label: 'Documents', href: '/documents' },
    { label: 'Microsoft 365', href: '/documents/microsoft365' },
    { label: 'OneDrive Integration', href: '/documents/onedrive' }
  ];

  return (
    <ModulePage
      title="OneDrive Integration"
      requiredPermission="documents.onedrive"
      breadcrumbs={breadcrumbItems}
    >
      <div className="space-y-6">
        {/* Storage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Personal Files</p>
                <p className="text-2xl font-bold">{stats.personalFiles}</p>
              </div>
              <CloudIcon className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Business Files</p>
                <p className="text-2xl font-bold">{stats.businessFiles}</p>
              </div>
              <ServerIcon className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Shared Files</p>
                <p className="text-2xl font-bold">{stats.sharedFiles}</p>
              </div>
              <ShareIcon className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Syncing</p>
                <p className="text-2xl font-bold">{stats.syncingFiles}</p>
              </div>
              <ArrowPathIcon className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.history.back()}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <div className="text-sm text-gray-600">
              Current Path: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{currentPath}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <CloudArrowUpIcon className="h-4 w-4" />
              Upload to OneDrive
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <ArrowPathIcon className="h-4 w-4" />
              Force Sync
            </button>
            <button 
              className={`p-2 rounded-lg border ${viewMode === 'list' ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setViewMode('list')}
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
            <button 
              className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setViewMode('grid')}
            >
              <FolderIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search OneDrive files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {driveFilters.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>

          <select
            value={syncFilter}
            onChange={(e) => setSyncFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="synced">Synced</option>
            <option value="syncing">Syncing</option>
            <option value="pending">Pending</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700">
              {selectedFiles.length} file(s) selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                <CloudArrowDownIcon className="h-4 w-4" />
                Download
              </button>
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                <ShareIcon className="h-4 w-4" />
                Share
              </button>
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                <ArrowPathIcon className="h-4 w-4" />
                Sync
              </button>
              <button 
                onClick={() => setSelectedFiles([])}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* File List/Grid */}
        <div className="bg-white rounded-lg border border-gray-200">
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(filteredFiles.map(file => file.id));
                          } else {
                            setSelectedFiles([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drive
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sync Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleSelectFile(file.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.fileType)}
                          <div>
                            <div className="font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">{file.path}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getDriveIcon(file.driveType)}
                          <span className="text-sm text-gray-900 capitalize">{file.driveType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{file.size || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {file.modified}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <UserIcon className="h-3 w-3" />
                          {file.modifiedBy}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getSyncStatusIcon(file.syncStatus)}
                          <span className={`text-sm capitalize ${
                            file.syncStatus === 'synced' ? 'text-green-600' :
                            file.syncStatus === 'syncing' ? 'text-blue-600' :
                            file.syncStatus === 'pending' ? 'text-yellow-600' :
                            file.syncStatus === 'error' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {file.syncStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600" title="View">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {file.type === 'file' && (
                            <button className="p-1 text-gray-400 hover:text-green-600" title="Download">
                              <CloudArrowDownIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-1 text-gray-400 hover:text-purple-600" title="Share">
                            <ShareIcon className="h-4 w-4" />
                          </button>
                          {file.isShared && (
                            <LockClosedIcon className="h-4 w-4 text-blue-500" title="Shared" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedFiles.includes(file.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectFile(file.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.fileType)}
                      {getDriveIcon(file.driveType)}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleSelectFile(file.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 truncate mb-1">{file.name}</h3>
                  <p className="text-sm text-gray-500 mb-2 capitalize">{file.driveType} Drive</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{file.size || 'Folder'}</span>
                    <div className="flex items-center gap-1">
                      {getSyncStatusIcon(file.syncStatus)}
                      <span className="capitalize">{file.syncStatus}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{file.modified}</span>
                    <div className="flex gap-1">
                      {file.isShared && <div className="w-2 h-2 bg-blue-500 rounded-full" title="Shared"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
          <div>
            Showing {filteredFiles.length} of {mockOneDriveFiles.length} files
          </div>
          <div className="flex items-center gap-4">
            <span>Connected to OneDrive</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
