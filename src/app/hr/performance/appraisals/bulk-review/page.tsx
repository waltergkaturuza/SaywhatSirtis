"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon,
  EyeIcon,
  PencilIcon
} from "@heroicons/react/24/outline"
import Link from "next/link"

interface BulkAppraisal {
  id: number
  employeeName: string
  employeeId: string
  department: string
  position: string
  period: string
  overallRating: number | null
  status: 'draft' | 'pending-review' | 'in-progress' | 'completed' | 'overdue'
  supervisor: string
  dueDate: string
  lastUpdated: string
  completionPercentage: number
}

// Sample data for bulk review
const sampleAppraisals: BulkAppraisal[] = [
  {
    id: 1,
    employeeName: "John Doe",
    employeeId: "EMP001",
    department: "Operations",
    position: "Operations Manager",
    period: "Q1 2024",
    overallRating: 4.5,
    status: "completed",
    supervisor: "Mark Wilson",
    dueDate: "2024-03-31",
    lastUpdated: "2024-03-28",
    completionPercentage: 100
  },
  {
    id: 2,
    employeeName: "Michael Adebayo",
    employeeId: "EMP002",
    department: "Healthcare",
    position: "Healthcare Coordinator",
    period: "Q1 2024",
    overallRating: null,
    status: "in-progress",
    supervisor: "Dr. Amina Hassan",
    dueDate: "2024-04-15",
    lastUpdated: "2024-04-02",
    completionPercentage: 65
  },
  {
    id: 3,
    employeeName: "Sarah Johnson",
    employeeId: "EMP003",
    department: "Education",
    position: "Education Program Manager",
    period: "Q1 2024",
    overallRating: null,
    status: "pending-review",
    supervisor: "Prof. Ibrahim Musa",
    dueDate: "2024-04-10",
    lastUpdated: "2024-04-01",
    completionPercentage: 90
  },
  {
    id: 4,
    employeeName: "Fatima Al-Zahra",
    employeeId: "EMP004",
    department: "Water & Sanitation",
    position: "WASH Specialist",
    period: "Q1 2024",
    overallRating: null,
    status: "overdue",
    supervisor: "Eng. Hassan Ali",
    dueDate: "2024-03-25",
    lastUpdated: "2024-03-20",
    completionPercentage: 30
  },
  {
    id: 5,
    employeeName: "Ahmed Hassan",
    employeeId: "EMP005",
    department: "Nutrition",
    position: "Nutrition Coordinator",
    period: "Q1 2024",
    overallRating: null,
    status: "draft",
    supervisor: "Dr. Khadija Omar",
    dueDate: "2024-04-20",
    lastUpdated: "2024-03-15",
    completionPercentage: 15
  }
]

export default function BulkReviewPage() {
  const [selectedAppraisals, setSelectedAppraisals] = useState<number[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('dueDate')

  const metadata = {
    title: "Bulk Review - Performance Appraisals",
    description: "Review multiple performance appraisals simultaneously",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Appraisals", href: "/hr/performance/appraisals" },
      { name: "Bulk Review" }
    ]
  }

  const filteredAppraisals = sampleAppraisals.filter(appraisal => {
    if (filterStatus === 'all') return true
    return appraisal.status === filterStatus
  })

  const sortedAppraisals = [...filteredAppraisals].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case 'employee':
        return a.employeeName.localeCompare(b.employeeName)
      case 'department':
        return a.department.localeCompare(b.department)
      case 'completion':
        return b.completionPercentage - a.completionPercentage
      default:
        return 0
    }
  })

  const handleSelectAll = () => {
    if (selectedAppraisals.length === sortedAppraisals.length) {
      setSelectedAppraisals([])
    } else {
      setSelectedAppraisals(sortedAppraisals.map(a => a.id))
    }
  }

  const handleSelectAppraisal = (id: number) => {
    if (selectedAppraisals.includes(id)) {
      setSelectedAppraisals(selectedAppraisals.filter(selectedId => selectedId !== id))
    } else {
      setSelectedAppraisals([...selectedAppraisals, id])
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-blue-600" />
      case 'pending-review':
        return <DocumentCheckIcon className="h-5 w-5 text-yellow-600" />
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending-review':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on appraisals:`, selectedAppraisals)
    // Here you would implement the bulk action
  }

  const statusCounts = {
    all: sampleAppraisals.length,
    draft: sampleAppraisals.filter(a => a.status === 'draft').length,
    'in-progress': sampleAppraisals.filter(a => a.status === 'in-progress').length,
    'pending-review': sampleAppraisals.filter(a => a.status === 'pending-review').length,
    completed: sampleAppraisals.filter(a => a.status === 'completed').length,
    overdue: sampleAppraisals.filter(a => a.status === 'overdue').length,
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DocumentCheckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bulk Review</h1>
                <p className="text-gray-600">Review and manage multiple performance appraisals</p>
              </div>
            </div>
            
            {selectedAppraisals.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedAppraisals.length} selected
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleBulkAction('approve')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Approve Selected
                  </button>
                  <button 
                    onClick={() => handleBulkAction('reject')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Send Back
                  </button>
                  <button 
                    onClick={() => handleBulkAction('export')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'overdue', label: 'Overdue', count: statusCounts.overdue },
              { key: 'pending-review', label: 'Pending Review', count: statusCounts['pending-review'] },
              { key: 'in-progress', label: 'In Progress', count: statusCounts['in-progress'] },
              { key: 'completed', label: 'Completed', count: statusCounts.completed },
              { key: 'draft', label: 'Draft', count: statusCounts.draft },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                  filterStatus === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  filterStatus === filter.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedAppraisals.length === sortedAppraisals.length && sortedAppraisals.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label className="text-sm text-gray-700">Select All</label>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="employee">Employee Name</option>
                  <option value="department">Department</option>
                  <option value="completion">Completion %</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Appraisals Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAppraisals.map((appraisal) => (
                  <tr key={appraisal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAppraisals.includes(appraisal.id)}
                        onChange={() => handleSelectAppraisal(appraisal.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appraisal.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">{appraisal.employeeId}</div>
                        <div className="text-sm text-gray-500">{appraisal.position}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appraisal.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appraisal.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appraisal.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appraisal.status)}`}>
                          {appraisal.status.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(appraisal.completionPercentage)}`}
                          style={{ width: `${appraisal.completionPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {appraisal.completionPercentage}% complete
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(appraisal.dueDate).toLocaleDateString()}</div>
                      {appraisal.status === 'overdue' && (
                        <div className="text-red-600 text-xs">Overdue</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appraisal.overallRating ? (
                        <div className="flex items-center">
                          <span className="font-semibold">{appraisal.overallRating}</span>
                          <span className="text-gray-500">/5</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/hr/performance/appraisals/${appraisal.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link 
                          href={`/hr/performance/appraisals/${appraisal.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts['in-progress']}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DocumentCheckIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts['pending-review']}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.overdue}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
