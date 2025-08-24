"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ModulePage } from "@/components/layout/enhanced-layout"
import { 
  ClipboardDocumentListIcon,
  PlusIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  MapPinIcon as LocationIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { ExportButton } from "@/components/ui/export-button"
import { ImportButton } from "@/components/ui/import-button"

// Import modular components
import { InventoryDashboard } from "@/components/inventory/dashboard"
import { AssetRegistration } from "@/components/inventory/registration"
import { AuditManagement } from "@/components/inventory/audit-management"
import { ReportsAnalytics } from "@/components/inventory/reports-analytics-enhanced"
import { MaintenanceManagement } from "@/components/inventory/maintenance-management"
import { LocationTracking } from "@/components/inventory/location-tracking-enhanced"
import { AssetsManagement } from "@/components/inventory/assets-management"
import { DatabaseStatusIndicator } from "@/components/inventory/database-status"

// Types
import { Asset, AssetAlert, InventoryPermissions } from '@/types/inventory'

// Database status component
const DatabaseStatus = ({ isConnected, isLoading, error }: { 
  isConnected: boolean, 
  isLoading: boolean, 
  error?: string 
}) => (
  <div className="mb-6 p-4 rounded-lg border-2 border-dashed">
    {isLoading ? (
      <div className="flex items-center space-x-3 text-blue-600">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span>Connecting to database...</span>
      </div>
    ) : isConnected ? (
      <div className="flex items-center space-x-3 text-green-600">
        <ShieldCheckIcon className="h-5 w-5" />
        <span className="font-medium">✅ Connected to Live Database</span>
        <span className="text-sm text-gray-500">Real-time inventory data</span>
      </div>
    ) : (
      <div className="flex items-center space-x-3 text-red-600">
        <ExclamationTriangleIcon className="h-5 w-5" />
        <span className="font-medium">❌ Database Connection Failed</span>
        {error && <span className="text-sm text-gray-500">Error: {error}</span>}
      </div>
    )}
  </div>
)

// Dashboard wrapper component to manage dashboard state
const DashboardWrapper = ({ assets, permissions, isLoading }: { 
  assets?: Asset[], 
  permissions: InventoryPermissions,
  isLoading: boolean 
}) => {
  const [showAlerts, setShowAlerts] = useState(false)
  const [chartView, setChartView] = useState('overview')
  const [depreciationView, setDepreciationView] = useState('annual')
  
  // Real alerts would come from the API - for now we'll calculate from assets
  const [alerts, setAlerts] = useState<AssetAlert[]>([])

  // Generate alerts from real asset data
  useEffect(() => {
    if (assets && assets.length > 0) {
      const generatedAlerts: AssetAlert[] = []
      
      assets.forEach((asset, index) => {
        // Check for maintenance due (if warranty is expiring soon)
        if (asset.warrantyExpiry) {
          const warrantDate = new Date(asset.warrantyExpiry)
          const now = new Date()
          const daysUntilExpiry = Math.ceil((warrantDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
          
          if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            generatedAlerts.push({
              id: generatedAlerts.length + 1,
              assetId: parseInt(asset.id),
              type: "warranty_expiry",
              severity: daysUntilExpiry <= 7 ? "high" : "medium",
              message: `Warranty expiring in ${daysUntilExpiry} days for ${asset.name}`,
              createdAt: new Date().toISOString(),
              acknowledged: false
            })
          }
        }
        
        // Check for assets in poor condition
        if (asset.condition === 'poor' || asset.condition === 'damaged') {
          generatedAlerts.push({
            id: generatedAlerts.length + 1,
            assetId: parseInt(asset.id),
            type: "maintenance_due",
            severity: "high",
            message: `Asset in ${asset.condition} condition: ${asset.name}`,
            createdAt: new Date().toISOString(),
            acknowledged: false
          })
        }
      })
      
      setAlerts(generatedAlerts)
    }
  }, [assets])

  const acknowledgeAlert = (alertId: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const calculateCurrentValue = (asset: Asset) => {
    return asset.currentValue || asset.procurementValue
  }

  const getAssetIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'it':
      case 'information technology':
        return <ClipboardDocumentListIcon className="h-5 w-5" />
      default:
        return <Squares2X2Icon className="h-5 w-5" />
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <InventoryDashboard
      assets={assets}
      alerts={alerts}
      showAlerts={showAlerts}
      setShowAlerts={setShowAlerts}
      acknowledgeAlert={acknowledgeAlert}
      calculateCurrentValue={calculateCurrentValue}
      getAssetIcon={getAssetIcon}
      getAlertSeverityColor={getAlertSeverityColor}
      chartView={chartView}
      setChartView={setChartView}
      depreciationView={depreciationView}
      setDepreciationView={setDepreciationView}
    />
  )
}

export default function InventoryManagementPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // API data states
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string>("")
  
  // Fetch assets from API
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true)
        setError("")
        
        console.log('Fetching assets from API...')
        const response = await fetch('/api/inventory/assets')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Assets API response:', data)
        
        if (data.assets && Array.isArray(data.assets)) {
          setAssets(data.assets)
          setIsConnected(true)
          console.log(`Loaded ${data.assets.length} assets from database`)
        } else {
          console.warn('No assets found in API response')
          setAssets([])
          setIsConnected(true)
        }
      } catch (err) {
        console.error('Failed to fetch assets:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsConnected(false)
        setAssets([]) // Clear any existing mock data
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchAssets()
    }
  }, [session])
  
  // States for asset registration
  const [createFormData, setCreateFormData] = useState<Partial<Asset>>({})
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([])
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  
  // Asset registration handlers
  const handleCreateAsset = () => {
    // Implementation for creating asset
    console.log('Creating asset:', createFormData)
  }
  
  const generateAssetNumber = () => {
    return `AST-${Date.now()}`
  }
  
  const generateBarcode = () => {
    return Math.random().toString(36).substr(2, 12)
  }
  
  const generateQRCode = (assetNumber: string) => {
    return `QR-${assetNumber}`
  }
  
  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      setSelectedImages(prev => [...prev, ...Array.from(files)])
    }
  }
  
  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      setSelectedDocuments(prev => [...prev, ...Array.from(files)])
    }
  }
  
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }
  
  const removeDocument = (index: number) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index))
  }
  
  const [permissions, setPermissions] = useState<InventoryPermissions>({
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canAudit: true,
    canManageLocations: true,
    canManageCategories: true,
    canViewFinancials: true,
    canManageFinancials: true,
    canGenerateReports: true,
    restrictedToLocations: undefined,
    restrictedToDepartments: undefined,
  })

  // Get refresh function to reload data
  const refreshAssets = () => {
    if (session) {
      setIsLoading(true)
      // Re-trigger the useEffect by changing a dependency
      const fetchAssets = async () => {
        try {
          setError("")
          
          console.log('Refreshing assets from API...')
          const response = await fetch('/api/inventory/assets')
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const data = await response.json()
          console.log('Assets API response:', data)
          
          if (data.assets && Array.isArray(data.assets)) {
            setAssets(data.assets)
            setIsConnected(true)
            console.log(`Refreshed ${data.assets.length} assets from database`)
          } else {
            console.warn('No assets found in API response')
            setAssets([])
            setIsConnected(true)
          }
        } catch (err) {
          console.error('Failed to refresh assets:', err)
          setError(err instanceof Error ? err.message : 'Unknown error')
          setIsConnected(false)
          setAssets([])
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchAssets()
    }
  }

  const metadata = {
    title: "Enterprise Inventory Management",
    description: "Comprehensive asset tracking with RFID integration, advanced analytics, real-time location tracking, depreciation management, and automated workflows",
    breadcrumbs: [
      { name: "SIRTIS" },
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
      name: "Assets Management",
      icon: ClipboardDocumentListIcon,
    },
    {
      id: "registration",
      name: "Asset Registration",
      icon: PlusIcon,
    },
    {
      id: "reports",
      name: "Reports & Analytics",
      icon: DocumentTextIcon,
    },
    {
      id: "audits",
      name: "Audit & Compliance",
      icon: ShieldCheckIcon,
    },
    {
      id: "maintenance",
      name: "Maintenance",
      icon: WrenchScrewdriverIcon,
    },
    {
      id: "tracking",
      name: "Location Tracking",
      icon: LocationIcon,
    }
  ]

  const actions = (
    <div className="flex items-center space-x-4">
      <ImportButton
        onImportComplete={(result) => {
          if (result.success) {
            console.log('Asset import completed:', result)
            alert('Assets imported successfully!')
          }
        }}
        acceptedFormats={['excel', 'csv']}
        templateFields={['name', 'category', 'type', 'brand', 'model', 'serialNumber', 'location', 'department', 'procurementValue']}
        title="Import Assets"
        variant="outline"
        size="sm"
      />
      
      <ExportButton
        data={{
          headers: ['Asset Number', 'Name', 'Category', 'Status', 'Location', 'Department', 'Assigned To', 'Value', 'Last Audit'],
          rows: assets.map(asset => [
            asset.assetNumber,
            asset.name,
            asset.category?.name || asset.category,
            asset.status,
            asset.location?.name || asset.location,
            asset.department,
            asset.assignedTo,
            `$${asset.currentValue.toLocaleString()}`,
            asset.lastAuditDate
          ])
        }}
        filename="assets-export"
        title="Export Assets"
        showOptions={true}
      />
      
      {permissions.canCreate && (
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardWrapper assets={assets} permissions={permissions} isLoading={isLoading} />
      case "assets":
        return <AssetsManagement assets={assets} permissions={permissions} onAssetUpdate={setAssets} />
      case "registration":
        return <AssetRegistration 
          createFormData={createFormData}
          setCreateFormData={setCreateFormData}
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          selectedDocuments={selectedDocuments}
          setSelectedDocuments={setSelectedDocuments}
          showBarcodeScanner={showBarcodeScanner}
          setShowBarcodeScanner={setShowBarcodeScanner}
          showImageUpload={showImageUpload}
          setShowImageUpload={setShowImageUpload}
          showDocumentUpload={showDocumentUpload}
          setShowDocumentUpload={setShowDocumentUpload}
          handleCreateAsset={handleCreateAsset}
          generateAssetNumber={generateAssetNumber}
          generateBarcode={generateBarcode}
          generateQRCode={generateQRCode}
          handleImageUpload={handleImageUpload}
          handleDocumentUpload={handleDocumentUpload}
          removeImage={removeImage}
          removeDocument={removeDocument}
          permissions={permissions}
        />
      case "reports":
        return <ReportsAnalytics assets={assets} permissions={permissions} />
      case "audits":
        return <AuditManagement assets={assets} permissions={permissions} />
      case "maintenance":
        return <MaintenanceManagement assets={assets} permissions={permissions} />
      case "tracking":
        return <LocationTracking assets={assets} permissions={permissions} />
      default:
        return <DashboardWrapper assets={assets} permissions={permissions} isLoading={isLoading} />
    }
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <DatabaseStatusIndicator />
        {renderTabContent()}
      </div>
    </ModulePage>
  )
}
