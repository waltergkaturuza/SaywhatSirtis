"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  TrendingUp,
  TrendingDown,
  Phone,
  Target,
  Activity,
  RefreshCw,
  ChartBarIcon,
  Building,
  Briefcase
} from 'lucide-react'

interface DashboardMetrics {
  memberCount: number
  callsToday: number
  callsThisMonth: number
  programsActive: number
  programsCompleted: number
  avgCallDuration: number
  memberGrowth: number
  callGrowth: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-saywhat-grey">Please log in to view the dashboard.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-saywhat-dark">SAYWHAT SIRTIS Dashboard</h1>
            <p className="text-saywhat-grey mt-1">
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="border-saywhat-orange text-saywhat-orange hover:bg-saywhat-orange hover:text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-saywhat-orange">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-saywhat-grey">Total Members</CardTitle>
              <Users className="h-4 w-4 text-saywhat-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-saywhat-dark">
                {isLoading ? '...' : metrics?.memberCount?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-saywhat-grey">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {isLoading ? '...' : `+${metrics?.memberGrowth || 0}%`} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-saywhat-red">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-saywhat-grey">Calls Today</CardTitle>
              <Phone className="h-4 w-4 text-saywhat-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-saywhat-dark">
                {isLoading ? '...' : metrics?.callsToday?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-saywhat-grey">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {isLoading ? '...' : `+${metrics?.callGrowth || 0}%`} from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-saywhat-grey">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-saywhat-grey">Active Programs</CardTitle>
              <Target className="h-4 w-4 text-saywhat-grey" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-saywhat-dark">
                {isLoading ? '...' : metrics?.programsActive || '0'}
              </div>
              <p className="text-xs text-saywhat-grey">
                {isLoading ? '...' : metrics?.programsCompleted || '0'} completed this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-saywhat-dark">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-saywhat-grey">Avg Call Duration</CardTitle>
              <Activity className="h-4 w-4 text-saywhat-dark" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-saywhat-dark">
                {isLoading ? '...' : `${metrics?.avgCallDuration || 0}m`}
              </div>
              <p className="text-xs text-saywhat-grey">
                Optimal performance range
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call Centre Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-saywhat-dark flex items-center">
              <Phone className="mr-2 h-5 w-5 text-saywhat-red" />
              Call Centre Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-saywhat-light-grey rounded-lg">
                <div className="text-2xl font-bold text-saywhat-dark">
                  {isLoading ? '...' : metrics?.callsThisMonth?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-saywhat-grey">Calls This Month</div>
              </div>
              <div className="text-center p-4 bg-saywhat-light-grey rounded-lg">
                <div className="text-2xl font-bold text-saywhat-dark">98.5%</div>
                <div className="text-sm text-saywhat-grey">Resolution Rate</div>
              </div>
              <div className="text-center p-4 bg-saywhat-light-grey rounded-lg">
                <div className="text-2xl font-bold text-saywhat-dark">4.7/5</div>
                <div className="text-sm text-saywhat-grey">Satisfaction Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-saywhat-dark">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(session?.user?.permissions?.includes("programs.view") || session?.user?.permissions?.includes("programs.full_access")) && (
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-saywhat-orange hover:bg-saywhat-orange hover:text-white" 
                  onClick={() => window.location.href = '/programs'}
                >
                  <Target className="h-6 w-6" />
                  <span className="text-xs">Programs</span>
                </Button>
              )}
              {(session?.user?.permissions?.includes("call_centre.view") || session?.user?.permissions?.includes("call_centre.full_access")) && (
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-saywhat-red hover:bg-saywhat-red hover:text-white" 
                  onClick={() => window.location.href = '/call-centre'}
                >
                  <Phone className="h-6 w-6" />
                  <span className="text-xs">Call Centre</span>
                </Button>
              )}
              {(session?.user?.permissions?.includes("hr.view") || session?.user?.permissions?.includes("hr.full_access")) && (
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-saywhat-grey hover:bg-saywhat-grey hover:text-white" 
                  onClick={() => window.location.href = '/hr'}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-xs">Member Management</span>
                </Button>
              )}
              {(session?.user?.permissions?.includes("analytics.view") || session?.user?.permissions?.includes("analytics.full_access")) && (
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-saywhat-dark hover:bg-saywhat-dark hover:text-white" 
                  onClick={() => window.location.href = '/analytics'}
                >
                  <ChartBarIcon className="h-6 w-6" />
                  <span className="text-xs">Analytics</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
