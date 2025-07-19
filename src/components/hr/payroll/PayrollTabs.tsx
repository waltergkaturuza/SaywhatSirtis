import { UserIcon, CubeIcon, DocumentChartBarIcon } from "@heroicons/react/24/outline"

interface PayrollTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function PayrollTabs({ activeTab, onTabChange }: PayrollTabsProps) {
  const tabs = [
    {
      id: 'employee-payroll',
      name: 'Employee Payroll',
      icon: UserIcon,
      description: 'Manage employee payroll records'
    },
    {
      id: 'benefits-management',
      name: 'Benefits Management',
      icon: CubeIcon,
      description: 'Configure employee benefits'
    },
    {
      id: 'payroll-reports',
      name: 'Payroll Reports',
      icon: DocumentChartBarIcon,
      description: 'Generate payroll reports'
    }
  ]

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="h-5 w-5 mr-2" />
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  )
}
