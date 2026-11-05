"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { hasAdminAccess } from "@/lib/admin-auth"

type Organisation = {
  id: string
  name: string
  description: string | null
  focusAreas: string[]
  categories: string[]
  address: string | null
  city: string | null
  province: string | null
  phones: string[]
  email: string | null
  website: string | null
  emails?: string[]
  websites?: string[]
  contactPersons?: ContactPersonForm[]
  isActive: boolean
  referralCount: number
  updatedAt: string
}

type ContactPersonForm = { name: string; role?: string; phone?: string; email?: string }
type ListField = "phones" | "emails" | "websites"

const PROVINCES = [
  "National", "Multiple", "Bulawayo", "Harare", "Manicaland", "Mashonaland Central", "Mashonaland East",
  "Mashonaland West", "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"
]

type FormState = {
  name: string
  description: string
  focusAreas: string
  categories: string
  address: string
  city: string
  province: string
  phones: string[]
  emails: string[]
  websites: string[]
  contactPersons: ContactPersonForm[]
  isActive: boolean
}

const emptyForm: FormState = {
  name: "",
  description: "",
  focusAreas: "",
  categories: "",
  address: "",
  city: "",
  province: "",
  phones: [""],
  emails: [""],
  websites: [""],
  contactPersons: [],
  isActive: true
}

const LIST_LABELS: Record<ListField, { title: string; add: string; placeholder: string; type: string }> = {
  phones: { title: "Phone numbers", add: "Add phone", placeholder: "+263 242 571 184", type: "tel" },
  emails: { title: "Emails", add: "Add email", placeholder: "info@organisation.org", type: "email" },
  websites: { title: "Websites", add: "Add website", placeholder: "www.organisation.org", type: "text" }
}

const inputClass = (invalid?: boolean) =>
  `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
    invalid ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
  }`

