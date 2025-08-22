"use client"

import { useState, useEffect } from "react"
import { 
  UsersIcon, 
  ChartBarIcon, 
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  CubeIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline"
import { Resource, ResourceAllocation } from "@/types/programs-enhanced"

// Sample resources data
const sampleResources: Resource[] = [
  {
    id: '1',
    projectId: 1,
    name: 'Project Manager',
    type: 'human',
    role: 'Lead',
    department: 'Projects',
    costPerHour: 50,
    availability: 100,
    allocation: [],
    skills: ['Leadership', 'Planning'],
    location: 'Harare',
    contact: 'pm@saywhat.org'
  },
  {
    id: '2',
    projectId: 1,
    name: 'Developer',
    type: 'human',
    role: 'Technical',
    department: 'IT',
    costPerHour: 40,
    availability: 80,
    allocation: [],
    skills: ['Programming', 'Testing'],
    location: 'Harare',
    contact: 'dev@saywhat.org'
  }
]

interface ResourceManagementProps {
  permissions: any
  selectedProject: number | null
}

interface ResourceFormData {
  name: string
  type: 'human' | 'equipment' | 'material' | 'facility' | 'software'
  role: string
  department: string
  costPerHour: number
  availability: number
  skills: string[]
  location: string
  contact: string
}

export function ResourceManagement({ permissions, selectedProject }: ResourceManagementProps) {
  const [mounted, setMounted] = useState(false)
  const [resources, setResources] = useState<Resource[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'utilization'>('grid')
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterAvailability, setFilterAvailability] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const [resourceForm, setResourceForm] = useState<ResourceFormData>({
    name: '',
    type: 'human',
    role: '',
    department: '',
    costPerHour: 0,
    availability: 100,
    skills: [],
    location: '',
    contact: ''
  })

  useEffect(() => {
    setMounted(true)
    loadResources()
  }, [selectedProject])

  const loadResources = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setResources(sampleResources.filter(r => !selectedProject || r.projectId === selectedProject))
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createResource = async (resourceData: ResourceFormData) => {
    setIsLoading(true)
    try {
      const newResource: Resource = {
        id: `resource-${Date.now()}`,
        projectId: selectedProject || 1,
        name: resourceData.name,
        type: resourceData.type,
        role: resourceData.role,
        department: resourceData.department,
        costPerHour: resourceData.costPerHour,
        availability: resourceData.availability,
        allocation: [],
        skills: resourceData.skills,
        location: resourceData.location,
        contact: resourceData.contact
      }

      // Simulate API call
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
      // Simulate API call
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
      // Simulate API call
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
      role: '',
      department: '',
      costPerHour: 0,
      availability: 100,
      skills: [],
      location: '',
      contact: ''
    })
  }

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource)
    setResourceForm({
      name: resource.name,
      type: resource.type,
      role: resource.role || '',
      department: resource.department || '',
      costPerHour: resource.costPerHour || 0,
      availability: resource.availability,
      skills: resource.skills,
      location: resource.location,
      contact: resource.contact
    })
    setShowResourceModal(true)
  }

  const handleResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingResource) {
      updateResource(editingResource.id, {
        name: resourceForm.name,
        type: resourceForm.type,
        role: resourceForm.role,
        department: resourceForm.department,
        costPerHour: resourceForm.costPerHour,
        availability: resourceForm.availability,
        skills: resourceForm.skills,
        location: resourceForm.location,
        contact: resourceForm.contact
      })
    } else {
      createResource(resourceForm)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'human': return <UsersIcon className="h-5 w-5" />
      case 'equipment': return <WrenchScrewdriverIcon className="h-5 w-5" />
      case 'material': return <CubeIcon className="h-5 w-5" />
      case 'facility': return <BuildingOfficeIcon className="h-5 w-5" />
      case 'software': return <ComputerDesktopIcon className="h-5 w-5" />
      default: return <UsersIcon className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'human': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'equipment': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'material': return 'bg-green-100 text-green-800 border-green-200'
      case 'facility': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'software': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return 'text-green-600'
    if (availability >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUtilizationPercentage = (resource: Resource) => {
    if (resource.allocation.length === 0) return 0
    const totalAllocated = resource.allocation.reduce((sum, alloc) => sum + alloc.allocatedPercentage, 0)
    return Math.min(totalAllocated, 100)
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.department?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || resource.type === filterType
    const matchesAvailability = filterAvailability === 'all' || 
                               (filterAvailability === 'high' && resource.availability >= 80) ||
                               (filterAvailability === 'medium' && resource.availability >= 50 && resource.availability < 80) ||
                               (filterAvailability === 'low' && resource.availability < 50)
    return matchesSearch && matchesType && matchesAvailability
  })

  const getResourceStats = () => {
    const totalResources = filteredResources.length
    const humanResources = filteredResources.filter(r => r.type === 'human').length
    const averageUtilization = filteredResources.reduce((sum, r) => sum + getUtilizationPercentage(r), 0) / totalResources || 0
    const highUtilization = filteredResources.filter(r => getUtilizationPercentage(r) >= 80).length
    
    return {
      totalResources,
      humanResources,
      averageUtilization: Math.round(averageUtilization),
      highUtilization
    }
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

  const stats = getResourceStats()

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredResources.map(resource => (
        <div key={resource.id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getTypeColor(resource.type)} border`}>
                  {getTypeIcon(resource.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                  <p className="text-sm text-gray-500">{resource.role}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {permissions.canEdit && (
                  <button
                    onClick={() => handleEditResource(resource)}
                    className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                    title="Edit resource"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {permissions.canDelete && (
                  <button
                    onClick={() => deleteResource(resource.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete resource"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Availability</span>
                <span className={`font-medium ${getAvailabilityColor(resource.availability)}`}>
                  {resource.availability}%
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Utilization</span>
                <span className="font-medium text-gray-900">
                  {getUtilizationPercentage(resource)}%
                </span>
              </div>

              {resource.costPerHour && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Cost/Hour</span>
                  <span className="font-medium text-gray-900">${resource.costPerHour}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span className="truncate">{resource.location}</span>
              </div>

              {resource.department && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Department:</span> {resource.department}
                </div>
              )}

              {resource.skills.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {resource.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {resource.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{resource.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost/Hour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResources.map(resource => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getTypeColor(resource.type)} border mr-3`}>
                      {getTypeIcon(resource.type)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                      <div className="text-sm text-gray-500">{resource.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {resource.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getAvailabilityColor(resource.availability)}`}>
                    {resource.availability}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${getUtilizationPercentage(resource)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">{getUtilizationPercentage(resource)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {resource.costPerHour ? `$${resource.costPerHour}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resource.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {permissions.canEdit && (
                      <button
                        onClick={() => handleEditResource(resource)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    )}
                    {permissions.canDelete && (
                      <button
                        onClick={() => deleteResource(resource.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Resource Management</h2>
              <p className="text-gray-600">Manage project resources and allocations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Types</option>
              <option value="human">Human</option>
              <option value="equipment">Equipment</option>
              <option value="material">Material</option>
              <option value="facility">Facility</option>
              <option value="software">Software</option>
            </select>

            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Availability</option>
              <option value="high">High (80%+)</option>
              <option value="medium">Medium (50-79%)</option>
              <option value="low">Low (&lt;50%)</option>
            </select>

            {/* View Mode */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'grid' | 'list' | 'utilization')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
              <option value="utilization">Utilization View</option>
            </select>

            {permissions.canCreate && (
              <button 
                onClick={() => {
                  setEditingResource(null)
                  resetResourceForm()
                  setShowResourceModal(true)
                }}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Resource
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-blue-900">{stats.totalResources}</div>
                <div className="text-sm text-blue-600">Total Resources</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-green-900">{stats.humanResources}</div>
                <div className="text-sm text-green-600">Human Resources</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-yellow-900">{stats.averageUtilization}%</div>
                <div className="text-sm text-yellow-600">Avg Utilization</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-red-900">{stats.highUtilization}</div>
                <div className="text-sm text-red-600">High Utilization</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'list' && renderListView()}
        
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500">Create your first resource to get started.</p>
          </div>
        )}
      </div>

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingResource ? 'Edit Resource' : 'Create New Resource'}
              </h3>
              <button
                onClick={() => {
                  setShowResourceModal(false)
                  setEditingResource(null)
                  resetResourceForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Name *
                </label>
                <input
                  type="text"
                  value={resourceForm.name}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Type *
                  </label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="human">Human</option>
                    <option value="equipment">Equipment</option>
                    <option value="material">Material</option>
                    <option value="facility">Facility</option>
                    <option value="software">Software</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role/Function
                  </label>
                  <input
                    type="text"
                    value={resourceForm.role}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={resourceForm.department}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Hour ($)
                  </label>
                  <input
                    type="number"
                    value={resourceForm.costPerHour}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, costPerHour: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={resourceForm.availability}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, availability: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{resourceForm.availability}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={resourceForm.location}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Information
                </label>
                <input
                  type="text"
                  value={resourceForm.contact}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Email, phone, or other contact details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills/Capabilities
                </label>
                <textarea
                  value={resourceForm.skills.join('\n')}
                  onChange={(e) => setResourceForm(prev => ({ 
                    ...prev, 
                    skills: e.target.value.split('\n').filter(s => s.trim()) 
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter skills/capabilities (one per line)"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResourceModal(false)
                    setEditingResource(null)
                    resetResourceForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingResource ? 'Update Resource' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
