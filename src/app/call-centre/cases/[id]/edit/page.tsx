"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'

export default function EditCasePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string

  // All useState hooks must be called before any conditional logic
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [caseData, setCaseData] = useState<any>(null)

  // Check user permissions after all hooks
  const userPermissions = session?.user?.permissions || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || 
                             userPermissions.includes('programs.head') ||
                             userPermissions.includes('callcentre.officer')

  // Simulate loading case data
  useEffect(() => {
    const loadCaseData = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock case data based on the case ID
      const mockCaseData = {
        id: caseId,
        caseNumber: caseId,
        status: 'Open',
        priority: 'Medium',
        createdDate: '2025-01-15',
        lastUpdated: '2025-01-16',
        assignedOfficer: 'Mary Chikuni',
        clientName: 'John Mukamuri',
        clientPhone: '0771234567',
        clientAge: '22',
        clientGender: 'Male',
        clientProvince: 'Harare',
        clientAddress: '123 Main Street, Harare',
        callPurpose: 'Youth Employment Inquiry',
        caseType: 'Employment Support',
        description: 'Client inquiring about youth employment opportunities and skills training programs. Requires follow-up on available positions.',
        actionsTaken: 'Provided initial information about youth employment programs. Scheduled follow-up call.',
        nextAction: 'Follow up with client regarding skills assessment and job placement opportunities.',
        referrals: 'Skills Development Team',
        notes: 'Client is enthusiastic about training opportunities. Has basic computer skills.',
        followUpDate: '2025-01-20',
        resolution: '',
        outcome: ''
      }
      
      setCaseData(mockCaseData)
      setIsLoading(false)
    }

    if (caseId) {
      loadCaseData()
    }
  }, [caseId])

  // Simulate loading case data
  useEffect(() => {
    const loadCaseData = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock case data based on the case ID
      const mockCaseData = {
        id: caseId,
        caseNumber: caseId,
        status: 'Open',
        priority: 'Medium',
        createdDate: '2025-01-15',
        lastUpdated: '2025-01-16',
        assignedOfficer: 'Mary Chikuni',
        clientName: 'John Mukamuri',
        clientPhone: '0771234567',
        clientAge: '22',
        clientGender: 'Male',
        clientProvince: 'Harare',
        clientAddress: '123 Main Street, Harare',
        callPurpose: 'Youth Employment Inquiry',
        caseType: 'Employment Support',
        description: 'Client inquiring about youth employment opportunities and skills training programs. Requires follow-up on available positions.',
        actionsTaken: 'Provided initial information about youth employment programs. Scheduled follow-up call.',
        nextAction: 'Follow up with client regarding skills assessment and job placement opportunities.',
        referrals: 'Skills Development Team',
        notes: 'Client is enthusiastic about training opportunities. Has basic computer skills.',
        followUpDate: '2025-01-20',
        resolution: '',
        outcome: ''
      }
      
      setCaseData(mockCaseData)
      setIsLoading(false)
    }

    if (caseId) {
      loadCaseData()
    }
  }, [caseId])

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

  const handleInputChange = (field: string, value: string) => {
    setCaseData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    alert('Case updated successfully!')
    setIsSaving(false)
  }

  const handleClose = async () => {
    if (confirm('Are you sure you want to close this case?')) {
      setIsSaving(true)
      
      // Update case status
      setCaseData((prev: any) => ({
        ...prev,
        status: 'Closed',
        resolution: 'Case resolved successfully',
        outcome: 'Client enrolled in youth employment program'
      }))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('Case closed successfully!')
      setIsSaving(false)
      router.push('/call-centre/case-management')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading case details...</p>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Case Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The case with ID "{caseId}" could not be found.
          </p>
          <Link
            href="/call-centre/case-management"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Case Management
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/call-centre/case-management"
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Case: {caseData.caseNumber}</h1>
                  <p className="text-sm text-gray-600">Update case details and track progress</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                caseData.status === 'Open' 
                  ? 'bg-green-100 text-green-800'
                  : caseData.status === 'Closed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {caseData.status}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                caseData.priority === 'High' 
                  ? 'bg-red-100 text-red-800'
                  : caseData.priority === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {caseData.priority} Priority
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Case Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Number
                  </label>
                  <input
                    type="text"
                    value={caseData.caseNumber}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={caseData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={caseData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Type
                  </label>
                  <select
                    value={caseData.caseType}
                    onChange={(e) => handleInputChange('caseType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Employment Support">Employment Support</option>
                    <option value="Skills Training">Skills Training</option>
                    <option value="Scholarship/Bursary">Scholarship/Bursary</option>
                    <option value="Business Development">Business Development</option>
                    <option value="HIV Counselling">HIV Counselling</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Officer
                  </label>
                  <select
                    value={caseData.assignedOfficer}
                    onChange={(e) => handleInputChange('assignedOfficer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mary Chikuni">Mary Chikuni</option>
                    <option value="David Nyathi">David Nyathi</option>
                    <option value="Alice Mandaza">Alice Mandaza</option>
                    <option value="Peter Masvingo">Peter Masvingo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={caseData.followUpDate}
                    onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Client Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={caseData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={caseData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="text"
                    value={caseData.clientAge}
                    onChange={(e) => handleInputChange('clientAge', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={caseData.clientGender}
                    onChange={(e) => handleInputChange('clientGender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    value={caseData.clientProvince}
                    onChange={(e) => handleInputChange('clientProvince', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Harare">Harare</option>
                    <option value="Bulawayo">Bulawayo</option>
                    <option value="Chitungwiza">Chitungwiza</option>
                    <option value="Gweru">Gweru</option>
                    <option value="Mutare">Mutare</option>
                    <option value="Masvingo">Masvingo</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={caseData.clientAddress}
                    onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Case Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={caseData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the case details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actions Taken
                  </label>
                  <textarea
                    value={caseData.actionsTaken}
                    onChange={(e) => handleInputChange('actionsTaken', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What actions have been taken..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Action Required
                  </label>
                  <textarea
                    value={caseData.nextAction}
                    onChange={(e) => handleInputChange('nextAction', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What needs to be done next..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referrals
                  </label>
                  <input
                    type="text"
                    value={caseData.referrals}
                    onChange={(e) => handleInputChange('referrals', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Referrals made..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={caseData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>

                {caseData.status === 'Closed' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution
                      </label>
                      <textarea
                        value={caseData.resolution}
                        onChange={(e) => handleInputChange('resolution', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="How was the case resolved..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outcome
                      </label>
                      <textarea
                        value={caseData.outcome}
                        onChange={(e) => handleInputChange('outcome', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What was the final outcome..."
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Case Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(caseData.createdDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{new Date(caseData.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Call Purpose:</span>
                  <span className="font-medium">{caseData.callPurpose}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>

                {caseData.status !== 'Closed' && (
                  <button
                    onClick={handleClose}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Close Case
                  </button>
                )}

                <Link
                  href="/call-centre/case-management"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Cases
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
