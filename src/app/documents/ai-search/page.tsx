"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  FolderIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  HeartIcon,
  StarIcon,
  BookmarkIcon
} from "@heroicons/react/24/outline";

// Search filters
const documentTypes = [
  "All Types",
  "PDF Documents", 
  "Word Documents",
  "Excel Spreadsheets",
  "PowerPoint Presentations",
  "Images",
  "Other"
];

const dateRanges = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" }
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "date_desc", label: "Date (Newest)" },
  { value: "date_asc", label: "Date (Oldest)" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "size_desc", label: "Size (Largest)" },
  { value: "size_asc", label: "Size (Smallest)" }
];

const securityClassifications = {
  "PUBLIC": { color: "text-green-600 bg-green-100", icon: ShareIcon },
  "INTERNAL": { color: "text-blue-600 bg-blue-100", icon: UserIcon },
  "CONFIDENTIAL": { color: "text-yellow-600 bg-yellow-100", icon: LockClosedIcon },
  "RESTRICTED": { color: "text-red-600 bg-red-100", icon: ShieldCheckIcon }
};

// Mock search results
const mockResults = [
  {
    id: "1",
    title: "Annual Report 2024",
    description: "Comprehensive annual report covering organizational performance, financial statements, and strategic initiatives for the fiscal year 2024.",
    classification: "PUBLIC",
    category: "Annual Reports",
    type: "PDF",
    size: "2.4 MB",
    uploadedBy: "Sarah Johnson",
    uploadDate: "2024-01-15",
    version: "1.0",
    tags: ["annual-report", "financial", "2024", "performance"],
    relevanceScore: 0.95,
    aiSummary: "This document provides a comprehensive overview of organizational achievements and financial performance.",
    sentiment: 0.8,
    readability: 0.75,
    downloadCount: 156,
    viewCount: 423,
    folder: "/Reports/Annual"
  },
  {
    id: "2",
    title: "Data Protection Policy",
    description: "Updated data protection and privacy policy aligned with international standards and regulatory requirements.",
    classification: "INTERNAL",
    category: "Policies & Procedures",
    type: "Word",
    size: "856 KB",
    uploadedBy: "Michael Chen",
    uploadDate: "2024-01-10",
    version: "2.1",
    tags: ["policy", "data-protection", "privacy", "compliance"],
    relevanceScore: 0.87,
    aiSummary: "Policy document outlining data protection procedures and compliance requirements.",
    sentiment: 0.6,
    readability: 0.65,
    downloadCount: 89,
    viewCount: 234,
    folder: "/Policies/Data"
  },
  {
    id: "3",
    title: "Q4 Financial Statement",
    description: "Quarterly financial statement with detailed analysis of revenue, expenses, and budget allocations.",
    classification: "CONFIDENTIAL",
    category: "Financial Documents",
    type: "Excel",
    size: "1.2 MB",
    uploadedBy: "Emily Rodriguez",
    uploadDate: "2024-01-08",
    version: "1.0",
    tags: ["financial", "q4", "budget", "analysis"],
    relevanceScore: 0.92,
    aiSummary: "Detailed financial analysis showing strong quarterly performance with budget variance analysis.",
    sentiment: 0.7,
    readability: 0.8,
    downloadCount: 67,
    viewCount: 145,
    folder: "/Finance/Quarterly"
  },
  {
    id: "4",
    title: "Board Meeting Minutes - January 2024",
    description: "Official minutes from the January 2024 board meeting including strategic decisions and action items.",
    classification: "RESTRICTED",
    category: "Governance",
    type: "PDF",
    size: "492 KB",
    uploadedBy: "David Wilson",
    uploadDate: "2024-01-05",
    version: "1.0",
    tags: ["board", "meeting", "minutes", "governance"],
    relevanceScore: 0.78,
    aiSummary: "Board meeting documentation covering strategic planning and organizational governance matters.",
    sentiment: 0.65,
    readability: 0.7,
    downloadCount: 12,
    viewCount: 34,
    folder: "/Governance/Board"
  },
  {
    id: "5",
    title: "Training Manual - Customer Service",
    description: "Comprehensive training manual for customer service representatives covering best practices and procedures.",
    classification: "INTERNAL",
    category: "Training Materials",
    type: "PDF",
    size: "3.1 MB",
    uploadedBy: "Lisa Thompson",
    uploadDate: "2024-01-03",
    version: "1.5",
    tags: ["training", "customer-service", "manual", "procedures"],
    relevanceScore: 0.83,
    aiSummary: "Training resource providing comprehensive guidelines for customer service excellence.",
    sentiment: 0.85,
    readability: 0.9,
    downloadCount: 234,
    viewCount: 567,
    folder: "/Training/Customer"
  }
];

