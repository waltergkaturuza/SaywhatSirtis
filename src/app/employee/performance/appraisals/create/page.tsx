"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  CheckIcon,
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  StarIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface PerformancePlan {
  id: string;
  planYear: number;
  keyResponsibilities: KeyResponsibility[];
}

interface KeyResponsibility {
  id: string;
  title: string;
  weight: number;
  successIndicators: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
}

interface RatingScale {
  code: string;
  label: string;
  points: number;
}

const RATING_SCALE: RatingScale[] = [
  { code: 'A1', label: 'Outstanding performance. High levels of expertise', points: 50 },
  { code: 'A2', label: 'Consistently exceeds requirements', points: 40 },
  { code: 'B1', label: 'Meets requirements. Occasionally exceeds them', points: 30 },
  { code: 'B2', label: 'Meets requirements', points: 25 },
  { code: 'C1', label: 'Partially meets requirements. Improvement required', points: 15 },
  { code: 'C2', label: 'Unacceptable. Well below standard required', points: 10 }
];

const STANDARD_VALUES = [
  'Teamwork',
  'Responsiveness and effectiveness',
  'Accountability',
  'Professionalism and Integrity',
  'Innovation'
];

export default function CreateAppraisalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form data
  const [employeeName, setEmployeeName] = useState('');
  const [availablePlans, setAvailablePlans] = useState<PerformancePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PerformancePlan | null>(null);
  const [reviewers, setReviewers] = useState<Employee[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [appraisalType, setAppraisalType] = useState<'annual' | 'quarterly' | 'probation'>('annual');
  
  // Assessment data
  const [responsibilityAssessments, setResponsibilityAssessments] = useState<{
    comment: string;
    rating: string;
  }[]>([]);
  
  const [valueAssessments, setValueAssessments] = useState<{
    comment: string;
    rating: string;
  }[]>(STANDARD_VALUES.map(() => ({ comment: '', rating: 'B2' })));
  
  const [electronicSignature, setElectronicSignature] = useState('');

  // Load employee data and performance plans
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load employee profile
      const profileResponse = await fetch('/api/employee/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setEmployeeName(`${profileData.firstName} ${profileData.lastName}`);
      }

      // Load performance plans
      const plansResponse = await fetch('/api/employee/performance/plans');
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setAvailablePlans(plansData);
      }

      // Load potential reviewers (HR staff)
      const reviewersResponse = await fetch('/api/employees/hr-staff');
      if (reviewersResponse.ok) {
        const reviewersData = await reviewersResponse.json();
        setReviewers(reviewersData);
      }

    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle plan selection
  const handlePlanSelection = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = availablePlans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      // Initialize responsibility assessments
      setResponsibilityAssessments(
        plan.keyResponsibilities.map(() => ({
          comment: '',
          rating: 'B2'
        }))
      );
    }
  };

  // Update responsibility assessment
  const updateResponsibilityAssessment = (index: number, field: 'comment' | 'rating', value: string) => {
    const updated = [...responsibilityAssessments];
    updated[index] = { ...updated[index], [field]: value };
    setResponsibilityAssessments(updated);
  };

  // Update value assessment
  const updateValueAssessment = (index: number, field: 'comment' | 'rating', value: string) => {
    const updated = [...valueAssessments];
    updated[index] = { ...updated[index], [field]: value };
    setValueAssessments(updated);
  };

  // Calculate total points and percentage
  const calculateTotals = () => {
    const respPoints = responsibilityAssessments.reduce((sum, assessment) => {
      const rating = RATING_SCALE.find(r => r.code === assessment.rating);
      return sum + (rating?.points || 25);
    }, 0);

    const valuePoints = valueAssessments.reduce((sum, assessment) => {
      const rating = RATING_SCALE.find(r => r.code === assessment.rating);
      return sum + (rating?.points || 25);
    }, 0);

    const totalPoints = respPoints + valuePoints;
    const maxPossible = (responsibilityAssessments.length + valueAssessments.length) * 50;
    const percentage = maxPossible > 0 ? (totalPoints / maxPossible) * 100 : 0;

    return { respPoints, valuePoints, totalPoints, maxPossible, percentage };
  };

  // Submit appraisal
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');

      // Validation
      if (!selectedPlanId || !selectedReviewerId || !electronicSignature) {
        setError('Please fill in all required fields');
        return;
      }

      if (responsibilityAssessments.some(a => !a.comment.trim())) {
        setError('Please provide comments for all key responsibilities');
        return;
      }

      if (valueAssessments.some(a => !a.comment.trim())) {
        setError('Please provide comments for all values');
        return;
      }

      const appraisalData = {
        planId: selectedPlanId,
        reviewerId: selectedReviewerId,
        appraisalType,
        selfAssessments: responsibilityAssessments,
        valueGoalsAssessments: valueAssessments,
        electronicSignature
      };

      const response = await fetch('/api/employee/performance/appraisals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appraisalData)
      });

      if (!response.ok) {
        throw new Error('Failed to create performance appraisal');
      }

      const result = await response.json();
      setSuccessMessage('Performance appraisal created successfully!');
      
      // Redirect to view appraisal
      setTimeout(() => {
        router.push(`/employee/performance/appraisals/${result.id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create performance appraisal');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const totals = calculateTotals();

  return (
    <ModulePage
      metadata={{
        title: "Create Performance Appraisal",
        description: "Conduct your self-assessment for performance review",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Employee Portal", href: "/employee" },
          { name: "Performance", href: "/employee/performance" },
          { name: "Create Appraisal", href: "/employee/performance/appraisals/create" }
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
            <span className="ml-2 text-sm text-gray-500">Loading data...</span>
          </div>
        ) : (
          <>
            {/* Employee Details */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Employee Details</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Performance Plan *
                    </label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => handlePlanSelection(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    >
                      <option value="">Select a performance plan</option>
                      {availablePlans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.planYear} Performance Plan
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reviewer *
                    </label>
                    <select
                      value={selectedReviewerId}
                      onChange={(e) => setSelectedReviewerId(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    >
                      <option value="">Select reviewer</option>
                      {reviewers.map(reviewer => (
                        <option key={reviewer.id} value={reviewer.id}>
                          {reviewer.firstName} {reviewer.lastName} ({reviewer.position})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Appraisal Type</label>
                  <div className="mt-2 space-x-4">
                    {[
                      { value: 'annual', label: 'Annual Review' },
                      { value: 'quarterly', label: 'Quarterly Review' },
                      { value: 'probation', label: 'Probation Review' }
                    ].map(type => (
                      <label key={type.value} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="appraisalType"
                          value={type.value}
                          checked={appraisalType === type.value}
                          onChange={(e) => setAppraisalType(e.target.value as any)}
                          className="form-radio text-saywhat-orange"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Assessment - Key Responsibilities */}
            {selectedPlan && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Performance Assessment - Key Responsibilities</h3>
                  <p className="text-sm text-gray-500">Auto-generated from your performance plan</p>
                </div>
                <div className="p-6 space-y-6">
                  {selectedPlan.keyResponsibilities.map((responsibility, index) => (
                    <div key={responsibility.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-900">{responsibility.title}</h4>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Weight: {responsibility.weight}%
                          </span>
                          <span>Success Indicators: {responsibility.successIndicators}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Self-Assessment Comment *
                          </label>
                          <textarea
                            rows={4}
                            value={responsibilityAssessments[index]?.comment || ''}
                            onChange={(e) => updateResponsibilityAssessment(index, 'comment', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                            placeholder="Provide your self-assessment for this responsibility..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Self-Rating *
                          </label>
                          <select
                            value={responsibilityAssessments[index]?.rating || 'B2'}
                            onChange={(e) => updateResponsibilityAssessment(index, 'rating', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                          >
                            {RATING_SCALE.map(rating => (
                              <option key={rating.code} value={rating.code}>
                                {rating.code} - {rating.label} ({rating.points} points)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Value Goals Assessment */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Value Goals Assessment</h3>
                <p className="text-sm text-gray-500">Standard values for all employees</p>
              </div>
              <div className="p-6 space-y-6">
                {STANDARD_VALUES.map((value, index) => (
                  <div key={value} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-900">{value}</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Self-Assessment Comment *
                        </label>
                        <textarea
                          rows={3}
                          value={valueAssessments[index]?.comment || ''}
                          onChange={(e) => updateValueAssessment(index, 'comment', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                          placeholder={`Provide your self-assessment for ${value}...`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Self-Rating *
                        </label>
                        <select
                          value={valueAssessments[index]?.rating || 'B2'}
                          onChange={(e) => updateValueAssessment(index, 'rating', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                        >
                          {RATING_SCALE.map(rating => (
                            <option key={rating.code} value={rating.code}>
                              {rating.code} - {rating.label} ({rating.points} points)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Summary */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Self-Assessment Summary</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totals.respPoints}</div>
                    <div className="text-sm text-gray-600">Responsibility Points</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{totals.valuePoints}</div>
                    <div className="text-sm text-gray-600">Value Points</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{totals.totalPoints}/{totals.maxPossible}</div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-saywhat-orange">{totals.percentage.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Overall Rating</div>
                  </div>
                </div>
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
                    By typing your name, you electronically sign this self-assessment. 
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
                disabled={saving || !selectedPlanId || !selectedReviewerId || !electronicSignature}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-saywhat-orange/90 disabled:opacity-50"
              >
                <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                {saving ? 'Creating Appraisal...' : 'Submit Self-Assessment'}
              </button>
            </div>
          </>
        )}
      </div>
    </ModulePage>
  );
}
