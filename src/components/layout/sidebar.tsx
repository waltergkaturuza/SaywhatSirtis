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
  CogIcon
} from "@heroicons/react/24/outline"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Navigation items based on SIRTIS requirements
const navigation = [
  { name: "Home Dashboard", href: "/", icon: HomeIcon, requiredPermissions: [] },
  { name: "Programs", href: "/programs", icon: DocumentTextIcon, requiredPermissions: ["programs.view"] },
  { name: "Call Centre", href: "/call-centre", icon: PhoneIcon, requiredPermissions: ["callcentre.access"] },
  { name: "My HR", href: "/hr", icon: UserGroupIcon, requiredPermissions: ["hr.view"] },
  { name: "Inventory Tracking", href: "/inventory", icon: ArchiveBoxIcon, requiredPermissions: ["inventory.view"] },
  { name: "Document Repository", href: "/documents", icon: FolderIcon, requiredPermissions: ["documents.view"] },
  { name: "Settings", href: "/settings", icon: CogIcon, requiredPermissions: [] },
  { name: "System Admin", href: "/admin", icon: Cog6ToothIcon, requiredPermissions: ["admin.access"] },
  { name: "About SIRTIS", href: "/about", icon: InformationCircleIcon, requiredPermissions: [] },
]

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
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
