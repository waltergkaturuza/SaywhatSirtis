"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import EditDocumentModal from "@/components/modals/EditDocumentModal";
import DocumentViewModal from "@/components/modals/DocumentViewModal";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ArrowUpTrayIcon,
  UserIcon,
  InformationCircleIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon
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
  categoryDisplay?: string;
  type: string;
  size: string | number;
  uploadDate: string;
  uploadedByEmail?: string | null;
  createdAt?: string;
  uploadedBy: string;
  department?: string;
  subunit?: string | null;
  folderPath?: string | null;
  modifiedAt: string;
  modifiedBy: string;
  url?: string;
  mimeType?: string;
  accessLevel?: string;
  permissions?: string[];
  isFavorite?: boolean;
}

interface DepartmentSubunitNode {
  id: string;
  name: string;
  parentName: string;
}

interface DepartmentHierarchyNode {
  id: string;
  name: string;
  code?: string;
  subunits?: DepartmentSubunitNode[];
}

type DepartmentLookup = Record<string, { type: 'main' | 'subunit'; parentName?: string }>;

interface FolderNode {
  id: string;
  name: string;
  icon: any;
  type: 'category' | 'subunit';
  department?: string;
  subunit?: string | null;
  category?: string | null;
  documentCount: number;
  children?: FolderNode[];
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

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  POLICY: "Policies & Procedures",
  PROCEDURE: "Policies & Procedures",
  FORM: "Forms & Templates",
  REPORT: "Reports",
  CONTRACT: "Contracts & Agreements",
  INVOICE: "Budget & Financial Documents",
  PRESENTATION: "Presentations",
  SPREADSHEET: "Data Collection & Analysis",
  IMAGE: "Media & Creative Assets",
  VIDEO: "Media & Creative Assets",
  AUDIO: "Media & Creative Assets",
  ARCHIVE: "Archived Records",
  OTHER: "General Document"
};

