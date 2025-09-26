"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  DocumentIcon,
  FolderIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  StarIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  DocumentPlusIcon,
  HeartIcon,
  ClockIcon,
  ChartPieIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";

import {
  DocumentIcon as DocumentIconSolid,
  FolderIcon as FolderIconSolid,
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid
} from "@heroicons/react/24/solid";

import DocumentViewModal from "@/components/modals/DocumentViewModal";
import EditDocumentModal from "@/components/modals/EditDocumentModal";

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
  isStarred: boolean;
  views: number;
  classification: 'PUBLIC' | 'CONFIDENTIAL' | 'SECRET';
  department: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'MEAL AND PROGRAMS REQUIREMENTS FOR SIRTIS',
    fileName: 'MEAL AND PROGRAMS REQUIREMENTS FOR SIRTIS.docx',
    fileSize: 0,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'TEAM',
    description: 'Comprehensive requirements document for monitoring, evaluation, accountability and learning programs',
    createdAt: '2025-09-25',
    updatedAt: '2025-09-25',
    uploadedBy: 'Unknown',
    isStarred: false,
    views: 15,
    classification: 'CONFIDENTIAL',
    department: 'Programs'
  },
  {
    id: '2',
    title: 'Isabella Michael Performance Plan Tool - 2025 Revised',
    fileName: 'Isabella Michael Perfomance plan tool -2025_Revised.docx',
    fileSize: 102400,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'INDIVIDUAL',
    description: 'Performance improvement plan and evaluation tools for staff development',
    createdAt: '2025-09-25',
    updatedAt: '2025-09-25',
    uploadedBy: 'Unknown',
    isStarred: true,
    views: 8,
    classification: 'CONFIDENTIAL',
    department: 'HR'
  },
  {
    id: '3',
    title: 'UZBS Dissertation Progress Report Form 2025 - Signed',
    fileName: 'UZBS_DISSERTATION_PROGRESS_REPORT_FORM_2025_7_signed.pdf',
    fileSize: 409600,
    mimeType: 'application/pdf',
    category: 'INTERNAL',
    description: 'Academic progress monitoring and evaluation documentation',
    createdAt: '2025-09-25',
    updatedAt: '2025-09-25',
    uploadedBy: 'Unknown',
    isStarred: false,
    views: 23,
    classification: 'PUBLIC',
    department: 'Academic'
  }
];

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: ChartPieIcon },
  { id: 'my-documents', name: 'My Documents', icon: DocumentIcon },
  { id: 'all-files', name: 'All Files', icon: FolderIcon },
  { id: 'shared', name: 'Shared with Me', icon: ShareIcon },
  { id: 'favorites', name: 'Favorites', icon: StarIcon }
];

const categoryColors = {
  'TEAM': 'bg-green-100 text-green-800 border-green-200',
  'INDIVIDUAL': 'bg-blue-100 text-blue-800 border-blue-200',
  'INTERNAL': 'bg-gray-100 text-gray-800 border-gray-200',
  'PUBLIC': 'bg-green-100 text-green-800 border-green-200',
  'CONFIDENTIAL': 'bg-orange-100 text-orange-800 border-orange-200',
  'SECRET': 'bg-red-100 text-red-800 border-red-200'
};

const classificationColors = {
  'PUBLIC': 'bg-green-50 text-green-700 ring-green-600/20',
  'CONFIDENTIAL': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'SECRET': 'bg-red-50 text-red-700 ring-red-600/20'
};

