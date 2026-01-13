"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChartBarIcon,
  DocumentTextIcon,
  StarIcon,
  AcademicCapIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import EmployeeDocumentsSection from "@/components/employee/EmployeeDocumentsSection";
import TwoFactorSetup from "@/components/auth/TwoFactorSetup";

interface ProfileData {
  id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  departmentName?: string;
  startDate?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  alternativePhone?: string;
  personalEmail?: string;
  alternativeEmail?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyContactAddress?: string;
  emergencyContactRelationship?: string;
  profilePicture?: string;
}

export default function EmployeeProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quickStats, setQuickStats] = useState({
    yearsOfService: 0,
    performanceScore: null as number | null,
    completedTrainings: 0
  });
  
  // Supervisor/Reviewer state
  const [supervisorData, setSupervisorData] = useState<{
    isSupervisor: boolean;
    isReviewer: boolean;
    employees: Array<{
      id: string;
      employeeId: string;
      name: string;
      email: string;
      position: string;
      department: string;
      relationship: string;
      plans: any[];
      appraisals: any[];
      plansCount: number;
      appraisalsCount: number;
      pendingPlans: number;
      pendingAppraisals: number;
    }>;
  } | null>(null);
  const [loadingSupervisorData, setLoadingSupervisorData] = useState(false);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  // 2FA state
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('personal');
  const [performanceHistoryTab, setPerformanceHistoryTab] = useState<'plans' | 'appraisals'>('plans');
  
  // Performance history state
  const [performancePlans, setPerformancePlans] = useState<any[]>([]);
  const [performanceAppraisals, setPerformanceAppraisals] = useState<any[]>([]);
  const [loadingPerformanceHistory, setLoadingPerformanceHistory] = useState(false);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    alternativePhone: '',
    personalEmail: '',
    alternativeEmail: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyContactAddress: '',
    emergencyContactRelationship: '',
    profilePicture: ''
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load profile, stats, and 2FA status in parallel
      const [profileResponse, statsResponse, twoFactorResponse] = await Promise.all([
        fetch('/api/employee/profile'),
        fetch('/api/employee/dashboard-stats'),
        fetch('/api/auth/2fa/status')
      ]);
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await profileResponse.json();
      setProfile(data);
      setFormData({
        phoneNumber: data.phoneNumber || '',
        alternativePhone: data.alternativePhone || '',
        personalEmail: data.personalEmail || '',
        alternativeEmail: data.alternativeEmail || '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
        emergencyContactAddress: data.emergencyContactAddress || '',
        emergencyContactRelationship: data.emergencyContactRelationship || '',
        profilePicture: data.profilePicture || ''
      });

      // Load quick stats
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setQuickStats({
          yearsOfService: statsData.yearsOfService || 0,
          performanceScore: statsData.performanceScore || null,
          completedTrainings: statsData.completedTrainings || 0
        });
      }

      // Load supervisor/reviewer data
      loadSupervisorData();

      // Load 2FA status
      if (twoFactorResponse.ok) {
        const twoFactorData = await twoFactorResponse.json();
        setTwoFactorEnabled(twoFactorData.twoFactorEnabled || false);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Backup to localStorage
    const backup = { ...formData, [field]: value };
    localStorage.setItem('profileUpdateBackup', JSON.stringify(backup));
  };

  useEffect(() => {
    loadProfile();
    
    // Check for backup data from localStorage
    const backup = localStorage.getItem('profileUpdateBackup');
    if (backup) {
      try {
        const { data: backupData, timestamp } = JSON.parse(backup);
        const backupAge = new Date().getTime() - new Date(timestamp).getTime();
        
        // If backup is less than 1 hour old, offer to restore it
        if (backupAge < 3600000) {
          const shouldRestore = confirm(
            'Found unsaved changes from your previous session. Would you like to restore them?'
          );
          if (shouldRestore) {
            setFormData(backupData);
            setEditMode(true);
            setSuccessMessage('Previous unsaved changes restored. You can save them now.');
          } else {
            localStorage.removeItem('profileUpdateBackup');
          }
        } else {
          // Remove old backup
          localStorage.removeItem('profileUpdateBackup');
        }
      } catch (e) {
        console.error('Error parsing backup data:', e);
        localStorage.removeItem('profileUpdateBackup');
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      console.log('Sending profile update with data:', formData);
      
      // Save to localStorage as backup
      localStorage.setItem('profileUpdateBackup', JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
      }));

      const response = await fetch('/api/employee/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      
      const updatedProfile = await response.json();
      console.log('Updated profile received:', updatedProfile);
      
      // Handle fallback response (database issues)
      if (updatedProfile._fallback) {
        setSuccessMessage(updatedProfile.message || 'Profile update is being processed. Please refresh to see changes.');
        // Don't update the profile state since the update might not have persisted
        setEditMode(false);
        setTimeout(() => {
          setSuccessMessage(null);
          // Suggest refreshing the page to check if changes persisted
          setSuccessMessage('💡 Tip: Refresh the page to check if your changes were saved.');
        }, 8000);
        return;
      }
      
      if (!response.ok) {
        const errorData = updatedProfile;
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      // Clear backup on successful save
      localStorage.removeItem('profileUpdateBackup');
      
      setProfile(updatedProfile);
      setEditMode(false);
      setSuccessMessage('Profile updated successfully!');
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadPerformanceHistory = async () => {
    try {
      setLoadingPerformanceHistory(true);
      
      // Load plans and appraisals in parallel
      // Plans API already filters by current employee
      // Appraisals API returns all appraisals (including where user is supervisor/reviewer), so we filter on frontend
      const [plansResponse, appraisalsResponse] = await Promise.all([
        fetch('/api/employee/performance/plans'),
        fetch('/api/employee/performance/appraisals')
      ]);
      
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        console.log('Performance plans data:', plansData);
        // Transform plans data to include status information
        const transformedPlans = Array.isArray(plansData) ? plansData.map((plan: any) => ({
          id: plan.id,
          planTitle: plan.planTitle || plan.title || 'Untitled Plan',
          planYear: plan.planYear || new Date(plan.createdAt || Date.now()).getFullYear(),
          planPeriod: plan.planPeriod || (plan.startDate && plan.endDate ? `${new Date(plan.startDate).toLocaleDateString()} - ${new Date(plan.endDate).toLocaleDateString()}` : 'N/A'),
          startDate: plan.startDate,
          endDate: plan.endDate,
          status: plan.status || 'draft',
          supervisorApproval: plan.supervisorApproval || 'pending',
          reviewerApproval: plan.reviewerApproval || 'pending',
          supervisorApprovedAt: plan.supervisorApprovedAt,
          reviewerApprovedAt: plan.reviewerApprovedAt,
          submittedAt: plan.submittedAt,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt
        })) : [];
        console.log('Transformed plans:', transformedPlans);
        setPerformancePlans(transformedPlans);
      } else {
        console.error('Failed to load plans:', await plansResponse.text());
      }
      
      if (appraisalsResponse.ok) {
        const appraisalsData = await appraisalsResponse.json();
        console.log('Performance appraisals data:', appraisalsData);
        // Get current employee ID from profile
        const currentEmployeeId = profile?.id;
        console.log('Current employee ID:', currentEmployeeId);
        
        // Filter only appraisals where the current employee is the subject (not supervisor/reviewer)
        // The API returns appraisals where employee is subject, supervisor, or reviewer
        // We only want appraisals where employeeId matches the current employee's ID
        const myAppraisals = Array.isArray(appraisalsData) ? appraisalsData
          .filter((appraisal: any) => {
            // Only include appraisals where employeeId matches the current employee
            // Exclude appraisals where they're supervisor or reviewer
            const isMyAppraisal = currentEmployeeId && appraisal.employeeId === currentEmployeeId;
            console.log(`Appraisal ${appraisal.id}: employeeId=${appraisal.employeeId}, currentEmployeeId=${currentEmployeeId}, isMyAppraisal=${isMyAppraisal}`);
            return isMyAppraisal;
          })
          .map((appraisal: any) => {
            // Parse reviewPeriod if it's a JSON string or object
            let reviewPeriodText = 'N/A';
            if (appraisal.reviewPeriod) {
              if (typeof appraisal.reviewPeriod === 'string') {
                try {
                  const parsed = JSON.parse(appraisal.reviewPeriod);
                  if (parsed.startDate && parsed.endDate) {
                    reviewPeriodText = `${new Date(parsed.startDate).toLocaleDateString()} - ${new Date(parsed.endDate).toLocaleDateString()}`;
                  } else {
                    reviewPeriodText = appraisal.reviewPeriod;
                  }
                } catch {
                  reviewPeriodText = appraisal.reviewPeriod;
                }
              } else if (appraisal.reviewPeriod.startDate && appraisal.reviewPeriod.endDate) {
                reviewPeriodText = `${new Date(appraisal.reviewPeriod.startDate).toLocaleDateString()} - ${new Date(appraisal.reviewPeriod.endDate).toLocaleDateString()}`;
              }
            }
            
            return {
              id: appraisal.id,
              appraisalType: appraisal.appraisalType || appraisal.type || 'annual',
              reviewPeriod: reviewPeriodText,
              status: appraisal.status || 'draft',
              overallRating: appraisal.overallRating ? (typeof appraisal.overallRating === 'string' ? parseFloat(appraisal.overallRating) : appraisal.overallRating) : null,
              submittedAt: appraisal.submittedAt,
              approvedAt: appraisal.approvedAt,
              supervisorApproval: appraisal.supervisorApproval || (appraisal.supervisorApprovedAt ? 'approved' : 'pending'),
              reviewerApproval: appraisal.reviewerApproval || (appraisal.reviewerApprovedAt ? 'approved' : 'pending'),
              supervisorApprovedAt: appraisal.supervisorApprovedAt,
              reviewerApprovedAt: appraisal.reviewerApprovedAt,
              createdAt: appraisal.createdAt,
              updatedAt: appraisal.updatedAt
            };
          }) : [];
        console.log('Filtered my appraisals:', myAppraisals);
        setPerformanceAppraisals(myAppraisals);
      } else {
        console.error('Failed to load appraisals:', await appraisalsResponse.text());
      }
    } catch (error) {
      console.error('Error loading performance history:', error);
    } finally {
      setLoadingPerformanceHistory(false);
    }
  };

  const loadSupervisorData = async () => {
    try {
      setLoadingSupervisorData(true);
      const response = await fetch('/api/employee/supervised-employees');
      if (response.ok) {
        const data = await response.json();
        setSupervisorData(data);
      }
    } catch (err) {
      console.error('Error loading supervisor data:', err);
    } finally {
      setLoadingSupervisorData(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('All fields are required');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters long');
        return;
      }

      // Password strength validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(passwordData.newPassword)) {
        setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        return;
      }

      const response = await fetch('/api/employee/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update password');
      }

      setPasswordSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    
    if (session) {
      loadProfile();
      loadSupervisorData();
    }
  }, [session, status]);

  // Load performance history after profile is loaded
  useEffect(() => {
    if (profile?.id) {
      loadPerformanceHistory();
    }
  }, [profile?.id]);

  // Show loading while checking authentication or if no session
  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ModulePage
      metadata={{
        title: "My Profile",
        description: "Manage your personal information and contact details",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Employee Portal", href: "/employee" },
          { name: "Profile", href: "/employee/profile" }
        ]
      }}
    >
      <div className="space-y-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
            <span className="ml-2 text-sm text-gray-500">Loading profile...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {profile && (
          <>
            {/* Hero Profile Header with Gradient */}
            <div className="relative bg-gradient-to-br from-saywhat-orange via-orange-500 to-green-600 rounded-2xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative px-8 py-12">
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <div className="h-40 w-40 bg-white/20 backdrop-blur-sm rounded-full p-2 shadow-2xl">
                      <div className="h-full w-full bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                        {(formData.profilePicture || profile.profilePicture) ? (
                          <img 
                            src={formData.profilePicture || profile.profilePicture} 
                            alt="Profile" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-20 w-20 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {editMode && (
                      <label className="absolute bottom-2 right-2 h-10 w-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-lg transition-all duration-200 hover:scale-110">
                        <CameraIcon className="h-5 w-5 text-saywhat-orange" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setFormData(prev => ({ ...prev, profilePicture: e.target?.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Employee Information */}
                  <div className="text-center lg:text-left text-white flex-1">
                    <h1 className="text-4xl font-bold mb-2">{profile.firstName} {profile.lastName}</h1>
                    <div className="space-y-2 mb-6">
                      <p className="text-xl text-white/90 font-medium">{profile.position || 'System Administrator'}</p>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-2 lg:space-y-0">
                        <div className="flex items-center justify-center lg:justify-start space-x-2">
                          <div className="h-2 w-2 bg-green-300 rounded-full animate-pulse"></div>
                          <span className="text-white/80">Employee ID: {profile.employeeId}</span>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start space-x-2">
                          <EnvelopeIcon className="h-4 w-4 text-white/80" />
                          <span className="text-white/80">{profile.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                      >
                        <PencilIcon className="mr-2 h-5 w-5" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="inline-flex items-center px-6 py-3 bg-green-600 border-2 border-green-500 rounded-xl text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                          <CheckIcon className="mr-2 h-5 w-5" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setFormData({
                              phoneNumber: profile.phoneNumber || '',
                              alternativePhone: profile.alternativePhone || '',
                              personalEmail: profile.personalEmail || '',
                              alternativeEmail: profile.alternativeEmail || '',
                              address: profile.address || '',
                              emergencyContact: profile.emergencyContact || '',
                              emergencyPhone: profile.emergencyPhone || '',
                              emergencyContactAddress: profile.emergencyContactAddress || '',
                              emergencyContactRelationship: profile.emergencyContactRelationship || '',
                              profilePicture: profile.profilePicture || ''
                            });
                          }}
                          className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                          <XMarkIcon className="mr-2 h-5 w-5" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid - Tabs and Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              {/* Left Column - Tab Navigation and Content */}
              <div className="lg:col-span-3">
                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Green Header - Matching Quick Stats */}
                  <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <UserIcon className="mr-2 h-5 w-5" />
                      Employee Profile
                    </h3>
                  </div>
                  {/* Tab Headers */}
                  <div className="border-b border-gray-200 bg-gray-50">
                    <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('personal')}
                        className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'personal'
                            ? 'border-saywhat-orange text-saywhat-orange bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <UserIcon className="h-5 w-5 mr-2" />
                        Personal Information
                      </button>
                      <button
                        onClick={() => setActiveTab('contact')}
                        className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'contact'
                            ? 'border-saywhat-orange text-saywhat-orange bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        Contact Information
                      </button>
                      <button
                        onClick={() => setActiveTab('emergency')}
                        className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'emergency'
                            ? 'border-saywhat-orange text-saywhat-orange bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <IdentificationIcon className="h-5 w-5 mr-2" />
                        Emergency Contacts
                      </button>
                      <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'security'
                            ? 'border-saywhat-orange text-saywhat-orange bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <ShieldCheckIcon className="h-5 w-5 mr-2" />
                        Security Settings
                      </button>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'documents'
                            ? 'border-saywhat-orange text-saywhat-orange bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        Employee Documents
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <UserIcon className="h-6 w-6 text-saywhat-orange mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-saywhat-orange/10 to-transparent rounded-xl border-l-4 border-saywhat-orange">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Employee ID</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.employeeId}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-green-100 to-transparent rounded-xl border-l-4 border-green-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Position</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.position || 'System Administrator'}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-gray-100 to-transparent rounded-xl border-l-4 border-gray-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Department</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.departmentName || 'Unassigned'}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-pink-100 to-transparent rounded-xl border-l-4 border-pink-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Date of Birth</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-100 to-transparent rounded-xl border-l-4 border-blue-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Start Date</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.startDate ? new Date(profile.startDate).toLocaleDateString() : '14/9/2025'}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-purple-100 to-transparent rounded-xl border-l-4 border-purple-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</label>
                          <div className="flex items-center mt-1">
                            <div className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <p className="text-lg font-medium text-green-700">Active</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <PhoneIcon className="h-6 w-6 text-saywhat-orange mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <PhoneIcon className="inline h-4 w-4 mr-2 text-saywhat-orange" />
                          Primary Phone
                        </label>
                        {editMode ? (
                          <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border-l-4 border-blue-400">
                            <p className="text-lg font-medium text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <PhoneIcon className="inline h-4 w-4 mr-2 text-green-600" />
                          Alternative Phone
                        </label>
                        {editMode ? (
                          <input
                            type="tel"
                            value={formData.alternativePhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, alternativePhone: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            placeholder="Enter alternative phone"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border-l-4 border-green-400">
                            <p className="text-lg font-medium text-gray-900">{profile.alternativePhone || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <EnvelopeIcon className="inline h-4 w-4 mr-2 text-blue-600" />
                          Personal Email
                        </label>
                        {editMode ? (
                          <input
                            type="email"
                            value={formData.personalEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            placeholder="Enter personal email"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border-l-4 border-blue-400">
                            <p className="text-lg font-medium text-gray-900">{profile.personalEmail || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <EnvelopeIcon className="inline h-4 w-4 mr-2 text-indigo-600" />
                          Alternative Email
                        </label>
                        {editMode ? (
                          <input
                            type="email"
                            value={formData.alternativeEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, alternativeEmail: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            placeholder="Enter alternative email"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-indigo-50 to-transparent rounded-xl border-l-4 border-indigo-400">
                            <p className="text-lg font-medium text-gray-900">{profile.alternativeEmail || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div className="group md:col-span-2 lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <MapPinIcon className="inline h-4 w-4 mr-2 text-purple-600" />
                          Home Address
                        </label>
                        {editMode ? (
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors resize-none"
                            placeholder="Enter home address"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-xl border-l-4 border-purple-400">
                            <p className="text-lg font-medium text-gray-900">{profile.address || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contacts Tab */}
                {activeTab === 'emergency' && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <IdentificationIcon className="h-6 w-6 text-saywhat-orange mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Emergency Contacts</h3>
                    </div>
                    <div className="p-6 bg-gradient-to-r from-red-50 to-red-25 rounded-xl border border-red-200">
                      <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center">
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        Emergency Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Contact Name
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              value={formData.emergencyContact}
                              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                              placeholder="Emergency contact name"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-lg font-medium text-gray-900">{profile.emergencyContact || 'Not provided'}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Contact Phone
                          </label>
                          {editMode ? (
                            <input
                              type="tel"
                              value={formData.emergencyPhone}
                              onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                              placeholder="Emergency contact phone"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-lg font-medium text-gray-900">{profile.emergencyPhone || 'Not provided'}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Relationship
                          </label>
                          {editMode ? (
                            <select
                              value={formData.emergencyContactRelationship}
                              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            >
                              <option value="">Select relationship</option>
                              <option value="spouse">Spouse</option>
                              <option value="parent">Parent</option>
                              <option value="child">Child</option>
                              <option value="sibling">Sibling</option>
                              <option value="friend">Friend</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-lg font-medium text-gray-900">{profile.emergencyContactRelationship || 'Not provided'}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Contact Address
                          </label>
                          {editMode ? (
                            <textarea
                              value={formData.emergencyContactAddress}
                              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactAddress: e.target.value }))}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors resize-none"
                              placeholder="Emergency contact address"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-lg font-medium text-gray-900">{profile.emergencyContactAddress || 'Not provided'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <ShieldCheckIcon className="h-6 w-6 text-saywhat-orange mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                    </div>
                    {/* Password Management */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border-l-4 border-blue-400">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            <LockClosedIcon className="mr-2 h-5 w-5 text-blue-600" />
                            Password
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">Change your account password</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <LockClosedIcon className="h-4 w-4 mr-2" />
                          Change Password
                        </button>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border-l-4 border-green-400 mt-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            <ShieldCheckIcon className="mr-2 h-5 w-5 text-green-600" />
                            Two-Factor Authentication
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {twoFactorEnabled 
                              ? '2FA is enabled for your account' 
                              : 'Add an extra layer of security to your account'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (twoFactorEnabled) {
                              // TODO: Add disable 2FA functionality
                              alert('To disable 2FA, please contact your administrator.');
                            } else {
                              setShow2FASetup(!show2FASetup);
                            }
                          }}
                          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                            twoFactorEnabled
                              ? 'bg-gray-600 text-white hover:bg-gray-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          <ShieldCheckIcon className="h-4 w-4 mr-2" />
                          {twoFactorEnabled ? '2FA Enabled' : 'Enable 2FA'}
                        </button>
                      </div>

                      {/* 2FA Setup */}
                      {show2FASetup && !twoFactorEnabled && (
                        <div className="mt-4">
                          <TwoFactorSetup
                            onComplete={() => {
                              setShow2FASetup(false);
                              setTwoFactorEnabled(true);
                              loadProfile(); // Reload to get updated status
                            }}
                            onCancel={() => setShow2FASetup(false)}
                          />
                        </div>
                      )}

                      {/* Password Change Form */}
                      {showPasswordChange && (
                        <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                          <h5 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h5>
                          
                          {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-600">{passwordError}</p>
                            </div>
                          )}

                          {passwordSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-600">{passwordSuccess}</p>
                            </div>
                          )}

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter current password"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter new password"
                                minLength={8}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Must be at least 8 characters with uppercase, lowercase, number, and special character
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm new password"
                                minLength={8}
                              />
                            </div>

                            <div className="flex space-x-3 pt-2">
                              <button
                                onClick={handlePasswordChange}
                                disabled={passwordLoading}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                <CheckIcon className="h-4 w-4 mr-2" />
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowPasswordChange(false);
                                  setPasswordData({
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: ''
                                  });
                                  setPasswordError(null);
                                  setPasswordSuccess(null);
                                }}
                                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                <XMarkIcon className="h-4 w-4 mr-2" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Employee Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <DocumentTextIcon className="h-6 w-6 text-saywhat-orange mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Employee Documents</h3>
                    </div>
                    {profile && profile.employeeId && (
                      <EmployeeDocumentsSection employeeId={profile.employeeId} canUpload={true} />
                    )}
                  </div>
                )}
                  </div>
                </div>

                {/* Performance History Section - Inside left column next to sidebar */}
                <div id="performance-history" className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <ClipboardDocumentCheckIcon className="mr-3 h-6 w-6" />
                      Performance History
                    </h3>
                    <p className="text-sm text-white/80 mt-1">
                      View your performance plans and appraisals history
                    </p>
                  </div>
                  
                  {/* Performance History Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px px-6" aria-label="Tabs">
                      <button
                        onClick={() => setPerformanceHistoryTab('plans')}
                        className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                          performanceHistoryTab === 'plans'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <ClipboardDocumentCheckIcon className="inline h-5 w-5 mr-2" />
                        Performance Plans
                      </button>
                      <button
                        onClick={() => setPerformanceHistoryTab('appraisals')}
                        className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                          performanceHistoryTab === 'appraisals'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <StarIcon className="inline h-5 w-5 mr-2" />
                        Performance Appraisals
                      </button>
                    </nav>
                  </div>

                  {/* Performance Plans Tab Content */}
                  {performanceHistoryTab === 'plans' && (
                    <div className="p-6">
                      {loadingPerformanceHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-500">Loading plans...</span>
                        </div>
                      ) : performancePlans.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Plan Title
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Period
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Year
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Supervisor Approval
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Reviewer Approval
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Submitted
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {performancePlans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{plan.planTitle}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {plan.startDate && plan.endDate
                                        ? `${new Date(plan.startDate).toLocaleDateString()} - ${new Date(plan.endDate).toLocaleDateString()}`
                                        : (plan.planPeriod && typeof plan.planPeriod === 'string' && plan.planPeriod.includes('-')
                                            ? plan.planPeriod
                                            : plan.planPeriod || 'N/A')}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{plan.planYear || 'N/A'}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      plan.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                      plan.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      plan.status === 'supervisor_review' ? 'bg-yellow-100 text-yellow-800' :
                                      plan.status === 'reviewer_assessment' ? 'bg-purple-100 text-purple-800' :
                                      plan.status === 'revision_requested' ? 'bg-orange-100 text-orange-800' :
                                      plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {plan.status || 'draft'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full mb-1 ${
                                        plan.supervisorApproval === 'approved' ? 'bg-green-100 text-green-800' :
                                        plan.supervisorApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {plan.supervisorApproval || 'pending'}
                                      </span>
                                      {plan.supervisorApprovedAt && (
                                        <span className="text-xs text-gray-500">
                                          {new Date(plan.supervisorApprovedAt).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full mb-1 ${
                                        plan.reviewerApproval === 'approved' ? 'bg-green-100 text-green-800' :
                                        plan.reviewerApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {plan.reviewerApproval || 'pending'}
                                      </span>
                                      {plan.reviewerApprovedAt && (
                                        <span className="text-xs text-gray-500">
                                          {new Date(plan.reviewerApprovedAt).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {plan.status !== 'draft' 
                                        ? (plan.submittedAt 
                                            ? new Date(plan.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                            : (plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Submitted'))
                                        : 'Not submitted'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link
                                      href={`/hr/performance/plans/${plan.id}`}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      View
                                    </Link>
                                    {plan.status === 'draft' && (
                                      <>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <Link
                                          href={`/hr/performance/plans/create?planId=${plan.id}&edit=true`}
                                          className="text-indigo-600 hover:text-indigo-900"
                                        >
                                          Edit
                                        </Link>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No performance plans found</p>
                          <p className="text-sm mt-2">Create your first performance plan to get started.</p>
                          <Link
                            href="/hr/performance/plans/create?self=true"
                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Create Plan
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Performance Appraisals Tab Content */}
                  {performanceHistoryTab === 'appraisals' && (
                    <div className="p-6">
                      {loadingPerformanceHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-500">Loading appraisals...</span>
                        </div>
                      ) : performanceAppraisals.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Review Period
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Overall Rating
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Supervisor Approval
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Reviewer Approval
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Submitted
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Created
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {performanceAppraisals.map((appraisal) => (
                                <tr key={appraisal.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 capitalize">
                                      {appraisal.appraisalType || 'Annual'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {appraisal.reviewPeriod || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    {appraisal.overallRating ? (
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900">
                                          {appraisal.overallRating.toFixed(1)}/5
                                        </span>
                                        <div className="ml-2 flex">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                              key={star}
                                              className={`h-4 w-4 ${
                                                star <= Math.round(appraisal.overallRating)
                                                  ? 'text-yellow-400 fill-current'
                                                  : 'text-gray-300'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-500">Not rated</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      appraisal.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                      appraisal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      appraisal.status === 'supervisor_approved' || appraisal.status === 'supervisor_review' ? 'bg-yellow-100 text-yellow-800' :
                                      appraisal.status === 'reviewer_assessment' ? 'bg-purple-100 text-purple-800' :
                                      appraisal.status === 'revision_requested' ? 'bg-orange-100 text-orange-800' :
                                      appraisal.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {appraisal.status || 'draft'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full mb-1 ${
                                        appraisal.supervisorApproval === 'approved' ? 'bg-green-100 text-green-800' :
                                        appraisal.supervisorApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {appraisal.supervisorApproval || 'pending'}
                                      </span>
                                      {appraisal.supervisorApprovedAt && (
                                        <span className="text-xs text-gray-500">
                                          {new Date(appraisal.supervisorApprovedAt).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full mb-1 ${
                                        appraisal.reviewerApproval === 'approved' ? 'bg-green-100 text-green-800' :
                                        appraisal.reviewerApproval === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {appraisal.reviewerApproval || 'pending'}
                                      </span>
                                      {appraisal.reviewerApprovedAt && (
                                        <span className="text-xs text-gray-500">
                                          {new Date(appraisal.reviewerApprovedAt).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {appraisal.status === 'submitted' || appraisal.status === 'approved' || appraisal.status === 'supervisor_approved' || appraisal.status === 'reviewer_assessment' || appraisal.status === 'completed' || appraisal.status === 'supervisor_review'
                                        ? (appraisal.submittedAt 
                                            ? new Date(appraisal.submittedAt).toLocaleDateString() 
                                            : (appraisal.updatedAt ? new Date(appraisal.updatedAt).toLocaleDateString() : 'Submitted'))
                                        : 'Not submitted'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {appraisal.createdAt
                                        ? new Date(appraisal.createdAt).toLocaleDateString()
                                        : 'N/A'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link
                                      href={`/hr/performance/appraisals/${appraisal.id}`}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      View
                                    </Link>
                                    {appraisal.status === 'draft' && (
                                      <>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <Link
                                          href={`/hr/performance/appraisals/create?appraisalId=${appraisal.id}&edit=true`}
                                          className="text-indigo-600 hover:text-indigo-900"
                                        >
                                          Edit
                                        </Link>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <StarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No performance appraisals found</p>
                          <p className="text-sm mt-2">Create your first appraisal to get started.</p>
                          <Link
                            href="/hr/performance/appraisals/create"
                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Create Appraisal
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar - Quick Stats and Quick Actions */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                {/* Quick Stats Card - Natural Height */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-3">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <ChartBarIcon className="mr-2 h-5 w-5" />
                      Quick Stats
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="text-center p-3 bg-gradient-to-br from-saywhat-orange/20 to-saywhat-orange/5 rounded-lg">
                      <div className="text-2xl font-bold text-saywhat-orange">
                        {loading ? '...' : Math.floor(quickStats.yearsOfService)}
                      </div>
                      <div className="text-xs font-medium text-gray-600">Years of Service</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {loading ? '...' : quickStats.performanceScore !== null ? `${quickStats.performanceScore}%` : 'N/A'}
                      </div>
                      <div className="text-xs font-medium text-gray-600">Performance Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {loading ? '...' : quickStats.completedTrainings}
                      </div>
                      <div className="text-xs font-medium text-gray-600">Trainings Completed</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-black to-gray-800 px-4 py-3">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <StarIcon className="mr-2 h-5 w-5 text-saywhat-orange" />
                    Quick Actions
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <a
                    href="#performance-history"
                    onClick={(e) => {
                      e.preventDefault()
                      setPerformanceHistoryTab('plans')
                      // Scroll to performance history section
                      const element = document.getElementById('performance-history')
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                    className="group flex items-center p-3 bg-gradient-to-br from-saywhat-orange/10 via-saywhat-orange/5 to-transparent rounded-lg border-2 border-saywhat-orange/20 hover:border-saywhat-orange/40 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <ChartBarIcon className="h-5 w-5 text-saywhat-orange mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Performance</p>
                      <p className="text-xs text-gray-600">View plans & appraisals</p>
                    </div>
                  </a>
                  
                  <Link
                    href="/hr/performance/plans/create?self=true"
                    className="group flex items-center p-3 bg-gradient-to-br from-green-100 via-green-50 to-transparent rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <DocumentTextIcon className="h-5 w-5 text-green-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">New Plan</p>
                      <p className="text-xs text-gray-600">Create performance plan</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/employee/performance/appraisals/create"
                    className="group flex items-center p-3 bg-gradient-to-br from-blue-100 via-blue-50 to-transparent rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <StarIcon className="h-5 w-5 text-blue-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Self Appraisal</p>
                      <p className="text-xs text-gray-600">Complete assessment</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/employee/qualifications"
                    className="group flex items-center p-3 bg-gradient-to-br from-purple-100 via-purple-50 to-transparent rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <AcademicCapIcon className="h-5 w-5 text-purple-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Qualifications</p>
                      <p className="text-xs text-gray-600">Manage certifications</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/hr/training/enroll"
                    className="group flex items-center p-3 bg-gradient-to-br from-yellow-100 via-yellow-50 to-transparent rounded-lg border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <TrophyIcon className="h-5 w-5 text-yellow-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Training</p>
                      <p className="text-xs text-gray-600">Browse & enroll</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/employee"
                    className="group flex items-center p-3 bg-gradient-to-br from-gray-100 via-gray-50 to-transparent rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <ArrowTrendingUpIcon className="h-5 w-5 text-gray-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Dashboard</p>
                      <p className="text-xs text-gray-600">Employee portal home</p>
                    </div>
                  </Link>
                </div>
                </div>
              </div>
            </div>
            </div>

            {/* Supervisor/Reviewer Section - Full Width */}
            {supervisorData && (supervisorData.isSupervisor || supervisorData.isReviewer) && supervisorData.employees.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <UsersIcon className="mr-3 h-6 w-6" />
                    {supervisorData.isSupervisor && supervisorData.isReviewer 
                      ? 'My Team - Supervised & Reviewed Employees'
                      : supervisorData.isSupervisor 
                        ? 'My Team - Supervised Employees'
                        : 'My Team - Reviewed Employees'}
                  </h3>
                  <p className="text-sm text-white/80 mt-1">
                    Manage performance plans and appraisals for your team members
                  </p>
                </div>
                <div className="p-6">
                  {loadingSupervisorData ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading team data...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Employee
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Relationship
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Plans
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Appraisals
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Pending
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {supervisorData.employees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                  <div className="text-xs text-gray-500">{employee.employeeId}</div>
                                  <div className="text-xs text-gray-400">{employee.position}</div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{employee.department}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  employee.relationship === 'both'
                                    ? 'bg-purple-100 text-purple-800'
                                    : employee.relationship === 'supervised'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-green-100 text-green-800'
                                }`}>
                                  {employee.relationship === 'both'
                                    ? 'Supervised & Reviewed'
                                    : employee.relationship === 'supervised'
                                      ? 'Supervised'
                                      : 'Reviewed'}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center">
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-medium text-gray-900">{employee.plansCount}</span>
                                  {employee.plans.length > 0 && (
                                    <div className="mt-1 space-y-1">
                                      {employee.plans.slice(0, 2).map((plan: any) => (
                                        <Link
                                          key={plan.id}
                                          href={`/hr/performance/plans/${plan.id}`}
                                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline block"
                                        >
                                          {plan.planTitle || `${plan.planYear} - ${plan.planPeriod}`}
                                        </Link>
                                      ))}
                                      {employee.plans.length > 2 && (
                                        <span className="text-xs text-gray-500">+{employee.plans.length - 2} more</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center">
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-medium text-gray-900">{employee.appraisalsCount}</span>
                                  {employee.appraisals.length > 0 && (
                                    <div className="mt-1 space-y-1">
                                      {employee.appraisals.slice(0, 2).map((appraisal: any) => (
                                        <Link
                                          key={appraisal.id}
                                          href={`/hr/performance/appraisals/${appraisal.id}`}
                                          className="text-xs text-green-600 hover:text-green-800 hover:underline block"
                                        >
                                          {appraisal.appraisalType} - {appraisal.performance_plans?.planYear || 'N/A'}
                                        </Link>
                                      ))}
                                      {employee.appraisals.length > 2 && (
                                        <span className="text-xs text-gray-500">+{employee.appraisals.length - 2} more</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center">
                                {(employee.pendingPlans > 0 || employee.pendingAppraisals > 0) && (
                                  <div className="flex flex-col items-center space-y-1">
                                    {employee.pendingPlans > 0 && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        {employee.pendingPlans} Plan{employee.pendingPlans !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                    {employee.pendingAppraisals > 0 && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        {employee.pendingAppraisals} Appraisal{employee.pendingAppraisals !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {employee.pendingPlans === 0 && employee.pendingAppraisals === 0 && (
                                  <span className="text-xs text-gray-400">None</span>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {/* Link to most recent submitted plan, or list if none submitted */}
                                  {(() => {
                                    const submittedPlans = employee.plans.filter((p: any) => p.status !== 'draft' && p.status !== 'cancelled')
                                    const latestPlan = submittedPlans.length > 0 
                                      ? submittedPlans.sort((a: any, b: any) => 
                                          new Date(b.submittedAt || b.createdAt || 0).getTime() - 
                                          new Date(a.submittedAt || a.createdAt || 0).getTime()
                                        )[0]
                                      : null
                                    
                                    return latestPlan ? (
                                      <Link
                                        href={`/hr/performance/plans/${latestPlan.id}`}
                                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                        title={`View ${latestPlan.planTitle || 'Latest Plan'}`}
                                      >
                                        <DocumentTextIcon className="h-4 w-4" />
                                      </Link>
                                    ) : (
                                      <Link
                                        href={`/hr/performance/plans?employeeId=${employee.id}`}
                                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                        title="View Plans"
                                      >
                                        <DocumentTextIcon className="h-4 w-4" />
                                      </Link>
                                    )
                                  })()}
                                  
                                  {/* Link to most recent submitted appraisal, or list if none submitted */}
                                  {(() => {
                                    const submittedAppraisals = employee.appraisals.filter((a: any) => a.status !== 'draft' && a.status !== 'cancelled')
                                    const latestAppraisal = submittedAppraisals.length > 0
                                      ? submittedAppraisals.sort((a: any, b: any) => 
                                          new Date(b.submittedAt || b.createdAt || 0).getTime() - 
                                          new Date(a.submittedAt || a.createdAt || 0).getTime()
                                        )[0]
                                      : null
                                    
                                    return latestAppraisal ? (
                                      <Link
                                        href={`/hr/performance/appraisals/${latestAppraisal.id}`}
                                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                                        title={`View ${latestAppraisal.appraisalType || 'Latest Appraisal'}`}
                                      >
                                        <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                      </Link>
                                    ) : (
                                      <Link
                                        href={`/hr/performance/appraisals?employeeId=${employee.id}`}
                                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                                        title="View Appraisals"
                                      >
                                        <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                      </Link>
                                    )
                                  })()}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {supervisorData.employees.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>No employees assigned to supervise or review.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </ModulePage>
  );
}