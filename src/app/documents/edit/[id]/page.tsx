'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { ModulePage } from '@/components/layout/enhanced-layout';
import {
  DocumentIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TagIcon,
  ShieldCheckIcon,
  FolderIcon,
  PencilIcon,
  CloudArrowUpIcon,
  ShareIcon,
  BuildingOfficeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const securityClassifications = {
  "PUBLIC": {
    level: 0,
    description: "Information accessible to all employees within the organization",
    color: "text-green-600 bg-green-100",
    icon: ShareIcon,
    examples: ["General policies", "Training materials", "Organization-wide announcements"]
  },
  "INTERNAL": {
    level: 1,
    description: "Information for internal use within the organization",
    color: "text-blue-600 bg-blue-100",
    icon: BuildingOfficeIcon,
    examples: ["Internal memos", "Department reports", "Employee communications", "Internal procedures"]
  },
  "CONFIDENTIAL": {
    level: 2,
    description: "Sensitive information requiring authorized access - confidential level",
    color: "text-saywhat-orange bg-orange-100",
    icon: LockClosedIcon,
    examples: ["Financial reports", "Personnel files", "Donor reports", "Management accounts"]
  },
  "SECRET": {
    level: 3,
    description: "Highly sensitive information - secret level classification",
    color: "text-saywhat-red bg-red-100",
    icon: ShieldCheckIcon,
    examples: ["Strategic plans", "Board minutes", "Grant proposals", "Legal documents"]
  },
  "TOP_SECRET": {
    level: 4,
    description: "Highly sensitive information - top secret level classification",
    color: "text-red-600 bg-red-100",
    icon: ShieldCheckIcon,
    examples: ["Executive decisions", "Sensitive investigations", "Critical strategic documents"]
  }
};

const documentCategories = [
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
  createdAt: string;
  updatedAt: string;
  customMetadata?: any;
}

export default function EditDocumentPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  // State management
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  // Load document data
  useEffect(() => {
    if (documentId && status === "authenticated") {
      loadDocument();
    }
  }, [documentId, status]);

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
      setSuccess(false);

      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        // Optionally redirect back to document view after a delay
        setTimeout(() => {
          router.push(`/documents/${documentId}`);
        }, 2000);
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

  // Show loading state
  if (status === "loading" || loading) {
    return (
      <ModulePage
        metadata={{
          title: "Edit Document",
          description: "Edit document metadata and properties",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Edit Document" }
          ]
        }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading document...</p>
          </div>
        </div>
      </ModulePage>
    );
  }

  // Show error state
  if (error && !document) {
    return (
      <ModulePage
        metadata={{
          title: "Edit Document",
          description: "Edit document metadata and properties",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Edit Document" }
          ]
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800">Error Loading Document</h3>
            <p className="text-red-600 mt-2">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </ModulePage>
    );
  }

  const selectedClassification = securityClassifications[formData.classification as keyof typeof securityClassifications] || securityClassifications["PUBLIC"];
  const ClassificationIcon = selectedClassification?.icon || ShieldCheckIcon;

  return (
    <ModulePage
      metadata={{
        title: "Edit Document",
        description: "Edit document metadata and properties",
        breadcrumbs: [
          { name: "Document Repository", href: "/documents" },
          { name: document?.filename || "Document", href: `/documents/${documentId}` },
          { name: "Edit" }
        ]
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-saywhat-orange via-orange-600 to-saywhat-red rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <PencilIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Edit Document</h1>
              </div>
              <p className="text-orange-100 text-lg">
                Update document metadata and properties
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">Document updated successfully! Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">File:</span>
                  <span className="ml-2 truncate">{document?.originalName}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <FolderIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Size:</span>
                  <span className="ml-2">{document?.size ? formatFileSize(document.size) : 'Unknown'}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Uploaded:</span>
                  <span className="ml-2">{document?.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {/* Filename */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.filename}
                  onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
                >
                  <option value="">Select a category</option>
                  {documentCategories.map(category => (
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
                >
                  {Object.entries(securityClassifications).map(([key, classification]) => (
                    <option key={key} value={key}>{key} - {classification.description}</option>
                  ))}
                </select>
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${selectedClassification.color}`}>
                  <ClassificationIcon className="h-4 w-4 mr-1" />
                  {formData.classification}
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedClassification.description}</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
                  placeholder="Enter document description"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}