"use client"

import { useState, useEffect } from "react"
import {
  CubeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  TagIcon
} from "@heroicons/react/24/outline"
import type { InventoryDashboardStats, InventoryPermissions } from "@/types/inventory"

interface InventoryDashboardProps {
  permissions: InventoryPermissions
}

export function InventoryDashboard({ permissions }: InventoryDashboardProps) {
  const [stats, setStats] = useState<InventoryDashboardStats>({
    totalAssets: 0,
    totalValue: 0,
    avgAssetValue: 0,
    assetsByStatus: {
      'active': 0,
      'inactive': 0,
      'disposed': 0,
      'stolen': 0,
      'lost': 0,
      'under-maintenance': 0,
      'retired': 0,
      'pending-disposal': 0
    },
    assetsByCategory: [],
    assetsByLocation: [],
    depreciationThisYear: 0,
    maintenanceCosts: 0,
    upcomingMaintenances: 0,
    overdueAudits: 0,
    complianceScore: 0,
    recentTransactions: [],
    topAssetsByValue: [],
    criticalAssets: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // Mock data - in production, fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setStats({
          totalAssets: 2847,
          totalValue: 15420000,
          avgAssetValue: 5417.82,
          assetsByStatus: {
            'active': 2456,
            'inactive': 215,
            'disposed': 89,
            'stolen': 3,
            'lost': 12,
            'under-maintenance': 67,
            'retired': 5,
            'pending-disposal': 0
          },
          assetsByCategory: [
            { name: "IT Equipment", count: 856, value: 4280000 },
            { name: "Office Furniture", count: 1203, value: 2406000 },
            { name: "Vehicles", count: 45, value: 6750000 },
            { name: "Machinery", count: 234, value: 1872000 },
            { name: "Real Estate", count: 12, value: 112000 }
          ],
          assetsByLocation: [
            { name: "Head Office", count: 1456, value: 8760000 },
            { name: "Branch A", count: 678, value: 3390000 },
            { name: "Branch B", count: 423, value: 2115000 },
            { name: "Warehouse", count: 290, value: 1155000 }
          ],
          depreciationThisYear: 1240000,
          maintenanceCosts: 234000,
          upcomingMaintenances: 23,
          overdueAudits: 5,
          complianceScore: 87.5,
          recentTransactions: [],
          topAssetsByValue: [],
          criticalAssets: []
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 rounded-lg h-64"></div>
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Assets</p>
              <p className="text-3xl font-bold">{formatNumber(stats.totalAssets)}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 text-blue-200 mr-1" />
            <span className="text-blue-100 text-sm">+12% from last month</span>
          </div>
        </div>

        {permissions.canViewFinancials && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-200" />
            </div>
            <div className="mt-4 flex items-center">
              <ArrowTrendingDownIcon className="h-4 w-4 text-green-200 mr-1" />
              <span className="text-green-100 text-sm">-{formatCurrency(stats.depreciationThisYear)} depreciation</span>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Maintenance Due</p>
              <p className="text-3xl font-bold">{stats.upcomingMaintenances}</p>
            </div>
            <WrenchScrewdriverIcon className="h-8 w-8 text-yellow-200" />
          </div>
          <div className="mt-4 flex items-center">
            <ClockIcon className="h-4 w-4 text-yellow-200 mr-1" />
            <span className="text-yellow-100 text-sm">Next 30 days</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Compliance Score</p>
              <p className="text-3xl font-bold">{stats.complianceScore}%</p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-red-200" />
          </div>
          <div className="mt-4 flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-200 mr-1" />
            <span className="text-red-100 text-sm">{stats.overdueAudits} overdue audits</span>
          </div>
        </div>
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets by Category */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Assets by Category</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.assetsByCategory.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{typeof category === 'string' ? category : category?.name || 'Unknown'}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{formatNumber(category.count)}</span>
                    {permissions.canViewFinancials && (
                      <span className="text-xs text-gray-500 block">{formatCurrency(category.value)}</span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(category.count / stats.totalAssets) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assets by Location */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Assets by Location</h3>
            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.assetsByLocation.map((location, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{location.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{formatNumber(location.count)}</span>
                    {permissions.canViewFinancials && (
                      <span className="text-xs text-gray-500 block">{formatCurrency(location.value)}</span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(location.count / stats.totalAssets) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Status Overview */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Object.entries(stats.assetsByStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(count)}</div>
              <div className="text-sm text-gray-500 capitalize">{status.replace('-', ' ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