export default function DocumentSearchPage() {
  const { data: session } = useSession();
  
  // All hooks must be called first, before any conditional logic
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"simple" | "advanced" | "semantic">("simple");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockResults>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    documentType: "All Types",
    classification: "all",
    category: "all",
    dateRange: "all",
    customDateFrom: "",
    customDateTo: "",
    uploadedBy: "",
    tags: "",
    minSize: "",
    maxSize: "",
    sortBy: "relevance"
  });

  // Advanced search
  const [advancedSearch, setAdvancedSearch] = useState({
    exactPhrase: "",
    anyWords: "",
    excludeWords: "",
    fileNameContains: "",
    contentLanguage: "all"
  });

  // Semantic search
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticFilters, setSemanticFilters] = useState({
    conceptSimilarity: 0.7,
    includeRelated: true,
    semanticBoost: true
  });

  // Check permissions after all hooks are declared
  const hasAccess = session?.user?.permissions?.includes("documents.search") ||
                   session?.user?.permissions?.includes("documents.full_access");

  if (!hasAccess) {
    return (
      <ModulePage
        metadata={{
          title: "Document Search",
          description: "Access Denied",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Search" }
          ]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to search documents.
          </p>
        </div>
      </ModulePage>
    );
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() && searchMode !== "semantic") return;
    
    setIsSearching(true);
    const startTime = Date.now();
    
    // Simulate search
    setTimeout(() => {
      const filteredResults = mockResults.filter(doc => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = !query || 
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
          doc.category.toLowerCase().includes(query);
        
        const matchesType = filters.documentType === "All Types" || 
          doc.type === filters.documentType.split(" ")[0];
        
        const matchesClassification = filters.classification === "all" || 
          doc.classification === filters.classification;
        
        return matchesQuery && matchesType && matchesClassification;
      });
      
      setSearchResults(filteredResults);
      setTotalResults(filteredResults.length);
      setSearchTime(Date.now() - startTime);
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getDocumentIcon = (type: string) => {
    return DocumentIcon;
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getClassificationColor = (classification: string) => {
    return securityClassifications[classification as keyof typeof securityClassifications]?.color || "text-gray-600 bg-gray-100";
  };

  const getClassificationIcon = (classification: string) => {
    return securityClassifications[classification as keyof typeof securityClassifications]?.icon || LockClosedIcon;
  };

  useEffect(() => {
    // Auto-search on filter changes when there's a search query
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(handleSearch, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filters, searchQuery]);

  return (
    <ModulePage
      metadata={{
        title: "Document Search",
        description: "AI-powered document search and discovery",
        breadcrumbs: [
          { name: "Document Repository", href: "/documents" },
          { name: "Search" }
        ]
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          {/* Search Mode Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setSearchMode("simple")}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                searchMode === "simple" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Simple Search
            </button>
            <button
              onClick={() => setSearchMode("advanced")}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                searchMode === "advanced" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Advanced Search
            </button>
            <button
              onClick={() => setSearchMode("semantic")}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                searchMode === "semantic" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <SparklesIcon className="h-4 w-4 inline mr-1" />
              AI Semantic Search
            </button>
          </div>

          {/* Simple Search */}
          {searchMode === "simple" && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search documents by title, content, tags, or keywords..."
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                  showFilters 
                    ? "text-blue-700 bg-blue-50 border-blue-300" 
                    : "text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          )}

          {/* Advanced Search */}
          {searchMode === "advanced" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exact Phrase
                  </label>
                  <input
                    type="text"
                    value={advancedSearch.exactPhrase}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, exactPhrase: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Find documents with this exact phrase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Any of These Words
                  </label>
                  <input
                    type="text"
                    value={advancedSearch.anyWords}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, anyWords: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="word1 word2 word3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exclude Words
                  </label>
                  <input
                    type="text"
                    value={advancedSearch.excludeWords}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, excludeWords: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Exclude documents containing these words"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Name Contains
                  </label>
                  <input
                    type="text"
                    value={advancedSearch.fileNameContains}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, fileNameContains: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by filename"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Advanced Search
                </button>
              </div>
            </div>
          )}

          {/* Semantic Search */}
          {searchMode === "semantic" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe what you're looking for
                </label>
                <textarea
                  rows={3}
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="E.g., 'Documents about financial performance and budget analysis' or 'Policies related to employee safety and workplace procedures'"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Similarity Threshold
                  </label>
                  <select
                    value={semanticFilters.conceptSimilarity}
                    onChange={(e) => setSemanticFilters(prev => ({ ...prev, conceptSimilarity: parseFloat(e.target.value) }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0.5}>Low (50%) - Broad results</option>
                    <option value={0.7}>Medium (70%) - Balanced</option>
                    <option value={0.85}>High (85%) - Precise results</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeRelated"
                    checked={semanticFilters.includeRelated}
                    onChange={(e) => setSemanticFilters(prev => ({ ...prev, includeRelated: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeRelated" className="ml-2 text-sm text-gray-700">
                    Include related concepts
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="semanticBoost"
                    checked={semanticFilters.semanticBoost}
                    onChange={(e) => setSemanticFilters(prev => ({ ...prev, semanticBoost: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="semanticBoost" className="ml-2 text-sm text-gray-700">
                    AI relevance boost
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !semanticQuery.trim()}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  AI Semantic Search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Search Filters</h3>
              <button
                onClick={() => setFilters({
                  documentType: "All Types",
                  classification: "all",
                  category: "all",
                  dateRange: "all",
                  customDateFrom: "",
                  customDateTo: "",
                  uploadedBy: "",
                  tags: "",
                  minSize: "",
                  maxSize: "",
                  sortBy: "relevance"
                })}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={filters.documentType}
                  onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classification
                </label>
                <select
                  value={filters.classification}
                  onChange={(e) => setFilters(prev => ({ ...prev, classification: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Classifications</option>
                  <option value="PUBLIC">Public</option>
                  <option value="INTERNAL">Internal</option>
                  <option value="CONFIDENTIAL">Confidential</option>
                  <option value="RESTRICTED">Restricted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {filters.dateRange === "custom" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filters.customDateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, customDateFrom: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filters.customDateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, customDateTo: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uploaded By
                </label>
                <input
                  type="text"
                  value={filters.uploadedBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, uploadedBy: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="User name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tag1, tag2..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {(searchResults.length > 0 || isSearching) && (
          <div className="bg-white shadow rounded-lg">
            {/* Results Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  {isSearching ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Searching documents...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {totalResults} result{totalResults !== 1 ? 's' : ''} found
                      </span>
                      <span className="text-sm text-gray-400">
                        ({searchTime}ms)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="divide-y divide-gray-200">
              {searchResults.map((doc) => {
                const DocIcon = getDocumentIcon(doc.type);
                const ClassificationIcon = getClassificationIcon(doc.classification);
                
                return (
                  <div key={doc.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <DocIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {doc.title}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getClassificationColor(doc.classification)}`}>
                              <ClassificationIcon className="h-3 w-3 mr-1" />
                              {doc.classification}
                            </span>
                            {searchMode === "simple" && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                <SparklesIcon className="h-3 w-3 mr-1" />
                                {(doc.relevanceScore * 100).toFixed(0)}% match
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {doc.description}
                          </p>

                          {doc.aiSummary && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center mb-1">
                                <SparklesIcon className="h-4 w-4 text-blue-600 mr-1" />
                                <span className="text-xs font-medium text-blue-700">AI Summary</span>
                              </div>
                              <p className="text-sm text-blue-700">{doc.aiSummary}</p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center">
                              <FolderIcon className="h-4 w-4 mr-1" />
                              {doc.category}
                            </span>
                            <span className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              {doc.uploadedBy}
                            </span>
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {formatDate(doc.uploadDate)}
                            </span>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>v{doc.version}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {doc.tags.map(tag => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* AI Analysis Metrics */}
                          <div className="flex items-center space-x-6 text-xs text-gray-500">
                            <span className="flex items-center">
                              <HeartIcon className="h-3 w-3 mr-1" />
                              {(doc.sentiment * 100).toFixed(0)}% positive
                            </span>
                            <span className="flex items-center">
                              <ChartBarIcon className="h-3 w-3 mr-1" />
                              {(doc.readability * 100).toFixed(0)}% readable
                            </span>
                            <span className="flex items-center">
                              <EyeIcon className="h-3 w-3 mr-1" />
                              {doc.viewCount} views
                            </span>
                            <span className="flex items-center">
                              <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                              {doc.downloadCount} downloads
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <BookmarkIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <ShareIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {!isSearching && searchResults.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Search Documents</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Use the search bar above to find documents by title, content, tags, or use our AI-powered semantic search for concept-based discovery.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-blue-50 p-4 rounded-lg">
                <MagnifyingGlassIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-blue-900">Simple Search</h4>
                <p className="text-xs text-blue-700 mt-1">Quick keyword search</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-purple-900">Advanced Search</h4>
                <p className="text-xs text-purple-700 mt-1">Detailed search criteria</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-green-900">AI Semantic</h4>
                <p className="text-xs text-green-700 mt-1">Concept-based discovery</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  );
}
