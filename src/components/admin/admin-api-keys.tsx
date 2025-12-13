"use client"

import { useState, useEffect } from 'react'
import { 
  KeyIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  EllipsisVerticalIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string | null
  createdAt: string
  expiresAt: string
  isActive: boolean
  usage: {
    totalRequests: number
    dailyRequests: number
    rateLimitRemaining: number
  }
}

interface AdminApiKeysProps {
  className?: string
}

export function AdminApiKeys({ className = '' }: AdminApiKeysProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: ['read'] as string[],
    expiryDays: 365,
    rateLimit: 6000
  })
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/api-keys')
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys')
      }
      
      const data = await response.json()
      setApiKeys(data.data?.apiKeys || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const handleToggleStatus = async (keyId: string) => {
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_status',
          keyId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle API key status')
      }

      await fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle API key status')
    }
  }

  const handleRegenerateKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to regenerate this API key? The old key will be invalidated. This action cannot be undone.')) return

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'regenerate_key',
          keyId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate API key')
      }

      const result = await response.json()
      
      // If new key is returned, show it in modal
      if (result.data?.key) {
        setGeneratedKey(result.data.key)
        setShowGenerateModal(true)
      }
      
      await fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate API key')
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_key',
          keyId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete API key')
      }

      await fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key')
    }
  }

  const handleGenerateKey = async () => {
    if (!newKeyData.name.trim()) {
      setError('Key name is required')
      return
    }

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_key',
          keyData: newKeyData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate API key')
      }

      const result = await response.json()
      setGeneratedKey(result.data.key)
      setNewKeyData({ name: '', permissions: ['read'], expiryDays: 365, rateLimit: 6000 })
      await fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('API key copied to clipboard!')
  }

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = searchTerm === '' || 
      key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.key.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && key.isActive) ||
      (statusFilter === 'inactive' && !key.isActive)
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <KeyIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">API Keys Management</h2>
            <p className="text-sm text-gray-600">Manage API keys for system integrations</p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Generate Key</span>
        </button>
      </div>

      {/* Generate Key Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New API Key</h3>
            
            {generatedKey ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    ⚠️ Important: Copy this API key now. You won't be able to see it again!
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-3 py-2 rounded text-sm font-mono text-gray-800 flex-1 break-all">
                      {generatedKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(generatedKey)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                      title="Copy to clipboard"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowGenerateModal(false)
                    setGeneratedKey(null)
                  }}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Mobile App API Key"
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {['read', 'write', 'admin'].map((perm) => (
                      <label key={perm} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={newKeyData.permissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKeyData({
                                ...newKeyData,
                                permissions: [...newKeyData.permissions, perm]
                              })
                            } else {
                              setNewKeyData({
                                ...newKeyData,
                                permissions: newKeyData.permissions.filter(p => p !== perm)
                              })
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry (days)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={newKeyData.expiryDays}
                      onChange={(e) => setNewKeyData({ ...newKeyData, expiryDays: parseInt(e.target.value) || 365 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate Limit
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={newKeyData.rateLimit}
                      onChange={(e) => setNewKeyData({ ...newKeyData, rateLimit: parseInt(e.target.value) || 6000 })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={handleGenerateKey}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Generate Key
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false)
                      setNewKeyData({ name: '', permissions: ['read'], expiryDays: 365, rateLimit: 6000 })
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <KeyIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Keys</p>
              <p className="text-lg font-semibold text-gray-900">{apiKeys.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Keys</p>
              <p className="text-lg font-semibold text-gray-900">{apiKeys.filter(k => k.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <EllipsisVerticalIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-lg font-semibold text-gray-900">
                {apiKeys.reduce((sum, k) => sum + k.usage.totalRequests, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ArrowPathIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Daily Requests</p>
              <p className="text-lg font-semibold text-gray-900">
                {apiKeys.reduce((sum, k) => sum + k.usage.dailyRequests, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search API keys..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {filteredKeys.length} of {apiKeys.length} keys
            </span>
          </div>
        </div>
      </div>

      {/* API Keys Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredKeys.map((key) => (
          <div key={key.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <KeyIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                  <p className="text-sm text-gray-600">
                    {key.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(key.id)}
                  className={`p-1 ${
                    key.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                  }`}
                  title={key.isActive ? 'Deactivate' : 'Activate'}
                >
                  {key.isActive ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => handleRegenerateKey(key.id)}
                  className="p-1 text-yellow-600 hover:text-yellow-800"
                  title="Regenerate key"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Delete key"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 flex-1">
                    {key.key}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(key.key)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Copy to clipboard"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Requests</label>
                  <p className="text-sm text-gray-900">{key.usage.totalRequests.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Requests</label>
                  <p className="text-sm text-gray-900">{key.usage.dailyRequests.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit</label>
                  <p className="text-sm text-gray-900">{key.usage.rateLimitRemaining.toLocaleString()} remaining</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Used</label>
                  <p className="text-sm text-gray-900">
                    {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                <div className="flex flex-wrap gap-1">
                  {key.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                  <span>Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredKeys.length === 0 && (
        <div className="text-center py-12">
          <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Get started by generating your first API key'}
          </p>
        </div>
      )}
    </div>
  )
}
