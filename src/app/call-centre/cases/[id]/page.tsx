'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from "@/components/layout/dashboard-layout"
import CaseHistory from "@/components/call-centre/CaseHistory"
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function CaseViewPage() {
  const router = useRouter()
  const params = useParams()
  const [caseData, setCaseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchCaseData = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        setError('')

        const response = await fetch(`/api/call-centre/cases/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch case data')
        }

        if (data.success && data.case) {
          setCaseData(data.case)
        } else {
          throw new Error('Case data not found')
        }
      } catch (err) {
        console.error('Error fetching case:', err)
        setError(err instanceof Error ? err.message : 'Failed to load case data')
      } finally {
        setLoading(false)
      }
    }

    fetchCaseData()
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

  if (error || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {error || 'Case Not Found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {error || 'The case could not be found.'}
          </p>
          <div className="mt-6">
            <Link
              href="/call-centre/case-management"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Cases
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full px-3 py-3">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-3">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                  <Link
                  href="/call-centre/case-management"
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </Link>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 truncate">Case: {caseData.caseNumber}</h1>
                  <p className="text-xs text-gray-600">View case details and information</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                ['RESOLVED', 'Resolved'].includes(caseData.status)
                  ? 'bg-emerald-100 text-emerald-800'
                  : ['CLOSED', 'Closed'].includes(caseData.status)
                  ? 'bg-gray-100 text-gray-800'
                  : ['OPEN', 'Open'].includes(caseData.status)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {caseData.status}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                ['High', 'HIGH'].includes(caseData.priority)
                  ? 'bg-red-100 text-red-800'
                  : ['Medium', 'MEDIUM'].includes(caseData.priority)
                  ? 'bg-yellow-100 text-yellow-800'
                  : caseData.priority
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {caseData.priority ? `${caseData.priority} Priority` : 'Priority not set'}
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 items-start">
          <div className="space-y-3">
            {/* Case Information */}
            <div className="bg-white rounded-lg shadow p-3">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Case Information</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                  <p className="text-gray-900">{caseData.caseNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                  <p className="text-gray-900">{caseData.caseType || caseData.purpose || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
                  <p className="text-gray-900">{caseData.assignedOfficer}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                  <p className="text-gray-900">
                    {caseData.followUpDate ? new Date(caseData.followUpDate).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow p-3">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Client Information</h2>
              
              <div className="grid grid-cols-2 gap-3">
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
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{caseData.clientAddress}</p>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-lg shadow p-3 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Case Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">{caseData.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actions Taken</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">{caseData.actionsTaken}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Action Required</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">{caseData.nextAction}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referrals</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">{caseData.referrals}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">{caseData.notes}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 min-w-0">
            <div className="bg-white rounded-lg shadow p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Case Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(caseData.createdDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{new Date(caseData.lastUpdated).toLocaleDateString()}</span>
                </div>
                {caseData.closedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {['RESOLVED', 'Resolved'].includes(caseData.status) ? 'Resolved:' : 'Closed:'}
                    </span>
                    <span className="font-medium">{new Date(caseData.closedDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Call Purpose:</span>
                  <span className="font-medium">{caseData.callPurpose}</span>
                </div>
              </div>
            </div>

            <CaseHistory caseId={params.id as string} />
          </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
