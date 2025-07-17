"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"

export default function ProjectDocumentsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id

  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canUploadDocuments = userPermissions.includes('programs.documents') || userPermissions.includes('programs.upload')
  const canDeleteDocuments = userPermissions.includes('programs.me_access')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [isUploading, setIsUploading] = useState(false)

  // Sample project data
  const project = {
    id: projectId,
    name: "Community Health Improvement Project",
    documents: [
      {
        id: 1,
        name: "Project Proposal Document",
        type: "pdf",
        category: "planning",
        size: "2.4 MB",
        uploadDate: "2024-01-15",
        uploader: "Dr. Sarah Johnson - M&E Officer",
        description: "Initial project proposal with objectives, methodology, and budget breakdown"
      },
      {
        id: 2,
        name: "Baseline Survey Report",
        type: "pdf",
        category: "research",
        size: "1.8 MB",
        uploadDate: "2024-01-20",
        uploader: "John Smith - Research Officer",
        description: "Comprehensive baseline assessment of target communities"
      },
      {
        id: 3,
        name: "Monthly Progress Report - December 2024",
        type: "pdf",
        category: "progress",
        size: "950 KB",
        uploadDate: "2024-01-05",
        uploader: "Mary Johnson - Programs Officer",
        description: "Monthly progress update with achievements and challenges"
      },
      {
        id: 4,
        name: "Budget Breakdown Spreadsheet",
        type: "xlsx",
        category: "financial",
        size: "450 KB",
        uploadDate: "2024-01-10",
        uploader: "David Chen - CAM Officer",
        description: "Detailed budget allocation and expenditure tracking"
      },
      {
        id: 5,
        name: "Community Engagement Photos",
        type: "zip",
        category: "media",
        size: "15.2 MB",
        uploadDate: "2024-01-08",
        uploader: "Lisa Wong - Programs Officer",
        description: "Photo documentation of community engagement activities"
      },
      {
        id: 6,
        name: "Training Materials for CHWs",
        type: "pdf",
        category: "training",
        size: "3.1 MB",
        uploadDate: "2024-01-12",
        uploader: "Ahmed Hassan - Programs Officer",
        description: "Training modules and materials for community health workers"
      },
      {
        id: 7,
        name: "Stakeholder Meeting Minutes",
        type: "docx",
        category: "meetings",
        size: "280 KB",
        uploadDate: "2024-01-06",
        uploader: "Dr. Sarah Johnson - M&E Officer",
        description: "Minutes from quarterly stakeholder review meeting"
      },
      {
        id: 8,
        name: "Risk Assessment Matrix",
        type: "xlsx",
        category: "planning",
        size: "320 KB",
        uploadDate: "2024-01-18",
        uploader: "John Smith - Research Officer",
        description: "Project risk analysis and mitigation strategies"
      }
    ]
  }

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'planning', label: 'Planning' },
    { value: 'progress', label: 'Progress Reports' },
    { value: 'financial', label: 'Financial' },
    { value: 'research', label: 'Research' },
    { value: 'training', label: 'Training' },
    { value: 'meetings', label: 'Meetings' },
    { value: 'media', label: 'Media' }
  ]

  const sortOptions = [
    { value: 'date', label: 'Upload Date' },
    { value: 'name', label: 'Name' },
    { value: 'size', label: 'File Size' },
    { value: 'type', label: 'File Type' }
  ]

  // Filter and sort documents
  const filteredDocuments = project.documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.uploader.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return parseFloat(a.size) - parseFloat(b.size)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'date':
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      }
    })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert(`${files.length} file(s) uploaded successfully!`)
    setIsUploading(false)
  }

  const handleDownload = (documentId: number) => {
    alert(`Downloading document ${documentId}...`)
  }

  const handleDelete = (documentId: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      alert(`Document ${documentId} deleted.`)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'docx':
      case 'doc':
        return '📝'
      case 'xlsx':
      case 'xls':
        return '📊'
      case 'zip':
        return '🗜️'
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️'
      default:
        return '📁'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'progress': return 'bg-green-100 text-green-800'
      case 'financial': return 'bg-yellow-100 text-yellow-800'
      case 'research': return 'bg-purple-100 text-purple-800'
      case 'training': return 'bg-indigo-100 text-indigo-800'
      case 'meetings': return 'bg-gray-100 text-gray-800'
      case 'media': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const metadata = {
    title: "Project Documents",
    description: `Document repository for ${project.name}`,
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs", href: "/programs" },
      { name: project.name, href: `/programs/projects/${projectId}` },
      { name: "Documents" }
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
      {canUploadDocuments && (
        <label className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 cursor-pointer">
          <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Documents'}
          <input
            type="file"
            className="sr-only"
            multiple
            accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png,.zip"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Stats</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{project.documents.length}</div>
            <div className="text-sm text-blue-800">Total Documents</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">
              {project.documents.filter(d => d.category === 'progress').length}
            </div>
            <div className="text-sm text-green-800">Progress Reports</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(project.documents.reduce((sum, doc) => sum + parseFloat(doc.size), 0))} MB
            </div>
            <div className="text-sm text-purple-800">Total Size</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const count = category.value === 'all' 
              ? project.documents.length 
              : project.documents.filter(d => d.category === category.value).length
            
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded ${
                  selectedCategory === category.value
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between">
                  <span>{category.label}</span>
                  <span className="text-gray-400">{count}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            Download All Documents
          </button>
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            Generate Document Report
          </button>
          {canUploadDocuments && (
            <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              Bulk Upload Documents
            </button>
          )}
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
      <div className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Documents ({filteredDocuments.length})
            </h2>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by uploading your first document.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getFileIcon(document.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(document.category)}`}>
                            {categories.find(c => c.value === document.category)?.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{document.description}</p>
                        
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1" />
                            {document.uploader}
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {document.uploadDate}
                          </div>
                          <span>{document.size}</span>
                          <span className="uppercase">{document.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(document.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => alert(`Viewing ${document.name}`)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {canDeleteDocuments && (
                        <button
                          onClick={() => handleDelete(document.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Guidelines */}
        {canUploadDocuments && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Document Upload Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Supported File Types</h4>
                <ul className="space-y-1">
                  <li>• PDF documents (.pdf)</li>
                  <li>• Word documents (.doc, .docx)</li>
                  <li>• Excel spreadsheets (.xls, .xlsx)</li>
                  <li>• Images (.jpg, .jpeg, .png)</li>
                  <li>• Compressed files (.zip)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Best Practices</h4>
                <ul className="space-y-1">
                  <li>• Use descriptive file names</li>
                  <li>• Maximum file size: 25MB</li>
                  <li>• Organize by category</li>
                  <li>• Include version numbers</li>
                  <li>• Add detailed descriptions</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
