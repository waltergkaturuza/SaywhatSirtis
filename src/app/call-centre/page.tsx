"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ModulePage } from "@/components/layout/enhanced-layout"
import {
  PhoneIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  XCircleIcon,
  EyeIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  MapPinIcon,
  LanguageIcon
} from '@heroicons/react/24/outline'

// Import modular components
import QuickStats from './components/QuickStats'
import DashboardOverview from './components/DashboardOverview'
import RecentActivities from './components/RecentActivities'
import PerformanceMetrics from './components/PerformanceMetrics'

export default function CallCentrePage() {
  const { data: session } = useSession()
  const [activeView, setActiveView] = useState('dashboard')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || 
                             userPermissions.includes('programs.head') ||
                             userPermissions.includes('callcentre.officer')

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  }

  if (!canAccessCallCentre) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            This module is restricted to Call Centre officers and Head of Programs only.
          </p>
        </div>
      </div>
    )
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      value: 'dashboard', 
      icon: ChartBarIcon, 
      description: 'Overview and analytics',
      href: '/call-centre'
    },
    { 
      name: 'New Call', 
      value: 'new-call', 
      icon: PlusIcon, 
      description: 'Capture new call data',
      href: '/call-centre/new-call'
    },
    { 
      name: 'All Calls', 
      value: 'all-calls', 
      icon: PhoneIcon, 
      description: 'View and manage all calls',
      href: '/call-centre/all-calls'
    },
    { 
      name: 'Case Management', 
      value: 'case-management', 
      icon: DocumentTextIcon, 
      description: 'Track cases and follow-ups',
      href: '/call-centre/case-management'
    },
    { 
      name: 'Data Summary', 
      value: 'data-summary', 
      icon: ArrowTrendingUpIcon, 
      description: 'Analytics and reports',
      href: '/call-centre/data-summary'
    }
  ]

  return (
    <ModulePage
      metadata={{
        title: "Call Centre Management",
        description: "Comprehensive call management and case tracking system",
        breadcrumbs: [
          { name: "SIRTIS", href: "/" },
          { name: "Call Centre", href: "/call-centre" }
        ]
      }}
      actions={
        <div className="flex space-x-3">
          <Link
            href="/call-centre/new-call"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Call
          </Link>
          <Link
            href="/call-centre/analytics"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Analytics
          </Link>
        </div>
      }
    >
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.value}
              href={item.href}
              className={`group py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeView === item.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveView(item.value)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <QuickStats />
          
          {/* Dashboard Overview */}
          <DashboardOverview />
          
          {/* Performance Metrics */}
          <PerformanceMetrics />
          
          {/* Recent Activities */}
          <RecentActivities />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/call-centre/new-call"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PlusIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">New Call Entry</h4>
                    <p className="text-sm text-gray-500">Capture new call data</p>
                  </div>
                </Link>
                
                <Link
                  href="/call-centre/case-management"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Case Management</h4>
                    <p className="text-sm text-gray-500">Track and manage cases</p>
                  </div>
                </Link>
                
                <Link
                  href="/call-centre/referral-directory"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BuildingOfficeIcon className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Referral Directory</h4>
                    <p className="text-sm text-gray-500">Partner organizations</p>
                  </div>
                </Link>
                
                <Link
                  href="/call-centre/data-summary"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Data Analytics</h4>
                    <p className="text-sm text-gray-500">View reports and analytics</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
    </ModulePage>
  )
}
