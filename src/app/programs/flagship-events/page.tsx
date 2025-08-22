"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TrophyIcon
} from "@heroicons/react/24/outline"
import { 
  flagshipEvents2025, 
  implementationPartners,
  type FlagshipEvent,
  type ImplementationPartner,
  getEventsByYear,
  getEventsByStatus,
  getEventPartners,
  getEventProgress
} from "@/data/flagship-events"

export default function FlagshipEventsPage() {
  const { data: session } = useSession()
  
  const [events, setEvents] = useState<FlagshipEvent[]>(flagshipEvents2025)
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState<'events' | 'partners' | 'calendar'>('events')

  // Filter function using useCallback to prevent unnecessary re-renders
  const filterEvents = useCallback(() => {
    let filtered = flagshipEvents2025
    
    if (selectedYear !== 2025) {
      filtered = []
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status.toLowerCase() === selectedStatus.toLowerCase())
    }
    
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setEvents(filtered)
  }, [selectedYear, selectedStatus, searchQuery])

  useEffect(() => {
    filterEvents()
  }, [filterEvents])

  // Check access control - Programs module access required
  if (!session?.user?.permissions?.includes('programs.access')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            This module is restricted to Programs staff and Head of Programs only.
          </p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: FlagshipEvent['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const years = [2025, 2026, 2024, 2023]
  const statuses = ['all', 'planning', 'approved', 'in-progress', 'completed', 'cancelled']

  return (
    <ModulePage
      metadata={{
        title: "Flagship Events Management",
        description: "Manage SAYWHAT flagship events, implementation partners, and event documentation",
        breadcrumbs: [
          { name: "Programs", href: "/programs" },
          { name: "Flagship Events" }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{flagshipEvents2025.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Implementation Partners</p>
                <p className="text-2xl font-bold text-gray-900">{implementationPartners.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getEventsByStatus('in-progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getEventsByStatus('completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveView('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeView === 'events'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarDaysIcon className="h-5 w-5" />
              <span>Events</span>
            </button>
            
            <button
              onClick={() => setActiveView('partners')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeView === 'partners'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserGroupIcon className="h-5 w-5" />
              <span>Implementation Partners</span>
            </button>
            
            <button
              onClick={() => setActiveView('calendar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeView === 'calendar'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5" />
              <span>Calendar & Reports</span>
            </button>
          </nav>
        </div>

        {/* Events View */}
        {activeView === 'events' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events by name, description, or location..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>

                  <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Event
                  </button>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => {
                const partners = getEventPartners(event.id)
                const progress = getEventProgress(event.id)
                
                return (
                  <div key={event.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      {/* Event Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {event.name}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {event.description}
                          </p>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                          <span>{event.timeline}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                          <span>{event.location}</span>
                          {event.venue && <span className="text-gray-500">• {event.venue}</span>}
                        </div>

                        {partners.length > 0 && (
                          <div className="flex items-start space-x-3 text-sm text-gray-600">
                            <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-gray-700 font-medium">Partners: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {partners.slice(0, 3).map((partner) => (
                                  <span
                                    key={partner.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {partner.acronym}
                                  </span>
                                ))}
                                {partners.length > 3 && (
                                  <span className="text-xs text-gray-500 py-1">
                                    +{partners.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Side Events */}
                      {event.sideEvents && event.sideEvents.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Side Events:</h4>
                          <div className="space-y-1">
                            {event.sideEvents.slice(0, 3).map((sideEvent, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-center">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                {sideEvent}
                              </div>
                            ))}
                            {event.sideEvents.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{event.sideEvents.length - 3} more side events
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-4 border-t border-gray-200">
                        <Link
                          href={`/programs/flagship-events/${event.id}`}
                          className="flex-1 bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
                        >
                          Manage Event
                        </Link>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* No Results */}
            {events.length === 0 && (
              <div className="text-center py-12">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedStatus('all')
                    setSelectedYear(2025)
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Implementation Partners View */}
        {activeView === 'partners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Implementation Partners</h2>
              <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Partner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {implementationPartners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-orange-600 font-medium mb-2">
                        {partner.acronym}
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{partner.country}</span>
                      </div>
                    </div>
                  </div>

                  {partner.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {partner.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Focus Areas:</h4>
                    <div className="flex flex-wrap gap-1">
                      {partner.focusAreas.map((area, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar & Reports View */}
        {activeView === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2025 Events Calendar</h2>
              <div className="text-center py-8">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View Coming Soon</h3>
                <p className="text-gray-500">
                  Interactive calendar view for flagship events will be available here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
