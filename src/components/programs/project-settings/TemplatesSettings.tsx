import React, { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon } from "@heroicons/react/24/outline"

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

interface TemplatesSettingsProps {
  templates: Template[]
  permissions: Record<string, boolean>
  onEdit: (template: Template) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

const TemplatesSettings: React.FC<TemplatesSettingsProps> = ({ 
  templates, 
  permissions, 
  onEdit, 
  onDelete, 
  onAdd 
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("")

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || template.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-800'
      case 'task': return 'bg-green-100 text-green-800'
      case 'milestone': return 'bg-purple-100 text-purple-800'
      case 'report': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Project Templates</h3>
          <p className="text-sm text-gray-600">
            Manage templates for projects, tasks, milestones, and reports
          </p>
        </div>
        {permissions?.canCreate && (
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Template</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
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
            <option value="project">Project</option>
            <option value="task">Task</option>
            <option value="milestone">Milestone</option>
            <option value="report">Report</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                  {template.type}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {template.isActive && (
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                {permissions?.canEdit && (
                  <button
                    onClick={() => onEdit(template)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {permissions?.canDelete && (
                  <button
                    onClick={() => onDelete(template.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Template Info */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
              
              <div className="text-xs text-gray-500 space-y-1">
                <div>Fields: {template.fields.length}</div>
                <div>Created: {new Date(template.createdAt).toLocaleDateString()}</div>
                <div>Last Modified: {new Date(template.lastModified).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType ? 'Try adjusting your filters' : 'Get started by creating your first template'}
          </p>
          {permissions?.canCreate && !searchTerm && !filterType && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Template
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default TemplatesSettings;
