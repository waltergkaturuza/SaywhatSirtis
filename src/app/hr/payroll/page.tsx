'use client'

import React from 'react'
import { ModulePage } from "@/components/layout/enhanced-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  LinkIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

export default function PayrollPage() {
  const metadata = {
    title: "Payroll & Time Management",
    description: "Integrated payroll and time management through Belina software",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Payroll & Time" }
    ]
  }

  const belinaModules = [
    {
      title: "Payroll Management",
      description: "Complete payroll processing, calculations, and employee payments",
      icon: CurrencyDollarIcon,
      url: "https://belina.saywhat.co.zw/payroll",
      features: [
        "Monthly payroll processing",
        "Salary calculations & deductions",
        "Tax withholdings",
        "Payslip generation",
        "Bank transfer integration"
      ]
    },
    {
      title: "Time & Attendance",
      description: "Employee time tracking, attendance monitoring, and overtime management",
      icon: ClockIcon,
      url: "https://belina.saywhat.co.zw/attendance",
      features: [
        "Clock in/out tracking",
        "Attendance reports",
        "Overtime calculations",
        "Shift management",
        "Biometric integration"
      ]
    },
    {
      title: "Payroll Reports",
      description: "Comprehensive payroll reporting and analytics",
      icon: DocumentTextIcon,
      url: "https://belina.saywhat.co.zw/reports/payroll",
      features: [
        "Monthly payroll summaries",
        "Tax reports",
        "Department cost analysis",
        "Employee pay history",
        "Compliance reports"
      ]
    },
    {
      title: "Payroll Analytics",
      description: "Advanced payroll analytics and insights",
      icon: ChartBarIcon,
      url: "https://belina.saywhat.co.zw/analytics/payroll",
      features: [
        "Cost trend analysis",
        "Department comparisons",
        "Budget vs actual",
        "Forecasting tools",
        "Performance metrics"
      ]
    }
  ]

  const handleBelinaAccess = (url: string, moduleName: string) => {
    // Log the access for audit purposes
    console.log(`Accessing Belina ${moduleName} at ${url}`)
    
    // Open Belina in a new tab
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="space-y-8">
        {/* Integration Notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <LinkIcon className="h-8 w-8 text-orange-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Belina Integration
                </h3>
                <p className="text-orange-800 mb-4">
                  Payroll and Time & Attendance management is handled through our integrated Belina software system. 
                  Click the buttons below to access the relevant modules directly in Belina.
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 text-orange-800">
                    Single Sign-On Enabled
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    Real-time Sync
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            size="lg" 
            className="h-16 bg-orange-600 hover:bg-orange-700"
            onClick={() => handleBelinaAccess("https://belina.saywhat.co.zw/payroll", "Payroll Management")}
          >
            <CurrencyDollarIcon className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Access Payroll System</div>
              <div className="text-sm opacity-90">Process payroll in Belina</div>
            </div>
            <ArrowTopRightOnSquareIcon className="h-5 w-5 ml-auto" />
          </Button>

          <Button 
            size="lg" 
            className="h-16 bg-blue-600 hover:bg-blue-700"
            onClick={() => handleBelinaAccess("https://belina.saywhat.co.zw/attendance", "Time & Attendance")}
          >
            <ClockIcon className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Time & Attendance</div>
              <div className="text-sm opacity-90">Manage time tracking in Belina</div>
            </div>
            <ArrowTopRightOnSquareIcon className="h-5 w-5 ml-auto" />
          </Button>
        </div>

        {/* Belina Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {belinaModules.map((module, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <module.icon className="h-8 w-8 text-orange-500" />
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{module.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">Key Features:</h4>
                  <ul className="space-y-1">
                    {module.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleBelinaAccess(module.url, module.title)}
                >
                  Access {module.title} in Belina
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LinkIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-900">Connected</h3>
                <p className="text-sm text-green-700">SIRTIS ↔ Belina</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900">Last Sync</h3>
                <p className="text-sm text-blue-700">5 minutes ago</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-900">Data Flow</h3>
                <p className="text-sm text-purple-700">Real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePage>
  )
}
