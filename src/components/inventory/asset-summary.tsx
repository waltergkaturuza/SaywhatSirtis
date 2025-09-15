"use client"

import { useState, useEffect } from "react"
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  TagIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline"
import type { Asset, InventoryPermissions } from "@/types/inventory"

interface AssetSummaryProps {
  searchQuery: string
  permissions: InventoryPermissions
}

interface AssetSummaryData {
  totalValue: number
  totalAssets: number
  valueByType: Array<{ type: string; value: number; count: number; percentage: number }>
  valueByLocation: Array<{ location: string; value: number; count: number; percentage: number }>
  valueByDepartment: Array<{ department: string; value: number; count: number; percentage: number }>
  depreciationTrend: Array<{ month: string; depreciation: number; value: number }>
  topAssetsByValue: Asset[]
  recentAcquisitions: Asset[]
}

export function AssetSummary({ searchQuery, permissions }: AssetSummaryProps) {
  const [summaryData, setSummaryData] = useState<AssetSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [assetNumberSearch, setAssetNumberSearch] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: ""
  })
  const [groupBy, setGroupBy] = useState<"type" | "location" | "department">("type")

  useEffect(() => {
    const loadSummaryData = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock summary data
        setSummaryData({
          totalValue: 15420000,
          totalAssets: 2847,
          valueByType: [
            { type: "IT Equipment", value: 4280000, count: 856, percentage: 27.8 },
            { type: "Vehicles", value: 6750000, count: 45, percentage: 43.8 },
            { type: "Office Furniture", value: 2406000, count: 1203, percentage: 15.6 },
            { type: "Machinery", value: 1872000, count: 234, percentage: 12.1 },
            { type: "Real Estate", value: 112000, count: 12, percentage: 0.7 }
          ],
          valueByLocation: [
            { location: "Head Office", value: 8760000, count: 1456, percentage: 56.8 },
            { location: "Branch A", value: 3390000, count: 678, percentage: 22.0 },
            { location: "Branch B", value: 2115000, count: 423, percentage: 13.7 },
            { location: "Warehouse", value: 1155000, count: 290, percentage: 7.5 }
          ],
          valueByDepartment: [
            { department: "HR", value: 4500000, count: 890, percentage: 29.2 },
            { department: "Operations", value: 3200000, count: 450, percentage: 20.8 },
            { department: "Administration", value: 2800000, count: 680, percentage: 18.2 },
            { department: "Finance", value: 2400000, count: 320, percentage: 15.6 },
            { department: "HR", value: 1200000, count: 250, percentage: 7.8 },
            { department: "Marketing", value: 1320000, count: 257, percentage: 8.6 }
          ],
          depreciationTrend: [
            { month: "Jan", depreciation: 95000, value: 15800000 },
            { month: "Feb", depreciation: 98000, value: 15702000 },
            { month: "Mar", depreciation: 101000, value: 15601000 },
            { month: "Apr", depreciation: 97000, value: 15504000 },
            { month: "May", depreciation: 103000, value: 15401000 },
            { month: "Jun", depreciation: 106000, value: 15295000 }
          ],
          topAssetsByValue: [],
          recentAcquisitions: []
        })
      } catch (error) {
        console.error("Error loading summary data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSummaryData()
  }, [])

  const searchAssetByNumber = async () => {
    if (!assetNumberSearch.trim()) return
    
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock asset search - in production, call API
      const mockAsset: Asset = {
        id: "1",
        assetNumber: assetNumberSearch,
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
        department: "HR",
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
      }
      
      setSelectedAsset(mockAsset)
    } catch (error) {
      console.error("Error searching asset:", error)
      alert("Asset not found")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const exportData = () => {
    if (!summaryData) return
    
    const dataToExport = {
      summary: summaryData,
      generatedAt: new Date().toISOString(),
      generatedBy: "Current User"
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asset-summary-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getCurrentData = () => {
    if (!summaryData) return []
    
    switch (groupBy) {
      case "type": return summaryData.valueByType
      case "location": return summaryData.valueByLocation
      case "department": return summaryData.valueByDepartment
      default: return summaryData.valueByType
    }
  }

  if (loading && !summaryData) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg h-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Data Summary</h2>
          <p className="text-gray-600 mt-1">
            Current assets value and distribution analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Asset Number Search */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Asset by Number</h3>
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter asset number (e.g., IT-2024-0001)"
              value={assetNumberSearch}
              onChange={(e) => setAssetNumberSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchAssetByNumber()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={searchAssetByNumber}
            disabled={loading || !assetNumberSearch.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>

        {/* Selected Asset Details */}
        {selectedAsset && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Asset Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Asset Number:</span>
                <p className="text-sm text-gray-900">{selectedAsset.assetNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <p className="text-sm text-gray-900">{selectedAsset.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Type:</span>
                <p className="text-sm text-gray-900">{selectedAsset.type.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Location:</span>
                <p className="text-sm text-gray-900">{selectedAsset.location.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Assigned To:</span>
                <p className="text-sm text-gray-900">{selectedAsset.assignedTo || "Unassigned"}</p>
              </div>
              {permissions.canViewFinancials && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Current Value:</span>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedAsset.currentValue)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Procurement Value:</span>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedAsset.procurementValue)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Depreciation:</span>
                    <p className="text-sm text-gray-900">
                      {formatCurrency(selectedAsset.procurementValue - selectedAsset.currentValue)} 
                      ({((selectedAsset.procurementValue - selectedAsset.currentValue) / selectedAsset.procurementValue * 100).toFixed(1)}%)
                    </p>
                  </div>
                </>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                  selectedAsset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedAsset.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Condition:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                  selectedAsset.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                  selectedAsset.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedAsset.condition}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {summaryData && permissions.canViewFinancials && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Asset Value</p>
                  <p className="text-3xl font-bold">{formatCurrency(summaryData.totalValue)}</p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-blue-200" />
              </div>
              <div className="mt-4 flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 text-blue-200 mr-1" />
                <span className="text-blue-100 text-sm">+2.5% from last month</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Assets</p>
                  <p className="text-3xl font-bold">{formatNumber(summaryData.totalAssets)}</p>
                </div>
                <TagIcon className="h-8 w-8 text-green-200" />
              </div>
              <div className="mt-4 flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-200 mr-1" />
                <span className="text-green-100 text-sm">+145 new assets</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg Asset Value</p>
                  <p className="text-3xl font-bold">{formatCurrency(summaryData.totalValue / summaryData.totalAssets)}</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-purple-200" />
              </div>
              <div className="mt-4 flex items-center">
                <ArrowTrendingDownIcon className="h-4 w-4 text-purple-200 mr-1" />
                <span className="text-purple-100 text-sm">-1.2% depreciation</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="type">Asset Type</option>
                    <option value="location">Location</option>
                    <option value="department">Department</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                Current Assets Value by {groupBy}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Count
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentData().map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item[groupBy as keyof typeof item]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(item.count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(item.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <div className="flex items-center justify-end">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          {item.percentage.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.value / item.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!permissions.canViewFinancials && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 mb-2">
            <FunnelIcon className="h-8 w-8 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Limited Access</h3>
          <p className="text-yellow-700">
            Financial data is restricted. Contact Finance department for full access.
          </p>
        </div>
      )}
    </div>
  )
}
