"use client"

import { useState, useEffect } from "react"
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TagIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ExportButton } from "@/components/ui/export-button"
import { Asset, InventoryPermissions, AssetStatus, AssetCondition } from '@/types/inventory'
import { ASSET_LOCATION_OPTIONS } from '@/lib/inventory/asset-locations'

interface AssetsManagementProps {
  assets: Asset[]
  permissions: InventoryPermissions
  onAssetUpdate?: (assets: Asset[]) => void
}

function categoryLabel(c: Asset['category']): string {
  return typeof c === 'string' ? c : c?.name ?? ''
}

function typeLabel(t: Asset['type']): string {
  return typeof t === 'string' ? t : t?.name ?? ''
}

function locationLabel(l: Asset['location']): string {
  return typeof l === 'string' ? l : l?.name ?? ''
}

export function AssetsManagement({ assets: initialAssets, permissions, onAssetUpdate }: AssetsManagementProps) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(initialAssets)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [editingAsset, setEditingAsset] = useState<Partial<Asset>>({})

  // Data for dropdowns
  const [departments, setDepartments] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Fetch assets from backend API
  const fetchAssets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/inventory/assets')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.assets && Array.isArray(data.assets)) {
        setAssets(data.assets)
        onAssetUpdate?.(data.assets)
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch departments and employees
  const fetchDepartmentsAndEmployees = async () => {
    try {
      setLoadingData(true)
      
      // Fetch departments
      const deptResponse = await fetch('/api/hr/departments/hierarchy', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (deptResponse.ok) {
        const deptData = await deptResponse.json()
        const flat = deptData?.data?.flat
        if (deptData?.success && Array.isArray(flat)) {
          setDepartments(
            flat.map((d: { id: string; name: string; parentId?: string | null }) => ({
              id: d.id,
              name: d.name,
              parentId: d.parentId ?? undefined,
            }))
          )
        }
      } else {
        console.error('Departments fetch failed:', deptResponse.status, deptResponse.statusText)
      }
      
      // Fetch employees
      const empResponse = await fetch('/api/hr/employees', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (empResponse.ok) {
        const empData = await empResponse.json()
        const list = empData?.data
        if (empData?.success && Array.isArray(list)) {
          setEmployees(list)
        }
      } else {
        console.error('Employees fetch failed:', empResponse.status, empResponse.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch departments/employees:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Auto-generation functions
  const generateAssetNumber = () => {
    return `AST-${Date.now()}`
  }
  
  const generateBarcode = () => {
    return Math.random().toString(36).substr(2, 12)
  }
  
  const generateQRCode = (assetNumber: string) => {
    return `QR-${assetNumber}`
  }

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets()
    fetchDepartmentsAndEmployees()
  }, [])

  // Filter and search effects
  useEffect(() => {
    let filtered = [...assets]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(asset => asset.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(asset => 
        (typeof asset.category === 'string' ? asset.category : asset.category.name) === categoryFilter
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case "name":
          aValue = a.name
          bValue = b.name
          break
        case "assetNumber":
          aValue = a.assetNumber
          bValue = b.assetNumber
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "procurementDate":
          aValue = new Date(a.procurementDate || "")
          bValue = new Date(b.procurementDate || "")
          break
        case "currentValue":
          aValue = a.currentValue || 0
          bValue = b.currentValue || 0
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredAssets(filtered)
    setCurrentPage(1)
  }, [assets, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage)

  // Get unique categories and statuses for filters
  const categories = Array.from(new Set(assets.map(asset => 
    typeof asset.category === 'string' ? asset.category : asset.category.name
  )))
  const statuses = Array.from(new Set(assets.map(asset => asset.status)))

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAssets.length === paginatedAssets.length) {
      setSelectedAssets([])
    } else {
      setSelectedAssets(paginatedAssets.map(asset => asset.id))
    }
  }

  const handleView = (asset: Asset) => {
    setSelectedAsset(asset)
    setShowViewModal(true)
  }

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset)
    setEditingAsset({ ...asset })
    setShowEditModal(true)
  }

  const handleDelete = (asset: Asset) => {
    setSelectedAsset(asset)
    setShowDeleteModal(true)
  }

  const handleBulkDelete = () => {
    if (selectedAssets.length > 0) {
      setShowDeleteModal(true)
    }
  }

  const confirmDelete = async () => {
    try {
      setIsLoading(true)
      
      if (selectedAsset) {
        // Delete single asset via API
        const response = await fetch(`/api/inventory/assets?id=${selectedAsset.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error(`Failed to delete asset: ${response.statusText}`)
        }
      } else if (selectedAssets.length > 0) {
        // Bulk delete - would need separate API endpoint
        console.warn('Bulk delete not implemented yet')
        setSelectedAssets([])
      }
      
      // Refresh assets from backend
      await fetchAssets()
      setShowDeleteModal(false)
      setSelectedAsset(null)
    } catch (error) {
      console.error('Error deleting asset:', error)
      alert('Failed to delete asset. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (showEditModal && selectedAsset) {
      try {
        setIsLoading(true)

        const cat = categoryLabel(editingAsset.category as Asset['category'])
        const loc = locationLabel(editingAsset.location as Asset['location'])
        const typ = typeLabel(editingAsset.type as Asset['type'])

        const payload: Record<string, unknown> = {
          name: editingAsset.name,
          assetNumber: editingAsset.assetNumber,
          brand: editingAsset.brand,
          model: editingAsset.model,
          serialNumber: editingAsset.serialNumber,
          description: editingAsset.description,
          ...(cat ? { category: cat } : {}),
          ...(typ ? { type: typ } : {}),
          ...(loc ? { location: loc } : {}),
          department: editingAsset.department,
          assignedTo: editingAsset.assignedTo,
          custodian: editingAsset.custodian,
          procurementValue: editingAsset.procurementValue,
          currentValue: editingAsset.currentValue,
          depreciationRate: editingAsset.depreciationRate,
          depreciationMethod: editingAsset.depreciationMethod,
          fundingSource: editingAsset.fundingSource,
          procurementType: editingAsset.procurementType,
          expectedLifespan: editingAsset.expectedLifespan,
          usageType: editingAsset.usageType,
          procurementDate: editingAsset.procurementDate,
          warrantyExpiry: editingAsset.warrantyExpiry,
          lastAuditDate: editingAsset.lastAuditDate,
          nextMaintenanceDate: editingAsset.nextMaintenanceDate,
          status: editingAsset.status,
          condition: editingAsset.condition,
          rfidTag: editingAsset.rfidTag,
          qrCode: editingAsset.qrCode,
          barcodeId: editingAsset.barcodeId,
          physicalAssetTag:
            editingAsset.physicalAssetTag ?? editingAsset.assetTag,
          insuranceValue: editingAsset.insuranceValue,
          insurancePolicy: editingAsset.insurancePolicy,
          assignedProgram: editingAsset.assignedProgram,
          assignedProject: editingAsset.assignedProject,
        }
        if (editingAsset.assignedEmail !== undefined) {
          payload.assignedEmail =
            editingAsset.assignedEmail.trim() === ''
              ? ''
              : editingAsset.assignedEmail.trim()
        }
        Object.keys(payload).forEach((k) => {
          if (payload[k] === undefined) delete payload[k]
        })

        const response = await fetch(`/api/inventory/assets?id=${selectedAsset.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        
        if (!response.ok) {
          let msg = `Failed to update asset: ${response.statusText}`
          try {
            const errBody = await response.json()
            if (errBody?.error) msg = errBody.error
            if (errBody?.details) console.error('Validation details:', errBody.details)
          } catch {
            /* ignore */
          }
          throw new Error(msg)
        }

        await fetchAssets()
        setShowEditModal(false)
      } catch (error) {
        console.error('Error updating asset:', error)
        alert(
          error instanceof Error ? error.message : 'Failed to update asset. Please try again.'
        )
      } finally {
        setIsLoading(false)
      }
    }
    setEditingAsset({})
    setSelectedAsset(null)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      maintenance: "outline",
      "under-maintenance": "outline",
      disposed: "destructive",
      retired: "destructive",
    }
    const label = status === 'under-maintenance' ? 'under maintenance' : status
    return <Badge className="bg-orange-500 text-white shadow-lg" variant={variants[status] || "default"}>{label}</Badge>
  }

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      excellent: "default",
      good: "default", 
      fair: "secondary",
      poor: "destructive",
      "needs-repair": "destructive",
      damaged: "destructive",
    }
    return <Badge className="bg-green-500 text-white shadow-lg" variant={variants[condition] || "secondary"}>{condition}</Badge>
  }

  const exportData = {
    headers: [
      'Asset Number', 'Name', 'Brand', 'Model', 'Serial Number', 'Category', 
      'Status', 'Condition', 'Location', 'Department', 'Assigned To', 
      'Procurement Value', 'Current Value', 'Procurement Date', 'Warranty Expiry',
      'Last Audit', 'Next Maintenance'
    ],
    rows: (selectedAssets.length > 0 
      ? assets.filter(asset => selectedAssets.includes(asset.id))
      : filteredAssets
    ).map(asset => [
      asset.assetNumber,
      asset.name,
      asset.brand || '',
      asset.model || '',
      asset.serialNumber || '',
      typeof asset.category === 'string' ? asset.category : asset.category?.name || '',
      asset.status,
      asset.condition,
      typeof asset.location === 'string' ? asset.location : asset.location?.name || '',
      asset.department,
      asset.assignedTo || '',
      asset.procurementValue?.toString() || '0',
      asset.currentValue?.toString() || '0',
      asset.procurementDate || '',
      asset.warrantyExpiry || '',
      asset.lastAuditDate || '',
      asset.nextMaintenanceDate || ''
    ])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assets Management</h2>
          <p className="text-gray-600">View, edit, delete and export all assets. Use Asset Registration tab to add new assets.</p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Premium Search & Filters Section */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
        <div className="p-8 pb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search assets by name, number, serial, brand, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Quick filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" onClick={() => setShowFilters(!showFilters)}>
                <FunnelIcon className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Filters'}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Items per page</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sort by</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="assetNumber">Asset Number</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="procurementDate">Procurement Date</SelectItem>
                    <SelectItem value="currentValue">Current Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="w-full"
                >
                  {sortOrder === "asc" ? (
                    <ArrowUpIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-2" />
                  )}
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 pb-8">
          {/* Bulk Actions */}
          {selectedAssets.length > 0 && (
            <div className="mb-6 p-6 bg-blue-50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedAssets.length} asset{selectedAssets.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <ExportButton
                  data={exportData}
                  filename={`selected-assets-${new Date().toISOString().split('T')[0]}`}
                  title="Export Selected"
                  variant="outline"
                  size="sm"
                />
                {permissions.canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Assets Table */}
          <div className="overflow-x-auto bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-orange-50 border-b-2 border-orange-200/50">
                  <th className="text-left p-4 font-bold text-gray-800 tracking-wide">
                    <Checkbox
                      checked={selectedAssets.length === paginatedAssets.length && paginatedAssets.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('assetNumber')}>
                    <div className="flex items-center gap-1">
                      Asset Number
                      {sortBy === 'assetNumber' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Name
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-bold text-gray-800 tracking-wide">Category</th>
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-bold text-gray-800 tracking-wide">Location</th>
                  <th className="text-left p-4 font-bold text-gray-800 tracking-wide">Assigned To</th>
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('currentValue')}>
                    <div className="flex items-center gap-1">
                      Current Value
                      {sortBy === 'currentValue' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-bold text-gray-800 tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-100/50 hover:bg-orange-50 transition-all duration-300 backdrop-blur-sm">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={() => handleSelectAsset(asset.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{asset.assetNumber}</div>
                      {asset.physicalAssetTag ? (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <TagIcon className="h-3 w-3" />
                          {asset.physicalAssetTag}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-gray-500">
                        {asset.brand} {asset.model}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {typeof asset.category === 'string' ? asset.category : asset.category?.name}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(asset.status)}
                        {getConditionBadge(asset.condition)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3 text-gray-400" />
                        {locationLabel(asset.location) || '—'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{asset.assignedTo || '-'}</div>
                      <div className="text-xs text-gray-500">{asset.department}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">
                          ${asset.currentValue?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm"
                          onClick={() => handleView(asset)}
                          className="h-8 w-8 p-0 hover:bg-orange-100 transition-all duration-300 rounded-xl"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        {permissions.canEdit && (
                          <Button variant="ghost" size="sm"
                            onClick={() => handleEdit(asset)}
                            className="h-8 w-8 p-0 hover:bg-orange-100 transition-all duration-300 rounded-xl"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {permissions.canDelete && (
                          <Button variant="ghost" size="sm"
                            onClick={() => handleDelete(asset)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 rounded-xl"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No assets found matching your criteria
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAssets.length)} of {filteredAssets.length} assets
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export All Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Total Assets: {assets.length} | Filtered: {filteredAssets.length}
        </div>
        <ExportButton
          data={exportData}
          filename={`assets-export-${new Date().toISOString().split('T')[0]}`}
          title="Export All Filtered Assets"
          showOptions={true}
        />
      </div>

      {/* View Asset Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Asset Information</Label>
                  <div className="mt-2 space-y-2">
                    <div><span className="font-medium">Asset Number:</span> {selectedAsset.assetNumber}</div>
                    <div><span className="font-medium">Name:</span> {selectedAsset.name}</div>
                    <div><span className="font-medium">Category:</span> {categoryLabel(selectedAsset.category) || '-'}</div>
                    <div><span className="font-medium">Type:</span> {typeLabel(selectedAsset.type) || '-'}</div>
                    <div><span className="font-medium">Brand:</span> {selectedAsset.brand || '-'}</div>
                    <div><span className="font-medium">Model:</span> {selectedAsset.model || '-'}</div>
                    <div><span className="font-medium">Serial Number:</span> {selectedAsset.serialNumber || '-'}</div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status & Condition</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span> 
                      {getStatusBadge(selectedAsset.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Condition:</span> 
                      {getConditionBadge(selectedAsset.condition)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Assignment</Label>
                  <div className="mt-2 space-y-2">
                    <div><span className="font-medium">Department:</span> {selectedAsset.department || '-'}</div>
                    <div><span className="font-medium">Assigned To:</span> {selectedAsset.assignedTo || '-'}</div>
                    <div><span className="font-medium">Assigned Email:</span> {selectedAsset.assignedEmail || '-'}</div>
                    <div><span className="font-medium">Custodian:</span> {selectedAsset.custodian || '-'}</div>
                    <div><span className="font-medium">Assigned Program:</span> {selectedAsset.assignedProgram || '-'}</div>
                    <div><span className="font-medium">Assigned Project:</span> {selectedAsset.assignedProject || '-'}</div>
                    <div><span className="font-medium">Location:</span> {locationLabel(selectedAsset.location) || '-'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Financial Information</Label>
                  <div className="mt-2 space-y-2">
                    <div><span className="font-medium">Procurement Value:</span> ${selectedAsset.procurementValue?.toLocaleString() || '0'}</div>
                    <div><span className="font-medium">Current Value:</span> ${selectedAsset.currentValue?.toLocaleString() || '0'}</div>
                    <div><span className="font-medium">Depreciation Rate:</span> {selectedAsset.depreciationRate != null ? `${selectedAsset.depreciationRate}%` : '-'}</div>
                    <div><span className="font-medium">Depreciation Method:</span> {selectedAsset.depreciationMethod || '-'}</div>
                    <div><span className="font-medium">Procurement Type:</span> {selectedAsset.procurementType || '-'}</div>
                    <div><span className="font-medium">Usage Type:</span> {selectedAsset.usageType || '-'}</div>
                    <div><span className="font-medium">Expected Lifespan (years):</span> {selectedAsset.expectedLifespan ?? '-'}</div>
                    <div><span className="font-medium">Funding Source:</span> {selectedAsset.fundingSource || '-'}</div>
                    <div><span className="font-medium">Insurance Value:</span> {selectedAsset.insuranceValue != null ? `$${Number(selectedAsset.insuranceValue).toLocaleString()}` : '-'}</div>
                    <div><span className="font-medium">Insurance Policy:</span> {selectedAsset.insurancePolicy || '-'}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Important Dates</Label>
                  <div className="mt-2 space-y-2">
                    <div><span className="font-medium">Procurement Date:</span> {selectedAsset.procurementDate || '-'}</div>
                    <div><span className="font-medium">Warranty Expiry:</span> {selectedAsset.warrantyExpiry || '-'}</div>
                    <div><span className="font-medium">Last Audit:</span> {selectedAsset.lastAuditDate || '-'}</div>
                    <div><span className="font-medium">Next Maintenance:</span> {selectedAsset.nextMaintenanceDate || '-'}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Tracking</Label>
                  <div className="mt-2 space-y-2">
                    <div><span className="font-medium">RFID Tag:</span> {selectedAsset.rfidTag || '-'}</div>
                    <div><span className="font-medium">QR Code:</span> {selectedAsset.qrCode || '-'}</div>
                    <div><span className="font-medium">Asset Tag (sticker):</span> {selectedAsset.physicalAssetTag || '-'}</div>
                    <div><span className="font-medium">Barcode ID:</span> {selectedAsset.barcodeId || '-'}</div>
                    <div><span className="font-medium">Images (count):</span> {Array.isArray(selectedAsset.images) ? selectedAsset.images.length : 0}</div>
                    <div><span className="font-medium">Documents (count):</span> {Array.isArray(selectedAsset.documents) ? selectedAsset.documents.length : 0}</div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {selectedAsset.description?.trim() ? selectedAsset.description : '—'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Asset Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowEditModal(false)
          setEditingAsset({})
          setSelectedAsset(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Asset Name*</Label>
                <Input
                  id="name"
                  value={editingAsset.name || ''}
                  onChange={(e) => setEditingAsset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter asset name"
                />
              </div>
              
              <div>
                <Label htmlFor="assetNumber">Asset Number*</Label>
                <Input
                  id="assetNumber"
                  value={editingAsset.assetNumber || ''}
                  onChange={(e) => setEditingAsset(prev => ({ ...prev, assetNumber: e.target.value }))}
                  placeholder="Enter asset number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={editingAsset.brand || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Enter brand"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={editingAsset.model || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Enter model"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={editingAsset.serialNumber || ''}
                  onChange={(e) => setEditingAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="Enter serial number"
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={categoryLabel(editingAsset.category as Asset['category'])}
                  onChange={(e) =>
                    setEditingAsset((prev) => ({
                      ...prev,
                      category: e.target.value as unknown as Asset['category'],
                    }))
                  }
                  placeholder="e.g. Laptops"
                />
              </div>

              <div>
                <Label htmlFor="edit-type">Asset type</Label>
                <Input
                  id="edit-type"
                  value={typeLabel(editingAsset.type as Asset['type'])}
                  onChange={(e) =>
                    setEditingAsset((prev) => ({
                      ...prev,
                      type: e.target.value as unknown as Asset['type'],
                    }))
                  }
                  placeholder="e.g. IT Equipment"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status*</Label>
                  <Select 
                    value={editingAsset.status || 'active'} 
                    onValueChange={(value) => setEditingAsset(prev => ({ ...prev, status: value as AssetStatus }))}
                  >
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="under-maintenance">Under maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">Condition*</Label>
                  <Select 
                    value={editingAsset.condition || 'good'} 
                    onValueChange={(value) => setEditingAsset(prev => ({ ...prev, condition: value as AssetCondition }))}
                  >
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="needs-repair">Needs repair</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="location-edit">Location*</Label>
                <Select
                  value={locationLabel(editingAsset.location as Asset['location']) || undefined}
                  onValueChange={(value) =>
                    setEditingAsset((prev) => ({
                      ...prev,
                      location: value as unknown as Asset['location'],
                    }))
                  }
                >
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_LOCATION_OPTIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department*</Label>
                <Select 
                  value={editingAsset.department || undefined} 
                  onValueChange={(value) => setEditingAsset(prev => ({ ...prev, department: value === 'loading' ? undefined : value }))}
                >
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                    <SelectValue placeholder={loadingData ? "Loading departments..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        {loadingData ? "Loading departments..." : "No departments available"}
                      </SelectItem>
                    ) : (
                      departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select 
                  value={editingAsset.assignedTo || undefined} 
                  onValueChange={(value) => {
                    if (value === 'loading') return
                    const selectedEmployee = employees.find(emp => emp.id === value)
                    setEditingAsset(prev => ({ 
                      ...prev, 
                      assignedTo: value,
                      assignedEmail: selectedEmployee?.email || ''
                    }))
                  }}
                >
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                    <SelectValue placeholder={loadingData ? "Loading employees..." : "Select assigned person"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        {loadingData ? "Loading employees..." : "No employees available"}
                      </SelectItem>
                    ) : (
                      employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} ({employee.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignedEmail">Assigned email</Label>
                <Input
                  id="assignedEmail"
                  type="email"
                  value={editingAsset.assignedEmail || ''}
                  onChange={(e) => setEditingAsset((prev) => ({ ...prev, assignedEmail: e.target.value }))}
                  placeholder="name@organization.org"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="procurementValue">Procurement Value</Label>
                  <Input
                    id="procurementValue"
                    type="number"
                    value={editingAsset.procurementValue || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, procurementValue: Number(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    value={editingAsset.currentValue || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, currentValue: Number(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="procurementDate">Procurement Date</Label>
                  <Input
                    id="procurementDate"
                    type="date"
                    value={editingAsset.procurementDate || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, procurementDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                  <Input
                    id="warrantyExpiry"
                    type="date"
                    value={editingAsset.warrantyExpiry || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, warrantyExpiry: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastAuditDate">Last audit</Label>
                  <Input
                    id="lastAuditDate"
                    type="date"
                    value={editingAsset.lastAuditDate || ''}
                    onChange={(e) =>
                      setEditingAsset((prev) => ({ ...prev, lastAuditDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="nextMaintenanceDate">Next maintenance</Label>
                  <Input
                    id="nextMaintenanceDate"
                    type="date"
                    value={editingAsset.nextMaintenanceDate || ''}
                    onChange={(e) =>
                      setEditingAsset((prev) => ({ ...prev, nextMaintenanceDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceValue">Insurance value</Label>
                  <Input
                    id="insuranceValue"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editingAsset.insuranceValue ?? ''}
                    onChange={(e) =>
                      setEditingAsset((prev) => ({
                        ...prev,
                        insuranceValue: e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="insurancePolicy">Insurance policy</Label>
                  <Input
                    id="insurancePolicy"
                    value={editingAsset.insurancePolicy || ''}
                    onChange={(e) =>
                      setEditingAsset((prev) => ({ ...prev, insurancePolicy: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qrCode">QR Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qrCode"
                      value={editingAsset.qrCode || ''}
                      onChange={(e) => setEditingAsset(prev => ({ ...prev, qrCode: e.target.value }))}
                      placeholder="Enter QR code"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAsset(prev => ({ 
                        ...prev, 
                        qrCode: generateQRCode(prev.assetNumber || generateAssetNumber()) 
                      }))}
                    >
                      <QrCodeIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="barcodeId">Barcode ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcodeId"
                      value={editingAsset.barcodeId || ''}
                      onChange={(e) => setEditingAsset(prev => ({ ...prev, barcodeId: e.target.value }))}
                      placeholder="Enter barcode ID"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAsset(prev => ({ ...prev, barcodeId: generateBarcode() }))}
                    >
                      <TagIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rfidTag">RFID Tag</Label>
                  <Input
                    id="rfidTag"
                    value={editingAsset.rfidTag || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, rfidTag: e.target.value }))}
                    placeholder="Enter RFID tag"
                  />
                </div>
                <div>
                  <Label htmlFor="physicalAssetTag">Asset tag (sticker)</Label>
                  <Input
                    id="physicalAssetTag"
                    value={editingAsset.physicalAssetTag || ''}
                    onChange={(e) =>
                      setEditingAsset((prev) => ({ ...prev, physicalAssetTag: e.target.value }))
                    }
                    placeholder="Physical label / sticker"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="depreciationRate">Depreciation Rate (%)</Label>
                  <Input
                    id="depreciationRate"
                    type="number"
                    value={editingAsset.depreciationRate || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, depreciationRate: Number(e.target.value) }))}
                    placeholder="15"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                  <Select 
                    value={editingAsset.depreciationMethod || 'straight-line'} 
                    onValueChange={(value) => setEditingAsset(prev => ({ ...prev, depreciationMethod: value as 'straight-line' | 'declining-balance' | 'units-of-production' }))}
                  >
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight-line">Straight Line</SelectItem>
                      <SelectItem value="declining-balance">Declining Balance</SelectItem>
                      <SelectItem value="sum-of-years">Sum of Years</SelectItem>
                      <SelectItem value="units-of-production">Units of Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custodian">Custodian</Label>
                  <Select 
                    value={editingAsset.custodian || undefined} 
                    onValueChange={(value) => setEditingAsset(prev => ({ ...prev, custodian: value === 'loading' ? undefined : value }))}
                  >
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                      <SelectValue placeholder={loadingData ? "Loading employees..." : "Select custodian"} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.length === 0 ? (
                        <SelectItem value="loading" disabled>
                          {loadingData ? "Loading employees..." : "No employees available"}
                        </SelectItem>
                      ) : (
                        employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName} ({employee.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fundingSource">Funding Source</Label>
                  <Select 
                    value={editingAsset.fundingSource || undefined} 
                    onValueChange={(value) => setEditingAsset(prev => ({ ...prev, fundingSource: value }))}
                  >
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500">
                      <SelectValue placeholder="Select funding source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNICEF">UNICEF</SelectItem>
                      <SelectItem value="EU">EU</SelectItem>
                      <SelectItem value="Internal Capex">Internal Capex</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="World Bank">World Bank</SelectItem>
                      <SelectItem value="Other Donor">Other Donor</SelectItem>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="Grant">Grant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="procurementType">Procurement type</Label>
                  <Input
                    id="procurementType"
                    value={editingAsset.procurementType || ''}
                    onChange={(e) =>
                      setEditingAsset((prev) => ({ ...prev, procurementType: e.target.value }))
                    }
                    placeholder="e.g. Procured, Donated"
                  />
                </div>
                <div>
                  <Label htmlFor="usageType">Usage type</Label>
                  <Input
                    id="usageType"
                    value={editingAsset.usageType || ''}
                    onChange={(e) =>
                      setEditingAsset((prev) => ({ ...prev, usageType: e.target.value }))
                    }
                    placeholder="e.g. Field, Admin"
                  />
                </div>
                <div>
                  <Label htmlFor="expectedLifespan">Expected lifespan (years)</Label>
                  <Input
                    id="expectedLifespan"
                    type="number"
                    min={1}
                    value={editingAsset.expectedLifespan ?? ''}
                    onChange={(e) =>
                      setEditingAsset((prev) => ({
                        ...prev,
                        expectedLifespan:
                          e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingAsset.description || ''}
                onChange={(e) => setEditingAsset(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter asset description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" onClick={() => {
              setShowEditModal(false)
              setEditingAsset({})
              setSelectedAsset(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedAsset ? (
              <p>Are you sure you want to delete the asset <strong>{selectedAsset.name}</strong>? This action cannot be undone.</p>
            ) : (
              <p>Are you sure you want to delete {selectedAssets.length} selected asset{selectedAssets.length > 1 ? 's' : ''}? This action cannot be undone.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
