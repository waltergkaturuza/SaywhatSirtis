"use client"

import { useEffect, useMemo, useState } from "react"
import { XMarkIcon, MagnifyingGlassIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

export type ReferralOrganizationOption = {
  id: string
  name: string
  province?: string
  city?: string
  categories: string[]
  contact: { phone: string[]; email?: string; address?: string }
}

type CreateReferralDialogProps = {
  open: boolean
  organizations: ReferralOrganizationOption[]
  onClose: () => void
  onCreated: (referral: { referralNumber: string; organizationName: string }) => void
}

const PROVINCES = [
  "Bulawayo", "Harare", "Manicaland", "Mashonaland Central", "Mashonaland East",
  "Mashonaland West", "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"
]

const emptyForm = {
  organizationId: "",
  caseNumber: "",
  clientName: "",
  clientPhone: "",
  clientAge: "",
  clientGender: "",
  clientProvince: "",
  reason: "",
  servicesRequested: "",
  urgency: "MEDIUM",
  followUpDate: "",
  notes: "",
  consentGiven: false
}

type FormState = typeof emptyForm

const inputClass = (invalid?: boolean) =>
  `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
    invalid ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
  }`

export function CreateReferralDialog({ open, organizations, onClose, onCreated }: CreateReferralDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [orgSearch, setOrgSearch] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [caseNote, setCaseNote] = useState("")

  useEffect(() => {
    if (!open) return
    setForm(emptyForm)
    setOrgSearch("")
    setErrors({})
    setMessage("")
    setCaseNote("")
  }, [open])

  const visibleOrganizations = useMemo(() => {
    const query = orgSearch.trim().toLowerCase()
    if (!query) return organizations
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(query) ||
      org.categories.some((category) => category.toLowerCase().includes(query)) ||
      (org.province || "").toLowerCase().includes(query)
    )
  }, [organizations, orgSearch])

  const selectedOrganization = organizations.find((org) => org.id === form.organizationId)

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key as string]) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
  }

  const lookUpCase = async () => {
    const caseNumber = form.caseNumber.trim()
    if (!caseNumber) {
      setErrors((current) => ({ ...current, caseNumber: "Enter a case number to look up" }))
      return
    }
    setLookingUp(true)
    setCaseNote("")
    try {
      const response = await fetch(`/api/call-centre/referral-records/case-lookup?caseNumber=${encodeURIComponent(caseNumber)}`)
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setErrors((current) => ({ ...current, caseNumber: result.error || "Case not found" }))
        return
      }
      const found = result.case
      setForm((current) => ({
        ...current,
        clientName: current.clientName || found.clientName,
        clientPhone: current.clientPhone || found.clientPhone,
        clientAge: current.clientAge || found.clientAge,
        clientGender: current.clientGender || found.clientGender,
        clientProvince: current.clientProvince || found.clientProvince,
        servicesRequested: current.servicesRequested || found.servicesRequested
      }))
      setCaseNote(found.subject ? `Linked to: ${found.subject}` : "Case details loaded")
    } finally {
      setLookingUp(false)
    }
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.organizationId) next.organizationId = "Choose the organisation to refer to"
    if (!form.clientName.trim()) next.clientName = "Enter the client name"
    if (!form.reason.trim()) next.reason = "Describe the reason for the referral"
    if (!form.consentGiven) next.consentGiven = "Confirm the client agreed to be referred"
    return next
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage("")
    const found = validate()
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setMessage("Please complete the highlighted fields.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch("/api/call-centre/referral-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setErrors(result.errors || {})
        setMessage(result.error || "Unable to save the referral.")
        return
      }
      onCreated(result.referral)
    } catch {
      setMessage("Unable to save the referral. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <form
        onSubmit={submit}
        className="w-full max-w-3xl rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-referral-title"
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 id="create-referral-title" className="text-lg font-semibold text-gray-900">Create Referral</h2>
            <p className="text-sm text-gray-500">Refer a client to a SAYWHAT partner organisation.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5">
          <section>
            <h3 className="text-sm font-semibold text-gray-900">1. Organisation</h3>
            <div className="relative mt-2">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Search by name, service, or province"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <select
              id="referral-organization"
              value={form.organizationId}
              onChange={(e) => setField("organizationId", e.target.value)}
              className={`${inputClass(Boolean(errors.organizationId))} mt-2`}
              size={Math.min(6, Math.max(3, visibleOrganizations.length))}
            >
              {visibleOrganizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}{org.province ? ` — ${org.province}` : ""}
                </option>
              ))}
            </select>
            {errors.organizationId && <p className="mt-1 text-xs text-red-600">{errors.organizationId}</p>}
            {selectedOrganization && (
              <div className="mt-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-gray-700">
                <span className="font-medium text-gray-900">{selectedOrganization.name}</span>
                {selectedOrganization.contact.phone[0] && <> · {selectedOrganization.contact.phone[0]}</>}
                {selectedOrganization.contact.email && <> · {selectedOrganization.contact.email}</>}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900">2. Client</h3>
            <div className="mt-2 flex gap-2">
              <input
                value={form.caseNumber}
                onChange={(e) => setField("caseNumber", e.target.value)}
                placeholder="Case number (optional)"
                className={inputClass(Boolean(errors.caseNumber))}
              />
              <button
                type="button"
                onClick={lookUpCase}
                disabled={lookingUp}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {lookingUp ? "Loading..." : "Load case"}
              </button>
            </div>
            {errors.caseNumber && <p className="mt-1 text-xs text-red-600">{errors.caseNumber}</p>}
            {caseNote && <p className="mt-1 text-xs text-green-700">{caseNote}</p>}

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Client name *</label>
                <input value={form.clientName} onChange={(e) => setField("clientName", e.target.value)} className={inputClass(Boolean(errors.clientName))} />
                {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
                <input value={form.clientPhone} onChange={(e) => setField("clientPhone", e.target.value)} className={inputClass()} placeholder="+263 ..." />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Age</label>
                <input value={form.clientAge} onChange={(e) => setField("clientAge", e.target.value)} className={inputClass()} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Gender</label>
                <select value={form.clientGender} onChange={(e) => setField("clientGender", e.target.value)} className={inputClass()}>
                  <option value="">Not specified</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">Province</label>
                <select value={form.clientProvince} onChange={(e) => setField("clientProvince", e.target.value)} className={inputClass()}>
                  <option value="">Not specified</option>
                  {PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900">3. Referral details</h3>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">Reason for referral *</label>
                <textarea rows={3} value={form.reason} onChange={(e) => setField("reason", e.target.value)} className={inputClass(Boolean(errors.reason))} placeholder="What support does the client need, and why this organisation?" />
                {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">Services requested</label>
                <input value={form.servicesRequested} onChange={(e) => setField("servicesRequested", e.target.value)} className={inputClass()} placeholder="e.g. Counselling, legal aid, SRH services" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Urgency</label>
                <select value={form.urgency} onChange={(e) => setField("urgency", e.target.value)} className={inputClass()}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Follow-up date</label>
                <input type="date" value={form.followUpDate} onChange={(e) => setField("followUpDate", e.target.value)} className={inputClass(Boolean(errors.followUpDate))} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setField("notes", e.target.value)} className={inputClass()} />
              </div>
            </div>
            <label className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${errors.consentGiven ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
              <input type="checkbox" checked={form.consentGiven} onChange={(e) => setField("consentGiven", e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
              <span className="text-gray-700">The client agreed to be referred and for their details to be shared with this organisation. *</span>
            </label>
            {errors.consentGiven && <p className="mt-1 text-xs text-red-600">{errors.consentGiven}</p>}
          </section>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-600">{message}</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60">
              <CheckCircleIcon className="h-4 w-4" />
              {saving ? "Saving..." : "Save referral"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
