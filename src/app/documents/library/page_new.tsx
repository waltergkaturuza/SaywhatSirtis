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

// Security classifications with SAYWHAT colors
const securityClassifications = {
  "PUBLIC": { color: "text-green-600 bg-green-100", icon: ShareIcon },
  "CONFIDENTIAL": { color: "text-saywhat-orange bg-orange-100", icon: LockClosedIcon },
  "SECRET": { color: "text-saywhat-red bg-red-100", icon: ShieldCheckIcon },
  "TOP_SECRET": { color: "text-red-800 bg-red-200", icon: ExclamationTriangleIcon }
};

// View modes
type ViewMode = "grid" | "list" | "tree";

// Document categories for folder structure
const documentCategories = [
  { id: "ACTIVITY_REPORTS", name: "Activity Reports", path: "/activity-reports" },
  { id: "BASELINE_REPORTS", name: "Baseline Reports", path: "/baseline-reports" },
  { id: "DONOR_REPORTS", name: "Donor Reports", path: "/donor-reports" },
  { id: "FINANCIAL_REPORTS", name: "Financial Reports", path: "/financial-reports" },
  { id: "GOVERNANCE_DOCUMENTS", name: "Governance Documents", path: "/governance-documents" },
  { id: "GRANT_APPLICATIONS", name: "Grant Applications", path: "/grant-applications" },
  { id: "HEALTH_RECORDS", name: "Health Records", path: "/health-records" },
  { id: "IMPACT_ASSESSMENTS", name: "Impact Assessments", path: "/impact-assessments" },
  { id: "LEGAL_DOCUMENTS", name: "Legal Documents", path: "/legal-documents" },
  { id: "MONITORING_REPORTS", name: "Monitoring Reports", path: "/monitoring-reports" },
  { id: "OPERATIONAL_GUIDELINES", name: "Operational Guidelines", path: "/operational-guidelines" },
  { id: "PARTNERSHIP_AGREEMENTS", name: "Partnership Agreements", path: "/partnership-agreements" },
  { id: "POLICY_DOCUMENTS", name: "Policy Documents", path: "/policy-documents" },
  { id: "PROGRAM_PROPOSALS", name: "Program Proposals", path: "/program-proposals" },
  { id: "RESEARCH_STUDIES", name: "Research Studies", path: "/research-studies" },
  { id: "STRATEGIC_PLANS", name: "Strategic Plans", path: "/strategic-plans" },
  { id: "TECHNICAL_DOCUMENTATION", name: "Technical Documentation", path: "/technical-documentation" },
  { id: "TRAINING_MATERIALS", name: "Training Materials", path: "/training-materials" }
];

