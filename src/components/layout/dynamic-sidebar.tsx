"use client"

import { Fragment, useState } from "react"
import { Dialog, Transition, Disclosure } from "@headlessui/react"
import { XMarkIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ModuleConfig, NavigationItem } from "@/types/navigation"

interface DynamicSidebarProps {
  isOpen: boolean
  onClose: () => void
  moduleConfig: ModuleConfig | null
  navigation: NavigationItem[]
  currentPath: string
}

function NavigationGroup({ 
  items, 
  currentPath, 
  level = 0 
}: { 
  items: NavigationItem[]
  currentPath: string
  level?: number
}) {
  return (
    <>
      {items.map((item) => (
        <div key={item.id}>
          {item.children ? (
            <Disclosure as="div" defaultOpen={level === 0}>
              {({ open }) => (
                <>
                  <Disclosure.Button
                    className={cn(
                      "group flex w-full items-center justify-between rounded-md p-2 text-left text-sm font-medium",
                      level === 0 
                        ? "text-gray-900 hover:bg-gray-50" 
                        : "text-gray-700 hover:bg-gray-50",
                      currentPath.startsWith(item.href) && "bg-gray-100 text-indigo-600"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          currentPath.startsWith(item.href)
                            ? "text-indigo-600"
                            : "text-gray-400 group-hover:text-gray-500"
                        )}
                        aria-hidden="true"
                      />
                      <span className={cn(level > 0 && "ml-4")}>{item.name}</span>
                    </div>
                    <ChevronRightIcon
                      className={cn(
                        "h-4 w-4 transform transition-transform",
                        open ? "rotate-90" : ""
                      )}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="mt-1 space-y-1">
                    <div className={cn(level === 0 && "ml-8")}>
                      <NavigationGroup
                        items={item.children || []}
                        currentPath={currentPath}
                        level={level + 1}
                      />
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "group flex items-center rounded-md p-2 text-sm font-medium",
                level > 0 && "ml-8",
                currentPath === item.href
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  currentPath === item.href
                    ? "text-indigo-600"
                    : "text-gray-400 group-hover:text-indigo-600"
                )}
                aria-hidden="true"
              />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-indigo-100 text-indigo-600">
                  {item.badge}
                </span>
              )}
            </Link>
          )}
        </div>
      ))}
    </>
  )
}

export default function DynamicSidebar({
  isOpen,
  onClose,
  moduleConfig,
  navigation,
  currentPath
}: DynamicSidebarProps) {
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
                  {/* Mobile sidebar content */}
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-gray-900">SIRTIS</h1>
                  </div>
                  
                  {moduleConfig && (
                    <div className="flex flex-col">
                      {/* Module Header */}
                      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: `var(--color-${moduleConfig.color}-50)` }}>
                        <div className="flex items-center">
                          <moduleConfig.icon 
                            className={cn(
                              "h-6 w-6 mr-3",
                              `text-${moduleConfig.color}-600`
                            )}
                          />
                          <div>
                            <h2 className="font-semibold text-gray-900">{moduleConfig.name}</h2>
                            <p className="text-sm text-gray-600">{moduleConfig.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Navigation */}
                      <nav className="flex flex-1 flex-col space-y-1">
                        <NavigationGroup items={navigation} currentPath={currentPath} />
                      </nav>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">SIRTIS</h1>
              <span className="ml-2 text-sm text-gray-500">SAYWHAT</span>
            </Link>
          </div>
          
          {moduleConfig && (
            <div className="flex flex-col">
              {/* Module Header */}
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                <div className="flex items-center">
                  <div className={cn(
                    "p-2 rounded-md mr-3",
                    `bg-${moduleConfig.color}-100`
                  )}>
                    <moduleConfig.icon 
                      className={cn(
                        "h-6 w-6",
                        `text-${moduleConfig.color}-600`
                      )}
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{moduleConfig.name}</h2>
                    <p className="text-sm text-gray-600">{moduleConfig.description}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex flex-1 flex-col space-y-1">
                <NavigationGroup items={navigation} currentPath={currentPath} />
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
