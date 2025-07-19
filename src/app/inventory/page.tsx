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
  MapPinIcon as LocationIcon
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

// Dashboard wrapper component to manage dashboard state
const DashboardWrapper = ({ assets, permissions }: { assets?: Asset[], permissions: InventoryPermissions }) => {
  const [showAlerts, setShowAlerts] = useState(false)
  const [chartView, setChartView] = useState('overview')
  const [depreciationView, setDepreciationView] = useState('annual')
  
  // Sample alerts data (this would come from the API in a real app)
  const [alerts, setAlerts] = useState<AssetAlert[]>([
    {
      id: 1,
      assetId: 1,
      type: "maintenance_due",
      severity: "medium",
      message: "Scheduled maintenance due for Dell Latitude 7420",
      createdAt: "2024-07-15T10:30:00Z",
      acknowledged: false
    },
    {
      id: 2,
      assetId: 3,
      type: "warranty_expiry",
      severity: "high",
      message: "Warranty expiring soon for HP LaserJet Pro",
      createdAt: "2024-07-14T14:20:00Z",
      acknowledged: false
    }
  ])

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

  // Enhanced sample asset data for rich visualizations
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "1",
      name: "Dell Latitude 7420 Laptop",
      assetNumber: "IT-2024-0001",
      assetTag: "DL7420-TAG-001",
      barcodeId: "123456789012",
      category: {
        id: "1",
        name: "Information Technology (IT) Equipment",
        code: "IT",
        description: "Computer and technology equipment"
      },
      type: {
        id: "1",
        name: "Laptops",
        code: "LAP",
        description: "Portable computers",
        depreciationRate: 20,
        usefulLife: 4,
        category: {
          id: "1",
          name: "Information Technology (IT) Equipment",
          code: "IT",
          description: "Computer and technology equipment"
        }
      },
      brand: "Dell",
      model: "Latitude 7420",
      serialNumber: "DL7420-2024-001",
      status: "active",
      condition: "excellent",
      location: {
        id: "1",
        name: "Head Office",
        code: "HO",
        type: "building",
        address: "123 Main Street, Harare"
      },
      department: "IT",
      assignedTo: "John Doe",
      procurementValue: 1500,
      currentValue: 1200,
      depreciationRate: 20,
      depreciationMethod: "straight-line",
      procurementDate: "2024-01-15",
      warrantyExpiry: "2027-01-15",
      lastAuditDate: "2024-06-15",
      nextMaintenanceDate: "2024-09-15",
      assignedProgram: "Digital Transformation",
      assignedProject: "Office Modernization",
      rfidTag: "RF001234",
      qrCode: "QR001234",
      description: "High-performance business laptop for development work",
      images: ["/api/assets/images/laptop-1.jpg"],
      documents: [],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-07-19T10:00:00Z",
      createdBy: "Finance Officer",
      lastModifiedBy: "IT Administrator",
      coordinates: {
        lat: -17.8216,
        lng: 31.0492,
        lastUpdated: "2024-07-19T10:00:00Z",
        accuracy: 5
      },
      expectedLifespan: 4
    },
    {
      id: "2",
      name: "HP LaserJet Pro Printer",
      assetNumber: "OF-2024-0002",
      assetTag: "HP404-TAG-002",
      barcodeId: "123456789013",
      category: {
        id: "2",
        name: "Office Equipment",
        code: "OF",
        description: "General office equipment and supplies"
      },
      type: {
        id: "2",
        name: "Printers & Scanners",
        code: "PRT",
        description: "Printing and scanning devices",
        depreciationRate: 15,
        usefulLife: 5,
        category: {
          id: "2",
          name: "Office Equipment",
          code: "OF",
          description: "General office equipment and supplies"
        }
      },
      brand: "HP",
      model: "LaserJet Pro M404n",
      serialNumber: "HP404-2024-002",
      status: "active",
      condition: "good",
      location: {
        id: "2",
        name: "Branch Office A",
        code: "BOA",
        type: "building",
        address: "456 Branch Street, Harare"
      },
      department: "Administration",
      assignedTo: "Jane Smith",
      procurementValue: 300,
      currentValue: 240,
      depreciationRate: 15,
      depreciationMethod: "straight-line",
      procurementDate: "2024-02-10",
      warrantyExpiry: "2026-02-10",
      lastAuditDate: "2024-06-20",
      nextMaintenanceDate: "2024-10-10",
      assignedProgram: "Office Operations",
      rfidTag: "RF001235",
      qrCode: "QR001235",
      description: "Network laser printer for office documentation",
      images: [],
      documents: [],
      createdAt: "2024-02-10T14:00:00Z",
      updatedAt: "2024-07-19T10:00:00Z",
      createdBy: "Admin Officer",
      lastModifiedBy: "IT Administrator",
      coordinates: {
        lat: -17.8350,
        lng: 31.0650,
        lastUpdated: "2024-07-19T09:30:00Z",
        accuracy: 8
      },
      expectedLifespan: 5
    },
    {
      id: "3",
      name: "Toyota Corolla Company Vehicle",
      assetNumber: "VH-2024-0003",
      assetTag: "TC2024-TAG-003",
      barcodeId: "123456789014",
      category: {
        id: "3",
        name: "Vehicles & Transport",
        code: "VH",
        description: "Transportation vehicles and equipment"
      },
      type: {
        id: "3",
        name: "Cars",
        code: "CAR",
        description: "Passenger vehicles",
        depreciationRate: 12,
        usefulLife: 8,
        category: {
          id: "3",
          name: "Vehicles & Transport",
          code: "VH",
          description: "Transportation vehicles and equipment"
        }
      },
      brand: "Toyota",
      model: "Corolla 2024",
      serialNumber: "TC2024-001",
      status: "active",
      condition: "excellent",
      location: {
        id: "1",
        name: "Head Office",
        code: "HO",
        type: "building",
        address: "123 Main Street, Harare"
      },
      department: "Operations",
      assignedTo: "Mike Johnson",
      procurementValue: 25000,
      currentValue: 22000,
      depreciationRate: 12,
      depreciationMethod: "straight-line",
      procurementDate: "2024-01-05",
      warrantyExpiry: "2027-01-05",
      lastAuditDate: "2024-07-01",
      nextMaintenanceDate: "2024-08-05",
      assignedProgram: "Transportation",
      assignedProject: "Field Operations",
      rfidTag: "RF001236",
      qrCode: "QR001236",
      description: "Company vehicle for business operations and client visits",
      images: [],
      documents: [],
      createdAt: "2024-01-05T09:00:00Z",
      updatedAt: "2024-07-19T10:00:00Z",
      createdBy: "Fleet Manager",
      lastModifiedBy: "Operations Manager",
      coordinates: {
        lat: -17.8100,
        lng: 31.0450,
        lastUpdated: "2024-07-19T08:45:00Z",
        accuracy: 3
      },
      expectedLifespan: 8
    },
    {
      id: "4",
      name: "Industrial Generator",
      assetNumber: "MC-2024-0004",
      assetTag: "GEN-TAG-004",
      barcodeId: "123456789015",
      category: {
        id: "4",
        name: "Machinery",
        code: "MC",
        description: "Industrial machinery and equipment"
      },
      type: {
        id: "4",
        name: "Power Equipment",
        code: "PWR",
        description: "Power generation equipment",
        depreciationRate: 10,
        usefulLife: 15,
        category: {
          id: "4",
          name: "Machinery",
          code: "MC",
          description: "Industrial machinery and equipment"
        }
      },
      brand: "Caterpillar",
      model: "C9 Generator",
      serialNumber: "CAT-GEN-2024-001",
      status: "under-maintenance",
      condition: "good",
      location: {
        id: "3",
        name: "Warehouse",
        code: "WH",
        type: "building",
        address: "789 Industrial Road, Harare"
      },
      department: "Operations",
      assignedTo: "Technical Team",
      procurementValue: 45000,
      currentValue: 42000,
      depreciationRate: 10,
      depreciationMethod: "straight-line",
      procurementDate: "2023-08-15",
      warrantyExpiry: "2025-08-15",
      lastAuditDate: "2024-05-30",
      nextMaintenanceDate: "2024-08-15",
      assignedProgram: "Infrastructure",
      assignedProject: "Power Backup Systems",
      rfidTag: "RF001237",
      qrCode: "QR001237",
      description: "Backup power generator for critical operations",
      images: [],
      documents: [],
      createdAt: "2023-08-15T11:00:00Z",
      updatedAt: "2024-07-19T10:00:00Z",
      createdBy: "Technical Manager",
      lastModifiedBy: "Maintenance Team",
      coordinates: {
        lat: -17.8280,
        lng: 31.0580,
        lastUpdated: "2024-07-19T07:15:00Z",
        accuracy: 10
      },
      expectedLifespan: 15
    },
    {
      id: "5",
      name: "Conference Room Projector",
      assetNumber: "OF-2024-0005",
      assetTag: "PROJ-TAG-005",
      barcodeId: "123456789016",
      category: {
        id: "2",
        name: "Office Equipment",
        code: "OF",
        description: "General office equipment and supplies"
      },
      type: {
        id: "5",
        name: "Audio Visual",
        code: "AV",
        description: "Audio visual equipment",
        depreciationRate: 18,
        usefulLife: 6,
        category: {
          id: "2",
          name: "Office Equipment",
          code: "OF",
          description: "General office equipment and supplies"
        }
      },
      brand: "Epson",
      model: "PowerLite 1795F",
      serialNumber: "EPSON-PROJ-2024-001",
      status: "active",
      condition: "excellent",
      location: {
        id: "1",
        name: "Head Office",
        code: "HO",
        type: "building",
        address: "123 Main Street, Harare"
      },
      department: "Administration",
      assignedTo: "Conference Room A",
      procurementValue: 800,
      currentValue: 650,
      depreciationRate: 18,
      depreciationMethod: "straight-line",
      procurementDate: "2023-11-20",
      warrantyExpiry: "2025-11-20",
      lastAuditDate: "2024-06-15",
      nextMaintenanceDate: "2024-11-20",
      assignedProgram: "Office Operations",
      rfidTag: "RF001238",
      qrCode: "QR001238",
      description: "High-definition projector for presentations and meetings",
      images: [],
      documents: [],
      createdAt: "2023-11-20T16:00:00Z",
      updatedAt: "2024-07-19T10:00:00Z",
      createdBy: "Admin Officer",
      lastModifiedBy: "IT Administrator",
      coordinates: {
        lat: -17.8216,
        lng: 31.0492,
        lastUpdated: "2024-07-19T10:00:00Z",
        accuracy: 2
      },
      expectedLifespan: 6
    },
    {
      id: "6",
      name: "Server Rack Equipment",
      assetNumber: "IT-2024-0006",
      assetTag: "SRV-TAG-006",
      barcodeId: "123456789017",
      category: {
        id: "1",
        name: "Information Technology (IT) Equipment",
        code: "IT",
        description: "Computer and technology equipment"
      },
      type: {
        id: "6",
        name: "Servers",
        code: "SRV",
        description: "Server hardware",
        depreciationRate: 25,
        usefulLife: 5,
        category: {
          id: "1",
          name: "Information Technology (IT) Equipment",
          code: "IT",
          description: "Computer and technology equipment"
        }
      },
      brand: "HPE",
      model: "ProLiant DL380 Gen10",
      serialNumber: "HPE-SRV-2024-001",
      status: "active",
      condition: "good",
      location: {
        id: "4",
        name: "Data Center",
        code: "DC",
        type: "building",
        address: "Server Room, Head Office"
      },
      department: "IT",
      assignedTo: "Server Administrator",
      procurementValue: 8500,
      currentValue: 6000,
      depreciationRate: 25,
      depreciationMethod: "straight-line",
      procurementDate: "2023-05-10",
      warrantyExpiry: "2026-05-10",
      lastAuditDate: "2024-07-15",
      nextMaintenanceDate: "2024-09-10",
      assignedProgram: "IT Infrastructure",
      assignedProject: "Server Modernization",
      rfidTag: "RF001239",
      qrCode: "QR001239",
      description: "Enterprise server for business applications",
      images: [],
      documents: [],
      createdAt: "2023-05-10T12:00:00Z",
      updatedAt: "2024-07-19T10:00:00Z",
      createdBy: "IT Manager",
      lastModifiedBy: "System Administrator",
      coordinates: {
        lat: -17.8216,
        lng: 31.0492,
        lastUpdated: "2024-07-19T10:00:00Z",
        accuracy: 1
      },
      expectedLifespan: 5
    }
  ])

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
        return <DashboardWrapper assets={assets} permissions={permissions} />
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
        return <DashboardWrapper assets={assets} permissions={permissions} />
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
