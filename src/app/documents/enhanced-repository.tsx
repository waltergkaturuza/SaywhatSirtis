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

const documentTabs = [
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

interface Document {
  id: string;
  title: string;
  fileName: string;
  description?: string;
  classification: string;
  category?: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  department?: string;
  modifiedAt: string;
  modifiedBy: string;
  url?: string;
  mimeType?: string;
}

interface FileTypeStats {
  id: string;
  name: string;
  icon: any;
  extensions: string[];
  count: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
  fileCount: number;
}

interface DashboardStats {
  totalDocuments: number;
  storageUsed: string;
  viewsThisMonth: number;
  sharedWithMe: number;
}

export default function DocumentRepositoryPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [fileTypes, setFileTypes] = useState<FileTypeStats[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalDocuments: 0,
    storageUsed: '0 MB',
    viewsThisMonth: 0,
    sharedWithMe: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isAdmin = session?.user?.roles?.includes('admin') || 
                 session?.user?.permissions?.includes('documents.admin');

  // Load documents and statistics from API
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/documents');
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(Array.isArray(data) ? data : []);
        
        // Calculate file type statistics from loaded documents
        const typeStats = calculateFileTypeStats(Array.isArray(data) ? data : []);
        setFileTypes(typeStats);
        
        // Load dashboard statistics
        await loadDashboardStats();
      } else {
        console.warn('Failed to fetch documents, using empty list');
        setDocuments([]);
        setFileTypes([]);
      }
      
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Unable to load documents at this time');
      setDocuments([]);
      setFileTypes([]);
    } finally {
      setLoading(false);
    }

    // Load departments after documents are set (if any documents exist)
    if (documents.length > 0) {
      await loadDepartments();
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/documents/analytics');
      
      if (response.ok) {
        const stats = await response.json();
        setDashboardStats(stats);
      } else {
        // Set fallback stats if API fails
        setDashboardStats({
          totalDocuments: documents.length,
          storageUsed: '0 MB',
          viewsThisMonth: 0,
          sharedWithMe: 0
        });
      }
      
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      // Set fallback stats
      setDashboardStats({
        totalDocuments: documents.length,
        storageUsed: '0 MB',
        viewsThisMonth: 0,
        sharedWithMe: 0
      });
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments');
      
      if (response.ok) {
        const depts = await response.json();
        
        // Calculate file counts for each department from documents
        const deptFileCount = new Map();
        documents.forEach(doc => {
          if (doc.department) {
            deptFileCount.set(doc.department, (deptFileCount.get(doc.department) || 0) + 1);
          }
        });

        const departmentStats = (Array.isArray(depts) ? depts : []).map((dept: any) => ({
          id: dept.id || dept.name,
          name: dept.name || 'Unknown Department',
          code: dept.code || (dept.name ? dept.name.substring(0, 3).toUpperCase() : 'UNK'),
          fileCount: deptFileCount.get(dept.name) || 0
        }));

        setDepartments(departmentStats);
      } else {
        console.warn('Failed to fetch departments');
        setDepartments([]);
      }
      
    } catch (err) {
      console.error('Error loading departments:', err);
      // Fallback to empty array if departments API fails
      setDepartments([]);
    }
  };

  const calculateFileTypeStats = (docs: Document[]): FileTypeStats[] => {
    const typeMap = new Map<string, { count: number; extensions: Set<string> }>();
    
    docs.forEach(doc => {
      const type = doc.type?.toLowerCase() || 'unknown';
      const category = getDocumentCategory(type);
      
      if (!typeMap.has(category.id)) {
        typeMap.set(category.id, { count: 0, extensions: new Set() });
      }
      
      const entry = typeMap.get(category.id)!;
      entry.count++;
      entry.extensions.add(type);
    });

    return [
      { 
        id: 'documents', 
        name: 'Documents', 
        icon: DocumentTextIcon, 
        extensions: ['pdf', 'doc', 'docx'], 
        count: typeMap.get('documents')?.count || 0 
      },
      { 
        id: 'spreadsheets', 
        name: 'Spreadsheets', 
        icon: TableCellsIcon, 
        extensions: ['xls', 'xlsx', 'csv'], 
        count: typeMap.get('spreadsheets')?.count || 0 
      },
      { 
        id: 'presentations', 
        name: 'Presentations', 
        icon: PresentationChartBarIcon, 
        extensions: ['ppt', 'pptx'], 
        count: typeMap.get('presentations')?.count || 0 
      },
      { 
        id: 'images', 
        name: 'Images', 
        icon: PhotoIcon, 
        extensions: ['jpg', 'jpeg', 'png', 'gif'], 
        count: typeMap.get('images')?.count || 0 
      },
      { 
        id: 'videos', 
        name: 'Videos', 
        icon: FilmIcon, 
        extensions: ['mp4', 'avi', 'mov'], 
        count: typeMap.get('videos')?.count || 0 
      }
    ];
  };

  const getDocumentCategory = (type: string): { id: string; name: string } => {
    if (['pdf', 'doc', 'docx', 'txt'].includes(type)) return { id: 'documents', name: 'Documents' };
    if (['xls', 'xlsx', 'csv'].includes(type)) return { id: 'spreadsheets', name: 'Spreadsheets' };
    if (['ppt', 'pptx'].includes(type)) return { id: 'presentations', name: 'Presentations' };
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(type)) return { id: 'images', name: 'Images' };
    if (['mp4', 'avi', 'mov', 'wmv'].includes(type)) return { id: 'videos', name: 'Videos' };
    return { id: 'other', name: 'Other' };
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download document');
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (session) {
      loadDocuments();
    }
  }, [session]);

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
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
          <span className="ml-2 text-sm text-gray-500">Loading documents...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={loadDocuments}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

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
                  <dd className="text-lg font-medium text-gray-900">{dashboardStats.totalDocuments.toLocaleString()}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">{dashboardStats.storageUsed}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">{dashboardStats.viewsThisMonth.toLocaleString()}</dd>
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

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {documents.length === 0 && !loading ? (
            <div className="px-6 py-8 text-center">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading your first document.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-saywhat-orange/90"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Upload Document
                </button>
              </div>
            </div>
          ) : (
            documents.slice(0, 5).map((doc) => {
              const FileIcon = getFileIcon(doc.type);
              return (
                <div key={doc.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileIcon className="h-8 w-8 text-gray-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">
                          {doc.size} • Uploaded by {doc.uploadedBy} • {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(doc.classification)}`}>
                        {doc.classification}
                      </span>
                      <button 
                        onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                        className="text-gray-400 hover:text-gray-500"
                        title="View document"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDownload(doc.id, doc.title)}
                        className="text-gray-400 hover:text-gray-500"
                        title="Download document"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderBrowse = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">All Documents</h3>
        <button
          onClick={() => window.location.href = '/documents/upload'}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-saywhat-orange hover:bg-saywhat-orange/90"
        >
          <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
          Upload
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {loading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-saywhat-orange mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
          </div>
        )}
        {documents.length === 0 && !loading ? (
          <div className="p-6 text-center">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">Upload your first document to get started.</p>
          </div>
        ) : (
          documents.map((doc) => {
            const FileIcon = getFileIcon(doc.type);
            return (
              <div key={doc.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileIcon className="h-8 w-8 text-gray-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">
                        {doc.size} • {doc.uploadDate} • {doc.department || 'No department'}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-gray-400 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(doc.classification)}`}>
                      {doc.classification}
                    </span>
                    <button 
                      onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                      className="text-gray-400 hover:text-gray-500"
                      title="View document"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDownload(doc.id, doc.title)}
                      className="text-gray-400 hover:text-gray-500"
                      title="Download document"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
                {fileTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
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
                <option>Last 6 months</option>
                <option>Last year</option>
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

        {renderTabContent()}

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
