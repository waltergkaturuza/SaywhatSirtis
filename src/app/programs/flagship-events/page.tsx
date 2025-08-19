"use client"

import React from 'react'
import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Leaf,
  ArrowLeft,
  Star,
  Heart,
  Zap
} from 'lucide-react'

const SAYWHAT_COLORS = {
  orange: '#ff6b35',
  red: '#dc2626', 
  grey: '#6b7280',
  dark: '#1f2937',
  lightGrey: '#f3f4f6'
}

const flagshipEvents = [
  {
    id: 1,
    title: "Agriculture & Sports Gala",
    description: "Annual celebration combining agricultural innovation with community sports",
    status: "Active",
    category: "Community Development",
    participants: "500+",
    frequency: "Annual",
    icon: Leaf,
    color: SAYWHAT_COLORS.orange,
    link: "/programs/flagship-events/agriculture-sports-gala"
  },
  {
    id: 2,
    title: "Youth Leadership Summit",
    description: "Empowering young leaders through training and mentorship programs",
    status: "Planning",
    category: "Youth Development",
    participants: "200+",
    frequency: "Bi-Annual",
    icon: Star,
    color: SAYWHAT_COLORS.red
  },
  {
    id: 3,
    title: "Community Health Fair",
    description: "Comprehensive health screenings and wellness education for all",
    status: "Upcoming",
    category: "Health & Wellness",
    participants: "1000+",
    frequency: "Annual",
    icon: Heart,
    color: SAYWHAT_COLORS.grey
  }
]

export default function FlagshipEventsPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
          <p className="mt-4 text-saywhat-grey">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated" || !session) {
    window.location.href = "/auth/signin"
    return null
  }

  return (
    <DashboardLayout>
      <div className="px-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/programs'}
              className="border-saywhat-grey hover:bg-saywhat-light-grey"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-saywhat-dark">Flagship Events</h1>
              <p className="mt-2 text-saywhat-grey">Signature SAYWHAT programs making lasting community impact</p>
            </div>
            <Badge 
              variant="secondary" 
              className="text-white"
              style={{ backgroundColor: SAYWHAT_COLORS.orange }}
            >
              {flagshipEvents.length} Active Programs
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Flagship Events Overview */}
          <div 
            className="rounded-lg p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${SAYWHAT_COLORS.orange} 0%, ${SAYWHAT_COLORS.red} 50%, ${SAYWHAT_COLORS.dark} 100%)`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">SAYWHAT Flagship Events</h2>
                <p className="text-orange-100 text-lg mb-4">
                  Signature programs that define our commitment to community development and empowerment
                </p>
                <div className="flex space-x-6 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Year-Round Programming</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Community Wide Impact</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>Award Winning</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <Zap className="h-16 w-16 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flagshipEvents.map((event) => {
              const IconComponent = event.icon
              return (
                <Card key={event.id} className="border-saywhat-grey hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${event.color}20` }}>
                        <IconComponent className="h-6 w-6" style={{ color: event.color }} />
                      </div>
                      <Badge 
                        variant={event.status === 'Active' ? 'default' : 'secondary'}
                        style={{ 
                          backgroundColor: event.status === 'Active' ? SAYWHAT_COLORS.orange : SAYWHAT_COLORS.grey,
                          color: 'white'
                        }}
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-saywhat-dark">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-saywhat-grey mb-4">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-saywhat-grey">Category</span>
                        <span className="text-sm font-medium text-saywhat-dark">{event.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-saywhat-grey">Participants</span>
                        <span className="text-sm font-medium text-saywhat-dark">{event.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-saywhat-grey">Frequency</span>
                        <span className="text-sm font-medium text-saywhat-dark">{event.frequency}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {event.link ? (
                        <Button 
                          size="sm"
                          onClick={() => window.location.href = event.link}
                          className="text-white flex-1"
                          style={{ backgroundColor: event.color }}
                        >
                          View Details
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          style={{ borderColor: event.color, color: event.color }}
                        >
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Program Impact Summary */}
          <Card className="border-saywhat-grey">
            <CardHeader>
              <CardTitle className="text-saywhat-dark">Flagship Program Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: SAYWHAT_COLORS.orange }}>
                    1,700+
                  </div>
                  <p className="text-saywhat-grey">Total Participants</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: SAYWHAT_COLORS.red }}>
                    3
                  </div>
                  <p className="text-saywhat-grey">Active Programs</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: SAYWHAT_COLORS.grey }}>
                    12
                  </div>
                  <p className="text-saywhat-grey">Communities Served</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: SAYWHAT_COLORS.dark }}>
                    95%
                  </div>
                  <p className="text-saywhat-grey">Satisfaction Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              className="text-white"
              style={{ backgroundColor: SAYWHAT_COLORS.orange }}
            >
              Register for Events
            </Button>
            <Button 
              variant="outline"
              className="border-saywhat-red text-saywhat-red hover:bg-saywhat-red hover:text-white"
            >
              Become a Volunteer
            </Button>
            <Button 
              variant="outline"
              className="border-saywhat-grey text-saywhat-grey hover:bg-saywhat-grey hover:text-white"
            >
              Partner with Us
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}