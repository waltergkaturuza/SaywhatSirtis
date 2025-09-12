"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  UserIcon,
  AcademicCapIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BellIcon,
  CalendarIcon,
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";

interface EmployeeProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  phoneNumber?: string;
  startDate: string;
  profilePicture?: string;
  supervisor?: {
    id: string;
    name: string;
    email: string;
  };
}

interface PerformanceStats {
  currentAppraisals: number;
  pendingPlans: number;
  completedGoals: number;
  totalGoals: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
  overallRating?: number;
}

interface QuickStats {
  qualifications: number;
  trainings: number;
  certificates: number;
  notifications: number;
}

export default function EmployeePortalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    currentAppraisals: 0,
    pendingPlans: 0,
    completedGoals: 0,
    totalGoals: 0
  });
  const [quickStats, setQuickStats] = useState<QuickStats>({
    qualifications: 0,
    trainings: 0,
    certificates: 0,
    notifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load employee data
  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Load employee profile
      const profileResponse = await fetch('/api/employee/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      // Load performance statistics
      const perfResponse = await fetch('/api/employee/performance/stats');
      if (perfResponse.ok) {
        const perfData = await perfResponse.json();
        setPerformanceStats(perfData);
      }

      // Load quick statistics
      const statsResponse = await fetch('/api/employee/dashboard-stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setQuickStats(statsData);
      }

    } catch (err) {
      setError('Failed to load employee data');
      console.error('Error loading employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadEmployeeData();
    }
  }, [session]);

  // Redirect if not authenticated
  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/employee',
      icon: ChartBarIcon,
      description: 'Overview of your information',
      current: true
    },
    {
      name: 'Profile',
      href: '/employee/profile',
      icon: UserIcon,
      description: 'Manage your personal information',
      current: false
    },
    {
      name: 'Qualifications',
      href: '/employee/qualifications',
      icon: AcademicCapIcon,
      description: 'Education and certifications',
      current: false
    },
    {
      name: 'Performance',
      href: '/employee/performance',
      icon: TrophyIcon,
      description: 'Plans and appraisals',
      current: false
    }
  ];

  return (
    <ModulePage
      metadata={{
        title: "Employee Portal",
        description: "Manage your profile, performance, and career development",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Employee Portal", href: "/employee" }
        ]
      }}
    >
      <div className="space-y-6">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
            <span className="ml-2 text-sm text-gray-500">Loading your dashboard...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
            <button 
              onClick={loadEmployeeData}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Welcome Section */}
        {profile && (
          <div className="bg-gradient-to-r from-saywhat-orange to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold">
                  Welcome back, {profile.firstName}!
                </h2>
                <p className="text-orange-100">
                  {profile.position} • {profile.department}
                </p>
                <p className="text-orange-200 text-sm">
                  Employee ID: {profile.employeeId}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Qualifications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {quickStats.qualifications}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <button
                  onClick={() => router.push('/employee/qualifications')}
                  className="font-medium text-saywhat-orange hover:text-saywhat-orange/80"
                >
                  View all
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrophyIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Performance Goals
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {performanceStats.completedGoals}/{performanceStats.totalGoals}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <button
                  onClick={() => router.push('/employee/performance')}
                  className="font-medium text-saywhat-orange hover:text-saywhat-orange/80"
                >
                  View progress
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Appraisals
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {performanceStats.currentAppraisals}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <button
                  onClick={() => router.push('/employee/performance')}
                  className="font-medium text-saywhat-orange hover:text-saywhat-orange/80"
                >
                  Complete now
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BellIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Notifications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {quickStats.notifications}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-600">
                  Recent updates
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Overview */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {performanceStats.overallRating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Overall Rating</span>
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {performanceStats.overallRating}/5
                      </span>
                    </div>
                  </div>
                )}
                
                {performanceStats.lastReviewDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Last Review</span>
                    <span className="text-sm text-gray-900">
                      {new Date(performanceStats.lastReviewDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {performanceStats.nextReviewDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Next Review</span>
                    <span className="text-sm text-gray-900">
                      {new Date(performanceStats.nextReviewDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={() => router.push('/employee/performance')}
                    className="w-full bg-saywhat-orange text-white px-4 py-2 rounded-md hover:bg-saywhat-orange/90 transition-colors"
                  >
                    View Performance Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => router.push('/employee/profile')}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Update Profile
                  </span>
                </button>

                <button
                  onClick={() => router.push('/employee/qualifications')}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Add Qualification
                  </span>
                </button>

                <button
                  onClick={() => router.push('/employee/performance')}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Submit Appraisal
                  </span>
                </button>

                <button
                  onClick={() => router.push('/hr/training')}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Browse Training
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Supervisor Information */}
        {profile?.supervisor && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reporting Structure</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-gray-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Supervisor: {profile.supervisor.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {profile.supervisor.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  );
}
