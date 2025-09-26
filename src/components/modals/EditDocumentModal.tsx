'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  ShieldCheckIcon,
  FolderIcon,
  PencilIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const securityClassifications = {
  "PUBLIC": {
    name: "Public",
    level: 1,
    description: "Information that can be freely shared with the public",
    examples: ["Public announcements", "Marketing materials", "Open policies"],
    color: "text-green-700 bg-green-50 border-green-200",
    icon: GlobeAltIcon,
    badgeColor: "bg-green-100 text-green-800"
  },
  "INTERNAL": {
    name: "Internal Use Only",
    level: 2,
    description: "Information for internal organization use only",
    examples: ["Internal procedures", "Staff communications", "Internal reports"],
    color: "text-blue-700 bg-blue-50 border-blue-200",
    icon: UserGroupIcon,
    badgeColor: "bg-blue-100 text-blue-800"
  },
  "CONFIDENTIAL": {
    name: "Confidential",
    level: 3,
    description: "Sensitive information requiring restricted access",
    examples: ["Personnel records", "Financial data", "Strategic plans"],
    color: "text-yellow-700 bg-yellow-50 border-yellow-200",
    icon: EyeIcon,
    badgeColor: "bg-yellow-100 text-yellow-800"
  },
  "SECRET": {
    name: "Secret",
    level: 4,
    description: "Highly sensitive information on need-to-know basis",
    examples: ["Security protocols", "Confidential agreements", "Sensitive investigations"],
    color: "text-orange-700 bg-orange-50 border-orange-200",
    icon: ShieldCheckIcon,
    badgeColor: "bg-orange-100 text-orange-800"
  },
  "TOP_SECRET": {
    name: "Top Secret",
    level: 5,
    description: "Maximum security classification requiring highest clearance",
    examples: ["Critical security matters", "Board confidential items", "Legal privileged documents"],
    color: "text-red-700 bg-red-50 border-red-200",
    icon: LockClosedIcon,
    badgeColor: "bg-red-100 text-red-800"
  }
};

// Document categories - Updated comprehensive list (in alphabetical order)
const validDocumentCategories = [
  "Activity Reports",
  "Annual Reports", 
  "Asset Management Records",
  "Award Documents",
  "Baseline and Endline Reports",
  "Beneficiary Data & Records",
  "Board Meeting Minutes",
  "Budgets & Forecasts",
  "Capacity Building Materials",
  "Case Management Reports",
  "Communication & PR Materials",
  "Community Engagement Records",
  "Compliance & Audit Reports",
  "Conflict of Interest Declarations",
  "Contracts & Agreements",
  "Data Protection & Privacy Records",
  "Departmental Monthly Reports",
  "Disciplinary Reports",
  "Donor Reports",
  "Emergency Response Plans",
  "Employee Contracts",
  "Environmental Impact Assessments",
  "Event Documentation",
  "Exit Strategies & Closure Reports",
  "External Evaluation Reports",
  "Financial Documents",
  "Flagship Events Reports",
  "Fundraising Materials",
  "Government Relations Documents",
  "Grant Agreements",
  "Grant Proposals",
  "Health & Safety Records",
  "Impact Assessment Reports",
  "Incident Reports",
  "Insurance Documents",
  "Internal Audit Reports",
  "IT & Systems Documentation",
  "Job Descriptions & Specifications",
  "Knowledge Management Resources",
  "Legal Documents",
  "Lesson Learned Documents",
  "Management Accounts Reports",
  "Marketing Materials",
  "Media Coverage & Press Releases",
  "Meeting Notes & Action Items",
  "Memorandums of Understanding (MOUs)",
  "Monitoring & Evaluation Reports",
  "Observer Newsletters",
  "Organizational Charts",
  "Partnership Agreements",
  "Performance Appraisals",
  "Performance Improvement Plans",
  "Permit & License Documents",
  "Policies & Procedures",
  "Pre-Award Assessments",
  "Procurement & Tender Documents",
  "Project Proposals",
  "Quality Assurance Documents",
  "Recruitment & Selection Records",
  "Regulatory Compliance Documents",
  "Research Books",
  "Research Papers",
  "Risk Registers",
  "Safeguarding Policies & Reports",
  "Staff Handbooks",
  "Stakeholder Mapping & Analysis",
  "Standard Operating Procedures (SOPs)",
  "Strategic Plans",
  "Sustainability Reports",
  "Technical Specifications",
  "Terms of Reference (ToRs)",
  "Training Materials",
  "Travel Reports",
  "User Manuals & Guides",
  "Vendor & Supplier Records",
  "Volunteer Management Records",
  "Waste Management Plans",
  "Workshop & Conference Materials",
  "Workplans & Activity Schedules"
];

