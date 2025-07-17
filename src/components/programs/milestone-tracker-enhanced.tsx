"use client"

import { useState, useEffect } from "react"
import {
  FlagIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline"

interface MilestoneTrackerProps {
  permissions: any
  selectedProject: number | null
  onProjectSelect: (projectId: number | null) => void
}

interface Milestone {
  id: string
  name: string
  description: string
  targetDate: string
  actualDate?: string
  status: 'upcoming' | 'due_today' | 'overdue' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'project' | 'phase' | 'deliverable' | 'approval' | 'review'
  assignee: string
  dependencies: string[]
  deliverables: string[]
  criteria: string[]
  risks: string[]
  budget: number
  actualCost: number
  progress: number
  comments: string[]
  attachments: string[]
  projectPhase: string
  stakeholders: string[]
}

interface MilestoneFormData {
  name: string
  description: string
  targetDate: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'project' | 'phase' | 'deliverable' | 'approval' | 'review'
  assignee: string
  deliverables: string[]
  criteria: string[]
  budget: number
  projectPhase: string
  stakeholders: string[]
}

export function MilestoneTracker({ permissions, selectedProject, onProjectSelect }: MilestoneTrackerProps) {
  const [mounted, setMounted] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'calendar'>('timeline')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date')

  const [milestoneForm, setMilestoneForm] = useState<MilestoneFormData>({
    name: '',
    description: '',
    targetDate: '',
    priority: 'medium',
    category: 'deliverable',
    assignee: '',
    deliverables: [''],
    criteria: [''],
    budget: 0,
    projectPhase: '',
    stakeholders: ['']
  })

  useEffect(() => {
    setMounted(true)
    loadMilestones()
  }, [selectedProject])

  const loadMilestones = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMilestones(getMockMilestones())
    } catch (error) {
      console.error('Error loading milestones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMockMilestones = (): Milestone[] => {
    return [
      {
        id: 'ms-1',
        name: 'Project Kickoff Complete',
        description: 'Complete project initiation phase including stakeholder alignment and resource allocation',
        targetDate: '2025-01-31',
        actualDate: '2025-01-30',
        status: 'completed',
        priority: 'critical',
        category: 'project',
        assignee: 'Sarah Johnson',
        dependencies: [],
        deliverables: ['Project Charter', 'Stakeholder Register', 'Resource Plan'],
        criteria: ['All stakeholders aligned', 'Budget approved', 'Team assembled'],
        risks: ['Stakeholder availability', 'Budget approval delays'],
        budget: 15000,
        actualCost: 14500,
        progress: 100,
        comments: ['Completed on time', 'All criteria met'],
        attachments: ['project_charter.pdf', 'stakeholder_register.xlsx'],
        projectPhase: 'Initiation',
        stakeholders: ['Sarah Johnson', 'Mike Chen', 'Board of Directors']
      },
      {
        id: 'ms-2',
        name: 'Community Needs Assessment Complete',
        description: 'Comprehensive assessment of community health needs and service gaps',
        targetDate: '2025-02-28',
        actualDate: '2025-02-25',
        status: 'completed',
        priority: 'high',
        category: 'deliverable',
        assignee: 'Lisa Wang',
        dependencies: ['ms-1'],
        deliverables: ['Needs Assessment Report', 'Gap Analysis', 'Recommendations'],
        criteria: ['Survey completed', 'Data analyzed', 'Report reviewed'],
        risks: ['Low community participation', 'Data quality issues'],
        budget: 25000,
        actualCost: 26500,
        progress: 100,
        comments: ['Exceeded participation targets', 'High quality data collected'],
        attachments: ['needs_assessment.pdf', 'survey_data.xlsx'],
        projectPhase: 'Planning',
        stakeholders: ['Lisa Wang', 'Community Leaders', 'Health Department']
      },
      {
        id: 'ms-3',
        name: 'Facility Design Approval',
        description: 'Architectural designs approved by all stakeholders and regulatory bodies',
        targetDate: '2025-03-31',
        actualDate: '2025-04-05',
        status: 'completed',
        priority: 'critical',
        category: 'approval',
        assignee: 'James Rodriguez',
        dependencies: ['ms-2'],
        deliverables: ['Architectural Plans', 'Engineering Drawings', 'Approval Certificates'],
        criteria: ['Plans meet requirements', 'Regulatory approval received', 'Budget within limits'],
        risks: ['Regulatory delays', 'Design changes required'],
        budget: 30000,
        actualCost: 32000,
        progress: 100,
        comments: ['Minor delays due to regulatory review', 'Final approval received'],
        attachments: ['facility_plans.pdf', 'approval_certificate.pdf'],
        projectPhase: 'Planning',
        stakeholders: ['James Rodriguez', 'Local Government', 'Architect']
      },
      {
        id: 'ms-4',
        name: 'Construction Phase Complete',
        description: 'Health facility construction completed and ready for equipment installation',
        targetDate: '2025-06-30',
        status: 'upcoming',
        priority: 'critical',
        category: 'phase',
        assignee: 'Robert Kim',
        dependencies: ['ms-3'],
        deliverables: ['Completed Facility', 'Quality Certificates', 'Handover Documentation'],
        criteria: ['Construction completed', 'Quality inspections passed', 'Safety certified'],
        risks: ['Weather delays', 'Material shortages', 'Quality issues'],
        budget: 120000,
        actualCost: 45000,
        progress: 60,
        comments: ['Construction on track', 'Weather delays minimal'],
        attachments: [],
        projectPhase: 'Execution',
        stakeholders: ['Robert Kim', 'Construction Team', 'Quality Inspector']
      },
      {
        id: 'ms-5',
        name: 'Staff Training Complete',
        description: 'All health center staff trained and certified for operations',
        targetDate: '2025-07-15',
        status: 'upcoming',
        priority: 'high',
        category: 'deliverable',
        assignee: 'Dr. Emily Foster',
        dependencies: ['ms-4'],
        deliverables: ['Training Materials', 'Certification Records', 'Training Report'],
        criteria: ['All staff trained', 'Certifications obtained', 'Competency verified'],
        risks: ['Staff availability', 'Training delays'],
        budget: 20000,
        actualCost: 0,
        progress: 0,
        comments: [],
        attachments: [],
        projectPhase: 'Execution',
        stakeholders: ['Dr. Emily Foster', 'Medical Staff', 'Training Coordinator']
      },
      {
        id: 'ms-6',
        name: 'Project Go-Live',
        description: 'Health center operational and serving the community',
        targetDate: '2025-08-01',
        status: 'upcoming',
        priority: 'critical',
        category: 'project',
        assignee: 'Sarah Johnson',
        dependencies: ['ms-4', 'ms-5'],
        deliverables: ['Operational Health Center', 'Service Launch Plan', 'Community Outreach'],
        criteria: ['Services operational', 'Community informed', 'Quality standards met'],
        risks: ['Operational readiness', 'Community adoption'],
        budget: 15000,
        actualCost: 0,
        progress: 0,
        comments: [],
        attachments: [],
        projectPhase: 'Launch',
        stakeholders: ['Sarah Johnson', 'Medical Staff', 'Community']
      }
    ]
  }

  const createMilestone = async (milestoneData: MilestoneFormData) => {
    setIsLoading(true)
    try {
      const newMilestone: Milestone = {
        id: `ms-${Date.now()}`,
        name: milestoneData.name,
        description: milestoneData.description,
        targetDate: milestoneData.targetDate,
        status: 'upcoming',
        priority: milestoneData.priority,
        category: milestoneData.category,
        assignee: milestoneData.assignee,
        dependencies: [],
        deliverables: milestoneData.deliverables.filter(d => d.trim()),
        criteria: milestoneData.criteria.filter(c => c.trim()),
        risks: [],
        budget: milestoneData.budget,
        actualCost: 0,
        progress: 0,
        comments: [],
        attachments: [],
        projectPhase: milestoneData.projectPhase,
        stakeholders: milestoneData.stakeholders.filter(s => s.trim())
      }

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
      await new Promise(resolve => setTimeout(resolve, 500))
      setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId))
    } catch (error) {
      console.error('Error deleting milestone:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markMilestoneComplete = async (milestoneId: string) => {
    await updateMilestone(milestoneId, {
      status: 'completed',
      actualDate: new Date().toISOString().split('T')[0],
      progress: 100
    })
  }

  const resetMilestoneForm = () => {
    setMilestoneForm({
      name: '',
      description: '',
      targetDate: '',
      priority: 'medium',
      category: 'deliverable',
      assignee: '',
      deliverables: [''],
      criteria: [''],
      budget: 0,
      projectPhase: '',
      stakeholders: ['']
    })
  }

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setMilestoneForm({
      name: milestone.name,
      description: milestone.description,
      targetDate: milestone.targetDate,
      priority: milestone.priority,
      category: milestone.category,
      assignee: milestone.assignee,
      deliverables: milestone.deliverables.length > 0 ? milestone.deliverables : [''],
      criteria: milestone.criteria.length > 0 ? milestone.criteria : [''],
      budget: milestone.budget,
      projectPhase: milestone.projectPhase,
      stakeholders: milestone.stakeholders.length > 0 ? milestone.stakeholders : ['']
    })
    setShowMilestoneModal(true)
  }

  const handleMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingMilestone) {
      updateMilestone(editingMilestone.id, {
        name: milestoneForm.name,
        description: milestoneForm.description,
        targetDate: milestoneForm.targetDate,
        priority: milestoneForm.priority,
        category: milestoneForm.category,
        assignee: milestoneForm.assignee,
        deliverables: milestoneForm.deliverables.filter(d => d.trim()),
        criteria: milestoneForm.criteria.filter(c => c.trim()),
        budget: milestoneForm.budget,
        projectPhase: milestoneForm.projectPhase,
        stakeholders: milestoneForm.stakeholders.filter(s => s.trim())
      })
    } else {
      createMilestone(milestoneForm)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'due_today': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project': return DocumentTextIcon
      case 'phase': return FlagIcon
      case 'deliverable': return CheckCircleIcon
      case 'approval': return ExclamationTriangleIcon
      case 'review': return EyeIcon
      default: return DocumentTextIcon
    }
  }

  const filteredMilestones = milestones.filter(milestone => {
    const matchesSearch = milestone.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || milestone.status === filterStatus
    const matchesCategory = filterCategory === 'all' || milestone.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Milestone Tracker</h2>
          <p className="text-sm text-gray-600">Track key project milestones and deliverables</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {permissions.canCreate && (
            <button
              onClick={() => {
                setEditingMilestone(null)
                resetMilestoneForm()
                setShowMilestoneModal(true)
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Milestone
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
          placeholder="Search milestones..."
          className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 max-w-xs"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="due_today">Due Today</option>
          <option value="overdue">Overdue</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Categories</option>
          <option value="project">Project</option>
          <option value="phase">Phase</option>
          <option value="deliverable">Deliverable</option>
          <option value="approval">Approval</option>
          <option value="review">Review</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'status')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="status">Sort by Status</option>
        </select>

        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'timeline' | 'grid' | 'calendar')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="timeline">Timeline View</option>
          <option value="grid">Grid View</option>
          <option value="calendar">Calendar View</option>
        </select>
      </div>

      {/* Milestone Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {milestones.filter(m => m.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <p className="text-2xl font-semibold text-gray-900">
                {milestones.filter(m => m.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {milestones.filter(m => m.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${milestones.reduce((sum, m) => sum + m.budget, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones List/Timeline */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="p-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
                {sortedMilestones.map((milestone, index) => {
                  const IconComponent = getCategoryIcon(milestone.category)
                  return (
                    <div key={milestone.id} className="relative flex items-start space-x-4">
                      {/* Timeline dot */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'overdue' ? 'bg-red-500' :
                        milestone.status === 'due_today' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>

                      {/* Milestone content */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100"
                           onClick={() => setSelectedMilestone(milestone)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{milestone.name}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(milestone.status)}`}>
                                {milestone.status.replace('_', ' ')}
                              </span>
                              <span className={`text-sm font-medium ${getPriorityColor(milestone.priority)}`}>
                                {milestone.priority.toUpperCase()}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{milestone.description}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="h-4 w-4" />
                                <span>Due: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <UserIcon className="h-4 w-4" />
                                <span>{milestone.assignee}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CurrencyDollarIcon className="h-4 w-4" />
                                <span>${milestone.budget.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            {milestone.deliverables.length > 0 && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Deliverables:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {milestone.deliverables.map((deliverable, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {deliverable}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {permissions.canEdit && (
                            <div className="flex items-center space-x-2 ml-4">
                              {milestone.status !== 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markMilestoneComplete(milestone.id)
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                  title="Mark Complete"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditMilestone(milestone)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteMilestone(milestone.id)
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                title="Delete"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMilestones.map(milestone => {
                const IconComponent = getCategoryIcon(milestone.category)
                return (
                  <div key={milestone.id} className="border rounded-lg p-6 hover:shadow-md cursor-pointer"
                       onClick={() => setSelectedMilestone(milestone)}>
                    <div className="flex items-start justify-between mb-4">
                      <IconComponent className={`h-8 w-8 ${getPriorityColor(milestone.priority)}`} />
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{milestone.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{milestone.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(milestone.targetDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{milestone.assignee}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>${milestone.budget.toLocaleString()}</span>
                      </div>
                    </div>

                    {milestone.progress > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{milestone.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${milestone.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Milestone Details Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedMilestone.name}</h3>
              <button
                onClick={() => setSelectedMilestone(null)}
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
                    <dt className="font-medium text-gray-500">Description:</dt>
                    <dd className="text-gray-900">{selectedMilestone.description}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Category:</dt>
                    <dd className="text-gray-900 capitalize">{selectedMilestone.category}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Priority:</dt>
                    <dd className="text-gray-900 capitalize">{selectedMilestone.priority}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Status:</dt>
                    <dd className="text-gray-900 capitalize">{selectedMilestone.status.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Assignee:</dt>
                    <dd className="text-gray-900">{selectedMilestone.assignee}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Project Phase:</dt>
                    <dd className="text-gray-900">{selectedMilestone.projectPhase}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Timeline & Budget</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Target Date:</dt>
                    <dd className="text-gray-900">{new Date(selectedMilestone.targetDate).toLocaleDateString()}</dd>
                  </div>
                  {selectedMilestone.actualDate && (
                    <div>
                      <dt className="font-medium text-gray-500">Actual Date:</dt>
                      <dd className="text-gray-900">{new Date(selectedMilestone.actualDate).toLocaleDateString()}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium text-gray-500">Budget:</dt>
                    <dd className="text-gray-900">${selectedMilestone.budget.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Actual Cost:</dt>
                    <dd className="text-gray-900">${selectedMilestone.actualCost.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Progress:</dt>
                    <dd className="text-gray-900">{selectedMilestone.progress}%</dd>
                  </div>
                </dl>
              </div>

              {selectedMilestone.deliverables.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Deliverables</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {selectedMilestone.deliverables.map((deliverable, index) => (
                      <li key={index}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMilestone.criteria.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Success Criteria</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {selectedMilestone.criteria.map((criterion, index) => (
                      <li key={index}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMilestone.stakeholders.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Stakeholders</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedMilestone.stakeholders.map((stakeholder, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {stakeholder}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMilestone.comments.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                  <div className="space-y-2">
                    {selectedMilestone.comments.map((comment, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                        {comment}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Milestone Form Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMilestone ? 'Edit Milestone' : 'Create New Milestone'}
              </h3>
              <button
                onClick={() => setShowMilestoneModal(false)}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    value={milestoneForm.targetDate}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <input
                    type="number"
                    value={milestoneForm.budget}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={milestoneForm.category}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, category: e.target.value as 'project' | 'phase' | 'deliverable' | 'approval' | 'review' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="project">Project</option>
                    <option value="phase">Phase</option>
                    <option value="deliverable">Deliverable</option>
                    <option value="approval">Approval</option>
                    <option value="review">Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={milestoneForm.priority}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={milestoneForm.assignee}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Phase
                </label>
                <input
                  type="text"
                  value={milestoneForm.projectPhase}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, projectPhase: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Planning, Execution, Closure"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deliverables
                </label>
                {milestoneForm.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={deliverable}
                      onChange={(e) => {
                        const newDeliverables = [...milestoneForm.deliverables]
                        newDeliverables[index] = e.target.value
                        setMilestoneForm(prev => ({ ...prev, deliverables: newDeliverables }))
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Deliverable ${index + 1}`}
                    />
                    {milestoneForm.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newDeliverables = milestoneForm.deliverables.filter((_, i) => i !== index)
                          setMilestoneForm(prev => ({ ...prev, deliverables: newDeliverables }))
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setMilestoneForm(prev => ({ ...prev, deliverables: [...prev.deliverables, ''] }))}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Deliverable
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Success Criteria
                </label>
                {milestoneForm.criteria.map((criterion, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={criterion}
                      onChange={(e) => {
                        const newCriteria = [...milestoneForm.criteria]
                        newCriteria[index] = e.target.value
                        setMilestoneForm(prev => ({ ...prev, criteria: newCriteria }))
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Criterion ${index + 1}`}
                    />
                    {milestoneForm.criteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newCriteria = milestoneForm.criteria.filter((_, i) => i !== index)
                          setMilestoneForm(prev => ({ ...prev, criteria: newCriteria }))
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setMilestoneForm(prev => ({ ...prev, criteria: [...prev.criteria, ''] }))}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Criterion
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
