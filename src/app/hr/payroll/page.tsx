'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from "@/components/layout/dashboard-layout"
import { PageHeader } from '@/components/ui/page-header'
import { PayrollMetrics } from '@/components/hr/payroll/PayrollMetrics'
import { PayrollTabs } from '@/components/hr/payroll/PayrollTabs'
import { PayrollReports } from '@/components/hr/payroll/PayrollReports'
import { PayrollSidebar } from '@/components/hr/payroll/PayrollSidebar'
import { PayrollActions } from '@/components/hr/payroll/PayrollActions'
import { EmployeePayrollTable } from '@/components/hr/payroll/EmployeePayrollTable'
import { CreatePeriodModal } from '@/components/hr/payroll/CreatePeriodModal'
import { ConfirmationModal } from '@/components/hr/payroll/ConfirmationModal'
import { usePayrollData } from '@/hooks/usePayrollData'
import { 
  PrinterIcon, 
  PlayIcon 
} from "@heroicons/react/24/outline"

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState('employee-payroll')
  const [activeSection, setActiveSection] = useState('payroll-overview')
  const [showCreatePeriod, setShowCreatePeriod] = useState(false)
  const [showCalculateModal, setShowCalculateModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const {
    data,
    selectedPeriod,
    setSelectedPeriod,
    processPayroll,
    generatePayslips,
    createPayPeriod,
    approvePayroll,
    exportData,
    generateReport,
    fetchPayrollData
  } = usePayrollData()

  // Map data to expected format
  const payrollData = {
    totalEmployees: data.employees?.length || 0,
    totalGross: data.totalGrossPay || 0,
    totalNet: data.totalNetPay || 0,
    totalDeductions: data.totalDeductions || 0,
    approvedCount: data.approvedCount || 0,
    pendingCount: (data.employees?.length || 0) - (data.approvedCount || 0)
  }
  const payrollRecords = Array.isArray(data.employees) ? data.employees : []
  const loading = data.loading
  const filteredRecords = payrollRecords.filter((record: any) => 
    record.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCalculatePayroll = async () => {
    if (selectedPeriod?.id) {
      await processPayroll(selectedPeriod.id)
    }
  }

  const handleApprovePayroll = async () => {
    if (selectedPeriod?.id) {
      await approvePayroll(selectedPeriod.id)
    }
  }

  const handleGeneratePayslips = async () => {
    if (selectedPeriod?.id) {
      await generatePayslips(selectedPeriod.id, selectedRecords)
    }
  }

  const handleSendPayslipEmails = () => {
    console.log('Send payslip emails not yet implemented')
  }

  const handleExportData = async () => {
    if (selectedPeriod?.id) {
      await exportData(selectedPeriod.id)
    }
  }

  const handleCreatePeriod = async (periodData: any) => {
    await createPayPeriod(periodData)
    setShowCreatePeriod(false)
  }

  useEffect(() => {
    fetchPayrollData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Error Loading Payroll Data</h3>
          <p>{data.error}</p>
        </div>
      </div>
    )
  }

  const handleRunPayroll = () => {
    if (selectedPeriod?.status === 'DRAFT') {
      setShowCalculateModal(true)
    } else if (selectedPeriod?.status === 'CALCULATED') {
      setShowApproveModal(true)
    }
  }

  const actions = (
    <div className="flex space-x-2">
      <button 
        onClick={() => handleExportData()}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <PrinterIcon className="h-4 w-4 mr-2" />
        Print Reports
      </button>
      <button 
        onClick={handleRunPayroll}
        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700"
      >
        <PlayIcon className="h-4 w-4 mr-2" />
        Run Payroll
      </button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <PayrollSidebar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 pl-8">
            <PageHeader 
              title="Payroll Management"
              subtitle="Manage employee payroll, compensation, and benefits"
              actions={actions}
              breadcrumbs={[
                { name: 'SIRTIS', href: '/' },
                { name: 'HR Management', href: '/hr' },
                { name: 'Payroll', href: '/hr/payroll' }
              ]}
            />

            {/* Content based on active section */}
            {activeSection === 'payroll-overview' && (
              <div className="space-y-6">
                {/* Payroll Metrics */}
                <PayrollMetrics payrollData={payrollData} selectedPeriod={selectedPeriod} />

                {/* Actions */}
                <PayrollActions 
                  selectedPeriod={selectedPeriod}
                  payrollData={payrollData}
                  onProcessPayroll={() => setShowCalculateModal(true)}
                  onGeneratePayslips={handleGeneratePayslips}
                  onExportData={handleExportData}
                  onCreatePeriod={() => setShowCreatePeriod(true)}
                  onApprovePayroll={() => setShowApproveModal(true)}
                />

                {/* Payroll Tabs */}
                <PayrollTabs 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab} 
                />

                {/* Tab Content */}
                <div className="mt-6">
                  {activeTab === 'employee-payroll' && (
                    <EmployeePayrollTable
                      employees={filteredRecords}
                      selectedPeriod={selectedPeriod}
                      onViewDetails={(employee: any) => console.log('View:', employee)}
                      onGeneratePayslip={(employee: any) => generatePayslips(selectedPeriod?.id, [employee.id])}
                      onEditPayroll={(employee: any) => console.log('Edit:', employee)}
                    />
                  )}

                  {activeTab === 'benefits-management' && (
                    <div className="bg-white rounded-lg shadow">
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Benefits Management</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">Health Insurance</h4>
                            <p className="text-sm text-gray-600">Medical, dental, and vision coverage</p>
                            <div className="mt-2">
                              <span className="text-green-600 font-semibold">324 enrolled</span>
                            </div>
                          </div>
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">NSSA Pension</h4>
                            <p className="text-sm text-gray-600">National Social Security Authority</p>
                            <div className="mt-2">
                              <span className="text-green-600 font-semibold">324 enrolled</span>
                            </div>
                          </div>
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">Transport Allowance</h4>
                            <p className="text-sm text-gray-600">Monthly transport benefit</p>
                            <div className="mt-2">
                              <span className="text-green-600 font-semibold">289 enrolled</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'payroll-reports' && (
                    <PayrollReports 
                      selectedPeriod={selectedPeriod}
                      payrollData={payrollData}
                      onGenerateReport={(reportType: string) => generateReport(reportType, selectedPeriod?.id)}
                    />
                  )}
                </div>
              </div>
            )}

            {activeSection === 'pay-periods' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Pay Periods Management</h2>
                    <button
                      onClick={() => setShowCreatePeriod(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Create New Period
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pay Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.periods.map((period: any) => (
                          <tr key={period.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{period.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(period.startDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(period.endDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{period.payDate ? new Date(period.payDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                period.status === 'approved' ? 'bg-green-100 text-green-800' :
                                period.status === 'processed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {period.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedPeriod(period)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Select
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'employees' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Employee Payroll Management</h2>
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <EmployeePayrollTable
                    employees={filteredRecords}
                    selectedPeriod={selectedPeriod}
                    onViewDetails={(employee: any) => console.log('View:', employee)}
                    onGeneratePayslip={(employee: any) => generatePayslips(selectedPeriod?.id, [employee.id])}
                    onEditPayroll={(employee: any) => console.log('Edit:', employee)}
                  />
                </div>
              </div>
            )}

            {activeSection === 'time-attendance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Time & Attendance</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900">Total Hours This Period</h3>
                      <p className="text-2xl font-bold text-blue-600">8,240</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-900">Overtime Hours</h3>
                      <p className="text-2xl font-bold text-green-600">312</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-yellow-900">Absence Hours</h3>
                      <p className="text-2xl font-bold text-yellow-600">48</p>
                    </div>
                  </div>

                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Time & Attendance Module</h3>
                    <p className="text-gray-600 mb-4">
                      This module will integrate with time tracking systems to automatically calculate work hours, overtime, and absences.
                    </p>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                      Configure Time Tracking
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'reports' && (
              <div className="space-y-6">
                <PayrollReports 
                  selectedPeriod={selectedPeriod}
                  payrollData={payrollData}
                  onGenerateReport={(reportType: string) => generateReport(reportType, selectedPeriod?.id)}
                />
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payroll Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Tax Settings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">PAYE Tax Rate</span>
                          <span className="text-sm font-medium">Variable (15-35%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">NSSA Rate</span>
                          <span className="text-sm font-medium">6.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Currency</span>
                          <span className="text-sm font-medium">USD</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Payroll Frequencies</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Monthly</span>
                          <span className="text-sm font-medium text-green-600">Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Bi-weekly</span>
                          <span className="text-sm font-medium text-gray-400">Inactive</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Weekly</span>
                          <span className="text-sm font-medium text-gray-400">Inactive</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Allowances</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Transport Allowance</span>
                          <span className="text-sm font-medium">$50/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Housing Allowance</span>
                          <span className="text-sm font-medium">$150/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Meal Allowance</span>
                          <span className="text-sm font-medium">$30/month</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Deductions</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Health Insurance</span>
                          <span className="text-sm font-medium">$25/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Union Dues</span>
                          <span className="text-sm font-medium">$10/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Loan Repayment</span>
                          <span className="text-sm font-medium">Variable</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <CreatePeriodModal
          isOpen={showCreatePeriod}
          onClose={() => setShowCreatePeriod(false)}
          onCreatePeriod={handleCreatePeriod}
        />

        <ConfirmationModal
          isOpen={showCalculateModal}
          onClose={() => setShowCalculateModal(false)}
          onConfirm={() => {
            handleCalculatePayroll()
            setShowCalculateModal(false)
          }}
          title="Calculate Payroll"
          message="This will calculate payroll for all employees in the selected period. Are you sure you want to continue?"
          type="warning"
        />

        <ConfirmationModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={() => {
            handleApprovePayroll()
            setShowApproveModal(false)
          }}
          title="Approve Payroll"
          message="This will approve the payroll for the selected period. Once approved, it cannot be modified. Are you sure?"
          type="success"
        />
      </div>
    </DashboardLayout>
  )
}
