"use client"

import { ReactNode, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { getModuleById, getModuleNavigation } from "@/config/modules"
import DynamicSidebar from "@/components/layout/dynamic-sidebar"
import Header from "./header"
import Chatbot from "@/components/chatbot/chatbot"
import { ModulePageProps } from "@/types/navigation"
import { 
  HomeIcon, 
  ArrowLeftIcon, 
  ChevronRightIcon,
  ArrowUturnLeftIcon 
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { NavigationControls, PageHeader } from "./navigation-controls"
import { QuickNavigation } from "./floating-action-button"

interface EnhancedLayoutProps {
  children: ReactNode
}

export function EnhancedLayout({ children }: EnhancedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentModule, setCurrentModule] = useState<string | null>(null)
  const { data: session } = useSession()
  const pathname = usePathname()

  // Determine current module based on pathname
  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const moduleId = pathSegments[0] || 'dashboard'
    setCurrentModule(moduleId)
  }, [pathname])

  const userPermissions = session?.user?.permissions || []
  const moduleConfig = currentModule ? getModuleById(currentModule) : null
  const moduleNavigation = currentModule ? getModuleNavigation(currentModule, userPermissions) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dynamic Sidebar */}
      <DynamicSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        moduleConfig={moduleConfig || null}
        navigation={moduleNavigation}
        currentPath={pathname}
      />
      
      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentModule={moduleConfig}
        />
        
        {/* Page content */}
        <main className="py-6 pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* AI Chatbot - positioned at bottom right corner */}
      <div className="fixed bottom-4 right-4 z-40">
        <Chatbot />
      </div>
      
      {/* Quick Navigation - positioned at bottom left with proper spacing, more subtle */}
      <div className="fixed bottom-4 left-4 z-30">
        <QuickNavigation 
          position="bottom-left" 
          compact={true}
          showLabels={false}
          showHome={true}
          showBack={true}
        />
      </div>
    </div>
  )
}

// Module Page Wrapper Component
export function ModulePage({ 
  children, 
  metadata, 
  actions, 
  filters, 
  sidebar 
}: ModulePageProps) {
  return (
    <div className="space-y-6">
      {/* Page Header with Navigation */}
      <PageHeader
        title={metadata.title}
        description={metadata.description}
        breadcrumbs={metadata.breadcrumbs}
        actions={actions}
        navigationControls={
          <NavigationControls 
            size="sm"
            showLabels={false}
            compact={true}
            className="flex space-x-2"
          />
        }
      />

      {/* Filters */}
      {filters && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            {filters}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className={`flex-1 ${sidebar ? 'lg:mr-80' : ''}`}>
          {children}
        </div>

        {/* Sidebar */}
        {sidebar && (
          <div className="hidden lg:block lg:fixed lg:right-6 lg:top-32 lg:w-80 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">
            <div className="bg-white shadow rounded-lg p-6 mb-20">
              {sidebar}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
