"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ModulePage } from "@/components/layout/enhanced-layout"
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  TrophyIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  PlusIcon
} from "@heroicons/react/24/outline"

const flagshipEvents = [
  {
    id: "agriculture-sports-gala",
    name: "Agriculture Colleges Sports Gala",
    description: "Annual sports competition for agriculture colleges across the region",
    status: "Planning",
    nextEvent: "February 2025",
    lead: "Sports Development Team",
    href: "/programs/flagship-events/agriculture-sports-gala",
    color: "orange"
  },
  {
    id: "quiz-debate-challenge",
    name: "SAYWHAT Quiz & SASI Debate Challenge",
    description: "Intellectual competition fostering knowledge and debate skills",
    status: "In Progress",
    nextEvent: "April 2025",
    lead: "Academic Affairs Team",
    href: "/programs/flagship-events/quiz-debate-challenge",
    color: "blue"
  },
  {
    id: "chase-craft",
    name: "The Chase and CRAFT",
    description: "Creative arts and talent showcase events",
    status: "Scheduled",
    nextEvent: "June 2025",
    lead: "Arts & Culture Team",
    href: "/programs/flagship-events/chase-craft",
    color: "purple"
  },
  {
    id: "national-students-conference",
    name: "National Students Conference",
    description: "Annual national conference with multiple specialized events",
    status: "Planning",
    nextEvent: "August 2025",
    lead: "Conference Committee",
    href: "/programs/flagship-events/national-students-conference",
    color: "green"
  },
  {
    id: "regional-conference",
    name: "Southern African Regional Students & Youth Conference",
    description: "Regional conference bringing together students and youth from across Southern Africa",
    status: "Planning",
    nextEvent: "September 2025",
    lead: "Regional Affairs Team",
    href: "/programs/flagship-events/regional-conference",
    color: "indigo"
  }
]

export default function FlagshipEventsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning": return "bg-orange-100 text-orange-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Scheduled": return "bg-purple-100 text-purple-800"
      case "Completed": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "orange": return "border-l-saywhat-orange bg-orange-50"
      case "blue": return "border-l-blue-500 bg-blue-50"
      case "purple": return "border-l-purple-500 bg-purple-50"
      case "green": return "border-l-green-500 bg-green-50"
      case "indigo": return "border-l-indigo-500 bg-indigo-50"
      default: return "border-l-gray-500 bg-gray-50"
    }
  }

  return (
    <ModulePage
      metadata={{
        title: "SAYWHAT Flagship Events",
        description: "Annual flagship events planning and management",
        breadcrumbs: [
          { name: "Programs", href: "/programs" },
          { name: "Flagship Events" }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/programs"
              className="flex items-center text-saywhat-grey hover:text-saywhat-dark"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Programs
            </Link>
            <div className="border-l border-gray-300 h-6"></div>
            <div>
              <h1 className="text-2xl font-bold text-saywhat-dark">SAYWHAT Flagship Events</h1>
              <p className="text-saywhat-grey">Annual flagship events planning and management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-saywhat-orange text-white rounded-md hover:bg-orange-600">
              <PlusIcon className="h-4 w-4 mr-2" />
              Schedule New Event
            </button>
          </div>
        </div>

        {/* Events Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-saywhat-orange">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-8 w-8 text-saywhat-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900">{flagshipEvents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Events</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {flagshipEvents.filter(e => e.status === "In Progress").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-green-500">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Planned Events</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {flagshipEvents.filter(e => e.status === "Planning" || e.status === "Scheduled").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">85%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flagshipEvents.map((event) => (
            <div
              key={event.id}
              className={`bg-white rounded-lg shadow border-l-4 p-6 hover:shadow-md transition-shadow ${getColorClasses(event.color)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-saywhat-dark">{event.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              
              <p className="text-sm text-saywhat-grey mb-4">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-saywhat-grey">Next Event:</span>
                  <span className="text-saywhat-dark font-medium">{event.nextEvent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-saywhat-grey">Lead:</span>
                  <span className="text-saywhat-dark">{event.lead}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  href={event.href}
                  className="flex-1 text-center text-xs px-3 py-2 bg-saywhat-orange text-white rounded hover:bg-orange-600"
                >
                  View Details
                </Link>
                <button className="flex-1 text-xs px-3 py-2 border border-saywhat-orange text-saywhat-orange rounded hover:bg-orange-50">
                  Documents
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Annual Timeline Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-saywhat-dark mb-4">Annual Events Timeline</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <CalendarDaysIcon className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Interactive Gantt Chart Coming Soon
                </h4>
                <p className="text-xs text-blue-700 mb-3">
                  Advanced scheduling features for annual event planning with work breakdown structure (WBS).
                </p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p><strong>Features:</strong> Monthly view, drag-and-drop scheduling, document uploads</p>
                  <p><strong>Documents:</strong> Concept notes, budgets, and event reports management</p>
                  <p><strong>Collaboration:</strong> Progress tracking and collaborative planning tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
