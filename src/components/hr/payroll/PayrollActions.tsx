import React from 'react'
import { 
  PlayIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  CogIcon, 
  CalendarDaysIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface PayrollActionsProps {
  selectedPeriod: any
  payrollData: any
  onProcessPayroll: () => void
  onGeneratePayslips: () => void
  onExportData: () => void
  onCreatePeriod: () => void
  onApprovePayroll: () => void
}

export function PayrollActions({ 
  selectedPeriod, 
  payrollData, 
  onProcessPayroll, 
  onGeneratePayslips, 
  onExportData, 
  onCreatePeriod, 
  onApprovePayroll 
}: PayrollActionsProps) {
  const isPending = selectedPeriod?.status === 'pending'
  const isProcessed = selectedPeriod?.status === 'processed'
  const isApproved = selectedPeriod?.status === 'approved'

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Payroll Actions</h2>
        <div className="flex items-center space-x-2">
          {isPending && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Pending
            </span>
          )}
          {isProcessed && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <PlayIcon className="w-4 h-4 mr-1" />
              Processed
            </span>
          )}
          {isApproved && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Approved
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Process Payroll */}
        <button
          onClick={onProcessPayroll}
          disabled={isProcessed || isApproved}
          className={`flex items-center justify-center p-4 rounded-lg border-2 border-dashed transition-colors ${
            isProcessed || isApproved
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-600'
          }`}
        >
          <div className="text-center">
            <PlayIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">Process Payroll</div>
            <div className="text-sm text-gray-500">Calculate salaries</div>
          </div>
        </button>

        {/* Generate Payslips */}
        <button
          onClick={onGeneratePayslips}
          disabled={!isProcessed && !isApproved}
          className={`flex items-center justify-center p-4 rounded-lg border-2 border-dashed transition-colors ${
            !isProcessed && !isApproved
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-green-300 hover:border-green-400 hover:bg-green-50 text-green-600'
          }`}
        >
          <div className="text-center">
            <DocumentTextIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">Generate Payslips</div>
            <div className="text-sm text-gray-500">Create PDF payslips</div>
          </div>
        </button>

        {/* Approve Payroll */}
        <button
          onClick={onApprovePayroll}
          disabled={!isProcessed || isApproved}
          className={`flex items-center justify-center p-4 rounded-lg border-2 border-dashed transition-colors ${
            !isProcessed || isApproved
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50 text-purple-600'
          }`}
        >
          <div className="text-center">
            <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">Approve Payroll</div>
            <div className="text-sm text-gray-500">Final approval</div>
          </div>
        </button>

        {/* Export Data */}
        <button
          onClick={onExportData}
          className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-600 transition-colors"
        >
          <div className="text-center">
            <ArrowDownTrayIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">Export Data</div>
            <div className="text-sm text-gray-500">Download reports</div>
          </div>
        </button>

        {/* Create Pay Period */}
        <button
          onClick={onCreatePeriod}
          className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-orange-300 hover:border-orange-400 hover:bg-orange-50 text-orange-600 transition-colors"
        >
          <div className="text-center">
            <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">Create Period</div>
            <div className="text-sm text-gray-500">New pay period</div>
          </div>
        </button>

        {/* Settings */}
        <button
          className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <div className="text-center">
            <CogIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">Settings</div>
            <div className="text-sm text-gray-500">Configure payroll</div>
          </div>
        </button>
      </div>

      {/* Current Period Info */}
      {selectedPeriod && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Current Period</h3>
              <p className="text-sm text-gray-600">
                {new Date(selectedPeriod.startDate).toLocaleDateString()} - {new Date(selectedPeriod.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Employees</p>
              <p className="text-lg font-semibold text-gray-900">{payrollData?.employees?.length || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
