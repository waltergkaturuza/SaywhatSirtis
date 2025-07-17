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

// Document categories
const documentCategories = [
  "Annual Reports",
  "Policies & Procedures", 
  "Financial Documents",
  "Research Papers",
  "Governance",
  "Medical Protocols",
  "Program Reports",
  "Training Materials",
  "Legal Documents",
  "Marketing Materials"
];

// Security classifications
const securityClassifications = {
  "PUBLIC": {
    level: 0,
    description: "Information that can be freely shared with the public",
    color: "text-green-600 bg-green-100",
    icon: ShareIcon,
    examples: ["Annual reports", "Public statements", "Marketing materials"]
  },
  "INTERNAL": {
    level: 1,
    description: "Information for internal organizational use only",
    color: "text-blue-600 bg-blue-100", 
    icon: UserIcon,
    examples: ["Internal policies", "Staff communications", "Program updates"]
  },
  "CONFIDENTIAL": {
    level: 2,
    description: "Sensitive information requiring authorized access",
    color: "text-yellow-600 bg-yellow-100",
    icon: LockClosedIcon,
    examples: ["Financial reports", "Personnel files", "Audit documents"]
  },
  "RESTRICTED": {
    level: 3,
    description: "Highly sensitive information with limited access",
    color: "text-red-600 bg-red-100",
    icon: ShieldCheckIcon,
    examples: ["Board minutes", "Legal documents", "Strategic plans"]
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
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    classification: "INTERNAL",
    accessLevel: "organization",
    workflowType: "none",
    tags: [] as string[],
    folder: "/",
    version: "1.0",
    retentionPeriod: "",
    expiryDate: "",
    keywords: "",
    customMetadata: {} as Record<string, string>
  });

  const [tagInput, setTagInput] = useState("");
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
      setTimeout(() => {
        const mockAnalysis = {
          summary: "Document appears to contain organizational policy information with moderate complexity.",
          suggestedTags: ["policy", "organizational", "guidelines", "procedures"],
          suggestedClassification: "INTERNAL",
          contentType: files[0].type.includes('pdf') ? "PDF Document" : "Office Document",
          language: "English",
          readabilityScore: 0.75,
          sentimentScore: 0.6,
          keyTopics: ["Policy Implementation", "Organizational Procedures", "Compliance Requirements"],
          securityRisks: []
        };
        setAiAnalysis(mockAnalysis);
        setUploadState("idle");
      }, 2000);
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const applySuggestedTags = () => {
    if (aiAnalysis?.suggestedTags) {
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...aiAnalysis.suggestedTags!])]
      }));
    }
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

    setUploadState("uploading");
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate upload process
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState("success");
      
      // Reset form after success
      setTimeout(() => {
        setUploadState("idle");
        setSelectedFiles([]);
        setFormData({
          title: "",
          description: "",
          category: "",
          classification: "INTERNAL",
          accessLevel: "organization",
          workflowType: "none",
          tags: [],
          folder: "/",
          version: "1.0",
          retentionPeriod: "",
          expiryDate: "",
          keywords: "",
          customMetadata: {}
        });
        setAiAnalysis(null);
        setUploadProgress(0);
      }, 2000);
    }, 3000);
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
      <div className="max-w-4xl mx-auto">
        {uploadState === "success" ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Successful!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your document has been uploaded and is being processed. It will be available in the document library shortly.
            </p>
            <button
              onClick={() => window.location.href = '/documents'}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Document Library
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Files</h3>
              
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <CloudArrowUpIcon className="mx-auto h-16 w-16 text-gray-400" />
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Select Files
                  </button>
                  <p className="mt-2 text-sm text-gray-500">
                    or drag and drop files here
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max: 50MB per file)
                  </p>
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

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Files</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploadState === "uploading" && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Uploading...</span>
                    <span className="text-sm text-gray-500">{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* AI Processing */}
              {uploadState === "processing" && (
                <div className="mt-6 flex items-center justify-center p-4 bg-blue-50 rounded">
                  <CpuChipIcon className="h-5 w-5 text-blue-600 mr-2 animate-pulse" />
                  <span className="text-sm text-blue-700">AI is analyzing your document...</span>
                </div>
              )}
            </div>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">AI Analysis</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Document Summary</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {aiAnalysis.summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Content Analysis</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Type: <span className="font-medium">{aiAnalysis.contentType}</span></div>
                      <div>Language: <span className="font-medium">{aiAnalysis.language}</span></div>
                      <div>Readability: <span className="font-medium">{(aiAnalysis.readabilityScore! * 100).toFixed(0)}%</span></div>
                      <div>Sentiment: <span className="font-medium">{(aiAnalysis.sentimentScore! * 100).toFixed(0)}% Positive</span></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Suggested Tags</h4>
                      <button
                        type="button"
                        onClick={applySuggestedTags}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Apply All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {aiAnalysis.suggestedTags?.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Suggested Classification</h4>
                      <button
                        type="button"
                        onClick={applySuggestedClassification}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${securityClassifications[aiAnalysis.suggestedClassification! as keyof typeof securityClassifications]?.color}`}>
                      {aiAnalysis.suggestedClassification}
                    </span>
                  </div>
                </div>

                {aiAnalysis.keyTopics && aiAnalysis.keyTopics.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.keyTopics.map(topic => (
                        <span key={topic} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Document Metadata */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Document Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter document title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category...</option>
                    {documentCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide a detailed description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Path
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      <FolderIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={formData.folder}
                      onChange={(e) => setFormData(prev => ({ ...prev, folder: e.target.value }))}
                      className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="/Documents/Reports/"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1.0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 block w-full rounded-l-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add tags..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Access Control */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Access Control</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Security Classification *
                  </label>
                  <select
                    required
                    value={formData.classification}
                    onChange={(e) => setFormData(prev => ({ ...prev, classification: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(securityClassifications).map(([key, config]) => (
                      <option key={key} value={key}>{key} - {config.description}</option>
                    ))}
                  </select>
                  
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <div className="flex items-center mb-2">
                      <ClassificationIcon className="h-4 w-4 mr-2" />
                      <span className={`px-2 py-1 rounded text-xs font-medium ${selectedClassification.color}`}>
                        {formData.classification}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{selectedClassification.description}</p>
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">Examples:</p>
                      <ul className="text-xs text-gray-500 list-disc list-inside">
                        {selectedClassification.examples.map(example => (
                          <li key={example}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level *
                  </label>
                  <select
                    required
                    value={formData.accessLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessLevel: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {accessLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label} - {level.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Workflow
                  </label>
                  <select
                    value={formData.workflowType}
                    onChange={(e) => setFormData(prev => ({ ...prev, workflowType: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {workflowTypes.map(workflow => (
                      <option key={workflow.value} value={workflow.value}>
                        {workflow.label} - {workflow.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.location.href = '/documents'}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Save as Draft
                </button>
                
                <button
                  type="submit"
                  disabled={uploadState === "uploading" || selectedFiles.length === 0}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadState === "uploading" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                      Upload Document
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
