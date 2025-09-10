"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import { 
  DocumentIcon,
  FolderIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UsersIcon,
  CalendarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

// SAYWHAT Colors
const saywhatColors = {
  orange: '#ff6b35',
  red: '#dc2626', 
  grey: '#6b7280',
  dark: '#1f2937',
  lightGrey: '#f3f4f6'
}

// Security classifications
const securityClassifications = {
  "PUBLIC": { 
    color: "text-green-600 bg-green-100", 
    icon: ShareIcon,
    description: "Accessible to all employees within the organization" 
  },
  "CONFIDENTIAL": { 
    color: "text-orange-600 bg-orange-100", 
    icon: LockClosedIcon,
    description: "Sensitive information requiring authorized access" 
  },
  "RESTRICTED": { 
    color: "text-red-600 bg-red-100", 
    icon: ShieldCheckIcon,
    description: "Highly sensitive information with limited access" 
  },
  "INTERNAL": { 
    color: "text-blue-600 bg-blue-100", 
    icon: UsersIcon,
    description: "For internal use within the organization" 
  }
}

// Document categories
const documentCategories = [
  'Policy Documents',
  'Financial Reports',
  'Program Documentation',
  'Training Materials',
  'Legal Documents',
  'Operational Procedures',
  'Research Papers',
  'Marketing Materials',
  'Technical Documentation',
  'Meeting Minutes'
]

interface Document {
  id: string
  title: string
  fileName: string
  description?: string
  classification: string
  category: string
  uploadedBy: string
  uploadedAt: string
  size: number
  downloadCount: number
  tags: string[]
  viewsCount?: number
  downloadsCount?: number
}

interface DocumentStats {
  totalDocuments: number
  totalSize: string
  categoryCounts: Record<string, number>
  classificationCounts: Record<string, number>
  recentUploads: number
  totalDownloads: number
}

export default function DocumentRepository() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    totalSize: '0 MB',
    categoryCounts: {},
    classificationCounts: {},
    recentUploads: 0,
    totalDownloads: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClassification, setSelectedClassification] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    classification: 'INTERNAL',
    tags: ''
  });

  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
      setStats(data.stats || {
        totalDocuments: 0,
        totalSize: '0 MB',
        categoryCounts: {},
        classificationCounts: {},
        recentUploads: 0,
        totalDownloads: 0
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
      setDocuments([]);
      setStats({
        totalDocuments: 0,
        totalSize: '0 MB',
        categoryCounts: {},
        classificationCounts: {},
        recentUploads: 0,
        totalDownloads: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList) => {
    if (!files.length) return;
    
    try {
      setUploading(true);
      const file = files[0];

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', uploadForm.title || file.name);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);
      formData.append('classification', uploadForm.classification);
      formData.append('tags', uploadForm.tags);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const result = await response.json();
      alert('Document uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        category: '',
        classification: 'INTERNAL',
        tags: ''
      });
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Refresh documents to update download count
      fetchDocuments();
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return DocumentIcon;
      case 'doc':
      case 'docx': return DocumentIcon;
      case 'xls':
      case 'xlsx': return DocumentIcon;
      case 'ppt':
      case 'pptx': return DocumentIcon;
      default: return DocumentIcon;
    }
  };

  const getClassificationConfig = (classification: string) => {
    return securityClassifications[classification as keyof typeof securityClassifications] || 
           { color: "text-gray-600 bg-gray-100", icon: DocumentIcon };
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesClassification = selectedClassification === 'all' || doc.classification === selectedClassification;
    
    return matchesSearch && matchesCategory && matchesClassification;
  });

  // Check permissions
  const hasAccess = session?.user?.permissions?.includes("documents.view") ||
                   session?.user?.permissions?.includes("documents.full_access");

  if (!hasAccess) {
    return (
      <ModulePage
        metadata={{
          title: "Document Repository",
          description: "Access Denied",
          breadcrumbs: [{ name: "Document Repository" }]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-saywhat-red" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-saywhat-grey">
            You don't have permission to access the document repository.
          </p>
        </div>
      </ModulePage>
    );
  }

  return (
    <ModulePage
      metadata={{
        title: "Document Repository",
        description: "AI-powered document management with advanced security classifications",
        breadcrumbs: [{ name: "Document Repository" }]
      }}
    >
      <div className="max-w-full mx-auto px-4 space-y-6">
        {/* Header with SAYWHAT Gradient */}
        <div className="bg-gradient-to-r from-saywhat-orange to-saywhat-red rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Document Repository</h1>
              <p className="text-orange-100 mt-2">AI-powered document management with enterprise security</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-white/20 text-white bg-white/10 hover:bg-white/20 rounded-md font-medium transition-colors"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentIcon className="h-6 w-6 text-saywhat-orange" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Documents</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalDocuments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FolderIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Storage Used</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalSize}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowDownTrayIcon className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Downloads</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalDownloads}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Recent Uploads</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.recentUploads}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Document Search & Filters</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-saywhat-orange focus:border-saywhat-orange"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-saywhat-orange focus:border-saywhat-orange"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {documentCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="md:w-48">
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-saywhat-orange focus:border-saywhat-orange"
                  value={selectedClassification}
                  onChange={(e) => setSelectedClassification(e.target.value)}
                >
                  <option value="all">All Classifications</option>
                  {Object.keys(securityClassifications).map(classification => (
                    <option key={classification} value={classification}>{classification}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Documents ({filteredDocuments.length})
              </h3>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
              <p className="mt-4 text-saywhat-grey">Loading documents...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-saywhat-red" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Documents</h3>
              <p className="mt-1 text-sm text-saywhat-grey">{error}</p>
              <button
                onClick={fetchDocuments}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {documents.length === 0 
                  ? "Get started by uploading your first document."
                  : "Try adjusting your search filters."
                }
              </p>
              {documents.length === 0 && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-orange-600"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => {
                    const FileIcon = getFileIcon(doc.fileName);
                    const classificationConfig = getClassificationConfig(doc.classification);
                    const ClassificationIcon = classificationConfig.icon;

                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileIcon className="h-8 w-8 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                              <div className="text-sm text-gray-500">{doc.fileName}</div>
                              {doc.description && (
                                <div className="text-xs text-gray-400 max-w-xs truncate">{doc.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {doc.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classificationConfig.color}`}>
                            <ClassificationIcon className="h-3 w-3 mr-1" />
                            {doc.classification}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">{doc.uploadedBy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(doc.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.downloadsCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownload(doc.id, doc.fileName)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-saywhat-orange hover:text-orange-600"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Document</h3>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Document title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange"
                        rows={3}
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange"
                        value={uploadForm.category}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Select category</option>
                        {documentCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Security Classification</label>
                      <select
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange"
                        value={uploadForm.classification}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, classification: e.target.value }))}
                      >
                        {Object.entries(securityClassifications).map(([key, config]) => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange"
                        value={uploadForm.tags}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">File</label>
                      <input
                        type="file"
                        className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-saywhat-orange file:text-white
                          hover:file:bg-orange-600"
                        onChange={(e) => e.target.files && handleUpload(e.target.files)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  );
}