interface Document {
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
  uploadDate: string;  // Changed from createdAt to match repository
  updatedAt: string;
  customMetadata?: any;
}

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  onSave?: () => void;
}

export default function EditDocumentModal({ isOpen, onClose, documentId, onSave }: EditDocumentModalProps) {
  // State management
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    filename: '',
    category: '',
    classification: 'PUBLIC',
    description: '',
    tags: [] as string[],
    isPublic: false,
    customMetadata: {}
  });

  const [tagInput, setTagInput] = useState('');

  // Load document data when modal opens
  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
    }
  }, [isOpen, documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/documents/${documentId}`);
      
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
        
        // Populate form with existing data
        setFormData({
          filename: data.filename || '',
          category: data.category || '',
          classification: data.classification || 'PUBLIC',
          description: data.description || '',
          tags: data.tags || [],
          isPublic: data.isPublic || false,
          customMetadata: data.customMetadata || {}
        });
      } else if (response.status === 404) {
        setError('Document not found');
      } else if (response.status === 403) {
        setError('You do not have permission to access this document');
      } else if (response.status === 503) {
        setError('Database temporarily unavailable. Please try again in a moment.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to load document');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Error loading document');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave?.();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 503) {
          setError('Database temporarily unavailable. Please try again in a moment.');
        } else if (response.status === 404) {
          setError('Document not found or was deleted.');
        } else if (response.status === 403) {
          setError('You do not have permission to edit this document.');
        } else {
          setError(errorData.error || 'Failed to update document');
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError('Error saving document');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const selectedClassification = securityClassifications[formData.classification as keyof typeof securityClassifications] || securityClassifications["PUBLIC"];
  const ClassificationIcon = selectedClassification?.icon || ShieldCheckIcon;

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
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-br from-saywhat-orange via-orange-600 to-saywhat-red px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <PencilIcon className="h-6 w-6 text-white" />
                      </div>
                      <Dialog.Title className="text-xl font-bold text-white">
                        Edit Document
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-[80vh] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading document...</p>
                      </div>
                    </div>
                  ) : error && !document ? (
                    <div className="p-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-800">Error Loading Document</h3>
                        <p className="text-red-600 mt-2">{error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      {/* Error Message */}
                      {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-red-700">{error}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Document Info Sidebar */}
                        <div className="lg:col-span-1">
                          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Document Information</h4>
                            
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <DocumentIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="font-medium">File:</span>
                                <span className="ml-2 truncate">{document?.originalName}</span>
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600">
                                <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="font-medium">Size:</span>
                                <span className="ml-2">{document?.size ? formatFileSize(document.size) : 'Unknown'}</span>
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600">
                                <CloudArrowUpIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="font-medium">Uploaded:</span>
                                <span className="ml-2">{document?.uploadDate ? new Date(document.uploadDate).toLocaleDateString() : 'Unknown'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Edit Form */}
                        <div className="lg:col-span-2 space-y-4">
                          {/* Filename */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={formData.filename}
                              onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-sm"
                              placeholder="Enter document display name"
                            />
                          </div>

                          {/* Category */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Category
                            </label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-sm"
                            >
                              <option value="">Select a category</option>
                              {validDocumentCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </div>

                          {/* Security Classification */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Security Classification
                            </label>
                            <select
                              value={formData.classification}
                              onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-sm"
                            >
                              {Object.entries(securityClassifications).map(([key, classification]) => (
                                <option key={key} value={key}>{classification.name}</option>
                              ))}
                            </select>
                            <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedClassification.badgeColor}`}>
                              <ClassificationIcon className="h-3 w-3 mr-1" />
                              {selectedClassification.name}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{selectedClassification.description}</p>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-sm"
                              placeholder="Enter document description"
                            />
                          </div>

                          {/* Tags */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {formData.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <TagIcon className="h-3 w-3 mr-1" />
                                  {tag}
                                  <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                    type="button"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange text-sm"
                                placeholder="Add a tag"
                              />
                              <button
                                type="button"
                                onClick={addTag}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Public Access */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isPublic"
                              checked={formData.isPublic}
                              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                              className="h-4 w-4 text-saywhat-orange focus:ring-saywhat-orange border-gray-300 rounded"
                            />
                            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                              Make this document publicly accessible
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {!loading && document && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <button
                        onClick={onClose}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
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