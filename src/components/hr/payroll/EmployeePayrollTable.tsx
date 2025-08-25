'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface EmployeePayroll {
  id: string
  employeeId: string
  name: string
  department: string
  position: string
  basicSalary: number
  allowances: number
  deductions: number
  netPay: number
  status: 'pending' | 'approved' | 'processed' | 'paid' | 'error'
  payDate?: string
  payPeriod: string
}

interface EmployeePayrollTableProps {
  payrolls?: EmployeePayroll[]
  onViewDetails?: (payrollId: string) => void
  onEditPayroll?: (payrollId: string) => void
  onDownloadPayslip?: (payrollId: string) => void
  onApprovePayroll?: (payrollId: string) => void
}

// Mock data
const mockPayrolls: EmployeePayroll[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'John Smith',
    department: 'Engineering',
    position: 'Senior Developer',
    basicSalary: 8500,
    allowances: 1200,
    deductions: 850,
    netPay: 8850,
    status: 'processed',
    payDate: '2024-01-31',
    payPeriod: 'January 2024'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Sarah Johnson',
    department: 'Marketing',
    position: 'Marketing Manager',
    basicSalary: 7200,
    allowances: 800,
    deductions: 650,
    netPay: 7350,
    status: 'approved',
    payPeriod: 'January 2024'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Michael Brown',
    department: 'Sales',
    position: 'Sales Representative',
    basicSalary: 5500,
    allowances: 1500,
    deductions: 520,
    netPay: 6480,
    status: 'pending',
    payPeriod: 'January 2024'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Emily Davis',
    department: 'HR',
    position: 'HR Specialist',
    basicSalary: 6000,
    allowances: 600,
    deductions: 580,
    netPay: 6020,
    status: 'error',
    payPeriod: 'January 2024'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'David Wilson',
    department: 'Finance',
    position: 'Accountant',
    basicSalary: 6500,
    allowances: 700,
    deductions: 620,
    netPay: 6580,
    status: 'paid',
    payDate: '2024-01-31',
    payPeriod: 'January 2024'
  }
]

export function EmployeePayrollTable({
  payrolls = mockPayrolls,
  onViewDetails,
  onEditPayroll,
  onDownloadPayslip,
  onApprovePayroll
}: EmployeePayrollTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  const filteredPayrolls = payrolls.filter(payroll => {
    const matchesSearch = payroll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.department.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || payroll.department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusBadge = (status: EmployeePayroll['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Approved</Badge>
      case 'processed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Processed</Badge>
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          Error
        </Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Get unique departments for filter
  const departments = Array.from(new Set(payrolls.map(p => p.department)))

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Employee Payroll</h2>
            <p className="text-sm text-gray-600">Manage individual employee payroll records</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <FunnelIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>Allowances</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pay Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayrolls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No payroll records found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayrolls.map((payroll) => (
                <TableRow key={payroll.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{payroll.name}</div>
                      <div className="text-sm text-gray-500">{payroll.employeeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm text-gray-900">{payroll.department}</div>
                      <div className="text-sm text-gray-500">{payroll.position}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(payroll.basicSalary)}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(payroll.allowances)}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {formatCurrency(payroll.deductions)}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {formatCurrency(payroll.netPay)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payroll.status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {payroll.payDate || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails?.(payroll.id)}
                        className="h-8 w-8 p-0"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      
                      {payroll.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditPayroll?.(payroll.id)}
                          className="h-8 w-8 p-0"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {(payroll.status === 'processed' || payroll.status === 'paid') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDownloadPayslip?.(payroll.id)}
                          className="h-8 w-8 p-0"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {payroll.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => onApprovePayroll?.(payroll.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3"
                        >
                          Process
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Employees:</span>
            <span className="ml-2 font-medium">{filteredPayrolls.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Basic Salary:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(filteredPayrolls.reduce((sum, p) => sum + p.basicSalary, 0))}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Allowances:</span>
            <span className="ml-2 font-medium text-green-600">
              {formatCurrency(filteredPayrolls.reduce((sum, p) => sum + p.allowances, 0))}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Net Pay:</span>
            <span className="ml-2 font-semibold">
              {formatCurrency(filteredPayrolls.reduce((sum, p) => sum + p.netPay, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
