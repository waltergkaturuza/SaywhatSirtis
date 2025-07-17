import React from "react"

interface SecuritySettingsProps {
  security: {
    passwordPolicy: string
    sessionTimeout: number
    twoFactorAuth: boolean
    ipWhitelist: string[]
    dataEncryption: boolean
    auditLog: boolean
    backupFrequency: string
  }
  onChange: (updates: Partial<SecuritySettingsProps["security"]>) => void
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ security, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
          <select
            value={security.passwordPolicy}
            onChange={e => onChange({ passwordPolicy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="basic">Basic (8+ characters)</option>
            <option value="strong">Strong (8+ chars, numbers, symbols)</option>
            <option value="very_strong">Very Strong (12+ chars, mixed case, numbers, symbols)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            min="5"
            max="480"
            value={security.sessionTimeout}
            onChange={e => onChange({ sessionTimeout: Number(e.target.value) })}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
            <p className="text-sm text-gray-500">Require 2FA for all users</p>
          </div>
          <input
            type="checkbox"
            checked={security.twoFactorAuth}
            onChange={e => onChange({ twoFactorAuth: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Data Encryption</label>
            <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
          </div>
          <input
            type="checkbox"
            checked={security.dataEncryption}
            onChange={e => onChange({ dataEncryption: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Audit Logging</label>
            <p className="text-sm text-gray-500">Log all user actions for security auditing</p>
          </div>
          <input
            type="checkbox"
            checked={security.auditLog}
            onChange={e => onChange({ auditLog: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
          <select
            value={security.backupFrequency}
            onChange={e => onChange({ backupFrequency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default SecuritySettings
