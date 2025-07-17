import React from "react"

interface NotificationsSettingsProps {
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    milestoneAlerts: boolean
    budgetAlerts: boolean
    riskAlerts: boolean
    taskOverdue: boolean
    weeklyReports: boolean
    monthlyReports: boolean
    alertThreshold: number
  }
  onChange: (updates: Partial<NotificationsSettingsProps["notifications"]>) => void
}

const NotificationsSettings: React.FC<NotificationsSettingsProps> = ({ notifications, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Email Notifications</label>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.emailNotifications}
            onChange={e => onChange({ emailNotifications: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">SMS Notifications</label>
            <p className="text-sm text-gray-500">Receive critical alerts via SMS</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.smsNotifications}
            onChange={e => onChange({ smsNotifications: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Milestone Alerts</label>
            <p className="text-sm text-gray-500">Get notified when milestones are reached or overdue</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.milestoneAlerts}
            onChange={e => onChange({ milestoneAlerts: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Budget Alerts</label>
            <p className="text-sm text-gray-500">Receive alerts when budget thresholds are exceeded</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.budgetAlerts}
            onChange={e => onChange({ budgetAlerts: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Risk Alerts</label>
            <p className="text-sm text-gray-500">Get notified about high-risk issues</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.riskAlerts}
            onChange={e => onChange({ riskAlerts: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold (%)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={notifications.alertThreshold}
            onChange={e => onChange({ alertThreshold: Number(e.target.value) })}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Trigger alerts when budget/progress reaches this percentage</p>
        </div>
      </div>
    </div>
  )
}

export default NotificationsSettings
