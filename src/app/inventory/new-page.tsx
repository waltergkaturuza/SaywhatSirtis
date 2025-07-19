"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ModulePage } from "@/components/layout/enhanced-layout"
import { cn } from "@/lib/utils"
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

// Types
import { Asset, AssetAlert, InventoryPermissions } from '@/types/inventory'

export default function InventoryManagementPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Tab configuration
  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Squares2X2Icon,
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
  
  // State management
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Form data
  const [editFormData, setEditFormData] = useState<Partial<Asset>>({})
  const [createFormData, setCreateFormData] = useState<Partial<Asset>>({})
  
  // Additional states for enhanced features
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([])
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [alerts, setAlerts] = useState<AssetAlert[]>([])
  const [showAlerts, setShowAlerts] = useState(false)
  const [chartView, setChartView] = useState('value')
  const [depreciationView, setDepreciationView] = useState('current')
  
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

  // Enhanced sample asset data with new categories
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
      }
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
      }
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
      }
    }
  ])

  // Sample alerts for demonstration
  useEffect(() => {
    const sampleAlerts: AssetAlert[] = [
      {
        id: 1,
        assetId: 2,
        type: 'warranty_expiry',
        message: 'HP LaserJet Pro Printer warranty expires in 6 months',
        severity: 'medium',
        dueDate: '2026-02-10',
        acknowledged: false,
        createdAt: '2024-07-19T10:00:00Z'
      },
      {
        id: 2,
        assetId: 3,
        type: 'maintenance_due',
        message: 'Toyota Corolla scheduled maintenance due soon',
        severity: 'high',
        dueDate: '2024-08-05',
        acknowledged: false,
        createdAt: '2024-07-19T10:00:00Z'
      }
    ]
    setAlerts(sampleAlerts)
  }, [])

  // Permission setup based on user role
  useEffect(() => {
    if (session?.user) {
      const userRoles = session.user.roles || []
      const userDepartment = session.user.department || ""
      const userPermissions = session.user.permissions || []

      const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin')
      const isManager = userRoles.includes('manager')
      const isFinance = userDepartment === 'Finance' || userDepartment === 'Administration'
      const hasInventoryAccess = userPermissions.includes('inventory.manage') || userPermissions.includes('asset.manage')
      
      setPermissions({
        canView: true,
        canCreate: isAdmin || isManager || isFinance || hasInventoryAccess,
        canEdit: isAdmin || isManager || isFinance || hasInventoryAccess,
        canDelete: isAdmin || userRoles.includes('asset.delete'),
        canApprove: isAdmin || isManager || userRoles.includes('asset.approve'),
        canAudit: true,
        canManageLocations: isAdmin || userDepartment === 'Administration',
        canManageCategories: isAdmin || userDepartment === 'Administration',
        canViewFinancials: isAdmin || isFinance || userPermissions.includes('financial.view'),
        canManageFinancials: isAdmin || userDepartment === 'Finance',
        canGenerateReports: true,
        restrictedToLocations: undefined,
        restrictedToDepartments: undefined,
      })
    }
  }, [session])

  // Filter assets based on search and filters
  useEffect(() => {
    let filtered = assets

    if (searchQuery) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(asset => asset.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(asset => asset.category.name === categoryFilter)
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(asset => asset.location.name === locationFilter)
    }

    setFilteredAssets(filtered)
  }, [assets, searchQuery, statusFilter, categoryFilter, locationFilter])

  // Utility functions
  const calculateCurrentValue = (asset: Asset) => {
    const today = new Date()
    const procurementDate = new Date(asset.procurementDate)
    const yearsOwned = (today.getTime() - procurementDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    if (asset.depreciationMethod === 'straight-line') {
      const depreciation = asset.procurementValue * (asset.depreciationRate / 100) * yearsOwned
      return Math.max(0, asset.procurementValue - depreciation)
    }
    return asset.currentValue
  }

  const getAssetIcon = (category: string) => {
    switch (category) {
      case 'Information Technology (IT) Equipment':
        return <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
      case 'Office Equipment':
        return <DocumentTextIcon className="h-6 w-6 text-green-600" />
      case 'Vehicles & Transport':
        return <LocationIcon className="h-6 w-6 text-orange-600" />
      default:
        return <ClipboardDocumentListIcon className="h-6 w-6 text-gray-600" />
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const acknowledgeAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const generateAssetNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `AS-${year}-${random}`
  }

  const generateBarcode = () => {
    return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')
  }

  const generateQRCode = (assetNumber: string) => {
    return `QR-${assetNumber}`
  }

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setSelectedImages(prev => [...prev, ...fileArray])
    }
  }

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setSelectedDocuments(prev => [...prev, ...fileArray])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeDocument = (index: number) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateAsset = () => {
    if (!permissions.canCreate) {
      alert("You don't have permission to create assets.")
      return
    }

    if (createFormData.name && createFormData.category && createFormData.type) {
      const newAsset: Asset = {
        id: (Math.max(...assets.map(a => parseInt(a.id))) + 1).toString(),
        name: createFormData.name || '',
        assetNumber: createFormData.assetNumber || generateAssetNumber(),
        assetTag: `TAG-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        barcodeId: createFormData.barcodeId || Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
        category: createFormData.category || assets[0].category,
        type: createFormData.type || assets[0].type,
        brand: createFormData.brand || '',
        model: createFormData.model || '',
        serialNumber: createFormData.serialNumber || '',
        status: createFormData.status || 'active',
        condition: createFormData.condition || 'excellent',
        location: createFormData.location || assets[0].location,
        department: createFormData.department || '',
        assignedTo: createFormData.assignedTo || '',
        procurementValue: createFormData.procurementValue || 0,
        currentValue: createFormData.currentValue || createFormData.procurementValue || 0,
        depreciationRate: createFormData.depreciationRate || 10,
        depreciationMethod: 'straight-line',
        procurementDate: createFormData.procurementDate || new Date().toISOString().split('T')[0],
        warrantyExpiry: createFormData.warrantyExpiry || '',
        lastAuditDate: new Date().toISOString().split('T')[0],
        nextMaintenanceDate: createFormData.nextMaintenanceDate || '',
        assignedProgram: createFormData.assignedProgram,
        assignedProject: createFormData.assignedProject,
        rfidTag: createFormData.rfidTag,
        qrCode: createFormData.qrCode,
        description: createFormData.description || '',
        images: [],
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: session?.user?.name || 'System',
        lastModifiedBy: session?.user?.name || 'System'
      }

      setAssets(prev => [...prev, newAsset])
      setCreateFormData({})
      setSelectedImages([])
      setSelectedDocuments([])
      alert('Asset created successfully!')
    } else {
      alert('Please fill in all required fields.')
    }
  }

  const metadata = {
    title: "Enterprise Inventory Management",
    description: "Comprehensive asset tracking with RFID integration, depreciation management, and automated workflows",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Inventory Management" }
    ]
  }

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
          rows: filteredAssets.map(asset => [
            asset.assetNumber,
            asset.name,
            asset.category.name,
            asset.status,
            asset.location.name,
            asset.department,
            asset.assignedTo || '',
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
          onClick={() => setActiveTab('registration')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      )}
    </div>
  )

  const tabNavigation = (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center'
              )}
            >
              <Icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          )
        })}
      </nav>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
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
      
      case "registration":
        return (
          <AssetRegistration
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
        )
      
      case "audits":
        return (
          <AuditManagement
            assets={assets}
            permissions={permissions}
          />
        )
        
      case "reports":
        return (
          <div className="p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Reports & Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">
              Advanced reporting features coming soon.
            </p>
          </div>
        )
        
      case "maintenance":
        return (
          <div className="p-6 text-center">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Maintenance Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Maintenance scheduling and tracking features coming soon.
            </p>
          </div>
        )
        
      case "tracking":
        return (
          <div className="p-6 text-center">
            <LocationIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Location Tracking</h3>
            <p className="mt-1 text-sm text-gray-500">
              Real-time GPS tracking features coming soon.
            </p>
          </div>
        )
        
      default:
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
  }

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        {tabNavigation}
        
        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg">
          {renderTabContent()}
        </div>
      </div>
    </ModulePage>
  )
}
