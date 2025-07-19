"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import {
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  CurrencyDollarIcon,
  UserIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  PlayIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon
} from "@heroicons/react/24/outline"

interface PayrollPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  payDate: string
  status: string
  totalEmployees: number
  totalGrossPay: number
  totalNetPay: number
  totalDeductions: number
}

interface PayrollRecord {
  id: string
  employee: {
    id: string
    employeeId: string
    firstName: string
    lastName: string
    position: string
    department: {
      name: string
    }
  }
  basicSalary: number
  totalAllowances: number
  overtimePay: number
  grossPay: number
  totalDeductions: number
  netPay: number
  status: string
  payslip?: {
    id: string
    payslipNumber: string
    fileName?: string
    filePath?: string
    emailSent: boolean
  }
}

export default function PayrollPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null)
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreatePeriod, setShowCreatePeriod] = useState(false)

  const metadata = {
    title: "Payroll Management",
    description: "Comprehensive payroll management with payslip generation and pay date tracking",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Payroll" }
    ]
  }

  useEffect(() => {
    fetchPayrollData()
  }, [])

  useEffect(() => {
    if (selectedPeriod) {
      fetchPayrollRecords(selectedPeriod.id)
    }
  }, [selectedPeriod])

  const fetchPayrollData = async () => {
    try {
      setLoading(true)
      // Mock data for now - will be replaced with real API call
      const mockPeriods: PayrollPeriod[] = [
        {
          id: "1",
          name: "January 2024",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          payDate: "2024-02-05",
          status: "PAID",
          totalEmployees: 324,
          totalGrossPay: 45670000,
          totalNetPay: 38450000,
          totalDeductions: 7220000
        },
        {
          id: "2",
          name: "February 2024",
          startDate: "2024-02-01",
          endDate: "2024-02-29",
          payDate: "2024-03-05",
          status: "APPROVED",
          totalEmployees: 324,
          totalGrossPay: 45670000,
          totalNetPay: 38450000,
          totalDeductions: 7220000
        },
        {
          id: "3",
          name: "March 2024",
          startDate: "2024-03-01",
          endDate: "2024-03-31",
          payDate: "2024-04-05",
          status: "CALCULATED",
          totalEmployees: 324,
          totalGrossPay: 45670000,
          totalNetPay: 38450000,
          totalDeductions: 7220000
        }
      ]
      setPeriods(mockPeriods)
      setSelectedPeriod(mockPeriods[0])
    } catch (error) {
      console.error('Error fetching payroll data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayrollRecords = async (periodId: string) => {
    try {
      setLoading(true)
      // Mock data for now - will be replaced with real API call
      const mockRecords: PayrollRecord[] = [
        {
          id: "1",
          employee: {
            id: "1",
            employeeId: "EMP001",
            firstName: "Sarah",
            lastName: "Johnson",
            position: "Operations Manager",
            department: { name: "Operations" }
          },
          basicSalary: 850000,
          totalAllowances: 150000,
          overtimePay: 25000,
          grossPay: 1025000,
          totalDeductions: 214000,
          netPay: 811000,
          status: "APPROVED",
          payslip: {
            id: "1",
            payslipNumber: "PS-EMP001-JAN24-001",
            fileName: "payslip_PS-EMP001-JAN24-001.pdf",
            filePath: "/payslips/payslip_PS-EMP001-JAN24-001.pdf",
            emailSent: true
          }
        },
        {
          id: "2",
          employee: {
            id: "2",
            employeeId: "EMP002",
            firstName: "Michael",
            lastName: "Adebayo",
            position: "Healthcare Coordinator",
            department: { name: "Healthcare" }
          },
          basicSalary: 650000,
          totalAllowances: 100000,
          overtimePay: 0,
          grossPay: 750000,
          totalDeductions: 142500,
          netPay: 607500,
          status: "CALCULATED"
        }
      ]
      setPayrollRecords(mockRecords)
    } catch (error) {
      console.error('Error fetching payroll records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePeriod = async (formData: any) => {
    try {
      alert('Payroll period created successfully!')
      setShowCreatePeriod(false)
      fetchPayrollData()
    } catch (error) {
      console.error('Error creating payroll period:', error)
      alert('An error occurred while creating payroll period. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "calculated":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const actions = (
    <div className="flex space-x-2">
      <button 
        onClick={() => setShowCreatePeriod(true)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <CalendarIcon className="h-4 w-4 mr-2" />
        New Period
      </button>
      <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Generate Payslips
      </button>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <PrinterIcon className="h-4 w-4 mr-2" />
        Export Reports
      </button>
    </div>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Periods</h3>
        <div className="space-y-2">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedPeriod?.id === period.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{period.name}</div>
              <div className="text-sm text-gray-500">Pay Date: {formatDate(period.payDate)}</div>
              <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(period.status)}`}>
                {period.status}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedPeriod && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Employees</span>
              <span className="font-semibold text-blue-600">{selectedPeriod.totalEmployees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Gross Pay</span>
              <span className="font-semibold text-green-600">{formatCurrency(selectedPeriod.totalGrossPay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Net Pay</span>
              <span className="font-semibold text-purple-600">{formatCurrency(selectedPeriod.totalNetPay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Deductions</span>
              <span className="font-semibold text-red-600">{formatCurrency(selectedPeriod.totalDeductions)}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Payroll Reports
          </button>
          <button className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Tax Calculations
          </button>
          <button className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Employee Summaries
          </button>
          <button className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Bank Export
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <ModulePage metadata={metadata} actions={actions} sidebar={sidebar}>
      <div className="space-y-6">
        {showCreatePeriod && (
          <CreatePeriodModal
            onClose={() => setShowCreatePeriod(false)}
            onSubmit={handleCreatePeriod}
          />
        )}

        {/* Payroll Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">₦45.67M</h3>
                <p className="text-sm text-gray-500">Total Gross Pay</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">324 employees</span>
                <span className="text-green-600 font-medium">Current Period</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">₦38.45M</h3>
                <p className="text-sm text-gray-500">Total Net Pay</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">After deductions</span>
                <span className="text-purple-600 font-medium">84.2%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">₦7.22M</h3>
                <p className="text-sm text-gray-500">Total Deductions</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax, Pension, NHIS</span>
                <span className="text-red-600 font-medium">15.8%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">275</h3>
                <p className="text-sm text-gray-500">Payslips Generated</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">49 pending</span>
                <span className="text-blue-600 font-medium">84.9%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Records Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPeriod ? `${selectedPeriod.name} - Employee Payroll` : 'Select a payroll period'}
              </h3>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="calculated">Calculated</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading payroll data...</p>
              </div>
            ) : payrollRecords.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payslip</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrollRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {record.employee.firstName} {record.employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.employee.employeeId} • {record.employee.department.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(record.basicSalary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(record.totalAllowances)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(record.overtimePay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(record.grossPay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(record.totalDeductions)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {formatCurrency(record.netPay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.payslip ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-600">✓ Generated</span>
                            <a
                              href={record.payslip.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </a>
                            {record.payslip.emailSent && (
                              <EnvelopeIcon className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        ) : (
                          <button className="text-sm text-blue-600 hover:text-blue-900">
                            Generate
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">
                  {selectedPeriod ? 'No payroll records found for this period.' : 'Please select a payroll period to view records.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}

// Create Period Modal Component
function CreatePeriodModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    payDate: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Payroll Period</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., January 2024"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pay Date
            </label>
            <input
              type="date"
              value={formData.payDate}
              onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create Period
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
