"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  StarIcon,
  BeakerIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Navigation items based on SIRTIS requirements
const navigation = [
  { name: "Home Dashboard", href: "/", icon: HomeIcon, requiredPermissions: [] },
  { name: "Risk Management", href: "/risk-management", icon: ExclamationTriangleIcon, requiredPermissions: ["risk.view"] },
  { name: "Programs", href: "/programs", icon: DocumentTextIcon, requiredPermissions: ["programs.view"] },
  { name: "Call Centre", href: "/call-centre", icon: PhoneIcon, requiredPermissions: ["callcentre.access"] },
  { name: "My HR", href: "/hr", icon: UserGroupIcon, requiredPermissions: ["hr.view"] },
  { name: "Inventory Tracking", href: "/inventory", icon: ArchiveBoxIcon, requiredPermissions: ["inventory.view"] },
  { name: "Document Repository", href: "/documents", icon: FolderIcon, requiredPermissions: [] },
  { name: "Settings", href: "/settings", icon: CogIcon, requiredPermissions: [] },
  { name: "System Admin", href: "/admin", icon: Cog6ToothIcon, requiredPermissions: ["admin.access"] },
  { name: "About SIRTIS", href: "/about", icon: InformationCircleIcon, requiredPermissions: [] },
]

// Advanced Features Navigation (Phase 2 & 3)
const advancedNavigation = [
  { name: "AI & Advanced Features", href: "/phase3", icon: StarIcon, requiredPermissions: [] },
  { name: "Enhanced UI Components", href: "/test-components/phase2-demo", icon: BeakerIcon, requiredPermissions: [] },
  { name: "Development Tools", href: "/test-components", icon: BoltIcon, requiredPermissions: ["admin.access"] },
]

// AI Assistant Info (non-clickable, just shows copilot availability)
const aiAssistantInfo = {
  name: "SIRTIS Copilot Available",
  description: "AI assistant active in bottom-right corner",
  icon: ChatBubbleLeftRightIcon
}

function hasPermission(userPermissions: string[], requiredPermissions: string[]) {
  if (requiredPermissions.length === 0) return true
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const userPermissions = session?.user?.permissions || []

  // Filter navigation items based on user permissions
  const filteredNavigation = navigation.filter(item => 
    hasPermission(userPermissions, item.requiredPermissions)
  )

  const filteredAdvancedNavigation = advancedNavigation.filter(item => 
    hasPermission(userPermissions, item.requiredPermissions)
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-gray-900">SIRTIS</h1>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {filteredNavigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                  pathname === item.href
                                    ? "bg-gray-50 text-indigo-600"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    pathname === item.href
                                      ? "text-indigo-600"
                                      : "text-gray-400 group-hover:text-indigo-600",
                                    "h-6 w-6 shrink-0"
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      {filteredAdvancedNavigation.length > 0 && (
                        <li>
                          <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                            Advanced Features
                          </div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {filteredAdvancedNavigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  onClick={onClose}
                                  className={cn(
                                    pathname === item.href
                                      ? "bg-indigo-50 text-indigo-600"
                                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <item.icon
                                    className={cn(
                                      pathname === item.href
                                        ? "text-indigo-600"
                                        : "text-gray-400 group-hover:text-indigo-600",
                                      "h-6 w-6 shrink-0"
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                      
                      {/* AI Copilot Status Indicator - Mobile */}
                      <li>
                        <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                          AI Assistant
                        </div>
                        <div className="mt-2 -mx-2">
                          <div className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                            <aiAssistantInfo.icon
                              className="h-5 w-5 shrink-0 text-indigo-500"
                              aria-hidden="true"
                            />
                            <div className="flex-1">
                              <div className="text-indigo-700 font-medium text-xs">
                                {aiAssistantInfo.name}
                              </div>
                              <div className="text-indigo-600 text-xs mt-0.5">
                                {aiAssistantInfo.description}
                              </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse self-center"></div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">SIRTIS</h1>
            <span className="ml-2 text-sm text-gray-500">SAYWHAT</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          pathname === item.href
                            ? "bg-gray-50 text-indigo-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        <item.icon
                          className={cn(
                            pathname === item.href
                              ? "text-indigo-600"
                              : "text-gray-400 group-hover:text-indigo-600",
                            "h-6 w-6 shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              {filteredAdvancedNavigation.length > 0 && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                    Advanced Features
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {filteredAdvancedNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            pathname === item.href
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <item.icon
                            className={cn(
                              pathname === item.href
                                ? "text-indigo-600"
                                : "text-gray-400 group-hover:text-indigo-600",
                              "h-6 w-6 shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              
              {/* AI Copilot Status Indicator */}
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                  AI Assistant
                </div>
                <div className="mt-2 -mx-2">
                  <div className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                    <aiAssistantInfo.icon
                      className="h-5 w-5 shrink-0 text-indigo-500"
                      aria-hidden="true"
                    />
                    <div className="flex-1">
                      <div className="text-indigo-700 font-medium text-xs">
                        {aiAssistantInfo.name}
                      </div>
                      <div className="text-indigo-600 text-xs mt-0.5">
                        {aiAssistantInfo.description}
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse self-center"></div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
