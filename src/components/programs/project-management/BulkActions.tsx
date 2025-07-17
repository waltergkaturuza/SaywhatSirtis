import React, { useState } from "react"
import { 
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  TrashIcon,
  PencilIcon,
  ShareIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline"

interface BulkActionsProps {
  selectedProjects: string[]
  onAction: (action: string, data?: any) => void
  onClear: () => void
  permissions: any
  isLoading?: boolean
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedProjects,
  onAction,
  onClear,
  permissions,
  isLoading = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [showAssignMenu, setShowAssignMenu] = useState(false)

  const selectedCount = selectedProjects.length

  if (selectedCount === 0) {
    return null
  }

  const statusOptions = [
    { id: 'planning', name: 'Planning', icon: '📋', color: 'text-blue-600' },
    { id: 'active', name: 'Active', icon: '🟢', color: 'text-green-600' },
    { id: 'on-hold', name: 'On Hold', icon: '⏸️', color: 'text-yellow-600' },
    { id: 'completed', name: 'Completed', icon: '✅', color: 'text-gray-600' }
  ]

  const priorityOptions = [
    { id: 'critical', name: 'Critical', color: 'text-red-600' },
    { id: 'high', name: 'High', color: 'text-orange-600' },
    { id: 'medium', name: 'Medium', color: 'text-yellow-600' },
    { id: 'low', name: 'Low', color: 'text-green-600' }
  ]

  const assigneeOptions = [
    { id: 'john-doe', name: 'John Doe', avatar: '/avatars/john.jpg' },
    { id: 'jane-smith', name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
    { id: 'michael-chen', name: 'Michael Chen', avatar: '/avatars/michael.jpg' },
    { id: 'sarah-lee', name: 'Sarah Lee', avatar: '/avatars/sarah.jpg' }
  ]

  const handleAction = (actionType: string, data?: any) => {
    onAction(actionType, { projectIds: selectedProjects, ...data })
    
    // Close menus after action
    setShowStatusMenu(false)
    setShowPriorityMenu(false)
    setShowAssignMenu(false)
  }

  const DropdownMenu: React.FC<{
    isOpen: boolean
    onToggle: () => void
    title: string
    children: React.ReactNode
    icon?: React.ReactNode
  }> = ({ isOpen, onToggle, title, children, icon }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        disabled={isLoading}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {icon}
        <span className="ml-1">{title}</span>
        <ChevronDownIcon className="ml-1 h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              {selectedCount} project{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Basic Actions */}
          <div className="flex items-center space-x-2">
            {/* Change Status */}
            {permissions?.canEdit && (
              <DropdownMenu
                isOpen={showStatusMenu}
                onToggle={() => setShowStatusMenu(!showStatusMenu)}
                title="Status"
                icon={<TagIcon className="h-4 w-4" />}
              >
                {statusOptions.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleAction('changeStatus', { status: status.id })}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="mr-2">{status.icon}</span>
                    <span className={status.color}>{status.name}</span>
                  </button>
                ))}
              </DropdownMenu>
            )}

            {/* Change Priority */}
            {permissions?.canEdit && (
              <DropdownMenu
                isOpen={showPriorityMenu}
                onToggle={() => setShowPriorityMenu(!showPriorityMenu)}
                title="Priority"
                icon={<span className="h-4 w-4 text-red-500">🔥</span>}
              >
                {priorityOptions.map((priority) => (
                  <button
                    key={priority.id}
                    onClick={() => handleAction('changePriority', { priority: priority.id })}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className={`font-medium ${priority.color} capitalize`}>
                      {priority.name}
                    </span>
                  </button>
                ))}
              </DropdownMenu>
            )}

            {/* Assign Manager */}
            {permissions?.canEdit && (
              <DropdownMenu
                isOpen={showAssignMenu}
                onToggle={() => setShowAssignMenu(!showAssignMenu)}
                title="Assign"
                icon={<UserIcon className="h-4 w-4" />}
              >
                {assigneeOptions.map((assignee) => (
                  <button
                    key={assignee.id}
                    onClick={() => handleAction('assignManager', { managerId: assignee.id })}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="h-6 w-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {assignee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span>{assignee.name}</span>
                  </button>
                ))}
              </DropdownMenu>
            )}

            {/* Quick Actions */}
            {permissions?.canEdit && (
              <>
                <button
                  onClick={() => handleAction('duplicate')}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                  Duplicate
                </button>

                <button
                  onClick={() => handleAction('archive')}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                  Archive
                </button>
              </>
            )}

            {/* Export */}
            <button
              onClick={() => handleAction('export')}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ShareIcon className="h-4 w-4 mr-1" />
              Export
            </button>

            {/* Advanced Actions Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span>More</span>
              <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Clear Selection */}
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear selection
        </button>
      </div>

      {/* Advanced Actions */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Add Tags */}
            {permissions?.canEdit && (
              <button
                onClick={() => {
                  const tags = prompt('Enter tags (comma-separated):')
                  if (tags) {
                    handleAction('addTags', { tags: tags.split(',').map(t => t.trim()) })
                  }
                }}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <TagIcon className="h-4 w-4 mr-1" />
                Add Tags
              </button>
            )}

            {/* Update Budget */}
            {permissions?.canEdit && (
              <button
                onClick={() => {
                  const budget = prompt('Enter new budget amount (NGN):')
                  if (budget && !isNaN(Number(budget))) {
                    handleAction('updateBudget', { budget: Number(budget) })
                  }
                }}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                Update Budget
              </button>
            )}

            {/* Update Deadline */}
            {permissions?.canEdit && (
              <button
                onClick={() => {
                  const deadline = prompt('Enter new deadline (YYYY-MM-DD):')
                  if (deadline) {
                    handleAction('updateDeadline', { deadline })
                  }
                }}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Update Deadline
              </button>
            )}

            {/* Generate Report */}
            <button
              onClick={() => handleAction('generateReport')}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
              Generate Report
            </button>

            {/* Send Notification */}
            {permissions?.canEdit && (
              <button
                onClick={() => {
                  const message = prompt('Enter notification message:')
                  if (message) {
                    handleAction('sendNotification', { message })
                  }
                }}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ShareIcon className="h-4 w-4 mr-1" />
                Notify Team
              </button>
            )}

            {/* Bulk Edit */}
            {permissions?.canEdit && (
              <button
                onClick={() => handleAction('bulkEdit')}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Bulk Edit
              </button>
            )}

            {/* Move to Folder */}
            {permissions?.canEdit && (
              <button
                onClick={() => {
                  const folder = prompt('Enter folder name:')
                  if (folder) {
                    handleAction('moveToFolder', { folder })
                  }
                }}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                Move to Folder
              </button>
            )}

            {/* Delete */}
            {permissions?.canDelete && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedCount} project(s)? This action cannot be undone.`)) {
                    handleAction('delete')
                  }
                }}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            )}
          </div>

          {/* Bulk Operation Status */}
          {isLoading && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Processing bulk operation...</span>
            </div>
          )}
        </div>
      )}

      {/* Summary Information */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="text-xs text-gray-600">
          <span className="font-medium">Available actions:</span>
          {permissions?.canEdit && <span className="ml-1">Edit, </span>}
          {permissions?.canDelete && <span>Delete, </span>}
          <span>Export, Generate Reports</span>
          {selectedCount > 1 && (
            <span className="ml-2 text-blue-600">
              • Use bulk operations to efficiently manage multiple projects
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BulkActions
