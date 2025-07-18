'use client'

import { useState, createContext, useContext } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSidebarIcons } from './sidebar-icons'

interface CollapsibleSidebarProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
  className?: string
  iconContent?: React.ReactNode
  onCollapseChange?: (collapsed: boolean) => void
}

// Context for sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}>({
  isCollapsed: false,
  setIsCollapsed: () => {}
})

export function CollapsibleSidebar({ 
  children, 
  defaultCollapsed = false, 
  className,
  iconContent,
  onCollapseChange
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapseChange?.(newState)
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div 
        className={cn(
          "hidden lg:block lg:fixed lg:right-6 lg:top-32 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto transition-all duration-300 ease-in-out z-50",
          isCollapsed ? "lg:w-16" : "lg:w-80",
          className
        )}
      >
        <div className="bg-white shadow-lg rounded-lg relative border border-gray-200">
          {/* Collapse/Expand Button */}
          <button
            onClick={handleToggle}
            className="absolute -left-3 top-4 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 group"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronLeft className="h-3 w-3 text-gray-600 group-hover:text-blue-600 transition-colors" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-blue-600 transition-colors" />
            )}
          </button>

          {/* Sidebar Content */}
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            isCollapsed ? "opacity-0 invisible w-0 overflow-hidden" : "opacity-100 visible"
          )}>
            {!isCollapsed && (
              <div className="p-6 mb-20">
                {children}
              </div>
            )}
          </div>

          {/* Collapsed Icon View */}
          {isCollapsed && (
            <div className="p-4 flex flex-col items-center min-h-[120px] justify-start">
              {iconContent || getSidebarIcons(children)}
            </div>
          )}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

// Hook to use sidebar context
export function useSidebarState() {
  return useContext(SidebarContext)
}

// Custom hook to manage sidebar collapse state
export function useSidebarCollapse(defaultCollapsed = false) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  
  const toggleCollapse = () => setIsCollapsed(!isCollapsed)
  
  return {
    isCollapsed,
    setIsCollapsed,
    toggleCollapse
  }
}
