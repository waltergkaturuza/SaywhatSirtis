import React, { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, TableCellsIcon } from "@heroicons/react/24/outline"

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'file'
  required: boolean
  section: 'basic' | 'financial' | 'technical' | 'custom'
  validation?: string
  options: string[]
  defaultValue?: any
}

interface CustomFieldsSettingsProps {
  customFields: CustomField[]
  permissions: any
  onEdit: (field: CustomField) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

const CustomFieldsSettings: React.FC<CustomFieldsSettingsProps> = ({ 
  customFields, 
  permissions, 
  onEdit, 
  onDelete, 
  onAdd 
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSection, setFilterSection] = useState<string>("")
  const [filterType, setFilterType] = useState<string>("")

  const filteredFields = customFields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSection = !filterSection || field.section === filterSection
    const matchesType = !filterType || field.type === filterType
    return matchesSearch && matchesSection && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝'
      case 'number': return '🔢'
      case 'date': return '📅'
      case 'select': return '📋'
      case 'multiselect': return '☑️'
      case 'boolean': return '✅'
      case 'file': return '📁'
      default: return '❓'
    }
  }

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'financial': return 'bg-green-100 text-green-800'
      case 'technical': return 'bg-purple-100 text-purple-800'
      case 'custom': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const groupedFields = filteredFields.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = []
    }
    acc[field.section].push(field)
    return acc
  }, {} as Record<string, CustomField[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Custom Fields</h3>
          <p className="text-sm text-gray-600">
            Create and manage custom fields for projects, tasks, and milestones
          </p>
        </div>
        {permissions?.canCreate && (
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Field</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sections</option>
            <option value="basic">Basic Info</option>
            <option value="financial">Financial</option>
            <option value="technical">Technical</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="select">Select</option>
            <option value="multiselect">Multi-select</option>
            <option value="boolean">Boolean</option>
            <option value="file">File</option>
          </select>
        </div>
      </div>

      {/* Fields by Section */}
      {Object.keys(groupedFields).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedFields).map(([section, fields]) => (
            <div key={section} className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${getSectionColor(section)}`}>
                    {section.charAt(0).toUpperCase() + section.slice(1)} Fields
                  </span>
                  <span className="text-sm text-gray-500">({fields.length})</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      {/* Field Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getTypeIcon(field.type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{field.name}</h4>
                            <p className="text-xs text-gray-500 capitalize">{field.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {field.required && (
                            <span className="w-2 h-2 bg-red-500 rounded-full" title="Required"></span>
                          )}
                          {permissions?.canEdit && (
                            <button
                              onClick={() => onEdit(field)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {permissions?.canDelete && (
                            <button
                              onClick={() => onDelete(field.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Field Details */}
                      <div className="space-y-2 text-sm">
                        {field.options.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700">Options:</span>
                            <div className="mt-1 space-x-1">
                              {field.options.slice(0, 3).map((option, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                >
                                  {option}
                                </span>
                              ))}
                              {field.options.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{field.options.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {field.validation && (
                          <div>
                            <span className="font-medium text-gray-700">Validation:</span>
                            <p className="text-gray-600 text-xs mt-1">{field.validation}</p>
                          </div>
                        )}

                        {field.defaultValue && (
                          <div>
                            <span className="font-medium text-gray-700">Default:</span>
                            <p className="text-gray-600 text-xs mt-1">{field.defaultValue}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <TableCellsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom fields found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterSection || filterType 
              ? 'Try adjusting your filters' 
              : 'Get started by creating your first custom field'
            }
          </p>
          {permissions?.canCreate && !searchTerm && !filterSection && !filterType && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Custom Field
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomFieldsSettings;
