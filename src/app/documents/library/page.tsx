"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import { 
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CalendarIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CloudArrowUpIcon,
  BookmarkIcon,
  StarIcon,
  HeartIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

// Security classifications
const securityClassifications = {
  "PUBLIC": { color: "text-green-600 bg-green-100", icon: ShareIcon },
  "INTERNAL": { color: "text-blue-600 bg-blue-100", icon: UserIcon },
  "CONFIDENTIAL": { color: "text-yellow-600 bg-yellow-100", icon: LockClosedIcon },
  "RESTRICTED": { color: "text-red-600 bg-red-100", icon: ShieldCheckIcon }
};

// View modes
type ViewMode = "grid" | "list" | "tree";

// Mock folder structure
const folderStructure = [
  {
    id: "1",
    name: "Annual Reports",
    type: "folder",
    path: "/Reports/Annual",
    children: [
      { id: "1-1", name: "2024", type: "folder", path: "/Reports/Annual/2024" },
      { id: "1-2", name: "2023", type: "folder", path: "/Reports/Annual/2023" },
      { id: "1-3", name: "Archives", type: "folder", path: "/Reports/Annual/Archives" }
    ]
  },
  {
    id: "2",
    name: "Policies & Procedures",
    type: "folder",
    path: "/Policies",
    children: [
      { id: "2-1", name: "HR Policies", type: "folder", path: "/Policies/HR" },
      { id: "2-2", name: "Financial Policies", type: "folder", path: "/Policies/Financial" },
      { id: "2-3", name: "IT Policies", type: "folder", path: "/Policies/IT" }
    ]
  },
  {
    id: "3",
    name: "Financial Documents",
    type: "folder",
    path: "/Finance",
    children: [
      { id: "3-1", name: "Quarterly Reports", type: "folder", path: "/Finance/Quarterly" },
      { id: "3-2", name: "Budget Plans", type: "folder", path: "/Finance/Budget" },
      { id: "3-3", name: "Audit Reports", type: "folder", path: "/Finance/Audit" }
    ]
  }
];

