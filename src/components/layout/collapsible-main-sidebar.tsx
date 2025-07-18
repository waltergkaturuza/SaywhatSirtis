"use client"

import { useState, useEffect } from 'react'
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import {
  HomeIcon,
  DocumentTextIcon,
  PhoneIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  FolderIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  CogIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"

interface CollapsibleMainSidebarProps {
  defaultCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

// Navigation items based on SIRTIS requirements
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, requiredPermissions: [] },
  { name: "Programs", href: "/programs", icon: DocumentTextIcon, requiredPermissions: ["programs.view"] },
  { name: "Call Centre", href: "/call-centre", icon: PhoneIcon, requiredPermissions: ["callcentre.access"] },
  { name: "My HR", href: "/hr", icon: UserGroupIcon, requiredPermissions: ["hr.view"] },
  { name: "Inventory", href: "/inventory", icon: ArchiveBoxIcon, requiredPermissions: ["inventory.view"] },
  { name: "Documents", href: "/documents", icon: FolderIcon, requiredPermissions: ["documents.view"] },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon, requiredPermissions: ["analytics.view"] },
  { name: "Settings", href: "/settings", icon: CogIcon, requiredPermissions: [] },
  { name: "Admin", href: "/admin", icon: Cog6ToothIcon, requiredPermissions: ["admin.access"] },
]

function hasPermission(userPermissions: string[], requiredPermissions: string[]) {
  if (requiredPermissions.length === 0) return true
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

export default function CollapsibleMainSidebar({ 
  defaultCollapsed = true, 
  onCollapseChange 
}: CollapsibleMainSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const { data: session } = useSession()
  const pathname = usePathname()

  const userPermissions = session?.user?.permissions || []

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapseChange?.(newState)
  }

  // Filter navigation items based on user permissions
  const filteredNavigation = navigation.filter(item => 
    hasPermission(userPermissions, item.requiredPermissions)
  )

  return (
    <>
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-gray-900">SIRTIS</span>
            </div>
          )}
          
          <button
            onClick={handleToggle}
            className={cn(
              "h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors",
              isCollapsed && "mx-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-700" : "text-gray-500 group-hover:text-gray-700",
                    !isCollapsed && "mr-3"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        {session?.user && (
          <div className="border-t border-gray-200 p-3">
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "space-x-3"
            )}>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user.position || session.user.roles?.[0] || 'User'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
            {!isCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="mt-3 w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign out
              </button>
            )}
            
            {/* Logout Icon for Collapsed State */}
            {isCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="mt-2 w-full flex items-center justify-center p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile backdrop */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={handleToggle}
        />
      )}
    </>
  )
}
