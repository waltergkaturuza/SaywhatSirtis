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
      fetchCaseData()
    }
  }, [params.id])

  const fetchCaseData = async () => {
    try {
      const response = await fetch(`/api/call-centre/calls?id=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCaseData(data)
      } else {
        console.error('Failed to fetch case data')
        setCaseData(null)
      }
    } catch (error) {
      console.error('Error fetching case data:', error)
      setCaseData(null)
    } finally {
      setLoading(false)
    }
  }

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
                  <h1 className="text-2xl font-bold text-gray-900">Case: {caseData.callNumber}</h1>
                  <p className="text-sm text-gray-600">View case details and information</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                caseData.callOutcome === 'Resolved' 
                  ? 'bg-green-100 text-green-800'
                  : caseData.callOutcome === 'Closed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {caseData.callOutcome || 'In Progress'}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                caseData.priority === 'HIGH' || caseData.priority === 'URGENT'
                  ? 'bg-red-100 text-red-800'
                  : caseData.priority === 'MEDIUM'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {caseData.priority || 'MEDIUM'} Priority
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call Number</label>
                  <p className="text-gray-900">{caseData.callNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{caseData.category || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
                  <p className="text-gray-900">{caseData.officerName || caseData.staffName || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                  <p className="text-gray-900">{caseData.followUpDate ? new Date(caseData.followUpDate).toLocaleDateString() : 'Not scheduled'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call Purpose</label>
                  <p className="text-gray-900">{caseData.purpose || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Communication Mode</label>
                  <p className="text-gray-900">{caseData.modeOfCommunication || 'Phone'}</p>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Client Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caller Name</label>
                  <p className="text-gray-900">{caseData.callerFullName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900">{caseData.callerPhoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{caseData.callerEmail || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                  <p className="text-gray-900">{caseData.callerAge || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <p className="text-gray-900">{caseData.callerGender || caseData.clientGender || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <p className="text-gray-900">{caseData.callerProvince || caseData.clientProvince || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <p className="text-gray-900">{caseData.district || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                  <p className="text-gray-900">{caseData.ward || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{caseData.callerAddress || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Case Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.issueDescription || caseData.description || 'No description provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.summary || 'No summary provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.resolution || 'Not yet resolved'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services Recommended</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.servicesRecommended || 'No services recommended'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referrals</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.referral || 'No referrals made'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.additionalNotes || 'No additional notes'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.followUpNotes || 'No follow-up notes'}</p>
                </div>

                {caseData.satisfactionRating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Satisfaction Rating</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 bg-gray-50 p-3 rounded-md">{caseData.satisfactionRating}/5</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-5 w-5 ${
                              star <= parseInt(caseData.satisfactionRating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
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
                  <span className="font-medium">{caseData.date ? new Date(caseData.date).toLocaleDateString() : 'Not available'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{caseData.time || 'Not available'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Call Type:</span>
                  <span className="font-medium">{caseData.newOrRepeatCall || 'New'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{caseData.language || 'English'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Population:</span>
                  <span className="font-medium">{caseData.callerKeyPopulation || 'N/A'}</span>
                </div>
                {caseData.voucherIssued === 'yes' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voucher:</span>
                    <span className="font-medium">{caseData.voucherValue || 'Issued'}</span>
                  </div>
                )}
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
