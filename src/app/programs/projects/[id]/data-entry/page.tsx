"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"

export default function DataEntryPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canEnterData = userPermissions.includes('programs.data_entry') || userPermissions.includes('programs.upload')

  const [selectedIndicator, setSelectedIndicator] = useState('')
  const [formData, setFormData] = useState({
    indicatorId: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    gender: '',
    ageGroup: '',
    notes: ''
  })

  const [recentEntries, setRecentEntries] = useState([
    {
      id: 1,
      indicator: "Youth SRHR Knowledge",
      value: 125,
      date: "2025-07-14",
      location: "Lagos, Nigeria",
      gender: "Female",
      ageGroup: "Youth",
      enteredBy: "John Smith",
      verified: true
    },
    {
      id: 2,
      indicator: "Services Provided",
      value: 89,
      date: "2025-07-13",
      location: "Abuja, Nigeria",
      gender: "Male",
      ageGroup: "Adults",
      enteredBy: "Sarah Johnson",
      verified: false
    }
  ])

  // Sample project and indicators
  const project = {
    id: projectId,
    name: "Action for Choice 2",
    indicators: [
      {
        id: 1,
        name: "Youth SRHR Knowledge",
        description: "Number of youth demonstrating improved knowledge on SRHR",
        target: 5000,
        current: 3250,
        unit: "youth"
      },
      {
        id: 2,
        name: "Services Provided",
        description: "Number of SRHR services provided to beneficiaries",
        target: 15000,
        current: 8500,
        unit: "services"
      },
      {
        id: 3,
        name: "Community Outreach Activities",
        description: "Number of community outreach activities conducted",
        target: 200,
        current: 145,
        unit: "activities"
      },
      {
        id: 4,
        name: "Healthcare Facilities Engaged",
        description: "Number of healthcare facilities actively engaged",
        target: 50,
        current: 32,
        unit: "facilities"
      }
    ]
  }

  const locations = [
    "Lagos, Nigeria",
    "Abuja, Nigeria", 
    "Kano, Nigeria",
    "Port Harcourt, Nigeria",
    "Ibadan, Nigeria"
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add to recent entries
    const newEntry = {
      id: recentEntries.length + 1,
      indicator: project.indicators.find(i => i.id.toString() === formData.indicatorId)?.name || '',
      value: parseInt(formData.value),
      date: formData.date,
      location: formData.location,
      gender: formData.gender,
      ageGroup: formData.ageGroup,
      enteredBy: session?.user?.name || 'Current User',
      verified: false
    }
    
    setRecentEntries(prev => [newEntry, ...prev])
    
    // Reset form
    setFormData({
      indicatorId: '',
      value: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      gender: '',
      ageGroup: '',
      notes: ''
    })
    
    alert('Data entry submitted successfully!')
  }

  const handleVerify = (entryId: number) => {
    setRecentEntries(prev => 
      prev.map(entry => 
        entry.id === entryId ? { ...entry, verified: true } : entry
      )
    )
  }

  const handleDelete = (entryId: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setRecentEntries(prev => prev.filter(entry => entry.id !== entryId))
    }
  }

  const metadata = {
    title: "Manual Data Entry",
    description: `Data entry for ${project.name}`,
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs", href: "/programs" },
      { name: project.name, href: `/programs/projects/${projectId}` },
      { name: "Data Entry" }
    ]
  }

  const actions = (
    <>
      <Link
        href={`/programs/projects/${projectId}`}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Project
      </Link>
      <Link
        href={`/programs/projects/${projectId}/forms`}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Kobo Forms
      </Link>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Entry Guidelines</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="p-3 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-900 mb-2">Required Fields</h4>
            <ul className="space-y-1">
              <li>• Select indicator</li>
              <li>• Enter value</li>
              <li>• Choose date</li>
              <li>• Select location</li>
            </ul>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <h4 className="font-medium text-green-900 mb-2">Data Quality</h4>
            <ul className="space-y-1">
              <li>• Verify accuracy before submission</li>
              <li>• Include demographic details</li>
              <li>• Add notes for context</li>
              <li>• Double-check values</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Indicators</h3>
        <div className="space-y-2">
          {project.indicators.map((indicator) => (
            <div key={indicator.id} className="p-2 bg-gray-50 rounded text-sm">
              <div className="font-medium text-gray-900 truncate">{indicator.name}</div>
              <div className="text-gray-600">
                Current: {indicator.current.toLocaleString()} / {indicator.target.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">{indicator.unit}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{recentEntries.length}</div>
            <div className="text-sm text-blue-800">Recent Entries</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">
              {recentEntries.filter(e => e.verified).length}
            </div>
            <div className="text-sm text-green-800">Verified</div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!canEnterData) {
    return (
      <ModulePage metadata={metadata} actions={actions} sidebar={sidebar}>
        <div className="bg-white rounded-lg border p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">You don't have permission to enter data for this project.</p>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Data Entry Form */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Manual Data Entry</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indicator *
                </label>
                <select
                  value={formData.indicatorId}
                  onChange={(e) => handleInputChange('indicatorId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an indicator</option>
                  {project.indicators.map((indicator) => (
                    <option key={indicator.id} value={indicator.id.toString()}>
                      {indicator.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value *
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  placeholder="Enter value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select location</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group
                </label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select age group</option>
                  <option value="Children">Children (0-14)</option>
                  <option value="Youth">Youth (15-24)</option>
                  <option value="Adults">Adults (25-64)</option>
                  <option value="Elderly">Elderly (65+)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or context for this data entry..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Submit Data Entry
              </button>
            </div>
          </form>
        </div>

        {/* Recent Entries */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Data Entries</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {entry.verified ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{entry.indicator}</h3>
                        <span className="text-2xl font-bold text-blue-600">{entry.value}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {entry.date}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {entry.location}
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          {entry.gender}, {entry.ageGroup}
                        </div>
                        <div>
                          Entered by: {entry.enteredBy}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!entry.verified && (
                      <button
                        onClick={() => handleVerify(entry.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete Entry"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentEntries.length === 0 && (
            <div className="p-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No data entries yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by entering your first data point above.
              </p>
            </div>
          )}
        </div>
      </div>
    </ModulePage>
  )
}
