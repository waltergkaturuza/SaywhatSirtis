'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, Calendar, User, FileText, AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react'
import Link from 'next/link'

interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userEmail: string
  userName: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'APPROVE' | 'REJECT'
  entityType: 'RISK' | 'MITIGATION' | 'ASSESSMENT' | 'DOCUMENT' | 'REPORT'
  entityId: string
  entityName: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress: string
  userAgent: string
  details?: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

interface AuditFilters {
  action: string
  entityType: string
  userId: string
  dateFrom: string
  dateTo: string
  severity: string
  search: string
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filters, setFilters] = useState<AuditFilters>({
    action: 'all',
    entityType: 'all',
    userId: 'all',
    dateFrom: '',
    dateTo: '',
    severity: 'all',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const logsPerPage = 25

  useEffect(() => {
    loadAuditLogs()
  }, [filters, currentPage])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      
      // Simulate API call with sample data
      const sampleLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2025-01-11T14:30:00Z',
          userId: 'user-1',
          userEmail: 'john.doe@saywhat.com',
          userName: 'John Doe',
          action: 'CREATE',
          entityType: 'RISK',
          entityId: 'risk-1',
          entityName: 'Cybersecurity Data Breach Risk',
          newValues: {
            title: 'Cybersecurity Data Breach Risk',
            description: 'Risk of data breach due to inadequate cybersecurity measures',
            severity: 'HIGH',
            probability: 'MEDIUM',
            impact: 'HIGH',
            category: 'CYBERSECURITY'
          },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: 'New high-severity cybersecurity risk created',
          severity: 'HIGH'
        },
        {
          id: '2',
          timestamp: '2025-01-11T13:15:00Z',
          userId: 'user-2',
          userEmail: 'jane.smith@saywhat.com',
          userName: 'Jane Smith',
          action: 'UPDATE',
          entityType: 'RISK',
          entityId: 'risk-2',
          entityName: 'Financial Budget Overrun Risk',
          oldValues: {
            severity: 'MEDIUM',
            status: 'OPEN'
          },
          newValues: {
            severity: 'HIGH',
            status: 'UNDER_REVIEW'
          },
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: 'Risk severity escalated from MEDIUM to HIGH',
          severity: 'MEDIUM'
        },
        {
          id: '3',
          timestamp: '2025-01-11T12:45:00Z',
          userId: 'user-3',
          userEmail: 'admin@saywhat.com',
          userName: 'System Administrator',
          action: 'DELETE',
          entityType: 'DOCUMENT',
          entityId: 'doc-1',
          entityName: 'Outdated Risk Assessment Document',
          oldValues: {
            title: 'Outdated Risk Assessment Document',
            fileSize: '2.5MB',
            uploadDate: '2024-12-01T10:00:00Z'
          },
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: 'Document deleted due to being outdated and superseded',
          severity: 'LOW'
        },
        {
          id: '4',
          timestamp: '2025-01-11T11:30:00Z',
          userId: 'user-1',
          userEmail: 'john.doe@saywhat.com',
          userName: 'John Doe',
          action: 'APPROVE',
          entityType: 'MITIGATION',
          entityId: 'mit-1',
          entityName: 'Implement Multi-Factor Authentication',
          newValues: {
            status: 'APPROVED',
            approvedBy: 'John Doe',
            approvalDate: '2025-01-11T11:30:00Z'
          },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: 'Mitigation strategy approved for implementation',
          severity: 'MEDIUM'
        },
        {
          id: '5',
          timestamp: '2025-01-11T10:15:00Z',
          userId: 'user-4',
          userEmail: 'mike.johnson@saywhat.com',
          userName: 'Mike Johnson',
          action: 'EXPORT',
          entityType: 'REPORT',
          entityId: 'rep-1',
          entityName: 'Monthly Risk Summary Report',
          details: 'Risk report exported to PDF format',
          ipAddress: '192.168.1.103',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'LOW'
        }
      ]
      
      // Apply filters
      let filteredLogs = sampleLogs
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredLogs = filteredLogs.filter(log =>
          log.entityName.toLowerCase().includes(searchLower) ||
          log.userName.toLowerCase().includes(searchLower) ||
          log.userEmail.toLowerCase().includes(searchLower) ||
          log.details?.toLowerCase().includes(searchLower)
        )
      }
      
      if (filters.action !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action)
      }
      
      if (filters.entityType !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.entityType === filters.entityType)
      }
      
      if (filters.severity !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity)
      }
      
      // Apply date filters
      if (filters.dateFrom) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.dateFrom))
      }
      
      if (filters.dateTo) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.dateTo))
      }
      
      // Pagination
      const startIndex = (currentPage - 1) * logsPerPage
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage)
      
      setAuditLogs(paginatedLogs)
      setTotalPages(Math.ceil(filteredLogs.length / logsPerPage))
      
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      action: 'all',
      entityType: 'all',
      userId: 'all',
      dateFrom: '',
      dateTo: '',
      severity: 'all',
      search: ''
    })
    setCurrentPage(1)
  }

  const viewLogDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  const exportAuditLogs = () => {
    const csvData = [
      ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity Name', 'Severity', 'Details'],
      ...auditLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.userName,
        log.action,
        log.entityType,
        log.entityName,
        log.severity,
        log.details || ''
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'UPDATE':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'DELETE':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'VIEW':
        return <Eye className="h-4 w-4 text-blue-600" />
      case 'EXPORT':
        return <FileText className="h-4 w-4 text-purple-600" />
      case 'APPROVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECT':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      LOW: 'bg-green-100 text-green-700 border border-green-200',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
      CRITICAL: 'bg-red-100 text-red-700 border border-red-200'
    }
    
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${colors[severity as keyof typeof colors]} shadow-sm`}>
        {severity}
      </span>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 px-4 py-6">
        <div className="w-full max-w-none mx-auto">
          <div className="animate-pulse">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-100 mb-8">
              <div className="h-12 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl w-1/3 mb-4"></div>
              <div className="h-6 bg-orange-100 rounded-lg w-2/3"></div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-8">
              <div className="h-8 bg-orange-100 rounded-xl w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-6 bg-orange-50 rounded-lg w-full"></div>
                <div className="h-6 bg-orange-50 rounded-lg w-3/4"></div>
                <div className="h-6 bg-orange-50 rounded-lg w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 px-4 py-6">
      <div className="w-full max-w-none mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              🏠
            </Link>
            <Link
              href="/risk-management"
              className="inline-flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Risk Management
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={exportAuditLogs}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <FileText className="h-5 w-5 mr-2" />
              Export Logs
            </button>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent mb-3">
              Audit Trail
            </h1>
            <p className="text-gray-600 text-lg">Track all risk management activities and changes with comprehensive logging</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-8 mb-8">
          <div className="flex items-center mb-6">
            <Filter className="h-6 w-6 text-orange-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Filter & Search</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search logs..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
                <option value="EXPORT">Export</option>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="all">All Types</option>
                <option value="RISK">Risk</option>
                <option value="MITIGATION">Mitigation</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="DOCUMENT">Document</option>
                <option value="REPORT">Report</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="all">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-6 py-3 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 font-medium"
            >
              <Filter className="h-5 w-5 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              Activity Logs
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center bg-gradient-to-br from-orange-50 to-orange-100">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                          <FileText className="h-10 w-10 text-orange-400" />
                        </div>
                        <p className="text-xl font-semibold text-gray-700 mb-2">No audit logs found</p>
                        <p className="text-gray-500 text-lg">
                          Try adjusting your filters or check back later
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-orange-50/50 transition-colors duration-200 border-b border-gray-50">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="bg-gray-100 rounded-lg px-3 py-2 inline-block">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                            <User className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{log.userName}</div>
                            <div className="text-sm text-gray-500">{log.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 w-fit">
                          {getActionIcon(log.action)}
                          <span className="ml-2 text-sm font-medium text-gray-900">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-semibold text-gray-900">{log.entityName}</div>
                          <div className="text-xs text-orange-600 font-medium mt-1">{log.entityType}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="bg-gray-50 rounded-lg p-3 max-w-xs">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {log.details || 'No additional details'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewLogDetails(log)}
                          className="text-orange-600 hover:text-orange-700 inline-flex items-center bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-8 py-6 border-t border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-6 py-3 border border-orange-200 text-sm font-medium rounded-xl text-orange-700 bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-6 py-3 border border-orange-200 text-sm font-medium rounded-xl text-orange-700 bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg text-gray-700 font-medium">
                      Showing page <span className="font-bold text-orange-600">{currentPage}</span> of{' '}
                      <span className="font-bold text-orange-600">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-xl shadow-lg overflow-hidden">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-6 py-3 border border-orange-200 bg-white text-sm font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-6 py-3 border-l border-orange-200 bg-white text-sm font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <p className="text-sm text-gray-900">{selectedLog.userName} ({selectedLog.userEmail})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <div className="flex items-center">
                      {getActionIcon(selectedLog.action)}
                      <span className="ml-2 text-sm text-gray-900">{selectedLog.action}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    {getSeverityBadge(selectedLog.severity)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entity Type</label>
                    <p className="text-sm text-gray-900">{selectedLog.entityType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entity Name</label>
                    <p className="text-sm text-gray-900">{selectedLog.entityName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="text-sm text-gray-900">{selectedLog.ipAddress}</p>
                  </div>
                </div>
                
                {selectedLog.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Details</label>
                    <p className="text-sm text-gray-900">{selectedLog.details}</p>
                  </div>
                )}
                
                {selectedLog.oldValues && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Previous Values</label>
                    <pre className="text-xs text-gray-900 bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.oldValues, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.newValues && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Values</label>
                    <pre className="text-xs text-gray-900 bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.newValues, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="text-xs text-gray-600 break-all">{selectedLog.userAgent}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
