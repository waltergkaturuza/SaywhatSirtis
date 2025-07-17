import React from "react"

interface WorkflowSettingsProps {
  workflow: {
    approvalRequired: boolean
    taskAutoAssignment: boolean
    budgetApprovalLimit: number
    milestoneAutoUpdate: boolean
    reportingFrequency: string
    escalationRules: boolean
  }
  onChange: (updates: Partial<WorkflowSettingsProps["workflow"]>) => void
}

const WorkflowSettings: React.FC<WorkflowSettingsProps> = ({ workflow, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Workflow Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Approval Required</label>
            <p className="text-sm text-gray-500">Require approval for project changes</p>
          </div>
          <input
            type="checkbox"
            checked={workflow.approvalRequired}
            onChange={e => onChange({ approvalRequired: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget Approval Limit ($)</label>
          <input
            type="number"
            min="0"
            value={workflow.budgetApprovalLimit}
            onChange={e => onChange({ budgetApprovalLimit: Number(e.target.value) })}
            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Expenses above this amount require approval</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Frequency</label>
          <select
            value={workflow.reportingFrequency}
            onChange={e => onChange({ reportingFrequency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Auto Task Assignment</label>
            <p className="text-sm text-gray-500">Automatically assign tasks based on workload</p>
          </div>
          <input
            type="checkbox"
            checked={workflow.taskAutoAssignment}
            onChange={e => onChange({ taskAutoAssignment: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Milestone Auto-Update</label>
            <p className="text-sm text-gray-500">Automatically update milestones when all tasks complete</p>
          </div>
          <input
            type="checkbox"
            checked={workflow.milestoneAutoUpdate}
            onChange={e => onChange({ milestoneAutoUpdate: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Escalation Rules</label>
            <p className="text-sm text-gray-500">Enable automatic escalation for overdue tasks</p>
          </div>
          <input
            type="checkbox"
            checked={workflow.escalationRules}
            onChange={e => onChange({ escalationRules: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

export default WorkflowSettings
