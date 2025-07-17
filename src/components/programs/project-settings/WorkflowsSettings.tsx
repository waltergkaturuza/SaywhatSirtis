import React, { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, Cog6ToothIcon, PlayIcon, PauseIcon } from "@heroicons/react/24/outline"

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

interface WorkflowsSettingsProps {
  workflows: Workflow[]
  permissions: Record<string, boolean>
  onEdit: (workflow: Workflow) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

const WorkflowsSettings: React.FC<WorkflowsSettingsProps> = ({ 
  workflows, 
  permissions, 
  onEdit, 
  onDelete, 
  onAdd 
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || workflow.type === filterType
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && workflow.isActive) ||
                         (filterStatus === 'inactive' && !workflow.isActive)
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'approval': return 'bg-yellow-100 text-yellow-800'
      case 'review': return 'bg-blue-100 text-blue-800'
      case 'task': return 'bg-green-100 text-green-800'
      case 'milestone': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleWorkflowStatus = (workflow: Workflow) => {
    onEdit({ ...workflow, isActive: !workflow.isActive })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Workflows</h3>
          <p className="text-sm text-gray-600">
            Manage automated workflows for approvals, reviews, and task assignments
          </p>
        </div>
        {permissions?.canCreate && (
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Workflow</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="approval">Approval</option>
            <option value="review">Review</option>
            <option value="task">Task</option>
            <option value="milestone">Milestone</option>
          </select>
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {filteredWorkflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              {/* Workflow Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                  <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(workflow.type)}`}>
                    {workflow.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Assigned Roles:</span>
                    <div className="mt-1 space-y-1">
                      {workflow.assignedRoles.length > 0 ? (
                        workflow.assignedRoles.map((role, index) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">None assigned</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Conditions:</span>
                    <div className="mt-1">
                      {workflow.conditions.length > 0 ? (
                        <ul className="text-gray-600 space-y-1">
                          {workflow.conditions.slice(0, 2).map((condition, index) => (
                            <li key={index} className="text-xs">• {condition}</li>
                          ))}
                          {workflow.conditions.length > 2 && (
                            <li className="text-xs text-gray-500">
                              +{workflow.conditions.length - 2} more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-gray-500">No conditions</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Time Limit:</span>
                    <div className="mt-1 text-gray-600">
                      {workflow.timeLimit > 0 ? `${workflow.timeLimit} days` : 'No limit'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {permissions?.canEdit && (
                  <button
                    onClick={() => toggleWorkflowStatus(workflow)}
                    className={`p-2 rounded-md ${
                      workflow.isActive
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={workflow.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {workflow.isActive ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                  </button>
                )}
                {permissions?.canEdit && (
                  <button
                    onClick={() => onEdit(workflow)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {permissions?.canDelete && (
                  <button
                    onClick={() => onDelete(workflow.id)}
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
      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType || filterStatus ? 'Try adjusting your filters' : 'Get started by creating your first workflow'}
          </p>
          {permissions?.canCreate && !searchTerm && !filterType && !filterStatus && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Workflow
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default WorkflowsSettings;
