"use client"

import { useState, useEffect } from "react"
import {
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"

interface ResourceManagementProps {
  permissions: any
  selectedProject: number | null
  onProjectSelect: (projectId: number | null) => void
}

interface Resource {
  id: string
  name: string
  type: 'human' | 'equipment' | 'material' | 'financial'
  category: string
  availability: number // percentage
  cost: number
  unit: string
  allocatedTo: string[]
  startDate: string
  endDate: string
  status: 'available' | 'allocated' | 'overallocated' | 'unavailable'
  skills?: string[]
  location: string
  notes: string
}

interface ResourceFormData {
  name: string
  type: 'human' | 'equipment' | 'material' | 'financial'
  category: string
  cost: number
  unit: string
  location: string
  notes: string
}

export function ResourceManagement({ permissions, selectedProject, onProjectSelect }: ResourceManagementProps) {
  const [mounted, setMounted] = useState(false)
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'capacity'>('list')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [resourceForm, setResourceForm] = useState<ResourceFormData>({
    name: '',
    type: 'human',
    category: '',
    cost: 0,
    unit: 'hour',
    location: '',
    notes: ''
  })

  useEffect(() => {
    setMounted(true)
    loadResources()
  }, [selectedProject])

  const loadResources = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResources(getMockResources())
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMockResources = (): Resource[] => {
    return [
      {
        id: 'res-1',
        name: 'Dr. Sarah Johnson',
        type: 'human',
        category: 'Medical Staff',
        availability: 80,
        cost: 150,
        unit: 'hour',
        allocatedTo: ['Health Center Project', 'Training Program'],
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        status: 'allocated',
        skills: ['Medical Practice', 'Project Management', 'Training'],
        location: 'Nairobi Office',
        notes: 'Senior medical officer with 10 years experience'
      },
      {
        id: 'res-2',
        name: 'Community Health Workers',
        type: 'human',
        category: 'Field Staff',
        availability: 100,
        cost: 25,
        unit: 'hour',
        allocatedTo: ['Community Outreach'],
        startDate: '2025-02-01',
        endDate: '2025-08-31',
        status: 'available',
        skills: ['Community Engagement', 'Basic Health', 'Data Collection'],
        location: 'Field Locations',
        notes: 'Team of 8 community health workers'
      },
      {
        id: 'res-3',
        name: 'Medical Equipment Set',
        type: 'equipment',
        category: 'Medical Devices',
        availability: 90,
        cost: 5000,
        unit: 'set',
        allocatedTo: ['Health Center Project'],
        startDate: '2025-03-01',
        endDate: '2025-12-31',
        status: 'allocated',
        location: 'Health Center',
        notes: 'Complete medical equipment for primary healthcare'
      },
      {
        id: 'res-4',
        name: 'Construction Materials',
        type: 'material',
        category: 'Building Supplies',
        availability: 100,
        cost: 25000,
        unit: 'lot',
        allocatedTo: [],
        startDate: '2025-04-01',
        endDate: '2025-06-30',
        status: 'available',
        location: 'Warehouse',
        notes: 'Materials for health center construction phase'
      },
      {
        id: 'res-5',
        name: 'Training Budget',
        type: 'financial',
        category: 'Training Funds',
        availability: 75,
        cost: 15000,
        unit: 'budget',
        allocatedTo: ['Staff Training', 'Community Training'],
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        status: 'allocated',
        location: 'Central Budget',
        notes: 'Allocated for capacity building activities'
      }
    ]
  }

  const createResource = async (resourceData: ResourceFormData) => {
    setIsLoading(true)
    try {
      const newResource: Resource = {
        id: `res-${Date.now()}`,
        name: resourceData.name,
        type: resourceData.type,
        category: resourceData.category,
        availability: 100,
        cost: resourceData.cost,
        unit: resourceData.unit,
        allocatedTo: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'available',
        skills: resourceData.type === 'human' ? [] : undefined,
        location: resourceData.location,
        notes: resourceData.notes
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      setResources(prev => [...prev, newResource])
      setShowResourceModal(false)
      resetResourceForm()
    } catch (error) {
      console.error('Error creating resource:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateResource = async (resourceId: string, updates: Partial<Resource>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setResources(prev => prev.map(resource => 
        resource.id === resourceId ? { ...resource, ...updates } : resource
      ))
      setEditingResource(null)
      setShowResourceModal(false)
      resetResourceForm()
    } catch (error) {
      console.error('Error updating resource:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setResources(prev => prev.filter(resource => resource.id !== resourceId))
    } catch (error) {
      console.error('Error deleting resource:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetResourceForm = () => {
    setResourceForm({
      name: '',
      type: 'human',
      category: '',
      cost: 0,
      unit: 'hour',
      location: '',
      notes: ''
    })
  }

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource)
    setResourceForm({
      name: resource.name,
      type: resource.type,
      category: resource.category,
      cost: resource.cost,
      unit: resource.unit,
      location: resource.location,
      notes: resource.notes
    })
    setShowResourceModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'allocated': return 'bg-blue-100 text-blue-800'
      case 'overallocated': return 'bg-red-100 text-red-800'
      case 'unavailable': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'human': return UserGroupIcon
      case 'equipment': return BriefcaseIcon
      case 'material': return CurrencyDollarIcon
      case 'financial': return ChartBarIcon
      default: return BriefcaseIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'human': return 'text-blue-600'
      case 'equipment': return 'text-purple-600'
      case 'material': return 'text-orange-600'
      case 'financial': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || resource.type === filterType
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Resource Management</h2>
          <p className="text-sm text-gray-600">Manage project resources and capacity planning</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {permissions.canCreate && (
            <button
              onClick={() => {
                setEditingResource(null)
                resetResourceForm()
                setShowResourceModal(true)
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Resource
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search resources..."
          className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 max-w-xs"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Types</option>
          <option value="human">Human Resources</option>
          <option value="equipment">Equipment</option>
          <option value="material">Materials</option>
          <option value="financial">Financial</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="allocated">Allocated</option>
          <option value="overallocated">Over-allocated</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'list' | 'calendar' | 'capacity')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="list">List View</option>
          <option value="calendar">Calendar View</option>
          <option value="capacity">Capacity View</option>
        </select>
      </div>

      {/* Resource Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Human Resources</p>
              <p className="text-2xl font-semibold text-gray-900">
                {resources.filter(r => r.type === 'human').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <BriefcaseIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Equipment</p>
              <p className="text-2xl font-semibold text-gray-900">
                {resources.filter(r => r.type === 'equipment').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available</p>
              <p className="text-2xl font-semibold text-gray-900">
                {resources.filter(r => r.status === 'available').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Over-allocated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {resources.filter(r => r.status === 'overallocated').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocated To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResources.map(resource => {
                  const IconComponent = getTypeIcon(resource.type)
                  return (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <IconComponent className={`h-5 w-5 ${getTypeColor(resource.type)} mr-3`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                            <div className="text-sm text-gray-500">{resource.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm text-gray-900 capitalize">{resource.type}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(resource.status)}`}>
                            {resource.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                resource.availability >= 80 ? 'bg-green-500' :
                                resource.availability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${resource.availability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{resource.availability}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${resource.cost.toLocaleString()} / {resource.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {resource.allocatedTo.length > 0 ? (
                            <div className="space-y-1">
                              {resource.allocatedTo.slice(0, 2).map((allocation, idx) => (
                                <div key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {allocation}
                                </div>
                              ))}
                              {resource.allocatedTo.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{resource.allocatedTo.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Not allocated</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedResource(resource)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {permissions.canEdit && (
                            <button
                              onClick={() => handleEditResource(resource)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {permissions.canDelete && (
                            <button
                              onClick={() => deleteResource(resource.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : viewMode === 'capacity' ? (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity Overview</h3>
            <div className="space-y-4">
              {filteredResources.map(resource => {
                const IconComponent = getTypeIcon(resource.type)
                return (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <IconComponent className={`h-6 w-6 ${getTypeColor(resource.type)}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{resource.name}</h4>
                        <p className="text-sm text-gray-600">{resource.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{resource.availability}% Available</p>
                        <p className="text-xs text-gray-500">{resource.allocatedTo.length} allocations</p>
                      </div>
                      
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            resource.availability >= 80 ? 'bg-green-500' :
                            resource.availability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${resource.availability}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Calendar</h3>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Calendar view implementation coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Resource Details Modal - Component continues in next part due to length */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedResource.name}</h3>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Type:</dt>
                    <dd className="text-gray-900 capitalize">{selectedResource.type}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Category:</dt>
                    <dd className="text-gray-900">{selectedResource.category}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Status:</dt>
                    <dd className="text-gray-900 capitalize">{selectedResource.status}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Location:</dt>
                    <dd className="text-gray-900">{selectedResource.location}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Capacity & Cost</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Availability:</dt>
                    <dd className="text-gray-900">{selectedResource.availability}%</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Cost:</dt>
                    <dd className="text-gray-900">${selectedResource.cost.toLocaleString()} / {selectedResource.unit}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Period:</dt>
                    <dd className="text-gray-900">
                      {new Date(selectedResource.startDate).toLocaleDateString()} - {new Date(selectedResource.endDate).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {selectedResource.allocatedTo.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">Current Allocations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.allocatedTo.map((allocation, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {allocation}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedResource.skills && selectedResource.skills.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">Skills & Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedResource.notes && (
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedResource.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resource Form Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <button
                onClick={() => setShowResourceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              if (editingResource) {
                updateResource(editingResource.id, resourceForm)
              } else {
                createResource(resourceForm)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Name *
                </label>
                <input
                  type="text"
                  value={resourceForm.name}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, type: e.target.value as 'human' | 'equipment' | 'material' | 'financial' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="human">Human Resources</option>
                    <option value="equipment">Equipment</option>
                    <option value="material">Materials</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={resourceForm.category}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Medical Staff, IT Equipment"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost
                  </label>
                  <input
                    type="number"
                    value={resourceForm.cost}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={resourceForm.unit}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                    <option value="set">Set</option>
                    <option value="unit">Unit</option>
                    <option value="budget">Budget</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={resourceForm.location}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Physical or logical location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={resourceForm.notes}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes or specifications"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingResource ? 'Update Resource' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
