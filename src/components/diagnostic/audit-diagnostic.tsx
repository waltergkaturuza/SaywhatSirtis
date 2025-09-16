// Diagnostic component to test audit log issues
"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function AuditLogDiagnostic() {
  const { data: session, status } = useSession()
  const [apiTest, setApiTest] = useState<string | null>(null)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing audit API from React component...')
        const response = await fetch('/api/admin/audit')
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          setApiTest(`API Error: ${response.status} ${response.statusText}`)
          return
        }
        
        const data = await response.json()
        console.log('API Data:', data)
        setApiTest('API Success: ' + JSON.stringify(data, null, 2))
        setLogs(data.logs || [])
        
      } catch (error) {
        console.error('API Test Error:', error)
        setApiTest('Fetch Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }

    if (session) {
      testAPI()
    }
  }, [session])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Audit Log Diagnostic</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Session Status</h2>
          <p>Status: {status}</p>
          <p>User: {session?.user?.email || 'Not logged in'}</p>
          <p>User ID: {session?.user?.id || 'N/A'}</p>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold">API Test Result</h2>
          <pre className="whitespace-pre-wrap text-sm">{apiTest || 'Testing...'}</pre>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold">Logs Data</h2>
          <p>Count: {logs.length}</p>
          {logs.length > 0 && (
            <pre className="whitespace-pre-wrap text-sm mt-2">
              {JSON.stringify(logs[0], null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}