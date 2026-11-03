'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  {
    href: '/hr/performance/plans',
    name: 'Performance Plans',
    active: (path: string) =>
      path === '/hr/performance' || path.startsWith('/hr/performance/plans'),
  },
  {
    href: '/hr/performance/appraisals',
    name: 'Appraisals',
    active: (path: string) => path.startsWith('/hr/performance/appraisals'),
  },
]

export function PerformanceSidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="px-3 py-3">
        <p className="px-2 text-xs font-medium text-gray-500">Performance</p>
        <nav className="mt-2 flex gap-1 overflow-x-auto lg:flex-col">
          {items.map((item) => {
            const isActive = item.active(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                  isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50'
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