// Mock documents
const mockDocuments = [
  {
    id: "doc1",
    title: "Annual Report 2024",
    fileName: "annual-report-2024.pdf",
    description: "Comprehensive annual report covering organizational performance and strategic initiatives",
    classification: "PUBLIC",
    type: "PDF",
    size: "2.4 MB",
    uploadedBy: "Sarah Johnson",
    uploadDate: "2024-01-15T10:30:00Z",
    lastModified: "2024-01-15T10:30:00Z",
    version: "1.0",
    tags: ["annual-report", "2024", "performance", "strategic"],
    folder: "/Reports/Annual/2024",
    downloadCount: 156,
    viewCount: 423,
    favoriteCount: 12,
    thumbnail: null,
    aiScore: {
      sentiment: 0.8,
      readability: 0.75,
      quality: 0.9
    },
    permissions: {
      canView: true,
      canDownload: true,
      canEdit: true,
      canDelete: true,
      canShare: true
    }
  },
  {
    id: "doc2",
    title: "Data Protection Policy",
    fileName: "data-protection-policy-v2.1.docx",
    description: "Updated data protection and privacy policy aligned with international standards",
    classification: "INTERNAL",
    type: "Word",
    size: "856 KB",
    uploadedBy: "Michael Chen",
    uploadDate: "2024-01-10T14:20:00Z",
    lastModified: "2024-01-12T09:15:00Z",
    version: "2.1",
    tags: ["policy", "data-protection", "privacy", "compliance"],
    folder: "/Policies/IT",
    downloadCount: 89,
    viewCount: 234,
    favoriteCount: 8,
    thumbnail: null,
    aiScore: {
      sentiment: 0.6,
      readability: 0.65,
      quality: 0.85
    },
    permissions: {
      canView: true,
      canDownload: true,
      canEdit: false,
      canDelete: false,
      canShare: true
    }
  },
  {
    id: "doc3",
    title: "Q4 Financial Statement",
    fileName: "q4-financial-statement.xlsx",
    description: "Quarterly financial statement with detailed analysis and budget allocations",
    classification: "CONFIDENTIAL",
    type: "Excel",
    size: "1.2 MB",
    uploadedBy: "Emily Rodriguez",
    uploadDate: "2024-01-08T16:45:00Z",
    lastModified: "2024-01-09T11:30:00Z",
    version: "1.0",
    tags: ["financial", "q4", "budget", "analysis"],
    folder: "/Finance/Quarterly",
    downloadCount: 67,
    viewCount: 145,
    favoriteCount: 15,
    thumbnail: null,
    aiScore: {
      sentiment: 0.7,
      readability: 0.8,
      quality: 0.92
    },
    permissions: {
      canView: true,
      canDownload: true,
      canEdit: true,
      canDelete: false,
      canShare: false
    }
  },
  {
    id: "doc4",
    title: "Board Meeting Minutes - January 2024",
    fileName: "board-minutes-jan-2024.pdf",
    description: "Official minutes from January 2024 board meeting with strategic decisions",
    classification: "RESTRICTED",
    type: "PDF",
    size: "492 KB",
    uploadedBy: "David Wilson",
    uploadDate: "2024-01-05T09:00:00Z",
    lastModified: "2024-01-05T09:00:00Z",
    version: "1.0",
    tags: ["board", "meeting", "minutes", "governance"],
    folder: "/Governance/Board",
    downloadCount: 12,
    viewCount: 34,
    favoriteCount: 3,
    thumbnail: null,
    aiScore: {
      sentiment: 0.65,
      readability: 0.7,
      quality: 0.88
    },
    permissions: {
      canView: true,
      canDownload: false,
      canEdit: false,
      canDelete: false,
      canShare: false
    }
  },
  {
    id: "doc5",
    title: "Customer Service Training Manual",
    fileName: "customer-service-training.pdf",
    description: "Comprehensive training manual for customer service representatives",
    classification: "INTERNAL",
    type: "PDF",
    size: "3.1 MB",
    uploadedBy: "Lisa Thompson",
    uploadDate: "2024-01-03T13:20:00Z",
    lastModified: "2024-01-04T16:45:00Z",
    version: "1.5",
    tags: ["training", "customer-service", "manual", "procedures"],
    folder: "/Training/Customer",
    downloadCount: 234,
    viewCount: 567,
    favoriteCount: 28,
    thumbnail: null,
    aiScore: {
      sentiment: 0.85,
      readability: 0.9,
      quality: 0.87
    },
    permissions: {
      canView: true,
      canDownload: true,
      canEdit: true,
      canDelete: true,
      canShare: true
    }
  }
];

export default function DocumentLibraryPage() {
  const { data: session } = useSession();
  
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastModified");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["1", "2", "3"]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [documents, setDocuments] = useState(mockDocuments);

  // Check permissions
  const hasAccess = session?.user?.permissions?.includes("documents.view") ||
                   session?.user?.permissions?.includes("documents.full_access");

  if (!hasAccess) {
    return (
      <ModulePage
        metadata={{
          title: "Document Library",
          description: "Access Denied",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Library" }
          ]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view the document library.
          </p>
        </div>
      </ModulePage>
    );
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllDocuments = () => {
    setSelectedDocuments(filteredDocuments.map(doc => doc.id));
  };

  const deselectAllDocuments = () => {
    setSelectedDocuments([]);
  };

  const getDocumentIcon = (type: string) => {
    return DocumentIcon;
  };

  const getClassificationColor = (classification: string) => {
    return securityClassifications[classification as keyof typeof securityClassifications]?.color || "text-gray-600 bg-gray-100";
  };

  const getClassificationIcon = (classification: string) => {
    return securityClassifications[classification as keyof typeof securityClassifications]?.icon || LockClosedIcon;
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterBy === "all" || 
      (filterBy === "favorites" && doc.favoriteCount > 10) ||
      (filterBy === "recent" && new Date(doc.uploadDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      doc.classification === filterBy;
    
    const matchesFolder = !selectedFolder || doc.folder.startsWith(selectedFolder);
    
    return matchesSearch && matchesFilter && matchesFolder;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "size":
        return parseFloat(b.size) - parseFloat(a.size);
      case "uploadDate":
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case "lastModified":
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });

  return (
    <ModulePage
      metadata={{
        title: "Document Library",
        description: "Browse and manage organizational documents",
        breadcrumbs: [
          { name: "Document Repository", href: "/documents" },
          { name: "Library" }
        ]
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
                  placeholder="Search documents..."
                />
              </div>

              {/* Filters */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Documents</option>
                <option value="recent">Recent</option>
                <option value="favorites">Favorites</option>
                <option value="PUBLIC">Public</option>
                <option value="INTERNAL">Internal</option>
                <option value="CONFIDENTIAL">Confidential</option>
                <option value="RESTRICTED">Restricted</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="lastModified">Last Modified</option>
                <option value="uploadDate">Upload Date</option>
                <option value="title">Title</option>
                <option value="size">File Size</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm ${
                  showFilters ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700"
                }`}
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filters
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Selection Actions */}
              {selectedDocuments.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{selectedDocuments.length} selected</span>
                  <button
                    onClick={deselectAllDocuments}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                  <button className="text-blue-600 hover:text-blue-700">
                    Download
                  </button>
                  <button className="text-blue-600 hover:text-blue-700">
                    Share
                  </button>
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>

              {/* New Document Button */}
              <button
                onClick={() => window.location.href = '/documents/upload'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>All Types</option>
                    <option>PDF Documents</option>
                    <option>Word Documents</option>
                    <option>Excel Spreadsheets</option>
                    <option>PowerPoint Presentations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>All Time</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uploaded By
                  </label>
                  <input
                    type="text"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="User name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Size
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>Any Size</option>
                    <option>Small (&lt; 1MB)</option>
                    <option>Medium (1-10MB)</option>
                    <option>Large (&gt; 10MB)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Folder Tree Sidebar */}
          <div className="w-80 bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Folders</h3>
              <button
                onClick={() => setSelectedFolder(null)}
                className={`text-sm px-2 py-1 rounded ${
                  !selectedFolder ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
            </div>

            <div className="space-y-1">
              {folderStructure.map((folder) => (
                <div key={folder.id}>
                  <div
                    className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer ${
                      selectedFolder === folder.path ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                    onClick={() => setSelectedFolder(folder.path)}
                  >
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder(folder.id);
                        }}
                        className="mr-1"
                      >
                        {expandedFolders.includes(folder.id) ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                      <FolderIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{folder.name}</span>
                    </div>
                  </div>

                  {expandedFolders.includes(folder.id) && folder.children && (
                    <div className="ml-6 space-y-1">
                      {folder.children.map((child) => (
                        <div
                          key={child.id}
                          className={`flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer ${
                            selectedFolder === child.path ? "bg-blue-50 text-blue-700" : "text-gray-600"
                          }`}
                          onClick={() => setSelectedFolder(child.path)}
                        >
                          <FolderIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm">{child.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents Display */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white shadow rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {sortedDocuments.length} document{sortedDocuments.length !== 1 ? 's' : ''}
                  </span>
                  {selectedFolder && (
                    <span className="text-sm text-gray-500">in {selectedFolder}</span>
                  )}
                </div>
                {sortedDocuments.length > 0 && (
                  <button
                    onClick={selectAllDocuments}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </button>
                )}
              </div>
            </div>

            {/* Documents Grid/List */}
            {sortedDocuments.length > 0 ? (
              <div className="bg-white shadow rounded-lg">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {sortedDocuments.map((doc) => {
                      const DocIcon = getDocumentIcon(doc.type);
                      const ClassificationIcon = getClassificationIcon(doc.classification);
                      const isSelected = selectedDocuments.includes(doc.id);
                      
                      return (
                        <div
                          key={doc.id}
                          className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                            isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          }`}
                          onClick={() => toggleDocumentSelection(doc.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <DocIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getClassificationColor(doc.classification)}`}>
                              <ClassificationIcon className="h-3 w-3 mr-1" />
                              {doc.classification}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                            {doc.title}
                          </h4>
                          
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {doc.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {doc.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{doc.tags.length - 2}</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>v{doc.version}</span>
                          </div>

                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <UserIcon className="h-3 w-3 mr-1" />
                            <span className="truncate">{doc.uploadedBy}</span>
                          </div>

                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            <span>{formatDate(doc.lastModified)}</span>
                          </div>

                          {/* AI Score Indicators */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center">
                              <HeartIcon className="h-3 w-3 mr-1" />
                              <span>{(doc.aiScore.sentiment * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center">
                              <ChartBarIcon className="h-3 w-3 mr-1" />
                              <span>{(doc.aiScore.readability * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center">
                              <StarIcon className="h-3 w-3 mr-1" />
                              <span>{(doc.aiScore.quality * 100).toFixed(0)}%</span>
                            </div>
                          </div>

                          {/* Usage Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div className="flex items-center">
                              <EyeIcon className="h-3 w-3 mr-1" />
                              <span>{doc.viewCount}</span>
                            </div>
                            <div className="flex items-center">
                              <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                              <span>{doc.downloadCount}</span>
                            </div>
                            <div className="flex items-center">
                              <BookmarkIcon className="h-3 w-3 mr-1" />
                              <span>{doc.favoriteCount}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {doc.permissions.canView && (
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              )}
                              {doc.permissions.canDownload && (
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <ArrowDownTrayIcon className="h-4 w-4" />
                                </button>
                              )}
                              {doc.permissions.canShare && (
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <ShareIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {doc.permissions.canEdit && (
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              )}
                              {doc.permissions.canDelete && (
                                <button className="p-1 text-red-400 hover:text-red-600">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {sortedDocuments.map((doc) => {
                      const DocIcon = getDocumentIcon(doc.type);
                      const ClassificationIcon = getClassificationIcon(doc.classification);
                      const isSelected = selectedDocuments.includes(doc.id);
                      
                      return (
                        <div
                          key={doc.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            isSelected ? "bg-blue-50" : ""
                          }`}
                          onClick={() => toggleDocumentSelection(doc.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleDocumentSelection(doc.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <DocIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-1">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {doc.title}
                                  </h4>
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getClassificationColor(doc.classification)}`}>
                                    <ClassificationIcon className="h-3 w-3 mr-1" />
                                    {doc.classification}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate mb-2">
                                  {doc.description}
                                </p>
                                <div className="flex items-center space-x-6 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <UserIcon className="h-3 w-3 mr-1" />
                                    {doc.uploadedBy}
                                  </span>
                                  <span className="flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {formatDate(doc.lastModified)}
                                  </span>
                                  <span>{formatFileSize(doc.size)}</span>
                                  <span>v{doc.version}</span>
                                  <span className="flex items-center">
                                    <EyeIcon className="h-3 w-3 mr-1" />
                                    {doc.viewCount}
                                  </span>
                                  <span className="flex items-center">
                                    <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                                    {doc.downloadCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {doc.permissions.canView && (
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              )}
                              {doc.permissions.canDownload && (
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                                  <ArrowDownTrayIcon className="h-4 w-4" />
                                </button>
                              )}
                              {doc.permissions.canShare && (
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                                  <ShareIcon className="h-4 w-4" />
                                </button>
                              )}
                              {doc.permissions.canEdit && (
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              )}
                              {doc.permissions.canDelete && (
                                <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-12 text-center">
                <DocumentIcon className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery || filterBy !== "all" || selectedFolder
                    ? "Try adjusting your search or filters."
                    : "Get started by uploading your first document."
                  }
                </p>
                {!searchQuery && filterBy === "all" && !selectedFolder && (
                  <button
                    onClick={() => window.location.href = '/documents/upload'}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Upload Document
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
