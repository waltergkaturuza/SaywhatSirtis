'use client'

import { useEffect, useState } from 'react'
import { ClockIcon } from '@heroicons/react/24/outline'

type CaseChange = {
  from?: string
  to?: string
  fieldLabel?: string
}

type HistoryEntry = {
  id: string
  timestamp: string
  action: string
  user: { name: string; email?: string | null }
  changes: Record<string, CaseChange>
  changeCount: number
  reason: string
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Opened',
  UPDATE: 'Updated',
  CLOSE: 'Closed',
  RESOLVE: 'Resolved',
}

export default function CaseHistory({ caseId }: { caseId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!caseId) return
    let cancelled = false

    const loadHistory = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch(`/api/call-centre/cases/${caseId}/history`)
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Failed to load case history')
        if (!cancelled) setHistory(Array.isArray(data.history) ? data.history : [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load case history')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [caseId])

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Update History</h2>
        {!loading && !error && (
          <span className="text-sm text-gray-500">{history.length} update{history.length === 1 ? '' : 's'}</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
          Loading updates...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && history.length === 0 && (
        <p className="text-sm text-gray-500">No updates have been recorded for this case yet. Changes saved from case management will appear here.</p>
      )}

      {!loading && !error && history.length > 0 && (
        <ol className="space-y-4">
          {history.map((entry) => {
            const changeList = Object.values(entry.changes || {})
            return (
              <li key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {ACTION_LABELS[entry.action] || entry.action}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{entry.user?.name || 'Unknown User'}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{entry.reason}</p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown time'}
                  </div>
                </div>

                {changeList.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {changeList.map((change, index) => (
                      <li key={`${entry.id}-${change.fieldLabel || index}`} className="text-sm text-gray-700">
                        <span className="font-medium">{change.fieldLabel || 'Field'}:</span>{' '}
                        <span className="text-gray-500">{change.from || '—'}</span>
                        <span className="mx-1 text-gray-400">→</span>
                        <span>{change.to || '—'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
