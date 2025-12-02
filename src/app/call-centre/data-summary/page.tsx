"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon
} from "@heroicons/react/24/outline"

interface SummaryStats {
  totalCalls: number
  validCalls: number
  invalidCalls: number
  totalCases: number
  pendingCases: number
  closedCases: number
  overdueCases: number
  averageCallDuration: string
  caseConversionRate: string
}

interface OfficerPerformance {
  name: string
  totalCalls: number
  validCalls: number
  cases: number
  pendingCases: number
  closedCases: number
  overdueCases: number
  avgCallDuration: string
}

export default function CallCentreDataSummaryPage() {
  const { data: session } = useSession()
  
  // All hooks must be at the top before any conditional logic
  const [filters, setFilters] = useState({
    officerName: '',
    dateFrom: '',
    dateTo: '',
    province: 'all',
    callerIdNumber: '',
    caseNumber: '',
    gender: 'all',
    validCalls: 'all',
    purpose: 'all',
    language: 'all',
    communicationMode: 'all'
  })
  
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalCalls: 0,
    validCalls: 0,
    invalidCalls: 0,
    totalCases: 0,
    pendingCases: 0,
    closedCases: 0,
    overdueCases: 0,
    averageCallDuration: "0 min",
    caseConversionRate: "0%"
  })
  
  const [officerPerformance, setOfficerPerformance] = useState<OfficerPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // State for chart data - will be populated from API
  const [casesByPurpose, setCasesByPurpose] = useState<Array<{purpose: string, count: number, percentage: number}>>([])
  const [purposeByTimeframe, setPurposeByTimeframe] = useState<Array<{purpose: string, today: number, week: number, month: number, year: number, total: number}>>([])
  const [callsByProvince, setCallsByProvince] = useState<Array<{province: string, calls: number, validCalls: number}>>([])
  const [callsByAgeGroup, setCallsByAgeGroup] = useState<Array<{ageGroup: string, count: number, percentage: number}>>([])
  const [callsByGender, setCallsByGender] = useState<Array<{gender: string, count: number, percentage: number}>>([])
  const [callsByTimeframe, setCallsByTimeframe] = useState<{today: number, week: number, month: number, year: number}>({today: 0, week: 0, month: 0, year: 0})

  useEffect(() => {
    fetchSummaryData()
  }, [])

  const fetchSummaryData = async () => {
    try {
      const response = await fetch('/api/call-centre/summary')
      if (!response.ok) {
        throw new Error('Failed to fetch summary data')
      }
      const data = await response.json()
      setSummaryStats(data.stats || summaryStats)
      setOfficerPerformance(data.officers || [])
      setCasesByPurpose(data.casesByPurpose || [])
      setPurposeByTimeframe(data.purposeByTimeframe || [])
      setCallsByProvince(data.callsByProvince || [])
      setCallsByAgeGroup(data.callsByAgeGroup || [])
      setCallsByGender(data.callsByGender || [])
      setCallsByTimeframe(data.callsByTimeframe || {today: 0, week: 0, month: 0, year: 0})
    } catch (error) {
      console.error('Error fetching summary data:', error)
      setError('Failed to load summary data')
    } finally {
      setLoading(false)
    }
  }

  // Export functions
  const exportToCSV = () => {
    const headers = ['Officer Name', 'Total Calls', 'Valid Calls', 'Cases', 'Pending Cases', 'Closed Cases', 'Overdue Cases', 'Avg Call Duration']
    const csvContent = [
      headers.join(','),
      ...officerPerformance.map(officer => [
        officer.name,
        officer.totalCalls,
        officer.validCalls,
        officer.cases,
        officer.pendingCases,
        officer.closedCases,
        officer.overdueCases,
        officer.avgCallDuration
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `call-centre-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    // Create printable version
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Call Centre Data Summary Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
              h2 { color: #374151; margin-top: 30px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
              th { background-color: #f3f4f6; font-weight: bold; }
              .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
              .stat-card { border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; }
              .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
              .stat-label { color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <h1>Call Centre Data Summary Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            
            <h2>Summary Statistics</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${summaryStats.totalCalls}</div>
                <div class="stat-label">Total Calls</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${summaryStats.validCalls}</div>
                <div class="stat-label">Valid Calls</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${summaryStats.totalCases}</div>
                <div class="stat-label">Total Cases</div>
              </div>
            </div>
            
            <h2>Officer Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Officer Name</th>
                  <th>Total Calls</th>
                  <th>Valid Calls</th>
                  <th>Cases</th>
                  <th>Pending</th>
                  <th>Closed</th>
                  <th>Overdue</th>
                  <th>Avg Duration</th>
                </tr>
              </thead>
              <tbody>
                ${officerPerformance.map(officer => `
                  <tr>
                    <td>${officer.name}</td>
                    <td>${officer.totalCalls}</td>
                    <td>${officer.validCalls}</td>
                    <td>${officer.cases}</td>
                    <td>${officer.pendingCases}</td>
                    <td>${officer.closedCases}</td>
                    <td>${officer.overdueCases}</td>
                    <td>${officer.avgCallDuration}</td>
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

  // Check user permissions after all hooks
  const userPermissions = session?.user?.permissions || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || 
                             userPermissions.includes('programs.head') ||
                             userPermissions.includes('callcentre.officer') ||
                             userPermissions.includes('call_center_full') ||
                             userPermissions.includes('call_center_view') ||
                             userPermissions.includes('callcentre.view') ||
                             session?.user?.roles?.some(role => ['advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase()))

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

  // Charts data will be fetched from the API

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      officerName: '',
      dateFrom: '',
      dateTo: '',
      province: 'all',
      callerIdNumber: '',
      caseNumber: '',
      gender: 'all',
      validCalls: 'all',
      purpose: 'all',
      language: 'all',
      communicationMode: 'all'
    })
  }

  const metadata = {
    title: "Call Centre Data Summary",
    description: "Comprehensive analytics and reporting for call centre operations",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Call Centre", href: "/call-centre" },
      { name: "Data Summary" }
    ]
  }

  const actions = (
    <>
      <Link
        href="/call-centre"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Call Centre
      </Link>
      <div className="flex gap-2">
        <button 
          onClick={exportToCSV}
          className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Export CSV
        </button>
        <button 
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 bg-orange-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Print Report
        </button>
      </div>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Stats</h3>
        <div className="space-y-3">
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{summaryStats.totalCalls.toLocaleString()}</div>
            <div className="text-sm text-gray-700 font-medium">Total Calls</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{summaryStats.validCalls.toLocaleString()}</div>
            <div className="text-sm text-gray-700 font-medium">Valid Calls</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500 shadow-sm">
            <div className="text-2xl font-bold text-gray-700">{summaryStats.totalCases}</div>
            <div className="text-sm text-gray-600 font-medium">Total Cases</div>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-black shadow-sm">
            <div className="text-2xl font-bold text-black">{summaryStats.averageCallDuration}</div>
            <div className="text-sm text-gray-600 font-medium">Avg Call Duration</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h3>
        <div className="space-y-2">
          <button 
            onClick={() => handleFilterChange('validCalls', 'valid')}
            className="w-full text-left p-3 text-sm text-green-700 hover:bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors font-medium"
          >
            Valid Calls Only
          </button>
          <button 
            onClick={() => handleFilterChange('validCalls', 'invalid')}
            className="w-full text-left p-3 text-sm text-orange-700 hover:bg-orange-50 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors font-medium"
          >
            Invalid Calls Only
          </button>
          <button 
            onClick={() => handleFilterChange('purpose', 'HIV Information & Counselling')}
            className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors font-medium"
          >
            HIV Counselling
          </button>
          <button 
            onClick={() => handleFilterChange('purpose', 'Mental Health Support')}
            className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors font-medium"
          >
            Mental Health
          </button>
          <button 
            onClick={clearFilters}
            className="w-full text-left p-3 text-sm text-black hover:bg-gray-100 rounded-lg border border-gray-300 hover:border-black transition-colors font-medium"
          >
            Clear All Filters
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
        {/* Search and Filter Panel */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-6 border-b border-gray-200 pb-3">Search Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Officer Name
              </label>
              <input
                type="text"
                value={filters.officerName}
                onChange={(e) => handleFilterChange('officerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Search by officer name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province
              </label>
              <select
                value={filters.province}
                onChange={(e) => handleFilterChange('province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="all">All Provinces</option>
                <option value="Harare">Harare</option>
                <option value="Bulawayo">Bulawayo</option>
                <option value="Manicaland">Manicaland</option>
                <option value="Mashonaland Central">Mashonaland Central</option>
                <option value="Mashonaland East">Mashonaland East</option>
                <option value="Mashonaland West">Mashonaland West</option>
                <option value="Matabeleland North">Matabeleland North</option>
                <option value="Matabeleland South">Matabeleland South</option>
                <option value="Midlands">Midlands</option>
                <option value="Masvingo">Masvingo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caller ID Number
              </label>
              <input
                type="text"
                value={filters.callerIdNumber}
                onChange={(e) => handleFilterChange('callerIdNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Search by phone number..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Number
              </label>
              <input
                type="text"
                value={filters.caseNumber}
                onChange={(e) => handleFilterChange('caseNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Search by case number..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="N/A">N/A</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Calls
              </label>
              <select
                value={filters.validCalls}
                onChange={(e) => handleFilterChange('validCalls', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="all">All Calls</option>
                <option value="valid">Valid Calls Only</option>
                <option value="invalid">Invalid Calls Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Mode
              </label>
              <select
                value={filters.communicationMode}
                onChange={(e) => handleFilterChange('communicationMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="all">All Modes</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="walk">Walk-in</option>
                <option value="text">Text/SMS</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm">
              Apply Filters
            </button>
            <button 
              onClick={clearFilters}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Officer Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-black">Officer Performance Overview</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-black">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Officer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Total Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Valid Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Cases Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Pending Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Closed Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Overdue Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Avg Call Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <span className="ml-3 text-gray-600 font-medium">Loading performance data...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Error Loading Data</h3>
                      <p className="text-sm text-gray-500 mb-4">{error}</p>
                      <button 
                        onClick={fetchSummaryData}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm"
                      >
                        Try Again
                      </button>
                    </td>
                  </tr>
                ) : officerPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No officer performance data available
                    </td>
                  </tr>
                ) : (
                  officerPerformance.map((officer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{officer.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {officer.totalCalls}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="text-green-600 font-semibold">{officer.validCalls}</span>
                        <span className="text-gray-500 ml-1">
                          ({((officer.validCalls / officer.totalCalls) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {officer.cases}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                          {officer.pendingCases}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {officer.closedCases}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {officer.overdueCases > 0 ? (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            {officer.overdueCases}
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {officer.avgCallDuration}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Time Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">Calls by Timeframe</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
              <div className="text-sm text-blue-700 font-medium mb-1">Today</div>
              <div className="text-3xl font-bold text-blue-900">{callsByTimeframe.today}</div>
              <div className="text-xs text-blue-600 mt-1">Last 24 hours</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
              <div className="text-sm text-green-700 font-medium mb-1">This Week</div>
              <div className="text-3xl font-bold text-green-900">{callsByTimeframe.week}</div>
              <div className="text-xs text-green-600 mt-1">Last 7 days</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
              <div className="text-sm text-orange-700 font-medium mb-1">This Month</div>
              <div className="text-3xl font-bold text-orange-900">{callsByTimeframe.month}</div>
              <div className="text-xs text-orange-600 mt-1">Last 30 days</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
              <div className="text-sm text-purple-700 font-medium mb-1">This Year</div>
              <div className="text-3xl font-bold text-purple-900">{callsByTimeframe.year}</div>
              <div className="text-xs text-purple-600 mt-1">Year to date</div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cases by Purpose */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">Cases by Purpose</h3>
            
            {/* Purpose Distribution by Timeframe Table */}
            {purposeByTimeframe.length > 0 ? (
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-black">Purpose</th>
                      <th className="text-center py-3 px-2 font-semibold text-blue-700">Today</th>
                      <th className="text-center py-3 px-2 font-semibold text-green-700">This Week</th>
                      <th className="text-center py-3 px-2 font-semibold text-orange-700">This Month</th>
                      <th className="text-center py-3 px-2 font-semibold text-purple-700">This Year</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purposeByTimeframe
                      .sort((a, b) => b.total - a.total)
                      .map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 font-medium text-black">{item.purpose}</td>
                          <td className="py-3 px-2 text-center text-blue-600 font-semibold">{item.today}</td>
                          <td className="py-3 px-2 text-center text-green-600 font-semibold">{item.week}</td>
                          <td className="py-3 px-2 text-center text-orange-600 font-semibold">{item.month}</td>
                          <td className="py-3 px-2 text-center text-purple-600 font-semibold">{item.year}</td>
                          <td className="py-3 px-2 text-center text-gray-800 font-bold">{item.total}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {/* Overall Purpose Distribution (Progress Bars) */}
            <div className="space-y-3">
              {casesByPurpose.length > 0 ? (
                casesByPurpose.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black">{item.purpose}</div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                        <div 
                          className="bg-orange-500 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-sm text-gray-500">
                      {item.count} ({item.percentage}%)
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No Case Data</h3>
                  <p className="text-sm text-gray-500">Case purpose data will appear here when available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Calls by Province */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">Calls by Province</h3>
            <div className="space-y-2">
              {callsByProvince.length > 0 ? (
                callsByProvince.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="text-sm font-medium text-black">{item.province}</div>
                    <div className="text-sm text-gray-600">
                      <span className="text-green-600 font-semibold">{item.validCalls}</span> / <span className="text-gray-800">{item.calls}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No Province Data</h3>
                  <p className="text-sm text-gray-500">Call distribution by province will appear here when available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demographic Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calls by Age Group */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">Calls Distribution by Age Group</h3>
            {callsByAgeGroup.length > 0 ? (
              <div className="space-y-3">
                {callsByAgeGroup.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-orange-500' : 
                          index === 3 ? 'bg-purple-500' : 
                          index === 4 ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium text-black">{item.ageGroup}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">{item.count}</span>
                        <span className="text-gray-500 ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-orange-500' : 
                          index === 3 ? 'bg-purple-500' : 
                          index === 4 ? 'bg-red-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Age Data</h3>
                <p className="text-sm text-gray-500">Age distribution will appear here when available.</p>
              </div>
            )}
          </div>

          {/* Calls by Gender */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">Calls Distribution by Gender</h3>
            {callsByGender.length > 0 ? (
              <div className="space-y-4">
                {callsByGender.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.gender === 'Male' ? 'bg-blue-100' :
                        item.gender === 'Female' ? 'bg-pink-100' :
                        'bg-purple-100'
                      }`}>
                        <span className={`text-2xl ${
                          item.gender === 'Male' ? 'text-blue-600' :
                          item.gender === 'Female' ? 'text-pink-600' :
                          'text-purple-600'
                        }`}>
                          {item.gender === 'Male' ? '♂' : item.gender === 'Female' ? '♀' : '⚥'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{item.gender}</div>
                        <div className="text-xs text-gray-500">{item.percentage}% of total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        item.gender === 'Male' ? 'text-blue-600' :
                        item.gender === 'Female' ? 'text-pink-600' :
                        'text-purple-600'
                      }`}>{item.count}</div>
                      <div className="text-xs text-gray-500">calls</div>
                    </div>
                  </div>
                ))}
                
                {/* Visual percentage bar */}
                <div className="mt-4">
                  <div className="flex h-8 rounded-lg overflow-hidden border border-gray-300">
                    {callsByGender.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-center text-xs font-medium text-white ${
                          item.gender === 'Male' ? 'bg-blue-500' :
                          item.gender === 'Female' ? 'bg-pink-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      >
                        {item.percentage > 10 && `${item.percentage}%`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Gender Data</h3>
                <p className="text-sm text-gray-500">Gender distribution will appear here when available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Case Management Overview */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">Case Management Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-2xl font-bold text-black">{summaryStats.totalCases}</div>
              <div className="text-sm text-gray-600 font-medium">Total Cases</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{summaryStats.pendingCases}</div>
              <div className="text-sm text-orange-700 font-medium">Pending Cases</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
              <div className="text-2xl font-bold text-green-600">{summaryStats.closedCases}</div>
              <div className="text-sm text-green-700 font-medium">Closed Cases</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
              <div className="text-2xl font-bold text-red-600">{summaryStats.overdueCases}</div>
              <div className="text-sm text-red-700 font-medium">Overdue Cases</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Cases are automatically tracked from call entry to closure. Officers can monitor progress and ensure timely resolution of client issues.</p>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
