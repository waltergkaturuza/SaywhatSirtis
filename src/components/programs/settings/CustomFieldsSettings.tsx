import React from "react"
import { PlusIcon, TrashIcon, ChartBarIcon } from "@heroicons/react/24/outline"

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  options?: string[]
  required: boolean
  description: string
  applies_to: 'projects' | 'tasks' | 'milestones' | 'resources'
}

interface CustomFieldsSettingsProps {
  customFields: CustomField[]
  permissions: { canCreate: boolean; canEdit: boolean; canDelete: boolean }
  onEdit: (field: CustomField) => void
  onDelete: (fieldId: string) => void
  onAdd: () => void
}

const CustomFieldsSettings: React.FC<CustomFieldsSettingsProps> = ({ customFields, permissions, onEdit, onDelete, onAdd }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Custom Fields</h3>
        {permissions.canCreate && (
          <button
            onClick={onAdd}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Custom Field
          </button>
        )}
      </div>
      <div className="space-y-4">
        {customFields.map(field => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900">{field.name}</h4>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded capitalize">{field.type}</span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded capitalize">{field.applies_to}</span>
                  {field.required && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Required</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                {field.options && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {field.options.map((option, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-200 rounded">{option}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {permissions.canEdit && (
                  <button
                    onClick={() => onEdit(field)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                )}
                {permissions.canDelete && (
                  <button
                    onClick={() => onDelete(field.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {customFields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No custom fields configured</p>
            <p className="text-sm">Add custom fields to capture additional project information</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomFieldsSettings
