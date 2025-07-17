import { ReactNode } from "react"

export interface NavigationItem {
  id: string
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  badge?: string | number
  requiredPermissions?: string[]
  children?: NavigationItem[]
}

export interface ModuleConfig {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  navigation: NavigationItem[]
  defaultPath: string
  requiredPermissions: string[]
}

export interface DashboardWidget {
  id: string
  title: string
  component: React.ComponentType<any>
  size: "sm" | "md" | "lg" | "xl"
  order: number
  requiredPermissions?: string[]
}

export interface PageMetadata {
  title: string
  description: string
  breadcrumbs: Array<{
    name: string
    href?: string
  }>
}

export interface ModulePageProps {
  children: ReactNode
  metadata: PageMetadata
  actions?: ReactNode
  filters?: ReactNode
  sidebar?: ReactNode
}
