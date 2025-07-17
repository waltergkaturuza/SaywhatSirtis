"use client"

import { useState, useEffect } from "react"
import { 
  DocumentTextIcon, 
  Cog6ToothIcon, 
  UserGroupIcon, 
  BellIcon, 
  PuzzlePieceIcon, 
  TableCellsIcon,
  XMarkIcon 
} from "@heroicons/react/24/outline"
import TemplatesSettings from "./project-settings/TemplatesSettings"
import WorkflowsSettings from "./project-settings/WorkflowsSettings"
import CustomFieldsSettings from "./project-settings/CustomFieldsSettings"
import IntegrationsSettings from "./project-settings/IntegrationsSettings"
import NotificationsSettings from "./project-settings/NotificationsSettings"
import AccessControlSettings from "./project-settings/AccessControlSettings"

interface ProjectSettingsProps {
  permissions: Record<string, boolean>
  selectedProject: number | null
  onProjectSelect: (projectId: number | null) => void
}

interface ProjectSettings {
  templates: Template[]
  workflows: Workflow[]
  customFields: CustomField[]
  integrations: Record<string, { enabled: boolean; config: Record<string, unknown> }>
  notifications: NotificationRule[]
  accessControl: AccessRule[]
}

interface Template {
  id: string
  name: string
  description: string
  type: 'project' | 'task' | 'milestone' | 'report'
  fields: TemplateField[]
  isActive: boolean
  createdBy: string
  createdAt: string
  lastModified: string
}

interface TemplateField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'file'
  required: boolean
  defaultValue?: unknown
  options?: string[]
  validation?: string
}

interface Workflow {
  id: string
  name: string
  description: string
  type: 'approval' | 'review' | 'task' | 'milestone'
  assignedRoles: string[]
  conditions: string[]
  actions: string[]
  timeLimit: number
  isActive: boolean
}

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'file'
  required: boolean
  section: 'basic' | 'financial' | 'technical' | 'custom'
  validation?: string
  options: string[]
  defaultValue?: unknown
}

interface NotificationRule {
  id: string
  name: string
  event: 'task_created' | 'task_completed' | 'milestone_reached' | 'deadline_approaching' | 'budget_exceeded' | 'risk_identified'
  recipients: string[]
  methods: ('email' | 'sms' | 'push' | 'dashboard')[]
  conditions: string[]
  template: string
  enabled: boolean
}

