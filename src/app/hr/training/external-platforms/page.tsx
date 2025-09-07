"use client"

import { useState, useEffect } from "react"
import { ModulePage } from "@/components/layout/enhanced-layout"
import { 
  externalPlatforms, 
  type ExternalPlatform, 
  validatePlatformConnection 
} from "@/lib/external-platforms"
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  KeyIcon
} from "@heroicons/react/24/outline"

export default function ExternalPlatformsAdmin() {
  const [platforms, setPlatforms] = useState<ExternalPlatform[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<ExternalPlatform | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPlatforms(externalPlatforms)
    checkAllConnections()
  }, [])

  const checkAllConnections = async () => {
    setLoading(true)
    const status: Record<string, boolean> = {}
    
    for (const platform of externalPlatforms) {
      try {
        const isConnected = await validatePlatformConnection(platform)
        status[platform.id] = isConnected
      } catch (error) {
        status[platform.id] = false
      }
    }
    
    setConnectionStatus(status)
    setLoading(false)
  }

  const handleEditPlatform = (platform: ExternalPlatform) => {
    setEditingPlatform(platform)
    setIsEditing(true)
  }

  const handleSavePlatform = () => {
    // In a real implementation, this would save to a backend API
    console.log('Saving platform configuration:', editingPlatform)
    setIsEditing(false)
    setEditingPlatform(null)
    // Refresh connection status
    checkAllConnections()
  }

  const getStatusIcon = (platformId: string) => {
    if (loading) {
      return <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
    }
    
    const isConnected = connectionStatus[platformId]
    if (isConnected) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    } else {
      return <XCircleIcon className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusText = (platformId: string) => {
    if (loading) return "Checking..."
    return connectionStatus[platformId] ? "Connected" : "Not Connected"
  }

  return (
    <ModulePage 
      title="External Learning Platforms"
      description="Configure and manage external learning platform integrations"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Configuration</h2>
            <p className="text-gray-600 mt-1">Manage external learning platform connections and settings</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={checkAllConnections}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              Test Connections
            </button>
          </div>
        </div>

        {/* Environment Configuration Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Environment Configuration Required</h3>
              <p className="text-sm text-blue-700 mt-1">
                Configure your external platform URLs and credentials in your <code className="bg-blue-100 px-1 rounded">.env.local</code> file.
                Copy the template from <code className="bg-blue-100 px-1 rounded">.env.external-platforms.example</code> to get started.
              </p>
            </div>
          </div>
        </div>

        {/* Platforms List */}
        <div className="grid gap-6">
          {platforms.map((platform) => (
            <div key={platform.id} className="bg-white border rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(platform.id)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-500">{getStatusText(platform.id)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      platform.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {platform.status}
                    </span>
                    <button
                      onClick={() => handleEditPlatform(platform)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{platform.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform URL</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-sm font-mono">
                        {platform.url || 'Not configured'}
                      </code>
                      {platform.url && platform.url !== '' && !platform.url.includes('placeholder') && (
                        <a
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(platform.features).map(([feature, enabled]) => (
                        enabled && (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                          >
                            {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">SSO Enabled:</span>
                    <span className={`ml-2 ${platform.ssoEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {platform.ssoEnabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Requires Auth:</span>
                    <span className={`ml-2 ${platform.requiresAuth ? 'text-orange-600' : 'text-gray-500'}`}>
                      {platform.requiresAuth ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">API Configured:</span>
                    <span className={`ml-2 ${platform.credentials?.apiKey ? 'text-green-600' : 'text-gray-500'}`}>
                      {platform.credentials?.apiKey ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Setup Instructions */}
        <div className="bg-gray-50 border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Instructions</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800">1. Copy Environment Template</h4>
              <code className="block bg-gray-800 text-green-400 p-2 rounded mt-1">
                cp .env.external-platforms.example .env.local
              </code>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">2. Configure Platform URLs</h4>
              <p className="text-gray-600">
                Edit <code className="bg-gray-200 px-1 rounded">.env.local</code> with your actual platform URLs and credentials.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">3. Test Connections</h4>
              <p className="text-gray-600">
                Use the "Test Connections" button above to verify your platform configurations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
