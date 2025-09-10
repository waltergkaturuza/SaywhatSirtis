"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
  ChatBubbleLeftRightIcon,
  TrashIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentPlusIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  PhotoIcon,
  FilmIcon,
  HomeIcon
} from "@heroicons/react/24/outline";

// Document Repository Tabs Configuration
const documentTabs = [
  // Essential Tabs
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    icon: HomeIcon, 
    description: 'Overview and recent activity',
    primary: true 
  },
  { 
    id: 'browse', 
    name: 'All Files', 
    icon: FolderIcon, 
    description: 'Browse folder hierarchy',
    primary: true 
  },
  { 
    id: 'search', 
    name: 'Search', 
    icon: MagnifyingGlassIcon, 
    description: 'Powerful search with filters',
    primary: true 
  },
  { 
    id: 'shared', 
    name: 'Shared with Me', 
    icon: ShareIcon, 
    description: 'Files shared by others',
    primary: true 
  },
  { 
    id: 'favorites', 
    name: 'Favorites', 
    icon: StarIcon, 
    description: 'Bookmarked files',
    primary: true 
  },
  
  // Content Organization Tabs
  { 
    id: 'by-type', 
    name: 'By Type', 
    icon: DocumentIcon, 
    description: 'Files organized by format' 
  },
  { 
    id: 'by-department', 
    name: 'By Department', 
    icon: BuildingOfficeIcon, 
    description: 'Departmental organization' 
  },
  { 
    id: 'by-project', 
    name: 'By Project', 
    icon: BriefcaseIcon, 
    description: 'Project-based files' 
  },
  
  // Advanced Tabs
  { 
    id: 'tasks', 
    name: 'Tasks & Approvals', 
    icon: CheckCircleIcon, 
    description: 'Workflow tasks' 
  },
  { 
    id: 'trash', 
    name: 'Trash', 
    icon: TrashIcon, 
    description: 'Deleted items' 
  },
  { 
    id: 'admin', 
    name: 'Admin Console', 
    icon: Cog6ToothIcon, 
    description: 'System administration',
    adminOnly: true 
  }
];

// File Types for organization
const fileTypes = [
  { id: 'documents', name: 'Documents', icon: DocumentTextIcon, extensions: ['pdf', 'doc', 'docx'], count: 156 },
  { id: 'spreadsheets', name: 'Spreadsheets', icon: TableCellsIcon, extensions: ['xls', 'xlsx', 'csv'], count: 89 },
  { id: 'presentations', name: 'Presentations', icon: PresentationChartBarIcon, extensions: ['ppt', 'pptx'], count: 45 },
  { id: 'images', name: 'Images', icon: PhotoIcon, extensions: ['jpg', 'jpeg', 'png', 'gif'], count: 234 },
  { id: 'videos', name: 'Videos', icon: FilmIcon, extensions: ['mp4', 'avi', 'mov'], count: 67 }
];

// Departments
const departments = [
  { id: 'hr', name: 'Human Resources', code: 'HR', fileCount: 234 },
  { id: 'finance', name: 'Finance', code: 'FIN', fileCount: 189 },
  { id: 'operations', name: 'Operations', code: 'OPS', fileCount: 156 },
  { id: 'marketing', name: 'Marketing', code: 'MKT', fileCount: 298 },
  { id: 'it', name: 'Information Technology', code: 'IT', fileCount: 145 },
  { id: 'legal', name: 'Legal', code: 'LEG', fileCount: 78 }
];

// Mock data for demonstration
const recentFiles = [
  { 
    id: '1', 
    name: 'Q3 Financial Report.pdf', 
    type: 'pdf', 
    size: '2.4 MB', 
    modifiedBy: 'John Doe',
    modifiedAt: '2 hours ago',
    department: 'Finance',
    classification: 'CONFIDENTIAL'
  },
  { 
    id: '2', 
    name: 'Employee Handbook v2.docx', 
    type: 'docx', 
    size: '1.8 MB', 
    modifiedBy: 'Sarah Smith',
    modifiedAt: '4 hours ago',
    department: 'HR',
    classification: 'PUBLIC'
  },
  { 
    id: '3', 
    name: 'Marketing Strategy 2025.pptx', 
    type: 'pptx', 
    size: '5.2 MB', 
    modifiedBy: 'Mike Johnson',
    modifiedAt: '1 day ago',
    department: 'Marketing',
    classification: 'RESTRICTED'
  }
];

