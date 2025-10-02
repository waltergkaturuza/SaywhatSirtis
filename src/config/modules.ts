import {
  HomeIcon,
  DocumentTextIcon,
  PhoneIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  FolderIcon,
  InformationCircleIcon,
  ChartBarIcon,
  MapIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  CalendarIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  Cog6ToothIcon,
  DocumentIcon,
  ClipboardIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ComputerDesktopIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentChartBarIcon,
  CloudArrowUpIcon,
  FolderOpenIcon,
  ShareIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ChartPieIcon,
  ServerIcon,
  KeyIcon
} from "@heroicons/react/24/outline"
import { 
  AnalyticsWidget, 
  PerformanceWidget, 
  ReportsWidget, 
  TasksWidget, 
  NotificationsWidget, 
  QuickActionsWidget, 
  SystemStatusWidget, 
  WeatherWidget
} from "@/components/dashboard/widgets"
import { ModuleConfig, DashboardWidget } from "@/types/navigation"

// Dashboard Widgets Configuration
export const dashboardWidgets: DashboardWidget[] = [
  {
    id: "project-overview",
    title: "Project Overview",
    component: PerformanceWidget,
    size: "lg",
    order: 1,
    requiredPermissions: ["dashboard.projects"]
  },
  {
    id: "call-center-stats",
    title: "Call Center Statistics",
    component: NotificationsWidget,
    size: "md",
    order: 2,
    requiredPermissions: ["dashboard.calls"]
  },
  {
    id: "membership-analytics",
    title: "Membership Analytics",
    component: AnalyticsWidget,
    size: "md",
    order: 3,
    requiredPermissions: ["dashboard.membership"]
  },
  {
    id: "financial-summary",
    title: "Financial Summary",
    component: ReportsWidget,
    size: "lg",
    order: 4,
    requiredPermissions: ["dashboard.finance"]
  },
  {
    id: "performance-metrics",
    title: "Performance Metrics",
    component: SystemStatusWidget,
    size: "xl",
    order: 5,
    requiredPermissions: ["dashboard.performance"]
  },
  {
    id: "alerts-notifications",
    title: "Alerts & Notifications",
    component: QuickActionsWidget,
    size: "sm",
    order: 6
  }
]

// Modules Configuration
export const modulesConfig: ModuleConfig[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Real-time analytics and overview",
    icon: HomeIcon,
    color: "indigo",
    defaultPath: "/",
    requiredPermissions: [],
    navigation: [
      {
        id: "overview",
        name: "Overview",
        href: "/",
        icon: ChartBarIcon,
        description: "Main dashboard view"
      },
      {
        id: "analytics",
        name: "Advanced Analytics",
        href: "/analytics",
        icon: PresentationChartLineIcon,
        description: "Detailed analytics and reporting"
      },
      {
        id: "maps",
        name: "Geographic View",
        href: "/maps",
        icon: MapIcon,
        description: "Interactive project mapping"
      }
    ]
  },
  {
    id: "programs",
    name: "Programs Management",
    description: "Project lifecycle and performance tracking",
    icon: DocumentTextIcon,
    color: "green",
    defaultPath: "/programs",
    requiredPermissions: ["programs.view"],
    navigation: [
      {
        id: "projects",
        name: "Projects",
        href: "/programs",
        icon: DocumentIcon,
        description: "All active projects",
        children: [
          {
            id: "project-list",
            name: "Project List",
            href: "/programs/projects",
            icon: ClipboardDocumentListIcon
          },
          {
            id: "create-project",
            name: "Create Project",
            href: "/programs/projects/create",
            icon: PlusIcon,
            requiredPermissions: ["programs.create"]
          },
          {
            id: "project-templates",
            name: "Templates",
            href: "/programs/templates",
            icon: DocumentDuplicateIcon
          }
        ]
      },
      {
        id: "indicators",
        name: "M&E Indicators",
        href: "/programs/indicators",
        icon: ArrowTrendingUpIcon,
        description: "Monitoring & Evaluation indicators",
        requiredPermissions: ["programs.indicators"]
      },
      {
        id: "reports",
        name: "Progress Reports",
        href: "/programs/reports",
        icon: ClipboardIcon,
        description: "Project progress and status reports"
      },
      {
        id: "calendar",
        name: "Project Calendar",
        href: "/programs/calendar",
        icon: CalendarIcon,
        description: "Timeline and milestone tracking"
      },
      {
        id: "budget",
        name: "Budget Management",
        href: "/programs/budget",
        icon: CurrencyDollarIcon,
        description: "Financial tracking and budget allocation",
        requiredPermissions: ["programs.budget"]
      }
    ]
  },
  {
    id: "call-centre",
    name: "Call Centre",
    description: "Call management, case tracking, and customer support",
    icon: PhoneIcon,
    color: "blue", 
    defaultPath: "/call-centre",
    requiredPermissions: ["callcentre.access"],
    navigation: [
      {
        id: "dashboard",
        name: "Call Centre Dashboard",
        href: "/call-centre",
        icon: ChartBarIcon,
        description: "Call centre overview and statistics"
      },
      {
        id: "new-call",
        name: "New Call Entry",
        href: "/call-centre/new-call",
        icon: PlusIcon,
        description: "Record new incoming or outgoing call",
        requiredPermissions: ["callcentre.officer"]
      },
      {
        id: "data-summary",
        name: "Data Summary",
        href: "/call-centre/data-summary",
        icon: DocumentChartBarIcon,
        description: "Analytics and reporting with search parameters"
      },
      {
        id: "case-management",
        name: "Case Management",
        href: "/call-centre/case-management",
        icon: ClipboardIcon,
        description: "Track and manage client cases"
      },
      {
        id: "calls",
        name: "All Calls",
        href: "/call-centre/all-calls",
        icon: PhoneIcon,
        description: "View all call records"
      }
    ]
  },
  {
    id: "hr",
    name: "Human Resources",
    description: "Employee management and performance",
    icon: UserGroupIcon,
    color: "orange",
    defaultPath: "/hr",
    requiredPermissions: ["hr.view"],
    navigation: [
      {
        id: "dashboard",
        name: "HR Dashboard",
        href: "/hr",
        icon: ChartBarIcon,
        description: "HR overview and metrics"
      },
      {
        id: "employees",
        name: "Employee Management",
        href: "/hr/employees",
        icon: UsersIcon,
        description: "Staff directory and management",
        children: [
          {
            id: "employee-list",
            name: "All Employees",
            href: "/hr/employees",
            icon: UsersIcon
          },
          {
            id: "add-employee",
            name: "Add Employee",
            href: "/hr/employees/add",
            icon: PlusIcon,
            requiredPermissions: ["hr.employees.create"]
          },
          {
            id: "employee-archive",
            name: "Archived Staff",
            href: "/hr/employees/archived",
            icon: ArchiveBoxIcon,
            requiredPermissions: ["hr.employees.archive"]
          }
        ]
      },
      {
        id: "performance",
        name: "Performance Management",
        href: "/hr/performance",
        icon: ArrowTrendingUpIcon,
        description: "Performance planning and appraisals",
        children: [
          {
            id: "performance-plans",
            name: "Performance Plans",
            href: "/hr/performance/plans",
            icon: ClipboardIcon
          },
          {
            id: "appraisals",
            name: "Appraisals",
            href: "/hr/performance/appraisals",
            icon: AcademicCapIcon
          },
          {
            id: "performance-analytics",
            name: "Performance Analytics",
            href: "/hr/performance/analytics",
            icon: ChartBarIcon,
            requiredPermissions: ["hr.analytics"]
          }
        ]
      },
      {
        id: "training",
        name: "Training & Development",
        href: "/hr/training",
        icon: BookOpenIcon,
        description: "Staff training and development programs"
      },
      {
        id: "notifications",
        name: "Notification Routing",
        href: "/hr/notifications",
        icon: BellIcon,
        description: "HR notification management and routing",
        requiredPermissions: ["hr.notifications"]
      }
    ]
  },
  {
    id: "inventory",
    name: "Inventory & Assets",
    description: "Asset management and tracking",
    icon: ArchiveBoxIcon,
    color: "orange",
    defaultPath: "/inventory",
    requiredPermissions: ["inventory.view"],
    navigation: [
      {
        id: "dashboard",
        name: "Inventory Dashboard",
        href: "/inventory",
        icon: ChartBarIcon,
        description: "Asset overview and metrics"
      },
      {
        id: "assets",
        name: "Asset Management",
        href: "/inventory/assets",
        icon: ComputerDesktopIcon,
        description: "All organizational assets",
        children: [
          {
            id: "asset-list",
            name: "All Assets",
            href: "/inventory/assets",
            icon: ComputerDesktopIcon
          },
          {
            id: "add-asset",
            name: "Register Asset",
            href: "/inventory/assets/add",
            icon: PlusIcon,
            requiredPermissions: ["inventory.assets.create"]
          },
          {
            id: "asset-categories",
            name: "Categories",
            href: "/inventory/assets/categories",
            icon: TagIcon
          }
        ]
      },
      {
        id: "maintenance",
        name: "Maintenance",
        href: "/inventory/maintenance",
        icon: CogIcon,
        description: "Asset maintenance scheduling",
        children: [
          {
            id: "maintenance-schedule",
            name: "Schedule",
            href: "/inventory/maintenance/schedule",
            icon: CalendarIcon
          },
          {
            id: "maintenance-requests",
            name: "Requests",
            href: "/inventory/maintenance/requests",
            icon: ExclamationTriangleIcon
          },
          {
            id: "maintenance-history",
            name: "History",
            href: "/inventory/maintenance/history",
            icon: ClipboardDocumentListIcon
          }
        ]
      },
      {
        id: "procurement",
        name: "Procurement",
        href: "/inventory/procurement",
        icon: TruckIcon,
        description: "Purchase orders and procurement",
        requiredPermissions: ["inventory.procurement"]
      },
      {
        id: "reports",
        name: "Asset Reports",
        href: "/inventory/reports",
        icon: DocumentIcon,
        description: "Asset valuation and reports"
      }
    ]
  },
  {
    id: "analytics",
    name: "Analytics & Reporting",
    description: "Advanced analytics and business intelligence",
    icon: ChartBarIcon,
    color: "purple",
    defaultPath: "/analytics",
    requiredPermissions: ["analytics.view"],
    navigation: [
      {
        id: "overview",
        name: "Analytics Overview",
        href: "/analytics",
        icon: ChartBarIcon,
        description: "Main analytics dashboard"
      },
      {
        id: "programs",
        name: "Program Analytics",
        href: "/analytics/programs",
        icon: PresentationChartLineIcon,
        description: "Program performance analytics"
      },
      {
        id: "users",
        name: "User Analytics",
        href: "/analytics/users",
        icon: UserGroupIcon,
        description: "User engagement analytics"
      },
      {
        id: "financial",
        name: "Financial Analytics",
        href: "/analytics/financial",
        icon: CurrencyDollarIcon,
        description: "Financial performance analysis"
      },
      {
        id: "operations",
        name: "Operations Analytics",
        href: "/analytics/operations",
        icon: ClockIcon,
        description: "Operational metrics and performance"
      },
      {
        id: "reports",
        name: "Custom Reports",
        href: "/analytics/reports",
        icon: DocumentChartBarIcon,
        description: "Generate custom reports",
        requiredPermissions: ["analytics.reports"]
      }
    ]
  },
  {
    id: "documents",
    name: "Document Repository",
    description: "Advanced AI-powered document management with security classifications",
    icon: FolderIcon,
    color: "cyan",
    defaultPath: "/documents",
    requiredPermissions: ["documents.view"],
    navigation: [
      {
        id: "dashboard",
        name: "Document Dashboard",
        href: "/documents",
        icon: ChartBarIcon,
        description: "Document management overview and analytics"
      },
      {
        id: "library",
        name: "Document Library",
        href: "/documents/library",
        icon: FolderIcon,
        description: "Browse and manage all documents"
      },
      {
        id: "upload",
        name: "Upload Documents",
        href: "/documents/upload",
        icon: CloudArrowUpIcon,
        description: "Upload and classify new documents",
        requiredPermissions: ["documents.create"]
      },
      {
        id: "categories",
        name: "Categories & Folders",
        href: "/documents/categories",
        icon: FolderOpenIcon,
        description: "Organize documents in folders and categories",
        children: [
          {
            id: "flagship-events",
            name: "Flagship Events",
            href: "/documents/categories/flagship",
            icon: CalendarIcon
          },
          {
            id: "donor-reports",
            name: "Donor Reports",
            href: "/documents/categories/donor",
            icon: DocumentIcon
          },
          {
            id: "annual-reports",
            name: "Annual Reports",
            href: "/documents/categories/annual",
            icon: BookOpenIcon
          },
          {
            id: "policies",
            name: "Policies & Procedures",
            href: "/documents/categories/policies",
            icon: ShieldCheckIcon
          },
          {
            id: "research",
            name: "Research Papers",
            href: "/documents/categories/research",
            icon: AcademicCapIcon
          },
          {
            id: "financial",
            name: "Financial Documents",
            href: "/documents/categories/financial",
            icon: BanknotesIcon
          },
          {
            id: "hr",
            name: "HR Documents",
            href: "/documents/categories/hr",
            icon: UserGroupIcon
          }
        ]
      },
      {
        id: "search",
        name: "AI Search & Discovery",
        href: "/documents/ai-search",
        icon: MagnifyingGlassIcon,
        description: "Intelligent document search with AI"
      },
      {
        id: "shared",
        name: "Shared Documents",
        href: "/documents/shared",
        icon: ShareIcon,
        description: "Documents shared with you"
      },
      {
        id: "microsoft365",
        name: "Microsoft 365 Integration",
        href: "/documents/microsoft365",
        icon: CloudArrowUpIcon,
        description: "SharePoint, Teams, and OneDrive integration",
        requiredPermissions: ["documents.microsoft365"],
        children: [
          {
            id: "sharepoint",
            name: "SharePoint Documents",
            href: "/documents/microsoft365/sharepoint",
            icon: FolderIcon
          },
          {
            id: "teams",
            name: "Teams Files",
            href: "/documents/microsoft365/teams",
            icon: ChatBubbleLeftRightIcon
          },
          {
            id: "onedrive",
            name: "OneDrive Files",
            href: "/documents/microsoft365/onedrive",
            icon: CloudArrowUpIcon
          },
          {
            id: "sync",
            name: "Sync & Import",
            href: "/documents/microsoft365/sync",
            icon: ArrowPathIcon
          }
        ]
      },
      {
        id: "workflow",
        name: "Document Workflow",
        href: "/documents/workflow",
        icon: ArrowPathIcon,
        description: "Approval and review workflows",
        requiredPermissions: ["documents.workflow"]
      },
      {
        id: "security",
        name: "Security & Classification",
        href: "/documents/security",
        icon: LockClosedIcon,
        description: "Manage document security levels",
        requiredPermissions: ["documents.security"]
      },
      {
        id: "analytics",
        name: "Usage Analytics",
        href: "/documents/analytics",
        icon: ChartPieIcon,
        description: "Document access and usage analytics",
        requiredPermissions: ["documents.analytics"]
      },
      {
        id: "audit",
        name: "Audit Trail",
        href: "/documents/audit",
        icon: ClipboardDocumentListIcon,
        description: "Document access and modification logs",
        requiredPermissions: ["documents.audit"]
      }
    ]
  },
  {
    id: "settings",
    name: "System Settings",
    description: "System configuration and administration",
    icon: Cog6ToothIcon,
    color: "gray",
    defaultPath: "/settings",
    requiredPermissions: ["admin.settings"],
    navigation: [
      {
        id: "general",
        name: "General Settings",
        href: "/settings",
        icon: CogIcon,
        description: "System-wide configuration"
      },
      {
        id: "users",
        name: "User Management",
        href: "/settings/users",
        icon: UserIcon,
        description: "User accounts and permissions",
        requiredPermissions: ["admin.users"]
      },
      {
        id: "roles",
        name: "Roles & Permissions",
        href: "/settings/roles",
        icon: ShieldCheckIcon,
        description: "Access control management",
        requiredPermissions: ["admin.roles"]
      },
      {
        id: "integrations",
        name: "Integrations",
        href: "/settings/integrations",
        icon: Cog6ToothIcon,
        description: "External system integrations",
        requiredPermissions: ["admin.integrations"]
      },
      {
        id: "audit",
        name: "Audit Logs",
        href: "/settings/audit",
        icon: ClipboardDocumentListIcon,
        description: "System activity logs",
        requiredPermissions: ["admin.audit"]
      }
    ]
  },
  {
    id: "admin",
    name: "Admin",
    description: "Administrative tools and settings",
    icon: Cog6ToothIcon,
    color: "red",
    defaultPath: "/admin",
    requiredPermissions: ["admin.access"],
    navigation: [
      {
        id: "dashboard",
        name: "Admin Dashboard",
        href: "/admin",
        icon: ChartBarIcon,
        description: "Overview of system status and metrics"
      },
      {
        id: "user-management",
        name: "User Management",
        href: "/admin/users",
        icon: UserIcon,
        description: "Manage user accounts and permissions"
      },
      {
        id: "role-management",
        name: "Role Management",
        href: "/admin/roles",
        icon: ShieldCheckIcon,
        description: "Manage roles and access permissions"
      },
      {
        id: "system-settings",
        name: "System Settings",
        href: "/admin/settings",
        icon: CogIcon,
        description: "Configure system-wide settings"
      },
      {
        id: "audit-logs",
        name: "Audit Logs",
        href: "/admin/audit",
        icon: ClipboardDocumentListIcon,
        description: "View system audit logs"
      },
      {
        id: "api-keys",
        name: "API Keys",
        href: "/admin/api-keys",
        icon: KeyIcon,
        description: "Manage API keys for integrations"
      },
      {
        id: "database",
        name: "Database Management",
        href: "/admin/database",
        icon: ServerIcon,
        description: "Manage database connections and settings"
      },
      {
        id: "server-status",
        name: "Server Status",
        href: "/admin/server-status",
        icon: ServerIcon,
        description: "View server status and performance metrics"
      }
    ]
  }
]

// Helper function to get module by ID
export const getModuleById = (id: string): ModuleConfig | undefined => {
  return modulesConfig.find(module => module.id === id)
}

// Helper function to get navigation items for a module
export const getModuleNavigation = (moduleId: string, userPermissions: string[] = []) => {
  const moduleConfig = getModuleById(moduleId)
  if (!moduleConfig) return []

  return moduleConfig.navigation.filter(item => {
    if (!item.requiredPermissions?.length) return true
    return item.requiredPermissions.some(permission => userPermissions.includes(permission))
  })
}

// Helper function to get available modules for user
export const getAvailableModules = (userPermissions: string[] = []) => {
  return modulesConfig.filter(module => {
    if (!module.requiredPermissions.length) return true
    return module.requiredPermissions.some(permission => userPermissions.includes(permission))
  })
}
