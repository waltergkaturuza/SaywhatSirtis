"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  CloudArrowUpIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PlusIcon
} from "@heroicons/react/24/outline"
import { realProjects } from "@/data/projects"

export default function KoboIntegrationPage() {
  const { data: session } = useSession()
  
  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canManageIntegration = userPermissions.includes('programs.me_access') || userPermissions.includes('programs.admin')

  const [apiSettings, setApiSettings] = useState({
    serverUrl: 'https://kf.kobotoolbox.org',
    apiToken: '********************************',
    isConnected: true,
    autoSync: true,
    syncInterval: 30
  })

  const [isTesting, setIsTesting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Sample integration status for projects
  const integrationStatus = realProjects.map(project => ({
    ...project,
    koboIntegration: {
      enabled: Math.random() > 0.3,
      forms: Math.floor(Math.random() * 5) + 1,
      lastSync: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      submissions: Math.floor(Math.random() * 1000) + 100,
      status: Math.random() > 0.2 ? 'active' : 'error'
    }
  }))

  const syncStats = {
    totalProjects: realProjects.length,
    connectedProjects: integrationStatus.filter(p => p.koboIntegration.enabled).length,
    totalForms: integrationStatus.reduce((sum, p) => sum + (p.koboIntegration.enabled ? p.koboIntegration.forms : 0), 0),
    totalSubmissions: integrationStatus.reduce((sum, p) => sum + (p.koboIntegration.enabled ? p.koboIntegration.submissions : 0), 0),
    lastGlobalSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsTesting(false)
    alert('Connection test successful!')
  }

  const handleGlobalSync = async () => {
    setIsSyncing(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsSyncing(false)
    alert('Global sync completed successfully!')
  }

  const handleSettingChange = (key: string, value: string | boolean | number) => {
    setApiSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    alert('Settings saved successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'syncing': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-5 w-5" />
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'syncing': return <ArrowPathIcon className="h-5 w-5 animate-spin" />
      default: return <XMarkIcon className="h-5 w-5" />
    }
  }

  const metadata = {
    title: "Kobo Integration",
    description: "Manage Kobo Toolbox integration for automated data collection and synchronization",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs", href: "/programs" },
      { name: "Kobo Integration" }
    ]
  }

  const actions = (
    <>
      <button
        onClick={handleGlobalSync}
        disabled={isSyncing || !apiSettings.isConnected}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        <ArrowPathIcon className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync All'}
      </button>
      {canManageIntegration && (
        <button
          onClick={saveSettings}
          className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
        >
          <Cog6ToothIcon className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      )}
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{syncStats.connectedProjects}</div>
            <div className="text-sm text-blue-800">Connected Projects</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">{syncStats.totalForms}</div>
            <div className="text-sm text-green-800">Active Forms</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">{syncStats.totalSubmissions.toLocaleString()}</div>
            <div className="text-sm text-purple-800">Total Submissions</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${apiSettings.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>API Connection: {apiSettings.isConnected ? 'Active' : 'Disconnected'}</span>
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${apiSettings.autoSync ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
            <span>Auto-sync: {apiSettings.autoSync ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            <span>Last sync: {new Date(syncStats.lastGlobalSync).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            {isTesting ? 'Testing Connection...' : 'Test API Connection'}
          </button>
          <button className="w-full text-left p-2 text-sm text-green-600 hover:bg-green-50 rounded">
            View Sync Logs
          </button>
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            Export Integration Data
          </button>
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            API Documentation
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* API Configuration */}
        {canManageIntegration && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">API Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kobo Server URL
                </label>
                <input
                  type="url"
                  value={apiSettings.serverUrl}
                  onChange={(e) => handleSettingChange('serverUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://kf.kobotoolbox.org"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Token
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={apiSettings.apiToken}
                    onChange={(e) => handleSettingChange('apiToken', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your Kobo API token"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isTesting ? 'Testing...' : 'Test'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-sync
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={apiSettings.autoSync}
                    onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Enable automatic data synchronization</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sync Interval (minutes)
                </label>
                <select
                  value={apiSettings.syncInterval}
                  onChange={(e) => handleSettingChange('syncInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Integration Overview */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Integration Overview</h2>
            <div className={`flex items-center space-x-2 ${apiSettings.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${apiSettings.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm font-medium">{apiSettings.isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <div className="text-lg font-semibold text-blue-900">Real-time Sync</div>
                  <div className="text-sm text-blue-700">Data synchronization</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <div className="text-lg font-semibold text-green-900">Analytics</div>
                  <div className="text-sm text-green-700">Automated processing</div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <div className="text-lg font-semibold text-purple-900">Form Management</div>
                  <div className="text-sm text-purple-700">Integrated workflows</div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Cog6ToothIcon className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <div className="text-lg font-semibold text-yellow-900">Automation</div>
                  <div className="text-sm text-yellow-700">Zero manual effort</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Integration Status */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Project Integration Status</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {integrationStatus.map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <div className={`flex items-center ${getStatusColor(project.koboIntegration.status)}`}>
                        {getStatusIcon(project.koboIntegration.status)}
                        <span className="ml-1 text-sm font-medium">{project.koboIntegration.status}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{project.description.substring(0, 120)}...</p>
                    
                    {project.koboIntegration.enabled ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Forms:</span> {project.koboIntegration.forms}
                        </div>
                        <div>
                          <span className="font-medium">Submissions:</span> {project.koboIntegration.submissions.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Last Sync:</span> {new Date(project.koboIntegration.lastSync).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Donor:</span> {project.donor}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Kobo integration not enabled for this project
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {project.koboIntegration.enabled ? (
                      <>
                        <Link
                          href={`/programs/projects/${project.id}/forms`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Manage Forms
                        </Link>
                        <button
                          onClick={() => alert(`Syncing ${project.name}...`)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Sync Now
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => alert(`Enabling integration for ${project.name}...`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Enable Integration
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Guidelines */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Kobo Integration Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Automated Data Collection</h4>
              <ul className="space-y-1">
                <li>• Real-time data synchronization</li>
                <li>• Automatic indicator updates</li>
                <li>• Reduced manual data entry</li>
                <li>• Error reduction and validation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Enhanced M&E Capabilities</h4>
              <ul className="space-y-1">
                <li>• Live dashboard updates</li>
                <li>• Instant progress tracking</li>
                <li>• Geographic data mapping</li>
                <li>• Demographic analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
