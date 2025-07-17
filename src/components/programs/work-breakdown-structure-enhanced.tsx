"use client"

import { useState, useEffect } from "react"
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  FlagIcon,
  XMarkIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

interface WBSProps {
  permissions: Record<string, boolean>
  selectedProject: number | null
  onProjectSelect: (projectId: number | null) => void
}

interface WBSNode {
  id: string
  name: string
  description: string
  level: number
  parentId?: string
  children: string[]
  type: 'project' | 'phase' | 'work_package' | 'task'
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold'
  assignee: string
  estimatedHours: number
  actualHours: number
  estimatedCost: number
  actualCost: number
  startDate: string
  endDate: string
  progress: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  deliverables: string[]
  dependencies: string[]
  risks: string[]
  isExpanded: boolean
}

interface NodeFormData {
  name: string
  description: string
  type: 'phase' | 'work_package' | 'task'
  assignee: string
  estimatedHours: number
  estimatedCost: number
  startDate: string
  endDate: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  deliverables: string[]
  dependencies: string[]
}

export function WorkBreakdownStructure({ permissions, selectedProject, onProjectSelect }: WBSProps) {
  const [mounted, setMounted] = useState(false)
  const [nodes, setNodes] = useState<Record<string, WBSNode>>({})
  const [rootNodes, setRootNodes] = useState<string[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showNodeModal, setShowNodeModal] = useState(false)
  const [editingNode, setEditingNode] = useState<WBSNode | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [nodeForm, setNodeForm] = useState<NodeFormData>({
    name: '',
    description: '',
    type: 'task',
    assignee: '',
    estimatedHours: 0,
    estimatedCost: 0,
    startDate: '',
    endDate: '',
    priority: 'medium',
    deliverables: [''],
    dependencies: []
  })

  useEffect(() => {
    setMounted(true)
    loadWBSData()
  }, [selectedProject])

  const loadWBSData = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockData = getMockWBSData()
      setNodes(mockData.nodes)
      setRootNodes(mockData.rootNodes)
      setExpandedNodes(new Set(['wbs-1', 'wbs-2']))
    } catch (error) {
      console.error('Error loading WBS data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMockWBSData = () => {
    const nodes: Record<string, WBSNode> = {
      'wbs-1': {
        id: 'wbs-1',
        name: 'Community Health Initiative',
        description: 'Main project to improve healthcare access in rural communities',
        level: 0,
        children: ['wbs-1-1', 'wbs-1-2', 'wbs-1-3'],
        type: 'project',
        status: 'in_progress',
        assignee: 'Sarah Johnson',
        estimatedHours: 2000,
        actualHours: 900,
        estimatedCost: 150000,
        actualCost: 68000,
        startDate: '2025-01-15',
        endDate: '2025-09-15',
        progress: 45,
        priority: 'high',
        deliverables: ['Project Plan', 'Health Center Setup', 'Training Program', 'Final Report'],
        dependencies: [],
        risks: ['Weather delays', 'Staff shortage', 'Budget constraints'],
        isExpanded: true
      },
      'wbs-1-1': {
        id: 'wbs-1-1',
        name: 'Project Planning & Design',
        description: 'Initial planning, stakeholder analysis, and project design phase',
        level: 1,
        parentId: 'wbs-1',
        children: ['wbs-1-1-1', 'wbs-1-1-2', 'wbs-1-1-3'],
        type: 'phase',
        status: 'completed',
        assignee: 'Mike Chen',
        estimatedHours: 400,
        actualHours: 380,
        estimatedCost: 25000,
        actualCost: 23500,
        startDate: '2025-01-15',
        endDate: '2025-03-15',
        progress: 100,
        priority: 'high',
        deliverables: ['Stakeholder Analysis', 'Needs Assessment', 'Project Design Document'],
        dependencies: [],
        risks: ['Stakeholder availability'],
        isExpanded: true
      },
      'wbs-1-1-1': {
        id: 'wbs-1-1-1',
        name: 'Stakeholder Analysis',
        description: 'Identify and analyze key project stakeholders',
        level: 2,
        parentId: 'wbs-1-1',
        children: [],
        type: 'task',
        status: 'completed',
        assignee: 'Mike Chen',
        estimatedHours: 80,
        actualHours: 75,
        estimatedCost: 5000,
        actualCost: 4700,
        startDate: '2025-01-15',
        endDate: '2025-02-01',
        progress: 100,
        priority: 'high',
        deliverables: ['Stakeholder Matrix', 'Engagement Plan'],
        dependencies: [],
        risks: [],
        isExpanded: false
      },
      'wbs-1-1-2': {
        id: 'wbs-1-1-2',
        name: 'Community Needs Assessment',
        description: 'Assess community health needs and service gaps',
        level: 2,
        parentId: 'wbs-1-1',
        children: [],
        type: 'task',
        status: 'completed',
        assignee: 'Lisa Wang',
        estimatedHours: 120,
        actualHours: 130,
        estimatedCost: 8000,
        actualCost: 8500,
        startDate: '2025-02-01',
        endDate: '2025-02-20',
        progress: 100,
        priority: 'high',
        deliverables: ['Needs Assessment Report', 'Gap Analysis'],
        dependencies: ['wbs-1-1-1'],
        risks: ['Community participation'],
        isExpanded: false
      },
      'wbs-1-1-3': {
        id: 'wbs-1-1-3',
        name: 'Project Design & Planning',
        description: 'Create detailed project design and implementation plan',
        level: 2,
        parentId: 'wbs-1-1',
        children: [],
        type: 'task',
        status: 'completed',
        assignee: 'James Rodriguez',
        estimatedHours: 200,
        actualHours: 175,
        estimatedCost: 12000,
        actualCost: 10300,
        startDate: '2025-02-20',
        endDate: '2025-03-15',
        progress: 100,
        priority: 'medium',
        deliverables: ['Project Design Document', 'Implementation Plan', 'Risk Management Plan'],
        dependencies: ['wbs-1-1-2'],
        risks: ['Technical complexity'],
        isExpanded: false
      },
      'wbs-1-2': {
        id: 'wbs-1-2',
        name: 'Implementation Phase',
        description: 'Core implementation activities including facility setup and staff training',
        level: 1,
        parentId: 'wbs-1',
        children: ['wbs-1-2-1', 'wbs-1-2-2', 'wbs-1-2-3'],
        type: 'phase',
        status: 'in_progress',
        assignee: 'David Thompson',
        estimatedHours: 1200,
        actualHours: 450,
        estimatedCost: 100000,
        actualCost: 38000,
        startDate: '2025-03-16',
        endDate: '2025-07-31',
        progress: 35,
        priority: 'high',
        deliverables: ['Health Center', 'Trained Staff', 'Equipment Installation'],
        dependencies: ['wbs-1-1'],
        risks: ['Equipment delays', 'Staff recruitment challenges'],
        isExpanded: true
      },
      'wbs-1-2-1': {
        id: 'wbs-1-2-1',
        name: 'Facility Construction & Setup',
        description: 'Build and setup health center facility',
        level: 2,
        parentId: 'wbs-1-2',
        children: [],
        type: 'work_package',
        status: 'in_progress',
        assignee: 'Robert Kim',
        estimatedHours: 600,
        actualHours: 220,
        estimatedCost: 60000,
        actualCost: 22000,
        startDate: '2025-03-16',
        endDate: '2025-06-15',
        progress: 40,
        priority: 'critical',
        deliverables: ['Completed Facility', 'Utility Connections', 'Safety Certifications'],
        dependencies: ['wbs-1-1-3'],
        risks: ['Weather delays', 'Material shortages'],
        isExpanded: false
      }
    }

    return {
      nodes,
      rootNodes: ['wbs-1']
    }
  }

  const createNode = async (parentId: string | null, nodeData: NodeFormData) => {
    setIsLoading(true)
    try {
      const newNode: WBSNode = {
        id: `wbs-${Date.now()}`,
        name: nodeData.name,
        description: nodeData.description,
        level: parentId ? (nodes[parentId]?.level || 0) + 1 : 0,
        parentId: parentId || undefined,
        children: [],
        type: nodeData.type,
        status: 'not_started',
        assignee: nodeData.assignee,
        estimatedHours: nodeData.estimatedHours,
        actualHours: 0,
        estimatedCost: nodeData.estimatedCost,
        actualCost: 0,
        startDate: nodeData.startDate,
        endDate: nodeData.endDate,
        progress: 0,
        priority: nodeData.priority,
        deliverables: nodeData.deliverables.filter(d => d.trim()),
        dependencies: nodeData.dependencies,
        risks: [],
        isExpanded: false
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      
      setNodes(prev => ({
        ...prev,
        [newNode.id]: newNode
      }))

      if (parentId) {
        setNodes(prev => ({
          ...prev,
          [parentId]: {
            ...prev[parentId],
            children: [...prev[parentId].children, newNode.id]
          }
        }))
      } else {
        setRootNodes(prev => [...prev, newNode.id])
      }

      setShowNodeModal(false)
      resetNodeForm()
    } catch (error) {
      console.error('Error creating node:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateNode = async (nodeId: string, updates: Partial<WBSNode>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setNodes(prev => ({
        ...prev,
        [nodeId]: { ...prev[nodeId], ...updates }
      }))
      setEditingNode(null)
      setShowNodeModal(false)
      resetNodeForm()
    } catch (error) {
      console.error('Error updating node:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNode = async (nodeId: string) => {
    if (!confirm('Are you sure you want to delete this node and all its children?')) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const nodeToDelete = nodes[nodeId]
      if (!nodeToDelete) return

      // Remove from parent's children
      if (nodeToDelete.parentId) {
        setNodes(prev => ({
          ...prev,
          [nodeToDelete.parentId!]: {
            ...prev[nodeToDelete.parentId!],
            children: prev[nodeToDelete.parentId!].children.filter(id => id !== nodeId)
          }
        }))
      } else {
        setRootNodes(prev => prev.filter(id => id !== nodeId))
      }

      // Remove node and all children recursively
      const nodesToDelete = [nodeId]
      const collectChildren = (id: string) => {
        const node = nodes[id]
        if (node?.children) {
          node.children.forEach(childId => {
            nodesToDelete.push(childId)
            collectChildren(childId)
          })
        }
      }
      collectChildren(nodeId)

      setNodes(prev => {
        const newNodes = { ...prev }
        nodesToDelete.forEach(id => delete newNodes[id])
        return newNodes
      })
    } catch (error) {
      console.error('Error deleting node:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetNodeForm = () => {
    setNodeForm({
      name: '',
      description: '',
      type: 'task',
      assignee: '',
      estimatedHours: 0,
      estimatedCost: 0,
      startDate: '',
      endDate: '',
      priority: 'medium',
      deliverables: [''],
      dependencies: []
    })
  }

  const handleEditNode = (node: WBSNode) => {
    setEditingNode(node)
    setNodeForm({
      name: node.name,
      description: node.description,
      type: node.type as 'phase' | 'work_package' | 'task',
      assignee: node.assignee,
      estimatedHours: node.estimatedHours,
      estimatedCost: node.estimatedCost,
      startDate: node.startDate,
      endDate: node.endDate,
      priority: node.priority,
      deliverables: node.deliverables.length > 0 ? node.deliverables : [''],
      dependencies: node.dependencies
    })
    setShowNodeModal(true)
  }

  const handleNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingNode) {
      updateNode(editingNode.id, {
        name: nodeForm.name,
        description: nodeForm.description,
        type: nodeForm.type,
        assignee: nodeForm.assignee,
        estimatedHours: nodeForm.estimatedHours,
        estimatedCost: nodeForm.estimatedCost,
        startDate: nodeForm.startDate,
        endDate: nodeForm.endDate,
        priority: nodeForm.priority,
        deliverables: nodeForm.deliverables.filter(d => d.trim()),
        dependencies: nodeForm.dependencies
      })
    } else {
      createNode(selectedNode, nodeForm)
    }
  }

  const toggleNodeExpansion = (nodeId: string) => {
    setNodes(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        isExpanded: !prev[nodeId].isExpanded
      }
    }))
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'project': return DocumentTextIcon
      case 'phase': return FlagIcon
      case 'work_package': return ClockIcon
      case 'task': return CheckCircleIcon
      default: return DocumentTextIcon
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'on_hold': return 'text-yellow-600 bg-yellow-100'
      case 'not_started': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderNode = (nodeId: string): React.ReactNode => {
    const node = nodes[nodeId]
    if (!node) return null

    const IconComponent = getNodeIcon(node.type)
    const hasChildren = node.children.length > 0

    return (
      <div key={nodeId} className="w-full">
        <div
          className={`flex items-center p-3 border-l-4 ${
            selectedNode === nodeId ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'
          } hover:bg-gray-50 cursor-pointer`}
          style={{ marginLeft: `${node.level * 24}px` }}
          onClick={() => setSelectedNode(selectedNode === nodeId ? null : nodeId)}
        >
          <div className="flex items-center flex-1 space-x-3">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNodeExpansion(nodeId)
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {node.isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}
            
            <IconComponent className="h-5 w-5 text-gray-500 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">{node.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(node.status)}`}>
                  {node.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{node.description}</p>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <UserIcon className="h-3 w-3" />
                <span>{node.assignee}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                <span>{node.actualHours}/{node.estimatedHours}h</span>
              </div>
              <div className="flex items-center space-x-1">
                <CurrencyDollarIcon className="h-3 w-3" />
                <span>${node.actualCost.toLocaleString()}</span>
              </div>
            </div>

            {permissions.canEdit && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode(nodeId)
                    setEditingNode(null)
                    resetNodeForm()
                    setShowNodeModal(true)
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Add Child"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditNode(node)
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNode(nodeId)
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {node.isExpanded && node.children.map(childId => renderNode(childId))}
      </div>
    )
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Work Breakdown Structure</h2>
          <p className="text-sm text-gray-600">Hierarchical decomposition of project work</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {permissions.canCreate && (
            <button
              onClick={() => {
                setSelectedNode(null)
                setEditingNode(null)
                resetNodeForm()
                setShowNodeModal(true)
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Root Node
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search nodes..."
          className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 max-w-xs"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Types</option>
          <option value="project">Projects</option>
          <option value="phase">Phases</option>
          <option value="work_package">Work Packages</option>
          <option value="task">Tasks</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {/* WBS Tree */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y">
            {rootNodes.map(nodeId => renderNode(nodeId))}
          </div>
        )}
      </div>

      {/* Node Details Panel */}
      {selectedNode && nodes[selectedNode] && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Node Details</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Name:</dt>
                  <dd className="text-gray-900">{nodes[selectedNode].name}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Type:</dt>
                  <dd className="text-gray-900 capitalize">{nodes[selectedNode].type.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Status:</dt>
                  <dd className="text-gray-900 capitalize">{nodes[selectedNode].status.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Assignee:</dt>
                  <dd className="text-gray-900">{nodes[selectedNode].assignee}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Priority:</dt>
                  <dd className="text-gray-900 capitalize">{nodes[selectedNode].priority}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Progress & Resources</h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Progress:</dt>
                  <dd className="text-gray-900">{nodes[selectedNode].progress}%</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Hours:</dt>
                  <dd className="text-gray-900">{nodes[selectedNode].actualHours} / {nodes[selectedNode].estimatedHours}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Cost:</dt>
                  <dd className="text-gray-900">${nodes[selectedNode].actualCost.toLocaleString()} / ${nodes[selectedNode].estimatedCost.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Duration:</dt>
                  <dd className="text-gray-900">{nodes[selectedNode].startDate} - {nodes[selectedNode].endDate}</dd>
                </div>
              </dl>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{nodes[selectedNode].description}</p>
            </div>

            {nodes[selectedNode].deliverables.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Deliverables</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {nodes[selectedNode].deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}

            {nodes[selectedNode].dependencies.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {nodes[selectedNode].dependencies.map((dep, index) => (
                    <li key={index}>{dep}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Node Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNode ? 'Edit Node' : selectedNode ? 'Add Child Node' : 'Add Root Node'}
              </h3>
              <button
                onClick={() => setShowNodeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleNodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={nodeForm.name}
                  onChange={(e) => setNodeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={nodeForm.description}
                  onChange={(e) => setNodeForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={nodeForm.type}
                    onChange={(e) => setNodeForm(prev => ({ ...prev, type: e.target.value as 'phase' | 'work_package' | 'task' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="phase">Phase</option>
                    <option value="work_package">Work Package</option>
                    <option value="task">Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={nodeForm.priority}
                    onChange={(e) => setNodeForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={nodeForm.startDate}
                    onChange={(e) => setNodeForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={nodeForm.endDate}
                    onChange={(e) => setNodeForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={nodeForm.assignee}
                    onChange={(e) => setNodeForm(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={nodeForm.estimatedHours}
                    onChange={(e) => setNodeForm(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost
                  </label>
                  <input
                    type="number"
                    value={nodeForm.estimatedCost}
                    onChange={(e) => setNodeForm(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deliverables
                </label>
                {nodeForm.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={deliverable}
                      onChange={(e) => {
                        const newDeliverables = [...nodeForm.deliverables]
                        newDeliverables[index] = e.target.value
                        setNodeForm(prev => ({ ...prev, deliverables: newDeliverables }))
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Deliverable ${index + 1}`}
                    />
                    {nodeForm.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newDeliverables = nodeForm.deliverables.filter((_, i) => i !== index)
                          setNodeForm(prev => ({ ...prev, deliverables: newDeliverables }))
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
                  onClick={() => setNodeForm(prev => ({ ...prev, deliverables: [...prev.deliverables, ''] }))}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Deliverable
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNodeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingNode ? 'Update Node' : 'Create Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
