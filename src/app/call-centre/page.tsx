"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  PhoneIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Call Centre Management</h1>
              <p className="text-sm text-gray-600">Comprehensive call management and case tracking system</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">Call Centre Officer</p>
              </div>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-200">
          <nav className="px-6">
            <div className="flex space-x-8">
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
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    </div>
  )
}
