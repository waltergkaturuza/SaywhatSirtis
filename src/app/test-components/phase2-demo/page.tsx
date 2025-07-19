'use client'

import { useState } from 'react'
import { Phase2StatusDashboard } from '@/components/ui/phase2-status-dashboard'
import { AccessibleButton, AccessibleModal, AccessibleField, AccessibleTable } from '@/components/ui/accessibility'
import { ThemeToggle, ThemeSelector } from '@/components/ui/theme-toggle'
import { GlobalSearchTrigger } from '@/components/ui/global-search'
import { ResponsiveGrid, TouchButton, MobileTable } from '@/components/ui/mobile-responsive'
import { Skeleton, SkeletonCard, SkeletonTable, LoadingWrapper } from '@/components/ui/skeleton'
import { useNotifications } from '@/components/ui/notifications'
import { useOffline } from '@/components/ui/offline-support'
import { Play, Pause, RefreshCw, Zap } from 'lucide-react'

export default function Phase2TestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSkeletons, setShowSkeletons] = useState(false)
  const { showSuccess, showError, showInfo, showWarning } = useNotifications()
  const { isOnline, offlineQueue } = useOffline()

  const handleLoadingTest = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      showSuccess('Loading Test Complete', 'All loading states worked correctly!')
    }, 2000)
  }

  const handleSkeletonTest = () => {
    setShowSkeletons(true)
    setTimeout(() => {
      setShowSkeletons(false)
      showInfo('Skeleton Test Complete', 'Skeleton loading states demonstrated successfully!')
    }, 3000)
  }

  const handleNotificationTest = () => {
    showSuccess('Success!', 'This is a success notification')
    setTimeout(() => showError('Error!', 'This is an error notification'), 1000)
    setTimeout(() => showWarning('Warning!', 'This is a warning notification'), 2000)
    setTimeout(() => showInfo('Info!', 'This is an info notification'), 3000)
  }

  const handleOfflineTest = () => {
    if (isOnline) {
      showInfo('Offline Test', 'Try disconnecting your internet to test offline functionality')
    } else {
      showWarning('Offline Mode', `You're currently offline with ${offlineQueue.length} actions queued`)
    }
  }

  const tableData = {
    headers: ['Feature', 'Status', 'Description'],
    rows: [
      ['Dark Mode', '✅ Enabled', 'Theme switching with system preference'],
      ['Accessibility', '✅ Enabled', 'WCAG 2.1 compliance features'],
      ['Offline Support', '✅ Enabled', 'Queue actions when offline'],
      ['Global Search', '✅ Enabled', 'Universal search functionality'],
      ['Mobile Responsive', '✅ Enabled', 'Mobile-first design approach']
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Phase 2 Feature Demo
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Frontend UI/UX Enhancements Showcase
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <GlobalSearchTrigger />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Feature Tests
          </h2>
          <ResponsiveGrid 
            cols={{ mobile: 1, tablet: 2, desktop: 4 }}
            className="mb-6"
          >
            <AccessibleButton onClick={handleLoadingTest} loading={isLoading}>
              <Play className="w-4 h-4 mr-2" />
              Test Loading States
            </AccessibleButton>
            
            <TouchButton onClick={handleSkeletonTest} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Test Skeletons
            </TouchButton>
            
            <AccessibleButton onClick={handleNotificationTest} variant="primary">
              <Zap className="w-4 h-4 mr-2" />
              Test Notifications
            </AccessibleButton>
            
            <AccessibleButton onClick={handleOfflineTest} variant="secondary">
              <Pause className="w-4 h-4 mr-2" />
              Test Offline
            </AccessibleButton>
          </ResponsiveGrid>
        </div>

        {/* Theme Controls */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Theme Controls
          </h3>
          <div className="flex items-center space-x-4">
            <ThemeSelector />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Current theme adapts to your system preference
            </span>
          </div>
        </div>

        {/* Loading States Demo */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Loading States
          </h3>
          <div className="space-y-4">
            <LoadingWrapper loading={showSkeletons} skeleton="card">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Sample Content</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  This content is wrapped in a loading wrapper that shows skeleton when loading.
                </p>
              </div>
            </LoadingWrapper>
            
            {showSkeletons && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <SkeletonCard />
              </div>
            )}
          </div>
        </div>

        {/* Accessibility Demo */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Accessibility Features
          </h3>
          <div className="space-y-4">
            <AccessibleField
              id="demo-input"
              label="Demo Input Field"
              description="This field has proper labeling and error handling"
              required
            >
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type something..."
              />
            </AccessibleField>
            
            <AccessibleButton onClick={() => setIsModalOpen(true)}>
              Open Accessible Modal
            </AccessibleButton>
          </div>
        </div>

        {/* Mobile Responsive Demo */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Mobile Responsive Components
          </h3>
          <MobileTable
            headers={tableData.headers}
            rows={tableData.rows}
            className="mb-4"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TouchButton fullWidth>Touch-Friendly Button</TouchButton>
            <TouchButton variant="secondary" fullWidth>Secondary Action</TouchButton>
            <TouchButton variant="ghost" fullWidth>Ghost Button</TouchButton>
          </div>
        </div>

        {/* Status Dashboard */}
        <div className="mb-8">
          <Phase2StatusDashboard />
        </div>

        {/* Feature List */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Implemented Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">UI Enhancements</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Enhanced skeleton loading states</li>
                <li>• Dark mode with system preference</li>
                <li>• Responsive grid and container components</li>
                <li>• Touch-friendly mobile components</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">UX Improvements</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• WCAG 2.1 accessibility compliance</li>
                <li>• Offline support with sync queue</li>
                <li>• Global search functionality</li>
                <li>• Enhanced error boundaries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Modal */}
      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Accessible Modal Demo"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This modal demonstrates accessibility features including:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>Focus trapping</li>
            <li>Keyboard navigation</li>
            <li>Screen reader announcements</li>
            <li>ARIA attributes</li>
          </ul>
          <div className="flex justify-end space-x-3">
            <AccessibleButton onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </AccessibleButton>
            <AccessibleButton onClick={() => setIsModalOpen(false)}>
              OK
            </AccessibleButton>
          </div>
        </div>
      </AccessibleModal>
    </div>
  )
}
