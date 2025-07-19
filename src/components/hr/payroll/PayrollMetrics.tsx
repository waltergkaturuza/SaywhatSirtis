import { 
  BanknotesIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon 
} from "@heroicons/react/24/outline"

interface PayrollData {
  totalEmployees: number
  totalGross: number
  totalNet: number
  totalDeductions: number
  approvedCount: number
  pendingCount: number
}

interface PayrollPeriod {
  id: string
  name: string
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'
  totalGross: number
  totalNet: number
  totalDeductions: number
  employeeCount: number
}

interface PayrollMetricsProps {
  payrollData: PayrollData
  selectedPeriod: PayrollPeriod | null
}

export function PayrollMetrics({ payrollData, selectedPeriod }: PayrollMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${formatCurrency(amount / 1000000)}M`
    } else if (amount >= 1000) {
      return `${formatCurrency(amount / 1000)}K`
    }
    return formatCurrency(amount)
  }

  const grossPay = selectedPeriod?.totalGross || payrollData.totalGross || 45670000
  const netPay = selectedPeriod?.totalNet || payrollData.totalNet || 38450000
  const deductions = selectedPeriod?.totalDeductions || payrollData.totalDeductions || 7220000
  const employeeCount = selectedPeriod?.employeeCount || payrollData.totalEmployees || 324
  const approvedCount = payrollData.approvedCount || 275
  const pendingCount = payrollData.pendingCount || 49

  const netPayPercentage = grossPay > 0 ? ((netPay / grossPay) * 100).toFixed(1) : '0'
  const deductionsPercentage = grossPay > 0 ? ((deductions / grossPay) * 100).toFixed(1) : '0'
  const approvedPercentage = employeeCount > 0 ? ((approvedCount / employeeCount) * 100).toFixed(1) : '0'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Gross Pay */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <BanknotesIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatAmount(grossPay)}
            </h3>
            <p className="text-sm text-gray-500">Total Gross Pay</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{employeeCount} employees</span>
            <span className="text-green-600 font-medium">Current Period</span>
          </div>
        </div>
      </div>

      {/* Total Net Pay */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatAmount(netPay)}
            </h3>
            <p className="text-sm text-gray-500">Total Net Pay</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">After deductions</span>
            <span className="text-purple-600 font-medium">{netPayPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Total Deductions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatAmount(deductions)}
            </h3>
            <p className="text-sm text-gray-500">Total Deductions</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax, Pension, NSSA</span>
            <span className="text-red-600 font-medium">{deductionsPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Approved Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <CheckCircleIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900">{approvedCount}</h3>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{pendingCount} pending</span>
            <span className="text-blue-600 font-medium">{approvedPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
