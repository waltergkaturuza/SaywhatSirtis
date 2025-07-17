"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ModulePage } from "@/components/layout/enhanced-layout"
import { 
  ClipboardDocumentListIcon,
  PlusIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  DocumentArrowDownIcon,
  Cog8ToothIcon
} from "@heroicons/react/24/outline"

// Import inventory components
import { InventoryDashboard } from "../../components/inventory/inventory-dashboard"
import { AssetRegistration } from "../../components/inventory/asset-registration"
import { AssetTable } from "../../components/inventory/asset-table"
import { AssetSummary } from "../../components/inventory/asset-summary"
import { InventoryReports } from "../../components/inventory/inventory-reports"
import { InventoryAudits } from "../../components/inventory/inventory-audits"

interface InventoryPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
  canAudit: boolean
  canManageLocations: boolean
  canManageCategories: boolean
  canViewFinancials: boolean
  canManageFinancials: boolean
  canGenerateReports: boolean
}

export default function InventoryManagementPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [permissions, setPermissions] = useState<InventoryPermissions>({
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canAudit: false,
    canManageLocations: false,
    canManageCategories: false,
    canViewFinancials: false,
    canManageFinancials: false,
    canGenerateReports: false,
  })

  useEffect(() => {
    // Check user permissions - restrict to Finance and Administration
    if (session?.user) {
      const userRoles = session.user.roles
      const userDepartment = session.user.department

      const hasAccess = userDepartment === 'Finance' || 
                       userDepartment === 'Administration' || 
                       userRoles?.includes('admin') || 
                       userRoles?.includes('superadmin')

      if (hasAccess) {
        setPermissions({
          canView: true,
          canCreate: userDepartment === 'Finance' || userDepartment === 'Administration',
          canEdit: userDepartment === 'Finance' || userDepartment === 'Administration',
          canDelete: userDepartment === 'Administration' || userRoles?.includes('admin'),
          canApprove: userDepartment === 'Finance' || userRoles?.includes('admin'),
          canAudit: true,
          canManageLocations: userDepartment === 'Administration',
          canManageCategories: userDepartment === 'Administration',
          canViewFinancials: userDepartment === 'Finance' || userRoles?.includes('admin'),
          canManageFinancials: userDepartment === 'Finance',
          canGenerateReports: true,
        })
      }
    }
  }, [session])

  // Access control check
  if (!permissions.canView) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            Inventory management is restricted to Finance and Administration departments only.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator if you need access to this module.
          </p>
        </div>
      </div>
    )
  }

  const metadata = {
    title: "Advanced Inventory Management",
    description: "Comprehensive asset tracking with RFID integration, depreciation management, and automated workflows",
    breadcrumbs: [
      { name: "Inventory Management" }
    ]
  }

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Squares2X2Icon,
    },
    {
      id: "assets", 
      name: "Asset Management",
      icon: ClipboardDocumentListIcon,
    },
    {
      id: "register",
      name: "Asset Registration",
      icon: PlusIcon,
    },
    {
      id: "summary",
      name: "Data Summary",
      icon: ChartBarIcon,
    },
    {
      id: "reports",
      name: "Reports",
      icon: DocumentTextIcon,
    },
    {
      id: "audits",
      name: "Audit Trail",
      icon: ShieldCheckIcon,
    },
  ]

  const actions = (
    <div className="flex items-center space-x-4">
      {activeTab === "assets" && (
        <div className="flex items-center space-x-2">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      )}
      
      {permissions.canGenerateReports && (
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Export
        </button>
      )}
      
      {permissions.canCreate && (
        <button 
          onClick={() => setActiveTab("register")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Asset
        </button>
      )}
      
      <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
        <Cog8ToothIcon className="h-4 w-4 mr-2" />
        Settings
      </button>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "assets":
        return <AssetTable searchQuery={searchQuery} permissions={permissions} />
      case "register":
        return <AssetRegistration permissions={permissions} onSuccess={() => setActiveTab("assets")} />
      case "summary":
        return <AssetSummary searchQuery={searchQuery} permissions={permissions} />
      case "reports":
        return <InventoryReports permissions={permissions} />
      case "audits":
        return <InventoryAudits permissions={permissions} />
      case "maintenance":
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Management</h3>
            <p className="text-gray-600">Maintenance tracking feature coming soon...</p>
          </div>
        )
      default:
        return <InventoryDashboard permissions={permissions} />
    }
  }

  return (
    <ModulePage metadata={metadata} actions={actions}>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {renderTabContent()}
        </div>
      </div>
    </ModulePage>
  )
}
