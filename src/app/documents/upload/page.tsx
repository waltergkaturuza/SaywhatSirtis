"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
// import ModulePage from "@/components/ui/module-page";
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
  DocumentIcon as DocumentIconSolid,
} from "@heroicons/react/24/solid";

// Document categories
const documentCategories = [
  "General Document",
  "Activity Reports",
  "Approval Documents",
  "Assessment Reports", 
  "Audit Documents",
  "Board Meeting Minutes",
  "Budget & Financial Documents",
  "Certificates & Credentials",
  "Communication & Correspondence",
  "Compliance Documents",
  "Contracts & Agreements",
  "Data Collection & Analysis",
  "Employee Documents",
  "Event Planning & Reports",
  "External Communication",
  "Feasibility Studies",
  "Financial Statements",
  "Grant Applications & Reports",
  "HR Policies & Procedures", 
  "Impact Assessment",
  "Internal Policies",
  "Invoices & Receipts",
  "Job Descriptions",
  "Legal Documents",
  "Meeting Minutes",
  "Monitoring & Evaluation",
  "Partnership Agreements",
  "Performance Reviews",
  "Project Documentation",
  "Project Plans & Proposals",
  "Procurement Documents",
  "Progress Reports",
  "Quality Assurance",
  "Research & Studies",
  "Risk Management",
  "SOPs (Standard Operating Procedures)",
  "Strategic Plans",
  "Tender Documents",
  "Training Materials",
  "User Manuals & Guides",
  "Vendor & Supplier Records",
  "Volunteer Management Records",
  "Waste Management Plans",
  "Workshop & Conference Materials",
  "Workplans & Activity Schedules"
];

const categorizedFolders: Record<string, { categoryEnum: string; displayName: string }> = {
  'General Document': { categoryEnum: 'OTHER', displayName: 'General Document' },
  'Activity Reports': { categoryEnum: 'REPORT', displayName: 'Activity Reports' },
  'Approval Documents': { categoryEnum: 'OTHER', displayName: 'Approval Documents' },
  'Assessment Reports': { categoryEnum: 'REPORT', displayName: 'Assessment Reports' },
  'Audit Documents': { categoryEnum: 'REPORT', displayName: 'Audit Documents' },
  'Board Meeting Minutes': { categoryEnum: 'REPORT', displayName: 'Board Meeting Minutes' },
  'Budget & Financial Documents': { categoryEnum: 'INVOICE', displayName: 'Budget & Financial Documents' },
  'Certificates & Credentials': { categoryEnum: 'FORM', displayName: 'Certificates & Credentials' },
  'Communication & Correspondence': { categoryEnum: 'OTHER', displayName: 'Communication & Correspondence' },
  'Compliance Documents': { categoryEnum: 'OTHER', displayName: 'Compliance Documents' },
  'Contracts & Agreements': { categoryEnum: 'CONTRACT', displayName: 'Contracts & Agreements' },
  'Data Collection & Analysis': { categoryEnum: 'SPREADSHEET', displayName: 'Data Collection & Analysis' },
  'Employee Documents': { categoryEnum: 'FORM', displayName: 'Employee Documents' },
  'Event Planning & Reports': { categoryEnum: 'REPORT', displayName: 'Event Planning & Reports' },
  'External Communication': { categoryEnum: 'OTHER', displayName: 'External Communication' },
  'Feasibility Studies': { categoryEnum: 'REPORT', displayName: 'Feasibility Studies' },
  'Financial Statements': { categoryEnum: 'REPORT', displayName: 'Financial Statements' },
  'Grant Applications & Reports': { categoryEnum: 'REPORT', displayName: 'Grant Applications & Reports' },
  'HR Policies & Procedures': { categoryEnum: 'POLICY', displayName: 'HR Policies & Procedures' },
  'Impact Assessment': { categoryEnum: 'REPORT', displayName: 'Impact Assessment' },
  'Internal Policies': { categoryEnum: 'POLICY', displayName: 'Internal Policies' },
  'Invoices & Receipts': { categoryEnum: 'INVOICE', displayName: 'Invoices & Receipts' },
  'Job Descriptions': { categoryEnum: 'FORM', displayName: 'Job Descriptions' },
  'Legal Documents': { categoryEnum: 'CONTRACT', displayName: 'Legal Documents' },
  'Meeting Minutes': { categoryEnum: 'REPORT', displayName: 'Meeting Minutes' },
  'Monitoring & Evaluation': { categoryEnum: 'REPORT', displayName: 'Monitoring & Evaluation' },
  'Partnership Agreements': { categoryEnum: 'CONTRACT', displayName: 'Partnership Agreements' },
  'Performance Reviews': { categoryEnum: 'REPORT', displayName: 'Performance Reviews' },
  'Project Documentation': { categoryEnum: 'REPORT', displayName: 'Project Documentation' },
  'Project Plans & Proposals': { categoryEnum: 'REPORT', displayName: 'Project Plans & Proposals' },
  'Procurement Documents': { categoryEnum: 'OTHER', displayName: 'Procurement Documents' },
  'Progress Reports': { categoryEnum: 'REPORT', displayName: 'Progress Reports' },
  'Quality Assurance': { categoryEnum: 'REPORT', displayName: 'Quality Assurance' },
  'Research & Studies': { categoryEnum: 'REPORT', displayName: 'Research & Studies' },
  'Risk Management': { categoryEnum: 'OTHER', displayName: 'Risk Management' },
  'SOPs (Standard Operating Procedures)': { categoryEnum: 'PROCEDURE', displayName: 'SOPs' },
  'Strategic Plans': { categoryEnum: 'REPORT', displayName: 'Strategic Plans' },
  'Tender Documents': { categoryEnum: 'OTHER', displayName: 'Tender Documents' },
  'Training Materials': { categoryEnum: 'OTHER', displayName: 'Training Materials' },
  'User Manuals & Guides': { categoryEnum: 'OTHER', displayName: 'User Manuals & Guides' },
  'Vendor & Supplier Records': { categoryEnum: 'OTHER', displayName: 'Vendor & Supplier Records' },
  'Volunteer Management Records': { categoryEnum: 'OTHER', displayName: 'Volunteer Management Records' },
  'Waste Management Plans': { categoryEnum: 'OTHER', displayName: 'Waste Management Plans' },
  'Workshop & Conference Materials': { categoryEnum: 'REPORT', displayName: 'Workshop & Conference Materials' },
  'Workplans & Activity Schedules': { categoryEnum: 'REPORT', displayName: 'Workplans & Activity Schedules' }
};

