"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect, useCallback } from "react"
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
  const [nextNumbers, setNextNumbers] = useState({
    nextCallNumber: 'Loading...',
    nextCaseNumber: 'Loading...',
    loading: true
  })
  
  // Referral dropdown state
  const [referralOrganizations, setReferralOrganizations] = useState<any[]>([])
  const [referralLoading, setReferralLoading] = useState(false)
  const [showOtherReferral, setShowOtherReferral] = useState(false)
  const [otherReferralText, setOtherReferralText] = useState('')

  // Auto-generated fields
  const currentDateTime = new Date()
  const officerName = session?.user?.name || "Current Officer"
  
  const [formData, setFormData] = useState({
    // Auto-generated fields
    officerName: officerName,
    date: currentDateTime.toISOString().split('T')[0],
    time: currentDateTime.toTimeString().split(' ')[0].slice(0, 5),
    callNumber: '',
    caseNumber: '',
    // Form fields
    callerPhoneNumber: '',
    modeOfCommunication: 'inbound',
    howDidYouHearAboutUs: '',
    callValidity: 'valid',
    newOrRepeatCall: 'new',
    language: 'English',
    // Caller's Details (renamed from Communication Details)
    callerFullName: '',
    callerAge: '-14',
    callerKeyPopulation: 'N/A',
    callerGender: 'N/A',
    callerProvince: 'N/A',
    callerAddress: '',
    callDescription: '',
    purpose: 'HIV/AIDS',
    isCase: 'NO',
    perpetrator: '',
    servicesRecommended: '',
    referral: '',
    // Client's Details (the person who needs help)
    clientName: '',
    clientAge: '',
    clientSex: 'N/A',
    clientAddress: '',
    clientProvince: 'N/A',
    // Voucher Information (replaces Additional Information)
    voucherIssued: 'NO',
    voucherValue: '0',
    comment: ''
  })
  
  // Fetch next available numbers from the backend
  const fetchNextNumbers = useCallback(async () => {
    try {
      const response = await fetch('/api/call-centre/next-numbers')
      if (response.ok) {
        const data = await response.json()
        setNextNumbers({
          nextCallNumber: data.data.nextCallNumber,
          nextCaseNumber: data.data.nextCaseNumber,
          loading: false
        })
        
        // Update form data with the correct call number
        setFormData(prev => ({
          ...prev,
          callNumber: data.data.nextCallNumber
        }))
      } else {
        console.error('Failed to fetch next numbers')
        setNextNumbers(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('Error fetching next numbers:', error)
      setNextNumbers(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Fetch referral organizations
  const fetchReferralOrganizations = useCallback(async () => {
    setReferralLoading(true)
    try {
      const response = await fetch('/api/call-centre/referrals')
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.organizations)) {
          setReferralOrganizations(data.organizations)
        }
      } else {
        console.error('Failed to fetch referral organizations')
      }
    } catch (error) {
      console.error('Error fetching referral organizations:', error)
    } finally {
      setReferralLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchNextNumbers()
      fetchReferralOrganizations()
    }
  }, [session, fetchNextNumbers, fetchReferralOrganizations])
  
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
      // Use the API-fetched case number instead of random generation
      setGeneratedCaseNumber(nextNumbers.nextCaseNumber)
      setCaseGenerated(true)
    } else if (field === 'isCase' && value === 'NO') {
      setGeneratedCaseNumber('')
      setCaseGenerated(false)
    }
  }

  // Handle referral selection
  const handleReferralChange = (value: string) => {
    if (value === 'OTHER') {
      setShowOtherReferral(true)
      setFormData(prev => ({ ...prev, referral: '' }))
    } else {
      setShowOtherReferral(false)
      setOtherReferralText('')
      setFormData(prev => ({ ...prev, referral: value }))
    }
  }

  const handleOtherReferralChange = (value: string) => {
    setOtherReferralText(value)
    setFormData(prev => ({ ...prev, referral: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Validate required fields
      if (!formData.callerFullName?.trim()) {
        alert('Caller name is required')
        setIsSubmitting(false)
        return
      }

      // Prepare referral data properly
      let referralData = formData.referral
      if (typeof referralData === 'object' && referralData !== null) {
        // Convert object to string for database storage
        referralData = JSON.stringify(referralData)
      }

      // Check data size limits before submission
      const dataLimits = {
        callerFullName: 255,
        callerPhoneNumber: 50,
        clientName: 255,
        perpetrator: 255,
        servicesRecommended: 500,
        voucherValue: 50
      }

      for (const [field, limit] of Object.entries(dataLimits)) {
        const value = formData[field as keyof typeof formData]
        if (value && typeof value === 'string' && value.length > limit) {
          alert(`${field} exceeds maximum length of ${limit} characters. Please shorten the text.`)
          setIsSubmitting(false)
          return
        }
      }

      // Prepare form data, excluding auto-generated numbers (let backend generate them)
      const submissionData = {
        ...formData,
        referral: referralData, // Use processed referral data
        // Remove auto-generated fields so backend generates them properly
        callNumber: undefined, // Let backend generate systematic call number
        caseNumber: caseGenerated ? undefined : undefined, // Let backend generate systematic case number
        // Add case-specific data if it's a case
        ...(caseGenerated && { isCase: 'YES' })
      }

      console.log('Submitting call data:', submissionData)
      
      const response = await fetch('/api/call-centre/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      })

      // Handle non-JSON responses (like HTML error pages)
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        const htmlText = await response.text()
        console.error('Received HTML response instead of JSON:', htmlText)
        
        if (response.status === 502) {
          alert('Server temporarily unavailable (502 Error). Please try again in a moment.')
        } else {
          alert(`Server error (${response.status}). Please try again or contact support.`)
        }
        return
      }

      const result = await response.json()

      if (response.ok && result.success) {
        const actualCallNumber = result.call?.callNumber || 'Generated'
        const actualCaseNumber = result.call?.caseNumber || 'Generated'
        alert(`Call entry saved successfully! Call Number: ${actualCallNumber}${caseGenerated ? ` | Case Number: ${actualCaseNumber}` : ''}`)
        // Reset form or redirect as needed
        window.location.href = '/call-centre'
      } else {
        // Handle specific error codes
        if (result.code === 'RATE_LIMIT_EXCEEDED') {
          alert('Too many requests. Please wait a moment before trying again.')
        } else if (result.code === 'FIELD_TOO_LONG') {
          alert(`Data validation error: ${result.error}`)
        } else if (result.code === 'DB_CONNECTION_FAILED') {
          alert('Database connection issue. Please try again in a moment.')
        } else {
          alert(`Error saving call: ${result.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        alert('Server returned an invalid response. This may be a temporary issue. Please try again.')
      } else {
        alert('Error saving call entry. Please check your connection and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
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
        className="inline-flex items-center px-4 py-2 border border-saywhat-grey rounded-md shadow-sm text-sm font-medium text-saywhat-dark bg-white hover:bg-saywhat-light-grey transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Call Centre
      </Link>
      <button
        type="submit"
        form="call-entry-form"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 bg-saywhat-orange border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Saving...' : 'Save Call Entry'}
      </button>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-saywhat-dark mb-4">Call Information</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-saywhat-light-grey p-3 rounded border-l-4 border-l-saywhat-orange">
            <div className="font-medium text-saywhat-dark">Call Number</div>
            <div className="text-saywhat-grey">{formData.callNumber}</div>
          </div>
          <div className="bg-saywhat-light-grey p-3 rounded border-l-4 border-l-saywhat-green">
            <div className="font-medium text-saywhat-dark">Officer</div>
            <div className="text-saywhat-grey">{formData.officerName}</div>
          </div>
          <div className="bg-saywhat-light-grey p-3 rounded border-l-4 border-l-gray-600">
            <div className="font-medium text-saywhat-dark">Date & Time</div>
            <div className="text-saywhat-grey">{formData.date} {formData.time}</div>
          </div>
          {caseGenerated && (
            <div className="bg-saywhat-light-grey p-3 rounded border-l-4 border-l-saywhat-orange">
              <div className="font-medium text-saywhat-dark">Case Number</div>
              <div className="text-saywhat-grey">{generatedCaseNumber}</div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-saywhat-dark mb-4">Quick Tips</h3>
        <div className="space-y-2 text-sm text-saywhat-grey">
          <div>• Ensure all required fields are completed</div>
          <div>• Select "YES" for case if follow-up is needed</div>
          <div>• Use clear, professional language</div>
          <div>• Verify phone number accuracy</div>
          <div>• Document all referrals made</div>
        </div>
      </div>

      <div>
                <h3 className="text-lg font-semibold text-saywhat-dark mb-4">Service Providers Directory</h3>
        <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
          <div className="p-3 bg-saywhat-light-grey rounded-lg border">
            <div className="font-medium text-saywhat-dark">Zimbabwe AIDS Council (ZAC)</div>
            <div className="text-saywhat-grey">+263 4 252 505</div>
            <div className="text-xs text-gray-500">HIV/AIDS Support & Testing</div>
          </div>
          <div className="p-3 bg-saywhat-light-grey rounded-lg border">
            <div className="font-medium text-saywhat-dark">Musasa Project</div>
            <div className="text-saywhat-grey">+263 4 720 738</div>
            <div className="text-xs text-gray-500">GBV Support & Legal Aid</div>
          </div>
          <div className="p-3 bg-saywhat-light-grey rounded-lg border">
            <div className="font-medium text-saywhat-dark">Zimbabwe Women Lawyers Association</div>
            <div className="text-saywhat-grey">+263 4 792 632</div>
            <div className="text-xs text-gray-500">Legal Assistance</div>
          </div>
          <div className="p-3 bg-saywhat-light-grey rounded-lg border">
            <div className="font-medium text-saywhat-dark">Family AIDS Caring Trust (FACT)</div>
            <div className="text-saywhat-grey">+263 4 741 288</div>
            <div className="text-xs text-gray-500">HIV Counselling & Support</div>
          </div>
          <div className="p-3 bg-saywhat-light-grey rounded-lg border">
            <div className="font-medium text-saywhat-dark">Friendship Bench</div>
            <div className="text-saywhat-grey">+263 4 708 835</div>
            <div className="text-xs text-gray-500">Mental Health Support</div>
          </div>
          <div className="p-3 bg-saywhat-light-grey rounded-lg border">
            <div className="font-medium text-saywhat-dark">Childline Zimbabwe</div>
            <div className="text-saywhat-grey">116 (Toll Free)</div>
            <div className="text-xs text-gray-500">Child Protection Services</div>
          </div>
          <div className="p-3 bg-saywhat-light-grey rounded-lg border">
            <div className="font-medium text-saywhat-dark">Adult Rape Clinic</div>
            <div className="text-saywhat-grey">+263 4 791 378</div>
            <div className="text-xs text-gray-500">Sexual Assault Support</div>
          </div>
          <div className="p-3 bg-saywhat-light-grey rounded-lg border">
            <div className="font-medium text-saywhat-dark">Population Services International (PSI)</div>
            <div className="text-saywhat-grey">+263 4 369 660</div>
            <div className="text-xs text-gray-500">Reproductive Health Services</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="font-medium text-red-900">Emergency Services</div>
            <div className="text-red-700">Police: 999 | Medical: 994</div>
            <div className="text-xs text-red-600">24/7 Emergency Response</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> This directory contains over 50 service providers. 
            Contact your supervisor to add or update provider information.
          </p>
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
          <div className="bg-white rounded-lg border-l-4 border-l-saywhat-orange shadow-md p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6 flex items-center">
              <div className="w-3 h-3 bg-saywhat-orange rounded-full mr-3"></div>
              Call Information (Auto-generated)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Officer Name
                </label>
                <input
                  type="text"
                  value={formData.officerName}
                  disabled
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md bg-saywhat-light-grey text-saywhat-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  disabled
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md bg-saywhat-light-grey text-saywhat-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  disabled
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md bg-saywhat-light-grey text-saywhat-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Call Number
                </label>
                <input
                  type="text"
                  value={nextNumbers.loading ? 'Loading...' : formData.callNumber}
                  disabled
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md bg-saywhat-light-grey text-saywhat-dark"
                />
              </div>
            </div>
          </div>

          {/* Caller's Details */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-l-saywhat-green p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6 flex items-center">
              <div className="w-3 h-3 bg-saywhat-green rounded-full mr-3"></div>
              Caller's Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Caller's Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.callerPhoneNumber}
                  onChange={(e) => handleInputChange('callerPhoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  placeholder="e.g., 0771234567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Mode of Communication <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.modeOfCommunication}
                  onChange={(e) => handleInputChange('modeOfCommunication', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark bg-white"
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
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  How did you hear about us?
                </label>
                <input
                  type="text"
                  value={formData.howDidYouHearAboutUs}
                  onChange={(e) => handleInputChange('howDidYouHearAboutUs', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  placeholder="e.g., Radio, TV, Friend referral..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Call Validity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.callValidity}
                  onChange={(e) => handleInputChange('callValidity', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  required
                >
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  New or Repeat Call <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.newOrRepeatCall}
                  onChange={(e) => handleInputChange('newOrRepeatCall', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  required
                >
                  <option value="new">New</option>
                  <option value="repeat">Repeat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
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
          <div className="bg-white rounded-lg shadow-md border-l-4 border-l-saywhat-orange p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6 flex items-center">
              <div className="w-3 h-3 bg-saywhat-orange rounded-full mr-3"></div>
              Caller Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Caller's Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.callerFullName}
                  onChange={(e) => handleInputChange('callerFullName', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Age Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.callerAge}
                  onChange={(e) => handleInputChange('callerAge', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  required
                >
                  <option value="-14">Under 14</option>
                  <option value="15-19">15-19</option>
                  <option value="20-24">20-24</option>
                  <option value="25+">25+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Key Population <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.callerKeyPopulation}
                  onChange={(e) => handleInputChange('callerKeyPopulation', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  required
                >
                  <option value="Child">Child</option>
                  <option value="Young Person">Young Person</option>
                  <option value="Adult">Adult</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.callerGender}
                  onChange={(e) => handleInputChange('callerGender', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.callerProvince}
                  onChange={(e) => handleInputChange('callerProvince', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
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
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.callerAddress}
                  onChange={(e) => handleInputChange('callerAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Call Details */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-l-saywhat-green p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6 flex items-center">
              <div className="w-3 h-3 bg-saywhat-green rounded-full mr-3"></div>
              Call Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Call Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.callDescription}
                  onChange={(e) => handleInputChange('callDescription', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  placeholder="Describe the caller's inquiry or concern..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  required
                >
                  <option value="HIV/AIDS">HIV/AIDS</option>
                  <option value="Information and Counselling">Information and Counselling</option>
                  <option value="In-house Case">In-house Case</option>
                  <option value="Cancer Screening">Cancer Screening</option>
                  <option value="Child Protection">Child Protection</option>
                  <option value="Contraception">Contraception</option>
                  <option value="DSA">DSA</option>
                  <option value="Dropped Call">Dropped Call</option>
                  <option value="GBV">GBV</option>
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
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
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
          <div className="bg-white rounded-lg shadow-md border-l-4 border-l-gray-800 p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6 flex items-center">
              <div className="w-3 h-3 bg-gray-800 rounded-full mr-3"></div>
              Additional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Perpetrator (if applicable)
                </label>
                <input
                  type="text"
                  value={formData.perpetrator}
                  onChange={(e) => handleInputChange('perpetrator', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  placeholder="If relevant to the case"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Services Recommended or Requested
                </label>
                <input
                  type="text"
                  value={formData.servicesRecommended}
                  onChange={(e) => handleInputChange('servicesRecommended', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  placeholder="Services provided or recommended"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Referral
                </label>
                <select
                  value={showOtherReferral ? 'OTHER' : formData.referral}
                  onChange={(e) => handleReferralChange(e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                  disabled={referralLoading}
                >
                  <option value="">Select organization or service...</option>
                  {referralLoading ? (
                    <option value="">Loading organizations...</option>
                  ) : (
                    <>
                      {referralOrganizations.map((org) => (
                        <option key={org.id} value={org.name}>
                          {org.name} {org.category && `(${org.category})`}
                        </option>
                      ))}
                      <option value="OTHER">Other (specify below)</option>
                    </>
                  )}
                </select>
                
                {/* Show organization details when selected */}
                {formData.referral && !showOtherReferral && (
                  (() => {
                    const selectedOrg = referralOrganizations.find(org => org.name === formData.referral)
                    return selectedOrg ? (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>{selectedOrg.name}</strong>
                          {selectedOrg.contact?.phone && (
                            <span className="block text-xs mt-1">
                              📞 {selectedOrg.contact.phone}
                            </span>
                          )}
                          {selectedOrg.contact?.email && (
                            <span className="block text-xs">
                              📧 {selectedOrg.contact.email}
                            </span>
                          )}
                          {selectedOrg.focusAreas && selectedOrg.focusAreas.length > 0 && (
                            <span className="block text-xs mt-1">
                              🎯 Focus: {selectedOrg.focusAreas.join(', ')}
                            </span>
                          )}
                        </p>
                      </div>
                    ) : null
                  })()
                )}
                
                {/* Show text input when "Other" is selected */}
                {showOtherReferral && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={otherReferralText}
                      onChange={(e) => handleOtherReferralChange(e.target.value)}
                      className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                      placeholder="Please specify the organization or service..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Please provide the name of the organization or service you're referring to.
                    </p>
                  </div>
                )}
                
                {referralLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading referral organizations...</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Client's Details
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                      placeholder="Client Name"
                    />
                    <label className="text-xs text-gray-500 mt-1 block">Name</label>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.clientAge}
                      onChange={(e) => handleInputChange('clientAge', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                      placeholder="Age"
                    />
                    <label className="text-xs text-gray-500 mt-1 block">Age</label>
                  </div>
                  <div>
                    <select
                      value={formData.clientSex}
                      onChange={(e) => handleInputChange('clientSex', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    >
                      <option value="N/A">N/A</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <label className="text-xs text-gray-500 mt-1 block">Sex</label>
                  </div>
                </div>
              </div>

              {/* Voucher Information Section */}
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Voucher Issued
                </label>
                <select
                  value={formData.voucherIssued}
                  onChange={(e) => handleInputChange('voucherIssued', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

              {formData.voucherIssued === 'YES' && (
                <div>
                  <label className="block text-sm font-medium text-saywhat-dark mb-2">
                    Voucher Value (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.voucherValue || ''}
                    onChange={(e) => handleInputChange('voucherValue', e.target.value || '0')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    placeholder="Enter voucher value"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-saywhat-dark mb-2">
                Comment
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-saywhat-grey rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-saywhat-dark"
                placeholder="Additional comments or notes..."
              />
            </div>
          </div>
        </form>

        {/* Form Validation */}
        <div className="bg-saywhat-light-grey rounded-lg border-l-4 border-l-saywhat-orange p-6">
          <h3 className="text-lg font-semibold text-saywhat-dark mb-3 flex items-center">
            <div className="w-2 h-2 bg-saywhat-orange rounded-full mr-3"></div>
            Form Completion Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-saywhat-dark">
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
