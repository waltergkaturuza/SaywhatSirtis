'use client'

import React, { useState } from 'react'
import { ModulePage } from "@/components/layout/enhanced-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  LinkIcon,
  ChartBarIcon,
  UserIcon,
  BuildingOfficeIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function LeaveManagementPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTab, setSelectedTab] = useState('planning')

  const metadata = {
    title: "Leave Planning & Management",
    description: "Plan your leave and manage applications through Belina integration",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Leave Planning" }
    ]
  }

  const leaveBalance = {
    annual: { used: 8, total: 21, remaining: 13 },
    sick: { used: 2, total: 10, remaining: 8 },
    personal: { used: 1, total: 5, remaining: 4 },
    maternity: { used: 0, total: 90, remaining: 90 }
  }

  const upcomingLeave = [
    {
      id: 1,
      type: 'Annual Leave',
      startDate: '2024-02-15',
      endDate: '2024-02-19',
      days: 5,
      status: 'approved'
    },
    {
      id: 2,
      type: 'Personal Leave',
      startDate: '2024-03-08',
      endDate: '2024-03-08',
      days: 1,
      status: 'pending'
    }
  ]

  const teamLeave = [
    {
      id: 1,
      employee: 'John Smith',
      department: 'Engineering',
      type: 'Annual Leave',
      dates: 'Feb 12-16, 2024',
      status: 'approved'
    },
    {
      id: 2,
      employee: 'Sarah Johnson',
      department: 'HR',
      type: 'Sick Leave',
      dates: 'Feb 20, 2024',
      status: 'pending'
    }
  ]

  const handleBelinaAccess = (url: string, moduleName: string) => {
    console.log(`Accessing Belina ${moduleName} at ${url}`)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handlePlanLeave = () => {
    // Open leave planning modal or redirect to planning page
    console.log('Opening leave planning interface')
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="space-y-8">
        {/* Integration Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <LinkIcon className="h-8 w-8 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Leave Management Integration
                </h3>
                <p className="text-blue-800 mb-4">
                  Use SIRTIS to plan your leave and view team schedules, then apply for leave through our integrated Belina system. 
                  All applications are processed in Belina for approval and record-keeping.
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    Planning in SIRTIS
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    Applications in Belina
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'planning', name: 'Leave Planning', icon: CalendarDaysIcon },
              { id: 'balance', name: 'My Balance', icon: ClockIcon },
              { id: 'team', name: 'Team Overview', icon: UserIcon },
              { id: 'reports', name: 'Reports', icon: DocumentTextIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'planning' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leave Planning Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-5 w-5" />
                    <span>Leave Planning Calendar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handlePlanLeave}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Plan Leave for Selected Date
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => handleBelinaAccess("https://belina.saywhat.co.zw/leave/apply", "Leave Application")}
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                        Apply in Belina
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => handleBelinaAccess("https://belina.saywhat.co.zw/leave/apply", "Leave Application")}
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Apply for Leave
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleBelinaAccess("https://belina.saywhat.co.zw/leave/status", "Leave Status")}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Check Application Status
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleBelinaAccess("https://belina.saywhat.co.zw/leave/history", "Leave History")}
                  >
                    <ClockIcon className="h-4 w-4 mr-2" />
                    View Leave History
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Leave</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingLeave.map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{leave.type}</p>
                          <p className="text-xs text-gray-600">
                            {leave.startDate} - {leave.endDate}
                          </p>
                        </div>
                        <Badge className={`${
                          leave.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === 'balance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(leaveBalance).map(([type, balance]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="capitalize text-lg">
                    {type.replace(/([A-Z])/g, ' $1').trim()} Leave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Used:</span>
                      <span className="font-medium">{balance.used} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className="font-medium text-green-600">{balance.remaining} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(balance.used / balance.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {balance.used} of {balance.total} days used
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === 'team' && (
          <Card>
            <CardHeader>
              <CardTitle>Team Leave Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamLeave.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{leave.employee}</p>
                        <p className="text-sm text-gray-600">{leave.department}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{leave.type}</p>
                      <p className="text-sm text-gray-600">{leave.dates}</p>
                    </div>
                    <Badge className={`${
                      leave.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {leave.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleBelinaAccess("https://belina.saywhat.co.zw/reports/leave/personal", "Personal Leave Report")}
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  My Leave Report
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleBelinaAccess("https://belina.saywhat.co.zw/reports/leave/department", "Department Leave Report")}
                >
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  Department Report
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleBelinaAccess("https://belina.saywhat.co.zw/reports/leave/analytics", "Leave Analytics")}
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Leave Analytics
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SIRTIS ↔ Belina Connection</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Data Sync</span>
                    <span className="text-sm text-gray-600">2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Leave Balance Sync</span>
                    <Badge className="bg-blue-100 text-blue-800">Real-time</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
