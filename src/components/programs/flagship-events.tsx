"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrophyIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon
} from "@heroicons/react/24/outline"

interface FlagshipEvent {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'Cancelled'
  lead: string
  venue: string
  expectedAttendees: number
  documents: {
    conceptNote: boolean
    budget: boolean
    eventReport: boolean
  }
  category: string
}

const flagshipEvents: FlagshipEvent[] = [
  {
    id: '1',
    name: 'Agriculture Colleges Sports Gala',
    description: 'Annual sports competition for agriculture colleges across the region',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    status: 'Planning',
    lead: 'Sarah Johnson',
    venue: 'National Sports Complex',
    expectedAttendees: 500,
    documents: {
      conceptNote: true,
      budget: true,
      eventReport: false
    },
    category: 'Sports'
  },
  {
    id: '2',
    name: 'SAYWHAT Quiz and SASI Debate Challenge',
    description: 'Academic competition combining quiz and debate formats',
    startDate: '2024-04-20',
    endDate: '2024-04-21',
    status: 'Planning',
    lead: 'Michael Chen',
    venue: 'University Auditorium',
    expectedAttendees: 200,
    documents: {
      conceptNote: true,
      budget: false,
      eventReport: false
    },
    category: 'Academic'
  },
  {
    id: '3',
    name: 'The Chase and CRAFT',
    description: 'Creative arts and talent showcase event',
    startDate: '2024-05-10',
    endDate: '2024-05-12',
    status: 'In Progress',
    lead: 'Emma Wilson',
    venue: 'Cultural Center',
    expectedAttendees: 300,
    documents: {
      conceptNote: true,
      budget: true,
      eventReport: false
    },
    category: 'Arts'
  },
  {
    id: '4',
    name: 'National Students Conference',
    description: 'Annual gathering of student representatives nationwide',
    startDate: '2024-06-15',
    endDate: '2024-06-18',
    status: 'Planning',
    lead: 'David Brown',
    venue: 'Convention Center',
    expectedAttendees: 800,
    documents: {
      conceptNote: true,
      budget: true,
      eventReport: false
    },
    category: 'Conference'
  },
  {
    id: '5',
    name: 'Orathon',
    description: 'Oral presentation and public speaking competition',
    startDate: '2024-07-08',
    endDate: '2024-07-09',
    status: 'Planning',
    lead: 'Lisa Anderson',
    venue: 'Community Hall',
    expectedAttendees: 150,
    documents: {
      conceptNote: false,
      budget: false,
      eventReport: false
    },
    category: 'Competition'
  },
  {
    id: '6',
    name: 'Web for Life Symposium',
    description: 'Technology and digital literacy symposium',
    startDate: '2024-08-12',
    endDate: '2024-08-14',
    status: 'Planning',
    lead: 'James Wilson',
    venue: 'Tech Hub',
    expectedAttendees: 250,
    documents: {
      conceptNote: true,
      budget: false,
      eventReport: false
    },
    category: 'Technology'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Planning': return 'bg-blue-100 text-blue-800'
    case 'In Progress': return 'bg-yellow-100 text-yellow-800'
    case 'Completed': return 'bg-green-100 text-green-800'
    case 'Cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function FlagshipEvents() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('grid')

  const categories = ['All', 'Sports', 'Academic', 'Arts', 'Conference', 'Competition', 'Technology']
  
  const filteredEvents = selectedCategory === 'All' 
    ? flagshipEvents 
    : flagshipEvents.filter(event => event.category === selectedCategory)

  const eventStats = {
    total: flagshipEvents.length,
    planning: flagshipEvents.filter(e => e.status === 'Planning').length,
    inProgress: flagshipEvents.filter(e => e.status === 'In Progress').length,
    completed: flagshipEvents.filter(e => e.status === 'Completed').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SAYWHAT Flagship Events</h2>
          <p className="text-gray-600 mt-2">
            Manage non-donor-funded SAYWHAT events with timeline planning and document management
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button 
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
          >
            Timeline View
          </Button>
          <Button className="bg-saywhat-orange hover:bg-saywhat-orange/90">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <TrophyIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{eventStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planning</CardTitle>
            <ClockIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{eventStats.planning}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <ClockIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{eventStats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrophyIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{eventStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "bg-saywhat-orange hover:bg-saywhat-orange/90" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Events Grid/Timeline */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                    <span>{event.startDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-4 w-4 text-gray-500" />
                    <span>{event.expectedAttendees}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Lead:</span> {event.lead}
                  </div>
                </div>

                {/* Document Status */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Documents:</span>
                    <Button variant="outline" size="sm">
                      <DocumentArrowUpIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={`p-1 rounded text-center ${event.documents.conceptNote ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      Concept
                    </div>
                    <div className={`p-1 rounded text-center ${event.documents.budget ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      Budget
                    </div>
                    <div className={`p-1 rounded text-center ${event.documents.eventReport ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      Report
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Timeline View
        <div className="space-y-4">
          <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline View</h3>
            <p className="text-gray-600">
              Timeline visualization for flagship events will be implemented here.
              This will show events on a month-based timeline with specific dates.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
