'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Clock, User, FileText, Folder, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useFocusTrap } from './accessibility'

export interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'user' | 'document' | 'page' | 'setting' | 'project' | 'call' | 'hr' | 'inventory'
  url: string
  icon?: React.ReactNode
  metadata?: Record<string, any>
  score?: number
}

interface SearchCategory {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

const searchCategories: SearchCategory[] = [
  { id: 'user', name: 'Users', icon: <User className="w-4 h-4" />, color: 'text-blue-600' },
  { id: 'document', name: 'Documents', icon: <FileText className="w-4 h-4" />, color: 'text-green-600' },
  { id: 'page', name: 'Pages', icon: <Folder className="w-4 h-4" />, color: 'text-purple-600' },
  { id: 'setting', name: 'Settings', icon: <Settings className="w-4 h-4" />, color: 'text-gray-600' },
  { id: 'project', name: 'Projects', icon: <Folder className="w-4 h-4" />, color: 'text-orange-600' },
  { id: 'call', name: 'Calls', icon: <FileText className="w-4 h-4" />, color: 'text-red-600' },
  { id: 'hr', name: 'HR', icon: <User className="w-4 h-4" />, color: 'text-indigo-600' },
  { id: 'inventory', name: 'Inventory', icon: <Folder className="w-4 h-4" />, color: 'text-teal-600' }
]

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  onSearch?: (query: string) => Promise<SearchResult[]>
  placeholder?: string
  maxResults?: number
}

export function GlobalSearch({ 
  isOpen, 
  onClose, 
  onSearch,
  placeholder = 'Search everything...',
  maxResults = 10
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useFocusTrap(isOpen)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse recent searches:', error)
      }
    }
  }, [])

  // Save recent searches to localStorage
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches))
  }, [recentSearches])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Default search implementation
  const defaultSearch = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      // Call real search API
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error('Search API failed')
      }
      
      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Search error:', error)
      // Return empty results on error instead of mock data
      return []
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true)
      try {
        const searchFunction = onSearch || defaultSearch
        const searchResults = await searchFunction(query)
        
        // Filter by category if selected
        const filteredResults = activeCategory 
          ? searchResults.filter(result => result.type === activeCategory)
          : searchResults

        setResults(filteredResults.slice(0, maxResults))
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, activeCategory, onSearch, defaultSearch, maxResults])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(-1)
      setActiveCategory(null)
    }
  }, [isOpen])

  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    const newRecentSearches = [
      query,
      ...recentSearches.filter(s => s !== query)
    ].slice(0, 5)
    setRecentSearches(newRecentSearches)

    // Navigate to result
    router.push(result.url)
    onClose()
  }

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery)
    inputRef.current?.focus()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
  }

  const getResultIcon = (type: string) => {
    const category = searchCategories.find(c => c.id === type)
    return category?.icon || <FileText className="w-4 h-4" />
  }

  const getResultColor = (type: string) => {
    const category = searchCategories.find(c => c.id === type)
    return category?.color || 'text-gray-600'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div
        ref={containerRef}
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        tabIndex={-1}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {searchCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 ${
                    index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 ${getResultColor(result.type)}`}>
                    {result.icon || getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        {searchCategories.find(c => c.id === result.type)?.name || result.type}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((recentQuery, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(recentQuery)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {recentQuery}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md flex items-center gap-2"
                  >
                    <Folder className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Go to Dashboard
                    </span>
                  </button>
                  <button
                    onClick={() => router.push('/settings')}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Open Settings
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <div>
              Ctrl+K to search
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Global search trigger component
export function GlobalSearchTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-sm text-white placeholder:text-white/80 border border-white/30"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
      >
        <Search className="w-4 h-4 text-white" />
        <span className="text-white">Search...</span>
        <kbd className="ml-auto text-xs bg-white/20 px-1 py-0.5 rounded text-white">
          Ctrl+K
        </kbd>
      </button>

      <GlobalSearch
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
