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
  Clock,
  Target,
  Award
} from 'lucide-react'

const SAYWHAT_COLORS = {
  orange: '#ff6b35',
  red: '#dc2626', 
  grey: '#6b7280',
  dark: '#1f2937',
  lightGrey: '#f3f4f6'
}

export default function AgricultureSportsGalaPage() {
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
              onClick={() => window.history.back()}
              className="border-saywhat-grey hover:bg-saywhat-light-grey"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-saywhat-dark">Agriculture & Sports Gala</h1>
              <p className="mt-2 text-saywhat-grey">Annual flagship event promoting agricultural innovation and community sports</p>
            </div>
            <Badge 
              variant="secondary" 
              className="text-white"
              style={{ backgroundColor: SAYWHAT_COLORS.orange }}
            >
              Flagship Event
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Event Overview Banner */}
          <div 
            className="rounded-lg p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${SAYWHAT_COLORS.orange} 0%, ${SAYWHAT_COLORS.red} 50%, ${SAYWHAT_COLORS.dark} 100%)`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Community Agriculture & Sports Excellence</h2>
                <p className="text-orange-100 text-lg mb-4">
                  Bringing together agricultural innovation, sports competition, and community development
                </p>
                <div className="flex space-x-6 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Annual Event</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Community Wide</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Multiple Venues</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="flex space-x-4">
                  <Leaf className="h-12 w-12 text-orange-200" />
                  <Trophy className="h-12 w-12 text-orange-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Event Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agriculture Component */}
            <Card className="border-saywhat-grey">
              <CardHeader>
                <CardTitle className="text-saywhat-dark flex items-center">
                  <Leaf className="h-6 w-6 mr-2" style={{ color: SAYWHAT_COLORS.orange }} />
                  Agricultural Innovation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${SAYWHAT_COLORS.orange}20` }}>
                    <span className="font-medium text-saywhat-dark">Farming Exhibitions</span>
                    <Badge variant="outline" style={{ borderColor: SAYWHAT_COLORS.orange }}>
                      Featured
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${SAYWHAT_COLORS.grey}20` }}>
                    <span className="font-medium text-saywhat-dark">Technology Demonstrations</span>
                    <Badge variant="outline" style={{ borderColor: SAYWHAT_COLORS.grey }}>
                      Interactive
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${SAYWHAT_COLORS.red}20` }}>
                    <span className="font-medium text-saywhat-dark">Farmer Awards</span>
                    <Badge variant="outline" style={{ borderColor: SAYWHAT_COLORS.red }}>
                      Recognition
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sports Component */}
            <Card className="border-saywhat-grey">
              <CardHeader>
                <CardTitle className="text-saywhat-dark flex items-center">
                  <Trophy className="h-6 w-6 mr-2" style={{ color: SAYWHAT_COLORS.red }} />
                  Sports Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${SAYWHAT_COLORS.red}20` }}>
                    <span className="font-medium text-saywhat-dark">Football Tournament</span>
                    <Badge variant="outline" style={{ borderColor: SAYWHAT_COLORS.red }}>
                      Championship
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${SAYWHAT_COLORS.orange}20` }}>
                    <span className="font-medium text-saywhat-dark">Athletics Events</span>
                    <Badge variant="outline" style={{ borderColor: SAYWHAT_COLORS.orange }}>
                      Community
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${SAYWHAT_COLORS.grey}20` }}>
                    <span className="font-medium text-saywhat-dark">Youth Programs</span>
                    <Badge variant="outline" style={{ borderColor: SAYWHAT_COLORS.grey }}>
                      Development
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Details */}
          <Card className="border-saywhat-grey">
            <CardHeader>
              <CardTitle className="text-saywhat-dark">Event Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${SAYWHAT_COLORS.orange}20` }}>
                    <Clock className="h-6 w-6" style={{ color: SAYWHAT_COLORS.orange }} />
                  </div>
                  <h3 className="font-semibold text-saywhat-dark mb-2">Duration</h3>
                  <p className="text-saywhat-grey">3-Day Event</p>
                  <p className="text-sm text-saywhat-grey">Friday to Sunday</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${SAYWHAT_COLORS.red}20` }}>
                    <Target className="h-6 w-6" style={{ color: SAYWHAT_COLORS.red }} />
                  </div>
                  <h3 className="font-semibold text-saywhat-dark mb-2">Participants</h3>
                  <p className="text-saywhat-grey">500+ Expected</p>
                  <p className="text-sm text-saywhat-grey">All community members</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${SAYWHAT_COLORS.grey}20` }}>
                    <Award className="h-6 w-6" style={{ color: SAYWHAT_COLORS.grey }} />
                  </div>
                  <h3 className="font-semibold text-saywhat-dark mb-2">Prizes</h3>
                  <p className="text-saywhat-grey">Multiple Categories</p>
                  <p className="text-sm text-saywhat-grey">Recognition & Awards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              className="text-white"
              style={{ backgroundColor: SAYWHAT_COLORS.orange }}
            >
              Register for Event
            </Button>
            <Button 
              variant="outline"
              className="border-saywhat-red text-saywhat-red hover:bg-saywhat-red hover:text-white"
            >
              View Past Events
            </Button>
            <Button 
              variant="outline"
              className="border-saywhat-grey text-saywhat-grey hover:bg-saywhat-grey hover:text-white"
            >
              Download Information
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}