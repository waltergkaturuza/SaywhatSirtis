"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
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
  ShareIcon
} from "@heroicons/react/24/outline"
import { 
  referralDirectory, 
  type ReferralOrganization,
  getOrganizationsByCategory,
  getOrganizationsByProvince,
  searchOrganizations,
  getUniqueCategories,
  getUniqueProvinces
} from "@/data/referral-directory"

export default function ReferralDirectoryPage() {
  const { data: session } = useSession()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('all')
  const [filteredOrganizations, setFilteredOrganizations] = useState<ReferralOrganization[]>(referralDirectory)
  const [showFilters, setShowFilters] = useState(false)

  // Check access control
  if (!session?.user?.permissions?.includes('callcentre.access')) {
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

  useEffect(() => {
    filterOrganizations()
  }, [searchQuery, selectedCategory, selectedProvince])

  const filterOrganizations = () => {
    let filtered = referralDirectory || []

    // Apply search filter
    if (searchQuery) {
      filtered = searchOrganizations(searchQuery)
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = (filtered || []).filter(org => 
        org.categories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()))
      )
    }

    // Apply province filter
    if (selectedProvince !== 'all') {
      filtered = (filtered || []).filter(org => 
        org.province?.toLowerCase() === selectedProvince.toLowerCase()
      )
    }

    setFilteredOrganizations(filtered)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/\s/g, '').replace(/(\+263)(\d{1})(\d{2})(\d{3})(\d{3})/, '$1 $2$3 $4 $5')
  }

  const categories = getUniqueCategories()
  const provinces = getUniqueProvinces()

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
    >
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/call-centre" className="flex items-center text-gray-600 hover:text-orange-600">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Call Centre
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            {filteredOrganizations.length} of {referralDirectory.length} organizations
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Province Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Provinces</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrganizations.map((org) => (
            <div key={org.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Organization Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {org.description}
                    </p>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Focus Areas:</h4>
                  <div className="flex flex-wrap gap-1">
                    {org.focusAreas.map((area, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Categories:</h4>
                  <div className="flex flex-wrap gap-1">
                    {org.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 border-t pt-4">
                  {/* Address */}
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

                  {/* Phone Numbers */}
                  {org.contact.phone.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        {org.contact.phone.map((phone, index) => (
                          <div key={index} className="flex items-center justify-between mb-1">
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

                  {/* Email */}
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

                  {/* Website */}
                  {org.contact.website && (
                    <div className="flex items-center space-x-3">
                      <ShareIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <a
                        href={`https://${org.contact.website.replace('www.', '').replace('https://', '').replace('http://', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange-600 hover:text-orange-800 underline"
                      >
                        {org.contact.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                      Create Referral
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredOrganizations.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedProvince('all')
              }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
