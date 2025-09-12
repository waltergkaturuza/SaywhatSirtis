"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  ChartBarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  AcademicCapIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  biannualOverview: {
    period: string;
    totalAppraisals: number;
    completedAppraisals: number;
    averageRating: number;
    departmentBreakdown: DepartmentStats[];
  };
  skillsGapAnalysis: {
    byDepartment: SkillsGapByDepartment[];
    byEmployee: SkillsGapByEmployee[];
    criticalSkills: string[];
  };
  performanceTrends: {
    ratingDistribution: RatingDistribution[];
    departmentComparison: DepartmentPerformance[];
    improvementAreas: string[];
  };
}

interface DepartmentStats {
  departmentName: string;
  totalEmployees: number;
  completedAppraisals: number;
  averageRating: number;
  completionRate: number;
}

interface SkillsGapByDepartment {
  departmentName: string;
  skillsNeeded: SkillNeed[];
  trainingRequests: number;
  criticalityScore: number;
}

interface SkillsGapByEmployee {
  employeeName: string;
  department: string;
  developmentActivities: string[];
  skillsGap: string[];
  priorityLevel: 'high' | 'medium' | 'low';
}

interface SkillNeed {
  skill: string;
  employeesNeedingTraining: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
}

interface RatingDistribution {
  rating: string;
  count: number;
  percentage: number;
}

interface DepartmentPerformance {
  departmentName: string;
  averageRating: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

export default function PerformanceAnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState<'overview' | 'skills-gap' | 'trends'>('overview');

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        period: selectedPeriod,
        department: selectedDepartment
      });

      const response = await fetch(`/api/performance/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalytics(data);

    } catch (err) {
      setError('Failed to load performance analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get color for completion rate
  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ChevronUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ChevronDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowPathIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    if (session) {
      loadAnalytics();
    }
  }, [session, selectedPeriod, selectedDepartment]);

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <ModulePage
      metadata={{
        title: "Performance Analytics",
        description: "Comprehensive performance analytics and insights",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Performance", href: "/performance" },
          { name: "Analytics", href: "/performance/analytics" }
        ]
      }}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                >
                  <option value="current">Current Biannual</option>
                  <option value="previous">Previous Biannual</option>
                  <option value="year">Full Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                >
                  <option value="all">All Departments</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="it">Information Technology</option>
                  <option value="operations">Operations</option>
                  <option value="programs">Programs</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'skills-gap', label: 'Skills Gap' },
                { key: 'trends', label: 'Trends' }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    viewMode === mode.key
                      ? 'bg-saywhat-orange text-white'
                      : 'text-gray-500 hover:text-gray-700 bg-white border border-gray-300'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
            <span className="ml-2 text-sm text-gray-500">Loading analytics...</span>
          </div>
        ) : analytics ? (
          <>
            {/* Overview Mode */}
            {viewMode === 'overview' && (
              <div className="space-y-6">
                {/* Biannual Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ChartBarIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Appraisals</dt>
                            <dd className="text-lg font-medium text-gray-900">{analytics.biannualOverview.totalAppraisals}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                            <dd className="text-lg font-medium text-gray-900">{analytics.biannualOverview.completedAppraisals}</dd>
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
                                  star <= Math.round(analytics.biannualOverview.averageRating)
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
                            <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                            <dd className="text-lg font-medium text-gray-900">{analytics.biannualOverview.averageRating.toFixed(1)}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UserGroupIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Departments</dt>
                            <dd className="text-lg font-medium text-gray-900">{analytics.biannualOverview.departmentBreakdown.length}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department Breakdown */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Department Performance Overview</h3>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employees
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Completed
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Completion Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Avg Rating
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.biannualOverview.departmentBreakdown.map((dept, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {dept.departmentName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {dept.totalEmployees}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {dept.completedAppraisals}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCompletionRateColor(dept.completionRate)}`}>
                                  {dept.completionRate.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= Math.round(dept.averageRating)
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
                                  <span className="ml-1 text-sm">{dept.averageRating.toFixed(1)}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Gap Analysis Mode */}
            {viewMode === 'skills-gap' && (
              <div className="space-y-6">
                {/* Skills Gap by Department */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Skills Gap Analysis by Department</h3>
                    <p className="text-sm text-gray-500">Derived from development and learning activities</p>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-6">
                      {analytics.skillsGapAnalysis.byDepartment.map((dept, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-medium text-gray-900">{dept.departmentName}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{dept.trainingRequests} training requests</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(dept.criticalityScore > 70 ? 'high' : dept.criticalityScore > 40 ? 'medium' : 'low')}`}>
                                {dept.criticalityScore > 70 ? 'High Priority' : dept.criticalityScore > 40 ? 'Medium Priority' : 'Low Priority'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {dept.skillsNeeded.map((skill, skillIndex) => (
                              <div key={skillIndex} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{skill.skill}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">{skill.employeesNeedingTraining} employees</span>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(skill.urgencyLevel)}`}>
                                    {skill.urgencyLevel}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills Gap by Employee */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Individual Skills Gap Analysis</h3>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Development Activities
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Skills Gap
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Priority
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.skillsGapAnalysis.byEmployee.map((employee, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {employee.employeeName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {employee.department}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="max-w-xs">
                                  {employee.developmentActivities.slice(0, 2).map((activity, actIndex) => (
                                    <div key={actIndex} className="text-xs bg-gray-100 px-2 py-1 rounded mb-1">
                                      {activity}
                                    </div>
                                  ))}
                                  {employee.developmentActivities.length > 2 && (
                                    <span className="text-xs text-gray-400">+{employee.developmentActivities.length - 2} more</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="max-w-xs">
                                  {employee.skillsGap.slice(0, 2).map((gap, gapIndex) => (
                                    <div key={gapIndex} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded mb-1">
                                      {gap}
                                    </div>
                                  ))}
                                  {employee.skillsGap.length > 2 && (
                                    <span className="text-xs text-gray-400">+{employee.skillsGap.length - 2} more</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(employee.priorityLevel)}`}>
                                  {employee.priorityLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Trends Mode */}
            {viewMode === 'trends' && (
              <div className="space-y-6">
                {/* Rating Distribution */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Performance Rating Distribution</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      {analytics.performanceTrends.ratingDistribution.map((rating, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{rating.count}</div>
                          <div className="text-sm text-gray-500">{rating.rating}</div>
                          <div className="text-xs text-gray-400">{rating.percentage.toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Department Comparison */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Department Performance Trends</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analytics.performanceTrends.departmentComparison.map((dept, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{dept.departmentName}</h4>
                              <p className="text-sm text-gray-500">Average Rating: {dept.averageRating.toFixed(1)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(dept.trend)}
                            <span className={`text-sm font-medium ${
                              dept.trend === 'up' ? 'text-green-600' : 
                              dept.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {dept.changePercentage > 0 ? '+' : ''}{dept.changePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Improvement Areas */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Key Improvement Areas</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-3">
                      {analytics.performanceTrends.improvementAreas.map((area, index) => (
                        <div key={index} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                          <span className="text-sm text-gray-700">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
            <p className="mt-1 text-sm text-gray-500">Analytics data will appear here when performance reviews are completed.</p>
          </div>
        )}
      </div>
    </ModulePage>
  );
}
