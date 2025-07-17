import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { AppraisalFormData } from "./appraisal-types"

interface DevelopmentPlanningStepProps {
  formData: AppraisalFormData
  onInputChange: (field: string, value: any) => void
  onArrayChange: (arrayName: keyof AppraisalFormData, index: number, field: string, value: any) => void
  onAddArrayItem: (arrayName: keyof AppraisalFormData, template: any) => void
  onRemoveArrayItem: (arrayName: keyof AppraisalFormData, index: number) => void
}

export function DevelopmentPlanningStep({ 
  formData, 
  onInputChange, 
  onArrayChange, 
  onAddArrayItem, 
  onRemoveArrayItem 
}: DevelopmentPlanningStepProps) {
  return (
    <div className="space-y-8">
      {/* Development Areas Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Development Areas</h3>
          <button
            onClick={() => onAddArrayItem("developmentAreas", { area: "", currentLevel: "", targetLevel: "", developmentPlan: "", timeline: "" })}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Development Area
          </button>
        </div>

        {formData.developmentAreas.map((area, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium text-gray-900">Development Area {index + 1}</h4>
              {formData.developmentAreas.length > 1 && (
                <button
                  onClick={() => onRemoveArrayItem("developmentAreas", index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Development Area
              </label>
              <input
                type="text"
                value={area.area}
                onChange={(e) => onArrayChange("developmentAreas", index, "area", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Leadership Skills, Technical Expertise, Communication..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Level
                </label>
                <textarea
                  value={area.currentLevel}
                  onChange={(e) => onArrayChange("developmentAreas", index, "currentLevel", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe current skill/competency level..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Level
                </label>
                <textarea
                  value={area.targetLevel}
                  onChange={(e) => onArrayChange("developmentAreas", index, "targetLevel", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe desired skill/competency level..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Development Plan
              </label>
              <textarea
                value={area.developmentPlan}
                onChange={(e) => onArrayChange("developmentAreas", index, "developmentPlan", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Specific actions, training, mentoring, or experiences needed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <input
                type="text"
                value={area.timeline}
                onChange={(e) => onArrayChange("developmentAreas", index, "timeline", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 6 months, 1 year, ongoing..."
              />
            </div>
          </div>
        ))}
      </div>

      {/* Career Development Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Development Planning</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee's Career Aspirations
            </label>
            <textarea
              value={formData.careerAspirations}
              onChange={(e) => onInputChange("careerAspirations", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Discuss the employee's career goals and aspirations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Needs Identified
            </label>
            <textarea
              value={formData.trainingNeeds}
              onChange={(e) => onInputChange("trainingNeeds", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="List specific training programs, courses, or skills development needed..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommended Actions for Development
            </label>
            <textarea
              value={formData.recommendedActions}
              onChange={(e) => onInputChange("recommendedActions", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Specific actions recommended for employee development..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
