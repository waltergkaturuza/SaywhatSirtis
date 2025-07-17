"use client"

import { useState, useEffect } from "react"
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CubeTransparentIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface WorkBreakdownStructureProps {
  permissions: Record<string, boolean>
  selectedProject: number | null
  onProjectSelect: (projectId: number | null) => void
}

interface WBSNode {
  id: string
  projectId: number
  parentId?: string
  code: string
  name: string
  description: string
  level: number
  type: 'phase' | 'deliverable' | 'work_package' | 'activity' | 'task'
  assignee?: string
  startDate: string
  endDate: string
  estimatedHours: number
  actualHours: number
  progress: number
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  budget: number
  spent: number
  children: WBSNode[]
  dependencies: string[]
  risks: string[]
  deliverables: string[]
  isExpanded: boolean
}

export function WorkBreakdownStructure({ permissions, selectedProject, onProjectSelect }: WorkBreakdownStructureProps) {
  const [mounted, setMounted] = useState(false)
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
    // Simulate loading WBS data
    setTimeout(() => {
      setWbsNodes([
        {
          id: 'wbs-1',
          projectId: 1,
          code: '1.0',
          name: 'Community Health Initiative',
          description: 'Complete community health improvement project',
          level: 0,
          type: 'phase',
          startDate: '2025-01-15',
          endDate: '2025-09-15',
          estimatedHours: 2400,
          actualHours: 1080,
          progress: 45,
          status: 'in_progress',
          budget: 250000,
          spent: 112500,
          children: [
            {
              id: 'wbs-1-1',
              projectId: 1,
              parentId: 'wbs-1',
              code: '1.1',
              name: 'Project Planning & Design',
              description: 'Initial planning and design phase',
              level: 1,
              type: 'work_package',
              assignee: 'Sarah Johnson',
              startDate: '2025-01-15',
              endDate: '2025-03-15',
              estimatedHours: 480,
              actualHours: 480,
              progress: 100,
              status: 'completed',
              budget: 50000,
              spent: 50000,
              children: [
                {
                  id: 'wbs-1-1-1',
                  projectId: 1,
                  parentId: 'wbs-1-1',
                  code: '1.1.1',
                  name: 'Stakeholder Analysis',
                  description: 'Identify and analyze all project stakeholders',
                  level: 2,
                  type: 'activity',
                  assignee: 'Mike Chen',
                  startDate: '2025-01-15',
                  endDate: '2025-02-01',
                  estimatedHours: 120,
                  actualHours: 125,
                  progress: 100,
                  status: 'completed',
                  budget: 12000,
                  spent: 12500,
                  children: [],
                  dependencies: [],
                  risks: [],
                  deliverables: ['Stakeholder Register', 'Stakeholder Matrix'],
                  isExpanded: false
                },
                {
                  id: 'wbs-1-1-2',
                  projectId: 1,
                  parentId: 'wbs-1-1',
                  code: '1.1.2',
                  name: 'Needs Assessment',
                  description: 'Comprehensive community needs assessment',
                  level: 2,
                  type: 'activity',
                  assignee: 'Emily Rodriguez',
                  startDate: '2025-02-01',
                  endDate: '2025-02-20',
                  estimatedHours: 200,
                  actualHours: 195,
                  progress: 100,
                  status: 'completed',
                  budget: 20000,
                  spent: 19500,
                  children: [],
                  dependencies: ['wbs-1-1-1'],
                  risks: ['risk-1'],
                  deliverables: ['Needs Assessment Report', 'Community Profile'],
                  isExpanded: false
                }
              ],
              dependencies: [],
              risks: [],
              deliverables: [],
              isExpanded: true
            },
            {
              id: 'wbs-1-2',
              projectId: 1,
              parentId: 'wbs-1',
              code: '1.2',
              name: 'Implementation Phase',
              description: 'Project implementation and delivery',
              level: 1,
              type: 'work_package',
              assignee: 'David Thompson',
              startDate: '2025-03-16',
              endDate: '2025-07-31',
              estimatedHours: 1200,
              actualHours: 400,
              progress: 30,
              status: 'in_progress',
              budget: 150000,
              spent: 45000,
              children: [
                {
                  id: 'wbs-1-2-1',
                  projectId: 1,
                  parentId: 'wbs-1-2',
                  code: '1.2.1',
                  name: 'Staff Recruitment',
                  description: 'Recruit and train project staff',
                  level: 2,
                  type: 'activity',
                  assignee: 'Lisa Park',
                  startDate: '2025-03-16',
                  endDate: '2025-04-30',
                  estimatedHours: 300,
                  actualHours: 180,
                  progress: 60,
                  status: 'in_progress',
                  budget: 30000,
                  spent: 18000,
                  children: [],
                  dependencies: ['wbs-1-1'],
                  risks: ['risk-2'],
                  deliverables: ['Trained Staff', 'Training Records'],
                  isExpanded: false
                }
              ],
              dependencies: ['wbs-1-1'],
              risks: [],
              deliverables: [],
              isExpanded: true
            }
          ],
          dependencies: [],
          risks: [],
          deliverables: [],
          isExpanded: true
        }
      ])
    }, 500)
  }, [selectedProject])

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const toggleNode = (nodeId: string) => {
    const updateNodes = (nodes: WBSNode[]): WBSNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded }
        }
        if (node.children.length > 0) {
          return { ...node, children: updateNodes(node.children) }
        }
        return node
      })
    }
    setWbsNodes(updateNodes(wbsNodes))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'on_hold':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phase':
        return <CubeTransparentIcon className="h-5 w-5 text-purple-500" />
      case 'work_package':
        return <CubeTransparentIcon className="h-5 w-5 text-blue-500" />
      case 'activity':
        return <CubeTransparentIcon className="h-5 w-5 text-green-500" />
      case 'task':
        return <CubeTransparentIcon className="h-5 w-5 text-orange-500" />
      case 'deliverable':
        return <CubeTransparentIcon className="h-5 w-5 text-indigo-500" />
      default:
        return <CubeTransparentIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'phase': return 'bg-purple-100 text-purple-800'
      case 'work_package': return 'bg-blue-100 text-blue-800'
      case 'activity': return 'bg-green-100 text-green-800'
      case 'task': return 'bg-orange-100 text-orange-800'
      case 'deliverable': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const renderNode = (node: WBSNode) => {
    const hasChildren = node.children && node.children.length > 0
    const indentLevel = node.level * 24

    return (
      <div key={node.id} className={`${selectedNode === node.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
        {/* Node Row */}
        <div 
          className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
          onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
        >
          {/* Expand/Collapse + Indentation */}
          <div className="flex items-center" style={{ marginLeft: `${indentLevel}px` }}>
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNode(node.id)
                }}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {node.isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2" />
            )}

            {/* Type Icon */}
            <div className="mr-3">
              {getTypeIcon(node.type)}
            </div>

            {/* Node Code */}
            <div className="w-16 text-sm font-mono text-gray-600 mr-4">
              {node.code}
            </div>
          </div>

          {/* Node Name and Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className={`text-sm font-medium text-gray-900 truncate ${
                node.type === 'phase' ? 'font-bold text-lg' : 
                node.type === 'work_package' ? 'font-semibold' : ''
              }`}>
                {node.name}
              </h3>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(node.type)}`}>
                {node.type.replace('_', ' ')}
              </span>
              
              {node.assignee && (
                <span className="text-sm text-gray-500">
                  {node.assignee}
                </span>
              )}
            </div>
            
            {node.description && (
              <p className="text-sm text-gray-600 mt-1 truncate">
                {node.description}
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-sm text-gray-500">
                <span>Progress: {node.progress}%</span>
                <div className="ml-2 w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${node.progress}%` }}
                  />
                </div>
              </div>
              
              <span className="text-sm text-gray-500">
                {formatCurrency(node.spent)} / {formatCurrency(node.budget)}
              </span>
              
              <span className="text-sm text-gray-500">
                {node.actualHours}h / {node.estimatedHours}h
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-4 mr-4">
            {getStatusIcon(node.status)}
            <span className="text-sm text-gray-600 capitalize">
              {node.status.replace('_', ' ')}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {permissions.canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEditModal(true)
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="Edit node"
              >
                <PencilIcon className="h-4 w-4 text-gray-500" />
              </button>
            )}
            
            {permissions.canCreate && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAddModal(true)
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="Add child node"
              >
                <PlusIcon className="h-4 w-4 text-gray-500" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation()
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Duplicate node"
            >
              <DocumentDuplicateIcon className="h-4 w-4 text-gray-500" />
            </button>
            
            {permissions.canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="p-1 hover:bg-red-100 rounded"
                title="Delete node"
              >
                <TrashIcon className="h-4 w-4 text-red-500" />
              </button>
            )}
          </div>
        </div>

        {/* Detailed View (when selected) */}
        {selectedNode === node.id && (
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Start Date:</dt>
                    <dd className="text-gray-900">{new Date(node.startDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">End Date:</dt>
                    <dd className="text-gray-900">{new Date(node.endDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Duration:</dt>
                    <dd className="text-gray-900">
                      {Math.ceil((new Date(node.endDate).getTime() - new Date(node.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Deliverables</h4>
                {node.deliverables.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {node.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No deliverables defined</p>
                )}
              </div>

              {/* Dependencies & Risks */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Dependencies & Risks</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500 mb-1">Dependencies:</dt>
                    {node.dependencies.length > 0 ? (
                      <ul className="space-y-1">
                        {node.dependencies.map((dep, index) => (
                          <li key={index} className="text-gray-700">• {dep}</li>
                        ))}
                      </ul>
                    ) : (
                      <dd className="text-gray-500">None</dd>
                    )}
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">Risks:</dt>
                    {node.risks.length > 0 ? (
                      <ul className="space-y-1">
                        {node.risks.map((risk, index) => (
                          <li key={index} className="text-red-600">⚠ {risk}</li>
                        ))}
                      </ul>
                    ) : (
                      <dd className="text-gray-500">None identified</dd>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render Children */}
        {hasChildren && node.isExpanded && node.children.map(child => renderNode(child))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* WBS Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Work Breakdown Structure</h2>
            <p className="text-gray-600 mt-1">Hierarchical decomposition of project work and deliverables</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="phase">Phases</option>
              <option value="work_package">Work Packages</option>
              <option value="activity">Activities</option>
              <option value="task">Tasks</option>
              <option value="deliverable">Deliverables</option>
            </select>

            {permissions.canCreate && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add WBS Node
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WBS Tree */}
      <div className="flex-1 overflow-auto">
        {wbsNodes.length > 0 ? (
          <div>
            {wbsNodes.map(node => renderNode(node))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CubeTransparentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No WBS Structure</h3>
              <p className="text-gray-600 mb-4">Create a work breakdown structure to organize project work.</p>
              {permissions.canCreate && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create WBS
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span>Total Nodes: {wbsNodes.length}</span>
            <span>Total Budget: {formatCurrency(wbsNodes.reduce((sum, node) => sum + node.budget, 0))}</span>
            <span>Total Hours: {wbsNodes.reduce((sum, node) => sum + node.estimatedHours, 0)}h</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Not Started</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