export default function DocumentLibraryPage() {
  const { data: session } = useSession();
  
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastModified");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents from API
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        setError(data.error || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

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
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-saywhat-red" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-saywhat-grey">
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
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterBy === "all" || 
      (filterBy === "favorites" && doc.favoriteCount > 10) ||
      (filterBy === "recent" && new Date(doc.uploadDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      doc.classification === filterBy;
    
    const matchesFolder = !selectedFolder || doc.folder?.startsWith(selectedFolder);
    
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

  if (loading) {
    return (
      <ModulePage
        metadata={{
          title: "Document Library",
          description: "Loading documents...",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Library" }
          ]
        }}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange"></div>
          <span className="ml-3 text-saywhat-grey">Loading documents...</span>
        </div>
      </ModulePage>
    );
  }

  if (error) {
    return (
      <ModulePage
        metadata={{
          title: "Document Library",
          description: "Error loading documents",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Library" }
          ]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-saywhat-red" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Documents</h3>
          <p className="mt-1 text-sm text-saywhat-grey">{error}</p>
          <button
            onClick={fetchDocuments}
            className="mt-4 px-4 py-2 bg-saywhat-orange text-white rounded-md hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </ModulePage>
    );
  }

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
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange w-64"
                  placeholder="Search documents..."
                />
              </div>

              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
              >
                <option value="all">All Documents</option>
                <option value="recent">Recent</option>
                <option value="favorites">Favorites</option>
                <option value="PUBLIC">Public</option>
                <option value="CONFIDENTIAL">Confidential</option>
                <option value="SECRET">Secret</option>
                <option value="TOP_SECRET">Top Secret</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
              >
                <option value="lastModified">Last Modified</option>
                <option value="uploadDate">Upload Date</option>
                <option value="title">Title</option>
                <option value="size">File Size</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm ${
                  showFilters ? "bg-orange-50 text-saywhat-orange" : "bg-white text-gray-700"
                }`}
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filters
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Selection Actions */}
              {selectedDocuments.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-saywhat-grey">
                  <span>{selectedDocuments.length} selected</span>
                  <button
                    onClick={deselectAllDocuments}
                    className="text-saywhat-orange hover:text-orange-600"
                  >
                    Clear
                  </button>
                  <button className="text-saywhat-orange hover:text-orange-600">
                    Download
                  </button>
                  <button className="text-saywhat-orange hover:text-orange-600">
                    Share
                  </button>
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-orange-50 text-saywhat-orange" : "text-gray-400"}`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-orange-50 text-saywhat-orange" : "text-gray-400"}`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>

              {/* New Document Button */}
              <button
                onClick={() => window.location.href = '/documents/upload'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-orange-600"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Category
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange">
                    <option>All Categories</option>
                    {documentCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange">
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
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange">
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
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange"
                    placeholder="User name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Size
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange">
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
              <h3 className="text-lg font-medium text-gray-900">Categories</h3>
              <button
                onClick={() => setSelectedFolder(null)}
                className={`text-sm px-2 py-1 rounded ${
                  !selectedFolder ? "bg-orange-100 text-saywhat-orange" : "text-saywhat-grey hover:text-gray-900"
                }`}
              >
                All
              </button>
            </div>

            <div className="space-y-1">
              {documentCategories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer ${
                    selectedFolder === category.path ? "bg-orange-50 text-saywhat-orange" : "text-gray-700"
                  }`}
                  onClick={() => setSelectedFolder(category.path)}
                >
                  <div className="flex items-center">
                    <FolderIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{category.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {documents.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <DocumentIcon className="mx-auto h-12 w-12 text-saywhat-grey" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                <p className="mt-1 text-sm text-saywhat-grey">
                  Get started by uploading your first document.
                </p>
                <button
                  onClick={() => window.location.href = '/documents/upload'}
                  className="mt-4 px-4 py-2 bg-saywhat-orange text-white rounded-md hover:bg-orange-600"
                >
                  Upload Document
                </button>
              </div>
            ) : (
              <>
                {/* Results Summary */}
                <div className="mb-4 text-sm text-saywhat-grey">
                  Showing {sortedDocuments.length} of {documents.length} documents
                </div>

                {/* Document Grid/List */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedDocuments.map((doc) => (
                      <div key={doc.id} className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <DocumentIcon className="h-8 w-8 text-saywhat-orange" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
                              <p className="text-xs text-saywhat-grey">{doc.fileName}</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={() => toggleDocumentSelection(doc.id)}
                            className="text-saywhat-orange"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-saywhat-grey mb-3">
                          <span>{doc.size}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getClassificationColor(doc.classification)}`}>
                            {doc.classification}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-saywhat-grey">{formatDate(doc.uploadDate)}</span>
                          <div className="flex space-x-1">
                            <button className="p-1 text-saywhat-grey hover:text-saywhat-orange">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-saywhat-grey hover:text-saywhat-orange">
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-saywhat-grey hover:text-saywhat-orange">
                              <ShareIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              onChange={(e) => e.target.checked ? selectAllDocuments() : deselectAllDocuments()}
                              className="text-saywhat-orange"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Document
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Classification
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Modified
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedDocuments.includes(doc.id)}
                                onChange={() => toggleDocumentSelection(doc.id)}
                                className="text-saywhat-orange"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <DocumentIcon className="h-6 w-6 text-saywhat-orange" />
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                                  <div className="text-sm text-saywhat-grey">{doc.fileName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs ${getClassificationColor(doc.classification)}`}>
                                {doc.classification}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-saywhat-grey">
                              {doc.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-saywhat-grey">
                              {formatDate(doc.lastModified)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-saywhat-orange hover:text-orange-600">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-saywhat-orange hover:text-orange-600">
                                  <ArrowDownTrayIcon className="h-4 w-4" />
                                </button>
                                <button className="text-saywhat-orange hover:text-orange-600">
                                  <ShareIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
