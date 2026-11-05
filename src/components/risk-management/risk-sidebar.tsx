'use client'

import {
  TableCellsIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { ModuleSidebar, type ModuleSidebarItem } from '@/components/layout/module-sidebar'

const items: ModuleSidebarItem[] = [
  {
    href: '/risk-management',
    name: 'Risk Register',
    icon: TableCellsIcon,
    active: (path) =>
      path === '/risk-management' ||
      path.startsWith('/risk-management/risks') ||
      path.startsWith('/risk-management/add') ||
      path.startsWith('/risk-management/matrix')
  },
  { href: '/risk-management/assessment', name: 'Risk Assessment', icon: ClipboardDocumentCheckIcon },
  { href: '/risk-management/reports', name: 'Risk Reports', icon: ChartBarIcon },
  { href: '/risk-management/audit-logs', name: 'Audit Trail', icon: ClockIcon }
]

export function RiskSidebar() {
  return <ModuleSidebar title="Risk" items={items} />
}
