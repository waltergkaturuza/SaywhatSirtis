"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon,
  SparklesIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";

interface SearchResult {
  id: string;
  title: string;
  relevanceScore: number;
  summary: string;
  highlights: string[];
  metadata: {
    type: string;
    category: string;
    department: string;
    uploadedAt: string;
    analysis?: {
      sentiment: { label: string; score: number };
      quality: { score: number };
      topics: string[];
    };
  };
}

interface AISearchProps {
  onSearchResults?: (results: SearchResult[]) => void;
}

export function AIDocumentSearch({ onSearchResults }: AISearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    department: "",
    dateFrom: "",
    dateTo: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch("/api/documents/ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query,
          filters,
          limit: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setSuggestions(data.suggestions || []);
        onSearchResults?.(data.results || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-saywhat-purple to-saywhat-orange rounded-lg">
          <SparklesIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Document Search</h3>
          <p className="text-sm text-gray-600">Search documents using natural language and AI intelligence</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about documents: 'Find policy documents about remote work' or 'Show me last week's reports'"
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-purple focus:border-transparent placeholder-gray-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mr-2 p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
          <button
            onClick={performSearch}
            disabled={isSearching || !query.trim()}
            className="mr-3 px-4 py-2 bg-saywhat-purple text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Categories</option>
              <option value="POLICY">Policy</option>
              <option value="PROCEDURE">Procedure</option>
              <option value="REPORT">Report</option>
              <option value="CONTRACT">Contract</option>
              <option value="PRESENTATION">Presentation</option>
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="From Date"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="To Date"
            />
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <LightBulbIcon className="h-4 w-4" />
            Suggested searches:
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Search Results ({results.length})
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <SparklesIcon className="h-4 w-4" />
              AI-Enhanced Results
            </div>
          </div>
          
          {results.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <h5 className="font-medium text-gray-900">{result.title}</h5>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">
                      {Math.round(result.relevanceScore * 100)}% match
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{result.metadata.category}</span>
                  <span>•</span>
                  <span>{result.metadata.department}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{result.summary}</p>
              
              {/* AI Analysis Insights */}
              {result.metadata.analysis && (
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <ChartBarIcon className="h-3 w-3" />
                    Quality: {result.metadata.analysis.quality.score}%
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      result.metadata.analysis.sentiment.label === 'positive' ? 'bg-green-500' :
                      result.metadata.analysis.sentiment.label === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    Sentiment: {result.metadata.analysis.sentiment.label}
                  </div>
                  <div>
                    Topics: {result.metadata.analysis.topics.slice(0, 2).join(", ")}
                  </div>
                </div>
              )}
              
              {/* Highlights */}
              {result.highlights.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Relevant excerpts:</span>
                  <div className="mt-1 space-y-1">
                    {result.highlights.slice(0, 2).map((highlight, index) => (
                      <div key={index} className="text-gray-600 italic">
                        "...{highlight}..."
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {query && !isSearching && results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No documents found matching your search.</p>
          <p className="text-sm">Try using different keywords or adjust your filters.</p>
        </div>
      )}
    </div>
  );
}
