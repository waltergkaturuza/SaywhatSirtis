"use client"

import { useState } from "react"
import {
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ClockIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"
import type { InventoryPermissions } from "@/types/inventory"

interface InventoryReportsProps {
  permissions: InventoryPermissions
}

interface Report {
  id: string
  title: string
  type: string
  description: string
  generatedAt: string
  generatedBy: string
  size: string
  status: "ready" | "generating" | "scheduled"
  downloadUrl?: string
}

export function InventoryReports({ permissions }: InventoryReportsProps) {
  const [activeTab, setActiveTab] = useState("available")
  const [loading, setLoading] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState("")
  const [reportParams, setReportParams] = useState({
    dateRange: { start: "", end: "" },
    locations: [] as string[],
    departments: [] as string[],
    assetTypes: [] as string[]
  })

  const reportTypes = [
    {
      id: "asset-register",
      name: "Asset Register",
      description: "Complete list of all assets with current values and locations",
      icon: DocumentTextIcon,
      requiresFinancial: false
    },
    {
      id: "depreciation",
      name: "Depreciation Report",
      description: "Asset depreciation analysis and current value calculations",
      icon: ChartBarIcon,
      requiresFinancial: true
    },
    {
      id: "location-summary",
      name: "Location Summary",
      description: "Assets grouped by location with value summaries",
      icon: FunnelIcon,
      requiresFinancial: true
    },
    {
      id: "maintenance-schedule",
      name: "Maintenance Schedule",
      description: "Upcoming and overdue maintenance activities",
      icon: ClockIcon,
      requiresFinancial: false
    },
    {
      id: "audit-trail",
      name: "Audit Trail",
      description: "Complete audit history and compliance status",
      icon: EyeIcon,
      requiresFinancial: false
    }
  ]

  const availableReports: Report[] = [
    {
      id: "1",
      title: "Monthly Asset Register - December 2024",
      type: "asset-register",
      description: "Complete asset listing with current values",
      generatedAt: "2024-12-01T10:00:00Z",
      generatedBy: "System Admin",
      size: "2.4 MB",
      status: "ready",
      downloadUrl: "/reports/asset-register-dec-2024.pdf"
    },
    {
      id: "2",
      title: "Depreciation Analysis Q4 2024",
      type: "depreciation",
      description: "Quarterly depreciation calculations and trends",
      generatedAt: "2024-11-30T15:30:00Z",
      generatedBy: "Finance Team",
      size: "1.8 MB",
      status: "ready",
      downloadUrl: "/reports/depreciation-q4-2024.pdf"
    },
    {
      id: "3",
      title: "IT Equipment Audit Report",
      type: "audit-trail",
      description: "Complete audit of IT assets across all locations",
      generatedAt: "2024-11-28T09:15:00Z",
      generatedBy: "Audit Team",
      size: "3.2 MB",
      status: "ready",
      downloadUrl: "/reports/it-audit-nov-2024.pdf"
    }
  ]

  const generateReport = async () => {
    if (!selectedReportType) {
      alert("Please select a report type")
      return
    }

    if (!permissions.canGenerateReports) {
      alert("You don't have permission to generate reports")
      return
    }

    const reportType = reportTypes.find(r => r.id === selectedReportType)
    if (reportType?.requiresFinancial && !permissions.canViewFinancials) {
      alert("You don't have permission to generate financial reports")
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert("Report generation started. You will be notified when it's ready.")
      setSelectedReportType("")
      setReportParams({
        dateRange: { start: "", end: "" },
        locations: [],
        departments: [],
        assetTypes: []
      })
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Error generating report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = (report: Report) => {
    // In production, this would trigger actual download
    alert(`Downloading: ${report.title}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Reports</h2>
        <p className="text-gray-600">
          Generate and download comprehensive inventory and asset reports
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("available")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "available"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Available Reports
          </button>
          {permissions.canGenerateReports && (
            <button
              onClick={() => setActiveTab("generate")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "generate"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Generate New Report
            </button>
          )}
        </nav>
      </div>

      {/* Available Reports */}
      {activeTab === "available" && (
        <div className="space-y-6">
          {availableReports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports available</h3>
              <p className="text-gray-600">Generate your first report to get started.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {availableReports.map((report) => {
                const reportType = reportTypes.find(rt => rt.id === report.type)
                const canView = !reportType?.requiresFinancial || permissions.canViewFinancials
                
                return (
                  <div 
                    key={report.id} 
                    className={`bg-white border rounded-lg p-6 ${!canView ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {reportType && (
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <reportType.icon className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {report.title}
                          </h3>
                          <p className="text-gray-600 mb-2">{report.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Generated: {formatDate(report.generatedAt)}</span>
                            <span>By: {report.generatedBy}</span>
                            <span>Size: {report.size}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === "ready" 
                            ? "bg-green-100 text-green-800"
                            : report.status === "generating"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {report.status === "ready" ? "Ready" : 
                           report.status === "generating" ? "Generating" : "Scheduled"}
                        </span>
                        
                        {canView && report.status === "ready" && (
                          <>
                            <button 
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Preview"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => downloadReport(report)}
                              className="p-2 text-blue-600 hover:text-blue-800"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        
                        {!canView && (
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Financial access required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Generate New Report */}
      {activeTab === "generate" && permissions.canGenerateReports && (
        <div className="max-w-2xl">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Generate New Report</h3>
            
            <div className="space-y-6">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Report Type *
                </label>
                <div className="grid gap-3">
                  {reportTypes.map((type) => {
                    const isDisabled = type.requiresFinancial && !permissions.canViewFinancials
                    
                    return (
                      <div 
                        key={type.id}
                        className={`relative border rounded-lg p-4 cursor-pointer ${
                          selectedReportType === type.id
                            ? "border-blue-500 bg-blue-50"
                            : isDisabled
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => !isDisabled && setSelectedReportType(type.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name="reportType"
                            value={type.id}
                            checked={selectedReportType === type.id}
                            onChange={(e) => setSelectedReportType(e.target.value)}
                            disabled={isDisabled}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <type.icon className={`h-5 w-5 mr-2 ${
                                isDisabled ? "text-gray-400" : "text-blue-600"
                              }`} />
                              <h4 className={`font-medium ${
                                isDisabled ? "text-gray-400" : "text-gray-900"
                              }`}>
                                {type.name}
                              </h4>
                              {type.requiresFinancial && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Financial
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${
                              isDisabled ? "text-gray-400" : "text-gray-600"
                            }`}>
                              {type.description}
                            </p>
                            {isDisabled && (
                              <p className="text-xs text-red-600 mt-1">
                                Financial permissions required
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Report Parameters */}
              {selectedReportType && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={reportParams.dateRange.start}
                        onChange={(e) => setReportParams(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Start date"
                      />
                      <input
                        type="date"
                        value={reportParams.dateRange.end}
                        onChange={(e) => setReportParams(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="End date"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locations (Optional)
                      </label>
                      <select 
                        multiple
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="head-office">Head Office</option>
                        <option value="branch-a">Branch A</option>
                        <option value="branch-b">Branch B</option>
                        <option value="warehouse">Warehouse</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departments (Optional)
                      </label>
                      <select 
                        multiple
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="finance">Finance</option>
                        <option value="it">IT</option>
                        <option value="hr">HR</option>
                        <option value="operations">Operations</option>
                        <option value="administration">Administration</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={generateReport}
                  disabled={loading || !selectedReportType}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!permissions.canGenerateReports && activeTab === "generate" && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">
            You don't have permission to generate reports. Contact your administrator.
          </p>
        </div>
      )}
    </div>
  )
}
