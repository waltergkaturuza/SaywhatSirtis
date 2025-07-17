"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  PhoneIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

export default function NewCallEntryPage() {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caseGenerated, setCaseGenerated] = useState(false)
  const [generatedCaseNumber, setGeneratedCaseNumber] = useState('')

  // Auto-generated fields
  const currentDateTime = new Date()
  const officerName = session?.user?.name || "Current Officer"
  const callNumber = `CC-${currentDateTime.getFullYear()}-${String(currentDateTime.getMonth() + 1).padStart(2, '0')}${String(currentDateTime.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`

  const [formData, setFormData] = useState({
    // Auto-generated fields
    officerName: officerName,
    date: currentDateTime.toISOString().split('T')[0],
    time: currentDateTime.toTimeString().split(' ')[0].slice(0, 5),
    callNumber: callNumber,
    // Form fields
    callerPhoneNumber: '',
    modeOfCommunication: 'inbound',
    howDidYouHearAboutUs: '',
    callValidity: 'valid',
    newOrRepeatCall: 'new',
    language: 'English',
    callerFullName: '',
    callerAge: '-14',
    keyPopulation: 'N/A',
    gender: 'N/A',
    province: 'N/A',
    address: '',
    callDescription: '',
    purpose: 'HIV Information & Counselling',
    isCase: 'NO',
    perpetrator: '',
    servicesRecommended: '',
    referral: '',
    clientName: '',
    clientAge: '',
    clientSex: 'N/A',
    comment: ''
  })
  
  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || 
                             userPermissions.includes('programs.head') ||
                             userPermissions.includes('callcentre.officer')

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

  // Update formData to match expected fields
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate case number if "YES" is selected for case
    if (field === 'isCase' && value === 'YES' && !caseGenerated) {
      const caseNumber = `CASE-${currentDateTime.getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`
      setGeneratedCaseNumber(caseNumber)
      setCaseGenerated(true)
    } else if (field === 'isCase' && value === 'NO') {
      setGeneratedCaseNumber('')
      setCaseGenerated(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert(`Call entry saved successfully! ${caseGenerated ? `Case number: ${generatedCaseNumber}` : ''}`)
    setIsSubmitting(false)
  }

  const metadata = {
    title: "New Call Entry",
    description: "Record new incoming or outgoing call with detailed information",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Call Centre", href: "/call-centre" },
      { name: "New Call Entry" }
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
      <button
        type="submit"
        form="call-entry-form"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Saving...' : 'Save Call Entry'}
      </button>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Information</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-900">Call Number</div>
            <div className="text-blue-700">{formData.callNumber}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-900">Officer</div>
            <div className="text-green-700">{formData.officerName}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="font-medium text-purple-900">Date & Time</div>
            <div className="text-purple-700">{formData.date} {formData.time}</div>
          </div>
          {caseGenerated && (
            <div className="bg-yellow-50 p-3 rounded">
              <div className="font-medium text-yellow-900">Case Number</div>
              <div className="text-yellow-700">{generatedCaseNumber}</div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div>• Ensure all required fields are completed</div>
          <div>• Select "YES" for case if follow-up is needed</div>
          <div>• Use clear, professional language</div>
          <div>• Verify phone number accuracy</div>
          <div>• Document all referrals made</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-red-50 rounded">
            <div className="font-medium text-red-900">Police Emergency</div>
            <div className="text-red-700">999</div>
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <div className="font-medium text-blue-900">Medical Emergency</div>
            <div className="text-blue-700">994</div>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <div className="font-medium text-purple-900">GBV Hotline</div>
            <div className="text-purple-700">080-8644</div>
          </div>
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
        <form id="call-entry-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-generated Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Call Information (Auto-generated)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Officer Name
                </label>
                <input
                  type="text"
                  value={formData.officerName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Number
                </label>
                <input
                  type="text"
                  value={formData.callNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Communication Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Communication Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caller's Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.callerPhoneNumber}
                  onChange={(e) => handleInputChange('callerPhoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 0771234567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode of Communication <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.modeOfCommunication}
                  onChange={(e) => handleInputChange('modeOfCommunication', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="walk">Walk-in</option>
                  <option value="text">Text/SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you hear about us?
                </label>
                <input
                  type="text"
                  value={formData.howDidYouHearAboutUs}
                  onChange={(e) => handleInputChange('howDidYouHearAboutUs', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Radio, TV, Friend referral..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Validity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.callValidity}
                  onChange={(e) => handleInputChange('callValidity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New or Repeat Call <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.newOrRepeatCall}
                  onChange={(e) => handleInputChange('newOrRepeatCall', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="new">New</option>
                  <option value="repeat">Repeat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="English">English</option>
                  <option value="Shona">Shona</option>
                  <option value="Ndebele">Ndebele</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Caller Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Caller Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caller's Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.callerFullName}
                  onChange={(e) => handleInputChange('callerFullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.callerAge}
                  onChange={(e) => handleInputChange('callerAge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="-14">Under 14</option>
                  <option value="15-19">15-19</option>
                  <option value="20-24">20-24</option>
                  <option value="25+">25+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Population <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.keyPopulation}
                  onChange={(e) => handleInputChange('keyPopulation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Child">Child</option>
                  <option value="Young Person">Young Person</option>
                  <option value="Adult">Adult</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
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
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Call Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Call Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.callDescription}
                  onChange={(e) => handleInputChange('callDescription', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the caller's inquiry or concern..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ARV Therapy">ARV Therapy</option>
                  <option value="Cancer Screening">Cancer Screening</option>
                  <option value="Child Protection">Child Protection</option>
                  <option value="Contraception">Contraception</option>
                  <option value="DSA">DSA</option>
                  <option value="Dropped Call">Dropped Call</option>
                  <option value="GBV">GBV</option>
                  <option value="HIV Information & Counselling">HIV Information & Counselling</option>
                  <option value="Legal Assistance">Legal Assistance</option>
                  <option value="Medical Assistance">Medical Assistance</option>
                  <option value="MHM">MHM</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Prank Call">Prank Call</option>
                  <option value="PrEP & PEP">PrEP & PEP</option>
                  <option value="Pre & Post Natal Care">Pre & Post Natal Care</option>
                  <option value="Relationship Issues">Relationship Issues</option>
                  <option value="Reproductive System Disorders">Reproductive System Disorders</option>
                  <option value="PAC">PAC</option>
                  <option value="STIs">STIs</option>
                  <option value="Sexual Harassment">Sexual Harassment</option>
                  <option value="TB">TB</option>
                  <option value="Test Call">Test Call</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isCase"
                      value="YES"
                      checked={formData.isCase === 'YES'}
                      onChange={(e) => handleInputChange('isCase', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm">YES</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isCase"
                      value="NO"
                      checked={formData.isCase === 'NO'}
                      onChange={(e) => handleInputChange('isCase', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm">NO</span>
                  </label>
                </div>
                {caseGenerated && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Case Number Generated:</strong> {generatedCaseNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perpetrator (if applicable)
                </label>
                <input
                  type="text"
                  value={formData.perpetrator}
                  onChange={(e) => handleInputChange('perpetrator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="If relevant to the case"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Recommended or Requested
                </label>
                <input
                  type="text"
                  value={formData.servicesRecommended}
                  onChange={(e) => handleInputChange('servicesRecommended', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Services provided or recommended"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral
                </label>
                <input
                  type="text"
                  value={formData.referral}
                  onChange={(e) => handleInputChange('referral', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Referred to which organization/service"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Information (Name/Age/Sex)
                </label>
                <input
                  type="text"
                  value={`${formData.clientName} / ${formData.clientAge} / ${formData.clientSex}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' / ')
                    handleInputChange('clientName', parts[0] || '')
                    handleInputChange('clientAge', parts[1] || '')
                    handleInputChange('clientSex', parts[2] || 'N/A')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Client Name / Age / Sex or N/A"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional comments or notes..."
              />
            </div>
          </div>
        </form>

        {/* Form Validation */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Form Completion Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Required Fields</h4>
              <ul className="space-y-1">
                <li>• Caller's phone number</li>
                <li>• Mode of communication</li>
                <li>• Call validity</li>
                <li>• Caller's full name</li>
                <li>• Age group and gender</li>
                <li>• Call description and purpose</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="space-y-1">
                <li>• Use clear, professional language</li>
                <li>• Verify all information with caller</li>
                <li>• Document all referrals made</li>
                <li>• Follow up on cases as needed</li>
                <li>• Maintain client confidentiality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
