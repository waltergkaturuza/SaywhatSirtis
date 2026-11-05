"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ModulePage } from "@/components/layout/enhanced-layout"
import { CallCentreErrorBoundary } from "@/components/error-boundaries/CallCentreErrorBoundary"
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check user permissions - Updated to support ADVANCE_USER_1 and ADVANCE_USER_2
  const userPermissions = session?.user?.permissions || []
  const userRoles = session?.user?.roles || []
  const canAccessCallCentre = userPermissions.includes('callcentre.access') || 
                             userPermissions.includes('programs.head') ||
                             userPermissions.includes('callcentre.officer') ||
                             userPermissions.includes('call_center_full') ||
                             userPermissions.includes('call_center_view') ||
                             userPermissions.includes('callcentre.view') ||
                             userRoles.some(role => ['advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase()))

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

  return (
    <CallCentreErrorBoundary>
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
        <div className="space-y-6">
          <QuickStats />
          <DashboardOverview />
          <PerformanceMetrics />
          <RecentActivities />
        </div>
    </ModulePage>
    </CallCentreErrorBoundary>
  )
}
