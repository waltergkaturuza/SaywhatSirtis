import { AppraisalFormData, getRatingLabel, calculateOverallRating } from "./appraisal-types"

interface CommentsReviewStepProps {
  formData: AppraisalFormData
  onInputChange: (field: string, value: any) => void
}

export function CommentsReviewStep({ formData, onInputChange }: CommentsReviewStepProps) {
  return (
    <div className="space-y-8">
      {/* Overall Assessment */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Assessment</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Performance Rating
              </label>
              <select
                value={formData.overallRating}
                onChange={(e) => onInputChange("overallRating", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Select Overall Rating</option>
                <option value={1}>1 - Needs Improvement</option>
                <option value={2}>2 - Below Expectations</option>
                <option value={3}>3 - Meets Expectations</option>
                <option value={4}>4 - Exceeds Expectations</option>
                <option value={5}>5 - Outstanding</option>
              </select>
            </div>

            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Calculated Rating:</div>
                <div className="text-xl font-bold text-blue-600">{calculateOverallRating(formData.performanceAreas)}</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Comments
            </label>
            <textarea
              value={formData.overallComments}
              onChange={(e) => onInputChange("overallComments", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide an overall summary of performance..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Strengths
              </label>
              <textarea
                value={formData.strengths}
                onChange={(e) => onInputChange("strengths", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Highlight the employee's main strengths..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas for Improvement
              </label>
              <textarea
                value={formData.areasForImprovement}
                onChange={(e) => onInputChange("areasForImprovement", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Areas where improvement is needed..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Supervisor Comments */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supervisor's Assessment</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor's Comments
            </label>
            <textarea
              value={formData.supervisorComments}
              onChange={(e) => onInputChange("supervisorComments", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Supervisor's detailed assessment and feedback..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor's Recommendations
            </label>
            <textarea
              value={formData.supervisorRecommendations}
              onChange={(e) => onInputChange("supervisorRecommendations", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Recommendations for next review period..."
            />
          </div>
        </div>
      </div>

      {/* Employee Self-Assessment */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Self-Assessment</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee's Self-Assessment Comments
            </label>
            <textarea
              value={formData.selfAssessmentComments}
              onChange={(e) => onInputChange("selfAssessmentComments", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Employee's reflection on their performance..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee's Additional Comments
            </label>
            <textarea
              value={formData.employeeComments}
              onChange={(e) => onInputChange("employeeComments", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional comments from the employee..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="employeeAgreement"
              checked={formData.employeeAgreement}
              onChange={(e) => onInputChange("employeeAgreement", e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="employeeAgreement" className="ml-2 block text-sm text-gray-700">
              Employee agrees with the assessment and development plan
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
