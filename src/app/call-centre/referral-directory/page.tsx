"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TagIcon,
  BuildingOfficeIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  PlusIcon,
  CheckCircleIcon,
  UserIcon,
  EyeIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { CreateReferralDialog } from "@/components/call-centre/create-referral-dialog"
import { hasAdminAccess } from "@/lib/admin-auth"

type ReferralOrganization = {
  id: string
  name: string
  description: string
  focusAreas: string[]
  categories: string[]
  contact: {
    address?: string
    phone: string[]
    email?: string
    website?: string
    emails?: string[]
    websites?: string[]
    people?: { name: string; role?: string; phone?: string; email?: string }[]
  }
  province?: string
  city?: string
}

type ReferralRecord = {
  id: string
  referralNumber: string
  organizationName: string
  organizationPhone?: string | null
  organizationEmail?: string | null
  source?: string
  caseNumber: string | null
  caseId?: string | null
  isCase?: boolean
  assignedOfficer?: string | null
  caseUpdatedAt?: string | null
  clientName: string
  clientPhone?: string | null
  clientAge?: string | null
  clientGender?: string | null
  clientProvince?: string | null
  reason?: string
  servicesRequested?: string | null
  notes?: string | null
  consentGiven?: boolean
  urgency: string
  status: string
  followUpDate: string | null
  createdByName: string | null
  createdAt: string
}

const statusStyle: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  ESCALATED: "bg-red-100 text-red-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-gray-100 text-gray-500"
}

const statusLabel = (value: string) => value.replace(/_/g, " ").toLowerCase()

const emailsOf = (org: ReferralOrganization) =>
  org.contact.emails?.length ? org.contact.emails : org.contact.email ? [org.contact.email] : []

const websitesOf = (org: ReferralOrganization) =>
  org.contact.websites?.length ? org.contact.websites : org.contact.website ? [org.contact.website] : []

const urgencyStyle: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800"
}

