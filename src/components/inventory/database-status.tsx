"use client"

import { useState, useEffect } from "react"

interface DatabaseStatus {
  connected: boolean
  recordCount: number
  lastSync: string
  mode: 'database' | 'mock'
}

export function DatabaseStatusIndicator() {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    recordCount: 0,
    lastSync: '',
    mode: 'mock'
  })

  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/inventory/assets')
      if (response.ok) {
        const data = await response.json()
        setStatus({
          connected: true,
          recordCount: data.pagination?.totalAssets || data.assets?.length || 0,
          lastSync: new Date().toLocaleTimeString(),
          mode: 'database'
        })
      } else {
        setStatus(prev => ({ ...prev, connected: false, mode: 'mock' }))
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, connected: false, mode: 'mock' }))
    }
  }

  useEffect(() => {
    checkDatabaseConnection()
    const interval = setInterval(checkDatabaseConnection, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg border-2 ${
      status.mode === 'database' && status.connected
        ? 'bg-green-50 border-green-200 text-green-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          status.mode === 'database' && status.connected 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-yellow-500'
        }`} />
        <div className="text-sm font-medium">
          {status.mode === 'database' && status.connected ? (
            <>
              🗄️ Database Connected
              <div className="text-xs opacity-75">
                {status.recordCount} records • Last sync: {status.lastSync}
              </div>
            </>
          ) : (
            <>
              ⚠️ Using Mock Data
              <div className="text-xs opacity-75">
                Database not connected
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
