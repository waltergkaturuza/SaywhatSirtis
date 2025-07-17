import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { AppraisalFormData, getRatingLabel, calculateOverallRating } from "./appraisal-types"

interface FinalReviewStepProps {
  formData: AppraisalFormData
}

export function FinalReviewStep({ formData }: FinalReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Final Review</h3>
        <p className="text-yellow-700">Please review all information before submitting the appraisal.</p>
      </div>

      {/* Summary Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Employee Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {formData.employeeName}</div>
            <div><span className="font-medium">Position:</span> {formData.position}</div>
            <div><span className="font-medium">Department:</span> {formData.department}</div>
            <div><span className="font-medium">Supervisor:</span> {formData.supervisor}</div>
            <div><span className="font-medium">Reviewer:</span> {formData.reviewer}</div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Appraisal Summary</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Type:</span> {formData.appraisalType}</div>
            <div><span className="font-medium">Period:</span> {formData.startDate} to {formData.endDate}</div>
            <div><span className="font-medium">Calculated Rating:</span> {calculateOverallRating(formData.performanceAreas)}</div>
            <div><span className="font-medium">Overall Rating:</span> {formData.overallRating > 0 ? getRatingLabel(formData.overallRating) : "Not set"}</div>
            <div><span className="font-medium">Status:</span> {formData.status}</div>
          </div>
        </div>
      </div>

      {/* Performance Areas Summary */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Performance Areas Summary</h4>
        <div className="space-y-2">
          {formData.performanceAreas.map((area, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span>{area.area}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                area.rating >= 4 ? 'bg-green-100 text-green-800' :
                area.rating >= 3 ? 'bg-blue-100 text-blue-800' :
                area.rating >= 2 ? 'bg-yellow-100 text-yellow-800' :
                area.rating >= 1 ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {area.rating > 0 ? `${area.rating} - ${getRatingLabel(area.rating)}` : 'Not Rated'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Development Areas ({formData.developmentAreas.length})</h4>
          <div className="space-y-1 text-sm">
            {formData.developmentAreas.map((area, index) => (
              <div key={index}>• {area.area}</div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Key Achievements ({formData.achievements.length})</h4>
          <div className="space-y-1 text-sm">
            {formData.achievements.map((achievement, index) => (
              <div key={index}>• {achievement.achievement.substring(0, 60)}...</div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <span className="text-sm text-gray-600">Ready to submit appraisal</span>
        </div>
      </div>
    </div>
  )
}
