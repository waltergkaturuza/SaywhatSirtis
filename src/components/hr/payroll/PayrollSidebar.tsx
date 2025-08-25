'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CalendarIcon,
  CogIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline'

interface PayrollSidebarProps {
  activePeriod?: string
  onPeriodChange?: (period: string) => void
  onProcessPayroll?: () => void
  onGenerateReports?: () => void
}

export function PayrollSidebar({ 
  activePeriod = 'December 2024', 
  onPeriodChange, 
  onProcessPayroll, 
  onGenerateReports 
}: PayrollSidebarProps) {
  const payrollPeriods = [
    { id: 'dec-2024', name: 'December 2024', status: 'active' },
    { id: 'nov-2024', name: 'November 2024', status: 'completed' },
    { id: 'oct-2024', name: 'October 2024', status: 'completed' },
    { id: 'sep-2024', name: 'September 2024', status: 'completed' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full">
      <div className="p-6 space-y-6">
        {/* Current Period */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-orange-500" />
              Current Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{activePeriod}</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onProcessPayroll}
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Process Payroll
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CogIcon className="h-5 w-5 mr-2 text-orange-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Generate Payslips
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={onGenerateReports}
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <PlayIcon className="h-4 w-4 mr-2" />
              Run Payroll
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <StopIcon className="h-4 w-4 mr-2" />
              Reverse Payroll
            </Button>
          </CardContent>
        </Card>

        {/* Recent Periods */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Periods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payrollPeriods.map((period) => (
              <div
                key={period.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  period.name === activePeriod 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onPeriodChange && onPeriodChange(period.name)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{period.name}</span>
                  <Badge className={getStatusColor(period.status)}>
                    {period.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payroll Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Payroll Engine</span>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Backup</span>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next Run</span>
              <span className="text-xs text-gray-500">Dec 31, 2024</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