// Security classifications - Updated for internal/confidential focus with SAYWHAT colors
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

const sanitizeFolderSegment = (value: string) => {
  if (!value) return '';
  return value
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[\\/]+/g, '-');
};

const buildFolderPath = (department: string, category: string) => {
  const departmentSegment = sanitizeFolderSegment(department) || 'General';
  const categorySegment = sanitizeFolderSegment(category) || 'General Document';
  return `${departmentSegment}/${categorySegment}`;
};

const resolveCategoryInfo = (category: string) => {
  const mapped = categorizedFolders[category] || categorizedFolders['General Document'];
  return {
    name: category,
    enum: mapped.categoryEnum,
    display: mapped.displayName,
  };
};

export default function DocumentUploadPage() {
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userDepartment, setUserDepartment] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isPersonalRepo, setIsPersonalRepo] = useState<boolean>(true); // Default to personal repo
  
  // Access level specific selections
  const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Array<{name: string, code: string}>>([]);
  const [availableTeams, setAvailableTeams] = useState<Array<{id: string, name: string}>>([]);
  
  // Form data - Enhanced with auto-captured user info
  const [formData, setFormData] = useState({
    title: "",
    category: "General Document",
    categoryEnum: categorizedFolders['General Document'].categoryEnum,
    categoryDisplay: categorizedFolders['General Document'].displayName,
    classification: "PUBLIC",
    accessLevel: "organization",
    folder: "General/General Document",
    keywords: "",
    customMetadata: {} as Record<string, string>,
    // Auto-captured fields (read-only)
    uploadedBy: "",
    department: "General",
    status: "draft" // draft, pending, published
  });
  const [folderManuallyEdited, setFolderManuallyEdited] = useState(false);

  const setCategorySelection = (categoryName: string) => {
    const { name, enum: categoryEnum, display } = resolveCategoryInfo(categoryName);
    setFormData(prev => ({
      ...prev,
      category: name,
      categoryEnum,
      categoryDisplay: display,
    }));
  };

  const [aiAnalysis, setAiAnalysis] = useState<{
    summary?: string;
    suggestedTags?: string[];
    suggestedCategory?: string;
    suggestedClassification?: string;
    contentType?: string;
    language?: string;
    readabilityScore?: number;
    sentimentScore?: number;
    keyTopics?: string[];
    securityRisks?: string[];
  } | null>(null);

  // Auto-load user information on component mount
  useEffect(() => {
    if (session?.user) {
      const currentUserName = session.user.name || session.user.email || 'Unknown User';
      setUserName(currentUserName);
      
      // Update form data with user info
      setFormData(prev => ({
        ...prev,
        uploadedBy: currentUserName,
        department: prev.department || 'General',
        status: isPersonalRepo ? 'draft' : 'pending'
      }));
      
      // Load user's department
      loadUserDepartment();
    }
  }, [session, isPersonalRepo]);

  useEffect(() => {
    if (folderManuallyEdited) return;
    const departmentValue = formData.department || userDepartment || 'General';
    const categoryValue = formData.categoryDisplay || formData.category || 'General Document';
    const computedPath = buildFolderPath(departmentValue, categoryValue);
    setFormData(prev => (prev.folder === computedPath ? prev : { ...prev, folder: computedPath }));
  }, [formData.department, formData.categoryDisplay, formData.category, userDepartment, folderManuallyEdited]);

  // Load user's department information
  const loadUserDepartment = async () => {
    try {
      if (session?.user?.email) {
        const response = await fetch(`/api/hr/employees/by-email/${encodeURIComponent(session.user.email)}`);
        if (response.ok) {
          const employeeData = await response.json();
          const department = employeeData.department?.name || 'General';
          setUserDepartment(department);
          setFormData(prev => ({
            ...prev,
            department: department
          }));
        } else {
          // Fallback if employee not found
          setUserDepartment('General');
          setFormData(prev => ({
            ...prev,
            department: 'General'
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user department:', error);
      setUserDepartment('General');
      setFormData(prev => ({
        ...prev,
        department: 'General'
      }));
    }
  };

  // Load available users for individual access
  const loadAvailableUsers = async () => {
    try {
      console.log('Loading users...');
      console.log('Session status:', status);
      console.log('Session data:', session);
      
      const response = await fetch('/api/users?format=simple', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Users response status:', response.status);
      console.log('Users response headers:', response.headers);
      
      if (response.ok) {
        const users = await response.json();
        console.log('Users data received:', users);
        const transformedUsers = users.map((user: any) => ({
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          email: user.email
        }));
        console.log('Transformed users:', transformedUsers);
        setAvailableUsers(transformedUsers);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load available departments
  const loadAvailableDepartments = async () => {
    try {
      console.log('Loading departments...');
      const response = await fetch('/api/hr/departments');
      console.log('Departments response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Departments data received:', data);
        const departments = data.departments || [];
        const transformedDepartments = departments.map((dept: any) => ({
          name: dept.name,
          code: dept.code || dept.name
        }));
        console.log('Transformed departments:', transformedDepartments);
        setAvailableDepartments(transformedDepartments);
      } else {
        console.error('Failed to fetch departments:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  // Load available teams/projects
  const loadAvailableTeams = async () => {
    try {
      console.log('Loading teams/projects...');
      const response = await fetch('/api/projects');
      console.log('Teams/projects response status:', response.status);
      if (response.ok) {
        const projects = await response.json();
        console.log('Projects data received:', projects);
        const transformedProjects = projects.map((project: any) => ({
          id: project.id,
          name: project.name
        }));
        console.log('Transformed projects:', transformedProjects);
        setAvailableTeams(transformedProjects);
      } else {
        console.error('Failed to fetch projects:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      // Fallback to some default teams
      const fallbackTeams = [
        { id: 'hr', name: 'Human Resources Team' },
        { id: 'finance', name: 'Finance Team' },
        { id: 'operations', name: 'Operations Team' },
        { id: 'programs', name: 'Programs Team' }
      ];
      console.log('Using fallback teams:', fallbackTeams);
      setAvailableTeams(fallbackTeams);
    }
  };

  // Load data when access level changes
  useEffect(() => {
    // Only load data if we have an authenticated session
    if (status !== "authenticated" || !session) {
      return;
    }

    if (formData.accessLevel === 'individual' && availableUsers.length === 0) {
      loadAvailableUsers();
    }
    if (formData.accessLevel === 'department' && availableDepartments.length === 0) {
      loadAvailableDepartments();
    }
    if (formData.accessLevel === 'team' && availableTeams.length === 0) {
      loadAvailableTeams();
    }
  }, [formData.accessLevel, status, session]);

  // Check permissions and session status
  const hasAccess = session?.user?.permissions?.includes("documents.create") ||
                   session?.user?.permissions?.includes("documents.full_access");

  // Show loading state if session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-gray-600">Please sign in to access this page.</p>
              <button
                onClick={() => window.location.href = '/auth/signin'}
                className="mt-4 px-6 py-2 bg-saywhat-orange text-white rounded-lg hover:bg-orange-600"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to upload documents.
          </p>
        </div>
      </div>
    );
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    
    // Auto-populate title from first file if empty
    if (files.length > 0 && !formData.title) {
      const fileName = files[0].name;
      const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      setFormData(prev => ({ ...prev, title: nameWithoutExtension }));
    }

    // Intelligent AI analysis
    if (files.length > 0) {
      setUploadState("processing");
      try {
        // Call our intelligent AI analysis API
        const analysisFormData = new FormData();
        analysisFormData.append('file', files[0]);
        analysisFormData.append('category', formData.category || 'General Document');
        analysisFormData.append('title', formData.title || files[0].name);
        
        const response = await fetch('/api/documents/ai-analyze', {
          method: 'POST',
          body: analysisFormData
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.analysis) {
            const analysis = result.analysis;
            setAiAnalysis({
              summary: analysis.summary,
              suggestedTags: analysis.suggestedTags || [],
              suggestedCategory: analysis.suggestedCategory,
              suggestedClassification: analysis.suggestedClassification,
              contentType: analysis.contentType,
              language: analysis.language,
              readabilityScore: analysis.readabilityScore,
              sentimentScore: analysis.sentimentScore,
              keyTopics: analysis.keyTopics || [],
              securityRisks: analysis.securityRisks || []
            });
            
            console.log('🤖 AI Analysis completed:', analysis);
          } else {
            throw new Error(result.error || 'Analysis failed');
          }
        } else {
          throw new Error('AI analysis API call failed');
        }
        
        setUploadState("idle");
      } catch (error) {
        console.error('Error analyzing document:', error);
        // Fallback to basic analysis if AI fails
        setAiAnalysis({
          summary: `Document "${files[0].name}" uploaded and ready for processing. AI analysis temporarily unavailable.`,
          suggestedTags: [formData.category || 'General'],
          suggestedCategory: formData.category || "General Document",
          suggestedClassification: "INTERNAL",
          contentType: files[0].type.includes('pdf') ? "PDF Document" : "Office Document",
          language: "English",
          readabilityScore: 0.7,
          sentimentScore: 0.6,
          keyTopics: [formData.category || 'General Document'],
          securityRisks: []
        });
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
    if (aiAnalysis?.suggestedClassification && 
        securityClassifications[aiAnalysis.suggestedClassification as keyof typeof securityClassifications]) {
      setFormData(prev => ({
        ...prev,
        classification: aiAnalysis.suggestedClassification!
      }));
    }
  };

  const applySuggestedCategory = () => {
    if (aiAnalysis?.suggestedCategory && documentCategories.includes(aiAnalysis.suggestedCategory)) {
      setCategorySelection(aiAnalysis.suggestedCategory);
    }
  };

  const applyAllSuggestions = () => {
    applySuggestedCategory();
    applySuggestedClassification();
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

    // Validate access level specific selections
    if (formData.accessLevel === 'individual' && selectedIndividuals.length === 0) {
      alert("Please select at least one individual for Individual Access.");
      return;
    }

    if (formData.accessLevel === 'department' && selectedDepartments.length === 0) {
      alert("Please select at least one department for Department Only access.");
      return;
    }

    if (formData.accessLevel === 'team' && selectedTeams.length === 0) {
      alert("Please select at least one team/project for Team Members access.");
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
        uploadFormData.append('accessLevel', formData.accessLevel);
        uploadFormData.append('uploadedBy', formData.uploadedBy);
        uploadFormData.append('department', formData.department);
        uploadFormData.append('status', formData.status);
        uploadFormData.append('isPersonalRepo', isPersonalRepo.toString());
        uploadFormData.append('categoryEnum', formData.categoryEnum);
        uploadFormData.append('categoryDisplay', formData.categoryDisplay);

        const rawFolderPath = formData.folder || '';
        const normalizedFolderPath = rawFolderPath
          .trim()
          .replace(/^\/+|\/+$/g, '')
          .replace(/^uploads\//i, '');
        if (normalizedFolderPath) {
          uploadFormData.append('folderPath', normalizedFolderPath);
        }
        
        // Add access level specific selections
        if (formData.accessLevel === 'individual') {
          uploadFormData.append('selectedIndividuals', JSON.stringify(selectedIndividuals));
        }
        if (formData.accessLevel === 'department') {
          uploadFormData.append('selectedDepartments', JSON.stringify(selectedDepartments));
        }
        if (formData.accessLevel === 'team') {
          uploadFormData.append('selectedTeams', JSON.stringify(selectedTeams));
        }
        
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
          category: "General Document",
          categoryEnum: categorizedFolders['General Document'].categoryEnum,
          categoryDisplay: categorizedFolders['General Document'].displayName,
          classification: "PUBLIC",
          accessLevel: "organization",
          folder: buildFolderPath(formData.department || 'General', categorizedFolders['General Document'].displayName),
          keywords: "",
          customMetadata: {},
          uploadedBy: formData.uploadedBy,
          department: formData.department,
          status: isPersonalRepo ? 'draft' : 'pending'
        });
        setFolderManuallyEdited(false);
        setAiAnalysis(null);
        setUploadProgress(0);
      }, 1500);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState("error");
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const selectedClassification = securityClassifications[formData.classification as keyof typeof securityClassifications] || securityClassifications["PUBLIC"];
  const ClassificationIcon = selectedClassification?.icon || ShareIcon;

  return (
    <div className="min-h-screen bg-gray-50">
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
                    category: "General Document",
                    categoryEnum: categorizedFolders['General Document'].categoryEnum,
                    categoryDisplay: categorizedFolders['General Document'].displayName,
                    classification: "PUBLIC",
                    accessLevel: "organization",
                    folder: "General/General Document",
                    keywords: "",
                    customMetadata: {},
                    uploadedBy: userName,
                    department: userDepartment,
                    status: "draft"
                  });
                  setFolderManuallyEdited(false);
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
                      onChange={(e) => {
                        setCategorySelection(e.target.value);
                        setFolderManuallyEdited(false);
                      }}
                      className="block w-full border-2 border-blue-200 rounded-2xl shadow-lg px-6 py-4 text-base focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select a category...</option>
                      {documentCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* User Information - Auto-captured */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <h4 className="flex items-center text-lg font-bold text-gray-900 mb-4">
                      <UserIcon className="h-5 w-5 text-green-600 mr-2" />
                      Document Owner
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Uploaded By
                        </label>
                        <input
                          type="text"
                          value={formData.uploadedBy}
                          readOnly
                          className="block w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={formData.department}
                          readOnly
                          className="block w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Repository Choice */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
                    <h4 className="flex items-center text-lg font-bold text-gray-900 mb-4">
                      <FolderIcon className="h-5 w-5 text-orange-600 mr-2" />
                      Document Repository
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          id="personal-repo"
                          name="repository"
                          checked={isPersonalRepo}
                          onChange={() => setIsPersonalRepo(true)}
                          className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <div className="flex-1">
                          <label htmlFor="personal-repo" className="block text-base font-semibold text-gray-900 cursor-pointer">
                            Personal Repository (Recommended)
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Save to your personal repository first. You can edit, delete, or publish to main repository later.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          id="main-repo"
                          name="repository"
                          checked={!isPersonalRepo}
                          onChange={() => setIsPersonalRepo(false)}
                          className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <div className="flex-1">
                          <label htmlFor="main-repo" className="block text-base font-semibold text-gray-900 cursor-pointer">
                            Main Repository
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Upload directly to main repository. Document will be pending approval.
                          </p>
                        </div>
                      </div>
                    </div>
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
                        onChange={(e) => {
                          setFolderManuallyEdited(true);
                          setFormData(prev => ({ ...prev, folder: e.target.value }));
                        }}
                        className="flex-1 block w-full border-2 border-l-0 border-blue-200 px-6 py-4 text-base focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm placeholder-gray-400 transition-all duration-200"
                        placeholder="Department/Category"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFolderManuallyEdited(false);
                        const departmentValue = formData.department || userDepartment || 'General';
                        const categoryValue = formData.category || 'General Document';
                        const computed = buildFolderPath(departmentValue, categoryValue);
                        setFormData(prev => ({ ...prev, folder: computed }));
                      }}
                      className="mt-3 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Reset to default path
                    </button>
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
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${selectedClassification?.color || 'text-gray-600 bg-gray-100'}`}>
                          {formData.classification}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{selectedClassification?.description || 'No description available'}</p>
                      <div className="bg-white/60 p-4 rounded-xl shadow-inner backdrop-blur-sm">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Example Use Cases:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {(selectedClassification?.examples || []).map(example => (
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

                  {/* Conditional Selection Fields based on Access Level */}
                  {formData.accessLevel === 'individual' && (
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                      <h4 className="flex items-center text-lg font-bold text-gray-900 mb-4">
                        <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                        Select Individuals
                      </h4>
                      <div className="space-y-3">
                        {availableUsers.map(user => (
                          <label key={user.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedIndividuals.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIndividuals(prev => [...prev, user.id]);
                                } else {
                                  setSelectedIndividuals(prev => prev.filter(id => id !== user.id));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                          </label>
                        ))}
                        {availableUsers.length === 0 && status === "authenticated" && session && (
                          <div className="text-center py-4 text-gray-500">
                            <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Loading users...</p>
                          </div>
                        )}
                        {availableUsers.length === 0 && (status !== "authenticated" || !session) && (
                          <div className="text-center py-4 text-gray-500">
                            <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Please wait for authentication...</p>
                          </div>
                        )}
                      </div>
                      {selectedIndividuals.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>{selectedIndividuals.length}</strong> individual(s) selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.accessLevel === 'department' && (
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                      <h4 className="flex items-center text-lg font-bold text-gray-900 mb-4">
                        <UserGroupIcon className="h-5 w-5 text-green-600 mr-2" />
                        Select Departments
                      </h4>
                      <div className="space-y-3">
                        {availableDepartments.map(dept => (
                          <label key={dept.code} className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedDepartments.includes(dept.code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDepartments(prev => [...prev, dept.code]);
                                } else {
                                  setSelectedDepartments(prev => prev.filter(code => code !== dept.code));
                                }
                              }}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{dept.name}</div>
                              <div className="text-sm text-gray-600">Code: {dept.code}</div>
                            </div>
                          </label>
                        ))}
                        {availableDepartments.length === 0 && status === "authenticated" && session && (
                          <div className="text-center py-4 text-gray-500">
                            <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Loading departments...</p>
                          </div>
                        )}
                        {availableDepartments.length === 0 && (status !== "authenticated" || !session) && (
                          <div className="text-center py-4 text-gray-500">
                            <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Please wait for authentication...</p>
                          </div>
                        )}
                      </div>
                      {selectedDepartments.length > 0 && (
                        <div className="mt-3 p-3 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>{selectedDepartments.length}</strong> department(s) selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.accessLevel === 'team' && (
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                      <h4 className="flex items-center text-lg font-bold text-gray-900 mb-4">
                        <UserGroupIcon className="h-5 w-5 text-purple-600 mr-2" />
                        Select Teams/Projects
                      </h4>
                      <div className="space-y-3">
                        {availableTeams.map(team => (
                          <label key={team.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTeams.includes(team.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTeams(prev => [...prev, team.id]);
                                } else {
                                  setSelectedTeams(prev => prev.filter(id => id !== team.id));
                                }
                              }}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{team.name}</div>
                            </div>
                          </label>
                        ))}
                        {availableTeams.length === 0 && status === "authenticated" && session && (
                          <div className="text-center py-4 text-gray-500">
                            <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Loading teams...</p>
                          </div>
                        )}
                        {availableTeams.length === 0 && (status !== "authenticated" || !session) && (
                          <div className="text-center py-4 text-gray-500">
                            <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Please wait for authentication...</p>
                          </div>
                        )}
                      </div>
                      {selectedTeams.length > 0 && (
                        <div className="mt-3 p-3 bg-purple-100 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <strong>{selectedTeams.length}</strong> team(s)/project(s) selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}

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
    </div>
  );
}
