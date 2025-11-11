'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ModulePage } from "@/components/layout/enhanced-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DocumentTextIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FolderIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  TagIcon,
  EyeIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: any
  color: string
  fields: string[]
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'comprehensive',
    name: 'Comprehensive Document Report',
    description: 'Complete repository overview with all metrics, categories, departments, and user activity',
    icon: DocumentChartBarIcon,
    color: 'blue',
    fields: ['All documents', 'Categories', 'Departments', 'Security classifications', 'User activity', 'Time series data']
  },
  {
    id: 'category-summary',
    name: 'Category Summary Report',
    description: 'Breakdown of documents by category with size and usage statistics',
    icon: FolderIcon,
    color: 'green',
    fields: ['Document counts by category', 'Storage usage', 'Average file sizes', 'Top categories']
  },
  {
    id: 'department-analysis',
    name: 'Department Analysis Report',
    description: 'Department-wise document distribution, usage, and contributor analysis',
    icon: BuildingOfficeIcon,
    color: 'purple',
    fields: ['Documents per department', 'Active users', 'Views and downloads', 'Storage by department']
  },
  {
    id: 'security-audit',
    name: 'Security Classification Audit',
    description: 'Security and compliance report with classification distribution',
    icon: ShieldCheckIcon,
    color: 'red',
    fields: ['Classification breakdown', 'Public documents', 'Confidential documents', 'Access controls']
  },
  {
    id: 'activity-report',
    name: 'User Activity Report',
    description: 'Top contributors, upload trends, and engagement metrics',
    icon: UserGroupIcon,
    color: 'orange',
    fields: ['Top uploaders', 'Most viewed documents', 'Download statistics', 'User engagement scores']
  },
  {
    id: 'time-based',
    name: 'Time-Based Analytics',
    description: 'Monthly/quarterly trends in uploads, views, and downloads',
    icon: CalendarIcon,
    color: 'teal',
    fields: ['Upload trends', 'View trends', 'Download trends', 'Growth analysis']
  },
  {
    id: 'storage-report',
    name: 'Storage & Capacity Report',
    description: 'Storage utilization, largest files, and capacity planning',
    icon: CloudArrowDownIcon,
    color: 'indigo',
    fields: ['Total storage', 'Largest files', 'Storage by department', 'Capacity projections']
  },
  {
    id: 'favorites-shares',
    name: 'Engagement Report',
    description: 'Most favorited and shared documents analysis',
    icon: CheckCircleIcon,
    color: 'pink',
    fields: ['Favorite documents', 'Shared documents', 'Collaboration metrics', 'Popular content']
  }
]

export default function DocumentReports() {
  const { data: session } = useSession()
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('12months')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('xlsx')

  const generateReport = async (templateId: string) => {
    try {
      setGenerating(templateId)

      const response = await fetch(
        `/api/documents/reports/generate?template=${templateId}&period=${selectedPeriod}&department=${selectedDepartment}&format=${selectedFormat}`,
        { method: 'POST' }
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${templateId}-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.${selectedFormat}`
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      } else {
        alert('Failed to generate report')
      }
    } catch (err) {
      console.error('Report generation error:', err)
      alert('Failed to generate report')
    } finally {
      setGenerating(null)
    }
  }

  const metadata = {
    title: "Generate Reports",
    description: "Create reports",
    breadcrumbs: [
      { name: "SIRTIS", href: "/" },
      { name: "Documents", href: "/documents" },
      { name: "Reports" }
    ]
  }

  const colorClasses: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-200', iconBg: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200', iconBg: 'bg-purple-100' },
    red: { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-200', iconBg: 'bg-red-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-200', iconBg: 'bg-orange-100' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-900', border: 'border-teal-200', iconBg: 'bg-teal-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', iconBg: 'bg-indigo-100' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-900', border: 'border-pink-200', iconBg: 'bg-pink-100' }
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="space-y-6">
        {/* Report Configuration */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900">
              <DocumentChartBarIcon className="h-6 w-6 mr-2" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="12months">Last 12 Months</option>
                  <option value="24months">Last 2 Years</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
                >
                  <option value="all">All Departments</option>
                  <option value="Programs">Programs</option>
                  <option value="Human Resource Management">Human Resource Management</option>
                  <option value="Finance and Administration">Finance and Administration</option>
                  <option value="Communications">Communications</option>
                  <option value="Research and Development">Research and Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Available Report Templates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select a report template to generate detailed insights about your document repository
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => {
              const colors = colorClasses[template.color] || colorClasses.blue
              const TemplateIcon = template.icon
              const isGenerating = generating === template.id

              return (
                <Card 
                  key={template.id} 
                  className={`${colors.bg} ${colors.border} border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`${colors.iconBg} p-3 rounded-xl`}>
                          <TemplateIcon className={`h-6 w-6 ${colors.text}`} />
                        </div>
                        <div>
                          <CardTitle className={`text-lg ${colors.text}`}>
                            {template.name}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">
                      {template.description}
                    </p>

                    {/* Included Fields */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Includes:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={() => generateReport(template.id)}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2 animate-bounce" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center text-cyan-900">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Quick Export Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => generateReport('comprehensive')}
                disabled={generating !== null}
                className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-cyan-200 hover:border-cyan-400"
              >
                <TableCellsIcon className="h-8 w-8 text-cyan-600" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Excel Export</h4>
                  <p className="text-xs text-gray-600">Full data spreadsheet</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedFormat('pdf')
                  generateReport('comprehensive')
                }}
                disabled={generating !== null}
                className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-cyan-200 hover:border-cyan-400"
              >
                <DocumentArrowDownIcon className="h-8 w-8 text-red-600" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">PDF Report</h4>
                  <p className="text-xs text-gray-600">Formatted document</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedFormat('csv')
                  generateReport('comprehensive')
                }}
                disabled={generating !== null}
                className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-cyan-200 hover:border-cyan-400"
              >
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">CSV Export</h4>
                  <p className="text-xs text-gray-600">Raw data file</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Report History (Optional - can be implemented later) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
                Recent Reports
              </CardTitle>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Report history and scheduling features will be available soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help & Tips */}
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-900">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Report Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-yellow-900">
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Excel format</strong> provides the most detailed data with multiple sheets for different metrics
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>PDF format</strong> is ideal for sharing formatted reports with stakeholders
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>CSV format</strong> is best for importing data into other analysis tools
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p>
                  Filter by <strong>department</strong> to generate focused reports for specific teams
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePage>
  )
}

