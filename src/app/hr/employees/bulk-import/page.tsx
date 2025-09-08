"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ModulePage } from "@/components/layout/enhanced-layout"
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline"

export default function BulkImport() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/hr/employees/bulk-import')
      return
    }

    // Check HR permissions
    if (session?.user) {
      const hasPermission = session.user?.permissions?.includes('hr.create') ||
                           session.user?.permissions?.includes('hr.full_access') ||
                           session.user?.roles?.includes('admin') ||
                           session.user?.roles?.includes('hr_manager')
      
      if (!hasPermission) {
        router.push('/')
        return
      }
    }

    setLoading(false)
  }, [session, status, router])

  const downloadTemplate = () => {
    const headers = [
      "firstName",
      "lastName", 
      "email",
      "department",
      "position",
      "status",
      "hireDate",
      "phone",
      "address"
    ]
    
    const sampleData = [
      "John,Doe,john.doe@example.com,Programs,Program Officer,ACTIVE,2025-01-15,+256700000000,Kampala",
      "Jane,Smith,jane.smith@example.com,Human Resources,HR Specialist,ACTIVE,2025-02-01,+256700000001,Entebbe"
    ]
    
    const csvContent = [headers.join(","), ...sampleData].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "employee-import-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        alert("Please select a CSV file")
        return
      }
      setFile(selectedFile)
      setResults(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/hr/employees/bulk-import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (response.ok) {
        setResults(result)
      } else {
        alert(result.error || 'Import failed')
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import employees')
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ModulePage
      metadata={{
        title: "Bulk Import Employees",
        description: "Import multiple employees from CSV file",
        breadcrumbs: [
          { name: "HR", href: "/hr" },
          { name: "Employees", href: "/hr/employees" },
          { name: "Bulk Import", href: "/hr/employees/bulk-import" }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <DocumentTextIcon className="h-6 w-6 text-blue-600 mt-1" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-900">Before You Start</h3>
              <div className="mt-2 text-sm text-blue-800">
                <ul className="list-disc list-inside space-y-1">
                  <li>Download the CSV template to ensure proper formatting</li>
                  <li>Required fields: firstName, lastName, email, department</li>
                  <li>Date format should be YYYY-MM-DD</li>
                  <li>Status values: ACTIVE, INACTIVE, TERMINATED</li>
                  <li>Maximum file size: 5MB</li>
                </ul>
              </div>
              <button
                onClick={downloadTemplate}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            
            {!file ? (
              <div>
                <p className="text-gray-600 mb-2">Choose a CSV file to upload</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Select File
                </label>
              </div>
            ) : (
              <div>
                <p className="text-gray-900 font-medium">{file.name}</p>
                <p className="text-gray-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Import Employees'}
                  </button>
                  <button
                    onClick={() => setFile(null)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Remove File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Results</h3>
            
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">Successful</p>
                      <p className="text-2xl font-semibold text-green-900">{results.successful || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">Failed</p>
                      <p className="text-2xl font-semibold text-red-900">{results.failed || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">Total Processed</p>
                      <p className="text-2xl font-semibold text-blue-900">{results.total || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {results.errors && results.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Import Errors</h4>
                  <div className="space-y-1">
                    {results.errors.map((error: any, index: number) => (
                      <p key={index} className="text-sm text-red-800">
                        Row {error.row}: {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {results.successful > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    Successfully imported {results.successful} employee{results.successful !== 1 ? 's' : ''}!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-900">Coming Soon</h3>
              <p className="mt-2 text-sm text-yellow-800">
                The bulk import functionality is currently under development. 
                You can download the template and prepare your data for when this feature becomes available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
