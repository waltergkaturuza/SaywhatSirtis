'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'

export default function DocumentsAnalytics() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Documents Analytics</h1>
          <p className="text-gray-600">Analyze document usage and performance metrics</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Document analytics coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}