"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  TagIcon,
  ChartPieIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer
} from "recharts"

interface ReportsAnalyticsProps {
  assets: any[]
  permissions: any
}

export function ReportsAnalytics({ assets, permissions }: ReportsAnalyticsProps) {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState("3months")
  const [reportType, setReportType] = useState("overview")
  const [chartView, setChartView] = useState("value")
  const [depreciationView, setDepreciationView] = useState("timeline")
  const [isGenerating, setIsGenerating] = useState(false)

  // Color palette for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

  const reportTypes = [
    { id: "overview", name: "Overview Dashboard", icon: ChartBarIcon },
    { id: "asset-register", name: "Asset Register", icon: TagIcon },
    { id: "depreciation", name: "Depreciation Analysis", icon: ArrowTrendingDownIcon },
    { id: "location", name: "Location Distribution", icon: BuildingOffice2Icon },
    { id: "category", name: "Category Analysis", icon: UserGroupIcon },
    { id: "maintenance", name: "Maintenance Reports", icon: WrenchScrewdriverIcon },
    { id: "audit", name: "Audit Compliance", icon: ShieldCheckIcon },
    { id: "financial", name: "Financial Summary", icon: CurrencyDollarIcon }
  ]

  // Calculate current value with depreciation
  const calculateCurrentValue = (asset: any) => {
    const today = new Date()
    const procurementDate = new Date(asset.procurementDate)
    const yearsOwned = (today.getTime() - procurementDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    if (asset.depreciationMethod === 'straight-line') {
      const depreciation = asset.procurementValue * (asset.depreciationRate / 100) * yearsOwned
      return Math.max(0, asset.procurementValue - depreciation)
    }
    return asset.currentValue || asset.procurementValue
  }

  // Prepare chart data - dynamically generate categories from actual asset data
  const uniqueCategories = [...new Set(assets.map(a => a.category?.name || a.category || 'Uncategorized'))]
  const categoryData = uniqueCategories.map(category => {
    const categoryAssets = assets.filter(a => 
      (a.category?.name === category || a.category === category) ||
      (category === 'Uncategorized' && (!a.category?.name && !a.category))
    )
    const totalValue = categoryAssets.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0)
    return {
      name: category,
      count: categoryAssets.length,
      value: totalValue,
      percentage: assets.length > 0 ? ((categoryAssets.length / assets.length) * 100).toFixed(1) : '0'
    }
  }).filter(category => category.count > 0) // Only show categories with assets

  // Generate monthly value data based on asset acquisition dates
  const generateMonthlyValueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    
    return months.map((month, index) => {
      // Calculate cumulative value by filtering assets acquired by this month
      const monthDate = new Date(currentYear, index, 1)
      const assetsAcquiredByMonth = assets.filter(asset => {
        const procurementDate = new Date(asset.procurementDate)
        return procurementDate <= monthDate
      })
      
      const totalValue = assetsAcquiredByMonth.reduce((sum, asset) => sum + (asset.procurementValue || 0), 0)
      const totalCurrentValue = assetsAcquiredByMonth.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0)
      
      return {
        month,
        value: totalValue,
        depreciation: totalCurrentValue
      }
    })
  }

  const valueTreeData = generateMonthlyValueData()

  const conditionData = [
    { name: 'Excellent', value: assets.filter(a => a.condition === 'excellent').length, fill: '#10B981' },
    { name: 'Good', value: assets.filter(a => a.condition === 'good').length, fill: '#3B82F6' },
    { name: 'Fair', value: assets.filter(a => a.condition === 'fair').length, fill: '#F59E0B' },
    { name: 'Poor', value: assets.filter(a => a.condition === 'poor').length, fill: '#EF4444' }
  ]

  // Generate location data dynamically from actual asset data
  const uniqueLocations = [...new Set(assets.map(a => a.location?.name || a.location || 'Unassigned'))]
  const locationData = uniqueLocations.map(location => {
    const locationAssets = assets.filter(a => 
      (a.location?.name === location || a.location === location) ||
      (location === 'Unassigned' && (!a.location?.name && !a.location))
    )
    const totalValue = locationAssets.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0)
    return {
      name: location,
      assets: locationAssets.length,
      value: totalValue
    }
  }).filter(location => location.assets > 0) // Only show locations with assets

  const depreciationTrendData = assets.slice(0, 10).map(asset => {
    const currentValue = calculateCurrentValue(asset)
    const depreciationPercentage = ((asset.procurementValue - currentValue) / asset.procurementValue) * 100
    return {
      name: asset.name.substring(0, 15) + '...',
      original: asset.procurementValue,
      current: currentValue,
      depreciation: depreciationPercentage
    }
  })

  const generateReport = async (type: string) => {
    if (!permissions.canGenerateReports) {
      alert("You don't have permission to generate reports.")
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/inventory/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          timeRange,
          assets: assets.map(a => a.id)
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Download or display the report
        alert(`${type} report generated successfully!`)
      }
    } catch (error) {
      console.error('Report generation failed:', error)
      alert('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Reports & Analytics</h3>
          <p className="text-gray-600">Comprehensive asset reporting and analytics dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
          <Button
            onClick={() => generateReport(reportType)}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Asset Value</p>
              <p className="text-2xl font-bold">
                ${assets.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0).toLocaleString()}
              </p>
              <p className="text-blue-100 text-xs mt-1">
                {((assets.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0) / assets.reduce((sum, asset) => sum + asset.procurementValue, 0)) * 100).toFixed(1)}% of original value
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Asset Utilization</p>
              <p className="text-2xl font-bold">
                {((assets.filter(a => a.status === 'active').length / assets.length) * 100).toFixed(1)}%
              </p>
              <p className="text-green-100 text-xs mt-1">
                {assets.filter(a => a.status === 'active').length} of {assets.length} assets active
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Average Asset Age</p>
              <p className="text-2xl font-bold">
                {(assets.reduce((sum, asset) => {
                  const age = (new Date().getTime() - new Date(asset.procurementDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
                  return sum + age
                }, 0) / assets.length).toFixed(1)} years
              </p>
              <p className="text-purple-100 text-xs mt-1">
                Across all categories
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Maintenance Due</p>
              <p className="text-2xl font-bold">
                {assets.filter(a => {
                  if (!a.nextMaintenanceDate) return false
                  const dueDate = new Date(a.nextMaintenanceDate)
                  const today = new Date()
                  const daysUntilDue = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                  return daysUntilDue <= 30
                }).length}
              </p>
              <p className="text-orange-100 text-xs mt-1">
                Assets due in next 30 days
              </p>
            </div>
            <WrenchScrewdriverIcon className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Value Trend Chart */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Asset Value Trends</h4>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={valueTreeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
              <Legend />
              <Area type="monotone" dataKey="value" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Current Value" />
              <Area type="monotone" dataKey="depreciation" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Depreciated Value" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>12 Month Trend</span>
            <span className="flex items-center">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              +12.5% vs last year
            </span>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Asset Distribution</h4>
            <ChartPieIcon className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.map((category, index) => (
              <div key={typeof category === 'string' ? category : category?.name || 'unknown'} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600">{typeof category === 'string' ? category : category?.name || 'Unknown'}</span>
                <span className="ml-auto text-sm font-medium">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Depreciation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Depreciation Analysis</h4>
            <select
              value={depreciationView}
              onChange={(e) => setDepreciationView(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="timeline">Timeline View</option>
              <option value="category">By Category</option>
              <option value="comparison">Value Comparison</option>
            </select>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={depreciationTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
              <Legend />
              <Bar dataKey="original" fill="#3B82F6" name="Original Value" />
              <Bar dataKey="current" fill="#10B981" name="Current Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Condition Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Condition Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={conditionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {conditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {conditionData.map((item) => {
              const percentage = (item.value / assets.length) * 100
              return (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    {item.name}
                  </span>
                  <span className="font-medium">{item.value} ({percentage.toFixed(1)}%)</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Location and Department Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution by Location</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`${value} assets`, 'Count']} />
              <Bar dataKey="assets" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Lifecycle Status */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Asset Lifecycle Status</h4>
          <div className="space-y-4">
            {assets.slice(0, 6).map(asset => {
              const age = (new Date().getTime() - new Date(asset.procurementDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
              const expectedLifespan = asset.expectedLifespan || 5
              const lifecycleProgress = (age / expectedLifespan) * 100
              const status = lifecycleProgress > 80 ? 'End of Life' : 
                            lifecycleProgress > 60 ? 'Mature' :
                            lifecycleProgress > 30 ? 'Active' : 'New'
              const statusColor = lifecycleProgress > 80 ? 'red' : 
                                 lifecycleProgress > 60 ? 'yellow' :
                                 lifecycleProgress > 30 ? 'blue' : 'green'
              
              return (
                <div key={asset.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="truncate font-medium">{asset.name}</span>
                    <span className={`text-${statusColor}-600 font-medium`}>{status}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`bg-${statusColor}-500 h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(lifecycleProgress, 100).toFixed(0)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {age.toFixed(1)} / {expectedLifespan} years
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => {
            const IconComponent = report.icon
            return (
              <button
                key={report.id}
                onClick={() => {
                  setReportType(report.id)
                  generateReport(report.id)
                }}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                  reportType === report.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">{report.name}</div>
                    <div className="text-sm text-gray-500">Generate detailed report</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
