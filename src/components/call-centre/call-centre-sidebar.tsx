'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChartBarIcon,
  PlusIcon,
  PhoneIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline'

const items = [
  {
    href: '/call-centre',
    name: 'Dashboard',
    icon: ChartBarIcon,
    active: (path: string) => path === '/call-centre'
  },
  {
    href: '/call-centre/new-call',
    name: 'New Call',
    icon: PlusIcon,
    active: (path: string) => path.startsWith('/call-centre/new-call')
  },
  {
    href: '/call-centre/all-calls',
    name: 'All Calls',
    icon: PhoneIcon,
    active: (path: string) => path.startsWith('/call-centre/all-calls')
  },
  {
    href: '/call-centre/case-management',
    name: 'Case Management',
    icon: DocumentTextIcon,
    active: (path: string) => path.startsWith('/call-centre/case-management') || path.startsWith('/call-centre/cases')
  },
  {
    href: '/call-centre/referral-directory',
    name: 'Referral Directory',
    icon: BuildingOfficeIcon,
    active: (path: string) => path.startsWith('/call-centre/referral-directory')
  },
  {
    href: '/call-centre/data-summary',
    name: 'Data Summary',
    icon: ArrowTrendingUpIcon,
    active: (path: string) => path.startsWith('/call-centre/data-summary')
  },
  {
    href: '/call-centre/analytics',
    name: 'Data Analytics',
    icon: PresentationChartBarIcon,
    active: (path: string) => path.startsWith('/call-centre/analytics')
  }
]

export function CallCentreSidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="px-3 py-3">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Call Centre</p>
        <nav className="mt-2 flex gap-1 overflow-x-auto lg:flex-col">
          {items.map((item) => {
            const isActive = item.active(pathname)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
