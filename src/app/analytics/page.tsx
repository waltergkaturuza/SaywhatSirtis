"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import {
  ChartBarIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  FunnelIcon,
  EyeIcon,
  PrinterIcon
} from "@heroicons/react/24/outline"

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState("7d")

  const metadata = {
    title: "Analytics & Reporting",
    description: "Comprehensive data analytics and business intelligence",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Analytics" }
    ]
  }

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold text-blue-600">₦2.4M</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              +12.5%
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">1,247</div>
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              +8.3%
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">345</div>
            <div className="text-sm text-gray-600">Open Cases</div>
            <div className="flex items-center text-xs text-red-600">
              <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
              -3.2%
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">98.5%</div>
            <div className="text-sm text-gray-600">System Uptime</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              +0.1%
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center">
            <DocumentChartBarIcon className="h-4 w-4 mr-2" />
            Performance Summary
          </button>
          <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-2" />
            User Activity Report
          </button>
          <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            Financial Summary
          </button>
          <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Custom Report
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Range</h3>
        <div className="space-y-2">
          {[
            { value: "1d", label: "Last 24 Hours" },
            { value: "7d", label: "Last 7 Days" },
            { value: "30d", label: "Last 30 Days" },
            { value: "90d", label: "Last 90 Days" },
            { value: "1y", label: "Last Year" }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`w-full text-left p-2 text-sm rounded ${
                dateRange === range.value
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const analyticsTabs = [
    { id: "overview", name: "Overview", icon: ChartBarIcon },
    { id: "programs", name: "Programs", icon: PresentationChartLineIcon },
    { id: "users", name: "Users", icon: UserGroupIcon },
    { id: "financial", name: "Financial", icon: CurrencyDollarIcon },
    { id: "operations", name: "Operations", icon: ClockIcon },
    { id: "reports", name: "Reports", icon: DocumentChartBarIcon }
  ]

  const chartData = {
    overview: {
      revenue: [
        { month: "Jan", amount: 2100000 },
        { month: "Feb", amount: 2300000 },
        { month: "Mar", amount: 1900000 },
        { month: "Apr", amount: 2400000 },
        { month: "May", amount: 2200000 },
        { month: "Jun", amount: 2600000 }
      ],
      users: [
        { month: "Jan", active: 1100, new: 150 },
        { month: "Feb", active: 1180, new: 180 },
        { month: "Mar", active: 1050, new: 120 },
        { month: "Apr", active: 1247, new: 200 },
        { month: "May", active: 1320, new: 170 },
        { month: "Jun", active: 1247, new: 160 }
      ]
    }
  }

  const reports = [
    {
      id: 1,
      name: "Monthly Performance Dashboard",
      description: "Comprehensive monthly performance metrics across all modules",
      lastGenerated: "2024-01-15T10:30:00Z",
      size: "2.4 MB",
      downloads: 234,
      type: "PDF"
    },
    {
      id: 2,
      name: "User Engagement Analysis",
      description: "Detailed analysis of user behavior and engagement patterns",
      lastGenerated: "2024-01-14T16:45:00Z",
      size: "1.8 MB",
      downloads: 156,
      type: "Excel"
    },
    {
      id: 3,
      name: "Financial Summary Q4",
      description: "Quarterly financial performance and budget analysis",
      lastGenerated: "2024-01-10T09:15:00Z",
      size: "3.2 MB",
      downloads: 89,
      type: "PDF"
    },
    {
      id: 4,
      name: "System Performance Report",
      description: "Technical performance metrics and system health analysis",
      lastGenerated: "2024-01-12T14:20:00Z",
      size: "1.5 MB",
      downloads: 67,
      type: "PDF"
    }
  ]

  const kpiCards = [
    {
      title: "Program Success Rate",
      value: "87.3%",
      change: "+5.2%",
      trend: "up",
      color: "green"
    },
    {
      title: "Call Resolution Rate",
      value: "94.7%",
      change: "+2.1%",
      trend: "up",
      color: "blue"
    },
    {
      title: "Employee Satisfaction",
      value: "8.4/10",
      change: "+0.3",
      trend: "up",
      color: "purple"
    },
    {
      title: "Cost per Beneficiary",
      value: "₦15,240",
      change: "-8.5%",
      trend: "down",
      color: "orange"
    }
  ]

  return (
    <ModulePage
      metadata={metadata}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Analytics Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center px-6 py-4">
              <nav className="-mb-px flex space-x-8">
                {analyticsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
              
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {kpiCards.map((kpi, index) => (
                    <div key={index} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                          <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          kpi.trend === "up" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {kpi.trend === "up" ? (
                            <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                          )}
                          {kpi.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                    <div className="h-64 flex items-end space-x-2">
                      {chartData.overview.revenue.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-500 rounded-t"
                            style={{ height: `${(data.amount / 2600000) * 200}px` }}
                          />
                          <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
                    <div className="h-64 flex items-end space-x-2">
                      {chartData.overview.users.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full space-y-1">
                            <div
                              className="w-full bg-blue-500 rounded-t"
                              style={{ height: `${(data.active / 1320) * 160}px` }}
                            />
                            <div
                              className="w-full bg-green-500"
                              style={{ height: `${(data.new / 200) * 40}px` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center mt-4 space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span className="text-xs text-gray-600">Active Users</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="text-xs text-gray-600">New Users</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analytics Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <ChartBarIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">New dashboard created</p>
                        <p className="text-sm text-gray-500">Program Performance Dashboard - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <DocumentChartBarIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Monthly report generated</p>
                        <p className="text-sm text-gray-500">Financial Summary Report - 1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <UserGroupIcon className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">User analytics updated</p>
                        <p className="text-sm text-gray-500">Engagement metrics refreshed - 2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "programs" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Active Programs</h3>
                      <span className="text-2xl font-bold text-blue-600">24</span>
                    </div>
                    <div className="text-sm text-green-600">+3 from last month</div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Total Beneficiaries</h3>
                      <span className="text-2xl font-bold text-green-600">15,847</span>
                    </div>
                    <div className="text-sm text-green-600">+1,234 from last month</div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
                      <span className="text-2xl font-bold text-purple-600">87.3%</span>
                    </div>
                    <div className="text-sm text-green-600">+5.2% from last month</div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiaries</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget Used</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Youth Skills Development
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3,245</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦45.2M / ₦50M</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">92%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              On Track
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Women Empowerment
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2,156</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦28.7M / ₦35M</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">89%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              On Track
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Healthcare Access
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4,567</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦67.3M / ₦70M</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">85%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              At Risk
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                    <div className="text-xs text-green-600 mt-1">+8.3% from last month</div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-green-600">89.2%</div>
                    <div className="text-sm text-gray-600">Active Rate</div>
                    <div className="text-xs text-green-600 mt-1">+2.1% from last month</div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-purple-600">4.7</div>
                    <div className="text-sm text-gray-600">Avg. Sessions</div>
                    <div className="text-xs text-green-600 mt-1">+0.3 from last month</div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-orange-600">12m 34s</div>
                    <div className="text-sm text-gray-600">Avg. Session</div>
                    <div className="text-xs text-green-600 mt-1">+1m 12s from last month</div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement by Module</h3>
                  <div className="space-y-4">
                    {[
                      { module: "Dashboard", usage: 95, users: 1184 },
                      { module: "Programs", usage: 78, users: 973 },
                      { module: "Call Centre", usage: 65, users: 811 },
                      { module: "HR Management", usage: 45, users: 561 },
                      { module: "Documents", usage: 38, users: 474 },
                      { module: "Inventory", usage: 25, users: 312 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-32 text-sm font-medium text-gray-900">{item.module}</div>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${item.usage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-20 text-sm text-gray-500 text-right">{item.users} users</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "financial" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-green-600">₦2.4M</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                    <div className="text-xs text-green-600 mt-1">+12.5% from last month</div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-red-600">₦1.8M</div>
                    <div className="text-sm text-gray-600">Monthly Expenses</div>
                    <div className="text-xs text-red-600 mt-1">+5.2% from last month</div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-blue-600">₦600K</div>
                    <div className="text-sm text-gray-600">Net Profit</div>
                    <div className="text-xs text-green-600 mt-1">+23.1% from last month</div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Allocation</h3>
                  <div className="space-y-4">
                    {[
                      { category: "Program Implementation", allocated: 1200000, spent: 980000, percentage: 82 },
                      { category: "Staff Salaries", allocated: 600000, spent: 600000, percentage: 100 },
                      { category: "Technology", allocated: 300000, spent: 245000, percentage: 82 },
                      { category: "Training & Development", allocated: 150000, spent: 120000, percentage: 80 },
                      { category: "Administration", allocated: 250000, spent: 180000, percentage: 72 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-900">{item.category}</span>
                            <span className="text-sm text-gray-500">
                              ₦{(item.spent / 1000).toFixed(0)}K / ₦{(item.allocated / 1000).toFixed(0)}K
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.percentage > 90 ? 'bg-red-500' : 
                                item.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "operations" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <div className="text-sm text-gray-600">System Uptime</div>
                    <div className="text-xs text-green-600 mt-1">+0.1% from last month</div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-blue-600">245ms</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                    <div className="text-xs text-green-600 mt-1">-15ms from last month</div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-purple-600">2,847</div>
                    <div className="text-sm text-gray-600">Daily Transactions</div>
                    <div className="text-xs text-green-600 mt-1">+156 from yesterday</div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-2xl font-bold text-orange-600">99.2%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                    <div className="text-xs text-green-600 mt-1">+0.3% from last month</div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Resource Usage</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">CPU Usage</span>
                            <span className="text-sm font-medium">45%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Memory Usage</span>
                            <span className="text-sm font-medium">72%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Disk Usage</span>
                            <span className="text-sm font-medium">34%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "34%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Error Rates</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">API Errors</span>
                          <span className="text-sm font-medium text-green-600">0.8%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Database Errors</span>
                          <span className="text-sm font-medium text-green-600">0.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Frontend Errors</span>
                          <span className="text-sm font-medium text-green-600">1.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    Generate New Report
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <DocumentChartBarIcon className="h-8 w-8 text-blue-500" />
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {report.type}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{report.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Generated:</span>
                          <span>{new Date(report.lastGenerated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{report.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Downloads:</span>
                          <span>{report.downloads}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded hover:bg-blue-100 flex items-center justify-center">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          View
                        </button>
                        <button className="flex-1 text-xs bg-gray-50 text-gray-700 py-2 px-3 rounded hover:bg-gray-100 flex items-center justify-center">
                          <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "Monthly Performance", description: "Comprehensive monthly metrics", icon: ChartBarIcon },
                      { name: "User Engagement", description: "User behavior analysis", icon: UserGroupIcon },
                      { name: "Financial Summary", description: "Budget and expense report", icon: CurrencyDollarIcon },
                      { name: "System Health", description: "Technical performance metrics", icon: ClockIcon },
                      { name: "Program Impact", description: "Program effectiveness analysis", icon: PresentationChartLineIcon },
                      { name: "Custom Report", description: "Build your own report", icon: DocumentChartBarIcon }
                    ].map((template, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center mb-2">
                          <template.icon className="h-5 w-5 text-blue-500 mr-2" />
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
