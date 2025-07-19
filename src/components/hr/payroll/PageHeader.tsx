import React from 'react'
import { ChevronDownIcon } from "@heroicons/react/24/outline"

interface PageHeaderProps {
  title: string
  subtitle?: string
  selectedPeriod?: any
  periods?: any[]
  onPeriodChange?: (period: any) => void
  actions?: React.ReactNode
}

export function PageHeader({ 
  title, 
  subtitle, 
  selectedPeriod, 
  periods = [], 
  onPeriodChange, 
  actions 
}: PageHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          
          {/* Period Selector */}
          {periods.length > 0 && onPeriodChange && (
            <div className="relative">
              <select
                value={selectedPeriod?.id || ''}
                onChange={(e) => {
                  const period = periods.find(p => p.id === e.target.value)
                  if (period) onPeriodChange(period)
                }}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Period</option>
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name} ({new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
      
      {/* Period Info */}
      {selectedPeriod && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Current Period: {selectedPeriod.name}
              </p>
              <p className="text-xs text-blue-700">
                {new Date(selectedPeriod.startDate).toLocaleDateString()} - {new Date(selectedPeriod.endDate).toLocaleDateString()}
                {selectedPeriod.payDate && (
                  <> • Pay Date: {new Date(selectedPeriod.payDate).toLocaleDateString()}</>
                )}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                selectedPeriod.status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : selectedPeriod.status === 'processed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedPeriod.status?.charAt(0).toUpperCase() + selectedPeriod.status?.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