export default function DocumentRepositoryPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const isAdmin = session?.user?.roles?.includes('admin') || 
                 session?.user?.permissions?.includes('documents.admin');

  // Filter tabs based on user permissions
  const visibleTabs = documentTabs.filter(tab => 
    !tab.adminOnly || isAdmin
  );

  const primaryTabs = visibleTabs.filter(tab => tab.primary);
  const secondaryTabs = visibleTabs.filter(tab => !tab.primary && !tab.adminOnly);
  const adminTabs = visibleTabs.filter(tab => tab.adminOnly);

  const getFileIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      pdf: DocumentTextIcon,
      doc: DocumentTextIcon,
      docx: DocumentTextIcon,
      xls: TableCellsIcon,
      xlsx: TableCellsIcon,
      csv: TableCellsIcon,
      ppt: PresentationChartBarIcon,
      pptx: PresentationChartBarIcon,
      jpg: PhotoIcon,
      jpeg: PhotoIcon,
      png: PhotoIcon,
      gif: PhotoIcon,
      mp4: FilmIcon,
      avi: FilmIcon,
      mov: FilmIcon
    };
    return iconMap[type] || DocumentIcon;
  };

  const getClassificationColor = (classification: string) => {
    const colorMap: { [key: string]: string } = {
      PUBLIC: 'bg-green-100 text-green-800',
      CONFIDENTIAL: 'bg-orange-100 text-orange-800',
      RESTRICTED: 'bg-red-100 text-red-800'
    };
    return colorMap[classification] || 'bg-gray-100 text-gray-800';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'browse':
        return renderBrowse();
      case 'search':
        return renderSearch();
      case 'shared':
        return renderSharedWithMe();
      case 'favorites':
        return renderFavorites();
      case 'by-type':
        return renderByType();
      case 'by-department':
        return renderByDepartment();
      case 'by-project':
        return renderByProject();
      case 'tasks':
        return renderTasks();
      case 'trash':
        return renderTrash();
      case 'admin':
        return renderAdminConsole();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Documents</dt>
                  <dd className="text-lg font-medium text-gray-900">1,247</dd>
                </dl>
              </div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Storage Used</dt>
                  <dd className="text-lg font-medium text-gray-900">15.6 GB</dd>
                </dl>
              </div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Views This Month</dt>
                  <dd className="text-lg font-medium text-gray-900">3,456</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowDownTrayIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Downloads</dt>
                  <dd className="text-lg font-medium text-gray-900">1,234</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentFiles.map((file) => {
            const FileIcon = getFileIcon(file.type);
            return (
              <div key={file.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileIcon className="h-8 w-8 text-gray-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.size} • Modified by {file.modifiedBy} • {file.modifiedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(file.classification)}`}>
                      {file.classification}
                    </span>
                    <button className="text-gray-400 hover:text-gray-500">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderBrowse = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Browse Files</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-500">File browser with folder hierarchy will be implemented here.</p>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Advanced Search</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Search documents, content, and metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option>All File Types</option>
                <option>Documents</option>
                <option>Spreadsheets</option>
                <option>Presentations</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option>All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option>All Time</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderByType = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fileTypes.map((type) => {
          const TypeIcon = type.icon;
          return (
            <div key={type.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TypeIcon className="h-8 w-8 text-saywhat-orange" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-lg font-medium text-gray-900 truncate">{type.name}</dt>
                      <dd className="text-sm text-gray-500">{type.count} files</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-500">
                    Extensions: {type.extensions.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderByDepartment = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-8 w-8 text-saywhat-orange" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-lg font-medium text-gray-900 truncate">{dept.name}</dt>
                    <dd className="text-sm text-gray-500">{dept.fileCount} files</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {dept.code}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderByProject = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Project Files</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-500">Project-based document organization will be implemented here.</p>
      </div>
    </div>
  );

  const renderSharedWithMe = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Shared with Me</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-500">Files shared by other users will be displayed here.</p>
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Favorites</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-500">Your bookmarked files will be displayed here.</p>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Tasks & Approvals</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-500">Workflow tasks and document approvals will be displayed here.</p>
      </div>
    </div>
  );

  const renderTrash = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Trash</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-500">Deleted files will be displayed here with restore options.</p>
      </div>
    </div>
  );

  const renderAdminConsole = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-saywhat-orange" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-500">Manage users and permissions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <ChartPieIcon className="h-8 w-8 text-saywhat-orange" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-500">Storage and usage analytics</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-saywhat-orange" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Security</h3>
                <p className="text-sm text-gray-500">Audit logs and security settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ModulePage
      metadata={{
        title: "Document Repository",
        description: "World-class document management with advanced security and AI capabilities",
        breadcrumbs: [{ name: "Document Repository" }]
      }}
    >
      <div className="max-w-full mx-auto px-4 space-y-6">
        {/* Primary Navigation Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {primaryTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-saywhat-orange text-saywhat-orange'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <TabIcon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Secondary Navigation */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {secondaryTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-saywhat-orange text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    } inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md`}
                  >
                    <TabIcon className="h-4 w-4 mr-1" />
                    {tab.name}
                  </button>
                );
              })}

              {/* Admin tabs for privileged users */}
              {isAdmin && adminTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    } inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md`}
                  >
                    <TabIcon className="h-4 w-4 mr-1" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Quick Actions Floating Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => window.location.href = '/documents/upload'}
            className="bg-saywhat-orange hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-colors"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </ModulePage>
  );
}
