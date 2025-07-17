import React from "react"

interface IntegrationConfig {
  enabled: boolean
  config: Record<string, unknown>
}

interface IntegrationsSettingsProps {
  integrations: {
    office365: IntegrationConfig
    slack: IntegrationConfig
    teams: IntegrationConfig
    sharepoint: IntegrationConfig
    kobo: IntegrationConfig
    powerbi: IntegrationConfig
    [key: string]: IntegrationConfig
  }
  onChange: (key: string, updates: Partial<IntegrationConfig>) => void
}

const integrationDescriptions: Record<string, string> = {
  office365: "Microsoft Office 365 integration for email and calendar",
  slack: "Slack integration for team communication",
  teams: "Microsoft Teams integration for collaboration",
  sharepoint: "SharePoint integration for document management",
  kobo: "KoBo Toolbox integration for data collection",
  powerbi: "Power BI integration for advanced analytics"
}

const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({ integrations, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
      <div className="space-y-4">
        {Object.entries(integrations).map(([key, integration]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
              <p className="text-sm text-gray-500">{integrationDescriptions[key] || ''}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs rounded-full ${integration.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {integration.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <input
                type="checkbox"
                checked={integration.enabled}
                onChange={e => onChange(key, { enabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IntegrationsSettings
