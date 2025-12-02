"use client"

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  FlagIcon,
  TrophyIcon,
  EyeIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  XMarkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface CalendarEvent {
  id: string
  title: string
  type: 'project' | 'event'
  startDate: Date
  endDate: Date
  status: string
  category?: string
  priority?: string
  venue?: string
  description?: string
  color: string
  budget?: number
  progress?: number
  manager?: string
  organizer?: string
}

interface ProjectCalendarProps {
  permissions: any
  onItemSelect?: (id: string, type: 'project' | 'event') => void
}

type ViewMode = 'month' | 'year'
type FilterType = 'all' | 'projects' | 'events'

export function ProjectCalendar({ permissions, onItemSelect }: ProjectCalendarProps) {
  const { data: session, status } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Fetch projects and events data
  useEffect(() => {
    // Only fetch data when session is available
    if (status === 'loading') {
      return // Still loading session
    }
    
    if (status === 'unauthenticated') {
      setError('Authentication required')
      setLoading(false)
      return
    }
    
    if (status === 'authenticated' && session) {
      // Prevent multiple rapid calls
      let isMounted = true
      
      // Add a small delay to prevent immediate API calls on mount
      const timer = setTimeout(() => {
        if (isMounted) {
          fetchCalendarData()
        }
      }, 500)
      
      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    }
  }, [status, session]) // Depend on session status

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch real data from API
      const [projectsRes, eventsRes] = await Promise.all([
        fetch('/api/programs/projects'),
        fetch('/api/programs/events?limit=100')
      ])

      if (!projectsRes.ok) {
        const errorData = await projectsRes.text()
        console.error('Projects API error:', projectsRes.status, errorData)
        throw new Error(`Failed to fetch projects: ${projectsRes.status} ${errorData}`)
      }
      
      if (!eventsRes.ok) {
        const errorData = await eventsRes.text()
        console.error('Events API error:', eventsRes.status, errorData)
        throw new Error(`Failed to fetch events: ${eventsRes.status} ${errorData}`)
      }

      const [projectsData, eventsData] = await Promise.all([
        projectsRes.json(),
        eventsRes.json()
      ])

      const events: CalendarEvent[] = []

      // Transform projects
      if (projectsData.success && projectsData.data) {
        projectsData.data.forEach((project: any) => {
          if (project.startDate) {
            events.push({
              id: project.id,
              title: project.name,
              type: 'project',
              startDate: new Date(project.startDate),
              endDate: project.endDate ? new Date(project.endDate) : new Date(project.startDate),
              status: project.status,
              priority: project.priority,
              description: project.description,
              budget: project.budget,
              progress: project.progress,
              manager: project.manager?.name,
              color: getProjectColor(project.status, project.priority)
            })
          }
        })
      }

      // Transform events
      if (eventsData.events && Array.isArray(eventsData.events)) {
        eventsData.events.forEach((event: any) => {
          if (event.startDate) {
            events.push({
              id: event.id,
              title: event.name || event.title,
              type: 'event',
              startDate: new Date(event.startDate),
              endDate: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
              status: event.status,
              category: event.category || event.type,
              venue: event.location,
              description: event.description,
              budget: event.budget,
              organizer: event.organizer?.name,
              color: getEventColor(event.category || event.type, event.status)
            })
          }
        })
      } else if (eventsData && Array.isArray(eventsData)) {
        // Handle direct array response
        eventsData.forEach((event: any) => {
          if (event.startDate) {
            events.push({
              id: event.id,
              title: event.name || event.title,
              type: 'event',
              startDate: new Date(event.startDate),
              endDate: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
              status: event.status,
              category: event.category || event.type,
              venue: event.location,
              description: event.description,
              budget: event.budget,
              organizer: event.organizer?.name,
              color: getEventColor(event.category || event.type, event.status)
            })
          }
        })
      }

      setCalendarEvents(events)
    } catch (err) {
      console.error('Calendar data fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load calendar data')
      // Set empty events array on error to prevent further attempts
      setCalendarEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getProjectColor = (status: string, priority: string): string => {
    if (status === 'COMPLETED') return '#10b981' // green
    if (status === 'ACTIVE') {
      if (priority === 'HIGH') return '#ef4444' // red
      if (priority === 'MEDIUM') return '#f59e0b' // amber
      return '#3b82f6' // blue
    }
    if (status === 'ON_HOLD') return '#6b7280' // gray
    return '#8b5cf6' // purple for planning
  }

  const getEventColor = (category: string, status: string): string => {
    if (status === 'CANCELLED') return '#6b7280' // gray
    
    switch (category?.toLowerCase()) {
      case 'conference': return '#06b6d4' // cyan
      case 'workshop': return '#8b5cf6' // purple
      case 'campaign': return '#f59e0b' // amber
      case 'outreach': return '#10b981' // green
      case 'fundraising': return '#ef4444' // red
      default: return '#3b82f6' // blue
    }
  }

  // Filter events based on current filter
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter(event => {
      if (filterType === 'projects') return event.type === 'project'
      if (filterType === 'events') return event.type === 'event'
      return true
    })
  }, [calendarEvents, filterType])

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      eventStart.setHours(0, 0, 0, 0)
      eventEnd.setHours(23, 59, 59, 999)
      date.setHours(12, 0, 0, 0)
      return date >= eventStart && date <= eventEnd
    })
  }

  // Generate calendar days for month view
  const generateMonthDays = (): Date[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: Date[] = []
    const current = new Date(startDate)
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Generate months for year view
  const generateYearMonths = (): Date[] => {
    const year = currentDate.getFullYear()
    const months: Date[] = []
    
    for (let month = 0; month < 12; month++) {
      months.push(new Date(year, month, 1))
    }
    
    return months
  }

  // Navigation functions
  const navigatePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))
    }
  }

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading calendar: {error}</p>
          <button 
            onClick={fetchCalendarData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Project & Event Calendar</h2>
              <p className="text-gray-600">
                Planning overview with monthly and yearly perspectives
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ViewColumnsIcon className="h-4 w-4 inline mr-1" />
              Month
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'year'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4 inline mr-1" />
              Year
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 border rounded-md text-sm ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Filters
          </button>

          {permissions?.canCreate && (
            <Link 
              href="/programs?tab=saywhat-events&action=new-event"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Event
            </Link>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Items
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="filterType"
                    value="all"
                    checked={filterType === 'all'}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="mr-2"
                  />
                  All
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="filterType"
                    value="projects"
                    checked={filterType === 'projects'}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="mr-2"
                  />
                  Projects Only
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="filterType"
                    value="events"
                    checked={filterType === 'events'}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="mr-2"
                  />
                  Events Only
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-sm text-gray-600">Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-sm text-gray-600">Events</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={navigatePrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === 'month' 
              ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : currentDate.getFullYear()
            }
          </h3>
          
          <button
            onClick={navigateNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Today
          </button>
          
          <div className="text-sm text-gray-600">
            {filteredEvents.length} items
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {generateMonthDays().map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={index}
                  className={`min-h-32 p-2 border-b border-r border-gray-200 ${
                    !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                  } ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    !isCurrentMonth 
                      ? 'text-gray-400' 
                      : isToday 
                        ? 'text-blue-600' 
                        : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event)
                          onItemSelect?.(event.id, event.type)
                        }}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: event.color, color: 'white' }}
                        title={`${event.title} (${event.type})`}
                      >
                        <div className="flex items-center space-x-1">
                          {event.type === 'project' ? (
                            <FlagIcon className="h-3 w-3" />
                          ) : (
                            <TrophyIcon className="h-3 w-3" />
                          )}
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // Year View
        <div className="grid grid-cols-3 gap-6">
          {generateYearMonths().map((monthDate, index) => {
            const monthEvents = filteredEvents.filter(event => {
              const eventDate = new Date(event.startDate)
              return eventDate.getFullYear() === monthDate.getFullYear() &&
                     eventDate.getMonth() === monthDate.getMonth()
            })

            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    {monthNames[monthDate.getMonth()]}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {monthEvents.length} items
                  </span>
                </div>
                
                <div className="space-y-2">
                  {monthEvents.slice(0, 5).map(event => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event)
                        onItemSelect?.(event.id, event.type)
                      }}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: event.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.startDate.toLocaleDateString()}
                        </div>
                      </div>
                      {event.type === 'project' ? (
                        <FlagIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <TrophyIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                  {monthEvents.length > 5 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      +{monthEvents.length - 5} more items
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <FlagIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-2xl font-semibold text-gray-900">
                {calendarEvents.filter(e => e.type === 'project').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">
                {calendarEvents.filter(e => e.type === 'event').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-amber-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredEvents.filter(event => {
                  const eventDate = new Date(event.startDate)
                  const now = new Date()
                  return eventDate.getMonth() === now.getMonth() && 
                         eventDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredEvents.filter(event => {
                  const eventDate = new Date(event.startDate)
                  const now = new Date()
                  return eventDate > now
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event/Project Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {selectedEvent.type === 'project' ? (
                  <FlagIcon className="h-6 w-6 text-blue-600" />
                ) : (
                  <TrophyIcon className="h-6 w-6 text-green-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent.type === 'project' ? 'Project Details' : 'Event Details'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedEvent.title}</h4>
                <span 
                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize"
                  style={{ backgroundColor: selectedEvent.color + '20', color: selectedEvent.color }}
                >
                  {selectedEvent.status}
                </span>
              </div>

              {selectedEvent.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{selectedEvent.startDate.toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{selectedEvent.endDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedEvent.type === 'project' ? (
                <div className="space-y-3">
                  {selectedEvent.priority && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <span className="text-sm text-gray-600 capitalize">{selectedEvent.priority}</span>
                    </div>
                  )}
                  {selectedEvent.manager && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manager
                      </label>
                      <span className="text-sm text-gray-600">{selectedEvent.manager}</span>
                    </div>
                  )}
                  {selectedEvent.budget && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget
                      </label>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>${selectedEvent.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  {selectedEvent.progress !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Progress
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${selectedEvent.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{selectedEvent.progress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvent.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <span className="text-sm text-gray-600 capitalize">{selectedEvent.category}</span>
                    </div>
                  )}
                  {selectedEvent.venue && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Venue
                      </label>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{selectedEvent.venue}</span>
                      </div>
                    </div>
                  )}
                  {selectedEvent.organizer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organizer
                      </label>
                      <span className="text-sm text-gray-600">{selectedEvent.organizer}</span>
                    </div>
                  )}
                  {selectedEvent.budget && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget
                      </label>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>${selectedEvent.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    onItemSelect?.(selectedEvent.id, selectedEvent.type)
                    setSelectedEvent(null)
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