export default function ReferralOrganisationsPage() {
  const { data: session, status } = useSession()
  const canManage = hasAdminAccess(session) || Boolean(session?.user?.permissions?.includes("callcentre.admin"))

  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all")
  const [editing, setEditing] = useState<Organisation | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formMessage, setFormMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<Organisation | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    try {
      const response = await fetch("/api/call-centre/referral-organizations")
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Unable to load organisations")
      setOrganisations(result.organizations || [])
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load organisations")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated" && canManage) void load()
  }, [status, canManage, load])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return organisations.filter((org) => {
      if (statusFilter === "active" && !org.isActive) return false
      if (statusFilter === "hidden" && org.isActive) return false
      if (!query) return true
      return (
        org.name.toLowerCase().includes(query) ||
        (org.province || "").toLowerCase().includes(query) ||
        (org.city || "").toLowerCase().includes(query) ||
        org.categories.some((item) => item.toLowerCase().includes(query)) ||
        org.focusAreas.some((item) => item.toLowerCase().includes(query)) ||
        (org.contactPersons || []).some((person) => person.name.toLowerCase().includes(query))
      )
    })
  }, [organisations, search, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormMessage("")
    setFormOpen(true)
  }

  const openEdit = (org: Organisation) => {
    setEditing(org)
    setForm({
      name: org.name,
      description: org.description || "",
      focusAreas: org.focusAreas.join(", "),
      categories: org.categories.join(", "),
      address: org.address || "",
      city: org.city || "",
      province: org.province || "",
      phones: org.phones.length ? [...org.phones] : [""],
      emails: org.emails?.length ? [...org.emails] : org.email ? [org.email] : [""],
      websites: org.websites?.length ? [...org.websites] : org.website ? [org.website] : [""],
      contactPersons: (org.contactPersons || []).map((person) => ({
        name: person.name || "",
        role: person.role || "",
        phone: person.phone || "",
        email: person.email || ""
      })),
      isActive: org.isActive
    })
    setErrors({})
    setFormMessage("")
    setFormOpen(true)
  }

  const clearError = (key: string) => {
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    clearError(key as string)
  }

  const setListItem = (field: ListField, index: number, value: string) => {
    setForm((current) => ({ ...current, [field]: current[field].map((item, i) => (i === index ? value : item)) }))
    clearError(`${field}.${index}`)
  }

  const addListItem = (field: ListField) => {
    setForm((current) => ({ ...current, [field]: [...current[field], ""] }))
  }

  const removeListItem = (field: ListField, index: number) => {
    setForm((current) => {
      const next = current[field].filter((_, i) => i !== index)
      return { ...current, [field]: next.length ? next : [""] }
    })
    setErrors({})
  }

  const setPerson = (index: number, key: keyof ContactPersonForm, value: string) => {
    setForm((current) => ({
      ...current,
      contactPersons: current.contactPersons.map((person, i) => (i === index ? { ...person, [key]: value } : person))
    }))
    clearError(`contactPersons.${index}.${key}`)
  }

  const addPerson = () => {
    setForm((current) => ({ ...current, contactPersons: [...current.contactPersons, { name: "", role: "", phone: "", email: "" }] }))
  }

  const removePerson = (index: number) => {
    setForm((current) => ({ ...current, contactPersons: current.contactPersons.filter((_, i) => i !== index) }))
    setErrors({})
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormMessage("")
    if (!form.name.trim()) {
      setErrors({ name: "Enter the organisation name" })
      setFormMessage("Please correct the highlighted fields.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch(
        editing ? `/api/call-centre/referral-organizations/${editing.id}` : "/api/call-centre/referral-organizations",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      )
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setErrors(result.errors || {})
        setFormMessage(result.error || "Unable to save the organisation.")
        return
      }
      setFormOpen(false)
      setNotice(editing ? `${form.name} was updated.` : `${form.name} was added to the directory.`)
      await load()
    } catch {
      setFormMessage("Unable to save the organisation. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (org: Organisation) => {
    const response = await fetch(`/api/call-centre/referral-organizations/${org.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !org.isActive })
    })
    if (response.ok) {
      setNotice(org.isActive ? `${org.name} is now hidden from the directory.` : `${org.name} is shown in the directory again.`)
      await load()
    }
  }

  const remove = async (org: Organisation) => {
    const response = await fetch(`/api/call-centre/referral-organizations/${org.id}`, { method: "DELETE" })
    const result = await response.json().catch(() => ({}))
    setConfirmDelete(null)
    if (response.ok) {
      setNotice(result.message || `${org.name} was deleted.`)
      await load()
    } else {
      setNotice(result.error || "Unable to delete the organisation.")
    }
  }

  if (status === "authenticated" && !canManage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">Only administrators can manage referral organisations.</p>
        </div>
      </div>
    )
  }

  return (
    <ModulePage
      metadata={{
        title: "Manage Referral Organisations",
        description: "Add, update, hide, or remove SAYWHAT partner organisations",
        breadcrumbs: [
          { name: "Call Centre", href: "/call-centre" },
          { name: "Referral Directory", href: "/call-centre/referral-directory" },
          { name: "Manage Organisations" }
        ]
      }}
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add Organisation
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <div className="text-sm text-gray-500">
            {organisations.filter((org) => org.isActive).length} shown · {organisations.filter((org) => !org.isActive).length} hidden
          </div>
        </div>

        {notice && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              {notice}
            </span>
            <button type="button" onClick={() => setNotice("")} className="text-green-700 hover:text-green-900">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 md:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, province, or category"
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="all">All organisations</option>
            <option value="active">Shown in directory</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {loadError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>}

        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                {["Organisation", "Location", "Contact", "Categories", "Referrals", "Status", ""].map((heading) => (
                  <th key={heading || "actions"} className="max-w-0 px-3 py-2 text-left text-xs font-medium text-gray-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-gray-500">Loading organisations...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-gray-500">No organisations match.</td></tr>
              ) : (
                visible.map((org) => {
                  const location = [org.city, org.province].filter(Boolean).join(", ")
                  const emails = org.emails?.length ? org.emails : org.email ? [org.email] : []
                  const contact = org.phones[0] || emails[0] || ""
                  const extraContacts = org.phones.length + emails.length - (contact ? 1 : 0)
                  return (
                    <tr key={org.id} className={`hover:bg-orange-50 ${org.isActive ? "" : "opacity-60"}`}>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm font-medium text-gray-900" title={org.name}>{org.name}</div>
                        <div className="truncate text-xs text-gray-500" title={org.description || ""}>{org.description || ""}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm text-gray-700" title={location}>{location || "—"}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm text-gray-700" title={contact}>{contact || "—"}</div>
                        {extraContacts > 0 && <div className="truncate text-xs text-gray-500">+{extraContacts} more</div>}
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-xs text-gray-600" title={org.categories.join(", ")}>{org.categories.join(", ") || "—"}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2 text-sm text-gray-700">{org.referralCount}</td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <span className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium ${org.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {org.isActive ? "Shown" : "Hidden"}
                        </span>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => openEdit(org)} className="rounded p-1 text-gray-600 hover:bg-gray-100" title="Edit">
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => toggleActive(org)} className="rounded p-1 text-gray-600 hover:bg-gray-100" title={org.isActive ? "Hide from directory" : "Show in directory"}>
                            {org.isActive ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </button>
                          <button type="button" onClick={() => setConfirmDelete(org)} className="rounded p-1 text-red-600 hover:bg-red-50" title="Delete">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
          <form onSubmit={save} className="w-full max-w-2xl rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="organisation-form-title">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 id="organisation-form-title" className="text-lg font-semibold text-gray-900">{editing ? "Edit organisation" : "Add organisation"}</h2>
                <p className="text-sm text-gray-500">Details call-centre officers see in the Referral Directory.</p>
              </div>
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Organisation name *</label>
                <input value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass(Boolean(errors.name))} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setField("description", e.target.value)} className={inputClass()} placeholder="Focus areas – youth, reproductive health" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Focus areas</label>
                  <input value={form.focusAreas} onChange={(e) => setField("focusAreas", e.target.value)} className={inputClass()} placeholder="Youth, Reproductive Health" />
                  <p className="mt-1 text-xs text-gray-500">Separate with commas</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Categories</label>
                  <input value={form.categories} onChange={(e) => setField("categories", e.target.value)} className={inputClass()} placeholder="GBV Support, Education" />
                  <p className="mt-1 text-xs text-gray-500">Separate with commas</p>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Address</label>
                <input value={form.address} onChange={(e) => setField("address", e.target.value)} className={inputClass()} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">City</label>
                  <input value={form.city} onChange={(e) => setField("city", e.target.value)} className={inputClass()} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Province</label>
                  <select value={form.province} onChange={(e) => setField("province", e.target.value)} className={inputClass()}>
                    <option value="">Not specified</option>
                    {PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
                  </select>
                </div>
              </div>
              {(Object.keys(LIST_LABELS) as ListField[]).map((field) => (
                <div key={field} className="rounded-lg border border-gray-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">{LIST_LABELS[field].title}</span>
                    <button
                      type="button"
                      onClick={() => addListItem(field)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      {LIST_LABELS[field].add}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form[field].map((value, index) => (
                      <div key={`${field}-${index}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type={LIST_LABELS[field].type}
                            value={value}
                            onChange={(e) => setListItem(field, index, e.target.value)}
                            placeholder={LIST_LABELS[field].placeholder}
                            className={inputClass(Boolean(errors[`${field}.${index}`]))}
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem(field, index)}
                            className="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                            title="Remove"
                            aria-label={`Remove ${LIST_LABELS[field].title.toLowerCase()} ${index + 1}`}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        {errors[`${field}.${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`${field}.${index}`]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-gray-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Contact people (optional)</span>
                  <button
                    type="button"
                    onClick={addPerson}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Add contact person
                  </button>
                </div>
                {form.contactPersons.length === 0 ? (
                  <p className="text-xs text-gray-500">No contact people added.</p>
                ) : (
                  <div className="space-y-3">
                    {form.contactPersons.map((person, index) => (
                      <div key={`person-${index}`} className="rounded-lg bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Contact person {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removePerson(index)}
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                            title="Remove contact person"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {([
                            { key: "name", placeholder: "Full name *", type: "text" },
                            { key: "role", placeholder: "Role, e.g. Programme Officer", type: "text" },
                            { key: "phone", placeholder: "Phone", type: "tel" },
                            { key: "email", placeholder: "Email", type: "email" }
                          ] as const).map((item) => {
                            const errorKey = `contactPersons.${index}.${item.key}`
                            return (
                              <div key={item.key}>
                                <input
                                  type={item.type}
                                  value={person[item.key] || ""}
                                  onChange={(e) => setPerson(index, item.key, e.target.value)}
                                  placeholder={item.placeholder}
                                  className={inputClass(Boolean(errors[errorKey]))}
                                />
                                {errors[errorKey] && <p className="mt-1 text-xs text-red-600">{errors[errorKey]}</p>}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                Show in the Referral Directory
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-red-600">{formMessage}</p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60">
                  {saving ? "Saving..." : editing ? "Save changes" : "Add organisation"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true">
            <h2 className="text-lg font-semibold text-gray-900">Delete {confirmDelete.name}?</h2>
            <p className="mt-2 text-sm text-gray-600">
              {confirmDelete.referralCount > 0
                ? `This organisation has ${confirmDelete.referralCount} referral${confirmDelete.referralCount === 1 ? "" : "s"} on record, so it will be hidden from the directory and its referral history kept.`
                : "This removes the organisation from the directory permanently."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={() => remove(confirmDelete)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                {confirmDelete.referralCount > 0 ? "Hide organisation" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModulePage>
  )
}
