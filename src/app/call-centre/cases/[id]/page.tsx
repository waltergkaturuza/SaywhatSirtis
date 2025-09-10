'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from "@/components/layout/dashboard-layout"
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function CaseViewPage() {
  const router = useRouter()
  const params = useParams()
  const [caseData, setCaseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      setLoading(true)
      // Mock case data
      const mockData = {
        id: params.id,
        caseNumber: params.id,
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
        followUpDate: '2025-01-20'
      }
      setTimeout(() => {
        setCaseData(mockData)
        setLoading(false)
      }, 500)
    }
  }, [params.id])

  if (loading) {
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">Case Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The case could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
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
                  <h1 className="text-2xl font-bold text-gray-900">Case: {caseData.caseNumber}</h1>
                  <p className="text-sm text-gray-600">View case details and information</p>
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
              <Link
                href={`/call-centre/cases/${params.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Case
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Case Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                  <p className="text-gray-900">{caseData.caseNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                  <p className="text-gray-900">{caseData.caseType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
                  <p className="text-gray-900">{caseData.assignedOfficer}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                  <p className="text-gray-900">{new Date(caseData.followUpDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Client Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <p className="text-gray-900">{caseData.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900">{caseData.clientPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <p className="text-gray-900">{caseData.clientAge}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <p className="text-gray-900">{caseData.clientGender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <p className="text-gray-900">{caseData.clientProvince}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{caseData.clientAddress}</p>
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Case Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actions Taken</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.actionsTaken}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Action Required</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.nextAction}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referrals</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.referrals}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.notes}</p>
                </div>
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

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/call-centre/cases/${params.id}/edit`}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Case
                </Link>

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
    </DashboardLayout>
  )
}
