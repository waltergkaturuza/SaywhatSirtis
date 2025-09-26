"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  DocumentPlusIcon
} from "@heroicons/react/24/outline";

import {
  CloudArrowUpIcon as CloudArrowUpIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
} from "@heroicons/react/24/solid";

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const documentCategories = [
  "Activity Reports",
  "Annual Reports",
  "Baseline and Endline Reports",
  "Board Meeting Minutes",
  "Budgets & Forecasts",
  "Case Management Reports",
  "Compliance & Audit Reports",
  "Contracts & Agreements",
  "Departmental Monthly Reports",
  "Disciplinary Reports",
  "Donor Reports",
  "Employee Contracts",
  "Financial Documents",
  "Flagship Events Reports",
  "Grant Proposals",
  "Grant Agreements",
  "Health & Safety Records",
  "Insurance Documents",
  "IT & Systems Documentation",
  "Legal Documents",
  "Management Accounts Reports",
  "Marketing Materials",
  "Memorandums of Understanding (MOUs)",
  "Monitoring & Evaluation Reports",
  "Observer Newsletters",
  "Partnership Agreements",
  "Performance Appraisals",
  "Performance Improvement Plans",
  "Policies & Procedures",
  "Pre-Award Assessments",
  "Procurement & Tender Documents",
  "Project Proposals",
  "Research Books",
  "Research Papers",
  "Risk Registers",
  "Staff Handbooks",
  "Strategic Plans",
  "Sustainability Reports",
  "Training Materials",
  "Travel Reports",
  "Workplans & Activity Schedules"
];

const departments = [
  "Executive Office",
  "Human Resources",
  "Finance & Administration", 
  "Programs & Projects",
  "Monitoring & Evaluation",
  "Communications & Advocacy",
  "Call Centre",
  "IT & Systems",
  "Legal & Compliance",
  "Research & Development",
  "Operations",
  "Field Offices"
];

const securityLevels = [
  {
    value: "PUBLIC",
    label: "Public",
    description: "Information accessible to all employees within the organization",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: ShareIcon
  },
  {
    value: "CONFIDENTIAL", 
    label: "Confidential",
    description: "Sensitive information requiring authorized access",
    color: "text-orange-600 bg-orange-50 border-orange-200", 
    icon: LockClosedIcon
  },
  {
    value: "SECRET",
    label: "Secret", 
    description: "Highly sensitive information - restricted access",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: ShieldCheckIcon
  }
];

export default function WorldClassUploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form data
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [securityLevel, setSecurityLevel] = useState("PUBLIC");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach(uploadedFile => {
      simulateUpload(uploadedFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => 
        prev.map(file => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + Math.random() * 30, 100);
            const isCompleted = newProgress >= 100;
            
            return {
              ...file,
              progress: newProgress,
              status: isCompleted ? 'completed' : 'uploading'
            };
          }
          return file;
        })
      );
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, progress: 100, status: 'completed' }
            : file
        )
      );
    }, 3000);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate final processing
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      // Show success message or redirect
      router.push('/documents/world-class-repository');
    }, 1000);
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-saywhat-orange to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CloudArrowUpIconSolid className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
                  <p className="text-sm text-gray-500">Add files to your document repository</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center">
                  <DocumentPlusIcon className="w-6 h-6 text-saywhat-orange mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div className="p-8">
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    dragOver
                      ? 'border-saywhat-orange bg-orange-50 scale-105'
                      : 'border-gray-300 hover:border-saywhat-orange hover:bg-orange-50/30'
                  }`}
                >
                  <CloudArrowUpIcon className={`mx-auto h-16 w-16 transition-all duration-300 ${
                    dragOver ? 'text-saywhat-orange scale-110' : 'text-gray-400'
                  }`} />
                  
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {dragOver ? 'Drop files here' : 'Upload your documents'}
                  </h3>
                  
                  <p className="mt-2 text-gray-600 mb-6">
                    Drag and drop files here, or click to select files
                  </p>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-saywhat-orange to-orange-500 text-white font-medium rounded-lg hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-saywhat-orange focus:ring-offset-2 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <DocumentPlusIcon className="w-5 h-5 mr-2" />
                    Select Files
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                  
                  <p className="mt-4 text-sm text-gray-500">
                    Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, ZIP (Max: 50MB each)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      Uploaded Files ({uploadedFiles.length})
                    </h3>
                    
                    <div className="space-y-3">
                      {uploadedFiles.map((uploadedFile) => (
                        <div key={uploadedFile.id} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="text-2xl mr-3">{getFileIcon(uploadedFile.file)}</div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {uploadedFile.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(uploadedFile.file.size)}
                            </p>
                            
                            {uploadedFile.status === 'uploading' && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Uploading...</span>
                                  <span>{Math.round(uploadedFile.progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-gradient-to-r from-saywhat-orange to-orange-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadedFile.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4 flex items-center space-x-2">
                            {uploadedFile.status === 'completed' && (
                              <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
                            )}
                            
                            <button
                              onClick={() => removeFile(uploadedFile.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-all"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center">
                  <TagIcon className="w-6 h-6 text-saywhat-orange mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Document Details</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-transparent shadow-sm"
                    required
                  >
                    <option value="">Select category...</option>
                    {documentCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-transparent shadow-sm"
                    required
                  >
                    <option value="">Select department...</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Security Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Security Classification *
                  </label>
                  <div className="space-y-3">
                    {securityLevels.map(level => {
                      const IconComponent = level.icon;
                      return (
                        <label key={level.value} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="securityLevel"
                            value={level.value}
                            checked={securityLevel === level.value}
                            onChange={(e) => setSecurityLevel(e.target.value)}
                            className="mt-1 h-4 w-4 text-saywhat-orange focus:ring-saywhat-orange"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">{level.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{level.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-transparent shadow-sm resize-none"
                    placeholder="Brief description of the document..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange focus:border-transparent shadow-sm"
                    placeholder="Enter tags separated by commas..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    e.g. budget, 2025, quarterly, finance
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <button
                onClick={handleSubmit}
                disabled={uploadedFiles.length === 0 || !category || !department || isUploading}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white shadow-lg transform transition-all duration-200 ${
                  uploadedFiles.length > 0 && category && department && !isUploading
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Processing... {uploadProgress}%</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Upload {uploadedFiles.length} {uploadedFiles.length === 1 ? 'Document' : 'Documents'}</span>
                  </div>
                )}
              </button>
              
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Upload Guidelines</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Files are automatically organized by department and category</li>
                    <li>• All uploads are logged for audit purposes</li>
                    <li>• Large files may take longer to process</li>
                    <li>• Document processing includes metadata extraction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}