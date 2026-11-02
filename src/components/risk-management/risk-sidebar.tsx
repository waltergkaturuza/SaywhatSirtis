'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  {
    href: '/risk-management',
    name: 'Risk Register',
    active: (path: string) =>
      path === '/risk-management' ||
      path.startsWith('/risk-management/risks') ||
      path.startsWith('/risk-management/add') ||
      path.startsWith('/risk-management/matrix'),
  },
  {
    href: '/risk-management/assessment',
    name: 'Risk Assessment',
    active: (path: string) => path.startsWith('/risk-management/assessment'),
  },
  {
    href: '/risk-management/reports',
    name: 'Risk Reports',
    active: (path: string) => path.startsWith('/risk-management/reports'),
  },
  {
    href: '/risk-management/audit-logs',
    name: 'Audit Trail',
    active: (path: string) => path.startsWith('/risk-management/audit-logs'),
  },
]

export function RiskSidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="px-3 py-3">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Risk</p>
        <nav className="mt-2 flex gap-1 overflow-x-auto lg:flex-col">
          {items.map((item) => {
            const isActive = item.active(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-50'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
