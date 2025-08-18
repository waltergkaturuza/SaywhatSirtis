"use client"

import { Fragment } from "react"
import { Menu, Transition } from "@headlessui/react"
import { 
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ModuleConfig } from "@/types/navigation"
import { GlobalSearchTrigger } from "@/components/ui/global-search"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface HeaderProps {
  onMenuClick: () => void
  currentModule?: ModuleConfig | null
}

export default function Header({ onMenuClick, currentModule }: HeaderProps) {
  const { data: session } = useSession()

  const userNavigation = [
    { name: "Your Profile", href: "/profile" },
    { name: "Settings", href: "/settings" },
    { name: "Sign out", onClick: () => signOut({ callbackUrl: "/auth/signin" }) }
  ]

  return (
    <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
      <div className="flex h-16 items-center gap-x-4 border-b border-saywhat-orange bg-saywhat-orange px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-white lg:hidden"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-orange-300 lg:hidden" aria-hidden="true" />

        {/* Current Module Indicator - Left side */}
        {currentModule && (
          <div className="flex items-center px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg border border-orange-200">
            {currentModule.icon && <currentModule.icon className="h-4 w-4 mr-2" />}
            <span className="text-sm font-medium">{currentModule.name}</span>
          </div>
        )}

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          {/* Flexible spacer */}
          <div className="flex-1" />
          
          {/* Global Search - Center positioned */}
          <div className="flex items-center">
            <GlobalSearchTrigger />
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <button type="button" className="-m-2.5 p-2.5 text-white hover:text-orange-100 transition-colors">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-orange-300" aria-hidden="true" />

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="-m-1.5 flex items-center p-1.5">
                <span className="sr-only">Open user menu</span>
                <UserCircleIcon className="h-8 w-8 text-white" />
                <span className="hidden lg:flex lg:items-center">
                  <span className="ml-4 text-sm font-semibold leading-6 text-white" aria-hidden="true">
                    {session?.user?.name || "User"}
                  </span>
                  <ChevronDownIcon className="ml-2 h-5 w-5 text-white" aria-hidden="true" />
                </span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  {userNavigation.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        item.onClick ? (
                          <button
                            onClick={item.onClick}
                            className={cn(
                              active ? "bg-gray-50" : "",
                              "block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900"
                            )}
                          >
                            {item.name}
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            className={cn(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            {item.name}
                          </Link>
                        )
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}