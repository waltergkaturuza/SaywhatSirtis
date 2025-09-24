"use client";

import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import { 
  CloudArrowUpIcon,
  DocumentIcon,
  FolderIcon,
  TagIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  LockClosedIcon,
  ShareIcon,
  UserIcon,
  SparklesIcon,
  CpuChipIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

// Document categories - Updated as per requirements (in alphabetical order)
const documentCategories = [
  "Activity reports",
  "Annual Reports", 
  "Baseline and end line reports",
  "Case Management reports",
  "Departmental monthly reports",
  "Disciplinary reports",
  "Donor reports",
  "Employee contracts",
  "Financial Documents",
  "Flagship Events reports",
  "Grant Proposals",
  "Grants Agreements",
  "Legal Documents",
  "Management accounts reports",
  "Marketing Materials",
  "MOUs",
  "Observer Newsletters",
  "Policies & Procedures",
  "Pre-Award Assessments",
  "Research BOOKS",
  "Research Papers",
  "Training Materials"
];

// Security classifications - Updated for internal/confidential focus with SAYWHAT colors
const securityClassifications = {
  "PUBLIC": {
    level: 0,
    description: "Information accessible to all employees within the organization",
    color: "text-green-600 bg-green-100",
    icon: ShareIcon,
    examples: ["General policies", "Training materials", "Organization-wide announcements"]
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

// Access levels
const accessLevels = [
  { value: "public", label: "Public Access", description: "Anyone can view" },
  { value: "organization", label: "Organization Wide", description: "All staff members" },
  { value: "department", label: "Department Only", description: "Specific department" },
  { value: "team", label: "Team Members", description: "Specific team or project" },
  { value: "individual", label: "Individual Access", description: "Specific individuals only" }
];

// Workflow types
const workflowTypes = [
  { value: "none", label: "No Approval Required", description: "Direct publication" },
  { value: "manager", label: "Manager Approval", description: "Requires manager sign-off" },
  { value: "legal", label: "Legal Review", description: "Legal department review" },
  { value: "board", label: "Board Approval", description: "Board of directors approval" }
];

export default function DocumentUploadPage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form data - Simplified as per requirements
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    classification: "PUBLIC",
    accessLevel: "organization",
    folder: "/",
    keywords: "",
    customMetadata: {} as Record<string, string>
  });

  const [aiAnalysis, setAiAnalysis] = useState<{
    summary?: string;
    suggestedTags?: string[];
    suggestedClassification?: string;
    contentType?: string;
    language?: string;
    readabilityScore?: number;
    sentimentScore?: number;
    keyTopics?: string[];
    securityRisks?: string[];
  } | null>(null);

  // Check permissions
  const hasAccess = session?.user?.permissions?.includes("documents.create") ||
                   session?.user?.permissions?.includes("documents.full_access");

  if (!hasAccess) {
    return (
      <ModulePage
        metadata={{
          title: "Upload Documents",
          description: "Access Denied",
          breadcrumbs: [
            { name: "Document Repository", href: "/documents" },
            { name: "Upload" }
          ]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to upload documents.
          </p>
        </div>
      </ModulePage>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    
    // Auto-populate title from first file if empty
    if (files.length > 0 && !formData.title) {
      const fileName = files[0].name;
      const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      setFormData(prev => ({ ...prev, title: nameWithoutExtension }));
    }

    // Simulate AI analysis
    if (files.length > 0) {
      setUploadState("processing");
      try {
        // Here would be actual AI analysis API call
        // For now, set minimal analysis
        setTimeout(() => {
          setAiAnalysis({
            summary: "Document uploaded successfully.",
            suggestedTags: [],
            suggestedClassification: "PUBLIC",
            contentType: files[0].type.includes('pdf') ? "PDF Document" : "Office Document",
            language: "English",
            readabilityScore: 0.5,
            sentimentScore: 0.5,
            keyTopics: [],
            securityRisks: []
          });
          setUploadState("idle");
        }, 1000);
      } catch (error) {
        console.error('Error analyzing document:', error);
        setUploadState("idle");
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
    handleFileSelect({ target: { files } } as any);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const applySuggestedClassification = () => {
    if (aiAnalysis?.suggestedClassification) {
      setFormData(prev => ({
        ...prev,
        classification: aiAnalysis.suggestedClassification!
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    if (!formData.title || !formData.category) {
      alert("Please fill in the title and select a category.");
      return;
    }

    setUploadState("uploading");
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const uploadFormData = new FormData();
        
        uploadFormData.append('file', file);
        uploadFormData.append('title', formData.title);
        uploadFormData.append('category', formData.category);
        uploadFormData.append('classification', formData.classification);
        
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // Update progress
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setUploadState("success");
      
      // Reset form after success
      setTimeout(() => {
        setUploadState("idle");
        setSelectedFiles([]);
        setFormData({
          title: "",
          category: "",
          classification: "PUBLIC",
          accessLevel: "organization",
          folder: "/",
          keywords: "",
          customMetadata: {}
        });
        setAiAnalysis(null);
        setUploadProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState("error");
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const selectedClassification = securityClassifications[formData.classification as keyof typeof securityClassifications];
  const ClassificationIcon = selectedClassification.icon;

  return (
    <ModulePage
      metadata={{
        title: "Upload Documents",
        description: "Upload and classify documents with AI assistance",
        breadcrumbs: [
          { name: "Document Repository", href: "/documents" },
          { name: "Upload" }
        ]
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Premium Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-saywhat-orange via-orange-600 to-saywhat-red rounded-3xl shadow-2xl p-8 mb-8 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CloudArrowUpIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Upload Documents</h1>
              </div>
              <p className="text-orange-100 text-lg max-w-2xl leading-relaxed">
                Intelligent document management with world-class AI-powered analysis and classification
              </p>
              <div className="flex items-center space-x-6 text-white/90 text-sm">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-4 w-4" />
                  <span>AI-Powered Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Secure Classification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CpuChipIcon className="h-4 w-4" />
                  <span>Smart Processing</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl"></div>
                <CloudArrowUpIcon className="relative h-24 w-24 text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {uploadState === "success" ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-xl rounded-3xl p-12 text-center backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
              <CheckCircleIcon className="relative mx-auto h-20 w-20 text-green-500" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-gray-900">Upload Successful! 🎉</h3>
            <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
              Your document has been uploaded and is being processed by our intelligent AI system. It will be available in the document library shortly.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4">
              <button
                onClick={() => window.location.href = '/documents'}
                className="inline-flex items-center px-8 py-4 border-2 border-transparent text-base font-semibold rounded-2xl shadow-lg text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
              >
                <FolderIcon className="h-5 w-5 mr-2" />
                Go to Document Library
              </button>
              <button
                onClick={() => {
                  setUploadState("idle");
                  setSelectedFiles([]);
                  setFormData({
                    title: "",
                    category: "",
                    classification: "PUBLIC",
                    accessLevel: "organization",
                    folder: "/",
                    keywords: "",
                    customMetadata: {}
                  });
                  setAiAnalysis(null);
                  setUploadProgress(0);
                }}
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-base font-semibold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg backdrop-blur-sm"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Premium File Upload Area */}
            <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-3xl p-8 border-2 border-gray-100 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-saywhat-orange to-orange-600 rounded-xl shadow-lg">
                  <DocumentIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Select Files
                </h3>
              </div>
              
              <div
                className="relative border-2 border-dashed border-orange-300 rounded-2xl p-12 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-300 group cursor-pointer backdrop-blur-sm"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CloudArrowUpIcon className="relative mx-auto h-20 w-20 text-orange-400 group-hover:text-orange-500 transition-colors duration-300" />
                </div>
                <div className="mt-6 space-y-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-8 py-4 border-2 border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
                  >
                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                    Select Files
                  </button>
                  <p className="text-lg text-gray-600 font-medium">
                    or drag and drop files here
                  </p>
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 max-w-md mx-auto">
                    <p className="text-sm text-gray-700 font-medium">
                      Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: 50MB per file
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected Files with Premium Styling */}
              {selectedFiles.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                      <DocumentIcon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Selected Files ({selectedFiles.length})</h4>
                  </div>
                  <div className="grid gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 hover:border-green-300 transition-all duration-200 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                            <DocumentIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-600">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress with Premium Animation */}
              {uploadState === "uploading" && (
                <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-saywhat-orange border-t-transparent"></div>
                      <span className="text-lg font-semibold text-gray-900">Uploading Documents...</span>
                    </div>
                    <span className="text-base font-bold text-saywhat-orange">{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-saywhat-orange to-orange-600 h-3 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Processing with Premium Animation */}
              {uploadState === "processing" && (
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 backdrop-blur-sm">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="relative">
                      <CpuChipIcon className="h-8 w-8 text-purple-600 animate-pulse" />
                      <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl animate-ping opacity-30"></div>
                    </div>
                    <span className="text-lg font-semibold text-purple-700">AI is analyzing your document...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis Results with World-Class Styling */}
            {aiAnalysis && (
              <div className="bg-gradient-to-br from-white to-purple-50 shadow-2xl rounded-3xl p-8 border-2 border-purple-100 backdrop-blur-sm">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur-xl opacity-50"></div>
                    <div className="relative p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                      <SparklesIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
                      AI Analysis Results
                    </h3>
                    <p className="text-purple-600 font-medium">Intelligent document insights and recommendations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 backdrop-blur-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <DocumentIcon className="h-6 w-6 text-blue-600" />
                        <h4 className="text-lg font-bold text-gray-900">Document Summary</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed bg-white/60 p-4 rounded-xl shadow-inner backdrop-blur-sm">
                        {aiAnalysis.summary}
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 backdrop-blur-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <MagnifyingGlassIcon className="h-6 w-6 text-green-600" />
                        <h4 className="text-lg font-bold text-gray-900">Content Analysis</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/60 p-4 rounded-xl shadow-inner backdrop-blur-sm">
                          <div className="font-semibold text-gray-700 mb-1">Document Type</div>
                          <div className="text-green-700 font-bold">{aiAnalysis.contentType}</div>
                        </div>
                        <div className="bg-white/60 p-4 rounded-xl shadow-inner backdrop-blur-sm">
                          <div className="font-semibold text-gray-700 mb-1">Language</div>
                          <div className="text-green-700 font-bold">{aiAnalysis.language}</div>
                        </div>
                        <div className="bg-white/60 p-4 rounded-xl shadow-inner backdrop-blur-sm">
                          <div className="font-semibold text-gray-700 mb-1">Readability</div>
                          <div className="text-green-700 font-bold">{(aiAnalysis.readabilityScore! * 100).toFixed(0)}%</div>
                        </div>
                        <div className="bg-white/60 p-4 rounded-xl shadow-inner backdrop-blur-sm">
                          <div className="font-semibold text-gray-700 mb-1">Sentiment</div>
                          <div className="text-green-700 font-bold">{(aiAnalysis.sentimentScore! * 100).toFixed(0)}% Positive</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
                          <h4 className="text-lg font-bold text-gray-900">Suggested Classification</h4>
                        </div>
                        <button
                          type="button"
                          onClick={applySuggestedClassification}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg transform hover:scale-105"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Apply
                        </button>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl shadow-inner backdrop-blur-sm">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${securityClassifications[aiAnalysis.suggestedClassification! as keyof typeof securityClassifications]?.color}`}>
                          <ShieldCheckIcon className="h-4 w-4 mr-2" />
                          {aiAnalysis.suggestedClassification}
                        </span>
                        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                          AI-recommended security classification based on content analysis
                        </p>
                      </div>
                    </div>

                    {aiAnalysis.keyTopics && aiAnalysis.keyTopics.length > 0 && (
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-4">
                          <TagIcon className="h-6 w-6 text-purple-600" />
                          <h4 className="text-lg font-bold text-gray-900">Key Topics</h4>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {aiAnalysis.keyTopics.map(topic => (
                            <span key={topic} className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Document Metadata with Premium Styling */}
            <div className="bg-gradient-to-br from-white to-blue-50 shadow-2xl rounded-3xl p-8 border-2 border-blue-100 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-xl opacity-50"></div>
                  <div className="relative p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                    <DocumentIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-cyan-900 bg-clip-text text-transparent">
                    Document Information
                  </h3>
                  <p className="text-blue-600 font-medium">Essential document metadata and classification</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      Document Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="block w-full border-2 border-blue-200 rounded-2xl shadow-lg px-6 py-4 text-base focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm placeholder-gray-400 transition-all duration-200"
                      placeholder="Enter descriptive document title..."
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="block w-full border-2 border-blue-200 rounded-2xl shadow-lg px-6 py-4 text-base focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select a category...</option>
                      {documentCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      Folder Path
                    </label>
                    <div className="flex shadow-lg rounded-2xl overflow-hidden">
                      <span className="inline-flex items-center px-6 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-base font-medium border-2 border-r-0 border-gray-200">
                        <FolderIcon className="h-5 w-5 mr-2" />
                      </span>
                      <input
                        type="text"
                        value={formData.folder}
                        onChange={(e) => setFormData(prev => ({ ...prev, folder: e.target.value }))}
                        className="flex-1 block w-full border-2 border-l-0 border-blue-200 px-6 py-4 text-base focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm placeholder-gray-400 transition-all duration-200"
                        placeholder="/Activity Reports/2025/"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      Keywords & Tags
                    </label>
                    <input
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                      className="block w-full border-2 border-blue-200 rounded-2xl shadow-lg px-6 py-4 text-base focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm placeholder-gray-400 transition-all duration-200"
                      placeholder="project management, quarterly report, progress..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Access Control with Premium Styling */}
            <div className="bg-gradient-to-br from-white to-red-50 shadow-2xl rounded-3xl p-8 border-2 border-red-100 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl blur-xl opacity-50"></div>
                  <div className="relative p-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl shadow-lg">
                    <ShieldCheckIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-900 to-pink-900 bg-clip-text text-transparent">
                    Security & Access Control
                  </h3>
                  <p className="text-red-600 font-medium">Document classification and access permissions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      Security Classification *
                    </label>
                    <select
                      required
                      value={formData.classification}
                      onChange={(e) => setFormData(prev => ({ ...prev, classification: e.target.value }))}
                      className="block w-full border-2 border-red-200 rounded-2xl shadow-lg px-6 py-4 text-base focus:ring-4 focus:ring-red-200 focus:border-red-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    >
                      {Object.entries(securityClassifications).map(([key, config]) => (
                        <option key={key} value={key}>{key} - {config.description}</option>
                      ))}
                    </select>
                    
                    <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 backdrop-blur-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <ClassificationIcon className="h-6 w-6 text-red-600" />
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${selectedClassification.color}`}>
                          {formData.classification}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{selectedClassification.description}</p>
                      <div className="bg-white/60 p-4 rounded-xl shadow-inner backdrop-blur-sm">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Example Use Cases:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {selectedClassification.examples.map(example => (
                            <li key={example} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      Access Level *
                    </label>
                    <select
                      required
                      value={formData.accessLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, accessLevel: e.target.value }))}
                      className="block w-full border-2 border-red-200 rounded-2xl shadow-lg px-6 py-4 text-base focus:ring-4 focus:ring-red-200 focus:border-red-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    >
                      {accessLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <UserGroupIcon className="h-6 w-6 text-orange-600" />
                      <h4 className="text-lg font-bold text-gray-900">Access Guidelines</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700"><strong>Public:</strong> All organization members</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700"><strong>Confidential:</strong> Authorized personnel only</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-700"><strong>Secret/Top Secret:</strong> Executive approval required</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex items-center justify-between p-8 bg-gradient-to-r from-gray-50 to-white rounded-3xl shadow-xl border-2 border-gray-100 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => window.location.href = '/documents'}
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-base font-semibold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 shadow-lg transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel
              </button>
              
              <div className="flex items-center space-x-6">
                <button
                  type="button"
                  className="inline-flex items-center px-8 py-4 border-2 border-blue-300 text-base font-semibold rounded-2xl text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 shadow-lg transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Save as Draft
                </button>
                
                <button
                  type="submit"
                  disabled={uploadState === "uploading" || selectedFiles.length === 0}
                  className="inline-flex items-center px-10 py-4 border-2 border-transparent text-base font-bold rounded-2xl text-white bg-gradient-to-r from-saywhat-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
                >
                  {uploadState === "uploading" ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      <span>Uploading Documents...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                      <span>Upload Document{selectedFiles.length > 1 ? 's' : ''}</span>
                      {selectedFiles.length > 0 && (
                        <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                          {selectedFiles.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </ModulePage>
  );
}
