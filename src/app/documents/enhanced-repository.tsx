"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import EditDocumentModal from "@/components/modals/EditDocumentModal";
import DocumentViewModal from "@/components/modals/DocumentViewModal";
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
  InboxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  DocumentArrowUpIcon,
  EyeSlashIcon,
  SparklesIcon as AiSparklesIcon,
  Bars3Icon,
  XMarkIcon,
  PencilIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";

// Document categories from upload form - Updated comprehensive list
const documentCategories = [
  "Activity Reports",
  "Annual Reports", 
  "Baseline and Endline Reports",
  "Board Meeting Minutes",
  "Budgets & Forecasts",
  "Case Management Reports",
  "Compliance & Audit Reports",
  "Contracts & Agreements",
  "Departmental Monthly Reports",
  "Disciplinary Reports",
  "Donor Reports",
  "Employee Contracts",
  "Financial Documents",
  "Flagship Events Reports",
  "Grant Proposals",
  "Grant Agreements",
  "Health & Safety Records",
  "Insurance Documents",
  "IT & Systems Documentation",
  "Legal Documents",
  "Management Accounts Reports",
  "Marketing Materials",
  "Memorandums of Understanding (MOUs)",
  "Monitoring & Evaluation Reports",
  "Observer Newsletters",
  "Partnership Agreements",
  "Performance Appraisals",
  "Performance Improvement Plans",
  "Policies & Procedures",
  "Pre-Award Assessments",
  "Procurement & Tender Documents",
  "Project Proposals",
  "Research Books",
  "Research Papers",
  "Risk Registers",
  "Staff Handbooks",
  "Strategic Plans",
  "Sustainability Reports",
  "Training Materials",
  "Travel Reports",
  "Workplans & Activity Schedules",
  // Additional comprehensive categories
  "Asset Management Records",
  "Award Documents",
  "Beneficiary Data & Records",
  "Capacity Building Materials",
  "Communication & PR Materials",
  "Community Engagement Records",
  "Conflict of Interest Declarations",
  "Data Protection & Privacy Records",
  "Emergency Response Plans",
  "Environmental Impact Assessments",
  "Event Documentation",
  "Exit Strategies & Closure Reports",
  "External Evaluation Reports",
  "Fundraising Materials",
  "Government Relations Documents",
  "Impact Assessment Reports",
  "Incident Reports",
  "Internal Audit Reports",
  "Job Descriptions & Specifications",
  "Knowledge Management Resources",
  "Lesson Learned Documents",
  "Media Coverage & Press Releases",
  "Meeting Notes & Action Items",
  "Organizational Charts",
  "Permit & License Documents",
  "Quality Assurance Documents",
  "Recruitment & Selection Records",
  "Regulatory Compliance Documents",
  "Safeguarding Policies & Reports",
  "Standard Operating Procedures (SOPs)",
  "Stakeholder Mapping & Analysis",
  "Technical Specifications",
  "Terms of Reference (ToRs)",
  "User Manuals & Guides",
  "Vendor & Supplier Records",
  "Volunteer Management Records",
  "Waste Management Plans",
  "Workshop & Conference Materials"
];

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

interface TabItem {
  id: string;
  name: string;
  icon: any;
  description: string;
  primary?: boolean;
  adminOnly?: boolean;
}

