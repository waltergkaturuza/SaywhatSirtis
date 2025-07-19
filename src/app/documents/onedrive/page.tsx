'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'

export default function OneDrivePage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">OneDrive Integration</h1>
          <p className="text-gray-600">Connect and manage your OneDrive files</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">OneDrive integration coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
