"use client"

import React from 'react'
import {
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ClockIcon as TimeIcon,
  ComputerDesktopIcon,
  PrinterIcon,
  TruckIcon,
  CpuChipIcon,
  ChartBarIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'
import { Asset, AssetAlert } from '@/types/inventory'

interface DashboardProps {
  assets?: Asset[]
  alerts?: AssetAlert[]
  showAlerts: boolean
  setShowAlerts: (show: boolean) => void
  acknowledgeAlert: (alertId: number) => void
  calculateCurrentValue: (asset: Asset) => number
  getAssetIcon: (category: string) => React.ReactNode
  getAlertSeverityColor: (severity: string) => string
  chartView: string
  setChartView: (view: string) => void
  depreciationView: string
  setDepreciationView: (view: string) => void
}

export const InventoryDashboard: React.FC<DashboardProps> = ({
  assets = [],
  alerts = [],
  showAlerts,
  setShowAlerts,
  acknowledgeAlert,
  calculateCurrentValue,
  getAssetIcon,
  getAlertSeverityColor,
  chartView,
  setChartView,
  depreciationView,
  setDepreciationView
}) => {
  // Add loading check
  if (!assets || !alerts) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Alerts Section */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <BellIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-sm font-medium text-yellow-800">
                Active Alerts ({alerts.filter(a => !a.acknowledged).length})
              </h3>
            </div>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="text-yellow-600 hover:text-yellow-800 text-sm"
            >
              {showAlerts ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {showAlerts && (
            <div className="space-y-2">
              {alerts.filter(a => !a.acknowledged).slice(0, 3).map(alert => (
                <div key={alert.id} className={`p-3 rounded border ${getAlertSeverityColor(alert.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      {alert.dueDate && (
                        <p className="text-xs opacity-75">Due: {new Date(alert.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-50"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{assets.length}</h3>
              <p className="text-sm text-gray-500">Total Assets</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+{assets.filter(a => a.status === 'active').length} Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                ${assets.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0).toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500">Current Value</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-600">
                  Original: ${assets.reduce((sum, asset) => sum + asset.procurementValue, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <WrenchScrewdriverIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {assets.filter(a => a.status === 'under-maintenance').length}
              </h3>
              <p className="text-sm text-gray-500">In Maintenance</p>
              <div className="flex items-center mt-2">
                <TimeIcon className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-xs text-yellow-600">2 Due Soon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => !a.acknowledged).length}
              </h3>
              <p className="text-sm text-gray-500">Active Alerts</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-red-600">
                  {alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length} Critical
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Distribution by Category */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Asset Distribution</h3>
            <select
              value={chartView}
              onChange={(e) => setChartView(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="value">By Value</option>
              <option value="count">By Count</option>
              <option value="condition">By Condition</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {['Information Technology (IT) Equipment', 'Vehicles & Transport', 'Furniture & Fittings', 'Office Equipment'].map(category => {
              const categoryAssets = assets.filter(a => a.category.name === category)
              const count = categoryAssets.length
              const value = categoryAssets.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0)
              const maxValue = Math.max(...['Information Technology (IT) Equipment', 'Vehicles & Transport', 'Furniture & Fittings', 'Office Equipment'].map(cat =>
                assets.filter(a => a.category.name === cat).reduce((sum, asset) => sum + calculateCurrentValue(asset), 0)
              ))
              const percentage = chartView === 'value' ? (value / (maxValue || 1)) * 100 : (count / (assets.length || 1)) * 100
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAssetIcon(category)}
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </div>
                  <div className="flex items-center space-x-3 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage.toFixed(2)}%` }}
                      ></div>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-medium">
                        {chartView === 'value' ? `$${value.toLocaleString()}` : count}
                      </div>
                      <div className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Asset Lifecycle & Depreciation */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Asset Lifecycle</h3>
            <select
              value={depreciationView}
              onChange={(e) => setDepreciationView(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="current">Current Status</option>
              <option value="depreciation">Depreciation Trend</option>
              <option value="lifecycle">Lifecycle Stage</option>
            </select>
          </div>

          <div className="space-y-4">
            {assets.slice(0, 3).map(asset => {
              const currentValue = calculateCurrentValue(asset)
              const depreciationPercentage = ((asset.procurementValue - currentValue) / asset.procurementValue) * 100
              const ageInYears = (new Date().getTime() - new Date(asset.procurementDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
              const lifecyclePercentage = asset.expectedLifespan ? (ageInYears / asset.expectedLifespan) * 100 : 0
              
              return (
                <div key={asset.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getAssetIcon(asset.category.name)}
                      <span className="font-medium text-gray-900">{asset.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{asset.assetNumber}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {depreciationView === 'current' ? 'Current Value' : 
                         depreciationView === 'depreciation' ? 'Depreciation' : 'Lifecycle'}
                      </span>
                      <span className="font-medium">
                        {depreciationView === 'current' ? `$${currentValue.toLocaleString()}` :
                         depreciationView === 'depreciation' ? `${depreciationPercentage.toFixed(1)}%` :
                         `${lifecyclePercentage.toFixed(1)}%`}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          depreciationView === 'current' ? 'bg-green-500' :
                          depreciationView === 'depreciation' ? 'bg-red-500' :
                          lifecyclePercentage > 80 ? 'bg-red-500' :
                          lifecyclePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${
                            depreciationView === 'current' ? (currentValue / asset.procurementValue) * 100 :
                            depreciationView === 'depreciation' ? depreciationPercentage :
                            lifecyclePercentage
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Activities & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-900">Asset registered: {assets[0]?.name}</span>
                <div className="text-xs text-gray-500">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded">
              <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-900">Maintenance completed: {assets[2]?.name}</span>
                <div className="text-xs text-gray-500">1 day ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded">
              <ShieldCheckIcon className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-900">Audit scheduled: {assets[1]?.name}</span>
                <div className="text-xs text-gray-500">2 days ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border border-orange-200 bg-orange-50 rounded">
              <CalendarDaysIcon className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Maintenance Due</span>
                <div className="text-xs text-gray-600">{assets[2]?.name} - August 5, 2024</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border border-yellow-200 bg-yellow-50 rounded">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Warranty Expiring</span>
                <div className="text-xs text-gray-600">{assets[1]?.name} - 6 months remaining</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border border-blue-200 bg-blue-50 rounded">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Audit Required</span>
                <div className="text-xs text-gray-600">5 assets pending audit</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
