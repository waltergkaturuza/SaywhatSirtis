"use client"

import { useState, useEffect } from 'react'
import { 
  Cog6ToothIcon, 
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface Settings {
  system: any
  email: any
  security: any
  backup: any
  notifications: any
  integrations: any
  performance: any
}

interface AdminSettingsProps {
  className?: string
}

export function AdminSettings({ className = '' }: AdminSettingsProps) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('system')
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      setSettings(data.data?.settings || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSaveSettings = async (category: string, categorySettings: any) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          settingsData: categorySettings
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      await fetchSettings()
      alert('Settings saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof Settings],
        [key]: value
      }
    })
  }

  const updateNestedSetting = (category: string, parentKey: string, key: string, value: any) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof Settings],
        [parentKey]: {
          ...(settings[category as keyof Settings] as any)?.[parentKey],
          [key]: value
        }
      }
    })
  }

  const handleBackupNow = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'backup_now'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start backup')
      }

      const result = await response.json()
      alert(`Backup started! Backup ID: ${result.data?.backupId}`)
      await fetchSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start backup')
    }
  }

  const tabs = [
    { id: 'system', name: 'System', icon: Cog6ToothIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'email', name: 'Email', icon: EnvelopeIcon },
    { id: 'backup', name: 'Backup', icon: CloudArrowUpIcon },
    { id: 'integrations', name: 'Integrations', icon: ServerIcon },
  ]

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
            <XMarkIcon className="h-5 w-5 text-red-400" />
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
          <Cog6ToothIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
            <p className="text-sm text-gray-600">Configure system-wide settings and preferences</p>
          </div>
        </div>
        <button
          onClick={() => handleSaveSettings(activeTab, settings?.[activeTab as keyof Settings])}
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50"
        >
          {saving ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <CheckIcon className="h-5 w-5" />
          )}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'system' && settings?.system && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.system.appName || ''}
                    onChange={(e) => updateSetting('system', 'appName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.system.timezone || 'Africa/Harare'}
                    onChange={(e) => updateSetting('system', 'timezone', e.target.value)}
                  >
                    <option value="Africa/Harare">Africa/Harare</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.system.currency || 'USD'}
                    onChange={(e) => updateSetting('system', 'currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="ZWL">ZWL</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.system.sessionTimeout || 30}
                    onChange={(e) => updateSetting('system', 'sessionTimeout', parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={settings.system.maintenanceMode || false}
                    onChange={(e) => updateSetting('system', 'maintenanceMode', e.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Maintenance Mode
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={settings.system.debugMode || false}
                    onChange={(e) => updateSetting('system', 'debugMode', e.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Debug Mode
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && settings?.security && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limit (requests per window)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.security.rateLimitRequests || 100}
                    onChange={(e) => updateSetting('security', 'rateLimitRequests', parseInt(e.target.value) || 100)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limit Window (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.security.rateLimitWindow || 15}
                    onChange={(e) => updateSetting('security', 'rateLimitWindow', parseInt(e.target.value) || 15)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={settings.security.csrfProtection || false}
                    onChange={(e) => updateSetting('security', 'csrfProtection', e.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    CSRF Protection
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={settings.security.xssProtection || false}
                    onChange={(e) => updateSetting('security', 'xssProtection', e.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    XSS Protection
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && settings?.email && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.email.smtpHost || ''}
                    onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.email.smtpPort || 587}
                    onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value) || 587)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.email.fromEmail || ''}
                    onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.email.fromName || ''}
                    onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && settings?.backup && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Backup Configuration</h4>
                    <p className="text-sm text-blue-700 mt-1">Configure automated backup settings</p>
                  </div>
                  <button
                    onClick={handleBackupNow}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <CloudArrowUpIcon className="h-5 w-5" />
                    <span>Backup Now</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={settings.backup.enabled || false}
                    onChange={(e) => updateSetting('backup', 'enabled', e.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Automated Backups
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Schedule
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.backup.schedule || 'daily'}
                    onChange={(e) => updateSetting('backup', 'schedule', e.target.value)}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.backup.retention || 30}
                    onChange={(e) => updateSetting('backup', 'retention', parseInt(e.target.value) || 30)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Location
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.backup.location || 'local'}
                    onChange={(e) => updateSetting('backup', 'location', e.target.value)}
                  >
                    <option value="local">Local Storage</option>
                    <option value="cloud">Cloud Storage</option>
                    <option value="external">External Drive</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={settings.backup.encryptBackups || false}
                    onChange={(e) => updateSetting('backup', 'encryptBackups', e.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Encrypt Backups
                  </label>
                </div>
              </div>

              {settings.backup.lastBackup && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Last Backup</h4>
                  <p className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${settings.backup.backupStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {settings.backup.backupStatus || 'unknown'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(settings.backup.lastBackup).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'integrations' && settings?.integrations && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Third-Party Integrations</h4>
                <p className="text-sm text-gray-600">Connect external services and platforms</p>
              </div>

              {/* Office 365 Integration */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-medium text-gray-900">Office 365</h5>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={settings.integrations.office365?.enabled || false}
                    onChange={(e) => updateNestedSetting('integrations', 'office365', 'enabled', e.target.checked)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tenant ID</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.integrations.office365?.tenantId || ''}
                      onChange={(e) => updateNestedSetting('integrations', 'office365', 'tenantId', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.integrations.office365?.clientId || ''}
                      onChange={(e) => updateNestedSetting('integrations', 'office365', 'clientId', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.integrations.office365?.clientSecret || ''}
                      onChange={(e) => updateNestedSetting('integrations', 'office365', 'clientSecret', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URI</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.integrations.office365?.redirectUri || ''}
                      onChange={(e) => updateNestedSetting('integrations', 'office365', 'redirectUri', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SharePoint Integration */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-medium text-gray-900">SharePoint</h5>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={settings.integrations.sharepoint?.enabled || false}
                    onChange={(e) => updateNestedSetting('integrations', 'sharepoint', 'enabled', e.target.checked)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.integrations.sharepoint?.siteUrl || ''}
                      onChange={(e) => updateNestedSetting('integrations', 'sharepoint', 'siteUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">List ID</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.integrations.sharepoint?.listId || ''}
                      onChange={(e) => updateNestedSetting('integrations', 'sharepoint', 'listId', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Teams Integration */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-medium text-gray-900">Microsoft Teams</h5>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={settings.integrations.teams?.enabled || false}
                    onChange={(e) => updateNestedSetting('integrations', 'teams', 'enabled', e.target.checked)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.integrations.teams?.webhookUrl || ''}
                      onChange={(e) => updateNestedSetting('integrations', 'teams', 'webhookUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Channel ID</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.integrations.teams?.channelId || ''}
                      onChange={(e) => updateNestedSetting('integrations', 'teams', 'channelId', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!settings?.[activeTab as keyof Settings] && activeTab !== 'system' && activeTab !== 'security' && activeTab !== 'email' && activeTab !== 'backup' && activeTab !== 'integrations' && (
            <div className="text-center py-12 text-gray-500">
              <p>Settings for this category are not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
