'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface OfflineContextType {
  isOnline: boolean
  isOffline: boolean
  wasOffline: boolean
  offlineQueue: OfflineAction[]
  addToQueue: (action: OfflineAction) => void
  removeFromQueue: (id: string) => void
  clearQueue: () => void
  syncQueue: () => Promise<void>
  retryCount: number
}

export interface OfflineAction {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  endpoint: string
  data?: any
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  timestamp: number
  retries: number
  maxRetries: number
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([])
  const [retryCount, setRetryCount] = useState(0)

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('offlineQueue')
    if (savedQueue) {
      try {
        setOfflineQueue(JSON.parse(savedQueue))
      } catch (error) {
        console.error('Failed to parse offline queue:', error)
      }
    }
  }, [])

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue))
  }, [offlineQueue])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        setWasOffline(false)
        syncQueue()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  const addToQueue = useCallback((action: OfflineAction) => {
    setOfflineQueue(prev => [...prev, action])
  }, [])

  const removeFromQueue = useCallback((id: string) => {
    setOfflineQueue(prev => prev.filter(action => action.id !== id))
  }, [])

  const clearQueue = useCallback(() => {
    setOfflineQueue([])
    localStorage.removeItem('offlineQueue')
  }, [])

  const syncQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return

    const failedActions: OfflineAction[] = []
    setRetryCount(prev => prev + 1)

    for (const action of offlineQueue) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
            ...action.data?.headers
          },
          body: action.data ? JSON.stringify(action.data) : undefined
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        // Remove successful action from queue
        removeFromQueue(action.id)
      } catch (error) {
        // Increment retry count
        const updatedAction = {
          ...action,
          retries: action.retries + 1
        }

        // If max retries reached, remove from queue
        if (updatedAction.retries >= updatedAction.maxRetries) {
          removeFromQueue(action.id)
          console.error('Max retries reached for action:', action.id, error)
        } else {
          failedActions.push(updatedAction)
        }
      }
    }

    // Update queue with failed actions
    if (failedActions.length > 0) {
      setOfflineQueue(failedActions)
      
      // Retry after exponential backoff
      setTimeout(() => {
        syncQueue()
      }, Math.min(1000 * Math.pow(2, retryCount), 30000))
    }
  }, [isOnline, offlineQueue, retryCount, removeFromQueue])

  return (
    <OfflineContext.Provider value={{
      isOnline,
      isOffline: !isOnline,
      wasOffline,
      offlineQueue,
      addToQueue,
      removeFromQueue,
      clearQueue,
      syncQueue,
      retryCount
    }}>
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  return context
}

// Offline indicator component
export function OfflineIndicator() {
  const { isOnline, isOffline, offlineQueue } = useOffline()
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    if (isOffline) {
      setShowIndicator(true)
    } else if (isOnline) {
      // Show "back online" message briefly
      setShowIndicator(true)
      timeout = setTimeout(() => {
        setShowIndicator(false)
      }, 3000)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [isOnline, isOffline])

  if (!showIndicator) return null

  return (
    <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50
      px-4 py-2 rounded-lg shadow-lg text-sm font-medium
      ${isOffline 
        ? 'bg-red-100 text-red-800 border border-red-200' 
        : 'bg-green-100 text-green-800 border border-green-200'
      }
    `}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`} />
        <span>
          {isOffline 
            ? `You're offline${offlineQueue.length > 0 ? ` (${offlineQueue.length} actions queued)` : ''}`
            : 'Back online'
          }
        </span>
      </div>
    </div>
  )
}

// Offline-aware fetch hook
export function useOfflineFetch() {
  const { isOnline, addToQueue } = useOffline()

  const offlineFetch = useCallback(async (
    endpoint: string,
    options: RequestInit = {},
    offlineOptions: {
      queueOnFailure?: boolean
      maxRetries?: number
      actionType?: 'CREATE' | 'UPDATE' | 'DELETE'
    } = {}
  ) => {
    const {
      queueOnFailure = true,
      maxRetries = 3,
      actionType = 'UPDATE'
    } = offlineOptions

    try {
      const response = await fetch(endpoint, options)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return response
    } catch (error) {
      if (!isOnline && queueOnFailure) {
        const action: OfflineAction = {
          id: Date.now().toString(),
          type: actionType,
          endpoint,
          data: options.body ? JSON.parse(options.body as string) : undefined,
          method: (options.method as any) || 'GET',
          timestamp: Date.now(),
          retries: 0,
          maxRetries
        }
        
        addToQueue(action)
        
        // Return proper offline response indicating service unavailable
        return new Response(JSON.stringify({ 
          error: 'Service temporarily unavailable - request queued for retry when online',
          offline: true 
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      throw error
    }
  }, [isOnline, addToQueue])

  return offlineFetch
}

// Offline storage hook
export function useOfflineStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Failed to parse stored value:', error)
      return initialValue
    }
  })

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      setValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Failed to store value:', error)
    }
  }, [key, value])

  const removeStoredValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setValue(initialValue)
    } catch (error) {
      console.error('Failed to remove stored value:', error)
    }
  }, [key, initialValue])

  return [value, setStoredValue, removeStoredValue] as const
}

// Offline sync status component
export function OfflineSyncStatus() {
  const { offlineQueue, syncQueue, isOnline } = useOffline()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    if (isOnline && offlineQueue.length > 0) {
      setIsSyncing(true)
      await syncQueue()
      setIsSyncing(false)
    }
  }

  if (offlineQueue.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {offlineQueue.length} actions queued
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isOnline ? 'Ready to sync' : 'Waiting for connection'}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={!isOnline || isSyncing}
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  )
}

// Cache management utilities
export const offlineCache = {
  set: (key: string, data: any, ttl?: number) => {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 0
    }
    localStorage.setItem(`cache_${key}`, JSON.stringify(item))
  },

  get: (key: string) => {
    try {
      const item = localStorage.getItem(`cache_${key}`)
      if (!item) return null

      const parsed = JSON.parse(item)
      const now = Date.now()

      // Check if item has expired
      if (parsed.ttl > 0 && now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`cache_${key}`)
        return null
      }

      return parsed.data
    } catch (error) {
      console.error('Failed to retrieve cached item:', error)
      return null
    }
  },

  remove: (key: string) => {
    localStorage.removeItem(`cache_${key}`)
  },

  clear: () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
    keys.forEach(key => localStorage.removeItem(key))
  }
}

// Offline-aware data fetcher
export function useOfflineData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cacheTTL?: number
    refetchOnReconnect?: boolean
  } = {}
) {
  const { isOnline, wasOffline } = useOffline()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { cacheTTL = 5 * 60 * 1000, refetchOnReconnect = true } = options

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetcher()
      setData(result)
      
      // Cache the result
      offlineCache.set(key, result, cacheTTL)
    } catch (err) {
      setError(err as Error)
      
      // Try to get cached data
      const cachedData = offlineCache.get(key)
      if (cachedData) {
        setData(cachedData)
      }
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, cacheTTL])

  useEffect(() => {
    // Initial fetch
    fetchData()
  }, [fetchData])

  useEffect(() => {
    // Refetch when coming back online
    if (isOnline && wasOffline && refetchOnReconnect) {
      fetchData()
    }
  }, [isOnline, wasOffline, refetchOnReconnect, fetchData])

  return { data, loading, error, refetch: fetchData }
}
