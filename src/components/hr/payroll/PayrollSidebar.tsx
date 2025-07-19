import React from 'react'
import { 
  CreditCardIcon, 
  CalendarDaysIcon, 
  DocumentTextIcon, 
  CogIcon, 
  ClockIcon, 
  UserGroupIcon 
} from "@heroicons/react/24/outline"

interface PayrollSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function PayrollSidebar({ activeSection, onSectionChange }: PayrollSidebarProps) {
  const sidebarItems = [
    {
      id: 'payroll-overview',
      label: 'Payroll Overview',
      icon: CreditCardIcon,
      description: 'Main payroll dashboard'
    },
    {
      id: 'pay-periods',
      label: 'Pay Periods',
      icon: CalendarDaysIcon,
      description: 'Manage pay periods'
    },
    {
      id: 'employees',
      label: 'Employee Management',
      icon: UserGroupIcon,
      description: 'Manage employee payroll'
    },
    {
      id: 'time-attendance',
      label: 'Time & Attendance',
      icon: ClockIcon,
      description: 'Track time and attendance'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: DocumentTextIcon,
      description: 'Generate payroll reports'
    },
    {
      id: 'settings',
      label: 'Payroll Settings',
      icon: CogIcon,
      description: 'Configure payroll settings'
    }
  ]

  return (
    <div className="w-64 bg-white shadow-lg rounded-lg p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Payroll Management</h2>
        <p className="text-sm text-gray-600">Manage all payroll operations</p>
      </div>
      
      <nav className="space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
              activeSection === item.id
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 ${
              activeSection === item.id ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        ))}
      </nav>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left text-sm text-blue-700 hover:text-blue-900 p-2 rounded hover:bg-blue-100">
            Process Payroll
          </button>
          <button className="w-full text-left text-sm text-blue-700 hover:text-blue-900 p-2 rounded hover:bg-blue-100">
            Generate Payslips
          </button>
          <button className="w-full text-left text-sm text-blue-700 hover:text-blue-900 p-2 rounded hover:bg-blue-100">
            Export Reports
          </button>
        </div>
      </div>
    </div>
  )
}