const documentTabs: TabItem[] = [
  { 
    id: 'my-documents', 
    name: 'My Documents', 
    icon: DocumentIcon, 
    description: 'Personal documents & drafts',
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
    description: 'Find documents quickly',
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
    description: 'Deleted items',
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
  const [activeTab, setActiveTab] = useState('my-documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [personalDocuments, setPersonalDocuments] = useState<Document[]>([]);
  const [fileTypes, setFileTypes] = useState<FileTypeStats[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalDocuments: 0,
    storageUsed: '0 MB',
    viewsThisMonth: 0,
    sharedWithMe: 0
  });
  const [loading, setLoading] = useState(true);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showSecurityLevels, setShowSecurityLevels] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);

  // Generate dynamic folder structure based on departments and categories
  const generateFolderStructure = () => {
    if (!departments || departments.length === 0) {
      // If no departments yet, show loading or create default structure
      return [{
        id: 'loading',
        name: 'Loading departments...',
        icon: BuildingOfficeIcon,
        children: [],
        totalDocuments: 0
      }];
    }

    return departments.map(dept => {
      // Count documents for each category within this department
      const categoryStats = new Map();
      documents.forEach(doc => {
        if (doc.department === dept.name && doc.category) {
          categoryStats.set(doc.category, (categoryStats.get(doc.category) || 0) + 1);
        }
      });

      // Create category folders for this department (show all categories if department has documents)
      const hasDocuments = Array.from(categoryStats.values()).some(count => count > 0);
      const categoriesToShow = hasDocuments 
        ? documentCategories.filter(category => categoryStats.has(category))
        : documentCategories.slice(0, 5); // Show first 5 categories as examples when no documents

      const categoryFolders = categoriesToShow.map(category => ({
        id: `${dept.id}-${category.toLowerCase().replace(/\s+/g, '-')}`,
        name: category,
        icon: FolderIcon,
        documentCount: categoryStats.get(category) || 0,
        path: `${dept.name}/${category}`,
        department: dept.name,
        category: category
      }));

      return {
        id: dept.id,
        name: dept.name,
        icon: BuildingOfficeIcon,
        children: categoryFolders,
        totalDocuments: dept.fileCount || 0
      };
    });
  };

  // Function to automatically create folder path for a document
  const createDocumentFolderPath = (department: string, category: string) => {
    if (!department || !category) return null;
    
    // Generate standardized folder path: Department/Category
    const folderPath = `${department}/${category}`;
    return {
      path: folderPath,
      department: department,
      category: category,
      created: new Date().toISOString()
    };
  };

  // Function to ensure folder structure exists for document
  const ensureFolderStructure = async (document: any) => {
    if (!document.department || !document.category) return null;

    const folderInfo = createDocumentFolderPath(document.department, document.category);
    if (!folderInfo) return null;
    
    try {
      // Check if folder structure already exists in database
      const response = await fetch('/api/documents/folders/ensure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: folderInfo.path,
          department: folderInfo.department,
          category: folderInfo.category,
          documentId: document.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.folderPath;
      }
    } catch (error) {
      console.error('Error ensuring folder structure:', error);
    }
    
    return folderInfo.path;
  };

  // Dynamic folder structure - updates when departments or documents change
  const folderStructure = generateFolderStructure();

  // Static folder structure for reference (not used in UI)
  const staticFolderStructure = [
    {
      id: 'departments',
      name: 'Departments',
      icon: BuildingOfficeIcon,
      children: [
        { id: 'hr', name: 'Human Resources', icon: FolderIcon, documentCount: 24 },
        { id: 'finance', name: 'Finance & Accounting', icon: FolderIcon, documentCount: 18 },
        { id: 'operations', name: 'Operations', icon: FolderIcon, documentCount: 31 },
        { id: 'it', name: 'Information Technology', icon: FolderIcon, documentCount: 12 },
      ]
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: BriefcaseIcon,
      children: [
        { id: 'project-alpha', name: 'Project Alpha', icon: FolderIcon, documentCount: 15 },
        { id: 'project-beta', name: 'Project Beta', icon: FolderIcon, documentCount: 8 },
        { id: 'project-gamma', name: 'Project Gamma', icon: FolderIcon, documentCount: 22 },
      ]
    },
    {
      id: 'policies',
      name: 'Policies & Procedures',
      icon: ShieldCheckIcon,
      children: [
        { id: 'company-policies', name: 'Company Policies', icon: FolderIcon, documentCount: 6 },
        { id: 'safety-procedures', name: 'Safety Procedures', icon: FolderIcon, documentCount: 14 },
        { id: 'compliance', name: 'Compliance Documents', icon: FolderIcon, documentCount: 9 },
      ]
    },
    {
      id: 'templates',
      name: 'Templates & Forms',
      icon: DocumentPlusIcon,
      children: [
        { id: 'contracts', name: 'Contract Templates', icon: FolderIcon, documentCount: 7 },
        { id: 'forms', name: 'Forms & Applications', icon: FolderIcon, documentCount: 11 },
        { id: 'reports', name: 'Report Templates', icon: FolderIcon, documentCount: 5 },
      ]
    }
  ];

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };
  
  const isAdmin = session?.user?.roles?.includes('admin') || 
                 session?.user?.permissions?.includes('documents.admin');

  // Close hamburger menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showHamburgerMenu && !target.closest('.hamburger-menu')) {
        setShowHamburgerMenu(false);
      }
      if (showSecurityLevels && !target.closest('.security-levels-panel') && !target.closest('.security-levels-button')) {
        setShowSecurityLevels(false);
      }
    };

    if (showHamburgerMenu || showSecurityLevels) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHamburgerMenu, showSecurityLevels]);

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

  // Load user's personal documents (drafts)
  const loadPersonalDocuments = async () => {
    try {
      setPersonalLoading(true);
      const response = await fetch('/api/documents/personal');
      
      if (response.ok) {
        const data = await response.json();
        setPersonalDocuments(data.documents || []);
      } else {
        console.warn('Failed to fetch personal documents');
        setPersonalDocuments([]);
      }
    } catch (err) {
      console.error('Error loading personal documents:', err);
      setPersonalDocuments([]);
    } finally {
      setPersonalLoading(false);
    }
  };

  // Publish document from personal repo to main repository
  const publishDocument = async (documentId: string) => {
    try {
      const response = await fetch('/api/documents/personal', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: documentId,
          action: 'publish'
        })
      });

      if (response.ok) {
        // Refresh personal documents list
        await loadPersonalDocuments();
        // Refresh main documents list
        await loadDocuments();
        return true;
      } else {
        const error = await response.json();
        console.error('Error publishing document:', error);
        return false;
      }
    } catch (error) {
      console.error('Error publishing document:', error);
      return false;
    }
  };

  // Delete document from personal repository
  const deletePersonalDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/personal?id=${documentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh personal documents list
        await loadPersonalDocuments();
        return true;
      } else {
        const error = await response.json();
        console.error('Error deleting document:', error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
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
      // Try different possible fields for file type
      const type = doc.type?.toLowerCase() || 
                   doc.mimeType?.split('/')[1]?.toLowerCase() || 
                   doc.fileName?.split('.').pop()?.toLowerCase() || 
                   'unknown';
      
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
    const lowerType = type.toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(lowerType)) return { id: 'documents', name: 'Documents' };
    if (['xls', 'xlsx', 'csv', 'ods'].includes(lowerType)) return { id: 'spreadsheets', name: 'Spreadsheets' };
    if (['ppt', 'pptx', 'odp'].includes(lowerType)) return { id: 'presentations', name: 'Presentations' };
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'svg', 'webp'].includes(lowerType)) return { id: 'images', name: 'Images' };
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'flv', 'webm'].includes(lowerType)) return { id: 'videos', name: 'Videos' };
    return { id: 'documents', name: 'Documents' }; // Default to documents instead of other
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

  // Drag and drop handlers - Navigate to upload page
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    // Navigate to upload page instead of handling inline
    window.location.href = '/documents/upload';
  };

  const handleDocumentPreview = (document: any) => {
    setSelectedDocument(document);
    setShowPreview(true);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Load data on component mount
  useEffect(() => {
    if (session) {
      loadDocuments();
    }
  }, [session]);

  // Load personal documents when My Documents tab is active
  useEffect(() => {
    if (session && activeTab === 'my-documents') {
      loadPersonalDocuments();
    }
  }, [session, activeTab]);

  // Load documents and departments when search tab is active
  useEffect(() => {
    if (session && activeTab === 'search') {
      if (documents.length === 0) {
        loadDocuments();
      }
      if (departments.length === 0) {
        loadDepartments();
      }
    }
  }, [session, activeTab, documents.length, departments.length]);

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
      case 'my-documents':
        return renderMyDocuments();
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
        return renderMyDocuments();
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
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
                  <DocumentIcon className="h-7 w-7 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Documents</dt>
                  <dd className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {dashboardStats.totalDocuments.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl">
                  <ChartBarIcon className="h-7 w-7 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Storage Used</dt>
                  <dd className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    {dashboardStats.storageUsed}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl">
                  <EyeIcon className="h-7 w-7 text-purple-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Views This Month</dt>
                  <dd className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    {dashboardStats.viewsThisMonth.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
                  <ShareIcon className="h-7 w-7 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Shared with Me</dt>
                  <dd className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {dashboardStats.sharedWithMe.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-saywhat-orange to-orange-600 p-2 rounded-lg">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Recent Files</h3>
            </div>
            <span className="px-3 py-1 bg-saywhat-orange/10 text-saywhat-orange text-sm font-semibold rounded-full">
              Latest Activity
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {documents.length === 0 && !loading ? (
            <div className="px-6 py-12 text-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl inline-block mb-4">
                <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-500 mb-6">
                Get started by uploading your first document to begin building your repository.
              </p>
              <button
                onClick={() => window.location.href = '/documents/upload'}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <DocumentArrowUpIcon className="mr-2 h-5 w-5" />
                Upload Your First Document
                <SparklesIcon className="ml-2 h-4 w-4 opacity-75" />
              </button>
            </div>
          ) : (
            documents.slice(0, 5).map((doc, index) => {
              const FileIcon = getFileIcon(doc.type);
              const securityInfo = getSecurityInfo(doc.classification);
              const SecurityIcon = securityInfo.icon;
              const hasAccess = canUserAccessDocument(doc, session?.user?.roles?.[0], session?.user?.permissions);
              
              return (
                <div key={doc.id} className={`px-6 py-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 transition-all duration-300 group ${!hasAccess ? 'opacity-60' : ''} ${index === 0 ? 'bg-gradient-to-r from-blue-50/30 to-transparent' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-orange-100 group-hover:to-orange-200 p-3 rounded-xl transition-all duration-300">
                          <FileIcon className="h-7 w-7 text-gray-500 group-hover:text-saywhat-orange transition-colors duration-300" />
                        </div>
                        <div className={`absolute -top-1 -right-1 ${securityInfo.badgeColor} p-1 rounded-full shadow-sm`}>
                          <SecurityIcon className="h-3 w-3" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-saywhat-orange transition-colors duration-300">
                            {doc.title}
                          </p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${securityInfo.badgeColor} shadow-sm`}>
                            <SecurityIcon className="h-3 w-3 mr-1" />
                            {doc.classification}
                          </span>
                          {index === 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <SparklesIcon className="h-3 w-3 mr-1" />
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            {doc.size}
                          </span>
                          {doc.department && (
                            <span className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                              {doc.department}
                            </span>
                          )}
                          <span className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {doc.uploadedBy}
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {doc.uploadDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasAccess ? (
                        <>
                          <button 
                            onClick={() => {
                              setViewingDocumentId(doc.id);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-saywhat-orange hover:bg-orange-100 rounded-lg transition-all duration-200 group-hover:scale-105"
                            title="View document details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDownload(doc.id, doc.title)}
                            className="p-2 text-gray-400 hover:text-saywhat-orange hover:bg-orange-100 rounded-lg transition-all duration-200 group-hover:scale-105"
                            title="Download document"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-200">
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

  const renderMyDocuments = () => (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <DocumentIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">My Documents</h3>
                <p className="text-sm text-gray-600">Personal drafts & documents before publishing</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/documents/upload'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <DocumentArrowUpIcon className="mr-2 h-4 w-4" />
              Upload New Document
            </button>
          </div>
        </div>
      </div>

      {/* Personal Documents List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Draft Documents</h4>
              <p className="text-sm text-gray-500">
                {personalDocuments.length} document{personalDocuments.length !== 1 ? 's' : ''} in your personal repository
              </p>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {personalLoading && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-saywhat-orange mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading your documents...</p>
            </div>
          )}
          
          {personalDocuments.length === 0 && !personalLoading ? (
            <div className="p-8 text-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl inline-block mb-4">
                <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No personal documents yet</h3>
              <p className="text-gray-500 mb-6">
                Upload your first document to get started. Documents will be saved here as drafts before publishing.
              </p>
              <button
                onClick={() => window.location.href = '/documents/upload'}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <DocumentArrowUpIcon className="mr-2 h-5 w-5" />
                Upload First Document
              </button>
            </div>
          ) : (
            personalDocuments.map((doc) => {
              const FileIcon = getFileIcon(doc.type || 'pdf');
              const securityInfo = getSecurityInfo(doc.classification);
              const SecurityIcon = securityInfo.icon;
              
              return (
                <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-xl">
                          <FileIcon className="h-7 w-7 text-gray-500" />
                        </div>
                        <div className={`absolute -top-1 -right-1 ${securityInfo.badgeColor} p-1 rounded-full shadow-sm`}>
                          <SecurityIcon className="h-3 w-3" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-sm font-semibold text-gray-900">{doc.title}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <DocumentIcon className="h-3 w-3 mr-1" />
                            Draft
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${securityInfo.badgeColor} shadow-sm`}>
                            <SecurityIcon className="h-3 w-3 mr-1" />
                            {doc.classification}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FolderIcon className="h-4 w-4 mr-1" />
                            {doc.category}
                          </span>
                          {doc.department && (
                            <span className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                              {doc.department}
                            </span>
                          )}
                          <span className="flex items-center">
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            {doc.size}
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Edit button */}
                      <button 
                        onClick={() => {
                          setEditingDocumentId(doc.id);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit document"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Publish button */}
                      <button 
                        onClick={() => publishDocument(doc.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Publish to main repository"
                      >
                        <ArrowUpTrayIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Delete button */}
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                            deletePersonalDocument(doc.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete document"
                      >
                        <TrashIcon className="h-5 w-5" />
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
        <h3 className="text-lg font-medium text-gray-900">Browse by Folders</h3>
        <button
          onClick={() => window.location.href = '/documents/upload'}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-saywhat-orange hover:bg-saywhat-orange/90"
        >
          <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
          Upload
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {/* Folder Tree Structure */}
        <div className="p-4">
          {folderStructure.map((folder) => {
            const FolderMainIcon = folder.icon;
            const isExpanded = expandedFolders.has(folder.id);
            const totalDocs = folder.children.reduce((sum, child) => sum + child.documentCount, 0);
            
            return (
              <div key={folder.id} className="mb-4">
                {/* Main Folder */}
                <div 
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleFolder(folder.id)}
                >
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <FolderMainIcon className="h-6 w-6 text-saywhat-orange" />
                    <span className="font-medium text-gray-900">{folder.name}</span>
                    <span className="text-sm text-gray-500">({totalDocs} documents)</span>
                  </div>
                </div>

                {/* Subfolders */}
                {isExpanded && folder.children && (
                  <div className="ml-8 mt-2 space-y-1">
                    {folder.children.map((subfolder) => {
                      const SubfolderIcon = subfolder.icon;
                      return (
                        <div key={subfolder.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                          <SubfolderIcon className="h-5 w-5 text-orange-400" />
                          <span className="text-sm text-gray-700">{subfolder.name}</span>
                          <span className="text-xs text-gray-500">({subfolder.documentCount})</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-4">
      {/* Compact Search Section */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-saywhat-orange to-orange-600 p-1.5 rounded-lg">
              <MagnifyingGlassIcon className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Advanced Search</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {/* Main Search Input - Compact */}
            <div>
              <input
                type="text"
                placeholder="Search documents, content, and metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-all duration-200"
              />
            </div>

            {/* Search Filters - Compact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">File Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-sm">
                  <option>All File Types</option>
                  {fileTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name} ({type.count})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-sm">
                  <option>All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name} ({dept.fileCount})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Time Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-sm">
                  <option>All Time</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200">
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Search
                </button>
              </div>
            </div>

            {/* Clear Filters - Compact */}
            <div className="flex justify-start">
              <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Search Results */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Search Results</h4>
            <p className="text-xs text-gray-500">Found {documents.length} documents</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Sort by:</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-xs">
              <option>Relevance</option>
              <option>Date Modified</option>
              <option>Name</option>
              <option>Size</option>
            </select>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No search results</h3>
              <p className="text-sm text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <DocumentIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{doc.title}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{doc.size}</span>
                          {doc.department && <span>{doc.department}</span>}
                          <span>{doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-3">
                      <button 
                        onClick={() => {
                          setViewingDocumentId(doc.id);
                          setShowViewModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-saywhat-orange rounded-md transition-colors"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(doc.id, doc.title)}
                        className="p-1.5 text-gray-400 hover:text-saywhat-orange rounded-md transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    <div className="space-y-6 relative">
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

      {/* Floating Security Levels Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowSecurityLevels(!showSecurityLevels)}
          className="security-levels-button bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          title="Security Classification Levels"
        >
          <ShieldCheckIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Security Levels Panel */}
      {showSecurityLevels && (
        <div className="fixed bottom-20 right-6 z-40 security-levels-panel bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Security Levels</h3>
            <button
              onClick={() => setShowSecurityLevels(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {/* PUBLIC */}
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <ShareIcon className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium text-green-800">PUBLIC</div>
                <div className="text-sm text-green-600">Information accessible to all employees</div>
              </div>
            </div>

            {/* CONFIDENTIAL */}
            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <LockClosedIcon className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <div className="font-medium text-orange-800">CONFIDENTIAL</div>
                <div className="text-sm text-orange-600">Sensitive information requiring authorization</div>
              </div>
            </div>

            {/* SECRET */}
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <div className="font-medium text-red-800">SECRET</div>
                <div className="text-sm text-red-600">Highly sensitive classified information</div>
              </div>
            </div>

            {/* TOP_SECRET */}
            <div className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <div className="font-medium text-purple-800">TOP_SECRET</div>
                <div className="text-sm text-purple-600">Maximum security classification</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ModulePage
      metadata={{
        title: "Documents",
        description: "Comprehensive document management system",
        breadcrumbs: []
      }}
      actions={
        <div className="flex items-center justify-between w-full bg-white shadow-sm border-b border-gray-100 px-6 py-4">
          {/* Left Side - Enhanced Navigation tabs */}
          <nav className="flex items-center space-x-2" aria-label="Document Navigation">
            {primaryTabs.map((tab, index) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? 'text-saywhat-orange bg-orange-50 border-saywhat-orange shadow-sm'
                      : 'text-gray-600 hover:text-saywhat-orange hover:bg-orange-50 border-gray-200 hover:border-orange-300'
                  } inline-flex items-center px-4 py-3 border rounded-lg text-sm transition-all duration-200 group`}
                  title={tab.description}
                >
                  <TabIcon className={`h-5 w-5 mr-2 transition-all duration-200 ${
                    isActive ? 'text-saywhat-orange' : 'text-gray-500 group-hover:text-saywhat-orange'
                  }`} />
                  <span className="text-sm">{tab.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side - Search and Upload */}
          <div className="flex items-center space-x-4">
            {/* Upload Button */}
            <button
              onClick={() => window.location.href = '/documents/upload'}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-saywhat-orange via-orange-500 to-orange-600 hover:from-orange-600 hover:via-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <DocumentArrowUpIcon className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Upload Documents</span>
              <SparklesIcon className="h-3 w-3 ml-2 opacity-75 relative z-10 animate-pulse" />
            </button>

            {/* Enhanced Hamburger Menu */}
            <div className="relative hamburger-menu">
              <button
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                className={`inline-flex items-center p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  showHamburgerMenu
                    ? 'text-saywhat-orange bg-orange-50 shadow-md'
                    : 'text-gray-600 hover:text-saywhat-orange hover:bg-orange-50'
                }`}
                title="More options"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              {/* Enhanced Dropdown Menu */}
              {showHamburgerMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 transform transition-all duration-300 ease-out scale-100">
                  <div className="py-3">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Actions</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowHamburgerMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-saywhat-orange transition-all duration-200 flex items-center group"
                    >
                      <div className="bg-gray-100 p-2 rounded-lg mr-3 group-hover:bg-saywhat-orange group-hover:text-white transition-all duration-200">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Admin Console</div>
                        <div className="text-xs text-gray-500">Manage settings</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveTab('tasks');
                        setShowHamburgerMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-saywhat-orange transition-all duration-200 flex items-center group"
                    >
                      <div className="bg-green-100 p-2 rounded-lg mr-3 group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                        <CheckCircleIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Tasks & Approvals</div>
                        <div className="text-xs text-gray-500">Review pending items</div>
                      </div>
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setActiveTab('trash');
                          setShowHamburgerMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center group"
                      >
                        <div className="bg-gray-100 p-2 rounded-lg mr-3 group-hover:bg-red-500 group-hover:text-white transition-all duration-200">
                          <TrashIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">Trash</div>
                          <div className="text-xs text-gray-500">Deleted documents</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex h-full relative">
        {/* External Platforms Sidebar - Clean Minimal Design */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300`}>
          {/* Sidebar Toggle Button */}
          <div className="p-3 border-b border-gray-100">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-gray-900">Quick Access</span>
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <div className="p-4">
              {/* Document Management Section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                  <div className="w-2 h-2 bg-saywhat-orange rounded-full mr-2"></div>
                  Document Management
                </h3>
                
                <div className="space-y-2">
                  {/* Upload Documents */}
                  <button
                    onClick={() => window.location.href = '/documents/upload'}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="bg-saywhat-orange p-2 rounded-md mr-3 group-hover:bg-orange-600 transition-colors">
                      <DocumentArrowUpIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Upload Documents</div>
                      <div className="text-xs text-gray-500">Add new files</div>
                    </div>
                  </button>
                  
                  {/* Folders */}
                  <button 
                    onClick={() => setActiveTab('browse')}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="bg-green-600 p-2 rounded-md mr-3 group-hover:bg-green-700 transition-colors">
                      <FolderIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Folders</div>
                      <div className="text-xs text-gray-500">Organize files</div>
                    </div>
                  </button>
                  
                  {/* Version History */}
                  <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="bg-gray-600 p-2 rounded-md mr-3 group-hover:bg-gray-700 transition-colors">
                      <ClockIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Version History</div>
                      <div className="text-xs text-gray-500">Track changes</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Reports & Analytics Section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                  Reports & Analytics
                </h3>
                
                <div className="space-y-2">
                  {/* Analytics Dashboard */}
                  <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="bg-saywhat-orange p-2 rounded-md mr-3 group-hover:bg-orange-600 transition-colors">
                      <ChartBarIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Analytics Dashboard</div>
                      <div className="text-xs text-gray-500">View insights</div>
                    </div>
                  </button>
                  
                  {/* Generate Reports */}
                  <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="bg-green-600 p-2 rounded-md mr-3 group-hover:bg-green-700 transition-colors">
                      <DocumentTextIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Generate Reports</div>
                      <div className="text-xs text-gray-500">Create reports</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* External Platforms Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                  External Platforms
                </h3>
                
                <div className="space-y-2">
                  {externalPlatforms.map((platform, index) => {
                    const PlatformIcon = platform.icon;
                    const colors = ['bg-saywhat-orange', 'bg-green-600', 'bg-gray-600'];
                    const hoverColors = ['hover:bg-orange-600', 'hover:bg-green-700', 'hover:bg-gray-700'];
                    
                    return (
                      <a
                        key={platform.id}
                        href={platform.path}
                        className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className={`${colors[index % colors.length]} ${hoverColors[index % hoverColors.length]} p-2 rounded-md mr-3 transition-colors`}>
                          <PlatformIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {platform.name}
                            <LinkIcon className="h-3 w-3 text-gray-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-xs text-gray-500">Connect & sync</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Collapsed sidebar icons */}
          {sidebarCollapsed && (
            <div className="p-2 space-y-2">
              <button
                onClick={() => window.location.href = '/documents/upload'}
                className="w-12 h-12 bg-saywhat-orange rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
                title="Upload Documents"
              >
                <DocumentArrowUpIcon className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={() => setActiveTab('browse')}
                className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                title="Folders"
              >
                <FolderIcon className="h-5 w-5 text-white" />
              </button>
              
              <button
                className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                title="Version History"
              >
                <ClockIcon className="h-5 w-5 text-white" />
              </button>
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                {externalPlatforms.map((platform, index) => {
                  const PlatformIcon = platform.icon;
                  const colors = ['bg-saywhat-orange hover:bg-orange-600', 'bg-green-600 hover:bg-green-700', 'bg-gray-600 hover:bg-gray-700'];
                  
                  return (
                    <a
                      key={platform.id}
                      href={platform.path}
                      className={`w-12 h-12 ${colors[index % colors.length]} rounded-lg flex items-center justify-center transition-colors mb-2 block`}
                      title={platform.name}
                    >
                      <PlatformIcon className="h-5 w-5 text-white" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area with Drag-Drop Support */}
        <div 
          className={`flex-1 flex flex-col overflow-hidden ${dragActive ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="max-w-full mx-auto px-6 py-6">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Drag-drop overlay */}
        {dragActive && (
          <div className="fixed inset-0 z-50 bg-blue-50 bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <DocumentArrowUpIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <p className="text-xl font-medium text-blue-700">Drop files to open upload page</p>
            </div>
          </div>
        )}

        {/* Edit Document Modal */}
        {editingDocumentId && (
          <EditDocumentModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingDocumentId(null);
            }}
            documentId={editingDocumentId}
            onSave={() => {
              // Refresh the documents after editing
              if (activeTab === 'personal') {
                loadPersonalDocuments();
              } else {
                loadDocuments();
              }
            }}
          />
        )}

        {/* Document View Modal */}
        {viewingDocumentId && (
          <DocumentViewModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setViewingDocumentId(null);
            }}
            documentId={viewingDocumentId}
          />
        )}
      </div>
    </ModulePage>
  );
}