export default function ReferralDirectoryPage() {
  const { data: session, status } = useSession()

  const [organizations, setOrganizations] = useState<ReferralOrganization[]>([])
  const [referrals, setReferrals] = useState<ReferralRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [view, setView] = useState<"organizations" | "referrals">("organizations")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProvince, setSelectedProvince] = useState("all")
  const [referralSearch, setReferralSearch] = useState("")
  const [referralStatus, setReferralStatus] = useState("all")
  const [referralUrgency, setReferralUrgency] = useState("all")
  const [referralSource, setReferralSource] = useState("all")
  const [referralOrganization, setReferralOrganization] = useState("all")
  const [referralFrom, setReferralFrom] = useState("")
  const [referralTo, setReferralTo] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notice, setNotice] = useState("")
  const [viewing, setViewing] = useState<ReferralRecord | null>(null)

  const canAccess = Boolean(session?.user?.permissions?.includes("callcentre.access"))
  const canManage = hasAdminAccess(session) || Boolean(session?.user?.permissions?.includes("callcentre.admin"))

  const loadReferrals = useCallback(async () => {
    const response = await fetch("/api/call-centre/referral-records")
    if (response.ok) {
      const result = await response.json()
      setReferrals(result.referrals || [])
    }
  }, [])

  useEffect(() => {
    if (status !== "authenticated" || !canAccess) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLoadError("")
      try {
        const response = await fetch("/api/call-centre/referrals")
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || "Unable to load the referral directory")
        if (!cancelled) setOrganizations(result.fullData || [])
        await loadReferrals()
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Unable to load the referral directory")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [status, canAccess, loadReferrals])

  const categories = useMemo(
    () => [...new Set(organizations.flatMap((org) => org.categories))].sort(),
    [organizations]
  )
  const provinces = useMemo(
    () => [...new Set(organizations.map((org) => org.province).filter(Boolean) as string[])].sort(),
    [organizations]
  )

  const filteredOrganizations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return organizations.filter((org) => {
      if (
        query &&
        !(
          org.name.toLowerCase().includes(query) ||
          org.description.toLowerCase().includes(query) ||
          org.focusAreas.some((area) => area.toLowerCase().includes(query)) ||
          org.categories.some((category) => category.toLowerCase().includes(query))
        )
      ) {
        return false
      }
      if (selectedCategory !== "all" && !org.categories.some((category) => category.toLowerCase().includes(selectedCategory.toLowerCase()))) {
        return false
      }
      if (selectedProvince !== "all" && org.province?.toLowerCase() !== selectedProvince.toLowerCase()) {
        return false
      }
      return true
    })
  }, [organizations, searchQuery, selectedCategory, selectedProvince])

  const referralStatuses = useMemo(() => [...new Set(referrals.map((item) => item.status))].sort(), [referrals])
  const referralOrganizations = useMemo(
    () => [...new Set(referrals.map((item) => item.organizationName).filter(Boolean))].sort(),
    [referrals]
  )

  const filteredReferrals = useMemo(() => {
    const query = referralSearch.trim().toLowerCase()
    const from = referralFrom ? new Date(`${referralFrom}T00:00:00`) : null
    const to = referralTo ? new Date(`${referralTo}T23:59:59.999`) : null
    return referrals.filter((item) => {
      if (
        query &&
        ![item.referralNumber, item.clientName, item.caseNumber, item.organizationName, item.createdByName]
          .some((value) => String(value || "").toLowerCase().includes(query))
      ) {
        return false
      }
      if (referralStatus !== "all" && item.status !== referralStatus) return false
      if (referralUrgency !== "all" && item.urgency !== referralUrgency) return false
      if (referralSource !== "all" && (item.source === "CALL" ? "CALL" : "MANUAL") !== referralSource) return false
      if (referralOrganization !== "all" && item.organizationName !== referralOrganization) return false
      const created = new Date(item.createdAt)
      if (from && created < from) return false
      if (to && created > to) return false
      return true
    })
  }, [referrals, referralSearch, referralStatus, referralUrgency, referralSource, referralOrganization, referralFrom, referralTo])

  const referralFiltersActive =
    Boolean(referralSearch || referralFrom || referralTo) ||
    [referralStatus, referralUrgency, referralSource, referralOrganization].some((value) => value !== "all")
  const organizationFiltersActive = Boolean(searchQuery) || selectedCategory !== "all" || selectedProvince !== "all"

  const clearReferralFilters = () => {
    setReferralSearch("")
    setReferralStatus("all")
    setReferralUrgency("all")
    setReferralSource("all")
    setReferralOrganization("all")
    setReferralFrom("")
    setReferralTo("")
  }

  const clearOrganizationFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedProvince("all")
  }

  const filterControl =
    "h-9 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
  }

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/\s/g, "").replace(/(\+263)(\d{1})(\d{2})(\d{3})(\d{3})/, "$1 $2$3 $4 $5")
  }

  const handleCreated = (referral: { referralNumber: string; organizationName: string }) => {
    setDialogOpen(false)
    setNotice(`Referral ${referral.referralNumber} to ${referral.organizationName} was saved.`)
    setView("referrals")
    void loadReferrals()
  }

  if (status === "authenticated" && !canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            This module is restricted to Call Centre officers and Head of Programs only.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ModulePage
      metadata={{
        title: "Referral Directory",
        description: "SAYWHAT Partner Organizations for specialized support and referrals",
        breadcrumbs: [
          { name: "Call Centre", href: "/call-centre" },
          { name: "Referral Directory" }
        ]
      }}
      actions={
        <div className="flex items-center gap-2">
          {canManage && (
            <Link
              href="/call-centre/referral-directory/organisations"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <BuildingOfficeIcon className="h-4 w-4" />
              Manage Organisations
            </Link>
          )}
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            disabled={organizations.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            <PlusIcon className="h-4 w-4" />
            Create Referral
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200">
          <div className="flex shrink-0 gap-2">
            {[
              { id: "organizations" as const, label: "Organisations" },
              { id: "referrals" as const, label: "Referrals made" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                  view === tab.id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-2 flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            <div className="relative min-w-[12rem] flex-1 lg:max-w-xs">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={view === "organizations" ? searchQuery : referralSearch}
                onChange={(e) => (view === "organizations" ? setSearchQuery(e.target.value) : setReferralSearch(e.target.value))}
                placeholder={view === "organizations" ? "Search name, focus area, service" : "Search referral, client, case, officer"}
                className={`${filterControl} w-full pl-7`}
              />
            </div>

            {view === "organizations" ? (
              <>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={filterControl} aria-label="Category">
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className={filterControl} aria-label="Province">
                  <option value="all">All provinces</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                {organizationFiltersActive && (
                  <button type="button" onClick={clearOrganizationFilters} className="h-9 rounded-md px-2 text-xs font-medium text-orange-700 hover:bg-orange-50">
                    Clear
                  </button>
                )}
              </>
            ) : (
              <>
                <select value={referralOrganization} onChange={(e) => setReferralOrganization(e.target.value)} className={`${filterControl} max-w-[11rem]`} aria-label="Organisation">
                  <option value="all">All organisations</option>
                  {referralOrganizations.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <select value={referralStatus} onChange={(e) => setReferralStatus(e.target.value)} className={filterControl} aria-label="Status">
                  <option value="all">All statuses</option>
                  {referralStatuses.map((value) => (
                    <option key={value} value={value}>{statusLabel(value)}</option>
                  ))}
                </select>
                <select value={referralUrgency} onChange={(e) => setReferralUrgency(e.target.value)} className={filterControl} aria-label="Urgency">
                  <option value="all">All urgency</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <select value={referralSource} onChange={(e) => setReferralSource(e.target.value)} className={filterControl} aria-label="Source">
                  <option value="all">All sources</option>
                  <option value="CALL">From call record</option>
                  <option value="MANUAL">Referral form</option>
                </select>
                <input type="date" value={referralFrom} onChange={(e) => setReferralFrom(e.target.value)} className={filterControl} aria-label="Created from" title="Created from" />
                <span className="text-xs text-gray-400">to</span>
                <input type="date" value={referralTo} onChange={(e) => setReferralTo(e.target.value)} className={filterControl} aria-label="Created to" title="Created to" />
                {referralFiltersActive && (
                  <button type="button" onClick={clearReferralFilters} className="h-9 rounded-md px-2 text-xs font-medium text-orange-700 hover:bg-orange-50">
                    Clear
                  </button>
                )}
              </>
            )}
          </div>

          <div className="mb-2 flex shrink-0 items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm">
            {view === "organizations" ? (
              <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
            ) : (
              <ShareIcon className="h-6 w-6 text-orange-600" />
            )}
            <div>
              <p className="text-xl font-semibold leading-tight text-gray-900">
                {view === "organizations" ? filteredOrganizations.length : filteredReferrals.length}
              </p>
              <p className="text-xs text-gray-500">
                {view === "organizations"
                  ? filteredOrganizations.length === organizations.length
                    ? "Organisations"
                    : `of ${organizations.length} organisations`
                  : filteredReferrals.length === referrals.length
                    ? referrals.length === 1 ? "Referral made" : "Referrals made"
                    : `of ${referrals.length} referrals`}
              </p>
            </div>
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

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
        )}

        {view === "organizations" && (
          <>
            {loading ? (
              <div className="py-12 text-center text-sm text-gray-500">Loading organisations...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOrganizations.map((org) => (
                  <div key={org.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{org.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{org.description}</p>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Focus Areas:</h4>
                        <div className="flex flex-wrap gap-1">
                          {org.focusAreas.map((area) => (
                            <span key={area} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Categories:</h4>
                        <div className="flex flex-wrap gap-1">
                          {org.categories.map((category) => (
                            <span key={category} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 border-t pt-4">
                        {org.contact.address && (
                          <div className="flex items-start space-x-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">{org.contact.address}</p>
                              {org.city && org.province && (
                                <p className="text-xs text-gray-500">{org.city}, {org.province}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {org.contact.phone.length > 0 && (
                          <div className="flex items-start space-x-3">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              {org.contact.phone.map((phone) => (
                                <div key={phone} className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">{formatPhoneNumber(phone)}</span>
                                  <button
                                    onClick={() => copyToClipboard(phone)}
                                    className="text-orange-600 hover:text-orange-800 ml-2"
                                    title="Copy phone number"
                                  >
                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {emailsOf(org).length > 0 && (
                          <div className="flex items-start space-x-3">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              {emailsOf(org).map((email) => (
                                <div key={email} className="flex items-center justify-between mb-1">
                                  <a href={`mailto:${email}`} className="truncate text-sm text-gray-600 hover:text-orange-700" title={email}>{email}</a>
                                  <button
                                    onClick={() => copyToClipboard(email)}
                                    className="text-orange-600 hover:text-orange-800 ml-2"
                                    title="Copy email"
                                  >
                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {websitesOf(org).length > 0 && (
                          <div className="flex items-start space-x-3">
                            <ShareIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1 space-y-1">
                              {websitesOf(org).map((website) => (
                                <a
                                  key={website}
                                  href={/^https?:\/\//i.test(website) ? website : `https://${website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block truncate text-sm text-orange-600 hover:text-orange-800 underline"
                                  title={website}
                                >
                                  {website}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {(org.contact.people || []).length > 0 && (
                          <div className="flex items-start space-x-3">
                            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1 space-y-2">
                              {(org.contact.people || []).map((person, index) => (
                                <div key={`${person.name}-${index}`} className="text-sm">
                                  <p className="font-medium text-gray-800">
                                    {person.name}
                                    {person.role && <span className="font-normal text-gray-500"> · {person.role}</span>}
                                  </p>
                                  {(person.phone || person.email) && (
                                    <p className="truncate text-xs text-gray-600">
                                      {[person.phone, person.email].filter(Boolean).join(" · ")}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredOrganizations.length === 0 && (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedProvince("all")
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}

        {view === "referrals" && (
          <div className="overflow-hidden rounded-lg border bg-white">
            {referrals.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">No referrals have been made yet.</p>
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Referral
                </button>
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">No referrals match these filters.</p>
                <button
                  type="button"
                  onClick={clearReferralFilters}
                  className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[16%]" />
                  <col className="w-[20%]" />
                  <col className="w-[13%]" />
                  <col className="w-[17%]" />
                  <col className="w-[8%]" />
                  <col className="w-[10%]" />
                  <col className="w-[9%]" />
                  <col className="w-[7%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    {["Referral", "Organisation", "Client", "Case", "Urgency", "Status", "Created", ""].map((heading) => (
                      <th key={heading || "actions"} className="max-w-0 px-3 py-2 text-left text-xs font-medium text-gray-500">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReferrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-orange-50">
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm font-medium text-gray-900" title={referral.referralNumber}>{referral.referralNumber}</div>
                        <div className="truncate text-xs text-gray-500" title={referral.createdByName || ""}>
                          {[referral.createdByName, referral.source === "CALL" ? "From call record" : "Referral form"].filter(Boolean).join(" · ")}
                        </div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm text-gray-700" title={referral.organizationName}>{referral.organizationName}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm text-gray-700" title={referral.clientName}>{referral.clientName}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm text-gray-700" title={referral.caseNumber || ""}>{referral.caseNumber || "—"}</div>
                        {referral.caseNumber && (
                          <div className="truncate text-xs text-gray-500">{referral.isCase ? "Case" : "Call"}</div>
                        )}
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <span className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium ${urgencyStyle[referral.urgency] || urgencyStyle.MEDIUM}`}>
                          {referral.urgency.toLowerCase()}
                        </span>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <span
                          className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[referral.status] || "bg-gray-100 text-gray-800"}`}
                          title={statusLabel(referral.status)}
                        >
                          {statusLabel(referral.status)}
                        </span>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-xs text-gray-500">{new Date(referral.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setViewing(referral)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="referral-view-title">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div className="min-w-0">
                <h2 id="referral-view-title" className="truncate text-lg font-semibold text-gray-900">{viewing.referralNumber}</h2>
                <p className="text-sm text-gray-500">
                  {viewing.source === "CALL" ? "Recorded from the call record" : "Created with the referral form"}
                  {viewing.createdByName ? ` by ${viewing.createdByName}` : ""} on {new Date(viewing.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button type="button" onClick={() => setViewing(null)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[viewing.status] || "bg-gray-100 text-gray-800"}`}>
                  {statusLabel(viewing.status)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgencyStyle[viewing.urgency] || urgencyStyle.MEDIUM}`}>
                  {viewing.urgency.toLowerCase()} urgency
                </span>
              </div>

              <section>
                <h3 className="text-sm font-semibold text-gray-900">Referred to</h3>
                <p className="mt-1 text-sm text-gray-800">{viewing.organizationName || "—"}</p>
                {(viewing.organizationPhone || viewing.organizationEmail) && (
                  <p className="text-xs text-gray-600">{[viewing.organizationPhone, viewing.organizationEmail].filter(Boolean).join(" · ")}</p>
                )}
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-900">Client</h3>
                <dl className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                  {[
                    ["Name", viewing.clientName],
                    ["Phone", viewing.clientPhone],
                    ["Age", viewing.clientAge],
                    ["Gender", viewing.clientGender],
                    ["Province", viewing.clientProvince]
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <dt className="text-gray-500">{label}:</dt>
                      <dd className="text-gray-800">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-900">Referral</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{viewing.reason || "—"}</p>
                {viewing.servicesRequested && (
                  <p className="mt-2 text-sm text-gray-700"><span className="text-gray-500">Services:</span> {viewing.servicesRequested}</p>
                )}
                {viewing.followUpDate && (
                  <p className="mt-1 text-sm text-gray-700"><span className="text-gray-500">Follow-up:</span> {new Date(viewing.followUpDate).toLocaleDateString()}</p>
                )}
                {viewing.notes && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700"><span className="text-gray-500">Notes:</span> {viewing.notes}</p>
                )}
                {viewing.source !== "CALL" && (
                  <p className="mt-1 text-sm text-gray-700">
                    <span className="text-gray-500">Client consent:</span> {viewing.consentGiven ? "Given" : "Not recorded"}
                  </p>
                )}
              </section>

              {viewing.caseNumber && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-900">{viewing.isCase ? "Case" : "Call"}</h3>
                  <p className="mt-1 text-sm text-gray-800">{viewing.caseNumber}</p>
                  {viewing.assignedOfficer && <p className="text-xs text-gray-600">Assigned to {viewing.assignedOfficer}</p>}
                  {viewing.caseUpdatedAt && <p className="text-xs text-gray-600">Last updated {new Date(viewing.caseUpdatedAt).toLocaleString()}</p>}
                </section>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
              <button type="button" onClick={() => setViewing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Close
              </button>
              {viewing.caseId && (
                <Link
                  href={`/call-centre/cases/${viewing.caseId}`}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Open {viewing.isCase ? "case" : "call"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateReferralDialog
        open={dialogOpen}
        organizations={organizations}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </ModulePage>
  )
}
