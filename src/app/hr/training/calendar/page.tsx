"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline"

interface CalendarEvent {
  id: string
  title: string
  type: 'session' | 'deadline' | 'exam' | 'enrollment'
  startTime: string
  endTime: string
  date: string
  location?: string
  instructor?: string
  participants?: number
  capacity?: number
  program: string
  category: string
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
}

export default function TrainingCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Sample calendar events
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Leadership Workshop Session 1",
      type: "session",
      startTime: "09:00",
      endTime: "12:00",
      date: "2024-01-22",
      location: "Conference Room A",
      instructor: "Dr. Sarah Johnson",
      participants: 25,
      capacity: 30,
      program: "Leadership Development Program",
      category: "Leadership",
      status: "scheduled"
    },
    {
      id: "2",
      title: "Python Data Analysis Lab",
      type: "session",
      startTime: "14:00",
      endTime: "17:00",
      date: "2024-01-22",
      location: "Computer Lab",
      instructor: "Michael Chen",
      participants: 18,
      capacity: 25,
      program: "Data Analysis with Python",
      category: "Technical Skills",
      status: "scheduled"
    },
    {
      id: "3",
      title: "Assignment Deadline",
      type: "deadline",
      startTime: "23:59",
      endTime: "23:59",
      date: "2024-01-25",
      program: "Leadership Development Program",
      category: "Leadership",
      status: "scheduled"
    },
    {
      id: "4",
      title: "Financial Management Enrollment Closes",
      type: "enrollment",
      startTime: "17:00",
      endTime: "17:00",
      date: "2024-01-30",
      program: "Financial Management Basics",
      category: "Professional Development",
      status: "scheduled"
    },
    {
      id: "5",
      title: "Safety Training Assessment",
      type: "exam",
      startTime: "10:00",
      endTime: "11:30",
      date: "2024-01-26",
      location: "Training Room B",
      participants: 150,
      capacity: 200,
      program: "Workplace Safety Training",
      category: "Safety",
      status: "scheduled"
    }
  ]

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getEventsForDate = (date: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return events.filter(event => event.date === dateString)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'session': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200'
      case 'exam': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'enrollment': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'session': return <AcademicCapIcon className="h-3 w-3" />
      case 'deadline': return <ClockIcon className="h-3 w-3" />
      case 'exam': return <CalendarIcon className="h-3 w-3" />
      case 'enrollment': return <UserGroupIcon className="h-3 w-3" />
      default: return <CalendarIcon className="h-3 w-3" />
    }
  }

  const sidebarContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Training Sessions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Assignment Deadlines</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Assessments/Exams</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Enrollment Periods</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Total Events:</span>
            <span className="font-medium">{events.length}</span>
          </div>
          <div className="flex justify-between">
            <span>This Month:</span>
            <span className="font-medium">
              {events.filter(event => {
                const eventDate = new Date(event.date)
                return eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear()
              }).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Active Programs:</span>
            <span className="font-medium">
              {new Set(events.map(event => event.program)).size}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
        <div className="space-y-2">
          {events
            .filter(event => new Date(event.date) >= new Date())
            .slice(0, 3)
            .map(event => (
              <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-900">{event.title}</p>
                <p className="text-xs text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">{event.startTime}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )

  return (
    <ModulePage
      metadata={{
        title: "Training Calendar",
        description: "View and manage training schedules and events",
        breadcrumbs: [
          { name: "HR", href: "/hr" },
          { name: "Training", href: "/hr/training" },
          { name: "Calendar" }
        ]
      }}
      sidebar={sidebarContent}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/hr/training" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Training Programs
          </Link>
        </div>

        <div className="bg-white shadow-sm border rounded-lg">
          {/* Calendar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant={viewMode === 'month' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
                <Button 
                  variant={viewMode === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={viewMode === 'day' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {daysOfWeek.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {getDaysInMonth().map((day, index) => {
                  const dayEvents = day ? getEventsForDate(day) : []
                  const isToday = day === new Date().getDate() && 
                                  currentDate.getMonth() === new Date().getMonth() && 
                                  currentDate.getFullYear() === new Date().getFullYear()
                  
                  return (
                    <div key={index} className="min-h-24 border border-gray-100 p-1">
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
                          }`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map(event => (
                              <div
                                key={event.id}
                                className={`px-1 py-0.5 rounded text-xs border cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                                onClick={() => setSelectedEvent(event)}
                              >
                                <div className="flex items-center gap-1">
                                  {getEventTypeIcon(event.type)}
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-gray-500 px-1">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {viewMode === 'week' && (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Week view coming soon...</p>
              </div>
            )}

            {viewMode === 'day' && (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Day view coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  
                  {selectedEvent.instructor && (
                    <div className="flex items-center gap-2">
                      <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                      <span>{selectedEvent.instructor}</span>
                    </div>
                  )}
                  
                  {selectedEvent.participants && selectedEvent.capacity && (
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-4 w-4 text-gray-400" />
                      <span>{selectedEvent.participants}/{selectedEvent.capacity} participants</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <p className="font-medium text-gray-900">Program:</p>
                    <p className="text-gray-600">{selectedEvent.program}</p>
                  </div>
                  
                  <div className="pt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(selectedEvent.type)}`}>
                      {getEventTypeIcon(selectedEvent.type)}
                      <span className="ml-1 capitalize">{selectedEvent.type}</span>
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                    Close
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
