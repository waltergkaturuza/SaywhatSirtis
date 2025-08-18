"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ModulePage } from "@/components/layout/enhanced-layout"
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  TrophyIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from "@heroicons/react/24/outline"

export default function AgricultureSportsGalaPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const eventData = {
    name: "Agriculture Colleges Sports Gala",
    description: "Annual sports competition for agriculture colleges across the region",
    status: "Planning",
    nextEvent: "February 2025",
    lead: "Sports Development Team",
    budget: "$25,000",
    participants: 150,
    venues: [
      "University of Zimbabwe Sports Complex",
      "Chinhoyi University Grounds",
      "Agricultural College Arenas"
    ],
    sports: [
      "Football", "Netball", "Athletics", "Cricket", 
      "Volleyball", "Basketball", "Rugby", "Swimming"
    ],
    timeline: [
      { phase: "Planning & Preparation", start: "December 2024", end: "January 2025", status: "in-progress" },
      { phase: "Team Registration", start: "January 2025", end: "February 2025", status: "pending" },
      { phase: "Competition Phase", start: "February 2025", end: "March 2025", status: "pending" },
      { phase: "Awards Ceremony", start: "March 2025", end: "March 2025", status: "pending" }
    ]
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: DocumentTextIcon },
    { id: "timeline", name: "Timeline", icon: CalendarDaysIcon },
    { id: "participants", name: "Participants", icon: UsersIcon },
    { id: "budget", name: "Budget", icon: CurrencyDollarIcon },
    { id: "venues", name: "Venues", icon: MapPinIcon },
    { id: "documents", name: "Documents", icon: DocumentTextIcon }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-saywhat-orange">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-saywhat-orange" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expected Participants</p>
              <p className="text-2xl font-semibold text-gray-900">{eventData.participants}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-green-500">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sport Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{eventData.sports.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center">
            <MapPinIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Venues</p>
              <p className="text-2xl font-semibold text-gray-900">{eventData.venues.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Budget</p>
              <p className="text-2xl font-semibold text-gray-900">{eventData.budget}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Description */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Description</h3>
        <p className="text-gray-700 mb-4">{eventData.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sports Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              {eventData.sports.map((sport, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-saywhat-orange/10 text-saywhat-orange">
                  {sport}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Venue Locations</h4>
            <ul className="space-y-1">
              {eventData.venues.map((venue, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                  {venue}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTimeline = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Event Timeline</h3>
      <div className="space-y-6">
        {eventData.timeline.map((phase, index) => (
          <div key={index} className="flex items-start">
            <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
              phase.status === 'completed' ? 'bg-green-500' :
              phase.status === 'in-progress' ? 'bg-saywhat-orange' :
              'bg-gray-300'
            }`}></div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                  <p className="text-sm text-gray-500">{phase.start} - {phase.end}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                  phase.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {phase.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderParticipants = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Participant Management</h3>
        <button className="flex items-center px-4 py-2 bg-saywhat-orange text-white rounded-md hover:bg-orange-600">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add College
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">Participant Registration Opening Soon</p>
        <p className="text-sm">Registration for agriculture colleges will open in January 2025</p>
      </div>
    </div>
  )

  const renderBudget = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Breakdown</h3>
      <div className="space-y-4">
        {[
          { category: "Venue Rental", amount: "$8,000", percentage: 32 },
          { category: "Equipment & Supplies", amount: "$6,000", percentage: 24 },
          { category: "Catering", amount: "$5,000", percentage: 20 },
          { category: "Awards & Trophies", amount: "$3,000", percentage: 12 },
          { category: "Transportation", amount: "$2,000", percentage: 8 },
          { category: "Miscellaneous", amount: "$1,000", percentage: 4 }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{item.category}</span>
                <span className="text-sm text-gray-500">{item.amount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-saywhat-orange h-2 rounded-full" 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview()
      case "timeline": return renderTimeline()
      case "participants": return renderParticipants()
      case "budget": return renderBudget()
      case "venues": return renderParticipants() // Placeholder
      case "documents": return renderParticipants() // Placeholder
      default: return renderOverview()
    }
  }

  return (
    <ModulePage
      metadata={{
        title: "Agriculture Colleges Sports Gala",
        description: "Annual sports competition for agriculture colleges across the region",
        breadcrumbs: [
          { name: "Programs", href: "/programs" },
          { name: "Flagship Events", href: "/programs/flagship-events" },
          { name: "Agriculture Sports Gala" }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-saywhat-grey hover:text-saywhat-dark"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Programs
            </button>
            <div className="border-l border-gray-300 h-6"></div>
            <div>
              <h1 className="text-2xl font-bold text-saywhat-dark">{eventData.name}</h1>
              <p className="text-saywhat-grey">{eventData.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              eventData.status === 'Planning' ? 'bg-orange-100 text-orange-800' :
              eventData.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {eventData.status}
            </span>
            <button className="flex items-center px-4 py-2 bg-saywhat-orange text-white rounded-md hover:bg-orange-600">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Schedule Event
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-saywhat-orange text-saywhat-orange"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </ModulePage>
  )
}
