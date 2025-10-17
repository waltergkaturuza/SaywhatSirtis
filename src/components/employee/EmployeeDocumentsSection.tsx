"use client";

import { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckIcon,
  CloudArrowUpIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

interface Document {
  id: string;
  title: string;
  fileName: string;
  description?: string;
  category: string;
  type: string;
  size: string;
  uploadDate: string;
  customMetadata?: {
    securityClassification?: string;
    category?: string;
    documentType?: string;
  };
}

interface EmployeeDocumentsSectionProps {
  employeeId: string;
  canUpload?: boolean;
}

const DOCUMENT_CATEGORIES = [
  { value: "CV/Resume", label: "CV/Resume", color: "purple" },
  { value: "ID Copy", label: "ID Copy", color: "blue" },
  { value: "Qualifications", label: "Qualifications", color: "green" },
  { value: "Contracts", label: "Contracts", color: "orange" },
  { value: "Medical", label: "Medical", color: "pink" },
  { value: "References", label: "References", color: "indigo" },
  { value: "Bank Details", label: "Bank Details", color: "gray" },
  { value: "Other", label: "Other", color: "yellow" },
];

export default function EmployeeDocumentsSection({
  employeeId,
  canUpload = true,
}: EmployeeDocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: "",
    category: "",
    description: "",
    documentType: "",
  });

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/documents?employeeId=${employeeId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDocuments(data || []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError("Failed to load documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("File type not supported. Please upload PDF, DOC, DOCX, JPG, or PNG files.");
        return;
      }

      setUploadForm((prev) => ({
        ...prev,
        file,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""), // Auto-fill title from filename
      }));
      setError(null);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    try {
      setUploading(true);
      setError(null);

      // Validation
      if (!uploadForm.file) {
        setError("Please select a file");
        return;
      }

      if (!uploadForm.title.trim()) {
        setError("Please enter a document title");
        return;
      }

      if (!uploadForm.category) {
        setError("Please select a category");
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("title", uploadForm.title.trim());
      formData.append("category", uploadForm.category);
      formData.append("classification", "CONFIDENTIAL"); // Employee documents are confidential
      formData.append("accessLevel", "individual"); // Only accessible to employee and HR

      // Add description if provided
      if (uploadForm.description.trim()) {
        formData.append("description", uploadForm.description.trim());
      }

      // Add custom metadata including employee ID
      const customMetadata = {
        relatedEmployeeId: employeeId,
        documentType: uploadForm.documentType || uploadForm.category,
        category: uploadForm.category,
        uploadedBy: "employee",
        securityClassification: "CONFIDENTIAL",
      };
      formData.append("customMetadata", JSON.stringify(customMetadata));

      // Add folder path for organization
      formData.append("folderPath", `employee-documents/${employeeId}/${uploadForm.category}`);

      // Upload document
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload document");
      }

      setSuccess("Document uploaded successfully!");
      setShowUploadModal(false);
      setUploadForm({
        file: null,
        title: "",
        category: "",
        description: "",
        documentType: "",
      });

      // Refresh documents list
      await fetchDocuments();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const cat = DOCUMENT_CATEGORIES.find(
      (c) => c.value.toLowerCase() === category.toLowerCase()
    );
    return cat?.color || "gray";
  };

  // Get category badge classes
  const getCategoryBadgeClass = (category: string) => {
    const color = getCategoryColor(category);
    const colorMap: { [key: string]: string } = {
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colorMap[color] || colorMap.gray;
  };

  // Group documents by category
  const groupedDocuments = documents.reduce((acc, doc) => {
    const category = doc.customMetadata?.category || doc.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as { [key: string]: Document[] });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center">
          <DocumentTextIcon className="mr-3 h-6 w-6" />
          Employee Documents
        </h3>
        {canUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white font-medium hover:bg-white/30 transition-all duration-200 hover:scale-105"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload Document
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg mb-2">No documents uploaded yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Upload your employee documents here for safekeeping
            </p>
            {canUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Upload Your First Document
              </button>
            )}
          </div>
        ) : (
          /* Documents Grid by Category */
          <div className="space-y-6">
            {Object.entries(groupedDocuments).map(([category, categoryDocs]) => (
              <div key={category}>
                <div className="flex items-center mb-3">
                  <FolderIcon className={`h-5 w-5 mr-2 text-${getCategoryColor(category)}-600`} />
                  <h4 className="text-lg font-semibold text-gray-900">{category}</h4>
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {categoryDocs.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="group p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                    >
                      {/* Document Icon & Type */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-lg ${getCategoryBadgeClass(category)}`}>
                          <DocumentTextIcon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {doc.type}
                        </span>
                      </div>

                      {/* Document Info */}
                      <h5 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {doc.title || doc.fileName}
                      </h5>

                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {doc.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>{doc.size}</span>
                        <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <a
                          href={`/api/documents/${doc.id}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </a>
                        <a
                          href={`/api/documents/${doc.id}/download`}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4 flex items-center justify-between sticky top-0">
              <h3 className="text-xl font-bold text-white flex items-center">
                <CloudArrowUpIcon className="mr-3 h-6 w-6" />
                Upload Document
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadForm({
                    file: null,
                    title: "",
                    category: "",
                    description: "",
                    documentType: "",
                  });
                  setError(null);
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploadForm.file ? uploadForm.file.name : "Click to select a file"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </span>
                  </label>
                </div>
              </div>

              {/* Document Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter document title"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="">Select a category</option>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                  placeholder="Add a brief description of this document"
                />
              </div>

              {/* Error in Modal */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadForm({
                    file: null,
                    title: "",
                    category: "",
                    description: "",
                    documentType: "",
                  });
                  setError(null);
                }}
                className="inline-flex items-center px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadForm.file || !uploadForm.title || !uploadForm.category}
                className="inline-flex items-center px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

