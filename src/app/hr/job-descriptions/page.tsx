"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline"

interface JobDescription {
  id: string
  title: string
  department: string
  level: string
  status: 'active' | 'draft' | 'archived'
  description: string
  requirements: string[]
  responsibilities: string[]
  skills: string[]
  experience: string
  education: string
  salary?: string
  createdAt: string
  updatedAt: string
}

export default function JobDescriptionsPage() {
  const { data: session } = useSession()
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null)

  useEffect(() => {
    // Simulated data - in real implementation, this would fetch from API
    const mockJobDescriptions: JobDescription[] = [
      {
        id: '1',
        title: 'Software Developer',
        department: 'IT',
        level: 'Mid-Level',
        status: 'active',
        description: 'Develop and maintain software applications for SAYWHAT organization.',
        requirements: ['Bachelor\'s in Computer Science', '3+ years experience', 'Proficiency in React/Next.js'],
        responsibilities: ['Write clean, maintainable code', 'Participate in code reviews', 'Debug and troubleshoot applications'],
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        experience: '3-5 years',
        education: 'Bachelor\'s Degree',
        salary: '$50,000 - $70,000',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: '2',
        title: 'HR Manager',
        department: 'HR',
        level: 'Senior',
        status: 'active',
        description: 'Lead human resources initiatives and manage employee relations.',
        requirements: ['Bachelor\'s in HR or related field', '5+ years HR experience', 'Strong leadership skills'],
        responsibilities: ['Oversee recruitment processes', 'Manage employee relations', 'Develop HR policies'],
        skills: ['Leadership', 'Communication', 'Conflict Resolution', 'HRIS Systems'],
        experience: '5+ years',
        education: 'Bachelor\'s Degree',
        salary: '$60,000 - $80,000',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15'
      },
      {
        id: '3',
        title: 'Operations Coordinator',
        department: 'Operations',
        level: 'Entry-Level',
        status: 'draft',
        description: 'Support daily operations and coordinate program activities.',
        requirements: ['High school diploma or equivalent', '1+ years experience', 'Strong organizational skills'],
        responsibilities: ['Coordinate program activities', 'Maintain operational records', 'Support field operations'],
        skills: ['Organization', 'Communication', 'Microsoft Office', 'Data Entry'],
        experience: '1-2 years',
        education: 'High School Diploma',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-22'
      }
    ]
    
    setJobDescriptions(mockJobDescriptions)
    setLoading(false)
  }, [])

  const filteredJobs = jobDescriptions.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
      case 'draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Draft</span>
      case 'archived':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Archived</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const handleCreateNew = () => {
    // Placeholder for create new job description
    console.log('Create new job description')
  }

  const handleEdit = (job: JobDescription) => {
    // Placeholder for edit job description
    console.log('Edit job description:', job.id)
  }

  const handleView = (job: JobDescription) => {
    setSelectedJob(job)
  }

  const handleDelete = (job: JobDescription) => {
    // Placeholder for delete job description
    console.log('Delete job description:', job.id)
  }

  const handleDuplicate = (job: JobDescription) => {
    // Placeholder for duplicate job description
    console.log('Duplicate job description:', job.id)
  }

  if (loading) {
    return (
      <ModulePage 
        title="Job Descriptions"
        description="Manage position descriptions and requirements"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage 
      title="Job Descriptions"
      description="Manage position descriptions and requirements"
    >
      {/* Header Actions */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Job Description
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredJobs.length} of {jobDescriptions.length} job descriptions
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search job descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Descriptions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredJobs.length === 0 ? (
            <li className="px-4 py-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No job descriptions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating a new job description.'}
              </p>
              {(!searchQuery && departmentFilter === 'all' && statusFilter === 'all') && (
                <div className="mt-6">
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Job Description
                  </button>
                </div>
              )}
            </li>
          ) : (
            filteredJobs.map((job) => (
              <li key={job.id}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.department} • {job.level}</p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>Experience: {job.experience}</span>
                        <span className="mx-2">•</span>
                        <span>Education: {job.education}</span>
                        {job.salary && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Salary: {job.salary}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleView(job)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 hover:border-gray-400"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(job)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 hover:border-gray-400"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(job)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 hover:border-gray-400"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-400 hover:text-red-500 hover:border-red-400"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedJob(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedJob.title}
                  </h3>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Department & Level</h4>
                    <p className="text-sm text-gray-600">{selectedJob.department} • {selectedJob.level}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-sm text-gray-600">{selectedJob.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Requirements</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Responsibilities</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {selectedJob.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Required Skills</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedJob.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Experience</h4>
                      <p className="text-sm text-gray-600">{selectedJob.experience}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Education</h4>
                      <p className="text-sm text-gray-600">{selectedJob.education}</p>
                    </div>
                  </div>
                  
                  {selectedJob.salary && (
                    <div>
                      <h4 className="font-medium text-gray-900">Salary Range</h4>
                      <p className="text-sm text-gray-600">{selectedJob.salary}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleEdit(selectedJob)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModulePage>
  )
}
