"use client"

import React, { useState, useEffect } from 'react'
import {
  ShieldCheckIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Asset, InventoryAudit, AuditFinding, InventoryPermissions } from '@/types/inventory'
import { Button } from '@/components/ui/button'

interface AuditManagementProps {
  assets: Asset[]
  permissions: InventoryPermissions
}

export const AuditManagement: React.FC<AuditManagementProps> = ({
  assets,
  permissions
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'schedule' | 'audits' | 'findings' | 'compliance'>('overview')
  const [audits, setAudits] = useState<InventoryAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<InventoryAudit | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Load audits from API
  useEffect(() => {
    const loadAudits = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/inventory/audits')
        if (response.ok) {
          const data = await response.json()
          setAudits(data.audits || [])
        } else {
          console.log('Audits API not available')
          setAudits([])
        }
      } catch (error) {
        console.log('Failed to load audits:', error)
        setAudits([])
      } finally {
        setLoading(false)
      }
    }

    loadAudits()
  }, [])

  const filteredAudits = audits.filter(audit => {
    if (!audit || !audit.title || !audit.auditor) return false
    
    const matchesSearch = audit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         audit.auditor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter
    const matchesType = typeFilter === 'all' || audit.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'planned':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFindingTypeIcon = (type: string) => {
    switch (type) {
      case 'missing':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'damaged':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'mislocated':
        return <ClockIcon className="h-5 w-5" />
      case 'discrepancy':
        return <DocumentTextIcon className="h-5 w-5" />
      default:
        return <ClipboardDocumentListIcon className="h-5 w-5" />
    }
  }

  const allFindings = audits.flatMap(audit => 
    (audit.findings && Array.isArray(audit.findings) ? audit.findings : []).map(finding => ({
      ...finding,
      auditTitle: audit.title,
      auditDate: audit.auditDate
    }))
  )

  const openFindings = allFindings.filter(f => f.status !== 'resolved' && f.status !== 'closed')
  const criticalFindings = allFindings.filter(f => f.severity === 'critical' || f.severity === 'high')

  if (!permissions.canAudit) {
    return (
      <div className="p-6 text-center">
        <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have permission to access audit management.
        </p>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Audit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Audits</p>
              <p className="text-2xl font-bold">{audits.length}</p>
              <p className="text-blue-100 text-xs mt-1">
                {audits.filter(a => a.status === 'completed').length} completed
              </p>
            </div>
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Open Findings</p>
              <p className="text-2xl font-bold">{openFindings.length}</p>
              <p className="text-orange-100 text-xs mt-1">
                {criticalFindings.length} critical/high
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Compliance Score</p>
              <p className="text-2xl font-bold">
                {Math.round(((allFindings.length - openFindings.length) / Math.max(allFindings.length, 1)) * 100)}%
              </p>
              <p className="text-green-100 text-xs mt-1">
                {allFindings.length - openFindings.length} resolved
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Next Audit</p>
              <p className="text-2xl font-bold">
                {audits.filter(a => a.status === 'planned').length}
              </p>
              <p className="text-purple-100 text-xs mt-1">
                scheduled
              </p>
            </div>
            <CalendarDaysIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Recent Audits */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Audits</h3>
        <div className="space-y-4">
          {audits.slice(0, 3).map(audit => (
            <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">{audit.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(audit.auditDate).toLocaleDateString()} • {audit.auditor}
                  </p>
                  <p className="text-xs text-gray-400">{audit.scope && Array.isArray(audit.scope) ? audit.scope.join(', ') : 'No scope defined'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(audit.status || 'unknown')}`}>
                  {audit.status ? audit.status.replace('-', ' ') : 'Unknown'}
                </span>
                <span className="text-sm text-gray-500">
                  {audit.findings && Array.isArray(audit.findings) ? audit.findings.length : 0} findings
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Findings */}
      {criticalFindings.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Findings Requiring Action</h3>
          <div className="space-y-3">
            {criticalFindings.slice(0, 3).map(finding => (
              <div key={finding.id} className={`p-4 rounded border ${getSeverityColor(finding.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getFindingTypeIcon(finding.type)}
                    <div>
                      <h4 className="font-medium">{finding.description}</h4>
                      <p className="text-sm opacity-75 mt-1">{finding.recommendedAction}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <span>Asset: {assets.find(a => a.id === finding.assetId)?.name}</span>
                        {finding.assignedTo && <span>Assigned: {finding.assignedTo}</span>}
                        {finding.dueDate && <span>Due: {new Date(finding.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    finding.status === 'open' ? 'bg-red-100 text-red-800' :
                    finding.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {finding.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderScheduleAudit = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Audit</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audit Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter audit title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audit Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="physical">Physical Audit</option>
              <option value="financial">Financial Audit</option>
              <option value="compliance">Compliance Review</option>
              <option value="full">Full Audit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Auditor
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Auditor name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select location</option>
              <option value="Head Office">Head Office</option>
              <option value="Branch Office A">Branch Office A</option>
              <option value="Branch Office B">Branch Office B</option>
              <option value="Warehouse">Warehouse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audit Scope
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['IT Equipment', 'Office Equipment', 'Vehicles', 'Machinery', 'Furniture', 'Security Equipment'].map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or instructions"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setActiveView('overview')}>
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            Schedule Audit
          </Button>
        </div>
      </div>
    </div>
  )

  const renderAuditList = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search audits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="physical">Physical</option>
            <option value="financial">Financial</option>
            <option value="compliance">Compliance</option>
            <option value="full">Full Audit</option>
          </select>
        </div>
      </div>

      {/* Audit List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auditor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAudits.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Audits Found</h3>
                    <p className="text-gray-500">
                      {audits.length === 0 
                        ? "No audits have been created yet. Create your first audit to get started."
                        : "No audits match your current filters. Try adjusting your search criteria."
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAudits.map((audit) => (
              <tr key={audit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{audit.title}</div>
                    <div className="text-sm text-gray-500">{audit.scope && Array.isArray(audit.scope) ? audit.scope.join(', ') : 'No scope defined'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {audit.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(audit.auditDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {audit.auditor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(audit.status || 'unknown')}`}>
                    {audit.status ? audit.status.replace('-', ' ') : 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{audit.findings && Array.isArray(audit.findings) ? audit.findings.length : 0} total</div>
                  <div className="text-sm text-red-600">
                    {audit.findings && Array.isArray(audit.findings) ? audit.findings.filter(f => f.status !== 'resolved' && f.status !== 'closed').length : 0} open
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedAudit(audit)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Audit"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Edit Audit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderAllFindings = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Audit Findings</h3>
        
        <div className="space-y-4">
          {allFindings.map(finding => (
            <div key={finding.id} className={`p-4 rounded border ${getSeverityColor(finding.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getFindingTypeIcon(finding.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{finding.description}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        finding.status === 'open' ? 'bg-red-100 text-red-800' :
                        finding.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {finding.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm opacity-75 mb-2">{finding.recommendedAction}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <span><strong>Asset:</strong> {assets.find(a => a.id === finding.assetId)?.name}</span>
                      <span><strong>Audit:</strong> {finding.auditTitle}</span>
                      {finding.assignedTo && <span><strong>Assigned:</strong> {finding.assignedTo}</span>}
                      {finding.dueDate && <span><strong>Due:</strong> {new Date(finding.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded">
                    Update Status
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-200 rounded">
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderComplianceOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Compliance by Category</h4>
          <div className="space-y-3">
            {['IT Equipment', 'Vehicles', 'Security Equipment'].map(category => {
              const categoryAssets = assets.filter(a => a.category.name === category)
              const complianceRate = Math.floor(Math.random() * 30) + 70 // Mock data
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{category}</span>
                    <span className="font-medium">{complianceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        complianceRate >= 90 ? 'bg-green-500' :
                        complianceRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${complianceRate}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Compliance Deadlines</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded border border-red-200">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm font-medium text-red-900">Security System Certification</div>
                <div className="text-xs text-red-700">Due in 5 days</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded border border-yellow-200">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-yellow-900">Vehicle Insurance Review</div>
                <div className="text-xs text-yellow-700">Due in 15 days</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded border border-blue-200">
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-900">IT Equipment Audit</div>
                <div className="text-xs text-blue-700">Due in 30 days</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h4>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-500">Overall Compliance Score</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-600">High Risk</span>
                <span>2 items</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Medium Risk</span>
                <span>5 items</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Low Risk</span>
                <span>15 items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Audits</h2>
          <p className="text-gray-600">Track audit activities, findings, and compliance status</p>
        </div>
        
        {permissions.canAudit && (
          <Button 
            onClick={() => setActiveView('schedule')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Schedule Audit
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Squares2X2Icon },
            { id: 'schedule', name: 'Schedule Audit', icon: CalendarDaysIcon },
            { id: 'audits', name: 'Audit List', icon: ClipboardDocumentListIcon },
            { id: 'findings', name: 'All Findings', icon: ExclamationTriangleIcon },
            { id: 'compliance', name: 'Compliance Overview', icon: ShieldCheckIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon
                className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeView === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && renderOverview()}
      {activeView === 'schedule' && renderScheduleAudit()}
      {activeView === 'audits' && renderAuditList()}
      {activeView === 'findings' && renderAllFindings()}
      {activeView === 'compliance' && renderComplianceOverview()}
    </div>
  )
}

// Missing import - need to add this
import { Squares2X2Icon } from '@heroicons/react/24/outline'
