import { AppraisalFormData, getRatingLabel, calculateOverallRating } from "./appraisal-types"

interface PerformanceAssessmentStepProps {
  formData: AppraisalFormData
  onArrayChange: (arrayName: keyof AppraisalFormData, index: number, field: string, value: any) => void
}

export function PerformanceAssessmentStep({ formData, onArrayChange }: PerformanceAssessmentStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Performance Assessment</h3>
        <p className="text-blue-700">Rate each performance area on a scale of 1-5 and provide detailed comments with evidence.</p>
      </div>

      {formData.performanceAreas.map((area, index) => (
        <div key={index} className="border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">{area.area}</h4>
              <p className="text-sm text-gray-600">Weight: {area.weight}%</p>
            </div>
            <div className="ml-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={area.rating}
                onChange={(e) => onArrayChange("performanceAreas", index, "rating", parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Select Rating</option>
                <option value={1}>1 - Needs Improvement</option>
                <option value={2}>2 - Below Expectations</option>
                <option value={3}>3 - Meets Expectations</option>
                <option value={4}>4 - Exceeds Expectations</option>
                <option value={5}>5 - Outstanding</option>
              </select>
            </div>
          </div>

          {area.rating > 0 && (
            <div className="text-sm text-gray-600">
              Current Rating: <span className="font-semibold text-blue-600">{getRatingLabel(area.rating)}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Performance Description
            </label>
            <textarea
              value={area.description}
              onChange={(e) => onArrayChange("performanceAreas", index, "description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the performance expectations for this area..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments & Feedback
            </label>
            <textarea
              value={area.comments}
              onChange={(e) => onArrayChange("performanceAreas", index, "comments", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide detailed feedback on the employee's performance in this area..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence & Examples
            </label>
            <textarea
              value={area.evidence}
              onChange={(e) => onArrayChange("performanceAreas", index, "evidence", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide specific examples or evidence supporting this rating..."
            />
          </div>
        </div>
      ))}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Calculated Overall Rating</h4>
        <div className="text-2xl font-bold text-blue-600">
          {calculateOverallRating(formData.performanceAreas)} / 5.00
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Based on weighted average of all performance areas
        </p>
      </div>
    </div>
  )
}
