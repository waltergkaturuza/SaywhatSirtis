"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  ArrowLeftIcon,
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
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { CreateReferralDialog } from "@/components/call-centre/create-referral-dialog"

type ReferralOrganization = {
  id: string
  name: string
  description: string
  focusAreas: string[]
  categories: string[]
  contact: { address?: string; phone: string[]; email?: string; website?: string }
  province?: string
  city?: string
}

type ReferralRecord = {
  id: string
  referralNumber: string
  organizationName: string
  caseNumber: string | null
  clientName: string
  urgency: string
  status: string
  followUpDate: string | null
  createdByName: string | null
  createdAt: string
}

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
  const [showFilters, setShowFilters] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notice, setNotice] = useState("")

  const canAccess = Boolean(session?.user?.permissions?.includes("callcentre.access"))

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
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          disabled={organizations.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
        >
          <PlusIcon className="h-4 w-4" />
          Create Referral
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/call-centre" className="flex items-center text-gray-600 hover:text-orange-600">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Call Centre
          </Link>
          <div className="text-sm text-gray-500">
            {view === "organizations"
              ? `${filteredOrganizations.length} of ${organizations.length} organizations`
              : `${referrals.length} referrals`}
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

        <div className="flex gap-2 border-b border-gray-200">
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

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
        )}

        {view === "organizations" && (
          <>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search organizations, focus areas, or services..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filters
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                      <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="all">All Provinces</option>
                        {provinces.map((province) => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

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

                        {org.contact.email && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{org.contact.email}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(org.contact.email!)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Copy email"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {org.contact.website && (
                          <div className="flex items-center space-x-3">
                            <ShareIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <a
                              href={`https://${org.contact.website.replace("www.", "").replace("https://", "").replace("http://", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-orange-600 hover:text-orange-800 underline"
                            >
                              {org.contact.website}
                            </a>
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
            ) : (
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[16%]" />
                  <col className="w-[24%]" />
                  <col className="w-[18%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    {["Referral", "Organisation", "Client", "Case", "Urgency", "Status", "Created"].map((heading) => (
                      <th key={heading} className="max-w-0 px-3 py-2 text-left text-xs font-medium text-gray-500">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-orange-50">
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm font-medium text-gray-900" title={referral.referralNumber}>{referral.referralNumber}</div>
                        <div className="truncate text-xs text-gray-500" title={referral.createdByName || ""}>{referral.createdByName || ""}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm text-gray-700" title={referral.organizationName}>{referral.organizationName}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm text-gray-700" title={referral.clientName}>{referral.clientName}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-sm text-gray-700" title={referral.caseNumber || ""}>{referral.caseNumber || "—"}</div>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <span className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium ${urgencyStyle[referral.urgency] || urgencyStyle.MEDIUM}`}>
                          {referral.urgency.toLowerCase()}
                        </span>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <span className="inline-flex max-w-full truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                          {referral.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="max-w-0 overflow-hidden px-3 py-2">
                        <div className="truncate text-xs text-gray-500">{new Date(referral.createdAt).toLocaleDateString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <CreateReferralDialog
        open={dialogOpen}
        organizations={organizations}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </ModulePage>
  )
}
