"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { NavigationControls } from "@/components/layout/navigation-controls"
import { FloatingActionButton } from "@/components/layout/floating-action-button"
import { PlusIcon, DocumentTextIcon, ShareIcon } from "@heroicons/react/24/outline"

export default function SampleNavigationPage() {
  // Custom actions for the floating action button
  const customActions = [
    {
      icon: PlusIcon,
      label: "Create New",
      onClick: () => console.log("Create new item"),
      color: "green" as const
    },
    {
      icon: ShareIcon,
      label: "Share",
      onClick: () => console.log("Share content"),
      color: "blue" as const
    }
  ]

  // Page actions for the header
  const pageActions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <PlusIcon className="h-4 w-4 mr-2" />
        New Item
      </button>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Export
      </button>
    </>
  )

  // Sample filters
  const filters = (
    <div className="flex items-center space-x-4">
      <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
        <option>All Categories</option>
        <option>Documents</option>
        <option>Images</option>
        <option>Videos</option>
      </select>
      <input
        type="text"
        placeholder="Search..."
        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  )

  return (
    <>
      <ModulePage
        metadata={{
          title: "Enhanced Navigation Demo",
          description: "Demonstration of the enhanced navigation system with breadcrumbs, controls, and actions",
          breadcrumbs: [
            { name: "Dashboard", href: "/" },
            { name: "Documents", href: "/documents" },
            { name: "Navigation Demo" }
          ]
        }}
        actions={pageActions}
        filters={filters}
      >
        <div className="space-y-6">
          {/* Demo content showing navigation features */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Navigation Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Header Navigation</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Home and Back buttons in header</li>
                  <li>• Current module indicator</li>
                  <li>• Context-aware navigation</li>
                  <li>• Mobile-responsive menu</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Page Navigation</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Smart breadcrumbs with links</li>
                  <li>• Quick navigation controls</li>
                  <li>• Module home shortcuts</li>
                  <li>• Contextual actions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Floating Actions</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Quick access buttons</li>
                  <li>• Customizable actions</li>
                  <li>• Position options</li>
                  <li>• Expandable menu</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Navigation Hooks</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• useNavigation hook</li>
                  <li>• Breadcrumb generation</li>
                  <li>• Navigation state management</li>
                  <li>• Programmatic navigation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Custom navigation controls demo */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Custom Navigation Controls</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Small Size Controls</h3>
                <NavigationControls size="sm" customButtons={[
                  <button
                    key="custom"
                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Custom Action
                  </button>
                ]} />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Large Size Controls</h3>
                <NavigationControls size="lg" />
              </div>
            </div>
          </div>
        </div>
      </ModulePage>

      {/* Custom floating action button */}
      <FloatingActionButton
        primaryAction={{
          icon: PlusIcon,
          label: "Quick Add",
          onClick: () => console.log("Quick add clicked"),
          color: "green"
        }}
        secondaryActions={customActions}
        position="bottom-right"
      />
    </>
  )
}
