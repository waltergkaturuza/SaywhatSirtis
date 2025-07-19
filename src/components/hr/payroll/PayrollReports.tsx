import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  ClockIcon, 
  UserGroupIcon, 
  CubeIcon 
} from "@heroicons/react/24/outline"

interface PayrollReportsProps {
  selectedPeriod: any
  payrollData: any
  onGenerateReport: (reportType: string) => void
}

export function PayrollReports({ selectedPeriod, payrollData, onGenerateReport }: PayrollReportsProps) {
  const reports = [
    {
      id: 'payroll-summary',
      title: 'Payroll Summary',
      description: 'Comprehensive payroll summary for the current period',
      icon: ChartBarIcon,
      color: 'blue',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'tax-report',
      title: 'Tax Report',
      description: 'Tax deductions and remittances report',
      icon: DocumentTextIcon,
      color: 'green',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'benefits-report',
      title: 'Benefits Report',
      description: 'Employee benefits enrollment and costs',
      icon: CubeIcon,
      color: 'purple',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'department-costs',
      title: 'Department Costs',
      description: 'Payroll costs breakdown by department',
      icon: CreditCardIcon,
      color: 'orange',
      buttonColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'overtime-report',
      title: 'Overtime Report',
      description: 'Overtime hours and payments analysis',
      icon: ClockIcon,
      color: 'red',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    {
      id: 'employee-summary',
      title: 'Employee Summary',
      description: 'Individual employee payroll summaries',
      icon: UserGroupIcon,
      color: 'indigo',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Payroll Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg bg-${report.color}-100`}>
                  <report.icon className={`w-6 h-6 text-${report.color}-600`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              
              <button
                onClick={() => onGenerateReport(report.id)}
                className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md ${report.buttonColor} transition-colors`}
              >
                Generate Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
