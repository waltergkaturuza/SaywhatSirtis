import React, { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, BellIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"

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

interface NotificationsSettingsProps {
  notificationRules: NotificationRule[]
  permissions: any
  onEdit: (rule: NotificationRule) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

const NotificationsSettings: React.FC<NotificationsSettingsProps> = ({ 
  notificationRules, 
  permissions, 
  onEdit, 
  onDelete, 
  onAdd 
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEvent, setFilterEvent] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  const filteredRules = notificationRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEvent = !filterEvent || rule.event === filterEvent
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'enabled' && rule.enabled) ||
                         (filterStatus === 'disabled' && !rule.enabled)
    return matchesSearch && matchesEvent && matchesStatus
  })

  const getEventColor = (event: string) => {
    switch (event) {
      case 'task_created': return 'bg-blue-100 text-blue-800'
      case 'task_completed': return 'bg-green-100 text-green-800'
      case 'milestone_reached': return 'bg-purple-100 text-purple-800'
      case 'deadline_approaching': return 'bg-yellow-100 text-yellow-800'
      case 'budget_exceeded': return 'bg-red-100 text-red-800'
      case 'risk_identified': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'task_created': return '➕'
      case 'task_completed': return '✅'
      case 'milestone_reached': return '🎯'
      case 'deadline_approaching': return '⏰'
      case 'budget_exceeded': return '💰'
      case 'risk_identified': return '⚠️'
      default: return '🔔'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return '📧'
      case 'sms': return '📱'
      case 'push': return '🔔'
      case 'dashboard': return '📊'
      default: return '❓'
    }
  }

  const toggleRule = (rule: NotificationRule) => {
    onEdit({ ...rule, enabled: !rule.enabled })
  }

  const formatEventName = (event: string) => {
    return event.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notification Rules</h3>
          <p className="text-sm text-gray-600">
            Configure automated notifications for project events and milestones
          </p>
        </div>
        {permissions?.canCreate && (
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Rule</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search notification rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Events</option>
            <option value="task_created">Task Created</option>
            <option value="task_completed">Task Completed</option>
            <option value="milestone_reached">Milestone Reached</option>
            <option value="deadline_approaching">Deadline Approaching</option>
            <option value="budget_exceeded">Budget Exceeded</option>
            <option value="risk_identified">Risk Identified</option>
          </select>
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

      {/* Notification Rules List */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              {/* Rule Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">{getEventIcon(rule.event)}</span>
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventColor(rule.event)}`}>
                    {formatEventName(rule.event)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Recipients */}
                  <div>
                    <span className="font-medium text-gray-700">Recipients:</span>
                    <div className="mt-1">
                      {rule.recipients.length > 0 ? (
                        <div className="space-y-1">
                          {rule.recipients.slice(0, 2).map((recipient, index) => (
                            <div key={index} className="text-gray-600 text-xs">
                              {recipient}
                            </div>
                          ))}
                          {rule.recipients.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{rule.recipients.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">No recipients</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Methods */}
                  <div>
                    <span className="font-medium text-gray-700">Methods:</span>
                    <div className="mt-1 flex space-x-1">
                      {rule.methods.map((method, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        >
                          <span>{getMethodIcon(method)}</span>
                          <span className="capitalize">{method}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Conditions */}
                  <div>
                    <span className="font-medium text-gray-700">Conditions:</span>
                    <div className="mt-1">
                      {rule.conditions.length > 0 ? (
                        <ul className="text-gray-600 space-y-1">
                          {rule.conditions.slice(0, 2).map((condition, index) => (
                            <li key={index} className="text-xs">• {condition}</li>
                          ))}
                          {rule.conditions.length > 2 && (
                            <li className="text-xs text-gray-500">
                              +{rule.conditions.length - 2} more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-gray-500">No conditions</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Template Preview */}
                {rule.template && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium text-gray-700">Template:</span>
                    <p className="text-sm text-gray-600 mt-1 italic">"{rule.template}"</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {permissions?.canEdit && (
                  <button
                    onClick={() => toggleRule(rule)}
                    className={`flex items-center justify-center w-10 h-6 rounded-full transition-colors ${
                      rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        rule.enabled ? 'translate-x-2' : '-translate-x-2'
                      }`}
                    />
                  </button>
                )}
                {permissions?.canEdit && (
                  <button
                    onClick={() => onEdit(rule)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {permissions?.canDelete && (
                  <button
                    onClick={() => onDelete(rule.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRules.length === 0 && (
        <div className="text-center py-12">
          <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notification rules found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterEvent || filterStatus 
              ? 'Try adjusting your filters' 
              : 'Get started by creating your first notification rule'
            }
          </p>
          {permissions?.canCreate && !searchTerm && !filterEvent && !filterStatus && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Notification Rule
            </button>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Notification Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {notificationRules.length}
            </div>
            <div className="text-sm text-gray-600">Total Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {notificationRules.filter(r => r.enabled).length}
            </div>
            <div className="text-sm text-gray-600">Active Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Array.from(new Set(notificationRules.flatMap(r => r.methods))).length}
            </div>
            <div className="text-sm text-gray-600">Methods Used</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Array.from(new Set(notificationRules.map(r => r.event))).length}
            </div>
            <div className="text-sm text-gray-600">Event Types</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsSettings;
