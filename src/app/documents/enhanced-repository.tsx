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
  HomeIcon,
  CloudArrowDownIcon,
  LinkIcon,
  Square3Stack3DIcon,
  ServerIcon,
  DocumentDuplicateIcon,
  RectangleStackIcon,
  ComputerDesktopIcon,
  CubeIcon,
  InboxIcon
} from "@heroicons/react/24/outline";

// Security classifications with SAYWHAT branding
const securityClassifications = {
  "PUBLIC": {
    level: 0,
    description: "Information accessible to all employees within the organization",
    color: "text-green-600 bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-800",
    iconColor: "text-green-600",
    icon: ShareIcon,
    examples: ["General policies", "Training materials", "Organization-wide announcements"]
  },
  "CONFIDENTIAL": {
    level: 2,
    description: "Sensitive information requiring authorized access - confidential level",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
    iconColor: "text-orange-600",
    icon: LockClosedIcon,
    examples: ["Financial reports", "Personnel files", "Donor reports", "Management accounts"]
  },
  "SECRET": {
    level: 3,
    description: "Highly sensitive information - secret level classification",
    color: "text-red-600 bg-red-50 border-red-200",
    badgeColor: "bg-red-100 text-red-800",
    iconColor: "text-red-600",
    icon: ShieldCheckIcon,
    examples: ["Strategic plans", "Board minutes", "Grant proposals", "Legal documents"]
  },
  "TOP_SECRET": {
    level: 4,
    description: "Highly sensitive information - top secret level classification",
    color: "text-red-800 bg-red-50 border-red-300",
    badgeColor: "bg-red-200 text-red-900",
    iconColor: "text-red-800",
    icon: ShieldCheckIcon,
    examples: ["Executive decisions", "Sensitive investigations", "Critical strategic documents"]
  }
};

// External platforms for quick access integration
const externalPlatforms = [
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: CloudIcon,
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    iconColor: 'text-blue-600',
    description: 'Microsoft OneDrive files',
    path: '/documents/onedrive'
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    icon: Square3Stack3DIcon,
    color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
    iconColor: 'text-indigo-600',
    description: 'SharePoint documents',
    path: '/documents/sharepoint'
  },
  {
    id: 'googledrive',
    name: 'Google Drive',
    icon: ServerIcon,
    color: 'bg-green-50 hover:bg-green-100 border-green-200',
    iconColor: 'text-green-600',
    description: 'Google Drive files',
    path: '/documents/googledrive'
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    iconColor: 'text-purple-600',
    description: 'Teams file shares',
    path: '/documents/teams'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: CloudArrowDownIcon,
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    iconColor: 'text-blue-500',
    description: 'Dropbox storage',
    path: '/documents/dropbox'
  }
];

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
  accessLevel?: string;
  permissions?: string[];
}

// Helper function to get security classification info
const getSecurityInfo = (classification: string) => {
  return securityClassifications[classification as keyof typeof securityClassifications] || securityClassifications.PUBLIC;
};

// Helper function to check if user has access to document
const canUserAccessDocument = (document: Document, userRole?: string, userPermissions?: string[]) => {
  const securityInfo = getSecurityInfo(document.classification);
  
  // Admin access
  if (userRole === 'admin' || userPermissions?.includes('documents.full_access')) {
    return true;
  }
  
  // Security level based access
  switch (document.classification) {
    case 'PUBLIC':
      return true;
    case 'CONFIDENTIAL':
      return userPermissions?.includes('documents.confidential') || 
             userPermissions?.includes('documents.classified');
    case 'SECRET':
      return userPermissions?.includes('documents.secret') || 
             userPermissions?.includes('documents.classified');
    case 'TOP_SECRET':
      return userPermissions?.includes('documents.top_secret');
    default:
      return true;
  }
};

