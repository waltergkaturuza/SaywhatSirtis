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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-6 space-y-8 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed top-20 right-20 w-72 h-72 bg-gradient-to-br from-orange-200/30 to-green-200/30 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse -z-10 animation-delay-2s"></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-100/10 to-green-100/10 rounded-full blur-3xl -z-10"></div>
      {/* World-Class Header */}
      <div className="relative overflow-hidden bg-orange-600 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Enterprise Inventory</h1>
              <p className="text-orange-100 text-lg">Comprehensive asset tracking with RFID integration and real-time analytics</p>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{assets.length}</div>
                <div className="text-orange-100 text-sm">Total Assets</div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {assets.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0).toLocaleString()}
                </div>
                <div className="text-orange-100 text-sm">Portfolio Value</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>
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
        <div className="relative backdrop-blur-lg bg-yellow-50 border border-white/20 rounded-2xl p-6 shadow-xl">
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
        <div className="group relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
          <div className="flex items-center">
            <div className="p-4 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <ClipboardDocumentListIcon className="w-8 h-8 text-white drop-shadow-lg" />
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

        <div className="group relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
          <div className="flex items-center">
            <div className="p-4 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <CurrencyDollarIcon className="w-8 h-8 text-white drop-shadow-lg" />
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

        <div className="group relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
          <div className="flex items-center">
            <div className="p-4 bg-orange-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <WrenchScrewdriverIcon className="w-8 h-8 text-white drop-shadow-lg" />
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

        <div className="group relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
          <div className="flex items-center">
            <div className="p-4 bg-red-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <ExclamationCircleIcon className="w-8 h-8 text-white drop-shadow-lg" />
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Asset Distribution by Category */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Asset Distribution</h3>
            <select
              value={chartView}
              onChange={(e) => setChartView(e.target.value)}
              className="text-sm bg-white/90 backdrop-blur-sm border border-orange-200 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="value">By Value</option>
              <option value="count">By Count</option>
              <option value="condition">By Condition</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {['Information Technology (IT) Equipment', 'Vehicles & Transport', 'Furniture & Fittings', 'Office Equipment'].map(category => {
              const categoryAssets = assets.filter(a => 
                typeof a.category === 'string' ? a.category === category : a.category?.name === category
              )
              const count = categoryAssets.length
              const value = categoryAssets.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0)
              const maxValue = Math.max(...['Information Technology (IT) Equipment', 'Vehicles & Transport', 'Furniture & Fittings', 'Office Equipment'].map(cat =>
                assets.filter(a => 
                  typeof a.category === 'string' ? a.category === cat : a.category?.name === cat
                ).reduce((sum, asset) => sum + calculateCurrentValue(asset), 0)
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
                        className="bg-orange-500 h-3 rounded-full transition-all duration-300" 
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
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Asset Lifecycle</h3>
            <select
              value={depreciationView}
              onChange={(e) => setDepreciationView(e.target.value)}
              className="text-sm bg-white/90 backdrop-blur-sm border border-orange-200 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      {getAssetIcon(typeof asset.category === 'string' ? asset.category : asset.category?.name || '')}
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-900">Asset registered: {assets[0]?.name}</span>
                <div className="text-xs text-gray-500">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
              <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-900">Maintenance completed: {assets[2]?.name}</span>
                <div className="text-xs text-gray-500">1 day ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300">
              <ShieldCheckIcon className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-900">Audit scheduled: {assets[1]?.name}</span>
                <div className="text-xs text-gray-500">2 days ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl border border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300">
              <CalendarDaysIcon className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Maintenance Due</span>
                <div className="text-xs text-gray-600">{assets[2]?.name} - August 5, 2024</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-xl border border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Warranty Expiring</span>
                <div className="text-xs text-gray-600">{assets[1]?.name} - 6 months remaining</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300">
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
