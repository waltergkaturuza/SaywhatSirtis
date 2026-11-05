'use client'

import {
  ChartBarIcon,
  PlusIcon,
  PhoneIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline'
import { ModuleSidebar, type ModuleSidebarItem } from '@/components/layout/module-sidebar'

const items: ModuleSidebarItem[] = [
  { href: '/call-centre', name: 'Dashboard', icon: ChartBarIcon, active: (path) => path === '/call-centre' },
  { href: '/call-centre/new-call', name: 'New Call', icon: PlusIcon },
  { href: '/call-centre/all-calls', name: 'All Calls', icon: PhoneIcon },
  {
    href: '/call-centre/case-management',
    name: 'Case Management',
    icon: DocumentTextIcon,
    active: (path) => path.startsWith('/call-centre/case-management') || path.startsWith('/call-centre/cases')
  },
  { href: '/call-centre/referral-directory', name: 'Referral Directory', icon: BuildingOfficeIcon },
  { href: '/call-centre/data-summary', name: 'Data Summary', icon: ArrowTrendingUpIcon },
  { href: '/call-centre/analytics', name: 'Data Analytics', icon: PresentationChartBarIcon }
]

export function CallCentreSidebar() {
  return <ModuleSidebar title="Call Centre" items={items} />
}
