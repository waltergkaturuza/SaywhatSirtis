"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ensureArray, safeFilter } from "@/lib/array-utils"
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon
} from "@heroicons/react/24/outline"

interface CaseData {
  id: string
  caseNumber: string
  callNumber?: string
  clientName?: string
  phone?: string
  purpose: string
  officer?: string
  status: string
  priority: string
  createdDate: string
  dueDate?: string
  lastUpdate: string
  isOverdue: boolean
  description: string
}

export default function CaseManagementPage() {
  const { data: session } = useSession()
  
  // All useState hooks must be called before any conditional logic
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOfficer, setSelectedOfficer] = useState('all')
  const [cases, setCases] = useState<CaseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Check user permissions after all hooks
  const userPermissions = session?.user?.permissions || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || 
                             userPermissions.includes('programs.head') ||
                             userPermissions.includes('callcentre.officer')

  useEffect(() => {
    if (canAccessCallCentre) {
      fetchCases()
    }
  }, [canAccessCallCentre])

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/call-centre/cases')
      if (!response.ok) {
        throw new Error('Failed to fetch cases')
      }
      const data = await response.json()
      setCases(data.cases || [])
    } catch (error) {
      console.error('Error fetching cases:', error)
      setError('Failed to load case data')
    } finally {
      setLoading(false)
    }
  }

  if (!canAccessCallCentre) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            This module is restricted to Call Centre officers and Head of Programs only.
          </p>
        </div>
      </div>
    )
  }

  // Extract unique officers from cases for filter dropdown and calculate statistics
  const safeCases = ensureArray<CaseData>(cases)
  const officers = [...new Set(safeCases.map(c => c.officer).filter(Boolean))]

  // Filter cases based on active tab and search
  const filteredCases = safeFilter(cases, (caseItem: CaseData) => {
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'open' && caseItem.status === 'open') ||
                      (activeTab === 'in-progress' && caseItem.status === 'in-progress') ||
                      (activeTab === 'pending' && caseItem.status === 'pending') ||
                      (activeTab === 'closed' && caseItem.status === 'closed') ||
                      (activeTab === 'overdue' && caseItem.isOverdue)

    const matchesSearch = searchTerm === '' ||
                         caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.purpose.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesOfficer = selectedOfficer === 'all' || caseItem.officer === selectedOfficer

    return matchesTab && matchesSearch && matchesOfficer
  })

  // Calculate statistics
  const stats = {
    totalCases: safeCases.length,
    openCases: safeFilter(cases, (c: CaseData) => c.status === 'open').length,
    inProgressCases: safeFilter(cases, (c: CaseData) => c.status === 'in-progress').length,
    pendingCases: safeFilter(cases, (c: CaseData) => c.status === 'pending').length,
    closedCases: safeFilter(cases, (c: CaseData) => c.status === 'closed').length,
    overdueCases: safeFilter(cases, (c: CaseData) => c.isOverdue).length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const metadata = {
    title: "Case Management",
    description: "Track and manage client cases with due dates and priorities",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Call Centre", href: "/call-centre" },
      { name: "Case Management" }
    ]
  }

  const actions = (
    <>
      <Link
        href="/call-centre"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Call Centre
      </Link>
      <Link
        href="/call-centre/new-call"
        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
      >
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        New Call Entry
      </Link>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Statistics</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCases}</div>
            <div className="text-sm text-blue-800">Total Cases</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <div className="text-2xl font-bold text-yellow-600">{stats.openCases + stats.inProgressCases + stats.pendingCases}</div>
            <div className="text-sm text-yellow-800">Active Cases</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">{stats.closedCases}</div>
            <div className="text-sm text-green-800">Closed Cases</div>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <div className="text-2xl font-bold text-red-600">{stats.overdueCases}</div>
            <div className="text-sm text-red-800">Overdue Cases</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Officer Workload</h3>
        <div className="space-y-2">
          {officers.map((officer) => {
            const officerCases = safeFilter(cases, (c: CaseData) => c.officer === officer && c.status !== 'closed')
            const overdueCount = safeFilter(cases, (c: CaseData) => c.officer === officer && c.isOverdue).length
            
            return (
              <div key={officer} className="p-2 border rounded">
                <div className="font-medium text-sm">{officer}</div>
                <div className="text-xs text-gray-500">
                  Active: {officerCases.length}
                  {overdueCount > 0 && (
                    <span className="text-red-600 ml-2">Overdue: {overdueCount}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('overdue')}
            className="w-full text-left p-2 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Overdue Cases
          </button>
          <button 
            onClick={() => setActiveTab('open')}
            className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            Open Cases
          </button>
          <button 
            onClick={() => setActiveTab('in-progress')}
            className="w-full text-left p-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
          >
            In Progress
          </button>
          <button 
            onClick={() => setActiveTab('closed')}
            className="w-full text-left p-2 text-sm text-green-600 hover:bg-green-50 rounded"
          >
            Closed Cases
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Officers</option>
                {officers.map((officer) => (
                  <option key={officer} value={officer}>
                    {officer}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Case Status Tabs */}
        <div className="bg-white rounded-lg border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Cases', count: stats.totalCases },
                { key: 'open', label: 'Open', count: stats.openCases },
                { key: 'in-progress', label: 'In Progress', count: stats.inProgressCases },
                { key: 'pending', label: 'Pending', count: stats.pendingCases },
                { key: 'closed', label: 'Closed', count: stats.closedCases },
                { key: 'overdue', label: 'Overdue', count: stats.overdueCases }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Cases List */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-3 text-gray-500">Loading cases...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">Error Loading Cases</h3>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button 
                  onClick={fetchCases}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="p-12 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No cases found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedOfficer !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No cases have been created yet.'
                  }
                </p>
              </div>
            ) : (
              filteredCases.map((caseItem) => (
                <div key={caseItem.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{caseItem.clientName || 'Unknown Client'}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(caseItem.priority)}`}>
                          {caseItem.priority} priority
                        </span>
                        {caseItem.isOverdue && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{caseItem.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Case ID:</span> {caseItem.caseNumber}
                        </div>
                        <div>
                          <span className="font-medium">Call ID:</span> {caseItem.callNumber}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {caseItem.phone}
                        </div>
                        <div>
                          <span className="font-medium">Purpose:</span> {caseItem.purpose}
                        </div>
                        <div>
                          <span className="font-medium">Officer:</span> {caseItem.officer}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {caseItem.createdDate}
                        </div>
                        <div className={caseItem.isOverdue ? 'text-red-600' : ''}>
                          <span className="font-medium">Due Date:</span> {caseItem.dueDate}
                        </div>
                        <div>
                          <span className="font-medium">Last Update:</span> {caseItem.lastUpdate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/call-centre/cases/${caseItem.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View Case Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/call-centre/cases/${caseItem.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Edit Case"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Case Management Guidelines */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Case Management Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Case Priorities</h4>
              <ul className="space-y-1">
                <li>• <strong>High:</strong> GBV, Child Protection, Mental Health Crisis</li>
                <li>• <strong>Medium:</strong> Legal Assistance, HIV Counselling</li>
                <li>• <strong>Low:</strong> General Information Requests</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Follow-up Requirements</h4>
              <ul className="space-y-1">
                <li>• Update case status within 24-48 hours</li>
                <li>• Document all client interactions</li>
                <li>• Coordinate with relevant service providers</li>
                <li>• Close cases only when resolution is confirmed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
