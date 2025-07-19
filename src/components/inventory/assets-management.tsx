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

interface AssetsManagementProps {
  assets: Asset[]
  permissions: InventoryPermissions
  onAssetUpdate?: (assets: Asset[]) => void
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
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [editingAsset, setEditingAsset] = useState<Partial<Asset>>({})

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

  const handleCreate = () => {
    setEditingAsset({
      name: "",
      assetNumber: "",
      status: "active",
      condition: "good",
      department: "",
      procurementValue: 0,
      currentValue: 0
    })
    setShowCreateModal(true)
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

  const confirmDelete = () => {
    if (selectedAsset) {
      // Delete single asset
      const updatedAssets = assets.filter(asset => asset.id !== selectedAsset.id)
      setAssets(updatedAssets)
      onAssetUpdate?.(updatedAssets)
    } else if (selectedAssets.length > 0) {
      // Bulk delete
      const updatedAssets = assets.filter(asset => !selectedAssets.includes(asset.id))
      setAssets(updatedAssets)
      setSelectedAssets([])
      onAssetUpdate?.(updatedAssets)
    }
    setShowDeleteModal(false)
    setSelectedAsset(null)
  }

  const handleSave = () => {
    if (showCreateModal) {
      // Create new asset
      const newAsset: Asset = {
        ...editingAsset,
        id: Date.now().toString(),
        assetNumber: editingAsset.assetNumber || `AST-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "Current User",
        lastModifiedBy: "Current User"
      } as Asset
      
      const updatedAssets = [...assets, newAsset]
      setAssets(updatedAssets)
      onAssetUpdate?.(updatedAssets)
      setShowCreateModal(false)
    } else if (showEditModal && selectedAsset) {
      // Update existing asset
      const updatedAssets = assets.map(asset => 
        asset.id === selectedAsset.id 
          ? { ...asset, ...editingAsset, updatedAt: new Date().toISOString(), lastModifiedBy: "Current User" }
          : asset
      )
      setAssets(updatedAssets)
      onAssetUpdate?.(updatedAssets)
      setShowEditModal(false)
    }
    setEditingAsset({})
    setSelectedAsset(null)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      maintenance: "outline",
      disposed: "destructive"
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      excellent: "default",
      good: "default", 
      fair: "secondary",
      poor: "destructive"
    }
    return <Badge variant={variants[condition] || "secondary"}>{condition}</Badge>
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
          <p className="text-gray-600">View, edit, delete and export all assets</p>
        </div>
        <div className="flex items-center gap-2">
          {permissions.canCreate && (
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search assets by name, number, serial, brand, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quick filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
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
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
        </CardHeader>

        <CardContent>
          {/* Bulk Actions */}
          {selectedAssets.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
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
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Assigned To</th>
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('currentValue')}>
                    <div className="flex items-center gap-1">
                      Current Value
                      {sortBy === 'currentValue' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={() => handleSelectAsset(asset.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{asset.assetNumber}</div>
                      {asset.assetTag && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <TagIcon className="h-3 w-3" />
                          {asset.assetTag}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-gray-500">
                        {asset.brand} {asset.model}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {typeof asset.category === 'string' ? asset.category : asset.category?.name}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(asset.status)}
                        {getConditionBadge(asset.condition)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3 text-gray-400" />
                        {typeof asset.location === 'string' ? asset.location : asset.location?.name}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{asset.assignedTo || '-'}</div>
                      <div className="text-xs text-gray-500">{asset.department}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">
                          ${asset.currentValue?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(asset)}
                          className="h-8 w-8 p-0"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        {permissions.canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(asset)}
                            className="h-8 w-8 p-0"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {permissions.canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(asset)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
            <div className="flex items-center justify-between mt-4">
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
        </CardContent>
      </Card>

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
                    <div><span className="font-medium">Department:</span> {selectedAsset.department}</div>
                    <div><span className="font-medium">Assigned To:</span> {selectedAsset.assignedTo || '-'}</div>
                    <div><span className="font-medium">Location:</span> {typeof selectedAsset.location === 'string' ? selectedAsset.location : selectedAsset.location?.name || '-'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Financial Information</Label>
                  <div className="mt-2 space-y-2">
                    <div><span className="font-medium">Procurement Value:</span> ${selectedAsset.procurementValue?.toLocaleString() || '0'}</div>
                    <div><span className="font-medium">Current Value:</span> ${selectedAsset.currentValue?.toLocaleString() || '0'}</div>
                    <div><span className="font-medium">Depreciation Method:</span> {selectedAsset.depreciationMethod || '-'}</div>
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
                    <div><span className="font-medium">Asset Tag:</span> {selectedAsset.assetTag || '-'}</div>
                    <div><span className="font-medium">Barcode ID:</span> {selectedAsset.barcodeId || '-'}</div>
                  </div>
                </div>
              </div>

              {selectedAsset.description && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    {selectedAsset.description}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Asset Modal */}
      <Dialog open={showEditModal || showCreateModal} onOpenChange={(open) => {
        if (!open) {
          setShowEditModal(false)
          setShowCreateModal(false)
          setEditingAsset({})
          setSelectedAsset(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showCreateModal ? 'Create New Asset' : 'Edit Asset'}</DialogTitle>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status*</Label>
                  <Select 
                    value={editingAsset.status || 'active'} 
                    onValueChange={(value) => setEditingAsset(prev => ({ ...prev, status: value as AssetStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="disposed">Disposed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">Condition*</Label>
                  <Select 
                    value={editingAsset.condition || 'good'} 
                    onValueChange={(value) => setEditingAsset(prev => ({ ...prev, condition: value as AssetCondition }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="department">Department*</Label>
                <Input
                  id="department"
                  value={editingAsset.department || ''}
                  onChange={(e) => setEditingAsset(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department"
                />
              </div>

              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={editingAsset.assignedTo || ''}
                  onChange={(e) => setEditingAsset(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Enter assigned person"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assetTag">Asset Tag</Label>
                  <Input
                    id="assetTag"
                    value={editingAsset.assetTag || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, assetTag: e.target.value }))}
                    placeholder="Enter asset tag"
                  />
                </div>
                <div>
                  <Label htmlFor="rfidTag">RFID Tag</Label>
                  <Input
                    id="rfidTag"
                    value={editingAsset.rfidTag || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, rfidTag: e.target.value }))}
                    placeholder="Enter RFID tag"
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
            <Button variant="outline" onClick={() => {
              setShowEditModal(false)
              setShowCreateModal(false)
              setEditingAsset({})
              setSelectedAsset(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {showCreateModal ? 'Create Asset' : 'Save Changes'}
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
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
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