interface AccessRule {
  id: string
  role: string
  scope: 'project' | 'organization' | 'team'
  permissions: ('view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'admin')[]
  restrictions?: string[]
}

export function ProjectSettings({ permissions, selectedProject, onProjectSelect }: ProjectSettingsProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState('templates')

  // Project settings state
  const [settings, setSettings] = useState<ProjectSettings>({
    templates: [
      {
        id: "tpl-1",
        name: "Standard Project Template",
        description: "Default template for new projects with standard fields",
        type: "project",
        fields: [
          { id: "f1", name: "Project Name", type: "text", required: true },
          { id: "f2", name: "Budget", type: "number", required: true },
          { id: "f3", name: "Start Date", type: "date", required: true },
          { id: "f4", name: "Priority", type: "select", required: false, options: ["Low", "Medium", "High"] }
        ],
        isActive: true,
        createdBy: "admin",
        createdAt: "2024-01-15",
        lastModified: "2024-01-20"
      }
    ],
    workflows: [
      {
        id: "wf-1",
        name: "Project Approval Workflow",
        description: "Standard approval process for new projects",
        type: "approval",
        assignedRoles: ["Project Manager", "Director"],
        conditions: ["Budget > 50000", "Duration > 6 months"],
        actions: ["Send notification", "Create approval task"],
        timeLimit: 5,
        isActive: true
      }
    ],
    customFields: [
      {
        id: "cf-1",
        name: "Client Contact",
        type: "text",
        required: false,
        section: "basic",
        options: []
      },
      {
        id: "cf-2",
        name: "Risk Level",
        type: "select",
        required: true,
        section: "custom",
        options: ["Low", "Medium", "High", "Critical"]
      }
    ],
    integrations: {
      jira: { enabled: true, config: { url: "", apiKey: "", projectKey: "" } },
      slack: { enabled: false, config: { webhook: "", channel: "" } },
      github: { enabled: false, config: { token: "", repository: "" } },
      azure: { enabled: true, config: { tenantId: "", clientId: "" } }
    },
    notifications: [
      {
        id: "notif-1",
        name: "Task Overdue Alert",
        event: "deadline_approaching",
        recipients: ["project-manager@saywhat.ng", "team-lead@saywhat.ng"],
        methods: ["email", "dashboard"],
        conditions: ["24 hours before deadline"],
        template: "Task {{task.name}} is approaching its deadline.",
        enabled: true
      }
    ],
    accessControl: [
      {
        id: "access-1",
        role: "Project Manager",
        scope: "project",
        permissions: ["view", "create", "edit", "approve"]
      },
      {
        id: "access-2",
        role: "Team Member",
        scope: "project",
        permissions: ["view", "edit"]
      }
    ]
  })

  // Tab configuration
  const tabs = [
    { id: 'templates', name: 'Templates', icon: DocumentTextIcon },
    { id: 'workflows', name: 'Workflows', icon: Cog6ToothIcon },
    { id: 'custom-fields', name: 'Custom Fields', icon: TableCellsIcon },
    { id: 'integrations', name: 'Integrations', icon: PuzzlePieceIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'access-control', name: 'Access Control', icon: UserGroupIcon }
  ]

  useEffect(() => {
    setMounted(true)
    // Load project settings if selectedProject exists
    if (selectedProject) {
      loadProjectSettings(selectedProject)
    }
  }, [selectedProject])

  const loadProjectSettings = async (projectId: number) => {
    setIsLoading(true)
    try {
      // API call to load project settings
      // const response = await fetch(`/api/projects/${projectId}/settings`)
      // const data = await response.json()
      // setSettings(data)
    } catch (error) {
      console.error('Failed to load project settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = async (section: keyof ProjectSettings, data: unknown) => {
    setIsLoading(true)
    try {
      // API call to update settings
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

  // Template handlers
  const handleTemplateAdd = () => {
    const newTemplate: Template = {
      id: `tpl-${Date.now()}`,
      name: "",
      description: "",
      type: "project",
      fields: [],
      isActive: false,
      createdBy: "current-user",
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    }
    setSettings(prev => ({
      ...prev,
      templates: [...prev.templates, newTemplate]
    }))
    setHasChanges(true)
  }

  const handleTemplateEdit = (template: Template) => {
    setSettings(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === template.id ? template : t)
    }))
    setHasChanges(true)
  }

  const handleTemplateDelete = (id: string) => {
    setSettings(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== id)
    }))
    setHasChanges(true)
  }

  // Workflow handlers
  const handleWorkflowAdd = () => {
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: "",
      description: "",
      type: "approval",
      assignedRoles: [],
      conditions: [],
      actions: [],
      timeLimit: 7,
      isActive: false
    }
    setSettings(prev => ({
      ...prev,
      workflows: [...prev.workflows, newWorkflow]
    }))
    setHasChanges(true)
  }

  const handleWorkflowEdit = (workflow: Workflow) => {
    setSettings(prev => ({
      ...prev,
      workflows: prev.workflows.map(w => w.id === workflow.id ? workflow : w)
    }))
    setHasChanges(true)
  }

  const handleWorkflowDelete = (id: string) => {
    setSettings(prev => ({
      ...prev,
      workflows: prev.workflows.filter(w => w.id !== id)
    }))
    setHasChanges(true)
  }

  // Custom field handlers
  const handleCustomFieldAdd = () => {
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      name: "",
      type: "text",
      required: false,
      section: "custom",
      options: []
    }
    setSettings(prev => ({
      ...prev,
      customFields: [...prev.customFields, newField]
    }))
    setHasChanges(true)
  }

  const handleCustomFieldEdit = (field: CustomField) => {
    setSettings(prev => ({
      ...prev,
      customFields: prev.customFields.map(f => f.id === field.id ? field : f)
    }))
    setHasChanges(true)
  }

  const handleCustomFieldDelete = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.id !== id)
    }))
    setHasChanges(true)
  }

  // Integration handlers
  const handleIntegrationChange = (key: string, updatedIntegration: Record<string, unknown>) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: { ...prev.integrations[key], ...updatedIntegration }
      }
    }))
    setHasChanges(true)
  }

  // Notification handlers
  const handleNotificationAdd = () => {
    const newNotification: NotificationRule = {
      id: `notif-${Date.now()}`,
      name: "",
      event: "task_created",
      recipients: [],
      methods: ["email"],
      conditions: [],
      template: "",
      enabled: true
    }
    setSettings(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }))
    setHasChanges(true)
  }

  const handleNotificationEdit = (notification: NotificationRule) => {
    setSettings(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === notification.id ? notification : n)
    }))
    setHasChanges(true)
  }

  const handleNotificationDelete = (id: string) => {
    setSettings(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }))
    setHasChanges(true)
  }

  // Access control handlers
  const handleAccessControlAdd = () => {
    const newAccess: AccessRule = {
      id: `access-${Date.now()}`,
      role: "",
      scope: "project",
      permissions: []
    }
    setSettings(prev => ({
      ...prev,
      accessControl: [...prev.accessControl, newAccess]
    }))
    setHasChanges(true)
  }

  const handleAccessControlEdit = (access: AccessRule) => {
    setSettings(prev => ({
      ...prev,
      accessControl: prev.accessControl.map(a => a.id === access.id ? access : a)
    }))
    setHasChanges(true)
  }

  const handleAccessControlDelete = (id: string) => {
    setSettings(prev => ({
      ...prev,
      accessControl: prev.accessControl.filter(a => a.id !== id)
    }))
    setHasChanges(true)
  }

  if (!mounted) {
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
          <h2 className="text-xl font-semibold text-gray-900">Project Settings</h2>
          <p className="text-sm text-gray-600">
            Configure project templates, workflows, and advanced settings
          </p>
        </div>
        {selectedProject && (
          <div className="text-sm text-gray-500">
            Project ID: {selectedProject}
          </div>
        )}
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
          {/* Templates */}
          {activeTab === 'templates' && (
            <TemplatesSettings
              templates={settings.templates}
              permissions={permissions}
              onEdit={handleTemplateEdit}
              onDelete={handleTemplateDelete}
              onAdd={handleTemplateAdd}
            />
          )}

          {/* Workflows */}
          {activeTab === 'workflows' && (
            <WorkflowsSettings
              workflows={settings.workflows}
              permissions={permissions}
              onEdit={handleWorkflowEdit}
              onDelete={handleWorkflowDelete}
              onAdd={handleWorkflowAdd}
            />
          )}

          {/* Custom Fields */}
          {activeTab === 'custom-fields' && (
            <CustomFieldsSettings
              customFields={settings.customFields}
              permissions={permissions}
              onEdit={handleCustomFieldEdit}
              onDelete={handleCustomFieldDelete}
              onAdd={handleCustomFieldAdd}
            />
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <IntegrationsSettings
              integrations={Object.entries(settings.integrations).map(([key, value]) => ({ id: key, ...value }))}
              permissions={permissions}
              onEdit={() => {}}
              onDelete={() => {}}
              onAdd={() => {}}
            />
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <NotificationsSettings
              notificationRules={settings.notifications}
              permissions={permissions}
              onEdit={handleNotificationEdit}
              onDelete={handleNotificationDelete}
              onAdd={handleNotificationAdd}
            />
          )}

          {/* Access Control */}
          {activeTab === 'access-control' && (
            <AccessControlSettings
              accessControls={settings.accessControl}
              permissions={permissions}
              onEdit={handleAccessControlEdit}
              onDelete={handleAccessControlDelete}
              onAdd={handleAccessControlAdd}
            />
          )}

          {/* Save Changes Section */}
          {hasChanges && (
            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button
                onClick={() => setHasChanges(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel Changes
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
    </div>
  )
}

export default ProjectSettings
