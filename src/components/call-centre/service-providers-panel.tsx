"use client"

import React, { useState, useEffect } from 'react'
import { PhoneIcon, MapPinIcon, ClockIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface ServiceProvider {
  id: string
  name: string
  category: string
  phone: string
  alternatePhone?: string
  email?: string
  address: string
  province: string
  city: string
  operatingHours: string
  services: string[]
  emergencyContact: boolean
  lastUpdated: string
}

interface ServiceProvidersePanelProps {
  onProviderSelect?: (provider: ServiceProvider) => void
}

export const ServiceProvidersPanel: React.FC<ServiceProvidersePanelProps> = ({ onProviderSelect }) => {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  // Sample service providers data - in production this would come from backend
  const sampleProviders: ServiceProvider[] = [
    {
      id: '1',
      name: 'Parirenyatwa Group of Hospitals',
      category: 'Medical',
      phone: '+263-4-791631',
      alternatePhone: '+263-4-791632',
      email: 'admin@parirenyatwa.ac.zw',
      address: 'Mazowe Street, Avondale',
      province: 'Harare',
      city: 'Harare',
      operatingHours: '24/7',
      services: ['Emergency Care', 'HIV/AIDS Treatment', 'Mental Health', 'Reproductive Health'],
      emergencyContact: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Musasa Project',
      category: 'GBV Support',
      phone: '+263-4-252105',
      alternatePhone: '+263-4-252106',
      email: 'info@musasa.org.zw',
      address: '6 Kenilworth Road, Newlands',
      province: 'Harare',
      city: 'Harare',
      operatingHours: '8:00 AM - 5:00 PM',
      services: ['GBV Counselling', 'Legal Support', 'Safe Houses', 'Court Support'],
      emergencyContact: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Zimbabwe National Family Planning Council',
      category: 'Reproductive Health',
      phone: '+263-4-251655',
      email: 'info@znfpc.org.zw',
      address: 'Emerald Hill, Harare',
      province: 'Harare',
      city: 'Harare',
      operatingHours: '8:00 AM - 4:30 PM',
      services: ['Family Planning', 'Contraception', 'Youth Friendly Services'],
      emergencyContact: false,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Childline Zimbabwe',
      category: 'Child Protection',
      phone: '+263-116',
      alternatePhone: '+263-4-251386',
      email: 'info@childlinezimbabwe.org.zw',
      address: 'Highlands, Harare',
      province: 'Harare',
      city: 'Harare',
      operatingHours: '24/7 Hotline',
      services: ['Child Protection', 'Abuse Reporting', 'Counselling', 'Emergency Response'],
      emergencyContact: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Legal Resources Foundation',
      category: 'Legal',
      phone: '+263-4-792265',
      email: 'info@lrf.co.zw',
      address: 'Austin House, Harare',
      province: 'Harare',
      city: 'Harare',
      operatingHours: '8:00 AM - 5:00 PM',
      services: ['Legal Aid', 'Human Rights', 'Court Representation'],
      emergencyContact: false,
      lastUpdated: new Date().toISOString()
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProviders(sampleProviders)
      setFilteredProviders(sampleProviders)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let filtered = providers

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        provider.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(provider => provider.category === selectedCategory)
    }

    setFilteredProviders(filtered)
  }, [searchTerm, selectedCategory, providers])

  const categories = ['all', ...new Set(providers.map(p => p.category))]

  const handleProviderCall = (provider: ServiceProvider) => {
    // In a real app, this might integrate with phone system
    window.open(`tel:${provider.phone}`)
    if (onProviderSelect) {
      onProviderSelect(provider)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-saywhat-dark mb-4">Service Providers Directory</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search providers or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-saywhat-gray rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredProviders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredProviders.map(provider => (
              <div key={provider.id} className="p-4 hover:bg-saywhat-light-grey">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-saywhat-dark">{provider.name}</h4>
                    <p className="text-sm text-gray-600">{provider.category}</p>
                  </div>
                  {provider.emergencyContact && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-saywhat-orange/10 text-saywhat-orange">
                      Emergency
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <span>{provider.phone}</span>
                    {provider.alternatePhone && (
                      <span className="ml-2 text-gray-400">/ {provider.alternatePhone}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{provider.address}, {provider.city}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{provider.operatingHours}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {provider.services.slice(0, 3).map(service => (
                    <span
                      key={service}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-saywhat-green/10 text-saywhat-green"
                    >
                      {service}
                    </span>
                  ))}
                  {provider.services.length > 3 && (
                    <span className="text-xs text-saywhat-gray">+{provider.services.length - 3} more</span>
                  )}
                </div>

                <button
                  onClick={() => handleProviderCall(provider)}
                  className="w-full bg-saywhat-orange text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-saywhat-orange/90 transition-colors"
                >
                  Call Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-saywhat-gray">No service providers found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceProvidersPanel
