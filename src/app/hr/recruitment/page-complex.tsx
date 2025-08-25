'use client'

import { useState } from 'react'
import { ModulePage } from "@/components/layout/enhanced-layout"
import { Upload, FileText, Users, TrendingUp, Download, Eye, Trash2 } from 'lucide-react'

interface RecruitmentRecord {
  id: string
  fileName: string
  uploadDate: string
  recordType: 'job-description' | 'candidate-cv' | 'interview-notes' | 'assessment'
  status: 'uploaded' | 'processed' | 'reviewed'
  summary?: string
  metadata: {
    candidateCount?: number
    position?: string
    department?: string
    fileSize: string
    fileType: string
  }
}

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'analytics'>('jobs')
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showJobModal, setShowJobModal] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  
  // Job posting form state
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadJobs(),
        loadApplications()
      ])
    } catch (error) {
      console.error('Error loading recruitment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/hr/recruitment/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.success ? data.data : [])
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/hr/recruitment/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.success ? data.data : [])
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  // Job posting form handlers
  const handleCreateJob = () => {
    setEditingJob(null)
    setShowJobForm(true)
  }

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job)
    setShowJobForm(true)
  }

  const handleCloseJobForm = () => {
    setShowJobForm(false)
    setEditingJob(null)
  }

  const handleJobSubmit = async (jobData: any) => {
    setFormLoading(true)
    try {
      const url = editingJob 
        ? '/api/hr/recruitment/jobs' 
        : '/api/hr/recruitment/jobs'
      
      const method = editingJob ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh the jobs list
          await loadJobs()
          setShowJobForm(false)
          setEditingJob(null)
          // You could add a toast notification here
          console.log(editingJob ? 'Job updated successfully' : 'Job created successfully')
        } else {
          console.error('Failed to save job:', result.message)
        }
      } else {
        console.error('Failed to save job:', response.statusText)
      }
    } catch (error) {
      console.error('Error saving job:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      try {
        const response = await fetch(`/api/hr/recruitment/jobs?id=${jobId}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (response.ok) {
          if (result.success) {
            await loadJobs()
            // Success - job deleted
          } else {
            alert(result.message || 'Failed to delete job')
          }
        } else {
          // Handle different error types
          if (response.status === 401) {
            alert('Authentication required. Please log in to delete jobs. Visit /auth/signin to authenticate.')
          } else {
            alert(result.error || result.message || 'Failed to delete job')
          }
        }
      } catch (error) {
        console.error('Error deleting job:', error)
        alert('An error occurred while deleting the job. Please try again.')
      }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-purple-100 text-purple-800',
      shortlisted: 'bg-indigo-100 text-indigo-800',
      interviewed: 'bg-orange-100 text-orange-800',
      offered: 'bg-green-100 text-green-800',
      hired: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredJobs = (jobs || []).filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredApplications = (applications || []).filter(app => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const recruitmentStats = {
    totalJobs: (jobs || []).length,
    activeJobs: (jobs || []).filter(job => job.status === 'active').length,
    totalApplications: (applications || []).length,
    pendingReview: (applications || []).filter(app => app.status === 'submitted' || app.status === 'reviewing').length,
    shortlisted: (applications || []).filter(app => app.status === 'shortlisted').length,
    hired: (applications || []).filter(app => app.status === 'hired').length
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const metadata = {
    title: "Recruitment Management",
    description: "Manage job postings, applications, and hiring process",
    breadcrumbs: [
      { name: "SIRTIS", href: "/" },
      { name: "HR Management", href: "/hr" },
      { name: "Recruitment" }
    ]
  }

  const actions = (
    <button
      onClick={handleCreateJob}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
    >
      <Plus className="h-4 w-4" />
      Post New Job
    </button>
  )

  return (
    <ModulePage metadata={metadata} actions={actions}>
      <div className="space-y-6">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{recruitmentStats.totalJobs}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-green-600">{recruitmentStats.activeJobs}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{recruitmentStats.totalApplications}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600">{recruitmentStats.pendingReview}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shortlisted</p>
              <p className="text-2xl font-bold text-indigo-600">{recruitmentStats.shortlisted}</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Eye className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hired</p>
              <p className="text-2xl font-bold text-emerald-600">{recruitmentStats.hired}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'jobs', label: 'Job Postings', count: jobs.length },
              { key: 'applications', label: 'Applications', count: applications.length },
              { key: 'analytics', label: 'Analytics', count: null }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {activeTab === 'jobs' ? (
                  <>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="on-hold">On Hold</option>
                  </>
                ) : (
                  <>
                    <option value="submitted">Submitted</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="offered">Offered</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="p-6">
          {activeTab === 'jobs' && (
            <JobPostingsTab 
              jobs={filteredJobs}
              onEdit={handleEditJob}
              onView={(job) => {
                setSelectedJob(job)
                // Could open a detailed view modal
              }}
              onDelete={handleDeleteJob}
            />
          )}

          {activeTab === 'applications' && (
            <ApplicationsTab 
              applications={filteredApplications}
              onView={(application) => {
                setSelectedApplication(application)
                setShowApplicationModal(true)
              }}
              onUpdateStatus={(appId, status) => {
                // Handle status update
                console.log('Update status:', appId, status)
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab 
              jobs={jobs}
              applications={applications}
            />
          )}
        </div>
      </div>

      {/* Job Posting Form Modal */}
      <JobPostingForm
        isOpen={showJobForm}
        onClose={handleCloseJobForm}
        onSubmit={handleJobSubmit}
        editingJob={editingJob}
        isLoading={formLoading}
      />
      </div>
    </ModulePage>
  )
}

// Job Postings Tab Component
function JobPostingsTab({ 
  jobs, 
  onEdit, 
  onView, 
  onDelete 
}: {
  jobs: JobPosting[]
  onEdit: (job: JobPosting) => void
  onView: (job: JobPosting) => void
  onDelete: (jobId: string) => void
}) {
  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No job postings</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new job posting.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Department:</span> {job.department}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {job.type}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {job.level}
                    </div>
                    <div>
                      <span className="font-medium">Applications:</span> {job.applicationCount}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Posted: {new Date(job.postedDate).toLocaleDateString()} • 
                    Closes: {new Date(job.closingDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => onView(job)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(job)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(job.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Applications Tab Component
function ApplicationsTab({ 
  applications, 
  onView, 
  onUpdateStatus 
}: {
  applications: Application[]
  onView: (application: Application) => void
  onUpdateStatus: (appId: string, status: string) => void
}) {
  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
          <p className="mt-1 text-sm text-gray-500">Applications will appear here when candidates apply.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {application.candidateName}
                      </div>
                      <div className="text-sm text-gray-500">{application.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.jobTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.score ? `${application.score}/100` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onView(application)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <select
                      value={application.status}
                      onChange={(e) => onUpdateStatus(application.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="offered">Offered</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Analytics Tab Component
function AnalyticsTab({ 
  jobs, 
  applications 
}: {
  jobs: JobPosting[]
  applications: Application[]
}) {
  const analytics = {
    averageApplicationsPerJob: (jobs || []).length > 0 ? ((applications || []).length / (jobs || []).length).toFixed(1) : '0',
    applicationsByStatus: (applications || []).reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    jobsByDepartment: (jobs || []).reduce((acc, job) => {
      acc[job.department] = (acc[job.department] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    hiringRate: (applications || []).length > 0 ? 
      (((applications || []).filter(app => app.status === 'hired').length / (applications || []).length) * 100).toFixed(1) : '0'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Avg Applications/Job</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.averageApplicationsPerJob}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Hiring Rate</h3>
          <p className="text-2xl font-bold text-green-600">{analytics.hiringRate}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Active Positions</h3>
          <p className="text-2xl font-bold text-blue-600">{(jobs || []).filter(j => j.status === 'active').length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Pending Reviews</h3>
          <p className="text-2xl font-bold text-orange-600">
            {(applications || []).filter(a => a.status === 'submitted' || a.status === 'reviewing').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Applications by Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.applicationsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{status.replace('-', ' ')}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Jobs by Department</h3>
          <div className="space-y-3">
            {Object.entries(analytics.jobsByDepartment).map(([department, count]) => (
              <div key={department} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{department}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusBadgeColor(status: string) {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    closed: 'bg-red-100 text-red-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-purple-100 text-purple-800',
    shortlisted: 'bg-indigo-100 text-indigo-800',
    interviewed: 'bg-orange-100 text-orange-800',
    offered: 'bg-green-100 text-green-800',
    hired: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}
