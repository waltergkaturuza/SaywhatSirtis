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
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface TeamsDocument {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  modifiedBy: string;
  team: string;
  channel: string;
  path: string;
  fileType?: string;
  downloadUrl?: string;
  isShared: boolean;
  lastAccessed?: string;
}

const mockTeamsData: TeamsDocument[] = [
  {
    id: '1',
    name: 'Project Roadmap 2024.pptx',
    type: 'file',
    size: '3.2 MB',
    modified: '2024-01-15',
    modifiedBy: 'John Smith',
    team: 'Product Development',
    channel: 'General',
    path: '/General/Project Files',
    fileType: 'pptx',
    downloadUrl: '#',
    isShared: true,
    lastAccessed: '2024-01-15'
  },
  {
    id: '2',
    name: 'Meeting Notes',
    type: 'folder',
    modified: '2024-01-14',
    modifiedBy: 'Sarah Johnson',
    team: 'Marketing Team',
    channel: 'Planning',
    path: '/Planning/Notes',
    fileType: 'folder',
    isShared: false
  },
  {
    id: '3',
    name: 'Budget Analysis Q1.xlsx',
    type: 'file',
    size: '1.8 MB',
    modified: '2024-01-13',
    modifiedBy: 'Mike Davis',
    team: 'Finance',
    channel: 'Reports',
    path: '/Reports/Budget',
    fileType: 'xlsx',
    downloadUrl: '#',
    isShared: true,
    lastAccessed: '2024-01-14'
  },
  {
    id: '4',
    name: 'Training Materials.docx',
    type: 'file',
    size: '2.1 MB',
    modified: '2024-01-12',
    modifiedBy: 'Lisa Chen',
    team: 'Human Resources',
    channel: 'Training',
    path: '/Training/Resources',
    fileType: 'docx',
    downloadUrl: '#',
    isShared: false,
    lastAccessed: '2024-01-13'
  },
  {
    id: '5',
    name: 'Campaign Assets',
    type: 'folder',
    modified: '2024-01-11',
    modifiedBy: 'Tom Wilson',
    team: 'Marketing Team',
    channel: 'Creative',
    path: '/Creative/Assets',
    fileType: 'folder',
    isShared: true
  }
];

const teamsChannels = [
  { team: 'All Teams', channel: 'All Channels', value: 'all' },
  { team: 'Product Development', channel: 'General', value: 'product-general' },
  { team: 'Product Development', channel: 'Development', value: 'product-dev' },
  { team: 'Marketing Team', channel: 'Planning', value: 'marketing-planning' },
  { team: 'Marketing Team', channel: 'Creative', value: 'marketing-creative' },
  { team: 'Finance', channel: 'Reports', value: 'finance-reports' },
  { team: 'Human Resources', channel: 'Training', value: 'hr-training' }
];

export default function TeamsIntegration() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterType, setFilterType] = useState<'all' | 'shared' | 'recent'>('all');

  const filteredDocs = mockTeamsData.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.channel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = selectedChannel === 'all' || 
                          `${doc.team.toLowerCase().replace(/\s+/g, '-')}-${doc.channel.toLowerCase()}` === selectedChannel;
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'shared' && doc.isShared) ||
                         (filterType === 'recent' && doc.lastAccessed);
    return matchesSearch && matchesChannel && matchesFilter;
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

  const handleSelectDoc = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const breadcrumbItems = [
    { label: 'Documents', href: '/documents' },
    { label: 'Microsoft 365', href: '/documents/microsoft365' },
    { label: 'Teams Integration', href: '/documents/teams' }
  ];

  return (
    <ModulePage
      title="Microsoft Teams Integration"
      requiredPermission="documents.teams"
      breadcrumbs={breadcrumbItems}
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Teams</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active Channels</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Shared Files</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <ShareIcon className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Recent Activity</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <DocumentDuplicateIcon className="h-8 w-8 text-orange-200" />
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
              Upload to Teams
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
              placeholder="Search teams, channels, and files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {teamsChannels.map((item, index) => (
              <option key={index} value={item.value}>
                {item.team} - {item.channel}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'shared' | 'recent')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Files</option>
            <option value="shared">Shared Files</option>
            <option value="recent">Recently Accessed</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedDocs.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700">
              {selectedDocs.length} document(s) selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                <CloudArrowDownIcon className="h-4 w-4" />
                Download
              </button>
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                <ShareIcon className="h-4 w-4" />
                Share in Teams
              </button>
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                Discuss
              </button>
              <button 
                onClick={() => setSelectedDocs([])}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Document List/Grid */}
        <div className="bg-white rounded-lg border border-gray-200">
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDocs.length === filteredDocs.length && filteredDocs.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocs(filteredDocs.map(doc => doc.id));
                          } else {
                            setSelectedDocs([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team/Channel
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={() => handleSelectDoc(doc.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.fileType)}
                          <div>
                            <div className="font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">{doc.path}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{doc.team}</div>
                        <div className="text-xs text-gray-500">#{doc.channel}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{doc.size || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {doc.modified}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <UserIcon className="h-3 w-3" />
                          {doc.modifiedBy}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {doc.isShared && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Shared
                            </span>
                          )}
                          {doc.lastAccessed && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Recent
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600" title="View">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {doc.type === 'file' && (
                            <button className="p-1 text-gray-400 hover:text-green-600" title="Download">
                              <CloudArrowDownIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-1 text-gray-400 hover:text-purple-600" title="Share in Teams">
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDocs.includes(doc.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectDoc(doc.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    {getFileIcon(doc.fileType)}
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => handleSelectDoc(doc.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 truncate mb-1">{doc.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">{doc.team}</p>
                  <p className="text-xs text-gray-400 mb-2">#{doc.channel}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{doc.size || 'Folder'}</span>
                    <div className="flex gap-1">
                      {doc.isShared && <div className="w-2 h-2 bg-green-500 rounded-full" title="Shared"></div>}
                      {doc.lastAccessed && <div className="w-2 h-2 bg-blue-500 rounded-full" title="Recent"></div>}
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
            Showing {filteredDocs.length} of {mockTeamsData.length} documents
          </div>
          <div className="flex items-center gap-4">
            <span>Connected to Microsoft Teams</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
