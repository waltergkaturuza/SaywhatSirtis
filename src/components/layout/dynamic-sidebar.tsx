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
      {items.map((item, index) => (
        <div key={item.id} className={cn("mb-2", index === 0 && level === 0 && "mt-1")}>
          {item.children ? (
            <Disclosure as="div" defaultOpen={level === 0}>
              {({ open }) => (
                <>
                  <Disclosure.Button
                    className={cn(
                      "group flex w-full items-center justify-between rounded-md p-3 text-left text-sm font-medium transition-all duration-200 hover:shadow-sm",
                      level === 0 
                        ? currentPath.startsWith(item.href)
                          ? "bg-gradient-to-r from-saywhat-orange to-saywhat-red text-saywhat-white shadow-md border-l-4 border-saywhat-green"
                          : "bg-gradient-to-r from-saywhat-green/10 to-saywhat-orange/5 text-saywhat-black hover:from-saywhat-orange/20 hover:to-saywhat-red/10 hover:text-saywhat-orange border-l-4 border-saywhat-green/30 hover:border-saywhat-green shadow-sm hover:shadow-md font-semibold"
                        : "ml-6 bg-gradient-to-r from-saywhat-green/5 to-saywhat-orange/5 text-saywhat-grey hover:from-saywhat-green/15 hover:to-saywhat-orange/10 hover:text-saywhat-green border-l-3 border-saywhat-green/20 hover:border-saywhat-green/50 shadow-sm"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                          currentPath.startsWith(item.href)
                            ? "text-saywhat-orange"
                            : "text-saywhat-grey group-hover:text-saywhat-orange"
                        )}
                        aria-hidden="true"
                      />
                      <span className={cn(level > 0 && "ml-4")}>{item.name}</span>
                    </div>
                    <ChevronRightIcon
                      className={cn(
                        "h-4 w-4 transform transition-all duration-300",
                        open ? "rotate-90 text-saywhat-orange" : "text-saywhat-grey group-hover:text-saywhat-orange"
                      )}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="mt-2 space-y-2 bg-gradient-to-r from-saywhat-green/5 to-saywhat-orange/5 border-l-4 border-saywhat-green/30 ml-2 pl-3 py-3 rounded-r-md shadow-inner">
                    <div className={cn(level === 0 && "ml-6")}>
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
                "group flex items-center rounded-md p-3 text-sm font-medium transition-all duration-200 hover:transform hover:translate-x-1 hover:shadow-sm",
                level > 0 && "ml-6",
                currentPath === item.href
                  ? "bg-gradient-to-r from-saywhat-orange to-saywhat-red text-saywhat-white shadow-md border-l-4 border-saywhat-green"
                  : "bg-gradient-to-r from-saywhat-green/10 to-saywhat-orange/5 text-saywhat-black hover:from-saywhat-orange/20 hover:to-saywhat-red/10 hover:text-saywhat-orange border-l-4 border-saywhat-green/30 hover:border-saywhat-green shadow-sm hover:shadow-md font-semibold"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                  currentPath === item.href
                    ? "text-saywhat-white"
                    : "text-saywhat-grey group-hover:text-saywhat-orange"
                )}
                aria-hidden="true"
              />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-saywhat-green text-saywhat-white font-medium shadow-sm">
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
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-saywhat-white to-saywhat-light-grey px-6 pb-2">
                  {/* Mobile sidebar content */}
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-saywhat-orange to-saywhat-red rounded-lg flex items-center justify-center">
                        <span className="text-saywhat-white font-bold text-sm">S</span>
                      </div>
                      <div>
                        <h1 className="text-lg font-bold text-saywhat-black">SIRTIS</h1>
                        <p className="text-xs text-saywhat-grey">SAYWHAT</p>
                      </div>
                    </div>
                  </div>
                  
                  {moduleConfig && (
                    <div className="flex flex-col">
                      {/* Module Header */}
                      <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-saywhat-orange/10 to-saywhat-red/10 border border-saywhat-orange/30">
                        <div className="flex items-center">
                          <div className="p-2 bg-saywhat-orange/20 rounded-md mr-3">
                            <moduleConfig.icon 
                              className="h-6 w-6 text-saywhat-orange"
                            />
                          </div>
                          <div>
                            <h2 className="font-semibold text-saywhat-black">{moduleConfig.name}</h2>
                            <p className="text-sm text-saywhat-grey">{moduleConfig.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Navigation */}
                      <nav className="flex flex-1 flex-col space-y-2">
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r-4 border-saywhat-orange/30 bg-gradient-to-b from-saywhat-white to-saywhat-light-grey px-6 pb-4 shadow-lg">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center border-b border-saywhat-grey/20 pb-4">
            <Link href="/" className="flex items-center space-x-3 hover:transform hover:scale-105 transition-all duration-200">
              <div className="w-10 h-10 bg-gradient-to-r from-saywhat-orange to-saywhat-red rounded-lg flex items-center justify-center shadow-md">
                <span className="text-saywhat-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-saywhat-black">SIRTIS</h1>
                <span className="text-sm text-saywhat-grey font-medium">SAYWHAT</span>
              </div>
            </Link>
          </div>
          
          {moduleConfig && (
            <div className="flex flex-col">
              {/* Module Header */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-saywhat-orange/10 via-saywhat-green/10 to-saywhat-red/10 border-2 border-saywhat-orange/20 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-saywhat-orange to-saywhat-red rounded-lg mr-4 shadow-sm">
                    <moduleConfig.icon 
                      className="h-6 w-6 text-saywhat-white"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-saywhat-black text-lg">{moduleConfig.name}</h2>
                    <p className="text-sm text-saywhat-grey font-medium">{moduleConfig.description}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex flex-1 flex-col space-y-2">
                <NavigationGroup items={navigation} currentPath={currentPath} />
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
