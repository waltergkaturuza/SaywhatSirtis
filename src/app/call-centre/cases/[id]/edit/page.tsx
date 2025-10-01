"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, ExclamationTriangleIcon, CheckCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

export default function EditCasePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const caseId = (params as any)?.id as string

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [caseData, setCaseData] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [saveError, setSaveError] = useState<string>('')

  // Referral dropdown state
  const [referralOrganizations, setReferralOrganizations] = useState<any[]>([])
  const [referralLoading, setReferralLoading] = useState(false)
  const [showOtherReferral, setShowOtherReferral] = useState(false)
  const [otherReferralText, setOtherReferralText] = useState('')
  // Helpers: normalize incoming values from API to UI options
  const normalizeStatus = (value: any): string => {
    const v = String(value || '').toLowerCase().replace(/[_-]/g, ' ').trim()
    if (!v) return ''
    if (['open'].includes(v)) return 'Open'
    if (['in progress', 'inprogress', 'progress'].includes(v)) return 'In Progress'
    if (['pending', 'on hold', 'onhold'].includes(v)) return 'Pending'
    if (['closed', 'resolved', 'done'].includes(v)) return 'Closed'
    return 'Open'
  }

  const normalizePriority = (value: any): string => {
    const v = String(value || '').toLowerCase().trim()
    if (!v) return ''
    if (v.includes('urgent')) return 'Urgent'
    if (v.includes('high')) return 'High'
    if (v.includes('medium') || v === 'med') return 'Medium'
    if (v.includes('low')) return 'Low'
    return 'Medium'
  }

  // Employees (Assigned Officer)
  const [officers, setOfficers] = useState<any[]>([])
  const [officersLoading, setOfficersLoading] = useState(false)
  const [officersError, setOfficersError] = useState<string>('')

  // Permissions
  const userPermissions = (session?.user as any)?.permissions || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || userPermissions.includes('programs.head') || userPermissions.includes('callcentre.officer') || userPermissions.includes('call_center_full') || userPermissions.includes('call_center_view') || userPermissions.includes('callcentre.view') || session?.user?.roles?.some(role => ['advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase()))

  // Load case data
  useEffect(() => {
    const loadCaseData = async () => {
      if (!caseId) return
      try {
        setIsLoading(true)
        setError('')
        const response = await fetch(`/api/call-centre/cases/${caseId}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Failed to fetch case data')
        if (data?.success && data?.case) {
          const c = data.case
          const defaults = {
            ...c,
            caseNumber: c.caseNumber || '',
            duration: c.duration || '',
            status: normalizeStatus(c.status) || 'Open',
            priority: normalizePriority(c.priority) || 'Medium',
            clientName: c.clientName || '',
            clientPhone: c.clientPhone || '',
            clientEmail: c.clientEmail || '',
            clientAge: c.clientAge || '',
            clientGender: c.clientGender || '',
            clientAddress: c.clientAddress || '',
            clientProvince: c.clientProvince || '',
            assignedOfficer: c.assignedOfficer || '',
            notes: c.notes || '',
            summary: c.summary || '',
            resolution: c.resolution || '',
            callDescription: c.callDescription || '',
            followUpDate: c.followUpDate ? String(c.followUpDate).split('T')[0] : '',
            caseType: c.caseType || '',
            description: c.description || '',
            actionsTaken: c.actionsTaken || '',
            nextAction: c.nextAction || '',
            referrals: c.referrals || '',
            outcome: c.outcome || '',
            changeReason: ''
          }
          setCaseData(defaults)
        } else {
          throw new Error('Case data not found')
        }
      } catch (err) {
        console.error('Error fetching case:', err)
        setError(err instanceof Error ? err.message : 'Failed to load case data')
      } finally {
        setIsLoading(false)
      }
    }
    loadCaseData()
  }, [caseId])

  // Reconcile referral "Other" state when either the case referrals or org list changes
  useEffect(() => {
    const ref = String(caseData?.referrals || '').trim()
    if (!ref) {
      setShowOtherReferral(false)
      setOtherReferralText('')
      return
    }
    const isKnown = referralOrganizations.some((org) => org.name === ref)
    if (!isKnown) {
      setShowOtherReferral(true)
      setOtherReferralText(ref)
    } else {
      setShowOtherReferral(false)
      setOtherReferralText('')
    }
  }, [caseData?.referrals, referralOrganizations])

  // Fetch referral orgs
  const fetchReferralOrganizations = useCallback(async () => {
    setReferralLoading(true)
    try {
      const response = await fetch('/api/call-centre/referrals')
      if (response.ok) {
        const data = await response.json()
        if (data?.success && Array.isArray(data.organizations)) {
          setReferralOrganizations(data.organizations)
        }
      } else {
        console.error('Failed to fetch referral organizations')
      }
    } catch (e) {
      console.error('Error fetching referral organizations:', e)
    } finally {
      setReferralLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) fetchReferralOrganizations()
  }, [session, fetchReferralOrganizations])

  // Fetch employees for Assigned Officer
  const fetchEmployees = useCallback(async () => {
    setOfficersLoading(true)
    setOfficersError('')
    try {
      const res = await fetch('/api/hr/employees')
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to load employees')
      }
      const list = Array.isArray(json.data) ? json.data : []
      setOfficers(list)
    } catch (e) {
      console.error('Error loading employees:', e)
      setOfficersError(e instanceof Error ? e.message : 'Unable to fetch employees')
    } finally {
      setOfficersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) fetchEmployees()
  }, [session, fetchEmployees])

  // Save helpers
  const handleSaveCase = async (updatedData: any) => {
    try {
      setIsSaving(true)
      setSaveError('')
      const response = await fetch(`/api/call-centre/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to save case')
      if (data?.success) {
        router.push('/call-centre/case-management')
      } else {
        throw new Error(data?.error || 'An unknown error occurred while saving.')
      }
    } catch (err) {
      console.error('Error saving case:', err)
      setSaveError(err instanceof Error ? err.message : 'Failed to save case')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setCaseData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleReferralChange = (value: string) => {
    if (value === 'OTHER') {
      setShowOtherReferral(true)
      setCaseData((prev: any) => ({ ...prev, referrals: '' }))
    } else {
      setShowOtherReferral(false)
      setOtherReferralText('')
      setCaseData((prev: any) => ({ ...prev, referrals: value }))
    }
  }

  const handleOtherReferralChange = (value: string) => {
    setOtherReferralText(value)
    setCaseData((prev: any) => ({ ...prev, referrals: value }))
  }

  const handleSave = async () => {
    if (!caseData) return
    if (!caseData.changeReason || !caseData.changeReason.trim()) {
      setSaveError('Please provide a reason for the changes in the summary section.')
      return
    }
    await handleSaveCase(caseData)
  }

  const handleClose = async () => {
    if (!caseData) return
    if (confirm('Are you sure you want to close this case?')) {
      const updatedData = {
        ...caseData,
        status: 'Closed',
        resolution: caseData.resolution || 'Case resolved successfully',
        outcome: 'Resolved'
      }
      await handleSaveCase(updatedData)
    }
  }

  // Access control
  if (!canAccessCallCentre) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">This module is restricted to Call Centre officers and Head of Programs only.</p>
        </div>
      </div>
    )
  }

  // Loading/Error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading case details...</p>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{error || 'Case Not Found'}</h3>
          <p className="mt-1 text-sm text-gray-500">{error || 'The case could not be found.'}</p>
          <div className="mt-6">
            <Link href="/call-centre/case-management" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Cases
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Render
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/call-centre/case-management" className="p-2 rounded-full hover:bg-orange-700/70 transition-colors">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Case</h1>
                <p className="text-orange-100/90 mt-1">Update case details and track progress.</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-2xl font-bold drop-shadow-sm">{caseData.caseNumber}</div>
                <div className="text-orange-100/90 text-sm">Case Number</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold drop-shadow-sm">{caseData.priority || 'N/A'}</div>
                <div className="text-orange-100/90 text-sm">Priority</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Main (2 cols) */}
          <div className="space-y-6 lg:col-span-2 lg:pr-6 lg:border-r lg:border-gray-200">
            {/* Case Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
                    <select value={caseData.status} onChange={(e) => handleInputChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Priority</label>
                    <select value={caseData.priority} onChange={(e) => handleInputChange('priority', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Case Type/Purpose</label>
                    <select value={caseData.caseType} onChange={(e) => handleInputChange('caseType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select purpose...</option>
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
                      <option value="Employment Support">Employment Support</option>
                      <option value="Skills Training">Skills Training</option>
                      <option value="Scholarship/Bursary">Scholarship/Bursary</option>
                      <option value="Business Development">Business Development</option>
                      <option value="HIV Counselling">HIV Counselling</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Assigned Officer</label>
                    <select
                      value={caseData.assignedOfficer}
                      onChange={(e) => handleInputChange('assignedOfficer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={officersLoading}
                    >
                      <option value="">{officersLoading ? 'Loading officers...' : 'Select an officer'}</option>
                      {/* Preserve legacy value if present but not in list */}
                      {caseData.assignedOfficer && !officers.some((o) => o.name === caseData.assignedOfficer) && (
                        <option value={caseData.assignedOfficer}>{caseData.assignedOfficer} (current)</option>
                      )}
                      {officers
                        .slice()
                        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                        .map((emp) => (
                          <option key={emp.id} value={emp.name}>{emp.name}</option>
                        ))}
                    </select>
                    {officersError && (
                      <p className="mt-1 text-xs text-red-600">{officersError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Call Duration</label>
                    <input type="text" value={caseData.duration} onChange={(e) => handleInputChange('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g., 15 mins" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Follow-up Date</label>
                    <input type="date" value={caseData.followUpDate} onChange={(e) => handleInputChange('followUpDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Client Name</label>
                    <input type="text" value={caseData.clientName} onChange={(e) => handleInputChange('clientName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Phone Number</label>
                    <input type="tel" value={caseData.clientPhone} onChange={(e) => handleInputChange('clientPhone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Age</label>
                    <input type="text" value={caseData.clientAge} onChange={(e) => handleInputChange('clientAge', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
                    <select value={caseData.clientGender} onChange={(e) => handleInputChange('clientGender', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Province</label>
                    <select value={caseData.clientProvince} onChange={(e) => handleInputChange('clientProvince', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
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
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Details</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                    <textarea
                      value={caseData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Describe the case details..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Actions Taken</label>
                    <textarea
                      value={caseData.actionsTaken}
                      onChange={(e) => handleInputChange('actionsTaken', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="What actions have been taken..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Next Action Required</label>
                    <textarea
                      value={caseData.nextAction}
                      onChange={(e) => handleInputChange('nextAction', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="What needs to be done next..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Referrals</label>
                    <select
                      value={showOtherReferral ? 'OTHER' : caseData.referrals}
                      onChange={(e) => handleReferralChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    {caseData.referrals && !showOtherReferral && referralOrganizations.find(org => org.name === caseData.referrals) && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-800">
                          <strong>{referralOrganizations.find(org => org.name === caseData.referrals)?.name}</strong>
                          {referralOrganizations.find(org => org.name === caseData.referrals)?.contact?.phone && (
                            <span className="block text-xs mt-1">
                              📞 {referralOrganizations.find(org => org.name === caseData.referrals)?.contact?.phone}
                            </span>
                          )}
                          {referralOrganizations.find(org => org.name === caseData.referrals)?.contact?.email && (
                            <span className="block text-xs">
                              📧 {referralOrganizations.find(org => org.name === caseData.referrals)?.contact?.email}
                            </span>
                          )}
                          {referralOrganizations.find(org => org.name === caseData.referrals)?.focusAreas && referralOrganizations.find(org => org.name === caseData.referrals)?.focusAreas.length > 0 && (
                                <span className="block text-xs mt-1">
                              🎯 Focus: {referralOrganizations.find(org => org.name === caseData.referrals)?.focusAreas.join(', ')}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {/* Manual referral input */}
                    {showOtherReferral && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={otherReferralText}
                          onChange={(e) => handleOtherReferralChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Specify other referral organization or service..."
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Notes</label>
                    <textarea
                      value={caseData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Additional notes..."
                    />
                  </div>

                  {caseData.status === 'Closed' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Resolution</label>
                        <textarea
                          value={caseData.resolution}
                          onChange={(e) => handleInputChange('resolution', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="How was the case resolved..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Outcome</label>
                        <textarea
                          value={caseData.outcome}
                          onChange={(e) => handleInputChange('outcome', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="What was the final outcome..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1 lg:pl-6 lg:bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:sticky lg:top-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary & Actions</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Case Summary</label>
                    <textarea value={caseData.summary} onChange={(e) => handleInputChange('summary', e.target.value)} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="A brief summary of the case..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Reason for Changes <span className="text-red-500">*</span></label>
                    <textarea value={caseData.changeReason} onChange={(e) => handleInputChange('changeReason', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g., Updated client contact info." />
                  </div>

                  {saveError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                      <strong>Error:</strong> {saveError}
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-sm">
                      <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    {caseData.status !== 'Closed' && (
                      <button onClick={handleClose} disabled={isSaving} className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-colors">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Close Case
                      </button>
                    )}
                    <Link href="/call-centre/case-management" className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors">
                      <ArrowLeftIcon className="h-5 w-5 mr-2" />
                      Back to Cases
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
