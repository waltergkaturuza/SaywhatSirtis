'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'

export default function TeamsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Microsoft Teams Integration</h1>
          <p className="text-gray-600">Connect and manage your Teams files</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Teams integration coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