export default function DocumentRepositoryPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('my-documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [rawDocuments, setRawDocuments] = useState<Document[]>([]);
  const [personalDocuments, setPersonalDocuments] = useState<Document[]>([]);
  const [rawPersonalDocuments, setRawPersonalDocuments] = useState<Document[]>([]);
  const [fileTypes, setFileTypes] = useState<FileTypeStats[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentHierarchy, setDepartmentHierarchy] = useState<DepartmentHierarchyNode[]>([]);
  const [departmentLookup, setDepartmentLookup] = useState<DepartmentLookup>({});
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
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);
  const [deletedDocs, setDeletedDocs] = useState<Document[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const hasReconciledRef = useRef(false);
  const normalizedRoles = [
    ...(Array.isArray(session?.user?.roles) ? session?.user?.roles : []),
  ]
    .filter(Boolean)
    .map((role) => String(role).toUpperCase());
  const normalizedPermissions = Array.isArray(session?.user?.permissions)
    ? session?.user?.permissions.map((perm) => String(perm).toLowerCase())
    : [];
  const adminRoleSet = new Set([
    'ADMIN',
    'SUPER_ADMIN',
    'ADMINISTRATOR',
    'SYSTEM_ADMINISTRATOR',
    'SUPERUSER',
  ]);
  const isAdmin = normalizedRoles.some((role) => adminRoleSet.has(role)) ||
    normalizedPermissions.includes('documents.admin') ||
    normalizedPermissions.includes('documents.full_access');

  // Generate dynamic folder structure based on departments and categories
  const generateFolderStructure = () => {
    const departmentDocMap = new Map<string, { categories: Map<string, number>; subunits: Map<string, Map<string, number>> }>();

    documents.forEach((doc) => {
      const departmentName = doc.department || 'General';
      const subunitName = doc.subunit || null;
      const categoryName = doc.categoryDisplay || CATEGORY_DISPLAY_MAP[doc.category || 'OTHER'] || doc.category || 'General Document';

      if (!departmentDocMap.has(departmentName)) {
        departmentDocMap.set(departmentName, { categories: new Map(), subunits: new Map() });
      }

      const departmentEntry = departmentDocMap.get(departmentName)!;

      if (subunitName) {
        if (!departmentEntry.subunits.has(subunitName)) {
          departmentEntry.subunits.set(subunitName, new Map());
        }
        const subunitEntry = departmentEntry.subunits.get(subunitName)!;
        subunitEntry.set(categoryName, (subunitEntry.get(categoryName) || 0) + 1);
      } else {
        departmentEntry.categories.set(categoryName, (departmentEntry.categories.get(categoryName) || 0) + 1);
      }
    });

    const nodes: FolderNode[] = [];

    if (departmentHierarchy.length > 0) {
      departmentHierarchy.forEach((dept) => {
        const departmentEntry = departmentDocMap.get(dept.name) || { categories: new Map(), subunits: new Map() };

        const subunitChildren: FolderNode[] = [...departmentEntry.subunits.entries()].map(([subunitName, categoryEntries]) => {
          const categoryChildren: FolderNode[] = [...categoryEntries.entries()].map(([categoryName, count]) => ({
            id: `${slugify(subunitName)}-${slugify(categoryName)}`,
            name: categoryName,
            icon: FolderIcon,
            type: 'category',
            department: dept.name,
            subunit: subunitName,
            category: categoryName,
            documentCount: count
          }));

          const total = categoryChildren.reduce((sum, child) => sum + child.documentCount, 0);

          return {
            id: `subunit-${slugify(subunitName)}`,
            name: subunitName,
            icon: FolderIcon,
            type: 'subunit',
            department: dept.name,
            subunit: subunitName,
            category: null,
            documentCount: total,
            children: categoryChildren
          } as FolderNode;
        });

        const departmentCategoryChildren: FolderNode[] = [...departmentEntry.categories.entries()].map(([categoryName, count]) => ({
          id: `${slugify(dept.id || dept.name)}-${slugify(categoryName)}`,
          name: categoryName,
          icon: FolderIcon,
          type: 'category',
          department: dept.name,
          subunit: null,
          category: categoryName,
          documentCount: count
        }));

        const departmentTotal = subunitChildren.reduce((sum, child) => sum + child.documentCount, 0) +
          departmentCategoryChildren.reduce((sum, child) => sum + child.documentCount, 0);

        nodes.push({
          id: dept.id || slugify(dept.name),
          name: dept.name,
          icon: BuildingOfficeIcon,
          type: 'category',
          department: dept.name,
          subunit: null,
          category: null,
          documentCount: departmentTotal,
          children: [...subunitChildren, ...departmentCategoryChildren]
        });
      });
    }

    if (departmentDocMap.has('General') || nodes.length === 0) {
      const generalEntry = departmentDocMap.get('General') || { categories: new Map(), subunits: new Map() };
      const generalChildren: FolderNode[] = [...generalEntry.categories.entries()].map(([categoryName, count]) => ({
        id: `general-${slugify(categoryName)}`,
        name: categoryName,
        icon: FolderIcon,
        type: 'category',
        department: 'General',
        subunit: null,
        category: categoryName,
        documentCount: count
      }));
      const generalTotal = generalChildren.reduce((sum, child) => sum + child.documentCount, 0);
      nodes.push({
        id: 'general',
        name: 'General',
        icon: BuildingOfficeIcon,
        type: 'category',
        department: 'General',
        subunit: null,
        category: null,
        documentCount: generalTotal,
        children: generalChildren
      });
    }

    return nodes;
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

  useEffect(() => {
    if (documents.length > 0) {
      const normalized = documents[0]?.department
        ? documents[0].department.replace(/\s+/g, '-')
        : null;
      if (normalized && !expandedFolders.has(normalized)) {
        const newExpanded = new Set(expandedFolders);
        newExpanded.add(normalized);
        documents
          .filter(doc => doc.department === documents[0].department && doc.categoryDisplay)
          .forEach(doc => {
            const subId = `${normalized}-${slugify(doc.categoryDisplay || doc.category || 'general')}`;
            newExpanded.add(subId);
          });
        setExpandedFolders(newExpanded);
      }
    }
  }, [documents.length]);
  
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

  const reconcileDocuments = async (dryRun = false) => {
    try {
      const response = await fetch('/api/documents/reconcile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dryRun })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        console.error('Failed to reconcile documents', errorPayload);
        return null;
      }

      const payload = await response.json();
      console.info('Document reconciliation result:', payload);
      return payload;
    } catch (error) {
      console.error('Error reconciling documents:', error);
      return null;
    }
  };

  // Load documents and statistics from API
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [docsResponse, favoritesResponse] = await Promise.all([
        fetch('/api/documents'),
        session?.user ? fetch('/api/documents/favorites') : Promise.resolve(null)
      ]);
      
      let favoriteIds = new Set<string>();
      if (favoritesResponse?.ok) {
        const favData = await favoritesResponse.json();
        if (favData.success && Array.isArray(favData.favorites)) {
          favData.favorites.forEach((fav: any) => favoriteIds.add(fav.id));
        }
      }

      if (docsResponse.ok) {
        const data = await docsResponse.json();
        const rawData: Document[] = Array.isArray(data) ? data : [];
        const enriched = rawData.map(doc => ({
          ...doc,
          isFavorite: favoriteIds.has(doc.id)
        }));
        setRawDocuments(enriched);
      } else {
        console.warn('Failed to fetch documents, using empty list');
        setRawDocuments([]);
        setDocuments([]);
        setFileTypes([]);
      }
      
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Unable to load documents at this time');
      setDocuments([]);
      setRawDocuments([]);
      setFileTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Load user's personal documents (drafts)
  const loadPersonalDocuments = async () => {
    try {
      setPersonalLoading(true);
      const response = await fetch('/api/documents/personal');
      
      if (response.ok) {
        const data = await response.json();
        const rawData: Document[] = Array.isArray(data.documents) ? data.documents : [];
        setRawPersonalDocuments(rawData);
        const normalizedPersonalDocs: Document[] = normalizeDocumentRecords(rawData, departmentLookup);
        setPersonalDocuments(normalizedPersonalDocs);
      } else {
        console.warn('Failed to fetch personal documents');
        setPersonalDocuments([]);
        setRawPersonalDocuments([]);
      }
    } catch (err) {
      console.error('Error loading personal documents:', err);
      setPersonalDocuments([]);
      setRawPersonalDocuments([]);
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
      const response = await fetch('/api/hr/departments/hierarchy');
      
      if (response.ok) {
        const payload = await response.json();
        const hierarchical: DepartmentHierarchyNode[] = payload?.data?.hierarchical || [];
        const flat = payload?.data?.flat || [];
        
        const lookup: DepartmentLookup = {};
        hierarchical.forEach((dept) => {
          if (dept?.name) {
            lookup[normalizeString(dept.name)] = { type: 'main' };
          }
          dept.subunits?.forEach((subunit) => {
            lookup[normalizeString(subunit.name)] = { type: 'subunit', parentName: dept.name };
          });
        });
        
        setDepartmentHierarchy(hierarchical);
        setDepartmentLookup(lookup);
        
        const deptFileCount = new Map<string, number>();
        documents.forEach(doc => {
          if (doc.department) {
            deptFileCount.set(doc.department, (deptFileCount.get(doc.department) || 0) + 1);
          }
          if (doc.subunit) {
            deptFileCount.set(doc.subunit, (deptFileCount.get(doc.subunit) || 0) + 1);
          }
        });
        
        const departmentStats = (Array.isArray(flat) ? flat : []).map((dept: any) => ({
          id: dept.id || dept.name,
          name: dept.name || 'Unknown Department',
          code: dept.code || (dept.name ? dept.name.substring(0, 3).toUpperCase() : 'UNK'),
          fileCount: deptFileCount.get(dept.name) || 0
        }));
        
        setDepartments(departmentStats);
      } else {
        console.warn('Failed to fetch departments hierarchy');
        setDepartments([]);
        setDepartmentHierarchy([]);
        setDepartmentLookup({});
      }
      
    } catch (err) {
      console.error('Error loading departments:', err);
      // Fallback to empty array if departments API fails
      setDepartments([]);
      setDepartmentHierarchy([]);
      setDepartmentLookup({});
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

  const toggleFavorite = async (docId: string) => {
    try {
      const doc = documents.find(d => d.id === docId);
      const newFavoriteState = !doc?.isFavorite;

      const response = await fetch('/api/documents/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId, isFavorite: newFavoriteState })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      setDocuments(prev => prev.map(d => 
        d.id === docId ? { ...d, isFavorite: newFavoriteState } : d
      ));
      setRawDocuments(prev => prev.map(d => 
        d.id === docId ? { ...d, isFavorite: newFavoriteState } : d
      ));
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  const fetchDeletedDocuments = async () => {
    try {
      setLoadingTrash(true);
      const response = await fetch('/api/documents/trash');
      if (response.ok) {
        const data = await response.json();
        setDeletedDocs(data.documents || []);
      }
    } catch (err) {
      console.error('Error loading trash:', err);
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleRestore = async (docId: string) => {
    try {
      const response = await fetch('/api/documents/trash/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId })
      });

      if (response.ok) {
        await fetchDeletedDocuments();
        await loadDocuments();
        alert('Document restored successfully!');
      } else {
        alert('Failed to restore document');
      }
    } catch (err) {
      console.error('Restore error:', err);
      alert('Failed to restore document');
    }
  };

  const handlePermanentDelete = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${docName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/trash/permanent?id=${docId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchDeletedDocuments();
        alert('Document permanently deleted');
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document');
    }
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

  // Handle document click - navigate to document view
  const handleDocumentClick = (document: any) => {
    window.location.href = `/documents/${document.id}`;
  };

  // Handle document view in modal
  const handleDocumentView = (documentId: string) => {
    setViewingDocumentId(documentId);
    setShowViewModal(true);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Load data on component mount
  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      if (isAdmin && !hasReconciledRef.current) {
        hasReconciledRef.current = true;
        await reconcileDocuments();
      }

      if (!cancelled) {
        await loadDocuments();
      }

      if (!cancelled) {
        await loadDepartments();
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [session, isAdmin]);

  useEffect(() => {
    if (!rawDocuments || rawDocuments.length === 0) {
      setDocuments([]);
      setFileTypes([]);
      return;
    }
    
    const normalized = normalizeDocumentRecords(rawDocuments, departmentLookup);
    setDocuments(normalized);
    setFileTypes(calculateFileTypeStats(normalized));
  }, [rawDocuments, departmentLookup]);

  useEffect(() => {
    if (!rawPersonalDocuments || rawPersonalDocuments.length === 0) {
      setPersonalDocuments([]);
      return;
    }
    const normalizedPersonalDocs = normalizeDocumentRecords(rawPersonalDocuments, departmentLookup);
    setPersonalDocuments(normalizedPersonalDocs);
  }, [rawPersonalDocuments, departmentLookup]);

  // Load personal documents when My Documents tab is active
  useEffect(() => {
    if (session && activeTab === 'my-documents') {
      loadPersonalDocuments();
    }
  }, [session, activeTab]);

  // Load trash when Trash tab is active
  useEffect(() => {
    if (session && activeTab === 'trash') {
      fetchDeletedDocuments();
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

  // Load dashboard stats when dashboard tab is active
  useEffect(() => {
    if (session && activeTab === 'dashboard') {
      loadDashboardStats();
    }
  }, [session, activeTab]);

  useEffect(() => {
    if (departmentHierarchy.length > 0) {
      const mainStats: Department[] = departmentHierarchy.map((dept) => ({
        id: dept.id || slugify(dept.name),
        name: dept.name,
        code: dept.code || dept.name.substring(0, Math.min(3, dept.name.length)).toUpperCase(),
        fileCount: documents.filter(doc => doc.department === dept.name).length
      }));

      const subunitStats: Department[] = departmentHierarchy.flatMap((dept) =>
        (dept.subunits || []).map((subunit) => ({
          id: subunit.id || slugify(`${dept.name}-${subunit.name}`),
          name: subunit.name,
          code: subunit.name.substring(0, Math.min(3, subunit.name.length)).toUpperCase(),
          fileCount: documents.filter(doc => doc.department === dept.name && doc.subunit === subunit.name).length
        }))
      );

      const generalCount = documents.filter(doc => doc.department === 'General').length;
      const combined = [...mainStats, ...subunitStats];
      if (generalCount > 0) {
        combined.push({ id: 'general', name: 'General', code: 'GEN', fileCount: generalCount });
      }
      setDepartments(combined);
    } else if (documents.length > 0) {
      const counts = new Map<string, number>();
      documents.forEach(doc => {
        const key = doc.department || 'General';
        counts.set(key, (counts.get(key) || 0) + 1);
      });
      const fallback = Array.from(counts.entries()).map(([name, count]) => ({
        id: slugify(name),
        name,
        code: name.substring(0, Math.min(3, name.length)).toUpperCase(),
        fileCount: count
      }));
      setDepartments(fallback);
    }
  }, [departmentHierarchy, documents]);

  const visibleTabs = documentTabs.filter(tab => 
    !tab.adminOnly || isAdmin
  );

  const primaryTabs = visibleTabs.filter(tab => tab.primary);
  const secondaryTabs = visibleTabs.filter(tab => !tab.primary && !tab.adminOnly);
  const adminTabs = visibleTabs.filter(tab => tab.adminOnly);

  const getFileIcon = (rawType?: string, fileName?: string, mimeType?: string) => {
    const normalize = (value?: string | null) => value ? value.toLowerCase() : '';
    const extension =
      normalize(rawType) ||
      normalize(fileName?.split('.').pop()) ||
      normalize(mimeType?.split('/').pop());

    const iconMap: Record<string, any> = {
      pdf: DocumentTextIcon,
      doc: DocumentTextIcon,
      docx: DocumentTextIcon,
      odt: DocumentTextIcon,
      txt: DocumentTextIcon,
      rtf: DocumentTextIcon,
      xls: TableCellsIcon,
      xlsx: TableCellsIcon,
      csv: TableCellsIcon,
      ods: TableCellsIcon,
      ppt: PresentationChartBarIcon,
      pptx: PresentationChartBarIcon,
      odp: PresentationChartBarIcon,
      jpg: PhotoIcon,
      jpeg: PhotoIcon,
      png: PhotoIcon,
      gif: PhotoIcon,
      bmp: PhotoIcon,
      svg: PhotoIcon,
      heic: PhotoIcon,
      mp4: FilmIcon,
      avi: FilmIcon,
      mov: FilmIcon,
      mkv: FilmIcon,
      webm: FilmIcon,
      mp3: DocumentTextIcon,
      wav: DocumentTextIcon,
      ogg: DocumentTextIcon,
      zip: DocumentIcon,
      rar: DocumentIcon,
      '7z': DocumentIcon,
      gz: DocumentIcon,
      json: DocumentTextIcon,
      xml: DocumentTextIcon
    };

    return iconMap[extension] || DocumentIcon;
  };

  const getClassificationColor = (classification: string) => {
    const colorMap: { [key: string]: string } = {
      PUBLIC: 'bg-green-100 text-green-800',
      CONFIDENTIAL: 'bg-orange-100 text-orange-800',
      RESTRICTED: 'bg-red-100 text-red-800'
    };
    return colorMap[classification] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return 'Not available';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Not available';
    return parsed.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSizeDisplay = (value?: string | number | null) => {
    if (value === null || value === undefined) return '0 B';
    if (typeof value === 'number') {
      const megabytes = value / (1024 * 1024);
      if (megabytes >= 1) return `${megabytes.toFixed(1)} MB`;
      const kilobytes = value / 1024;
      if (kilobytes >= 1) return `${kilobytes.toFixed(1)} KB`;
      return `${value} B`;
    }

    const trimmed = value.trim();
    if (!trimmed) return '0 B';

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return formatFileSizeDisplay(numeric);
    }

    return trimmed;
  };

  function slugify(value: string) {
    if (!value) return 'item';
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  const normalizeDocumentRecord = (docParam: any, lookup: DepartmentLookup): Document => {
    const doc = { ...docParam } as Document & { customMetadata?: any };
    const folderSegments = doc.folderPath ? doc.folderPath.split('/').filter(Boolean) : [];
    
    let department = doc.department || docParam?.customMetadata?.department || (folderSegments.length > 0 ? folderSegments[0] : null);
    let category = doc.category && doc.category !== 'Uncategorized' ? doc.category : (docParam?.customMetadata?.category as string | undefined) || null;
    let subunit = doc.subunit || docParam?.customMetadata?.subunit || null;
    
    if (!category && folderSegments.length > 0) {
      category = folderSegments[folderSegments.length - 1];
    }
    
    if (!subunit && folderSegments.length > 2) {
      subunit = folderSegments.slice(1, folderSegments.length - 1).join('/');
    } else if (!subunit && folderSegments.length === 2) {
      const possibleSubunit = folderSegments[1];
      if (possibleSubunit !== department) {
        subunit = possibleSubunit;
      }
    }
    
    if (department) {
      const normalizedDeptName = normalizeString(department);
      const lookupEntry = lookup[normalizedDeptName];
      if (lookupEntry?.type === 'subunit') {
        subunit = lookupEntry.parentName ? department : subunit || department;
        department = lookupEntry.parentName || department;
      }
    }
    
    if (!department) {
      department = 'General';
    }
    
    if (!category) {
      category = 'OTHER';
    }
    
    const categoryDisplay = docParam?.customMetadata?.categoryDisplay || CATEGORY_DISPLAY_MAP[category] || category || CATEGORY_DISPLAY_MAP.OTHER;
    
    const pathSegments = [department];
    if (subunit) pathSegments.push(subunit);
    if (categoryDisplay) pathSegments.push(categoryDisplay);
    const folderPath = pathSegments.join('/');
    
    const typeExtension = doc.type?.toLowerCase() || doc.mimeType?.split('/')[1]?.toLowerCase() || doc.fileName?.split('.').pop()?.toLowerCase() || 'file';
    
    return {
      ...doc,
      department,
      subunit,
      category,
      categoryDisplay,
      folderPath,
      type: typeExtension,
      uploadDate: doc.uploadDate || doc.createdAt || new Date().toISOString(),
    };
  };

  const normalizeDocumentRecords = (docs: any[], lookup: DepartmentLookup): Document[] => {
    return (docs || []).map(doc => normalizeDocumentRecord(doc, lookup));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
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
              const FileIcon = getFileIcon(doc.type, doc.fileName, doc.mimeType);
              const securityInfo = getSecurityInfo(doc.classification);
              const SecurityIcon = securityInfo.icon;
              const hasAccess = canUserAccessDocument(doc, session?.user?.roles?.[0], session?.user?.permissions);
              const uploadedByDisplay = doc.uploadedBy && doc.uploadedBy !== 'Unknown'
                ? doc.uploadedBy
                : (doc.uploadedByEmail || 'Not specified');
              const formattedUploadDate = formatDateTime(doc.uploadDate || doc.createdAt);
              
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
                            {formatFileSizeDisplay(doc.size)}
                          </span>
                          {doc.department && (
                            <span className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                              {doc.department}
                            </span>
                          )}
                          <span className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {uploadedByDisplay}
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formattedUploadDate}
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
              const FileIcon = getFileIcon(doc.type, doc.fileName, doc.mimeType);
              const securityInfo = getSecurityInfo(doc.classification);
              const SecurityIcon = securityInfo.icon;
              const formattedUploadDate = formatDateTime(doc.uploadDate || doc.createdAt);
              
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
                            {doc.categoryDisplay || doc.category || 'General Document'}
                          </span>
                          {doc.department && (
                            <span className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                              {doc.department}
                            </span>
                          )}
                          <span className="flex items-center">
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            {formatFileSizeDisplay(doc.size)}
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formattedUploadDate}
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
  
  const renderDocumentRow = (doc: Document) => {
    const FileIcon = getFileIcon(doc.type, doc.fileName, doc.mimeType);
    return (
      <div 
        key={doc.id} 
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 cursor-pointer transition-colors group"
        onClick={() => handleDocumentClick(doc)}
      >
        <FileIcon className="h-4 w-4 text-gray-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 truncate group-hover:text-blue-600">
            {doc.title || doc.fileName}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSizeDisplay(doc.size)} • {formatDateTime(doc.uploadDate || doc.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(doc.id);
            }}
            className="p-1 rounded hover:bg-yellow-100 transition-colors"
            title={doc.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {doc.isFavorite ? (
              <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarIcon className="h-3 w-3 text-gray-400" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDocumentView(doc.id);
            }}
            className="p-1 rounded hover:bg-blue-100 transition-colors"
            title="View"
          >
            <EyeIcon className="h-3 w-3 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(doc.id, doc.fileName);
            }}
            className="p-1 rounded hover:bg-green-100 transition-colors"
            title="Download"
          >
            <ArrowDownTrayIcon className="h-3 w-3 text-green-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/documents/version-history?id=${doc.id}`;
            }}
            className="p-1 rounded hover:bg-purple-100 transition-colors"
            title="Version History"
          >
            <ClockIcon className="h-3 w-3 text-purple-600" />
          </button>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                confirmDocumentDelete(doc.id, doc.title || doc.fileName);
              }}
              className="p-1 rounded hover:bg-red-100 transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-3 w-3 text-red-600" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCategoryNode = (node: FolderNode) => {
    const categoryDocs = documents.filter(doc =>
      doc.department === node.department &&
      (node.subunit ? doc.subunit === node.subunit : !doc.subunit) &&
      (doc.categoryDisplay || doc.category || 'General Document') === node.name
    );

    return (
      <div key={node.id} className="space-y-1">
        <div className="flex items-center space-x-2 p-2 rounded-md bg-gray-50">
          <FolderIcon className="h-4 w-4 text-orange-400" />
          <span className="text-sm text-gray-700">{node.name}</span>
          <span className="text-xs text-gray-500">
            ({categoryDocs.length} document{categoryDocs.length === 1 ? '' : 's'})
          </span>
        </div>
        {categoryDocs.length > 0 ? (
          <div className="ml-6 space-y-1">
            {categoryDocs.slice(0, 10).map((doc) => renderDocumentRow(doc))}
            {categoryDocs.length > 10 && (
              <div className="text-xs text-gray-500 p-2">
                ...and {categoryDocs.length - 10} more document{categoryDocs.length - 10 === 1 ? '' : 's'}
              </div>
            )}
          </div>
        ) : (
          <div className="ml-6 text-xs text-gray-400 italic px-2">No documents yet</div>
        )}
      </div>
    );
  };

  const renderSubunitNode = (node: FolderNode) => {
    const isExpanded = expandedFolders.has(node.id);
    return (
      <div key={node.id} className="space-y-1">
        <div
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => toggleFolder(node.id)}
        >
          {node.children && node.children.length > 0 ? (
            isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            )
          ) : null}
          <FolderIcon className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-gray-700">{node.name}</span>
          <span className="text-xs text-gray-500">
            ({node.documentCount} document{node.documentCount === 1 ? '' : 's'})
          </span>
        </div>
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="ml-6 space-y-2">
            {node.children.map((categoryNode) => renderCategoryNode(categoryNode))}
          </div>
        )}
        {isExpanded && (!node.children || node.children.length === 0) && (
          <div className="ml-6 text-xs text-gray-400 italic px-2">No categories configured</div>
        )}
      </div>
    );
  };

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
        <div className="p-4">
          {folderStructure.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No folders available yet.</div>
          ) : (
            folderStructure.map((folder) => {
              const FolderMainIcon = folder.icon;
              const isExpanded = expandedFolders.has(folder.id);
              
              return (
                <div key={folder.id} className="mb-4">
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
                      <span className="text-sm text-gray-500">({folder.documentCount} document{folder.documentCount === 1 ? '' : 's'})</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="ml-8 mt-2 space-y-2">
                      {folder.children && folder.children.length > 0 ? (
                        folder.children.map((child) => {
                          if (child.type === 'subunit') {
                            return renderSubunitNode(child);
                          }
                          if (child.type === 'category') {
                            return renderCategoryNode(child);
                          }
                          return null;
                        })
                      ) : (
                        <div className="text-xs text-gray-400 italic px-2">No categories available</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderSearch = () => {
    const filteredResults = documents.filter(doc => {
      const queryLower = searchQuery.toLowerCase();
      const matchesQuery = !searchQuery || 
        doc.title?.toLowerCase().includes(queryLower) ||
        doc.fileName?.toLowerCase().includes(queryLower) ||
        doc.description?.toLowerCase().includes(queryLower) ||
        doc.department?.toLowerCase().includes(queryLower) ||
        doc.category?.toLowerCase().includes(queryLower);
      return matchesQuery;
    });

    return (
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
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-sm"
                  >
                    <option value="all">All File Types</option>
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
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Search Results */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Search Results</h4>
              <p className="text-xs text-gray-500">Found {filteredResults.length} document{filteredResults.length === 1 ? '' : 's'}</p>
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
            {filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No search results</h3>
                <p className="text-sm text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredResults.map((doc) => {
                  const FileIcon = getFileIcon(doc.type, doc.fileName, doc.mimeType);
                  return (
                    <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <FileIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{doc.title}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{formatFileSizeDisplay(doc.size)}</span>
                              {doc.department && <span>{doc.department}</span>}
                              <span>{formatDateTime(doc.uploadDate || doc.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(doc.id);
                            }}
                            className="p-1.5 rounded hover:bg-yellow-100 transition-colors"
                            title={doc.isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            {doc.isFavorite ? (
                              <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <StarIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingDocumentId(doc.id);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-saywhat-orange rounded-md transition-colors"
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(doc.id, doc.title);
                            }}
                            className="p-1.5 text-gray-400 hover:text-saywhat-orange rounded-md transition-colors"
                            title="Download"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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

  const renderFavorites = () => {
    const favoriteDocuments = documents.filter(doc => doc.isFavorite);

    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Favorites</h3>
            <p className="text-sm text-gray-500">{favoriteDocuments.length} bookmarked document{favoriteDocuments.length === 1 ? '' : 's'}</p>
          </div>
        </div>
        <div className="p-6">
          {favoriteDocuments.length === 0 ? (
            <div className="text-center py-12">
              <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No favorites yet</p>
              <p className="text-gray-400 text-sm">Click the star icon on any document to add it to favorites</p>
            </div>
          ) : (
            <div className="space-y-1">
              {favoriteDocuments.map(doc => {
                const FileIcon = getFileIcon(doc.type, doc.fileName, doc.mimeType);
                return (
                  <div 
                    key={doc.id} 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-yellow-50 cursor-pointer transition-colors group border border-transparent hover:border-yellow-200"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <FileIcon className="h-5 w-5 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-yellow-700">
                        {doc.title || doc.fileName}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{formatFileSizeDisplay(doc.size)}</span>
                        {doc.department && <span>• {doc.department}</span>}
                        <span>• {formatDateTime(doc.uploadDate || doc.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(doc.id);
                        }}
                        className="p-1.5 rounded hover:bg-red-100 transition-colors"
                        title="Remove from favorites"
                      >
                        <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentView(doc.id);
                        }}
                        className="p-1.5 rounded hover:bg-blue-100 transition-colors"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(doc.id, doc.fileName);
                        }}
                        className="p-1.5 rounded hover:bg-green-100 transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 text-green-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    const pendingApprovals = documents.filter(doc => 
      doc.classification === 'PENDING_REVIEW' || 
      doc.classification === 'PENDING_APPROVAL'
    );

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 mr-2 text-saywhat-orange" />
                Tasks & Approvals
              </CardTitle>
              <Badge className="bg-orange-100 text-orange-800">
                {pendingApprovals.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Tasks</h3>
                <p className="text-gray-500">All documents have been reviewed and approved.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map(doc => {
                  const FileIcon = getFileIcon(doc.type, doc.fileName, doc.mimeType);
                  return (
                    <div key={doc.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:bg-orange-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <FileIcon className="h-6 w-6 text-orange-600 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">{doc.title || doc.fileName}</h4>
                            <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                              <span>Uploaded by: {doc.uploadedBy}</span>
                              <span>•</span>
                              <span>{formatDateTime(doc.uploadDate || doc.createdAt)}</span>
                            </div>
                            {doc.description && (
                              <p className="text-sm text-gray-700 mb-2">{doc.description}</p>
                            )}
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{doc.category || 'N/A'}</Badge>
                              <Badge className="bg-orange-500 text-white">Pending Review</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            onClick={() => handleDocumentView(doc.id)}
                            size="sm"
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            onClick={() => alert('Approval workflow coming soon')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTrash = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <TrashIcon className="h-6 w-6 mr-2 text-red-600" />
                Trash
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-100 text-red-800">
                  {deletedDocs.length} item{deletedDocs.length === 1 ? '' : 's'}
                </Badge>
                <Button onClick={fetchDeletedDocuments} variant="outline" size="sm">
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingTrash ? (
              <div className="text-center py-8">
                <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Loading deleted documents...</p>
              </div>
            ) : deletedDocs.length === 0 ? (
              <div className="text-center py-12">
                <TrashIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trash is Empty</h3>
                <p className="text-gray-500">No deleted documents to display.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deletedDocs.map(doc => {
                  const FileIcon = getFileIcon(doc.type, doc.fileName, doc.mimeType);
                  return (
                    <div key={doc.id} className="border border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <FileIcon className="h-6 w-6 text-red-600 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">{doc.title || doc.fileName}</h4>
                            <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                              <span>{formatFileSizeDisplay(doc.size)}</span>
                              <span>•</span>
                              <span>Deleted: {formatDateTime(doc.modifiedAt)}</span>
                            </div>
                            {doc.department && (
                              <Badge variant="outline" className="text-xs">{doc.department}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            onClick={() => handleRestore(doc.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                          >
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            onClick={() => handlePermanentDelete(doc.id, doc.title || doc.fileName)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 whitespace-nowrap"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete Forever
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trash Info */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <p className="font-semibold mb-1">About Trash</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-800">
                  <li>Deleted documents are kept for 30 days before permanent deletion</li>
                  <li>You can restore documents at any time during this period</li>
                  <li>Permanent deletion removes all versions and cannot be undone</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAdminConsole = () => {
    const totalStorage = documents.reduce((sum, doc) => {
      const size = typeof doc.size === 'number' ? doc.size : parseInt(String(doc.size)) || 0;
      return sum + size;
    }, 0);
    const storageGB = (totalStorage / 1024 / 1024 / 1024).toFixed(2);

    const publicDocs = documents.filter(doc => doc.classification === 'PUBLIC').length;
    const confidentialDocs = documents.filter(doc => doc.classification === 'CONFIDENTIAL').length;
    const secretDocs = documents.filter(doc => doc.classification === 'SECRET').length;

    const uniqueUploaders = new Set(documents.map(doc => doc.uploadedBy)).size;

    return (
      <div className="space-y-6 relative">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Documents</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{documents.length}</p>
                </div>
                <DocumentIcon className="h-12 w-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Total Storage</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{storageGB} GB</p>
                </div>
                <CloudIcon className="h-12 w-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Active Users</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">{uniqueUploaders}</p>
                </div>
                <UserGroupIcon className="h-12 w-12 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900">Departments</p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">{departments.length}</p>
                </div>
                <BuildingOfficeIcon className="h-12 w-12 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => window.location.href = '/admin/users'}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-saywhat-orange to-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-saywhat-orange transition-colors">User Management</h3>
                  <p className="text-sm text-gray-600 mb-3">Manage users and permissions</p>
                  <div className="flex items-center text-sm text-saywhat-orange">
                    <span>Manage users</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => window.location.href = '/documents/analytics'}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ChartPieIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Analytics Dashboard</h3>
                  <p className="text-sm text-gray-600 mb-3">Storage and usage analytics</p>
                  <div className="flex items-center text-sm text-blue-600">
                    <span>View analytics</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => setActiveTab('trash')}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <TrashIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">Trash Management</h3>
                  <p className="text-sm text-gray-600 mb-3">Manage deleted documents</p>
                  <div className="flex items-center text-sm text-red-600">
                    <span>View trash</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => window.location.href = '/documents/audit'}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">Security & Audit</h3>
                  <p className="text-sm text-gray-600 mb-3">Audit logs and security settings</p>
                  <div className="flex items-center text-sm text-purple-600">
                    <span>View audit logs</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => window.location.href = '/documents/reports'}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">Generate Reports</h3>
                  <p className="text-sm text-gray-600 mb-3">Create custom document reports</p>
                  <div className="flex items-center text-sm text-green-600">
                    <span>Create reports</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => window.location.href = '/documents/version-history'}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ClockIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-600 transition-colors">Version History</h3>
                  <p className="text-sm text-gray-600 mb-3">Track document changes</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>View versions</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Classification Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheckIcon className="h-6 w-6 mr-2 text-saywhat-orange" />
              Security Classification Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Public</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{publicDocs}</p>
                  </div>
                  <ShareIcon className="h-10 w-10 text-green-600 opacity-50" />
                </div>
                <p className="text-xs text-green-700 mt-2">
                  {documents.length > 0 ? ((publicDocs / documents.length) * 100).toFixed(1) : 0}% of total
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-900">Confidential</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">{confidentialDocs}</p>
                  </div>
                  <LockClosedIcon className="h-10 w-10 text-orange-600 opacity-50" />
                </div>
                <p className="text-xs text-orange-700 mt-2">
                  {documents.length > 0 ? ((confidentialDocs / documents.length) * 100).toFixed(1) : 0}% of total
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-900">Secret</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">{secretDocs}</p>
                  </div>
                  <ExclamationTriangleIcon className="h-10 w-10 text-red-600 opacity-50" />
                </div>
                <p className="text-xs text-red-700 mt-2">
                  {documents.length > 0 ? ((secretDocs / documents.length) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
  };

  const confirmDocumentDelete = (id: string, name: string) => {
    setDeleteConfirmation({ id, name });
  };

  const handleDocumentDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      const response = await fetch(`/api/documents/${deleteConfirmation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Failed to delete document');
        return;
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteConfirmation.id));
      setRawDocuments((prev) => prev.filter((doc) => doc.id !== deleteConfirmation.id));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <ModulePage
      metadata={{
        title: "Documents",
        description: "Comprehensive document management system",
        breadcrumbs: []
      }}
      actions={
        <div className="flex items-center justify-between w-full bg-white shadow-sm border-b border-gray-100 px-6 py-4">
          {/* Left Side - Dashboard + Enhanced Navigation tabs */}
          <nav className="flex items-center space-x-2" aria-label="Document Navigation">
            {/* Dashboard Icon - Show documents dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center px-3 py-3 border rounded-lg transition-all duration-200 group ${
                activeTab === 'dashboard'
                  ? 'text-saywhat-orange bg-orange-50 border-orange-300'
                  : 'text-gray-600 hover:text-saywhat-orange hover:bg-orange-50 border-gray-200 hover:border-orange-300'
              }`}
              title="Documents Dashboard - View recent files and statistics"
            >
              <HomeIcon className={`h-5 w-5 transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'text-saywhat-orange' 
                  : 'text-gray-500 group-hover:text-saywhat-orange'
              }`} />
            </button>
            
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
                  <a
                    href="/documents/version-history"
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <div className="bg-gray-600 p-2 rounded-md mr-3 group-hover:bg-gray-700 transition-colors">
                      <ClockIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Version History</div>
                      <div className="text-xs text-gray-500">Track changes</div>
                    </div>
                  </a>
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
                  <a 
                    href="/documents/analytics"
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <div className="bg-saywhat-orange p-2 rounded-md mr-3 group-hover:bg-orange-600 transition-colors">
                      <ChartBarIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Analytics Dashboard</div>
                      <div className="text-xs text-gray-500">View insights</div>
                    </div>
                  </a>
                  
                  {/* Generate Reports */}
                  <a 
                    href="/documents/reports"
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <div className="bg-green-600 p-2 rounded-md mr-3 group-hover:bg-green-700 transition-colors">
                      <DocumentTextIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Generate Reports</div>
                      <div className="text-xs text-gray-500">Create reports</div>
                    </div>
                  </a>
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

        {showViewModal && viewingDocumentId && (
          <DocumentViewModal
            documentId={viewingDocumentId}
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setViewingDocumentId(null);
            }}
          />
        )}

        {deleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete "{deleteConfirmation.name}"? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDocumentDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  );
}

const normalizeString = (value?: string | null) => (value ? value.trim().toLowerCase() : "");
