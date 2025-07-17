"use client"

import { useState, useEffect } from "react"
import { 
  FlagIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline"
import { Milestone } from "@/types/programs-enhanced"
import { sampleMilestones } from "@/data/enhanced-projects"

interface MilestoneTrackerProps {
  permissions: any
  selectedProject: number | null
}

interface MilestoneFormData {
  name: string
  description: string
  dueDate: string
  type: 'project_start' | 'phase_completion' | 'deliverable' | 'approval' | 'project_end'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  dependencies: string[]
  deliverables: string[]
  stakeholders: string[]
  approvalRequired: boolean
  approver: string
  notes: string
}

export function MilestoneTracker({ permissions, selectedProject }: MilestoneTrackerProps) {
  const [mounted, setMounted] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'board'>('timeline')
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCriticality, setFilterCriticality] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const [milestoneForm, setMilestoneForm] = useState<MilestoneFormData>({
    name: '',
    description: '',
    dueDate: '',
    type: 'deliverable',
    criticality: 'medium',
    dependencies: [],
    deliverables: [],
    stakeholders: [],
    approvalRequired: false,
    approver: '',
    notes: ''
  })

  useEffect(() => {
    setMounted(true)
    loadMilestones()
  }, [selectedProject])

  const loadMilestones = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setMilestones(sampleMilestones.filter(m => !selectedProject || m.projectId === selectedProject))
    } catch (error) {
      console.error('Error loading milestones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createMilestone = async (milestoneData: MilestoneFormData) => {
    setIsLoading(true)
    try {
      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}`,
        projectId: selectedProject || 1,
        name: milestoneData.name,
        description: milestoneData.description,
        dueDate: milestoneData.dueDate,
        status: 'upcoming',
        type: milestoneData.type,
        criticality: milestoneData.criticality,
        dependencies: milestoneData.dependencies,
        deliverables: milestoneData.deliverables,
        stakeholders: milestoneData.stakeholders,
        approvalRequired: milestoneData.approvalRequired,
        approver: milestoneData.approver || undefined,
        notes: milestoneData.notes
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setMilestones(prev => [...prev, newMilestone])
      setShowMilestoneModal(false)
      resetMilestoneForm()
    } catch (error) {
      console.error('Error creating milestone:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateMilestone = async (milestoneId: string, updates: Partial<Milestone>) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setMilestones(prev => prev.map(milestone => 
        milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
      ))
      setEditingMilestone(null)
      setShowMilestoneModal(false)
      resetMilestoneForm()
    } catch (error) {
      console.error('Error updating milestone:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMilestone = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId))
    } catch (error) {
      console.error('Error deleting milestone:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetMilestoneForm = () => {
    setMilestoneForm({
      name: '',
      description: '',
      dueDate: '',
      type: 'deliverable',
      criticality: 'medium',
      dependencies: [],
      deliverables: [],
      stakeholders: [],
      approvalRequired: false,
      approver: '',
      notes: ''
    })
  }

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setMilestoneForm({
      name: milestone.name,
      description: milestone.description,
      dueDate: milestone.dueDate,
      type: milestone.type,
      criticality: milestone.criticality,
      dependencies: milestone.dependencies,
      deliverables: milestone.deliverables,
      stakeholders: milestone.stakeholders,
      approvalRequired: milestone.approvalRequired,
      approver: milestone.approver || '',
      notes: milestone.notes
    })
    setShowMilestoneModal(true)
  }

  const handleMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingMilestone) {
      updateMilestone(editingMilestone.id, {
        name: milestoneForm.name,
        description: milestoneForm.description,
        dueDate: milestoneForm.dueDate,
        type: milestoneForm.type,
        criticality: milestoneForm.criticality,
        dependencies: milestoneForm.dependencies,
        deliverables: milestoneForm.deliverables,
        stakeholders: milestoneForm.stakeholders,
        approvalRequired: milestoneForm.approvalRequired,
        approver: milestoneForm.approver || undefined,
        notes: milestoneForm.notes
      })
    } else {
      createMilestone(milestoneForm)
    }
  }

  const updateMilestoneStatus = async (milestoneId: string, status: Milestone['status']) => {
    await updateMilestone(milestoneId, { 
      status,
      ...(status === 'completed' && { approvalDate: new Date().toISOString() })
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'at_risk': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'missed': return <XMarkIcon className="h-5 w-5 text-red-500" />
      default: return <ClockIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'missed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project_start': return <PlayIcon className="h-4 w-4" />
      case 'phase_completion': return <CheckCircleIcon className="h-4 w-4" />
      case 'deliverable': return <DocumentCheckIcon className="h-4 w-4" />
      case 'approval': return <UserGroupIcon className="h-4 w-4" />
      case 'project_end': return <FlagIcon className="h-4 w-4" />
      default: return <FlagIcon className="h-4 w-4" />
    }
  }

  const filteredMilestones = milestones.filter(milestone => {
    const matchesSearch = milestone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         milestone.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || milestone.status === filterStatus
    const matchesType = filterType === 'all' || milestone.type === filterType
    const matchesCriticality = filterCriticality === 'all' || milestone.criticality === filterCriticality
    return matchesSearch && matchesStatus && matchesType && matchesCriticality
  })

  const getUpcomingMilestones = () => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    return filteredMilestones.filter(m => {
      const dueDate = new Date(m.dueDate)
      return m.status === 'upcoming' && dueDate <= thirtyDaysFromNow
    })
  }

  const getOverdueMilestones = () => {
    const today = new Date()
    return filteredMilestones.filter(m => {
      const dueDate = new Date(m.dueDate)
      return (m.status === 'upcoming' || m.status === 'at_risk') && dueDate < today
    })
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

  const renderTimelineView = () => {
    const sortedMilestones = [...filteredMilestones].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )

    return (
      <div className="space-y-6">
        {sortedMilestones.map((milestone, index) => (
          <div key={milestone.id} className="relative">
            {index < sortedMilestones.length - 1 && (
              <div className="absolute left-6 top-12 h-6 w-0.5 bg-gray-300"></div>
            )}
            
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(milestone.status)} border-2`}>
                {getTypeIcon(milestone.type)}
              </div>
              
              <div className="flex-1 bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{milestone.name}</h3>
                      <div className={`w-3 h-3 rounded-full ${getCriticalityColor(milestone.criticality)}`} 
                           title={`${milestone.criticality} priority`}></div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{milestone.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>
                      </div>
                      
                      {milestone.deliverables.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <DocumentCheckIcon className="h-4 w-4" />
                          <span>{milestone.deliverables.length} deliverable(s)</span>
                        </div>
                      )}
                      
                      {milestone.stakeholders.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>{milestone.stakeholders.length} stakeholder(s)</span>
                        </div>
                      )}
                      
                      {milestone.approvalRequired && (
                        <div className="flex items-center space-x-1">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Approval Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {permissions.canEdit && milestone.status !== 'completed' && (
                      <select
                        value={milestone.status}
                        onChange={(e) => updateMilestoneStatus(milestone.id, e.target.value as Milestone['status'])}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="at_risk">At Risk</option>
                        <option value="completed">Completed</option>
                        <option value="missed">Missed</option>
                      </select>
                    )}
                    
                    {permissions.canEdit && (
                      <button
                        onClick={() => handleEditMilestone(milestone)}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded"
                        title="Edit milestone"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    
                    {permissions.canDelete && (
                      <button
                        onClick={() => deleteMilestone(milestone.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                        title="Delete milestone"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {milestone.dependencies.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-2">Dependencies:</div>
                    <div className="flex flex-wrap gap-2">
                      {milestone.dependencies.map(depId => {
                        const dep = milestones.find(m => m.id === depId)
                        return dep ? (
                          <span key={depId} className="px-2 py-1 bg-white border rounded text-xs">
                            {dep.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredMilestones.length === 0 && (
          <div className="text-center py-12">
            <FlagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones found</h3>
            <p className="text-gray-500">Create your first milestone to get started.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FlagIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Milestone Tracker</h2>
              <p className="text-gray-600">Track key project milestones and deliverables</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search milestones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="at_risk">At Risk</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="project_start">Project Start</option>
              <option value="phase_completion">Phase Completion</option>
              <option value="deliverable">Deliverable</option>
              <option value="approval">Approval</option>
              <option value="project_end">Project End</option>
            </select>

            {/* View Mode */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'timeline' | 'list' | 'board')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="timeline">Timeline</option>
              <option value="list">List</option>
              <option value="board">Board</option>
            </select>

            {permissions.canCreate && (
              <button 
                onClick={() => {
                  setEditingMilestone(null)
                  resetMilestoneForm()
                  setShowMilestoneModal(true)
                }}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Milestone
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-blue-900">{getUpcomingMilestones().length}</div>
                <div className="text-sm text-blue-600">Upcoming (30 days)</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-red-900">{getOverdueMilestones().length}</div>
                <div className="text-sm text-red-600">Overdue</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-green-900">
                  {filteredMilestones.filter(m => m.status === 'completed').length}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FlagIcon className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{filteredMilestones.length}</div>
                <div className="text-sm text-gray-600">Total Milestones</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'timeline' && renderTimelineView()}
      </div>

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMilestone ? 'Edit Milestone' : 'Create New Milestone'}
              </h3>
              <button
                onClick={() => {
                  setShowMilestoneModal(false)
                  setEditingMilestone(null)
                  resetMilestoneForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleMilestoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  value={milestoneForm.name}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={milestoneForm.dueDate}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={milestoneForm.type}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="project_start">Project Start</option>
                    <option value="phase_completion">Phase Completion</option>
                    <option value="deliverable">Deliverable</option>
                    <option value="approval">Approval</option>
                    <option value="project_end">Project End</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criticality *
                  </label>
                  <select
                    value={milestoneForm.criticality}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, criticality: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Required
                  </label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={milestoneForm.approvalRequired}
                      onChange={(e) => setMilestoneForm(prev => ({ ...prev, approvalRequired: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      This milestone requires approval
                    </label>
                  </div>
                </div>
              </div>

              {milestoneForm.approvalRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approver
                  </label>
                  <input
                    type="text"
                    value={milestoneForm.approver}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, approver: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter approver name or email"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deliverables
                </label>
                <textarea
                  value={milestoneForm.deliverables.join('\n')}
                  onChange={(e) => setMilestoneForm(prev => ({ 
                    ...prev, 
                    deliverables: e.target.value.split('\n').filter(d => d.trim()) 
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter deliverables (one per line)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stakeholders
                </label>
                <textarea
                  value={milestoneForm.stakeholders.join('\n')}
                  onChange={(e) => setMilestoneForm(prev => ({ 
                    ...prev, 
                    stakeholders: e.target.value.split('\n').filter(s => s.trim()) 
                  }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter stakeholder names (one per line)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={milestoneForm.notes}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMilestoneModal(false)
                    setEditingMilestone(null)
                    resetMilestoneForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingMilestone ? 'Update Milestone' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