// Helper function to get classification badge color
const getClassificationColor = (classification: string) => {
  const info = getSecurityInfo(classification);
  return info.badgeColor;
};

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
              const securityInfo = getSecurityInfo(doc.classification);
              const SecurityIcon = securityInfo.icon;
              const hasAccess = canUserAccessDocument(doc, session?.user?.roles?.[0], session?.user?.permissions);
              
              return (
                <div key={doc.id} className={`px-6 py-4 hover:bg-gray-50 ${!hasAccess ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <FileIcon className="h-8 w-8 text-gray-400" />
                        <SecurityIcon className={`h-4 w-4 ${securityInfo.iconColor} absolute -top-1 -right-1 bg-white rounded-full p-0.5`} />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(doc.classification)}`}>
                            <SecurityIcon className="h-3 w-3 mr-1" />
                            {doc.classification}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {doc.size} • {doc.department} • Uploaded by {doc.uploadedBy} • {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasAccess ? (
                        <>
                          <button 
                            onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                            className="text-gray-400 hover:text-saywhat-orange transition-colors"
                            title="View document"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDownload(doc.id, doc.title)}
                            className="text-gray-400 hover:text-saywhat-orange transition-colors"
                            title="Download document"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center text-red-500 text-xs">
                          <LockClosedIcon className="h-4 w-4 mr-1" />
                          Access Denied
                        </div>
                      )}
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
            const securityInfo = getSecurityInfo(doc.classification);
            const SecurityIcon = securityInfo.icon;
            const hasAccess = canUserAccessDocument(doc, session?.user?.roles?.[0], session?.user?.permissions);
            
            // Don't show documents user doesn't have access to
            if (!hasAccess) return null;
            
            return (
              <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <FileIcon className="h-8 w-8 text-gray-400" />
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${securityInfo.badgeColor} flex items-center justify-center`}>
                        <SecurityIcon className="h-2.5 w-2.5" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${securityInfo.badgeColor}`}>
                          <SecurityIcon className="h-3 w-3 mr-1" />
                          {doc.classification}
                        </span>
                        {doc.department && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                            {doc.department}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {doc.size} • Uploaded by {doc.uploadedBy} • {doc.uploadDate}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-gray-400 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                      className="text-gray-400 hover:text-saywhat-orange transition-colors p-1 rounded-md hover:bg-orange-50"
                      title="View document"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDownload(doc.id, doc.title)}
                      className="text-gray-400 hover:text-saywhat-orange transition-colors p-1 rounded-md hover:bg-orange-50"
                      title="Download document"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }).filter(Boolean)
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
      <div className="flex h-full">
        {/* External Platforms Sidebar */}
        <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex-shrink-0">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Quick Access
            </h3>
            <p className="text-xs text-gray-600 mt-1">External Platforms</p>
          </div>
          
          <nav className="px-2 space-y-1">
            {externalPlatforms.map((platform) => {
              const PlatformIcon = platform.icon;
              return (
                <a
                  key={platform.id}
                  href={platform.path}
                  className={`${platform.color} group flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 hover:shadow-sm`}
                >
                  <PlatformIcon className={`${platform.iconColor} flex-shrink-0 mr-3 h-5 w-5`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{platform.name}</div>
                    <div className="text-xs text-gray-600">{platform.description}</div>
                  </div>
                  <LinkIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </nav>

          {/* Security Level Legend */}
          <div className="mt-6 px-4">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Security Levels
            </h4>
            <div className="space-y-2">
              {Object.entries(securityClassifications).map(([key, classification]) => {
                const ClassIcon = classification.icon;
                return (
                  <div key={key} className={`${classification.color} px-2 py-1.5 rounded-md border text-xs flex items-center`}>
                    <ClassIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="font-medium">{key}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white shadow-sm border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {primaryTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-saywhat-orange text-saywhat-orange bg-orange-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 rounded-t-md`}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Secondary Navigation */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="flex flex-wrap gap-2">
              {secondaryTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-saywhat-orange text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                    } ${tab.adminOnly && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''} 
                    inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full transition-all duration-200`}
                    disabled={tab.adminOnly && !isAdmin}
                    title={tab.description}
                  >
                    <TabIcon className="h-3 w-3 mr-1.5" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="max-w-full mx-auto px-6 py-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => window.location.href = '/documents/upload'}
          className="bg-saywhat-orange hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
    </ModulePage>
  );
}
