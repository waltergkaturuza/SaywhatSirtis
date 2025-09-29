import React, { useState, useEffect } from 'react'
import { ClockIcon, UserIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface CaseHistoryProps {
  caseId: string
}

interface HistoryEntry {
  id: string
  timestamp: string
  action: string
  user: {
    name: string
    email?: string
  }
  changes: Record<string, {
    from: any
    to: any
    fieldLabel: string
  }>
  changeCount: number
  reason: string
  ipAddress: string
}

export default function CaseHistory({ caseId }: CaseHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/call-centre/cases/${caseId}/history`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch case history')
        }

        if (data.success) {
          setHistory(data.history)
        }
      } catch (err) {
        console.error('Error fetching case history:', err)
        setError(err instanceof Error ? err.message : 'Failed to load case history')
      } finally {
        setLoading(false)
      }
    }

    if (caseId) {
      fetchHistory()
    }
  }, [caseId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'Empty'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'string' && value.includes('T')) {
      // Check if it's a date string
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString()
      }
    }
    return String(value)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Case History</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading history...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Case History</h3>
        <div className="text-center py-8">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-2 text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Case History 
        {history.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({history.length} {history.length === 1 ? 'entry' : 'entries'})
          </span>
        )}
      </h3>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No history entries found for this case.</p>
          <p className="text-xs text-gray-500">Changes will appear here when the case is updated.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Timeline line */}
              {index !== history.length - 1 && (
                <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Timeline dot */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <ClockIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {entry.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        updated {entry.changeCount} {entry.changeCount === 1 ? 'field' : 'fields'}
                      </span>
                    </div>
                    <time className="text-xs text-gray-500">
                      {formatDate(entry.timestamp)}
                    </time>
                  </div>

                  {/* Reason */}
                  {entry.reason && entry.reason !== 'Case information updated' && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {entry.reason}
                      </p>
                    </div>
                  )}

                  {/* Changes */}
                  {Object.keys(entry.changes).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        Changes Made:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(entry.changes).map(([field, change]) => (
                          <div key={field} className="bg-white rounded p-3 border border-gray-200">
                            <div className="text-xs font-medium text-gray-700 mb-2">
                              {change.fieldLabel}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center text-xs">
                                <span className="text-red-600 bg-red-50 px-2 py-1 rounded mr-2">From:</span>
                                <span className="text-gray-900">{formatValue(change.from)}</span>
                              </div>
                              <div className="flex items-center text-xs">
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded mr-2">To:</span>
                                <span className="text-gray-900">{formatValue(change.to)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical details (collapsed by default) */}
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Technical Details
                    </summary>
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <div>IP Address: {entry.ipAddress}</div>
                      <div>Action ID: {entry.id}</div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}