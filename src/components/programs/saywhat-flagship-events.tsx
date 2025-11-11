"use client"

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Combobox } from '@headlessui/react'
import clsx from 'clsx'
import { PlusIcon, TrophyIcon, CalendarDaysIcon, EyeIcon, PrinterIcon, PencilIcon, TrashIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'
import { resolveCategoryInfo, buildFolderPath, sanitizeFolderSegment } from '@/lib/documents/category-utils'

interface FlagshipEvent {
  id: string
  name: string
  description: string | null
  objectives?: any
  startDate: string
  startTime: string | null
  endDate: string
  endTime: string | null
  location: string
  venue?: string | null
  address?: string | null
  expectedAttendees: number | null
  actualAttendees: number | null
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  category: 'CONFERENCE' | 'WORKSHOP' | 'CAMPAIGN' | 'OUTREACH' | 'FUNDRAISING'
  budget: number
  actualCost: number | null
  organizerUserId: string
  organizer?: {
    id: string
    name: string | null
    email: string
  } | string
  agenda?: any
  speakers?: any
  partners?: any
  registrationFields?: any
  createdAt: string
  updatedAt: string
}

interface SaywhatEventsProps {
  permissions: any
}

// Helper function to get organizer name
const getOrganizerName = (organizer: FlagshipEvent['organizer']): string => {
  if (!organizer) return 'Unassigned';
  if (typeof organizer === 'string') return organizer;
  return organizer.name || 'Unknown';
};

// Transform API response to frontend format
const transformApiEvent = (apiEvent: any): FlagshipEvent => ({
  id: apiEvent.id,
  name: apiEvent.title || apiEvent.name,
  description: apiEvent.description,
  objectives: apiEvent.objectives,
  startDate: apiEvent.startDate,
  startTime: apiEvent.startTime,
  endDate: apiEvent.endDate,
  endTime: apiEvent.endTime,
  location: apiEvent.location,
  venue: apiEvent.venue,
  address: apiEvent.address,
  expectedAttendees: apiEvent.expectedAttendees !== null ? apiEvent.expectedAttendees : (apiEvent.capacity || 0),
  actualAttendees: apiEvent.actualAttendees,
  status: apiEvent.status?.toUpperCase() || 'PLANNING',
  category: apiEvent.category?.toUpperCase() || apiEvent.type?.toUpperCase() || 'CONFERENCE',
  budget: apiEvent.budget || 0,
  actualCost: apiEvent.actualCost,
  organizerUserId: apiEvent.organizerUserId || '',
  organizer: apiEvent.organizer ? (typeof apiEvent.organizer === 'string' ? apiEvent.organizer : apiEvent.organizer) : undefined,
  agenda: apiEvent.agenda,
  speakers: apiEvent.speakers,
  partners: apiEvent.partners,
  registrationFields: apiEvent.registrationFields,
  createdAt: apiEvent.createdAt,
  updatedAt: apiEvent.updatedAt
});

export function SaywhatFlagshipEvents({ permissions }: SaywhatEventsProps) {
  const [events, setEvents] = useState<FlagshipEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewEventForm, setShowNewEventForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objectives: [''],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    address: '',
    venue: '',
    expectedAttendees: 0,
    actualAttendees: 0,
    requiresRegistration: false,
    registrationDeadline: '',
    registrationFields: ['name', 'email', 'phone'],
    status: 'planning',
    category: 'conference',
    budget: 0,
    actualCost: 0,
    agenda: [] as any[],
    speakers: [] as any[],
    partners: [] as any[],
    organizer: ''
  });
  const [editingEvent, setEditingEvent] = useState<FlagshipEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FlagshipEvent | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    name: string;
    type: 'concept' | 'budget' | 'report' | 'other';
    size: number;
    uploadDate: string;
    file?: File;
  }>>([]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // First, create the event
      const response = await fetch('/api/programs/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      const newEvent = await response.json()
      
      // Save event documents if any were uploaded
      if (uploadedDocuments.length > 0) {
        await saveEventDocuments(newEvent.id, uploadedDocuments)
      }
      
      setEvents(prev => [newEvent, ...prev])
      setShowNewEventForm(false)
      setUploadedDocuments([])
      setFormData({
        name: '',
        description: '',
        objectives: [''],
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        venue: '',
        address: '',
        expectedAttendees: 0,
        actualAttendees: 0,
        requiresRegistration: false,
        registrationDeadline: '',
        registrationFields: ['name', 'email', 'phone'],
        status: 'planning',
        category: 'conference',
        budget: 0,
        actualCost: 0,
        agenda: [],
        speakers: [],
        partners: [],
        organizer: ''
      })
    } catch (error) {
      console.error('Event creation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create event')
    }
  }

  const saveEventDocuments = async (eventId: string, documents: any[]) => {
    try {
      const departmentName = 'Programs'
      const subunitName = 'Events'
      for (const doc of documents) {
        const uploadFormData = new FormData()
        if (doc.file) {
          const categoryInfo = resolveCategoryInfo(doc.type)
          const baseFolderPath = buildFolderPath({
            department: departmentName,
            subunit: subunitName,
            categoryDisplay: categoryInfo.display,
          })
          const eventSegment = sanitizeFolderSegment(eventId || formData.name || '')
          const folderPath = eventSegment ? `${baseFolderPath}/${eventSegment}` : baseFolderPath

          uploadFormData.append('file', doc.file)
          uploadFormData.append('title', `${categoryInfo.display}: ${doc.name}`)
          uploadFormData.append('category', categoryInfo.label)
          uploadFormData.append('classification', 'CONFIDENTIAL')
          uploadFormData.append('department', departmentName)
          uploadFormData.append('subunit', subunitName)
          uploadFormData.append('categoryEnum', categoryInfo.enumValue)
          uploadFormData.append('categoryDisplay', categoryInfo.display)
          uploadFormData.append('folderPath', folderPath)
          uploadFormData.append('eventId', eventId) // Link document to event

          const docResponse = await fetch('/api/documents/upload', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!docResponse.ok) {
            console.error('Failed to save document:', doc.name)
          }
        }
      }
    } catch (error) {
      console.error('Error saving documents:', error)
    }
  }

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return

    try {
      const response = await fetch(`/api/programs/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      const updatedEvent = await response.json()
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      ))
      setShowNewEventForm(false)
      setEditingEvent(null)
      setUploadedDocuments([])
      setFormData({
        name: '',
        description: '',
        objectives: [''],
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        venue: '',
        address: '',
        expectedAttendees: 0,
        actualAttendees: 0,
        requiresRegistration: false,
        registrationDeadline: '',
        registrationFields: ['name', 'email', 'phone'],
        status: 'planning',
        category: 'conference',
        budget: 0,
        actualCost: 0,
        agenda: [],
        speakers: [],
        partners: [],
        organizer: ''
      })
    } catch (error) {
      console.error('Event update error:', error)
      setError(error instanceof Error ? error.message : 'Failed to update event')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/programs/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      setEvents(prev => prev.filter(event => event.id !== eventId))
    } catch (error) {
      console.error('Event deletion error:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete event')
    }
  }

  const handleDownloadEvent = async (eventId?: string) => {
    try {
      const params = new URLSearchParams()
      params.append('format', 'csv')
      if (eventId) {
        params.append('eventId', eventId)
      }
      
      const response = await fetch(`/api/programs/events/export?${params}`)
      if (!response.ok) {
        throw new Error('Failed to download event data')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'events.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      setError(error instanceof Error ? error.message : 'Failed to download event data')
    }
  }

  const handlePrintEvent = (event?: FlagshipEvent) => {
    if (event) {
      // Create a printable version of the single event
      const printContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1>${event.name}</h1>
          <p><strong>Description:</strong> ${event.description || 'N/A'}</p>
          <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()} ${event.startTime || ''} - ${new Date(event.endDate).toLocaleDateString()} ${event.endTime || ''}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Expected Attendees:</strong> ${event.expectedAttendees ? event.expectedAttendees.toLocaleString() : 'N/A'}</p>
          ${event.actualAttendees ? `<p><strong>Actual Attendees:</strong> ${event.actualAttendees.toLocaleString()}</p>` : ''}
          <p><strong>Status:</strong> ${event.status ? (event.status.charAt(0) + event.status.slice(1).toLowerCase()) : 'N/A'}</p>
          <p><strong>Category:</strong> ${event.category ? (event.category.charAt(0) + event.category.slice(1).toLowerCase()) : 'N/A'}</p>
          <p><strong>Budget:</strong> ${formatCurrency(event.budget)}</p>
          ${event.actualCost ? `<p><strong>Actual Cost:</strong> ${formatCurrency(event.actualCost)}</p>` : ''}
          <p><strong>Organizer:</strong> ${getOrganizerName(event.organizer)}</p>
          <p><strong>Created:</strong> ${new Date(event.createdAt).toLocaleDateString()}</p>
        </div>
      `
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    } else {
      // Print all events
      window.print()
    }
  }

  const handleViewEvent = (event: FlagshipEvent) => {
    // Set the selected event for viewing details
    setSelectedEvent(event)
    // You could also navigate to a detail page or open a modal
    // For now, we'll use the existing selectedEvent state to show details
  }

  const handleEditClick = (event: FlagshipEvent) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      description: event.description || '',
      objectives: Array.isArray(event.objectives) ? event.objectives : [''],
      startDate: new Date(event.startDate).toISOString().split('T')[0],
      startTime: event.startTime || '',
      endDate: new Date(event.endDate).toISOString().split('T')[0],
      endTime: event.endTime || '',
      location: event.location,
      venue: event.venue || '',
      address: event.address || '',
      expectedAttendees: event.expectedAttendees || 0,
      actualAttendees: event.actualAttendees || 0,
      requiresRegistration: false, // TODO: Load from event data when backend supports it
      registrationDeadline: '',
      registrationFields: Array.isArray(event.registrationFields) ? event.registrationFields : ['name', 'email', 'phone'],
      status: event.status ? event.status.toLowerCase() : 'planning',
      category: event.category ? event.category.toLowerCase() : 'conference',
      budget: event.budget,
      actualCost: event.actualCost || 0,
      organizer: getOrganizerName(event.organizer),
      agenda: Array.isArray(event.agenda) ? event.agenda : [] as any[],
      speakers: Array.isArray(event.speakers) ? event.speakers : [] as any[],
      partners: Array.isArray(event.partners) ? event.partners : [] as any[]
    })
    setShowNewEventForm(true)
  }

  const handleDocumentUpload = (files: FileList | null, docType: 'concept' | 'budget' | 'report' | 'other') => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const newDoc = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: docType,
        size: file.size,
        uploadDate: new Date().toISOString(),
        file: file
      };
      setUploadedDocuments(prev => [...prev, newDoc]);
    });
  }

  const handleRemoveDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  }

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  }

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  }

  const handleRegistrationFieldChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      registrationFields: checked 
        ? [...prev.registrationFields, field]
        : prev.registrationFields.filter(f => f !== field)
    }));
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      
      const response = await fetch(`/api/programs/events?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const data = await response.json()
      const transformedEvents = (data.events || []).map(transformApiEvent)
      setEvents(transformedEvents)
      
    } catch (error) {
      console.error('Events fetch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [selectedStatus, selectedCategory])

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'text-gray-600 bg-gray-100'
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'planning': return 'text-orange-700 bg-orange-100'
      case 'active': return 'text-green-700 bg-green-100'
      case 'completed': return 'text-green-800 bg-green-200'
      case 'cancelled': return 'text-red-700 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string | undefined) => {
    if (!category) return 'text-gray-600 bg-gray-100'
    const categoryLower = category.toLowerCase()
    switch (categoryLower) {
      case 'conference': return 'text-purple-700 bg-purple-100'
      case 'workshop': return 'text-blue-700 bg-blue-100'
      case 'campaign': return 'text-orange-700 bg-orange-100'
      case 'outreach': return 'text-green-700 bg-green-100'
      case 'fundraising': return 'text-yellow-700 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SAYWHAT Flagship Events</h1>
          <p className="text-gray-600 mt-1">
            Manage non-donor-funded SAYWHAT events with timeline planning and document management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid View
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                viewMode === 'timeline' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline View
            </button>
          </div>
          {events.length > 0 && (
            <>
              <button
                onClick={() => handleDownloadEvent()}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3" />
                </svg>
                Download All
              </button>
              <button
                onClick={() => handlePrintEvent()}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H4a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Print All
              </button>
            </>
          )}
          {permissions?.canCreate && (
            <button
              onClick={() => setShowNewEventForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <TrophyIcon className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planning</p>
              <p className="text-2xl font-bold text-orange-600">{events.filter(e => e.status === 'PLANNING').length}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <CalendarDaysIcon className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{events.filter(e => e.status === 'ACTIVE').length}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-yellow-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{events.filter(e => e.status === 'COMPLETED').length}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Status</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedStatus === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setSelectedStatus('planning')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedStatus === 'planning' 
                ? 'bg-orange-600 text-white' 
                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
            }`}
          >
            Planning
          </button>
          <button
            onClick={() => setSelectedStatus('active')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedStatus === 'active' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedStatus === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setSelectedStatus('cancelled')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedStatus === 'cancelled' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
        <button
          onClick={() => setSelectedCategory('conference')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'conference' 
              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Conference
        </button>
        <button
          onClick={() => setSelectedCategory('workshop')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'workshop' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Workshop
        </button>
        <button
          onClick={() => setSelectedCategory('campaign')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'campaign' 
              ? 'bg-orange-100 text-orange-700 border border-orange-200' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Campaign
        </button>
        <button
          onClick={() => setSelectedCategory('outreach')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'outreach' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Outreach
        </button>
        <button
          onClick={() => setSelectedCategory('fundraising')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'fundraising' 
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Fundraising
        </button>
      </div>

      {/* Events Grid */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <TrophyIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Events</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-12 text-center">
          <TrophyIcon className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Flagship Events Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start creating memorable events that align with SAYWHAT's mission. From conferences to community outreach,
            manage all your flagship events in one place.
          </p>
          {permissions?.canCreate && (
            <button
              onClick={() => setShowNewEventForm(true)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center mx-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Event
            </button>
          )}
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-200 overflow-hidden group">
                {/* Event Header with gradient background */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-b border-orange-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors">{event.name}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                      )}
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(event.status)} shadow-sm`}>
                          {event.status ? (event.status.charAt(0) + event.status.slice(1).toLowerCase()) : 'N/A'}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getCategoryColor(event.category)} shadow-sm`}>
                          {event.category ? (event.category.charAt(0) + event.category.slice(1).toLowerCase()) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons - Enhanced with bigger icons */}
                  <div className="flex justify-end space-x-2">
                    <button 
                      className="p-3 text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-lg border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md" 
                      title="View Details"
                      onClick={() => handleViewEvent(event)}
                    >
                      <EyeIcon className="h-6 w-6" />
                    </button>
                    <button 
                      className="p-3 text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 rounded-lg border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md" 
                      title="Print Event"
                      onClick={() => handlePrintEvent(event)}
                    >
                      <PrinterIcon className="h-6 w-6" />
                    </button>
                    {permissions?.canEdit && (
                      <button 
                        className="p-3 text-green-500 hover:text-green-700 hover:bg-green-50 transition-all duration-200 rounded-lg border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md" 
                        title="Edit"
                        onClick={() => handleEditClick(event)}
                      >
                        <PencilIcon className="h-6 w-6" />
                      </button>
                    )}
                    {permissions?.canDelete && (
                      <button 
                        className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-lg border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md" 
                        title="Delete"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Details with enhanced styling */}
                <div className="p-6">

                  {/* Event Details with bigger icons and better spacing */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <CalendarDaysIcon className="h-6 w-6 mr-3 text-orange-500" />
                      <div>
                        <span className="font-semibold">{new Date(event.startDate).toLocaleDateString()}</span>
                        {event.startTime && <span className="ml-2 text-gray-500">at {event.startTime}</span>}
                        {event.endDate !== event.startDate && (
                          <span className="ml-2 text-gray-500">- {new Date(event.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <MapPinIcon className="h-6 w-6 mr-3 text-red-500" />
                      <div>
                        <span className="font-semibold">{event.location}</span>
                        {event.venue && <span className="block text-gray-500">{event.venue}</span>}
                        {event.address && <span className="block text-gray-500 text-xs">{event.address}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <UsersIcon className="h-6 w-6 mr-3 text-blue-500" />
                      <div>
                        <span className="font-semibold">{event.expectedAttendees ? event.expectedAttendees.toLocaleString() : 'N/A'} expected</span>
                        {event.actualAttendees && (
                          <span className="block text-green-600 font-medium">{event.actualAttendees.toLocaleString()} actual</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <svg className="h-6 w-6 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <span className="font-semibold">Lead:</span>
                        <span className="ml-2">{getOrganizerName(event.organizer)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section - Enhanced */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">Documents</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border-2 border-dashed border-gray-200">
                      <span className="text-xs text-gray-500 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Documents will appear here
                      </span>
                    </div>
                  </div>

                  {/* Budget Section - Enhanced */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="h-8 w-8 mr-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <div>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(event.budget)}</p>
                          <p className="text-sm text-gray-600">Budget</p>
                          {event.actualCost && (
                            <p className="text-sm font-medium text-blue-600">Actual: {formatCurrency(event.actualCost)}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Action Buttons */}
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 bg-white text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg border border-blue-200 shadow-sm hover:shadow-md" 
                          title="Quick Actions"
                          onClick={() => handleViewEvent(event)}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Timeline View */
          <div className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Timeline</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline events */}
                <div className="space-y-8">
                  {events
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .map((event, index) => (
                    <div key={event.id} className="relative flex items-start">
                      {/* Timeline dot */}
                      <div className={`absolute left-6 w-4 h-4 rounded-full border-2 border-white shadow ${getCategoryColor(event.category)} z-10`}></div>
                      
                      {/* Event content */}
                      <div className="ml-16 bg-gray-50 rounded-lg p-4 w-full">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{event.name}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                {event.status ? (event.status.charAt(0) + event.status.slice(1).toLowerCase()) : 'N/A'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                                {event.category ? (event.category.charAt(0) + event.category.slice(1).toLowerCase()) : 'N/A'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                {event.startTime && <span className="ml-1">({event.startTime})</span>}
                              </div>
                              
                              <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{event.location}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{event.expectedAttendees ? event.expectedAttendees.toLocaleString() : 'N/A'} expected</span>
                              </div>
                            </div>
                            
                            {event.description && (
                              <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-900">Budget: {formatCurrency(event.budget)}</span>
                                {event.actualCost && (
                                  <span className="text-sm text-gray-500">Actual: {formatCurrency(event.actualCost)}</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                Lead: {getOrganizerName(event.organizer)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex space-x-1 ml-4">
                            <button 
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50" 
                              title="View Details"
                              onClick={() => handleViewEvent(event)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-50" 
                              title="Print Event"
                              onClick={() => handlePrintEvent(event)}
                            >
                              <PrinterIcon className="h-4 w-4" />
                            </button>
                            {permissions?.canEdit && (
                              <button 
                                className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded-full hover:bg-green-50" 
                                title="Edit"
                                onClick={() => handleEditClick(event)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                            {permissions?.canDelete && (
                              <button 
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50" 
                                title="Delete"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button 
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50" 
                              title="Print"
                              onClick={() => handlePrintEvent(event)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H4a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button 
                              className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded-full hover:bg-green-50" 
                              title="Download"
                              onClick={() => handleDownloadEvent(event.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* New Event Form Modal */}
      {showNewEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <TrophyIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  {editingEvent ? 'Edit Event' : 'Create New Flagship Event'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewEventForm(false);
                    setEditingEvent(null);
                    setUploadedDocuments([]);
                    setFormData({
                      name: '',
                      description: '',
                      objectives: [''],
                      startDate: '',
                      startTime: '',
                      endDate: '',
                      endTime: '',
                      location: '',
                      venue: '',
                      address: '',
                      expectedAttendees: 0,
                      actualAttendees: 0,
                      requiresRegistration: false,
                      registrationDeadline: '',
                      registrationFields: ['name', 'email', 'phone'],
                      status: 'planning',
                      category: 'conference',
                      budget: 0,
                      actualCost: 0,
                      organizer: '',
                      agenda: [],
                      speakers: [],
                      partners: []
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form className="p-6" onSubmit={editingEvent ? handleEditEvent : handleCreateEvent}>
              {/* Basic Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-5 h-5 bg-blue-100 rounded mr-2 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  Basic Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Event Name *
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Enter event name"
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Event Organizer *
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Enter organizer name or email"
                        value={formData.organizer} 
                        onChange={e => setFormData({ ...formData, organizer: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Description *
                    </label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Describe the event objectives, activities, and expected outcomes"
                      value={formData.description} 
                      onChange={e => setFormData({ ...formData, description: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Objectives *
                    </label>
                    <div className="space-y-3">
                      {formData.objectives.map((objective, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                              placeholder={`Objective ${index + 1}`}
                              value={objective}
                              onChange={e => updateObjective(index, e.target.value)}
                              required={index === 0}
                            />
                          </div>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeObjective(index)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addObjective}
                        className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Another Objective</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        value={formData.category} 
                        onChange={e => setFormData({ ...formData, category: e.target.value })} 
                        required
                      >
                        <option value="conference">Conference</option>
                        <option value="workshop">Workshop</option>
                        <option value="campaign">Campaign</option>
                        <option value="outreach">Outreach</option>
                        <option value="fundraising">Fundraising</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status *
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        value={formData.status} 
                        onChange={e => setFormData({ ...formData, status: e.target.value })} 
                        required
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date, Time & Location Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-5 h-5 bg-green-100 rounded mr-2 flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">2</span>
                  </div>
                  Date, Time & Location
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Start Date & Time</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            value={formData.startDate} 
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                          <input 
                            type="time" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            value={formData.startTime} 
                            onChange={e => setFormData({ ...formData, startTime: e.target.value })} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">End Date & Time</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            value={formData.endDate} 
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                          <input 
                            type="time" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            value={formData.endTime} 
                            onChange={e => setFormData({ ...formData, endTime: e.target.value })} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Province/Location *
                    </label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      value={formData.location} 
                      onChange={e => setFormData({ ...formData, location: e.target.value })} 
                      required
                    >
                      <option value="">Select Province</option>
                      <option value="Bulawayo">Bulawayo</option>
                      <option value="Harare">Harare</option>
                      <option value="Manicaland">Manicaland</option>
                      <option value="Mashonaland Central">Mashonaland Central</option>
                      <option value="Mashonaland East">Mashonaland East</option>
                      <option value="Mashonaland West">Mashonaland West</option>
                      <option value="Masvingo">Masvingo</option>
                      <option value="Matabeleland North">Matabeleland North</option>
                      <option value="Matabeleland South">Matabeleland South</option>
                      <option value="Midlands">Midlands</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Venue Name *
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="e.g., Harare Convention Centre"
                        value={formData.venue} 
                        onChange={e => setFormData({ ...formData, venue: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Address *
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Street address, city, postal code"
                        value={formData.address} 
                        onChange={e => setFormData({ ...formData, address: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget & Attendees Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-5 h-5 bg-purple-100 rounded mr-2 flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">3</span>
                  </div>
                  Budget & Attendees
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Budget (USD) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input 
                          type="number" 
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="0.00"
                          value={formData.budget} 
                          onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })} 
                          required 
                          min={0} 
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expected Attendees *
                      </label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="0"
                        value={formData.expectedAttendees} 
                        onChange={e => setFormData({ ...formData, expectedAttendees: Number(e.target.value) })} 
                        required 
                        min={0} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendee Registration Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-5 h-5 bg-indigo-100 rounded mr-2 flex items-center justify-center">
                    <span className="text-indigo-600 text-sm font-bold">4</span>
                  </div>
                  Attendee Registration
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="requiresRegistration"
                      checked={formData.requiresRegistration}
                      onChange={e => setFormData({ ...formData, requiresRegistration: e.target.checked })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="requiresRegistration" className="text-sm font-medium text-gray-700">
                      This event requires attendee registration
                    </label>
                  </div>

                  {formData.requiresRegistration && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Registration Deadline
                        </label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          value={formData.registrationDeadline} 
                          onChange={e => setFormData({ ...formData, registrationDeadline: e.target.value })} 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Registration Form Fields
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { id: 'name', label: 'Full Name', required: true },
                            { id: 'email', label: 'Email Address', required: true },
                            { id: 'phone', label: 'Phone Number', required: false },
                            { id: 'organization', label: 'Organization', required: false },
                            { id: 'position', label: 'Job Title', required: false },
                            { id: 'dietary', label: 'Dietary Requirements', required: false },
                            { id: 'accessibility', label: 'Accessibility Needs', required: false },
                            { id: 'emergency', label: 'Emergency Contact', required: false }
                          ].map(field => (
                            <div key={field.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={field.id}
                                checked={formData.registrationFields.includes(field.id)}
                                onChange={e => handleRegistrationFieldChange(field.id, e.target.checked)}
                                disabled={field.required}
                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50"
                              />
                              <label htmlFor={field.id} className="text-sm text-gray-700">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h4 className="text-sm font-medium text-blue-900">Registration Form Generation</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              A public registration form will be automatically created with the selected fields. 
                              Attendees can register online and you'll receive notifications for new registrations.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Management Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-5 h-5 bg-yellow-100 rounded mr-2 flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-bold">5</span>
                  </div>
                  Event Documents
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  {/* Document Upload Areas */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Concept Document */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition-colors">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Concept Document</h4>
                        <p className="text-sm text-gray-600 mb-3">Event proposal & concept</p>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => handleDocumentUpload(e.target.files, 'concept')}
                            multiple
                          />
                          <span className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors">
                            Upload Files
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Budget Document */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition-colors">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Budget Document</h4>
                        <p className="text-sm text-gray-600 mb-3">Detailed budget breakdown</p>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.xlsx,.xls,.csv"
                            onChange={(e) => handleDocumentUpload(e.target.files, 'budget')}
                            multiple
                          />
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                            Upload Files
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Report Document */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition-colors">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H4a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Event Report</h4>
                        <p className="text-sm text-gray-600 mb-3">Post-event reports</p>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleDocumentUpload(e.target.files, 'report')}
                            multiple
                          />
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                            Upload Files
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents List */}
                  {uploadedDocuments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents ({uploadedDocuments.length})</h4>
                      <div className="space-y-2">
                        {uploadedDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                doc.type === 'concept' ? 'bg-green-100' :
                                doc.type === 'budget' ? 'bg-blue-100' :
                                doc.type === 'report' ? 'bg-purple-100' : 'bg-gray-100'
                              }`}>
                                <svg className={`h-4 w-4 ${
                                  doc.type === 'concept' ? 'text-green-600' :
                                  doc.type === 'budget' ? 'text-blue-600' :
                                  doc.type === 'report' ? 'text-purple-600' : 'text-gray-600'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-sm text-gray-500">
                                  {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} • {formatFileSize(doc.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  * Required fields
                </p>
                <div className="flex space-x-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowNewEventForm(false);
                      setEditingEvent(null);
                      setUploadedDocuments([]);
                      setFormData({
                        name: '',
                        description: '',
                        objectives: [''],
                        startDate: '',
                        startTime: '',
                        endDate: '',
                        endTime: '',
                        location: '',
                        venue: '',
                        address: '',
                        expectedAttendees: 0,
                        actualAttendees: 0,
                        requiresRegistration: false,
                        registrationDeadline: '',
                        registrationFields: ['name', 'email', 'phone'],
                        status: 'planning',
                        category: 'conference',
                        budget: 0,
                        actualCost: 0,
                        organizer: '',
                        agenda: [],
                        speakers: [],
                        partners: []
                      });
                    }} 
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center"
                  >
                    <TrophyIcon className="h-4 w-4 mr-2" />
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedEvent.name}</h2>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white`}>
                      {selectedEvent.status ? (selectedEvent.status.charAt(0) + selectedEvent.status.slice(1).toLowerCase()) : 'N/A'}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white`}>
                      {selectedEvent.category ? (selectedEvent.category.charAt(0) + selectedEvent.category.slice(1).toLowerCase()) : 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Description */}
              {selectedEvent.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Date & Time */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CalendarDaysIcon className="h-6 w-6 mr-2 text-orange-500" />
                    Date & Time
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Start:</strong> {new Date(selectedEvent.startDate).toLocaleDateString()}</p>
                    {selectedEvent.startTime && <p><strong>Time:</strong> {selectedEvent.startTime}</p>}
                    {selectedEvent.endDate !== selectedEvent.startDate && (
                      <p><strong>End:</strong> {new Date(selectedEvent.endDate).toLocaleDateString()}</p>
                    )}
                    {selectedEvent.endTime && <p><strong>End Time:</strong> {selectedEvent.endTime}</p>}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPinIcon className="h-6 w-6 mr-2 text-red-500" />
                    Location
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Location:</strong> {selectedEvent.location}</p>
                    {selectedEvent.venue && <p><strong>Venue:</strong> {selectedEvent.venue}</p>}
                    {selectedEvent.address && <p><strong>Address:</strong> {selectedEvent.address}</p>}
                  </div>
                </div>

                {/* Attendance */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <UsersIcon className="h-6 w-6 mr-2 text-blue-500" />
                    Attendance
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Expected:</strong> {selectedEvent.expectedAttendees ? selectedEvent.expectedAttendees.toLocaleString() : 'N/A'}</p>
                    {selectedEvent.actualAttendees && (
                      <p><strong>Actual:</strong> <span className="text-green-600 font-medium">{selectedEvent.actualAttendees.toLocaleString()}</span></p>
                    )}
                  </div>
                </div>

                {/* Budget */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Budget
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Budget:</strong> {formatCurrency(selectedEvent.budget)}</p>
                    {selectedEvent.actualCost && (
                      <p><strong>Actual Cost:</strong> <span className="text-blue-600 font-medium">{formatCurrency(selectedEvent.actualCost)}</span></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Organizer */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Event Organizer
                </h3>
                <p><strong>Lead:</strong> {getOrganizerName(selectedEvent.organizer)}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {permissions?.canEdit && (
                  <button
                    onClick={() => {
                      handleEditClick(selectedEvent);
                      setSelectedEvent(null);
                    }}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
