"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  PhoneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  PrinterIcon
} from "@heroicons/react/24/outline"

// Types
export interface CallRecord {
  id: string
  callerId: string
  callerName: string
  callerPhone: string
  callerEmail?: string
  callType: 'inbound' | 'outbound'
  category: 'complaint' | 'inquiry' | 'request' | 'feedback' | 'support' | 'emergency'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'new' | 'in-progress' | 'pending' | 'resolved' | 'closed' | 'escalated'
  assignedAgent: {
    id: string
    name: string
    avatar?: string
  }
  subject: string
  description: string
  notes: string[]
  attachments: string[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  estimatedResolutionTime?: string
  actualResolutionTime?: string
  satisfactionRating?: number
  followUpRequired: boolean
  caseNumber?: string
  relatedCalls: string[]
  tags: string[]
  location?: string
  department?: string
  source: 'phone' | 'email' | 'chat' | 'web' | 'social'
}

export interface CallFilters {
  search: string
  status: string[]
  category: string[]
  priority?: string[]
  assignedAgent?: string[]
  dateRange?: { start: string; end: string }
  source?: string[]
  showOverdue: boolean
  showFollowUp: boolean
}

type SortField = 'createdAt' | 'updatedAt' | 'callerName' | 'status' | 'priority' | 'assignedAgent' | 'resolutionTime' | 'responseTime'

interface SortConfig {
  field: SortField
  direction: 'asc' | 'desc'
}

// Mock data for demonstration
const mockCalls: CallRecord[] = [
  {
    id: 'call-001',
    callerId: 'caller-001',
    callerName: 'John Doe',
    callerPhone: '+234-803-123-4567',
    callerEmail: 'john.doe@email.com',
    callType: 'inbound',
    category: 'complaint',
    priority: 'high',
    status: 'in-progress',
    assignedAgent: {
      id: 'agent-001',
      name: 'Sarah Johnson',
      avatar: '👩‍💼'
    },
    subject: 'Product delivery delay',
    description: 'Customer complaining about delayed product delivery for order #12345',
    notes: ['Customer called on 2024-01-15', 'Escalated to logistics team'],
    attachments: [],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:22:00Z',
    estimatedResolutionTime: '2024-01-16T18:00:00Z',
    followUpRequired: true,
    caseNumber: 'CASE-2024-001',
    relatedCalls: [],
    tags: ['delivery', 'urgent'],
    department: 'Logistics',
    source: 'phone'
  },
  {
    id: 'call-002',
    callerId: 'caller-002',
    callerName: 'Jane Smith',
    callerPhone: '+234-805-987-6543',
    callerEmail: 'jane.smith@company.com',
    callType: 'inbound',
    category: 'inquiry',
    priority: 'medium',
    status: 'new',
    assignedAgent: {
      id: '',
      name: '',
    },
    subject: 'Product information request',
    description: 'Customer requesting information about product specifications',
    notes: [],
    attachments: [],
    createdAt: '2024-01-15T11:45:00Z',
    updatedAt: '2024-01-15T11:45:00Z',
    followUpRequired: false,
    caseNumber: 'CASE-2024-002',
    relatedCalls: [],
    tags: ['product-info'],
    department: 'Sales',
    source: 'phone'
  }
]

const CallManagement: React.FC = () => {
  // State management
  const [mounted, setMounted] = useState(false)
  const [calls, setCalls] = useState<CallRecord[]>(mockCalls)
  const [selectedCalls, setSelectedCalls] = useState<string[]>([])
  
  // Filter and sort state
  const [filters, setFilters] = useState<CallFilters>({
    search: '',
    status: [],
    category: [],
    priority: [],
    assignedAgent: [],
    source: [],
    showOverdue: false,
    showFollowUp: false
  })
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    direction: 'desc'
  })

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingCall, setEditingCall] = useState<CallRecord | null>(null)
  const [deletingCall, setDeletingCall] = useState<CallRecord | null>(null)
  
  // Bulk action state
  const [bulkAction, setBulkAction] = useState('')
  const [bulkValue, setBulkValue] = useState('')

  // Form data for create/edit
  const [formData, setFormData] = useState<CallRecord>({
    id: '',
    callerId: '',
    callerName: '',
    callerPhone: '',
    callerEmail: '',
    callType: 'inbound',
    category: 'complaint',
    priority: 'low',
    status: 'new',
    assignedAgent: { id: '', name: '', avatar: '' },
    subject: '',
    description: '',
    notes: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    followUpRequired: false,
    caseNumber: '',
    relatedCalls: [],
    tags: [],
    source: 'phone'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Event handlers
  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (call: CallRecord) => {
    setEditingCall(call)
    setFormData(call)
    setShowEditModal(true)
  }

  const openDeleteModal = (call: CallRecord) => {
    setDeletingCall(call)
    setShowDeleteModal(true)
  }

  const openBulkModal = () => {
    setShowBulkModal(true)
  }

  // CRUD operations
  const handleCreateCall = () => {
    const newCall: CallRecord = {
      id: `call-${Date.now()}`,
      callerId: `caller-${Date.now()}`,
      callerName: formData.callerName || '',
      callerPhone: formData.callerPhone || '',
      callerEmail: formData.callerEmail,
      callType: formData.callType || 'inbound',
      category: formData.category || 'inquiry',
      priority: formData.priority || 'medium',
      status: formData.status || 'new',
      assignedAgent: formData.assignedAgent || { id: '', name: '' },
      subject: formData.subject || '',
      description: formData.description || '',
      notes: formData.notes || [],
      attachments: formData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followUpRequired: formData.followUpRequired || false,
      caseNumber: `CASE-${new Date().getFullYear()}-${String(calls.length + 1).padStart(3, '0')}`,
      relatedCalls: [],
      tags: formData.tags || [],
      location: formData.location,
      department: formData.department,
      source: formData.source || 'phone'
    }

    setCalls(prev => [newCall, ...prev])
    setShowCreateModal(false)
    resetForm()
  }

  const handleEditCall = () => {
    if (!editingCall) return

    setCalls(prev => prev.map(call => 
      call.id === editingCall.id 
        ? { ...call, ...formData, updatedAt: new Date().toISOString() }
        : call
    ))
    setShowEditModal(false)
    setEditingCall(null)
    resetForm()
  }

  const handleDeleteCall = () => {
    if (!deletingCall) return

    setCalls(prev => prev.filter(call => call.id !== deletingCall.id))
    setShowDeleteModal(false)
    setDeletingCall(null)
  }

  const handleBulkAction = () => {
    switch (bulkAction) {
      case 'status':
        setCalls(prev => prev.map(call => 
          selectedCalls.includes(call.id) 
            ? { ...call, status: bulkValue as any, updatedAt: new Date().toISOString() }
            : call
        ))
        break
      case 'priority':
        setCalls(prev => prev.map(call => 
          selectedCalls.includes(call.id) 
            ? { ...call, priority: bulkValue as any, updatedAt: new Date().toISOString() }
            : call
        ))
        break
      case 'assign':
        setCalls(prev => prev.map(call => 
          selectedCalls.includes(call.id) 
            ? { ...call, assignedAgent: { id: bulkValue, name: bulkValue }, updatedAt: new Date().toISOString() }
            : call
        ))
        break
      case 'delete':
        setCalls(prev => prev.filter(call => !selectedCalls.includes(call.id)))
        break
    }
    setSelectedCalls([])
    setShowBulkModal(false)
    setBulkAction('')
    setBulkValue('')
  }

  const resetForm = () => {
    setFormData({
      id: '',
      callerId: '',
      callerName: '',
      callerPhone: '',
      callerEmail: '',
      callType: 'inbound',
      category: 'complaint',
      priority: 'low',
      status: 'new',
      assignedAgent: { id: '', name: '', avatar: '' },
      subject: '',
      description: '',
      notes: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followUpRequired: false,
      caseNumber: '',
      relatedCalls: [],
      tags: [],
      source: 'phone'
    })
  }

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'escalated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectCall = (callId: string) => {
    setSelectedCalls(prev => 
      prev.includes(callId) 
        ? prev.filter(id => id !== callId)
        : [...prev, callId]
    )
  }

  const handleSelectAll = () => {
    setSelectedCalls(prev => 
      prev.length === filteredAndSortedCalls.length 
        ? [] 
        : filteredAndSortedCalls.map(c => c.id)
    )
  }

  // Filter and sort calls
  const filteredAndSortedCalls = useMemo(() => {
    const filtered = calls.filter(call => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!call.callerName.toLowerCase().includes(searchLower) &&
            !call.subject.toLowerCase().includes(searchLower) &&
            !call.caseNumber?.toLowerCase().includes(searchLower) &&
            !call.description.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(call.status)) {
        return false
      }

      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(call.category)) {
        return false
      }

      // Priority filter
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(call.priority)) {
        return false
      }

      // Agent filter
      if (filters.assignedAgent && filters.assignedAgent.length > 0 && !filters.assignedAgent.includes(call.assignedAgent.name)) {
        return false
      }

      // Source filter
      if (filters.source && filters.source.length > 0 && !filters.source.includes(call.source)) {
        return false
      }

      // Overdue filter
      if (filters.showOverdue) {
        const estimatedTime = call.estimatedResolutionTime ? new Date(call.estimatedResolutionTime) : null
        const now = new Date()
        if (!estimatedTime || estimatedTime >= now || call.status === 'resolved' || call.status === 'closed') {
          return false
        }
      }

      // Follow-up filter
      if (filters.showFollowUp && !call.followUpRequired) {
        return false
      }

      return true
    })

    // Sort calls
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.field) {
        case 'resolutionTime':
          aValue = a.actualResolutionTime || a.estimatedResolutionTime || ''
          bValue = b.actualResolutionTime || b.estimatedResolutionTime || ''
          break
        case 'responseTime':
          aValue = new Date(a.updatedAt).getTime() - new Date(a.createdAt).getTime()
          bValue = new Date(b.updatedAt).getTime() - new Date(b.createdAt).getTime()
          break
        default:
          aValue = a[sortConfig.field as keyof CallRecord]
          bValue = b[sortConfig.field as keyof CallRecord]
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [calls, filters, sortConfig])

  // Export functions
  const exportToCSV = () => {
    const headers = ['Case Number', 'Caller Name', 'Phone', 'Subject', 'Status', 'Priority', 'Assigned Agent', 'Created', 'Updated']
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedCalls.map(call => [
        call.caseNumber || '',
        `"${call.callerName}"`,
        call.callerPhone,
        `"${call.subject}"`,
        call.status,
        call.priority,
        `"${call.assignedAgent.name || 'Unassigned'}"`,
        new Date(call.createdAt).toLocaleDateString(),
        new Date(call.updatedAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `call-records-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Call Centre Records Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
              .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
              .stat-card { border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; text-align: center; }
              .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
              .stat-label { color: #6b7280; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
              th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; }
              th { background-color: #f3f4f6; font-weight: bold; }
              .status-new { background-color: #dbeafe; color: #1e40af; }
              .status-in-progress { background-color: #fef3c7; color: #92400e; }
              .status-resolved { background-color: #d1fae5; color: #065f46; }
              .priority-urgent { color: #dc2626; font-weight: bold; }
              .priority-high { color: #ea580c; }
              .priority-medium { color: #ca8a04; }
              .priority-low { color: #16a34a; }
            </style>
          </head>
          <body>
            <h1>Call Centre Records Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Total Records: ${filteredAndSortedCalls.length}</p>
            
            <div class="summary">
              <div class="stat-card">
                <div class="stat-value">${calls.length}</div>
                <div class="stat-label">Total Calls</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${calls.filter(c => c.status === 'in-progress').length}</div>
                <div class="stat-label">In Progress</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${calls.filter(c => c.status === 'resolved').length}</div>
                <div class="stat-label">Resolved</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${calls.filter(c => c.priority === 'urgent').length}</div>
                <div class="stat-label">Urgent</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Caller</th>
                  <th>Phone</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Agent</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAndSortedCalls.map(call => `
                  <tr>
                    <td>${call.caseNumber || ''}</td>
                    <td>${call.callerName}</td>
                    <td>${call.callerPhone}</td>
                    <td>${call.subject}</td>
                    <td class="status-${call.status}">${call.status}</td>
                    <td class="priority-${call.priority}">${call.priority}</td>
                    <td>${call.assignedAgent.name || 'Unassigned'}</td>
                    <td>${formatDate(call.createdAt)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  const handlePrint = () => {
    exportToPDF()
  }

  if (!mounted) {
    return <div className="p-6">Loading call centre data...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Call Centre Management</h1>
          <p className="text-gray-600">Manage customer calls and support cases</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PrinterIcon className="h-5 w-5" />
            Print
          </button>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Call
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <PhoneIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-2xl font-semibold text-gray-900">{calls.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {calls.filter(c => c.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {calls.filter(c => c.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-semibold text-gray-900">
                {calls.filter(c => c.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search calls..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filters.status.length === 1 ? filters.status[0] : ''}
            onChange={(e) => setFilters({...filters, status: e.target.value ? [e.target.value] : []})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="escalated">Escalated</option>
          </select>
          
          <select
            value={filters.category.length === 1 ? filters.category[0] : ''}
            onChange={(e) => setFilters({...filters, category: e.target.value ? [e.target.value] : []})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="complaint">Complaint</option>
            <option value="inquiry">Inquiry</option>
            <option value="request">Request</option>
            <option value="feedback">Feedback</option>
            <option value="support">Support</option>
            <option value="emergency">Emergency</option>
          </select>
          
          <select
            value={filters.priority?.length === 1 ? filters.priority[0] : ''}
            onChange={(e) => setFilters({...filters, priority: e.target.value ? [e.target.value] : []})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {selectedCalls.length > 0 && (
            <button
              onClick={openBulkModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              Bulk Actions ({selectedCalls.length})
            </button>
          )}
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCalls.length === filteredAndSortedCalls.length && filteredAndSortedCalls.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('callerName')}
                >
                  <div className="flex items-center gap-1">
                    Case #
                    {sortConfig.field === 'callerName' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('callerName')}
                >
                  <div className="flex items-center gap-1">
                    Caller
                    {sortConfig.field === 'callerName' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortConfig.field === 'status' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center gap-1">
                    Priority
                    {sortConfig.field === 'priority' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Agent
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Created
                    {sortConfig.field === 'createdAt' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCalls.includes(call.id)}
                      onChange={() => handleSelectCall(call.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {call.caseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{call.callerName}</div>
                      <div className="text-sm text-gray-500">{call.callerPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{call.subject}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{call.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPriorityColor(call.priority)}`}>
                      {call.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {call.assignedAgent.avatar && (
                        <span className="mr-2">{call.assignedAgent.avatar}</span>
                      )}
                      <div className="text-sm text-gray-900">
                        {call.assignedAgent.name || 'Unassigned'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(call.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(call)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(call)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Call Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Call</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateCall() }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Caller Name</label>
                  <input
                    type="text"
                    value={formData.callerName}
                    onChange={(e) => setFormData({...formData, callerName: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.callerPhone}
                    onChange={(e) => setFormData({...formData, callerPhone: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.callerEmail}
                  onChange={(e) => setFormData({...formData, callerEmail: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="complaint">Complaint</option>
                    <option value="inquiry">Inquiry</option>
                    <option value="request">Request</option>
                    <option value="feedback">Feedback</option>
                    <option value="support">Support</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.followUpRequired}
                    onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Follow-up required</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Call Modal */}
      {showEditModal && editingCall && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Call</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleEditCall() }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Caller Name</label>
                  <input
                    type="text"
                    value={formData.callerName}
                    onChange={(e) => setFormData({...formData, callerName: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.callerPhone}
                    onChange={(e) => setFormData({...formData, callerPhone: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.callerEmail}
                  onChange={(e) => setFormData({...formData, callerEmail: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="escalated">Escalated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.followUpRequired}
                    onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Follow-up required</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Update Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCall && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the call from {deletingCall.callerName}? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCall}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Bulk Actions</h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select action...</option>
                  <option value="status">Update Status</option>
                  <option value="priority">Update Priority</option>
                  <option value="assign">Assign Agent</option>
                  <option value="delete">Delete Calls</option>
                </select>
              </div>
              
              {bulkAction && bulkAction !== 'delete' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <select
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select value...</option>
                    {bulkAction === 'status' && (
                      <>
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                        <option value="escalated">Escalated</option>
                      </>
                    )}
                    {bulkAction === 'priority' && (
                      <>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </>
                    )}
                    {bulkAction === 'assign' && (
                      <>
                        <option value="Sarah Johnson">Sarah Johnson</option>
                        <option value="Mike Wilson">Mike Wilson</option>
                        <option value="Emma Davis">Emma Davis</option>
                        <option value="John Smith">John Smith</option>
                      </>
                    )}
                  </select>
                </div>
              )}
              
              <p className="text-sm text-gray-600">
                This will affect {selectedCalls.length} selected call{selectedCalls.length !== 1 ? 's' : ''}.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || (bulkAction !== 'delete' && !bulkValue)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CallManagement