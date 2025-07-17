"use client"

import { useState, useEffect } from "react"
import { DocumentTextIcon, ChartBarIcon } from "@heroicons/react/24/outline"

interface ReportsAndAnalyticsProps {
  permissions: any
  selectedProject: number | null
}

export function ReportsAndAnalytics({ permissions, selectedProject }: ReportsAndAnalyticsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="p-6">Loading reports...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive project reporting and insights</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow border p-6">
        <p className="text-gray-600">Advanced reporting features will include:</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
          <li>Executive dashboards and KPI tracking</li>
          <li>Progress and performance analytics</li>
          <li>Financial reporting and budget variance</li>
          <li>Resource utilization reports</li>
          <li>Custom report builder with export options</li>
          <li>Automated report scheduling and distribution</li>
        </ul>
      </div>
    </div>
  )
}
