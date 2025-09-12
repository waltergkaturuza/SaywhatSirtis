import { FC } from "react"
import { cn } from "@/lib/utils"

interface BaseWidgetProps {
  className?: string
}

// Analytics Widget
export const AnalyticsWidget: FC<BaseWidgetProps> = ({ className }) => {
  return (
    <div className={cn("bg-white rounded-lg border p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">2,340</div>
          <div className="text-sm text-gray-500">Total Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">18.5%</div>
          <div className="text-sm text-gray-500">Growth Rate</div>
        </div>
      </div>
    </div>
  )
}

// Performance Widget
export const PerformanceWidget: FC<BaseWidgetProps> = ({ className }) => {
  return (
    <div className={cn("bg-white rounded-lg border p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">CPU Usage</span>
          <span className="text-sm font-medium">45%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Memory Usage</span>
          <span className="text-sm font-medium">72%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
        </div>
      </div>
    </div>
  )
}

// Reports Widget
export const ReportsWidget: FC<BaseWidgetProps> = ({ className }) => {
  return (
    <div className={cn("bg-white rounded-lg border p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b">
          <div>
            <div className="text-sm font-medium text-gray-900">Monthly Summary</div>
            <div className="text-xs text-gray-500">Generated 2 hours ago</div>
          </div>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Ready
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b">
          <div>
            <div className="text-sm font-medium text-gray-900">Performance Report</div>
            <div className="text-xs text-gray-500">Generated 5 hours ago</div>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Processing
          </span>
        </div>
      </div>
    </div>
  )
}

// Tasks Widget
export const TasksWidget: FC<BaseWidgetProps> = ({ className }) => {
  return (
    <div className={cn("bg-white rounded-lg border p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            defaultChecked
          />
          <span className="text-sm text-gray-900 line-through">Review quarterly reports</span>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-900">Update system documentation</span>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-900">Conduct team meeting</span>
        </div>
      </div>
    </div>
  )
}

// Notifications Widget
export const NotificationsWidget: FC<BaseWidgetProps> = ({ className }) => {
  return (
    <div className={cn("bg-white rounded-lg border p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <div className="text-sm font-medium text-gray-900">System Alert</div>
            <div className="text-xs text-gray-500">High CPU usage detected</div>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <div className="text-sm font-medium text-gray-900">New Message</div>
            <div className="text-xs text-gray-500">From John Doe</div>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <div className="text-sm font-medium text-gray-900">Update Complete</div>
            <div className="text-xs text-gray-500">System updated successfully</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Quick Actions Widget
export const QuickActionsWidget: FC<BaseWidgetProps> = ({ className }) => {
  return (
    <div className={cn("bg-white rounded-lg border p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="p-3 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
          <div className="text-sm font-medium text-blue-900">New Report</div>
        </button>
        <button className="p-3 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
          <div className="text-sm font-medium text-green-900">Add User</div>
        </button>
        <button className="p-3 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
          <div className="text-sm font-medium text-purple-900">Settings</div>
        </button>
        <button className="p-3 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors">
          <div className="text-sm font-medium text-orange-900">Backup</div>
        </button>
      </div>
    </div>
  )
}

// System Status Widget
export const SystemStatusWidget: FC<BaseWidgetProps> = ({ className }) => {
  return (
    <div className={cn("bg-white rounded-lg border p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Database</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Online
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API Services</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Online
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">File Storage</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Warning
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Email Service</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Online
          </span>
        </div>
      </div>
    </div>
  )
}

// Weather Widget (example of external data integration)
export const WeatherWidget: FC<BaseWidgetProps> = ({ className }) => {
  return (
    <div className={cn("bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white", className)}>
      <h3 className="text-lg font-semibold mb-4">Weather</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold">22°C</div>
          <div className="text-sm opacity-80">Partly Cloudy</div>
          <div className="text-xs opacity-60">Lagos, Nigeria</div>
        </div>
        <div className="text-4xl">⛅</div>
      </div>
    </div>
  )
}
