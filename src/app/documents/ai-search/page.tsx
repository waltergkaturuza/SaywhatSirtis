"use client";

import { useState, useEffect } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  ChartBarIcon,
  LightBulbIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  StarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  DocumentIcon,
  BoltIcon,
  CpuChipIcon,
  BeakerIcon
} from "@heroicons/react/24/outline";

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  category: string;
  classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  uploadDate: string;
  fileType: string;
  size: string;
  relevanceScore: number;
  semanticMatches: string[];
  aiInsights?: string[];
  relatedDocuments?: string[];
}

export default function AISearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<"basic" | "semantic" | "advanced">("semantic");
  const [filters, setFilters] = useState({
    dateRange: "all",
    category: "all",
    classification: "all",
    fileType: "all"
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "financial performance Q4",
    "employee training materials",
    "data protection compliance",
    "marketing strategies 2024"
  ]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setAiSuggestions([]);
    
    // Add to search history
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
    }
    
    try {
      // Try to fetch real search results from API
      const response = await fetch(`/api/documents?search=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const documents = await response.json();
        
        // Transform documents to search result format
        const searchResults: SearchResult[] = documents.slice(0, 10).map((doc: any, index: number) => ({
          id: doc.id,
          title: doc.title || doc.fileName,
          snippet: doc.description || "No description available",
          category: doc.category || "Uncategorized",
          classification: doc.classification || "INTERNAL",
          uploadDate: doc.uploadDate,
          fileType: doc.type || "FILE",
          size: doc.size,
          relevanceScore: Math.max(0.5, 1 - (index * 0.1)), // Simulate relevance score
          semanticMatches: [searchQuery.toLowerCase()],
          aiInsights: [`Document matches search query: ${searchQuery}`],
          relatedDocuments: []
        }));
        
        setSearchResults(searchResults);
        
        // Generate AI suggestions based on search
        const suggestions = [
          `Related: ${searchQuery} reports`,
          `Similar: documents about ${searchQuery}`,
          `Timeline: ${searchQuery} over time`
        ];
        setAiSuggestions(suggestions);
      } else {
        // If API fails, show empty results
        setSearchResults([]);
        setAiSuggestions([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Show empty results on error
      setSearchResults([]);
      setAiSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'PUBLIC': return 'bg-green-100 text-green-800';
      case 'INTERNAL': return 'bg-blue-100 text-blue-800';
      case 'CONFIDENTIAL': return 'bg-orange-100 text-orange-800';
      case 'RESTRICTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-blue-600';
    if (score >= 0.7) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <ModulePage
      metadata={{
        title: "AI-Powered Document Search",
        description: "Advanced semantic search with AI-powered document discovery and insights",
        breadcrumbs: [
          { name: "Document Repository", href: "/documents" },
          { name: "AI Search" }
        ]
      }}
    >
      <div className="max-w-full mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CpuChipIcon className="h-8 w-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">AI-Powered Search</h1>
                <p className="text-blue-100">Advanced semantic search with intelligent document discovery</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-white">
              <div className="flex items-center">
                <CpuChipIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Neural Search</span>
              </div>
              <div className="flex items-center">
                <BeakerIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">AI Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Search Modes */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-medium text-gray-700">Search Mode:</span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                {[
                  { key: 'basic', label: 'Basic', icon: MagnifyingGlassIcon },
                  { key: 'semantic', label: 'Semantic AI', icon: CpuChipIcon },
                  { key: 'advanced', label: 'Advanced', icon: AdjustmentsHorizontalIcon }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSearchMode(key as any)}
                    className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                      searchMode === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {searchMode === 'semantic' ? (
                <SparklesIcon className="h-5 w-5 text-blue-400" />
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                searchMode === 'semantic' 
                  ? "Ask a question or describe what you're looking for..."
                  : "Enter keywords to search documents..."
              }
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </button>
          </div>

          {/* AI Suggestions */}
          {searchMode === 'semantic' && aiSuggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <LightBulbIcon className="h-4 w-4 mr-1" />
                AI Suggestions
              </h3>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(suggestion)}
                    className="inline-flex items-center px-3 py-1 border border-blue-200 text-sm rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(query)}
                    className="inline-flex items-center px-3 py-1 border border-gray-200 text-sm rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Filters</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 ${viewMode === 'list' ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 ${viewMode === 'grid' ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    <ViewColumnsIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="financial">Financial</option>
                <option value="hr">HR</option>
                <option value="legal">Legal</option>
                <option value="marketing">Marketing</option>
                <option value="technical">Technical</option>
              </select>
              
              <select
                value={filters.classification}
                onChange={(e) => setFilters({...filters, classification: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Classifications</option>
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
              
              <select
                value={filters.fileType}
                onChange={(e) => setFilters({...filters, fileType: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All File Types</option>
                <option value="pdf">PDF</option>
                <option value="word">Word</option>
                <option value="excel">Excel</option>
                <option value="powerpoint">PowerPoint</option>
              </select>
              
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Search Results ({searchResults.length})
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>AI-powered semantic matching</span>
                  <SparklesIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {searchResults.map((result) => (
                  <div key={result.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <DocumentIcon className="h-5 w-5 text-saywhat-orange" />
                          <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                            {result.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getClassificationColor(result.classification)}`}>
                            {result.classification}
                          </span>
                          <span className={`text-sm font-medium ${getRelevanceColor(result.relevanceScore)}`}>
                            {Math.round(result.relevanceScore * 100)}% match
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{result.snippet}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                          <span>{result.fileType} • {result.size}</span>
                          <span>{new Date(result.uploadDate).toLocaleDateString()}</span>
                          <span>{result.category}</span>
                        </div>

                        {/* Semantic Matches */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <CpuChipIcon className="h-4 w-4 mr-1" />
                            Semantic Matches
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.semanticMatches.map((match, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {match}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* AI Insights */}
                        {result.aiInsights && result.aiInsights.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <SparklesIcon className="h-4 w-4 mr-1" />
                              AI Insights
                            </h4>
                            <ul className="space-y-1">
                              {result.aiInsights.map((insight, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start">
                                  <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Related Documents */}
                        {result.relatedDocuments && result.relatedDocuments.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Related Documents</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.relatedDocuments.map((doc, index) => (
                                <button
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                                >
                                  <DocumentTextIcon className="h-3 w-3 mr-1" />
                                  {doc}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-6">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                          <ShareIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                          <BookmarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <SparklesIcon className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI is analyzing your query...</h3>
              <p className="text-gray-600">Performing semantic search and generating insights</p>
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isSearching && searchResults.length === 0 && searchQuery && (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="text-center">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  );
}
