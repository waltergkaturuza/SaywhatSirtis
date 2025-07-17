"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import {
  BanknotesIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserIcon,
  CreditCardIcon,
  PrinterIcon
} from "@heroicons/react/24/outline"

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState("payroll")
  const [selectedPeriod, setSelectedPeriod] = useState("current")

  const metadata = {
    title: "Payroll Management",
    description: "Manage employee payroll, compensation, and benefits",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Payroll" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <PrinterIcon className="h-4 w-4 mr-2" />
        Print Reports
      </button>
      <Link href="/hr/payroll/run">
        <button className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Run Payroll
        </button>
      </Link>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Employees</span>
            <span className="font-semibold text-blue-600">324</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Gross Pay</span>
            <span className="font-semibold text-green-600">₦45,670,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Net Pay</span>
            <span className="font-semibold text-purple-600">₦38,450,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Deductions</span>
            <span className="font-semibold text-red-600">₦7,220,000</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Period</h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="current">January 2024</option>
          <option value="previous">December 2023</option>
          <option value="november">November 2023</option>
          <option value="october">October 2023</option>
        </select>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Approved</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
              <span className="text-xs text-gray-500">85%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pending Review</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "10%" }}></div>
              </div>
              <span className="text-xs text-gray-500">10%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Requires Action</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "5%" }}></div>
              </div>
              <span className="text-xs text-gray-500">5%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/hr/payroll/run" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Run Payroll
          </Link>
          <Link href="/hr/payroll/approve" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Approve Payroll
          </Link>
          <Link href="/hr/payroll/benefits" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Manage Benefits
          </Link>
          <Link href="/hr/payroll/reports" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Generate Reports
          </Link>
        </div>
      </div>
    </div>
  )

  const payrollData = [
    {
      id: 1,
      employeeName: "Sarah Johnson",
      employeeId: "EMP001",
      department: "Operations",
      position: "Operations Manager",
      basicSalary: 850000,
      allowances: 150000,
      overtime: 25000,
      grossPay: 1025000,
      taxDeduction: 123000,
      pensionDeduction: 76000,
      nhisDeduction: 15000,
      totalDeductions: 214000,
      netPay: 811000,
      status: "approved",
      paymentMethod: "Bank Transfer",
      bankAccount: "0123456789"
    },
    {
      id: 2,
      employeeName: "Michael Adebayo",
      employeeId: "EMP002",
      department: "Healthcare",
      position: "Healthcare Coordinator",
      basicSalary: 650000,
      allowances: 100000,
      overtime: 0,
      grossPay: 750000,
      taxDeduction: 75000,
      pensionDeduction: 52500,
      nhisDeduction: 15000,
      totalDeductions: 142500,
      netPay: 607500,
      status: "pending",
      paymentMethod: "Bank Transfer",
      bankAccount: "0987654321"
    },
    {
      id: 3,
      employeeName: "David Okonkwo",
      employeeId: "EMP004",
      department: "Finance",
      position: "Financial Analyst",
      basicSalary: 700000,
      allowances: 120000,
      overtime: 15000,
      grossPay: 835000,
      taxDeduction: 91850,
      pensionDeduction: 58450,
      nhisDeduction: 15000,
      totalDeductions: 165300,
      netPay: 669700,
      status: "approved",
      paymentMethod: "Bank Transfer",
      bankAccount: "1122334455"
    },
    {
      id: 4,
      employeeName: "Fatima Bello",
      employeeId: "EMP005",
      department: "HR",
      position: "HR Specialist",
      basicSalary: 500000,
      allowances: 80000,
      overtime: 10000,
      grossPay: 590000,
      taxDeduction: 47200,
      pensionDeduction: 41300,
      nhisDeduction: 15000,
      totalDeductions: 103500,
      netPay: 486500,
      status: "requires-action",
      paymentMethod: "Bank Transfer",
      bankAccount: "5566778899"
    }
  ]

  const benefitsData = [
    {
      id: 1,
      benefitType: "Health Insurance",
      description: "Comprehensive health coverage for employees and family",
      eligibility: "All full-time employees",
      employerContribution: "80%",
      employeeContribution: "20%",
      enrolledEmployees: 298,
      totalEmployees: 324,
      monthlyPremium: 25000,
      status: "active"
    },
    {
      id: 2,
      benefitType: "Pension Plan",
      description: "Contributory pension scheme",
      eligibility: "All employees",
      employerContribution: "10%",
      employeeContribution: "8%",
      enrolledEmployees: 324,
      totalEmployees: 324,
      monthlyPremium: 0,
      status: "active"
    },
    {
      id: 3,
      benefitType: "Life Insurance",
      description: "Group life insurance coverage",
      eligibility: "All full-time employees",
      employerContribution: "100%",
      employeeContribution: "0%",
      enrolledEmployees: 280,
      totalEmployees: 324,
      monthlyPremium: 5000,
      status: "active"
    },
    {
      id: 4,
      benefitType: "Housing Allowance",
      description: "Monthly housing allowance",
      eligibility: "Senior staff and above",
      employerContribution: "100%",
      employeeContribution: "0%",
      enrolledEmployees: 45,
      totalEmployees: 324,
      monthlyPremium: 150000,
      status: "active"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "requires-action":
        return "bg-red-100 text-red-800"
      case "paid":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const tabs = [
    { id: "payroll", name: "Employee Payroll", icon: BanknotesIcon },
    { id: "benefits", name: "Benefits Management", icon: CreditCardIcon },
    { id: "reports", name: "Payroll Reports", icon: ChartBarIcon }
  ]

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
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
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">275</h3>
                <p className="text-sm text-gray-500">Approved</p>
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

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "payroll" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Employee Payroll - January 2024</h3>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Departments</option>
                      <option>Operations</option>
                      <option>Healthcare</option>
                      <option>Finance</option>
                      <option>HR</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Status</option>
                      <option>Approved</option>
                      <option>Pending</option>
                      <option>Requires Action</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allowances</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payrollData.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{employee.employeeName}</div>
                                <div className="text-sm text-gray-500">{employee.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(employee.basicSalary)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(employee.allowances)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(employee.overtime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatCurrency(employee.grossPay)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {formatCurrency(employee.totalDeductions)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                            {formatCurrency(employee.netPay)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                              {employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link href={`/hr/payroll/${employee.id}`}>
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </Link>
                              <Link href={`/hr/payroll/${employee.id}/edit`}>
                                <button className="text-gray-600 hover:text-gray-900">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "benefits" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Benefits Management</h3>
                  <Link href="/hr/payroll/benefits/add">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                      Add Benefit
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {benefitsData.map((benefit) => (
                    <div key={benefit.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{benefit.benefitType}</h4>
                          <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          benefit.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {benefit.status.charAt(0).toUpperCase() + benefit.status.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Eligibility:</span>
                            <div className="text-gray-900">{benefit.eligibility}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Monthly Premium:</span>
                            <div className="text-gray-900">
                              {benefit.monthlyPremium > 0 ? formatCurrency(benefit.monthlyPremium) : 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Employer Contribution:</span>
                            <div className="text-green-600 font-medium">{benefit.employerContribution}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Employee Contribution:</span>
                            <div className="text-blue-600 font-medium">{benefit.employeeContribution}</div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Enrollment</span>
                            <span className="font-medium">{benefit.enrolledEmployees}/{benefit.totalEmployees}</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(benefit.enrolledEmployees / benefit.totalEmployees) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round((benefit.enrolledEmployees / benefit.totalEmployees) * 100)}% participation
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <Link href={`/hr/payroll/benefits/${benefit.id}`}>
                            <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
                          </Link>
                          <Link href={`/hr/payroll/benefits/${benefit.id}/edit`}>
                            <button className="text-sm text-gray-600 hover:text-gray-800">Edit</button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Payroll Reports</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border rounded-lg p-6 hover:shadow-md cursor-pointer">
                    <div className="flex items-center mb-4">
                      <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                      <h4 className="font-semibold text-gray-900">Payroll Summary</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Comprehensive payroll summary for the current period</p>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
                      Generate Report
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-md cursor-pointer">
                    <div className="flex items-center mb-4">
                      <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
                      <h4 className="font-semibold text-gray-900">Tax Report</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Tax deductions and remittances report</p>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
                      Generate Report
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-md cursor-pointer">
                    <div className="flex items-center mb-4">
                      <CreditCardIcon className="h-8 w-8 text-purple-600 mr-3" />
                      <h4 className="font-semibold text-gray-900">Benefits Report</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Employee benefits enrollment and costs</p>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
                      Generate Report
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-md cursor-pointer">
                    <div className="flex items-center mb-4">
                      <BanknotesIcon className="h-8 w-8 text-yellow-600 mr-3" />
                      <h4 className="font-semibold text-gray-900">Department Costs</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Payroll costs breakdown by department</p>
                    <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md text-sm hover:bg-yellow-700">
                      Generate Report
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-md cursor-pointer">
                    <div className="flex items-center mb-4">
                      <ClockIcon className="h-8 w-8 text-red-600 mr-3" />
                      <h4 className="font-semibold text-gray-900">Overtime Report</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Overtime hours and payments analysis</p>
                    <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md text-sm hover:bg-red-700">
                      Generate Report
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-md cursor-pointer">
                    <div className="flex items-center mb-4">
                      <UserIcon className="h-8 w-8 text-indigo-600 mr-3" />
                      <h4 className="font-semibold text-gray-900">Employee Summary</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Individual employee payroll summaries</p>
                    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm hover:bg-indigo-700">
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
