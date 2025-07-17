"use client"

import { useState, useEffect } from "react"
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  QrCodeIcon,
  TagIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline"
import type { Asset, InventoryPermissions, InventoryFilters } from "@/types/inventory"

interface AssetTableProps {
  searchQuery: string
  permissions: InventoryPermissions
}

export function AssetTable({ searchQuery, permissions }: AssetTableProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof Asset>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [filters, setFilters] = useState<InventoryFilters>({})

  // Mock data - in production, fetch from API
  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockAssets: Asset[] = [
          {
            id: "1",
            assetNumber: "IT-2024-0001",
            name: "Dell Laptop Inspiron 15",
            type: { id: "it-equipment", name: "IT Equipment", code: "IT", depreciationRate: 20, usefulLife: 3, category: { id: "computers", name: "Computers", code: "COMP", description: "Computer equipment" } },
            category: { id: "computers", name: "Computers", code: "COMP", description: "Computer equipment" },
            model: "Inspiron 15 3000",
            brand: "Dell",
            description: "Standard laptop for office work",
            procurementValue: 899.99,
            currentValue: 719.99,
            depreciationRate: 20,
            depreciationMethod: "straight-line",
            procurementDate: "2024-01-15",
            location: { id: "head-office", name: "Head Office", code: "HO", type: "building" },
            department: "IT",
            assignedTo: "John Smith",
            assignedEmail: "john.smith@company.com",
            status: "active",
            condition: "excellent",
            warrantyExpiry: "2027-01-15",
            rfidTag: "RF001234",
            qrCode: "QR001234",
            serialNumber: "DL123456789",
            barcodeId: "BC001234",
            createdAt: "2024-01-15T10:00:00Z",
            createdBy: "admin",
            updatedAt: "2024-01-15T10:00:00Z",
            updatedBy: "admin",
            lastAuditDate: "2024-06-15",
            nextAuditDate: "2024-12-15",
            insuranceValue: 1000,
            insurancePolicy: "POL-2024-001",
            complianceStatus: "compliant"
          },
          {
            id: "2",
            assetNumber: "OF-2024-0002",
            name: "Herman Miller Aeron Chair",
            type: { id: "office-furniture", name: "Office Furniture", code: "OF", depreciationRate: 10, usefulLife: 7, category: { id: "chairs", name: "Chairs", code: "CHAIR", description: "Office seating" } },
            category: { id: "chairs", name: "Chairs", code: "CHAIR", description: "Office seating" },
            model: "Aeron Size B",
            brand: "Herman Miller",
            description: "Ergonomic office chair",
            procurementValue: 1395.00,
            currentValue: 1256.00,
            depreciationRate: 10,
            depreciationMethod: "straight-line",
            procurementDate: "2024-02-01",
            location: { id: "head-office", name: "Head Office", code: "HO", type: "building" },
            department: "Administration",
            assignedTo: "Jane Doe",
            assignedEmail: "jane.doe@company.com",
            status: "active",
            condition: "good",
            warrantyExpiry: "2036-02-01",
            rfidTag: "RF001235",
            qrCode: "QR001235",
            serialNumber: "HM987654321",
            barcodeId: "BC001235",
            createdAt: "2024-02-01T10:00:00Z",
            createdBy: "admin",
            updatedAt: "2024-02-01T10:00:00Z",
            updatedBy: "admin",
            lastAuditDate: "2024-06-01",
            nextAuditDate: "2024-12-01",
            insuranceValue: 1500,
            insurancePolicy: "POL-2024-002",
            complianceStatus: "compliant"
          },
          // Add more mock assets as needed
        ]
        
        setAssets(mockAssets)
      } catch (error) {
        console.error("Error loading assets:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [])

  // Filter and search assets
  useEffect(() => {
    let filtered = assets.filter(asset => {
      const searchLower = searchQuery.toLowerCase()
      return (
        asset.name.toLowerCase().includes(searchLower) ||
        asset.assetNumber.toLowerCase().includes(searchLower) ||
        asset.brand.toLowerCase().includes(searchLower) ||
        asset.model.toLowerCase().includes(searchLower) ||
        asset.serialNumber?.toLowerCase().includes(searchLower) ||
        asset.assignedTo?.toLowerCase().includes(searchLower)
      )
    })

    // Apply additional filters
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(asset => filters.status!.includes(asset.status))
    }

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(asset => filters.category!.includes(asset.category.id))
    }

    if (filters.location && filters.location.length > 0) {
      filtered = filtered.filter(asset => filters.location!.includes(asset.location.id))
    }

    if (filters.department && filters.department.length > 0) {
      filtered = filtered.filter(asset => filters.department!.includes(asset.department))
    }

    if (filters.valueRange) {
      const [min, max] = filters.valueRange
      filtered = filtered.filter(asset => asset.currentValue >= min && asset.currentValue <= max)
    }

    setFilteredAssets(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [assets, searchQuery, filters])

  const handleSort = (field: keyof Asset) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAssets = sortedAssets.slice(startIndex, endIndex)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "under-maintenance": return "bg-yellow-100 text-yellow-800"
      case "disposed": return "bg-red-100 text-red-800"
      case "retired": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent": return "bg-green-100 text-green-800"
      case "good": return "bg-blue-100 text-blue-800"
      case "fair": return "bg-yellow-100 text-yellow-800"
      case "poor": return "bg-orange-100 text-orange-800"
      case "needs-repair": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAssets.length === currentAssets.length) {
      setSelectedAssets([])
    } else {
      setSelectedAssets(currentAssets.map(asset => asset.id))
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Registry</h2>
          <p className="text-gray-600 mt-1">
            {filteredAssets.length} of {assets.length} assets
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
              showFilters 
                ? "border-blue-500 text-blue-700 bg-blue-50" 
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          {selectedAssets.length > 0 && permissions.canEdit && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedAssets.length} selected
              </span>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Bulk Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                multiple
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  setFilters(prev => ({ ...prev, status: values as any }))
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="under-maintenance">Under Maintenance</option>
                <option value="disposed">Disposed</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                multiple
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  setFilters(prev => ({ ...prev, category: values }))
                }}
              >
                <option value="computers">Computers</option>
                <option value="chairs">Chairs</option>
                <option value="vehicles">Vehicles</option>
                <option value="machinery">Machinery</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select 
                multiple
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  setFilters(prev => ({ ...prev, location: values }))
                }}
              >
                <option value="head-office">Head Office</option>
                <option value="branch-a">Branch A</option>
                <option value="branch-b">Branch B</option>
                <option value="warehouse">Warehouse</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === currentAssets.length && currentAssets.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("assetNumber")}
                >
                  <div className="flex items-center">
                    Asset Number
                    <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Asset Name
                    <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location & Assignment
                </th>
                {permissions.canViewFinancials && (
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("currentValue")}
                  >
                    <div className="flex items-center">
                      Current Value
                      <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAssets.map((asset) => (
                <tr 
                  key={asset.id} 
                  className={`hover:bg-gray-50 ${selectedAssets.includes(asset.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => handleAssetSelect(asset.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{asset.assetNumber}</div>
                    <div className="text-xs text-gray-500">{asset.serialNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                    <div className="text-xs text-gray-500">{asset.brand} {asset.model}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{asset.type.name}</div>
                    <div className="text-xs text-gray-500">{asset.category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {asset.location.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {asset.assignedTo && (
                        <span>{asset.assignedTo} • {asset.department}</span>
                      )}
                      {!asset.assignedTo && asset.department}
                    </div>
                  </td>
                  {permissions.canViewFinancials && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(asset.currentValue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Cost: {formatCurrency(asset.procurementValue)}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status.replace('-', ' ')}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {asset.rfidTag && (
                        <div className="flex items-center text-xs text-gray-500">
                          <TagIcon className="h-3 w-3 mr-1" />
                          RFID
                        </div>
                      )}
                      {asset.qrCode && (
                        <div className="flex items-center text-xs text-gray-500">
                          <QrCodeIcon className="h-3 w-3 mr-1" />
                          QR
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {permissions.canEdit && (
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {permissions.canDelete && (
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredAssets.length)}</span> of{' '}
                  <span className="font-medium">{filteredAssets.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    } else if (
                      pageNumber === currentPage - 3 ||
                      pageNumber === currentPage + 3
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
