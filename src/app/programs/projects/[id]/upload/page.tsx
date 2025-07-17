"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  PhotoIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

export default function UploadProgressPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canUploadProgress = userPermissions.includes('programs.upload') || userPermissions.includes('programs.progress')

  // Redirect if no permission
  if (!canUploadProgress) {
    router.push('/programs')
    return null
  }

  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().split('T')[0],
    summary: '',
    achievements: '',
    challenges: '',
    nextSteps: '',
    budgetUpdate: '',
    reachUpdate: '',
    indicatorUpdates: [
      { indicatorId: 1, currentValue: '', notes: '' },
      { indicatorId: 2, currentValue: '', notes: '' },
      { indicatorId: 3, currentValue: '', notes: '' },
      { indicatorId: 4, currentValue: '', notes: '' }
    ]
  })

  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sample project data
  const project = {
    id: projectId,
    name: "Community Health Improvement Project",
    indicators: [
      { id: 1, name: "Number of women receiving prenatal care", target: 5000, current: 3250 },
      { id: 2, name: "Children fully vaccinated", target: 8000, current: 6400 },
      { id: 3, name: "Community health workers trained", target: 100, current: 75 },
      { id: 4, name: "Health facilities upgraded", target: 20, current: 8 }
    ]
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIndicatorUpdate = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      indicatorUpdates: prev.indicatorUpdates.map((update, i) => 
        i === index ? { ...update, [field]: value } : update
      )
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    alert('Progress report uploaded successfully!')
    router.push(`/programs/projects/${projectId}`)
  }

  const metadata = {
    title: "Upload Progress Report",
    description: `Upload progress report for ${project.name}`,
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs", href: "/programs" },
      { name: project.name, href: `/programs/projects/${projectId}` },
      { name: "Upload Progress" }
    ]
  }

  const actions = (
    <>
      <Link
        href={`/programs/projects/${projectId}`}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Project
      </Link>
      <button
        type="submit"
        form="progress-form"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Uploading...
          </>
        ) : (
          <>
            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
            Upload Report
          </>
        )}
      </button>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Guidelines</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="p-3 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-900 mb-2">Required Information</h4>
            <ul className="space-y-1">
              <li>• Progress summary</li>
              <li>• Key achievements</li>
              <li>• Challenges faced</li>
              <li>• Next steps planned</li>
            </ul>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <h4 className="font-medium text-green-900 mb-2">Supporting Documents</h4>
            <ul className="space-y-1">
              <li>• Photos of activities</li>
              <li>• Data collection sheets</li>
              <li>• Meeting minutes</li>
              <li>• Receipts/invoices</li>
            </ul>
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <h4 className="font-medium text-yellow-900 mb-2">File Requirements</h4>
            <ul className="space-y-1">
              <li>• Max 10MB per file</li>
              <li>• PDF, DOC, JPG, PNG</li>
              <li>• Clear, readable quality</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Indicators</h3>
        <div className="space-y-2">
          {project.indicators.map((indicator) => (
            <div key={indicator.id} className="p-2 bg-gray-50 rounded text-sm">
              <div className="font-medium text-gray-900 truncate">{indicator.name}</div>
              <div className="text-gray-600">
                Current: {indicator.current.toLocaleString()} / {indicator.target.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <form id="progress-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress Report Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Date
              </label>
              <input
                type="date"
                value={formData.reportDate}
                onChange={(e) => handleInputChange('reportDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting Officer
              </label>
              <input
                type="text"
                value={`${session?.user?.name} - ${session?.user?.role}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Provide a comprehensive summary of progress made during this reporting period..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
        </div>

        {/* Detailed Progress */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Progress</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements *
              </label>
              <textarea
                value={formData.achievements}
                onChange={(e) => handleInputChange('achievements', e.target.value)}
                placeholder="List the major achievements and milestones reached during this period..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenges Faced
              </label>
              <textarea
                value={formData.challenges}
                onChange={(e) => handleInputChange('challenges', e.target.value)}
                placeholder="Describe any challenges, obstacles, or issues encountered..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Steps *
              </label>
              <textarea
                value={formData.nextSteps}
                onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                placeholder="Outline the planned activities and next steps for the upcoming period..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {/* Budget & Reach Updates */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Budget & Reach Updates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Update
              </label>
              <textarea
                value={formData.budgetUpdate}
                onChange={(e) => handleInputChange('budgetUpdate', e.target.value)}
                placeholder="Provide updates on budget utilization, expenditures, and financial status..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reach Update
              </label>
              <textarea
                value={formData.reachUpdate}
                onChange={(e) => handleInputChange('reachUpdate', e.target.value)}
                placeholder="Update on the number of people reached, target population coverage..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Indicator Updates */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">M&E Indicator Updates</h2>
          
          <div className="space-y-6">
            {project.indicators.map((indicator, index) => (
              <div key={indicator.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{indicator.name}</h3>
                <div className="text-sm text-gray-600 mb-4">
                  Current Value: {indicator.current.toLocaleString()} / Target: {indicator.target.toLocaleString()}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New/Updated Value
                    </label>
                    <input
                      type="number"
                      value={formData.indicatorUpdates[index]?.currentValue || ''}
                      onChange={(e) => handleIndicatorUpdate(index, 'currentValue', e.target.value)}
                      placeholder={`Current: ${indicator.current}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes/Comments
                    </label>
                    <input
                      type="text"
                      value={formData.indicatorUpdates[index]?.notes || ''}
                      onChange={(e) => handleIndicatorUpdate(index, 'notes', e.target.value)}
                      placeholder="Additional notes about this indicator..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File Attachments */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Supporting Documents</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload files
                      </span>
                      <span className="mt-1 block text-sm text-gray-600">
                        PNG, JPG, PDF, DOC up to 10MB each
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Attached Files</h3>
                <div className="space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ready to Submit?</h3>
              <p className="text-sm text-gray-600">
                Please review all information before submitting your progress report.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.push(`/programs/projects/${projectId}`)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Uploading...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </ModulePage>
  )
}
