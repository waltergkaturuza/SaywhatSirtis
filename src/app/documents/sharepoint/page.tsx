'use client';

import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/main-layout';
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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface SharePointDocument {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  modifiedBy: string;
  site: string;
  path: string;
  fileType?: string;
  downloadUrl?: string;
}

const mockSharePointDocs: SharePointDocument[] = [
  {
    id: '1',
    name: 'Annual Report 2024',
    type: 'file',
    size: '2.4 MB',
    modified: '2024-01-15',
    modifiedBy: 'John Smith',
    site: 'Corporate Site',
    path: '/sites/corporate/documents',
    fileType: 'pdf',
    downloadUrl: '#'
  },
  {
    id: '2',
    name: 'Project Plans',
    type: 'folder',
    modified: '2024-01-14',
    modifiedBy: 'Sarah Johnson',
    site: 'Project Management',
    path: '/sites/projects',
    fileType: 'folder'
  },
  {
    id: '3',
    name: 'Budget Spreadsheet Q1',
    type: 'file',
    size: '856 KB',
    modified: '2024-01-13',
    modifiedBy: 'Mike Davis',
    site: 'Finance Site',
    path: '/sites/finance/budgets',
    fileType: 'xlsx',
    downloadUrl: '#'
  },
  {
    id: '4',
    name: 'HR Policies Manual',
    type: 'file',
    size: '1.2 MB',
    modified: '2024-01-12',
    modifiedBy: 'Lisa Chen',
    site: 'HR Portal',
    path: '/sites/hr/policies',
    fileType: 'docx',
    downloadUrl: '#'
  },
  {
    id: '5',
    name: 'Marketing Materials',
    type: 'folder',
    modified: '2024-01-11',
    modifiedBy: 'Tom Wilson',
    site: 'Marketing Hub',
    path: '/sites/marketing',
    fileType: 'folder'
  }
];

const sharePointSites = [
  { name: 'All Sites', value: 'all' },
  { name: 'Corporate Site', value: 'corporate' },
  { name: 'Project Management', value: 'projects' },
  { name: 'Finance Site', value: 'finance' },
  { name: 'HR Portal', value: 'hr' },
  { name: 'Marketing Hub', value: 'marketing' }
];

export default function SharePointBrowser() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('all');
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredDocs = mockSharePointDocs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSite === 'all' || doc.site.toLowerCase().includes(selectedSite);
    return matchesSearch && matchesSite;
  });

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf':
        return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
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
    { label: 'SharePoint Browser', href: '/documents/sharepoint' }
  ];

  return (
    <ModuleLayout
      title="SharePoint Browser"
      requiredPermission="documents.sharepoint"
      breadcrumbs={breadcrumbItems}
    >
      <div className="space-y-6">
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
              Upload to SharePoint
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search SharePoint documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sharePointSites.map(site => (
              <option key={site.value} value={site.value}>{site.name}</option>
            ))}
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
                Share
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
                      Site
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
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
                      <td className="px-6 py-4 text-sm text-gray-900">{doc.site}</td>
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
                          <button className="p-1 text-gray-400 hover:text-blue-600" title="View">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {doc.type === 'file' && (
                            <button className="p-1 text-gray-400 hover:text-green-600" title="Download">
                              <CloudArrowDownIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-1 text-gray-400 hover:text-purple-600" title="Share">
                            <ShareIcon className="h-4 w-4" />
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
                  <p className="text-sm text-gray-500 mb-2">{doc.site}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{doc.size || 'Folder'}</span>
                    <span>{doc.modified}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
          <div>
            Showing {filteredDocs.length} of {mockSharePointDocs.length} documents
          </div>
          <div className="flex items-center gap-4">
            <span>Connected to SharePoint Online</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
