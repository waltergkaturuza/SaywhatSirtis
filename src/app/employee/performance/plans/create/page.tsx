"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  BuildingOfficeIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

interface KeyResponsibility {
  id?: string;
  title: string;
  description: string;
  weight: number;
  activities: Activity[];
}

interface Activity {
  description: string;
  timeline: string;
  successIndicators: string;
  supportDepartments: string[];
}

interface DevelopmentActivity {
  title: string;
  description: string;
  category: 'professional' | 'training' | 'association';
}

interface Department {
  id: string;
  name: string;
}

export default function CreatePerformancePlanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form data
  const [employeeName, setEmployeeName] = useState('');
  const [planYear, setPlanYear] = useState(new Date().getFullYear().toString());
  const [keyResponsibilities, setKeyResponsibilities] = useState<KeyResponsibility[]>([]);
  const [developmentActivities, setDevelopmentActivities] = useState<DevelopmentActivity[]>([
    { title: '', description: '', category: 'professional' },
    { title: '', description: '', category: 'training' },
    { title: '', description: '', category: 'association' }
  ]);
  const [electronicSignature, setElectronicSignature] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  // Load employee profile and job description
  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Load employee profile
      const profileResponse = await fetch('/api/employee/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setEmployeeName(`${profileData.firstName} ${profileData.lastName}`);
      }

      // Load job description and key responsibilities
      const jobDescResponse = await fetch('/api/employee/job-description');
      if (jobDescResponse.ok) {
        const jobData = await jobDescResponse.json();
        if (jobData.keyResponsibilities) {
          setKeyResponsibilities(jobData.keyResponsibilities.map((resp: any) => ({
            title: resp.title,
            description: resp.description,
            weight: resp.weight || 25,
            activities: [{
              description: '',
              timeline: '',
              successIndicators: '',
              supportDepartments: []
            }]
          })));
        }
      }

      // Load departments
      const deptResponse = await fetch('/api/departments');
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartments(deptData);
      }

    } catch (err) {
      setError('Failed to load employee data');
      console.error('Error loading employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new activity to responsibility
  const addActivity = (respIndex: number) => {
    const updated = [...keyResponsibilities];
    updated[respIndex].activities.push({
      description: '',
      timeline: '',
      successIndicators: '',
      supportDepartments: []
    });
    setKeyResponsibilities(updated);
  };

  // Remove activity from responsibility
  const removeActivity = (respIndex: number, actIndex: number) => {
    const updated = [...keyResponsibilities];
    updated[respIndex].activities.splice(actIndex, 1);
    setKeyResponsibilities(updated);
  };

  // Update activity
  const updateActivity = (respIndex: number, actIndex: number, field: string, value: any) => {
    const updated = [...keyResponsibilities];
    updated[respIndex].activities[actIndex] = {
      ...updated[respIndex].activities[actIndex],
      [field]: value
    };
    setKeyResponsibilities(updated);
  };

  // Update development activity
  const updateDevelopmentActivity = (index: number, field: string, value: string) => {
    const updated = [...developmentActivities];
    updated[index] = { ...updated[index], [field]: value };
    setDevelopmentActivities(updated);
  };

  // Submit performance plan
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');

      // Validate required fields
      if (!planYear || !electronicSignature) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate key responsibilities have activities
      const incompleteResponsibilities = keyResponsibilities.some(resp => 
        resp.activities.length === 0 || resp.activities.some(act => 
          !act.description || !act.timeline || !act.successIndicators
        )
      );

      if (incompleteResponsibilities) {
        setError('Please complete all activities for key responsibilities');
        return;
      }

      const planData = {
        planYear: parseInt(planYear),
        keyResponsibilities,
        developmentActivities: developmentActivities.filter(act => act.title && act.description),
        electronicSignature
      };

      const response = await fetch('/api/employee/performance/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });

      if (!response.ok) {
        throw new Error('Failed to create performance plan');
      }

      const result = await response.json();
      setSuccessMessage('Performance plan created successfully!');
      
      // Redirect to view plan
      setTimeout(() => {
        router.push(`/employee/performance/plans/${result.id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create performance plan');
    } finally {
      setSaving(false);
    }
  };

  // Generate years for selection
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  useEffect(() => {
    if (session) {
      loadEmployeeData();
    }
  }, [session]);

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <ModulePage
      metadata={{
        title: "Create Performance Plan",
        description: "Set up your annual performance plan with key responsibilities and development activities",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Employee Portal", href: "/employee" },
          { name: "Performance", href: "/employee/performance" },
          { name: "Create Plan", href: "/employee/performance/plans/create" }
        ]
      }}
    >
      <div className="space-y-8">
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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
            <span className="ml-2 text-sm text-gray-500">Loading employee data...</span>
          </div>
        ) : (
          <>
            {/* Plan Setup */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Plan Setup</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <UserIcon className="inline h-4 w-4 mr-2" />
                      Employee Name
                    </label>
                    <input
                      type="text"
                      value={employeeName}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-generated from login credentials</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <CalendarIcon className="inline h-4 w-4 mr-2" />
                      Plan Year *
                    </label>
                    <select
                      value={planYear}
                      onChange={(e) => setPlanYear(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Responsibilities */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Key Responsibilities</h3>
                <p className="text-sm text-gray-500">Auto-generated from your job description</p>
              </div>
              <div className="p-6 space-y-6">
                {keyResponsibilities.map((responsibility, respIndex) => (
                  <div key={respIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-md font-medium text-gray-900">{responsibility.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{responsibility.description}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Weight: {responsibility.weight}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Activities */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-700">Activities</h5>
                        <button
                          onClick={() => addActivity(respIndex)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <PlusIcon className="h-3 w-3 mr-1" />
                          Add Activity
                        </button>
                      </div>

                      {responsibility.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="bg-gray-50 p-4 rounded-md space-y-4">
                          <div className="flex justify-between items-start">
                            <h6 className="text-sm font-medium text-gray-700">Activity {actIndex + 1}</h6>
                            {responsibility.activities.length > 1 && (
                              <button
                                onClick={() => removeActivity(respIndex, actIndex)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description *</label>
                            <textarea
                              rows={2}
                              value={activity.description}
                              onChange={(e) => updateActivity(respIndex, actIndex, 'description', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                              placeholder="Describe the activity in detail..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                <ClockIcon className="inline h-4 w-4 mr-1" />
                                Timeline *
                              </label>
                              <input
                                type="text"
                                value={activity.timeline}
                                onChange={(e) => updateActivity(respIndex, actIndex, 'timeline', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                                placeholder="e.g., Q1 2024, Monthly, etc."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                <BuildingOfficeIcon className="inline h-4 w-4 mr-1" />
                                Support Departments
                              </label>
                              <select
                                multiple
                                value={activity.supportDepartments}
                                onChange={(e) => updateActivity(respIndex, actIndex, 'supportDepartments', Array.from(e.target.selectedOptions, option => option.value))}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                              >
                                <option value="ALL">All Departments</option>
                                {departments.map(dept => (
                                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                                ))}
                              </select>
                              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Success Indicators *</label>
                            <textarea
                              rows={2}
                              value={activity.successIndicators}
                              onChange={(e) => updateActivity(respIndex, actIndex, 'successIndicators', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                              placeholder="Define measurable success criteria for this activity..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Development and Learning Activities */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Development and Learning Activities</h3>
                <p className="text-sm text-gray-500">
                  List the professional pieces of training you may need to be more efficient in your profession 
                  and professional associations to subscribe to based on your performance plan (Maximum 3)
                </p>
              </div>
              <div className="p-6 space-y-6">
                {developmentActivities.map((activity, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Development Activity {index + 1}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={activity.title}
                          onChange={(e) => updateDevelopmentActivity(index, 'title', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                          placeholder="e.g., Project Management Certification"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={activity.category}
                          onChange={(e) => updateDevelopmentActivity(index, 'category', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                        >
                          <option value="professional">Professional Training</option>
                          <option value="training">Skills Training</option>
                          <option value="association">Professional Association</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={3}
                        value={activity.description}
                        onChange={(e) => updateDevelopmentActivity(index, 'description', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                        placeholder="Describe how this will improve your performance and efficiency..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Electronic Signature */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Electronic Signature</h3>
              </div>
              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <PencilSquareIcon className="inline h-4 w-4 mr-2" />
                    Your Full Name (Electronic Signature) *
                  </label>
                  <input
                    type="text"
                    value={electronicSignature}
                    onChange={(e) => setElectronicSignature(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    placeholder="Type your full name as electronic signature"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    By typing your name, you electronically sign this performance plan. 
                    Date will be auto-generated when submitted.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <XMarkIcon className="-ml-1 mr-2 h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !planYear || !electronicSignature}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-saywhat-orange/90 disabled:opacity-50"
              >
                <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                {saving ? 'Creating Plan...' : 'Create Performance Plan'}
              </button>
            </div>
          </>
        )}
      </div>
    </ModulePage>
  );
}
