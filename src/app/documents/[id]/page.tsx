'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ModulePage } from '@/components/layout/enhanced-layout';
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  ShieldCheckIcon,
  ClockIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  category: string;
  classification: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  uploadedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function DocumentViewPage() {
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadDocument();
    }
  }, [params.id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/documents/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      } else {
        setError('Failed to load document');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Error loading document');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSecurityBadgeColor = (classification: string) => {
    const colors = {
      'PUBLIC': 'bg-green-100 text-green-800 border-green-200',
      'CONFIDENTIAL': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'SECRET': 'bg-orange-100 text-orange-800 border-orange-200',
      'TOP_SECRET': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[classification as keyof typeof colors] || colors.PUBLIC;
  };

  if (loading) {
    return (
      <ModulePage
        metadata={{
          title: "Loading Document...",
          description: "Loading document details",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Loading..." }
          ]
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
          <span className="ml-2 text-gray-600">Loading document...</span>
        </div>
      </ModulePage>
    );
  }

  if (error || !document) {
    return (
      <ModulePage
        metadata={{
          title: "Document Not Found",
          description: "The requested document could not be found",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Error" }
          ]
        }}
      >
        <div className="text-center py-12">
          <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Document Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested document could not be found.'}</p>
          <a
            href="/documents"
            className="inline-flex items-center px-4 py-2 bg-saywhat-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Documents
          </a>
        </div>
      </ModulePage>
    );
  }

  return (
    <ModulePage
      metadata={{
        title: document.originalName,
        description: document.description || "Document details and preview",
        breadcrumbs: [
          { name: "Document Repository", href: "/documents" },
          { name: document.originalName }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Document Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-saywhat-orange to-orange-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <DocumentIcon className="h-8 w-8 text-white" />
                <div>
                  <h1 className="text-xl font-bold text-white">{document.originalName}</h1>
                  <p className="text-orange-100">
                    {document.mimeType} • {formatFileSize(document.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSecurityBadgeColor(document.classification)}`}>
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                  {document.classification}
                </span>
                <a
                  href={`/api/documents/${document.id}/download`}
                  className="inline-flex items-center px-4 py-2 bg-white text-saywhat-orange rounded-lg hover:bg-gray-50 transition-colors border"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Metadata */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Document Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Uploaded by</p>
                    <p className="text-sm text-gray-600">
                      {document.uploadedByUser 
                        ? `${document.uploadedByUser.firstName} ${document.uploadedByUser.lastName}`
                        : 'Unknown User'
                      }
                      {document.uploadedByUser?.email && (
                        <span className="block text-xs text-gray-500">
                          {document.uploadedByUser.email}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Upload Date</p>
                    <p className="text-sm text-gray-600">{formatDate(document.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Modified</p>
                    <p className="text-sm text-gray-600">{formatDate(document.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FolderIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Category</p>
                    <p className="text-sm text-gray-600">{document.category}</p>
                  </div>
                </div>

                {document.description && (
                  <div className="flex items-start space-x-3">
                    <DocumentIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Description</p>
                      <p className="text-sm text-gray-600">{document.description}</p>
                    </div>
                  </div>
                )}

                {document.tags.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {document.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <EyeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Visibility</p>
                    <p className="text-sm text-gray-600">
                      {document.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Document Preview</h2>
              </div>
              <div className="p-6">
                {document.mimeType === 'application/pdf' ? (
                  <div className="w-full h-96 border rounded-lg overflow-hidden">
                    <iframe
                      src={`/api/documents/${document.id}/view`}
                      className="w-full h-full"
                      title={document.originalName}
                    />
                  </div>
                ) : document.mimeType?.startsWith('image/') ? (
                  <div className="text-center">
                    <img
                      src={`/api/documents/${document.id}/view`}
                      alt={document.originalName}
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                ) : document.mimeType?.startsWith('text/') ? (
                  <div className="w-full h-96 border rounded-lg overflow-hidden">
                    <iframe
                      src={`/api/documents/${document.id}/view`}
                      className="w-full h-full"
                      title={document.originalName}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                    <a
                      href={`/api/documents/${document.id}/download`}
                      className="inline-flex items-center px-4 py-2 bg-saywhat-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download to View
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}