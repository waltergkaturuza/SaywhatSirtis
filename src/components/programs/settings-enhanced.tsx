"use client"

import { useState, useEffect } from "react"
import { CogIcon, BellIcon, GlobeAltIcon, ShieldCheckIcon, DocumentTextIcon, ChartBarIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline"
import GeneralSettings from "./settings/GeneralSettings"
import NotificationsSettings from "./settings/NotificationsSettings"
import SecuritySettings from "./settings/SecuritySettings"
import WorkflowSettings from "./settings/WorkflowSettings"
import IntegrationsSettings from "./settings/IntegrationsSettings"
import CustomFieldsSettings from "./settings/CustomFieldsSettings"

interface SettingsProps {
  permissions: Record<string, boolean>
  selectedProject: number | null
  onProjectSelect: (projectId: number | null) => void
}

interface ProjectSettings {
  general: {
    name: string
    description: string
    code: string
    timezone: string
    currency: string
    language: string
    dateFormat: string
    workingDays: string[]
    workingHours: { start: string; end: string }
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    milestoneAlerts: boolean
    budgetAlerts: boolean
    riskAlerts: boolean
    taskOverdue: boolean
    weeklyReports: boolean
    monthlyReports: boolean
    alertThreshold: number
  }
  security: {
    passwordPolicy: string
    sessionTimeout: number
    twoFactorAuth: boolean
    ipWhitelist: string[]
    dataEncryption: boolean
    auditLog: boolean
    backupFrequency: string
  }
  workflow: {
    approvalRequired: boolean
    taskAutoAssignment: boolean
    budgetApprovalLimit: number
    milestoneAutoUpdate: boolean
    reportingFrequency: string
    escalationRules: boolean
  }
  integrations: Record<string, { enabled: boolean; config: Record<string, unknown> }>
}

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  options?: string[]
  required: boolean
  description: string
  applies_to: 'projects' | 'tasks' | 'milestones' | 'resources'
}

