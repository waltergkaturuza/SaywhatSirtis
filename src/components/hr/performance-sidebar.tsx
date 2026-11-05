'use client'

import { ClipboardDocumentListIcon, StarIcon } from '@heroicons/react/24/outline'
import { ModuleSidebar, type ModuleSidebarItem } from '@/components/layout/module-sidebar'

const items: ModuleSidebarItem[] = [
  {
    href: '/hr/performance/plans',
    name: 'Performance Plans',
    icon: ClipboardDocumentListIcon,
    active: (path) => path === '/hr/performance' || path.startsWith('/hr/performance/plans')
  },
  { href: '/hr/performance/appraisals', name: 'Appraisals', icon: StarIcon }
]

export function PerformanceSidebar() {
  return <ModuleSidebar title="Performance" items={items} />
}
