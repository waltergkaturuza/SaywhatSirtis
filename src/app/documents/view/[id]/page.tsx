'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { ModulePage } from '@/components/layout/enhanced-layout';
import {
  DocumentTextIcon,
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  TagIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DocumentData {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: string;
  classification: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  customMetadata?: any;
  url?: string;
  path?: string;
}

interface User {
  id: string;
  name?: string;
  email?: string;
}

export default function DocumentViewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [uploader, setUploader] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch document details
      const docResponse = await fetch(`/api/documents/${documentId}`);
      if (!docResponse.ok) {
        throw new Error('Failed to fetch document');
      }
      
      const docData = await docResponse.json();
      setDocument(docData);

      // Fetch uploader details
      if (docData.uploadedBy) {
        try {
          const userResponse = await fetch(`/api/users/${docData.uploadedBy}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUploader(userData);
          }
        } catch (err) {
          console.warn('Failed to fetch uploader details:', err);
        }
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError('Failed to load document details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (document) {
      window.open(`/api/documents/${document.id}/download`, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSecurityBadge = (classification: string) => {
    const colors = {
      PUBLIC: 'bg-green-100 text-green-800 border-green-200',
      CONFIDENTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SECRET: 'bg-orange-100 text-orange-800 border-orange-200',
      TOP_SECRET: 'bg-red-100 text-red-800 border-red-200',
    };
    
    return colors[classification as keyof typeof colors] || colors.PUBLIC;
  };

  const canPreviewFile = (mimeType: string) => {
    return mimeType.startsWith('image/') || 
           mimeType === 'application/pdf' || 
           mimeType.startsWith('text/');
  };

  if (loading) {
    return (
      <ModulePage
        metadata={{
          title: "Document View",
          description: "Loading document details...",
          breadcrumbs: [
            { name: "Documents", href: "/documents" },
            { name: "View Document" }
          ]
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange"></div>
        </div>
      </ModulePage>
    );
  }

  if (error || !document) {
    return (
      <ModulePage
        metadata={{
          title: "Document View",
          description: "Document not found",
          breadcrumbs: [
            { name: "Documents", href: "/documents" },
            { name: "View Document" }
          ]
        }}
      >
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Document not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error || 'The document you are looking for does not exist or you do not have permission to view it.'}
          </p>
          <div className="mt-6">
            <Link
              href="/documents"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-saywhat-orange hover:bg-orange-600"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Documents
            </Link>
          </div>
        </div>
      </ModulePage>
    );
  }

  return (
    <ModulePage
      metadata={{
        title: document.originalName,
        description: `View details for ${document.originalName}`,
        breadcrumbs: [
          { name: "Documents", href: "/documents" },
          { name: "View Document" }
        ]
      }}
    >
      <div className="w-full h-screen flex bg-gray-50 overflow-hidden">
        {/* Left Sidebar - Document Information */}
        <div className="w-80 bg-white shadow-lg flex-shrink-0 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <DocumentTextIcon className="h-8 w-8 text-gray-400" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{document.originalName}</h1>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSecurityBadge(document.classification)}`}>
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                  {document.classification}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Uploaded by</p>
                  <p className="text-sm text-gray-600">
                    {uploader ? (uploader.name || uploader.email) : 'Loading...'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Upload Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(document.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Modified</p>
                  <p className="text-sm text-gray-600">
                    {new Date(document.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">File Details</p>
                  <p className="text-sm text-gray-600">Type: {document.mimeType}</p>
                  <p className="text-sm text-gray-600">Size: {formatFileSize(document.size)}</p>
                  <p className="text-sm text-gray-600">Category: {document.category}</p>
                </div>
              </div>

              {document.description && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Description</p>
                  <p className="text-sm text-gray-600">{document.description}</p>
                </div>
              )}

              <button
                onClick={handleDownload}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-saywhat-orange hover:bg-orange-600"
              >
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                Download
              </button>

              <Link
                href="/documents"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Documents
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content - Document Preview */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Document Preview</h2>
          </div>
          
          <div className="flex-1 p-6">
            {canPreviewFile(document.mimeType) ? (
              <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200">
                <iframe
                  src={`/api/documents/${document.id}/view`}
                  className="w-full h-full rounded-lg"
                  title={document.originalName}
                  allow="fullscreen"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-center">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Preview Not Available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This file type cannot be previewed in the browser.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-saywhat-orange hover:bg-orange-600"
                    >
                      <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                      Download to View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - AI Copilot */}
        <div className="w-80 bg-white shadow-lg flex-shrink-0 border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">AI Copilot</h3>
                <p className="text-sm text-gray-500">Document Analysis</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900 mb-2">Document Summary</h4>
                <p className="text-sm text-purple-700">
                  Analyzing document content... AI-powered insights will appear here to help you understand the document's key points, structure, and important information.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Insights</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Document type: {document.category}</li>
                  <li>• Security level: {document.classification}</li>
                  <li>• File format: {document.mimeType.split('/')[1].toUpperCase()}</li>
                  <li>• Size: {formatFileSize(document.size)}</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-2">Recommendations</h4>
                <p className="text-sm text-green-700">
                  Based on this document's content and metadata, consider sharing with relevant team members or adding to project folders for better organization.
                </p>
              </div>

              <button className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                Generate Full Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}