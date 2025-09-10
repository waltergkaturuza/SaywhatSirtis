"use client"

import { useState, useEffect } from 'react'
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
  ChartBarIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface CollapsibleMainSidebarProps {
  defaultCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

// Navigation items based on SIRTIS requirements
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, requiredPermissions: [] },
  { name: "Risk Management", href: "/risk-management", icon: ExclamationTriangleIcon, requiredPermissions: ["risk.view"] },
  { name: "Programs", href: "/programs", icon: DocumentTextIcon, requiredPermissions: ["programs.view"] },
  { name: "Call Centre", href: "/call-centre", icon: PhoneIcon, requiredPermissions: ["callcentre.access"] },
  { name: "My HR", href: "/hr", icon: UserGroupIcon, requiredPermissions: ["hr.view"] },
  { name: "Inventory", href: "/inventory", icon: ArchiveBoxIcon, requiredPermissions: ["inventory.view"] },
  { name: "Documents", href: "/documents", icon: FolderIcon, requiredPermissions: ["documents.view"] },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon, requiredPermissions: ["analytics.view"] },
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
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 relative">
                <Image
                  src="/assets/saywhat-logo.png"
                  alt="SAYWHAT Logo"
                  width={48}
                  height={48}
                  className="rounded-lg object-contain"
                />
              </div>
              <span className="font-bold text-saywhat-orange text-xl">SIRTIS</span>
            </div>
          )}
          
          {isCollapsed && (
            <div className="h-10 w-10 relative mx-auto">
              <Image
                src="/assets/saywhat-logo.png"
                alt="SAYWHAT Logo"
                width={40}
                height={40}
                className="rounded object-contain"
              />
            </div>
          )}
          
          <button
            onClick={handleToggle}
            className={cn(
              "h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors",
              isCollapsed && "mt-2"
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
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-4 py-3 text-sm font-bold transition-all duration-200 group w-full relative",
                  isActive 
                    ? "bg-green-50 text-green-700 border-l-4 border-green-600" 
                    : "text-green-600 hover:bg-green-50 hover:text-green-700",
                  isCollapsed && "justify-center px-3"
                )}
                style={isActive ? { 
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderLeftColor: '#059669',
                  borderLeftWidth: '4px'
                } : {}}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                    e.currentTarget.style.borderLeftColor = '#059669';
                    e.currentTarget.style.borderLeftWidth = '4px';
                    const icon = e.currentTarget.querySelector('.nav-icon') as HTMLElement;
                    if (icon) icon.style.color = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.borderLeftColor = '';
                    e.currentTarget.style.borderLeftWidth = '';
                    const icon = e.currentTarget.querySelector('.nav-icon') as HTMLElement;
                    if (icon) icon.style.color = '#ff6b35';
                  }
                }}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "nav-icon h-6 w-6 flex-shrink-0 stroke-[2.5] transition-colors duration-200",
                    isActive ? "text-green-600" : "text-saywhat-orange",
                    !isCollapsed && "mr-4"
                  )}
                  style={{ 
                    color: isActive ? '#059669' : '#ff6b35', 
                    strokeWidth: 2.5 
                  }}
                />
                {!isCollapsed && (
                  <span className="truncate font-bold">{item.name}</span>
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
              <div className="h-8 w-8 rounded-full bg-saywhat-orange flex items-center justify-center" style={{ backgroundColor: '#ff6b35' }}>
                <span className="text-sm font-bold text-white">
                  {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-green-600 truncate">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-green-500 truncate">
                    {session.user.position || session.user.roles?.[0] || 'User'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
            {!isCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="mt-3 w-full flex items-center px-4 py-3 text-sm font-bold text-green-600 hover:text-green-700 hover:shadow-md rounded-lg transition-all duration-200 relative group"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                  e.currentTarget.style.borderLeftColor = '#059669';
                  e.currentTarget.style.borderLeftWidth = '4px';
                  const icon = e.currentTarget.querySelector('.logout-icon') as HTMLElement;
                  if (icon) icon.style.color = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.borderLeftColor = '';
                  e.currentTarget.style.borderLeftWidth = '';
                  const icon = e.currentTarget.querySelector('.logout-icon') as HTMLElement;
                  if (icon) icon.style.color = '#ff6b35';
                }}
              >
                <LogOut className="logout-icon h-6 w-6 mr-4 stroke-[2.5] transition-colors duration-200" style={{ color: '#ff6b35', strokeWidth: 2.5 }} />
                Sign out
              </button>
            )}
            
            {/* Logout Icon for Collapsed State */}
            {isCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="mt-2 w-full flex items-center justify-center p-3 text-saywhat-orange hover:text-green-600 hover:shadow-md rounded-lg transition-all duration-200 group"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                  e.currentTarget.style.borderLeftColor = '#059669';
                  e.currentTarget.style.borderLeftWidth = '4px';
                  const icon = e.currentTarget.querySelector('.logout-icon') as HTMLElement;
                  if (icon) icon.style.color = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.borderLeftColor = '';
                  e.currentTarget.style.borderLeftWidth = '';
                  const icon = e.currentTarget.querySelector('.logout-icon') as HTMLElement;
                  if (icon) icon.style.color = '#ff6b35';
                }}
                title="Sign out"
              >
                <LogOut className="logout-icon h-6 w-6 stroke-[2.5] transition-colors duration-200" style={{ color: '#ff6b35', strokeWidth: 2.5 }} />
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
