'use client'

import { useState, type ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ModuleSidebarItem = {
  href: string
  name: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  active?: (path: string) => boolean
}

type ModuleSidebarProps = {
  title: string
  items: ModuleSidebarItem[]
  defaultCollapsed?: boolean
  className?: string
}

export function ModuleSidebar({ title, items, defaultCollapsed = true, className }: ModuleSidebarProps) {
  const pathname = usePathname() || ''
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <aside
      className={cn(
        'shrink-0 border-b border-gray-200 bg-white transition-[width] duration-300 ease-in-out',
        'lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r',
        collapsed ? 'lg:w-16' : 'lg:w-56',
        className
      )}
    >
      <div className={cn('hidden h-12 items-center border-b border-gray-200 px-3 lg:flex', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && <span className="truncate text-xs font-bold uppercase tracking-wide text-green-700">{title}</span>}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          aria-label={collapsed ? `Expand ${title} menu` : `Collapse ${title} menu`}
          title={collapsed ? `Expand ${title} menu` : `Collapse ${title} menu`}
        >
          {collapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <ChevronLeft className="h-4 w-4 text-gray-600" />}
        </button>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
        {items.map((item) => {
          const isActive = item.active ? item.active(pathname) : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex shrink-0 items-center rounded-lg border-l-4 py-2.5 text-sm font-bold transition-colors duration-200',
                collapsed ? 'justify-center px-2.5' : 'px-3',
                isActive
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-transparent text-green-600 hover:border-green-600 hover:bg-green-50 hover:text-green-700'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6 shrink-0 transition-colors duration-200',
                  isActive ? 'text-[#059669]' : 'text-[#ff6b35] group-hover:text-[#059669]',
                  !collapsed && 'mr-3'
                )}
                strokeWidth={2.5}
              />
              <span className={cn('truncate', collapsed && 'sr-only')}>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
