'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExportButton } from '@/components/ui/export-button'
import { ImportButton } from '@/components/ui/import-button'
import { PrintButton } from '@/components/ui/print-button'
import { 
  DownloadButton,
  DownloadPDFButton,
  DownloadExcelButton,
  DownloadCSVButton,
  DownloadJSONButton 
} from '@/components/ui/download-button'
import { 
  FileText, 
  Users, 
  Building2, 
  TrendingUp,
  Download,
  Upload,
  Printer,
  CheckCircle
} from 'lucide-react'

export default function ExportImportTestPage() {
  const printRef = useRef<HTMLDivElement>(null)
  
  const [sampleData] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@saywhat.org',
      department: 'Information Technology',
      role: 'System Administrator',
      joinDate: '2023-01-15',
      status: 'Active',
      salary: 75000
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@saywhat.org',
      department: 'Human Resources',
      role: 'HR Manager',
      joinDate: '2022-08-20',
      status: 'Active',
      salary: 68000
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@saywhat.org',
      department: 'Finance',
      role: 'Financial Analyst',
      joinDate: '2023-03-10',
      status: 'Active',
      salary: 62000
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@saywhat.org',
      department: 'Operations',
      role: 'Operations Coordinator',
      joinDate: '2023-06-01',
      status: 'Active',
      salary: 55000
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie.wilson@saywhat.org',
      department: 'Information Technology',
      role: 'Software Developer',
      joinDate: '2023-09-15',
      status: 'Active',
      salary: 70000
    }
  ])

  const [importResults, setImportResults] = useState<any>(null)

  const handleImportComplete = (result: any) => {
    setImportResults(result)
    console.log('Import completed:', result)
  }

  const employeeHeaders = [
    'Name',
    'Email',
    'Department',
    'Role',
    'Join Date',
    'Status',
    'Salary'
  ]

  const templateFields = [
    'name',
    'email', 
    'department',
    'role',
    'joinDate',
    'status',
    'salary'
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">SAYWHAT SIRTIS</h1>
          </div>
          <h2 className="text-xl text-gray-600">Export, Import & Print Features Demo</h2>
          <p className="text-gray-500">
            Comprehensive testing page for all download, export, import, and print functionality
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{sampleData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Salary</p>
                  <p className="text-2xl font-bold text-gray-900">$66K</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Status</p>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export & Download Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Multi-Format Export Button */}
            <div className="space-y-3">
              <h4 className="font-medium">Multi-Format Export Button</h4>
              <p className="text-sm text-gray-600">
                Export data to multiple formats with a single component
              </p>
              <ExportButton
                data={{
                  headers: employeeHeaders,
                  rows: sampleData.map(emp => [
                    emp.name,
                    emp.email,
                    emp.department,
                    emp.role,
                    emp.joinDate,
                    emp.status,
                    emp.salary.toString()
                  ])
                }}
                filename="employee-export"
                title="Employee Data Export"
                showOptions={true}
              />
            </div>

            {/* Individual Download Buttons */}
            <div className="space-y-3">
              <h4 className="font-medium">Individual Format Download Buttons</h4>
              <p className="text-sm text-gray-600">
                Dedicated buttons for specific export formats
              </p>
              <div className="flex flex-wrap gap-3">
                <DownloadPDFButton
                  data={sampleData}
                  filename="employees-report"
                  title="Employee Report"
                  description="SAYWHAT Employee Directory"
                  headers={employeeHeaders}
                />
                <DownloadExcelButton
                  data={sampleData}
                  filename="employees-spreadsheet"
                  title="Employee Database"
                  headers={employeeHeaders}
                />
                <DownloadCSVButton
                  data={sampleData}
                  filename="employees-data"
                  headers={employeeHeaders}
                />
                <DownloadJSONButton
                  data={sampleData}
                  filename="employees-backup"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Import Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium">Employee Data Import</h4>
              <p className="text-sm text-gray-600">
                Import employee data from Excel, CSV, or JSON files with validation
              </p>
              <ImportButton
                onImportComplete={handleImportComplete}
                acceptedFormats={['excel', 'csv', 'json']}
                templateFields={templateFields}
                title="Import Employee Data"
                description="Upload employee data with automatic validation and error checking"
              />
            </div>

            {/* Import Results */}
            {importResults && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h5 className="font-medium mb-2">Last Import Results</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge 
                      variant={importResults.success ? 'default' : 'destructive'} 
                      className="ml-2"
                    >
                      {importResults.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Rows:</span>
                    <span className="font-medium ml-2">{importResults.totalRows}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Valid:</span>
                    <span className="font-medium ml-2 text-green-600">{importResults.validRows}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Skipped:</span>
                    <span className="font-medium ml-2 text-red-600">{importResults.skippedRows}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Print Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Printer className="h-5 w-5 mr-2" />
              Print Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium">Print Employee Report</h4>
              <p className="text-sm text-gray-600">
                Print reports with SAYWHAT branding, headers, and footers
              </p>
              <PrintButton targetRef={printRef as React.RefObject<HTMLElement>} title="Print Employee Report" />
              
              <div ref={printRef} className="hidden print:block">
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
                    <p className="text-gray-600">SAYWHAT Organization</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {employeeHeaders.map((header) => (
                            <th
                              key={header}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sampleData.map((employee) => (
                          <tr key={employee.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {employee.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {employee.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {employee.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {employee.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {employee.joinDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="default">{employee.status}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${employee.salary.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>Generated on {new Date().toLocaleDateString()}</p>
                    <p>SAYWHAT Integrated Real-Time Information System (SIRTIS)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Sample Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {employeeHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleData.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.joinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="default">{employee.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${employee.salary.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-gray-500">
            SAYWHAT Integrated Real-Time Information System (SIRTIS)
          </p>
          <p className="text-sm text-gray-400 mt-2">
            All export, import, and print features include SAYWHAT organizational branding
          </p>
        </div>
      </div>
    </div>
  )
}
