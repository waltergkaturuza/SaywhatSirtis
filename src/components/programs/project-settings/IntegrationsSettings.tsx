import React, { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, PuzzlePieceIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"

interface Integration {
  id: string
  enabled: boolean
  config: Record<string, unknown>
}

interface IntegrationsSettingsProps {
  integrations: Integration[]
  permissions: Record<string, boolean>
  onEdit: (integration: Integration) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({ 
  integrations, 
  permissions, 
  onEdit, 
  onDelete, 
  onAdd 
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  // Define available integrations with their metadata
  const integrationMetadata: Record<string, {
    name: string
    description: string
    icon: string
    category: string
    features: string[]
  }> = {
    jira: {
      name: "Jira",
      description: "Sync issues and project data with Atlassian Jira",
      icon: "🔗",
      category: "Project Management",
      features: ["Issue Sync", "Status Updates", "Time Tracking"]
    },
    slack: {
      name: "Slack",
      description: "Send notifications and updates to Slack channels",
      icon: "💬",
      category: "Communication",
      features: ["Notifications", "Bot Commands", "Channel Updates"]
    },
    github: {
      name: "GitHub",
      description: "Connect repositories and track commits",
      icon: "🐙",
      category: "Development",
      features: ["Repository Sync", "Commit Tracking", "Pull Requests"]
    },
    azure: {
      name: "Azure DevOps",
      description: "Integrate with Microsoft Azure DevOps services",
      icon: "☁️",
      category: "Development",
      features: ["Pipeline Integration", "Work Items", "Repository Management"]
    },
    office365: {
      name: "Office 365",
      description: "Connect with Microsoft Office 365 services",
      icon: "📧",
      category: "Productivity",
      features: ["Calendar Sync", "Email Integration", "SharePoint"]
    },
    teams: {
      name: "Microsoft Teams",
      description: "Send notifications to Teams channels",
      icon: "🗣️",
      category: "Communication",
      features: ["Channel Notifications", "Meeting Integration", "File Sharing"]
    }
  }

  const filteredIntegrations = integrations.filter(integration => {
    const metadata = integrationMetadata[integration.id]
    const matchesSearch = metadata?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metadata?.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'enabled' && integration.enabled) ||
                         (filterStatus === 'disabled' && !integration.enabled)
    return matchesSearch && matchesStatus
  })

  const toggleIntegration = (integration: Integration) => {
    onEdit({ ...integration, enabled: !integration.enabled })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Integrations</h3>
          <p className="text-sm text-gray-600">
            Connect with external services and tools to enhance your workflow
          </p>
        </div>
        {permissions?.canCreate && (
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Integration</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const metadata = integrationMetadata[integration.id]
          if (!metadata) return null

          return (
            <div
              key={integration.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Integration Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{metadata.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{metadata.name}</h4>
                    <p className="text-sm text-gray-500">{metadata.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleIntegration(integration)}
                    className={`flex items-center justify-center w-10 h-6 rounded-full transition-colors ${
                      integration.enabled
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        integration.enabled ? 'translate-x-2' : '-translate-x-2'
                      }`}
                    />
                  </button>
                  {permissions?.canEdit && (
                    <button
                      onClick={() => onEdit(integration)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Integration Info */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{metadata.description}</p>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Features:</span>
                  <div className="mt-1 space-y-1">
                    {metadata.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckIcon className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      integration.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {integration.enabled ? 'Connected' : 'Not Connected'}
                    </span>
                    {integration.enabled && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <PuzzlePieceIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus 
              ? 'Try adjusting your filters' 
              : 'Connect external services to enhance your workflow'
            }
          </p>
          {permissions?.canCreate && !searchTerm && !filterStatus && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Integrations
            </button>
          )}
        </div>
      )}

      {/* Integration Categories */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Available Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Project Management', 'Communication', 'Development', 'Productivity'].map((category) => (
            <div key={category} className="text-center">
              <div className="text-sm font-medium text-gray-700">{category}</div>
              <div className="text-xs text-gray-500 mt-1">
                {Object.values(integrationMetadata).filter(m => m.category === category).length} available
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IntegrationsSettings;
