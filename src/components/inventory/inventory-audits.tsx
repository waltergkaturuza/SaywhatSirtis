"use client"

import { useState } from "react"
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline"
import type { InventoryPermissions, InventoryAudit, AuditFinding } from "@/types/inventory"

interface InventoryAuditsProps {
  permissions: InventoryPermissions
}

export function InventoryAudits({ permissions }: InventoryAuditsProps) {
  const [activeTab, setActiveTab] = useState("audits")
  const [selectedAudit, setSelectedAudit] = useState<InventoryAudit | null>(null)
  const [showNewAuditForm, setShowNewAuditForm] = useState(false)

  const audits: InventoryAudit[] = [
    {
      id: "1",
      title: "Q4 2024 Physical Asset Audit",
      auditDate: "2024-12-15",
      auditor: "External Audit Firm",
      type: "physical",
      status: "in-progress",
      location: "Head Office",
      scope: ["IT Equipment", "Office Furniture", "Vehicles"],
      findings: [
        {
          id: "f1",
          assetId: "IT-2024-0156",
          type: "missing",
          severity: "high",
          description: "Laptop assigned to John Doe cannot be located",
          recommendedAction: "Investigate location and update records",
          status: "open",
          assignedTo: "IT Manager",
          dueDate: "2024-12-20"
        },
        {
          id: "f2", 
          assetId: "OF-2024-0089",
          type: "damaged",
          severity: "medium",
          description: "Conference room chair showing significant wear",
          recommendedAction: "Schedule replacement or repair",
          status: "in-progress",
          assignedTo: "Facilities Manager"
        }
      ],
      recommendations: [
        "Implement monthly spot checks for high-value IT assets",
        "Improve asset tagging system with RFID technology",
        "Establish clear check-in/check-out procedures for mobile assets"
      ],
      completedAt: undefined
    },
    {
      id: "2",
      title: "Annual Financial Asset Valuation",
      auditDate: "2024-11-30", 
      auditor: "Internal Finance Team",
      type: "financial",
      status: "completed",
      location: "All Locations",
      scope: ["All Asset Categories"],
      findings: [
        {
          id: "f3",
          assetId: "VH-2024-0012",
          type: "discrepancy",
          severity: "low", 
          description: "Vehicle depreciation calculation variance of $2,500",
          recommendedAction: "Review depreciation methodology",
          status: "resolved",
          assignedTo: "Finance Manager"
        }
      ],
      recommendations: [
        "Update asset depreciation rates based on current market conditions",
        "Implement quarterly mini-audits for high-value assets"
      ],
      completedAt: "2024-12-01T16:00:00Z"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800"
      case "in-progress": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-green-100 text-green-800"
      case "reviewed": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getFindingStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800"
      case "in-progress": return "bg-yellow-100 text-yellow-800"
      case "resolved": return "bg-green-100 text-green-800"
      case "closed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Audits</h2>
          <p className="text-gray-600">
            Track audit activities, findings, and compliance status
          </p>
        </div>
        
        {permissions.canAudit && (
          <button
            onClick={() => setShowNewAuditForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Schedule Audit
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("audits")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "audits"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Audit List
          </button>
          <button
            onClick={() => setActiveTab("findings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "findings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Findings
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "compliance"
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Compliance Overview
          </button>
        </nav>
      </div>

      {/* Audit List */}
      {activeTab === "audits" && (
        <div className="space-y-6">
          {audits.map((audit) => (
            <div key={audit.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {audit.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(audit.auditDate)}
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {audit.auditor}
                      </div>
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        {audit.location}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(audit.status)}`}>
                        {audit.status.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {audit.type} audit
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {audit.findings.length > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {audit.findings.length} finding{audit.findings.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {audit.findings.filter(f => f.status === 'open').length} open
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedAudit(audit)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Audit Scope */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Audit Scope:</h4>
                <div className="flex flex-wrap gap-2">
                  {audit.scope.map((item, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Findings Summary */}
              {audit.findings.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Findings:</h4>
                  <div className="space-y-2">
                    {audit.findings.slice(0, 2).map((finding) => (
                      <div key={finding.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className="text-gray-900">{finding.description}</span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFindingStatusColor(finding.status)}`}>
                          {finding.status}
                        </span>
                      </div>
                    ))}
                    {audit.findings.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{audit.findings.length - 2} more finding{audit.findings.length - 2 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Findings */}
      {activeTab === "findings" && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Audit Findings</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset & Finding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {audits.flatMap(audit => audit.findings).map((finding) => (
                  <tr key={finding.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{finding.assetId}</div>
                      <div className="text-sm text-gray-500">{finding.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-900 capitalize">{finding.type}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {finding.assignedTo || "Unassigned"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFindingStatusColor(finding.status)}`}>
                        {finding.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {finding.dueDate ? formatDate(finding.dueDate) : "No due date"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compliance Overview */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          {/* Compliance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">87.5%</div>
                  <div className="text-sm text-green-700">Compliance Score</div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-blue-700">Audits Completed</div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">5</div>
                  <div className="text-sm text-yellow-700">Pending Findings</div>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <div className="text-sm text-red-700">Overdue Actions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Timeline */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Annual Financial Audit</div>
                  <div className="text-sm text-gray-500">Completed Nov 30, 2024</div>
                </div>
                <span className="text-sm text-green-600 font-medium">Completed</span>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Q4 Physical Asset Audit</div>
                  <div className="text-sm text-gray-500">In progress - Due Dec 15, 2024</div>
                </div>
                <span className="text-sm text-yellow-600 font-medium">In Progress</span>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">IT Security Compliance Audit</div>
                  <div className="text-sm text-gray-500">Scheduled for Jan 15, 2025</div>
                </div>
                <span className="text-sm text-blue-600 font-medium">Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{selectedAudit.title}</h3>
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Audit Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Audit Date:</span>
                  <p className="text-sm text-gray-900">{formatDate(selectedAudit.auditDate)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Auditor:</span>
                  <p className="text-sm text-gray-900">{selectedAudit.auditor}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Type:</span>
                  <p className="text-sm text-gray-900 capitalize">{selectedAudit.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAudit.status)}`}>
                    {selectedAudit.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Findings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Findings</h4>
                <div className="space-y-3">
                  {selectedAudit.findings.map((finding) => (
                    <div key={finding.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{finding.assetId}</span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFindingStatusColor(finding.status)}`}>
                          {finding.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{finding.description}</p>
                      <p className="text-sm text-blue-600 mb-2">
                        <strong>Recommended Action:</strong> {finding.recommendedAction}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Assigned to: {finding.assignedTo}</span>
                        {finding.dueDate && <span>Due: {formatDate(finding.dueDate)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {selectedAudit.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
