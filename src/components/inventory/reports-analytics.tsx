"use client"

import { useState, useEffect } from "react"
import { 
  DocumentTextIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ClockIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Asset, InventoryPermissions } from '@/types/inventory'

interface ReportsAnalyticsProps {
  assets: Asset[]
  permissions: InventoryPermissions
}

interface ReportConfig {
  id: string
  name: string
  description: string
  type: 'asset-register' | 'depreciation' | 'location' | 'category' | 'maintenance' | 'audit' | 'financial'
  icon: React.ComponentType<{ className?: string }>
  requiredPermissions?: string[]
}

interface AnalyticsData {
  totalAssets: number
  totalValue: number
  avgDepreciation: number
  topCategories: Array<{ name: string; count: number; value: number }>
  topLocations: Array<{ name: string; count: number; value: number }>
  monthlyTrends: Array<{ month: string; acquisitions: number; disposals: number; value: number }>
  depreciationTrends: Array<{ month: string; depreciation: number }>
  utilizationRates: Array<{ category: string; utilization: number }>
}

export function ReportsAnalytics({ assets, permissions }: ReportsAnalyticsProps) {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  const reportConfigs: ReportConfig[] = [
    {
      id: 'asset-register',
      name: 'Asset Register Report',
      description: 'Complete listing of all assets with current status and values',
      type: 'asset-register',
      icon: DocumentTextIcon
    },
    {
      id: 'depreciation-report',
      name: 'Depreciation Analysis',
      description: 'Asset depreciation trends and current book values',
      type: 'depreciation',
      icon: ArrowTrendingDownIcon,
      requiredPermissions: ['financial.view']
    },
    {
      id: 'location-report',
      name: 'Location-Based Report',
      description: 'Assets grouped by location with utilization metrics',
      type: 'location',
      icon: BuildingOfficeIcon
    },
    {
      id: 'category-report',
      name: 'Category Analysis',
      description: 'Asset distribution and value analysis by category',
      type: 'category',
      icon: TagIcon
    },
    {
      id: 'maintenance-report',
      name: 'Maintenance Analytics',
      description: 'Maintenance schedules, costs, and performance metrics',
      type: 'maintenance',
      icon: ClockIcon
    },
    {
      id: 'audit-report',
      name: 'Audit Compliance Report',
      description: 'Audit history, compliance status, and findings summary',
      type: 'audit',
      icon: EyeIcon
    },
    {
      id: 'financial-report',
      name: 'Financial Summary',
      description: 'Asset valuations, procurement costs, and financial trends',
      type: 'financial',
      icon: CurrencyDollarIcon,
      requiredPermissions: ['financial.view']
    }
  ]

  // Calculate analytics data
  useEffect(() => {
    const calculateAnalytics = () => {
      const totalAssets = assets.length
      const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0)
      const avgDepreciation = assets.reduce((sum, asset) => {
        const procurementDate = new Date(asset.procurementDate)
        const today = new Date()
        const yearsOwned = (today.getTime() - procurementDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        const depreciationAmount = asset.procurementValue - asset.currentValue
        return sum + (depreciationAmount / Math.max(yearsOwned, 1))
      }, 0) / totalAssets

      // Top categories by count and value
      const categoryMap = new Map<string, { count: number; value: number }>()
      assets.forEach(asset => {
        const categoryName = asset.category.name
        const existing = categoryMap.get(categoryName) || { count: 0, value: 0 }
        categoryMap.set(categoryName, {
          count: existing.count + 1,
          value: existing.value + asset.currentValue
        })
      })
      const topCategories = Array.from(categoryMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      // Top locations by count and value
      const locationMap = new Map<string, { count: number; value: number }>()
      assets.forEach(asset => {
        const locationName = asset.location.name
        const existing = locationMap.get(locationName) || { count: 0, value: 0 }
        locationMap.set(locationName, {
          count: existing.count + 1,
          value: existing.value + asset.currentValue
        })
      })
      const topLocations = Array.from(locationMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      // Monthly trends (last 12 months)
      const monthlyTrends = []
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStr = date.toISOString().substring(0, 7)
        
        const acquisitions = assets.filter(asset => 
          asset.procurementDate.startsWith(monthStr)
        ).length
        
        const value = assets.filter(asset => 
          asset.procurementDate.startsWith(monthStr)
        ).reduce((sum, asset) => sum + asset.procurementValue, 0)
        
        monthlyTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          acquisitions,
          disposals: 0, // Would need disposal tracking
          value
        })
      }

      // Depreciation trends
      const depreciationTrends = monthlyTrends.map(month => ({
        month: month.month,
        depreciation: month.value * 0.15 // Simplified calculation
      }))

      // Utilization rates by category
      const utilizationRates = topCategories.map(category => ({
        category: category.name,
        utilization: Math.random() * 100 // Would need actual utilization tracking
      }))

      setAnalyticsData({
        totalAssets,
        totalValue,
        avgDepreciation,
        topCategories,
        topLocations,
        monthlyTrends,
        depreciationTrends,
        utilizationRates
      })
    }

    calculateAnalytics()
  }, [assets])

  const generateReport = async (reportType: string) => {
    setLoading(true)
    try {
      // Simulate API call to backend
      const response = await fetch('/api/inventory/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: reportType,
          dateRange: dateRange.start && dateRange.end ? dateRange : null,
          assets: assets.map(asset => asset.id)
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        // Fallback to client-side generation
        generateClientSideReport(reportType)
      }
    } catch (error) {
      console.log('Backend not available, generating client-side report')
      generateClientSideReport(reportType)
    } finally {
      setLoading(false)
    }
  }

  const generateClientSideReport = (reportType: string) => {
    let data: any = {}

    switch (reportType) {
      case 'asset-register':
        data = {
          title: 'Asset Register Report',
          generated: new Date().toISOString(),
          assets: assets.map(asset => ({
            assetNumber: asset.assetNumber,
            name: asset.name,
            category: asset.category.name,
            type: asset.type.name,
            status: asset.status,
            location: asset.location.name,
            assignedTo: asset.assignedTo,
            procurementValue: asset.procurementValue,
            currentValue: asset.currentValue,
            lastAuditDate: asset.lastAuditDate
          }))
        }
        break

      case 'depreciation-report':
        data = {
          title: 'Depreciation Analysis Report',
          generated: new Date().toISOString(),
          summary: {
            totalOriginalValue: assets.reduce((sum, a) => sum + a.procurementValue, 0),
            totalCurrentValue: assets.reduce((sum, a) => sum + a.currentValue, 0),
            totalDepreciation: assets.reduce((sum, a) => sum + (a.procurementValue - a.currentValue), 0)
          },
          assets: assets.map(asset => {
            const depreciation = asset.procurementValue - asset.currentValue
            const depreciationRate = (depreciation / asset.procurementValue) * 100
            return {
              assetNumber: asset.assetNumber,
              name: asset.name,
              procurementValue: asset.procurementValue,
              currentValue: asset.currentValue,
              depreciation,
              depreciationRate,
              method: asset.depreciationMethod
            }
          })
        }
        break

      case 'location-report':
        data = {
          title: 'Location-Based Asset Report',
          generated: new Date().toISOString(),
          locations: analyticsData?.topLocations.map(location => ({
            name: location.name,
            assetCount: location.count,
            totalValue: location.value,
            assets: assets.filter(a => a.location.name === location.name)
              .map(a => ({ assetNumber: a.assetNumber, name: a.name, value: a.currentValue }))
          }))
        }
        break

      case 'category-report':
        data = {
          title: 'Category Analysis Report',
          generated: new Date().toISOString(),
          categories: analyticsData?.topCategories.map(category => ({
            name: category.name,
            assetCount: category.count,
            totalValue: category.value,
            averageValue: category.value / category.count,
            assets: assets.filter(a => a.category.name === category.name)
              .map(a => ({ assetNumber: a.assetNumber, name: a.name, value: a.currentValue }))
          }))
        }
        break

      default:
        data = { title: 'Report', assets }
    }

    setReportData(data)
  }

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportData) return

    // Create export data
    const exportData = {
      ...reportData,
      format,
      exportedAt: new Date().toISOString()
    }

    // Simulate download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const hasPermission = (requiredPermissions?: string[]) => {
    if (!requiredPermissions) return true
    if (!permissions.canViewFinancials && requiredPermissions.includes('financial.view')) return false
    return true
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports and analyze asset data</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Analytics Overview */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalAssets}</div>
              <p className="text-xs text-muted-foreground">
                Across all locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analyticsData.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Current market value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Depreciation</CardTitle>
              <ArrowTrendingDownIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analyticsData.avgDepreciation.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                Per year per asset
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <TagIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.topCategories[0]?.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.topCategories[0]?.name || 'No data'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportConfigs.filter(report => hasPermission(report.requiredPermissions)).map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Icon className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    setSelectedReport(report.id)
                    generateReport(report.type)
                  }}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && selectedReport === report.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    <>
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{reportData.title}</CardTitle>
                <CardDescription>Generated on {new Date(reportData.generated).toLocaleString()}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => exportReport('pdf')}>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" onClick={() => exportReport('excel')}>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" onClick={() => exportReport('csv')}>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
