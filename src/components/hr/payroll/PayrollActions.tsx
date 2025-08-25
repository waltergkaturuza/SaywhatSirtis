'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PlayIcon,
  PauseIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  PrinterIcon,
  CalculatorIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface PayrollActionsProps {
  payrollStatus?: 'ready' | 'processing' | 'completed' | 'error'
  onProcessPayroll?: () => void
  onPausePayroll?: () => void
  onGeneratePayslips?: () => void
  onSendEmails?: () => void
  onPrintReports?: () => void
  onCalculateDeductions?: () => void
}

export function PayrollActions({
  payrollStatus = 'ready',
  onProcessPayroll,
  onPausePayroll,
  onGeneratePayslips,
  onSendEmails,
  onPrintReports,
  onCalculateDeductions
}: PayrollActionsProps) {
  const getStatusInfo = () => {
    switch (payrollStatus) {
      case 'processing':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <ClockIcon className="h-4 w-4" />,
          text: 'Processing...'
        }
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircleIcon className="h-4 w-4" />,
          text: 'Completed'
        }
      case 'error':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <ClockIcon className="h-4 w-4" />,
          text: 'Error'
        }
      default:
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <ClockIcon className="h-4 w-4" />,
          text: 'Ready'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payroll Actions</h2>
          <p className="text-sm text-gray-600">Manage payroll processing and outputs</p>
        </div>
        <Badge className={statusInfo.color}>
          {statusInfo.icon}
          <span className="ml-1">{statusInfo.text}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Primary Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Processing</h3>
          
          <Button
            onClick={onProcessPayroll}
            disabled={payrollStatus === 'processing'}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            {payrollStatus === 'processing' ? 'Processing...' : 'Start Payroll'}
          </Button>

          {payrollStatus === 'processing' && (
            <Button
              onClick={onPausePayroll}
              variant="outline"
              className="w-full"
            >
              <PauseIcon className="h-4 w-4 mr-2" />
              Pause Payroll
            </Button>
          )}

          <Button
            onClick={onCalculateDeductions}
            variant="outline"
            className="w-full"
            disabled={payrollStatus === 'processing'}
          >
            <CalculatorIcon className="h-4 w-4 mr-2" />
            Calculate Deductions
          </Button>
        </div>

        {/* Output Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Outputs</h3>
          
          <Button
            onClick={onGeneratePayslips}
            variant="outline"
            className="w-full"
            disabled={payrollStatus !== 'completed'}
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Generate Payslips
          </Button>

          <Button
            onClick={onPrintReports}
            variant="outline"
            className="w-full"
            disabled={payrollStatus !== 'completed'}
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print Reports
          </Button>

          <Button
            onClick={onSendEmails}
            variant="outline"
            className="w-full"
            disabled={payrollStatus !== 'completed'}
          >
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Email Payslips
          </Button>
        </div>

        {/* Status Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Employees:</span>
              <span className="font-medium">342</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Processed:</span>
              <span className="font-medium">
                {payrollStatus === 'completed' ? '342/342' : '0/342'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">$2,450,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Time:</span>
              <span className="font-medium">
                {payrollStatus === 'processing' ? '~15 min' : '~2 hours'}
              </span>
            </div>
          </div>

          {payrollStatus === 'processing' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Warnings or Information */}
      {payrollStatus === 'ready' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Ensure all time sheets are submitted and approved before processing payroll.
          </p>
        </div>
      )}

      {payrollStatus === 'error' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> Payroll processing failed. Please check the logs and try again.
          </p>
        </div>
      )}
    </div>
  )
}