export default function DocumentRepository() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [loading, setLoading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0.0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return DocumentIconSolid;
    if (mimeType.includes('word')) return DocumentIconSolid;
    if (mimeType.includes('sheet')) return DocumentIconSolid;
    return DocumentIconSolid;
  };

  const toggleFavorite = (docId: string) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === docId ? { ...doc, isStarred: !doc.isStarred } : doc
      )
    );
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: documents.length,
    size: documents.reduce((acc, doc) => acc + doc.fileSize, 0),
    views: documents.reduce((acc, doc) => acc + doc.views, 0),
    shared: documents.filter(doc => doc.classification !== 'SECRET').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-saywhat-orange border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-saywhat-orange to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DocumentIconSolid className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                  <p className="text-sm text-gray-500">Comprehensive document management system</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/documents/upload')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-saywhat-orange to-orange-500 text-white font-medium rounded-lg hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:ring-offset-2 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Upload Documents
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <nav className="flex space-x-0" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 transition-all duration-200 ${
                      isActive
                        ? 'text-saywhat-orange border-b-2 border-saywhat-orange bg-orange-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <tab.icon className={`w-5 h-5 ${isActive ? 'text-saywhat-orange' : 'text-gray-400 group-hover:text-gray-500'}`} />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </div>
                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-saywhat-orange to-orange-500"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Dashboard Stats */}
          {activeTab === 'dashboard' && (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <DocumentIconSolid className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-blue-600 text-sm font-medium">Total Documents</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-green-600 text-sm font-medium">Storage Used</p>
                      <p className="text-3xl font-bold text-green-900">{formatFileSize(stats.size)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <EyeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-purple-600 text-sm font-medium">Views This Month</p>
                      <p className="text-3xl font-bold text-purple-900">{stats.views}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-saywhat-orange/10 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-saywhat-orange rounded-lg flex items-center justify-center">
                      <ShareIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-saywhat-orange text-sm font-medium">Shared with Me</p>
                      <p className="text-3xl font-bold text-orange-900">{stats.shared}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          {(activeTab === 'all-files' || activeTab === 'my-documents' || activeTab === 'shared' || activeTab === 'favorites') && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-saywhat-orange focus:border-transparent shadow-sm"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Document List */}
          {(activeTab === 'all-files' || activeTab === 'my-documents' || activeTab === 'shared' || activeTab === 'favorites') && (
            <div className="divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <div className="p-12 text-center">
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
                  <p className="mt-2 text-gray-500">Try adjusting your search or upload some documents.</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => {
                  const FileIcon = getFileIcon(doc.mimeType);
                  return (
                    <div
                      key={doc.id}
                      className="group p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-saywhat-orange/10 group-hover:to-orange-100 transition-all duration-200">
                              <FileIcon className="w-6 h-6 text-gray-600 group-hover:text-saywhat-orange" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-saywhat-orange transition-colors">
                                {doc.title}
                              </h3>
                              {doc.isStarred && (
                                <StarIconSolid className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[doc.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                {doc.category}
                              </span>
                              
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${classificationColors[doc.classification as keyof typeof classificationColors] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
                                {doc.classification}
                              </span>
                              
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>•</span>
                              <span>{doc.uploadedBy}</span>
                              <span>•</span>
                              <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(doc.id);
                            }}
                            className="p-2 text-gray-400 hover:text-yellow-500 rounded-lg hover:bg-yellow-50 transition-all"
                          >
                            {doc.isStarred ? (
                              <StarIconSolid className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <StarIcon className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDocument(doc);
                            }}
                            className="p-2 text-gray-400 hover:text-saywhat-orange rounded-lg hover:bg-orange-50 transition-all"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
                            <EllipsisHorizontalIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Recent Activity Section for Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-saywhat-orange mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Files</h3>
                  <span className="ml-2 text-sm text-gray-500">Latest Activity</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {documents.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedDocument(doc)}>
                    <div className="flex items-center space-x-3">
                      <DocumentIconSolid className="w-8 h-8 text-saywhat-orange" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                        <p className="text-xs text-gray-500">{doc.category} • {new Date(doc.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center">
                  <HeartIconSolid className="w-5 h-5 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => router.push('/documents/upload')}
                    className="p-4 bg-gradient-to-r from-saywhat-orange/10 to-orange-100 rounded-lg hover:from-saywhat-orange/20 hover:to-orange-200 transition-all group"
                  >
                    <ArrowUpTrayIcon className="w-6 h-6 text-saywhat-orange mb-2 mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900">Upload</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all group"
                  >
                    <StarIcon className="w-6 h-6 text-yellow-500 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900">Favorites</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('shared')}
                    className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all group"
                  >
                    <ShareIcon className="w-6 h-6 text-blue-500 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900">Shared</p>
                  </button>
                  
                  <button className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all group">
                    <FolderIcon className="w-6 h-6 text-green-500 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900">Browse</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedDocument && (
        <DocumentViewModal
          documentId={selectedDocument.id}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
      
      {editingDocument && (
        <EditDocumentModal
          documentId={editingDocument.id}
          isOpen={!!editingDocument}
          onClose={() => setEditingDocument(null)}
          onSave={() => {
            // Refresh the documents list after save
            setEditingDocument(null);
            // You may want to refetch documents here
          }}
        />
      )}
    </div>
  );
}