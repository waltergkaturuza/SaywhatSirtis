"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface PerformanceReview {
  id: string;
  reviewPeriod: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'self_assessment' | 'manager_review' | 'hr_review' | 'completed';
  type: 'annual' | 'mid_year' | 'probation' | 'quarterly';
  overallRating?: number;
  goals?: PerformanceGoal[];
  feedback?: PerformanceFeedback[];
  supervisor?: {
    name: string;
    email: string;
  };
  hrReviewer?: {
    name: string;
    email: string;
  };
}

interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  category: 'professional' | 'personal' | 'skill' | 'project';
  weight: number;
  selfRating?: number;
  managerRating?: number;
}

interface PerformanceFeedback {
  id: string;
  type: 'self' | 'manager' | 'peer' | 'hr';
  author: string;
  content: string;
  rating?: number;
  createdAt: string;
}

interface PerformancePlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  goals: PerformanceGoal[];
}

export default function PerformancePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [plans, setPlans] = useState<PerformancePlan[]>([]);
  const [keyResponsibilities, setKeyResponsibilities] = useState<string[]>([]);
  
  // Helper function to safely set key responsibilities
  const setSafeKeyResponsibilities = (responsibilities: any[]) => {
    const safeResponsibilities = responsibilities
      .filter(item => item && typeof item === 'string')
      .map(item => String(item).trim())
      .filter(item => item.length > 0);
    
    console.log('Setting safe responsibilities:', safeResponsibilities);
    setKeyResponsibilities(safeResponsibilities);
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'reviews' | 'plans' | 'responsibilities'>('plans');
  const [stats, setStats] = useState({
    totalReviews: 0,
    completedReviews: 0,
    activePlans: 0,
    overallRating: 0,
    pendingActions: 0
  });

  // Load performance data
  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Load reviews
      const reviewsResponse = await fetch('/api/employee/performance/reviews');
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      }

      // Load plans
      const plansResponse = await fetch('/api/employee/performance/plans');
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData);
      }

      // Load key responsibilities from multiple sources
      const profileResponse = await fetch('/api/employee/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('Profile data:', profileData);
        
        let responsibilities: string[] = [];
        
        // Try to get from job description first
        if (profileData.jobDescription?.keyResponsibilities) {
          let jobResponsibilities = profileData.jobDescription.keyResponsibilities;
          console.log('Job responsibilities:', jobResponsibilities);
          
          // Handle both array and object formats
          if (typeof jobResponsibilities === 'object' && !Array.isArray(jobResponsibilities)) {
            jobResponsibilities = Object.values(jobResponsibilities);
          }
          
          if (Array.isArray(jobResponsibilities)) {
            responsibilities = jobResponsibilities
              .filter(r => r && typeof r === 'string')
              .map(r => String(r).trim())
              .filter(r => r.length > 0);
          }
        }
        
        // If no responsibilities from job description, try to get from performance plans
        if (responsibilities.length === 0 && plans.length > 0) {
          // Look for key responsibilities in the most recent plan
          const latestPlan = plans[0];
          console.log('Latest plan:', latestPlan);
          
          // Check for performance_responsibilities in the plan
          const planWithResponsibilities = latestPlan as any;
          if (planWithResponsibilities.performance_responsibilities && Array.isArray(planWithResponsibilities.performance_responsibilities)) {
            responsibilities = planWithResponsibilities.performance_responsibilities
              .map((resp: any) => resp.description)
              .filter((desc: any) => desc && typeof desc === 'string')
              .map((desc: any) => String(desc).trim())
              .filter((desc: any) => desc.length > 0);
          }
        }
        
        // If still no responsibilities found, provide some default ones
        if (responsibilities.length === 0) {
          responsibilities = [
            'Deliver high-quality work outputs within agreed timelines',
            'Collaborate effectively with team members and stakeholders', 
            'Maintain professional standards and organizational values',
            'Continuously develop skills and knowledge relevant to role',
            'Support organizational objectives and initiatives'
          ];
        }
        
        console.log('Final responsibilities:', responsibilities);
        setSafeKeyResponsibilities(responsibilities);
      } else {
        // If profile fetch fails, use default responsibilities
        setSafeKeyResponsibilities([
          'Deliver high-quality work outputs within agreed timelines',
          'Collaborate effectively with team members and stakeholders', 
          'Maintain professional standards and organizational values',
          'Continuously develop skills and knowledge relevant to role',
          'Support organizational objectives and initiatives'
        ]);
      }

      // Load stats
      const statsResponse = await fetch('/api/employee/performance/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (err) {
      setError('Failed to load performance data');
      console.error('Error loading performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'overdue':
        return <ExclamationCircleIcon className="h-4 w-4" />;
      case 'in_progress':
      case 'active':
        return <ArrowPathIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  // Calculate average rating
  const calculateAverageRating = (ratings: number[]) => {
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  // Format workflow status
  const getWorkflowStatus = (status: string) => {
    const statusMap = {
      'draft': 'Draft',
      'self_assessment': 'Awaiting Self Assessment',
      'manager_review': 'Manager Review',
      'hr_review': 'HR Review',
      'completed': 'Completed'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  useEffect(() => {
    if (session) {
      loadPerformanceData();
    }
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, router]);

  // Don't render anything while session is loading
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange"></div>
      </div>
    );
  }

  // Don't render content if not authenticated (redirect is happening)
  if (!session) {
    return null;
  }

  return (
    <ModulePage
      metadata={{
        title: "Performance Management",
        description: "Track your performance reviews, goals, and development plans",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Employee Portal", href: "/employee" },
          { name: "Performance", href: "/employee/performance" }
        ]
      }}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Reviews</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalReviews}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.completedReviews}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Plans</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activePlans}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(stats.overallRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overall Rating</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.overallRating.toFixed(1)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Actions</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingActions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'plans', label: 'Performance Plans', count: plans.length },
              { key: 'reviews', label: 'Performance Appraisals', count: reviews.length },
              { key: 'responsibilities', label: 'Key Responsibilities', count: keyResponsibilities.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-saywhat-orange text-saywhat-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
            <span className="ml-2 text-sm text-gray-500">Loading performance data...</span>
          </div>
        ) : (
          <>
            {/* Performance Appraisals */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No performance appraisals</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your performance appraisals will appear here when they are initiated by your supervisor.
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white shadow rounded-lg">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-medium text-gray-900">
                                {review.reviewPeriod} - {review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                                {getStatusIcon(review.status)}
                                <span className="ml-1">{getWorkflowStatus(review.status)}</span>
                              </span>
                            </div>
                            <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(review.startDate).toLocaleDateString()} - {new Date(review.endDate).toLocaleDateString()}
                              </span>
                              {review.supervisor && (
                                <span className="flex items-center">
                                  <UserGroupIcon className="h-4 w-4 mr-1" />
                                  Supervisor: {review.supervisor.name}
                                </span>
                              )}
                              {review.overallRating && (
                                <span className="flex items-center">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= review.overallRating!
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="ml-1">{review.overallRating.toFixed(1)}</span>
                                </span>
                              )}
                            </div>
                            
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => router.push(`/employee/performance/reviews/${review.id}`)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <EyeIcon className="-ml-0.5 mr-2 h-4 w-4" />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Performance Plans */}
            {activeTab === 'plans' && (
              <div className="space-y-4">
                {plans.length === 0 ? (
                  <div className="text-center py-12">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No performance plans</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your performance plans with goals and objectives will appear here.
                    </p>
                  </div>
                ) : (
                  plans.map((plan) => (
                    <div key={plan.id} className="bg-white shadow rounded-lg">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-medium text-gray-900">{plan.title}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                                {getStatusIcon(plan.status)}
                                <span className="ml-1">{plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}</span>
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                              </span>
                              <span>Performance Plan</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => router.push(`/hr/performance/plans/create?planId=${plan.id}`)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <EyeIcon className="-ml-0.5 mr-2 h-4 w-4" />
                              View Plan
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Key Responsibilities */}
            {activeTab === 'responsibilities' && (
              <div className="space-y-4">
                {keyResponsibilities.length === 0 ? (
                  <div className="text-center py-12">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No key responsibilities</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your key responsibilities from your job description will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {keyResponsibilities
                      .filter((responsibility) => {
                        // Only allow strings, filter out any objects
                        return typeof responsibility === 'string' && responsibility.trim().length > 0;
                      })
                      .map((responsibility, index) => {
                        // Double-check that responsibility is a string
                        const responsibilityText = String(responsibility || '').trim();
                        
                        // Skip if empty after processing
                        if (!responsibilityText) {
                          return null;
                        }
                        
                        return (
                          <div key={index} className="bg-white shadow rounded-lg">
                            <div className="p-6">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-saywhat-orange text-white text-sm font-medium">
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="ml-4 flex-1">
                                  <h3 className="text-lg font-medium text-gray-900">
                                    Key Responsibility {index + 1}
                                  </h3>
                                  <p className="mt-2 text-sm text-gray-600">
                                    {responsibilityText}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                      .filter(Boolean) // Remove any null entries
                    }
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ModulePage>
  );
}
