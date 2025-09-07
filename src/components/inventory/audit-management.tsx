"use client"

import { useState, useEffect } from "react"
import { 
  ShieldCheckIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Asset, InventoryPermissions } from '@/types/inventory'

interface AuditManagementProps {
  assets: Asset[]
  permissions: InventoryPermissions
}

interface Audit {
  id: string
  title: string
  auditDate: string
  auditor: string
  type: 'physical' | 'financial' | 'compliance' | 'condition'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  location?: string
  scope: string[]
  findings: AuditFinding[]
  recommendations: string[]
  completedAt?: string
  createdAt: string
  updatedAt: string
}

interface AuditFinding {
  id: string
  assetId: string
  type: 'missing' | 'damaged' | 'discrepancy' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendedAction: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  assignedTo?: string
  dueDate?: string
}

export const AuditManagement: React.FC<AuditManagementProps> = ({
  assets,
  permissions
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'schedule' | 'audits' | 'findings' | 'compliance'>('overview')
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch audits from API
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true)
        setError("")
        
        const response = await fetch('/api/inventory/audits')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setAudits(data.audits || [])
      } catch (err) {
        console.error('Failed to fetch audits:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setAudits([]) // Empty state instead of mock data
      } finally {
        setLoading(false)
      }
    }
    
    fetchAudits()
  }, [])

  const filteredAudits = (audits || []).filter(audit => {
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter
    const matchesType = typeFilter === 'all' || audit.type === typeFilter
    const matchesSearch = !searchQuery || 
      audit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesType && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'scheduled': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100'
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading audits...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 font-medium">Failed to load audits</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Audit & Compliance Management</h3>
          <p className="text-gray-600">Track asset audits, compliance checks, and findings</p>
        </div>
        {permissions.canAudit && (
          <Button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Schedule Audit
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ShieldCheckIcon },
            { id: 'audits', name: 'Audit History', icon: ClipboardDocumentListIcon },
            { id: 'findings', name: 'Findings', icon: ExclamationTriangleIcon },
            { id: 'compliance', name: 'Compliance', icon: CheckCircleIcon }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Audits</p>
                    <p className="text-2xl font-bold text-gray-900">{audits.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(audits || []).filter(a => a.status === 'in-progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(audits || []).filter(a => a.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Findings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(audits || []).reduce((sum, audit) => sum + (audit.findings || []).filter(f => f.status === 'open').length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Audits */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audits</CardTitle>
                <CardDescription>Latest audit activities and status</CardDescription>
              </CardHeader>
              <CardContent>
                {audits.length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 mt-4">No audits found</p>
                    <p className="text-gray-400 text-sm">Schedule your first audit to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {audits.slice(0, 5).map((audit) => (
                      <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{audit.title}</h4>
                          <p className="text-sm text-gray-600">
                            {audit.auditor} • {new Date(audit.auditDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                          {audit.status.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Findings Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Active Findings</CardTitle>
                <CardDescription>Open audit findings requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['critical', 'high', 'medium', 'low'].map(severity => {
                    const count = (audits || []).reduce((sum, audit) => 
                      sum + (audit.findings || []).filter(f => f.severity === severity && f.status === 'open').length, 0
                    )
                    return (
                      <div key={severity} className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(severity)}`}>
                          {severity.toUpperCase()}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeView === 'audits' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search audits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              <option value="physical">Physical</option>
              <option value="financial">Financial</option>
              <option value="compliance">Compliance</option>
              <option value="condition">Condition</option>
            </select>
          </div>

          {/* Audits List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAudits.map((audit) => (
              <Card key={audit.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{audit.title}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                      {audit.status.replace('-', ' ')}
                    </span>
                  </div>
                  <CardDescription>
                    {audit.auditor} • {new Date(audit.auditDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Type:</span>
                      <span className="ml-2 capitalize">{audit.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Scope:</span>
                      <span className="ml-2">{audit.scope.join(', ')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Findings:</span>
                      <span className="ml-2">{audit.findings.length} issues</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAudits.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 mt-4">No audits match your filters</p>
              <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Other view content would go here */}
    </div>
  )
}
