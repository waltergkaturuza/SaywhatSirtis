"use client"

import { useState } from 'react'
import { cn } from "@/lib/utils"
import CollapsibleMainSidebar from './collapsible-main-sidebar'
import Header from './header'
import Chatbot from '@/components/chatbot/chatbot'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Collapsible Main Sidebar */}
      <CollapsibleMainSidebar 
        defaultCollapsed={true}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Header */}
        <Header onMenuClick={() => {}} />

        {/* Page Content */}
        <main className="py-6">
          {children}
        </main>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
