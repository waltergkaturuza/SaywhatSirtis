"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CalendarIcon,
  BellIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  PaperClipIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline"

export default function LeaveApprovalsPage() {
  const { data: session } = useSession()
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState("")
  const [approvalComments, setApprovalComments] = useState("")

  const metadata = {
    title: "Leave Approvals",
    description: "Review and approve leave applications with document routing",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Leave Management", href: "/hr/leave" },
      { name: "Approvals" }
    ]
  }

  const actions = (
    <>
      <Link href="/hr/leave/calendar">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Leave Calendar
        </button>
      </Link>
      <Link href="/hr/leave">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Back to Leave Management
        </button>
      </Link>
    </>
  )

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const isHRStaff = userPermissions.includes('hr.full_access')
  const isSupervisor = userPermissions.includes('hr.supervisor')
  const canApproveLeaves = isHRStaff || isSupervisor

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Queue</h3>
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-red-800">5</div>
            <div className="text-sm text-red-600">Urgent Approvals</div>
            <div className="text-xs text-red-500">Requires immediate action</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-yellow-800">12</div>
            <div className="text-sm text-yellow-600">Pending Review</div>
            <div className="text-xs text-yellow-500">Standard priority</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-lg font-semibold text-blue-800">8</div>
            <div className="text-sm text-blue-600">Escalated</div>
            <div className="text-xs text-blue-500">Overdue applications</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Routing Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Avg. Approval Time:</span>
            <span className="text-gray-900 font-medium">2.3 days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Success Rate:</span>
            <span className="text-green-600 font-medium">94%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Rejection Rate:</span>
            <span className="text-red-600 font-medium">6%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Routing Rules</h3>
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-gray-50 rounded">
            <div className="font-medium">Standard Leave</div>
            <div className="text-xs text-gray-600">Employee → Supervisor → HR</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="font-medium">Emergency Leave</div>
            <div className="text-xs text-gray-600">Employee → Supervisor → HR (24h)</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="font-medium">Extended Leave</div>
            <div className="text-xs text-gray-600">Employee → Supervisor → HR → Director</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Bulk Approve
          </button>
          <button className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Send Reminders
          </button>
          <Link href="/hr/leave/policies" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Review Policies
          </Link>
        </div>
      </div>
    </div>
  )

  const pendingApplications = [
    {
      id: 1,
      employeeName: "John Doe",
      employeeId: "SW001",
      position: "Senior Program Officer",
      leaveType: "Annual Leave",
      startDate: "2024-02-15",
      endDate: "2024-02-20",
      duration: "5 days",
      reason: "Family vacation - attending sister's wedding",
      appliedDate: "2024-01-15",
      urgency: "normal",
      secretariat: "Operations",
      currentStage: "Supervisor Review",
      nextApprover: "Sarah Johnson",
      documents: [
        { name: "leave_application.pdf", size: "156 KB", type: "application/pdf" },
        { name: "wedding_invitation.jpg", size: "245 KB", type: "image/jpeg" }
      ],
      routingHistory: [
        { 
          stage: "Employee Submission", 
          date: "2024-01-15 09:00", 
          status: "completed", 
          person: "John Doe",
          action: "Submitted leave application",
          documents: ["leave_application.pdf", "wedding_invitation.jpg"]
        },
        { 
          stage: "Supervisor Review", 
          date: "2024-01-15 14:30", 
          status: "pending", 
          person: "Sarah Johnson",
          action: "Pending review and approval",
          sla: "2 days",
          timeRemaining: "18 hours"
        },
        { 
          stage: "HR Processing", 
          date: null, 
          status: "waiting", 
          person: "Jennifer Smith",
          action: "Final processing and documentation",
          dependencies: ["Supervisor approval"]
        }
      ],
      workHandover: "Tasks delegated to Mike Wilson. Project status meeting scheduled for handover.",
      managerNotes: "",
      hrNotes: "",
      recommendedAction: "approve",
      conflictAnalysis: {
        hasConflicts: false,
        conflictsWith: [],
        teamCoverage: "adequate"
      }
    },
    {
      id: 2,
      employeeName: "Emma Thompson",
      employeeId: "SW008",
      position: "Healthcare Analyst",
      leaveType: "Sick Leave",
      startDate: "2024-01-20",
      endDate: "2024-01-25",
      duration: "5 days",
      reason: "Medical procedure and recovery",
      appliedDate: "2024-01-17",
      urgency: "high",
      secretariat: "Healthcare",
      currentStage: "HR Review",
      nextApprover: "Jennifer Smith",
      documents: [
        { name: "medical_certificate.pdf", size: "189 KB", type: "application/pdf" },
        { name: "doctor_recommendation.pdf", size: "134 KB", type: "application/pdf" }
      ],
      routingHistory: [
        { 
          stage: "Employee Submission", 
          date: "2024-01-17 10:30", 
          status: "completed", 
          person: "Emma Thompson",
          action: "Submitted sick leave application",
          documents: ["medical_certificate.pdf"]
        },
        { 
          stage: "Supervisor Review", 
          date: "2024-01-17 15:45", 
          status: "approved", 
          person: "Dr. Amina Hassan",
          action: "Approved by supervisor",
          comments: "Medical documentation provided. Coverage arranged."
        },
        { 
          stage: "HR Processing", 
          date: "2024-01-18 09:00", 
          status: "pending", 
          person: "Jennifer Smith",
          action: "Final HR review and documentation",
          sla: "1 day",
          timeRemaining: "6 hours"
        }
      ],
      workHandover: "Critical patient reports handed over to Dr. Peters. All pending cases assigned.",
      managerNotes: "Employee has excellent track record. Medical leave well documented.",
      hrNotes: "Medical certificate verified. Sick leave balance sufficient.",
      recommendedAction: "approve",
      conflictAnalysis: {
        hasConflicts: false,
        conflictsWith: [],
        teamCoverage: "arranged"
      }
    },
    {
      id: 3,
      employeeName: "Michael Chen",
      employeeId: "SW012",
      position: "Finance Officer",
      leaveType: "Emergency Leave",
      startDate: "2024-01-19",
      endDate: "2024-01-22",
      duration: "3 days",
      reason: "Family emergency - father hospitalized",
      appliedDate: "2024-01-18",
      urgency: "urgent",
      secretariat: "Finance",
      currentStage: "Emergency Processing",
      nextApprover: "Jennifer Smith",
      documents: [
        { name: "hospital_admission.pdf", size: "298 KB", type: "application/pdf" },
        { name: "emergency_contact.pdf", size: "67 KB", type: "application/pdf" }
      ],
      routingHistory: [
        { 
          stage: "Emergency Submission", 
          date: "2024-01-18 22:30", 
          status: "completed", 
          person: "Michael Chen",
          action: "Emergency leave submitted",
          documents: ["hospital_admission.pdf"]
        },
        { 
          stage: "Auto-Approval", 
          date: "2024-01-18 22:31", 
          status: "completed", 
          person: "System",
          action: "Emergency leave auto-approved for 24 hours",
          comments: "Pending formal review"
        },
        { 
          stage: "Supervisor Notification", 
          date: "2024-01-19 07:00", 
          status: "notified", 
          person: "Jennifer Smith",
          action: "Supervisor notified of emergency leave"
        },
        { 
          stage: "HR Validation", 
          date: "2024-01-19 08:30", 
          status: "pending", 
          person: "Jennifer Smith",
          action: "Validating emergency documentation",
          sla: "immediate",
          timeRemaining: "overdue"
        }
      ],
      workHandover: "Month-end reports postponed. Critical payments handled by backup officer.",
      managerNotes: "Valid emergency. Employee is reliable and responsible.",
      hrNotes: "Hospital documentation provided. Emergency leave policy applies.",
      recommendedAction: "approve",
      conflictAnalysis: {
        hasConflicts: true,
        conflictsWith: ["Month-end closing"],
        teamCoverage: "temporary"
      }
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "approved": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "waiting": return "bg-gray-100 text-gray-800"
      case "notified": return "bg-blue-100 text-blue-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "text-red-600 bg-red-50"
      case "high": return "text-orange-600 bg-orange-50"
      case "normal": return "text-blue-600 bg-blue-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStageIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      case "waiting":
        return <ClockIcon className="h-5 w-5 text-gray-400" />
      case "notified":
        return <BellIcon className="h-5 w-5 text-blue-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const handleApprovalAction = (application: any, action: string) => {
    setSelectedApplication(application)
    setApprovalAction(action)
    setShowApprovalModal(true)
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Approval Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">5</h3>
                <p className="text-sm text-gray-500">Urgent Approvals</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">12</h3>
                <p className="text-sm text-gray-500">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowPathIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">8</h3>
                <p className="text-sm text-gray-500">In Routing</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">94%</h3>
                <p className="text-sm text-gray-500">Success Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="space-y-6">
          {pendingApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg border">
              <div className="p-6">
                {/* Application Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{application.employeeName}</h3>
                      <p className="text-sm text-gray-600">{application.position} • {application.employeeId}</p>
                      <p className="text-sm text-gray-500">{application.secretariat} Secretariat</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getUrgencyColor(application.urgency)}`}>
                      {application.urgency} priority
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Applied: {application.appliedDate}</p>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Leave Details</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-500">Type:</span> <span className="text-gray-900">{application.leaveType}</span></div>
                      <div><span className="text-gray-500">Duration:</span> <span className="text-gray-900">{application.duration}</span></div>
                      <div><span className="text-gray-500">Dates:</span> <span className="text-gray-900">{application.startDate} to {application.endDate}</span></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-500">Stage:</span> <span className="text-gray-900">{application.currentStage}</span></div>
                      <div><span className="text-gray-500">Next Approver:</span> <span className="text-gray-900">{application.nextApprover}</span></div>
                      <div><span className="text-gray-500">Recommended:</span> 
                        <span className={`ml-1 ${application.recommendedAction === 'approve' ? 'text-green-600' : 'text-red-600'}`}>
                          {application.recommendedAction}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                    <div className="space-y-1">
                      {application.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <PaperClipIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{doc.name}</span>
                          <span className="text-gray-400 ml-1">({doc.size})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reason and Handover */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Reason for Leave</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{application.reason}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Work Handover</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{application.workHandover}</p>
                  </div>
                </div>

                {/* Conflict Analysis */}
                {application.conflictAnalysis.hasConflicts && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Conflict Analysis</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">Scheduling Conflicts Detected</span>
                      </div>
                      <div className="text-sm text-yellow-700">
                        <div>Conflicts with: {application.conflictAnalysis.conflictsWith.join(", ")}</div>
                        <div>Team coverage: {application.conflictAnalysis.teamCoverage}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Routing Timeline */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Document Routing Progress</h4>
                  <div className="space-y-4">
                    {application.routingHistory.map((stage, idx) => (
                      <div key={idx} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStageIcon(stage.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">{stage.stage}</h5>
                              <p className="text-sm text-gray-600">{stage.person} • {stage.action}</p>
                              {stage.date && (
                                <p className="text-xs text-gray-500">{stage.date}</p>
                              )}
                              {(stage as any).comments && (
                                <p className="text-xs text-gray-600 mt-1 italic">"{(stage as any).comments}"</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stage.status)}`}>
                                {stage.status}
                              </span>
                              {stage.timeRemaining && (
                                <p className={`text-xs mt-1 ${stage.timeRemaining === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                  {stage.timeRemaining === 'overdue' ? 'OVERDUE' : `${stage.timeRemaining} remaining`}
                                </p>
                              )}
                            </div>
                          </div>
                          {stage.documents && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {stage.documents.map((doc, docIdx) => (
                                <span key={docIdx} className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  <PaperClipIcon className="h-3 w-3 mr-1" />
                                  {doc}
                                </span>
                              ))}
                            </div>
                          )}
                          {(stage as any).dependencies && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Waiting for: {(stage as any).dependencies.join(", ")}</span>
                            </div>
                          )}
                        </div>
                        {idx < application.routingHistory.length - 1 && (
                          <div className="flex-shrink-0">
                            <ArrowDownIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manager and HR Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {application.managerNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Manager Notes</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">{application.managerNotes}</p>
                    </div>
                  )}
                  
                  {application.hrNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">HR Notes</h4>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-200">{application.hrNotes}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {canApproveLeaves && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => handleApprovalAction(application, 'reject')}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                      Request Info
                    </button>
                    <button 
                      onClick={() => handleApprovalAction(application, 'approve')}
                      className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedApplication && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Application
                  </h3>
                  <button 
                    onClick={() => setShowApprovalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{selectedApplication.employeeName}</h4>
                    <p className="text-sm text-gray-600">{selectedApplication.leaveType} • {selectedApplication.duration}</p>
                    <p className="text-sm text-gray-500">{selectedApplication.startDate} to {selectedApplication.endDate}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {approvalAction === 'approve' ? 'Approval' : 'Rejection'} Comments
                  </label>
                  <textarea
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Please provide ${approvalAction === 'approve' ? 'approval notes' : 'reasons for rejection'}...`}
                  />
                </div>

                {approvalAction === 'approve' && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Next Steps</h4>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="ml-2 text-gray-700">Send approval notification to employee</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="ml-2 text-gray-700">Update leave calendar</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="ml-2 text-gray-700">Route to HR for final processing</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-gray-700">Notify team members of coverage arrangement</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                      approvalAction === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {approvalAction === 'approve' ? 'Approve Application' : 'Reject Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
