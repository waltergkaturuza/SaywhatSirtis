"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import ServiceProvidersPanel from "@/components/call-centre/service-providers-panel"
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

  // Auto-generated fields with new numbering format
  const currentDateTime = new Date()
  const currentYear = currentDateTime.getFullYear()
  const officerName = session?.user?.name || "Current Officer"
  
  // Generate call number in format 00001/2025 (up to 99999/year)
  const [callCounter, setCallCounter] = useState(1) // In real app, this would come from database
  const callNumber = `${String(callCounter).padStart(5, '0')}/${currentYear}`
  
  const [formData, setFormData] = useState({
    // Auto-generated fields
    officerName: officerName,
    date: currentDateTime.toISOString().split('T')[0],
    time: currentDateTime.toTimeString().split(' ')[0].slice(0, 5),
    callNumber: callNumber,
    caseNumber: callNumber, // Case number same as call number
    // Form fields
    callerPhoneNumber: '',
    modeOfCommunication: 'inbound',
    howDidYouHearAboutUs: '',
    callValidity: 'valid',
    newOrRepeatCall: 'new',
    language: 'English',
    // Caller's Details (person making the call)
    callerFullName: '',
    callerAge: '-14',
    callerKeyPopulation: 'N/A',
    callerProvince: '',
    callerCity: '',
    // Client's Details (person who needs help - may be different from caller)
    clientFullName: '',
    clientAge: '-14',
    clientKeyPopulation: 'N/A',
    clientProvince: '',
    clientCity: '',
    clientEmploymentStatus: 'unemployed',
    clientEducationLevel: 'primary',
    purpose: 'HIV/AIDS', // Updated options
    issueDescription: '',
    summary: '',
    // Additional Information section
    voucherIssued: 'no', // New voucher field
    voucherValue: '', // Value if voucher issued
    additionalNotes: '',
    // Follow-up information
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
    // Legacy fields to maintain compatibility
    callerGender: 'N/A',
    callerAddress: '',
    callDescription: '',
    isCase: 'NO',
    perpetrator: '',
    servicesRecommended: '',
    referral: '',
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
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-saywhat-orange" />
          <h3 className="mt-2 text-sm font-medium text-saywhat-dark">Access Restricted</h3>
          <p className="mt-1 text-sm text-saywhat-gray">
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
    
    try {
      // Prepare data for API call using correct field names
      const callData = {
        callerName: formData.callerFullName,
        callerPhone: formData.callerPhoneNumber,
        callerEmail: '', // Not captured in current form
        callType: formData.modeOfCommunication.toUpperCase(),
        priority: 'MEDIUM', // Default priority
        subject: formData.purpose || 'General Inquiry',
        description: formData.issueDescription || formData.summary,
        assignedTo: formData.officerName,
        // Store additional fields in notes
        notes: `Officer: ${formData.officerName}, Call Number: ${formData.callNumber}, 
Gender: ${formData.callerGender}, Province: ${formData.callerProvince}, 
Address: ${formData.callerAddress}, Key Population: ${formData.callerKeyPopulation}, 
Client: ${formData.clientFullName}, Client Age: ${formData.clientAge}, 
Communication: ${formData.modeOfCommunication}, Language: ${formData.language}, 
Validity: ${formData.callValidity}, Additional Notes: ${formData.additionalNotes}`
      }

      const response = await fetch('/api/call-centre/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callData),
      })

      if (!response.ok) {
        throw new Error('Failed to save call')
      }

      const savedCall = await response.json()
      
      alert(`Call entry saved successfully! Case number: ${savedCall.caseNumber}`)
      
      // Reset form to initial state
      const newCallCounter = callCounter + 1
      setCallCounter(newCallCounter)
      const newCallNumber = `${String(newCallCounter).padStart(5, '0')}/${currentYear}`
      
      setFormData({
        // Auto-generated fields
        officerName: officerName,
        date: currentDateTime.toISOString().split('T')[0],
        time: currentDateTime.toTimeString().split(' ')[0].slice(0, 5),
        callNumber: newCallNumber,
        caseNumber: newCallNumber,
        // Form fields
        callerPhoneNumber: '',
        modeOfCommunication: 'inbound',
        howDidYouHearAboutUs: '',
        callValidity: 'valid',
        newOrRepeatCall: 'new',
        language: 'English',
        // Caller's Details
        callerFullName: '',
        callerAge: '-14',
        callerKeyPopulation: 'N/A',
        callerProvince: '',
        callerCity: '',
        // Client's Details
        clientFullName: '',
        clientAge: '-14',
        clientKeyPopulation: 'N/A',
        clientProvince: '',
        clientCity: '',
        clientEmploymentStatus: 'unemployed',
        clientEducationLevel: 'primary',
        purpose: 'HIV/AIDS',
        issueDescription: '',
        summary: '',
        // Additional Information
        voucherIssued: 'no',
        voucherValue: '',
        additionalNotes: '',
        // Follow-up information
        followUpRequired: false,
        followUpDate: '',
        followUpNotes: '',
        // Legacy fields
        callerGender: 'N/A',
        callerAddress: '',
        callDescription: '',
        isCase: 'NO',
        perpetrator: '',
        servicesRecommended: '',
        referral: '',
        comment: ''
      })
      setCaseGenerated(false)
      setGeneratedCaseNumber('')
      
    } catch (error) {
      console.error('Error saving call:', error)
      alert('Error saving call. Please try again.')
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
        className="inline-flex items-center px-4 py-2 border border-saywhat-gray rounded-md shadow-sm text-sm font-medium text-saywhat-dark bg-white hover:bg-saywhat-light-grey"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Call Centre
      </Link>
      <button
        type="submit"
        form="call-entry-form"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 bg-saywhat-orange border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-saywhat-orange/90 disabled:opacity-50"
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
          <div className="bg-saywhat-orange/10 p-3 rounded border border-saywhat-orange/20">
            <div className="font-medium text-saywhat-orange">Call Number</div>
            <div className="text-saywhat-dark">{formData.callNumber}</div>
          </div>
          <div className="bg-saywhat-green/10 p-3 rounded border border-saywhat-green/20">
            <div className="font-medium text-saywhat-green">Officer</div>
            <div className="text-saywhat-dark">{formData.officerName}</div>
          </div>
          <div className="bg-saywhat-gray/10 p-3 rounded border border-saywhat-gray/20">
            <div className="font-medium text-saywhat-dark">Date & Time</div>
            <div className="text-saywhat-gray">{formData.date} {formData.time}</div>
          </div>
          {caseGenerated && (
            <div className="bg-saywhat-orange/20 p-3 rounded border border-saywhat-orange">
              <div className="font-medium text-saywhat-orange">Case Number</div>
              <div className="text-saywhat-dark">{generatedCaseNumber}</div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-saywhat-dark mb-4">Quick Tips</h3>
        <div className="space-y-2 text-sm text-saywhat-gray">
          <div>• Ensure all required fields are completed</div>
          <div>• Select "YES" for case if follow-up is needed</div>
          <div>• Use clear, professional language</div>
          <div>• Verify phone number accuracy</div>
          <div>• Document all referrals made</div>
        </div>
      </div>

      <ServiceProvidersPanel 
        onProviderSelect={(provider) => {
          console.log('Selected provider:', provider)
          // Could auto-fill referral information
        }}
      />
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
          <div className="bg-white rounded-lg border border-saywhat-light-grey p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6">Call Information (Auto-generated)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Officer Name
                </label>
                <input
                  type="text"
                  value={formData.officerName}
                  disabled
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md bg-saywhat-light-grey"
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
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md bg-saywhat-light-grey"
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
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md bg-saywhat-light-grey"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Call Number
                </label>
                <input
                  type="text"
                  value={formData.callNumber}
                  disabled
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md bg-saywhat-light-grey"
                />
              </div>
            </div>
          </div>

          {/* Caller's Details */}
          <div className="bg-white rounded-lg shadow-lg border border-saywhat-light-grey p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6">Caller's Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Caller's Phone Number <span className="text-saywhat-orange">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.callerPhoneNumber}
                  onChange={(e) => handleInputChange('callerPhoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="e.g., 0771234567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Mode of Communication <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.modeOfCommunication}
                  onChange={(e) => handleInputChange('modeOfCommunication', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
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
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="e.g., Radio, TV, Friend referral..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Call Validity <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.callValidity}
                  onChange={(e) => handleInputChange('callValidity', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  required
                >
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  New or Repeat Call <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.newOrRepeatCall}
                  onChange={(e) => handleInputChange('newOrRepeatCall', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  required
                >
                  <option value="new">New</option>
                  <option value="repeat">Repeat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Language <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
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
          <div className="bg-white rounded-lg border border-saywhat-light-grey p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6">Caller Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Caller's Full Name <span className="text-saywhat-orange">*</span>
                </label>
                <input
                  type="text"
                  value={formData.callerFullName}
                  onChange={(e) => handleInputChange('callerFullName', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Age Group <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.callerAge}
                  onChange={(e) => handleInputChange('callerAge', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
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
                  Key Population <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.callerKeyPopulation}
                  onChange={(e) => handleInputChange('callerKeyPopulation', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
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
                  Gender <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.callerGender}
                  onChange={(e) => handleInputChange('callerGender', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Province <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.callerProvince}
                  onChange={(e) => handleInputChange('callerProvince', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
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
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Call Details */}
          <div className="bg-white rounded-lg border border-saywhat-light-grey p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6">Call Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Call Description <span className="text-saywhat-orange">*</span>
                </label>
                <textarea
                  value={formData.callDescription}
                  onChange={(e) => handleInputChange('callDescription', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Describe the caller's inquiry or concern..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Purpose <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
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
                  Case <span className="text-saywhat-orange">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isCase"
                      value="YES"
                      checked={formData.isCase === 'YES'}
                      onChange={(e) => handleInputChange('isCase', e.target.value)}
                      className="h-4 w-4 text-saywhat-orange focus:ring-saywhat-orange border-saywhat-gray"
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
                      className="h-4 w-4 text-saywhat-orange focus:ring-saywhat-orange border-saywhat-gray"
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

          {/* Client's Details (Person who needs help - may be different from caller) */}
          <div className="bg-white rounded-lg shadow-lg border border-saywhat-light-grey p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6">Client's Details</h2>
            <p className="text-sm text-saywhat-gray mb-4">
              Information about the person who needs help (may be different from the caller)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Client's Full Name <span className="text-saywhat-orange">*</span>
                </label>
                <input
                  type="text"
                  value={formData.clientFullName}
                  onChange={(e) => handleInputChange('clientFullName', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Full name of person needing help"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Client's Age Group <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.clientAge}
                  onChange={(e) => handleInputChange('clientAge', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
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
                  Client's Key Population
                </label>
                <select
                  value={formData.clientKeyPopulation}
                  onChange={(e) => handleInputChange('clientKeyPopulation', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                >
                  <option value="Child">Child</option>
                  <option value="Young Person">Young Person</option>
                  <option value="Adult">Adult</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Client's Province
                </label>
                <select
                  value={formData.clientProvince}
                  onChange={(e) => handleInputChange('clientProvince', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                >
                  <option value="">Select Province</option>
                  <option value="Harare">Harare</option>
                  <option value="Bulawayo">Bulawayo</option>
                  <option value="Manicaland">Manicaland</option>
                  <option value="Mashonaland Central">Mashonaland Central</option>
                  <option value="Mashonaland East">Mashonaland East</option>
                  <option value="Mashonaland West">Mashonaland West</option>
                  <option value="Masvingo">Masvingo</option>
                  <option value="Matabeleland North">Matabeleland North</option>
                  <option value="Matabeleland South">Matabeleland South</option>
                  <option value="Midlands">Midlands</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Client's City/District
                </label>
                <input
                  type="text"
                  value={formData.clientCity}
                  onChange={(e) => handleInputChange('clientCity', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="City or district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Client's Employment Status
                </label>
                <select
                  value={formData.clientEmploymentStatus}
                  onChange={(e) => handleInputChange('clientEmploymentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                >
                  <option value="employed">Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Issue Description <span className="text-saywhat-orange">*</span>
                </label>
                <textarea
                  value={formData.issueDescription}
                  onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Detailed description of the client's issue or request"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Call Summary <span className="text-saywhat-orange">*</span>
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Brief summary of the call outcome and actions taken"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Information - Voucher System */}
          <div className="bg-white rounded-lg border border-saywhat-light-grey p-6">
            <h2 className="text-xl font-semibold text-saywhat-dark mb-6">Additional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voucher Information */}
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  SAYWHAT Voucher Issued <span className="text-saywhat-orange">*</span>
                </label>
                <select
                  value={formData.voucherIssued}
                  onChange={(e) => handleInputChange('voucherIssued', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  required
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              {/* Voucher Value - only show if voucher is issued */}
              {formData.voucherIssued === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-saywhat-dark mb-2">
                    Voucher Value (USD) <span className="text-saywhat-orange">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.voucherValue}
                    onChange={(e) => handleInputChange('voucherValue', e.target.value)}
                    className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                    placeholder="Enter voucher amount"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Services Recommended or Requested
                </label>
                <input
                  type="text"
                  value={formData.servicesRecommended}
                  onChange={(e) => handleInputChange('servicesRecommended', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Services provided or recommended"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Referral Organization
                </label>
                <input
                  type="text"
                  value={formData.referral}
                  onChange={(e) => handleInputChange('referral', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Referred to which organization/service"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Any additional information or special circumstances"
                />
              </div>
            </div>

            {/* Voucher Information Display */}
            {formData.voucherIssued === 'yes' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">Voucher Information</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  A voucher of <strong>${formData.voucherValue}</strong> has been issued to the client. 
                  Ensure proper documentation and follow-up procedures are completed.
                </p>
              </div>
            )}

            {formData.voucherIssued === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Voucher Value (USD)
                </label>
                <input
                  type="number"
                  value={formData.voucherValue}
                  onChange={(e) => handleInputChange('voucherValue', e.target.value)}
                  className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                  placeholder="Enter voucher value"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium text-saywhat-dark mb-2">
                Comment
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
                placeholder="Additional comments or notes..."
              />
            </div>
          </div>
        </form>

        {/* Form Completion Guidelines */}
        <div className="bg-saywhat-orange/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-saywhat-dark mb-3">Form Completion Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-saywhat-dark">
            <div>
              <h4 className="font-medium mb-2">Required Fields</h4>
              <ul className="space-y-1">
                <li>• Caller's phone number</li>
                <li>• Mode of communication</li>
                <li>• Call validity</li>
                <li>• Caller's full name</li>
                <li>• Client's full name</li>
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
                <li>• Distinguish between caller and client details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