export function Settings({ permissions, selectedProject, onProjectSelect }: SettingsProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Settings state
  const [settings, setSettings] = useState<ProjectSettings>({
    general: {
      name: "SAYWHAT Project Alpha",
      description: "Primary development project for SAYWHAT initiatives",
      code: "SWP-001",
      timezone: "Africa/Lagos",
      currency: "USD",
      language: "en",
      dateFormat: "DD/MM/YYYY",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      workingHours: { start: "09:00", end: "17:00" }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      milestoneAlerts: true,
      budgetAlerts: true,
      riskAlerts: true,
      taskOverdue: true,
      weeklyReports: true,
      monthlyReports: true,
      alertThreshold: 85
    },
    security: {
      passwordPolicy: "strong",
      sessionTimeout: 30,
      twoFactorAuth: true,
      ipWhitelist: [],
      dataEncryption: true,
      auditLog: true,
      backupFrequency: "daily"
    },
    workflow: {
      approvalRequired: true,
      taskAutoAssignment: false,
      budgetApprovalLimit: 10000,
      milestoneAutoUpdate: true,
      reportingFrequency: "weekly",
      escalationRules: true
    },
    integrations: {
      office365: { enabled: true, config: {} },
      slack: { enabled: false, config: {} },
      teams: { enabled: true, config: {} },
      sharepoint: { enabled: true, config: {} },
      kobo: { enabled: false, config: {} },
      powerbi: { enabled: false, config: {} }
    }
  })

  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: "1",
      name: "Project Priority",
      type: "select",
      options: ["Low", "Medium", "High", "Critical"],
      required: true,
      description: "Priority level for project scheduling",
      applies_to: "projects"
    },
    {
      id: "2",
      name: "Client Approval Required",
      type: "boolean",
      required: false,
      description: "Whether client approval is needed for milestones",
      applies_to: "milestones"
    }
  ])

  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [customFieldForm, setCustomFieldForm] = useState({
    name: "",
    type: "text" as CustomField['type'],
    options: [""],
    required: false,
    description: "",
    applies_to: "projects" as CustomField['applies_to']
  })

  // Tab configuration
  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'workflow', name: 'Workflow', icon: GlobeAltIcon },
    { id: 'integrations', name: 'Integrations', icon: DocumentTextIcon },
    { id: 'custom-fields', name: 'Custom Fields', icon: ChartBarIcon }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Settings update handler
  const updateSettings = async (section: keyof ProjectSettings, data: unknown) => {
    setIsLoading(true)
    try {
      // API call would go here
      setSettings(prev => ({
        ...prev,
        [section]: data
      }))
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to update settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Custom field handlers
  const resetCustomFieldForm = () => {
    setCustomFieldForm({
      name: "",
      type: "text",
      options: [""],
      required: false,
      description: "",
      applies_to: "projects"
    })
  }

  const createCustomField = async () => {
    setIsLoading(true)
    try {
      const newField: CustomField = {
        id: Date.now().toString(),
        name: customFieldForm.name,
        type: customFieldForm.type,
        options: customFieldForm.type === 'select' ? customFieldForm.options.filter(o => o.trim()) : undefined,
        required: customFieldForm.required,
        description: customFieldForm.description,
        applies_to: customFieldForm.applies_to
      }
      setCustomFields(prev => [...prev, newField])
      setShowCustomFieldModal(false)
      resetCustomFieldForm()
    } catch (error) {
      console.error('Failed to create custom field:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCustomField = async (id: string, data: Partial<CustomField>) => {
    setIsLoading(true)
    try {
      setCustomFields(prev => prev.map(field => 
        field.id === id ? { ...field, ...data } : field
      ))
      setShowCustomFieldModal(false)
      setEditingField(null)
      resetCustomFieldForm()
    } catch (error) {
      console.error('Failed to update custom field:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCustomField = async (id: string) => {
    if (confirm('Are you sure you want to delete this custom field?')) {
      setIsLoading(true)
      try {
        setCustomFields(prev => prev.filter(field => field.id !== id))
      } catch (error) {
        console.error('Failed to delete custom field:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEditCustomField = (field: CustomField) => {
    setEditingField(field)
    setCustomFieldForm({
      name: field.name,
      type: field.type,
      options: field.options || [""],
      required: field.required,
      description: field.description,
      applies_to: field.applies_to
    })
    setShowCustomFieldModal(true)
  }

  if (!mounted || !settings) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-600">Configure project settings and preferences</p>
        </div>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <GeneralSettings
              general={settings.general}
              onChange={(updatedGeneral) => {
                setSettings(prev => ({ ...prev, general: { ...prev.general, ...updatedGeneral } }))
                setHasChanges(true)
              }}
            />
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <NotificationsSettings
              notifications={settings.notifications}
              onChange={(updatedNotifications) => {
                setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, ...updatedNotifications } }))
                setHasChanges(true)
              }}
            />
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <SecuritySettings
              security={settings.security}
              onChange={(updatedSecurity) => {
                setSettings(prev => ({ ...prev, security: { ...prev.security, ...updatedSecurity } }))
                setHasChanges(true)
              }}
            />
          )}

          {/* Workflow */}
          {activeTab === 'workflow' && (
            <WorkflowSettings
              workflow={settings.workflow}
              onChange={(updatedWorkflow) => {
                setSettings(prev => ({ ...prev, workflow: { ...prev.workflow, ...updatedWorkflow } }))
                setHasChanges(true)
              }}
            />
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <IntegrationsSettings
              integrations={{
                office365: settings.integrations.office365 || { enabled: false, config: {} },
                slack: settings.integrations.slack || { enabled: false, config: {} },
                teams: settings.integrations.teams || { enabled: false, config: {} },
                sharepoint: settings.integrations.sharepoint || { enabled: false, config: {} },
                kobo: settings.integrations.kobo || { enabled: false, config: {} },
                powerbi: settings.integrations.powerbi || { enabled: false, config: {} },
                ...settings.integrations
              }}
              onChange={(key, updatedIntegration) => {
                setSettings(prev => ({
                  ...prev,
                  integrations: {
                    ...prev.integrations,
                    [key]: { ...prev.integrations[key], ...updatedIntegration }
                  }
                }))
                setHasChanges(true)
              }}
            />
          )}

          {/* Custom Fields */}
          {activeTab === 'custom-fields' && (
            <CustomFieldsSettings
              customFields={customFields}
              permissions={{ canCreate: true, canEdit: true, canDelete: true }}
              onEdit={handleEditCustomField}
              onDelete={deleteCustomField}
              onAdd={() => {
                setEditingField(null)
                resetCustomFieldForm()
                setShowCustomFieldModal(true)
              }}
            />
          )}

          {/* Save Changes Section */}
          {hasChanges && (
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                onClick={() => setHasChanges(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateSettings(activeTab as keyof ProjectSettings, settings[activeTab as keyof ProjectSettings])
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Field Modal */}
      {showCustomFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
              </h3>
              <button
                onClick={() => {
                  setShowCustomFieldModal(false)
                  setEditingField(null)
                  resetCustomFieldForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (editingField) {
                  updateCustomField(editingField.id, {
                    name: customFieldForm.name,
                    type: customFieldForm.type,
                    options: customFieldForm.type === 'select' ? customFieldForm.options.filter(o => o.trim()) : undefined,
                    required: customFieldForm.required,
                    description: customFieldForm.description,
                    applies_to: customFieldForm.applies_to
                  })
                } else {
                  createCustomField()
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name *
                </label>
                <input
                  type="text"
                  value={customFieldForm.name}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type *
                </label>
                <select
                  value={customFieldForm.type}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, type: e.target.value as CustomField['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select (Dropdown)</option>
                  <option value="boolean">Yes/No</option>
                </select>
              </div>
              {customFieldForm.type === 'select' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options
                  </label>
                  {customFieldForm.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...customFieldForm.options]
                          newOptions[index] = e.target.value
                          setCustomFieldForm(prev => ({ ...prev, options: newOptions }))
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      {customFieldForm.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = customFieldForm.options.filter((_, i) => i !== index)
                            setCustomFieldForm(prev => ({ ...prev, options: newOptions }))
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomFieldForm(prev => ({ ...prev, options: [...prev.options, ''] }))}
                    className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applies To *
                </label>
                <select
                  value={customFieldForm.applies_to}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, applies_to: e.target.value as CustomField['applies_to'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="projects">Projects</option>
                  <option value="tasks">Tasks</option>
                  <option value="milestones">Milestones</option>
                  <option value="resources">Resources</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={customFieldForm.description}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={customFieldForm.required}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-900">Required field</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomFieldModal(false)
                    setEditingField(null)
                    resetCustomFieldForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingField ? 'Update Field' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
