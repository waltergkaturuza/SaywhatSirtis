"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ExportButton } from "@/components/ui/export-button"
import { ImportButton } from "@/components/ui/import-button"
import { PrintButton } from "@/components/ui/print-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getActivePlatforms, generatePlatformUrl, type ExternalPlatform } from "@/lib/external-platforms"
import { Button } from "@/components/ui/button"
import {
  AcademicCapIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  BookOpenIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon
} from "@heroicons/react/24/outline"

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState("programs")
  const [selectedProgram, setSelectedProgram] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [trainingPrograms, setTrainingPrograms] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)
  const [certificates, setCertificates] = useState<any[]>([])
  const [loadingCertificates, setLoadingCertificates] = useState(false)
  const [externalPlatforms, setExternalPlatforms] = useState<ExternalPlatform[]>([])
  const [editFormData, setEditFormData] = useState<{
    title?: string
    description?: string
    category?: string
    duration?: string
    format?: string
    capacity?: number
    instructor?: string
    status?: string
    certificationAvailable?: boolean
    startDate?: string
    endDate?: string
  }>({})

  // Fetch training programs and analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [programsResponse, analyticsResponse] = await Promise.all([
          fetch('/api/hr/training/programs'),
          fetch('/api/hr/training/analytics')
        ])

        if (programsResponse.ok) {
          const programsData = await programsResponse.json()
          setTrainingPrograms(programsData.programs || [])
        }

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData.analytics)
        }
      } catch (error) {
        console.error('Failed to fetch training data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch external platforms
  useEffect(() => {
    setExternalPlatforms(getActivePlatforms())
  }, [])

  // Fetch enrollments and certificates data
  const fetchEnrollmentsAndCertificates = async () => {
    try {
      setLoadingEnrollments(true)
      setLoadingCertificates(true)
      
      const [enrollmentsResponse, certificatesResponse] = await Promise.all([
        fetch('/api/hr/training/enrollments'),
        fetch('/api/hr/training/certificates')
      ])

      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json()
        setEnrollments(enrollmentsData.enrollments || [])
      }

      if (certificatesResponse.ok) {
        const certificatesData = await certificatesResponse.json()
        setCertificates(certificatesData.certificates || [])
      }
    } catch (error) {
      console.error('Failed to fetch enrollments and certificates:', error)
    } finally {
      setLoadingEnrollments(false)
      setLoadingCertificates(false)
    }
  }

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'enrollments' && enrollments.length === 0) {
      fetchEnrollmentsAndCertificates()
    }
    if (activeTab === 'certificates' && certificates.length === 0) {
      fetchEnrollmentsAndCertificates()
    }
  }, [activeTab])

  const handleViewProgram = (program: any) => {
    setSelectedProgram(program)
    setShowViewModal(true)
  }

  const handleEditProgram = (program: any) => {
    setSelectedProgram(program)
    setEditFormData({
      title: program.title,
      description: program.description,
      category: program.category,
      duration: program.duration,
      format: program.format,
      capacity: program.capacity,
      instructor: program.instructor,
      status: program.status,
      certificationAvailable: program.certificationAvailable,
      startDate: program.startDate?.split('T')[0],
      endDate: program.endDate?.split('T')[0]
    })
    setShowEditModal(true)
  }

  const handleSaveChanges = async () => {
    if (selectedProgram) {
      try {
        const response = await fetch(`/api/hr/training/programs/${selectedProgram.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editFormData)
        })

        if (response.ok) {
          // Refresh the programs list
          const programsResponse = await fetch('/api/hr/training/programs')
          if (programsResponse.ok) {
            const data = await programsResponse.json()
            setTrainingPrograms(data.programs || [])
          }
          alert('Program updated successfully!')
          setShowEditModal(false)
        } else {
          const error = await response.json()
          alert(`Failed to update program: ${error.error}`)
        }
      } catch (error) {
        console.error('Error updating program:', error)
        alert('Failed to update program')
      }
    }
  }

  const handleDeleteProgram = async (programId: string) => {
    if (confirm('Are you sure you want to delete this training program?')) {
      try {
        const response = await fetch(`/api/hr/training/programs/${programId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          // Refresh the programs list
          const programsResponse = await fetch('/api/hr/training/programs')
          if (programsResponse.ok) {
            const data = await programsResponse.json()
            setTrainingPrograms(data.programs || [])
          }
          alert('Program deleted successfully!')
        } else {
          const error = await response.json()
          alert(`Failed to delete program: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting program:', error)
        alert('Failed to delete program')
      }
    }
  }

  const metadata = {
    title: "Training Management",
    description: "Manage training programs, courses, and certifications"
  }

  const actions = [
    {
      label: "Import Programs",
      onClick: () => {
        console.log('Import clicked')
      },
      variant: "outline" as const
    },
    {
      label: "Export Data",
      onClick: () => {
        console.log('Export clicked')
      },
      variant: "outline" as const
    },
    {
      label: "Create Program",
      onClick: () => {
        window.location.href = '/hr/training/create'
      },
      icon: PlusIcon,
      variant: "default" as const
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "completed":
      case "COMPLETED":
        return "bg-orange-100 text-orange-800"
      case "upcoming":
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
      case "INACTIVE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "in-progress":
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-800"
      case "not-started":
      case "ENROLLED":
        return "bg-gray-100 text-gray-800"
      case "dropped":
      case "DROPPED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "Online":
        return <PlayIcon className="h-4 w-4 text-orange-600" />
      case "In-person":
        return <UserGroupIcon className="h-4 w-4 text-green-600" />
      case "Hybrid":
      case "Blended":
        return <BookOpenIcon className="h-4 w-4 text-orange-600" />
      default:
        return <BookOpenIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const tabs = [
    { id: "programs", name: "Training Programs", icon: AcademicCapIcon },
    { id: "enrollments", name: "Enrollments", icon: UserGroupIcon },
    { id: "certificates", name: "Certificates", icon: TrophyIcon }
  ]

  if (loading) {
    return (
      <ModulePage metadata={metadata} actions={actions}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading training data...</span>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage metadata={metadata} actions={actions}>
      <div className="space-y-6">
        {/* Training Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {analytics?.overview?.totalPrograms || 0}
                </h3>
                <p className="text-sm text-gray-500">Active Programs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {analytics?.overview?.totalEnrollments || 0}
                </h3>
                <p className="text-sm text-gray-500">Total Enrollments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {analytics?.overview?.completedEnrollments || 0}
                </h3>
                <p className="text-sm text-gray-500">Completions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {analytics?.overview?.certificatesIssued || 0}
                </h3>
                <p className="text-sm text-gray-500">Certificates Issued</p>
              </div>
            </div>
          </div>
        </div>

        {/* External Learning Platform Section */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="bg-orange-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">External Learning Platforms</h2>
            <p className="text-orange-100 mt-1">Access external training platforms and submit certificates</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Platform Access */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AcademicCapIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Platform Access</h3>
                </div>
                
                <div className="space-y-3">
                  {externalPlatforms.map((platform) => (
                    <div key={platform.id} className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">{platform.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
                      <a 
                        href={generatePlatformUrl(platform.id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                      >
                        <BookOpenIcon className="w-4 h-4 mr-2" />
                        Access {platform.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Certificate Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrophyIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Upload Certificates</h3>
                </div>
                
                <p className="text-gray-600">
                  Upload your completed course certificates as proof of training completion.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <ArrowDownTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="certificate-upload" className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Upload Certificate
                        </span>
                        <input
                          id="certificate-upload"
                          name="certificate-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      PDF, JPG, PNG up to 10MB each
                    </p>
                  </div>
                </div>
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
            {activeTab === "programs" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Training Programs</h3>
                </div>

                {trainingPrograms.length === 0 ? (
                  <div className="text-center py-12">
                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No training programs</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new training program.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trainingPrograms.map((program) => (
                      <div key={program.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getFormatIcon(program.format)}
                              <h4 className="font-semibold text-gray-900">{program.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(program.status)}`}>
                            {program.status}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Instructor:</span>
                              <span className="ml-1 text-gray-900">{program.instructor}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <span className="ml-1 text-gray-900">{program.duration}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              {program.startDate && new Date(program.startDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewProgram(program)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleEditProgram(program)}
                                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "enrollments" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Training Enrollments</h3>
                
                {loadingEnrollments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading enrollments...</p>
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No enrollments found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {enrollments.map((enrollment) => (
                          <tr key={enrollment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {enrollment.employeeName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {enrollment.program}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEnrollmentStatusColor(enrollment.status)}`}>
                                {enrollment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Training Certificates</h3>
                
                {loadingCertificates ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading certificates...</p>
                  </div>
                ) : certificates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No certificates found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((certificate) => (
                      <div key={certificate.id} className="bg-white border-2 border-yellow-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <TrophyIcon className="h-8 w-8 text-yellow-600" />
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{certificate.program}</h4>
                            <p className="text-sm text-gray-600">{certificate.employeeName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Program Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Training Program Details</DialogTitle>
          </DialogHeader>
          {selectedProgram && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedProgram.title}</h3>
                <p className="text-gray-600 mt-2">{selectedProgram.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Category:</span>
                  <p className="text-sm font-medium">{selectedProgram.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Instructor:</span>
                  <p className="text-sm font-medium">{selectedProgram.instructor}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowViewModal(false)
                  handleEditProgram(selectedProgram)
                }}>
                  Edit Program
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Program Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Training Program</DialogTitle>
          </DialogHeader>
          {selectedProgram && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program Title</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModulePage>
  )
}
