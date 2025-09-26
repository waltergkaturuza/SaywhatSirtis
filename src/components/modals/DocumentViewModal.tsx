'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ShieldCheckIcon,
  ClockIcon,
  FolderIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  originalName: string;
  fileName: string;
  size: string;
  mimeType: string;
  uploadedBy: string;
  uploadDate: string;
  category: string;
  classification: string;
  description?: string;
  department?: string;
  keywords?: string;
  approvalStatus?: string;
  reviewStatus?: string;
  tags?: string[];
  customMetadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    pageCount?: number;
    wordCount?: number;
    language?: string;
    extractedKeywords?: string[];
    documentProcessed?: boolean;
    creationDate?: string;
    modificationDate?: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
}

export default function DocumentViewModal({ isOpen, onClose, documentId }: DocumentViewModalProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to format dates safely
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing ISO string or other formats
        const timestamp = Date.parse(dateString);
        if (isNaN(timestamp)) {
          return 'Date not available';
        }
        return new Date(timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  useEffect(() => {
    if (documentId && isOpen) {
      loadDocument();
    }
  }, [documentId, isOpen]);

  const loadDocument = async () => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/documents/${documentId}`);
      
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      } else {
        setError('Failed to load document details');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Error loading document details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (document) {
      window.open(`/api/documents/${document.id}/download`, '_blank');
    }
  };

  const canPreviewFile = (mimeType: string) => {
    return mimeType?.includes('pdf') || 
           mimeType?.startsWith('image/') || 
           mimeType?.startsWith('text/') ||
           mimeType?.includes('office') ||
           mimeType?.includes('word') ||
           mimeType?.includes('excel') ||
           mimeType?.includes('powerpoint');
  };

  const getClassificationColor = (classification: string) => {
    switch (classification?.toUpperCase()) {
      case 'PUBLIC': return 'text-green-600 bg-green-100';
      case 'INTERNAL': return 'text-blue-600 bg-blue-100';
      case 'CONFIDENTIAL': return 'text-orange-600 bg-orange-100';
      case 'SECRET': return 'text-red-600 bg-red-100';
      case 'TOP_SECRET': return 'text-red-700 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange"></div>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <div className="text-red-600 mb-4">
                      <DocumentIcon className="h-12 w-12 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Error Loading Document</h3>
                      <p className="text-sm text-gray-600 mt-2">{error}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                ) : document ? (
                  <div className="flex h-[90vh]">
                    {/* Left Sidebar - Document Information */}
                    <div className="w-96 bg-gray-50 border-r flex-shrink-0 overflow-y-auto">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
                          <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>

                        {/* Document Title */}
                        <div className="mb-6">
                          <div className="flex items-start space-x-3">
                            <DocumentIcon className="h-8 w-8 text-saywhat-orange flex-shrink-0 mt-1" />
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{document.originalName}</h4>
                              <p className="text-xs text-gray-500 mt-1">{document.fileName}</p>
                            </div>
                          </div>
                        </div>

                        {/* Document Metadata */}
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Uploaded By</p>
                              <p className="text-sm text-gray-600">{document.uploadedBy}</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Upload Date</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(document.uploadDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <FolderIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Category</p>
                              <p className="text-sm text-gray-600">{document.category}</p>
                            </div>
                          </div>

                          {document.department && (
                            <div className="flex items-start space-x-3">
                              <FolderIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Department</p>
                                <p className="text-sm text-gray-600">{document.department}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start space-x-3">
                            <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Classification</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getClassificationColor(document.classification)}`}>
                                {document.classification}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <DocumentIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">File Size</p>
                              <p className="text-sm text-gray-600">{document.size}</p>
                            </div>
                          </div>

                          {document.keywords && (
                            <div className="flex items-start space-x-3">
                              <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Keywords</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {document.keywords.split(',').map((keyword, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                      {keyword.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {document.description && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-900 mb-2">Description</p>
                              <p className="text-sm text-gray-600">{document.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                          <button
                            onClick={handleDownload}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-saywhat-orange hover:bg-orange-600"
                          >
                            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                            Download
                          </button>
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
                              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">Preview not available</h3>
                              <p className="mt-1 text-sm text-gray-500">
                                This file type cannot be previewed. Download the file to view its contents.
                              </p>
                              <button
                                onClick={handleDownload}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-saywhat-orange hover:bg-orange-600"
                              >
                                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                                Download File
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No document selected</p>
                    <button
                      onClick={onClose}
                      className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}