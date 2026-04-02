"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  TrophyIcon,
  PlusIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  XMarkIcon,
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

export function ProjectCalendar({ permissions, onItemSelect }: ProjectCalendarProps) {
  const { data: session, status } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const initialLoadDone = useRef(false)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  /** Visible grid range as YYYY-MM-DD (local calendar), for API date scope */
  const visibleDateRange = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const toYmd = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

    if (viewMode === 'year') {
      const y = currentDate.getFullYear()
      return { from: `${y}-01-01`, to: `${y}-12-31` }
    }

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const gridStart = new Date(firstDay)
    gridStart.setDate(gridStart.getDate() - firstDay.getDay())
    const gridEnd = new Date(gridStart)
    gridEnd.setDate(gridEnd.getDate() + 41)
    return { from: toYmd(gridStart), to: toYmd(gridEnd) }
  }, [viewMode, currentDate])

  const fetchCalendarData = useCallback(
    async (signal?: AbortSignal) => {
      const { from, to } = visibleDateRange
      const showFullSkeleton = !initialLoadDone.current

      try {
        if (showFullSkeleton) {
          setLoading(true)
        } else {
          setRefreshing(true)
        }
        setError(null)

        const params = new URLSearchParams()
        params.set('from', from)
        params.set('to', to)
        params.set('limit', '5000')

        const eventsRes = await fetch(`/api/programs/events?${params.toString()}`, {
          signal,
        })

        if (!eventsRes.ok) {
          const errorData = await eventsRes.text()
          console.error('Events API error:', eventsRes.status, errorData)
          throw new Error(`Failed to fetch events: ${eventsRes.status} ${errorData}`)
        }

        const eventsData = await eventsRes.json()

        const events: CalendarEvent[] = []

        if (eventsData.events && Array.isArray(eventsData.events)) {
          eventsData.events.forEach((event: any) => {
            if (event.startDate) {
              events.push({
                id: event.id,
                title: event.name || event.title,
                type: 'event',
                startDate: new Date(event.startDate),
                endDate: event.endDate
                  ? new Date(event.endDate)
                  : new Date(event.startDate),
                status: event.status,
                category: event.category || event.type,
                venue: event.venue || event.location,
                description: event.description,
                budget: event.budget,
                organizer:
                  typeof event.organizer === 'object' && event.organizer?.name
                    ? event.organizer.name
                    : event.organizer,
                color: getEventColor(event.category || event.type, event.status),
              })
            }
          })
        } else if (eventsData && Array.isArray(eventsData)) {
          eventsData.forEach((event: any) => {
            if (event.startDate) {
              events.push({
                id: event.id,
                title: event.name || event.title,
                type: 'event',
                startDate: new Date(event.startDate),
                endDate: event.endDate
                  ? new Date(event.endDate)
                  : new Date(event.startDate),
                status: event.status,
                category: event.category || event.type,
                venue: event.venue || event.location,
                description: event.description,
                budget: event.budget,
                organizer:
                  typeof event.organizer === 'object' && event.organizer?.name
                    ? event.organizer.name
                    : event.organizer,
                color: getEventColor(event.category || event.type, event.status),
              })
            }
          })
        }

        setCalendarEvents(events)
        initialLoadDone.current = true
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Calendar data fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load calendar data')
        setCalendarEvents([])
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [visibleDateRange]
  )

  // Fetch flagship events for the visible month grid or year (date-scoped API)
  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      setError('Authentication required')
      setLoading(false)
      return
    }

    if (status === 'authenticated' && session) {
      const ac = new AbortController()
      fetchCalendarData(ac.signal)
      return () => ac.abort()
    }
  }, [status, session, fetchCalendarData])

  const getEventColor = (category: string, status: string): string => {
    if (status === 'CANCELLED') return '#6b7280' // gray
    
    switch (category?.toLowerCase()) {
      case 'conference': return '#06b6d4' // cyan
      case 'workshop': return '#8b5cf6' // purple
      case 'campaign': return '#f59e0b' // amber
      case 'outreach': return '#10b981' // green
      case 'competitions':
      case 'fundraising': return '#ef4444' // red (fundraising = legacy stored type)
      default: return '#3b82f6' // blue
    }
  }

  const filteredEvents = useMemo(() => calendarEvents, [calendarEvents])

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

  // Full-page skeleton only before the first successful load
  if (loading && calendarEvents.length === 0 && !error) {
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
            onClick={() => void fetchCalendarData()}
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
              <h2 className="text-xl font-bold text-gray-900">
                SAYWHAT Flagship Events Calendar
              </h2>
              <p className="text-gray-600">
                Monthly and yearly views of flagship events only (projects are not shown).
                Events load for the visible period — no 500-row cap.
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

      {/* Legend */}
      <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-950">
        This calendar lists the same flagship events as the{" "}
        <span className="font-semibold">SAYWHAT Flagship Events</span> tab. Program
        projects are managed under <span className="font-semibold">Projects</span>.
      </div>

      {/* Calendar Navigation */}
      <div className="relative flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 overflow-hidden">
        {refreshing && (
          <div
            className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-pulse"
            aria-hidden
          />
        )}
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
            {filteredEvents.length} flagship event
            {filteredEvents.length !== 1 ? 's' : ''}
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
                        title={event.title}
                      >
                        <div className="flex items-center space-x-1">
                          <TrophyIcon className="h-3 w-3 flex-shrink-0" />
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
                    {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}
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
                      <TrophyIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
            <TrophyIcon className="h-8 w-8 text-amber-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                In this period
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {calendarEvents.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In planning</p>
              <p className="text-2xl font-semibold text-gray-900">
                {calendarEvents.filter(
                  e => String(e.status).toLowerCase() === 'planning'
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-amber-500" />
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

      {/* Flagship event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrophyIcon className="h-6 w-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Flagship event
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
                      Venue / location
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
                {selectedEvent.budget != null && selectedEvent.budget > 0 && (
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
